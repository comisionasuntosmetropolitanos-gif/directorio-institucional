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
       ELEMENTOS GENERALES DE LA PÁGINA
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
       ELEMENTOS DEL BUSCADOR Y LOS FILTROS
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
       ELEMENTOS DE LA TABLA
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
       CONTADORES DE CATEGORÍAS
    ===================================================== */

    const totalComisiones =
        document.getElementById("totalComisiones");

    const totalMesas =
        document.getElementById("totalMesas");

    const totalRepresentantes =
        document.getElementById("totalRepresentantes");

    const totalInstituciones =
        document.getElementById("totalInstituciones");

    const tarjetasCategoria =
        document.querySelectorAll(".tarjeta-clic");


    /* =====================================================
       ARREGLO QUE GUARDARÁ LOS REGISTROS DE FIRESTORE
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
       PREPARAR NÚMERO TELEFÓNICO
    ===================================================== */

    function prepararNumeroTelefono(numero) {
        return String(numero || "").replace(/[^\d+]/g, "");
    }


    /* =====================================================
       PREPARAR NÚMERO DE WHATSAPP
    ===================================================== */

    function prepararNumeroWhatsApp(numero) {
        let numeroLimpio = String(numero || "").replace(/\D/g, "");

        if (numeroLimpio.length === 10) {
            numeroLimpio = `52${numeroLimpio}`;
        }

        if (
            numeroLimpio.length === 13 &&
            numeroLimpio.startsWith("521")
        ) {
            numeroLimpio = `52${numeroLimpio.substring(3)}`;
        }

        return numeroLimpio;
    }


    /* =====================================================
       OBTENER EL NOMBRE VISIBLE DE UNA CATEGORÍA
    ===================================================== */

    function obtenerNombreCategoria(categoria) {
        const categorias = {
            comisiones: "Comisiones",
            mesas: "Mesas Directivas",
            representantes: "Representantes",
            instituciones: "Instituciones"
        };

        return categorias[categoria] || "Sin categoría";
    }


    /* =====================================================
       MOSTRAR U OCULTAR MENSAJES DE LA TABLA
    ===================================================== */

    function ocultarMensajesTabla() {
        mensajeCargando.classList.add("d-none");
        mensajeSinResultados.classList.add("d-none");
        mensajeError.classList.add("d-none");
    }


    function mostrarError(mensaje) {
        tablaDirectorio.innerHTML = "";
        ocultarMensajesTabla();
        textoError.textContent = mensaje;
        mensajeError.classList.remove("d-none");
    }


    /* =====================================================
       CREAR COLUMNA ESTADO / LEGISLATURA
    ===================================================== */

    function crearEstadoLegislatura(registro) {
        const estado =
            escaparHTML(registro.estado) || "Sin especificar";

        const legislatura = registro.legislatura
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
       CREAR COLUMNA CARGO O COMISIÓN
    ===================================================== */

    function crearCargoComision(registro) {
        const cargo = registro.cargo
            ? `
                <strong>
                    ${escaparHTML(registro.cargo)}
                </strong>
              `
            : "";

        const comision = registro.comision
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
       CREAR COLUMNA DE CONTACTO
    ===================================================== */

    function crearContacto(registro) {
        const contactos = [];

        if (registro.telefono) {
            const numeroTelefono = prepararNumeroTelefono(registro.telefono);
            contactos.push(`
                <a
                    href="tel:${numeroTelefono}"
                    class="enlace-contacto"
                    title="Llamar"
                >
                    <i class="bi bi-telephone-fill"></i>
                    <span>
                        ${escaparHTML(registro.telefono)}
                    </span>
                </a>
            `);
        }

        if (registro.whatsapp) {
            const numeroWhatsApp = prepararNumeroWhatsApp(registro.whatsapp);
            if (numeroWhatsApp.length >= 10) {
                contactos.push(`
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

        if (registro.correo) {
            contactos.push(`
                <a
                    href="mailto:${escaparHTML(registro.correo)}"
                    class="enlace-contacto correo-contacto"
                    title="Enviar correo electrónico"
                >
                    <i class="bi bi-envelope-fill"></i>
                    <span>
                        ${escaparHTML(registro.correo)}
                    </span>
                </a>
            `);
        }

        if (contactos.length === 0) {
            return `
                <span class="sin-informacion">
                    Sin información
                </span>
            `;
        }

        return `
            <div class="lista-contactos">
                ${contactos.join("")}
            </div>
        `;
    }


    /* =====================================================
       ACTUALIZAR CONTADORES (CORREGIDO)
    ===================================================== */

    function actualizarContadores() {
        function perteneceACategoria(registro, categoria) {
            const categoriasRegistro = Array.isArray(registro.categorias)
                ? registro.categorias
                : [registro.categoria];

            return categoriasRegistro.includes(categoria);
        }

        totalComisiones.textContent = registrosDirectorio.filter(
            registro => perteneceACategoria(registro, "comisiones")
        ).length;

        totalMesas.textContent = registrosDirectorio.filter(
            registro => perteneceACategoria(registro, "mesas")
        ).length;

        totalRepresentantes.textContent = registrosDirectorio.filter(
            registro => perteneceACategoria(registro, "representantes")
        ).length;

        totalInstituciones.textContent = registrosDirectorio.filter(
            registro => perteneceACategoria(registro, "instituciones")
        ).length;
    }


    /* =====================================================
       LLENAR EL SELECTOR DE ESTADOS
    ===================================================== */

    function cargarEstados() {
        const estadoSeleccionado = filtroEstado.value;

        const estados = [
            ...new Set(
                registrosDirectorio
                    .map(registro => String(registro.estado || "").trim())
                    .filter(estado => estado !== "")
            )
        ];

        estados.sort((a, b) =>
            a.localeCompare(b, "es", { sensitivity: "base" })
        );

        filtroEstado.innerHTML = `
            <option value="todos">
                Todos los estados
            </option>
        `;

        estados.forEach(estado => {
            const opcion = document.createElement("option");
            opcion.value = estado;
            opcion.textContent = estado;
            filtroEstado.appendChild(opcion);
        });

        const estadoTodaviaExiste = estados.includes(estadoSeleccionado);
        filtroEstado.value = estadoTodaviaExiste ? estadoSeleccionado : "todos";
    }


    /* =====================================================
       OBTENER LA FECHA DE ACTUALIZACIÓN
    ===================================================== */

    function actualizarFecha() {
        const fechasValidas = registrosDirectorio
            .map(registro => {
                const fecha = registro.actualizadoEn || registro.creadoEn;

                if (fecha && typeof fecha.toDate === "function") {
                    return fecha.toDate();
                }

                if (fecha instanceof Date) {
                    return fecha;
                }

                return null;
            })
            .filter(fecha => fecha !== null);

        if (fechasValidas.length === 0) {
            fechaActualizacion.textContent = "Última actualización: sin información";
            return;
        }

        const fechaMasReciente = new Date(
            Math.max(...fechasValidas.map(fecha => fecha.getTime()))
        );

        const textoFecha = fechaMasReciente.toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });

        fechaActualizacion.textContent = `Última actualización: ${textoFecha}`;
    }


    /* =====================================================
       ORDENAR LOS REGISTROS
    ===================================================== */

    function ordenarRegistros(registros) {
        return [...registros].sort((a, b) => {
            const estadoA = String(a.estado || "");
            const estadoB = String(b.estado || "");

            const comparacionEstado = estadoA.localeCompare(estadoB, "es", {
                sensitivity: "base"
            });

            if (comparacionEstado !== 0) {
                return comparacionEstado;
            }

            return String(a.nombre || "").localeCompare(
                String(b.nombre || ""),
                "es",
                { sensitivity: "base" }
            );
        });
    }


    /* =====================================================
       MOSTRAR REGISTROS EN LA TABLA
    ===================================================== */

    function mostrarRegistros(registros) {
        tablaDirectorio.innerHTML = "";
        ocultarMensajesTabla();

        const registrosOrdenados = ordenarRegistros(registros);
        contadorResultados.textContent = `Registros encontrados: ${registrosOrdenados.length}`;

        if (registrosOrdenados.length === 0) {
            mensajeSinResultados.classList.remove("d-none");
            return;
        }

        registrosOrdenados.forEach((registro, indice) => {
            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td class="numero-registro">
                    ${indice + 1}
                </td>

                <td>
                    ${crearEstadoLegislatura(registro)}
                </td>

                <td>
                    <strong>
                        ${escaparHTML(registro.nombre) || "Sin nombre"}
                    </strong>

                    <span class="categoria-registro-publico">
                        ${escaparHTML(obtenerNombreCategoria(registro.categoria))}
                    </span>
                </td>

                <td>
                    ${crearCargoComision(registro)}
                </td>

                <td>
                    ${escaparHTML(registro.institucion) || "Sin especificar"}
                </td>

                <td>
                    ${crearContacto(registro)}
                </td>
            `;

            tablaDirectorio.appendChild(fila);
        });
    }


    /* =====================================================
       FILTRAR LOS REGISTROS
    ===================================================== */

    function filtrarRegistros() {
        const textoBusqueda = normalizarTexto(buscador.value);
        const categoriaSeleccionada = filtroCategoria.value;
        const estadoSeleccionado = filtroEstado.value;

        const registrosFiltrados = registrosDirectorio.filter(registro => {
            const categoriasRegistro = Array.isArray(registro.categorias)
                ? registro.categorias
                : [registro.categoria];

            const coincideCategoria =
                categoriaSeleccionada === "todas" ||
                categoriasRegistro.includes(categoriaSeleccionada);

            const coincideEstado =
                estadoSeleccionado === "todos" ||
                registro.estado === estadoSeleccionado;

            const contenidoRegistro = normalizarTexto(`
                ${registro.estado}
                ${registro.legislatura}
                ${registro.nombre}
                ${registro.cargo}
                ${registro.comision}
                ${registro.institucion}
                ${registro.telefono}
                ${registro.whatsapp}
                ${registro.correo}
            `);

            const coincideBusqueda =
                textoBusqueda === "" ||
                contenidoRegistro.includes(textoBusqueda);

            return (
                coincideCategoria &&
                coincideEstado &&
                coincideBusqueda
            );
        });

        mostrarRegistros(registrosFiltrados);
    }


    /* =====================================================
       CARGAR REGISTROS DESDE FIRESTORE
    ===================================================== */

    function escucharDirectorio() {
        mensajeCargando.classList.remove("d-none");

        const referenciaDirectorio = collection(db, "directorio");

        onSnapshot(
            referenciaDirectorio,
            snapshot => {
                registrosDirectorio = snapshot.docs.map(documento => ({
                    id: documento.id,
                    ...documento.data()
                }));

                actualizarContadores();
                cargarEstados();
                actualizarFecha();
                filtrarRegistros();
            },
            error => {
                console.error("Error al leer Firestore:", error);

                let mensaje = "Ocurrió un error al consultar la base de datos.";

                if (error.code === "permission-denied") {
                    mensaje = "Firebase rechazó la consulta. Debemos revisar las reglas de seguridad de Firestore.";
                }

                mostrarError(mensaje);
            }
        );
    }


    /* =====================================================
       VALIDAR SESIÓN
    ===================================================== */

    onAuthStateChanged(auth, usuario => {
        if (!usuario) {
            window.location.replace("index.html");
            return;
        }

        correoUsuario.textContent = usuario.email || "Usuario autorizado";

        pantallaCarga.classList.add("d-none");
        contenidoDirectorio.classList.remove("d-none");

        escucharDirectorio();
    });


    /* =====================================================
       BOTÓN ADMINISTRAR
    ===================================================== */

    btnAdministrar.addEventListener("click", () => {
        window.location.href = "admin.html";
    });


    /* =====================================================
       FILTRAR DESDE LAS TARJETAS
    ===================================================== */

    function seleccionarCategoriaDesdeTarjeta(tarjeta) {
        const categoria = tarjeta.dataset.categoria;

        buscador.value = "";
        filtroCategoria.value = categoria;
        filtroEstado.value = "todos";

        tarjetasCategoria.forEach(elemento => {
            elemento.classList.toggle("activa", elemento === tarjeta);
        });

        filtrarRegistros();

        document
            .querySelector(".seccion-busqueda")
            .scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
    }

    tarjetasCategoria.forEach(tarjeta => {
        tarjeta.addEventListener("click", () => {
            seleccionarCategoriaDesdeTarjeta(tarjeta);
        });

        tarjeta.addEventListener("keydown", evento => {
            if (evento.key === "Enter" || evento.key === " ") {
                evento.preventDefault();
                seleccionarCategoriaDesdeTarjeta(tarjeta);
            }
        });
    });


    /* =====================================================
       CERRAR SESIÓN
    ===================================================== */

    btnCerrarSesion.addEventListener("click", async () => {
        const confirmar = window.confirm("¿Deseas cerrar la sesión?");

        if (!confirmar) return;

        try {
            await signOut(auth);
            window.location.replace("index.html");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            window.alert("No fue posible cerrar la sesión. Inténtalo nuevamente.");
        }
    });


    /* =====================================================
       BUSCADOR Y FILTROS
    ===================================================== */

    buscador.addEventListener("input", filtrarRegistros);

    filtroCategoria.addEventListener("change", () => {
        tarjetasCategoria.forEach(tarjeta => {
            tarjeta.classList.toggle(
                "activa",
                tarjeta.dataset.categoria === filtroCategoria.value
            );
        });
        filtrarRegistros();
    });

    filtroEstado.addEventListener("change", filtrarRegistros);


    /* =====================================================
       LIMPIAR FILTROS
    ===================================================== */

    if (btnLimpiar) {
        btnLimpiar.addEventListener("click", () => {
            buscador.value = "";
            filtroCategoria.value = "todas";
            filtroEstado.value = "todos";

            tarjetasCategoria.forEach(tarjeta => {
                tarjeta.classList.remove("activa");
            });

            filtrarRegistros();
        });
    }


    /* =====================================================
       IMPRIMIR DIRECTORIO
    ===================================================== */

    btnImprimir.addEventListener("click", () => {
        window.print();
    });

});