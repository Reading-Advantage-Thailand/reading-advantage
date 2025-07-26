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
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import type { AuthProvider } from "firebase/auth";
import { LucideCheck } from "lucide-react";
import { 
  isIOS, 
  hasSessionStorageIssues, 
  getAuthErrorMessage,
  clearAuthState,
  getIOSAuthConfig 
} from "@/utils/ios-auth-handler";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserSignUpForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>("");
  const isIOSDevice = isIOS();

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    
    const target = event.target as typeof event.target & {
      email: { value: string };
      password: { value: string };
      confirmPassword: { value: string };
    };
    
    const email = target.email.value;
    const password = target.password.value === target.confirmPassword.value
      ? target.password.value
      : null;
      
    if (!password) {
      setError("Password does not match");
      setIsLoading(false);
      return;
    }
    
    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const idToken = await credential.user.getIdToken(true);
      
      if (idToken) {
        await signIn("credentials", {
          idToken,
        });
      }
    } catch (err: any) {
      console.error("Sign-up error:", err);
      const errorMessage = getAuthErrorMessage(err.code, isIOSDevice);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
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
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              placeholder="confirm password"
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
            Create Account
          </Button>
        </div>
      </form>
    </div>
  );
}
