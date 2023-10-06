"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { signIn } from "next-auth/react"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> { }


export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
    const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false)
    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <button
                type="button"
                className={cn(buttonVariants({ variant: "outline" }))}
                onClick={() => {
                    setIsGoogleLoading(true)
                    try {
                        signIn("google", {
                            callbackUrl: `${window.location.origin}/student/home`,
                        })
                    } catch (error) {
                        console.log(error)
                    }

                }}
                disabled={isGoogleLoading}
            >
                {isGoogleLoading ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Icons.google className="mr-2 h-4 w-4" />
                )}{" "}
                Google
            </button>
        </div>
    )
}