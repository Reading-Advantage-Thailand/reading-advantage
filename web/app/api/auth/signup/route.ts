import { NextRequest, NextResponse } from 'next/server';
import db from '@configs/firebaseConfig';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
    try {
        const { username, email, password, fLang } = await req.json();

        // Check if email is already in use
        const emailExistsQuery = await db.collection('users')
            .where('email', '==', email)
            .get();

        if (!emailExistsQuery.empty) {
            return NextResponse.json({
                status: 'error',
                message: 'Email already in use',
            }, { status: 409 });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user document
        const newUserRef = await db.collection('users').add({
            username,
            email,
            password: hashedPassword,
            fLang,
        });

        // Retrieve newly created user document
        const newUserSnapshot = await newUserRef.get();
        const newUser = newUserSnapshot.data();

        // Create JWT token
        const token = jwt.sign({
            id: newUserRef.id,
            username: newUser.username,
            email: newUser.email,
        }, process.env.JWT_SECRET, {
            expiresIn: '30d',
        });

        // Create response
        const response = NextResponse.json({
            message: 'User created',
            success: true,
        });

        // Set token as a secure HTTP-only cookie
        response.cookies.set('token', token, {
            secure: true,
            httpOnly: true, // Prevent JavaScript access
            path: '/', // Set cookie path as needed
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
}
