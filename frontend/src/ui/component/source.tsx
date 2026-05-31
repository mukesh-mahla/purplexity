import type { SourceType } from "@/pages/conversation"
import { Globe2Icon } from "lucide-react"


export function Source({ resource }: { resource: SourceType[] }) {

    return <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-2">
            <Globe2Icon className="size-4 text-blue-400" />

            <h2 className="font-medium">
                Sources
            </h2>
        </div>

        <div className="mt-5 space-y-3">
            {resource.length === 0 ? (
                <p className="text-sm text-zinc-500">
                    Sources will appear here...
                </p>
            ) : (
                resource.map((res, index) => (
                    <a
                        key={index}
                        href={res.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-xl border border-white/5 bg-black/20 p-4 transition hover:border-white/10 hover:bg-white/5"
                    >
                        <p className="line-clamp-2 text-sm font-medium text-zinc-200">
                            {res.title}
                        </p>

                        <p className="mt-2 truncate text-xs text-blue-400">
                            {res.link}
                        </p>
                    </a>
                ))
            )}
        </div>
    </div>
}