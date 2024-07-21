const btnAgregarColindantes = document.getElementById('btn-agregar-colindantes');
const colindatesContainer = document.getElementById('colindantes-container');

const selectorsModal = {
    btnSearchDni: null,
    dniTosearch: null,
    dni: null,
    apellidos: null,
    nombres: null,
    docPdf: null,
    docPdfValue: null,
};

//utils
function capitalize(str) {
    return str.replace(/\b\w/g, function(l) {
        return l.toUpperCase();
    }).replace(/\B\w+/g, function(l) {
        return l.toLowerCase();
    });
}


const deleteRow = (no) => {
    const row = colindatesContainer.querySelector(`#row${ no }`);
    const btnDeleteRow = colindatesContainer.querySelector(`#delete${ no }`);
    const btnEditRow = colindatesContainer.querySelector(`#edit${ no }`);
    btnDeleteRow.removeEventListener('click', () => deleteRow(no));
    btnEditRow.removeEventListener('click', () => editRow(no));
    row.outerHTML = '';
};

const editRow = (no) => {
    console.log({no})
    // get values td
    const row = colindatesContainer.querySelector(`#row${ no }`).querySelectorAll('td')

    let data = {
        codigoPredio: row[0],
        nombreRepresentante: row[1],
        frente: row[2],
        fondo: row[3],
        izquierda: row[4],
        derecha: row[5],
        areaDocumento: row[6],
        areaLevantamiento: row[7],
        diferencias: row[8],
        contingencia: row[9],
        indicacion: row[10],
    };
    const newData = Object.keys(data).reduce((prev, next) => {
        prev[next] = data[next].innerText.trim();
        return prev;
    }, { });
    // make modal
    const html = getHtmlModal({
        isAdd: false,
        data: newData,
    });
    makeModal(html).then(({ isConfirmed, value = { } }) => {
        if(isConfirmed) {
            data.codigoPredio.innerText = value.codigoPredio;
            data.nombreRepresentante.innerText = value.nombreRepresentante;
            data.frente.innerText = value.frente;
            data.fondo.innerText = value.fondo;
            data.izquierda.innerText = value.izquierda;
            data.derecha.innerText = value.derecha;
            data.areaDocumento.innerText = value.areaDocumento;
            data.areaLevantamiento.innerText = value.areaLevantamiento;
            data.diferencias.innerText = value.diferencias;
            data.contingencia.innerText = value.contingencia;
            data.indicacion.innerText = value.indicacion;
        } else {
            console.log('cancell!');
        }
    });
};

const addRow = (data) => {
    const {
        codigoPredio,
        nombreRepresentante,
        frente,
        fondo,
        izquierda,
        derecha,
        areaDocumento,
        areaLevantamiento,
        diferencias,
        contingencia,
        indicacion,
    } = data || { };
    const no = colindatesContainer.childElementCount;
    const row = 
    /*html*/
`
<tr class="odd:bg-white even:bg-gray-50 border-b" id="row${ no }">
    <td class="px-6 py-4 text-justify">
        ${ codigoPredio }
    </td>
    <td class="px-6 py-4 text-justify">
        ${ nombreRepresentante }
    </td>
    <td class="px-6 py-4 text-justify">
        ${ frente }
    </td>
    <td class="px-6 py-4 text-justify">
        ${ fondo }
    </td>
    <td class="px-6 py-4 text-justify">
        ${ izquierda }
    </td>
    <td class="px-6 py-4 text-justify">
        ${ derecha }
    </td>
    <td class="px-6 py-4 text-justify">
        ${ areaDocumento }
    </td>
    <td class="px-6 py-4 text-justify">
        ${ areaLevantamiento }
    </td>
    <td class="px-6 py-4 text-justify">
        ${ diferencias }
    </td>
    <td class="px-6 py-4 text-justify">
        ${ contingencia }
    </td>
    <td class="px-6 py-4 text-justify">
        ${ indicacion }
    </td>
    <td class="px-6 py-4">
        <div class="flex gap-2">
            <button id="edit${no}" class="mb-2 bg-[#003c8b] font-gotham-bold p-2 rounded text-white hover:bg-[#355887]">
                <i class="fa-solid fa-pen"></i>
            </button>
            <button id="delete${no}"
                class="mb-2 bg-[#8b0031] font-gotham-bold p-2 rounded text-white hover:bg-[#6d3b4c]">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    </td>
</tr>
`;
    colindatesContainer.insertAdjacentHTML('beforeend', row);
    const btnDeleteRow = colindatesContainer.querySelector(`#delete${no}`);
    const btnEditRow = colindatesContainer.querySelector(`#edit${no}`);
    btnDeleteRow.addEventListener('click', () => deleteRow(no));
    btnEditRow.addEventListener('click', () => editRow(no));
};

const getRows = () => {
    const rows = colindatesContainer.querySelectorAll('tr');
    const colindantes = [...rows].map(row => {
        const td = row.querySelectorAll('td');
        const result = ({
            codigoPredio: td[0].innerText.trim(),
            nombreRepresentante: td[1].innerText.trim(),
            frente: Number(td[2].innerText.trim()),
            fondo: Number(td[3].innerText.trim()),
            izquierda: Number(td[4].innerText.trim()),
            derecha: Number(td[5].innerText.trim()),
            areaDocumento: Number(td[6].innerText.trim()),
            areaLevantamiento: Number(td[7].innerText.trim()),
            diferencias: Number(td[8].innerText.trim()),
            contingencia: td[9].innerText.trim(),
            indicacion: td[10].innerText.trim(),
        });
        return result;
    });
    return colindantes;
};

function getHtmlModal (options) {
    const {
        isAdd,
        data,
    } = options;
    let title = '';

    if(isAdd) {
        title = 'AÑADIR COLINDANTE';
    } else {
        title = 'EDITAR COLINDANTE';
    }

    const {
        codigoPredio = '',
        nombreRepresentante = '',
        frente = '',
        fondo = '',
        izquierda = '',
        derecha = '',
        areaDocumento = '',
        areaLevantamiento = '',
        diferencias = '',
        contingencia = '',
        indicacion = '',
    } = data || { };

    const html =
    /*html*/
`
<div class="p-2">
    <h2 class="font-bold font-gotham-bold mb-2">${ title }</h2>
    <div class="flex flex-col items-start gap-1">

        <label for="codigoPredio"
        class="text-sm font-medium text-gray-700 asterisk-icon font-gotham-bold">Codigo Predio</label>
        <input value="${ codigoPredio }" type="text" id="codigoPredio" name="codigoPredio"
        class="text-sm w-full p-2 text-gray-700 border-2 border-black shadow-sm focus:outline-none focus:border-[#A7CF42] focus:ring focus:ring-[#D8E3C2] hover:border-[#A7CF42]"
        placeholder="Codigo Predio">

        <label for="nombreRepresentante"
            class="text-sm font-medium text-gray-700 asterisk-icon font-gotham-bold">Nombre Representante</label>
        <input value="${ nombreRepresentante }" type="text" id="nombreRepresentante" name="nombreRepresentante"
            class="text-sm w-full p-2 text-gray-700 border-2 border-black shadow-sm focus:outline-none focus:border-[#A7CF42] focus:ring focus:ring-[#D8E3C2] hover:border-[#A7CF42]"
            placeholder="Nombre Representante">

        <label for="frente"
            class="text-sm font-medium text-gray-700 asterisk-icon font-gotham-bold">Frente</label>
        <input value="${ frente }" type="text" id="frente" name="frente"
            class="text-sm w-full p-2 text-gray-700 border-2 border-black shadow-sm focus:outline-none focus:border-[#A7CF42] focus:ring focus:ring-[#D8E3C2] hover:border-[#A7CF42]"
            placeholder="Frente">

        <label for="fondo" class="text-sm font-medium text-gray-700 asterisk-icon font-gotham-bold">Fondo</label>
        <input value="${ fondo }" type="text" id="fondo" name="fondo"
            class="text-sm w-full p-2 text-gray-700 border-2 border-black shadow-sm focus:outline-none focus:border-[#A7CF42] focus:ring focus:ring-[#D8E3C2] hover:border-[#A7CF42]"
            placeholder="Fondo">

        <label for="izquierda" class="text-sm font-medium text-gray-700 asterisk-icon font-gotham-bold">Izquierda</label>
        <input value="${ izquierda }" type="text" id="izquierda" name="izquierda"
            class="text-sm w-full p-2 text-gray-700 border-2 border-black shadow-sm focus:outline-none focus:border-[#A7CF42] focus:ring focus:ring-[#D8E3C2] hover:border-[#A7CF42]"
            placeholder="Izquierda">

        <label for="derecha" class="text-sm font-medium text-gray-700 asterisk-icon font-gotham-bold">Derecha</label>
        <input value="${ derecha }" type="text" id="derecha" name="derecha"
            class="text-sm w-full p-2 text-gray-700 border-2 border-black shadow-sm focus:outline-none focus:border-[#A7CF42] focus:ring focus:ring-[#D8E3C2] hover:border-[#A7CF42]"
            placeholder="Derecha">

        <label for="areaDocumento" class="text-sm font-medium text-gray-700 asterisk-icon font-gotham-bold">Área según documento</label>
        <input value="${ areaDocumento }" type="text" id="areaDocumento" name="areaDocumento"
            class="text-sm w-full p-2 text-gray-700 border-2 border-black shadow-sm focus:outline-none focus:border-[#A7CF42] focus:ring focus:ring-[#D8E3C2] hover:border-[#A7CF42]"
            placeholder="Área según documento">

        <label for="areaLevantamiento" class="text-sm font-medium text-gray-700 asterisk-icon font-gotham-bold">Área según levantamiento</label>
        <input value="${ areaLevantamiento }" type="text" id="areaLevantamiento" name="areaLevantamiento"
            class="text-sm w-full p-2 text-gray-700 border-2 border-black shadow-sm focus:outline-none focus:border-[#A7CF42] focus:ring focus:ring-[#D8E3C2] hover:border-[#A7CF42]"
            placeholder="Área según levantamiento">

        <label for="diferencias" class="text-sm font-medium text-gray-700 asterisk-icon font-gotham-bold">Diferencias</label>
        <input value="${ diferencias }" type="text" id="diferencias" name="diferencias"
            class="text-sm w-full p-2 text-gray-700 border-2 border-black shadow-sm focus:outline-none focus:border-[#A7CF42] focus:ring focus:ring-[#D8E3C2] hover:border-[#A7CF42]"
            placeholder="Diferencias">

        <label for="contingencia" class="text-sm font-medium text-gray-700 asterisk-icon font-gotham-bold">Contingencia</label>
        <input value="${ contingencia }" type="text" id="contingencia" name="contingencia"
            class="text-sm w-full p-2 text-gray-700 border-2 border-black shadow-sm focus:outline-none focus:border-[#A7CF42] focus:ring focus:ring-[#D8E3C2] hover:border-[#A7CF42]"
            placeholder="Contingencia">

        <label for="indicacion" class="text-sm font-medium text-gray-700 asterisk-icon font-gotham-bold">Indicación</label>
        <input value="${ indicacion }" type="text" id="indicacion" name="indicacion"
            class="text-sm w-full p-2 text-gray-700 border-2 border-black shadow-sm focus:outline-none focus:border-[#A7CF42] focus:ring focus:ring-[#D8E3C2] hover:border-[#A7CF42]"
            placeholder="Indicación">
            
    </div>
</div>
`;
return html;
};

const handleModal = () => {
    const html = getHtmlModal({
        isAdd: true
    });
    makeModal(html).then(( { isConfirmed, value = { } } ) => {
        if(isConfirmed) {
            addRow(value);
        } else {
            console.log('cancell!');
        }
    });
    return;
};

function makeModal(html) {
    return Swal.fire({
        // title:
        // /*html*/`
        // <div><h2>HELLO</h2></div>
        // `,
        scrollbarPadding: false,
        padding: '0',
        margin: '0',
        html,
        background: '#EAEBEB',
        confirmButtonText: 'Guardar',
        focusConfirm: false,
        allowOutsideClick: false,
        cancelButtonText: 'Cancelar',
        showCancelButton: true,
        didOpen: () => {
            const popup = Swal.getPopup();

            // const frente = popup.querySelector('#frente');
            // const fondo = popup.querySelector('#fondo');
            // const izquierda = popup.querySelector('#izquierda');
            // const derecha = popup.querySelector('#derecha');

            // selectorsModal.btnSearchDni.addEventListener('click', handleSearchDni);
        },
        preConfirm: () => {
            const popup = Swal.getPopup();
            const result = {
                codigoPredio: popup.querySelector('#codigoPredio').value.trim(),
                nombreRepresentante: popup.querySelector('#nombreRepresentante').value.trim(),
                frente: popup.querySelector('#frente').value.trim(),
                fondo: popup.querySelector('#fondo').value.trim(),
                izquierda: popup.querySelector('#izquierda').value.trim(),
                derecha: popup.querySelector('#derecha').value.trim(),
                areaDocumento: popup.querySelector('#areaDocumento').value.trim(),
                areaLevantamiento: popup.querySelector('#areaLevantamiento').value.trim(),
                diferencias: popup.querySelector('#diferencias').value.trim(),
                contingencia: popup.querySelector('#contingencia').value.trim(),
                indicacion: popup.querySelector('#indicacion').value.trim(),
            };
            return result;
        },
        willClose: () => {
            // selectorsModal.btnSearchDni.removeEventListener('click', handleSearchDni);
        },
    });
};

btnAgregarColindantes.addEventListener('click', () => {
    handleModal();
});

