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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { licenseService } from "@/client/services/firestore-client-services";
import { LicenseSubScriptionLevel } from "@/server/models/enum";

const FormSchema = z.object({
  school_name: z
    .string()
    .min(5, {
      message: "School name must be at least 5 characters.",
    })
    .max(60, {
      message: "School name must be at most 60 characters.",
    }),
  total: z.number().int().min(1),
  subscription_level: z.enum([
    LicenseSubScriptionLevel.BASIC,
    LicenseSubScriptionLevel.PREMIUM,
    LicenseSubScriptionLevel.ENTERPRISE,
  ]),
  admin_id: z.string(),
  duration: z.number().int().min(1),
});

export function CreateLicenseForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      total: 1,
      subscription_level: LicenseSubScriptionLevel.BASIC,
      school_name: "",
      admin_id: "",
      duration: 1,
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      // Create the licenses
      await licenseService.licenses.createDoc({
        total_licenses: data.total,
        subscription_level: data.subscription_level,
        school_name: data.school_name,
        admin_id: data.admin_id,
        duration: data.duration,
      });
      // Reset the form
      form.reset({
        total: 1,
        subscription_level: LicenseSubScriptionLevel.BASIC,
        school_name: "",
      });

      toast({
        title: "Created licenses.",
        description: `Created ${data.total} ${data.subscription_level} licenses for ${data.school_name}.`,
      });
    } catch (error) {
      toast({
        title: "An error occurred.",
        description: `Failed to create licenses`,
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 mb-3">
        <FormField
          control={form.control}
          name="school_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>School name</FormLabel>
              <FormControl>
                <Input type="text" placeholder="name" {...field} />
              </FormControl>
              <FormMessage />
              <FormDescription>The name of the school</FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="admin_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admin ID</FormLabel>
              <FormControl>
                <Input type="text" placeholder="ID" {...field} />
              </FormControl>
              <FormMessage />
              <FormDescription>
                The id of the admin that will be assigned to manage the school.
                Responsible for admin roles.
              </FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="total"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="total licenses"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
              <FormDescription>
                The total number of licenses to create.
              </FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subscription_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subscription Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subscription level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={LicenseSubScriptionLevel.BASIC}>
                    Basic
                  </SelectItem>
                  <SelectItem value={LicenseSubScriptionLevel.PREMIUM}>
                    Premium
                  </SelectItem>
                  <SelectItem value={LicenseSubScriptionLevel.ENTERPRISE}>
                    Enterprise
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
              <FormDescription>
                The subscription level for the licenses.
              </FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration in days</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Duration"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
              <FormDescription>
                The duration of the license in days. Default is 1 day.
              </FormDescription>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          disabled={!form.formState.isValid}
        >
          Create Licenses
        </Button>
      </form>
    </Form>
  );
}
