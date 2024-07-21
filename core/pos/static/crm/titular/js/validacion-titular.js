document.addEventListener('DOMContentLoaded', () => {
    const formTitular = document.getElementById('form-titular');

    let apellidos = document.getElementById('apellidos')
    let nombres = document.getElementById('nombres')
    let numDoc = document.getElementById('numero-doc')

    let dni = document.getElementById('dni')
    const btnSearchDni = document.querySelector('#button-dni')

    btnSearchDni.addEventListener('click',(e)=>{
        obtenerDatosUsuario()
    })
    btnSearchDni.addEventListener('input', event => event.target.value = event.target.value.replace(/\D/g, ''));

    formTitular.addEventListener('submit', (e) => {
        e.preventDefault();

        let apellidos = document.getElementById('apellidos').value.trim();
        let nombres = document.getElementById('nombres').value.trim();
        let numDoc = document.getElementById('numero-doc').value.trim();
        const pdfInput = document.getElementById('pdf_documento');
        
        let isValid = true;

        // Validación de los campos obligatorios
        if (apellidos === '') {
            markAsInvalid('apellidos');
            isValid = false;
        } else {
            markAsValid('apellidos');
            isValid=true
        }
        
        if (nombres === '') {
            markAsInvalid('nombres');
            isValid = false;
        } else {
            markAsValid('nombres');
            isValid=true
        }
        
        if (numDoc === '') {
            markAsInvalid('numero-doc');
            isValid = false;
        } else {
            markAsValid('numero-doc');
            isValid=true
        }
        
        // validacion para los inputs tipo radio 
        if (document.querySelector('input[name="copia_doc_identidad"]:checked') === null) {
            isValid = false;
            const copiaDocGroup = document.querySelector('.group_1');
            copiaDocGroup.querySelector('.error-radio').style.display = 'block';
        } else {
            isValid = true
            const copiaDocGroup = document.querySelector('.group_1');
            copiaDocGroup.querySelector('.error-radio').style.display = 'none';
        }
        
        if (document.querySelector('input[name="estado_civil"]:checked') === null) {
            isValid = false;
            const estadoCivilGroup = document.querySelector('.group_4');
            estadoCivilGroup.querySelector('.error-radio').style.display = 'block';
        } else {
            isValid = true
            const estadoCivilGroup = document.querySelector('.group_4');
            estadoCivilGroup.querySelector('.error-radio').style.display = 'none';
        }
        
        const pdfFile = pdfInput.files[0];
        if (!pdfFile || pdfFile.type !== 'application/pdf') {
            markAsInvalid('pdf_documento');
            isValid = false;
        } else {
            markAsValid('pdf_documento');
            isValid = true;
        }
        if(isValid){
            const formData = new FormData(formTitular);

            formData.append('pdf_documento', pdfInput.files[0]);
            formData.append('acta_id', actaId); 
            // Configurar opciones para la solicitud Fetch
            const options = {
                method: 'POST',
                body: formData,
            };

            // Realizar la solicitud Fetch
            fetch('/pos/crm/titular/add/', options)
                .then(response => {
                    if (response.ok) {
                        // Si la respuesta es exitosa, mostrar mensaje de éxito
                        console.log('Titular creado correctamente');
                        formTitular.reset();
                        document.querySelector('.btn.btn-success.btn-flat').click();
                        mostrarModal()
                    } else {
                        // Si la respuesta no es exitosa, mostrar mensaje de error
                        console.error('Error al crear titular');
                        // Aquí puedes manejar errores de forma adecuada
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    // Manejar errores de red u otros errores
                });
        }
    });
    function capitalize(str) {
        return str.replace(/\b\w/g, function(l) {
            return l.toUpperCase();
        }).replace(/\B\w+/g, function(l) {
            return l.toLowerCase();
        });
    }
    
    function obtenerDatosUsuario() {
        fetch('/tools/search-dni-pe/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                dni: dni.value.trim(),
            }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener la respuesta del servidor.');
            }
            return response.json();
        })
        .then(data => {
            // return console.log(data)
            // Aquí puedes manipular los datos obtenidos de la respuesta
            apellidos.value = `${capitalize(data.apellidoPaterno || '')} ${capitalize(data.apellidoMaterno || '')}`;
            nombres.value = capitalize(data.nombres || '');
            numDoc.value = dni.value;
        })
        .catch(error => {
            console.error(error.message);
            const initial = btnSearchDni.innerText;
            btnSearchDni.innerText = 'Error del servidor!';
            setTimeout(() => {
                btnSearchDni.innerText = initial;
            }, 2000);
        });
    }

    function markAsInvalid(inputId) {
        document.getElementById(inputId).classList.add('invalid');
    }

    function markAsValid(inputId) {
        document.getElementById(inputId).classList.remove('invalid');
    }
});
