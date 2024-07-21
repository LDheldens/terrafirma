// utils
const showHideElementByListRadio = (listRadio, value, elementToShow) => {
    [...listRadio].map(radio => {
        radio.addEventListener('change', (e)=> {
            if(e.target.value === value) {
                elementToShow.classList.remove('hidden');
            } else {
                elementToShow.classList.add('hidden');
            }
        });
    });
};

// init
showHideElementByListRadio(listRadioSubdivion, 'si', containerNumeroLotes);
showHideElementByListRadio(listRadioCasos, 'si', containerCasos);