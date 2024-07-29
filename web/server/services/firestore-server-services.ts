import { DBCollection } from "../models/enum";
import { License, LicenseRecord } from "../models/license";
import { User } from "../models/user";
import createFirestoreService from "./create-firestore-service";

export const userService = createFirestoreService<User>(DBCollection.USERS);

export const licenseService = {
    licenses: createFirestoreService<License>(DBCollection.LICENSES),
    records: (docId: string) => createFirestoreService<LicenseRecord>(DBCollection.LICENSES, docId),
};