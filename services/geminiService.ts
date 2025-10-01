// This feature has been temporarily disabled.
// The code for fetching artist bios from the Gemini API has been removed.

/**
 * Fetches a short biography for a given artist using the Gemini API.
 * @param artistName The name of the artist.
 * @returns A promise that resolves to the artist's biography as a string.
 */
export const getArtistBio = async (artistName: string): Promise<string> => {
  return Promise.resolve(`Biographies are temporarily unavailable for ${artistName}.`);
};
