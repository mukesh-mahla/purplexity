import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export const parseStreamObject = async (
  conversationId: string,
  onData: (data: any) => void
) => {
  const response = await fetch(
    `http://localhost:4000/api/${conversationId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
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

export const parseFOllowUpStreamObject = async (
  conversationId: string,
   question: string,
  onData: (data: any) => void
 
) => {
  const response = await fetch(
    `http://localhost:4000/api/conversation/followup`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query:question,conversationId })
    }
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