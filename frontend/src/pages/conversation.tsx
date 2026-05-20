import { parseFOllowUpStreamObject, parseStreamObject } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SparklesIcon, } from "lucide-react";
import { MessageBubble } from "@/ui/component/message";
import { Source } from "@/ui/component/source";
import { InputBox } from "@/ui/component/inputBox";
import { Button } from "@/components/ui/button";

export type Message = {
    role?: string | undefined;
    content: string;
}

export type SourceType = {
    title: string; link: string
}

export default function Conversation() {
    const { conversationId } = useParams();
    const [messages, setMessages] = useState<Message[]>([])
    const [resource, setResource] = useState<SourceType[]>([]);

    const [isStreaming, setIsStreaming] = useState(true);

    useEffect(() => {
        async function fetchData() {
            await parseStreamObject(
                conversationId!,
                (data) => {
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

                            if (
                                prev.length > 0 &&
                                prev[prev.length - 1]!.role === "ASSISTANT"
                            ) {

                                const updated: Message[] = [...prev];

                                updated[updated.length - 1] = {
                                    ...updated[updated.length - 1],
                                    content:
                                        updated[updated.length - 1]!.content +
                                        data.content,
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
                    } else if (
                        data.role === "USER"
                    ) {
                        setMessages((prev) => [
                            ...prev,
                            {
                                role: data.role,
                                content: data.content
                            }
                        ]);
                    } else if (
                        data.type === "done"
                    ) {
                        setIsStreaming(false);
                    }
                }
            );
        }

        fetchData();
    }, [conversationId]);

    const HandleFolloup = async (question: string) => {
        setMessages((prev) => [...prev, { role: "USER", content: question }])
        setIsStreaming(true);
        await parseFOllowUpStreamObject(conversationId!, question, (data) => {
            if (data.role === "ASSISTANT") {
                setMessages((prev) => {
                    if (prev.length > 0 && prev[prev.length - 1]!.role === "ASSISTANT") {
                        const updated: Message[] = [...prev];
                        updated[updated.length - 1] = {
                            ...updated[updated.length - 1], content: updated[updated.length - 1]!.content + data.content
                        }
                        return updated
                    } else return [...prev, { role: "ASSISTANT", content: data.content }]
                })
            }
            if (data.title) {
                setResource((prev) => [...prev, { title: data.title, link: data.link }])
            } if (data.type === "done") {
                setIsStreaming(false);
            }
        })

    }


    return (
        <div className="relative min-h-screen overflow-x-hidden bg-black text-white antialiased">
            {/* Decorative Background Gradients */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1e293b,transparent_35%),radial-gradient(circle_at_bottom_right,#312e81,transparent_30%)] pointer-events-none" />
            <div className="absolute top-[-120px] left-[-120px] h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-120px] right-[-120px] h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Header */}
            <header className="sticky top-0 z-30 border-b border-white/5 backdrop-blur-xl bg-black/40">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="size-4 text-blue-400 animate-pulse" />
                        <h1 className="text-md font-medium tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                            Purplexity
                        </h1>
                    </div>
                    <div className="text-xs font-mono text-zinc-500 bg-zinc-900/50 px-2 py-1 rounded border border-white/5">
                        AI Search Assistant
                    </div>
                </div>
            </header>

            {/* Layout Wrapper */}
            <main className="relative z-10 mx-auto flex max-w-6xl gap-8 px-6 pt-8 pb-36 lg:pb-12">

                {/* Chat Content Stream */}
                <div className="flex-1 min-w-0 flex flex-col justify-between min-h-[calc(100vh-12rem)]">
                    <section className="space-y-6 w-full">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center space-y-2">
                                <p className="text-zinc-400 text-sm">Ask a question to start your research session</p>
                            </div>
                        ) : (
                            messages.map((message, index) => (
                                <MessageBubble
                                    key={index}
                                    message={message}
                                    isStreaming={isStreaming && index === messages.length - 1}
                                    HandleFolloup={HandleFolloup}
                                />
                            ))
                        )}
                    </section>

                    {/* Persistent Desktop Input Area */}
                    <div className="hidden lg:block sticky bottom-6 mt-8 w-full bg-zinc-950/80 border border-white/10 rounded-2xl p-4 backdrop-blur-lg shadow-2xl">
                        <InputBox />
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                            <span className="text-xs text-zinc-500 font-mono">Press Enter to Search</span>
                            <Button size="sm" className="rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium px-4">
                                Submit
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Sources (Only Hidden on Mobile) */}
                <aside className="sticky top-24 hidden h-[calc(100vh-8rem)] w-[320px] shrink-0 overflow-y-auto pr-2 lg:block border-l border-white/5 pl-6">
                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                            Sources Found ({resource.length})
                        </h3>
                        <Source resource={resource} />
                    </div>
                </aside>
            </main>

            {/* Floating Mobile Footer Input Overlay */}
            <footer className="lg:hidden fixed bottom-0 left-0 right-0 z-40 rounded-t-2xl border-t border-white/10 bg-zinc-950/90 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                <div className="flex flex-col gap-3">
                    <InputBox />
                    <Button className="w-full rounded-xl bg-white text-black hover:bg-zinc-200 font-semibold py-2">
                        Send Query
                    </Button>
                </div>
            </footer>
        </div>
    );
}



