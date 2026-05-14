import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAIob2jE60wTRYRWyxHECIs0PpZ86PWUxs",
  authDomain: "diploma-assistant.firebaseapp.com",
  projectId: "diploma-assistant",
  storageBucket: "diploma-assistant.firebasestorage.app",
  messagingSenderId: "4110769327",
  appId: "1:4110769327:web:de51a088ccff703d8e485a",
  measurementId: "G-K87QJQZ98M"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)