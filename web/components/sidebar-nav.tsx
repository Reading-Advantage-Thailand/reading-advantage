"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

import { SidebarNavItem } from "@/types"
import { useTranslations } from "next-intl"

interface SidebarNavProps {
    items: SidebarNavItem[]
}

export function SidebarNav({ items }: SidebarNavProps) {
    const t = useTranslations("components.sidebar")
    const path = usePathname()
    // remove en or th from path
    const pathWithoutLocale = path.replace(/\/(en|th)/, "")
    if (!items?.length) {
        return null
    }


    return (
        <nav className="mb-4 flex items-start gap-2 md:mb-0 md:grid">
            {items.map((item, index) => {
                const Icon = Icons[item.icon as keyof typeof Icons]
                return (
                    item.href && (
                        <Link key={index} href={item.disabled ? "/" : item.href}>
                            <span
                                className={cn(
                                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                                    pathWithoutLocale === item.href ? "bg-accent" : "transparent",
                                    item.disabled && "cursor-not-allowed opacity-80"
                                )}
                            >
                                <Icon className="mr-2 h-4 w-4" />
                                <span>{t(item.title)}</span>
                            </span>
                        </Link>
                    )
                )
            })}
        </nav>
    )
}