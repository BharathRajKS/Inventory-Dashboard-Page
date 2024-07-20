"use strict";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-analytics.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// Your Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyB2UDnE6ULwhaNPlKMJhP5JA4P4KqBL6rw",
    authDomain: "dckap-palli.firebaseapp.com",
    projectId: "dckap-palli",
    storageBucket: "dckap-palli.appspot.com",
    messagingSenderId: "750990472739",
    appId: "1:750990472739:web:7653800be464f70d14e396",
    measurementId: "G-KQ3LEJ717W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
const db = getFirestore(app);

export { db, collection, getDocs, addDoc };
