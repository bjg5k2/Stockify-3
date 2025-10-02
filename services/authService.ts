import { auth } from '../firebase/config';
import { 
    createUserWithEmailAndPassword, 
    // Fix: Alias the 'signInWithEmailAndPassword' import to avoid a name collision with the wrapper function below.
    signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile,
    User
} from 'firebase/auth';

export const signUpWithEmailAndPassword = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    return userCredential;
};

export const signInWithEmailAndPassword = (email: string, password: string) => {
    // Fix: Call the aliased Firebase function instead of the local wrapper to prevent recursion and pass the correct arguments.
    return firebaseSignInWithEmailAndPassword(auth, email, password);
};

export const signOutUser = () => {
    return signOut(auth);
};

export const onAuthStateListener = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};