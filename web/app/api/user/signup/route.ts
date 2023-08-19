import { NextRequest, NextResponse } from 'next/server';
import db from '@configs/firebaseConfig';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const { username, email, password, fLang } = await req.json();
        console.log('username', username);
        console.log('email', email);

        // Check if email is already in use
        const emailExistsQuery = await db.collection('users')
            .where('email', '==', email)
            .get();
        console.log('emailExistsQuery', emailExistsQuery.docs.length);
        if (emailExistsQuery.docs.length > 0) {
            console.log('emailExistsQuery-test', emailExistsQuery.docs.length);
            const response = NextResponse.json({
                status: 'error',
                message: 'Email already in use by another user',
            }, { status: 409 });
            return response;
        }

        // Check if username is already in use
        const usernameExistsQuery = await db.collection('users')
            .where('username', '==', username)
            .get();

        console.log('usernameExistsQuery', usernameExistsQuery.docs.length);
        if (usernameExistsQuery.docs.length > 0) {
            console.log('usernameExistsQuery-test', usernameExistsQuery.docs.length);
            const response = NextResponse.json({
                status: 'error',
                message: 'Username already in use by another user',
            }, { status: 409 });
            return response;
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
            level: 0,
            createdAt: new Date(),
        });

        // Create response
        const response = NextResponse.json({
            message: 'User created',
            success: true,
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