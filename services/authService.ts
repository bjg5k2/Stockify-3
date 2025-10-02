import {
    createUserWithEmailAndPassword as _createUserWithEmailAndPassword,
    signInWithEmailAndPassword as _signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile,
    User,
    UserCredential
} from 'firebase/auth';
import { auth } from '../firebase/config';

/**
 * Listens for changes to the user's authentication state.
 * @param callback The function to call with the user object or null.
 */
export const onAuthStateListener = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

/**
 * Signs out the current user.
 */
export const signOutUser = (): Promise<void> => {
    return signOut(auth);
};

/**
 * Signs in a user with their email and password.
 * @param email The user's email.
 * @param password The user's password.
 */
export const signInWithEmailAndPassword = (email: string, password: string): Promise<UserCredential> => {
    return _signInWithEmailAndPassword(auth, email, password);
};

/**
 * Creates a new user account with email, password, and display name.
 * After creation, it updates the user's profile with the display name.
 * @param email The new user's email.
 * @param password The new user's password.
 * @param displayName The new user's display name.
 */
export const signUpWithEmailAndPassword = async (email: string, password: string, displayName: string): Promise<UserCredential> => {
    const userCredential = await _createUserWithEmailAndPassword(auth, email, password);
    // After creating the user, update their profile with the display name
    if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
    }
    return userCredential;
};
