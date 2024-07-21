document.addEventListener('DOMContentLoaded',()=>{
    console.log('PROBANDOI')
    const codigo = document.querySelector('#codigo_predio');
    const numeroPuntos = document.querySelector('#numero-puntos')

    codigo.addEventListener('input', function() {
        const regex = /^[A-Z]-\d{0,3}$/;
        const valor = this.value.trim();
        const contenedor = codigo.parentElement;
        const P = contenedor.querySelector('p');

        if (regex.test(valor)) {
            P.textContent =  "";
            P.classList.remove('text-red-500'); // Elimina el color rojo del texto si estaba Presente
            P.classList.add('text-green-500'); // Agrega el color verde al texto
            P.textContent = 'Formato válido.';
        } else {
            P.classList.remove('text-green-500'); // Elimina el color verde del texto si estaba presente
            P.classList.add('text-red-500'); // Agrega el color rojo al texto
            P.textContent = 'El número de manzana debe tener este formato M-456';
        }
    });
    numeroPuntos.addEventListener('input', function() {
        const regex = /^\d{0,2}$/; // Regex para aceptar máximo dos dígitos
        const valor = this.value.trim();
        const contenedor = numeroPuntos.parentElement;
        const p = contenedor.querySelector('P');
    
        if (regex.test(valor)) {
            p.textContent = ""; // Limpiar el mensaje de error
            p.classList.remove('text-red-500'); // Eliminar el color rojo del texto si estaba presente
        } else {
            p.textContent = 'El número debe tener máximo dos dígitos.'; // Mostrar mensaje de error
            p.classList.add('text-red-500'); // Agregar el color rojo al texto
        }
    });
})