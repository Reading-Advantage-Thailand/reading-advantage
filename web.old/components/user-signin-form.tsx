"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { signIn } from "next-auth/react";
import { firebaseAuth, firebaseApp } from "@/lib/firebase";
import {
  getAuth,
  signInAnonymously,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  GithubAuthProvider,
  GoogleAuthProvider,
} from "firebase/auth";
import type { AuthProvider } from "firebase/auth";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserSignInForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>("");
  const googleProvider = new GoogleAuthProvider();

  const handleOAuthSignIn = (provider: AuthProvider) => {
    signInWithPopup(firebaseAuth, provider)
      .then((credential) => credential.user.getIdToken(true))
      .then((idToken) => {
        signIn("credentials", {
          idToken,
          callbackUrl: "/student/read",
        });
      })
      .catch((err) => console.error(err));
  };

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    const target = event.target as typeof event.target & {
      email: { value: string };
      password: { value: string };
    };
    const email = target.email.value;
    const password = target.password.value;
    console.log(email, password);
    signInWithEmailAndPassword(firebaseAuth, email, password)
      .then((credential) => credential.user.getIdToken(true))
      .catch((err) => {
        let customMessage;
        switch (err.code) {
          case "auth/invalid-credential":
            customMessage =
              "The provided credential is invalid. This can happen if it is malformed, expired, or the user account does not exist.";
            break;
          case "auth/too-many-requests":
            customMessage =
              "Too many unsuccessful login attempts. Please try again later.";
            break;
          default:
            customMessage = "Something went wrong.";
        }
        setError(customMessage);
        console.log(err);
        return null;
      })
      .then((idToken) => {
        if (idToken) {
          signIn("credentials", {
            idToken,
            callbackUrl: "/student/read",
          });
        }
      })
      .finally(() => setIsLoading(false));
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
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign in
          </Button>
          <a
            href="/auth/forgot-password"
            className="text-sm text-muted-foreground hover:text-blue-500"
          >
            Forgot Password?
          </a>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-2 text-muted-foreground">Or continue with</span>
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
  );
}
