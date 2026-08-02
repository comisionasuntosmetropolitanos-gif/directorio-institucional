/* =========================================================
   PANEL PRINCIPAL DE ADMINISTRACIÓN
   Directorio Institucional
========================================================= */


/* =========================================================
   AUTENTICACIÓN
========================================================= */

import {
    autenticacionLista,
    obtenerUsuarioAdministrador
} from "./admin-auth.js";


/* =========================================================
   FIRESTORE
========================================================= */

import {
    escucharRegistros,
    agregarRegistro,
    actualizarRegistro,
    cambiarEstadoRegistro,
    eliminarRegistro
} from "./admin-firestore.js";


/* =========================================================
   INTERFAZ
========================================================= */

import {
    establecerRegistrosAdmin,
    obtenerRegistroAdminPorId,
    mostrarCargandoAdmin,
    mostrarErrorAdmin,
    mostrarMensajeGeneral,
    configurarAccionesAdmin
} from "./admin-ui.js";


/* =========================================================
   MODALES
========================================================= */

import {
    abrirModalEditarRegistro,
    cerrarModalRegistro,
    mostrarMensajeFormulario,
    cambiarEstadoBotonGuardar,
    abrirModalEliminarRegistro,
    cerrarModalEliminar,
    cambiarEstadoBotonEliminar,
    configurarModalAdmin
} from "./admin-modal.js";


/* =========================================================
   VARIABLES DEL PANEL
========================================================= */

let usuarioActual = null;

let detenerEscuchaFirestore = null;


/* =========================================================
   OBTENER CORREO DEL USUARIO
========================================================= */

function obtenerCorreoUsuario() {

    return usuarioActual?.email || "";
}


/* =========================================================
   MENSAJE SEGÚN EL ERROR
========================================================= */

function obtenerMensajeError(error) {

    if (!error) {

        return "Ocurrió un error inesperado.";
    }


    if (
        error.code ===
        "directorio/registro-duplicado"
    ) {

        return error.message;
    }


    if (
        error.code ===
        "permission-denied"
    ) {

        return "Firebase rechazó la operación. Revisa las reglas de seguridad de Firestore.";
    }


    if (
        error.code ===
        "unavailable"
    ) {

        return "No fue posible conectarse con Firebase. Revisa tu conexión a Internet.";
    }


    return (
        error.message ||
        "No fue posible completar la operación."
    );
}


/* =========================================================
   GUARDAR REGISTRO
========================================================= */

async function guardarRegistroDesdeFormulario(
    datos
) {

    try {

        const correoUsuario =
            obtenerCorreoUsuario();


        if (datos.id) {

            await actualizarRegistro(
                datos.id,
                datos,
                correoUsuario
            );


            cerrarModalRegistro();


            mostrarMensajeGeneral(
                `El registro de "${datos.nombre}" se actualizó correctamente.`,
                "success"
            );

        } else {

            await agregarRegistro(
                datos,
                correoUsuario
            );


            cerrarModalRegistro();


            mostrarMensajeGeneral(
                `El registro de "${datos.nombre}" se agregó correctamente.`,
                "success"
            );
        }

    } catch (error) {

        console.error(
            "Error al guardar el registro:",
            error
        );


        mostrarMensajeFormulario(
            obtenerMensajeError(error),
            error.code ===
                "directorio/registro-duplicado"
                ? "warning"
                : "danger"
        );


        cambiarEstadoBotonGuardar(false);


        throw error;
    }
}


/* =========================================================
   ABRIR EDICIÓN
========================================================= */

function editarRegistroDesdeTabla(id) {

    const registro =
        obtenerRegistroAdminPorId(id);


    if (!registro) {

        mostrarMensajeGeneral(
            "No se encontró el registro que deseas editar.",
            "danger"
        );

        return;
    }


    abrirModalEditarRegistro(
        registro
    );
}


/* =========================================================
   ABRIR ELIMINACIÓN
========================================================= */

function solicitarEliminarRegistro(id) {

    const registro =
        obtenerRegistroAdminPorId(id);


    if (!registro) {

        mostrarMensajeGeneral(
            "No se encontró el registro que deseas eliminar.",
            "danger"
        );

        return;
    }


    abrirModalEliminarRegistro(
        registro
    );
}


/* =========================================================
   CONFIRMAR ELIMINACIÓN
========================================================= */

async function confirmarEliminarRegistro(id) {

    const registro =
        obtenerRegistroAdminPorId(id);


    try {

        await eliminarRegistro(id);


        cerrarModalEliminar();


        mostrarMensajeGeneral(
            registro
                ? `El registro de "${registro.nombre}" se eliminó correctamente.`
                : "El registro se eliminó correctamente.",
            "success"
        );

    } catch (error) {

        console.error(
            "Error al eliminar el registro:",
            error
        );


        cambiarEstadoBotonEliminar(false);


        mostrarMensajeGeneral(
            obtenerMensajeError(error),
            "danger"
        );


        throw error;
    }
}


/* =========================================================
   ACTIVAR O DESACTIVAR REGISTRO
========================================================= */

async function cambiarEstadoDesdeTabla(
    id,
    activo
) {

    const registro =
        obtenerRegistroAdminPorId(id);


    if (!registro) {

        mostrarMensajeGeneral(
            "No se encontró el registro seleccionado.",
            "danger"
        );

        return;
    }


    const accion =
        activo
            ? "activar"
            : "desactivar";


    const confirmar =
        window.confirm(
            `¿Deseas ${accion} el registro de "${registro.nombre}"?`
        );


    if (!confirmar) {

        return;
    }


    try {

        await cambiarEstadoRegistro(
            id,
            activo,
            obtenerCorreoUsuario()
        );


        mostrarMensajeGeneral(
            activo
                ? `El registro de "${registro.nombre}" quedó activo.`
                : `El registro de "${registro.nombre}" quedó oculto del directorio.`,
            "success"
        );

    } catch (error) {

        console.error(
            "Error al cambiar el estado:",
            error
        );


        mostrarMensajeGeneral(
            obtenerMensajeError(error),
            "danger"
        );
    }
}


/* =========================================================
   ESCUCHAR REGISTROS EN TIEMPO REAL
========================================================= */

function iniciarEscuchaFirestore() {

    mostrarCargandoAdmin();


    detenerEscuchaFirestore =
        escucharRegistros(

            registros => {

                establecerRegistrosAdmin(
                    registros
                );
            },

            error => {

                mostrarErrorAdmin(
                    obtenerMensajeError(error)
                );
            }
        );
}


/* =========================================================
   CONFIGURAR ACCIONES DE LA INTERFAZ
========================================================= */

function configurarInterfaz() {

    configurarAccionesAdmin({

        editar:
            editarRegistroDesdeTabla,

        eliminar:
            solicitarEliminarRegistro,

        cambiarEstado:
            cambiarEstadoDesdeTabla
    });


    configurarModalAdmin({

        guardar:
            guardarRegistroDesdeFormulario,

        eliminar:
            confirmarEliminarRegistro
    });
}


/* =========================================================
   INICIAR PANEL
========================================================= */

async function iniciarPanelAdministrativo() {

    try {

        usuarioActual =
            await autenticacionLista;


        if (!usuarioActual) {

            return;
        }


        configurarInterfaz();

        iniciarEscuchaFirestore();

    } catch (error) {

        console.error(
            "Error al iniciar el panel:",
            error
        );


        mostrarErrorAdmin(
            "No fue posible iniciar el panel administrativo."
        );
    }
}


/* =========================================================
   DETENER ESCUCHA AL CERRAR LA PÁGINA
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        if (
            typeof detenerEscuchaFirestore ===
            "function"
        ) {

            detenerEscuchaFirestore();
        }
    }
);


/* =========================================================
   EJECUTAR
========================================================= */

iniciarPanelAdministrativo();