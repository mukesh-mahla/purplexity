import { Input } from "@/components/ui/input"
import { ArrowUpIcon, PaperclipIcon } from "lucide-react"

interface InputBoxProps {
    value?: string;
    ref?: React.Ref<HTMLInputElement>;
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
        // Stripped away the rigid background, border, and focus-rings. 
        // It now relies entirely on the beautiful glass container from the parent.
        <div className="flex items-center gap-2 px-2 py-1 w-full">
            
            {/* Attachment Button */}
            <button className="flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-white/[0.08] hover:text-cyan-400 transition-colors">
                <PaperclipIcon className="size-5" />
            </button>

            {/* Core Text Input */}
            <Input 
                type="text" 
                value={value}
                ref={ref}
                onKeyDown={handleKeyDown}
                // Forced shadcn to remove all borders, shadows, and focus rings
                className="h-10 w-full border-0 bg-transparent p-0 text-base text-slate-200 placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none shadow-none" 
                placeholder="Ask a follow-up question..." 
            />

            {/* Action Submit Button - Upgraded to match the Aurora Gradient Theme */}
            <button 
                onClick={onSubmit}
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 active:scale-95 transition-all duration-300"
            >
                <ArrowUpIcon className="size-5 stroke-[2.5]" />
            </button>
        </div>
    )
}