import { NextRequest, NextResponse } from "next/server";
import { articleService, userService } from "../services/firestore-server-services";
import { evaluateRating } from "../generators/evaluate-rating-generator";
import fs from "fs";
import { User } from "../models/user";
import { Role } from "../models/enum";

export async function evaluateUserRunner(
    req: NextRequest,
    params: unknown,
    next: () => void
) {
    const users = await userService.getAllDocs();
    const total = users.length;
    let count = 0;
    // update the user with correct format
    const evaluated = await Promise.all(
        users.map(async (user) => {
            const createdAt = user.createAt ? new Date(user.createAt._seconds * 1000).toISOString() : user.created_at || new Date().toISOString();
            const updatedData: User = {
                id: user.id,
                average_rating: 0,
                email: user.email,
                display_name: user.name || user.display_name || "",
                role: Role.STUDENT,
                // convert the date to ISO string
                created_at: createdAt,
                updated_at: user.updatedAt || user.updated_at || new Date().toISOString(),
                level: user.level || 0,
                email_verified: user.verified || user.email_verified || false,
                picture: user.picture || user.image || "",
                xp: user.xp || 0,
                cefr_level: user.cefrLevel || user.cefr_level || "",
                expired_date: "",
                expired: false,
            };
            // update the user with the new data
            await userService.updateDoc(user.id, updatedData);
            count++;
            console.log('id:', user.id, 'total:', count, '/', total);
            return updatedData;
        })
    );

    return NextResponse.json({
        total: total,
        users: evaluated,
    });
}
