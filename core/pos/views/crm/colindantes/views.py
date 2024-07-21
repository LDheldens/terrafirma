import json
from django.shortcuts import render, get_object_or_404
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth.models import Group
from django.db import transaction
from django.http import JsonResponse, HttpResponse
from django.urls import reverse_lazy
from django.views.generic import CreateView, UpdateView, DeleteView, TemplateView
from config import settings
from core.pos.forms import ClientForm, User, Client
from core.security.mixins import ModuleMixin, PermissionMixin

from core.pos.models import Titular, Colindancia


class ObtenerColindanciaActaView(TemplateView):
    def get(self, request, *args, **kwargs):
        try:
            acta_id = self.kwargs.get('pk')
            print(acta_id,'sdsrsdrserew')
            # Buscar la colindancia asociada al acta por su ID
            colindancia = Colindancia.objects.get(acta_id=acta_id)
            colindancia_data = {}
            # Verificar si se encontró la colindancia
            if colindancia is not None:
                colindancia_data = {
                    'id': colindancia.id,
                    'acta_id': colindancia.acta_id,
                    'frente_nombre': colindancia.frente_nombre,
                    'frente_distancia': float(colindancia.frente_distancia),
                    'frente_direccion': colindancia.frente_direccion,
                    'derecha_nombre': colindancia.derecha_nombre,
                    'derecha_distancia': float(colindancia.derecha_distancia),
                    'derecha_direccion': colindancia.derecha_direccion,
                    'fondo_nombre': colindancia.fondo_nombre,
                    'fondo_distancia': float(colindancia.fondo_distancia),
                    'fondo_direccion': colindancia.fondo_direccion,
                    'izquierda_nombre': colindancia.izquierda_nombre,
                    'izquierda_distancia': float(colindancia.izquierda_distancia),
                    'izquierda_direccion': colindancia.izquierda_direccion,
                    'area':float(colindancia.area),
                    'perimetro':float(colindancia.perimetro)
                }
            # Retornar los datos como una respuesta JSON
            return JsonResponse(colindancia_data)
        except Colindancia.DoesNotExist:
            # Si no se encuentra la colindancia, retornar un objeto JSON vacío
            return JsonResponse({}, status=200)

@method_decorator(csrf_exempt, name='dispatch')
class ColindanciaCreateView(View):
    def post(self, request, *args, **kwargs):
        # Obtener los datos JSON del cuerpo de la solicitud
        data = json.loads(request.body)
        acta_id = data['acta_id']
        
        # Crear una nueva instancia de Colindancia con los datos recibidos
        colindancia = Colindancia.objects.create(
            acta_id=acta_id, 
            frente_nombre=data['frente'],
            frente_distancia=data['frente_medida'],
            frente_direccion=data['frente_direccion'],
            derecha_nombre=data['derecha'],
            derecha_distancia=data['derecha_medida'],
            derecha_direccion=data['derecha_direccion'],
            izquierda_nombre=data['izquierda'],
            izquierda_distancia=data['izquierda_medida'],
            izquierda_direccion=data['izquierda_direccion'],
            fondo_nombre=data['fondo'],
            fondo_distancia=data['fondo_medida'],
            fondo_direccion=data['fondo_direccion'],
            area = data['area'],
            perimetro = data['perimetro']
        )

        # Devolver una respuesta JSON indicando que la colindancia fue creada exitosamente
        return JsonResponse({'message': 'Colindancia creada exitosamente.'})

@method_decorator(csrf_exempt, name='dispatch')
class ColindanciaUpdateView(View):
    def post(self, request, *args, **kwargs):
        # Obtener la instancia de Colindancia que se va a actualizar
        colindancia = get_object_or_404(Colindancia, pk=kwargs.get('pk'))
        
        # Obtener los datos JSON del cuerpo de la solicitud
        data = json.loads(request.body)

        # Actualizar los campos de la instancia de Colindancia con los datos recibidos
        colindancia.frente_nombre = data['frente']
        colindancia.frente_distancia = data['frente_medida']
        colindancia.frente_direccion = data['frente_direccion']
        colindancia.derecha_nombre = data['derecha']
        colindancia.derecha_distancia = data['derecha_medida']
        colindancia.derecha_direccion = data['derecha_direccion']
        colindancia.izquierda_nombre = data['izquierda']
        colindancia.izquierda_distancia = data['izquierda_medida']
        colindancia.izquierda_direccion = data['izquierda_direccion']
        colindancia.fondo_nombre = data['fondo']
        colindancia.fondo_distancia = data['fondo_medida']
        colindancia.fondo_direccion = data['fondo_direccion']
        colindancia.area = data['area']
        colindancia.perimetro = data['perimetro']
        # Guardar los cambios en la instancia de Colindancia
        colindancia.save()
        
        # Devolver una respuesta JSON indicando que la colindancia fue actualizada exitosamente
        return JsonResponse({'message': 'Colindancia actualizada exitosamente.'})