import { NextResponse } from "next/server";
import catchAsync from "../utils/catch-async";
import { ExtendedNextRequest } from "./auth-controller";
import { randomUUID } from "crypto";
import { DBCollection, LicenseSubScriptionLevel } from "../models/enum";
import db from "@/configs/firestore-config";
import { getOne, updateOne } from "../handlers/handler-factory";

export interface License {
    key: string;
    school_id: string;
    total_licenses: number;
    used_licenses: number;
    subscription_level: LicenseSubScriptionLevel;
    expiration_date: string;
    user_id: string;
    created_at: string;
}

export const generateLicenseKey = catchAsync(async (req: ExtendedNextRequest, { params: { id } }: { params: { id: string } }) => {
    const { totalLicenses, subscriptionLevel, userId } = await req.json();
    console.log(totalLicenses, subscriptionLevel, userId);
    const license: License = {
        key: randomUUID(),
        school_id: id,
        total_licenses: totalLicenses,
        used_licenses: 0,
        subscription_level: subscriptionLevel,
        // default expiration date is 1 day
        expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        user_id: userId,
        created_at: new Date().toISOString(),
    };

    // save license to database
    await db.collection(DBCollection.LICENSES).doc(license.key).set({
        ...license,
    });

    return NextResponse.json({
        message: "License key generated successfully",
        license,
    });
});

// use in user route
export const activateLicense = catchAsync(async (req: ExtendedNextRequest, { params: { id } }: { params: { id: string } }) => {
    const { key } = await req.json();
    // check if license exists
    const license = await db.collection(DBCollection.LICENSES).doc(key).get();
    if (!license.exists) {
        return NextResponse.json({
            message: "License not found",
        }, { status: 404 });
    }

    // update user expired date
    const user = await db.collection(DBCollection.USERS).doc(id).get();
    const userData = user.data();
    if (!userData) {
        return NextResponse.json({
            message: "User data not found",
        }, { status: 404 });
    }
    await db.collection(DBCollection.USERS).doc(id).update({
        expired_date: new Date((userData.expired_date).getTime() + 24 * 60 * 60 * 1000).toISOString(),
    });
    return NextResponse.json({
        message: "Licenses fetched successfully",
    });
});


export const getAllLicenses = catchAsync(async (req: ExtendedNextRequest, { params: { id } }: { params: { id: string } }) => {
    const licenses = await db.collection(DBCollection.LICENSES).where("school_id", "==", id).get();
    const licensesData = licenses.docs.map((license) => license.data() as License);
    return NextResponse.json({
        message: "Licenses fetched successfully",
        licenses: licensesData,
    });
});
