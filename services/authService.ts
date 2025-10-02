import { auth } from '../firebase/config';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

let isSigningIn = false;
let authInitialized = false;

// Monitor auth state to check if we've already initialized.
onAuthStateChanged(auth, (user) => {
    if (user) {
        authInitialized = true;
    }
});

/**
 * Signs in the user anonymously if they are not already signed in.
 * This ensures each user has a stable, unique ID for the leaderboard.
 */
export const signInAnonymouslyIfNeeded = async () => {
    // Wait a moment for the initial auth state to be loaded
    await new Promise(resolve => setTimeout(resolve, 50));
    
    if (auth.currentUser || isSigningIn || authInitialized) {
        return;
    }

    isSigningIn = true;
    try {
        await signInAnonymously(auth);
        console.log("Signed in anonymously");
    } catch (error) {
        console.error("Error signing in anonymously: ", error);
    } finally {
        isSigningIn = false;
    }
};