import { Role } from "@/server/models/enum";
import React from "react";
import { headers } from "next/headers";
import { Separator } from "@/components/ui/separator";
import { LicenseDataTable } from "./license-data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateLicenseForm } from "./create-license-form";
import { licenseService } from "@/client/services/firestore-client-services";
import { columns } from "./license-column";
import { Header } from "@/components/header";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import UnauthorizedPage from "@/components/shared/unauthorized-page";

async function getAllLicenses() {
  const response = await licenseService.licenses.fetchAllDocs(
    {
      select: [
        "id",
        "school_name",
        "total_licenses",
        "used_licenses",
        "expiration_date",
        "subscription_level",
      ],
    },
    headers()
  );
  console.log(response);
  return response.data;
}

export default async function LicensePage() {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/auth/signin");
  }

  if (user.role !== Role.SYSTEM) {
    return <UnauthorizedPage />;
  }

  const licenses = await getAllLicenses();

  return (
    <div>
      <Header heading="System" text="Create a new license for school" />
      <Separator className="my-4" />
      <div className="mx-2 flex gap-4 flex-col md:flex-row mb-40">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">
              Create a new license for your school
            </CardTitle>
            <CardDescription>
              License is a key to access the platform. You can create a new
              license for the school. Currently you have a total of{" "}
              <strong className="dark:text-blue-500">{licenses.length}</strong>{" "}
              license(s).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateLicenseForm />
          </CardContent>
        </Card>
        <div className="w-full">
          <LicenseDataTable data={licenses} columns={columns} />
        </div>
      </div>
    </div>
  );
}
