import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

interface FooterProps {
    className?: string
}

export function ArticleFooter({ className }: FooterProps) {
    return (
        <footer className={cn(className)}>
                <div className="flex items-center gap-4 px-8">
                    <Icons.AlertCircle />
                    <p className="text-sm leading-loose">The text and image have not been fact checked. They may be inaccurate. The voice is computer generated.</p>
                </div>
        </footer>
    )
}