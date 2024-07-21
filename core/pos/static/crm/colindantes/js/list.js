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
            {"data": "primer_titular"},
            {"data": "num_titulares"},
            {"data": "cel_wsp"},
            {"data": "direccion_fiscal"},
            {"data":null},
            // {"data":null},
        ],        
        columnDefs: [
            // {
            //     targets: 4, // Índice de la columna para el botón "Agregar Titular"
            //     class: 'text-center',
            //     orderable: false,
            //     render: function (data, type, row) {
            //         var button = '<button type="buton" class="btn btn-primary btn-xs btn-flat add-titular" data-id="' + row.id + '" onclick="agregarTitular(' + row.id + ')">Agregar Titular</button>';
            //         return button;
            //     }
            // },
            {
                targets: 4,
                class: 'text-center',
                orderable: false,
                render: function (data, type, row) {
                    var dropdownMenu = '<div class="dropdown">';
                    dropdownMenu += '<button class="btn-list-actas dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Acciones</button>';

                    dropdownMenu += '<div class="dropdown-menu" aria-labelledby="dropdownMenuButton">';

                    dropdownMenu += '<a class="dropdown-item" href="/pos/crm/acta/update/' + row.id + '/"><i class="fas fa-edit text-warning"></i> Editar</a>';

                    dropdownMenu += '<a class="dropdown-item" href="/pos/crm/acta/delete/' + row.id + '/"><i class="fas fa-trash-alt text-danger"></i> Eliminar</a>';

                    dropdownMenu += '<button type="button" class="dropdown-item" data-id="' + row.id + '" onclick="agregarTitular(' + row.id + ')"><i class="fas fa-plus text-info"></i> Agregar Titular</button>';

                    dropdownMenu += '<button type="button" class="dropdown-item" data-id="' + row.id + '" onclick="mostrarTitulares(' + row.id + ')"><i class="fas fa-eye text-success"></i> Ver titulares</button>';

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