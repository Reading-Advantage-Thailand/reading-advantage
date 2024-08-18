import { DBCollection } from "../models/enum";
import { DocumentData } from "firebase/firestore";
import { getDoc, setDoc, updateDoc, createDoc, deleteDoc, getAllDocs, getFilteredDocs, Filter, isDocExists, isCollectionExists, findOne } from "./firestore-operations";

export type FirestoreService<T> = {
    getDoc: (id: string) => Promise<T | undefined>;
    setDoc: (id: string, data: T) => Promise<void>;
    updateDoc: (id: string, data: Partial<T>) => Promise<void>;
    createDoc: (data: Omit<T, "id">) => Promise<void>;
    deleteDoc: (id: string) => Promise<void>;
    getAllDocs: (filter?: { select?: string[], limit?: number }) => Promise<T[]>;
    isDocExists: (id: string) => Promise<boolean>;
    isCollectionExists: () => Promise<boolean>;
    findOne: (filter: { field: string, operator: FirebaseFirestore.WhereFilterOp, value: any }) => Promise<T | undefined>;
    // getFilteredDocs: (filter: Filter) => Promise<T[]>;
};

const createFirestoreService = <T extends DocumentData>(collection: DBCollection, parent?: { subCollection: string, docId: string }): FirestoreService<T> => {
    return {
        getDoc: (id: string) => getDoc<T>(collection, id, parent),
        setDoc: (id: string, data: T) => setDoc(collection, id, data, parent),
        updateDoc: (id: string, data: Partial<T>) => updateDoc(collection, id, data, parent),
        createDoc: (data: Omit<T, "id">) => createDoc(collection, data, parent),
        deleteDoc: (id: string) => deleteDoc(collection, id, parent),
        getAllDocs: (filter?: { select?: string[], limit?: number }) => getAllDocs<T>(collection, filter, parent),
        isDocExists: (id: string) => isDocExists(collection, id, parent),
        isCollectionExists: () => isCollectionExists(collection),
        findOne: (filter: { field: string, operator: FirebaseFirestore.WhereFilterOp, value: any }) => findOne<T>(collection, filter, parent),
        // Got some error here from the pagination
        // getFilteredDocs: (filter: Filter) => getFilteredDocs<T>(collection, filter, parent),
    };
};

export default createFirestoreService;
