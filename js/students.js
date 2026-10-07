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


let students = [];
let editingStudentId = null;


// ================================
// AUTH
// ================================

onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    loadStudents();
});


// ================================
// ELEMENTS
// ================================

const modal = document.getElementById("studentModal");
const addStudentBtn = document.getElementById("addStudentBtn");
const closeStudentModal = document.getElementById("closeStudentModal");
const cancelStudent = document.getElementById("cancelStudent");

const studentForm = document.getElementById("studentForm");
const studentsTable = document.getElementById("studentsTable");


// ================================
// OPEN MODAL
// ================================

addStudentBtn.addEventListener("click", () => {

    editingStudentId = null;

    studentForm.reset();

    document.getElementById("studentId").value = "";

    document.getElementById("modalTitle").textContent =
        "Add Student";

    document.getElementById("studentMessage").textContent = "";

    modal.classList.add("show");
});


// ================================
// CLOSE MODAL
// ================================

function closeModal() {

    modal.classList.remove("show");

    studentForm.reset();

    editingStudentId = null;
}

closeStudentModal.addEventListener("click", closeModal);

cancelStudent.addEventListener("click", closeModal);


// Click outside modal

modal.addEventListener("click", (event) => {

    if (event.target === modal) {
        closeModal();
    }

});


// ================================
// LOAD STUDENTS
// ================================

async function loadStudents() {

    studentsTable.innerHTML = `
        <tr>
            <td colspan="8" class="empty">
                Loading students...
            </td>
        </tr>
    `;

    try {

        const snapshot = await getDocs(
            collection(db, "students")
        );

        students = [];

        snapshot.forEach((docItem) => {

            students.push({
                id: docItem.id,
                ...docItem.data()
            });

        });

        renderStudents();

    } catch (error) {

        console.error(error);

        studentsTable.innerHTML = `
            <tr>
                <td colspan="8" class="empty">
                    Error loading students
                </td>
            </tr>
        `;
    }
}


// ================================
// RENDER STUDENTS
// ================================

function renderStudents() {

    const search =
        document.getElementById("searchStudent")
        .value
        .toLowerCase();

    const department =
        document.getElementById("departmentFilter")
        .value;

    const section =
        document.getElementById("sectionFilter")
        .value;


    const filtered = students.filter(student => {

        const matchesSearch =
            !search ||
            String(student.studentName || "")
                .toLowerCase()
                .includes(search) ||

            String(student.rollNumber || "")
                .toLowerCase()
                .includes(search) ||

            String(student.registrationNumber || "")
                .toLowerCase()
                .includes(search);


        const matchesDepartment =
            !department ||
            student.department === department;


        const matchesSection =
            !section ||
            student.section === section;


        return (
            matchesSearch &&
            matchesDepartment &&
            matchesSection
        );

    });


    if (filtered.length === 0) {

        studentsTable.innerHTML = `
            <tr>
                <td colspan="8" class="empty">
                    No students found.
                </td>
            </tr>
        `;

        return;
    }


    studentsTable.innerHTML = filtered.map(student => {

        const image = student.imageUrl
            ? `<img src="${escapeHtml(student.imageUrl)}"
                    class="student-photo"
                    onerror="this.src='https://via.placeholder.com/45'">`
            : `<div class="student-placeholder">S</div>`;


        return `
            <tr>

                <td>${image}</td>

                <td>
                    <strong>${escapeHtml(student.studentName || "")}</strong>
                </td>

                <td>${escapeHtml(student.rollNumber || "")}</td>

                <td>${escapeHtml(student.registrationNumber || "-")}</td>

                <td>${escapeHtml(student.department || "-")}</td>

                <td>${escapeHtml(student.semester || "-")}</td>

                <td>${escapeHtml(student.section || "-")}</td>

                <td>

                    <button
                        class="table-btn edit-btn"
                        data-id="${student.id}">
                        Edit
                    </button>

                    <button
                        class="table-btn delete-btn"
                        data-id="${student.id}">
                        Delete
                    </button>

                </td>

            </tr>
        `;

    }).join("");


    document.querySelectorAll(".edit-btn")
        .forEach(button => {

            button.addEventListener("click", () => {

                editStudent(button.dataset.id);

            });

        });


    document.querySelectorAll(".delete-btn")
        .forEach(button => {

            button.addEventListener("click", () => {

                deleteStudent(button.dataset.id);

            });

        });

}


// ================================
// SAVE STUDENT
// ================================

studentForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const message =
        document.getElementById("studentMessage");

    message.textContent = "Saving...";


    const studentData = {

        studentName:
            document.getElementById("studentName").value.trim(),

        rollNumber:
            document.getElementById("rollNumber").value.trim(),

        registrationNumber:
            document.getElementById("registrationNumber").value.trim(),

        dob:
            document.getElementById("dob").value,

        department:
            document.getElementById("department").value.trim(),

        course:
            document.getElementById("course").value.trim(),

        semester:
            document.getElementById("semester").value.trim(),

        section:
            document.getElementById("section").value.trim(),

        session:
            document.getElementById("session").value.trim(),

        gender:
            document.getElementById("gender").value,

        email:
            document.getElementById("email").value.trim(),

        phone:
            document.getElementById("phone").value.trim(),

        imageUrl:
            document.getElementById("imageUrl").value.trim(),

        moreInfo:
            document.getElementById("moreInfo").value.trim(),

        updatedAt: serverTimestamp()

    };


    try {

        if (editingStudentId) {

            await updateDoc(
                doc(db, "students", editingStudentId),
                studentData
            );

            message.textContent =
                "Student updated successfully.";

        } else {

            studentData.createdAt =
                serverTimestamp();

            await addDoc(
                collection(db, "students"),
                studentData
            );

            message.textContent =
                "Student added successfully.";
        }


        await loadStudents();

        setTimeout(() => {

            closeModal();

        }, 700);


    } catch (error) {

        console.error(error);

        message.textContent =
            error.code + ": " + error.message;

    }

});


// ================================
// EDIT STUDENT
// ================================

function editStudent(id) {

    const student =
        students.find(item => item.id === id);

    if (!student) return;

    editingStudentId = id;


    document.getElementById("studentId").value =
        id;

    document.getElementById("studentName").value =
        student.studentName || "";

    document.getElementById("rollNumber").value =
        student.rollNumber || "";

    document.getElementById("registrationNumber").value =
        student.registrationNumber || "";

    document.getElementById("dob").value =
        student.dob || "";

    document.getElementById("department").value =
        student.department || "";

    document.getElementById("course").value =
        student.course || "";

    document.getElementById("semester").value =
        student.semester || "";

    document.getElementById("section").value =
        student.section || "";

    document.getElementById("session").value =
        student.session || "";

    document.getElementById("gender").value =
        student.gender || "";

    document.getElementById("email").value =
        student.email || "";

    document.getElementById("phone").value =
        student.phone || "";

    document.getElementById("imageUrl").value =
        student.imageUrl || "";

    document.getElementById("moreInfo").value =
        student.moreInfo || "";


    document.getElementById("modalTitle").textContent =
        "Edit Student";


    document.getElementById("studentMessage").textContent =
        "";


    modal.classList.add("show");
}


// ================================
// DELETE STUDENT
// ================================

async function deleteStudent(id) {

    const student =
        students.find(item => item.id === id);

    if (!student) return;


    const confirmed = confirm(
        `Delete student "${student.studentName}"?`
    );

    if (!confirmed) return;


    try {

        await deleteDoc(
            doc(db, "students", id)
        );

        await loadStudents();

    } catch (error) {

        console.error(error);

        alert(
            error.code + ": " + error.message
        );
    }
}


// ================================
// SEARCH
// ================================

document
    .getElementById("searchStudent")
    .addEventListener("input", renderStudents);

document
    .getElementById("departmentFilter")
    .addEventListener("change", renderStudents);

document
    .getElementById("sectionFilter")
    .addEventListener("change", renderStudents);


// ================================
// LOGOUT
// ================================

document
    .getElementById("logoutBtn")
    .addEventListener("click", async (event) => {

        event.preventDefault();

        await signOut(auth);

        window.location.href =
            "index.html";
    });


// ================================
// HTML ESCAPE
// ================================

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
