import { doc, setDoc, getDoc, updateDoc, DocumentData } from "firebase/firestore"; 
import { db } from "../firebase/config";
import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile, Investment, FollowerHistoryPoint } from '../types';

const INITIAL_CREDITS = 10000;

/**
 * Creates a new user profile document in Firestore after sign-up.
 * @param user The Firebase user object.
 * @param additionalData Additional data like displayName.
 */
export const createUserProfile = async (user: FirebaseUser, additionalData: { displayName: string }) => {
  const userRef = doc(db, "users", user.uid);
  const { email, uid } = user;
  const { displayName } = additionalData;

  const newUserProfile: UserProfile = {
    uid,
    email,
    displayName,
    credits: INITIAL_CREDITS,
    investments: [],
    netWorth: INITIAL_CREDITS,
    netWorthHistory: [{ timestamp: Date.now(), count: INITIAL_CREDITS }]
  };

  try {
    await setDoc(userRef, newUserProfile);
  } catch (error) {
    console.error("Error creating user profile in Firestore: ", error);
  }
};

/**
 * Retrieves a user's profile from Firestore.
 * @param uid The user's unique ID.
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, "users", uid);
  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    } else {
      console.warn("No such user profile in Firestore!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile: ", error);
    return null;
  }
};

/**
 * Updates a user's profile in Firestore.
 * @param uid The user's unique ID.
 * @param data The data to update.
 */
export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, "users", uid);
  try {
    await updateDoc(userRef, data);
  } catch (error) {
    console.error("Error updating user profile: ", error);
  }
};