import { handleStreamData, parseFOllowUpStreamObject, parseStreamObject } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import {  useParams, useNavigate } from "react-router-dom";
import { SparklesIcon, ChevronLeft,Layers, Zap } from "lucide-react";
import { MessageBubble } from "@/ui/component/message";
import { Source } from "@/ui/component/source";
import { InputBox } from "@/ui/component/inputBox";
import axios from "axios";
import { AllChat } from "@/ui/component/allChat";
import { useAuth } from "@clerk/react";

const BACKEND_URL = import.meta.env.VITE_PUBLIC_BACKEND_URL;

export type Message = {
    role?: string | undefined;
    content: string;
}

export type SourceType = {
    title: string; link: string
}

export default function Conversation() {
    const { conversationId } = useParams();
    const navigate = useNavigate();
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
            const response = await axios.get(`${BACKEND_URL}/api/conversation/${conversationId}`,{
                headers:{ Authorization: `Bearer ${token}` }
            });
            const data = response.data;

            const lastMessage = data.messages?.[data.messages.length - 1];
            const lastMessageByAssistant = lastMessage?.sender === "ASSISTANT";

            if (!lastMessageByAssistant) {
                setIsStreaming(true);
                await parseStreamObject(conversationId!, token!, (d) => handleStreamData(d, setMessages, setResource, setIsStreaming));
            } else {
                const formattedMessages = data.messages.map((msg: any) => ({ role: msg.sender, content: msg.content, followUp: msg.followUp }));
                const firstAimessage = data.messages[1];
                const LastMessageSources = firstAimessage?.sources?.map((source: any) => ({ title: source.title, link: source.link })) || [];
                setMessages(formattedMessages);
                setResource(LastMessageSources);
            }
        }
        getData();

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
        <>
            {/* Custom Keyframes for Aurora Animation */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes float {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-aurora { animation: float 15s ease-in-out infinite; }
                .animate-aurora-reverse { animation: float 20s ease-in-out infinite reverse; }
                
                /* Hide scrollbar for clean UI but allow scrolling */
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />

            {/* Main App Shell */}
            <div className="relative flex h-screen w-full overflow-hidden bg-[#0a0a0f] text-slate-200 font-sans selection:bg-cyan-500/30">
                
                {/* Background Aurora Effects */}
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-600/15 blur-[120px] mix-blend-screen pointer-events-none animate-aurora z-0" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-cyan-600/15 blur-[120px] mix-blend-screen pointer-events-none animate-aurora-reverse z-0" />

                {/* LEFT SIDEBAR (History) - Hidden on Mobile */}
                <aside className="hidden lg:flex flex-col w-72 h-full z-10 border-r border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl">
                    <div className="p-5 border-b border-white/[0.05] flex items-center gap-2">
                        <Layers className="w-5 h-5 text-violet-400" />
                        <h2 className="font-semibold text-sm tracking-wide text-slate-300">History</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto hide-scrollbar p-3">
                        <AllChat />
                    </div>
                </aside>

                {/* CENTER COLUMN (Main Chat) */}
                <main className="flex-1 flex flex-col relative h-full w-full z-10">
                    
                    {/* Header */}
                    <header className="flex items-center justify-between p-4 md:p-6 bg-transparent backdrop-blur-md border-b border-white/[0.05] z-20 sticky top-0">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => navigate(-1)} 
                                className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.05] transition-all duration-300 group"
                            >
                                <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                            </button>
                            <div className="flex items-center gap-3 ml-2">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/[0.1] shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                                    <SparklesIcon className="w-5 h-5 text-cyan-400" />
                                </div>
                                <div>
                                    <h1 className="font-bold text-lg bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
                                        Purplexity
                                    </h1>
                                    <div className="text-[11px] font-medium text-slate-500 tracking-wider uppercase">
                                        AI Search Assistant
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Chat Messages Area */}
                   
                    {/* Removed pb-40 from here, as the spacer div will handle the padding naturally */}
                    <div className="flex-1 overflow-y-auto hide-scrollbar scroll-smooth p-4 mt-10 md:p-6">
                        <div className="max-w-3xl mx-auto space-y-6">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-[50vh] text-center animate-in fade-in zoom-in duration-700">
                                    <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-tr from-violet-500/20 to-cyan-500/20 flex items-center justify-center border border-white/[0.05] shadow-[0_0_30px_rgba(34,211,238,0.1)]">
                                        <Zap className="w-8 h-8 text-cyan-400" />
                                    </div>
                                    <h3 className="text-xl font-medium text-slate-200 mb-2">What do you want to explore?</h3>
                                    <p className="text-slate-500 text-sm max-w-sm">Ask a question to start your research session. The AI will gather sources and synthesize an answer.</p>
                                </div>
                            ) : (
                                messages.map((message, index) => (
                                    <div key={index} className="transition-all duration-500 ease-out translate-y-0 opacity-100">
                                        <MessageBubble
                                            message={message}
                                            isStreaming={isStreaming && index === messages.length - 1}
                                            HandleFolloup={HandleFolloup}
                                        />
                                    </div>
                                ))
                            )}
                            
                            {/* THE FIX: Large invisible spacer pushes the last message above the floating input */}
                            <div ref={DivRef} className="h-36 md:h-48 w-full shrink-0" />
                        </div>
                    </div>
                    {/* Floating Input Area */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/90 to-transparent pointer-events-none flex justify-center z-30">
                        <div className="w-full max-w-3xl pointer-events-auto transition-transform hover:scale-[1.01] duration-300">
                            <div className="p-2 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.1] shadow-2xl shadow-black/50">
                                <InputBox 
                                    ref={InputRef} 
                                    onSubmit={() => {
                                        HandleFolloup(InputRef.current?.value || "");
                                        if (InputRef.current) InputRef.current.value = "";
                                    }} 
                                />
                                <div className="flex items-center justify-between px-3 pt-2 pb-1 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <span className="hidden sm:inline">Press</span> 
                                        <kbd className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.05] text-slate-400">Enter</kbd> 
                                        <span className="hidden sm:inline">to search</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-cyan-500/70">
                                        <Layers className="w-3.5 h-3.5" />
                                        {resource.length} Sources Connected
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* RIGHT SIDEBAR (Sources) - Hidden on smaller screens, shown on Extra Large */}
                <aside className="hidden xl:flex flex-col w-80 h-full z-10 border-l border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl transition-all duration-300">
                    <div className="p-5 border-b border-white/[0.05] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <SparklesIcon className="w-5 h-5 text-cyan-400" />
                            <h2 className="font-semibold text-sm tracking-wide text-slate-300">Sources & Context</h2>
                        </div>
                        <span className="px-2.5 py-1 text-xs font-bold bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20">
                            {resource.length}
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto hide-scrollbar p-4">
                        {resource.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-center space-y-2 opacity-50">
                                <Layers className="w-8 h-8 text-slate-600" />
                                <p className="text-xs text-slate-500">Sources will appear here once the search begins.</p>
                            </div>
                        ) : (
                            <Source resource={resource} />
                        )}
                    </div>
                </aside>

            </div>
        </>
    );
}



