//========================INICIO PETICIONES======================
// urlApi ====> url del api rest. cambiar la url por donde se encuentra el backend
const urlApi = 'http://localhost:8081/';

function getObra(param) {
    return $.ajax({
        type: 'GET',        
        url: urlApi + 'obra/' + param,
        dataType: 'json'
    });
}

function getImagen(name){
    return $.ajax({
        type: 'GET',        
        url: urlApi + 'obra/verArchivo/'+name,
        dataType: 'json',
        async: false
    }).responseText;
}

function addObra(data) {
    return $.ajax({
        url: urlApi + 'obra',
        type: 'POST',
        data: armarObjetoObraAdd( data ),
        enctype: 'multipart/form-data',
        processData: false,
        contentType: false,
        cache: false,
        dataType: 'json'
    });
}

function updateObra(data) {
    return $.ajax({
        url: urlApi + 'obra',
        type: 'PUT',
        data: armarObjetoObraAdd( data ),
        enctype: 'multipart/form-data',
        processData: false,
        contentType: false,
        cache: false,
        dataType: 'json'
    });
}

function deleteObra( id ) {
    return $.ajax({
        type: 'DELETE',
        url: urlApi + 'obra/' + id,
        dataType: 'json'
    });
}

//========================FIN PETICIONES======================  

//========================INICIO FUNCIONES======================
let idObra = null;
let imagen = null;
let urlImagen = null;

function getAllObra() {
    $('#card-main').html('');
    const obra = getObra(3);
    obra.done(function(obj) {
        if(obj.length > 0){
            $.each(obj, function(key, value) {
                armarCard(obj[key]);
            });
        }else{
            $('#card-main').append(
                '<p class="card-text" style="font-size: 22px;font-weight: normal;">'+
                    'No hay datos' +
                '</p>' 
            );
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        if(jqXHR.status === 500){
            alert('Atención','Error en el servidor','error');
        }else if(jqXHR.status === 403 ){
            alert('Atención','Acceso Denegado','error');
        }
    });
}

function filtarObra() {
    $('#card-main').html('');
    const obra = getObra($('#filtro').val());
    obra.done(function(obj) {
        if(obj.length > 0){
            $.each(obj, function(key, value) {
                armarCard(obj[key]);
            });
        }else{
            $('#card-main').append(
                '<p class="card-text" style="font-size: 22px;font-weight: normal;">'+
                    'No hay datos' +
                '</p>' 
            );
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        if(jqXHR.status === 500){
            alert('Atención','Error en el servidor','error');
        }else if(jqXHR.status === 403 ){
            alert('Atención','Acceso Denegado','error');
        }
    });
}


function armarCard(obj){
    let tipo = obj.tipo == '1'?'Película':'Serie';
    let img =  verImagen(obj.urlImagen);
    $('#card-main').append(
        '<div class="col-xs-12 col-sm-6 col-md-3">' +
            '<span class="text-center" style="font-size: 20px;">' +
                tipo + 
                '<span>' +
                    "<i class='fas fas fa-edit' style='font-size: 20px;margin: 5px;' onclick='abrirModalRegistrar("+JSON.stringify(obj)+");'></i>" +
                '</span>' +
                '<span>' +
                    '<i class="fas fa-trash-alt" style="font-size: 20px;margin: 5px;" onclick="eliminarObra('+(obj.idObra)+');"></i>' +
                '</span>' +                           
            '</span>' +
            '<div class="color1 card text-center">' +
                '<div class="card-body">' +
                    '<p class="card-text titulo">'+
                        obj.titulo + ' ('+obj.anioProduccion +')'+
                    '</p>' +
                    '<h5 class="card-tittle">' +
                        // '<span style="font-size: 50px;">' +
                            '<img src="data:image/jpeg;base64,'+(img)+'"></img>'+
                        // '</span>' +
                    '</h5>' +
                    '<p class="descripcion">'+
                        obj.descripcion +
                    '</p>' +
                '</div>' +
            '</div>' +           
        '</div>' 
    );
}

function guardarObra(){

    if(validarForm()){
        let data = armarObjetoObra();
        const obra = idObra!==null?updateObra( data ):addObra( data );
        obra.done(function( data ) {
            if(data.msg != null  && data.msg.toLowerCase().trim() == 'ok'){
                alert('Registro exitoso');
                $('#card-main').html('');
                getAllObra();
            }else{
                alert('No se pudo registrar la película/serie.');
            }
            cerrarModalRegistrar();
        }).fail(function(jqXHR, textStatus, errorThrown) {
            if(jqXHR.status === 500){
                alert('Error en el servidor');
            }else if(jqXHR.status === 403 ){
                alert('Acceso Denegado');
            }
        });
    }
}

function eliminarObra(idObra){
    const obra = deleteObra( idObra );
    obra.done(function( data ) {
        if (data > 0) {
            alert('La película o serie ha sido eliminada.');
            getAllObra();
        } else {
            alert('No se pudo eliminar el la película o serie');
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        if(jqXHR.status === 500){
            alert('Error en el servidor');
        }else if(jqXHR.status === 403 ){
           alert('Acceso Denegado','error');
        }
    });
}

function validarForm(){

    if($('#txtTitulo').val() == ''){
        $('#txtTitulo').focus();
        alert('El título de la película o serie es obligatorio');
        return false;
    }else if($('#selectTipo').val() == ''){
        $('#selectTipo').focus();
        alert('El tipo es obligatoria');
        return false;
    }else if($('#txtImagen').val() == ''){
        $('#txtImagen').focus();
        alert('La imagen de la película o serie es obligatoria');
        return false;
    }else if($('#txtAnioProduccion').val() == ''){
        $('#txtAnioProduccion').focus();
        alert('El año de producción de la película o serie es obligatorio');
        return false;
    }else{
        return true;
    }
}

let modalRegistrar = new bootstrap.Modal(document.getElementById('registrar'), {
    keyboard: false,
    backdrop: false
});

function abrirModalRegistrar(obj){
    document.getElementById('formulario-registrar').reset();
    idObra = null;
    urlImagen = null;
    if(obj !== '' ){
        idObra = obj.idObra,
        $('#txtTitulo').val(obj.titulo);
        $('#txtDescripcion').val(obj.descripcion);
        $('#selectTipo').val(obj.tipo);
        $('#txtAnioProduccion').val(obj.anioProduccion);
        urlImagen = obj.urlImagen;
    }
    modalRegistrar.show();
}

function cerrarModalRegistrar(){
    modalRegistrar.hide();
}

function armarObjetoObra(){
    var obraModel = null;

    obraModel = {
        idObra: idObra,
        titulo: $('#txtTitulo').val(),
        descripcion: $('#txtDescripcion').val(),
        tipo: $('#selectTipo').val(),
        urlImagen: urlImagen,
        anioProduccion: $('#txtAnioProduccion').val(),
    }

    return obraModel;
}

function cargarImagen(obj) {
    imagen = obj.files[0];
}

function armarObjetoObraAdd( data ) {
    var archivosEnviados = new FormData();
    archivosEnviados.append('obraModelRequest', JSON.stringify( data ));
    archivosEnviados.append('imagen', imagen);
    return archivosEnviados;
}

function verImagen(name){
    const img = getImagen(name);
    return img;
}

function soloNumeros(obj) {
    var val = obj.value;
    if (isNaN(val)) {
        val = val.replace(/[^0-9\,]/g, '');
        if (val.split(',').length > 2)
            val = val.replace(/\,+$/, '');
    }
    obj.value = val;
}
