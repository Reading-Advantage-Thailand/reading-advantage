import { DBCollection } from "../models/enum";
import { User } from "../models/user";
import createFirestoreService from "./create-firestore-service";

export const userService = createFirestoreService<User>(DBCollection.USERS);
