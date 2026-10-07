// ============================================================
// STUDENTS MANAGEMENT SYSTEM
// Firebase Authentication + Firestore
// File: js/students.js
// ============================================================

import { auth, db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";


// ============================================================
// DOM ELEMENTS
// ============================================================

const addStudentBtn = document.getElementById("addStudentBtn");

const studentModal = document.getElementById("studentModal");
const studentForm = document.getElementById("studentForm");

const closeStudentModal = document.getElementById("closeStudentModal");
const cancelStudent = document.getElementById("cancelStudent");

const modalTitle = document.getElementById("modalTitle");
const studentMessage = document.getElementById("studentMessage");

const studentsTable = document.getElementById("studentsTable");

const searchStudent = document.getElementById("searchStudent");
const departmentFilter = document.getElementById("departmentFilter");
const sectionFilter = document.getElementById("sectionFilter");

const logoutBtn = document.getElementById("logoutBtn");


// ============================================================
// STAT ELEMENTS
// ============================================================

const totalStudents = document.getElementById("totalStudents");
const civilStudents = document.getElementById("civilStudents");
const maleStudents = document.getElementById("maleStudents");
const femaleStudents = document.getElementById("femaleStudents");


// ============================================================
// FORM ELEMENTS
// ============================================================

const studentId = document.getElementById("studentId");
const studentName = document.getElementById("studentName");
const rollNumber = document.getElementById("rollNumber");
const registrationNumber = document.getElementById("registrationNumber");
const dob = document.getElementById("dob");
const department = document.getElementById("department");
const course = document.getElementById("course");
const semester = document.getElementById("semester");
const section = document.getElementById("section");
const session = document.getElementById("session");
const gender = document.getElementById("gender");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const imageUrl = document.getElementById("imageUrl");
const moreInfo = document.getElementById("moreInfo");


// ============================================================
// VARIABLES
// ============================================================

let students = [];
let editingStudentId = null;


// ============================================================
// AUTHENTICATION GUARD
// ============================================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "index.html";
        return;

    }

    await loadStudents();

});


// ============================================================
// LOAD STUDENTS FROM FIRESTORE
// ============================================================

async function loadStudents() {

    try {

        showLoading();

        const studentsRef = collection(db, "students");

        const snapshot = await getDocs(studentsRef);

        students = [];

        snapshot.forEach((docSnapshot) => {

            students.push({
                id: docSnapshot.id,
                ...docSnapshot.data()
            });

        });

        // Sort alphabetically by student name
        students.sort((a, b) => {

            const nameA = String(a.name || "").toLowerCase();
            const nameB = String(b.name || "").toLowerCase();

            return nameA.localeCompare(nameB);

        });

        updateStatistics();
        renderStudents();

    } catch (error) {

        console.error("Error loading students:", error);

        studentsTable.innerHTML = `
            <tr>
                <td colspan="8">
                    <div class="student-empty">
                        <div class="student-empty-icon">!</div>
                        <h3>Unable to load students</h3>
                        <p>${escapeHtml(error.message)}</p>
                    </div>
                </td>
            </tr>
        `;

    }

}


// ============================================================
// SHOW LOADING
// ============================================================

function showLoading() {

    studentsTable.innerHTML = `
        <tr>
            <td colspan="8">
                <div class="student-empty">
                    <div class="student-empty-icon">...</div>
                    <h3>Loading students</h3>
                    <p>Please wait while student records are loaded.</p>
                </div>
            </td>
        </tr>
    `;

}


// ============================================================
// UPDATE STATISTICS
// ============================================================

function updateStatistics() {

    totalStudents.textContent = students.length;

    const civilCount = students.filter(student => {

        const dept = String(student.department || "").toLowerCase();

        return (
            dept.includes("civil")
        );

    }).length;

    const maleCount = students.filter(student => {

        return String(student.gender || "").toLowerCase() === "male";

    }).length;

    const femaleCount = students.filter(student => {

        return String(student.gender || "").toLowerCase() === "female";

    }).length;


    civilStudents.textContent = civilCount;
    maleStudents.textContent = maleCount;
    femaleStudents.textContent = femaleCount;

}


// ============================================================
// RENDER STUDENTS
// ============================================================

function renderStudents() {

    const searchValue =
        String(searchStudent.value || "")
            .trim()
            .toLowerCase();

    const departmentValue =
        String(departmentFilter.value || "")
            .trim()
            .toLowerCase();

    const sectionValue =
        String(sectionFilter.value || "")
            .trim()
            .toLowerCase();


    const filteredStudents = students.filter(student => {

        const name =
            String(student.name || "").toLowerCase();

        const roll =
            String(student.roll || "").toLowerCase();

        const registration =
            String(student.registrationNumber || "").toLowerCase();

        const studentDepartment =
            String(student.department || "").toLowerCase();

        const studentSection =
            String(student.section || "").toLowerCase();


        const matchesSearch =
            !searchValue ||
            name.includes(searchValue) ||
            roll.includes(searchValue) ||
            registration.includes(searchValue);


        const matchesDepartment =
            !departmentValue ||
            studentDepartment === departmentValue;


        const matchesSection =
            !sectionValue ||
            studentSection === sectionValue;


        return (
            matchesSearch &&
            matchesDepartment &&
            matchesSection
        );

    });


    // No students
    if (filteredStudents.length === 0) {

        studentsTable.innerHTML = `
            <tr>
                <td colspan="8">
                    <div class="student-empty">

                        <div class="student-empty-icon">
                            ♙
                        </div>

                        <h3>
                            ${
                                students.length === 0
                                    ? "No students found"
                                    : "No matching students"
                            }
                        </h3>

                        <p>
                            ${
                                students.length === 0
                                    ? "Add your first student to begin managing student records."
                                    : "Try changing your search or filter."
                            }
                        </p>

                    </div>
                </td>
            </tr>
        `;

        return;

    }


    studentsTable.innerHTML = filteredStudents.map(student => {

        const id = escapeHtml(student.id);

        const name =
            escapeHtml(student.name || "Unnamed Student");

        const roll =
            escapeHtml(student.roll || "-");

        const registration =
            escapeHtml(student.registrationNumber || "-");

        const studentDepartment =
            escapeHtml(student.department || "-");

        const studentCourse =
            escapeHtml(student.course || "-");

        const studentSemester =
            escapeHtml(student.semester || "-");

        const studentSection =
            escapeHtml(student.section || "-");

        const studentEmail =
            escapeHtml(student.email || "");


        // Student initials
        const initials =
            getInitials(student.name || "Student");


        // Image
        let profileHTML;

        if (student.imageUrl) {

            profileHTML = `
                <img
                    class="student-photo"
                    src="${escapeAttribute(student.imageUrl)}"
                    alt="${name}"
                    loading="lazy"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                >

                <div
                    class="student-photo-placeholder"
                    style="display:none;"
                >
                    ${initials}
                </div>
            `;

        } else {

            profileHTML = `
                <div class="student-photo-placeholder">
                    ${initials}
                </div>
            `;

        }


        return `
            <tr>

                <!-- Student -->
                <td>

                    <div class="student-profile">

                        ${profileHTML}

                        <div>

                            <div class="student-name">
                                ${name}
                            </div>

                            ${
                                studentEmail
                                    ? `
                                        <div class="student-email">
                                            ${studentEmail}
                                        </div>
                                    `
                                    : ""
                            }

                        </div>

                    </div>

                </td>


                <!-- Roll -->
                <td>
                    <strong>${roll}</strong>
                </td>


                <!-- Registration -->
                <td>
                    ${registration}
                </td>


                <!-- Department -->
                <td>

                    <span class="data-badge department-badge">
                        ${studentDepartment}
                    </span>

                </td>


                <!-- Course -->
                <td>
                    ${studentCourse}
                </td>


                <!-- Semester -->
                <td>

                    <span class="data-badge semester-badge">
                        ${studentSemester}
                    </span>

                </td>


                <!-- Section -->
                <td>

                    <span class="data-badge">
                        ${studentSection}
                    </span>

                </td>


                <!-- Actions -->
                <td>

                    <div class="student-actions">

                        <button
                            type="button"
                            class="student-action edit"
                            title="Edit Student"
                            data-action="edit"
                            data-id="${id}"
                        >
                            ✎
                        </button>


                        <button
                            type="button"
                            class="student-action delete"
                            title="Delete Student"
                            data-action="delete"
                            data-id="${id}"
                        >
                            ×
                        </button>

                    </div>

                </td>

            </tr>
        `;

    }).join("");

}


// ============================================================
// ADD STUDENT BUTTON
// ============================================================

addStudentBtn.addEventListener("click", () => {

    editingStudentId = null;

    studentForm.reset();

    studentId.value = "";

    modalTitle.textContent = "Add Student";

    clearMessage();

    openModal();

});


// ============================================================
// OPEN MODAL
// ============================================================

function openModal() {

    studentModal.classList.add("show");

    document.body.style.overflow = "hidden";

}


// ============================================================
// CLOSE MODAL
// ============================================================

function closeModal() {

    studentModal.classList.remove("show");

    document.body.style.overflow = "";

    clearMessage();

}


// ============================================================
// CLOSE BUTTON
// ============================================================

closeStudentModal.addEventListener("click", closeModal);

cancelStudent.addEventListener("click", closeModal);


// ============================================================
// CLICK OUTSIDE MODAL
// ============================================================

studentModal.addEventListener("click", (event) => {

    if (event.target === studentModal) {

        closeModal();

    }

});


// ============================================================
// ESCAPE KEY
// ============================================================

document.addEventListener("keydown", (event) => {

    if (
        event.key === "Escape" &&
        studentModal.classList.contains("show")
    ) {

        closeModal();

    }

});


// ============================================================
// SAVE STUDENT
// ============================================================

studentForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const user = auth.currentUser;

    if (!user) {

        window.location.href = "index.html";
        return;

    }


    // --------------------------------------------------------
    // GET FORM VALUES
    // --------------------------------------------------------

    const nameValue =
        studentName.value.trim();

    const rollValue =
        rollNumber.value.trim();

    const registrationValue =
        registrationNumber.value.trim();

    const dobValue =
        dob.value;

    const departmentValue =
        department.value.trim();

    const courseValue =
        course.value.trim();

    const semesterValue =
        semester.value;

    const sectionValue =
        section.value;

    const sessionValue =
        session.value.trim();

    const genderValue =
        gender.value;

    const emailValue =
        email.value.trim();

    const phoneValue =
        phone.value.trim();

    const imageUrlValue =
        imageUrl.value.trim();

    const moreInfoValue =
        moreInfo.value.trim();


    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!nameValue) {

        showMessage(
            "Please enter the student name.",
            "error"
        );

        studentName.focus();
        return;

    }


    if (!rollValue) {

        showMessage(
            "Please enter the roll number.",
            "error"
        );

        rollNumber.focus();
        return;

    }


    if (!dobValue) {

        showMessage(
            "Please select the student's date of birth.",
            "error"
        );

        dob.focus();
        return;

    }


    if (!departmentValue) {

        showMessage(
            "Please enter the department.",
            "error"
        );

        department.focus();
        return;

    }


    if (!courseValue) {

        showMessage(
            "Please enter the course or class.",
            "error"
        );

        course.focus();
        return;

    }


    if (!semesterValue) {

        showMessage(
            "Please select a semester.",
            "error"
        );

        semester.focus();
        return;

    }


    if (!sessionValue) {

        showMessage(
            "Please enter the academic session.",
            "error"
        );

        session.focus();
        return;

    }


    // --------------------------------------------------------
    // EMAIL VALIDATION
    // --------------------------------------------------------

    if (emailValue) {

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(emailValue)) {

            showMessage(
                "Please enter a valid email address.",
                "error"
            );

            email.focus();
            return;

        }

    }


    // --------------------------------------------------------
    // IMAGE URL VALIDATION
    // --------------------------------------------------------

    if (imageUrlValue) {

        try {

            new URL(imageUrlValue);

        } catch {

            showMessage(
                "Please enter a valid photo URL.",
                "error"
            );

            imageUrl.focus();
            return;

        }

    }


    // --------------------------------------------------------
    // CHECK DUPLICATE ROLL NUMBER
    // --------------------------------------------------------

    const duplicateRoll = students.find(student => {

        if (
            editingStudentId &&
            student.id === editingStudentId
        ) {

            return false;

        }

        return (
            String(student.roll || "")
                .trim()
                .toLowerCase() ===
            rollValue.toLowerCase()
        );

    });


    if (duplicateRoll) {

        showMessage(
            "This roll number already exists.",
            "error"
        );

        rollNumber.focus();
        return;

    }


    // --------------------------------------------------------
    // STUDENT DATA
    // --------------------------------------------------------

    const studentData = {

        name: nameValue,

        roll: rollValue,

        registrationNumber:
            registrationValue,

        dob: dobValue,

        department:
            departmentValue,

        course:
            courseValue,

        semester:
            semesterValue,

        section:
            sectionValue,

        session:
            sessionValue,

        gender:
            genderValue,

        email:
            emailValue,

        phone:
            phoneValue,

        imageUrl:
            imageUrlValue,

        moreInfo:
            moreInfoValue,

        updatedAt:
            serverTimestamp()

    };


    // --------------------------------------------------------
    // DISABLE SUBMIT
    // --------------------------------------------------------

    const submitButton =
        studentForm.querySelector(
            'button[type="submit"]'
        );

    const originalText =
        submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent =
        editingStudentId
            ? "Updating..."
            : "Saving...";


    try {

        // ====================================================
        // UPDATE EXISTING STUDENT
        // ====================================================

        if (editingStudentId) {

            const studentRef =
                doc(
                    db,
                    "students",
                    editingStudentId
                );


            await updateDoc(
                studentRef,
                studentData
            );


            showMessage(
                "Student updated successfully.",
                "success"
            );


        }

        // ====================================================
        // ADD NEW STUDENT
        // ====================================================

        else {

            studentData.createdBy =
                user.uid;

            studentData.createdByEmail =
                user.email || "";

            studentData.createdAt =
                serverTimestamp();


            await addDoc(
                collection(db, "students"),
                studentData
            );


            showMessage(
                "Student added successfully.",
                "success"
            );

        }


        // ----------------------------------------------------
        // REFRESH
        // ----------------------------------------------------

        await loadStudents();


        // ----------------------------------------------------
        // CLOSE AFTER SHORT DELAY
        // ----------------------------------------------------

        setTimeout(() => {

            closeModal();

        }, 700);


    } catch (error) {

        console.error(
            "Error saving student:",
            error
        );


        showMessage(
            getFirebaseErrorMessage(error),
            "error"
        );


    } finally {

        submitButton.disabled = false;

        submitButton.textContent =
            originalText;

    }

});


// ============================================================
// TABLE ACTIONS
// ============================================================

studentsTable.addEventListener("click", async (event) => {

    const button =
        event.target.closest(
            "[data-action]"
        );


    if (!button) {
        return;
    }


    const action =
        button.dataset.action;

    const id =
        button.dataset.id;


    if (!id) {
        return;
    }


    // EDIT
    if (action === "edit") {

        editStudent(id);

    }


    // DELETE
    if (action === "delete") {

        await deleteStudent(id);

    }

});


// ============================================================
// EDIT STUDENT
// ============================================================

function editStudent(id) {

    const student =
        students.find(
            item => item.id === id
        );


    if (!student) {

        showMessage(
            "Student record could not be found.",
            "error"
        );

        return;

    }


    editingStudentId = id;


    // --------------------------------------------------------
    // SET FORM VALUES
    // --------------------------------------------------------

    studentId.value =
        student.id || "";

    studentName.value =
        student.name || "";

    rollNumber.value =
        student.roll || "";

    registrationNumber.value =
        student.registrationNumber || "";

    dob.value =
        student.dob || "";

    department.value =
        student.department || "";

    course.value =
        student.course || "";

    semester.value =
        student.semester || "";

    section.value =
        student.section || "";

    session.value =
        student.session || "";

    gender.value =
        student.gender || "";

    email.value =
        student.email || "";

    phone.value =
        student.phone || "";

    imageUrl.value =
        student.imageUrl || "";

    moreInfo.value =
        student.moreInfo || "";


    modalTitle.textContent =
        "Edit Student";


    clearMessage();

    openModal();

}


// ============================================================
// DELETE STUDENT
// ============================================================

async function deleteStudent(id) {

    const student =
        students.find(
            item => item.id === id
        );


    if (!student) {
        return;
    }


    const studentNameValue =
        student.name ||
        "this student";


    const confirmed =
        confirm(
            `Are you sure you want to delete ${studentNameValue}?\n\nThis action cannot be undone.`
        );


    if (!confirmed) {
        return;
    }


    try {

        const studentRef =
            doc(
                db,
                "students",
                id
            );


        await deleteDoc(
            studentRef
        );


        await loadStudents();


    } catch (error) {

        console.error(
            "Error deleting student:",
            error
        );


        alert(
            getFirebaseErrorMessage(error)
        );

    }

}


// ============================================================
// SEARCH
// ============================================================

searchStudent.addEventListener(
    "input",
    renderStudents
);


// ============================================================
// DEPARTMENT FILTER
// ============================================================

departmentFilter.addEventListener(
    "change",
    renderStudents
);


// ============================================================
// SECTION FILTER
// ============================================================

sectionFilter.addEventListener(
    "change",
    renderStudents
);


// ============================================================
// LOGOUT
// ============================================================

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

            alert(
                "Unable to logout. Please try again."
            );

        }

    }
);


// ============================================================
// MESSAGE
// ============================================================

function showMessage(
    message,
    type = "success"
) {

    studentMessage.textContent =
        message;

    studentMessage.className =
        type;

}


function clearMessage() {

    studentMessage.textContent = "";

    studentMessage.className = "";

}


// ============================================================
// GET INITIALS
// ============================================================

function getInitials(name) {

    const words =
        String(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (words.length === 0) {
        return "S";
    }


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();

}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ============================================================
// ATTRIBUTE ESCAPE
// ============================================================

function escapeAttribute(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

}


// ============================================================
// FIREBASE ERROR MESSAGE
// ============================================================

function getFirebaseErrorMessage(error) {

    if (!error) {
        return "An unknown error occurred.";
    }


    switch (error.code) {

        case "permission-denied":
            return "Permission denied. Check your Firestore security rules.";

        case "unauthenticated":
            return "Your session has expired. Please login again.";

        case "failed-precondition":
            return "The Firestore operation could not be completed.";

        case "network-request-failed":
            return "Network error. Please check your internet connection.";

        case "unavailable":
            return "Firebase is temporarily unavailable. Please try again.";

        default:
            return error.message ||
                "Something went wrong. Please try again.";

    }

}
