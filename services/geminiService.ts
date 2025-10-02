import { GoogleGenAI } from "@google/genai";
import { FollowerHistoryPoint } from '../types';

// Fix: Initialize the GoogleGenAI client.
// As per instructions, assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a brief investment analysis for an artist using the Gemini API.
 * @param artistName The name of the artist.
 * @param followerHistory The artist's recent follower history.
 * @returns A string containing the AI-generated analysis.
 */
export const generateArtistInvestmentAnalysis = async (
    artistName: string,
    followerHistory: FollowerHistoryPoint[]
): Promise<string> => {
    if (followerHistory.length < 2) {
        return "Not enough data to perform an analysis.";
    }

    const firstPoint = followerHistory[0];
    const lastPoint = followerHistory[followerHistory.length - 1];
    const followerChange = lastPoint.count - firstPoint.count;
    const percentageChange = firstPoint.count > 0 ? (followerChange / firstPoint.count) * 100 : 0;
    
    const prompt = `
        You are a financial analyst for a fantasy music stock market game called "Stockify". An artist's stock value is tied to their Spotify follower count.
        Analyze the investment potential of the artist "${artistName}" based on the following 30-day follower data:
        - Start followers: ${firstPoint.count.toLocaleString()}
        - Current followers: ${lastPoint.count.toLocaleString()}
        - 30-day change: ${followerChange.toLocaleString()} followers (${percentageChange.toFixed(2)}%)

        Provide a brief, one-paragraph summary (2-3 sentences) of their recent performance and potential outlook for a player of the game.
        Be concise and use encouraging but neutral financial-style language suitable for a game.
        Do not give direct financial advice. Do not use markdown formatting.
        Example: "${artistName} has shown significant momentum, with a follower increase of X%. This strong upward trend suggests growing popularity, which could translate to further value appreciation. Investors might see this as a positive signal, though market trends can always shift."
    `;

    try {
        // Fix: Call the Gemini API to generate content.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        // Fix: Return the text from the response.
        return response.text;
    } catch (error) {
        console.error("Error generating artist analysis with Gemini:", error);
        return "Could not generate AI analysis at this time.";
    }
};
