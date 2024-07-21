function getData() {
    $('#data').DataTable({
        responsive: true,
        autoWidth: false,
        destroy: true,
        deferRender: true,
        ajax: {
            url: pathname,
            type: 'POST',
            headers: {
                'X-CSRFToken': csrftoken
            },
            data: {
                'action': 'search'
            },
            dataSrc: ""
        },
        columns: [
            {"data": "departamento"},
            {"data": "provincia"},
            {"data": "distrito"},
            {"data": "denominacion_segun_inei"},
            {"data":null},
            {"data":null},
        ],        
        columnDefs: [
            {
                targets: 4,
                class: 'text-center',
                orderable: false,
                render: function (data, type, row) {
                    var porcentaje = parseFloat(row.porcentaje_llenado - 2.33).toFixed(2); // Redondear el porcentaje a dos decimales
                    var progressBarHTML = '<div class="progress rounded">';
                    progressBarHTML += '<div class="progress-bar" role="progressbar" style="width: ' + porcentaje + '%" aria-valuenow="' + porcentaje + '" aria-valuemin="0" aria-valuemax="100">' + porcentaje + '%</div>';
                    progressBarHTML += '</div>';
                    return progressBarHTML;
                }
            },
            {
                targets: 5,
                class: 'text-center',
                orderable: false,
                render: function (data, type, row) {
                    var dropdownMenu = '<div class="dropdown">';
                    dropdownMenu += '<button class="btn-list-fichas dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Acciones</button>';

                    dropdownMenu += '<div class="dropdown-menu" aria-labelledby="dropdownMenuButton">';

                    dropdownMenu += '<a class="dropdown-item" href="/pos/crm/ficha_udd/update/' + row.id + '/"><i class="fas fa-edit text-warning"></i> Editar</a>';

                    dropdownMenu += '<a class="dropdown-item" href="/pos/crm/ficha_udd/delete/' + row.id + '/"><i class="fas fa-trash-alt text-danger"></i> Eliminar</a>';

                    dropdownMenu += '<a href="/pos/crm/ficha/' + row.id + '/login" class="dropdown-item" data-id="' + row.id + '" onclick="mostrarTitulares(' + row.id + ')"><i class="fas fa-plus-circle text-primary"></i> Generar Matrix</a>';
                    dropdownMenu += '</div></div>';


                    return dropdownMenu;
                }
            }
        ],
        initComplete: function (settings, json) {

        }
    });
}

$(function () {
    getData();
});