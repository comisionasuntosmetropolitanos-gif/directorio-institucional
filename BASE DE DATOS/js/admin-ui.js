/* =========================================================
   INTERFAZ DEL PANEL ADMINISTRATIVO
   Directorio Institucional
========================================================= */


/* =========================================================
   ESTADO INTERNO DEL MÓDULO
========================================================= */

/*
    Aquí se almacenarán temporalmente los registros
    que admin.js reciba desde Firestore.
*/
let registrosAdministrador = [];


/*
    Estas funciones serán proporcionadas posteriormente
    por admin.js para responder a los botones de la tabla.
*/
let funcionEditar = null;
let funcionEliminar = null;
let funcionCambiarEstado = null;


/* =========================================================
   ELEMENTOS DEL HTML
========================================================= */

const tablaAdmin =
    document.getElementById("tablaAdmin");

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

const mensajeCargandoAdmin =
    document.getElementById("mensajeCargandoAdmin");

const mensajeAdminVacio =
    document.getElementById("mensajeAdminVacio");

const mensajeErrorAdmin =
    document.getElementById("mensajeErrorAdmin");

const textoErrorAdmin =
    document.getElementById("textoErrorAdmin");

const mensajeGeneralAdmin =
    document.getElementById("mensajeGeneralAdmin");

const totalComisiones =
    document.getElementById("totalComisiones");

const totalMesas =
    document.getElementById("totalMesas");

const totalRepresentantes =
    document.getElementById("totalRepresentantes");

const totalInstituciones =
    document.getElementById("totalInstituciones");

const tarjetasResumenAdmin =
    document.querySelectorAll(
        ".tarjeta-resumen-admin"
    );


/* =========================================================
   NORMALIZAR TEXTO

   Convierte a minúsculas y elimina acentos.
========================================================= */

function normalizarTextoUI(texto) {

    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}


/* =========================================================
   ESCAPAR HTML

   Evita que los datos almacenados se interpreten
   como código dentro de la tabla.
========================================================= */

function escaparHTML(texto) {

    return String(texto || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   NOMBRE VISIBLE DE LA CATEGORÍA
========================================================= */

function obtenerNombreCategoria(categoria) {

    const nombres = {

        comisiones:
            "Comisión",

        mesas:
            "Mesa Directiva",

        representantes:
            "Representante",

        instituciones:
            "Institución"
    };

    return nombres[categoria] ||
        "Sin categoría";
}


/* =========================================================
   CLASE VISUAL DE LA CATEGORÍA
========================================================= */

function obtenerClaseCategoria(categoria) {

    const clases = {

        comisiones:
            "etiqueta-comisiones",

        mesas:
            "etiqueta-mesas",

        representantes:
            "etiqueta-representantes",

        instituciones:
            "etiqueta-instituciones"
    };

    return clases[categoria] || "";
}


/* =========================================================
   OBTENER CATEGORÍAS DEL REGISTRO
========================================================= */

function obtenerCategoriasRegistro(registro) {

    if (
        Array.isArray(registro.categorias) &&
        registro.categorias.length > 0
    ) {

        return registro.categorias;
    }

    return registro.categoria
        ? [registro.categoria]
        : [];
}


/* =========================================================
   COMPROBAR SI PERTENECE A UNA CATEGORÍA
========================================================= */

function perteneceACategoria(
    registro,
    categoria
) {

    return obtenerCategoriasRegistro(
        registro
    ).includes(categoria);
}


/* =========================================================
   OCULTAR MENSAJES DE ESTADO
========================================================= */

function ocultarMensajesTablaAdmin() {

    if (mensajeCargandoAdmin) {

        mensajeCargandoAdmin.classList.add(
            "d-none"
        );
    }

    if (mensajeAdminVacio) {

        mensajeAdminVacio.classList.add(
            "d-none"
        );
    }

    if (mensajeErrorAdmin) {

        mensajeErrorAdmin.classList.add(
            "d-none"
        );
    }
}


/* =========================================================
   MOSTRAR CARGANDO
========================================================= */

function mostrarCargandoAdmin() {

    if (tablaAdmin) {

        tablaAdmin.innerHTML = "";
    }

    ocultarMensajesTablaAdmin();

    if (mensajeCargandoAdmin) {

        mensajeCargandoAdmin.classList.remove(
            "d-none"
        );
    }
}


/* =========================================================
   MOSTRAR ERROR
========================================================= */

function mostrarErrorAdmin(mensaje) {

    if (tablaAdmin) {

        tablaAdmin.innerHTML = "";
    }

    ocultarMensajesTablaAdmin();

    if (textoErrorAdmin) {

        textoErrorAdmin.textContent =
            mensaje;
    }

    if (mensajeErrorAdmin) {

        mensajeErrorAdmin.classList.remove(
            "d-none"
        );
    }
}


/* =========================================================
   MENSAJES GENERALES
========================================================= */

function mostrarMensajeGeneral(
    mensaje,
    tipo = "success"
) {

    if (!mensajeGeneralAdmin) {

        return;
    }

    mensajeGeneralAdmin.textContent =
        mensaje;

    mensajeGeneralAdmin.className =
        `alert alert-${tipo}`;

    mensajeGeneralAdmin.classList.remove(
        "d-none"
    );

    /*
        Ocultar automáticamente el mensaje
        después de algunos segundos.
    */

    window.setTimeout(() => {

        ocultarMensajeGeneral();

    }, 5000);
}


function ocultarMensajeGeneral() {

    if (!mensajeGeneralAdmin) {

        return;
    }

    mensajeGeneralAdmin.textContent = "";

    mensajeGeneralAdmin.className =
        "alert d-none";
}


/* =========================================================
   CREAR ESTADO Y LEGISLATURA
========================================================= */

function crearEstadoLegislaturaAdmin(registro) {

    const estado =
        escaparHTML(registro.estado) ||
        "Sin especificar";

    const legislatura =
        registro.legislatura
            ? `
                <span class="legislatura-admin">
                    ${escaparHTML(
                        registro.legislatura
                    )}
                </span>
              `
            : "";

    return `
        <strong>${estado}</strong>
        ${legislatura}
    `;
}


/* =========================================================
   CREAR CARGO Y COMISIÓN
========================================================= */

function crearCargoComisionAdmin(registro) {

    const cargo =
        registro.cargo
            ? `
                <strong>
                    ${escaparHTML(
                        registro.cargo
                    )}
                </strong>
              `
            : "";

    const comision =
        registro.comision
            ? `
                <span class="comision-admin">
                    ${escaparHTML(
                        registro.comision
                    )}
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


/* =========================================================
   CREAR CONTACTOS
========================================================= */

function crearContactoAdmin(registro) {

    const contactos = [];

    if (registro.telefono) {

        contactos.push(`
            <span>
                <i class="bi bi-telephone-fill"></i>

                ${escaparHTML(
                    registro.telefono
                )}
            </span>
        `);
    }

    if (registro.whatsapp) {

        contactos.push(`
            <span>
                <i class="bi bi-whatsapp"></i>

                ${escaparHTML(
                    registro.whatsapp
                )}
            </span>
        `);
    }

    if (registro.correo) {

        contactos.push(`
            <span class="correo-admin">
                <i class="bi bi-envelope-fill"></i>

                ${escaparHTML(
                    registro.correo
                )}
            </span>
        `);
    }

    if (
        Array.isArray(
            registro.correosAdicionales
        )
    ) {

        registro.correosAdicionales
            .filter(Boolean)
            .forEach(correo => {

                contactos.push(`
                    <span class="correo-admin correo-adicional-admin">
                        <i class="bi bi-envelope"></i>

                        ${escaparHTML(correo)}
                    </span>
                `);
            });
    }

    if (contactos.length === 0) {

        return `
            <span class="sin-informacion">
                Sin información
            </span>
        `;
    }

    return `
        <div class="contactos-admin">
            ${contactos.join("")}
        </div>
    `;
}


/* =========================================================
   CREAR ETIQUETAS DE CATEGORÍAS
========================================================= */

function crearCategoriasAdmin(registro) {

    const categorias =
        obtenerCategoriasRegistro(registro);

    if (categorias.length === 0) {

        return `
            <span class="sin-informacion">
                Sin categoría
            </span>
        `;
    }

    return `
        <div class="lista-categorias-admin">

            ${categorias.map(categoria => `
                <span
                    class="etiqueta-categoria
                    ${obtenerClaseCategoria(
                        categoria
                    )}"
                >
                    ${escaparHTML(
                        obtenerNombreCategoria(
                            categoria
                        )
                    )}
                </span>
            `).join("")}

        </div>
    `;
}


/* =========================================================
   CREAR ESTADO ACTIVO O INACTIVO
========================================================= */

function crearEstadoActivoAdmin(registro) {

    const activo =
        registro.activo !== false;

    return activo
        ? `
            <span class="estado-activo-admin">
                <i class="bi bi-check-circle-fill"></i>
                Activo
            </span>
          `
        : `
            <span class="estado-inactivo-admin">
                <i class="bi bi-pause-circle-fill"></i>
                Inactivo
            </span>
          `;
}


/* =========================================================
   CREAR BOTONES DE ACCIONES
========================================================= */

function crearBotonesAcciones(registro) {

    const activo =
        registro.activo !== false;

    const botonEstado =
        activo
            ? `
                <button
                    type="button"
                    class="btn btn-desactivar-registro"
                    data-id="${escaparHTML(
                        registro.id
                    )}"
                    title="Desactivar registro"
                    aria-label="Desactivar registro"
                >
                    <i class="bi bi-eye-slash-fill"></i>
                </button>
              `
            : `
                <button
                    type="button"
                    class="btn btn-activar-registro"
                    data-id="${escaparHTML(
                        registro.id
                    )}"
                    title="Activar registro"
                    aria-label="Activar registro"
                >
                    <i class="bi bi-eye-fill"></i>
                </button>
              `;

    return `
        <div class="botones-acciones">

            <button
                type="button"
                class="btn btn-editar-registro"
                data-id="${escaparHTML(
                    registro.id
                )}"
                title="Editar registro"
                aria-label="Editar registro"
            >
                <i class="bi bi-pencil-square"></i>
            </button>

            ${botonEstado}

            <button
                type="button"
                class="btn btn-eliminar-registro"
                data-id="${escaparHTML(
                    registro.id
                )}"
                title="Eliminar registro"
                aria-label="Eliminar registro"
            >
                <i class="bi bi-trash-fill"></i>
            </button>

        </div>
    `;
}


/* =========================================================
   ORDENAR REGISTROS
========================================================= */

function ordenarRegistrosAdmin(registros) {

    return [...registros].sort(
        (registroA, registroB) => {

            const estadoA =
                String(
                    registroA.estado || ""
                );

            const estadoB =
                String(
                    registroB.estado || ""
                );

            const comparacionEstado =
                estadoA.localeCompare(
                    estadoB,
                    "es",
                    {
                        sensitivity: "base"
                    }
                );

            if (comparacionEstado !== 0) {

                return comparacionEstado;
            }

            return String(
                registroA.nombre || ""
            ).localeCompare(
                String(
                    registroB.nombre || ""
                ),
                "es",
                {
                    sensitivity: "base"
                }
            );
        }
    );
}


/* =========================================================
   MOSTRAR REGISTROS EN LA TABLA
========================================================= */

function mostrarRegistrosAdmin(registros) {

    if (!tablaAdmin) {

        return;
    }

    tablaAdmin.innerHTML = "";

    ocultarMensajesTablaAdmin();

    const registrosOrdenados =
        ordenarRegistrosAdmin(registros);

    if (contadorAdmin) {

        contadorAdmin.textContent =
            `Registros encontrados: ${registrosOrdenados.length}`;
    }

    if (registrosOrdenados.length === 0) {

        if (mensajeAdminVacio) {

            mensajeAdminVacio.classList.remove(
                "d-none"
            );
        }

        return;
    }

    registrosOrdenados.forEach(
        (registro, indice) => {

            const fila =
                document.createElement("tr");

            if (registro.activo === false) {

                fila.classList.add(
                    "registro-inactivo-admin"
                );
            }

            fila.innerHTML = `
                <td class="numero-admin">
                    ${indice + 1}
                </td>

                <td>
                    ${crearCategoriasAdmin(
                        registro
                    )}

                    ${crearEstadoActivoAdmin(
                        registro
                    )}
                </td>

                <td>
                    ${crearEstadoLegislaturaAdmin(
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
                </td>

                <td>
                    ${crearCargoComisionAdmin(
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
                    ${crearContactoAdmin(
                        registro
                    )}
                </td>

                <td>
                    ${crearBotonesAcciones(
                        registro
                    )}
                </td>
            `;

            tablaAdmin.appendChild(fila);
        }
    );
}


/* =========================================================
   ACTUALIZAR CONTADORES
========================================================= */

function actualizarContadoresAdmin() {

    if (totalComisiones) {

        totalComisiones.textContent =
            registrosAdministrador.filter(
                registro =>
                    perteneceACategoria(
                        registro,
                        "comisiones"
                    )
            ).length;
    }

    if (totalMesas) {

        totalMesas.textContent =
            registrosAdministrador.filter(
                registro =>
                    perteneceACategoria(
                        registro,
                        "mesas"
                    )
            ).length;
    }

    if (totalRepresentantes) {

        totalRepresentantes.textContent =
            registrosAdministrador.filter(
                registro =>
                    perteneceACategoria(
                        registro,
                        "representantes"
                    )
            ).length;
    }

    if (totalInstituciones) {

        totalInstituciones.textContent =
            registrosAdministrador.filter(
                registro =>
                    perteneceACategoria(
                        registro,
                        "instituciones"
                    )
            ).length;
    }
}


/* =========================================================
   LLENAR SELECTOR DE ESTADOS
========================================================= */

function cargarEstadosAdmin() {

    if (!filtroEstadoAdmin) {

        return;
    }

    const valorActual =
        filtroEstadoAdmin.value;

    const estados = [
        ...new Set(
            registrosAdministrador
                .map(registro =>
                    String(
                        registro.estado || ""
                    ).trim()
                )
                .filter(Boolean)
        )
    ];

    estados.sort((estadoA, estadoB) =>
        estadoA.localeCompare(
            estadoB,
            "es",
            {
                sensitivity: "base"
            }
        )
    );

    filtroEstadoAdmin.innerHTML = `
        <option value="todos">
            Todos
        </option>
    `;

    estados.forEach(estado => {

        const opcion =
            document.createElement("option");

        opcion.value = estado;

        opcion.textContent = estado;

        filtroEstadoAdmin.appendChild(
            opcion
        );
    });

    filtroEstadoAdmin.value =
        estados.includes(valorActual)
            ? valorActual
            : "todos";
}


/* =========================================================
   FILTRAR REGISTROS
========================================================= */

function filtrarRegistrosAdmin() {

    const textoBusqueda =
        normalizarTextoUI(
            buscadorAdmin?.value
        );

    const categoriaSeleccionada =
        filtroCategoriaAdmin?.value ||
        "todas";

    const estadoSeleccionado =
        filtroEstadoAdmin?.value ||
        "todos";

    const registrosFiltrados =
        registrosAdministrador.filter(
            registro => {

                const coincideCategoria =
                    categoriaSeleccionada ===
                        "todas" ||
                    perteneceACategoria(
                        registro,
                        categoriaSeleccionada
                    );

                const coincideEstado =
                    estadoSeleccionado ===
                        "todos" ||
                    registro.estado ===
                        estadoSeleccionado;

                const contenido =
                    normalizarTextoUI(`
                        ${registro.estado}
                        ${registro.legislatura}
                        ${registro.nombre}
                        ${registro.cargo}
                        ${registro.comision}
                        ${registro.institucion}
                        ${registro.telefono}
                        ${registro.whatsapp}
                        ${registro.correo}
                        ${
                            Array.isArray(
                                registro.correosAdicionales
                            )
                                ? registro.correosAdicionales.join(
                                    " "
                                )
                                : ""
                        }
                        ${registro.contactoAdicional}
                        ${registro.contactoAdicionalCargo}
                        ${registro.contactoAdicionalTelefono}
                    `);

                const coincideBusqueda =
                    textoBusqueda === "" ||
                    contenido.includes(
                        textoBusqueda
                    );

                return (
                    coincideCategoria &&
                    coincideEstado &&
                    coincideBusqueda
                );
            }
        );

    mostrarRegistrosAdmin(
        registrosFiltrados
    );
}


/* =========================================================
   ESTABLECER REGISTROS DESDE FIRESTORE
========================================================= */

function establecerRegistrosAdmin(registros) {

    registrosAdministrador =
        Array.isArray(registros)
            ? registros
            : [];

    actualizarContadoresAdmin();

    cargarEstadosAdmin();

    filtrarRegistrosAdmin();
}


/* =========================================================
   OBTENER REGISTROS LOCALES
========================================================= */

function obtenerRegistrosAdmin() {

    return registrosAdministrador;
}


/* =========================================================
   OBTENER REGISTRO POR ID
========================================================= */

function obtenerRegistroAdminPorId(id) {

    return registrosAdministrador.find(
        registro =>
            String(registro.id) ===
            String(id)
    ) || null;
}


/* =========================================================
   TARJETAS DE RESUMEN
========================================================= */

function seleccionarCategoriaAdmin(
    tarjeta
) {

    const categoria =
        tarjeta.dataset.categoria;

    if (buscadorAdmin) {

        buscadorAdmin.value = "";
    }

    if (filtroCategoriaAdmin) {

        filtroCategoriaAdmin.value =
            categoria;
    }

    if (filtroEstadoAdmin) {

        filtroEstadoAdmin.value =
            "todos";
    }

    tarjetasResumenAdmin.forEach(
        elemento => {

            elemento.classList.toggle(
                "activa",
                elemento === tarjeta
            );
        }
    );

    filtrarRegistrosAdmin();

    document
        .querySelector(
            ".barra-herramientas-admin"
        )
        ?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
}


tarjetasResumenAdmin.forEach(tarjeta => {

    tarjeta.addEventListener(
        "click",
        () => {

            seleccionarCategoriaAdmin(
                tarjeta
            );
        }
    );

    tarjeta.addEventListener(
        "keydown",
        evento => {

            if (
                evento.key === "Enter" ||
                evento.key === " "
            ) {

                evento.preventDefault();

                seleccionarCategoriaAdmin(
                    tarjeta
                );
            }
        }
    );
});


/* =========================================================
   EVENTOS DEL BUSCADOR Y FILTROS
========================================================= */

buscadorAdmin?.addEventListener(
    "input",
    filtrarRegistrosAdmin
);


filtroCategoriaAdmin?.addEventListener(
    "change",
    () => {

        tarjetasResumenAdmin.forEach(
            tarjeta => {

                tarjeta.classList.toggle(
                    "activa",
                    tarjeta.dataset.categoria ===
                        filtroCategoriaAdmin.value
                );
            }
        );

        filtrarRegistrosAdmin();
    }
);


filtroEstadoAdmin?.addEventListener(
    "change",
    filtrarRegistrosAdmin
);


/* =========================================================
   LIMPIAR FILTROS
========================================================= */

btnLimpiarAdmin?.addEventListener(
    "click",
    () => {

        if (buscadorAdmin) {

            buscadorAdmin.value = "";
        }

        if (filtroCategoriaAdmin) {

            filtroCategoriaAdmin.value =
                "todas";
        }

        if (filtroEstadoAdmin) {

            filtroEstadoAdmin.value =
                "todos";
        }

        tarjetasResumenAdmin.forEach(
            tarjeta => {

                tarjeta.classList.remove(
                    "activa"
                );
            }
        );

        filtrarRegistrosAdmin();

        buscadorAdmin?.focus();
    }
);


/* =========================================================
   CONFIGURAR FUNCIONES DE ACCIONES
========================================================= */

function configurarAccionesAdmin({
    editar,
    eliminar,
    cambiarEstado
} = {}) {

    funcionEditar =
        typeof editar === "function"
            ? editar
            : null;

    funcionEliminar =
        typeof eliminar === "function"
            ? eliminar
            : null;

    funcionCambiarEstado =
        typeof cambiarEstado === "function"
            ? cambiarEstado
            : null;
}


/* =========================================================
   EVENTOS DE LA TABLA
========================================================= */

tablaAdmin?.addEventListener(
    "click",
    evento => {

        const botonEditar =
            evento.target.closest(
                ".btn-editar-registro"
            );

        const botonEliminar =
            evento.target.closest(
                ".btn-eliminar-registro"
            );

        const botonActivar =
            evento.target.closest(
                ".btn-activar-registro"
            );

        const botonDesactivar =
            evento.target.closest(
                ".btn-desactivar-registro"
            );


        if (
            botonEditar &&
            funcionEditar
        ) {

            funcionEditar(
                botonEditar.dataset.id
            );

            return;
        }


        if (
            botonEliminar &&
            funcionEliminar
        ) {

            funcionEliminar(
                botonEliminar.dataset.id
            );

            return;
        }


        if (
            botonActivar &&
            funcionCambiarEstado
        ) {

            funcionCambiarEstado(
                botonActivar.dataset.id,
                true
            );

            return;
        }


        if (
            botonDesactivar &&
            funcionCambiarEstado
        ) {

            funcionCambiarEstado(
                botonDesactivar.dataset.id,
                false
            );
        }
    }
);


/* =========================================================
   EXPORTAR FUNCIONES
========================================================= */

export {
    establecerRegistrosAdmin,
    obtenerRegistrosAdmin,
    obtenerRegistroAdminPorId,
    filtrarRegistrosAdmin,
    actualizarContadoresAdmin,
    cargarEstadosAdmin,
    mostrarCargandoAdmin,
    mostrarErrorAdmin,
    mostrarMensajeGeneral,
    ocultarMensajeGeneral,
    configurarAccionesAdmin,
    escaparHTML,
    normalizarTextoUI
};