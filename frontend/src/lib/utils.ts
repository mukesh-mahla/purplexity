import type { Message, SourceType } from "@/pages/conversation";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseStreamObject = async (
  conversationId: string,
  onData: (data: any) => void,
) => {
  const response = await fetch(`http://localhost:4000/api/${conversationId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const reader = response.body?.getReader();

  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const cleanedLine = line.trim();

      if (!cleanedLine) continue;

      if (cleanedLine.startsWith("data:")) {
        const rawJson = cleanedLine.replace(/^data:\s*/, "");

        try {
          const parsed = JSON.parse(rawJson);

          onData(parsed);
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
};

export const parseFOllowUpStreamObject = async (
  conversationId: string,
  question: string,
  onData: (data: any) => void,
) => {
  const response = await fetch(
    `http://localhost:4000/api/conversation/followup`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: question, conversationId }),
    },
  );

  const reader = response.body?.getReader();

  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const cleanedLine = line.trim();

      if (!cleanedLine) continue;

      if (cleanedLine.startsWith("data:")) {
        const rawJson = cleanedLine.replace(/^data:\s*/, "");

        try {
          const parsed = JSON.parse(rawJson);

          onData(parsed);
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
};

export function handleStreamData(
  data: any,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setResource: React.Dispatch<React.SetStateAction<SourceType[]>>,
  setIsStreaming: React.Dispatch<React.SetStateAction<boolean>>,
) {
  if (data.title) {
    setResource((prev) => [
      ...prev,
      {
        title: data.title,
        link: data.link,
      },
    ]);
  } else if (data.role === "ASSISTANT") {
    setMessages((prev) => {
      // if last message already assistant
      // append content to same bubble
      if (prev.length > 0 && prev[prev.length - 1]!.role === "ASSISTANT") {
        const updated: Message[] = [...prev];

        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: updated[updated.length - 1]!.content + data.content,
        };

        return updated;
      }
      // otherwise create new assistant bubble
      return [
        ...prev,
        {
          role: "ASSISTANT",
          content: data.content,
        },
      ];
    });
  } else if (data.role === "USER") {
    setMessages((prev) => [
      ...prev,
      {
        role: data.role,
        content: data.content,
      },
    ]);
  } else if (data.type === "done") {
    setIsStreaming(false);
  }
}
    