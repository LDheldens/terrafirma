const containerGeneral = document.querySelector('.contenedor-menus')
const dropdownsNavbarLink = document.querySelectorAll('.dropdownNavbarLink');

containerGeneral.addEventListener('click',(e)=>{

    document.querySelectorAll('#dropdownNavbar').forEach(dropdown => {
        dropdown.classList.add('hidden');
    });

    if (e.target.matches('.dropdownNavbarLink')) {
        const contenedor = e.target.parentElement.parentElement
        const dropdownNavbar = contenedor.querySelector('#dropdownNavbar')
        dropdownNavbar.classList.toggle('hidden')
    }
})

document.addEventListener('click', (e) => {
    if (!containerGeneral.contains(e.target) && !e.target.matches('.dropdownNavbarLink')) {
        document.querySelectorAll('#dropdownNavbar').forEach(dropdown => {
            dropdown.classList.add('hidden');
        });
    }
});