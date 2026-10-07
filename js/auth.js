import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const loginForm = document.getElementById("loginForm");

const message = document.getElementById("loginMessage");

onAuthStateChanged(auth, (user) => {

    if (user) {

        window.location.href = "dashboard.html";

    }

});

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    message.textContent = "Signing in...";

    message.className = "message";

    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        message.textContent =
            "Login successful.";

        window.location.href =
            "dashboard.html";

    } catch (error) {

        console.error(error);

        message.textContent =
            getFirebaseError(error.code);

        message.className =
            "message error";

    }

});

function getFirebaseError(code) {

    switch (code) {

        case "auth/invalid-credential":
            return "Invalid email or password.";

        case "auth/user-not-found":
            return "Teacher account not found.";

        case "auth/wrong-password":
            return "Incorrect password.";

        case "auth/too-many-requests":
            return "Too many attempts. Try again later.";

        default:
            return "Unable to login. Please try again.";

    }

}
