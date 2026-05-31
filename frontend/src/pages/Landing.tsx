import { ArrowUpIcon, Loader2Icon, SparklesIcon, Zap, Search, Globe, Shield, Cpu, BookOpen, History, X } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { cn } from "@/lib/utils";
import z from "zod";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SignInButton, SignUpButton, useAuth, UserButton } from "@clerk/react";
import { AllChat } from "@/ui/component/allChat"; // Imported your AllChat component

const formschema = z.object({
  value: z.string().min(1, "message is required").max(10000, "message is too big"),
});

const SUGGESTIONS = [
  { icon: Globe, text: "Latest breakthroughs in AI" },
  { icon: Cpu, text: "How to build a SaaS in Next.js" },
  { icon: BookOpen, text: "Explain quantum computing simply" },
];

export default function Landing() {
  const [isFocused, setIsFocused] = useState(false);
  const [showHistory, setShowHistory] = useState(false); // State for the history drawer
  const navigate = useNavigate();
  const { isSignedIn, getToken } = useAuth();

  const form = useForm<z.infer<typeof formschema>>({
    resolver: zodResolver(formschema),
    defaultValues: { value: "" },
    mode: "onChange",
  });

  useEffect(() => {
    if (!isSignedIn) return;
    const syncUser = async () => {
      const token = await getToken();
      await axios.post(`${process.env.PUBLIC_BACKEND_URL}/create-user`, {}, { headers: { Authorization: `Bearer ${token}` } });
    };
    syncUser();
  }, [isSignedIn, getToken]);

  const mutation = useMutation({
    mutationFn: async (query: string) => {
      const token = await getToken();
      return axios.post(`${process.env.PUBLIC_BACKEND_URL}/api/create-conversation`, { query }, { headers: { Authorization: `Bearer ${token}` } });
    },
  });

  const isPending = mutation.isPending;
  const isDisabled = isPending || !form.formState.isValid;

  const onSubmit = (data: z.infer<typeof formschema>) => {
    if (!isSignedIn) {
      navigate("/sign-in");
      return;
    }
    mutation.mutate(data.value, {
      onSuccess: (res) => navigate(`/conversation/${res.data.conversationId}`),
      onError: (e: any) => toast.error(e.message || "Something went wrong"),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (!isDisabled) {
        form.handleSubmit(onSubmit)();
      }
    }
  };

  const handleSuggestionClick = (text: string) => {
    form.setValue("value", text, { shouldValidate: true });
    setTimeout(() => {
        form.handleSubmit(onSubmit)();
    }, 100);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-aurora { animation: float 15s ease-in-out infinite; }
        .animate-aurora-reverse { animation: float 20s ease-in-out infinite reverse; }
        
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <div className="relative flex flex-col min-h-screen w-full overflow-x-hidden bg-[#0a0a0f] text-slate-200 font-sans selection:bg-cyan-500/30">
        
        {/* Background Aurora Effects */}
        <div className="fixed top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-violet-600/15 blur-[120px] mix-blend-screen pointer-events-none animate-aurora z-0" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-600/15 blur-[120px] mix-blend-screen pointer-events-none animate-aurora-reverse z-0" />

        {/* 
          1. REDESIGNED TOP BAR
          Removed the full border and background, making it a sleek absolute floating layer. 
        */}
        <header className="absolute top-0 left-0 w-full p-4 md:p-6 z-40 flex items-center justify-between pointer-events-none">
          
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/[0.1] shadow-[0_0_15px_rgba(139,92,246,0.2)]">
              <SparklesIcon className="w-5 h-5 text-cyan-400" />
            </div>
            <h1 className="font-bold text-xl bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent leading-tight tracking-wide">
              Purplexity
            </h1>
          </div>
          
          <div className="flex items-center gap-3 pointer-events-auto">
            {!isSignedIn ? (
              <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-md">
                <SignInButton mode="modal">
                  <button className="text-sm font-semibold px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="text-sm font-semibold px-4 py-2 rounded-xl bg-white/[0.08] text-cyan-400 hover:bg-white/[0.12] transition-all shadow-lg shadow-black/20">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* 2. HISTORY BUTTON */}
                <button 
                  onClick={() => setShowHistory(true)}
                  className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] hover:border-white/[0.1] backdrop-blur-md transition-all text-slate-300 hover:text-white"
                >
                  <History className="w-4 h-4 text-cyan-400" />
                  <span className="hidden sm:inline text-sm font-medium">History</span>
                </button>

                <div className="p-1 rounded-full bg-white/[0.03] border border-white/[0.05] backdrop-blur-md">
                  <UserButton 
                    appearance={{
                      elements: { userButtonAvatarBox: "w-8 h-8 md:w-9 md:h-9" }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Search Viewport */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 z-10 w-full max-w-4xl mx-auto min-h-screen pt-20 pb-24 md:pb-10">
          
          <div className="text-center space-y-6 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] text-xs font-medium text-cyan-400/80 mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>Next-Gen AI Research</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
              Ask anything. <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Get sourced answers.
              </span>
            </h2>
            <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto font-medium">
              Start a conversation with Purplexity. Fast, accurate, and optimized for deep research on any device.
            </p>
          </div>

          <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 fill-mode-both">
            <div className={cn(
              "rounded-2xl md:rounded-3xl p-2 md:p-3 bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] shadow-2xl transition-all duration-500",
              isFocused ? "shadow-[0_0_40px_rgba(34,211,238,0.15)] border-white/[0.15] bg-white/[0.04]" : "hover:border-white/[0.12] hover:bg-white/[0.03]"
            )}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="relative flex flex-col">
                <div className="flex items-start px-2 md:px-4 pt-2">
                  <Search className="w-6 h-6 text-slate-500 mt-2 shrink-0 hidden sm:block" />
                  <TextareaAutosize
                    {...form.register("value")}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={handleKeyDown}
                    minRows={1}
                    maxRows={8}
                    placeholder="Ask a question, e.g. 'How to build canvas drawing logic in a Next.js app?'"
                    className="w-full bg-transparent resize-none outline-none border-none text-white placeholder:text-slate-500 px-3 md:px-4 py-2 text-base md:text-lg font-medium hide-scrollbar leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between mt-4 px-2 md:px-3 pb-1">
                  <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <span>Press</span>
                    <div className="flex gap-1">
                      <kbd className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.05] text-slate-400">Cmd</kbd>
                      <kbd className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.05] text-slate-400">↵</kbd>
                    </div>
                    <span>to search</span>
                  </div>
                  
                  <div className="sm:hidden text-xs text-slate-500 font-medium">AI Search</div>

                  <button 
                    type="submit" 
                    disabled={isDisabled} 
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 md:py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
                      isDisabled 
                        ? "bg-white/[0.05] text-slate-500 cursor-not-allowed" 
                        : "bg-gradient-to-tr from-violet-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 active:scale-95"
                    )}
                  >
                    {isPending ? <Loader2Icon className="size-4 md:size-5 animate-spin" /> : <ArrowUpIcon className="size-4 md:size-5 stroke-[2.5]" />} 
                    <span className="hidden sm:inline">Ask Purplexity</span>
                    <span className="sm:hidden">Ask</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {SUGGESTIONS.map((item, i) => (
                <button key={i} onClick={() => handleSuggestionClick(item.text)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all text-xs text-slate-400 hover:text-slate-200">
                  <item.icon className="w-3.5 h-3.5 text-cyan-500/70" />
                  {item.text}
                </button>
              ))}
            </div>
          </div>
        </main>

        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 py-24 border-t border-white/[0.05] z-10 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.05] backdrop-blur-sm hover:bg-white/[0.03] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 mb-4"><Globe className="w-6 h-6 text-cyan-400" /></div>
              <h3 className="text-lg font-bold text-white mb-2">Real-Time Sources</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Every answer is backed by live web searches. Verify information instantly with inline citations and a dedicated sources panel.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.05] backdrop-blur-sm hover:bg-white/[0.03] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20 mb-4"><SparklesIcon className="w-6 h-6 text-violet-400" /></div>
              <h3 className="text-lg font-bold text-white mb-2">Context Aware</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Ask endless follow-up questions. Purplexity remembers the context of your entire conversation so you can dive deeper naturally.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.05] backdrop-blur-sm hover:bg-white/[0.03] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-4"><Shield className="w-6 h-6 text-emerald-400" /></div>
              <h3 className="text-lg font-bold text-white mb-2">Private & Secure</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Your research belongs to you. Built with clerk authentication to ensure your chat history and personal data remain locked down.</p>
            </div>
          </div>
        </section>

        <footer className="w-full py-8 text-center border-t border-white/[0.05] z-10 bg-black/20 backdrop-blur-md">
          <p className="text-slate-500 text-sm font-medium tracking-wide">Built with ❤️ • Purplexity AI</p>
        </footer>

        {/* 
          3. HISTORY DRAWER OVERLAY
          This slides in from the right when "History" is clicked.
        */}
        {showHistory && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Dark overlay background */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setShowHistory(false)}
            />
            
            {/* Sliding Drawer */}
            <div className="relative w-full max-w-[320px] h-full bg-[#0a0a0f]/95 backdrop-blur-3xl border-l border-white/[0.08] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between p-5 border-b border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-base font-semibold text-white tracking-wide">Your History</h2>
                </div>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Injecting your AllChat Component here */}
              <div className="flex-1 overflow-y-auto hide-scrollbar p-4">
                 <AllChat />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}