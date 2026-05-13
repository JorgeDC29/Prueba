import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyApjzN2V4Y56BJ6LXV_oXYZvMd5dIhkHyg",
  authDomain: "prueba-61b62.firebaseapp.com",
  databaseURL: "https://prueba-61b62-default-rtdb.firebaseio.com",
  projectId: "prueba-61b62",
  storageBucket: "prueba-61b62.firebasestorage.app",
  messagingSenderId: "273758770050",
  appId: "1:273758770050:web:3589c9768ea6dbdcc6f59b",
  measurementId: "G-XHS5VZNC20"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
