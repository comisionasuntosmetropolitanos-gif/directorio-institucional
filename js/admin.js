/* =========================================================
   DIRECTORIO INSTITUCIONAL — PANEL ADMINISTRATIVO
   Gestión integral con Cloud Firestore & Firebase Auth
========================================================= */

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    collection,
    onSnapshot,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       ELEMENTOS DEL DOM
    ===================================================== */

    const pantallaCargaAdmin =
        document.getElementById("pantallaCargaAdmin");

    const panelAdministracion =
        document.getElementById("panelAdministracion");

    const correoUsuarioAdmin =
        document.getElementById("correoUsuarioAdmin");

    const btnCerrarSesion =
        document.getElementById("btnCerrarSesion");


    /* =====================================================
       RESUMEN Y FILTROS
    ===================================================== */

    const totalComisiones =
        document.getElementById("totalComisiones");

    const totalMesas =
        document.getElementById("totalMesas");

    const totalRepresentantes =
        document.getElementById("totalRepresentantes");

    const totalInstituciones =
        document.getElementById("totalInstituciones");

    const totalIntegrantesZonas =
        document.getElementById("totalIntegrantesZonas");

    const tarjetasResumen =
        document.querySelectorAll(".tarjeta-resumen-admin");


    const buscadorAdmin =
        document.getElementById("buscadorAdmin");

    const filtroCategoriaAdmin =
        document.getElementById("filtroCategoriaAdmin");

    const filtroEstadoAdmin =
        document.getElementById("filtroEstadoAdmin");

    const btnLimpiarAdmin =
        document.getElementById("btnLimpiarAdmin");

    const contadorAdmin =
        document.getElementById("contadorAdmin");


    /* =====================================================
       TABLA Y VISTA MÓVIL
    ===================================================== */

    const tablaAdmin =
        document.getElementById("tablaAdmin");

    const listaAdminMovil =
        document.getElementById("listaAdminMovil");

    const mensajeCargandoAdmin =
        document.getElementById("mensajeCargandoAdmin");

    const mensajeAdminVacio =
        document.getElementById("mensajeAdminVacio");

    const mensajeErrorAdmin =
        document.getElementById("mensajeErrorAdmin");

    const textoErrorAdmin =
        document.getElementById("textoErrorAdmin");


    /* =====================================================
       MODAL FORMULARIO
       AGREGAR / EDITAR
    ===================================================== */

    const modalRegistroElemento =
        document.getElementById("modalRegistro");

    const modalRegistroBS =
        new bootstrap.Modal(modalRegistroElemento);

    const formRegistro =
        document.getElementById("formRegistro");

    const tituloModalRegistro =
        document.getElementById("tituloModalRegistro");

    const textoBotonGuardar =
        document.getElementById("textoBotonGuardar");

    const mensajeFormulario =
        document.getElementById("mensajeFormulario");


    /* =====================================================
       CAMPOS DEL FORMULARIO
    ===================================================== */

    const registroId =
        document.getElementById("registroId");

    const categoriaRegistro =
        document.getElementById("categoriaRegistro");

    const estadoRegistro =
        document.getElementById("estadoRegistro");

    const checkboxesCategorias =
        document.querySelectorAll(".categoria-relacionada");

    const legislaturaRegistro =
        document.getElementById("legislaturaRegistro");

    const nombreRegistro =
        document.getElementById("nombreRegistro");

    const cargoRegistro =
        document.getElementById("cargoRegistro");

    const comisionRegistro =
        document.getElementById("comisionRegistro");

    const institucionRegistro =
        document.getElementById("institucionRegistro");

    const telefonoRegistro =
        document.getElementById("telefonoRegistro");

    const whatsappRegistro =
        document.getElementById("whatsappRegistro");

    const correoRegistro =
        document.getElementById("correoRegistro");

    const correosAdicionalesRegistro =
        document.getElementById("correosAdicionalesRegistro");

    const contactosAdicionalesContenedor =
        document.getElementById("contactosAdicionalesContenedor");

    const btnAgregarContactoAdicional =
        document.getElementById("btnAgregarContactoAdicional");

    const activoRegistro =
        document.getElementById("activoRegistro");


    /* =====================================================
       MODAL ELIMINAR
    ===================================================== */

    const modalEliminarElemento =
        document.getElementById("modalEliminar");

    const modalEliminarBS =
        new bootstrap.Modal(modalEliminarElemento);

    const nombreRegistroEliminar =
        document.getElementById("nombreRegistroEliminar");

    const registroIdEliminar =
        document.getElementById("registroIdEliminar");

    const btnConfirmarEliminar =
        document.getElementById("btnConfirmarEliminar");


    /* =====================================================
       REGISTROS
    ===================================================== */

    let registrosAdmin = [];


    /* =====================================================
       NORMALIZAR TEXTO
    ===================================================== */

    function normalizarTexto(texto) {

        return String(texto || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();

    }


    /* =====================================================
       ESCAPAR HTML
    ===================================================== */

    function escaparHTML(texto) {

        return String(texto || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }


    /* =====================================================
       NOMBRE VISIBLE DE LA CATEGORÍA
    ===================================================== */

    function obtenerNombreCategoria(cat) {

        const nombres = {

            comisiones:
                "Comisión",

            mesas:
                "Mesa Directiva",

            representantes:
                "Representante",

            instituciones:
                "Institución",

            "integrantes-zonas":
                "Integrante de Comisión de Zonas Metropolitanas"

        };

        return nombres[cat] || "Sin categoría";

    }


    /* =====================================================
       CONTACTOS ADICIONALES DINÁMICOS
    ===================================================== */

    function crearContactoAdicional(contacto = {}) {

        const item =
            document.createElement("div");

        item.className =
            "contacto-adicional-item-admin";

        item.innerHTML = `

            <div class="contacto-adicional-cabecera-admin">

                <strong class="contacto-adicional-titulo-admin">
                    Contacto adicional
                </strong>

                <button
                    type="button"
                    class="btn btn-eliminar-contacto-adicional"
                    title="Eliminar este contacto"
                    aria-label="Eliminar este contacto"
                >
                    <i class="bi bi-trash3"></i>
                    <span>Eliminar</span>
                </button>

            </div>

            <div class="row g-3">

                <div class="col-md-6">

                    <label class="form-label">
                        Nombre del contacto
                    </label>

                    <input
                        type="text"
                        class="form-control contacto-adicional-nombre"
                        placeholder="Nombre completo"
                    >

                </div>

                <div class="col-md-6">

                    <label class="form-label">
                        Cargo del contacto
                    </label>

                    <input
                        type="text"
                        class="form-control contacto-adicional-cargo"
                        placeholder="Ejemplo: Asesor, Secretaria Particular"
                    >

                </div>

                <div class="col-md-6">

                    <label class="form-label">
                        Teléfono del contacto
                    </label>

                    <input
                        type="tel"
                        class="form-control contacto-adicional-telefono"
                        placeholder="Ejemplo: 55 1234 5678"
                    >

                </div>

                <div class="col-md-6">

                    <label class="form-label">
                        Correo del contacto
                    </label>

                    <input
                        type="email"
                        class="form-control contacto-adicional-correo"
                        placeholder="correo@ejemplo.com"
                    >

                </div>

            </div>

        `;

        item.querySelector(
            ".contacto-adicional-nombre"
        ).value =
            contacto.nombre || "";

        item.querySelector(
            ".contacto-adicional-cargo"
        ).value =
            contacto.cargo || "";

        item.querySelector(
            ".contacto-adicional-telefono"
        ).value =
            contacto.telefono || "";

        item.querySelector(
            ".contacto-adicional-correo"
        ).value =
            contacto.correo || "";

        item.querySelector(
            ".btn-eliminar-contacto-adicional"
        ).addEventListener(
            "click",
            () => {

                item.remove();
                actualizarNumeracionContactos();

            }
        );

        return item;

    }


    function actualizarNumeracionContactos() {

        if (!contactosAdicionalesContenedor) {
            return;
        }

        contactosAdicionalesContenedor
            .querySelectorAll(
                ".contacto-adicional-item-admin"
            )
            .forEach(
                (item, index) => {

                    const titulo =
                        item.querySelector(
                            ".contacto-adicional-titulo-admin"
                        );

                    if (titulo) {

                        titulo.textContent =
                            `Contacto adicional ${index + 1}`;

                    }

                }
            );

    }


    function agregarContactoAdicional(contacto = {}) {

        if (!contactosAdicionalesContenedor) {
            return;
        }

        contactosAdicionalesContenedor.appendChild(
            crearContactoAdicional(contacto)
        );

        actualizarNumeracionContactos();

    }


    function cargarContactosAdicionales(contactos = []) {

        if (!contactosAdicionalesContenedor) {
            return;
        }

        contactosAdicionalesContenedor.innerHTML =
            "";

        const lista =
            Array.isArray(contactos)
                ? contactos
                : [];

        if (lista.length === 0) {

            agregarContactoAdicional();
            return;

        }

        lista.forEach(
            contacto =>
                agregarContactoAdicional(contacto)
        );

    }


    function obtenerContactosAdicionalesFormulario() {

        if (!contactosAdicionalesContenedor) {
            return [];
        }

        return [
            ...contactosAdicionalesContenedor
                .querySelectorAll(
                    ".contacto-adicional-item-admin"
                )
        ]
            .map(
                item => ({

                    nombre:
                        item.querySelector(
                            ".contacto-adicional-nombre"
                        )?.value.trim() || "",

                    cargo:
                        item.querySelector(
                            ".contacto-adicional-cargo"
                        )?.value.trim() || "",

                    telefono:
                        item.querySelector(
                            ".contacto-adicional-telefono"
                        )?.value.trim() || "",

                    correo:
                        item.querySelector(
                            ".contacto-adicional-correo"
                        )?.value.trim() || ""

                })
            )
            .filter(
                contacto =>
                    contacto.nombre ||
                    contacto.cargo ||
                    contacto.telefono ||
                    contacto.correo
            );

    }


    function obtenerContactosRegistro(registro) {

        if (
            Array.isArray(registro.contactosAdicionales) &&
            registro.contactosAdicionales.length > 0
        ) {

            return registro.contactosAdicionales;

        }

        const contactoLegado = {

            nombre:
                registro.contactoAdicional || "",

            cargo:
                registro.contactoAdicionalCargo || "",

            telefono:
                registro.contactoAdicionalTelefono || "",

            correo: ""

        };

        if (
            contactoLegado.nombre ||
            contactoLegado.cargo ||
            contactoLegado.telefono
        ) {

            return [contactoLegado];

        }

        return [];

    }


    if (btnAgregarContactoAdicional) {

        btnAgregarContactoAdicional.addEventListener(
            "click",
            () => agregarContactoAdicional()
        );

    }


    /* =====================================================
       MOSTRAR CONTACTOS EN ADMIN
       Incluye contactos principales y adicionales
    ===================================================== */

    function obtenerContactosAdicionalesParaMostrar(
        registro
    ) {

        const nuevos =
            Array.isArray(
                registro.contactosAdicionales
            )
                ? registro.contactosAdicionales
                    .filter(
                        contacto =>
                            contacto &&
                            (
                                String(contacto.nombre || "").trim() ||
                                String(contacto.cargo || "").trim() ||
                                String(contacto.telefono || "").trim() ||
                                String(contacto.correo || "").trim()
                            )
                    )
                : [];


        if (
            nuevos.length > 0
        ) {

            const vistos =
                new Set();


            return nuevos.filter(
                contacto => {

                    const clave =
                        [
                            contacto.nombre,
                            contacto.cargo,
                            contacto.telefono,
                            contacto.correo
                        ]
                            .map(
                                valor =>
                                    normalizarTexto(
                                        valor
                                    )
                            )
                            .join("|");


                    if (
                        vistos.has(
                            clave
                        )
                    ) {

                        return false;

                    }


                    vistos.add(
                        clave
                    );

                    return true;

                }
            );

        }


        const legado = {

            nombre:
                registro.contactoAdicional || "",

            cargo:
                registro.contactoAdicionalCargo || "",

            telefono:
                registro.contactoAdicionalTelefono || "",

            correo:
                registro.contactoAdicionalCorreo || ""

        };


        if (
            legado.nombre ||
            legado.cargo ||
            legado.telefono ||
            legado.correo
        ) {

            return [legado];

        }


        return [];

    }


    function crearContactoAdminEscritorio(
        registro
    ) {

        const partes = [];


        if (
            registro.telefono
        ) {

            partes.push(`
                <span>
                    <i class="bi bi-telephone"></i>
                    ${escaparHTML(
                        registro.telefono
                    )}
                </span>
            `);

        }


        if (
            registro.whatsapp
        ) {

            partes.push(`
                <span>
                    <i class="bi bi-whatsapp"></i>
                    ${escaparHTML(
                        registro.whatsapp
                    )}
                </span>
            `);

        }


        if (
            registro.correo
        ) {

            partes.push(`
                <span class="correo-admin">
                    <i class="bi bi-envelope"></i>
                    ${escaparHTML(
                        registro.correo
                    )}
                </span>
            `);

        }


        const adicionales =
            obtenerContactosAdicionalesParaMostrar(
                registro
            );


        adicionales.forEach(
            contacto => {

                partes.push(`
                    <div class="contacto-adicional-admin-tabla">

                        ${
                            contacto.cargo
                                ? `
                                    <small>
                                        ${escaparHTML(
                                            contacto.cargo
                                        )}
                                    </small>
                                  `
                                : ""
                        }

                        ${
                            contacto.nombre
                                ? `
                                    <strong>
                                        <i class="bi bi-person-fill"></i>
                                        ${escaparHTML(
                                            contacto.nombre
                                        )}
                                    </strong>
                                  `
                                : ""
                        }

                        ${
                            contacto.telefono
                                ? `
                                    <span>
                                        <i class="bi bi-telephone"></i>
                                        ${escaparHTML(
                                            contacto.telefono
                                        )}
                                    </span>
                                  `
                                : ""
                        }

                        ${
                            contacto.correo
                                ? `
                                    <span class="correo-admin">
                                        <i class="bi bi-envelope"></i>
                                        ${escaparHTML(
                                            contacto.correo
                                        )}
                                    </span>
                                  `
                                : ""
                        }

                    </div>
                `);

            }
        );


        if (
            partes.length === 0
        ) {

            return `
                <span class="sin-informacion">
                    Sin información
                </span>
            `;

        }


        return partes.join("");

    }


    function crearContactoAdminMovil(
        registro
    ) {

        const partes = [];


        if (
            registro.telefono
        ) {

            partes.push(`
                <a
                    href="tel:${registro.telefono}"
                    class="dato-contacto-movil"
                >
                    <i class="bi bi-telephone"></i>
                    <span>
                        ${escaparHTML(
                            registro.telefono
                        )}
                    </span>
                </a>
            `);

        }


        if (
            registro.whatsapp
        ) {

            partes.push(`
                <a
                    href="https://wa.me/${registro.whatsapp}"
                    class="dato-contacto-movil"
                    target="_blank"
                >
                    <i class="bi bi-whatsapp"></i>
                    <span>
                        ${escaparHTML(
                            registro.whatsapp
                        )}
                    </span>
                </a>
            `);

        }


        if (
            registro.correo
        ) {

            partes.push(`
                <a
                    href="mailto:${registro.correo}"
                    class="dato-contacto-movil"
                >
                    <i class="bi bi-envelope"></i>
                    <span>
                        ${escaparHTML(
                            registro.correo
                        )}
                    </span>
                </a>
            `);

        }


        const adicionales =
            obtenerContactosAdicionalesParaMostrar(
                registro
            );


        adicionales.forEach(
            contacto => {

                partes.push(`
                    <div class="contacto-adicional-admin-movil">

                        ${
                            contacto.cargo
                                ? `
                                    <small>
                                        ${escaparHTML(
                                            contacto.cargo
                                        )}
                                    </small>
                                  `
                                : ""
                        }

                        ${
                            contacto.nombre
                                ? `
                                    <strong>
                                        <i class="bi bi-person-fill"></i>
                                        ${escaparHTML(
                                            contacto.nombre
                                        )}
                                    </strong>
                                  `
                                : ""
                        }

                        ${
                            contacto.telefono
                                ? `
                                    <a
                                        href="tel:${contacto.telefono}"
                                        class="dato-contacto-movil"
                                    >
                                        <i class="bi bi-telephone"></i>
                                        <span>
                                            ${escaparHTML(
                                                contacto.telefono
                                            )}
                                        </span>
                                    </a>
                                  `
                                : ""
                        }

                        ${
                            contacto.correo
                                ? `
                                    <a
                                        href="mailto:${contacto.correo}"
                                        class="dato-contacto-movil"
                                    >
                                        <i class="bi bi-envelope"></i>
                                        <span>
                                            ${escaparHTML(
                                                contacto.correo
                                            )}
                                        </span>
                                    </a>
                                  `
                                : ""
                        }

                    </div>
                `);

            }
        );


        if (
            partes.length === 0
        ) {

            return `
                <span class="sin-informacion">
                    Sin información
                </span>
            `;

        }


        return partes.join("");

    }


    /* =====================================================
       OCULTAR MENSAJES DE ESTADO
    ===================================================== */

    function ocultarMensajesEstado() {

        if (mensajeCargandoAdmin) {

            mensajeCargandoAdmin
                .classList
                .add("d-none");

        }

        if (mensajeAdminVacio) {

            mensajeAdminVacio
                .classList
                .add("d-none");

        }

        if (mensajeErrorAdmin) {

            mensajeErrorAdmin
                .classList
                .add("d-none");

        }

    }


    /* =====================================================
       COMPROBAR SI PERTENECE A UNA CATEGORÍA
    ===================================================== */

    function perteneceACategoria(
        registro,
        categoria
    ) {

        const lista =
            Array.isArray(registro.categorias)
                ? registro.categorias
                : [registro.categoria];

        return lista.includes(categoria);

    }


    /* =====================================================
       ACTUALIZAR CONTADORES
    ===================================================== */

    function actualizarContadores() {


        if (totalComisiones) {

            totalComisiones.textContent =
                registrosAdmin.filter(
                    registro =>
                        perteneceACategoria(
                            registro,
                            "comisiones"
                        )
                ).length;

        }


        if (totalMesas) {

            totalMesas.textContent =
                registrosAdmin.filter(
                    registro =>
                        perteneceACategoria(
                            registro,
                            "mesas"
                        )
                ).length;

        }


        if (totalRepresentantes) {

            totalRepresentantes.textContent =
                registrosAdmin.filter(
                    registro =>
                        perteneceACategoria(
                            registro,
                            "representantes"
                        )
                ).length;

        }


        if (totalInstituciones) {

            totalInstituciones.textContent =
                registrosAdmin.filter(
                    registro =>
                        perteneceACategoria(
                            registro,
                            "instituciones"
                        )
                ).length;

        }


        if (totalIntegrantesZonas) {

            totalIntegrantesZonas.textContent =
                registrosAdmin.filter(
                    registro =>
                        perteneceACategoria(
                            registro,
                            "integrantes-zonas"
                        )
                ).length;

        }

    }


    /* =====================================================
       CARGAR ESTADOS
    ===================================================== */

    function cargarEstadosSelect() {

        const estadoActual =
            filtroEstadoAdmin.value;


        const estados = [

            ...new Set(

                registrosAdmin

                    .map(registro =>
                        String(
                            registro.estado || ""
                        ).trim()
                    )

                    .filter(Boolean)

            )

        ];


        estados.sort(

            (a, b) =>
                a.localeCompare(
                    b,
                    "es",
                    {
                        sensitivity: "base"
                    }
                )

        );


        filtroEstadoAdmin.innerHTML = `

            <option value="todos">

                Todos los estados

            </option>

        `;


        estados.forEach(estado => {

            const opcion =
                document.createElement("option");

            opcion.value =
                estado;

            opcion.textContent =
                estado;

            filtroEstadoAdmin.appendChild(
                opcion
            );

        });


        filtroEstadoAdmin.value =
            estados.includes(estadoActual)
                ? estadoActual
                : "todos";

    }


    /* =====================================================
       RENDERIZAR REGISTROS
       ESCRITORIO Y MÓVIL
    ===================================================== */

    function renderizarRegistros(lista) {


        ocultarMensajesEstado();


        tablaAdmin.innerHTML =
            "";


        listaAdminMovil.innerHTML =
            "";


        contadorAdmin.textContent =
            `Registros encontrados: ${lista.length}`;


        if (lista.length === 0) {

            mensajeAdminVacio
                .classList
                .remove("d-none");

            return;

        }


        lista.forEach(
            (registro, index) => {


                const estaActivo =
                    registro.activo !== false;


                /* =============================================
                   CATEGORÍAS
                ============================================= */

                const categoriasArr =
                    Array.isArray(
                        registro.categorias
                    )
                        ? registro.categorias
                        : [registro.categoria];


                const badgesCategorias =
                    categoriasArr
                        .filter(Boolean)
                        .map(
                            categoria => `

                                <span class="etiqueta-categoria">

                                    ${escaparHTML(
                                        obtenerNombreCategoria(
                                            categoria
                                        )
                                    )}

                                </span>

                            `
                        )
                        .join(" ");


                /* =============================================
                   TABLA DE ESCRITORIO
                ============================================= */

                const fila =
                    document.createElement(
                        "tr"
                    );


                if (!estaActivo) {

                    fila.classList.add(
                        "registro-inactivo-admin"
                    );

                }


                fila.innerHTML = `

                    <td class="numero-admin">

                        ${index + 1}

                    </td>


                    <td>

                        <div class="lista-categorias-admin">

                            ${badgesCategorias}

                        </div>

                    </td>


                    <td>

                        <strong>

                            ${escaparHTML(
                                registro.estado ||
                                "Sin especif."
                            )}

                        </strong>


                        ${
                            registro.legislatura
                                ? `
                                    <span class="legislatura-admin">

                                        ${escaparHTML(
                                            registro.legislatura
                                        )}

                                    </span>
                                  `
                                : ""
                        }

                    </td>


                    <td>

                        <strong>

                            ${escaparHTML(
                                registro.nombre
                            )}

                        </strong>


                        <div
                            class="${
                                estaActivo
                                    ? "estado-activo-admin"
                                    : "estado-inactivo-admin"
                            }"
                        >

                            <i class="bi bi-circle-fill"></i>

                            ${
                                estaActivo
                                    ? "Activo"
                                    : "Inactivo"
                            }

                        </div>

                    </td>


                    <td>

                        <strong>

                            ${escaparHTML(
                                registro.cargo || ""
                            )}

                        </strong>


                        ${
                            registro.comision
                                ? `
                                    <span class="comision-admin">

                                        ${escaparHTML(
                                            registro.comision
                                        )}

                                    </span>
                                  `
                                : ""
                        }

                    </td>


                    <td>

                        ${escaparHTML(
                            registro.institucion ||
                            "-"
                        )}

                    </td>


                    <td>

                        <div class="contactos-admin">

                            ${crearContactoAdminEscritorio(
                                registro
                            )}

                        </div>

                    </td>


                    <td>

                        <div class="botones-acciones">


                            <button
                                type="button"
                                class="btn btn-editar-registro"
                                data-id="${registro.id}"
                                title="Editar"
                            >

                                <i class="bi bi-pencil-square"></i>

                            </button>


                            <button
                                type="button"
                                class="btn ${
                                    estaActivo
                                        ? "btn-desactivar-registro"
                                        : "btn-activar-registro"
                                }"
                                data-id="${registro.id}"
                                data-activo="${estaActivo}"
                                title="${
                                    estaActivo
                                        ? "Desactivar"
                                        : "Activar"
                                }"
                            >

                                <i
                                    class="bi ${
                                        estaActivo
                                            ? "bi-eye-slash"
                                            : "bi-eye"
                                    }"
                                ></i>

                            </button>


                            <button
                                type="button"
                                class="btn btn-eliminar-registro"
                                data-id="${registro.id}"
                                data-nombre="${escaparHTML(
                                    registro.nombre
                                )}"
                                title="Eliminar"
                            >

                                <i class="bi bi-trash"></i>

                            </button>


                        </div>

                    </td>

                `;


                tablaAdmin.appendChild(
                    fila
                );


                /* =============================================
                   TARJETA PARA CELULAR
                ============================================= */

                const tarjeta =
                    document.createElement(
                        "article"
                    );


                tarjeta.className = `

                    tarjeta-registro-movil

                    ${
                        !estaActivo
                            ? "registro-inactivo-movil"
                            : ""
                    }

                `;


                tarjeta.innerHTML = `

                    <div class="encabezado-registro-movil">


                        <div>

                            <span class="numero-registro-movil">

                                Registro #${index + 1}

                            </span>


                            <h3>

                                ${escaparHTML(
                                    registro.nombre
                                )}

                            </h3>

                        </div>


                        <span
                            class="${
                                estaActivo
                                    ? "estado-activo-movil"
                                    : "estado-inactivo-movil"
                            }"
                        >

                            <i class="bi bi-circle-fill"></i>

                            ${
                                estaActivo
                                    ? "Activo"
                                    : "Inactivo"
                            }

                        </span>


                    </div>



                    <div class="categorias-registro-movil">

                        ${badgesCategorias}

                    </div>



                    <dl class="datos-registro-movil">


                        <div>

                            <dt>
                                Estado
                            </dt>


                            <dd>

                                ${escaparHTML(
                                    registro.estado ||
                                    "Sin especificar"
                                )}


                                ${
                                    registro.legislatura
                                        ? `
                                            <span class="legislatura-movil">

                                                ${escaparHTML(
                                                    registro.legislatura
                                                )}

                                            </span>
                                          `
                                        : ""
                                }

                            </dd>

                        </div>



                        <div>

                            <dt>
                                Cargo / área
                            </dt>


                            <dd>

                                ${escaparHTML(
                                    registro.cargo ||
                                    "Sin cargo"
                                )}


                                ${
                                    registro.comision
                                        ? `
                                            <br>

                                            <small>

                                                ${escaparHTML(
                                                    registro.comision
                                                )}

                                            </small>
                                          `
                                        : ""
                                }

                            </dd>

                        </div>



                        <div>

                            <dt>
                                Institución
                            </dt>


                            <dd>

                                ${escaparHTML(
                                    registro.institucion ||
                                    "-"
                                )}

                            </dd>

                        </div>



                        <div>

                            <dt>
                                Contacto
                            </dt>


                            <dd class="contactos-registro-movil">

                                ${crearContactoAdminMovil(
                                    registro
                                )}

                            </dd>

                        </div>


                    </dl>



                    <div class="acciones-registro-movil">


                        <button
                            type="button"
                            class="btn btn-editar-registro"
                            data-id="${registro.id}"
                        >

                            <i class="bi bi-pencil-square"></i>

                            Editar

                        </button>


                        <button
                            type="button"
                            class="btn ${
                                estaActivo
                                    ? "btn-desactivar-registro"
                                    : "btn-activar-registro"
                            }"
                            data-id="${registro.id}"
                            data-activo="${estaActivo}"
                        >

                            <i
                                class="bi ${
                                    estaActivo
                                        ? "bi-eye-slash"
                                        : "bi-eye"
                                }"
                            ></i>

                            ${
                                estaActivo
                                    ? "Ocultar"
                                    : "Mostrar"
                            }

                        </button>


                        <button
                            type="button"
                            class="btn btn-eliminar-registro"
                            data-id="${registro.id}"
                            data-nombre="${escaparHTML(
                                registro.nombre
                            )}"
                        >

                            <i class="bi bi-trash"></i>

                            Eliminar

                        </button>


                    </div>

                `;


                listaAdminMovil.appendChild(
                    tarjeta
                );

            }
        );


        asignarEventosAcciones();

    }


    /* =====================================================
       FILTRAR REGISTROS
    ===================================================== */

    function filtrarRegistros() {


        const texto =
            normalizarTexto(
                buscadorAdmin.value
            );


        const categoriaSeleccionada =
            filtroCategoriaAdmin.value;


        const estadoSeleccionado =
            filtroEstadoAdmin.value;


        const filtrados =
            registrosAdmin.filter(
                registro => {


                    const categoriasArr =
                        Array.isArray(
                            registro.categorias
                        )
                            ? registro.categorias
                            : [registro.categoria];


                    const coincideCategoria =

                        categoriaSeleccionada ===
                            "todas"

                        ||

                        categoriasArr.includes(
                            categoriaSeleccionada
                        );


                    const coincideEstado =

                        estadoSeleccionado ===
                            "todos"

                        ||

                        registro.estado ===
                            estadoSeleccionado;


                    const contenido =
                        normalizarTexto(`

                            ${registro.nombre}

                            ${registro.estado}

                            ${registro.legislatura}

                            ${registro.cargo}

                            ${registro.comision}

                            ${registro.institucion}

                            ${registro.correo}

                            ${registro.telefono}

                            ${registro.whatsapp}

                        `);


                    const coincideBusqueda =

                        texto === ""

                        ||

                        contenido.includes(
                            texto
                        );


                    return (
                        coincideCategoria &&
                        coincideEstado &&
                        coincideBusqueda
                    );

                }
            );

const filtradosOrdenados = [...filtrados].sort((a, b) => {

    const nombreA = normalizarTexto(a.nombre)
        .replace(/^(dip\.?|lic\.?|dr\.?|dra\.?|mtro\.?|mtra\.?)\s+/i, "");

    const nombreB = normalizarTexto(b.nombre)
        .replace(/^(dip\.?|lic\.?|dr\.?|dra\.?|mtro\.?|mtra\.?)\s+/i, "");

    return nombreA.localeCompare(
        nombreB,
        "es",
        {
            sensitivity: "base"
        }
    );

});


renderizarRegistros(
    filtradosOrdenados
);
    }


    /* =====================================================
       ESCUCHAR FIRESTORE EN TIEMPO REAL
    ===================================================== */

    function escucharFirestore() {


        if (mensajeCargandoAdmin) {

            mensajeCargandoAdmin
                .classList
                .remove("d-none");

        }


        const referenciaDirectorio =
            collection(
                db,
                "directorio"
            );


        onSnapshot(

            referenciaDirectorio,


            snapshot => {


                registrosAdmin =
                    snapshot.docs.map(
                        documento => ({

                            id:
                                documento.id,

                            ...documento.data()

                        })
                    );


                actualizarContadores();

                cargarEstadosSelect();

                filtrarRegistros();

            },


            error => {


                console.error(
                    "Error al consultar Firestore:",
                    error
                );


                ocultarMensajesEstado();


                if (textoErrorAdmin) {

                    textoErrorAdmin.textContent =
                        "Error al conectar con la base de datos de Firestore.";

                }


                if (mensajeErrorAdmin) {

                    mensajeErrorAdmin
                        .classList
                        .remove("d-none");

                }

            }

        );

    }


    /* =====================================================
       ABRIR MODAL NUEVO
    ===================================================== */

    function abrirModalNuevo() {


        formRegistro.reset();


        registroId.value =
            "";


        tituloModalRegistro.textContent =
            "Agregar registro";


        textoBotonGuardar.textContent =
            "Guardar registro";


        mensajeFormulario
            .classList
            .add("d-none");


        checkboxesCategorias.forEach(
            checkbox => {

                checkbox.disabled = false;

                checkbox.checked =
                    false;

            }
        );


        activoRegistro.checked =
            true;


        cargarContactosAdicionales([]);

    }


    /* =====================================================
       ABRIR MODAL EDITAR
    ===================================================== */

    function abrirModalEditar(id) {


        const registro =
            registrosAdmin.find(
                elemento =>
                    elemento.id === id
            );


        if (!registro) {

            return;

        }


        formRegistro.reset();


        registroId.value =
            registro.id;


        tituloModalRegistro.textContent =
            "Editar registro";


        textoBotonGuardar.textContent =
            "Actualizar cambios";


        mensajeFormulario
            .classList
            .add("d-none");


        categoriaRegistro.value =
            registro.categoria ||
            "";


        estadoRegistro.value =
            registro.estado ||
            "";


        legislaturaRegistro.value =
            registro.legislatura ||
            "";


        nombreRegistro.value =
            registro.nombre ||
            "";


        cargoRegistro.value =
            registro.cargo ||
            "";


        comisionRegistro.value =
            registro.comision ||
            "";


        institucionRegistro.value =
            registro.institucion ||
            "";


        telefonoRegistro.value =
            registro.telefono ||
            "";


        whatsappRegistro.value =
            registro.whatsapp ||
            "";


        correoRegistro.value =
            registro.correo ||
            "";


        correosAdicionalesRegistro.value =
            Array.isArray(
                registro.correosAdicionales
            )
                ? registro.correosAdicionales.join(", ")
                : registro.correosAdicionales || "";


        cargarContactosAdicionales(
            obtenerContactosRegistro(registro)
        );


        activoRegistro.checked =
            registro.activo !== false;


        const categoriasRelacionadas =
            Array.isArray(
                registro.categorias
            )
                ? registro.categorias
                : [registro.categoria];


        checkboxesCategorias.forEach(
            checkbox => {

                checkbox.disabled = false;

                checkbox.checked =
                    categoriasRelacionadas.includes(
                        checkbox.value
                    );

            }
        );


        modalRegistroBS.show();

    }


    /* =====================================================
       GUARDAR / ACTUALIZAR REGISTRO
    ===================================================== */

    formRegistro.addEventListener(
        "submit",
        async evento => {


            evento.preventDefault();


            const idDocumento =
                registroId.value;


            let categoriaPrincipal =
                categoriaRegistro.value;


            /* =============================================
               RECUPERAR CATEGORÍAS SELECCIONADAS

               Las casillas representan exactamente las
               secciones donde aparecerá el registro.

               Ejemplo:
               - Si "Comisiones" queda desmarcada
               - y "Mesas Directivas" queda marcada,
                 el registro deja de contarse en Comisiones
                 y queda solamente en Mesas Directivas.
            ============================================= */

            let categoriasSeleccionadas =
                Array.from(
                    checkboxesCategorias
                )
                    .filter(
                        checkbox =>
                            checkbox.checked
                    )
                    .map(
                        checkbox =>
                            checkbox.value
                    );


            /*
               Si no se marcó ninguna casilla, conservar la
               categoría elegida en el selector para evitar
               dejar el registro sin sección.
            */

            if (
                categoriasSeleccionadas.length === 0 &&
                categoriaPrincipal
            ) {

                categoriasSeleccionadas =
                    [categoriaPrincipal];

            }


            /*
               Si la categoría principal fue desmarcada,
               la primera categoría que siga marcada pasa a
               ser la principal automáticamente.
            */

            if (
                categoriasSeleccionadas.length > 0 &&
                !categoriasSeleccionadas.includes(
                    categoriaPrincipal
                )
            ) {

                categoriaPrincipal =
                    categoriasSeleccionadas[0];

                categoriaRegistro.value =
                    categoriaPrincipal;

            }


            /* =============================================
               CONTACTOS ADICIONALES
            ============================================= */

            const contactosAdicionales =
                obtenerContactosAdicionalesFormulario();


            const primerContactoAdicional =
                contactosAdicionales[0] || {
                    nombre: "",
                    cargo: "",
                    telefono: "",
                    correo: ""
                };


            /* =============================================
               DATOS A GUARDAR
            ============================================= */

            const datos = {


                categoria:
                    categoriaPrincipal,


                categorias:
                    categoriasSeleccionadas,


                estado:
                    estadoRegistro
                        .value
                        .trim(),


                legislatura:
                    legislaturaRegistro
                        .value
                        .trim(),


                nombre:
                    nombreRegistro
                        .value
                        .trim(),


                cargo:
                    cargoRegistro
                        .value
                        .trim(),


                comision:
                    comisionRegistro
                        .value
                        .trim(),


                institucion:
                    institucionRegistro
                        .value
                        .trim(),


                telefono:
                    telefonoRegistro
                        .value
                        .trim(),


                whatsapp:
                    whatsappRegistro
                        .value
                        .trim(),


                correo:
                    correoRegistro
                        .value
                        .trim(),


                correosAdicionales:
                    [
                        ...new Set(
                            correosAdicionalesRegistro
                                .value
                                .split(/[,;\n]+/)
                                .map(
                                    correo =>
                                        correo
                                            .trim()
                                            .toLowerCase()
                                )
                                .filter(Boolean)
                        )
                    ],


                contactosAdicionales:
                    contactosAdicionales,


                /*
                   Compatibilidad con el formato anterior:
                   el primer contacto también se conserva
                   en los campos antiguos.
                */

                contactoAdicional:
                    primerContactoAdicional.nombre,


                contactoAdicionalCargo:
                    primerContactoAdicional.cargo,


                contactoAdicionalTelefono:
                    primerContactoAdicional.telefono,


                contactoAdicionalCorreo:
                    primerContactoAdicional.correo,


                activo:
                    activoRegistro.checked,


                actualizadoEn:
                    serverTimestamp()

            };


            try {


                if (idDocumento) {


                    await updateDoc(

                        doc(
                            db,
                            "directorio",
                            idDocumento
                        ),

                        datos

                    );


                } else {


                    datos.creadoEn =
                        serverTimestamp();


                    await addDoc(

                        collection(
                            db,
                            "directorio"
                        ),

                        datos

                    );

                }


                modalRegistroBS.hide();


                /*
                   onSnapshot actualizará automáticamente la tabla,
                   los filtros y los contadores de categorías.
                */

                mostrarNotificacionGuardado(
                    idDocumento
                        ? "Registro actualizado correctamente."
                        : "Registro agregado correctamente.",
                    "success"
                );


            } catch (error) {


                console.error(
                    "Error al guardar en Firestore:",
                    error
                );


                mensajeFormulario.textContent =
                    "Error al guardar el registro. Inténtalo de nuevo.";


                mensajeFormulario.className =
                    "alert alert-danger mt-4";


                mensajeFormulario
                    .classList
                    .remove("d-none");

            }

        }
    );


    /* =====================================================
       ASIGNAR EVENTOS A LOS BOTONES
    ===================================================== */

    function asignarEventosAcciones() {


        document
            .querySelectorAll(
                ".btn-editar-registro"
            )
            .forEach(
                boton => {


                    boton.addEventListener(
                        "click",
                        () => {


                            abrirModalEditar(
                                boton.dataset.id
                            );

                        }
                    );

                }
            );


        document
            .querySelectorAll(
                ".btn-activar-registro, .btn-desactivar-registro"
            )
            .forEach(
                boton => {


                    boton.addEventListener(
                        "click",
                        async () => {


                            const id =
                                boton.dataset.id;


                            const estadoActual =
                                boton.dataset.activo ===
                                "true";


                            try {


                                await updateDoc(

                                    doc(
                                        db,
                                        "directorio",
                                        id
                                    ),

                                    {

                                        activo:
                                            !estadoActual,

                                        actualizadoEn:
                                            serverTimestamp()

                                    }

                                );


                            } catch (error) {


                                console.error(
                                    "Error al cambiar estado:",
                                    error
                                );

                            }

                        }
                    );

                }
            );


        document
            .querySelectorAll(
                ".btn-eliminar-registro"
            )
            .forEach(
                boton => {


                    boton.addEventListener(
                        "click",
                        () => {


                            registroIdEliminar.value =
                                boton.dataset.id;


                            nombreRegistroEliminar.textContent =
                                boton.dataset.nombre ||
                                "este registro";


                            modalEliminarBS.show();

                        }
                    );

                }
            );

    }


    /* =====================================================
       CONFIRMAR ELIMINACIÓN
    ===================================================== */

    btnConfirmarEliminar.addEventListener(
        "click",
        async () => {


            const id =
                registroIdEliminar.value;


            if (!id) {

                return;

            }


            try {


                await deleteDoc(

                    doc(
                        db,
                        "directorio",
                        id
                    )

                );


                modalEliminarBS.hide();


            } catch (error) {


                console.error(
                    "Error al eliminar registro:",
                    error
                );


                alert(
                    "No fue posible eliminar el registro."
                );

            }

        }
    );


    /* =====================================================
       EVENTOS DE FILTROS
    ===================================================== */

    buscadorAdmin.addEventListener(
        "input",
        filtrarRegistros
    );


    filtroCategoriaAdmin.addEventListener(
        "change",
        filtrarRegistros
    );


    filtroEstadoAdmin.addEventListener(
        "change",
        filtrarRegistros
    );


    /* =====================================================
       LIMPIAR FILTROS
    ===================================================== */

    btnLimpiarAdmin.addEventListener(
        "click",
        () => {


            buscadorAdmin.value =
                "";


            filtroCategoriaAdmin.value =
                "todas";


            filtroEstadoAdmin.value =
                "todos";


            tarjetasResumen.forEach(
                tarjeta => {

                    tarjeta
                        .classList
                        .remove("activa");

                }
            );


            filtrarRegistros();

        }
    );


    /* =====================================================
       FILTRAR DESDE TARJETAS
    ===================================================== */

    tarjetasResumen.forEach(
        tarjeta => {


            tarjeta.addEventListener(
                "click",
                () => {


                    const categoria =
                        tarjeta.dataset.categoria;


                    buscadorAdmin.value =
                        "";


                    filtroCategoriaAdmin.value =
                        categoria;


                    filtroEstadoAdmin.value =
                        "todos";


                    tarjetasResumen.forEach(
                        elemento => {


                            elemento.classList.toggle(

                                "activa",

                                elemento === tarjeta

                            );

                        }
                    );


                    filtrarRegistros();

                }
            );

        }
    );


    /* =====================================================
       CAMBIO DE CATEGORÍA PRINCIPAL

       Ninguna casilla se bloquea. Al seleccionar una categoría
       principal, su casilla se marca automáticamente; después
       puede desmarcarse si el registro se moverá por completo
       a otra sección.
    ===================================================== */

    categoriaRegistro.addEventListener(
        "change",
        () => {

            const categoriaElegida =
                categoriaRegistro.value;

            checkboxesCategorias.forEach(
                checkbox => {

                    checkbox.disabled = false;

                    if (
                        categoriaElegida &&
                        checkbox.value === categoriaElegida
                    ) {

                        checkbox.checked = true;

                    }

                }
            );

        }
    );


    /* =====================================================
       NUEVO REGISTRO
    ===================================================== */

    const btnNuevoRegistro =
        document.getElementById(
            "btnNuevoRegistro"
        );


    if (btnNuevoRegistro) {


        btnNuevoRegistro.addEventListener(
            "click",
            abrirModalNuevo
        );

    }


    /* =====================================================
       VERIFICACIÓN DE AUTENTICACIÓN
    ===================================================== */

    onAuthStateChanged(
        auth,
        usuario => {


            if (!usuario) {


                window.location.replace(
                    "index.html"
                );


                return;

            }


            correoUsuarioAdmin.textContent =
                usuario.email ||
                "Administrador autorizado";


            pantallaCargaAdmin
                .classList
                .add("d-none");


            panelAdministracion
                .classList
                .remove("d-none");


            escucharFirestore();

        }
    );


    /* =====================================================
       CERRAR SESIÓN
    ===================================================== */

    btnCerrarSesion.addEventListener(
        "click",
        async () => {


            if (
                !window.confirm(
                    "¿Deseas cerrar la sesión administrativa?"
                )
            ) {

                return;

            }


            try {


                await signOut(
                    auth
                );


                window.location.replace(
                    "index.html"
                );


            } catch (error) {


                console.error(
                    "Error al cerrar sesión:",
                    error
                );


                alert(
                    "Ocurrió un problema al cerrar la sesión."
                );

            }

        }
    );


});