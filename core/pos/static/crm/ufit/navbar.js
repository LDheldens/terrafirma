// navbar
const dropdownNavbar = document.getElementById('dropdownNavbar');
const dropdownsNavbarLink = document.querySelectorAll('.dropdownNavbarLink');
Array.from(dropdownsNavbarLink).forEach((value) => {
    value.addEventListener('click', () => {
        console.log('click!!!')
        dropdownNavbar.classList.toggle('hidden')
    })
})

document.addEventListener('click', event => {
    if (!dropdownNavbar.contains(event.target) && !Array.from(dropdownsNavbarLink).includes(event.target)) {
        dropdownNavbar.classList.add('hidden');
    }
});