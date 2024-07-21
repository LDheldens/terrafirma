let provinciasFiltradas = [];
let distritosFiltrados = []

const inputDepartamento = document.querySelector('#departamento');
const listaResultados = document.querySelector('.lista-resultados');
const inputProvincia = document.querySelector('#provincia');
const listaResultados2 = document.querySelector('.lista-resultados2');
const inputDistrito = document.querySelector('#distrito');
const listaResultados3 = document.querySelector('.lista-resultados3');

// DEPARTAMENTO
inputDepartamento.addEventListener('keyup', (e) => {
    console.log(inputDepartamento.value)
    listaResultados.classList.remove('hidden')

    const searchTerm = e.target.value.trim().toLowerCase();
    if(searchTerm == ''){
        inputProvincia.value = ''
        provinciasFiltradas= []
        mostrarProvincias(provinciasFiltradas)
        return
    }
    const resultadosFiltrados = ubigeoData.departamentos.filter((departamento) => {
        return departamento.name.toLowerCase().includes(searchTerm);
    });

    mostrarDepartamentos(resultadosFiltrados);
});

function mostrarDepartamentos(resultados) {
    listaResultados.innerHTML = '';
    if (resultados.length >= 1) {
        listaResultados.classList.remove('hidden')
        listaResultados.classList.add('border-[#A7CF42]')
        resultados.forEach((departamento) => {
            const li = document.createElement('li');
            li.textContent = departamento.name;
            li.classList.add('cursor-pointer','border-b','list-none','hover:bg-lime-200','p-2');
            li.addEventListener('click', () => {
                listaResultados.innerHTML = '';
                inputDepartamento.value = li.textContent;
                console.log(inputDepartamento.value)
                listaResultados.classList.add('hidden')
                listaResultados2.classList.remove('hidden')
                listaResultados2.classList.add('border-[#A7CF42]')
                provinciasFiltradas = ubigeoData.provincias.filter((provincia) => {
                    return provincia.department_id === departamento.id;
                });
                mostrarProvincias(provinciasFiltradas);
            });
            listaResultados.appendChild(li);
        });
    }
}

// PROVINCIA
inputProvincia.addEventListener('keyup', (e) => {
    inputDistrito.value = ''
    listaResultados2.classList.remove('hidden')
    const searchTerm = e.target.value.trim().toLowerCase();
    const provinciasFiltradasPorTexto = ubigeoData.provinciasFiltradas.filter((provincia) => {
        return provincia.name.toLowerCase().includes(searchTerm);
    });
    mostrarProvincias(provinciasFiltradasPorTexto);
});

function mostrarProvincias(listaProvincias) {
    listaResultados2.innerHTML = '';
    listaProvincias.forEach((provincia) => {
        const li = document.createElement('li');
        li.textContent = provincia.name;
        listaResultados2.appendChild(li);
        li.classList.add('cursor-pointer', 'border-b', 'list-none', 'hover:bg-lime-200', 'p-2');
        li.addEventListener('click', () => {
            listaResultados2.innerHTML = '';
            listaResultados2.classList.add('hidden');
            inputProvincia.value = li.textContent;
            distritosFiltrados = ubigeoData.distritos.filter(distrito => distrito.province_id === provincia.id);
            mostrarDistritos(distritosFiltrados);
        });
    });
}


// DISTRITO
inputDistrito.addEventListener('keyup', (e) => {
    listaResultados.classList.remove('hidden')
    const searchTerm = e.target.value.trim().toLowerCase();

    const distritosFiltradosPorTexto = ubigeoData.distritosFiltrados.filter((distrito) => {
        return distrito.name.toLowerCase().includes(searchTerm);
    });
    mostrarDistritos(distritosFiltradosPorTexto);
});

function mostrarDistritos(listaDistritos) {
    listaResultados3.innerHTML=''
    listaResultados3.classList.remove('hidden');
    listaDistritos.forEach((distrito) => {
        const li = document.createElement('li');
        li.textContent = distrito.name;
        listaResultados3.appendChild(li);
        li.classList.add('cursor-pointer', 'border-b', 'list-none', 'hover:bg-lime-200', 'p-2');
        li.addEventListener('click', () => {
            listaResultados3.classList.add('hidden');
            inputDistrito.value = li.textContent;
        });
    });
    // Actualizar la altura del contenedor
    listaResultados3.style.maxHeight = '300px'
}