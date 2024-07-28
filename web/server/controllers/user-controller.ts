import { getOne, updateOne } from "../handlers/handler-factory";
import { DBCollection } from "../models/enum";

interface RequestContext {
    params: {
        id: string;
    };
}

export const getUser = getOne(DBCollection.USERS);
export const updateUser = updateOne(DBCollection.USERS);
