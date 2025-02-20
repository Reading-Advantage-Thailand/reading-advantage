import { google } from "googleapis";

// Configure OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.CLASSROOM_CLIENT_ID,
  process.env.CLASSROOM_CLIENT_SECRET,
  process.env.CLASSROOM_REDIRECT_URI_STUDENT
);

export const SCOPE = [
  "https://www.googleapis.com/auth/classroom.courses",
  "https://www.googleapis.com/auth/classroom.coursework.me",
  "https://www.googleapis.com/auth/classroom.coursework.students",
  "https://www.googleapis.com/auth/classroom.courseworkmaterials",
  "https://www.googleapis.com/auth/classroom.rosters",
  "https://www.googleapis.com/auth/classroom.topics",
  "https://www.googleapis.com/auth/classroom.profile.emails",
  "https://www.googleapis.com/auth/classroom.profile.photos",
];

export default oauth2Client;
