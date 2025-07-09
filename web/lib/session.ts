import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }
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
        licenseOnUsers: {
          select: {
            licenseId: true,
          },
          take: 1,
        },
      },
    });

    if (!user) {
      return null;
    }

    const currentDate = new Date();
    const isExpired = user.expiredDate ? user.expiredDate < currentDate : false;

    const activeLicenseId = user.licenseOnUsers[0]?.licenseId || user.licenseId;

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
      license_id: activeLicenseId ?? "",
      onborda: user.onborda ?? false,
    };
  } catch (error) {
    console.error("Error fetching current user:", error);
    return session.user;
  }
}
