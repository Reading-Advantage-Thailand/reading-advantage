import { createVertex } from "@ai-sdk/google-vertex";

const google = createVertex({
  project: process.env.FIREBASE_PROJECT_ID,
  location: "us-central1",
  googleAuthOptions: {
    credentials: {
      client_email: process.env.VERTEX_CLIENT_EMAIL,
      private_key: process.env.VERTEX_PRIVATE_KEY?.replace(/\\n/g, "\n") || "",
    },
  },
});

const googleModelAudio =
  process.env.VERTEX_GEMINI_AUDIO_MODEL || "gemini-2.5-flash-lite";
const googleModel = process.env.VERTEX_GEMINI_MODEL || "gemini-2.5-flash";
const googleFlashThinking =
  process.env.VERTEX_GEMINI_THINKING_MODEL || "gemini-2.5-flash";
const googleImages = "imagen-4.0-generate-001";
const googleProPrewiew = process.env.VERTEX_GEMINI_PRO_MODEL || "gemini-2.5-pro";

export {
  google,
  googleModel,
  googleImages,
  googleFlashThinking,
  googleModelAudio,
  googleProPrewiew,
};
