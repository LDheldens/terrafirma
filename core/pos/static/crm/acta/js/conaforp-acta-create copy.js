// logica para crear los titulares


let titulares = [];
const btnGuardarTitular = document.querySelector('#guardar_Titular')
const btnAgregarTitular = document.querySelector('#btn-agregar-titular')
const formTitular = document.querySelector('.form-titular ')
btnAgregarTitular.addEventListener('click',()=>{
    formTitular.classList.remove('hidden')
})

btnGuardarTitular.addEventListener('click',()=>{
    const copiaDocIdentidad = document.getElementById('copia_doc_identidad').value;
    const apellidos = document.getElementById('apellidos').value;
    const nombres = document.getElementById('nombres').value;
    const estadoCivil = document.getElementById('estado_civil').value;
    const numDoc = document.getElementById('num_doc').value;
    const pdfDocumentoInput = document.getElementById('pdf_documento');
    const pdfDocumento = pdfDocumentoInput.files[0]; // Obtener el archivo PDF seleccionado

    // Verificar si los campos obligatorios están vacíos
    if (!copiaDocIdentidad || !apellidos || !nombres || !estadoCivil || !numDoc || !pdfDocumento) {
        // Mostrar un mensaje de error
        mostrarMensajeError('Todos los campos son obligatorios');
        return; // Detener la ejecución del código
    }

    // Verificar si se seleccionó un archivo
    if (pdfDocumento) {
        // Convertir el archivo PDF a una cadena Base64
        const reader = new FileReader();
        reader.onload = function(event) {
            let pdfBase64 = event.target.result;
            
            // Dividir la cadena en dos partes usando la coma como separador y tomar la segunda parte
            pdfBase64 = pdfBase64.split(',')[1];

            // Agregar los datos a la lista de titulares
            titulares.push({
                copiaDocIdentidad: copiaDocIdentidad,
                apellidos: apellidos,
                nombres: nombres,
                estadoCivil: estadoCivil,
                numDoc: numDoc,
                pdfDocumento: pdfBase64 // Almacenar el PDF en formato Base64 sin el prefijo
            });

            // Actualizar la tabla
            limpiarCampos();
            formTitular.classList.add('hidden');
            console.log(titulares);
            actualizarTabla();
        };
        reader.readAsDataURL(pdfDocumento); // Leer el archivo PDF como una URL de datos
    } else {
        // Si no se seleccionó un archivo PDF, agregar solo los otros datos a la lista de titulares
        titulares.push({
            copiaDocIdentidad: copiaDocIdentidad,
            apellidos: apellidos,
            nombres: nombres,
            estadoCivil: estadoCivil,
            numDoc: numDoc
        });

        // Actualizar la tabla
        limpiarCampos();
        formTitular.classList.add('hidden');
        console.log(titulares);
        actualizarTabla();
    }

})

function mostrarMensajeError(mensaje) {
    // Mostrar el mensaje de error en algún elemento HTML, como un div
    const mensajeError = document.getElementById('mensaje_error');
    mensajeError.classList.remove('hidden')
    mensajeError.textContent = mensaje;
    setTimeout(()=>{
        mensajeError.classList.add('hidden')
        mensajeError.textContent = ''
    },3000)
}

function limpiarCampos(){
    document.getElementById('copia_doc_identidad').value = '';
    document.getElementById('apellidos').value = '';
    document.getElementById('nombres').value = '';
    document.getElementById('estado_civil').value = '';
    document.getElementById('num_doc').value = '';
}

function actualizarTabla() {
    console.log({
        titulares
    })
    const tabla = document.querySelector('table tbody');
    // Limpiar la tabla
    tabla.innerHTML = '';

    // Recorrer la lista de titulares y agregar cada uno a la tabla
    titulares.forEach((titular, index) => {
        const fila = document.createElement('tr');
        fila.className = index % 2 === 0 ? 'odd:bg-white even:bg-gray-50 border-b' : 'even:bg-gray-50 border-b';

        fila.innerHTML = `
            <td class='py-2'>
                ${titular.apellidos}
            </td>
            <td class='py-2'>
                ${titular.nombres}
            </td>
            <td class='py-2'>
                ${titular.numDoc}
            </td>
            <td class='py-2'>
                ${titular.estadoCivil}
            </td>
            <td class='py-2'>
                ${titular.copiaDocIdentidad ? 'Si': 'No'}
            </td>
            <td class='py-2 flex gap-1 justify-center'>
                <button type='button' class="mb-2 bg-[#ba2c5e] font-gotham-bold p-2 rounded text-white hover:bg-[#9d1c1c]">
                    <i class="fas fa-trash-alt"></i>
                </button>
                <button type='button' class="mb-2 bg-[#FFA500] font-gotham-bold p-2 rounded text-white hover:bg-[#c18d2c]">
                    <i class="fas fa-pencil-alt"></i>
                </button>
            
                
            </td>
        `;

        tabla.appendChild(fila);
    });
}

// funcion para pasar el formData a un objeto literal 
function formDataToObject(formData) {
    const object = {};
    for (const [key, value] of formData.entries()) {
        object[key] = value;
    }
    return object;
}

// funcion para comvertir a base 64
function fileToBase64(archivo) {
    return new Promise((resolve, reject) => {
        if (!archivo) {
            resolve(''); // Devolver una cadena vacía si no se proporciona ningún archivo
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            // Obtener la parte del contenido base64 después de la coma
            const base64Content = event.target.result.split(',')[1];
            resolve(base64Content);
        };
        reader.onerror = function (error) {
            reject(error);
        };
        reader.readAsDataURL(archivo);
    });
}

const formFicha = document.querySelector('#form_ficha_levantamiento')
formFicha.addEventListener('submit',async(e)=>{
    e.preventDefault()

    // inputs de tipo file
    const inputBoceto = document.querySelector('#boceto-predio').files[0]
    const formData = new FormData(formFicha);
    let objetoLiteral = formDataToObject(formData);
    objetoLiteral.titulares = titulares
    
    // imagenes de actas
    let imagenes = {
        boceto: await fileToBase64(inputBoceto),
        // archivo_firmas: fileToBase64()
    }
    objetoLiteral.imagenes = imagenes

    console.log(objetoLiteral)

    // Enviar los datos al backend
    try {
        const response = await fetch('/pos/crm/acta/add/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(objetoLiteral),
        });
        const data = await response.json();
        console.log('Respuesta del servidor:', data);
    } catch (error) {
        console.error('Error al enviar los datos:', error);
    }
})


//  separacion xddd

// const getValueListRadio = (listRadio) => {
//     const selected = [...listRadio].find(element => element.checked);
//     if(!selected) return '';
//     if(['si', 'no'].includes(selected.value)) return value === 'si'
//     return value
// }

// const getTitularesRepresentantes = (type) => {
//     const result = []
//     const elements = document.querySelectorAll(`#container-${type} > div`);
//     if(elements === 0) return;

//     [...elements].forEach((element, index) => {
//         const apellidos = element.querySelector(`[name="apellidos"]`)
//         const nombres = element.querySelector(`[name="nombres"]`)
//         const estadoCivil = element.querySelector(`[name="apellidos"]`)
//         const tipoDoc = element.querySelector(`[name="apellidos"]`)
//     })

//     // const result = {
//     //     copia_doc_identidad,
//     //     apellidos,
//     //     nombres,
//     //     estado_civil,
//     //     tipo_doc,
//     //     num_doc,
//     //     img_firma_name,
//     //     img_firma,
//     //     img_huella_name,
//     //     img_huella,
//     // }
// }

// const btnCreate = document.getElementById('btn-create')

// formFicha.addEventListener('submit', (e) => {
//     e.preventDefault()
//     const data = {
//         // start
//         fecha: fecha.value,
//         cel_wsp: celWssp.value,
//         // 1.- DATOS DE LA POSESIÓN INFORMAL
//         departamento: departamento.value,
//         provincia: provincia.value,
//         distrito: distrito.value,
//         posesion_informal: posesionInformal.value,
//         sector: sector.value,
//         // 2.- IDENTIFICACIÓN DEL PREDIO
//         etapa: etapa.value,
//         descripcion_fisica: getValueListRadio(listRadioDescripcionFisicaPredio),
//         direccion_fiscal: direccionFiscalReferencia.value,
//         tipo_uso: getValueListRadio(listRadioUso),
//         servicios_basicos: Array.from(listCheckboxServBas).filter(checkbox => checkbox.checked).map(checkbox => checkbox.value),
//         // 3.- DATOS DE(LOS) TITULAR(ES)/REPRESENTANTE(S)
//         carta_poder: getValueListRadio(listRadioCartaPoder),
//         // 4.- BOCETO DEL PREDIO
//         // bocetoDelPredio.value = data.boceto;
//         // colindancia table
//         // colindancia: {
//         //     frente_nombre: nombresApellidosColindanciaFrente.value,
//         //     frente_distancia: distanciaFrente.value,
//         //     fondo_nombre: nombresApellidosColindanciaFondo.value,
//         //     fondo_distancia: distanciaFondo.value,
//         //     derecha_nombre: nombresApellidosColindanciaDerecha.value,
//         //     derecha_distancia: distanciaDerecha.value,
//         //     izquierda_nombre: nombresApellidosColindanciaIzquierda.value,
//         //     izquierda_distancia: distanciaIzquierda.value,
//         // },
//         hitos_consolidados: getValueListRadio(listRadioHitosConsolidado),
//         acceso_a_via: getValueListRadio(listRadioAccesoVia),
//         cantidad_lotes: numeroLotes.value,
//         requiere_subdivision: getValueListRadio(listRadioSubdivion),
//         requiere_alineamiento: getValueListRadio(listRadioAlineamiento),
//         apertura_de_via: getValueListRadio(listRadioAperturaVia),
//         libre_de_riesgo: getValueListRadio(listRadioLibreRiesgo),
//         req_transf_de_titular: getValueListRadio(listRadioTransfTitular),
//         litigio_denuncia: getValueListRadio(listRadioLitigioDenunciaEtc),
//         area_segun_el_titular_representante: areaSegunTitularRepresentante.value,
//         comentario1: comentarioAdic.value,
//         // 5.- DEL LEVANTAMIENTO TOPOGRÁFICO:
//         codigo_dlt: codigo.value,
//         hora: hora.value,
//         n_punto: numeroPuntos.value,
//         operador: operador.value,
//         equipo_tp: equipoTp.value,
//         tiempo_atmosferico: getValueListRadio(listRadioTiempoAtmosferico),
//         comentario2: comentarioObservaciones.value,
//         // 6.- DE LOS TITULAR(ES) O REPRESENTATE(S)
//         // solo texto
//         // 8.- ADICIONALES:
//         adjunta_toma_topografica: getValueListRadio(listRadioTomaFotograficaPredio),
//         adicionales_otros: otros.value,
//         // 9.- FIRMA DEL OPERADOR TOPOGRÁFICO, REPRESENTANTE DE LA COMISIÓN Y SUPERVISOR DE CAMPO
//         imagen_acta: {
//             firma_topografo_name: firmaOperadorTopografo.nextElementSibling.getElementsByTagName('img')[0].getAttribute('file_name') ?? '',
//             firma_topografo: firmaOperadorTopografo.nextElementSibling.getElementsByTagName('img')[0].getAttribute('src')?.replace('data:image/jpeg;base64,', '')  ?? '',
//             firma_representante_comision_name: firmaRepresentanteComision.nextElementSibling.getElementsByTagName('img')[0].getAttribute('file_name') ?? '',
//             firma_representante_comision: firmaRepresentanteComision.nextElementSibling.getElementsByTagName('img')[0].getAttribute('src')?.replace('data:image/jpeg;base64,', '') ?? '',
//             firma_supervisor_campo_name: firmaSupervisorCampo.nextElementSibling.getElementsByTagName('img')[0].getAttribute('file_name') ?? '',
//             firma_supervisor_campo: firmaSupervisorCampo.nextElementSibling.getElementsByTagName('img')[0].getAttribute('src')?.replace('data:image/jpeg;base64,', '') ?? '',
//             comentario3: firmaActoresIntervinientesComentarioObservaciones.value
//         },
        
//         // pro
//         handl_titulares: {
//             to_add:[],
//             to_delete:[],
//             to_update:[]
//         },
//         handl_representantes: {
//             to_add:[],
//             to_delete:[],
//             to_update:[]
//         }
//     };
//     return console.log(data)
//     fetch(window.location.pathname, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(data),
//     })
//     .then(res => {
//         if(res.status === 200) {
//             location.reload();
//         }
//     })
//     .catch(console.log);
// })


// const setValueListRadio = (elementsRadio, value) => {
//     [...elementsRadio]
//     .find(element => element.value == value).checked = true;
//     return true;
// };
// const setValuesListChecked = (elements, values) => {
//     [...elements]
//     .filter(element => values.includes(element.value))
//     .map(element => element.checked = true);
// };

// const handlerImage = (event) => {
//     const file = event.target.files[0];
//     const fileName = file.name;
//     console.log({fileName})
//     if(file) {
//         const reader = new FileReader();
//         reader.onload = (e) => {
//             const element = event.target.nextElementSibling.getElementsByTagName('img')[0];
//             element.setAttribute('src', e.target.result);
//             element.setAttribute('file_name', fileName);
//         };
//         reader.readAsDataURL(file);
//     }
// }
// firmaOperadorTopografo.addEventListener('change', handlerImage);
// firmaRepresentanteComision.addEventListener('change', handlerImage);
// firmaSupervisorCampo.addEventListener('change', handlerImage);


