import { Button } from "@/components/ui/button";
import type { Message } from "@/pages/conversation";
import { SparklesIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
export const MessageBubble = ({
    message,
    isStreaming,
    HandleFolloup,
}: {
    message: Message;
    isStreaming: boolean;
    HandleFolloup: (question: string) => void;
}) => {
    // 1. RENDER USER MESSAGE
    if (message.role === "USER") {
        return (
            <div className="flex justify-end">
                <div className="max-w-2xl rounded-2xl rounded-br-sm border border-blue-500/20 bg-blue-500/10 px-5 py-4 shadow-lg backdrop-blur-xl">
                    <p className="text-sm text-zinc-400">You</p>
                    <p className="mt-2 whitespace-pre-wrap text-[15px] leading-7 text-white">
                        {message.content}
                    </p>
                </div>
            </div>
        );
    }

    // 2. RENDER ASSISTANT MESSAGE
    if (message.role === "ASSISTANT") {
        // Robust split: Parse answer body and follow-up string boundaries safely
        const aiAnswer = message.content.split("<FollowUp>");

        // Clean out raw <Answer> or </Answer> formatting flags from the main response
        let mainText = aiAnswer[0] || "";
        mainText = mainText.replace(/<\/?Answer[^>]*>/g, "").replace(/<[^>]*$/g, "").trim();

        // Parse and isolate individual questions safely
        const FollowUpQuestions = aiAnswer[1]
            ? aiAnswer[1]
                .replace(/<\/?FollowUp>/g, "") // remove tags
                .split("<Answer>")[0]!        // Safety guard: drop leaked answer tails instantly
                .split(/\n-\s+/)                   // split by list dashes
                .map((q) => q.trim())         // trim whitespaces
                .filter((q) => q.length > 3)  // drop empty artifacts or single character tags
            : [];

        return (
            <div className="flex justify-start">
                <div className="max-w-3xl w-full rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-5 py-4 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="size-4 text-violet-400" />
                        <p className="text-sm text-zinc-300">Assistant</p>
                    </div>

                    {/* Main Text Output (Displays perfectly while streaming now) */}
                    <div className="mt-4 text-[15px] leading-8 text-zinc-100">
                        <ReactMarkdown
                            components={{
                                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                                strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                                ul: ({ children }) => <ul className="mb-3 ml-4 list-disc space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="mb-3 ml-4 list-decimal space-y-1">{children}</ol>,
                                li: ({ children }) => <li className="leading-7 text-zinc-200">{children}</li>,
                                h1: ({ children }) => <h1 className="mb-2 mt-4 text-lg font-bold text-white">{children}</h1>,
                                h2: ({ children }) => <h2 className="mb-2 mt-4 text-base font-semibold text-white">{children}</h2>,
                                h3: ({ children }) => <h3 className="mb-1 mt-3 text-sm font-semibold text-zinc-100">{children}</h3>,
                                code: ({ children }) => (
                                    <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm font-mono text-violet-300">
                                        {children}
                                    </code>
                                ),
                                pre: ({ children }) => (
                                    <pre className="mb-3 overflow-x-auto rounded-lg bg-white/5 p-4 text-sm font-mono text-zinc-200">
                                        {children}
                                    </pre>
                                ),
                            }}
                        >
                            {mainText}
                        </ReactMarkdown>
                        {isStreaming && (
                            <span className="ml-1 inline-block h-5 w-[2px] animate-pulse bg-blue-400 align-middle" />
                        )}
                    </div>

                    {/* Follow-up Question Layout Blocks */}
                    {!isStreaming && FollowUpQuestions.length > 0 && (
                        <div className="mt-6 border-t border-white/5 pt-4">
                            <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                                Follow Up:
                            </span>
                            <div className="mt-3 flex flex-col gap-2 w-full">
                                {FollowUpQuestions.map((question, index) => (
                                    <Button
                                        key={index}
                                        variant="secondary"
                                        className="w-full h-auto whitespace-normal rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-zinc-200 text-left justify-start px-4 py-2 text-sm leading-snug"
                                        onClick={() => HandleFolloup(question)}
                                    >
                                        {question}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return null;
};