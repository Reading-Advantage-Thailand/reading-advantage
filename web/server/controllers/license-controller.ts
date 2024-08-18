import { NextResponse } from "next/server";
import catchAsync from "../utils/catch-async";
import { ExtendedNextRequest } from "./auth-controller";
import { licenseService, userService } from "../services/firestore-server-services";
import { createLicenseModel, License, LicenseFields, LicenseRecord } from "../models/license";
import { DBCollection, LicenseRecordStatus } from "../models/enum";
import { getAlls, deleteOne, getOne, createOne } from "../handlers/handler-factory";
import { UserFields } from "../models/user";
import db from "@/configs/firestore-config";

// parent collection (licenses) of license
export const createLicenseKey = catchAsync(async (req: ExtendedNextRequest) => {
    const { total_licenses, subscription_level, school_name, admin_id, duration } = await req.json();
    const license: Omit<License, "id"> = createLicenseModel({
        totalLicense: total_licenses,
        subscriptionLevel: subscription_level,
        userId: req.session?.user.id || "",
        adminId: admin_id,
        schoolName: school_name,
        expirationDate: new Date(new Date().getTime() + duration * 24 * 60 * 60 * 1000).toISOString(),  // duration in days
    })
    await licenseService.licenses.createDoc(license);
    return NextResponse.json({
        message: "License key created successfully",
        license,
    });
});
export const deleteLicense = catchAsync(async (req: ExtendedNextRequest, ctx: { params: { id: string } }) => {
    const records = await licenseService.records(ctx.params.id).getAllDocs();
    for (let i = 0; i < records.length; i++) {
        const record = records[i] as LicenseRecord;
        await userService.users.updateDoc(record.id, {
            expired_date: "",
            license_id: "",
        });
    }
    await licenseService.licenses.deleteDoc(ctx.params.id);
    return NextResponse.json({
        message: "License deleted successfully",
    });
});

// factory functions
export const getLicense = getOne<License>(DBCollection.LICENSES);
export const getAllLicenses = getAlls<License>(DBCollection.LICENSES);

// sub collection (records) of license
export const activateLicense = catchAsync(async (req: ExtendedNextRequest, ctx: { params: { id: string } }) => {
    const id = req.session?.user.id;
    const { license_key } = await req.json();

    // check if license exists
    const license = await licenseService.licenses.findOne({
        field: LicenseFields.KEY,
        operator: "==",
        value: license_key,
    });

    if (!license) {
        return NextResponse.json({
            message: "License not found",
        }, { status: 404 });
    }
    // check if license max limit reached
    if (license.total_licenses <= license.used_licenses) {
        return NextResponse.json({
            message: "License limit reached",
        }, { status: 400 });
    }

    // check if license is expired
    if (new Date(license.expiration_date) < new Date()) {
        return NextResponse.json({
            message: "License expired",
        }, { status: 400 });
    }

    // check if user already activated this license and it is not expired
    const user = await db.collection(DBCollection.USERS)
        .where(UserFields.LICENSE_ID, "==", license.id)
        .where(UserFields.ID, "==", id)
        .get()

    if (!user.empty) {
        return NextResponse.json({
            message: "License already activated",
        }, { status: 400 });
    }

    // update user expired date
    const record = await licenseService.records(license.id).setDoc(id!, {
        activated_at: new Date().toISOString(),
        id: id!,
        status: LicenseRecordStatus.ENABLED,
        license_id: license.id,
    });

    // updarecordexpired date
    await userService.users.updateDoc(id!, {
        expired_date: license.expiration_date,
        license_id: license.id,
    });

    // update used licenses
    await licenseService.licenses.updateDoc(license.id, {
        used_licenses: license.used_licenses + 1,
    });

    return NextResponse.json({
        message: "License activated successfully",
        record,
    });
});
export const deactivateLicense = catchAsync(async (req: ExtendedNextRequest, ctx: { params: { id: string } }) => {
    const { id } = ctx.params; // user id
    const { license_id } = await req.json();

    // check if license exists
    const license = await licenseService.licenses.findOne({
        field: LicenseFields.ID,
        operator: "==",
        value: license_id,
    });

    if (!license) {
        return NextResponse.json({
            message: "License not found",
        }, { status: 404 });
    }

    // Check license is lower than 0
    if (license.used_licenses <= 0) {
        return NextResponse.json({
            message: "License already deactivated",
        }, { status: 400 });
    }

    // update user expired date
    await userService.users.updateDoc(id, {
        expired_date: "",
        license_id: "",
    });

    // update used licenses
    await licenseService.licenses.updateDoc(license.id, {
        used_licenses: license.used_licenses - 1,
    });

    // delete record
    await db.collection(DBCollection.LICENSES)
        .doc(license.id)
        .collection(DBCollection.LICENSE_RECORDS)
        .doc(id)
        .delete();

    return NextResponse.json({
        message: "License deactivated successfully",
    });
});
export const getLicenseAllRecords = catchAsync(async (req: ExtendedNextRequest, ctx: { params: { id: string } }) => {
    const records = await licenseService.records(ctx.params.id).getAllDocs();
    const data = [];
    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const user = await userService.users.findOne({
            field: UserFields.ID,
            operator: "==",
            value: record.id,
        });
        data.push({
            ...record,
            display_name: user?.display_name,
            email: user?.email,
            role: user?.role,
        });
    }
    return NextResponse.json({
        length: records.length,
        data,
    });
});