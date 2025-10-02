
// Fix: Provide content for the geminiService.ts file.
import { GoogleGenAI } from "@google/genai";
import { Artist } from "../types";

// As per instructions, the API key MUST be obtained exclusively from process.env.API_KEY.
// The build environment (Vite) is expected to make this variable available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateArtistInsight = async (artist: Artist): Promise<string> => {
    if (!process.env.API_KEY) {
        return "Gemini API key not configured. AI-powered insights are unavailable.";
    }

    try {
        const followerHistory = artist.followerHistory.map(p => Math.round(p.count / 1000) + 'k').join(', ');
        const prompt = `
            You are a financial analyst for a music fantasy stock market game called "Stockify".
            Your task is to provide a brief, insightful summary (2-3 sentences) about an artist's stock potential based on their Spotify follower data.

            Artist: ${artist.name}
            Current Followers: ${artist.followers.toLocaleString()}
            Recent 30-Day Follower Trend (simplified): [${followerHistory}]

            Analyze the data. Comment on the artist's recent growth trajectory. Is their popularity stable, showing strong growth, or declining? What does this suggest for a potential investor in the game? Be concise and use financial-style language.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        // Use the .text property to extract the response, as per guidelines.
        return response.text;
    } catch (error) {
        console.error("Error generating artist insight with Gemini:", error);
        return "Could not generate AI insight at this time due to an API error.";
    }
};
