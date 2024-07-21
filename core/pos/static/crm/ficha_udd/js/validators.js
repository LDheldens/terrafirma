//validators
celWssp.addEventListener('input', event => event.target.value = event.target.value.replace(/\D/g, ''));
numeroLotes.addEventListener('input', event => event.target.value = event.target.value.replace(/\D/g, ''));
areaSegunTitularRepresentante.addEventListener('input', event => event.target.value = event.target.value.replace(/[^\d.]|(?<=\..*)\./g, ''));
codigo.addEventListener('input', event => {});
numeroPuntos.addEventListener('input', event => event.target.value = event.target.value.replace(/\D/g, ''));