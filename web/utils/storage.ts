import { Storage } from '@google-cloud/storage';

const rawServiceAccount = process.env.SERVICE_ACCOUNT_KEY;
const serviceAcoountKeyJSON = rawServiceAccount ? JSON.parse(rawServiceAccount) : null;
const storage = new Storage({
    projectId: 'reading-advantage',
    ...(serviceAcoountKeyJSON?.private_key && serviceAcoountKeyJSON?.client_email
        ? { credentials: serviceAcoountKeyJSON }
        : {}),
});

export default storage;
