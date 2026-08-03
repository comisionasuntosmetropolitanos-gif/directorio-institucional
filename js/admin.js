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
    const pantallaCargaAdmin = document.getElementById("pantallaCargaAdmin");
    const panelAdministracion = document.getElementById("panelAdministracion");
    const correoUsuarioAdmin = document.getElementById("correoUsuarioAdmin");
    const btnCerrarSesion = document.getElementById("btnCerrarSesion");

    // Resumen y Filtros
    const totalComisiones = document.getElementById("totalComisiones");
    const totalMesas = document.getElementById("totalMesas");
    const totalRepresentantes = document.getElementById("totalRepresentantes");
    const totalInstituciones = document.getElementById("totalInstituciones");
    const tarjetasResumen = document.querySelectorAll(".tarjeta-resumen-admin");

    const buscadorAdmin = document.getElementById("buscadorAdmin");
    const filtroCategoriaAdmin = document.getElementById("filtroCategoriaAdmin");
    const filtroEstadoAdmin = document.getElementById("filtroEstadoAdmin");
    const btnLimpiarAdmin = document.getElementById("btnLimpiarAdmin");
    const contadorAdmin = document.getElementById("contadorAdmin");

    // Tabla & Vista Móvil
    const tablaAdmin = document.getElementById("tablaAdmin");
    const listaAdminMovil = document.getElementById("listaAdminMovil");
    const mensajeCargandoAdmin = document.getElementById("mensajeCargandoAdmin");
    const mensajeAdminVacio = document.getElementById("mensajeAdminVacio");
    const mensajeErrorAdmin = document.getElementById("mensajeErrorAdmin");
    const textoErrorAdmin = document.getElementById("textoErrorAdmin");

    // Modal Formulario (Agregar / Editar)
    const modalRegistroElemento = document.getElementById("modalRegistro");
    const modalRegistroBS = new bootstrap.Modal(modalRegistroElemento);
    const formRegistro = document.getElementById("formRegistro");
    const tituloModalRegistro = document.getElementById("tituloModalRegistro");
    const textoBotonGuardar = document.getElementById("textoBotonGuardar");
    const mensajeFormulario = document.getElementById("mensajeFormulario");

    // Campos del Formulario
    const registroId = document.getElementById("registroId");
    const categoriaRegistro = document.getElementById("categoriaRegistro");
    const estadoRegistro = document.getElementById("estadoRegistro");
    const checkboxesCategorias = document.querySelectorAll(".categoria-relacionada");
    const legislaturaRegistro = document.getElementById("legislaturaRegistro");
    const nombreRegistro = document.getElementById("nombreRegistro");
    const cargoRegistro = document.getElementById("cargoRegistro");
    const comisionRegistro = document.getElementById("comisionRegistro");
    const institucionRegistro = document.getElementById("institucionRegistro");
    const telefonoRegistro = document.getElementById("telefonoRegistro");
    const whatsappRegistro = document.getElementById("whatsappRegistro");
    const correoRegistro = document.getElementById("correoRegistro");
    const correosAdicionalesRegistro = document.getElementById("correosAdicionalesRegistro");
    const contactoAdicionalRegistro = document.getElementById("contactoAdicionalRegistro");
    const contactoAdicionalCargoRegistro = document.getElementById("contactoAdicionalCargoRegistro");
    const contactoAdicionalTelefonoRegistro = document.getElementById("contactoAdicionalTelefonoRegistro");
    const activoRegistro = document.getElementById("activoRegistro");

    // Modal Eliminar
    const modalEliminarElemento = document.getElementById("modalEliminar");
    const modalEliminarBS = new bootstrap.Modal(modalEliminarElemento);
    const nombreRegistroEliminar = document.getElementById("nombreRegistroEliminar");
    const registroIdEliminar = document.getElementById("registroIdEliminar");
    const btnConfirmarEliminar = document.getElementById("btnConfirmarEliminar");

    let registrosAdmin = [];

    /* =====================================================
       FUNCIONES DE UTILIDAD Y ESCAPADO
    ===================================================== */
    function normalizarTexto(texto) {
        return String(texto || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }

    function escaparHTML(texto) {
        return String(texto || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function obtenerNombreCategoria(cat) {
        const nombres = {
            comisiones: "Comisión",
            mesas: "Mesa Directiva",
            representantes: "Representante",
            instituciones: "Institución"
        };
        return nombres[cat] || "Sin categoría";
    }

    function ocultarMensajesEstado() {
        if (mensajeCargandoAdmin) mensajeCargandoAdmin.classList.add("d-none");
        if (mensajeAdminVacio) mensajeAdminVacio.classList.add("d-none");
        if (mensajeErrorAdmin) mensajeErrorAdmin.classList.add("d-none");
    }

    /* =====================================================
       CONTADORES & RESUMEN
    ===================================================== */
    function actualizarContadores() {
        function perteneceACategoria(reg, cat) {
            const lista = Array.isArray(reg.categorias) ? reg.categorias : [reg.categoria];
            return lista.includes(cat);
        }

        totalComisiones.textContent = registrosAdmin.filter(r => perteneceACategoria(r, "comisiones")).length;
        totalMesas.textContent = registrosAdmin.filter(r => perteneceACategoria(r, "mesas")).length;
        totalRepresentantes.textContent = registrosAdmin.filter(r => perteneceACategoria(r, "representantes")).length;
        totalInstituciones.textContent = registrosAdmin.filter(r => perteneceACategoria(r, "instituciones")).length;
    }

    function cargarEstadosSelect() {
        const estadoActual = filtroEstadoAdmin.value;
        const estados = [...new Set(registrosAdmin.map(r => String(r.estado || "").trim()).filter(Boolean))];
        estados.sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

        filtroEstadoAdmin.innerHTML = `<option value="todos">Todos los estados</option>`;
        estados.forEach(est => {
            const opt = document.createElement("option");
            opt.value = est;
            opt.textContent = est;
            filtroEstadoAdmin.appendChild(opt);
        });

        filtroEstadoAdmin.value = estados.includes(estadoActual) ? estadoActual : "todos";
    }

    /* =====================================================
       RENDERIZADO (ESCRITORIO Y MÓVIL)
    ===================================================== */
    function renderizarRegistros(lista) {
        ocultarMensajesEstado();
        tablaAdmin.innerHTML = "";
        listaAdminMovil.innerHTML = "";

        contadorAdmin.textContent = `Registros encontrados: ${lista.length}`;

        if (lista.length === 0) {
            mensajeAdminVacio.classList.remove("d-none");
            return;
        }

        lista.forEach((reg, index) => {
            const estaActivo = reg.activo !== false;

            // 1. Renderizado en Tabla Escritorio
            const tr = document.createElement("tr");
            if (!estaActivo) tr.classList.add("registro-inactivo-admin");

            const categoriasArr = Array.isArray(reg.categorias) ? reg.categorias : [reg.categoria];
            const badgesCategorias = categoriasArr.map(c => `<span class="etiqueta-categoria">${escaparHTML(obtenerNombreCategoria(c))}</span>`).join(" ");

            tr.innerHTML = `
                <td class="numero-admin">${index + 1}</td>
                <td>
                    <div class="lista-categorias-admin">
                        ${badgesCategorias}
                    </div>
                </td>
                <td>
                    <strong>${escaparHTML(reg.estado || "Sin especif.")}</strong>
                    ${reg.legislatura ? `<span class="legislatura-admin">${escaparHTML(reg.legislatura)}</span>` : ""}
                </td>
                <td>
                    <strong>${escaparHTML(reg.nombre)}</strong>
                    <div class="${estaActivo ? 'estado-activo-admin' : 'estado-inactivo-admin'}">
                        <i class="bi bi-circle-fill"></i> ${estaActivo ? 'Activo' : 'Inactivo'}
                    </div>
                </td>
                <td>
                    <strong>${escaparHTML(reg.cargo || "")}</strong>
                    ${reg.comision ? `<span class="comision-admin">${escaparHTML(reg.comision)}</span>` : ""}
                </td>
                <td>${escaparHTML(reg.institucion || "-")}</td>
                <td>
                    <div class="contactos-admin">
                        ${reg.telefono ? `<span><i class="bi bi-telephone"></i> ${escaparHTML(reg.telefono)}</span>` : ""}
                        ${reg.whatsapp ? `<span><i class="bi bi-whatsapp"></i> ${escaparHTML(reg.whatsapp)}</span>` : ""}
                        ${reg.correo ? `<span class="correo-admin"><i class="bi bi-envelope"></i> ${escaparHTML(reg.correo)}</span>` : ""}
                    </div>
                </td>
                <td>
                    <div class="botones-acciones">
                        <button type="button" class="btn btn-editar-registro" data-id="${reg.id}" title="Editar">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button type="button" class="btn ${estaActivo ? 'btn-desactivar-registro' : 'btn-activar-registro'}" data-id="${reg.id}" data-activo="${estaActivo}" title="${estaActivo ? 'Desactivar' : 'Activar'}">
                            <i class="bi ${estaActivo ? 'bi-eye-slash' : 'bi-eye'}"></i>
                        </button>
                        <button type="button" class="btn btn-eliminar-registro" data-id="${reg.id}" data-nombre="${escaparHTML(reg.nombre)}" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tablaAdmin.appendChild(tr);

            // 2. Renderizado en Tarjetas Móvil
            const card = document.createElement("article");
            card.className = `tarjeta-registro-movil ${!estaActivo ? 'registro-inactivo-movil' : ''}`;

            card.innerHTML = `
                <div class="encabezado-registro-movil">
                    <div>
                        <span class="numero-registro-movil">Registro #${index + 1}</span>
                        <h3>${escaparHTML(reg.nombre)}</h3>
                    </div>
                    <span class="${estaActivo ? 'estado-activo-movil' : 'estado-inactivo-movil'}">
                        <i class="bi bi-circle-fill"></i> ${estaActivo ? 'Activo' : 'Inactivo'}
                    </span>
                </div>

                <div class="categorias-registro-movil">
                    ${badgesCategorias}
                </div>

                <dl class="datos-registro-movil">
                    <div>
                        <dt>Estado</dt>
                        <dd>
                            ${escaparHTML(reg.estado || "Sin especificar")}
                            ${reg.legislatura ? `<span class="legislatura-movil">${escaparHTML(reg.legislatura)}</span>` : ""}
                        </dd>
                    </div>
                    <div>
                        <dt>Cargo / área</dt>
                        <dd>
                            ${escaparHTML(reg.cargo || "Sin cargo")}
                            ${reg.comision ? `<br><small>${escaparHTML(reg.comision)}</small>` : ""}
                        </dd>
                    </div>
                    <div>
                        <dt>Institución</dt>
                        <dd>${escaparHTML(reg.institucion || "-")}</dd>
                    </div>
                    <div>
                        <dt>Contacto</dt>
                        <dd class="contactos-registro-movil">
                            ${reg.telefono ? `<a href="tel:${reg.telefono}" class="dato-contacto-movil"><i class="bi bi-telephone"></i> <span>${escaparHTML(reg.telefono)}</span></a>` : ""}
                            ${reg.whatsapp ? `<a href="https://wa.me/${reg.whatsapp}" class="dato-contacto-movil" target="_blank"><i class="bi bi-whatsapp"></i> <span>${escaparHTML(reg.whatsapp)}</span></a>` : ""}
                            ${reg.correo ? `<a href="mailto:${reg.correo}" class="dato-contacto-movil"><i class="bi bi-envelope"></i> <span>${escaparHTML(reg.correo)}</span></a>` : ""}
                        </dd>
                    </div>
                </dl>

                <div class="acciones-registro-movil">
                    <button type="button" class="btn btn-editar-registro" data-id="${reg.id}">
                        <i class="bi bi-pencil-square"></i> Editar
                    </button>
                    <button type="button" class="btn ${estaActivo ? 'btn-desactivar-registro' : 'btn-activar-registro'}" data-id="${reg.id}" data-activo="${estaActivo}">
                        <i class="bi ${estaActivo ? 'bi-eye-slash' : 'bi-eye'}"></i> ${estaActivo ? 'Ocultar' : 'Mostrar'}
                    </button>
                    <button type="button" class="btn btn-eliminar-registro" data-id="${reg.id}" data-nombre="${escaparHTML(reg.nombre)}">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </div>
            `;
            listaAdminMovil.appendChild(card);
        });

        asignarEventosAcciones();
    }

    /* =====================================================
       FILTRADO DE REGISTROS
    ===================================================== */
    function filtrarRegistros() {
        const texto = normalizarTexto(buscadorAdmin.value);
        const catSel = filtroCategoriaAdmin.value;
        const estSel = filtroEstadoAdmin.value;

        const filtrados = registrosAdmin.filter(reg => {
            const categoriasArr = Array.isArray(reg.categorias) ? reg.categorias : [reg.categoria];
            const coincideCat = catSel === "todas" || categoriasArr.includes(catSel);
            const coincideEst = estSel === "todos" || reg.estado === estSel;

            const contenido = normalizarTexto(`
                ${reg.nombre} ${reg.estado} ${reg.legislatura}
                ${reg.cargo} ${reg.comision} ${reg.institucion}
                ${reg.correo} ${reg.telefono} ${reg.whatsapp}
            `);

            const coincideBusqueda = texto === "" || contenido.includes(texto);

            return coincideCat && coincideEst && coincideBusqueda;
        });

        renderizarRegistros(filtrados);
    }

    /* =====================================================
       ESCUCHAR FIRESTORE EN TIEMPO REAL
    ===================================================== */
    function escucharFirestore() {
        if (mensajeCargandoAdmin) mensajeCargandoAdmin.classList.remove("d-none");

        const refDirectorio = collection(db, "directorio");

        onSnapshot(refDirectorio, snapshot => {
            registrosAdmin = snapshot.docs.map(docSnap => ({
                id: docSnap.id,
                ...docSnap.data()
            }));

            actualizarContadores();
            cargarEstadosSelect();
            filtrarRegistros();
        }, error => {
            console.error("Error al consultar Firestore:", error);
            ocultarMensajesEstado();
            if (textoErrorAdmin) textoErrorAdmin.textContent = "Error al conectar con la base de datos de Firestore.";
            if (mensajeErrorAdmin) mensajeErrorAdmin.classList.remove("d-none");
        });
    }

    /* =====================================================
       MANTENIMIENTO & FORMULARIO (CREAR / EDITAR)
    ===================================================== */
    function abrirModalNuevo() {
        formRegistro.reset();
        registroId.value = "";
        tituloModalRegistro.textContent = "Agregar registro";
        textoBotonGuardar.textContent = "Guardar registro";
        mensajeFormulario.classList.add("d-none");

        checkboxesCategorias.forEach(chk => chk.checked = false);
        activoRegistro.checked = true;
    }

    function abrirModalEditar(id) {
        const reg = registrosAdmin.find(r => r.id === id);
        if (!reg) return;

        formRegistro.reset();
        registroId.value = reg.id;
        tituloModalRegistro.textContent = "Editar registro";
        textoBotonGuardar.textContent = "Actualizar cambios";
        mensajeFormulario.classList.add("d-none");

        categoriaRegistro.value = reg.categoria || "";
        estadoRegistro.value = reg.estado || "";
        legislaturaRegistro.value = reg.legislatura || "";
        nombreRegistro.value = reg.nombre || "";
        cargoRegistro.value = reg.cargo || "";
        comisionRegistro.value = reg.comision || "";
        institucionRegistro.value = reg.institucion || "";
        telefonoRegistro.value = reg.telefono || "";
        whatsappRegistro.value = reg.whatsapp || "";
        correoRegistro.value = reg.correo || "";
        correosAdicionalesRegistro.value = reg.correosAdicionales || "";
        contactoAdicionalRegistro.value = reg.contactoAdicional || "";
        contactoAdicionalCargoRegistro.value = reg.contactoAdicionalCargo || "";
        contactoAdicionalTelefonoRegistro.value = reg.contactoAdicionalTelefono || "";
        activoRegistro.checked = reg.activo !== false;

        const categoriasRel = Array.isArray(reg.categorias) ? reg.categorias : [reg.categoria];
        checkboxesCategorias.forEach(chk => {
            chk.checked = categoriasRel.includes(chk.value);
        });

        modalRegistroBS.show();
    }

    formRegistro.addEventListener("submit", async (e) => {
        e.preventDefault();

        const idDoc = registroId.value;
        const catPrincipal = categoriaRegistro.value;

        // Recuperar categorías seleccionadas
        const categoriasSeleccionadas = [catPrincipal];
        checkboxesCategorias.forEach(chk => {
            if (chk.checked && !categoriasSeleccionadas.includes(chk.value)) {
                categoriasSeleccionadas.push(chk.value);
            }
        });

        const datos = {
            categoria: catPrincipal,
            categorias: categoriasSeleccionadas,
            estado: estadoRegistro.value.trim(),
            legislatura: legislaturaRegistro.value.trim(),
            nombre: nombreRegistro.value.trim(),
            cargo: cargoRegistro.value.trim(),
            comision: comisionRegistro.value.trim(),
            institucion: institucionRegistro.value.trim(),
            telefono: telefonoRegistro.value.trim(),
            whatsapp: whatsappRegistro.value.trim(),
            correo: correoRegistro.value.trim(),
            correosAdicionales: correosAdicionalesRegistro.value.trim(),
            contactoAdicional: contactoAdicionalRegistro.value.trim(),
            contactoAdicionalCargo: contactoAdicionalCargoRegistro.value.trim(),
            contactoAdicionalTelefono: contactoAdicionalTelefonoRegistro.value.trim(),
            activo: activoRegistro.checked,
            actualizadoEn: serverTimestamp()
        };

        try {
            if (idDoc) {
                await updateDoc(doc(db, "directorio", idDoc), datos);
            } else {
                datos.creadoEn = serverTimestamp();
                await addDoc(collection(db, "directorio"), datos);
            }

            modalRegistroBS.hide();
        } catch (err) {
            console.error("Error al guardar en Firestore:", err);
            mensajeFormulario.textContent = "Error al guardar el registro. Inténtalo de nuevo.";
            mensajeFormulario.className = "alert alert-danger mt-4";
            mensajeFormulario.classList.remove("d-none");
        }
    });

    /* =====================================================
       ACCIONES DE TABLA / TARJETAS
    ===================================================== */
    function asignarEventosAcciones() {
        document.querySelectorAll(".btn-editar-registro").forEach(btn => {
            btn.addEventListener("click", () => abrirModalEditar(btn.dataset.id));
        });

        document.querySelectorAll(".btn-activar-registro, .btn-desactivar-registro").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;
                const estadoActual = btn.dataset.activo === "true";
                try {
                    await updateDoc(doc(db, "directorio", id), {
                        activo: !estadoActual,
                        actualizadoEn: serverTimestamp()
                    });
                } catch (err) {
                    console.error("Error al cambiar estado:", err);
                }
            });
        });

        document.querySelectorAll(".btn-eliminar-registro").forEach(btn => {
            btn.addEventListener("click", () => {
                registroIdEliminar.value = btn.dataset.id;
                nombreRegistroEliminar.textContent = btn.dataset.nombre || "este registro";
                modalEliminarBS.show();
            });
        });
    }

    btnConfirmarEliminar.addEventListener("click", async () => {
        const id = registroIdEliminar.value;
        if (!id) return;

        try {
            await deleteDoc(doc(db, "directorio", id));
            modalEliminarBS.hide();
        } catch (err) {
            console.error("Error al eliminar registro:", err);
            alert("No fue posible eliminar el registro.");
        }
    });

    /* =====================================================
       EVENTOS DE FILTROS Y TARJETAS
    ===================================================== */
    buscadorAdmin.addEventListener("input", filtrarRegistros);
    filtroCategoriaAdmin.addEventListener("change", filtrarRegistros);
    filtroEstadoAdmin.addEventListener("change", filtrarRegistros);

    btnLimpiarAdmin.addEventListener("click", () => {
        buscadorAdmin.value = "";
        filtroCategoriaAdmin.value = "todas";
        filtroEstadoAdmin.value = "todos";

        tarjetasResumen.forEach(t => t.classList.remove("activa"));
        filtrarRegistros();
    });

    tarjetasResumen.forEach(tarjeta => {
        tarjeta.addEventListener("click", () => {
            const cat = tarjeta.dataset.categoria;
            buscadorAdmin.value = "";
            filtroCategoriaAdmin.value = cat;
            filtroEstadoAdmin.value = "todos";

            tarjetasResumen.forEach(t => t.classList.toggle("activa", t === tarjeta));
            filtrarRegistros();
        });
    });

    const btnNuevoRegistro = document.getElementById("btnNuevoRegistro");
    if (btnNuevoRegistro) {
        btnNuevoRegistro.addEventListener("click", abrirModalNuevo);
    }

    /* =====================================================
       VERIFICACIÓN DE AUTENTICACIÓN
    ===================================================== */
    onAuthStateChanged(auth, usuario => {
        if (!usuario) {
            window.location.replace("index.html");
            return;
        }

        correoUsuarioAdmin.textContent = usuario.email || "Administrador autorizado";

        pantallaCargaAdmin.classList.add("d-none");
        panelAdministracion.classList.remove("d-none");

        escucharFirestore();
    });

    /* =====================================================
       CERRAR SESIÓN
    ===================================================== */
    btnCerrarSesion.addEventListener("click", async () => {
        if (!window.confirm("¿Deseas cerrar la sesión administrativa?")) return;

        try {
            await signOut(auth);
            window.location.replace("index.html");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            alert("Ocurrió un problema al cerrar la sesión.");
        }
    });

});