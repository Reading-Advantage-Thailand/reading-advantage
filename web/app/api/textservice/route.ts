import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import dotenv from 'dotenv';

dotenv.config();

export const POST = async (req: NextRequest) => {
  const { text } = await req.json();

  try {
    const axiosInstance = axios.create({
      baseURL: "https://texttospeech.googleapis.com/v1",
    });
    const response = await axiosInstance.post(
      "/text:synthesize",
      {
        input: {
          ssml: text,
        },
        voice: {
          languageCode: "en-US",
          name: "en-US-Neural2-C",
        },
        audioConfig: {
          audioEncoding: "OGG_OPUS",
          pitch: 0,
          speakingRate: 1,
        },
      },
      {
        params: {
          key: process.env.API_KEY,
        },
      }
    );
    return NextResponse.json({
      status: "success",
      result: response.data.audioContent,
    });
  } catch (error) {
    return NextResponse.json({
      status: "error from google",
      message: error.message,
    });
  }
};
