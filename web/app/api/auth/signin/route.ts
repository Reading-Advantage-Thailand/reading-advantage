import db from "@configs/firebaseConfig";
import { NextResponse } from "next/server";
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const POST = async (req: NextResponse) => {
    try {
        const { email, password } = await req.json();

        // Check if user exists
        const userSnapshot = await db.collection('users')
            .where('email', '==', email)
            .limit(1) // Limit the query to a single result
            .get();

        if (userSnapshot.empty) {
            return NextResponse.json({
                status: 'error',
                message: 'No user found',
            }, { status: 404 });
        }

        const userData = userSnapshot.docs[0].data();

        // Check if password is correct
        const passwordMatch = await bcryptjs.compare(password, userData.password);
        if (!passwordMatch) {
            return NextResponse.json({
                status: 'error',
                message: 'Incorrect password',
            }, { status: 401 });
        }

        // Create token
        const token = jwt.sign({
            id: userSnapshot.docs[0].id,
            username: userData.username,
            email: userData.email,
        }, process.env.JWT_SECRET, {
            expiresIn: '30d',
        });

        // Create response
        const response = NextResponse.json({
            message: "User logged in",
            success: true,
        });

        // Set token as an HTTP-only cookie
        response.cookies.set("token", token, {
            httpOnly: true,
            path: "/", // Set the appropriate path
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiry
        });

        return response;
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({
            status: 'error',
            message: 'An error occurred while processing your request.',
        }, { status: 500 });
    }
};
