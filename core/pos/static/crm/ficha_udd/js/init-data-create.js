const numeroPredios = document.querySelector('#numero-lotes');
const numeroPrediosHabitados = document.querySelector('#numero-predios-habitados');
const porcentajeVivencia = document.querySelector('#porcentaje-vivencia');

numeroPrediosHabitados.addEventListener('input', (e) => {
    calcularProcentaje()
    
});
numeroPredios.addEventListener('input', (e) => {
    calcularProcentaje()
    
});
function calcularProcentaje(){
    const totalPredios = parseFloat(numeroPredios.value);
    const prediosHabitados = parseFloat(numeroPrediosHabitados.value);
    if (!isNaN(totalPredios) && !isNaN(prediosHabitados) && totalPredios !== 0) {
        porcentajeVivencia.value = (prediosHabitados * 100 / totalPredios).toFixed(2); 
    } else {

        porcentajeVivencia.value = '';
    }
}

// utils
const getTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
    return currentTime;
};
const getDate = () => {
    let currentDate = new Date().toLocaleString('es-PE', {
        timeZone: 'America/Lima',
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
    });
    currentDate = currentDate.split('/').reverse().join('-');
    return currentDate;
};
const showHideElementByListRadio = (options) => {
    const {
        nameListRadio,
        valueToShow,
        idElementToShow,
    } = options;
    const listRadio = document.getElementsByName(nameListRadio);
    const elementToShow = document.getElementById(idElementToShow);
    Array.from(listRadio).map(radio => {
        radio.addEventListener('change', (e)=> {
            if(e.target.value === valueToShow) {
                elementToShow.classList.remove('hidden');
            } else {
                elementToShow.classList.add('hidden');
            }
        });
    });
};

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

const setDinamicListCheckbox = (options) => {
    const {
        nameListCheckbox,
        nameListInputCantidad,
        nameListSpanPorcentaje,
        idInputTotal,
    } = options;

    const listCheckbox = document.getElementsByName(nameListCheckbox);
    const listInputCantidad = document.getElementsByName(nameListInputCantidad);
    const inputTotal = document.getElementById(idInputTotal);

    const getPercent = (value, total) => {
        const num = value * 100 / total;
        // return num;
        return (num || 0).toFixed(2);
    };
    const setSumInputsCheckeds =  () =>  {
        const inputsCheckeds = Array.from(listInputCantidad)
                                    .filter(input => {
                                        const li = input.parentElement.parentElement;
                                        const checkbox = li.querySelector(`input[name="${nameListCheckbox}"]`);
                                        if(!checkbox.checked) {
                                            //reset span uncheckeds
                                            const span = li.querySelector(`span[name="${nameListSpanPorcentaje}"]`);
                                            span.innerText = '0.00%';
                                            return false;
                                        }
                                        return true;
                                    });
        const sumCantidadInputsCheckeds = Array.from(inputsCheckeds)
                                                .reduce((acc, input) => acc + Number(input.value || 0), 0);
        Array.from(inputsCheckeds).map(input => {
            const li = input.parentElement.parentElement;
            const span = li.querySelector(`span[name="${nameListSpanPorcentaje}"]`);
            span.innerText = `${getPercent(Number(input.value || 0), sumCantidadInputsCheckeds)}%`;
        })
        inputTotal.innerText = sumCantidadInputsCheckeds;
    };
    Array.from(listCheckbox).map(checkbox => {
        checkbox.addEventListener('change', _ => {
            setSumInputsCheckeds();
        });
    });
    Array.from(listInputCantidad).map(input => {
        input.addEventListener('input', _ => {
            setSumInputsCheckeds();
        });
    });
};
const getInfoCheckbox = (options) => {
    const {
        nameListCheckbox,
        nameListInputCantidad,
    } = options;

    const listInputCantidad = document.getElementsByName(nameListInputCantidad);
    const info = Array.from(listInputCantidad)
                        .reduce((acc, curr) => {
                            const li = curr.parentElement.parentElement;
                            const checkbox = li.querySelector(`input[name="${nameListCheckbox}"]`);
                            if(checkbox.checked) {
                                const quantity = li.querySelector(`input[name="${nameListInputCantidad}"]`);
                                const result = {
                                    name: checkbox.value,
                                    quantity: Number(quantity.value || 0)
                                };
                                if(checkbox.value === 'Otros') {
                                    result['valueOtros'] = quantity.previousElementSibling.value;
                                }
                                acc.push(result);
                            }
                            return acc;
                        }, [ ]);
    return info;
};

// init
allUbigeosPe();

setDinamicListCheckbox({
    nameListCheckbox: 'list-checkbox-equipamientos',
    nameListInputCantidad: 'list-input-equipamientos-cantidad',
    nameListSpanPorcentaje: 'list-input-porcentaje',
    idInputTotal: 'equipamientos-total',
});
setDinamicListCheckbox({
    nameListCheckbox: 'list-checkbox-material-predominante',
    nameListInputCantidad: 'list-input-material-predominante-cantidad',
    nameListSpanPorcentaje: 'list-input-porcentaje',
    idInputTotal: 'material-predominante-total',
});
setDinamicListCheckbox({
    nameListCheckbox: 'list-checkbox-servicios-basicos',
    nameListInputCantidad: 'list-input-servicios-basicos-cantidad',
    nameListSpanPorcentaje: 'list-input-porcentaje',
    idInputTotal: 'servicios-basicos-total',
});
showHideElementByListRadio({
    nameListRadio: 'list-radio-zonas-arqueologica-o-reservas-naturales',
    valueToShow: 'si',
    idElementToShow: 'container-zonas-arqueologica-o-reservas-naturales',
});
showHideElementByListRadio({
    nameListRadio: 'list-radio-zonas-riesgo',
    valueToShow: 'si',
    idElementToShow: 'container-zonas-riesgo',
});
showHideElementByListRadio({
    nameListRadio: 'list-radio-conflictos-digerenciales',
    valueToShow: 'si',
    idElementToShow: 'container-conflictos-dirigenciales',
});
// showHideElementByListRadio(listRadioCasos, 'si', containerCasos);