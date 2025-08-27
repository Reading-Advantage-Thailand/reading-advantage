import { NextRequest, NextResponse } from "next/server";
import catchAsync from "../utils/catch-async";
import { ExtendedNextRequest } from "./auth-controller";
import { licenseService } from "../services/firestore-server-services";
import { createLicenseModel, License } from "../models/license";
import { DBCollection } from "../models/enum";
import { getAlls, deleteOne } from "../handlers/handler-factory";
import db from "@/configs/firestore-config";
import { DocumentData } from "firebase-admin/firestore";
import { prisma } from "@/lib/prisma";

interface RequestContext {
  params: {
    id: string;
  };
}

export interface Context {
  params: {
    userId: string;
  };
}

export const createLicenseKey = catchAsync(async (req: ExtendedNextRequest) => {
  const {
    total_licenses,
    subscription_level,
    school_name,
    admin_id,
    expiration_date,
  } = await req.json();
  const license: Omit<License, "id"> = createLicenseModel({
    totalLicense: total_licenses,
    subscriptionLevel: subscription_level,
    userId: req.session?.user.id || "",
    adminId: admin_id,
    schoolName: school_name,
    expirationDate: expiration_date,
  });
  await licenseService.licenses.createDoc(license);
  return NextResponse.json({
    message: "License key created successfully",
    license,
  });
});

export const getAllLicenses = getAlls<License>(DBCollection.LICENSES);
export const deleteLicense = deleteOne<License>(DBCollection.LICENSES);

export const activateLicense = async (req: ExtendedNextRequest) => {
  try {
    const { key, userId } = await req.json();
    const license = await db
      .collection(DBCollection.LICENSES)
      .where("key", "==", key)
      .get();

    const licenseData = license.docs.map((license) => license.data());

    if (license.empty) {
      return NextResponse.json(
        {
          message: "License not found",
        },
        { status: 404 }
      );
    } else if (licenseData[0].total_licenses <= licenseData[0].used_licenses) {
      return NextResponse.json(
        {
          message: "License is already used",
        },
        { status: 404 }
      );
    }

    //update user expired date
    const user = await db.collection(DBCollection.USERS).doc(userId).get();
    const userData = user.data();
    if (!userData) {
      return NextResponse.json(
        {
          message: "User data not found",
        },
        { status: 404 }
      );
    } else if (userData.license_id === licenseData[0].id) {
      return NextResponse.json(
        {
          message: "License already activated",
        },
        { status: 404 }
      );
    }

    if (!license.empty && userData) {
      const licenseUpdate = await db
        .collection(DBCollection.LICENSES)
        .doc(licenseData[0].id)
        .update({
          used_licenses: licenseData[0].used_licenses + 1,
        });

      const userUpdate = await db
        .collection(DBCollection.USERS)
        .doc(userId)
        .update({
          expired_date: licenseData[0].expiration_date,
          license_id: licenseData[0].id,
        });

      return NextResponse.json(
        { message: "License activated successfully" },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json({
      message: "Internal server error",
      status: 500,
    });
  }
};

export const getLicense = async (
  req: ExtendedNextRequest,
  { params: { id } }: RequestContext
) => {
  try {
    const license = await db.collection(DBCollection.LICENSES).doc(id).get();
    if (!license.exists) {
      return NextResponse.json(
        {
          message: "License not found",
        },
        { status: 404 }
      );
    }
    return NextResponse.json({
      message: "License fetched successfully",
      license: license.data(),
    });
  } catch (error) {
    return NextResponse.json({
      message: "Internal server error",
      status: 500,
    });
  }
};

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

export const calculateXpForLast30Days = async () => {
  try {
    const now = new Date();

    const xpByDateAndUser: Record<string, Record<string, number>> = {};

    const activitySnapshot = await db.collection("user-activity-log").get();

    const activityPromises = activitySnapshot.docs.map(async (doc) => {
      const subCollections = await doc.ref.listCollections();
      const subCollectionPromises = subCollections.map(
        async (subCollection) => {
          const subSnapshot = await subCollection.get();

          subSnapshot.docs.forEach((subDoc) => {
            const data = subDoc.data();

            if (!data.userId || !data.timestamp || !data.xpEarned) {
              return;
            }

            const userId = data.userId;
            const xpEarned = data.xpEarned || 0;
            const timestamp: Date = data.timestamp.toDate
              ? data.timestamp.toDate()
              : new Date(data.timestamp);
            const dateStr = timestamp.toISOString().slice(0, 10);

            const past30Days = new Date();
            past30Days.setDate(now.getDate() - 30);

            if (timestamp < past30Days || timestamp >= now) return;

            if (!xpByDateAndUser[dateStr]) {
              xpByDateAndUser[dateStr] = {};
            }

            if (!xpByDateAndUser[dateStr][userId]) {
              xpByDateAndUser[dateStr][userId] = 0;
            }

            xpByDateAndUser[dateStr][userId] += xpEarned;
          });
        }
      );

      await Promise.all(subCollectionPromises);
    });

    await Promise.all(activityPromises);

    const usersSnapshot = await db.collection("users").get();
    const licenseToUserMap: Record<string, Set<string>> = {};

    usersSnapshot.forEach((doc) => {
      const user = doc.data();
      const userId = doc.id;
      const licenseId = user.license_id;
      if (licenseId) {
        if (!licenseToUserMap[licenseId]) {
          licenseToUserMap[licenseId] = new Set();
        }
        licenseToUserMap[licenseId].add(userId);
      }
    });

    const xpByDateAndLicenseFinal: Record<string, Record<string, number>> = {};

    Object.entries(xpByDateAndUser).forEach(([date, xpByUser]) => {
      xpByDateAndLicenseFinal[date] = {};

      Object.entries(licenseToUserMap).forEach(([licenseId, userSet]) => {
        let totalXp = 0;
        userSet.forEach((userId) => {
          if (xpByUser[userId]) {
            totalXp += xpByUser[userId];
          }
        });
        if (totalXp > 0) {
          xpByDateAndLicenseFinal[date][licenseId] = totalXp;
        }
      });
    });

    for (const [date, xpByLicense] of Object.entries(xpByDateAndLicenseFinal)) {
      for (const license_id in xpByLicense) {
        await db.collection("xp-gained-log").doc(`${license_id}-${date}`).set({
          license_id,
          date,
          total_xp: xpByLicense[license_id],
          created_at: now.toISOString(),
        });
      }
    }

    return NextResponse.json({ success: true, data: xpByDateAndLicenseFinal });
  } catch (error) {
    console.error("Error calculating XP:", error);
    return NextResponse.json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

export const getXp30days = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const license_id = searchParams.get("license_id");

    //console.log(`Fetching XP logs${license_id ? ` for license: ${license_id}` : " (all licenses)"}`);

    let querySnapshot;

    if (license_id) {
      querySnapshot = await db
        .collection("xp-gained-log")
        .where("license_id", "==", license_id)
        .get();
    } else {
      querySnapshot = await db.collection("xp-gained-log").get();
    }

    let totalXp = 0;

    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      totalXp += data.total_xp || 0;
    });

    //console.log(`Total XP Retrieved: ${totalXp}`);

    return NextResponse.json({
      success: true,
      license_id: license_id || "all",
      total_xp: totalXp,
    });
  } catch (error) {
    console.error("Error fetching XP logs:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const getLessonXp = async (
  req: NextRequest,
  { params: { userId } }: Context
) => {
  try {
    const articleId = req.nextUrl.searchParams.get("articleId");

    if (!articleId) {
      return NextResponse.json(
        { success: false, error: "articleId is required" },
        { status: 400 }
      );
    }

    const decodedArticleId = decodeURIComponent(articleId);
    const cleanArticleId = decodedArticleId.split("/")[0];

    console.log("Debug getLessonXp:");
    console.log("- userId:", userId);
    console.log("- articleId (raw):", articleId);
    console.log("- cleanArticleId:", cleanArticleId);

    // Get ALL UserActivities for this user
    const allUserActivities = await prisma.userActivity.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        activityType: true,
        targetId: true,
        details: true,
        createdAt: true,
      }
    });

    // Filter activities based on articleId:
    // 1. For activities with targetId = articleId (SA_QUESTION, LA_QUESTION, ARTICLE_READ, etc.)
    // 2. For MCQ activities, check articleId in details
    const articleRelatedActivities = allUserActivities.filter(activity => {
      // Direct match with targetId (for SA, LA, ARTICLE_READ, etc.)
      if (activity.targetId === cleanArticleId) {
        return true;
      }
      
      // For MCQ activities, check articleId in details
      if (activity.activityType === 'MC_QUESTION') {
        const details = activity.details as any;
        return details?.articleId === cleanArticleId;
      }
      
      return false;
    });

    console.log("- User activities found for article:", articleRelatedActivities.length);
    console.log("- Activities found:", articleRelatedActivities.map(a => ({ 
      id: a.id, 
      type: a.activityType, 
      targetId: a.targetId 
    })));

    // Also get vocabulary activities and article rating that might be related
    // Get activities from the same time period (within 1 hour of article activities)
    let allRelatedActivities = [...articleRelatedActivities];
    
    if (articleRelatedActivities.length > 0) {
      const earliestTime = new Date(Math.min(...articleRelatedActivities.map(a => a.createdAt.getTime())));
      const latestTime = new Date(Math.max(...articleRelatedActivities.map(a => a.createdAt.getTime())));
      
      // Extend time range by 1 hour before and after
      earliestTime.setHours(earliestTime.getHours() - 1);
      latestTime.setHours(latestTime.getHours() + 1);

      const vocabularyActivities = await prisma.userActivity.findMany({
        where: {
          userId: userId,
          activityType: {
            in: ['VOCABULARY_FLASHCARDS', 'VOCABULARY_MATCHING', 'ARTICLE_RATING']
          },
          createdAt: {
            gte: earliestTime,
            lte: latestTime
          }
        },
        select: {
          id: true,
          activityType: true,
          targetId: true,
          details: true,
          createdAt: true,
        }
      });

      console.log("- Vocabulary/Rating activities in time range:", vocabularyActivities.length);
      allRelatedActivities = [...articleRelatedActivities, ...vocabularyActivities];
    }

    if (articleRelatedActivities.length === 0) {
      return NextResponse.json({
        success: true,
        total_xp: 0,
        breakdown: {},
        activities_count: 0,
      });
    }

    // Get ALL XP logs for these activities (including related vocabulary/rating activities)
    const activityIds = allRelatedActivities.map(activity => activity.id);
    const allXpLogs = await prisma.xPLog.findMany({
      where: {
        userId: userId,
        activityId: { in: activityIds },
      },
      select: {
        xpEarned: true,
        activityType: true,
        activityId: true,
      }
    });

    console.log("- Total related activities:", allRelatedActivities.length);
    console.log("- All related activity IDs:", activityIds);
    console.log("- XP logs found for all related activities:", allXpLogs.length);
    console.log("- XP logs details:", allXpLogs.map(log => ({
      activityId: log.activityId,
      type: log.activityType,
      xp: log.xpEarned
    })));

    if (allXpLogs.length === 0) {
      return NextResponse.json({
        success: true,
        total_xp: 0,
        breakdown: {},
        activities_count: 0,
      });
    }

    // Calculate total XP from all article-related activities
    const totalXp = allXpLogs.reduce((total: number, log) => total + (log.xpEarned || 0), 0);

    // Break down XP by activity type
    const xpByActivityType = allXpLogs.reduce((acc, log) => {
      const activityType = log.activityType;
      if (!acc[activityType]) {
        acc[activityType] = {
          totalXp: 0,
          count: 0
        };
      }
      acc[activityType].totalXp += log.xpEarned || 0;
      acc[activityType].count += 1;
      return acc;
    }, {} as Record<string, { totalXp: number; count: number }>);

    console.log("- XP breakdown by activity type:", xpByActivityType);
    console.log("- Total XP from article:", totalXp);

    return NextResponse.json({
      success: true,
      total_xp: totalXp,
      breakdown: xpByActivityType,
      activities_count: allXpLogs.length,
      article_id: cleanArticleId,
    });
  } catch (error) {
    console.error("Error fetching lesson XP:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
