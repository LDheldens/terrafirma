import json
import math

from django.core.serializers.json import DjangoJSONEncoder
from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse, HttpResponseRedirect
from django.urls import reverse_lazy
from django.views.generic import TemplateView, CreateView, UpdateView, DeleteView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

# from django.core.exceptions import ObjectDoesNotExist
from core.pos.models import Acta, Colindancia, Titular, ImagenActa, ColindanciaUfin
from django.core.files.base import ContentFile
import base64
from django.shortcuts import get_object_or_404
from django.db import transaction
from datetime import date, datetime


class UfitListView(TemplateView):
    template_name = 'crm/ufit/list.html'

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'search':
                colindancias = ColindanciaUfin.objects.all()
                data = [colindancia.toJSON() for colindancia in colindancias]
                print(data)
            else:
                data['error'] = 'Ha ocurrido un error'
        except Exception as e:
            data['error'] = str(e)
        return HttpResponse(json.dumps(data, cls=DjangoJSONEncoder), content_type='application/json')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['create_url'] = reverse_lazy('ufit_create')
        context['title'] = 'Listado Ufit'
        return context
    
@method_decorator(csrf_exempt, name='dispatch')
class UfitCreateView(TemplateView):
    template_name = 'crm/ufit/create.html'
    list_url = 'ufit_list'
    success_url = reverse_lazy('ufit_list')
    
    def post(self, request, *args, **kwargs):
        dataGeneral = json.loads(request.body)
        acta_id = dataGeneral['acta_id']
        data = dataGeneral['data']
        numero_lote = data['numeroLote']
        numero_manzana= data['numeroManzana']
        area = data['area']
        perimetro = data['perimetro']
        frente = data['frente']
        derecha = data['derecha']
        izquierda = data['izquierda']
        fondo = data['fondo']

        # Crear instancia de ColindanciaUfin y guardar en la base de datos
        colindancia_ufin = ColindanciaUfin.objects.create(
            acta_id=acta_id,
            frente_descripcion=frente['descripcion'],
            frente_distancia=frente['distancia'],
            frente_n_tramos=frente['cantidad_tramos'],
            frente_tramos=frente['tramos'],
            derecha_descripcion=derecha['descripcion'],
            derecha_distancia=derecha['distancia'],
            derecha_n_tramos=derecha['cantidad_tramos'],
            derecha_tramos=derecha['tramos'],
            izquierda_descripcion=izquierda['descripcion'],
            izquierda_distancia=izquierda['distancia'],
            izquierda_n_tramos=izquierda['cantidad_tramos'],
            izquierda_tramos=izquierda['tramos'],
            fondo_descripcion=fondo['descripcion'],
            fondo_distancia=fondo['distancia'],
            fondo_n_tramos=fondo['cantidad_tramos'],
            fondo_tramos=fondo['tramos'],
            numero_lote=numero_lote,
            numero_manzana=numero_manzana,
            area=area,
            perimetro=perimetro,
        )
        return HttpResponseRedirect(self.success_url)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['list_url'] = self.success_url
        context['title'] = 'Nuevo registro de una ficha de identificacion preliminar'
        context['action'] = 'add'
        return context

@method_decorator(csrf_exempt, name='dispatch')
class UfitUpdateView(TemplateView):
    template_name = 'crm/ufit/update.html'
    list_url = 'ufit_list'
    success_url = reverse_lazy('ufit_list')
    
    def post(self, request, *args, **kwargs):
        dataGeneral = json.loads(request.body)
        acta_id = dataGeneral['acta_id']
        data = dataGeneral['data']
        numero_lote = data['numeroLote']
        numero_manzana = data['numeroManzana']
        area = data['area']
        perimetro = data['perimetro']
        frente = data['frente']
        derecha = data['derecha']
        izquierda = data['izquierda']
        fondo = data['fondo']

        # Obtener el ID del objeto desde la URL
        ufit_id = kwargs.get('pk')

        # Obtener la instancia existente de ColindanciaUfin
        colindancia_ufin = get_object_or_404(ColindanciaUfin, pk=ufit_id)

        # Actualizar los campos de la instancia existente
        colindancia_ufin.frente_descripcion = frente['descripcion']
        colindancia_ufin.frente_distancia = frente['distancia']
        colindancia_ufin.frente_n_tramos = frente['cantidad_tramos']
        colindancia_ufin.frente_tramos = frente['tramos']
        colindancia_ufin.derecha_descripcion = derecha['descripcion']
        colindancia_ufin.derecha_distancia = derecha['distancia']
        colindancia_ufin.derecha_n_tramos = derecha['cantidad_tramos']
        colindancia_ufin.derecha_tramos = derecha['tramos']
        colindancia_ufin.izquierda_descripcion = izquierda['descripcion']
        colindancia_ufin.izquierda_distancia = izquierda['distancia']
        colindancia_ufin.izquierda_n_tramos = izquierda['cantidad_tramos']
        colindancia_ufin.izquierda_tramos = izquierda['tramos']
        colindancia_ufin.fondo_descripcion = fondo['descripcion']
        colindancia_ufin.fondo_distancia = fondo['distancia']
        colindancia_ufin.fondo_n_tramos = fondo['cantidad_tramos']
        colindancia_ufin.fondo_tramos = fondo['tramos']
        colindancia_ufin.numero_lote = numero_lote
        colindancia_ufin.numero_manzana = numero_manzana
        colindancia_ufin.area = area
        colindancia_ufin.perimetro = perimetro

        # Guardar los cambios en la base de datos
        colindancia_ufin.save()

        return HttpResponseRedirect(self.success_url)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['list_url'] = self.success_url
        context['title'] = 'Actualizar registro de una ficha de identificacion preliminar'
        context['action'] = 'update'
        return context

class UfitDeleteView(DeleteView):
    model = ColindanciaUfin
    template_name = 'crm/ufit/delete.html'
    success_url = reverse_lazy('ufit_list') 

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            with transaction.atomic():
                self.object = self.get_object()
                self.object.delete()
                data['success'] = True
                data['redirect'] = str(self.get_success_url())  # Convertir a cadena para evitar problemas con JSON
        except Exception as e:
            data['success'] = False
            data['error'] = str(e)
        return JsonResponse(data)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Agrega el título de la página
        context['title'] = 'Notificación de eliminación'
        # Agrega la URL de redirección después de eliminar el Acta
        context['list_url'] = self.success_url  
        context['registro'] = self.kwargs.get('pk')
        return context

class ColindanciaUfinDetailView(TemplateView):
    def get(self, request, *args, **kwargs):
        # Obtener el ID del acta desde la URL
        acta_id = self.kwargs.get('pk')
        # Obtener el registro de ColindanciaUfin asociado al ID del acta
        try:
            colindancia_ufin = ColindanciaUfin.objects.get(acta_id=acta_id)
        except ColindanciaUfin.DoesNotExist:
            # Si no se encuentra el registro, devolver un objeto JSON vacío
            return JsonResponse({})
        
        # Serializar el objeto a JSON y devolverlo como respuesta
        data = {
    'id':colindancia_ufin.id,
    'data': {
        'frente': {
            'descripcion': colindancia_ufin.frente_descripcion,
            'cantidad_tramos': colindancia_ufin.frente_n_tramos,
            'tramos': colindancia_ufin.frente_tramos,
            'distancia': str(colindancia_ufin.frente_distancia)
        },
        'derecha': {
            'descripcion': colindancia_ufin.derecha_descripcion,
            'cantidad_tramos': colindancia_ufin.derecha_n_tramos,
            'tramos': colindancia_ufin.derecha_tramos,
            'distancia': str(colindancia_ufin.derecha_distancia)
        },
        'izquierda': {
            'descripcion': colindancia_ufin.izquierda_descripcion,
            'cantidad_tramos': colindancia_ufin.izquierda_n_tramos,
            'tramos': colindancia_ufin.izquierda_tramos,
            'distancia': str(colindancia_ufin.izquierda_distancia)
        },
        'fondo': {
            'descripcion': colindancia_ufin.fondo_descripcion,
            'cantidad_tramos': colindancia_ufin.fondo_n_tramos,
            'tramos': colindancia_ufin.fondo_tramos,
            'distancia': str(colindancia_ufin.fondo_distancia)
        },
        'area': str(math.floor(colindancia_ufin.area)),
        'perimetro': str(math.floor(colindancia_ufin.perimetro)),
        'numeroManzana': colindancia_ufin.numero_manzana,
        'numeroLote': colindancia_ufin.numero_lote
    },
    'acta_id': acta_id
}

        return JsonResponse(data)