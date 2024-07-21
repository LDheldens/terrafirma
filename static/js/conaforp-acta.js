const containerGeneral = document.querySelector('.contenedor-menus')
const dropdownsNavbarLink = document.querySelectorAll('.dropdownNavbarLink');

containerGeneral.addEventListener('click',(e)=>{
    if (e.target.matches('.dropdownNavbarLink')) {
        const contenedor = e.target.parentElement.parentElement
        const dropdownNavbar = contenedor.querySelector('#dropdownNavbar')
        dropdownNavbar.classList.toggle('hidden')
    }
})
document.addEventListener('click', event => {
    if (!dropdownNavbar.contains(event.target) && !Array.from(dropdownsNavbarLink).includes(event.target)) {
        dropdownNavbar.classList.add('hidden');
    }
});

// data backend
let ubigeoData = { }
const allUbigeosPe = () => {
    const payload = {
        allData: true
    };
    const urlBase = '/tools/search-all-ubigeos-pe/'
    fetch(urlBase, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(res => res.json().then(data => {
        ubigeoData = data
        const main = document.getElementById('main');
        main.classList.remove("hidden");
    }))
    .catch(console.log);
}
allUbigeosPe();

const toggleContent = (li, elementToActivateIds) => {
    // li
    li.classList.remove('text-gray-500');
    li.classList.add('text-blue-600');
    // span
    const span = li.firstElementChild;
    span.classList.remove('border-gray-500');
    span.classList.add('border-blue-600');

    const allElementIds = ['part1', 'part2', 'part3', 'part4', 'part5', 'part6', 'part7', 'part8', 'part9'];
    const elementsToDeactivate = allElementIds.filter(el => !elementToActivateIds.includes(el));
    //disable elements            
    for (const id of elementsToDeactivate) {
        document.getElementById(id).classList.add('hidden');
    }
    //enable elements
    for (const id of elementToActivateIds) document.getElementById(id).classList.remove('hidden');
}

document.addEventListener("DOMContentLoaded", () => {

    const liElements = document.getElementById('multi-step').getElementsByTagName('li');
    toggleContent(liElements[0], ['part1', 'part2']);
    for (let [index, liElement] of Object.entries(liElements)) {
        const condition = {
            0: ['part1', 'part2'],
            1: ['part3'],
            2: ['part4'],
            3: ['part5'],
            4: ['part6', 'part7'],
            5: ['part8', 'part9'],
        }
        const elementsToActivate = condition[index];
        liElement.addEventListener('click', function () {
            toggleContent(this, elementsToActivate);
        });
    }

    //modal
    const dni = document.getElementById('dni');
    const buttonDni = document.getElementById('button-dni');
    const containerTitularRepresentante = document.getElementById('container-titular-representante');
    const buttonAgregarTitular = document.getElementById('btn-agregar-titular');
    const buttonAgregarRepresentante = document.getElementById('btn-agregar-representante');
    const titularesRepresentantes = [];

    let indexFormTitularRepresentante = 0

    const addFormTitularRepresentante = (index, consonant, tipo) => {
        const formTitularRepresentante = `
        <div class="mb-2" id="${index}-${tipo}">
            <div class="flex items-center justify-between">
                <!-- <h2 class="font-bold text-sm font-gotham-bold">${consonant}) ${tipo} ${index}:</h2> -->
                <h2 class="font-bold text-sm font-gotham-bold">${tipo.toUpperCase()}:</h2>
                <button type="button"
                    class="bg-red-500 font-gotham-bold p-2 rounded text-white hover:bg-red-700" id="${index}-${tipo}-eliminar">Eliminar
                -</button>
            </div>
            <!-- <hr class="bg-black h-2"> -->
            <!-- ¿COPIA DOC. IDENTIDAD? -->
            <div class="flex items-center gap-x-10 mb-2">
                <h2 class="text-sm font-medium text-gray-700 asterisk-icon font-gotham-bold w-[200px]">¿COPIA DOC.
                    IDENTIDAD?
                </h2>
                <div class="flex gap-x-4">
                    <div class="flex items-center gap-x-1">
                        <input id="${index}-${tipo}-copia-doc-identidad-si" type="radio" value="${index}-${tipo}-si" name="${index}-${tipo}-list-radio-carta-doc-identidad"
                        class="w-5 h-5">
                        <label for="${index}-${tipo}-copia-doc-identidad-si" class="font-gotham-bold text-sm">Si</label>
                    </div>
                    <div class="flex items-center gap-x-1">
                        <input id="${index}-${tipo}-copia-doc-identidad-no" type="radio" value="${index}-${tipo}-no" name="${index}-${tipo}-list-radio-carta-doc-identidad"
                        class="w-5 h-5">
                        <label for="${index}-${tipo}-copia-doc-identidad-no" class="font-gotham-bold text-sm">No</label>
                    </div>
                </div>
            </div>
            <!-- buscar dni y setearlo -->
            <div
                class="mb-2 bg-[#255f8f] p-4 mx-2 flex flex-col justify-between sm:flex-row gap-x-4 gap-y-4 w-full sm:w-[60%]">
                <input type="text" name="${index}-${tipo}-dni" id="${index}-${tipo}-dni"
                    class="w-full sm:w-[50%] px-4 py-2 border-2 text-gray-700 shadow-sm focus:outline-none focus:border-[#008B8B] focus:ring focus:ring-[#008B8B] hover:border-[#008B8B] hover:ring hover:ring-[#008B8B]"
                    placeholder="Digite su DNI">
                <button class="bg-[#008B8B] font-gotham-bold p-2 rounded text-white hover:bg-[#519494]"
                    id="${index}-${tipo}-button-dni">Buscar y establecer DATOS de DNI</button>
            </div>
            <!-- Apellidos y Nombres -->
            <div class="flex flex-col sm:flex-row justify-between gap-4 mb-2">
                <!-- Apellidos -->
                <div class="flex flex-col sm:flex-row items-start sm:items-center w-full sm:w-[35%]">
                    <label for="${index}-${tipo}-apellidos"
                        class="w-full sm:w-[30%] text-sm font-medium text-gray-700 asterisk-icon font-gotham-bold">APELLIDOS</label>
                    <input type="text" id="${index}-${tipo}-apellidos" name="apellidos"
                        class="w-full sm:w-[70%] px-4 py-2 border-2 text-gray-700 shadow-sm focus:outline-none focus:border-[#A7CF42] focus:ring focus:ring-[#D8E3C2] hover:border-[#A7CF42] hover:border-2"
                        placeholder="Apellidos">
                </div>
                <!-- Nombres -->
                <div class="flex flex-col sm:flex-row items-start sm:items-center w-full sm:w-[35%]">
                    <label for="${index}-${tipo}-nombres"
                        class="w-full sm:w-[30%] text-sm font-medium text-gray-700 asterisk-icon font-gotham-bold">NOMBRES</label>
                    <input type="text" id="${index}-${tipo}-nombres" name="nombres"
                        class="w-full sm:w-[70%] px-4 py-2 border-2 text-gray-700 shadow-sm focus:outline-none focus:border-[#A7CF42] focus:ring focus:ring-[#D8E3C2] hover:border-[#A7CF42] hover:border-2"
                        placeholder="Nombres">
                </div>
                <!-- Estado Civil -->
                <div class="flex flex-col sm:flex-row items-start sm:items-center w-full sm:w-[30%]">
                    <h2 class="w-full sm:w-[40%] text-sm font-medium text-gray-700 asterisk-icon font-gotham-bold">
                        ESTADO CIVIL:
                    </h2>
                    <div class="flex gap-x-2 w-full sm:w-[60%]">
                        <div class="flex items-center gap-x-1">
                        <input id="${index}-${tipo}-estado-civil-s" type="radio" value="s" name="${index}-${tipo}-list-radio-estado-civil"
                            class="w-5 h-5">
                        <label for="${index}-${tipo}-estado-civil-s" class="font-gotham-bold text-sm">S</label>
                        </div>
                        <div class="flex items-center gap-x-1">
                        <input id="${index}-${tipo}-estado-civil-c" type="radio" value="c" name="${index}-${tipo}-list-radio-estado-civil"
                            class="w-5 h-5">
                        <label for="${index}-${tipo}-estado-civil-c" class="font-gotham-bold text-sm">C</label>
                        </div>
                        <div class="flex items-center gap-x-1">
                        <input id="${index}-${tipo}-estado-civil-v" type="radio" value="v" name="${index}-${tipo}-list-radio-estado-civil"
                            class="w-5 h-5">
                        <label for="${index}-${tipo}-estado-civil-v" class="font-gotham-bold text-sm">V</label>
                        </div>
                        <div class="flex items-center gap-x-1">
                        <input id="${index}-${tipo}-estado-civil-d" type="radio" value="d" name="${index}-${tipo}-list-radio-estado-civil"
                            class="w-5 h-5">
                        <label for="${index}-${tipo}-estado-civil-d" class="font-gotham-bold text-sm">D</label>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Tipo Doc && N° Doc. -->
            <div class="flex flex-col sm:flex-row mb-2 gap-x-16 gap-y-4">
                <!-- Tipo Doc. -->
                <div class="flex flex-col sm:flex-row items-start sm:items-center w-full sm:w-fit sm:gap-x-4">
                    <h2 class="w-full sm:w-fit text-sm font-medium text-gray-700 asterisk-icon font-gotham-bold">
                        TIPO DOC.
                    </h2>
                    <div class="flex gap-x-2 w-full sm:w-fit">
                        <div class="flex items-center gap-x-1">
                            <input id="${index}-${tipo}-tipo-doc-dni" type="radio" value="dni" name="list-radio-tipo-doc"
                                class="w-5 h-5">
                            <label for="${index}-${tipo}-tipo-doc-dni" class="font-gotham-bold text-sm">DNI</label>
                        </div>
                        <div class="flex items-center gap-x-1">
                            <input id="${index}-${tipo}-tipo-doc-pn" type="radio" value="pn" name="list-radio-tipo-doc"
                                class="w-5 h-5">
                            <label for="${index}-${tipo}-tipo-doc-pn" class="font-gotham-bold text-sm">PN</label>
                        </div>
                        <div class="flex items-center gap-x-1">
                            <input id="${index}-${tipo}-tipo-doc-ce" type="radio" value="ce" name="list-radio-tipo-doc"
                                class="w-5 h-5">
                            <label for="${index}-${tipo}-tipo-doc-ce" class="font-gotham-bold text-sm">CE</label>
                        </div>
                    </div>
                </div>
                <!-- N° Doc. -->
                <div class="flex flex-col sm:flex-row items-start sm:items-center w-full sm:w-[30%]">
                    <label for="${index}-${tipo}-numero-doc"
                        class="w-full sm:w-[30%] text-sm font-medium text-gray-700 asterisk-icon font-gotham-bold">N°
                    DOC.</label>
                    <input type="text" id="${index}-${tipo}-numero-doc" name="numero-doc"
                        class="w-full sm:w-[70%] px-4 py-2 border-2 text-gray-700 shadow-sm focus:outline-none focus:border-[#A7CF42] focus:ring focus:ring-[#D8E3C2] hover:border-[#A7CF42] hover:border-2"
                        placeholder="N° Doc.">
                </div>
            </div>
            <!-- Firma y Huella de los Titulares/Representantes -->
            <div class="flex flex-col sm:flex-row justify-start sm:justify-start gap-4">
                <!-- Firma -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden items-center">
                    <div class="p-4 hover:bg-gray-100">
                        <div id="${index}-${tipo}-image-preview"
                        class="p-6 bg-gray-100 border-dashed border-2 border-gray-400 rounded-lg items-center mx-auto text-center cursor-pointer">
                        <input id="${index}-${tipo}-firma" type="file" class="hidden" accept="image/*" />
                        <label for="${index}-${tipo}-firma" class="cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-gray-700 mx-auto mb-4">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            <h5 class="mb-2 text-xl font-bold tracking-tight text-gray-700">Subir firma</h5>
                            <p class="font-normal text-sm text-gray-400 md:px-6">El tamaño de la foto debe ser
                                inferior a 2 MB. <b class="text-gray-600">2mb</b>
                            </p>
                            <p class="font-normal text-sm text-gray-400 md:px-6">y debe estar en formato <b
                                class="text-gray-600">JPG, PNG</b>.</p>
                            <span id="filename" class="text-gray-500 bg-gray-200 z-50"></span>
                        </label>
                        </div>
                    </div>
                </div>
                <!-- Huella -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden items-center">
                    <div class="p-4 hover:bg-gray-100">
                        <div id="${index}-${tipo}-image-preview"
                        class="p-6 bg-gray-100 border-dashed border-2 border-gray-400 rounded-lg items-center mx-auto text-center cursor-pointer">
                        <input id="${index}-${tipo}-huella" type="file" class="hidden" accept="image/*" />
                        <label for="${index}-${tipo}-huella" class="cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-gray-700 mx-auto mb-4">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            <h5 class="mb-2 text-xl font-bold tracking-tight text-gray-700">Subir huella</h5>
                            <p class="font-normal text-sm text-gray-400 md:px-6">El tamaño de la foto debe ser
                                inferior a 2 MB. <b class="text-gray-600">2mb</b>
                            </p>
                            <p class="font-normal text-sm text-gray-400 md:px-6">y debe estar en formato <b
                                class="text-gray-600">JPG, PNG</b>.</p>
                            <span id="filename" class="text-gray-500 bg-gray-200 z-50"></span>
                        </label>
                        </div>
                    </div>
                </div>
            </div>
            <hr class="h-px my-4 bg-gray-700 border-0">
        </div>
        `
        return formTitularRepresentante;
    }

    
    function capitalize(str) {
        return str.replace(/\b\w/g, function(l) {
            return l.toUpperCase();
        }).replace(/\B\w+/g, function(l) {
            return l.toLowerCase();
        });
    }
    buttonAgregarTitular.addEventListener('click', () => {
        indexFormTitularRepresentante += 1
        containerTitularRepresentante.insertAdjacentHTML('beforeend', addFormTitularRepresentante(indexFormTitularRepresentante, "A", "titular"));
        const representanteTitularAEliminar = document.getElementById(`${indexFormTitularRepresentante}-titular`);

        const btnEliminar = document.getElementById(`${indexFormTitularRepresentante}-titular-eliminar`)
        const btnSearchDni = document.getElementById(`${indexFormTitularRepresentante}-titular-button-dni`);

        // handlers
        const handlerBtnSearchDni = () => {
            const dni = document.getElementById(`${indexFormTitularRepresentante}-titular-dni`).value;
            const apellidos = document.getElementById(`${indexFormTitularRepresentante}-titular-apellidos`);
            const nombres = document.getElementById(`${indexFormTitularRepresentante}-titular-nombres`);
            const urlBase = "/tools/search-dni-pe/";
            const payload = {
                dni,
            };
            fetch(urlBase, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
            })
            .then(res => {
                if (res.status === 200) {
                    res.json().then(res => {
                        apellidos.value = `${capitalize(res.apellidoPaterno)} ${capitalize(res.apellidoMaterno)}`;
                        nombres.value = capitalize(res.nombres);
                    })
                }
            })
            .catch(console.log)
        }
        btnSearchDni.addEventListener('click', handlerBtnSearchDni);

        btnEliminar.addEventListener('click', () => {
            btnSearchDni.removeEventListener('click', handlerBtnSearchDni)
            representanteTitularAEliminar.remove()
            indexFormTitularRepresentante--;
        });

    })
    buttonAgregarRepresentante.addEventListener('click', () => {
        indexFormTitularRepresentante += 1
        containerTitularRepresentante.insertAdjacentHTML('beforeend', addFormTitularRepresentante(indexFormTitularRepresentante, "A", "representante"));
        const representanteTitularAEliminar = document.getElementById(`${indexFormTitularRepresentante}-representante`);
        const btnEliminar = document.getElementById(`${indexFormTitularRepresentante}-representante-eliminar`)
        btnEliminar.addEventListener('click', () => {
            representanteTitularAEliminar.remove()
            indexFormTitularRepresentante--;
        })
    })

    
    // selectores
    // const btn = document.getElementById("button");
    const fecha = document.getElementById('fecha');

    // numbers
    const celWssp = document.getElementById('cel-wssp');
    const numeroLotes = document.getElementById('numero-lotes');

    celWssp.addEventListener('input', event => event.target.value = event.target.value.replace(/\D/g, ''));
    numeroLotes.addEventListener('input', event => event.target.value = event.target.value.replace(/\D/g, ''));

    const setDate = () => {
        let currentDate = new Date().toLocaleString('es-PE', {
            timeZone: 'America/Lima',
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
        });
        currentDate = currentDate.split('/').reverse().join('-');
        fecha.value = currentDate;
    }
    setDate()
})