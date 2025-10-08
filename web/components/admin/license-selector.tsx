"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface License {
  id: string;
  schoolName: string;
  maxUsers: number;
  expiresAt: Date;
  _count?: {
    licenseUsers: number;
  };
}

interface LicenseSelectorProps {
  licenses: License[];
  selectedLicenseId: string;
  onLicenseChange: (licenseId: string) => void;
}

export default function LicenseSelector({
  licenses,
  selectedLicenseId,
  onLicenseChange,
}: LicenseSelectorProps) {
  const selectedLicense = licenses.find((l) => l.id === selectedLicenseId);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Select License</CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={selectedLicenseId} onValueChange={onLicenseChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a license">
              {selectedLicense ? selectedLicense.schoolName : "Select a license"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Available Licenses</SelectLabel>
              {licenses.map((license) => (
                <SelectItem key={license.id} value={license.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{license.schoolName}</span>
                    <span className="text-xs text-muted-foreground">
                      Users: {license._count?.licenseUsers || 0}/{license.maxUsers}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
