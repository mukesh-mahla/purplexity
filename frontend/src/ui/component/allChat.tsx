
import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
    MessageSquare,
    Loader2,
    Sparkles,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export const AllChat = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {getToken} = useAuth()
    
    const { data, isLoading, error } = useQuery({
        queryKey: ["all-chat"],
        queryFn: async () => {
            const token = await getToken();
            const response = await axios.get(
                `${process.env.BACKEND_URL}/api/conversations`,{
                    headers:{
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            return response.data;
        },
    });

    return (
        <div className="flex h-[calc(100vh-6rem)] flex-col overflow-hidden rounded-3xl border border-white/5 bg-black/30 backdrop-blur-2xl">
            
            {/* Header */}
            <div className="border-b border-white/5 px-5 py-4">
                <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-xl bg-white/5">
                        <Sparkles className="size-4 text-violet-300" />
                    </div>

                    <div>
                        <h2 className="text-sm font-medium text-white">
                            Conversations
                        </h2>

                        <p className="text-xs text-zinc-500">
                            Recent research sessions
                        </p>
                    </div>
                </div>
            </div>

            {/* Scroll Area */}
            <div className="flex-1 overflow-y-auto px-2 py-3">
                {isLoading && (
                    <div className="flex items-center gap-2 px-3 py-4 text-sm text-zinc-500">
                        <Loader2 className="size-4 animate-spin" />
                        Loading...
                    </div>
                )}

                {error && (
                    <div className="px-3 py-4 text-sm text-red-400">
                        Failed to load conversations
                    </div>
                )}

                {!isLoading && data?.length === 0 && (
                    <div className="px-3 py-4 text-sm text-zinc-500">
                        No conversations yet
                    </div>
                )}

                <div className="space-y-1">
                    {data?.map((conversation: any) => {
                        const isActive =
                            location.pathname ===
                            `/conversation/${conversation.id}`;

                        return (
                            <button
                                key={conversation.id}
                                onClick={() => {
                                    navigate(
                                        `/conversation/${conversation.id}`
                                    );
                                }}
                                className={`
                                    group relative w-full overflow-hidden rounded-2xl px-3 py-3 text-left transition-all
                                    ${
                                        isActive
                                            ? "bg-white/10"
                                            : "hover:bg-white/[0.04]"
                                    }
                                `}
                            >
                                {/* Active glow */}
                                {isActive && (
                                    <div className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-gradient-to-b from-blue-400 to-violet-500" />
                                )}

                                <div className="flex items-start gap-3">
                                    <div
                                        className={`
                                            mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl
                                            ${
                                                isActive
                                                    ? "bg-blue-500/15"
                                                    : "bg-white/5 group-hover:bg-white/10"
                                            }
                                        `}
                                    >
                                        <MessageSquare
                                            className={`
                                                size-4
                                                ${
                                                    isActive
                                                        ? "text-blue-300"
                                                        : "text-zinc-500"
                                                }
                                            `}
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p
                                            className={`
                                                truncate text-sm leading-relaxed
                                                ${
                                                    isActive
                                                        ? "text-white"
                                                        : "text-zinc-300"
                                                }
                                            `}
                                        >
                                            {conversation.title ||
                                                "Untitled Conversation"}
                                        </p>

                                        <p className="mt-1 text-[11px] text-zinc-600">
                                            {new Date(
                                                conversation.updatedAt
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};