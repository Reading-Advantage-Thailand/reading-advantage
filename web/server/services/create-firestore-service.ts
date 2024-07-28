import { DBCollection } from "../models/enum";
import { DocumentData } from "firebase/firestore";
import { getDoc, setDoc, updateDoc } from "./firestore-operations";

const createFirestoreService = <T extends DocumentData>(collection: DBCollection) => {
    return {
        getDoc: (id: string) => getDoc<T>(collection, id),
        setDoc: (id: string, data: T) => setDoc(collection, id, data),
        updateDoc: (id: string, data: Partial<T>) => updateDoc(collection, id, data)
    };
};

export default createFirestoreService;
