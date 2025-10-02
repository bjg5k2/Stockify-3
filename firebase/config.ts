import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// IMPORTANT: Replace with your actual Firebase configuration values.
// You can get these from your project's settings on the Firebase console.
const firebaseConfig = {
    apiKey: "AIzaSyBF5gzPThKD1ga_zpvtdBpiQFsexbEpZyY",

  authDomain: "stockify-75531.firebaseapp.com",

  projectId: "stockify-75531",

  storageBucket: "stockify-75531.firebasestorage.app",

  messagingSenderId: "831334536771",

  appId: "1:831334536771:web:104b8e8ca4fc2099c826f6"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services for use in other parts of the app
export const db = getFirestore(app);
export const auth = getAuth(app);
