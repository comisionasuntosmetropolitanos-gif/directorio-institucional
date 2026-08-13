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

    const contactoAdicionalRegistro =
        document.getElementById("contactoAdicionalRegistro");

    const contactoAdicionalCargoRegistro =
        document.getElementById("contactoAdicionalCargoRegistro");

    const contactoAdicionalTelefonoRegistro =
        document.getElementById("contactoAdicionalTelefonoRegistro");

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


                            ${
                                registro.telefono
                                    ? `
                                        <span>

                                            <i class="bi bi-telephone"></i>

                                            ${escaparHTML(
                                                registro.telefono
                                            )}

                                        </span>
                                      `
                                    : ""
                            }


                            ${
                                registro.whatsapp
                                    ? `
                                        <span>

                                            <i class="bi bi-whatsapp"></i>

                                            ${escaparHTML(
                                                registro.whatsapp
                                            )}

                                        </span>
                                      `
                                    : ""
                            }


                            ${
                                registro.correo
                                    ? `
                                        <span class="correo-admin">

                                            <i class="bi bi-envelope"></i>

                                            ${escaparHTML(
                                                registro.correo
                                            )}

                                        </span>
                                      `
                                    : ""
                            }


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


                                ${
                                    registro.telefono
                                        ? `
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
                                          `
                                        : ""
                                }


                                ${
                                    registro.whatsapp
                                        ? `
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
                                          `
                                        : ""
                                }


                                ${
                                    registro.correo
                                        ? `
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
                                          `
                                        : ""
                                }


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


        renderizarRegistros(
            filtrados
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

                checkbox.checked =
                    false;

            }
        );


        activoRegistro.checked =
            true;

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
            registro.correosAdicionales ||
            "";


        contactoAdicionalRegistro.value =
            registro.contactoAdicional ||
            "";


        contactoAdicionalCargoRegistro.value =
            registro.contactoAdicionalCargo ||
            "";


        contactoAdicionalTelefonoRegistro.value =
            registro.contactoAdicionalTelefono ||
            "";


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


            const categoriaPrincipal =
                categoriaRegistro.value;


            /* =============================================
               RECUPERAR CATEGORÍAS SELECCIONADAS
            ============================================= */

            const categoriasSeleccionadas =
                [categoriaPrincipal];


            checkboxesCategorias.forEach(
                checkbox => {


                    if (
                        checkbox.checked &&
                        !categoriasSeleccionadas.includes(
                            checkbox.value
                        )
                    ) {

                        categoriasSeleccionadas.push(
                            checkbox.value
                        );

                    }

                }
            );


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
                    correosAdicionalesRegistro
                        .value
                        .trim(),


                contactoAdicional:
                    contactoAdicionalRegistro
                        .value
                        .trim(),


                contactoAdicionalCargo:
                    contactoAdicionalCargoRegistro
                        .value
                        .trim(),


                contactoAdicionalTelefono:
                    contactoAdicionalTelefonoRegistro
                        .value
                        .trim(),


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