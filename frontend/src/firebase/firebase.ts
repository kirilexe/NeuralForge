// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCG6Fv1aghziM58sSmh0vjTrOIm4bUX7TA",
  authDomain: "neuralforge-eff25.firebaseapp.com",
  projectId: "neuralforge-eff25",
  storageBucket: "neuralforge-eff25.appspot.com",
  messagingSenderId: "631335964615",
  appId: "1:631335964615:web:5b5bc53d087bcc49b493e2",
  measurementId: "G-TBX5M2Z91T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, auth, db };