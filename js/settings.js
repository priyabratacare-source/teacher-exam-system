import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


const form =
    document.getElementById(
        "settingsForm"
    );


onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href =
            "index.html";

        return;

    }

    await loadSettings();

});


async function loadSettings() {

    try {

        const ref =
            doc(
                db,
                "settings",
                "institute"
            );

        const snapshot =
            await getDoc(ref);


        if (!snapshot.exists())
            return;


        const data =
            snapshot.data();


        setValue(
            "instituteName",
            data.name
        );

        setValue(
            "instituteAddress",
            data.address
        );

        setValue(
            "city",
            data.city
        );

        setValue(
            "state",
            data.state
        );

        setValue(
            "contact",
            data.contact
        );

        setValue(
            "website",
            data.website
        );

        setValue(
            "logoUrl",
            data.logoUrl
        );

        setValue(
            "principal",
            data.principal
        );

        setValue(
            "academicSession",
            data.academicSession
        );


        updateLogoPreview();

    } catch (error) {

        console.error(error);

    }

}


form.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();


        const message =
            document.getElementById(
                "settingsMessage"
            );


        const data = {

            name:
                getValue("instituteName"),

            address:
                getValue("instituteAddress"),

            city:
                getValue("city"),

            state:
                getValue("state"),

            contact:
                getValue("contact"),

            website:
                getValue("website"),

            logoUrl:
                getValue("logoUrl"),

            principal:
                getValue("principal"),

            academicSession:
                getValue("academicSession"),

            updatedAt:
                serverTimestamp()

        };


        message.textContent =
            "Saving settings...";


        try {

            await setDoc(

                doc(
                    db,
                    "settings",
                    "institute"
                ),

                data,

                {
                    merge: true
                }

            );


            message.textContent =
                "Institute settings saved successfully.";

            message.className =
                "message success";


        } catch (error) {

            console.error(error);

            message.textContent =
                "Unable to save settings.";

            message.className =
                "message error";

        }

    }
);


document
    .getElementById("logoUrl")
    .addEventListener(
        "input",
        updateLogoPreview
    );


function updateLogoPreview() {

    const url =
        getValue("logoUrl");


    document.getElementById(
        "logoPreview"
    ).src =
        url ||
        "https://via.placeholder.com/150";

}


function getValue(id) {

    return document
        .getElementById(id)
        .value
        .trim();

}


function setValue(id, value) {

    document.getElementById(id).value =
        value || "";

}


document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        async () => {

            await signOut(auth);

            window.location.href =
                "index.html";

        }
    );
