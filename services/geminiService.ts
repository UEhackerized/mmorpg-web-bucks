import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
// The API key is safely retrieved from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getNpcResponse = async (playerInput: string, npcName: string): Promise<string> => {
  try {
    const modelId = "gemini-2.5-flash";
    const systemInstruction = `You are ${npcName}, a character in a fantasy MMORPG called 'Metin2 Web Legacy'. 
    Speak in an archaic, somewhat stern but helpful fantasy tone. Keep responses concise (under 50 words).
    You are the Village Guard. You protect the village from Wild Dogs and Metin Stones.
    Encourage the player to hunt Wild Dogs to reach level 2.
    If the player asks about the 'Metin Stones', explain they are cursed meteors corrupting the land.`;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: playerInput,
      config: {
        systemInstruction: systemInstruction,
        maxOutputTokens: 100,
      }
    });

    return response.text || "...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The spirits are silent today... (API Error)";
  }
};
