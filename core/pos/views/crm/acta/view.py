import json
from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse, HttpResponseRedirect
from django.urls import reverse_lazy
from django.views.generic import TemplateView, CreateView, UpdateView, DeleteView, View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

# from django.core.exceptions import ObjectDoesNotExist
from core.pos.models import Acta, Colindancia, Titular, ImagenActa, Posesion, PosesionInformal
from django.core.files.base import ContentFile
import base64
from django.shortcuts import get_object_or_404
from django.db import transaction
from datetime import date, datetime
from django.db.models import Q
from django.forms.models import model_to_dict

# vistas creadas por Daniel
class ActaListView(TemplateView):
    template_name = 'crm/acta/list.html'

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'search':
                data = [acta.toJSON() for acta in Acta.objects.all()]
                print("actas", data)
            else:
                data['error'] = 'Ha ocurrido un error'
        except Exception as e:
            print('errrrr',str(e) )
            data['error'] = str(e)
        return HttpResponse(json.dumps(data), content_type='application/json')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['create_url'] = reverse_lazy('acta_create')
        context['title'] = 'Listado de Actas'
        return context
@method_decorator(csrf_exempt, name='dispatch')
class ActaCreateView(TemplateView):
    template_name = 'crm/acta/create.html'
    success_url = reverse_lazy('acta_list')

    def post(self, request, *args, **kwargs):
        # Obtener los datos del cuerpo de la solicitud
        data = json.loads(request.body)
        # return print(data)

        codigo_predio = data.get('codigo_predio')
        if Acta.objects.filter(codigo_predio=codigo_predio).exists():
            return JsonResponse({'message': f'El código {codigo_predio} ya está en uso'}, status=400)

        # Crear una instancia de Acta
        acta = Acta()
        print(acta)
        # Llenar los campos de Acta
        acta.posesion_informal_id = data.get('id_posesion_informal')
        acta.fecha = data.get('fecha')
        acta.cel_wsp = data.get('cel-wssp')
        acta.codigo_predio = data.get('codigo_predio')
        # 1.- DATOS DE LA POSESIÓN INFORMAL
        # acta.departamento = data.get('departamento')
        # acta.provincia = data.get('provincia')
        # acta.distrito = data.get('distrito')
        # acta.posesion_informal = data.get('posesion_informal')
        # acta.sector = data.get('sector')
        # acta.etapa = data.get('etapa')
        # 2.- IDENTIFICACIÓN DEL PREDIO
        acta.direccion_fiscal = data.get('direccion-fiscal-referencia')
        acta.descripcion_fisica = data.get('list-radio-descripcion-fisica-predio')
        acta.descripcion_fisica_otros = data.get('descripcion-fisica-predio-otros-value')
        acta.tipo_uso = data.get('list-radio-uso')
        acta.tipo_uso_otros = data.get('uso-otros-value')
        acta.servicios_basicos = data.get('list-checkbox-serv-bas')
        # 3.- DATOS DE(LOS) TITULAR(ES)/REPRESENTANTE(S)
        # 4.- BOCETO DEL PREDIO
        acta.hitos_consolidados = data.get('list-radio-hitos-consolidado')
        acta.acceso_a_via = data.get('list-radio-acceso-via')

        requiere_subdivision = data.get('list-radio-subdivion')
        acta.requiere_subdivision = requiere_subdivision
        if requiere_subdivision == 'si':
            acta.cantidad_lotes = data.get('numero-lotes')

        acta.requiere_alineamiento = data.get('list-radio-alineamiento')
        acta.apertura_de_via = data.get('list-radio-apertura-via')
        acta.libre_de_riesgo = data.get('list-radio-libre-riesgo')
        acta.req_transf_de_titular = data.get('list-radio-transf-titular')
        acta.litigio_denuncia = data.get('list-radio-litigio-denuncia-etc')
        acta.area_segun_el_titular_representante = data.get('area-segun-titular-representante')
        acta.comentario1 = data.get('comentario1')
        # 5.- DEL LEVANTAMIENTO TOPOGRÁFICO:
        acta.codigo_dlt = data.get('codigo')
        acta.hora = data.get('hora')
        acta.n_punto = data.get('numero-puntos')
        acta.tiempo_atmosferico = data.get('list-radio-tiempo-atmosferico')
        acta.comentario2 = data.get('comentario2')
        # acta.operador = data.get('operador')
        # acta.equipo_tp = data.get('equipo-tp')
        # 8.- ADICIONALES:
        casos_toma_predio = data.get('list-radio-casos')
        acta.casos_toma_predio = casos_toma_predio
        if casos_toma_predio == 'si':
            acta.descripcion_toma_predio = data.get('descripcion-documentos-casos-si')
        
        # 9.- FIRMA DEL OPERADOR TOPOGRÁFICO, REPRESENTANTE DE LA COMISIÓN Y SUPERVISOR DE CAMPO
        acta.comentario3 = data.get('firma-actores-intervinientes-comentario-observaciones')

        # Guardar la instancia de Acta en la base de datos
        acta.save()
        # Procesar las imágenes
        archivos_acta = ImagenActa()
        # Asignar la instancia de acta a la imagen
        archivos_acta.acta = acta
        # boceto-predio-pdf
        boceto_predio_pdf_base64 = data.get('boceto-predio-pdf')
        if boceto_predio_pdf_base64:
            boceto_predio_pdf_content = ContentFile(base64.b64decode(boceto_predio_pdf_base64), name='boceto.pdf')
            archivos_acta.boceto_pdf.save('boceto.pdf', boceto_predio_pdf_content)
        # toma-fotografica-predio-imagen
        toma_fotografica_predio_imagen_base64 = data['toma-fotografica-predio-imagen']
        if toma_fotografica_predio_imagen_base64:
            toma_fotografica_predio_imagen_content = ContentFile(base64.b64decode(toma_fotografica_predio_imagen_base64), name='toma.png')
            archivos_acta.toma_predio_imagen.save('toma.png', toma_fotografica_predio_imagen_content)
        # documentos-casos-si-pdf
        if casos_toma_predio == 'si':
            documentos_casos_si_pdf_base64 = data['documentos-casos-si-pdf']
            if documentos_casos_si_pdf_base64:
                documentos_casos_si_pdf_base64_content = ContentFile(base64.b64decode(documentos_casos_si_pdf_base64), name='documentos_predio.pdf')
                archivos_acta.documento_predio_pdf.save('documentos_predio.pdf', documentos_casos_si_pdf_base64_content)

        # archivo_firmas_pdf
        firmas_pdf_base64 = data['documentos-casos-si-pdf']
        if firmas_pdf_base64:
            firmas_pdf_base64_content = ContentFile(base64.b64decode(firmas_pdf_base64), name='firmas.pdf')
            archivos_acta.archivo_firmas_pdf.save('firmas.pdf', firmas_pdf_base64_content)
        # Guardar la instancia de ImagenActa en la base de datos
        archivos_acta.save()

        # Procesar los titulares
        titulares_data = data['titulares']
        for titular_data in titulares_data:
            # Verificar si el titular tiene el campo 'representante' con el valor 'si'
            if 'representante' in titular_data and titular_data['representante'] == 'si':
                # Agregar el titular a la lista de titulares con representante
                poseedor = Posesion()
                poseedor.acta = acta  # Asociación con el acta correspondiente
                poseedor.copia_doc_identidad = titular_data.get('copiaDoc')
                poseedor.apellidos = titular_data.get('apellidos')
                poseedor.nombres = titular_data.get('nombres')
                poseedor.estado_civil = titular_data.get('estadoCivil')
                poseedor.num_doc = titular_data.get('dni')

                # Guardar la instancia de Posesion en la base de datos
                poseedor.save()

            titular = Titular()
            titular.copia_doc_identidad = titular_data.get('copiaDoc')
            titular.apellidos = titular_data.get('apellidos')
            titular.nombres = titular_data.get('nombres')
            titular.estado_civil = titular_data.get('estadoCivil')
            titular.num_doc = titular_data.get('dni')
            titular.representante = titular_data.get('representante')
            titular.observaciones = titular_data.get('observaciones')
            # Documentos
            pdf_documento_base64 = titular_data.get('documentos')
            if pdf_documento_base64:
                pdf_documento_content = ContentFile(base64.b64decode(pdf_documento_base64), name='documento.pdf')
                titular.pdf_documento.save('documento.pdf', pdf_documento_content)
            # Guardar la instancia de Titular en la base de datos
            titular.acta = acta  # Asociación aquí
            # Guardar la instancia de Titular en la base de datos
            titular.save()

        return JsonResponse({'message': 'Acta creada exitosamente'}, status=201)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        posesiones_matriz = PosesionInformal.objects.filter(is_matriz=True)
        # Agregar los datos al contexto que deseas pasar al template
        context['list_url'] = self.success_url
        context['posesiones_matriz'] = posesiones_matriz
        return context

@method_decorator(csrf_exempt, name='dispatch')
class ActaView(TemplateView):
    http_method_names = ["post"]
    acta = None
    def post(self, request, *args, **kwargs):
        id = self.kwargs.get('pk')
        try:
            self.acta = Acta.objects.get(pk=id)
            data = self.acta.toJSON()
            return JsonResponse({**data, 'message': 'ok'}, status=200)
        except Acta.DoesNotExist:
            return JsonResponse({'message': 'Acta no existente'}, status=404)

@method_decorator(csrf_exempt, name='dispatch')
class ActaUpdateView(TemplateView):
    model = Acta
    template_name = 'crm/acta/update.html'
    success_url = reverse_lazy('acta_list')
    # http_method_names = ["get", "post"]
    def post(self, request, *args, **kwargs):
        # Obtener los datos del cuerpo de la solicitud
        pk = self.kwargs.get('pk')
        data = json.loads(request.body)

        # print(f'pk {pk}')
        # print(data)
        # return JsonResponse({'message': 'Acta actualizada exitosamente'}, status=201)

        # Crear una instancia de Acta
        acta = get_object_or_404(Acta, pk=pk)
        # Llenar los campos de Acta
        acta.fecha = data.get('fecha')
        acta.cel_wsp = data.get('cel-wssp')
        # 1.- DATOS DE LA POSESIÓN INFORMAL
        # acta.departamento = data.get('departamento')
        # acta.provincia = data.get('provincia')
        # acta.distrito = data.get('distrito')
        # acta.posesion_informal = data.get('posesion_informal')
        # acta.sector = data.get('sector')
        # acta.etapa = data.get('etapa')
        # 2.- IDENTIFICACIÓN DEL PREDIO
        acta.direccion_fiscal = data.get('direccion-fiscal-referencia')
        acta.descripcion_fisica = data.get('list-radio-descripcion-fisica-predio')
        acta.descripcion_fisica_otros = data.get('descripcion-fisica-predio-otros-value')
        acta.tipo_uso = data.get('list-radio-uso')
        acta.tipo_uso_otros = data.get('uso-otros-value')
        acta.servicios_basicos = data.get('list-checkbox-serv-bas')
        # 3.- DATOS DE(LOS) TITULAR(ES)/REPRESENTANTE(S)
        # 4.- BOCETO DEL PREDIO
        acta.hitos_consolidados = data.get('list-radio-hitos-consolidado')
        acta.acceso_a_via = data.get('list-radio-acceso-via')
        requiere_subdivision = data.get('list-radio-subdivion')
        acta.requiere_subdivision = requiere_subdivision
        if requiere_subdivision == 'si':
            acta.cantidad_lotes = data.get('numero-lotes')
        else:
            acta.cantidad_lotes = None

        acta.requiere_alineamiento = data.get('list-radio-alineamiento')
        acta.apertura_de_via = data.get('list-radio-apertura-via')
        acta.libre_de_riesgo = data.get('list-radio-libre-riesgo')
        acta.req_transf_de_titular = data.get('list-radio-transf-titular')
        acta.litigio_denuncia = data.get('list-radio-litigio-denuncia-etc')
        acta.area_segun_el_titular_representante = data.get('area-segun-titular-representante')
        acta.comentario1 = data.get('comentario1')
        # 5.- DEL LEVANTAMIENTO TOPOGRÁFICO:
        acta.codigo_dlt = data.get('codigo')
        acta.hora = data.get('hora')
        acta.n_punto = data.get('numero-puntos')
        acta.tiempo_atmosferico = data.get('list-radio-tiempo-atmosferico')
        acta.comentario2 = data.get('comentario2')
        # acta.operador = data.get('operador')
        # acta.equipo_tp = data.get('equipo-tp')
        # 8.- ADICIONALES:
        casos_toma_predio = data.get('list-radio-casos')
        acta.casos_toma_predio = casos_toma_predio
        if casos_toma_predio == 'si':
            # descripcion_toma_predio
            acta.descripcion_toma_predio = data.get('descripcion-documentos-casos-si')
        else:
            acta.descripcion_toma_predio = ''

        # 9.- FIRMA DEL OPERADOR TOPOGRÁFICO, REPRESENTANTE DE LA COMISIÓN Y SUPERVISOR DE CAMPO
        acta.comentario3 = data.get('firma-actores-intervinientes-comentario-observaciones')

        # Guardar la instancia de Acta en la base de datos
        acta.save()

        # Procesar archivos
        archivos_acta = acta.imagenes.get()
        # boceto-predio-pdf
        boceto_predio_pdf_base64 = data.get('boceto-predio-pdf')
        if boceto_predio_pdf_base64:
            boceto_predio_pdf_content = ContentFile(base64.b64decode(boceto_predio_pdf_base64), name='boceto.pdf')
            archivos_acta.boceto_pdf.save('boceto.pdf', boceto_predio_pdf_content)

        # toma-fotografica-predio-imagen
        toma_fotografica_predio_imagen_base64 = data['toma-fotografica-predio-imagen']
        if toma_fotografica_predio_imagen_base64:
            toma_fotografica_predio_imagen_content = ContentFile(base64.b64decode(toma_fotografica_predio_imagen_base64), name='toma.png')
            archivos_acta.toma_predio_imagen.save('toma.png', toma_fotografica_predio_imagen_content)
        # documentos-casos-si-pdf
        if casos_toma_predio == 'si':
            documentos_casos_si_pdf_base64 = data['documentos-casos-si-pdf']
            if documentos_casos_si_pdf_base64:
                documentos_casos_si_pdf_base64_content = ContentFile(base64.b64decode(documentos_casos_si_pdf_base64), name='documentos_predio.pdf')
                archivos_acta.documento_predio_pdf.save('documentos_predio.pdf', documentos_casos_si_pdf_base64_content)
        else:
            archivos_acta.documento_predio_pdf = None
        # archivo_firmas_pdf
        firmas_pdf_base64 = data['firmas-operador-topografo-representante-comision-supervisor-de-campo-pdf']
        if firmas_pdf_base64:
            firmas_pdf_base64_content = ContentFile(base64.b64decode(firmas_pdf_base64), name='firmas.pdf')
            archivos_acta.archivo_firmas_pdf.save('firmas.pdf', firmas_pdf_base64_content)
        archivos_acta.save()

        # # Procesar los titulares
        # titulares_data = data['titulares']
        # for titular_data in titulares_data:
        #     titular = Titular()
        #     titular.copia_doc_identidad = titular_data.get('copiaDoc')
        #     titular.apellidos = titular_data.get('apellidos')
        #     titular.nombres = titular_data.get('nombres')
        #     titular.estado_civil = titular_data.get('estadoCivil')
        #     titular.num_doc = titular_data.get('dni')
        #     titular.representante = titular_data.get('representante')
        #     titular.observaciones = titular_data.get('observaciones')
        #     # Documentos
        #     pdf_documento_base64 = titular_data.get('documentos')
        #     if pdf_documento_base64:
        #         pdf_documento_content = ContentFile(base64.b64decode(pdf_documento_base64), name='documento.pdf')
        #         titular.pdf_documento.save('documento.pdf', pdf_documento_content)
        #     # Guardar la instancia de Titular en la base de datos
        #     titular.acta = acta  # Asociación aquí
        #     # Guardar la instancia de Titular en la base de datos
        #     titular.save()

        return JsonResponse({'message': 'Acta creada exitosamente'}, status=201)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Obtener el objeto Acta y agregarlo al contexto
        pk = self.kwargs.get('pk')
        acta = get_object_or_404(Acta, pk=pk)
        # print(acta.boceto_pdf.url)
        context['list_url'] = self.success_url
        context['acta'] = acta
        context['archivos_acta'] = acta.imagenes.get()
        return context


class ActaDeleteView(DeleteView):
    model = Acta
    template_name = 'crm/acta/delete.html'
    success_url = reverse_lazy('acta_list')

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            with transaction.atomic():
                instance = self.get_object()
                # Realiza la eliminación del objeto Acta
                instance.delete()
        except Exception as e:
            # En caso de error, se devuelve el mensaje de error
            data['error'] = str(e)
        # Devuelve la respuesta en formato JSON
        return HttpResponse(json.dumps(data), content_type='application/json')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Agrega el título de la página
        context['title'] = 'Notificación de eliminación'
        # Agrega la URL de redirección después de eliminar el Acta
        context['list_url'] = self.success_url
        context['registro'] = self.kwargs.get('pk')
        return context


# vista para buscar los predios
class PredioSearchView(View):
    def post(self, request):
        data = json.loads(request.body)
        query = data.get('q', '')

        resultados = []
        if query:
            resultados = Acta.objects.filter(
                Q(titulares__num_doc__icontains=query) |
                Q(codigo_predio__icontains=query) |
                Q(posesion_informal__denominacion_segun_inei__icontains=query)
            ).distinct()

        resultados_data = []
        for acta in resultados:
            acta_dict = model_to_dict(acta)
            acta_dict['posesion_informal_nombre'] = acta.posesion_informal.denominacion_segun_inei if acta.posesion_informal else None
            resultados_data.append(acta_dict)

        return JsonResponse(resultados_data, safe=False)