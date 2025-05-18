"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generativeModel = exports.geminiAiConfig = void 0;
const environment_1 = require("./environment");
const generative_ai_1 = require("@google/generative-ai");
exports.geminiAiConfig = {
    apiKey: environment_1.env.GEMINI_API_KEY,
    // You can add model names or other default settings here
    defaultModel: 'gemini-2.0-flash', // Or 'gemini-pro' or other models
    // Safety settings can be configured here, adjust as needed
    safetySettings: [
        {
            category: generative_ai_1.HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: generative_ai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: generative_ai_1.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: generative_ai_1.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
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
const genAI = new generative_ai_1.GoogleGenerativeAI(exports.geminiAiConfig.apiKey);
exports.generativeModel = genAI.getGenerativeModel({
    model: exports.geminiAiConfig.defaultModel,
    safetySettings: exports.geminiAiConfig.safetySettings,
    generationConfig: exports.geminiAiConfig.generationConfig,
});
// If you need different models for different tasks, you can export them:
/*
export const textModel = genAI.getGenerativeModel({ model: "gemini-pro" });
export const visionModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
*/ 
