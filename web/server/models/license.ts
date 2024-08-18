import { DocumentData } from "firebase/firestore";
import { LicenseRecordStatus, LicenseSubScriptionLevel } from "./enum";
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
// fields of license
export const LicenseFields = {
    ID: 'id' as const,
    KEY: 'key' as const,
    TOTAL_LICENSES: 'total_licenses' as const,
    USED_LICENSES: 'used_licenses' as const,
    SUBSCRIPTION_LEVEL: 'subscription_level' as const,
    EXPIRATION_DATE: 'expiration_date' as const,
    USER_ID: 'user_id' as const,
    CREATED_AT: 'created_at' as const,
    UPDATED_AT: 'updated_at' as const,
    ADMIN_ID: 'admin_id' as const,
    SCHOOL_NAME: 'school_name' as const
};
// records (sub collection) of license
export interface LicenseRecord extends DocumentData {
    id: string; // user id
    activated_at: string;
    status: LicenseRecordStatus;
    license_id: string; // reference to license
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