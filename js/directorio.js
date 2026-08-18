/* =========================================================
   DIRECTORIO INSTITUCIONAL
   Consulta protegida y conexión con Cloud Firestore
========================================================= */


/* =========================================================
   IMPORTAR CONFIGURACIÓN DE FIREBASE
========================================================= */

import {
    auth,
    db
} from "./firebase-config.js";


/* =========================================================
   IMPORTAR FUNCIONES DE FIREBASE AUTHENTICATION
========================================================= */

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/* =========================================================
   IMPORTAR FUNCIONES DE CLOUD FIRESTORE
========================================================= */

import {
    collection,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* =========================================================
   ESPERAR A QUE EL HTML TERMINE DE CARGAR
========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       ELEMENTOS GENERALES
    ===================================================== */

    const pantallaCarga =
        document.getElementById("pantallaCarga");

    const contenidoDirectorio =
        document.getElementById("contenidoDirectorio");

    const correoUsuario =
        document.getElementById("correoUsuario");

    const btnAdministrar =
        document.getElementById("btnAdministrar");

    const btnCerrarSesion =
        document.getElementById("btnCerrarSesion");


    /* =====================================================
       BUSCADOR Y FILTROS
    ===================================================== */

    const buscador =
        document.getElementById("buscador");

    const filtroCategoria =
        document.getElementById("filtroCategoria");

    const filtroEstado =
        document.getElementById("filtroEstado");

    const btnLimpiar =
        document.getElementById("btnLimpiar");

    const btnImprimir =
        document.getElementById("btnImprimir");


    /* =====================================================
       TABLA
    ===================================================== */

    const tablaDirectorio =
        document.getElementById("tablaDirectorio");

    const contadorResultados =
        document.getElementById("contadorResultados");

    const fechaActualizacion =
        document.getElementById("fechaActualizacion");

    const mensajeCargando =
        document.getElementById("mensajeCargando");

    const mensajeSinResultados =
        document.getElementById("mensajeSinResultados");

    const mensajeError =
        document.getElementById("mensajeError");

    const textoError =
        document.getElementById("textoError");


    /* =====================================================
       CONTADORES
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

    const tarjetasCategoria =
        document.querySelectorAll(".tarjeta-clic");


    /* =====================================================
       REGISTROS
    ===================================================== */

    let registrosDirectorio = [];


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
       PREPARAR TELÉFONO
    ===================================================== */

    function prepararNumeroTelefono(numero) {

        return String(numero || "")
            .replace(/[^\d+]/g, "");

    }


    /* =====================================================
       PREPARAR WHATSAPP
    ===================================================== */

    function prepararNumeroWhatsApp(numero) {

        let numeroLimpio =
            String(numero || "")
                .replace(/\D/g, "");


        if (numeroLimpio.length === 10) {

            numeroLimpio =
                `52${numeroLimpio}`;

        }


        if (
            numeroLimpio.length === 13 &&
            numeroLimpio.startsWith("521")
        ) {

            numeroLimpio =
                `52${numeroLimpio.substring(3)}`;

        }


        return numeroLimpio;

    }


    /* =====================================================
       NOMBRE DE CATEGORÍA
    ===================================================== */

    function obtenerNombreCategoria(categoria) {

        const categorias = {

            comisiones:
                "Comisiones",

            mesas:
                "Mesas Directivas",

            representantes:
                "Representantes",

            instituciones:
                "Instituciones",

            "integrantes-zonas":
                "Integrantes de Comisión de Zonas Metropolitanas"

        };


        return categorias[categoria] ||
            "Sin categoría";

    }


    /* =====================================================
       MENSAJES DE TABLA
    ===================================================== */

    function ocultarMensajesTabla() {

        if (mensajeCargando) {
            mensajeCargando.classList.add("d-none");
        }

        if (mensajeSinResultados) {
            mensajeSinResultados.classList.add("d-none");
        }

        if (mensajeError) {
            mensajeError.classList.add("d-none");
        }

    }


    function mostrarError(mensaje) {

        tablaDirectorio.innerHTML = "";

        ocultarMensajesTabla();

        if (textoError) {
            textoError.textContent = mensaje;
        }

        if (mensajeError) {
            mensajeError.classList.remove("d-none");
        }

    }


    /* =====================================================
       ESTADO / LEGISLATURA
    ===================================================== */

    function crearEstadoLegislatura(registro) {

        const estado =
            escaparHTML(registro.estado) ||
            "Sin especificar";


        const legislatura =
            registro.legislatura
                ? `
                    <span class="legislatura">
                        ${escaparHTML(registro.legislatura)}
                    </span>
                  `
                : "";


        return `
            <strong>${estado}</strong>
            ${legislatura}
        `;

    }


    /* =====================================================
       CARGO / COMISIÓN
    ===================================================== */

    function crearCargoComision(registro) {

        const cargo =
            registro.cargo
                ? `
                    <strong>
                        ${escaparHTML(registro.cargo)}
                    </strong>
                  `
                : "";


        const comision =
            registro.comision
                ? `
                    <span class="texto-comision">
                        ${escaparHTML(registro.comision)}
                    </span>
                  `
                : "";


        if (!cargo && !comision) {

            return `
                <span class="sin-informacion">
                    Sin información
                </span>
            `;

        }


        return `
            ${cargo}
            ${comision}
        `;

    }


    /* =====================================================
       CREAR TELÉFONO COMO ENLACE
    ===================================================== */

    function crearTelefonoHTML(
        telefono,
        titulo = "Llamar"
    ) {

        if (!telefono) {
            return "";
        }


        const numero =
            prepararNumeroTelefono(telefono);


        /*
           Si solamente tenemos una extensión o un texto
           especial, lo mostramos sin crear enlace telefónico.
        */

        if (!numero) {

            return `
                <span class="enlace-contacto">
                    <i class="bi bi-telephone"></i>

                    <span>
                        ${escaparHTML(telefono)}
                    </span>
                </span>
            `;

        }


        return `
            <a
                href="tel:${numero}"
                class="enlace-contacto"
                title="${escaparHTML(titulo)}"
            >
                <i class="bi bi-telephone-fill"></i>

                <span>
                    ${escaparHTML(telefono)}
                </span>
            </a>
        `;

    }


    /* =====================================================
       CREAR CORREO COMO ENLACE
    ===================================================== */

    function crearCorreoHTML(
        correo,
        titulo = "Enviar correo electrónico"
    ) {

        if (!correo) {
            return "";
        }


        return `
            <a
                href="mailto:${escaparHTML(correo)}"
                class="enlace-contacto correo-contacto"
                title="${escaparHTML(titulo)}"
            >
                <i class="bi bi-envelope-fill"></i>

                <span>
                    ${escaparHTML(correo)}
                </span>
            </a>
        `;

    }


    /* =====================================================
       CREAR CONTACTO ADICIONAL
    ===================================================== */

    function crearContactoAdicionalHTML(contacto) {

        if (!contacto) {
            return "";
        }


        const nombre =
            String(contacto.nombre || "").trim();

        const cargo =
            String(contacto.cargo || "").trim();

        const telefono =
            String(contacto.telefono || "").trim();

        const correo =
            String(contacto.correo || "").trim();


        if (
            !nombre &&
            !cargo &&
            !telefono &&
            !correo
        ) {

            return "";

        }


        return `
            <div class="contacto-adicional-directorio">

                ${
                    cargo
                        ? `
                            <span class="cargo-contacto-adicional">
                                ${escaparHTML(cargo)}
                            </span>
                          `
                        : ""
                }


                ${
                    nombre
                        ? `
                            <strong class="nombre-contacto-adicional">
                                <i class="bi bi-person-fill"></i>
                                ${escaparHTML(nombre)}
                            </strong>
                          `
                        : ""
                }


                ${
                    telefono
                        ? crearTelefonoHTML(
                            telefono,
                            `Llamar a ${nombre || "contacto"}`
                        )
                        : ""
                }


                ${
                    correo
                        ? crearCorreoHTML(
                            correo,
                            `Enviar correo a ${nombre || "contacto"}`
                        )
                        : ""
                }

            </div>
        `;

    }


    /* =====================================================
       COLUMNA CONTACTO
    ===================================================== */

    function crearContacto(registro) {

        const contactosPrincipales = [];

        const contactosExtras = [];


        /* =================================================
           TELÉFONO PRINCIPAL
        ================================================= */

        if (registro.telefono) {

            contactosPrincipales.push(
                crearTelefonoHTML(
                    registro.telefono
                )
            );

        }


        /* =================================================
           WHATSAPP
        ================================================= */

        if (registro.whatsapp) {

            const numeroWhatsApp =
                prepararNumeroWhatsApp(
                    registro.whatsapp
                );


            if (numeroWhatsApp.length >= 10) {

                contactosPrincipales.push(`
                    <a
                        href="https://wa.me/${numeroWhatsApp}"
                        class="enlace-contacto"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Abrir WhatsApp"
                    >
                        <i class="bi bi-whatsapp"></i>

                        <span>
                            ${escaparHTML(registro.whatsapp)}
                        </span>
                    </a>
                `);

            }

        }


        /* =================================================
           CORREO PRINCIPAL
        ================================================= */

        if (registro.correo) {

            contactosPrincipales.push(
                crearCorreoHTML(
                    registro.correo
                )
            );

        }


        /* =================================================
           CORREOS ADICIONALES

           Admite:
           correo1@...
           correo1@..., correo2@...
           correo1@...; correo2@...
        ================================================= */

        if (registro.correosAdicionales) {

            let listaCorreos = [];


            if (
                Array.isArray(
                    registro.correosAdicionales
                )
            ) {

                listaCorreos =
                    registro.correosAdicionales;

            } else {

                listaCorreos =
                    String(
                        registro.correosAdicionales
                    )
                        .split(/[;,]/);

            }


            listaCorreos
                .map(correo =>
                    String(correo || "").trim()
                )
                .filter(Boolean)
                .forEach(correo => {

                    contactosPrincipales.push(
                        crearCorreoHTML(
                            correo,
                            "Correo adicional"
                        )
                    );

                });

        }


        /* =================================================
           CONTACTOS ADICIONALES

           IMPORTANTE:
           El panel Admin guarda el primer contacto adicional
           en dos lugares por compatibilidad:

           1) contactosAdicionales[]
           2) contactoAdicional / contactoAdicionalCargo /
              contactoAdicionalTelefono / contactoAdicionalCorreo

           Si el Directorio muestra ambos formatos al mismo
           tiempo, el primer contacto aparece duplicado.

           SOLUCIÓN:
           - Si existe contactosAdicionales[] y tiene datos,
             se utiliza SOLO ese arreglo.
           - Los campos antiguos se usan únicamente como
             respaldo para registros viejos que todavía no
             tengan el arreglo nuevo.
           - También se eliminan duplicados dentro del propio
             arreglo, por seguridad.
        ================================================= */

        const contactosNuevos =
            Array.isArray(
                registro.contactosAdicionales
            )
                ? registro.contactosAdicionales
                    .filter(contacto => {

                        if (!contacto) {
                            return false;
                        }

                        return Boolean(
                            String(contacto.nombre || "").trim() ||
                            String(contacto.cargo || "").trim() ||
                            String(contacto.telefono || "").trim() ||
                            String(contacto.correo || "").trim()
                        );

                    })
                : [];


        if (
            contactosNuevos.length > 0
        ) {

            const clavesContactos =
                new Set();


            contactosNuevos
                .forEach(contacto => {

                    const clave =
                        [
                            contacto.nombre,
                            contacto.cargo,
                            contacto.telefono,
                            contacto.correo
                        ]
                            .map(valor =>
                                normalizarTexto(
                                    valor
                                )
                            )
                            .join("|");


                    if (
                        clavesContactos.has(
                            clave
                        )
                    ) {

                        return;

                    }


                    clavesContactos.add(
                        clave
                    );


                    const html =
                        crearContactoAdicionalHTML(
                            contacto
                        );


                    if (html) {

                        contactosExtras.push(
                            html
                        );

                    }

                });

        } else {

            /*
               Compatibilidad con registros antiguos:
               solo se utiliza este bloque cuando NO existe
               ningún contacto dentro de contactosAdicionales[].
            */

            if (
                registro.contactoAdicional ||
                registro.contactoAdicionalCargo ||
                registro.contactoAdicionalTelefono ||
                registro.contactoAdicionalCorreo
            ) {

                const html =
                    crearContactoAdicionalHTML({

                        nombre:
                            registro.contactoAdicional,

                        cargo:
                            registro.contactoAdicionalCargo,

                        telefono:
                            registro.contactoAdicionalTelefono,

                        correo:
                            registro.contactoAdicionalCorreo

                    });


                if (html) {

                    contactosExtras.push(
                        html
                    );

                }

            }

        }


        /* =================================================
           SIN INFORMACIÓN
        ================================================= */

        if (
            contactosPrincipales.length === 0 &&
            contactosExtras.length === 0
        ) {

            return `
                <span class="sin-informacion">
                    Sin información
                </span>
            `;

        }


        /* =================================================
           RESULTADO
        ================================================= */

        return `
            <div class="lista-contactos">

                ${
                    contactosPrincipales.join("")
                }


                ${
                    contactosExtras.length > 0
                        ? `
                            <div class="contactos-adicionales-directorio">

                                ${contactosExtras.join("")}

                            </div>
                          `
                        : ""
                }

            </div>
        `;

    }


    /* =====================================================
       PERTENECE A CATEGORÍA
    ===================================================== */

    function perteneceACategoria(
        registro,
        categoria
    ) {

        const categoriasRegistro =
            Array.isArray(registro.categorias)
                ? registro.categorias
                : [registro.categoria];


        return categoriasRegistro.includes(
            categoria
        );

    }


    /* =====================================================
       ACTUALIZAR CONTADORES
    ===================================================== */

    function actualizarContadores() {


        if (totalComisiones) {

            totalComisiones.textContent =
                registrosDirectorio.filter(
                    registro =>
                        perteneceACategoria(
                            registro,
                            "comisiones"
                        )
                ).length;

        }


        if (totalMesas) {

            totalMesas.textContent =
                registrosDirectorio.filter(
                    registro =>
                        perteneceACategoria(
                            registro,
                            "mesas"
                        )
                ).length;

        }


        if (totalRepresentantes) {

            totalRepresentantes.textContent =
                registrosDirectorio.filter(
                    registro =>
                        perteneceACategoria(
                            registro,
                            "representantes"
                        )
                ).length;

        }


        if (totalInstituciones) {

            totalInstituciones.textContent =
                registrosDirectorio.filter(
                    registro =>
                        perteneceACategoria(
                            registro,
                            "instituciones"
                        )
                ).length;

        }


        if (totalIntegrantesZonas) {

            totalIntegrantesZonas.textContent =
                registrosDirectorio.filter(
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

    function cargarEstados() {

        const estadoSeleccionado =
            filtroEstado.value;


        const estados = [

            ...new Set(

                registrosDirectorio

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


        filtroEstado.innerHTML = `
            <option value="todos">
                Todos los estados
            </option>
        `;


        estados.forEach(estado => {

            const opcion =
                document.createElement(
                    "option"
                );


            opcion.value =
                estado;

            opcion.textContent =
                estado;


            filtroEstado.appendChild(
                opcion
            );

        });


        filtroEstado.value =
            estados.includes(
                estadoSeleccionado
            )
                ? estadoSeleccionado
                : "todos";

    }


    /* =====================================================
       ACTUALIZAR FECHA
    ===================================================== */

    function actualizarFecha() {

        const fechasValidas =
            registrosDirectorio

                .map(registro => {

                    const fecha =
                        registro.actualizadoEn ||
                        registro.creadoEn;


                    if (
                        fecha &&
                        typeof fecha.toDate ===
                            "function"
                    ) {

                        return fecha.toDate();

                    }


                    if (
                        fecha instanceof Date
                    ) {

                        return fecha;

                    }


                    return null;

                })

                .filter(Boolean);


        if (
            fechasValidas.length === 0
        ) {

            fechaActualizacion.textContent =
                "Última actualización: sin información";

            return;

        }


        const fechaMasReciente =
            new Date(

                Math.max(

                    ...fechasValidas.map(
                        fecha =>
                            fecha.getTime()
                    )

                )

            );


        const textoFecha =
            fechaMasReciente
                .toLocaleDateString(
                    "es-MX",
                    {
                        day: "2-digit",
                        month: "long",
                        year: "numeric"
                    }
                );


        fechaActualizacion.textContent =
            `Última actualización: ${textoFecha}`;

    }


    /* =====================================================
       ORDENAR REGISTROS
    ===================================================== */
function ordenarRegistros(registros) {

    return [...registros].sort(
        (a, b) => {

            /* =============================================
               QUITAR "DIP." PARA ORDENAR POR EL NOMBRE REAL
            ============================================= */

            const nombreA =
                String(a.nombre || "")
                    .replace(/^Dip\.?\s*/i, "")
                    .trim();

            const nombreB =
                String(b.nombre || "")
                    .replace(/^Dip\.?\s*/i, "")
                    .trim();


            /* =============================================
               ORDEN ALFABÉTICO POR NOMBRE
            ============================================= */

            const comparacionNombre =
                nombreA.localeCompare(
                    nombreB,
                    "es",
                    {
                        sensitivity: "base"
                    }
                );


            if (comparacionNombre !== 0) {

                return comparacionNombre;

            }


            /* =============================================
               SI DOS NOMBRES FUERAN IGUALES,
               ORDENAR POR ESTADO
            ============================================= */

            return String(
                a.estado || ""
            ).localeCompare(
                String(
                    b.estado || ""
                ),
                "es",
                {
                    sensitivity: "base"
                }
            );

        }
    );

}
    /* =====================================================
       MOSTRAR REGISTROS
    ===================================================== */

    function mostrarRegistros(registros) {

        tablaDirectorio.innerHTML = "";

        ocultarMensajesTabla();


        const registrosOrdenados =
            ordenarRegistros(
                registros
            );


        contadorResultados.textContent =
            `Registros encontrados: ${registrosOrdenados.length}`;


        if (
            registrosOrdenados.length === 0
        ) {

            mensajeSinResultados
                .classList
                .remove("d-none");

            return;

        }


        registrosOrdenados.forEach(
            (registro, indice) => {


                const fila =
                    document.createElement(
                        "tr"
                    );


                fila.innerHTML = `

                    <td class="numero-registro">
                        ${indice + 1}
                    </td>


                    <td>
                        ${crearEstadoLegislatura(
                            registro
                        )}
                    </td>


                    <td>

                        <strong>
                            ${
                                escaparHTML(
                                    registro.nombre
                                ) ||
                                "Sin nombre"
                            }
                        </strong>


                        <span
                            class="categoria-registro-publico"
                        >
                            ${
                                escaparHTML(
                                    obtenerNombreCategoria(
                                        registro.categoria
                                    )
                                )
                            }
                        </span>

                    </td>


                    <td>
                        ${crearCargoComision(
                            registro
                        )}
                    </td>


                    <td>
                        ${
                            escaparHTML(
                                registro.institucion
                            ) ||
                            "Sin especificar"
                        }
                    </td>


                    <td>
                        ${crearContacto(
                            registro
                        )}
                    </td>

                `;


                tablaDirectorio.appendChild(
                    fila
                );

            }
        );

    }


    /* =====================================================
       OBTENER TEXTO DE CONTACTOS ADICIONALES
       PARA EL BUSCADOR
    ===================================================== */

    function obtenerTextoContactosAdicionales(
        registro
    ) {

        const textos = [];


        /* CONTACTO ADICIONAL ANTIGUO */

        textos.push(
            registro.contactoAdicional || ""
        );

        textos.push(
            registro.contactoAdicionalCargo || ""
        );

        textos.push(
            registro.contactoAdicionalTelefono || ""
        );

        textos.push(
            registro.contactoAdicionalCorreo || ""
        );


        /* CORREOS ADICIONALES */

        if (
            Array.isArray(
                registro.correosAdicionales
            )
        ) {

            textos.push(
                registro.correosAdicionales.join(
                    " "
                )
            );

        } else {

            textos.push(
                registro.correosAdicionales || ""
            );

        }


        /* VARIOS CONTACTOS */

        if (
            Array.isArray(
                registro.contactosAdicionales
            )
        ) {

            registro.contactosAdicionales
                .forEach(contacto => {

                    if (!contacto) {
                        return;
                    }


                    textos.push(
                        contacto.nombre || ""
                    );

                    textos.push(
                        contacto.cargo || ""
                    );

                    textos.push(
                        contacto.telefono || ""
                    );

                    textos.push(
                        contacto.correo || ""
                    );

                });

        }


        return textos.join(" ");

    }


    /* =====================================================
       FILTRAR REGISTROS
    ===================================================== */

    function filtrarRegistros() {

        const textoBusqueda =
            normalizarTexto(
                buscador.value
            );


        const categoriaSeleccionada =
            filtroCategoria.value;


        const estadoSeleccionado =
            filtroEstado.value;


        const registrosFiltrados =
            registrosDirectorio.filter(
                registro => {


                    const categoriasRegistro =
                        Array.isArray(
                            registro.categorias
                        )
                            ? registro.categorias
                            : [registro.categoria];


                    /* CATEGORÍA */

                    const coincideCategoria =

                        categoriaSeleccionada ===
                            "todas"

                        ||

                        categoriasRegistro.includes(
                            categoriaSeleccionada
                        );


                    /* ESTADO */

                    const coincideEstado =

                        estadoSeleccionado ===
                            "todos"

                        ||

                        registro.estado ===
                            estadoSeleccionado;


                    /* CONTACTOS ADICIONALES */

                    const textoContactos =
                        obtenerTextoContactosAdicionales(
                            registro
                        );


                    /* TEXTO GENERAL */

                    const contenidoRegistro =
                        normalizarTexto(`

                            ${registro.estado}

                            ${registro.legislatura}

                            ${registro.nombre}

                            ${registro.cargo}

                            ${registro.comision}

                            ${registro.institucion}

                            ${registro.telefono}

                            ${registro.whatsapp}

                            ${registro.correo}

                            ${textoContactos}

                        `);


                    /* BÚSQUEDA */

                    const coincideBusqueda =

                        textoBusqueda === ""

                        ||

                        contenidoRegistro.includes(
                            textoBusqueda
                        );


                    return (

                        coincideCategoria &&

                        coincideEstado &&

                        coincideBusqueda

                    );

                }
            );


        mostrarRegistros(
            registrosFiltrados
        );

    }


    /* =====================================================
       ESCUCHAR FIRESTORE
    ===================================================== */

    function escucharDirectorio() {

        mensajeCargando
            .classList
            .remove("d-none");


        const referenciaDirectorio =
            collection(
                db,
                "directorio"
            );


        onSnapshot(

            referenciaDirectorio,


            snapshot => {


                registrosDirectorio =
                    snapshot.docs.map(
                        documento => ({

                            id:
                                documento.id,

                            ...documento.data()

                        })
                    );


                actualizarContadores();

                cargarEstados();

                actualizarFecha();

                filtrarRegistros();

            },


            error => {


                console.error(
                    "Error al leer Firestore:",
                    error
                );


                let mensaje =
                    "Ocurrió un error al consultar la base de datos.";


                if (
                    error.code ===
                    "permission-denied"
                ) {

                    mensaje =
                        "Firebase rechazó la consulta. Revisa las reglas de seguridad de Firestore.";

                }


                mostrarError(
                    mensaje
                );

            }

        );

    }


    /* =====================================================
       VALIDAR SESIÓN
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


            correoUsuario.textContent =
                usuario.email ||
                "Usuario autorizado";


            pantallaCarga
                .classList
                .add("d-none");


            contenidoDirectorio
                .classList
                .remove("d-none");


            escucharDirectorio();

        }
    );


    /* =====================================================
       ADMINISTRAR
    ===================================================== */

    if (btnAdministrar) {

        btnAdministrar.addEventListener(
            "click",
            () => {

                window.location.href =
                    "admin.html";

            }
        );

    }


    /* =====================================================
       SELECCIONAR CATEGORÍA DESDE TARJETA
    ===================================================== */

    function seleccionarCategoriaDesdeTarjeta(
        tarjeta
    ) {

        const categoria =
            tarjeta.dataset.categoria;


        buscador.value =
            "";


        filtroCategoria.value =
            categoria;


        filtroEstado.value =
            "todos";


        tarjetasCategoria.forEach(
            elemento => {

                elemento.classList.toggle(

                    "activa",

                    elemento === tarjeta

                );

            }
        );


        filtrarRegistros();


        const seccionBusqueda =
            document.querySelector(
                ".seccion-busqueda"
            );


        if (seccionBusqueda) {

            seccionBusqueda.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "start"

            });

        }

    }


    tarjetasCategoria.forEach(
        tarjeta => {


            tarjeta.addEventListener(
                "click",
                () => {

                    seleccionarCategoriaDesdeTarjeta(
                        tarjeta
                    );

                }
            );


            tarjeta.addEventListener(
                "keydown",
                evento => {


                    if (
                        evento.key ===
                            "Enter"

                        ||

                        evento.key ===
                            " "
                    ) {

                        evento.preventDefault();


                        seleccionarCategoriaDesdeTarjeta(
                            tarjeta
                        );

                    }

                }
            );

        }
    );


    /* =====================================================
       CERRAR SESIÓN
    ===================================================== */

    if (btnCerrarSesion) {

        btnCerrarSesion.addEventListener(
            "click",
            async () => {


                const confirmar =
                    window.confirm(
                        "¿Deseas cerrar la sesión?"
                    );


                if (!confirmar) {

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


                    window.alert(
                        "No fue posible cerrar la sesión. Inténtalo nuevamente."
                    );

                }

            }
        );

    }


    /* =====================================================
       BUSCADOR
    ===================================================== */

    buscador.addEventListener(
        "input",
        filtrarRegistros
    );


    /* =====================================================
       FILTRO DE CATEGORÍA
    ===================================================== */

    filtroCategoria.addEventListener(
        "change",
        () => {


            tarjetasCategoria.forEach(
                tarjeta => {

                    tarjeta.classList.toggle(

                        "activa",

                        tarjeta.dataset.categoria ===
                            filtroCategoria.value

                    );

                }
            );


            filtrarRegistros();

        }
    );


    /* =====================================================
       FILTRO DE ESTADO
    ===================================================== */

    filtroEstado.addEventListener(
        "change",
        filtrarRegistros
    );


    /* =====================================================
       LIMPIAR FILTROS
    ===================================================== */

    if (btnLimpiar) {

        btnLimpiar.addEventListener(
            "click",
            () => {


                buscador.value =
                    "";


                filtroCategoria.value =
                    "todas";


                filtroEstado.value =
                    "todos";


                tarjetasCategoria.forEach(
                    tarjeta => {

                        tarjeta.classList.remove(
                            "activa"
                        );

                    }
                );


                filtrarRegistros();

            }
        );

    }


    /* =====================================================
       IMPRIMIR
    ===================================================== */

    if (btnImprimir) {

        btnImprimir.addEventListener(
            "click",
            () => {

                window.print();

            }
        );

    }


});