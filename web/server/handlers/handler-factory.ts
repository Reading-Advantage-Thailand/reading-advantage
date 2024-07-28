// handlers/genericHandler.ts
import { NextRequest, NextResponse } from "next/server";
import catchAsync from "../utils/catch-async";
import { ExtendedNextRequest } from "../controllers/auth-controller";
import { DBCollection } from "../models/enum";
import { DocumentData } from "firebase/firestore";
import createFirestoreService from "../services/create-firestore-service";

export const getOne = <T extends DocumentData>(collection: DBCollection) =>
    catchAsync(async (req: ExtendedNextRequest, { params: { id } }: { params: { id: string } }) => {
        const service = createFirestoreService<T>(collection);
        const doc = await service.getDoc(id);

        if (!doc) {
            return NextResponse.json({
                message: "Document not found",
            }, { status: 404 });
        }

        return NextResponse.json({
            data: doc,
        });
    });

export const updateOne = <T extends DocumentData>(collection: DBCollection) =>
    catchAsync(async (req: ExtendedNextRequest, { params: { id } }: { params: { id: string } }) => {
        const service = createFirestoreService<T>(collection);
        const body = await req.json();

        if (!body) {
            return NextResponse.json({
                message: "No data to update",
            }, { status: 400 });
        }

        await service.updateDoc(id, body);

        return NextResponse.json({
            message: "Document updated",
            data: body,
        });
    });
