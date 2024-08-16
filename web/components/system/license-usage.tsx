"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import dynamic from "next/dynamic";
import { License } from "@/server/models/license";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const GaugeChart = dynamic(() => import("react-gauge-chart"), { ssr: false });

async function fetchLicense() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/licenses`
  );

  const data = await response.json();
  return data;
}

export default async function LicenseUsageChart() {
  const [licenseData, setLicenseData] = useState<License[]>([]);

  const calculatePercentage = (usedLicenses: number, totalLicenses: number) => {
    return (usedLicenses / totalLicenses) * 100;
  };

  useEffect(() => {
    async function loadLicenseData() {
      const license = await fetchLicense();
      setLicenseData(license.data);
    }
    loadLicenseData();
  }, []);

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg font-bold sm:text-xl md:text-2xl">License Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <Carousel>
            <CarouselContent>
              {licenseData.map((license: License, index) => (
                <CarouselItem key={index}>
                  <div className="p-1 sm:p-2 md:p-4">
                    <div className="flex justify-between flex-col sm:flex-row mb-2 sm:mb-4">
                      <CardDescription className="text-xs sm:text-sm">
                        School: {license.school_name}
                      </CardDescription>
                      <CardDescription className="text-xs sm:text-sm">
                        School Level: {license.subscription_level}
                      </CardDescription>
                    </div>
                    <CardContent className="flex items-center justify-center sm:p-4 md:p-6">
                      <div className="w-full max-w-md sm:max-w-sm md:max-w-md" id="gaugeArea">
                        <GaugeChart
                          id="gauge-chart"
                          percent={license.used_licenses / license.total_licenses}
                          arcWidth={0.3}
                          cornerRadius={0}
                          textColor="#000000"
                          needleColor="#737373"
                          needleBaseColor="#737373"
                        colors={['#5BE12C', '#F5CD19', '#EA4228',]}
                          arcPadding={0}
                          hideText={true}

                          nrOfLevels={420}
                        />

                        <div className="text-center text-2xl font-bold mt-2 sm:text-3xl md:text-4xl sm:mt-4">
                          {license.used_licenses}
                        </div>
                       
                      </div>
                    </CardContent>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </CardContent>
      </Card>
    </>
  );
}
