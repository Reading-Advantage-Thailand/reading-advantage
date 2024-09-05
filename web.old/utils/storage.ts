import { Storage } from '@google-cloud/storage';

const serviceAcoountKeyJSON = JSON.parse(process.env.SERVICE_ACCOUNT_KEY as string);
const storage = new Storage({
    projectId: 'reading-advantage',
    credentials: serviceAcoountKeyJSON,
});

export default storage;