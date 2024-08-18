import { Role } from "./enum";
import { DocumentData } from "firebase/firestore";
import { DecodedIdToken } from "firebase-admin/auth";

export interface User extends DocumentData {
    id: string;
    email: string;
    display_name: string;
    role: Role;
    created_at: string; // ISO string
    updated_at: string; // ISO string
    level: number;
    email_verified: boolean;
    picture: string;
    xp: number;
    cefr_level: string;
    sign_in_provider?: string;
    expired_date: string;
    expired: boolean;
    license_id?: string; // reference to license
}
export const UserFields = {
    ID: 'id' as const,
    EMAIL: 'email' as const,
    DISPLAY_NAME: 'display_name' as const,
    ROLE: 'role' as const,
    CREATED_AT: 'created_at' as const,
    UPDATED_AT: 'updated_at' as const,
    LEVEL: 'level' as const,
    EMAIL_VERIFIED: 'email_verified' as const,
    PICTURE: 'picture' as const,
    XP: 'xp' as const,
    CEFR_LEVEL: 'cefr_level' as const,
    SIGN_IN_PROVIDER: 'sign_in_provider' as const,
    EXPIRED_DATE: 'expired_date' as const,
    EXPIRED: 'expired' as const,
    LICENSE_ID: 'license_id' as const,
};

export const createUserModel = (decoded: DecodedIdToken, user: User | undefined): User => {
    console.log("decoded", decoded);
    console.log("firebase", decoded.firebase);
    console.log(user)
    if (user) {
        console.log("User model exists in Firestore");
        return {
            id: user.id || decoded.uid,
            email: user.email || decoded.email || "",
            display_name: user.display_name || decoded.name || decoded.email?.split("@")[0] || "",
            role: user.role || Role.UNKNOWN,
            created_at: user.created_at || "",
            updated_at: user.updated_at || "",
            email_verified: user.email_verified || false,
            picture: user.picture || decoded.picture || "",
            xp: user.xp || 0,
            sign_in_provider: decoded.firebase.sign_in_provider || "",
            expired_date: user.expired_date || "",
            level: user.level || 0,
            cefr_level: user.cefr_level || "",
            expired: false,
            license_id: user.license_id || "",
        };
    } else {
        console.log("Creating new user model in Firestore");
        const date = new Date().toISOString();
        return {
            id: decoded.uid,
            email: decoded.email || "",
            display_name: decoded.name || decoded.email?.split("@")[0] || "",
            role: Role.UNKNOWN,
            created_at: date,
            updated_at: date,
            email_verified: decoded.email_verified || false,
            picture: decoded.picture || "",
            xp: 0,
            level: 0,
            sign_in_provider: decoded.firebase.sign_in_provider || "",
            // default trial period is 14 days
            expired_date: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            cefr_level: "",
            expired: false,
            license_id: "",
        };
    }
};