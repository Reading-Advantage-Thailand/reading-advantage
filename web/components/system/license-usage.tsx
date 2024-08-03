"use client";
import React, { use } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import dynamic from "next/dynamic";
import { set } from "lodash";

const GaugeChart = dynamic( () => import("react-gauge-chart"), { ssr: false });

async function fetchLicense() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/licenses`
  );
  // console.log(response);

  const data = await response.json();
  return data;
}
export default async function LicenseUsageChart() {
  const [usedLicenses, setUsedLicenses] = React.useState(0);

  const license = await fetchLicense();
    console.log('license: ', license.data[0].used_licenses);

    for (let i = 0; i < license.data.length; i++) {
      console.log('license: ', license.data[i].used_licenses);
      const usedLicenses = license.data[i].used_licenses;
      setUsedLicenses(usedLicenses);
      // return usedLicenses;
    } 

  return (
    <>
     {/* License Usage */}
<Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-lg font-bold">License Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-40 flex items-center justify-center">
          <GaugeChart
            id="gauge-chart"
            nrOfLevels={1}
            percent={usedLicenses / 100}
            arcWidth={0.3}
            textColor="#000000"
            needleColor="gray"
            needleBaseColor="gray"
            // colors={["#5BE12C", "#F5CD19", "#EA4228"]}
            colors={["#5BE12C", "#F5CD19", "#EA4228"]} 
          />
        </div>
      </CardContent>
    </Card>
    </>
  );
}
