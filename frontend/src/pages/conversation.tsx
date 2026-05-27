import { handleStreamData, parseFOllowUpStreamObject, parseStreamObject } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { data, useParams } from "react-router-dom";
import { SparklesIcon, } from "lucide-react";
import { MessageBubble } from "@/ui/component/message";
import { Source } from "@/ui/component/source";
import { InputBox } from "@/ui/component/inputBox";
import axios from "axios";
import { AllChat } from "@/ui/component/allChat";
import { useAuth } from "@clerk/react";

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
    const InputRef = useRef<HTMLInputElement>(null);
    const DivRef = useRef<HTMLDivElement>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const {getToken} = useAuth()
    useEffect(() => {
        setMessages([]);
        setResource([]);
        setIsStreaming(false);

        async function getData() {
            const token = await getToken();
            const response = await axios.get(`http://localhost:4000/api/conversation/${conversationId}`,{
                headers:{
                    Authorization: `Bearer ${token}`,
                }
            })
            const data = response.data

            const lastMessage = data.messages?.[data.messages.length - 1]!
            const lastMessageByAssistant = lastMessage?.sender === "ASSISTANT";

            if (!lastMessageByAssistant) {
                setIsStreaming(true);
                await parseStreamObject(
                    conversationId!,
                    token!,
                    (data) => handleStreamData(data, setMessages, setResource, setIsStreaming)
                );
            }

            if (lastMessageByAssistant) {
                const formattedMessages = data.messages.map((msg: any) => ({
                    role: msg.sender,
                    content: msg.content,
                    followUp: msg.followUp
                }))
                const firstAimessage = data.messages[1]
                const LastMessageSources = firstAimessage.sources?.map((source: any) => ({
                    title: source.title,
                    link: source.link
                })) || []



                setMessages(formattedMessages);
                setResource(LastMessageSources);

            }

        }
        getData()

    }, [conversationId]);

    useEffect(() => {
        if (isStreaming) {
            DivRef.current?.scrollIntoView({ behavior: "auto" })
        }
    }, [messages])

    const HandleFolloup = async (question: string) => {
         const token = await getToken();
        setMessages((prev) => [...prev, { role: "USER", content: question }])
        setIsStreaming(true);
        await parseFOllowUpStreamObject(conversationId!, question, token!, (data) => {
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
        <div className="relative flex flex-col bg-black text-white antialiased">
            {/* Decorative Background Gradients */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,#1e293b,transparent_35%),radial-gradient(circle_at_bottom_right,#312e81,transparent_30%)] pointer-events-none" />
            <div className="fixed top-[-120px] left-[-120px] h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
            <div className="fixed bottom-[-120px] right-[-120px] h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
            <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

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
            {/* Layout Wrapper */}
            <main className="relative z-10 flex w-full gap-6 px-4 pt-8 pb-6">

                {/* Left Sidebar - All Conversations */}
                <aside className="sticky top-24 hidden h-[calc(100vh-8rem)] w-[240px] shrink-0 lg:block">
                    <AllChat />
                </aside>

                {/* Chat Content Stream */}
                <div className="flex-1 min-w-0 flex flex-col gap-6 max-w-3xl mx-auto">
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
                    <div ref={DivRef} />

                    {/* Desktop Input */}
                    <div className="hidden lg:block w-full">
                        <InputBox ref={InputRef} onSubmit={() => {
                            HandleFolloup(InputRef.current?.value || "");
                            if (InputRef.current) InputRef.current.value = "";
                        }} />
                        <p className="mt-2 text-center text-xs text-zinc-600 font-mono">Press Enter to search</p>
                    </div>
                </div>

                {/* Right Sidebar - Sources */}
                <aside className="sticky top-24 hidden h-[calc(100vh-8rem)] w-[280px] shrink-0 overflow-y-auto lg:block border-l border-white/5 pl-6">
                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            Sources Found ({resource.length})
                        </h3>
                        <Source resource={resource} />
                    </div>
                </aside>
            </main>

            {/* Mobile Footer */}
            <footer className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-zinc-950/95 p-4 backdrop-blur-xl">
                <InputBox />
            </footer>
        </div>
    );
}



