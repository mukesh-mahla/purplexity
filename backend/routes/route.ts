import express from "express";
import dotenv from "dotenv";
import { tavily } from "@tavily/core";
import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createUserPrompt, systemPrompt } from "../prompt";

import { prisma } from "../lib/prisma";
import { requiresAuth } from "../middleware";
import { clerkClient } from "@clerk/express";

dotenv.config();
export const router = express.Router();

const tvly = tavily({ apiKey: process.env.tavily_api_key });
const googleAI = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

router.post("/create-user", requiresAuth, async (req, res) => {
  const userId = req.userId!;
  const users = await clerkClient.users.getUser(userId);

  const existingUser = await prisma.user.findUnique({
    where: { id: userId, email: users.emailAddresses[0]?.emailAddress! },
  });
  if (!existingUser) {
    await prisma.user.create({
      data: {
        id: userId,
        email: users.emailAddresses[0]?.emailAddress!,
        name: users.firstName! + " " + users.lastName!,
      },
    });

    return res.json({ msg: "user created" });
  }
  res.json({ msg: "user already exists" });
});
router.post("/api/create-conversation", requiresAuth, async (req, res) => {
  const { query } = req.body;
  const message = await prisma.conversation.create({
    data: {
      title: query.slice(0, 50),
      userId: req.userId!,
      messages: {
        create: {
          sender: "USER",
          content: query,
        },
      },
    },
  });

  res.json({ conversationId: message.id });
});

router.post("/api/:conversationId", requiresAuth, async (req, res) => {
  const conversationId = req.params.conversationId?.toString();

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId: req.userId!,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
  if (!conversation) {
    return res.status(404).json({
      error: "Conversation not found",
    });
  }
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const response = await tvly.search(conversation.messages[0]!.content);

  const sources = response.results.map((res) => ({
    title: res.title,
    link: res.url,
    snippet: res.content,
  }));

  res.write(
    `data: ${JSON.stringify({ role: "USER", content: conversation.messages[0]!.content })}\n\n`,
  );

  const Airesponse = streamText({
    model: googleAI("gemini-2.5-flash"),
    system: systemPrompt,
    prompt: `${createUserPrompt(conversation.messages[0]!.content, sources)}`,
  });

  let finalText = "";
  for await (const textPart of Airesponse.textStream) {
    finalText += textPart;

    res.write(
      `data: ${JSON.stringify({ role: "ASSISTANT", content: textPart })}\n\n`,
    );
  }

  sources.forEach((source) =>
    res.write(
      `data: ${JSON.stringify({ title: source.title, link: source.link })}\n\n`,
    ),
  );

  const AssistantMessage = await prisma.message.create({
    data: {
      conversationId: conversationId!,
      sender: "ASSISTANT",
      content: finalText,
    },
  });

  await prisma.sources.createMany({
    data: sources.map((source) => ({
      messageId: AssistantMessage.id,
      title: source.title,
      link: source.link,
      content: source.snippet,
    })),
  });

  res.write(
    `data: ${JSON.stringify({
      type: "done",
    })}\n\n`,
  );

  res.end();
});

router.post("/api/conversation/followup", requiresAuth, async (req, res) => {
  const { query } = req.body;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const PastChat = await prisma.message.findMany({
    where: {
      conversationId: req.body.conversationId,

      conversation: { userId: req.userId! },
    },
    include: { sources: true },
    orderBy: { createdAt: "asc" },
  });

  await prisma.message.create({
    data: {
      conversationId: req.body.conversationId,
      sender: "USER",
      content: query,
    },
  });

  const chat = PastChat.map((msg) => {
    const sourceBlock =
      msg.sources.length > 0
        ? `\n  Sources used:\n${msg.sources.map((s, i) => `    [${i + 1}] ${s.title} — ${s.link}`).join("\n")}`
        : "";
    return `${msg.sender}:\n  ${msg.content}${sourceBlock}`;
  }).join("\n\n");

  const followupPrompt = `
You are continuing an ongoing research conversation. Use the conversation history below as full context.

Conversation so far:
${chat}

New user question: ${query}

Instructions:
- Answer the follow-up using both the conversation context and your own knowledge.
- If the previous sources are still relevant, reference them. If not, answer from knowledge.
- Keep the same <Answer> / <FollowUp> format.
`;

  const Airesponse = streamText({
    model: googleAI("gemini-2.5-flash"),
    system: systemPrompt,
    prompt: followupPrompt,
  });

  let finalText = "";
  for await (const textPart of Airesponse.textStream) {
    finalText += textPart;
    // process.stdout.write(`Received text part: ${textPart}\n`);
    res.write(
      `data: ${JSON.stringify({ role: "ASSISTANT", content: textPart })}\n\n`,
    );
  }

  await prisma.message.create({
    data: {
      conversationId: req.body.conversationId,
      sender: "ASSISTANT",
      content: finalText,
    },
  });
  res.write(
    `data: ${JSON.stringify({
      type: "done",
    })}\n\n`,
  );

  res.end();
});

router.get("/api/conversation/:id", requiresAuth, async (req, res) => {
  const id = req.params.id?.toString();
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: id,
      userId: req.userId!,
    },
    include: {
      messages: {
        include: {
          sources: true,
        },
      },
    },
  });

  if (!conversation) {
    return res.status(404).json({ error: "Conversation not found" });
  }
  res.json(conversation);
});

router.get("/api/conversations", requiresAuth, async (req, res) => {
  const coversations = await prisma.conversation.findMany({
    where: {
      userId: req.userId!,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  res.json(coversations);
});
