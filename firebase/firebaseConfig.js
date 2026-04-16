import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "lrcsheetmobile.firebaseapp.com",
  databaseURL: "...",
  projectId: "lrcsheetmobile",
  storageBucket: "lrcsheetmobile.firebasestorage.app",
  messagingSenderId: "239069891450",
  appId: "1:239069891450:web:533039010fc1189bb824c3",
  measurementId: "G-PNS4WDS2XK",
};

const app = initializeApp(firebaseConfig);

// ✅ NE PAS initialiser messaging côté serveur
export const getFirebaseMessaging = () => {
  if (typeof window !== "undefined") {
    return getMessaging(app);
  }
  return null;
};