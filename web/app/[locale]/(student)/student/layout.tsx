import { Footer } from "@/components/footer"
import { MainNav } from "@/components/main-navbar"
import { getCurrentUser } from "@/lib/session"
import { notFound } from "next/navigation"
import { studentHomePageConfig } from "@/configs/student-home-config"
import { UserAccountNav } from "@/components/user-account-nav"
import { SidebarNav } from "@/components/sidebar-nav"
import { ModeToggle } from "@/components/theme-switcher-toggle"
interface StudentHomeLayoutProps {
    children?: React.ReactNode
}


export default async function StudentHomeLayout({
    children,
}: StudentHomeLayoutProps) {
    const user = await getCurrentUser()

    if (!user) {
        return notFound()
    }

    return (
        <div className="flex min-h-screen flex-col space-y-6">
            <header className="sticky top-0 z-40 border-b bg-background">
                <div className="container flex h-16 items-center justify-between py-4">
                    <MainNav items={studentHomePageConfig.mainNav} />
                    <div className="flex space-x-2">
                        <ModeToggle />
                        <UserAccountNav
                            user={{
                                name: user.name,
                                image: user.image,
                                email: user.email,
                                level: user.level
                            }}
                        />
                    </div>
                </div>
            </header>
            <div className="container md:grid md:flex-1 gap-12 md:grid-cols-[200px_1fr]">
                <aside className="md:w-[200px] md:flex-col md:flex">
                    <SidebarNav items={studentHomePageConfig.sidebarNav} />
                </aside>
                <main className="flex w-full flex-1 flex-col overflow-hidden">
                    {children}
                </main>
            </div>
        </div>
    )
}