// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "@firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "biterush-c5767.firebaseapp.com",
  projectId: "biterush-c5767",
  storageBucket: "biterush-c5767.firebasestorage.app",
  messagingSenderId: "600485739695",
  appId: "1:600485739695:web:84d9b4edcb7d609092e85a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);