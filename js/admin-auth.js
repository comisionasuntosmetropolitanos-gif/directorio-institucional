/* =========================================================
   AUTENTICACIÓN DEL PANEL ADMINISTRATIVO
   Directorio Institucional
========================================================= */


/* =========================================================
   IMPORTAR FIREBASE
========================================================= */

import {
    auth
} from "./firebase-config.js";


import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/* =========================================================
   VARIABLES INTERNAS
========================================================= */

/*
    Esta variable guardará al usuario que tenga
    una sesión iniciada.
*/
let usuarioAdministrador = null;


/*
    Esta promesa permitirá que admin.js espere
    hasta que Firebase termine de verificar la sesión.
*/
let resolverAutenticacion;


const autenticacionLista = new Promise(resolve => {

    resolverAutenticacion = resolve;
});


/* =========================================================
   ELEMENTOS DEL HTML
========================================================= */

const pantallaCargaAdmin =
    document.getElementById("pantallaCargaAdmin");


const panelAdministracion =
    document.getElementById("panelAdministracion");


const correoUsuarioAdmin =
    document.getElementById("correoUsuarioAdmin");


const btnCerrarSesion =
    document.getElementById("btnCerrarSesion");


/* =========================================================
   MOSTRAR PANEL
========================================================= */

function mostrarPanelAdministrativo(usuario) {

    if (correoUsuarioAdmin) {

        correoUsuarioAdmin.textContent =
            usuario.email || "Usuario autorizado";
    }


    if (pantallaCargaAdmin) {

        pantallaCargaAdmin.classList.add("d-none");
    }


    if (panelAdministracion) {

        panelAdministracion.classList.remove("d-none");
    }
}


/* =========================================================
   REDIRIGIR AL INICIO
========================================================= */

function regresarAlInicio() {

    window.location.replace("index.html");
}


/* =========================================================
   VERIFICAR SESIÓN
========================================================= */

onAuthStateChanged(
    auth,
    usuario => {

        if (!usuario) {

            usuarioAdministrador = null;

            resolverAutenticacion(null);

            regresarAlInicio();

            return;
        }


        usuarioAdministrador = usuario;

        mostrarPanelAdministrativo(usuario);

        resolverAutenticacion(usuario);
    }
);


/* =========================================================
   CERRAR SESIÓN
========================================================= */

async function cerrarSesionAdministrador() {

    const confirmar =
        window.confirm(
            "¿Deseas cerrar la sesión administrativa?"
        );


    if (!confirmar) {

        return;
    }


    if (btnCerrarSesion) {

        btnCerrarSesion.disabled = true;

        btnCerrarSesion.innerHTML = `
            <span
                class="spinner-border spinner-border-sm"
                aria-hidden="true"
            ></span>

            Cerrando sesión...
        `;
    }


    try {

        await signOut(auth);

        regresarAlInicio();

    } catch (error) {

        console.error(
            "Error al cerrar sesión:",
            error
        );


        window.alert(
            "No fue posible cerrar la sesión. Inténtalo nuevamente."
        );


        if (btnCerrarSesion) {

            btnCerrarSesion.disabled = false;

            btnCerrarSesion.innerHTML = `
                <i class="bi bi-box-arrow-right"></i>
                Cerrar sesión
            `;
        }
    }
}


/* =========================================================
   EVENTO DEL BOTÓN CERRAR SESIÓN
========================================================= */

if (btnCerrarSesion) {

    btnCerrarSesion.addEventListener(
        "click",
        cerrarSesionAdministrador
    );
}


/* =========================================================
   OBTENER USUARIO ACTUAL
========================================================= */

function obtenerUsuarioAdministrador() {

    return usuarioAdministrador;
}


/* =========================================================
   EXPORTAR FUNCIONES
========================================================= */

export {
    autenticacionLista,
    obtenerUsuarioAdministrador,
    cerrarSesionAdministrador
};