/* =========================================================
   CONFIGURACIÓN DE FIREBASE
   Directorio Institucional
========================================================= */

/*
    Importamos las herramientas necesarias desde Firebase.

    Utilizamos Firebase mediante CDN porque este proyecto
    está hecho con HTML, CSS y JavaScript, sin npm.
*/

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* =========================================================
   CONFIGURACIÓN DE TU PROYECTO FIREBASE
========================================================= */

const firebaseConfig = {

    apiKey: "AIzaSyC3NB4rFA7t0bWJPmXb5FKnIlhlvbnmNic",

    authDomain: "directorio-institucional-639e9.firebaseapp.com",

    projectId: "directorio-institucional-639e9",

    storageBucket: "directorio-institucional-639e9.firebasestorage.app",

    messagingSenderId: "434232956609",

    appId: "1:434232956609:web:3e1e3348ae657784f8a640"

};


/* =========================================================
   INICIALIZAR FIREBASE
========================================================= */

const app = initializeApp(firebaseConfig);


/* =========================================================
   INICIALIZAR SERVICIOS
========================================================= */

/*
    Firebase Authentication:
    permitirá iniciar y cerrar sesión.
*/
const auth = getAuth(app);


/*
    Cloud Firestore:
    almacenará los registros del directorio.
*/
const db = getFirestore(app);


/* =========================================================
   EXPORTAR SERVICIOS
========================================================= */

/*
    Estos elementos se utilizarán después en:

    - login.js
    - directorio.js
    - admin.js
*/

export {
    app,
    auth,
    db
};