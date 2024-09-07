// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDv_3UZT9OhEDM2zg2nkT5338W6uXE-4Ms",
  authDomain: "narc-9ebc2.firebaseapp.com",
  projectId: "narc-9ebc2",
  storageBucket: "narc-9ebc2.appspot.com",
  messagingSenderId: "181479348290",
  appId: "1:181479348290:web:f558be37bda916f881f5db",
  measurementId: "G-Q99G2621YH"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
const analytics = getAnalytics(app);
