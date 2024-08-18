import { Article, ArticleMCQuestion, ArticleSAQuestion } from "../models/article";
import { DBCollection } from "../models/enum";
import { License, LicenseRecord } from "../models/license";
import { User } from "../models/user";
import createFirestoreService from "./create-firestore-service";

export const userService = {
    users: createFirestoreService<User>(DBCollection.USERS),
    articleRecords: (docId: string) => createFirestoreService<User>(DBCollection.USERS, { subCollection: DBCollection.USERS_ARTICLE_RECORDS, docId }),
}

export const licenseService = {
    licenses: createFirestoreService<License>(DBCollection.LICENSES),
    records: (docId: string) => createFirestoreService<LicenseRecord>(DBCollection.LICENSES, { subCollection: DBCollection.LICENSE_RECORDS, docId }),
};

export const articleService = {
    articles: createFirestoreService<Article>(DBCollection.NEWARTICLES),
    mcqs: (docId: string) => createFirestoreService<ArticleMCQuestion>(DBCollection.NEWARTICLES, { subCollection: DBCollection.NEWARTICLES_MC, docId }),
    saqs: (docId: string) => createFirestoreService<ArticleSAQuestion>(DBCollection.NEWARTICLES, { subCollection: DBCollection.NEWARTICLES_SA, docId }),
    laqs: (docId: string) => createFirestoreService<ArticleSAQuestion>(DBCollection.NEWARTICLES, { subCollection: DBCollection.NEWARTICLES_LA, docId }),
};