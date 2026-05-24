import { Input } from "@/components/ui/input"
import { ArrowUpIcon, PaperclipIcon } from "lucide-react"

interface InputBoxProps {
    value?: string;
    ref?: React.RefObject<HTMLInputElement|null>;
    onSubmit?: () => void;
}

export const InputBox = ({ value, ref, onSubmit }: InputBoxProps) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && onSubmit) {
            e.preventDefault();
            onSubmit();
        }
    };

    return (
        <div className="relative flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/40 p-2 pl-4 shadow-xl backdrop-blur-md transition-all focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20">
            {/* Attachment Button */}
            <button className="flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
                <PaperclipIcon className="size-4" />
            </button>

            {/* Core Text Input */}
            <Input 
                type="text" 
                value={value}
                ref={ref}
                onKeyDown={handleKeyDown}
                className="h-9 w-full border-0 bg-transparent p-0 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0" 
                placeholder="Ask a follow-up question..." 
            />

            {/* Action Submit Button */}
            <button 
                onClick={onSubmit}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-500 active:scale-95 transition-all"
            >
                <ArrowUpIcon className="size-4 stroke-[2.5]" />
            </button>
        </div>
    )
}