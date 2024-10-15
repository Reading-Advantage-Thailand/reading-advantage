import { NextResponse } from "next/server";
import catchAsync from "../utils/catch-async";
import { ExtendedNextRequest } from "./auth-controller";
import { licenseService } from "../services/firestore-server-services";
import { createLicenseModel, License } from "../models/license";
import { DBCollection } from "../models/enum";
import { getAlls, deleteOne } from "../handlers/handler-factory";
//import db from "@/configs/firestore-config";

export const createLicenseKey = catchAsync(async (req: ExtendedNextRequest) => {
  const { total_licenses, subscription_level, school_name, admin_id } =
    await req.json();
  const license: Omit<License, "id"> = createLicenseModel({
    totalLicense: total_licenses,
    subscriptionLevel: subscription_level,
    userId: req.session?.user.id || "",
    adminId: admin_id,
    schoolName: school_name,
  });
  await licenseService.licenses.createDoc(license);
  return NextResponse.json({
    message: "License key created successfully",
    license,
  });
});

export const getAllLicenses = getAlls<License>(DBCollection.LICENSES);
export const deleteLicense = deleteOne<License>(DBCollection.LICENSES);

// export async function activateLicense(req: ExtendedNextRequest) {
//   try {
//     const { key, userId } = await req.json();
//     const license = await db
//       .collection(DBCollection.LICENSES)
//       .where("key", "==", key)
//       .get();

//     const licenseData = license.docs.map((license) => license.data());

//     if (license.empty) {
//       return NextResponse.json(
//         {
//           message: "License not found",
//         },
//         { status: 404 }
//       );
//     } else if (licenseData[0].total_licenses <= licenseData[0].used_licenses) {
//       return NextResponse.json(
//         {
//           message: "License is already used",
//         },
//         { status: 404 }
//       );
//     }

//     //update user expired date
//     const user = await db.collection(DBCollection.USERS).doc(userId).get();
//     const userData = user.data();
//     if (!userData) {
//       return NextResponse.json(
//         {
//           message: "User data not found",
//         },
//         { status: 404 }
//       );
//     }

//     if (!license.empty && userData) {
//       const licenseUpdate = await db
//         .collection(DBCollection.LICENSES)
//         .doc(licenseData[0].id)
//         .update({
//           used_licenses: licenseData[0].used_licenses + 1,
//         });

//       const userUpdate = await db
//         .collection(DBCollection.USERS)
//         .doc(userId)
//         .update({
//           expired_date: licenseData[0].expiration_date,
//           license_id: licenseData[0].id,
//         });

//       return NextResponse.json(
//         { message: "License activated successfully" },
//         { status: 200 }
//       );
//     }
//   } catch (error) {
//     return NextResponse.json({
//       message: "Internal server error",
//       status: 500,
//     });
//   }
// }

// export const getFilteredLicenses = catchAsync(async (req: ExtendedNextRequest) => {
//     // req.nextUrl.searchParams.get("page");
//     // URLSearchParams { 'page' => '1' }
//     // map to key
//     const fil = req.nextUrl.searchParams.entries();
//     const filter = Object.fromEntries(req.nextUrl.searchParams.entries());
//     console.log('filter', filter);
//     // pagination
//     const licenses = await db.collection(DBCollection.NEWARTICLES)
//         .orderBy("created_at")
//         .startAt(1)
//         .limit(10)
//         .select("id", "key", "created_at")
//         .get();

//     const list = licenses.docs.map((license) => license.data());

//     return NextResponse.json({
//         message: "Licenses fetched successfully",
//         length: list.length,
//         data: list,
//     });
// });

// export const getAllLicenses = getAll<License>(DBCollection.LICENSES);

// export const generateLicenseKey = catchAsync(async (req: ExtendedNextRequest, { params: { id } }: { params: { id: string } }) => {
//     const { totalLicenses, subscriptionLevel, userId } = await req.json();
//     console.log(totalLicenses, subscriptionLevel, userId);
//     const license: License = {
//         key: randomUUID(),
//         school_id: id,
//         total_licenses: totalLicenses,
//         used_licenses: 0,
//         subscription_level: subscriptionLevel,
//         // default expiration date is 1 day
//         expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
//         user_id: userId,
//         created_at: new Date().toISOString(),
//     };

//     // save license to database
//     await db.collection(DBCollection.LICENSES).doc(license.key).set({
//         ...license,
//     });

//     return NextResponse.json({
//         message: "License key generated successfully",
//         license,
//     });
// });

// // use in user route
// export const activateLicense = catchAsync(async (req: ExtendedNextRequest, { params: { id } }: { params: { id: string } }) => {
//     const { key } = await req.json();
//     // check if license exists
//     const license = await db.collection(DBCollection.LICENSES).doc(key).get();
//     if (!license.exists) {
//         return NextResponse.json({
//             message: "License not found",
//         }, { status: 404 });
//     }

//     // update user expired date
//     const user = await db.collection(DBCollection.USERS).doc(id).get();
//     const userData = user.data();
//     if (!userData) {
//         return NextResponse.json({
//             message: "User data not found",
//         }, { status: 404 });
//     }
//     await db.collection(DBCollection.USERS).doc(id).update({
//         expired_date: new Date((userData.expired_date).getTime() + 24 * 60 * 60 * 1000).toISOString(),
//     });
//     return NextResponse.json({
//         message: "Licenses fetched successfully",
//     });
// });

// export const getAllLicenses = catchAsync(async (req: ExtendedNextRequest, { params: { id } }: { params: { id: string } }) => {
//     const licenses = await db.collection(DBCollection.LICENSES).where("school_id", "==", id).get();
//     const licensesData = licenses.docs.map((license) => license.data() as License);
//     return NextResponse.json({
//         message: "Licenses fetched successfully",
//         licenses: licensesData,
//     });
// });
