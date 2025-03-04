import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDDm2S1h8p7eic7ywVaQ9bE-g_lHnCcmMw",
  authDomain: "attendance-calci.firebaseapp.com",
  projectId: "attendance-calci",
  storageBucket: "attendance-calci.appspot.com",
  messagingSenderId: "457956560663",
  appId: "1:457956560663:web:339b495c12b41d2e607152",
  measurementId: "G-PF93Z7JTS0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;