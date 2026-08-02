/* =========================================================
   OPERACIONES DE CLOUD FIRESTORE
   Panel de administración del Directorio Institucional
========================================================= */


/* =========================================================
   IMPORTAR CONFIGURACIÓN
========================================================= */

import {
    db
} from "./firebase-config.js";


/* =========================================================
   IMPORTAR FUNCIONES DE FIRESTORE
========================================================= */

import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* =========================================================
   REFERENCIA A LA COLECCIÓN
========================================================= */

const referenciaDirectorio =
    collection(db, "directorio");


/* =========================================================
   NORMALIZAR TEXTO

   Se utiliza para comparar nombres e instituciones sin que
   afecten los acentos, mayúsculas o espacios adicionales.
========================================================= */

function normalizarTexto(texto) {

    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\b(dip|diputada|diputado|lic|licenciada|licenciado|mtra|mtro|dra|dr|reg)\b\.?/g, "")
        .replace(/[^a-z0-9ñ]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}


/* =========================================================
   CREAR CLAVE ÚNICA

   La combinación será:

   nombre normalizado + institución normalizada
========================================================= */

function crearClaveUnica(nombre, institucion) {

    const nombreNormalizado =
        normalizarTexto(nombre);

    const institucionNormalizada =
        normalizarTexto(institucion);

    return `${nombreNormalizado}|${institucionNormalizada}`;
}


/* =========================================================
   LIMPIAR ARREGLOS

   Elimina valores vacíos y repetidos.
========================================================= */

function limpiarArreglo(arreglo = []) {

    return [
        ...new Set(
            arreglo
                .map(valor =>
                    String(valor || "").trim()
                )
                .filter(valor =>
                    valor !== ""
                )
        )
    ];
}


/* =========================================================
   PREPARAR DATOS DEL REGISTRO
========================================================= */

function prepararDatosRegistro(
    datos,
    correoUsuario = ""
) {

    const categoriaPrincipal =
        String(datos.categoria || "").trim();

    let categorias =
        Array.isArray(datos.categorias)
            ? limpiarArreglo(datos.categorias)
            : [];

    /*
        La categoría principal siempre debe estar incluida
        en el arreglo de categorías relacionadas.
    */

    if (
        categoriaPrincipal &&
        !categorias.includes(categoriaPrincipal)
    ) {

        categorias.unshift(
            categoriaPrincipal
        );
    }


    const nombre =
        String(datos.nombre || "").trim();

    const institucion =
        String(datos.institucion || "").trim();


    return {

        categoria:
            categoriaPrincipal,

        categorias,

        estado:
            String(datos.estado || "").trim(),

        legislatura:
            String(datos.legislatura || "").trim(),

        nombre,

        cargo:
            String(datos.cargo || "").trim(),

        comision:
            String(datos.comision || "").trim(),

        institucion,

        telefono:
            String(datos.telefono || "").trim(),

        whatsapp:
            String(datos.whatsapp || "").trim(),

        correo:
            String(datos.correo || "")
                .trim()
                .toLowerCase(),

        correosAdicionales:
            limpiarArreglo(
                datos.correosAdicionales || []
            ).map(correo =>
                correo.toLowerCase()
            ),

        contactoAdicional:
            String(
                datos.contactoAdicional || ""
            ).trim(),

        contactoAdicionalCargo:
            String(
                datos.contactoAdicionalCargo || ""
            ).trim(),

        contactoAdicionalTelefono:
            String(
                datos.contactoAdicionalTelefono || ""
            ).trim(),

        activo:
            datos.activo !== false,

        claveUnica:
            crearClaveUnica(
                nombre,
                institucion
            ),

        actualizadoEn:
            serverTimestamp(),

        usuarioEditor:
            String(correoUsuario || "").trim()
    };
}


/* =========================================================
   ESCUCHAR REGISTROS EN TIEMPO REAL

   La función recibida como primer parámetro se ejecutará
   cada vez que Firestore tenga algún cambio.
========================================================= */

function escucharRegistros(
    alRecibirDatos,
    alRecibirError
) {

    return onSnapshot(

        referenciaDirectorio,

        snapshot => {

            const registros =
                snapshot.docs.map(documento => ({

                    id: documento.id,

                    ...documento.data()
                }));


            if (
                typeof alRecibirDatos === "function"
            ) {

                alRecibirDatos(registros);
            }
        },

        error => {

            console.error(
                "Error al escuchar Firestore:",
                error
            );


            if (
                typeof alRecibirError === "function"
            ) {

                alRecibirError(error);
            }
        }
    );
}


/* =========================================================
   OBTENER TODOS LOS REGISTROS UNA SOLA VEZ
========================================================= */

async function obtenerRegistros() {

    const snapshot =
        await getDocs(
            referenciaDirectorio
        );


    return snapshot.docs.map(documento => ({

        id: documento.id,

        ...documento.data()
    }));
}


/* =========================================================
   BUSCAR POSIBLE DUPLICADO
========================================================= */

async function buscarDuplicado(
    nombre,
    institucion,
    idIgnorado = ""
) {

    const claveBuscada =
        crearClaveUnica(
            nombre,
            institucion
        );


    const registros =
        await obtenerRegistros();


    return registros.find(registro => {

        if (
            idIgnorado &&
            String(registro.id) ===
                String(idIgnorado)
        ) {

            return false;
        }


        const claveRegistro =
            registro.claveUnica ||
            crearClaveUnica(
                registro.nombre,
                registro.institucion
            );


        return claveRegistro === claveBuscada;
    }) || null;
}


/* =========================================================
   AGREGAR REGISTRO
========================================================= */

async function agregarRegistro(
    datos,
    correoUsuario
) {

    const datosPreparados =
        prepararDatosRegistro(
            datos,
            correoUsuario
        );


    if (
        !datosPreparados.categoria ||
        !datosPreparados.nombre ||
        !datosPreparados.institucion
    ) {

        throw new Error(
            "Faltan los campos obligatorios del registro."
        );
    }


    const duplicado =
        await buscarDuplicado(
            datosPreparados.nombre,
            datosPreparados.institucion
        );


    if (duplicado) {

        const error =
            new Error(
                "Ya existe una persona con ese nombre e institución."
            );

        error.code =
            "directorio/registro-duplicado";

        error.registroExistente =
            duplicado;

        throw error;
    }


    const referenciaCreada =
        await addDoc(

            referenciaDirectorio,

            {
                ...datosPreparados,

                creadoEn:
                    serverTimestamp(),

                origen:
                    "Panel administrativo"
            }
        );


    return referenciaCreada.id;
}


/* =========================================================
   ACTUALIZAR REGISTRO
========================================================= */

async function actualizarRegistro(
    id,
    datos,
    correoUsuario
) {

    if (!id) {

        throw new Error(
            "No se recibió el ID del registro."
        );
    }


    const datosPreparados =
        prepararDatosRegistro(
            datos,
            correoUsuario
        );


    if (
        !datosPreparados.categoria ||
        !datosPreparados.nombre ||
        !datosPreparados.institucion
    ) {

        throw new Error(
            "Faltan los campos obligatorios del registro."
        );
    }


    const duplicado =
        await buscarDuplicado(
            datosPreparados.nombre,
            datosPreparados.institucion,
            id
        );


    if (duplicado) {

        const error =
            new Error(
                "Otro registro ya utiliza ese nombre e institución."
            );

        error.code =
            "directorio/registro-duplicado";

        error.registroExistente =
            duplicado;

        throw error;
    }


    const referenciaDocumento =
        doc(
            db,
            "directorio",
            id
        );


    await updateDoc(
        referenciaDocumento,
        datosPreparados
    );
}


/* =========================================================
   CAMBIAR ESTADO ACTIVO

   Permite ocultar un registro sin eliminarlo.
========================================================= */

async function cambiarEstadoRegistro(
    id,
    activo,
    correoUsuario
) {

    if (!id) {

        throw new Error(
            "No se recibió el ID del registro."
        );
    }


    const referenciaDocumento =
        doc(
            db,
            "directorio",
            id
        );


    await updateDoc(

        referenciaDocumento,

        {
            activo:
                Boolean(activo),

            actualizadoEn:
                serverTimestamp(),

            usuarioEditor:
                String(correoUsuario || "").trim()
        }
    );
}


/* =========================================================
   ELIMINAR REGISTRO DEFINITIVAMENTE
========================================================= */

async function eliminarRegistro(id) {

    if (!id) {

        throw new Error(
            "No se recibió el ID del registro."
        );
    }


    const referenciaDocumento =
        doc(
            db,
            "directorio",
            id
        );


    await deleteDoc(
        referenciaDocumento
    );
}


/* =========================================================
   OBTENER UN REGISTRO DESDE UN ARREGLO LOCAL
========================================================= */

function buscarRegistroPorId(
    registros,
    id
) {

    return registros.find(registro =>
        String(registro.id) ===
        String(id)
    ) || null;
}


/* =========================================================
   EXPORTAR FUNCIONES
========================================================= */

export {
    escucharRegistros,
    obtenerRegistros,
    agregarRegistro,
    actualizarRegistro,
    cambiarEstadoRegistro,
    eliminarRegistro,
    buscarRegistroPorId,
    buscarDuplicado,
    crearClaveUnica,
    normalizarTexto
};