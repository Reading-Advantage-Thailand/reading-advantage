// handlers/genericHandler.ts
import { NextRequest, NextResponse } from "next/server";
import catchAsync from "../utils/catch-async";
import { ExtendedNextRequest } from "../controllers/auth-controller";
import { DBCollection } from "../models/enum";
import { DocumentData } from "firebase/firestore";
import createFirestoreService, { FirestoreService } from "../services/create-firestore-service";

type Params = { id: string; subId?: string };

const handleDocOperation = <T extends DocumentData>(
    operation: "get" | "update" | "delete",
    collection: DBCollection,
    subCollection?: string
) => catchAsync(async (req: ExtendedNextRequest, { params }: { params: Params }): Promise<NextResponse> => {
    const { id, subId } = params;
    const service = createFirestoreService<T>(collection, subCollection ? { subCollection, docId: id } : undefined);
    const docId = subId || id;

    switch (operation) {
        case "get":
            return await handleGetDoc(service, docId);
        case "update":
            return await handleUpdateDoc(req, service, docId);
        case "delete":
            return await handleDeleteDoc(service, docId);
        default:
            return NextResponse.json({ message: "Operation not supported" }, { status: 400 });
    }
});

const handleGetDoc = async <T extends DocumentData>(service: FirestoreService<T>, docId: string): Promise<NextResponse> => {
    const doc = await service.getDoc(docId);
    if (!doc) {
        return NextResponse.json({ message: "Document not found" }, { status: 404 });
    }
    return NextResponse.json({ data: doc });
};

const handleUpdateDoc = async <T extends DocumentData>(req: ExtendedNextRequest, service: FirestoreService<T>, docId: string): Promise<NextResponse> => {
    const body = await req.json();
    if (!body) {
        return NextResponse.json({ message: "No data to update" }, { status: 400 });
    }
    await service.updateDoc(docId, body);
    return NextResponse.json({ message: "Document updated", data: body });
};

const handleDeleteDoc = async <T extends DocumentData>(service: FirestoreService<T>, docId: string): Promise<NextResponse> => {
    await service.deleteDoc(docId);
    return NextResponse.json({ message: "Document deleted" });
};

const handleCreateDoc = async <T extends DocumentData>(service: FirestoreService<T>, body: T): Promise<NextResponse> => {
    await service.createDoc(body);
    return NextResponse.json({ message: "Document created", data: body });
}

export const createOne = <T extends DocumentData>(
    collection: DBCollection,
    subCollection?: string
) => catchAsync(async (req: ExtendedNextRequest): Promise<NextResponse> => {
    const body = await req.json();
    if (!body) {
        return NextResponse.json({ message: "No data to create" }, { status: 400 });
    }
    const service = createFirestoreService<T>(collection, subCollection ? { subCollection, docId: body.id } : undefined);
    return handleCreateDoc(service, body);
});

export const getOne = <T extends DocumentData>(
    collection: DBCollection,
    subCollection?: string
) => handleDocOperation<T>("get", collection, subCollection);

export const updateOne = <T extends DocumentData>(
    collection: DBCollection,
    subCollection?: string
) => handleDocOperation<T>("update", collection, subCollection);

export const deleteOne = <T extends DocumentData>(
    collection: DBCollection,
    subCollection?: string
) => handleDocOperation<T>("delete", collection, subCollection);

export const getAlls = <T extends DocumentData>(
    collection: DBCollection,
    subCollection?: string,
    id?: string
) => catchAsync(async (req: ExtendedNextRequest): Promise<NextResponse> => {
    const service = createFirestoreService<T>(collection, subCollection ? { subCollection, docId: id! } : undefined);
    const docs = await service.getAllDocs();
    return NextResponse.json({ length: docs.length, data: docs });
});