import { auth, db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";


let subjects = [];


// ================================
// AUTH
// ================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href =
            "index.html";

        return;
    }

    loadExams();

});


// ================================
// ELEMENTS
// ================================

const addSubjectBtn =
    document.getElementById("addSubjectBtn");

const subjectsContainer =
    document.getElementById("subjectsContainer");

const examForm =
    document.getElementById("examForm");

const examMessage =
    document.getElementById("examMessage");


// ================================
// ADD SUBJECT
// ================================

addSubjectBtn.addEventListener(
    "click",
    addSubject
);


function addSubject() {

    subjects.push({

        id: Date.now(),

        subjectName: "",

        subjectCode: "",

        fullMarks: 100,

        passMarks: 40,

        mandatory: true,

        bestOf: false

    });


    renderSubjects();

}


// ================================
// RENDER SUBJECTS
// ================================

function renderSubjects() {

    if (subjects.length === 0) {

        subjectsContainer.innerHTML = `

            <div class="empty-subjects">

                No subjects added yet.

                <br>

                Click
                <strong>+ Add Subject</strong>
                to add one.

            </div>

        `;

        return;

    }


    subjectsContainer.innerHTML =
        subjects.map((subject, index) => `

        <div
            class="subject-card"
            data-index="${index}">

            <div class="subject-card-header">

                <div>

                    <h3>
                        Subject ${index + 1}
                    </h3>

                    <span>
                        Subject configuration
                    </span>

                </div>


                <button
                    type="button"
                    class="remove-subject"
                    data-index="${index}">

                    Remove

                </button>

            </div>


            <div class="form-grid">

                <div class="form-group">

                    <label>
                        Subject Name *
                    </label>

                    <input
                        type="text"
                        class="subject-name"
                        data-index="${index}"
                        value="${escapeHtml(subject.subjectName)}"
                        placeholder="Example: Engineering Mathematics"
                        required>

                </div>


                <div class="form-group">

                    <label>
                        Subject Code *
                    </label>

                    <input
                        type="text"
                        class="subject-code"
                        data-index="${index}"
                        value="${escapeHtml(subject.subjectCode)}"
                        placeholder="Example: MATH101"
                        required>

                </div>


                <div class="form-group">

                    <label>
                        Full Marks *
                    </label>

                    <input
                        type="number"
                        class="full-marks"
                        data-index="${index}"
                        min="1"
                        value="${subject.fullMarks}"
                        required>

                </div>


                <div class="form-group">

                    <label>
                        Pass Marks *
                    </label>

                    <input
                        type="number"
                        class="pass-marks"
                        data-index="${index}"
                        min="0"
                        value="${subject.passMarks}"
                        required>

                </div>


                <div class="form-group">

                    <label>
                        Mandatory?
                    </label>

                    <select
                        class="mandatory"
                        data-index="${index}">

                        <option
                            value="true"
                            ${subject.mandatory ? "selected" : ""}>

                            YES

                        </option>

                        <option
                            value="false"
                            ${!subject.mandatory ? "selected" : ""}>

                            NO

                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label>
                        Best-of?
                    </label>

                    <select
                        class="best-of"
                        data-index="${index}">

                        <option
                            value="false"
                            ${!subject.bestOf ? "selected" : ""}>

                            NO

                        </option>

                        <option
                            value="true"
                            ${subject.bestOf ? "selected" : ""}>

                            YES

                        </option>

                    </select>

                </div>

            </div>

        </div>

    `).join("");


    attachSubjectEvents();

}


// ================================
// SUBJECT EVENTS
// ================================

function attachSubjectEvents() {


    document
        .querySelectorAll(".remove-subject")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const index =
                        Number(button.dataset.index);

                    subjects.splice(index, 1);

                    renderSubjects();

                }
            );

        });


    document
        .querySelectorAll(".subject-name")
        .forEach(input => {

            input.addEventListener(
                "input",
                () => {

                    subjects[
                        Number(input.dataset.index)
                    ].subjectName =
                        input.value;

                }
            );

        });


    document
        .querySelectorAll(".subject-code")
        .forEach(input => {

            input.addEventListener(
                "input",
                () => {

                    subjects[
                        Number(input.dataset.index)
                    ].subjectCode =
                        input.value;

                }
            );

        });


    document
        .querySelectorAll(".full-marks")
        .forEach(input => {

            input.addEventListener(
                "input",
                () => {

                    subjects[
                        Number(input.dataset.index)
                    ].fullMarks =
                        Number(input.value);

                }
            );

        });


    document
        .querySelectorAll(".pass-marks")
        .forEach(input => {

            input.addEventListener(
                "input",
                () => {

                    subjects[
                        Number(input.dataset.index)
                    ].passMarks =
                        Number(input.value);

                }
            );

        });


    document
        .querySelectorAll(".mandatory")
        .forEach(input => {

            input.addEventListener(
                "change",
                () => {

                    subjects[
                        Number(input.dataset.index)
                    ].mandatory =
                        input.value === "true";

                }
            );

        });


    document
        .querySelectorAll(".best-of")
        .forEach(input => {

            input.addEventListener(
                "change",
                () => {

                    subjects[
                        Number(input.dataset.index)
                    ].bestOf =
                        input.value === "true";

                }
            );

        });

}


// ================================
// SAVE EXAM
// ================================

examForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if (subjects.length === 0) {

            examMessage.textContent =
                "Please add at least one subject.";

            examMessage.className =
                "message error";

            return;

        }


        // Validate subjects

        for (const subject of subjects) {

            if (
                !subject.subjectName.trim() ||
                !subject.subjectCode.trim()
            ) {

                examMessage.textContent =
                    "Please enter subject name and subject code.";

                examMessage.className =
                    "message error";

                return;

            }


            if (
                subject.passMarks >
                subject.fullMarks
            ) {

                examMessage.textContent =
                    `Pass marks cannot be greater than full marks for ${subject.subjectName}.`;

                examMessage.className =
                    "message error";

                return;

            }

        }


        const examData = {

            examName:
                document.getElementById("examName")
                    .value.trim(),

            course:
                document.getElementById("examCourse")
                    .value.trim(),

            department:
                document.getElementById("examDepartment")
                    .value.trim(),

            semester:
                document.getElementById("examSemester")
                    .value.trim(),

            section:
                document.getElementById("examSection")
                    .value.trim(),

            academicSession:
                document.getElementById("examSession")
                    .value.trim(),

            subjects: subjects,

            status: "draft",

            createdBy:
                auth.currentUser.uid,

            createdByEmail:
                auth.currentUser.email,

            createdAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()

        };


        examMessage.textContent =
            "Saving exam...";

        examMessage.className =
            "message";


        try {

            await addDoc(
                collection(db, "exams"),
                examData
            );


            examMessage.textContent =
                "Exam created successfully as Draft.";

            examMessage.className =
                "message success";


            examForm.reset();

            subjects = [];

            renderSubjects();

            await loadExams();


        } catch (error) {

            console.error(error);

            examMessage.textContent =
                error.code + ": " +
                error.message;

            examMessage.className =
                "message error";

        }

    }
);


// ================================
// LOAD EXAMS
// ================================

async function loadExams() {

    const examList =
        document.getElementById("examList");


    try {

        const snapshot =
            await getDocs(
                collection(db, "exams")
            );


        if (snapshot.empty) {

            examList.innerHTML = `
                <div class="empty">
                    No exams created yet.
                </div>
            `;

            return;

        }


        let exams = [];

        snapshot.forEach(item => {

            exams.push({

                id: item.id,

                ...item.data()

            });

        });


        exams.sort(
            (a, b) => {

                const aTime =
                    a.createdAt?.seconds || 0;

                const bTime =
                    b.createdAt?.seconds || 0;

                return bTime - aTime;

            }
        );


        examList.innerHTML =
            exams.map(exam => `

            <div class="exam-item">

                <div>

                    <h3>
                        ${escapeHtml(
                            exam.examName || "Unnamed Exam"
                        )}
                    </h3>

                    <p>

                        ${escapeHtml(
                            exam.course || ""
                        )}

                        •

                        ${escapeHtml(
                            exam.department || ""
                        )}

                        •

                        ${escapeHtml(
                            exam.semester || ""
                        )}

                    </p>

                    <small>

                        ${exam.subjects?.length || 0}
                        Subjects

                    </small>

                </div>


                <span class="status-badge draft">

                    DRAFT

                </span>

            </div>

        `).join("");


    } catch (error) {

        console.error(error);

        examList.innerHTML = `

            <div class="empty">

                Unable to load exams.

                <br>

                ${escapeHtml(error.message)}

            </div>

        `;

    }

}


// ================================
// LOGOUT
// ================================

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        async (event) => {

            event.preventDefault();

            await signOut(auth);

            window.location.href =
                "index.html";

        }
    );


// ================================
// ESCAPE HTML
// ================================

function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
