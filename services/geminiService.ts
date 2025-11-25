import { GoogleGenAI, Type } from "@google/genai";
import { AIRecommendation } from "../types";

// Helper to check if API key exists without crashing
const getApiKey = () => {
  try {
    return process.env.API_KEY;
  } catch (e) {
    return null;
  }
};

export const getRecommendations = async (seenTitles: string[], language: string = 'en'): Promise<AIRecommendation[]> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("Gemini API Key not found in environment.");
    return [
      { title: "No API Key", reason: "Please configure process.env.API_KEY to use AI features." }
    ];
  }

  if (seenTitles.length === 0) {
    return [];
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `I have seen and liked these movies/shows: ${seenTitles.join(", ")}. 
      Recommend 5 distinct, similar movies or TV shows that I might like. 
      For each recommendation, provide the title and a very short, punchy reason why (max 10 words).
      IMPORTANT: Respond in ${language === 'fr' ? 'French' : 'English'}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ["title", "reason"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    
    const recommendations = JSON.parse(jsonText) as AIRecommendation[];
    return recommendations;

  } catch (error) {
    console.error("Gemini recommendation error:", error);
    return [];
  }
};