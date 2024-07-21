document.addEventListener('DOMContentLoaded', function() {
    let acta_id;
    let posecionarios = [];
    let posecionarioID = null;
    let colindancia = {}

    // boton para agregar un posecionario
    const btnAgregarPosesionario = document.querySelector('.btn-agregar-posesionario');

    const btnColindancia = document.querySelector('#btn-agregar-colindancia')
    const formularioPosesion = document.querySelector('#form-posesion')


    function editarPosecionario(id) {
        posecionarioID = id
        btnAgregarPosesionario.textContent = "Guardar Cambios"
        const posesionarioEditar = posecionarios.filter(e => e.id==id)[0]
        console.log(posesionarioEditar)
        llenarFormulario(posesionarioEditar);
    }

    function eliminarPosecionario(id) {
        // Confirmar si realmente se desea eliminar el posecionario
        posecionarioID = id
        if (confirm('¿Estás seguro de que deseas eliminar este posecionario?')) {
            // Realizar la solicitud al servidor para eliminar el posecionario con el ID proporcionado
            fetch(`/pos/crm/acta/posesion/delete/${id}/`, {
                method: 'POST', // Método HTTP DELETE para eliminar el recurso
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    obtenerPosecionariosDeActa(acta_id)
                    console.log('Posecionario eliminado exitosamente.');
                    posecionarioID = null
                } else {
                    console.error('Error al eliminar el posecionario:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Error de red:', error);
            });
        }
    }

    function cargarActas() {
        fetch('/pos/api/actas/')
        .then(response => response.json())
        .then(actas => {
            console.log(actas)
            const inputCodigo = document.querySelector('#codigo_acta');
            const resultadosDiv = document.querySelector('.buscador-codigo ul');
            inputCodigo.addEventListener('input', function() {
                const valorInput = this.value.trim().toLowerCase();
                const actasFiltradas = filtrarActasPorCodigo(valorInput, actas);
                mostrarResultados(actasFiltradas, resultadosDiv, inputCodigo);
            });
        })
        .catch(error => {
            console.error('Error al obtener las actas:', error);
        });
    }

    function filtrarActasPorCodigo(codigo, actas) {
        return actas.filter(acta => acta.codigo_predio.toLowerCase().includes(codigo));
    }

    function mostrarResultados(actasFiltradas, resultadosDiv, inputCodigo) {
        resultadosDiv.innerHTML = '';
        if (actasFiltradas.length > 0) {
            resultadosDiv.classList.remove('d-none');
            actasFiltradas.forEach(acta => {
                const li = document.createElement('LI');
                li.addEventListener('click', () => {
                    inputCodigo.value = acta.codigo_predio;
                    resultadosDiv.classList.add('d-none');
                    acta_id = acta.id;
                    obtenerPosecionariosDeActa(acta_id);
                    obtenerColindanciaDeActa(acta_id)
                });
                li.textContent = `Código: ${acta.codigo_predio}`;
                li.classList.add('list-element');
                resultadosDiv.appendChild(li);
            });
        } else {
            resultadosDiv.classList.add('d-none');
        }
    }

    function obtenerColindanciaDeActa(acta_id) {
        fetch(`/pos/crm/acta/${acta_id}/colindancia/`)
            .then(response => {
                // Verificar si la solicitud fue exitosa
                if (!response.ok) {
                    throw new Error('Ocurrió un error al obtener la colindancia del acta.');
                }
                // Parsear la respuesta como JSON
                return response.json();
            })
            .then(data => {
                colindancia = data
                if (Object.keys(colindancia).length !== 0) {
                    llenarDatosColindancia()
                    btnColindancia.textContent = 'Guardar'
                }
            })
            .catch(error => {
                // Manejar errores en caso de que la solicitud falle
                console.error('Error:', error.message);
            });
    }

    
    function llenarDatosColindancia() {
        document.querySelector('#frente').value = colindancia.frente_nombre;
        document.querySelector('#medida_frente').value = colindancia.frente_distancia;
        document.querySelector('#direccion_frente').value = colindancia.frente_direccion;

        document.querySelector('#derecha').value = colindancia.derecha_nombre;
        document.querySelector('#medida_derecha').value = colindancia.derecha_distancia;
        document.querySelector('#direccion_derecha').value = colindancia.derecha_direccion;

        document.querySelector('#izquierda').value = colindancia.izquierda_nombre;
        document.querySelector('#medida_izquierda').value = colindancia.izquierda_distancia;
        document.querySelector('#direccion_izquierda').value = colindancia.izquierda_direccion;

        document.querySelector('#fondo').value = colindancia.fondo_nombre;
        document.querySelector('#medida_fondo').value = colindancia.fondo_distancia;
        document.querySelector('#direccion_fondo').value = colindancia.fondo_direccion;
        document.querySelector('#area').value = colindancia.area
        document.querySelector('#perimetro').value = colindancia.perimetro
    
    }

    function llenarFormulario(posecionario) {
        document.querySelector('#apellidos').value = posecionario.apellidos;
        document.querySelector('#nombres').value = posecionario.nombres;
        document.querySelector('#estado_civil').value = posecionario.estadoCivil;
        document.querySelector('#num_doc').value = posecionario.numDoc;
        document.querySelector('#fecha_inicio').value = posecionario.fechaInicio;
        document.querySelector('#fecha_fin').value = posecionario.fechaFin;
    
        // Verificar si hay un documento anterior
        if (posecionario.pdf_documento !== null) {
            // Mostrar el botón "Ver Documento Anterior" y asignarle la URL del documento
            document.getElementById('btnVerDocumento').style.display = 'block';
            document.getElementById('btnVerDocumento').href = posecionario.pdf_documento;
        } else {
            // Ocultar el botón si no hay documento anterior
            document.getElementById('btnVerDocumento').style.display = 'none';
        }
    }
    

    function actualizarTabla(posecionarios) {
        const tabla = document.querySelector('.table tbody');
        tabla.innerHTML = '';
        posecionarios.forEach((posecionario, index) => {
            const tr = document.createElement('tr');
            if (posecionario.id_acta) {
                tr.classList.add('table-primary');
            }
            tr.innerHTML = `
                <td>${posecionario.apellidos}</td>
                <td>${posecionario.nombres}</td>
                <td>${posecionario.estadoCivil}</td>
                <td>${posecionario.numDoc}</td>
                <td>
                    ${
                        posecionario.pdf_documento != null ? 
                        `<a 
                            target="_blank" 
                            class="btn btn-danger btn-sm" 
                            href="${posecionario.pdf_documento}"
                        >
                            Ver <i class="far fa-file-pdf"></i>
                        </a>` 
                        : 'Sin documento'
                    }
                </td>
                <td>${posecionario.aniosPosesion}</td>
                <td>
                    <button class="btn btn-success btn-sm btn-editar">Editar</button>
                    <button class="btn btn-danger btn-sm btn-eliminar">Eliminar</button>
                </td>
            `;
            tabla.appendChild(tr);

            tr.querySelector('.btn-editar').addEventListener('click', () => {
                editarPosecionario(posecionario.id);
            });

            tr.querySelector('.btn-eliminar').addEventListener('click', () => {
                eliminarPosecionario(posecionario.id);
            });
        });
    }

    function calcularDiferenciaAniosMeses(fechaInicio, fechaFin) {
        const fechaInicioObj = new Date(fechaInicio);
        const fechaFinObj = new Date(fechaFin);

        const diferenciaEnMilisegundos = fechaFinObj - fechaInicioObj;
        const milisegundosEnUnAnio = 1000 * 60 * 60 * 24 * 365.25;
        const anios = Math.floor(diferenciaEnMilisegundos / milisegundosEnUnAnio);
        const meses = Math.floor((diferenciaEnMilisegundos % milisegundosEnUnAnio) / (1000 * 60 * 60 * 24 * 30.4375));

        return [anios, meses, `${anios} años y ${meses} meses`];
    }

    function obtenerPosecionariosDeActa(actaId) {
        fetch(`/pos/crm/acta/${actaId}/posecionarios/`)
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudieron obtener los posecionarios.');
            }
            return response.json();
        })
        .then(data => {
            console.log(data)
            posecionarios = posecionarios.concat(data.posecionarios)
            actualizarTabla(data.posecionarios);
        })
        .catch(error => {
            console.error('Error al obtener los posecionarios:', error);
        });
    }

    cargarActas();

    function validarFormularioPosesion() {
        const apellidos = document.querySelector('#apellidos').value.trim();
        const nombres = document.querySelector('#nombres').value.trim();
        const estadoCivil = document.querySelector('#estado_civil').value.trim();
        const numDoc = document.querySelector('#num_doc').value.trim();
        const fechaInicio = document.querySelector('#fecha_inicio').value.trim();
        const fechaFin = document.querySelector('#fecha_fin').value.trim();
        const codigoActa = document.querySelector('#codigo_acta').value.trim();
    
        if (codigoActa === '') {
            alert('Ingresa un código de ficha de levantamiento');
            return false;
        }
    
        if (!(apellidos && nombres && estadoCivil && numDoc && fechaInicio && fechaFin)) {
            alert('Por favor, complete todos los campos.');
            return false;
        }
    
        // Agregar más validaciones según sea necesario
    
        return true; // Retorna true si todas las validaciones pasan
    }

    formularioPosesion.addEventListener('submit', function(e) {
        e.preventDefault()
        const fechaInicio = document.querySelector('#fecha_inicio').value.trim();
        const fechaFin = document.querySelector('#fecha_fin').value.trim();
        const fileInput = document.querySelector('#documento');

        // if (fileInput.files.length === 0) {
        //     alert('Por favor, seleccione un archivo.');
        //     return; 
        // }

        if (validarFormularioPosesion()) {
            const formData = new FormData(formularioPosesion);
            const [anios, meses, diferenciaAniosMeses] = calcularDiferenciaAniosMeses(fechaInicio, fechaFin);
            formData.append('aniosPosesion',anios)
            formData.append('mesesPosesion',meses)
            formData.append('diferenciaAniosMeses',diferenciaAniosMeses)
            formData.append('pdf_documento', fileInput.files[0]);
            formData.append('acta_id',acta_id)
            if(posecionarioID!=null){
                formData.append('id',posecionarioID)
            }
            formData.forEach((valor, clave) => {
                console.log(`${clave}: ${valor}`);
            });
            registrarPosecion(formData);
        }
        
    });

    function registrarPosecion(data) {
        let url = ''
        if(btnAgregarPosesionario.textContent.trim()=="Agregar"){
            url = '/pos/crm/acta/posesion/add'
        }else{
            url = `/pos/crm/acta/posesion/update/${posecionarioID}/`
        }

        fetch(url, {
            method: 'POST',
            body: data
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message); // Aquí puedes acceder al mensaje devuelto desde Django
            formularioPosesion.reset();
            posecionarioID = null
            btnAgregarPosesionario.textContent='Agregar'
            obtenerPosecionariosDeActa(acta_id);
        })
        .catch(error => {
            console.error('Error de red:', error);
        });
    }
    
    // Agregar eventos input a los campos de medida para calcular el perímetro
    const medidaFrente = document.querySelector('#medida_frente');
    const medidaDerecha = document.querySelector('#medida_derecha');
    const medidaIzquierda = document.querySelector('#medida_izquierda');
    const medidaFondo = document.querySelector('#medida_fondo');

    const perimetroInput = document.querySelector('#perimetro');

    [medidaFrente, medidaDerecha, medidaIzquierda, medidaFondo].forEach(input => {
        input.addEventListener('input', calcularPerimetro);
    });

    // Función para calcular el perímetro
    function calcularPerimetro() {
        const frente = parseFloat(medidaFrente.value) || 0;
        const derecha = parseFloat(medidaDerecha.value) || 0;
        const izquierda = parseFloat(medidaIzquierda.value) || 0;
        const fondo = parseFloat(medidaFondo.value) || 0;

        const perimetro = frente + derecha + izquierda + fondo;

        perimetroInput.value = perimetro;
    }

    btnColindancia.addEventListener('click', () => {
        const frente = document.querySelector('#frente').value.trim();
        const frente_medida = document.querySelector('#medida_frente').value.trim();
        const frente_direccion = document.querySelector('#direccion_frente').value.trim();
        const derecha = document.querySelector('#derecha').value.trim();
        const derecha_medida = document.querySelector('#medida_derecha').value.trim();
        const derecha_direccion = document.querySelector('#direccion_derecha').value.trim();
        const izquierda = document.querySelector('#izquierda').value.trim();
        const izquierda_medida = document.querySelector('#medida_izquierda').value.trim();
        const izquierda_direccion = document.querySelector('#direccion_izquierda').value.trim();
        const fondo = document.querySelector('#fondo').value.trim();
        const fondo_medida = document.querySelector('#medida_fondo').value.trim();
        const fondo_direccion = document.querySelector('#direccion_fondo').value.trim();
        const area = document.querySelector('#area').value.trim()
        const perimetro = document.querySelector('#perimetro').value.trim()
    
        // Verificar si algún campo está vacío
        if (!frente || !frente_medida || !frente_direccion ||
            !derecha || !derecha_medida || !derecha_direccion ||
            !izquierda || !izquierda_medida || !izquierda_direccion ||
            !fondo || !fondo_medida || !fondo_direccion || !area || !perimetro) {
            alert('Por favor, complete todos los campos de la colindancia.');
            return;
        }
        const data = {
            acta_id,
            frente: frente,
            frente_medida: frente_medida,
            frente_direccion: frente_direccion,
            derecha: derecha,
            derecha_medida: derecha_medida,
            derecha_direccion: derecha_direccion,
            izquierda: izquierda,
            izquierda_medida: izquierda_medida,
            izquierda_direccion: izquierda_direccion,
            fondo: fondo,
            fondo_medida: fondo_medida,
            fondo_direccion: fondo_direccion,
            area,
            perimetro
        };
        let url;
    if (Object.keys(colindancia).length === 0) {
        // El objeto de colindancia está vacío, por lo que se debe crear
        url = '/pos/crm/acta/colindancia/add';
    } else {
        // El objeto de colindancia ya tiene datos, por lo que se debe actualizar
        const colindanciaId = colindancia.id; // Asegúrate de tener el ID de la colindancia
        url = `/pos/crm/acta/colindancia/update/${colindanciaId}/`;
    }

    // Realizar la solicitud fetch con la URL determinada
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message); // Manejar la respuesta según sea necesario
    })
    .catch(error => {
        console.error('Error al realizar la solicitud:', error);
    });
    });
    
});
// funcion para mostrar los pasos de manera condicional
function mostrarPaso(paso) {
    var paso1 = document.getElementById('paso-1');
    var paso2 = document.getElementById('paso-2');

    if (paso === 1) {
        paso1.style.display = 'block';
        paso2.style.display = 'none';
    } else if (paso === 2) {
        paso1.style.display = 'none';
        paso2.style.display = 'block';
    }
}