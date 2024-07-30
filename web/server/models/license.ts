import { DocumentData } from "firebase/firestore";
import { LicenseSubScriptionLevel } from "./enum";
import { randomUUID } from "crypto";

export interface License extends DocumentData {
    id: string // school id
    key: string;
    total_licenses: number;
    used_licenses: number;
    subscription_level: LicenseSubScriptionLevel;
    expiration_date: string;
    user_id: string; // id who created this license
    created_at: string;
    updated_at: string;
    admin_id: string; // id of the admin who manages this license
    school_name: string;
}

// records (sub collection) of license
export interface LicenseRecord extends DocumentData {
    id: string; // user id
    license_key: string;
    activated_at: string;
}

export const createLicenseModel = ({
    totalLicense,
    subscriptionLevel,
    // default 1 days
    expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    userId,
    adminId,
    schoolName,
}: {
    totalLicense: number;
    subscriptionLevel: LicenseSubScriptionLevel;
    expirationDate?: string;
    userId: string,
    adminId: string,
    schoolName: string,
}): Omit<License, "id"> => {
    const date = new Date().toISOString();
    return {
        key: randomUUID(),
        total_licenses: totalLicense,
        used_licenses: 0,
        subscription_level: subscriptionLevel,
        expiration_date: expirationDate,
        user_id: userId,
        updated_at: date,
        created_at: date,
        admin_id: adminId,
        school_name: schoolName,
    };
}