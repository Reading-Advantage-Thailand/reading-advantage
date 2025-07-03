import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  // Fetch fresh user data from database to ensure we have the latest information
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        level: true,
        emailVerified: true,
        image: true,
        xp: true,
        cefrLevel: true,
        expiredDate: true,
        licenseId: true,
        onborda: true,
      },
    });

    if (!user) {
      return null;
    }

    const currentDate = new Date();
    const isExpired = user.expiredDate ? user.expiredDate < currentDate : false;

    console.log("Current user data fetched:", {
      id: user.id,
      email: user.email!,
      display_name: user.name ?? "",
      role: user.role,
      level: user.level,
      email_verified: !!user.emailVerified,
      picture: user.image ?? "",
      xp: user.xp,
      cefr_level: user.cefrLevel ?? "",
      expired_date: user.expiredDate?.toISOString() ?? "",
      expired: isExpired,
      license_id: user.licenseId ?? "",
      onborda: user.onborda ?? false,
    });

    return {
      id: user.id,
      email: user.email!,
      display_name: user.name ?? "",
      role: user.role,
      level: user.level,
      email_verified: !!user.emailVerified,
      picture: user.image ?? "",
      xp: user.xp,
      cefr_level: user.cefrLevel ?? "",
      expired_date: user.expiredDate?.toISOString() ?? "",
      expired: isExpired,
      license_id: user.licenseId ?? "",
      onborda: user.onborda ?? false,
    };
  } catch (error) {
    console.error("Error fetching current user:", error);
    // Fallback to session data if database query fails
    return session.user;
  }
}
