"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import dynamic from "next/dynamic";

const GaugeChart = dynamic( () => import("react-gauge-chart"), { ssr: false });

export default function LicenseUsageChart() {

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
            nrOfLevels={30}
            percent={0.7}
            arcWidth={0.3}
            textColor="#000000"
            needleColor="gray"
            needleBaseColor="gray"
            colors={["#5BE12C", "#F5CD19", "#EA4228"]}
          />
        </div>
      </CardContent>
    </Card>
    </>
  );
}
