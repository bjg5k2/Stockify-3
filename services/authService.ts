const USER_KEY = 'stockify_username';

export const saveUsername = (username: string): void => {
  try {
    localStorage.setItem(USER_KEY, username);
  } catch (error) {
    console.error("Could not save username to localStorage", error);
  }
};

export const getUsername = (): string | null => {
  try {
    return localStorage.getItem(USER_KEY);
  } catch (error) {
    console.error("Could not retrieve username from localStorage", error);
    return null;
  }
};

export const signOut = (): void => {
  try {
    localStorage.removeItem(USER_KEY);
    // Also clear other game-related data if necessary
    localStorage.removeItem('stockify_user_data');
    localStorage.removeItem('stockify_artists_data');

  } catch (error) {
    console.error("Could not sign out user from localStorage", error);
  }
};
