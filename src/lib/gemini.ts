import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
    console.warn("GOOGLE_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

const DEFAULT_MODEL = "gemini-3-pro-preview";

export const getModel = (modelName: string = DEFAULT_MODEL) => {
    return genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
            temperature: 0.7,
        }
    });
};
