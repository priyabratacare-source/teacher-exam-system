import { auth, db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";


const totalStudents = document.getElementById("totalStudents");
const totalExams = document.getElementById("totalExams");
const draftExams = document.getElementById("draftExams");
const publishedResults = document.getElementById("publishedResults");

const teacherName = document.getElementById("teacherName");
const teacherEmail = document.getElementById("teacherEmail");
const teacherAvatar = document.getElementById("teacherAvatar");

const instituteName = document.getElementById("instituteName");
const instituteAddress = document.getElementById("instituteAddress");
const instituteContact = document.getElementById("instituteContact");
const instituteWebsite = document.getElementById("instituteWebsite");
const instituteSession = document.getElementById("instituteSession");

const instituteLogo = document.getElementById("instituteLogo");
const defaultInstituteLogo = document.getElementById("defaultInstituteLogo");

const authStatus = document.getElementById("authStatus");
const logoutBtn = document.getElementById("logoutBtn");


/* ================================
   AUTHENTICATION
================================ */

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    teacherEmail.textContent = user.email || "Teacher";

    const firstLetter =
        user.email
            ? user.email.charAt(0).toUpperCase()
            : "T";

    teacherAvatar.textContent = firstLetter;

    teacherName.textContent =
        user.displayName ||
        "Teacher";

    authStatus.textContent = "Authenticated";

    await loadDashboard();

});


/* ================================
   LOAD DASHBOARD
================================ */

async function loadDashboard() {

    try {

        await Promise.all([
            loadStudents(),
            loadExams(),
            loadInstitute()
        ]);

    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );

    }

}


/* ================================
   STUDENTS
================================ */

async function loadStudents() {

    const snapshot =
        await getDocs(
            collection(db, "students")
        );

    totalStudents.textContent =
        snapshot.size;

}


/* ================================
   EXAMS
================================ */

async function loadExams() {

    const snapshot =
        await getDocs(
            collection(db, "exams")
        );

    let total = 0;
    let drafts = 0;
    let published = 0;

    snapshot.forEach((docSnap) => {

        const data = docSnap.data();

        total++;

        if (data.status === "draft") {
            drafts++;
        }

        if (data.status === "published") {
            published++;
        }

    });

    totalExams.textContent = total;
    draftExams.textContent = drafts;
    publishedResults.textContent = published;

}


/* ================================
   INSTITUTE SETTINGS
================================ */

async function loadInstitute() {

    const settingsRef =
        doc(
            db,
            "settings",
            "institute"
        );

    const settingsSnap =
        await getDoc(settingsRef);


    if (!settingsSnap.exists()) {

        instituteName.textContent =
            "Institute Name";

        instituteAddress.textContent =
            "Institute address not configured.";

        return;

    }


    const data =
        settingsSnap.data();


    instituteName.textContent =
        data.name ||
        "Institute Name";


    instituteAddress.textContent =
        data.address ||
        "Institute address not configured.";


    instituteContact.textContent =
        "Contact: " +
        (data.contact || "—");


    instituteWebsite.textContent =
        "Website: " +
        (data.website || "—");


    instituteSession.textContent =
        "Session: " +
        (data.academicSession || "—");


    if (data.logoUrl) {

        instituteLogo.src =
            data.logoUrl;

        instituteLogo.style.display =
            "block";

        defaultInstituteLogo.style.display =
            "none";

    }

}


/* ================================
   LOGOUT
================================ */

logoutBtn.addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

            window.location.href =
                "index.html";

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

        }

    }
);
