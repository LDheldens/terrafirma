// const utils
const btnCreate = document.getElementById('btn-create');

btnCreate.addEventListener('click', (event) => {
    const colindancia_data = getRows();
    const acta_id = 1
    const data = {
        colindancia_data,
        acta_id,
    };
    fetch('/pos/crm/colindantes/add/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    })
    .then(res => {
        console.log(res);
    })
    .catch(console.log);
});