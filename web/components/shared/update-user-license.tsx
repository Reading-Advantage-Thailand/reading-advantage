"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Icons } from "@/components/icons";
import { useRouter } from "next/navigation";

const FormSchema = z.object({
  license: z.string().uuid({ message: "Invalid UUID format" }),
});

export function UpdateUserLicenseForm({
  username,
  userId,
  redirectTo,
}: {
  username: string;
  userId: string;
  redirectTo?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      license: "",
    },
  });
  //   const { update } = useSession();
  const router = useRouter();

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      setIsLoading(true);
      // Update the user's username
      const response = await fetch(`/api/v1/users/${userId}/license`, {
        method: "POST",
        body: JSON.stringify({
          license_key: data.license,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error("Failed to update license. " + data.message);
      }

      // Reset the form
      form.reset({ license: data.license });

      // Redirect to the specified page
      if (redirectTo) {
        router.replace(redirectTo);
      } else {
        router.refresh();
      }

      toast({
        title: "User license updated",
        description: `The user license has been updated to ${data.license}`,
      });
    } catch (error: any) {
      toast({
        title: "An error occurred.",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 mb-3">
        <FormField
          control={form.control}
          name="license"
          render={({ field }) => (
            <FormItem>
              <FormLabel>License</FormLabel>
              <FormDescription>
                Active license for {username}. Update the license to change the
                user's license.
              </FormDescription>
              <FormControl>
                <Input type="text" placeholder="license key" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          disabled={isLoading || !form.formState.isValid}
        >
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Update
        </Button>
      </form>
    </Form>
  );
}
