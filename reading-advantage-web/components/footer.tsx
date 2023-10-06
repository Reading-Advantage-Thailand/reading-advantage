import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { siteConfig } from "@/configs/site-config"
import { ThemeSwitcher } from "./switchers/theme-switcher-toggle"
import { LocaleSwitcher } from "./switchers/locale-switcher"

interface FooterProps {
    className?: string
}

export function Footer({ className }: FooterProps) {
    return (
        <footer className={cn(className)}>
            <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
                <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                    <Icons.logo />
                    <p className="text-center text-sm leading-loose md:text-left">
                        Reading Advantage is open source on{" "}
                        <a
                            href={siteConfig.link.github}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium underline underline-offset-4"
                        >
                            GitHub
                        </a>
                        . For media inquiries, please contact:{" "}
                        <b>Daniel Bo</b>{" "}
                        <a
                            href="mailto:admin@reading-advantage.com"
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium underline underline-offset-4"
                        >
                            admin@reading-advantage.com
                        </a>
                        .
                    </p>
                </div>
                <LocaleSwitcher />
                <ThemeSwitcher />
            </div>
        </footer>
    )
}