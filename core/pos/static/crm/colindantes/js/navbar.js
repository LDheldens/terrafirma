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