// const utils
const getValueListRadio = (nameListRadio) => {
    const listRadio = document.getElementsByName(nameListRadio)
    const selected = Array.from(listRadio).find(element => element.checked);
    return selected.value;
};
const getValuesListCheckbox = (nameListCheckbox) => {
    const listCheckbox = document.getElementsByName(nameListCheckbox)
    const result = Array.from(listCheckbox).filter(checkbox => checkbox.checked)
                        .map(checkbox => checkbox.value);
    return result;
};



function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve('');
        }
        const reader = new FileReader();
        reader.onload = function (event) {
            console.log({
                base64: event.target.result
            })
            const base64Content = event.target.result.split(',')[1];
            resolve(base64Content);
        };
        reader.onerror = function (error) {
            reject(error);
        };
        reader.readAsDataURL(file);
    });
}
const submitActa = document.getElementById('form_ficha_udd')
submitActa.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const formDataObject = { };
    formData.forEach((value, key) => {
      formDataObject[key] = value;
    });
    // Validar si el campo de código está presente
    if (!formDataObject['codigo']) {
        await Swal.fire({
            title: "Campo obligatorio faltante",
            text: "Por favor, ingrese el código.",
            icon: "warning"
        });
        return;
    }
    // Función para validar las coordenadas con hasta cuatro decimales
    function validarCoordenada(coordinate) {
        const coordinateRegex = /^-?\d+\.\d{4}$/;
        return coordinateRegex.test(coordinate);
    }

    const coordinateX = document.getElementById('wgs-x84-x').value;
    const coordinateY = document.getElementById('wgs-x84-y').value;
    console.log(coordinateX,coordinateY)

     // Validar coordenada X si hay un valor
    if (coordinateX !== '') {
        if (!validarCoordenada(coordinateX)) {
            await Swal.fire({
                title: "Error de formato",
                text: "La coordenada X debe ser un número con 4 cuatro decimales.",
                icon: "error"
            });
            return;
        }
    }
    
    // Validar coordenada Y si hay un valor
    if (coordinateY != '') {
        console.log('sdfsdsdsdsddssd PRUEBA')
        if (!validarCoordenada(coordinateY)) {
            await Swal.fire({
                title: "Error de formato",
                text: "La coordenada Y debe ser un número con 4 cuatro decimales.",
                icon: "error"
            });
            return;
        }
    }

    formDataObject['wgs-x84-x'] = Number(formDataObject['wgs-x84-x'].trim().replace(',', '.')) || null;
    formDataObject['wgs-x84-y'] = Number(formDataObject['wgs-x84-y'].trim().replace(',', '.')) || null;
    formDataObject['distancia'] = Number(formDataObject['distancia'].trim()) || null;
    formDataObject['numero-lotes'] = Number(formDataObject['numero-lotes'].trim()) || null;
    formDataObject['numero-manzanas'] = Number(formDataObject['numero-manzanas'].trim()) || null;
    formDataObject['porcentaje-vivencia'] = Number(formDataObject['porcentaje-vivencia'].trim().replace(',', '.')) || null;

    if(!formDataObject['list-radio-tipo-posesion-informal']) {
        formDataObject['list-radio-tipo-posesion-informal'] = '';
    }
    if(!formDataObject['list-radio-tipo-configuracion-urbana']) {
        formDataObject['list-radio-tipo-configuracion-urbana'] = '';
    }
    
    if(!formDataObject['list-checkbox-equipamientos']) {
        formDataObject['list-checkbox-equipamientos'] = []
    } else {
        formDataObject['list-checkbox-equipamientos'] = getInfoCheckbox({
            nameListCheckbox: 'list-checkbox-equipamientos',
            nameListInputCantidad: 'list-input-equipamientos-cantidad',
        });
    }
    if(!formDataObject['list-checkbox-material-predominante']) {
        formDataObject['list-checkbox-material-predominante'] = []
    } else {
        formDataObject['list-checkbox-material-predominante'] = getInfoCheckbox({
            nameListCheckbox: 'list-checkbox-material-predominante',
            nameListInputCantidad: 'list-input-material-predominante-cantidad',
        });
    }
    if(!formDataObject['list-checkbox-servicios-basicos']) {
        formDataObject['list-checkbox-servicios-basicos'] = []
    } else {
        formDataObject['list-checkbox-servicios-basicos'] = getInfoCheckbox({
            nameListCheckbox: 'list-checkbox-servicios-basicos',
            nameListInputCantidad: 'list-input-servicios-basicos-cantidad',
        });
    }
    
    formDataObject['list-radio-zonificacion-municipal'] = getValueListRadio('list-radio-zonificacion-municipal') === 'si'? true: false;
    formDataObject['list-radio-zonas-arqueologica-o-reservas-naturales'] = getValueListRadio('list-radio-zonas-arqueologica-o-reservas-naturales') === 'si'? true: false;

    if(!formDataObject['list-radio-zonas-arqueologicas-o-reservas-naturales-ubicacion']) {
        formDataObject['list-radio-zonas-arqueologicas-o-reservas-naturales-ubicacion'] = '';
    } else {
        formDataObject['list-radio-zonas-arqueologicas-o-reservas-naturales-ubicacion'] = getValueListRadio('list-radio-zonas-arqueologicas-o-reservas-naturales-ubicacion')
    }
    
    
    formDataObject['zonas-arqueologicas-o-reservas-naturales-pdf'] = await fileToBase64(document.getElementById('zonas-arqueologicas-o-reservas-naturales-pdf').files[0]);
    //
    formDataObject['list-radio-zonas-riesgo'] = getValueListRadio('list-radio-zonas-riesgo') === 'si'? true: false;
    if(!formDataObject['list-radio-zonas-riesgo-ubicacion']) {
        formDataObject['list-radio-zonas-riesgo-ubicacion'] = '';
    } else {
        formDataObject['list-radio-zonas-riesgo-ubicacion'] = getValueListRadio('list-radio-zonas-riesgo-ubicacion')
    }
    formDataObject['zonas-riesgo-pdf'] = await fileToBase64(document.getElementById('zonas-riesgo-pdf').files[0]);
    //
    formDataObject['list-radio-conflictos-digerenciales'] = getValueListRadio('list-radio-conflictos-digerenciales') === 'si'? true: false;
    formDataObject['conflictos-dirigenciales-pdf'] = await fileToBase64(document.getElementById('conflictos-dirigenciales-pdf').files[0]);
    //
    formDataObject['list-radio-conflictos-judiciales-o-administrativo'] = getValueListRadio('list-radio-conflictos-judiciales-o-administrativo') === 'si'? true: false;
    formDataObject['imagen-satelital-pdf'] = await fileToBase64(document.getElementById('imagen-satelital-pdf').files[0]);
    console.log(formDataObject,'dfvdfgf');



    try {
        const path = action == 'add' ? '/pos/crm/ficha_udd/add' : window.location.pathname;
        const response = await fetch(path, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formDataObject),
        });
    
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }
    
        const data = await response.json();
        console.log('Respuesta del servidor:', data);
        await Swal.fire({
            title: `Ficha_udd ${action === 'add' ? 'añadida' : 'actualizada'} exitosamente!`,
            icon: "success"
        })
        window.location.replace("/pos/crm/ficha_udd/")
    } catch (error) {
        console.error('Error al enviar los datos:', error);
        await Swal.fire({
            title: 'Error',
            text: error.message,
            icon: 'error'
        });
    }
    
});