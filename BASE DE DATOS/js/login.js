/* =========================================================
   INICIO DE SESIÓN
   Directorio Institucional
========================================================= */

import {
    auth
} from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTOS DEL FORMULARIO
    ===================================================== */

    const formLogin =
        document.getElementById("formLogin");

    const correoLogin =
        document.getElementById("correoLogin");

    const passwordLogin =
        document.getElementById("passwordLogin");

    const btnMostrarPassword =
        document.getElementById("btnMostrarPassword");

    const btnIniciarSesion =
        document.getElementById("btnIniciarSesion");

    const textoBotonLogin =
        document.getElementById("textoBotonLogin");

    const mensajeLogin =
        document.getElementById("mensajeLogin");


    /* =====================================================
       MOSTRAR MENSAJES
    ===================================================== */

    function mostrarMensaje(mensaje, tipo = "danger") {

        mensajeLogin.textContent = mensaje;

        mensajeLogin.className =
            `alert alert-${tipo}`;

        mensajeLogin.classList.remove("d-none");
    }


    function ocultarMensaje() {

        mensajeLogin.textContent = "";

        mensajeLogin.className = "alert d-none";
    }


    /* =====================================================
       ESTADO DEL BOTÓN
    ===================================================== */

    function cambiarEstadoBoton(cargando) {

        btnIniciarSesion.disabled = cargando;

        if (cargando) {

            textoBotonLogin.textContent =
                "Verificando acceso...";

        } else {

            textoBotonLogin.textContent =
                "Iniciar sesión";
        }
    }


    /* =====================================================
       MOSTRAR U OCULTAR CONTRASEÑA
    ===================================================== */

    btnMostrarPassword.addEventListener("click", () => {

        const mostrar =
            passwordLogin.type === "password";

        passwordLogin.type =
            mostrar ? "text" : "password";

        const icono =
            btnMostrarPassword.querySelector("i");

        icono.className =
            mostrar
                ? "bi bi-eye-slash"
                : "bi bi-eye";
    });


    /* =====================================================
       INICIAR SESIÓN
    ===================================================== */

    formLogin.addEventListener("submit", async evento => {

        evento.preventDefault();

        ocultarMensaje();

        const correo =
            correoLogin.value.trim();

        const password =
            passwordLogin.value;


        if (!correo || !password) {

            mostrarMensaje(
                "Escribe el correo y la contraseña.",
                "warning"
            );

            return;
        }


        cambiarEstadoBoton(true);


        try {

            await signInWithEmailAndPassword(
                auth,
                correo,
                password
            );

            mostrarMensaje(
                "Acceso correcto. Abriendo el directorio...",
                "success"
            );

            window.location.href =
                "directorio.html";

        } catch (error) {

            console.error(
                "Error al iniciar sesión:",
                error
            );

            let mensaje =
                "No fue posible iniciar sesión.";


            switch (error.code) {

                case "auth/invalid-email":

                    mensaje =
                        "El correo electrónico no es válido.";

                    break;


                case "auth/invalid-credential":

                case "auth/wrong-password":

                case "auth/user-not-found":

                    mensaje =
                        "El correo o la contraseña son incorrectos.";

                    break;


                case "auth/too-many-requests":

                    mensaje =
                        "Se realizaron demasiados intentos. Espera unos minutos.";

                    break;


                case "auth/network-request-failed":

                    mensaje =
                        "No fue posible conectarse. Revisa tu Internet.";

                    break;


                default:

                    mensaje =
                        `Error de acceso: ${error.code}`;
            }


            mostrarMensaje(
                mensaje,
                "danger"
            );

            cambiarEstadoBoton(false);
        }
    });


    /* =====================================================
       COMPROBAR SI YA EXISTE UNA SESIÓN
    ===================================================== */

    onAuthStateChanged(auth, usuario => {

        if (usuario) {

            window.location.href =
                "directorio.html";
        }
    });

});