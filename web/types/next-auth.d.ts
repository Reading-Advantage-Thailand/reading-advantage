import { User } from "next-auth"
import { JWT } from "next-auth/jwt"

type UserId = string

declare module "next-auth/jwt" {
    interface JWT {
        id: UserId
        name: string
        email: string
        picture: string
        level: number
        verified: boolean
        xp: number
    }
}

declare module "next-auth" {
    interface Session {
        user: User & {
            id: UserId,
            name: string,
            email: string,
            image: string,
            level: number,
            verified: boolean,
            xp: number
        },
    }
}