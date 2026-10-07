import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDDFTDiHdQEyt-XibymEvRN-juLWSQFs6U",
    authDomain: "student-exam-management-4d9a9.firebaseapp.com",
    projectId: "student-exam-management-4d9a9",
    storageBucket: "student-exam-management-4d9a9.firebasestorage.app",
    messagingSenderId: "932516264162",
    appId: "1:932516264162:web:c6c9f5a1651348d85506bb"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

export {
    app,
    auth,
    db
};
