const fileInput = document.querySelector('input');
const preview = document.getElementById('preview');

var columnasDatosClientes = [
    "Nombre",
    "Tipo de identificación",
    "Número de identificación",
    "Código país",
    "Teléfono",
    "Código país 2",
    "Teléfono 2",
    "Correo electrónico",
    "Provincia",
    "Cantón",
    "Distrito",
    "Barrio",
    "Otras señas"
];

var columnasDatosServicios = [
    "Codigo.01",
    "Codigo.02",
    "Codigo.03",
    "Codigo.04",
    "Codigo.99",
    "Nombre",
    "Descripción",
    "Unidad de medida",
    "Unidad de medida comercial",
    "Tipo artículo / servicio",
    "Precio",
    "Moneda",
    "Actividad económica",
    "Gravamen",
    "Impuestos.01",
    "Impuestos.02",
    "Impuestos.03",
    "Impuestos.04",
    "Impuestos.05",
    "Impuestos.06",
    "Impuestos.07.BaseImponible",
    "Impuestos.07.IVA",
    "Impuestos.08",
    "Impuestos.12",
    "Impuestos.99",
    "Código Cabys",
    "Estado"
];

var clientes = [];
var servicios = [];

class Cliente {
    constructor() {
        this.nombre = null;
        this.tipoId = null;
        this.numId = null;
        this.codigoPais1 = null;
        this.telefono1 = null;
        this.codigoPais2 = null;
        this.telefono2 = null;
        this.correo = null;
        this.provincia = null;
        this.canton = null;
        this.distrito = null;
        this.barrio = null;
        this.otrasSenas = null;
        this.fechaUltimaActualizacion = null;
    }
}

class Servicio {
    constructor() {
        this.codigo01 = null;
        this.codigo02 = null;
        this.codigo03 = null;
        this.codigo04 = null;
        this.codigo99 = null;
        this.nombre = null;
        this.descripcion = null;
        this.unidadMedida = null;
        this.tipoServicio = null;
        this.precio = null;
        this.moneda = null;
        this.actividadEconomica = null;
        this.gravamen = null;
        this.impuesto01 = null;
        this.impuesto02 = null;
        this.impuesto03 = null;
        this.impuesto04 = null;
        this.impuesto05 = null;
        this.impuesto06 = null;
        this.impuesto07BI = null;
        this.impuesto07IVA = null;
        this.impuesto08 = null;
        this.impuesto12 = null;
        this.impuesto99 = null;
        this.codigoCabys = null;
        this.estado = null;
        this.fechaUltimaActualizacion = null;
    }
}

/* ---------- extraerDatosCliente ----------
** Crea un objeto Cliente nuevo.
** Extrae todos los datos encontrados en datosCliente que proviene del comprobante
** y los almacena en el objeto Cliente.
** Devuelve el objeto Cliente.
*/ 
function extraerDatosCliente(datosCliente, fechaComprobante) {

    let clienteNuevo = new Cliente();

    clienteNuevo.nombre = datosCliente.Nombre;
    clienteNuevo.tipoId = datosCliente?.Identificacion?.Tipo;
    clienteNuevo.numId = datosCliente?.Identificacion?.Numero;

    let telefonos = datosCliente?.Telefono;

    if(telefonos != undefined) {
        if(Array.isArray(telefonos)) {
            clienteNuevo.codigoPais1 = telefonos[0].CodigoPais;
            clienteNuevo.telefono1 = telefonos[0].NumTelefono;
            clienteNuevo.codigoPais2 = telefonos[1].CodigoPais;
            clienteNuevo.telefono2 = telefonos[1].NumTelefono;
        }
        else {
            clienteNuevo.codigoPais1 = telefonos.CodigoPais;
            clienteNuevo.telefono1 = telefonos.NumTelefono;
        }
    }

    clienteNuevo.correo = datosCliente?.CorreoElectronico;

    let ubicacion = datosCliente?.Ubicacion;

    if(ubicacion != undefined) {
        clienteNuevo.provincia = ubicacion?.Provincia;
        clienteNuevo.canton = ubicacion?.Canton;
        clienteNuevo.distrito = ubicacion?.Distrito;
        clienteNuevo.barrio = ubicacion?.Barrio;
        clienteNuevo.otrasSenas = ubicacion?.OtrasSenas;
    }

    clienteNuevo.fechaUltimaActualizacion = fechaComprobante;

    return clienteNuevo;

}

/* ---------- extraerDatosServicio ----------
** Crea un objeto Servicio nuevo.
** Extrae todos los datos encontrados en datosServicio que proviene del comprobante
** y los almacena en el objeto Servicio.
** Devuelve el objeto Servicio.
*/ 
function extraerDatosServicio(datosServicio, moneda, actividadEconomica, fechaComprobante) {

    let servicioNuevo = new Servicio();
    
    let codigoCabys = datosServicio.Codigo;
    let tipoId = datosServicio.CodigoComercial.Tipo;
    let numId = datosServicio.CodigoComercial.Codigo;
    let llaveCodigo = "codigo".concat(tipoId);

    let extraerImpuestos = function (impuesto) {
        let tarifa = impuesto?.Tarifa;

        if(tarifa == undefined) {
            return;
        }

        let codigoImpuesto = impuesto.Codigo;
        let llaveImpuesto = "impuesto".concat(codigoImpuesto);
        
        if(codigoImpuesto == '07') {
            servicioNuevo[llaveImpuesto.concat('BI')] = datosServicio?.BaseImponible;
            servicioNuevo[llaveImpuesto.concat('IVA')] = tarifa;
        }
        else {
            servicioNuevo[llaveImpuesto] = tarifa; 
        }

        servicioNuevo.gravamen = 'G'; // G: gravado

    }

    servicioNuevo[llaveCodigo] = numId;

    servicioNuevo.nombre = datosServicio.Detalle;
    servicioNuevo.descripcion = datosServicio.Detalle;
    servicioNuevo.unidadMedida = datosServicio.UnidadMedida;

    let numTipoServicio = codigoCabys.substring(0, 1);

    
    if(numTipoServicio > 0 && numTipoServicio >= 5) {
        servicioNuevo.tipoServicio = 'M'; // M: mercancía
    }
    else {
        servicioNuevo.tipoServicio = 'S'; // S: servicio
    }

    servicioNuevo.precio = datosServicio.PrecioUnitario;
    servicioNuevo.moneda = moneda;
    servicioNuevo.actividadEconomica = actividadEconomica;
    servicioNuevo.gravamen = 'E'; // E: exento

    let impuestos = datosServicio?.Impuesto;

    if(impuestos != undefined) {
        if(Array.isArray(impuestos)) {
            for(let i=0; i<impuestos.length; i++) {
                extraerImpuestos(impuestos[i]);
            }
        }
        else {
            extraerImpuestos(impuestos);
        }
    }

    servicioNuevo.codigoCabys = codigoCabys;
    servicioNuevo.estado = 'A'; // A: activo (es activo por defecto)
    servicioNuevo.fechaUltimaActualizacion = fechaComprobante;

    return servicioNuevo;
}


/* ---------- indiceClienteExistente ----------
** Busca un cliente existente en el arreglo con el mismo tipo y número de identificación
** que el cliente pasado por parámetro.
** - Devuelve el índice del cliente existente: si se encuentra en el arreglo.
** - Devuelve nulo: si el cliente pasado por parámetro no contiene tipo y/o número de ID.
** - Devuelve -1: si no se encuentra el cliente en el arreglo de servicios.
*/ 
function indiceClienteExistente(datosCliente) {
    let tipoId = datosCliente?.Identificacion?.Tipo;
    let numId = datosCliente?.Identificacion?.Numero;

    if(tipoId != undefined && numId != undefined)
    {
        for(let i=0; i<clientes.length; i++) {
            if(clientes[i].tipoId == tipoId && clientes[i].numId == numId) {
                return i;
            }
        }
    }
    else
    {
        return null;
    }

    return -1;
}

/* ---------- indiceServicioExistente ----------
** Busca un servicio existente en el arreglo con el mismo tipo y número de identificación
** que el servicio pasado por parámetro.
** - Devuelve el índice del servicio existente: si se encuentra en el arreglo.
** - Devuelve nulo: si el servicio pasado por parámetro no contiene tipo y/o número de ID.
** - Devuelve -1: si no se encuentra el servicio en el arreglo de servicios.
*/ 
function indiceServicioExistente(datosServicio) {
    let tipoId = datosServicio?.CodigoComercial?.Tipo;
    let numId = datosServicio?.CodigoComercial?.Codigo;

    if(tipoId != undefined && numId != undefined){

        let llaveCodigo = "codigo".concat(tipoId);

        for(let i=0; i<servicios.length; i++) {
            if(servicios[i][llaveCodigo] != null) {
                if(servicios[i][llaveCodigo] == numId) {
                    return i;
                }
            }
        }
    }
    else
    {
        return null;
    }

    return -1;
}

/* ---------- actualizarDatosCliente ----------
** Extrae los datos del cliente actual y modifica el cliente existente con los datos actualizados.
*/ 
function actualizarDatosCliente(indiceCliente, datosCliente, fechaComprobante) {
    let clienteActual = extraerDatosCliente(datosCliente, fechaComprobante);
    let clienteExistente = clientes[indiceCliente];

    // Recorre todas las propiedades del objeto cliente para incluir
    // cualquier información existente en el cliente actualizado.
    for (const prop of Object.entries(clienteActual)) {
        if (clienteActual[prop] == null) {
            clienteActual[prop] = clienteExistente[prop];
        }
    }

    clientes.splice(indiceCliente, 1, clienteActual);
}

/* ---------- actualizarDatosServicio ----------
** Extrae los datos del servicio actual y modifica el servicio existente con los datos actualizados.
*/ 
function actualizarDatosServicio(indiceServicio, datosServicio, moneda, actividadEconomica, fechaComprobante) {
    let servicioActual = extraerDatosServicio(datosServicio, moneda, actividadEconomica, fechaComprobante);
    let servicioExistente = servicios[indiceServicio];

    // Recorre todas las propiedades del objeto servicio para incluir
    // cualquier información existente en el servicio actualizado.
    for (const prop of Object.entries(servicioActual)) {
        if (servicioActual[prop] == null) {
            servicioActual[prop] = servicioExistente[prop];
        }
    }

    servicios.splice(indiceServicio, 1, servicioActual);
}

/* ---------- agregarCliente ----------
** Extrae los datos del cliente y lo agrega al arreglo de clientes.
*/ 
function agregarCliente(datosCliente, fechaComprobante) {
    let clienteNuevo = extraerDatosCliente(datosCliente, fechaComprobante);
    clientes.push(clienteNuevo);
}

/* ---------- agregarServicio ----------
** Extrae los datos del servicio y lo agrega al arreglo de servicios.
*/ 
function agregarServicio(datosServicio, moneda, actividadEconomica, fechaComprobante) {
    let servicioNuevo = extraerDatosServicio(datosServicio, moneda, actividadEconomica, fechaComprobante);
    servicios.push(servicioNuevo);
}

/* ---------- procesarCliente ----------
** Procesa un cliente, agregándolo al arreglo de clientes si es completamente nuevo, llamando el método agregarCliente
** Si no es nuevo, actualiza los datos del cliente existente llamando al método actualizarDatosCliente.
*/ 
function procesarCliente(datosCliente, fechaComprobante) {

    if(clientes.length == 0) {
        agregarCliente(datosCliente, fechaComprobante);
    }
    else {
        let indiceCliente = indiceClienteExistente(datosCliente);
        if(indiceCliente == null) {
            return;
        }
        else if(indiceCliente == -1) {
            agregarCliente(datosCliente, fechaComprobante);
        }
        else {
            if(clientes[indiceCliente].fechaUltimaActualizacion < fechaComprobante) {
                actualizarDatosCliente(indiceCliente, datosCliente, fechaComprobante);
            }
        }
    }
}

/* ---------- procesarServicio ----------
** Procesa un servicio, agregándolo al arreglo de servicios si es completamente nuevo, llamando el método agregarServicio
** Si no es nuevo, actualiza los datos del servicio existente llamando al método actualizarDatosServicio.
*/ 
function procesarServicio(datosServicio, moneda, actividadEconomica, fechaComprobante) {

    if(servicios.length == 0) {
        agregarServicio(datosServicio, moneda, actividadEconomica, fechaComprobante);
    }
    else {
        let indiceServicio = indiceServicioExistente(datosServicio);
        if(indiceServicio == null) {
            return;
        }
        else if(indiceServicio == -1) {
            agregarServicio(datosServicio, moneda, actividadEconomica, fechaComprobante);
        }
        else {
            if(servicios[indiceServicio].fechaUltimaActualizacion < fechaComprobante) {
                actualizarDatosServicio(indiceServicio, datosServicio, moneda, actividadEconomica, fechaComprobante);
            }
        }
    }
}

/* ---------- procesarTodosServicios ----------
** Extrae los datos compartidos entre todos los servicios en el comprobante.
** Llama a procesarServicio para todos los servicios que se encuentren en el comprobante.
*/ 
function procesarTodosServicios(jsonDoc, tipoComprobante) {

    let fechaComprobante = jsonDoc[tipoComprobante].FechaEmision;
    let serviciosNuevos = jsonDoc[tipoComprobante].DetalleServicio.LineaDetalle;
    let moneda = jsonDoc[tipoComprobante].ResumenFactura.CodigoTipoMoneda;
    let actividadEconomica = jsonDoc[tipoComprobante].CodigoActividad;

    if(Array.isArray(serviciosNuevos)){
        for(let i=0; i<serviciosNuevos.length; i++){
            procesarServicio(serviciosNuevos[i], moneda, actividadEconomica, fechaComprobante);
        }
    }
    else {
        procesarServicio(serviciosNuevos, moneda, actividadEconomica, fechaComprobante)
    }

}

/* ---------- procesarArchivo ----------
** Revisa el tipo de comprobante y llama los métodos procesarCliente y procesarTodosServicios,
** que se encargan de procesar los datos del cliente y los servicios en el comprobante, respectivamente.
*/ 
function procesarArchivo(jsonDoc) { 
    let comprobanteEsFactura = jsonDoc.FacturaElectronica ? true : false;
    let comprobanteEsTiquete = jsonDoc.TiqueteElectronico ? true : false;
    let tipoComprobante;

    let procesar = function(jsonDoc, tipoComprobante) {
        let datosCliente = jsonDoc[tipoComprobante]?.Receptor;

        if(datosCliente != undefined) {
            let fechaComprobante = jsonDoc[tipoComprobante].FechaEmision;
            procesarCliente(datosCliente, fechaComprobante);
        }

        procesarTodosServicios(jsonDoc, tipoComprobante);
    }

    if(comprobanteEsFactura) {
        tipoComprobante = "FacturaElectronica";
        procesar(jsonDoc, tipoComprobante);
    }
    else if( comprobanteEsTiquete) {
        tipoComprobante = "TiqueteElectronico";
        procesar(jsonDoc, tipoComprobante);
    }
    
}

// function exportarCsvClientes() {
//     let textoCsv = '';

//     columnasDatosClientes.forEach(columna => {
//         textoCsv += columna.join(',') + '\n';
//     });

//     clientes.forEach(cliente => {
//         let i = 0;
//         for (const prop of Object.entries(cliente)) {
//             textoCsv += prop[i][1].join(',') + '\n';
//             i++;
//         }
//     });

//     console.log(textCsv);

// }


/* ---------- procesarTodosArchivos ----------
** Abre y lee cada archivo que el usuario subió.
** Usa la biblioteca X2JS para parsear el texto XML de cada archivo.
** Esto es para facilitar el acceso a los datos en los archivos.
** Para cada archivo, llama el método procesarArchivo,
** que indirectamente se encarga de la extracción y el almacenamiento de datos.
*/ 
function procesarTodosArchivos() {
    const x2js = new X2JS();
    let jsonDoc;
    let numArchivos = fileInput.files.length;

    for(let i=0; i<numArchivos; i++) {
        let fr = new FileReader();
        fr.onloadend = function(e) {
            jsonDoc = x2js.xml_str2json(fr.result);
            procesarArchivo(jsonDoc);
        }
        fr.readAsText(fileInput.files[i]);
    }

}

fileInput.addEventListener('change', () => {
    procesarTodosArchivos();
});



