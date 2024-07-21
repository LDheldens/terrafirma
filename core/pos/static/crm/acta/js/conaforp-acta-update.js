
// 10 FINALLY
const btnActualizar = document.getElementById('btn-actualizar-titular');

const getValueListRadio = (listRadio) => {
    const value = [...listRadio].find(element => element.checked).value;
    if(['si', 'no'].includes(value)) return value === 'si'
    return value
}

btnActualizar.addEventListener('click', () => {
    const data = {
        // start
        fecha: fecha.value,
        cel_wsp: celWssp.value,
        // 1.- DATOS DE LA POSESIÓN INFORMAL
        departamento: departamento.value,
        provincia: provincia.value,
        distrito: distrito.value,
        posesion_informal: posesionInformal.value,
        sector: sector.value,
        // 2.- IDENTIFICACIÓN DEL PREDIO
        etapa: etapa.value,
        descripcion_fisica: getValueListRadio(listRadioDescripcionFisicaPredio),
        direccion_fiscal: direccionFiscalReferencia.value,
        tipo_uso: getValueListRadio(listRadioUso),
        servicios_basicos: Array.from(listCheckboxServBas).filter(checkbox => checkbox.checked).map(checkbox => checkbox.value),
        // 3.- DATOS DE(LOS) TITULAR(ES)/REPRESENTANTE(S)
        carta_poder: getValueListRadio(listRadioCartaPoder),
        // 4.- BOCETO DEL PREDIO
        // bocetoDelPredio.value = data.boceto;
        // colindancia table
        colindancia: {
            frente_nombre: nombresApellidosColindanciaFrente.value,
            frente_distancia: distanciaFrente.value,
            fondo_nombre: nombresApellidosColindanciaFondo.value,
            fondo_distancia: distanciaFondo.value,
            derecha_nombre: nombresApellidosColindanciaDerecha.value,
            derecha_distancia: distanciaDerecha.value,
            izquierda_nombre: nombresApellidosColindanciaIzquierda.value,
            izquierda_distancia: distanciaIzquierda.value,
        },
        hitos_consolidados: getValueListRadio(listRadioHitosConsolidado),
        acceso_a_via: getValueListRadio(listRadioAccesoVia),
        cantidad_lotes: numeroLotes.value,
        requiere_subdivision: getValueListRadio(listRadioSubdivion),
        requiere_alineamiento: getValueListRadio(listRadioAlineamiento),
        apertura_de_via: getValueListRadio(listRadioAperturaVia),
        libre_de_riesgo: getValueListRadio(listRadioLibreRiesgo),
        req_transf_de_titular: getValueListRadio(listRadioTransfTitular),
        litigio_denuncia: getValueListRadio(listRadioLitigioDenunciaEtc),
        area_segun_el_titular_representante: areaSegunTitularRepresentante.value,
        comentario1: comentarioAdic.value,
        // 5.- DEL LEVANTAMIENTO TOPOGRÁFICO:
        codigo_dlt: codigo.value,
        hora: hora.value,
        n_punto: numeroPuntos.value,
        operador: operador.value,
        equipo_tp: equipoTp.value,
        tiempo_atmosferico: getValueListRadio(listRadioTiempoAtmosferico),
        comentario2: comentarioObservaciones.value,
        // 6.- DE LOS TITULAR(ES) O REPRESENTATE(S)
        // solo texto
        // 8.- ADICIONALES:
        adjunta_toma_topografica: getValueListRadio(listRadioTomaFotograficaPredio),
        adicionales_otros: otros.value,
        // 9.- FIRMA DEL OPERADOR TOPOGRÁFICO, REPRESENTANTE DE LA COMISIÓN Y SUPERVISOR DE CAMPO
        imagen_acta: {
            firma_topografo_name: firmaOperadorTopografo.nextElementSibling.getElementsByTagName('img')[0].getAttribute('file_name'),
            firma_topografo: firmaOperadorTopografo.nextElementSibling.getElementsByTagName('img')[0].getAttribute('src').replace('data:image/jpeg;base64,', ''),
            firma_representante_comision_name: firmaRepresentanteComision.nextElementSibling.getElementsByTagName('img')[0].getAttribute('file_name'),
            firma_representante_comision: firmaRepresentanteComision.nextElementSibling.getElementsByTagName('img')[0].getAttribute('src').replace('data:image/jpeg;base64,', ''),
            firma_supervisor_campo_name: firmaSupervisorCampo.nextElementSibling.getElementsByTagName('img')[0].getAttribute('file_name'),
            firma_supervisor_campo: firmaSupervisorCampo.nextElementSibling.getElementsByTagName('img')[0].getAttribute('src').replace('data:image/jpeg;base64,', ''),
            comentario3: firmaActoresIntervinientesComentarioObservaciones.value
        },
        // pro
        handl_titulares: {
            to_add:[],
            to_delete:[],
            to_update:[]
        },
        handl_representantes: {
            to_add:[],
            to_delete:[],
            to_update:[]
        }
    };
    // return console.log(data)
    fetch(window.location.pathname, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    })
    .then(res => {
        if(res.status === 200) {
            location.reload();
        }
    })
    .catch(console.log);
})


const setValueListRadio = (elementsRadio, value) => {
    [...elementsRadio]
    .find(element => element.value == value).checked = true;
    return true;
};
const setValuesListChecked = (elements, values) => {
    [...elements]
    .filter(element => values.includes(element.value))
    .map(element => element.checked = true);
};

const handlerImage = (event) => {
    const file = event.target.files[0];
    const fileName = file.name;
    console.log({fileName})
    if(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const element = event.target.nextElementSibling.getElementsByTagName('img')[0];
            element.setAttribute('src', e.target.result);
            element.setAttribute('file_name', fileName);
        };
        reader.readAsDataURL(file);
    }
}
firmaOperadorTopografo.addEventListener('change', handlerImage);
firmaRepresentanteComision.addEventListener('change', handlerImage);
firmaSupervisorCampo.addEventListener('change', handlerImage);

const setTitularesRepresentantes = (titulares, representantes) => {
    // titulares
    for (const [ index, titular ] of Object.entries(titulares)) {
        const consonant = consonants[indexFormTitular ]
        // crear los elementos
        containerTitular.insertAdjacentHTML('beforeend', createFormTitularRepresentante(indexFormTitular, consonant, 'titular', titular.id));
        // establezco los handlers
        handlersTitularRepresentante(indexFormTitular, consonant, 'titular')
        // esteblezco los valores
        const listRadioCopiaDoc = document.getElementsByName(`0-titular-list-radio-copia-doc-identidad`);
        setValueListRadio(listRadioCopiaDoc, titular.copia_doc_identidad? 'si': 'no');
        const apellidos = document.getElementById(`${indexFormTitular}-titular-apellidos`)
        apellidos.value = titular.apellidos
        const nombres = document.getElementById(`${indexFormTitular}-titular-nombres`)
        nombres.value = titular.nombres
        const listRadioEstadoCivil = document.getElementsByName(`${indexFormTitular}-titular-list-radio-estado-civil`);
        setValueListRadio(listRadioEstadoCivil, titular.estado_civil);
        const listRadioTipoDoc = document.getElementsByName(`${indexFormTitular}-titular-list-radio-tipo-doc`);
        setValueListRadio(listRadioTipoDoc, titular.tipo_doc);
        const numeroDoc = document.getElementById(`${indexFormTitular}-titular-numero-doc`)
        numeroDoc.value = titular.num_doc
        const firmaTitular = document.getElementById(`${indexFormTitular}-titular-firma`)
        const huellaTitular = document.getElementById(`${indexFormTitular}-titular-huella`)
        firmaTitular.nextElementSibling
        .getElementsByTagName('img')[0]
        .setAttribute('src', 'data:image/jpeg;base64,' + titular.img_firma);
        huellaTitular.nextElementSibling
        .getElementsByTagName('img')[0]
        .setAttribute('src', 'data:image/jpeg;base64,' + titular.img_huella);
        indexFormTitular++
    }
    // representantes
}

const pathSplited = window.location.pathname.replace('/update', '');
fetch(pathSplited, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    // body: JSON.stringify(payload),
})
.then(res => res.status == 200 && res.json().then(data => {
    // start
    fecha.value = data.fecha.split('-').join('-');
    celWssp.value = data.cel_wsp;
    // 1.- DATOS DE LA POSESIÓN INFORMAL
    departamento.value = data.departamento;
    provincia.value = data.provincia;
    distrito.value = data.distrito;
    posesionInformal.value = data.posesion_informal;
    sector.value = data.sector;
    // 2.- IDENTIFICACIÓN DEL PREDIO
    etapa.value = data.etapa
    direccionFiscalReferencia.value = data.direccion_fiscal
    setValueListRadio(listRadioDescripcionFisicaPredio, data.descripcion_fisica)
    setValueListRadio(listRadioUso, data.tipo_uso)
    setValuesListChecked(listCheckboxServBas, data.servicios_basicos)
    listRadioUso.value = data.tipo_uso;
    // 3.- DATOS DE(LOS) TITULAR(ES)/REPRESENTANTE(S)
    listCheckboxServBas.value = data.servicios_basicos;
    setValueListRadio(listRadioCartaPoder, data.carta_poder? 'si': 'no');
    // 4.- BOCETO DEL PREDIO
    // bocetoDelPredio.value = data.boceto;
    nombresApellidosColindanciaFrente.value = data.colindancia.frente_nombre;
    distanciaFrente.value = data.colindancia.frente_distancia;
    nombresApellidosColindanciaFondo.value = data.colindancia.fondo_nombre;
    distanciaFondo.value = data.colindancia.fondo_distancia;
    nombresApellidosColindanciaDerecha.value = data.colindancia.derecha_nombre;
    distanciaDerecha.value = data.colindancia.derecha_distancia;
    nombresApellidosColindanciaIzquierda.value = data.colindancia.izquierda_nombre;
    distanciaIzquierda.value = data.colindancia.izquierda_distancia;
    setValueListRadio(listRadioHitosConsolidado, data.hitos_consolidados? 'si': 'no');
    setValueListRadio(listRadioAccesoVia, data.acceso_a_via? 'si': 'no');
    numeroLotes.value = data.cantidad_lotes;
    setValueListRadio(listRadioSubdivion, data.requiere_subdivision? 'si': 'no');
    setValueListRadio(listRadioAlineamiento, data.requiere_alineamiento? 'si': 'no');
    setValueListRadio(listRadioAperturaVia, data.apertura_de_via? 'si': 'no') 
    setValueListRadio(listRadioLibreRiesgo, data.libre_de_riesgo? 'si': 'no')
    setValueListRadio(listRadioTransfTitular, data.req_transf_de_titular? 'si': 'no')
    setValueListRadio(listRadioLitigioDenunciaEtc, data.litigio_denuncia? 'si': 'no')
    areaSegunTitularRepresentante.value = data.area_segun_el_titular_representante
    comentarioAdic.value = data.comentario1
    // 5.- DEL LEVANTAMIENTO TOPOGRÁFICO:
    codigo.value = data.codigo_dlt
    hora.value = data.hora
    numeroPuntos.value = data.n_punto
    operador.value = data.operador
    equipoTp.value = data.equipo_tp
    setValueListRadio(listRadioTiempoAtmosferico, data.tiempo_atmosferico)
    comentarioObservaciones.value = data.comentario2
    // 6.- DE LOS TITULAR(ES) O REPRESENTATE(S)
    // solo texto
    // 8.- ADICIONALES:
    setValueListRadio(listRadioTomaFotograficaPredio, data.adjunta_toma_topografica? 'si': 'no')
    otros.value = data.adicionales_otros
    // 9.- FIRMA DEL OPERADOR TOPOGRÁFICO, REPRESENTANTE DE LA COMISIÓN Y SUPERVISOR DE CAMPO
    const firmaOperadorTopografoIMG = firmaOperadorTopografo.nextElementSibling.getElementsByTagName('img')[0];
    firmaOperadorTopografoIMG.setAttribute('src', 'data:image/jpeg;base64,' + data.imagen_acta.firma_topografo);
    firmaOperadorTopografoIMG.setAttribute('file_name', data.imagen_acta.firma_topografo_name);

    const firmaRepresentanteComisionIMG = firmaRepresentanteComision.nextElementSibling.getElementsByTagName('img')[0];
    firmaRepresentanteComisionIMG.setAttribute('src', 'data:image/jpeg;base64,' + data.imagen_acta.firma_representante_comision)
    firmaRepresentanteComisionIMG.setAttribute('file_name', data.imagen_acta.firma_representante_comision_name);

    const firmaSupervisorCampoIMG = firmaSupervisorCampo.nextElementSibling.getElementsByTagName('img')[0];
    firmaSupervisorCampoIMG.setAttribute('src', 'data:image/jpeg;base64,' + data.imagen_acta.firma_supervisor_campo)
    firmaSupervisorCampoIMG.setAttribute('file_name', data.imagen_acta.firma_supervisor_campo_name);

    firmaActoresIntervinientesComentarioObservaciones.value = data.imagen_acta.comentario3
    // textoFinalFormalizacion.value = data.imagen_acta.comentario3
    setTitularesRepresentantes(data.titulares, data.representantes)
}))
.catch(console.log)
//set titulars and representants
