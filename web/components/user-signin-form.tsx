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
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import type { AuthProvider } from "firebase/auth";
import { 
  isIOS, 
  hasSessionStorageIssues, 
  getAuthErrorMessage,
  clearAuthState,
  getIOSAuthConfig 
} from "@/utils/ios-auth-handler";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserSignInForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>("");
  const googleProvider = new GoogleAuthProvider();
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const isIOSDevice = isIOS();
  const authConfig = getIOSAuthConfig();

  // Handle redirect result for iOS devices using signInWithRedirect
  React.useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(firebaseAuth);
        if (result && result.user) {
          const idToken = await result.user.getIdToken(true);
          if (idToken) {
            await signIn("credentials", {
              idToken,
            });
          }
        }
      } catch (error: any) {
        console.error("Redirect result error:", error);
        const errorMessage = getAuthErrorMessage(error.code, isIOSDevice);
        setError(errorMessage);
        
        // Clear auth state if there's a persistent error
        if (error.code === "auth/missing-or-invalid-nonce") {
          await clearAuthState(firebaseAuth);
        }
      }
    };

    handleRedirectResult();
  }, [isIOSDevice]);

  // Function to check if sessionStorage is available
  const isSessionStorageAvailable = (): boolean => {
    return !hasSessionStorageIssues();
  };

  const handleOAuthSignIn = async (provider: AuthProvider) => {
    setIsLoading(true);
    setError("");
    
    try {
      // For iOS devices or when sessionStorage is not available, use redirect flow
      if (authConfig.useRedirectFlow) {
        await signInWithRedirect(firebaseAuth, provider);
        return; // The redirect will handle the rest
      }

      // Use popup flow for other devices
      const result = await signInWithPopup(firebaseAuth, provider);
      if (result?.user && typeof result.user.getIdToken === "function") {
        const idToken = await result.user.getIdToken(true);
        await signIn("credentials", {
          idToken,
        });
      } else {
        throw new Error("Invalid user object or getIdToken method not found");
      }
    } catch (error: any) {
      console.error("OAuth sign-in error:", error);
      const errorMessage = getAuthErrorMessage(error.code, isIOSDevice);
      
      // If popup method fails on iOS, fallback to redirect
      if (isIOSDevice && (error.code === "auth/popup-blocked" || error.code === "auth/popup-closed-by-user")) {
        try {
          await signInWithRedirect(firebaseAuth, provider);
          return; // The redirect will handle the rest
        } catch (redirectError: any) {
          const redirectErrorMessage = getAuthErrorMessage(redirectError.code, isIOSDevice);
          setError(redirectErrorMessage);
        }
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      
      if (credential.user && typeof credential.user.getIdToken === "function") {
        const idToken = await credential.user.getIdToken(true);
        await signIn("credentials", {
          idToken,
        });
      } else {
        throw new Error("Invalid user object or getIdToken method not found");
      }
    } catch (err: any) {
      console.error("Email/password sign-in error:", err);
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {isIOSDevice && hasSessionStorageIssues() && (
            <div className="text-amber-600 text-sm bg-amber-50 p-2 rounded border">
              <strong>iOS Notice:</strong> If you're having trouble signing in, please try:
              <ul className="list-disc list-inside mt-1 text-xs">
                <li>Turn off Private Browsing mode</li>
                <li>Use Safari instead of other browsers</li>
                <li>Clear Safari cache and try again</li>
              </ul>
            </div>
          )}
          <Button
            name="signin-button"
            type="submit"
            role="button"
            disabled={isLoading}
          >
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
        name="google-button"
        variant="outline"
        type="button"
        disabled={isLoading}
        role="button"
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
