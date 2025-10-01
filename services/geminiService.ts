import { GoogleGenAI } from "@google/genai";

// Fix: Use process.env.API_KEY without non-null assertion, as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Fetches a short biography for a given artist using the Gemini API.
 * @param artistName The name of the artist.
 * @returns A promise that resolves to the artist's biography as a string.
 */
export const getArtistBio = async (artistName: string): Promise<string> => {
  try {
    const prompt = `Write a short, engaging biography (around 50-70 words) for the musician ${artistName}. Focus on their genre and what makes them unique.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error(`Error fetching artist bio for ${artistName}:`, error);
    return `Could not fetch a biography for ${artistName} at this time. Please try again later.`;
  }
};
