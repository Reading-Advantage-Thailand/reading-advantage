import db from "@/configs/firestore-config";
import { DocumentData } from "firebase/firestore";

export const getDoc = async <T extends DocumentData>(collection: string, id: string, parent?: string): Promise<T | undefined> => {
    try {
        const collectionRef = parent ? db.doc(parent).collection(collection) : db.collection(collection);
        const docRef = collectionRef.doc(id);
        const doc = await docRef.get();

        if (doc.exists) {
            console.log(`Document found in collection "${collection}" with ID "${id}".`);
            return doc.data() as T;
        } else {
            console.warn(`Document not found in collection "${collection}" with ID "${id}".`);
            return undefined;
        }
    } catch (error) {
        console.error(`Error retrieving document from collection "${collection}" with ID "${id}":`, error);
        return undefined;
    }
};

export const setDoc = async <T extends DocumentData>(collection: string, id: string, data: T, parent?: string): Promise<void> => {
    try {
        const collectionRef = parent ? db.doc(parent).collection(collection) : db.collection(collection);
        const docRef = collectionRef.doc(id);
        await docRef.set(data);
        console.log(`Document created in collection "${collection}" with ID "${id}".`);
    } catch (error) {
        console.error(`Error creating document in collection "${collection}" with ID "${id}":`, error);
    }
}

export const updateDoc = async <T extends DocumentData>(collection: string, id: string, data: Partial<T>, parent?: string): Promise<void> => {
    try {
        const collectionRef = parent ? db.doc(parent).collection(collection) : db.collection(collection);
        const docRef = collectionRef.doc(id);
        await docRef.update(data);
        console.log(`Document updated in collection "${collection}" with ID "${id}".`);
    } catch (error) {
        console.error(`Error updating document in collection "${collection}" with ID "${id}":`, error);
    }
}

export const createDoc = async <T extends DocumentData>(collection: string, data: Omit<T, "id">, parent?: string): Promise<void> => {
    try {
        const collectionRef = parent ? db.doc(parent).collection(collection) : db.collection(collection);
        const docRef = await collectionRef.add(data);
        await docRef.set({ id: docRef.id }, { merge: true });
        console.log(`Document created in collection "${collection}" with ID: ${docRef.id}`);
    } catch (error) {
        console.error(`Error creating document in collection "${collection}":`, error);
    }
}

export const deleteDoc = async (collection: string, id: string, parent?: string): Promise<void> => {
    try {
        const collectionRef = parent ? db.doc(parent).collection(collection) : db.collection(collection);
        const docRef = collectionRef.doc(id);
        await docRef.delete();
        console.log(`Document deleted from collection "${collection}" with ID "${id}".`);
    } catch (error) {
        console.error(`Error deleting document from collection "${collection}" with ID "${id}":`, error);
    }
}

export const getAllDocs = async <T extends DocumentData>(collection: string, filter?: { select?: string[] }, parent?: string,): Promise<T[]> => {
    try {
        const collectionRef = parent
            ? db.doc(parent).collection(collection)
            : db.collection(collection);

        const query = filter?.select ? collectionRef.select(...filter.select) : collectionRef;
        const snapshot = await query.get();
        const docs = snapshot.docs.map((doc) => doc.data() as T);

        console.log(`Documents retrieved from collection "${collection}".`);
        return docs;
    } catch (error) {
        console.error(`Error retrieving documents from collection "${collection}":`, error);
        return [];
    }
}

export interface Filter {
    orderBy: string;
    startAt: number;
    limit: number;
    select: string[];
}

// depecrated
export const getFilteredDocs = async <T extends DocumentData>(collection: string, filter: Filter, parent?: string): Promise<T[]> => {
    try {
        const collectionRef = parent ? db.doc(parent).collection(collection) : db.collection(collection);
        const snapshot = await collectionRef
            .orderBy(filter.orderBy)
            .startAt(filter.startAt)
            .limit(filter.limit)
            .select(...filter.select)
            .get();
        const docs = snapshot.docs.map((doc) => doc.data() as T);
        return docs;
    } catch (error) {
        console.error(`Error retrieving documents from collection "${collection}":`, error);
        return [];
    }
}