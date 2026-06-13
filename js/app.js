const TEMA = 'Ciudades favoritas';
const RUTA = './img/ciudades/';

//  botónes Play/Stop extraídas como constantes

const BTN_BASE = "bg-[#2D3359] border border-slate-700/50 text-[11px] sm:text-xs py-2.5 px-1 rounded-lg hover:bg-[#383F6D] active:scale-95 transition-all duration-200 cursor-pointer uppercase font-bold tracking-wider text-center";
const BTN_PLAY = `${BTN_BASE} text-emerald-400`;
const BTN_STOP = `${BTN_BASE} text-red-400`;


class Imagen {
    constructor(archivo, nombre, subtitulo, descripcion) {
        this.archivo     = archivo;
        this.nombre      = nombre;
        this.subtitulo   = subtitulo;
        this.descripcion = descripcion;
    }
}


// Array global 
const imagenes = [
    new Imagen("paris.jpg",  "París",  "Capital de Francia",          "París, la mística Ciudad de la Luz, el arte, la moda y el romance de la Torre Eiffel."),
    new Imagen("munich.jpg", "Munich", "Capital de Baviera, Alemania", "Mezcla de arte, cultura, imponente arquitectura neogótica y diversión."),
    new Imagen("london.jpg", "London", "Inglaterra",                   "Denominada de forma universal la capital de los negocios de Europa."),
    new Imagen("roma.jpg",   "Roma",   "Capital de Italia",            "La Ciudad Eterna, un museo al aire libre, cosmopolita, espléndida y cuna del Coliseo.")
];


// Función buscar independiente 

function buscar(elemento) {
    const elementoBuscar = elemento.trim().toUpperCase();
    let encontrado = false;
    let indice     = -1;
    let i          = 0;
    const elementos = imagenes.length;

    while (i < elementos && !encontrado) {
        if (elementoBuscar === imagenes[i].nombre.trim().toUpperCase()) {
            indice     = i;
            encontrado = true;
        }
        i++;
    }
    return indice;
}


function guardarEnAlmacenamiento() {
    localStorage.setItem("ciudades_preferidas", JSON.stringify(imagenes));
}

function cargarDesdeAlmacenamiento() {
    const datosGuardados = localStorage.getItem("ciudades_preferidas");
    if (datosGuardados) {
        const arrayPlano = JSON.parse(datosGuardados);

        if (arrayPlano.length > 0 && arrayPlano[0].titulo !== undefined) {
            localStorage.removeItem("ciudades_preferidas");
            guardarEnAlmacenamiento();
            return;
        }

        imagenes.length = 0;
        arrayPlano.forEach(c => {
            imagenes.push(new Imagen(c.archivo, c.nombre, c.subtitulo, c.descripcion));
        });
    } else {
        guardarEnAlmacenamiento();
    }
}


class AppCarrusel {
    constructor() {
        cargarDesdeAlmacenamiento();

        this.indiceActual   = 0;
        this.temporizador   = null;
        this.accionActual   = "";
        this.nombreOriginal = "";

        this.temaNodo      = document.getElementById("titulo-tema");
        this.imgNodo       = document.getElementById("ciudad-imagen");
        this.nombreNodo    = document.getElementById("ciudad-nombre");
        this.subtituloNodo = document.getElementById("ciudad-subtitulo");
        this.descNodo      = document.getElementById("ciudad-descripcion");

        this.modal          = document.getElementById("modal-formulario");
        this.modalTitulo    = document.getElementById("modal-titulo");
        this.camposExtra    = document.getElementById("campos-extra");
        this.btnCerrarModal = document.getElementById("btn-cerrar-modal");
        this.btnConfirmar   = document.getElementById("btn-confirmar-accion");

        this.inputTitulo      = document.getElementById("form-titulo");
        this.inputArchivo     = document.getElementById("form-archivo");
        this.inputSubtitulo   = document.getElementById("form-subtitulo");
        this.inputDescripcion = document.getElementById("form-descripcion");

        this.btnAvanzar    = document.getElementById("btn-avanzar");
        this.btnRetroceder = document.getElementById("btn-retroceder");
        this.btnPlay       = document.getElementById("btn-play");

        this.btnAgregar   = document.getElementById("btn-agregar");
        this.btnDevolver  = document.getElementById("btn-devolver");
        this.btnModificar = document.getElementById("btn-modificar");
        this.btnEliminar  = document.getElementById("btn-eliminar");
        this.btnInicio    = document.getElementById("btn-inicio");

        if (this.temaNodo) this.temaNodo.textContent = TEMA;

        this.conectarEventos();
        this.mostrarPantalla();
    }

    mostrarPantalla = () => {
        if (imagenes.length > 0) {
            const ciudad = imagenes[this.indiceActual];
            this.imgNodo.src               = ciudad.archivo.startsWith("http") ? ciudad.archivo : `${RUTA}${ciudad.archivo}`;
            this.nombreNodo.textContent    = ciudad.nombre;
            this.subtituloNodo.textContent = ciudad.subtitulo;
            this.descNodo.textContent      = ciudad.descripcion;
        } else {
            this.imgNodo.src               = "";
            this.nombreNodo.textContent    = "LISTA VACÍA";
            this.subtituloNodo.textContent = "";
            this.descNodo.textContent      = "Usa el panel de control para registrar ciudades.";
        }
    };

    controlarAvanzar = () => {
        if (imagenes.length === 0) return;
        this.indiceActual = (this.indiceActual + 1) % imagenes.length;
        this.mostrarPantalla();
    };

    controlarRetroceder = () => {
        if (imagenes.length === 0) return;
        this.indiceActual = (this.indiceActual - 1 + imagenes.length) % imagenes.length;
        this.mostrarPantalla();
    };

    controlarReproduccion = () => {
        if (this.temporizador === null) {
            this.temporizador        = setInterval(this.controlarAvanzar, 2000);
            this.btnPlay.textContent = "■ Stop";
            this.btnPlay.className   = BTN_STOP;
        } else {
            clearInterval(this.temporizador);
            this.temporizador        = null;
            this.btnPlay.textContent = "▶ Play";
            this.btnPlay.className   = BTN_PLAY;
        }
    };

    irAlInicio = () => {
        if (this.temporizador !== null) this.controlarReproduccion();
        this.indiceActual = 0;
        this.mostrarPantalla();
    };

    _llenarFormulario = (ciudad) => {
        this.inputTitulo.value      = ciudad.nombre;
        this.inputArchivo.value     = ciudad.archivo;
        this.inputSubtitulo.value   = ciudad.subtitulo;
        this.inputDescripcion.value = ciudad.descripcion;
    };

    _buscarOAlerta = (nombre) => {
        const pos = buscar(nombre);
        if (pos === -1) alert(` La ciudad "${nombre.toUpperCase()}" no se encuentra registrada.`);
        return pos;
    };

    abrirFormularioModal = (tipoAccion) => {
        if (this.temporizador !== null) this.controlarReproduccion();

        this.accionActual            = tipoAccion;
        this.modalTitulo.textContent = `OPERACIÓN ADMINISTRADOR: ${tipoAccion}`;

        this.inputTitulo.value      = "";
        this.inputArchivo.value     = "";
        this.inputSubtitulo.value   = "";
        this.inputDescripcion.value = "";

        const actual = imagenes.length > 0 ? imagenes[this.indiceActual] : null;

        if (tipoAccion === "AGREGAR") {
            this.camposExtra.classList.remove("oculto");

        } else if (tipoAccion === "MODIFICAR") {
            this.camposExtra.classList.remove("oculto");
            if (actual) {
                this.nombreOriginal = actual.nombre;
                this._llenarFormulario(actual);
            }

        } else {
            this.camposExtra.classList.add("oculto");
            if (tipoAccion === "ELIMINAR" && actual) {
                this.inputTitulo.value = actual.nombre;
            }
        }

        this.modal.classList.add("abierto");
    };

    cerrarFormularioModal = () => {
        this.modal.classList.remove("abierto");
    };

    procesarSubmitFormulario = () => {
        const nombre      = this.inputTitulo.value.trim();
        const archivo     = this.inputArchivo.value.trim();
        const subtitulo   = this.inputSubtitulo.value.trim();
        const descripcion = this.inputDescripcion.value.trim();

        if (nombre === "") {
            alert("El nombre de la ciudad es obligatorio.");
            return;
        }

        // CREAR
        if (this.accionActual === "AGREGAR") {
            //  BUSCAR
            if (buscar(nombre) !== -1) {
                alert(` La ciudad "${nombre.toUpperCase()}" ya existe.`);
                return;
            }
            //  Si no existe 
            const urlArchivo = archivo !== "" ? archivo : `${nombre.toLowerCase()}.jpg`;
            imagenes.push(new Imagen(urlArchivo, nombre, subtitulo, descripcion));
            this.indiceActual = imagenes.length - 1;
            guardarEnAlmacenamiento();
            alert("Ciudad agregada con éxito.");

        // LEER
        } else if (this.accionActual === "DEVOLVER") {
            //  BUSCAR
            const pos = this._buscarOAlerta(nombre);
            if (pos === -1) return;
            //  Si existe, devuelvo
            this.indiceActual = pos;
            const c = imagenes[pos];
            alert(` Objeto Devuelto (Posición ${pos}):\n\nNombre: ${c.nombre}\nSubtítulo: ${c.subtitulo}\nDescripción: ${c.descripcion}`);

        // MODIFICAR
        } else if (this.accionActual === "MODIFICAR") {
            //  BUSCAR
            const pos = this._buscarOAlerta(this.nombreOriginal);
            if (pos === -1) return;
            //  Si existe, modifico
            const ciudad       = imagenes[pos];
            ciudad.nombre      = nombre;
            ciudad.archivo     = archivo !== "" ? archivo : ciudad.archivo;
            ciudad.subtitulo   = subtitulo;
            ciudad.descripcion = descripcion;
            guardarEnAlmacenamiento();
            alert(" Propiedades actualizadas con éxito.");

        // ELIMINAR
        } else if (this.accionActual === "ELIMINAR") {
            //  BUSCAR
            const pos = this._buscarOAlerta(nombre);
            if (pos === -1) return;
            //  Si existe, elimino
            imagenes.splice(pos, 1);
            guardarEnAlmacenamiento();
            if (imagenes.length === 0) {
                this.indiceActual = 0;
            } else if (this.indiceActual >= imagenes.length) {
                this.indiceActual = imagenes.length - 1;
            }
            alert("Ciudad eliminada correctamente.");
        }

        //  MOSTRAR
        this.cerrarFormularioModal();
        this.mostrarPantalla();
    };

    conectarEventos = () => {
        this.btnAvanzar.addEventListener("click",    this.controlarAvanzar);
        this.btnRetroceder.addEventListener("click", this.controlarRetroceder);
        this.btnPlay.addEventListener("click",       this.controlarReproduccion);

        this.btnAgregar.addEventListener("click",   () => this.abrirFormularioModal("AGREGAR"));
        this.btnDevolver.addEventListener("click",  () => this.abrirFormularioModal("DEVOLVER"));
        this.btnModificar.addEventListener("click", () => this.abrirFormularioModal("MODIFICAR"));
        this.btnEliminar.addEventListener("click",  () => this.abrirFormularioModal("ELIMINAR"));
        this.btnInicio.addEventListener("click",    this.irAlInicio);

        this.btnCerrarModal.addEventListener("click", this.cerrarFormularioModal);
        this.btnConfirmar.addEventListener("click",   this.procesarSubmitFormulario);

        this.modal.addEventListener("click", (e) => {
            if (e.target === this.modal) this.cerrarFormularioModal();
        });
    };
}

document.addEventListener("DOMContentLoaded", () => { new AppCarrusel(); 

}
);