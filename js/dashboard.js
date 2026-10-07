import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


const teacherEmail =
    document.getElementById("teacherEmail");

const studentCount =
    document.getElementById("studentCount");

const instituteName =
    document.getElementById("instituteName");


onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "index.html";

        return;

    }

    teacherEmail.textContent =
        user.email;

    await loadStudentCount();

    await loadInstitute();

});


async function loadStudentCount() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "students")
            );

        studentCount.textContent =
            snapshot.size;

    } catch (error) {

        console.error(
            "Student count error:",
            error
        );

    }

}


async function loadInstitute() {

    try {

        const ref =
            doc(
                db,
                "settings",
                "institute"
            );

        const snapshot =
            await getDoc(ref);

        if (snapshot.exists()) {

            const data =
                snapshot.data();

            if (data.name) {

                instituteName.textContent =
                    data.name;

            }

        }

    } catch (error) {

        console.error(
            "Institute settings error:",
            error
        );

    }

}


document
    .getElementById("logoutBtn")
    .addEventListener("click", async () => {

        await signOut(auth);

        window.location.href =
            "index.html";

    });
