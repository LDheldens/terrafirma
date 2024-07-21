import json
from django.core.files.storage import default_storage
from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse, HttpResponseRedirect
from django.urls import reverse_lazy
from django.views.generic import TemplateView, CreateView, UpdateView, DeleteView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

# from django.core.exceptions import ObjectDoesNotExist
from core.pos.models import Acta,Posesion
from django.core.files.base import ContentFile
import base64
from django.shortcuts import get_object_or_404
from django.db import transaction
from datetime import date, datetime

class GetAllActaView(TemplateView):
    def get(self, request, *args, **kwargs):
        actas = Acta.objects.all().values()  # Obtener todas las actas como diccionarios
        return JsonResponse(list(actas), safe=False)
    
class PosesionariosPorActaListView(TemplateView):
    def get(self, request, *args, **kwargs):
        try:
            # Obtener el ID del acta de los argumentos de la URL
            acta_id = self.kwargs.get('pk')
            # Obtener todos los posecionarios asociados al acta especificada
            posecionarios = Posesion.objects.filter(acta_id=acta_id)
            # Serializar los posecionarios a formato JSON
            posecionarios_serializados = [
                {
                    'id': p.id,
                    'acta_id': p.acta_id,
                    'copia_doc_identidad': p.copia_doc_identidad,
                    'apellidos': p.apellidos,
                    'nombres': p.nombres,
                    'estadoCivil': p.estado_civil,
                    'numDoc': p.num_doc,
                    'fechaInicio': p.fecha_inicio,
                    'fechaFin': p.fecha_fin,
                    'aniosPosesion': p.anios_posesion,
                    'pdf_documento': p.pdf_documento.url if p.pdf_documento else None
                } for p in posecionarios
            ]
            # Devolver los posecionarios serializados como una respuesta JSON
            return JsonResponse({'posecionarios': posecionarios_serializados})
        except Exception as e:
            # Manejar cualquier error que pueda ocurrir durante el proceso
            return JsonResponse({'error': str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class PosesionCreateView(TemplateView):
    template_name = 'crm/posesion/create.html'
    
    def post(self, request, *args, **kwargs):
        # Depurar los datos del formulario POST
        # Obtener los datos del formulario POST
        posecionario_data = {
            'apellidos': request.POST.get('apellidos'),
            'nombres': request.POST.get('nombres'),
            'estado_civil': request.POST.get('estado_civil'),
            'num_doc': request.POST.get('num_doc'),
            'copia_doc_identidad':request.POST.get('copia_doc_identidad'),
            'fecha_inicio': request.POST.get('fecha_inicio'),
            'fecha_fin': request.POST.get('fecha_fin'),
            'anios_posesion': request.POST.get('aniosPosesion'),
            # 'mesesPosesion': request.POST.get('mesesPosesion'),
            # 'diferencia_aniosMeses': request.POST.get('diferenciaAniosMeses'),
            'acta_id': request.POST.get('acta_id'),
        }
        # Verificar si se ha subido un archivo PDF
        if 'pdf_documento' in request.FILES:
            pdf_documento = request.FILES['pdf_documento']
            posecionario_data['pdf_documento'] = pdf_documento
        # Guardar el posecionario en la base de datos
        posecionario = Posesion(**posecionario_data)
        posecionario.save()

        # Devolver una respuesta de éxito
        return JsonResponse({'message': 'El posecionario ha sido registrado exitosamente.'})
            
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Análisis de posesión'
        context['action'] = 'add'
        return context
    
@method_decorator(csrf_exempt, name='dispatch')
class PosesionUpdateView(TemplateView):
    
    def post(self, request, *args, **kwargs):
        # Obtener los datos del formulario POST
        posecionario_data = {
            'apellidos': request.POST.get('apellidos'),
            'nombres': request.POST.get('nombres'),
            'estado_civil': request.POST.get('estado_civil'),
            'num_doc': request.POST.get('num_doc'),
            'fecha_inicio': request.POST.get('fecha_inicio'),
            'fecha_fin': request.POST.get('fecha_fin'),
            'anios_posesion': request.POST.get('aniosPosesion'),
            'copia_doc_identidad':request.POST.get('copia_doc_identidad'),
            # 'otros_campos': request.POST.get('otros_campos'),
        }
        
        # Obtener el ID del posecionario a editar
        posecionario_id = kwargs.get('pk')

        # Obtener el posecionario a editar desde la base de datos
        posecionario = get_object_or_404(Posesion, pk=posecionario_id)

        # Actualizar los campos del posecionario con los nuevos datos
        for key, value in posecionario_data.items():
            setattr(posecionario, key, value)

        # Actualizar el documento adjunto si se proporciona uno nuevo
        if request.FILES.get('pdf_documento'):
            posecionario.pdf_documento = request.FILES['pdf_documento']
            if posecionario.pdf_documento:
                default_storage.delete(posecionario.pdf_documento.path)
            
        # Guardar los cambios en la base de datos
        posecionario.save()

        # Devolver una respuesta de éxito
        return JsonResponse({'message': 'El posecionario ha sido actualizado exitosamente.'})
    
@method_decorator(csrf_exempt, name='dispatch')
class PosesionDeleteView(TemplateView):
    
    def post(self, request, *args, **kwargs):
        # Obtener el ID del posecionario a eliminar desde los parámetros de la URL
        posecionario_id = self.kwargs.get('pk')

        # Obtener el posecionario a eliminar desde la base de datos
        posecionario = get_object_or_404(Posesion, pk=posecionario_id)

        # Eliminar el posecionario de la base de datos
        posecionario.delete()

        # Devolver una respuesta de éxito
        return JsonResponse({'message': 'El posecionario ha sido eliminado exitosamente.'})