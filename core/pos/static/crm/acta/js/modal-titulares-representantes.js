const btnAgregarTitular = document.getElementById('btn-agregar-titular');
const titularesContainer = document.getElementById('titulares-container');
const btnAgregarRepresentante = document.getElementById('btn-agregar-representante');
const representantesContainer = document.getElementById('representantes-container');

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

//main
const handleSearchDni = () => {
    const {
        btnSearchDni,
        dniTosearch,
        dni,
        apellidos,
        nombres,
    } = selectorsModal;
    fetch('/tools/search-dni-pe/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            dni: dniTosearch.value.trim(),
        }),
    })
    .then(res => {
        const inital = btnSearchDni.innerText;
        btnSearchDni.innerText = 'Buscando dni...';
        if (res.status === 200) {
            setTimeout(() => {
                res.json().then(res => {
                    apellidos.value = `${capitalize(res.apellidoPaterno || '')} ${capitalize(res.apellidoMaterno || '')}`;
                    nombres.value = capitalize(res.nombres || '');
                    btnSearchDni.innerText = inital;
                    dni.value = dniTosearch.value;
                });
            }, 1000);

        } else {
            btnSearchDni.innerText = 'Error dni invalido o inexistente!';
            setTimeout(() => {
                btnSearchDni.innerText = inital;
            }, 2000);
        }
    })
    .catch(err => {
        console.error(err.message);
        const inital = btnSearchDni.innerText;
        btnSearchDni.innerText = 'Error del servidor!';
        setTimeout(() => {
            btnSearchDni.innerText = inital;
        }, 2000);
    })
};
const readPdf = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (e) {
        const base64 = e.target.result.split('base64,')[1];
        resolve(base64);
    };
    reader.onerror = function (error) {
        reject(error);
    };
});

const deleteRow = (options) => {
    const {
        isTitular,
        no,
    } = options;
    if(isTitular) {
        const row = titularesContainer.querySelector(`#row${ no }`);
        const btnDeleteRow = titularesContainer.querySelector(`#delete${ no }`);
        const btnEditRow = titularesContainer.querySelector(`#edit${ no }`);
        btnDeleteRow.removeEventListener('click', () => deleteRow(no));
        btnEditRow.removeEventListener('click', () => editRow(no));
        row.outerHTML = '';
        return;
    }
    const row = representantesContainer.querySelector(`#row${ no }`);
    const btnDeleteRow = representantesContainer.querySelector(`#delete${ no }`);
    const btnEditRow = representantesContainer.querySelector(`#edit${ no }`);
    btnDeleteRow.removeEventListener('click', () => deleteRow(no));
    btnEditRow.removeEventListener('click', () => editRow(no));
    row.outerHTML = '';
};

const editRow = (options) => {
    const {
        isTitular,
        no,
    } = options;

    // get values td
    const row = isTitular?
    titularesContainer.querySelector(`#row${ no }`).querySelectorAll('td'):
    representantesContainer.querySelector(`#row${ no }`).querySelectorAll('td');
    
    let data = { };
    if(isTitular) {
        data = {
            apellidos: row[0],
            nombres: row[1],
            dni: row[2],
            estadoCivil: row[3],
            copiaDoc: row[4],
            docPdf: row[5],
            observaciones: row[6],
            representante: row[7],
        };
    } else {
        data = {
            apellidos: row[0],
            nombres: row[1],
            dni: row[2],
            estadoCivil: row[3],
            copiaDoc: row[4],
            cartaPoder: row[5],
            docPdf: row[6],
            observaciones: row[7],
        }
    }
    const newData = Object.keys(data).reduce((prev, next) => {
        prev[next] = data[next].innerText.trim();
        return prev;
    }, { });
    console.log({
        newData
    })
    // make modal
    const html = getHtmlModal({
        isAdd: false,
        isTitular,
        data: newData,
    });
    makeModal(html).then(({ isConfirmed, value = { } }) => {
        if(isConfirmed) {
            data.apellidos.innerText = value.apellidos;
            data.nombres.innerText = value.nombres;
            data.dni.innerText = value.dni;
            data.estadoCivil.innerText = value.estadoCivil;
            data.copiaDoc.innerText = value.copiaDoc;

            const a = data.docPdf.querySelector('a');
            a.href = `data:application/pdf;base64,${value.docPdfValue}`

            data.observaciones.innerText = value.observaciones;
            data.representante.innerText = value.representante;
            if(!isTitular) {
                data.cartaPoder.innerText = value.cartaPoder;
            }
        } else {
            console.log('cancell!');
        }
    });
};

const addRow = (options) => {
    const {isTitular,} = options;
    const {
        apellidos,
        nombres,
        dni,
        estadoCivil,
        copiaDoc,
        cartaPoder,
        representante,
        docPdfValue,
        observaciones,
    } = options.data || { };
    console.log({
        addRow: options.data
    })

    const container = isTitular? titularesContainer: representantesContainer;
    const no = container.childElementCount;
    const cartaPoderHtml = isTitular? '':
    /*html*/
`
<td class="px-6 py-4 text-justify">
    ${ cartaPoder }
</td>
`;
const representanteHtml = !isTitular? '':
/*html*/
`
<td class="px-6 py-4 text-justify">
    ${ representante }
</td>
`;


const row = `
    <tr class="${representante=='si' ? 'bg-green-400 text-black' :'bg-gray-50 '} border-b" id="row${ no }">
        <td class="px-6 py-4 text-justify">
            ${ apellidos }
        </td>
        <td class="px-6 py-4 text-justify">
            ${ nombres }
        </td>
        <td class="px-6 py-4 text-justify">
            ${ dni }
        </td>
        <td class="px-6 py-4 text-justify">
            ${ estadoCivil }
        </td>
        <td class="px-6 py-4 text-justify">
            ${ copiaDoc }
        </td>
        ${ cartaPoderHtml }
        <td class="px-6 py-4 text-justify">
        ${
            docPdfValue?
            `
            <a id="pdfLink" href="data:application/pdf;base64,${docPdfValue}" download="documentos.pdf" target="_blank" class="font-bold"><i class="fa-solid fa-download"></i> Descargar PDF</a>
            `:
            `
            <a id="pdfLink" href="#null" class="font-bold"></i> Sin documentos</a>
            `

        }
            <!-- <a id="pdfLink" href="data:application/pdf;base64,${docPdfValue}" target="_blank" class="font-bold"><i class="fa-solid fa-download"></i> Descargar PDF</a> -->
        </td>
        <td class="px-6 py-4 text-justify">
            ${ observaciones }
        </td>
        ${ representanteHtml }
        <td class="px-6 py-4">
            <div class="flex gap-2">
                <button id="edit${no}" type="button"
                class="mb-2 bg-[#003c8b] font-gotham-bold p-2 rounded text-white hover:bg-[#355887]">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button id="delete${no}" type="button"
                    class="mb-2 bg-[#8b0031] font-gotham-bold p-2 rounded text-white hover:bg-[#6d3b4c]">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </td>
    </tr>
`;
    container.insertAdjacentHTML('beforeend', row);
    const btnDeleteRow = container.querySelector(`#delete${no}`);
    const btnEditRow = container.querySelector(`#edit${no}`);
    btnDeleteRow.addEventListener('click', () => deleteRow({ isTitular, no }));
    btnEditRow.addEventListener('click', () => editRow({ isTitular, no }));
};

const getRowsTitulares = () => {
    const rows = titularesContainer.querySelectorAll('tr');
    const titulares = [...rows].map(row => {
        const td = row.querySelectorAll('td');
        const result = ({
            apellidos: td[0].innerText.trim(),
            nombres: td[1].innerText.trim(),
            dni: td[2].innerText.trim(),
            estadoCivil: td[3].innerText.trim(),
            copiaDoc: td[4].innerText.trim(),
            documentos: td[5].querySelector('a').getAttribute('href').replace('data:application/pdf;base64,', '').replace('#null', ''),
            observaciones: td[6].innerText.trim(),
            representante: td[7].innerText.trim(),
        });
        return result;
    });
    return titulares;
};

const getRowsRepresentantes = () => {
    return true;
};

function getHtmlModal (options) {
    const {
        isAdd,
        isTitular,
    } = options;
    let title = '';

    // titular
    if(isAdd && isTitular) {
        title =  'AÑADIR TITULAR';
    }
    if(!isAdd && isTitular) {
        title = 'EDITAR TITULAR';
    }
    //representante
    if(isAdd && !isTitular) {
        title =  'AÑADIR REPRESENTANTE';
    }
    if(!isAdd && !isTitular) {
        title = 'EDITAR REPRESENTANTE';
    }

    // titular and representante edit
    const {
        apellidos = '',
        nombres = '',
        dni = '',
        estadoCivil = '',
        copiaDoc = '',
        cartaPoder = '',
        representante = '',
        documentos = '',
        observaciones = '',
    } = options.data || { };
    console.log({
        getHtmlModalX: options.data
    })

    const cartaPoderHtml = isTitular? '':
    /*html*/
`
<div class="w-full flex flex-col items-start">
    <label for="carta-poder-modal"
        class="text-sm font-medium text-gray-700 asterisk-icon font-gotham-bold">¿Carta poder?</label> <select id="carta-poder-modal" name="carta-poder-modal"
        class="text-sm sm:w-fit w-full border-2 border-black p-2 shadow-sm leading-tight focus:outline-none focus:border-[#A7CF42] focus:ring focus:ring-[#D8E3C2] hover:border-[#A7CF42]">
        <option value="" ${cartaPoder==='' ? 'selected' : '' }>
            Seleccione una opción
        </option>
        <option value="si" ${cartaPoder==='si' ? 'selected' : '' }>
            Si
        </option>
        <option value="no" ${cartaPoder==='no' ? 'selected' : '' }>
            No
        </option>
    </select>
</div>
`;
    const representanteHtml = !isTitular? '':
    /*html*/
`
<div class="w-full flex flex-col items-start">
    <label for="representante-modal"
        class="text-sm font-medium text-gray-700 asterisk-icon font-gotham-bold">¿Es representante?</label> <select id="representante-modal" name="representante-modal"
        class="text-sm sm:w-fit w-full border-2 border-black p-2 shadow-sm leading-tight focus:outline-none focus:border-[#A7CF42] focus:ring focus:ring-[#D8E3C2] hover:border-[#A7CF42]">
        <option value="" ${representante==='' ? 'selected' : '' }>
            Seleccione una opción
        </option>
        <option value="si" ${representante==='si' ? 'selected' : '' }>
            Si
        </option>
        <option value="no" ${representante==='no' ? 'selected' : '' } selected>
            No
        </option>
    </select>
</div>
`;

    const html =
    /*html*/
`
<div class="p-2">
    <h2 class="font-bold font-gotham-bold mb-2">${ title }</h2>
    <div class="flex w-full sm:flex-row flex-col gap-2">
        <input type="number" id="dni-a-buscar-modal" name="dni-a-buscar"
            class="text-sm w-full sm:w-[50%] p-2 text-gray-700 border-2 border-black shadow-sm focus:outline-none focus:border-[#A7CF42] focus:ring focus:ring-[#D8E3C2] hover:border-[#A7CF42]"
            placeholder="Dni a buscar"> <button type="button" id="btn-dni-a-buscar-modal"
            class="sm:w-fit flex-1 p-2 bg-[#655CC9] rounded font-gotham-bold text-sm text-white hover:bg-[#746bd8]">Buscar
            y establecer datos</button>
    </div>
    <div class="flex flex-col items-start gap-1">
        <label for="apellidos-modal"
            class="text-sm font-medium text-gray-700 asterisk-icon font-gotham-bold">Apellidos</label> <input value="${apellidos}"
            type="text" id="apellidos-modal" name="apellidos-modal"
            class="text-sm w-full p-2 text-gray-700 border-2 border-black shadow-sm focus:outline-none focus:border-[#A7CF42] focus:ring focus:ring-[#D8E3C2] hover:border-[#A7CF42]"
            placeholder="Apellidos"> <label for="nombres-modal"
            class="text-sm font-medium text-gray-700 asterisk-icon font-gotham-bold">Nombres</label> <input value="${nombres}" type="text"
            id="nombres-modal" name="nombres-modal"
            class="text-sm w-full p-2 text-gray-700 border-2 border-black shadow-sm focus:outline-none focus:border-[#A7CF42] focus:ring focus:ring-[#D8E3C2] hover:border-[#A7CF42]"
            placeholder="Nombres"> <label for="dni-modal"
            class="text-sm font-medium text-gray-700 asterisk-icon font-gotham-bold">Dni</label> <input value="${dni}" type="number"
            id="dni-modal" name="dni-modal"
            class="text-sm sm:w-[50%] w-full p-2 text-gray-700 border-2 border-black shadow-sm focus:outline-none focus:border-[#A7CF42] focus:ring focus:ring-[#D8E3C2] hover:border-[#A7CF42]"
            placeholder="Dni">
        <div class="w-full flex flex-col items-start gap-1">
            <div class="w-full flex flex-col items-start">
                <label for="estado-civil-modal"
                    class="text-sm font-medium text-gray-700 asterisk-icon font-gotham-bold">Estado
                    Civil</label>
                <select id="estado-civil-modal" name="estado-civil-modal"
                    class="text-sm sm:w-fit w-full border-2 border-black p-2 shadow-sm leading-tight focus:outline-none focus:border-[#A7CF42] focus:ring focus:ring-[#D8E3C2] hover:border-[#A7CF42]">
                    <option value="" ${estadoCivil === ''? 'selected': ''}>
                        Seleccione una opción
                    </option>
                    <option value="soltero"${estadoCivil === 'soltero'? 'selected': ''}>
                        Soltero
                    </option>
                    <option value="casado"${estadoCivil === 'casado'? 'selected': ''}>
                        Casado
                    </option>
                    <option value="viudo"${estadoCivil === 'viudo'? 'selected': ''}>
                        Viudo
                    </option>
                    <option value="divorciado"${estadoCivil === 'divorciado'? 'selected': ''}>
                        Divorciado
                    </option>
                </select>
            </div>
            <div class="w-full flex flex-col items-start">
                <label for="copia-documento-identidad-modal"
                    class="text-sm font-medium text-gray-700 asterisk-icon font-gotham-bold">¿Copia de documento
                    de
                    identidad?</label> <select id="copia-documento-identidad-modal"
                    name="copia-documento-identidad-modal"
                    class="text-sm sm:w-fit w-full border-2 border-black p-2 shadow-sm leading-tight focus:outline-none focus:border-[#A7CF42] focus:ring focus:ring-[#D8E3C2] hover:border-[#A7CF42]">
                    <option value=""${copiaDoc === ''? 'selected': ''}>
                        Seleccione una opción
                    </option>
                    <option value="si"${copiaDoc === 'si'? 'selected': ''}>
                        Si
                    </option>
                    <option value="no"${copiaDoc === 'no'? 'selected': ''}>
                        No
                    </option>
                </select>
            </div>
            ${ cartaPoderHtml }
            ${ representanteHtml }
        </div>
        <div class="w-full flex flex-col items-start">
            <label for="documentos-pdf-modal"
                class="text-sm font-medium text-gray-700 asterisk-icon font-gotham-bold">Subir
                documentos</label> <input type="file" class="text-sm" name="documentos-pdf-modal"
                id="documentos-pdf-modal" accept="application/pdf">
        </div>
        <div class="w-full flex flex-col items-start">
            <label for="observaciones-modal"
                class="text-sm font-medium text-gray-700 asterisk-icon font-gotham-bold">Observaciones</label>
            <textarea id="observaciones-modal" rows="4"
                class="text-sm w-full px-4 py-2 border-2 text-gray-700 shadow-sm focus:outline-none focus:border-[#A7CF42] focus:ring focus:ring-[#D8E3C2] hover:border-[#A7CF42] hover:border-2"
                placeholder="Observaciones">${observaciones}</textarea>
        </div>
    </div>
</div>
`;
return html;
};

const handleModal = (options) => {
    const {
        isTitular,
    } = options;
    const html = getHtmlModal({
        isAdd: true,
        isTitular,
    });
    makeModal(html).then(( { isConfirmed, value = { } } ) => {
        console.log(value)
        if(isConfirmed) {
            addRow({ isTitular, data: value });
        } else {
            console.log('cancell!');
        }
    });
    return;
};

function makeModal(html) {

    return Swal.fire({
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

            const btnSearchDni = popup.querySelector('#btn-dni-a-buscar-modal');
            const dniTosearch = popup.querySelector('#dni-a-buscar-modal');

            const dni = popup.querySelector('#dni-modal');
            const apellidos = popup.querySelector('#apellidos-modal');
            const nombres = popup.querySelector('#nombres-modal');
            const docPdf = popup.querySelector('#documentos-pdf-modal');

            selectorsModal.btnSearchDni = btnSearchDni;
            selectorsModal.dniTosearch = dniTosearch;

            selectorsModal.dni = dni;
            selectorsModal.apellidos = apellidos;
            selectorsModal.nombres = nombres;
            selectorsModal.docPdf = docPdf;

            selectorsModal.btnSearchDni.addEventListener('click', handleSearchDni);
            selectorsModal.docPdf.addEventListener('change', () => {
                // selectorsModal.docPdf.value = 'documentos.pdf';
                readPdf(selectorsModal.docPdf.files[0]).then(result => {
                    console.log({result})
                    selectorsModal.docPdfValue = result;
                });
            });
        },
        preConfirm: () => {
            const popup = Swal.getPopup();
            const resultValues = {
                apellidos: popup.querySelector('#apellidos-modal').value.trim(),
                nombres: popup.querySelector('#nombres-modal').value.trim(),
                dni: popup.querySelector('#dni-modal').value.trim(),
                estadoCivil: popup.querySelector('#estado-civil-modal').value.trim(),
                copiaDoc: popup.querySelector('#copia-documento-identidad-modal').value.trim(),
                
                docPdf: popup.querySelector('#documentos-pdf-modal').value.trim(),
                docPdfValue: selectorsModal.docPdfValue,

                observaciones:  popup.querySelector('#observaciones-modal').value.trim(),

                cartaPoder:  popup.querySelector('#carta-poder-modal')?.value.trim() || '',
                representante:  popup.querySelector('#representante-modal')?.value.trim() || '',
            };
            if (!resultValues.apellidos) {
                Swal.showValidationMessage(`<b>Por favor ingrese los Apellidos!<b/>`)
            } else if(!resultValues.nombres) {
                Swal.showValidationMessage(`<b>Por favor ingrese los Nombres!<b/>`)
            } else if(!resultValues.dni) {
                Swal.showValidationMessage(`<b>Por favor ingrese el Dni!<b/>`)
            }

            return resultValues;
        },
        willClose: () => {
            selectorsModal.btnSearchDni.removeEventListener('click', handleSearchDni);
            selectorsModal.docPdf.removeEventListener('change', () => {
                readPdf(selectorsModal.docPdf.files[0]).then(result => {
                    selectorsModal.docPdfValue = result;
                });
            });
        },
    });
};

btnAgregarTitular.addEventListener('click', () => {
    console.log('titular');
    handleModal({
        isTitular: true,
    });
});
