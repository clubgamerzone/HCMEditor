import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDgBHtCYJq9LAGgnzLYBDRK2oAWrddiFCU",
  authDomain: "hell-cemetery-metroidvania-990.firebaseapp.com",
  databaseURL: "https://hell-cemetery-metroidvania-990-default-rtdb.firebaseio.com",
  projectId: "hell-cemetery-metroidvania-990",
  storageBucket: "hell-cemetery-metroidvania-990.firebasestorage.app",
  messagingSenderId: "818221927383",
  appId: "1:818221927383:web:4e35ef341afb2e64b71992",
  measurementId: "G-FWHG3987CG",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
