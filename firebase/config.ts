import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// Side-effect imports to ensure services are registered.
import 'firebase/auth';
import 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyBF5gzPThKD1ga_zpvtdBpiQFsexbEpZyY",
  authDomain: "stockify-75531.firebaseapp.com",
  projectId: "stockify-75531",
  storageBucket: "stockify-75531.firebasestorage.app",
  messagingSenderId: "831334536771",
  appId: "1:831334536771:web:104b8e8ca4fc2099c826f6"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
} catch (error) {
    console.error("Firebase initialization failed:", error);
    // In a real app, you might want to show an error to the user.
}


export { app, db, auth };