// const utils
const getValueListRadio = (listRadio) => {
    console.log(listRadio)
    const selected = [...listRadio].find(element => element.checked);
    return selected.value;
};
const getValuesListCheckbox = (listCheckbox) => {
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
            const base64Content = event.target.result.split(',')[1];
            resolve(base64Content);
        };
        reader.onerror = function (error) {
            reject(error);
        };
        reader.readAsDataURL(file);
    });
}
const submitActa = document.getElementById('form_ficha_levantamiento')
submitActa.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const formDataObject = { };
    formData.forEach((value, key) => {
      formDataObject[key] = value;
    });

    if (!formDataObject['id_posesion_informal']) {
        await Swal.fire({
            title: "Campos obligatorios faltantes",
            text: "Por favor, Seleccione una posesión informal.",
            icon: "warning"
        });
        return; // Detener el envío del formulario
    }
    if (!formDataObject['codigo_predio']) {
        await Swal.fire({
            title: "Campos obligatorios faltantes",
            text: "Por favor, Ingrese el código del predio",
            icon: "warning"
        });
        return; // Detener el envío del formulario
    }

    if(!formDataObject['list-radio-descripcion-fisica-predio']) {
        formDataObject['list-radio-descripcion-fisica-predio'] = '';
    }
    if(!formDataObject['list-radio-uso']) {
        formDataObject['list-radio-uso'] = '';
    }
    if(formDataObject['list-checkbox-serv-bas']) {
        formDataObject['list-checkbox-serv-bas'] = getValuesListCheckbox(listCheckboxServBas);
    } else {
        formDataObject['list-checkbox-serv-bas'] = [ ];
    }
    titulares = getRowsTitulares();
    formDataObject['titulares'] = titulares;
    formDataObject['boceto-predio-pdf'] = await fileToBase64(document.getElementById('boceto-predio-pdf').files[0]);
    formDataObject['toma-fotografica-predio-imagen'] = await fileToBase64(document.getElementById('toma-fotografica-predio-imagen').files[0]);
    formDataObject['documentos-casos-si-pdf'] = await fileToBase64(document.getElementById('documentos-casos-si-pdf').files[0]);
    formDataObject['firmas-operador-topografo-representante-comision-supervisor-de-campo-pdf'] = await fileToBase64(document.getElementById('firmas-operador-topografo-representante-comision-supervisor-de-campo-pdf').files[0]);
    formDataObject['numero-lotes'] = Number(formDataObject['numero-lotes'].trim()) || null
    formDataObject['area-segun-titular-representante'] = Number(formDataObject['area-segun-titular-representante'].trim()) || null;
    formDataObject['numero-puntos'] = Number(formDataObject['numero-puntos'].trim()) || null
    // console.log(formDataObject);
    // return;
    console.log(formDataObject.titulares)
    try {
        const response = await fetch('/pos/crm/acta/add/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formDataObject),
        });

        if (!response.ok) {
            const responseData = await response.json();
            throw new Error(responseData.message);
        }

        const data = await response.json();
        // window.location.href = "pos/crm/acta/";
        console.log('Respuesta del servidor:', data);
        await Swal.fire({
            title: "Ficha creada exitosamente!",
            // text: "Ficha creada exitosamente!",
            icon: "success"
        });
        window.location.replace("/pos/crm/acta/");
    } catch (error) {
        console.error('Error al enviar los datos:', error);
        await Swal.fire({
            title: "Error",
            text: error.message,
            icon: "error"
        });
    }
});