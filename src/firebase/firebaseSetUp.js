// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// .asia-southeast1.firebasedatabase.app
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB9apvjIT6TK3gCaLLEsZG37Pkmh_E3o80",
  authDomain: "typeracer-3ed78.firebaseapp.com",
  projectId: "typeracer-3ed78",
  storageBucket: "typeracer-3ed78.appspot.com",
  messagingSenderId: "848.asia-southeast1.firebasedatabase.app145574417",
  appId: "1:848145574417:web:8f01420467812862299fb0",
  databaseURL:
    "https://typeracer-3ed78-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const fdb = getFirestore(app);
