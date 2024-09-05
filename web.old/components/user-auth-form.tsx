"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { signIn } from "next-auth/react"
import { firebaseAuth, firebaseApp } from "@/lib/firebase"
import {
    getAuth,
    signInAnonymously,
    signInWithEmailLink,
    sendSignInLinkToEmail,
    signInWithEmailAndPassword,
    signInWithPopup,
    GithubAuthProvider,
    GoogleAuthProvider,
} from "firebase/auth"
import type { AuthProvider } from "firebase/auth"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> { }


export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [isEmailSent, setIsEmailSent] = React.useState<boolean>(false)
    const googleProvider = new GoogleAuthProvider()

    const handleOAuthSignIn = (provider: AuthProvider) => {
        signInWithPopup(firebaseAuth, provider)
            .then((credential) => credential.user.getIdToken(true))
            .then((idToken) => {
                signIn("credentials", {
                    idToken,
                    callbackUrl: "/student/read",
                })
            })
            .catch((err) => console.error(err))
    }

    const handleEmailSignInWithLink = (provider: AuthProvider) => {
        const email = "boss4848988@gmail.com"
        sendSignInLinkToEmail(firebaseAuth, email, {
            url: "http://localhost:3000/auth-confirm",
            handleCodeInApp: true,
        })
            .then(() => {
                setIsEmailSent(true)
                window.localStorage.setItem("emailForSignIn", email)
            })
            .catch((err) => console.error(err))
    }

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)
        const email = 'boss4848988@gmail.com'
        sendSignInLinkToEmail(firebaseAuth, email, {
            url: "http://localhost:3000/student/read",
            handleCodeInApp: true,
        })
            .then(() => {
                setIsEmailSent(true)
                window.localStorage.setItem("emailForSignIn", email)
            })
            .catch((err) => console.error(err))
    }
    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <form onSubmit={onSubmit}>
                <div className="grid gap-2">
                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="email">
                            Email
                        </Label>
                        <Input
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isLoading}
                            required
                        />
                    </div>
                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="email">
                            Password
                        </Label>
                        <Input
                            id="password"
                            placeholder="password"
                            type="password"
                            autoCapitalize="none"
                            autoComplete="password"
                            autoCorrect="off"
                            disabled={isLoading}
                            required
                        />
                    </div>
                    <Button disabled={isLoading}>
                        {isLoading && (
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Sign in
                    </Button>
                    {/* <div className="mt-2"> */}
                    <a href="/forgot-password" className="text-sm text-muted-foreground hover:text-blue-500">
                        Forgot Password?
                    </a>
                    {/* </div> */}
                </div>
            </form>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>
            </div>
            <Button
                variant="outline"
                type="button"
                disabled={isLoading}
                onClick={() => handleOAuthSignIn(googleProvider)}
            >
                {isLoading ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Icons.google className="mr-2 h-4 w-4" />
                )}{" "}
                Google
            </Button>
        </div>
    )
}