import db from "@/configs/firestore-config";
import { DocumentData } from "firebase/firestore";

export const getDoc = async <T extends DocumentData>(collection: string, id: string): Promise<T | undefined> => {
    try {
        const docRef = db.collection(collection).doc(id);
        const doc = await docRef.get();

        if (doc.exists) {
            console.log(`document found in collection "${collection}" with ID "${id}".`);
            console.log(doc.data());
            return doc.data() as T;
        } else {
            console.warn(`document not found in collection "${collection}" with ID "${id}".`);
            return undefined;
        }
    } catch (error) {
        console.error(`error retrieving document from collection "${collection}" with ID "${id}":`, error);
        return undefined;
    }
};

export const setDoc = async <T extends DocumentData>(collection: string, id: string, data: T): Promise<void> => {
    try {
        const docRef = db.collection(collection).doc(id);
        await docRef.set(data);
        console.log(`document created in collection "${collection}" with ID "${id}".`);
    } catch (error) {
        console.error(`error creating document in collection "${collection}" with ID "${id}":`, error);
    }
}

export const updateDoc = async <T extends DocumentData>(collection: string, id: string, data: Partial<T>): Promise<void> => {
    try {
        const docRef = db.collection(collection).doc(id);
        await docRef.update(data);
        console.log(`document updated in collection "${collection}" with ID "${id}".`);
    } catch (error) {
        console.error(`error updating document in collection "${collection}" with ID "${id}":`, error);
    }
}
