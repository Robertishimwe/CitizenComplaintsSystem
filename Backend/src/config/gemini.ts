import { env } from './environment';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

export const geminiAiConfig = {
  apiKey: env.GEMINI_API_KEY,
  // You can add model names or other default settings here
  defaultModel: 'gemini-1.0-pro-latest', // Or 'gemini-pro' or other models
  // Safety settings can be configured here, adjust as needed
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
  generationConfig: {
    // temperature: 0.9, // Example: controls randomness
    // topK: 1,       // Example
    // topP: 1,       // Example
    // maxOutputTokens: 2048, // Example
  },
};

// Initialize the GoogleGenerativeAI client
const genAI = new GoogleGenerativeAI(geminiAiConfig.apiKey);

export const generativeModel = genAI.getGenerativeModel({
  model: geminiAiConfig.defaultModel,
  safetySettings: geminiAiConfig.safetySettings,
  generationConfig: geminiAiConfig.generationConfig,
});

// If you need different models for different tasks, you can export them:
/*
export const textModel = genAI.getGenerativeModel({ model: "gemini-pro" });
export const visionModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
*/