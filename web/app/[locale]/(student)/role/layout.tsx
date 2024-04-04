import { MainNav } from "@/components/main-navbar"
import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { studentPageConfig } from "@/configs/student-page-config"
import { UserAccountNav } from "@/components/user-account-nav"
import ProgressBar from "@/components/progress-bar-xp"
import { LocaleSwitcher } from "@/components/switchers/locale-switcher"

interface RoleLayoutProps {
    children?: React.ReactNode
}

export default async function StudentHomeLayout({
    children,
}: RoleLayoutProps) {
    const user = await getCurrentUser()

    if (!user) {
        return redirect('/auth/signin')
    }

    return (
        <div className="flex min-h-screen flex-col space-y-6">
            <header className="sticky top-0 z-40 border-b bg-background">
                <div className="container flex h-16 items-center space-x-2 py-4 justify-between">
                    <MainNav items={studentPageConfig.mainNav} />
                    <div className="space-x-2 flex">
                    <LocaleSwitcher />
                    <UserAccountNav
                        user={{
                            name: user.name || "",
                            image: user.image || "",
                            email: user.email || "",
                            level: user.level || 0,
                            verified: user.verified || false,
                            role: user.role || "",
                            cefrLevel: user.cefrLevel || "",
                        }}
                    />
                    </div>
                </div>
            </header>
            <div className="container grid flex-1 gap-12">
                <main className="flex w-full flex-1 flex-col overflow-hidden">
                    {children}
                </main>
            </div>
        </div>
    )
}
