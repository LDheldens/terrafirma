function showPdfButton(input) {
    const buttonPreview = document.getElementById('pdf_button_preview');
    const file = input.files[0];

    if (file) {
        buttonPreview.style.display = 'inline'; 
        buttonPreview.style.border = 'solid 1px red';
        buttonPreview.style.color = 'red';
        buttonPreview.style.padding = '0 5px';
        buttonPreview.style.margin = '10px 0';
        buttonPreview.style.borderRadius = '5px'
    } else {
        buttonPreview.style.display = 'none';
    }
}

function openPdf() {
    const input = document.getElementById('pdf_documento');
    const file = input.files[0];

    if (file) {
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, '_blank'); // Abrir el PDF en una nueva pestaña del navegador
    }
}


let contenedorModal;
let modal;
let btnCloseModal;
let form_titular
let actaId;
let tableTitulares;

document.addEventListener('DOMContentLoaded',()=>{
    contenedorModal = document.querySelector('#contenedor-modal')
    modal = document.querySelector('#modal')
    btnCloseModal = document.querySelector('.btn-close-modal')

    btnCloseModal.addEventListener('click',cerrarModal)
    tableTitulares = document.querySelector('#table-titulares')
    form_titular = document.querySelector('#form-titular')
   
})
function markAsInvalid(inputId) {
    document.getElementById(inputId).classList.add('invalid');
}

// Marcar un campo como válido
function markAsValid(inputId) {
    document.getElementById(inputId).classList.remove('invalid');
}
function mostrarModal(){
    contenedorModal.style.display="flex"
    form_titular.reset()    
}

function cerrarModal(){
    contenedorModal.style.display="none"
    form_titular.reset()
    quitarEstilosValidacion()
}
function quitarEstilosValidacion(){
    const radios = document.querySelectorAll('.error-radio')
    const inputs = document.querySelectorAll('.invalid')
    radios.forEach(radio =>{
        radio.style.display = 'none'
    })
    inputs.forEach(input =>{
        input.classList.remove('invalid')
    })
}
function agregarTitular(id){
    form_titular.style.display = 'block'
    tableTitulares.style.display = 'none'
    actaId = id
    console.log(actaId)
    mostrarModal()
}

function mostrarTitulares(id){
    console.log(id,'mostrar titulares xd')
    form_titular.style.display = 'none'
    tableTitulares.style.display = 'block'
    mostrarModal()
    obtenerTitularesActa(id)
}

function obtenerTitularesActa(actaId){
    fetch(`/pos/crm/acta/${actaId}/titulares`)
        .then(response => response.json())
        .then(data => {
            insertarHtmlTitulares(data.titulares)
    })
    .catch(error => console.error('Error al obtener los titulares:', error));
}

function insertarHtmlTitulares(titulares) {
    console.log(titulares)
    const tbody = tableTitulares.querySelector('tbody')

    tbody.innerHTML = '';

    if(titulares.length > 0){
        
        titulares.forEach(titular => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${titular.nombres}</td>
                <td>${titular.apellidos}</td>
                <td>${titular.estado_civil}</td>
                <td>${titular.num_doc}</td>
                <td>${titular.representante}</td>
            `;
            tbody.appendChild(tr);
        });
    }else{
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td colspan="4" style="text-align:center">Este acta no cuenta con titulares</td>
        `;
        tbody.appendChild(tr);
    }
}