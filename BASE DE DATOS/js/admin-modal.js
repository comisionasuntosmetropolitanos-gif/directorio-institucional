/* =========================================================
   MODALES DEL PANEL ADMINISTRATIVO
   Directorio Institucional
========================================================= */


/* =========================================================
   ELEMENTOS DEL MODAL DE REGISTRO
========================================================= */

const modalRegistroElemento =
    document.getElementById("modalRegistro");

const modalRegistro =
    modalRegistroElemento
        ? bootstrap.Modal.getOrCreateInstance(
            modalRegistroElemento
        )
        : null;


const formRegistro =
    document.getElementById("formRegistro");

const tituloModalRegistro =
    document.getElementById(
        "tituloModalRegistro"
    );

const registroId =
    document.getElementById("registroId");

const categoriaRegistro =
    document.getElementById(
        "categoriaRegistro"
    );

const estadoRegistro =
    document.getElementById(
        "estadoRegistro"
    );

const legislaturaRegistro =
    document.getElementById(
        "legislaturaRegistro"
    );

const nombreRegistro =
    document.getElementById(
        "nombreRegistro"
    );

const cargoRegistro =
    document.getElementById(
        "cargoRegistro"
    );

const comisionRegistro =
    document.getElementById(
        "comisionRegistro"
    );

const institucionRegistro =
    document.getElementById(
        "institucionRegistro"
    );

const telefonoRegistro =
    document.getElementById(
        "telefonoRegistro"
    );

const whatsappRegistro =
    document.getElementById(
        "whatsappRegistro"
    );

const correoRegistro =
    document.getElementById(
        "correoRegistro"
    );

const correosAdicionalesRegistro =
    document.getElementById(
        "correosAdicionalesRegistro"
    );

const contactoAdicionalRegistro =
    document.getElementById(
        "contactoAdicionalRegistro"
    );

const contactoAdicionalCargoRegistro =
    document.getElementById(
        "contactoAdicionalCargoRegistro"
    );

const contactoAdicionalTelefonoRegistro =
    document.getElementById(
        "contactoAdicionalTelefonoRegistro"
    );

const activoRegistro =
    document.getElementById(
        "activoRegistro"
    );

const mensajeFormulario =
    document.getElementById(
        "mensajeFormulario"
    );

const btnGuardarRegistro =
    document.getElementById(
        "btnGuardarRegistro"
    );

const textoBotonGuardar =
    document.getElementById(
        "textoBotonGuardar"
    );

const btnNuevoRegistro =
    document.getElementById(
        "btnNuevoRegistro"
    );

const categoriasRelacionadas =
    document.querySelectorAll(
        ".categoria-relacionada"
    );


/* =========================================================
   ELEMENTOS DEL MODAL DE ELIMINACIÓN
========================================================= */

const modalEliminarElemento =
    document.getElementById(
        "modalEliminar"
    );

const modalEliminar =
    modalEliminarElemento
        ? bootstrap.Modal.getOrCreateInstance(
            modalEliminarElemento
        )
        : null;

const nombreRegistroEliminar =
    document.getElementById(
        "nombreRegistroEliminar"
    );

const registroIdEliminar =
    document.getElementById(
        "registroIdEliminar"
    );

const btnConfirmarEliminar =
    document.getElementById(
        "btnConfirmarEliminar"
    );


/* =========================================================
   FUNCIONES EXTERNAS

   admin.js proporcionará estas funciones.
========================================================= */

let funcionGuardar = null;

let funcionConfirmarEliminar = null;


/* =========================================================
   MOSTRAR MENSAJE EN EL FORMULARIO
========================================================= */

function mostrarMensajeFormulario(
    mensaje,
    tipo = "danger"
) {

    if (!mensajeFormulario) {
        return;
    }

    mensajeFormulario.textContent =
        mensaje;

    mensajeFormulario.className =
        `alert alert-${tipo} mt-4`;

    mensajeFormulario.classList.remove(
        "d-none"
    );
}


/* =========================================================
   OCULTAR MENSAJE DEL FORMULARIO
========================================================= */

function ocultarMensajeFormulario() {

    if (!mensajeFormulario) {
        return;
    }

    mensajeFormulario.textContent = "";

    mensajeFormulario.className =
        "alert d-none mt-4";
}


/* =========================================================
   LIMPIAR CATEGORÍAS RELACIONADAS
========================================================= */

function limpiarCategoriasRelacionadas() {

    categoriasRelacionadas.forEach(
        casilla => {

            casilla.checked = false;
        }
    );
}


/* =========================================================
   SELECCIONAR CATEGORÍAS RELACIONADAS
========================================================= */

function seleccionarCategoriasRelacionadas(
    categorias = []
) {

    const listaCategorias =
        Array.isArray(categorias)
            ? categorias
            : [];

    categoriasRelacionadas.forEach(
        casilla => {

            casilla.checked =
                listaCategorias.includes(
                    casilla.value
                );
        }
    );
}


/* =========================================================
   OBTENER CATEGORÍAS MARCADAS
========================================================= */

function obtenerCategoriasRelacionadas() {

    return Array.from(
        categoriasRelacionadas
    )
        .filter(casilla =>
            casilla.checked
        )
        .map(casilla =>
            casilla.value
        );
}


/* =========================================================
   SINCRONIZAR CATEGORÍA PRINCIPAL

   La categoría principal siempre quedará marcada también
   dentro de las categorías relacionadas.
========================================================= */

function sincronizarCategoriaPrincipal() {

    if (!categoriaRegistro) {
        return;
    }

    const categoriaPrincipal =
        categoriaRegistro.value;

    categoriasRelacionadas.forEach(
        casilla => {

            if (
                casilla.value ===
                categoriaPrincipal
            ) {

                casilla.checked = true;
            }
        }
    );
}


/* =========================================================
   LIMPIAR FORMULARIO
========================================================= */

function limpiarFormularioRegistro() {

    formRegistro?.reset();

    if (registroId) {
        registroId.value = "";
    }

    if (activoRegistro) {
        activoRegistro.checked = true;
    }

    limpiarCategoriasRelacionadas();

    ocultarMensajeFormulario();

    cambiarEstadoBotonGuardar(false);
}


/* =========================================================
   PREPARAR FORMULARIO PARA AGREGAR
========================================================= */

function prepararNuevoRegistro() {

    limpiarFormularioRegistro();

    if (tituloModalRegistro) {

        tituloModalRegistro.textContent =
            "Agregar registro";
    }

    if (textoBotonGuardar) {

        textoBotonGuardar.textContent =
            "Guardar registro";
    }
}


/* =========================================================
   ABRIR MODAL PARA AGREGAR
========================================================= */

function abrirModalNuevoRegistro() {

    prepararNuevoRegistro();

    modalRegistro?.show();

    window.setTimeout(() => {

        categoriaRegistro?.focus();

    }, 250);
}


/* =========================================================
   ABRIR MODAL PARA EDITAR
========================================================= */

function abrirModalEditarRegistro(
    registro
) {

    if (!registro) {

        mostrarMensajeFormulario(
            "No se encontró el registro que deseas editar.",
            "danger"
        );

        return;
    }

    limpiarFormularioRegistro();

    if (tituloModalRegistro) {

        tituloModalRegistro.textContent =
            "Editar registro";
    }

    if (textoBotonGuardar) {

        textoBotonGuardar.textContent =
            "Guardar cambios";
    }

    if (registroId) {

        registroId.value =
            registro.id || "";
    }

    if (categoriaRegistro) {

        categoriaRegistro.value =
            registro.categoria || "";
    }

    if (estadoRegistro) {

        estadoRegistro.value =
            registro.estado || "";
    }

    if (legislaturaRegistro) {

        legislaturaRegistro.value =
            registro.legislatura || "";
    }

    if (nombreRegistro) {

        nombreRegistro.value =
            registro.nombre || "";
    }

    if (cargoRegistro) {

        cargoRegistro.value =
            registro.cargo || "";
    }

    if (comisionRegistro) {

        comisionRegistro.value =
            registro.comision || "";
    }

    if (institucionRegistro) {

        institucionRegistro.value =
            registro.institucion || "";
    }

    if (telefonoRegistro) {

        telefonoRegistro.value =
            registro.telefono || "";
    }

    if (whatsappRegistro) {

        whatsappRegistro.value =
            registro.whatsapp || "";
    }

    if (correoRegistro) {

        correoRegistro.value =
            registro.correo || "";
    }

    if (correosAdicionalesRegistro) {

        correosAdicionalesRegistro.value =
            Array.isArray(
                registro.correosAdicionales
            )
                ? registro
                    .correosAdicionales
                    .join(", ")
                : "";
    }

    if (contactoAdicionalRegistro) {

        contactoAdicionalRegistro.value =
            registro.contactoAdicional || "";
    }

    if (
        contactoAdicionalCargoRegistro
    ) {

        contactoAdicionalCargoRegistro.value =
            registro
                .contactoAdicionalCargo || "";
    }

    if (
        contactoAdicionalTelefonoRegistro
    ) {

        contactoAdicionalTelefonoRegistro.value =
            registro
                .contactoAdicionalTelefono || "";
    }

    if (activoRegistro) {

        activoRegistro.checked =
            registro.activo !== false;
    }

    const categorias =
        Array.isArray(registro.categorias)
            ? registro.categorias
            : registro.categoria
                ? [registro.categoria]
                : [];

    seleccionarCategoriasRelacionadas(
        categorias
    );

    sincronizarCategoriaPrincipal();

    modalRegistro?.show();

    window.setTimeout(() => {

        nombreRegistro?.focus();

    }, 250);
}


/* =========================================================
   CONVERTIR CORREOS ADICIONALES EN ARREGLO
========================================================= */

function procesarCorreosAdicionales(
    texto
) {

    return [
        ...new Set(
            String(texto || "")
                .split(/[,;\n]+/)
                .map(correo =>
                    correo
                        .trim()
                        .toLowerCase()
                )
                .filter(Boolean)
        )
    ];
}


/* =========================================================
   VALIDAR CORREO
========================================================= */

function correoValido(correo) {

    if (!correo) {
        return true;
    }

    const expresionCorreo =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return expresionCorreo.test(
        correo
    );
}


/* =========================================================
   LEER DATOS DEL FORMULARIO
========================================================= */

function obtenerDatosFormulario() {

    const categoria =
        categoriaRegistro?.value.trim() ||
        "";

    const categorias =
        obtenerCategoriasRelacionadas();

    if (
        categoria &&
        !categorias.includes(categoria)
    ) {

        categorias.unshift(categoria);
    }

    return {

        id:
            registroId?.value.trim() ||
            "",

        categoria,

        categorias,

        estado:
            estadoRegistro?.value.trim() ||
            "",

        legislatura:
            legislaturaRegistro
                ?.value.trim() ||
            "",

        nombre:
            nombreRegistro?.value.trim() ||
            "",

        cargo:
            cargoRegistro?.value.trim() ||
            "",

        comision:
            comisionRegistro?.value.trim() ||
            "",

        institucion:
            institucionRegistro
                ?.value.trim() ||
            "",

        telefono:
            telefonoRegistro
                ?.value.trim() ||
            "",

        whatsapp:
            whatsappRegistro
                ?.value.trim() ||
            "",

        correo:
            correoRegistro
                ?.value.trim()
                .toLowerCase() ||
            "",

        correosAdicionales:
            procesarCorreosAdicionales(
                correosAdicionalesRegistro
                    ?.value
            ),

        contactoAdicional:
            contactoAdicionalRegistro
                ?.value.trim() ||
            "",

        contactoAdicionalCargo:
            contactoAdicionalCargoRegistro
                ?.value.trim() ||
            "",

        contactoAdicionalTelefono:
            contactoAdicionalTelefonoRegistro
                ?.value.trim() ||
            "",

        activo:
            activoRegistro
                ? activoRegistro.checked
                : true
    };
}


/* =========================================================
   VALIDAR FORMULARIO
========================================================= */

function validarDatosFormulario(
    datos
) {

    if (!datos.categoria) {

        return {
            valido: false,
            mensaje:
                "Selecciona una categoría principal."
        };
    }

    if (!datos.nombre) {

        return {
            valido: false,
            mensaje:
                "Escribe el nombre completo."
        };
    }

    if (!datos.institucion) {

        return {
            valido: false,
            mensaje:
                "Escribe la institución de procedencia."
        };
    }

    if (
        datos.correo &&
        !correoValido(datos.correo)
    ) {

        return {
            valido: false,
            mensaje:
                "El correo principal no tiene un formato válido."
        };
    }

    const correoAdicionalInvalido =
        datos.correosAdicionales.find(
            correo =>
                !correoValido(correo)
        );

    if (correoAdicionalInvalido) {

        return {
            valido: false,
            mensaje:
                `El correo adicional "${correoAdicionalInvalido}" no es válido.`
        };
    }

    return {
        valido: true,
        mensaje: ""
    };
}


/* =========================================================
   CAMBIAR ESTADO DEL BOTÓN GUARDAR
========================================================= */

function cambiarEstadoBotonGuardar(
    guardando
) {

    if (!btnGuardarRegistro) {
        return;
    }

    btnGuardarRegistro.disabled =
        guardando;

    if (guardando) {

        btnGuardarRegistro.innerHTML = `
            <span
                class="spinner-border spinner-border-sm"
                aria-hidden="true"
            ></span>

            Guardando...
        `;

        return;
    }

    const editando =
        Boolean(
            registroId?.value
        );

    btnGuardarRegistro.innerHTML = `
        <i class="bi bi-floppy-fill"></i>

        <span id="textoBotonGuardar">
            ${
                editando
                    ? "Guardar cambios"
                    : "Guardar registro"
            }
        </span>
    `;
}


/* =========================================================
   CERRAR MODAL DE REGISTRO
========================================================= */

function cerrarModalRegistro() {

    modalRegistro?.hide();
}


/* =========================================================
   PROCESAR ENVÍO DEL FORMULARIO
========================================================= */

formRegistro?.addEventListener(
    "submit",
    async evento => {

        evento.preventDefault();

        ocultarMensajeFormulario();

        const datos =
            obtenerDatosFormulario();

        const validacion =
            validarDatosFormulario(
                datos
            );

        if (!validacion.valido) {

            mostrarMensajeFormulario(
                validacion.mensaje,
                "warning"
            );

            return;
        }

        if (
            typeof funcionGuardar !==
            "function"
        ) {

            mostrarMensajeFormulario(
                "La función para guardar todavía no está configurada.",
                "danger"
            );

            return;
        }

        cambiarEstadoBotonGuardar(true);

        try {

            await funcionGuardar(datos);

        } catch (error) {

            console.error(
                "Error desde el formulario:",
                error
            );

            cambiarEstadoBotonGuardar(false);
        }
    }
);


/* =========================================================
   EVENTO DEL BOTÓN NUEVO REGISTRO
========================================================= */

btnNuevoRegistro?.addEventListener(
    "click",
    prepararNuevoRegistro
);


/* =========================================================
   CAMBIO DE CATEGORÍA PRINCIPAL
========================================================= */

categoriaRegistro?.addEventListener(
    "change",
    sincronizarCategoriaPrincipal
);


/* =========================================================
   IMPEDIR DESMARCAR LA CATEGORÍA PRINCIPAL
========================================================= */

categoriasRelacionadas.forEach(
    casilla => {

        casilla.addEventListener(
            "change",
            () => {

                if (
                    casilla.value ===
                        categoriaRegistro?.value &&
                    !casilla.checked
                ) {

                    casilla.checked = true;

                    mostrarMensajeFormulario(
                        "La categoría principal debe permanecer seleccionada.",
                        "info"
                    );
                }
            }
        );
    }
);


/* =========================================================
   LIMPIAR AL CERRAR EL MODAL
========================================================= */

modalRegistroElemento?.addEventListener(
    "hidden.bs.modal",
    limpiarFormularioRegistro
);


/* =========================================================
   ABRIR MODAL DE ELIMINACIÓN
========================================================= */

function abrirModalEliminarRegistro(
    registro
) {

    if (!registro) {
        return;
    }

    if (registroIdEliminar) {

        registroIdEliminar.value =
            registro.id || "";
    }

    if (nombreRegistroEliminar) {

        nombreRegistroEliminar.textContent =
            registro.nombre ||
            "Registro sin nombre";
    }

    modalEliminar?.show();
}


/* =========================================================
   CAMBIAR ESTADO DEL BOTÓN ELIMINAR
========================================================= */

function cambiarEstadoBotonEliminar(
    eliminando
) {

    if (!btnConfirmarEliminar) {
        return;
    }

    btnConfirmarEliminar.disabled =
        eliminando;

    if (eliminando) {

        btnConfirmarEliminar.innerHTML = `
            <span
                class="spinner-border spinner-border-sm"
                aria-hidden="true"
            ></span>

            Eliminando...
        `;

        return;
    }

    btnConfirmarEliminar.innerHTML = `
        <i class="bi bi-trash-fill"></i>
        Eliminar registro
    `;
}


/* =========================================================
   CONFIRMAR ELIMINACIÓN
========================================================= */

btnConfirmarEliminar?.addEventListener(
    "click",
    async () => {

        const id =
            registroIdEliminar
                ?.value.trim() ||
            "";

        if (!id) {
            return;
        }

        if (
            typeof funcionConfirmarEliminar !==
            "function"
        ) {

            window.alert(
                "La función para eliminar todavía no está configurada."
            );

            return;
        }

        cambiarEstadoBotonEliminar(true);

        try {

            await funcionConfirmarEliminar(
                id
            );

        } catch (error) {

            console.error(
                "Error desde el modal de eliminación:",
                error
            );

            cambiarEstadoBotonEliminar(
                false
            );
        }
    }
);


/* =========================================================
   CERRAR MODAL DE ELIMINACIÓN
========================================================= */

function cerrarModalEliminar() {

    modalEliminar?.hide();
}


/* =========================================================
   LIMPIAR MODAL DE ELIMINACIÓN
========================================================= */

modalEliminarElemento?.addEventListener(
    "hidden.bs.modal",
    () => {

        if (registroIdEliminar) {

            registroIdEliminar.value = "";
        }

        if (nombreRegistroEliminar) {

            nombreRegistroEliminar.textContent =
                "Registro";
        }

        cambiarEstadoBotonEliminar(false);
    }
);


/* =========================================================
   CONFIGURAR FUNCIONES DEL MÓDULO
========================================================= */

function configurarModalAdmin({
    guardar,
    eliminar
} = {}) {

    funcionGuardar =
        typeof guardar === "function"
            ? guardar
            : null;

    funcionConfirmarEliminar =
        typeof eliminar === "function"
            ? eliminar
            : null;
}


/* =========================================================
   EXPORTAR FUNCIONES
========================================================= */

export {
    abrirModalNuevoRegistro,
    abrirModalEditarRegistro,
    cerrarModalRegistro,
    limpiarFormularioRegistro,
    obtenerDatosFormulario,
    validarDatosFormulario,
    mostrarMensajeFormulario,
    ocultarMensajeFormulario,
    cambiarEstadoBotonGuardar,
    abrirModalEliminarRegistro,
    cerrarModalEliminar,
    cambiarEstadoBotonEliminar,
    configurarModalAdmin
};