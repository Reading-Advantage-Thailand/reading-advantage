import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();
const serviceAccount = { "type": "service_account", "project_id": "reading-advantage", "private_key_id": "027dd975e3d283196884a850a6cc418823d26160", "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDD8iGTtJ3HQl5Z\nD+mCum2eBaWlBkdMLuvzjySKZ4gPEpOuAPLW26nx7YxoagPARzO4N2kwVZP8pM+4\nmQBzZesVUac44kojel/RhXEQLIjT9crfLLHZKVkYOiCRbnpU47ce9G9mmVxEDwKm\nVhmJby2uc45eewxiJRhcxeabZYE3Ti0ZxrW4NdEN3AvHKPe1I9K9oWkA/UC++LFV\nLuY1O7ZgdZYrF4QusGVO8W7SBZQPqK8l1udktbxITRiz1VfU4gy34hW4Cy0wSM5T\nuw6tjIEXt5HsIetD79rSeVfac1XAimZwWf2vwztmrCnFHF7xGCN9zxJ4cQV9zOrR\n5rFI5oyPAgMBAAECggEAX2QkJoU6foP37IHLm2Ho9ZIoNvOciCEbq0HXdy251iSk\nEoTRs/nSfT25KifaVaQUMK2BHw+6cLdHjMWnq4ZFcOaEczPvBeCQfy7ogQg9QHsb\nXZSjrGXtwtahfkt7cJI/VumGxjsI6PUpxBKMchTW92O4PpTGzYzjlF6fyq0av/IL\nJql7pXbnXDgASC9iZNiEucT69Ibp6aDpt2GL3WKDz8WoxQ/Z6yf526HIKxQpB0+i\n5nMCFAnMFk8nXoNEHXeVncu7MJbEM6nyndj1W/Q546UjVyptlY5ypmcq7BJ+dPz4\nVhOHhnnJDEavtb86PlqHmdeycgibr1qjc+yEjLPNYQKBgQD0j+3L7ifN7SdXcbYF\nbv1vW5aW1vPmKjCR4JjGNdqdP3svgi5RV1Dlez4GUsBhgGmvllgB/EUlbSST+txV\nsx/2oSgafZWI3G3Eg+TX2WK0tVozavQScpt0fA4li9lkqO3ByMsJvaQCNPlh/lVb\nLmMzywAAzaOTu8Ysh4dKT0vQ3wKBgQDNHCHtctTV/BkqqufGzqC5CwCRl6rD+D8U\nzjHAx4nZfVYoNnAoz7w25s70oFNoJZlgfNMyu7Ac5KYFiBgxHxrMBp6xRS4BxP+R\ni2GFp82Kr6yMX9V9ml/Q5SXeO0TDwPedWjvir78V+BTY/ftWjcBaxfvAWRJKf2bm\n/7YUbJdKUQKBgCjUAnICL1j8l43MqQOdNOgrVSeXeR5ausMPyNGGWhnYaDtVM2BX\nAGVfPsqVdBKS+pHaupSSRgTqhKnDvpb8EYD+BJDvmFBB5H1jO4ghfY4HnKhq2ZZe\n1b8Lmtz/zOo2HYM1f1f/9ep8Z4nJiPxw8RTLdhOsQPu/5GS4t4hbVp/nAoGBAIAb\ncyFgmIiydXGN30fv5LjOo2NMDG9sDNJM2wxiVLoPq5FgNvt2jELqNBbcUFv7J+n4\n7NyCF8RkF0HbN+juWYlXFST5ZXvbdBiOqrGVFi7p/GaMsMZLdk794IIGGLP/QWj5\nY+/4/uuU0EibkbEExkCr6crAl0kKe9YJnsrw7CmRAoGAf5TrQT6Shj7bToa357ix\n+DU3vQ/I3BMooEIPfYi/hh5ojYGofb/qZzX+Mf5zkozxKgENYU+6u6Gxgj1teG/V\nmG+ZLlBzzmrNlOvQZhs4I4DZLQyZbVlfMfv6o2d8NRAEPFq3k7YjbNr/7jkPbZoR\nxBZ7VcLbn4AhtXODIs4nEyY=\n-----END PRIVATE KEY-----\n", "client_email": "database@reading-advantage.iam.gserviceaccount.com", "client_id": "115456246442999264380", "auth_uri": "https://accounts.google.com/o/oauth2/auth", "token_uri": "https://oauth2.googleapis.com/token", "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs", "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/database%40reading-advantage.iam.gserviceaccount.com", "universe_domain": "googleapis.com" }

// Check if the app has already been initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
}

const db = admin.firestore();

export default db;
