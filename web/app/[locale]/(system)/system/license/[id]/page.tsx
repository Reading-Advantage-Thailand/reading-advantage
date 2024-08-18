import { Role } from "@/server/models/enum";
import React from "react";
import { headers } from "next/headers";
import { Separator } from "@/components/ui/separator";
import { licenseService } from "@/client/services/firestore-client-services";
import { Header } from "@/components/header";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import UnauthorizedPage from "@/components/shared/unauthorized-page";
import { formatDate, timeLeft } from "@/lib/utils";
import LicenseInfoItem from "./license-info-item";
import { UserLicenseDataTable } from "./user-license-data-table";
import { columns } from "./user-license-columns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

async function getLicense(id: string) {
  const response = await licenseService.licenses.fetchDoc(id, headers());
  return response.data;
}

async function getLicenseAllRecords(id: string) {
  const response = await licenseService.records(id).fetchAllDocs({}, headers());
  console.log(response);
  return response.data;
}

export default async function LicenseInfoPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/auth/signin");
  }

  if (user.role !== Role.SYSTEM) {
    return <UnauthorizedPage />;
  }

  const license = await getLicense(params.id);
  const records = await getLicenseAllRecords(params.id);
  const time = timeLeft(license.expiration_date);

  return (
    <div>
      <Link
        href="/system/license"
        className="inline-block mb-4 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
      >
        &larr; Back to License Page
      </Link>
      <Header heading="System" text="License Information" />
      <Separator className="my-4" />
      <div className="flex flex-col lg:flex-row gap-4 p-2 mb-40">
        <Card className="w-[45rem]">
          <CardHeader>
            <CardTitle className="text-primary">License Information</CardTitle>
            <CardDescription>
              Information about the license key and the school it belongs to
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LicenseInfoItem title="License ID" data={license.id} />
            <LicenseInfoItem title="School Name" data={license.school_name} />
            <LicenseInfoItem
              title="Subscription Level"
              data={license.subscription_level}
            />
            <LicenseInfoItem
              title="Admin ID"
              desc="The admin ID who manages the school"
              data={license.admin_id}
            />
            <LicenseInfoItem
              title="Created At"
              data={`${license.created_at} (${formatDate(license.created_at)})`}
            />
            <LicenseInfoItem
              title="Total Licenses"
              desc="The total number of licenses available for the school"
              data={license.total_licenses}
            />
            <LicenseInfoItem
              title="Used Licenses"
              desc="The number of licenses that are currently in use"
              data={license.used_licenses}
            />
            <LicenseInfoItem
              badge={time}
              title="Expiration Date"
              desc="The date when the license expires"
              data={`${license.expiration_date}`}
            />
            <LicenseInfoItem
              isAbleToCopy={true}
              badge="License"
              title="License Key"
              hidden={true}
              activated={true}
              data={license.key}
            />
          </CardContent>
        </Card>
        <section className="w-full">
          <UserLicenseDataTable data={records} columns={columns} />
        </section>
      </div>
    </div>
  );
}
