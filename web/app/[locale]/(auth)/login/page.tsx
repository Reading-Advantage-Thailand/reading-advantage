import { Metadata } from "next"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { UserAuthForm } from "@/components/user-auth-form"
import { getScopedI18n } from "@/locales/server"
import { siteConfig } from "@/configs/site-config"

export const metadata: Metadata = {
    title: "Login",
    description: "Login to your account",
}

export default async function LoginPage() {
    const t = await getScopedI18n('pages.loginPage');
    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <Link
                href="/"
                className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "absolute left-4 top-4 md:left-8 md:top-8"
                )}
            >
                <>
                    <Icons.left className="mr-2 h-4 w-4" />
                    {t('backButton')}
                </>
            </Link>
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <Icons.logo className="mx-auto h-6 w-6" />
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {siteConfig.name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t('loginDescription')}
                    </p>
                </div>
                <UserAuthForm />
            </div>
        </div>
    )
}