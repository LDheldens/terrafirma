import json
from django.shortcuts import get_object_or_404
import string
import random
from django.core.files.storage import default_storage

from django.http import JsonResponse, HttpResponse
from django.urls import reverse_lazy
from django.views.generic import TemplateView, CreateView, UpdateView, DeleteView, View
from core.security.mixins import ModuleMixin, PermissionMixin
from core.pos.models import Titular, Acta, Colindancia
# vistas creadas por Daniel
class TitularListView(PermissionMixin,TemplateView):
    template_name = 'crm/titular/list.html'
    permission_required = 'view_titular'
    
    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'search':
                data = [titular.toJSON() for titular in Titular.objects.all()]
            else:
                data['error'] = 'Ha ocurrido un error'
        except Exception as e:
            data['error'] = str(e)
        return HttpResponse(json.dumps(data), content_type='application/json')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['create_url'] = reverse_lazy('titular_create')
        context['title'] = 'Listado de Titulares'
        return context

class TitularCreateView(TemplateView):
    template_name = 'crm/titular/create.html'
    success_url = reverse_lazy('titular_list')
    
    def generar_nombre_pdf(self):
        caracteres = string.ascii_letters + string.digits
        nombre_random = ''.join(random.choices(caracteres, k=20))
        numero_random = ''.join(random.choices(string.digits, k=10))
        otro_random = ''.join(random.choices(caracteres, k=10))
        nombre_pdf = f"pdf_{nombre_random}_{numero_random}_{otro_random}.pdf"
        return nombre_pdf

    def post(self, request, *args, **kwargs):
        # Obtener datos del formulario
        copia_doc_identidad = request.POST.get('copia_doc_identidad')
        apellidos = request.POST.get('apellidos')
        nombres = request.POST.get('nombres')
        estado_civil = request.POST.get('estado_civil')
        num_doc = request.POST.get('num_doc')
        pdf_documento = request.FILES.get('pdf_documento')
        observaciones = request.POST.get('observaciones')

        # generar nombre unico para el PDF
        pdf_documento.name = self.generar_nombre_pdf()

        # Obtener el ID del acta del formulario
        acta_id = request.POST.get('acta_id')
        
        # Obtener el objeto Acta correspondiente
        acta = get_object_or_404(Acta, pk=acta_id)
        
        # Crear el titular y asociarlo al acta
        titular = Titular(
            apellidos=apellidos,
            nombres=nombres,
            estado_civil=estado_civil,
            num_doc=num_doc,
            copia_doc_identidad=copia_doc_identidad,
            pdf_documento = pdf_documento,
            observaciones = observaciones
        )
        titular.save()
        
        # Asociar el titular al acta
        acta.titulares.add(titular)
        
        # Devolver una respuesta JSON para indicar que el titular se ha creado correctamente
        return JsonResponse({'message': 'Titular creado correctamente'}, status=201)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['list_url'] = self.success_url
        context['title'] = 'Nuevo registro de un Titular'
        context['action'] = 'add'
        return context
    
class TitularUpdateView(TemplateView):
    template_name = 'crm/titular/update.html'
    success_url = reverse_lazy('titular_list')

    def get_context_data(self, **kwargs):
        titular_id = kwargs['pk']
        titular = Titular.objects.get(pk=titular_id)
        context = super().get_context_data(**kwargs)
        context['title'] = 'Edición de Titular'
        context['action'] = 'edit'
        context['list_url'] = self.success_url  
        context['titular'] = titular
        return context

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            titular_id = kwargs['pk']
            titular = Titular.objects.get(pk=titular_id)
            titular.apellidos = request.POST.get('apellidos')
            titular.nombres = request.POST.get('nombres')
            titular.estado_civil = request.POST.get('estado_civil')
            titular.num_doc = request.POST.get('num_doc')

            # Actualizar el campo 'pdf_documento' si se proporciona un nuevo archivo
            if request.FILES.get('pdf_documento'):
                titular.pdf_documento = request.FILES['pdf_documento']
                if titular.pdf_documento:
                    default_storage.delete(titular.pdf_documento.path)

            # Agregar los campos adicionales
            titular.representante = request.POST.get('representante')
            titular.observaciones = request.POST.get('observaciones')

            titular.save()

            data['success'] = True
            data['message'] = 'Titular actualizado correctamente.'
        except Exception as e:
            data['success'] = False
            data['message'] = str(e)
        return JsonResponse(data)
    
class TitularDeleteView(TemplateView):
    template_name = 'crm/titular/delete.html'
    success_url = reverse_lazy('titular_list') 

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Notificación de eliminación'
        context['list_url'] = self.success_url  
        context['titular'] = Titular.objects.get(pk=kwargs.get('pk'))
        return context

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            titular_id = kwargs['pk']
            titular = Titular.objects.get(pk=titular_id)
            titular.delete()

            data['success'] = True
            data['message'] = 'Titular eliminado correctamente.'
        except Exception as e:
            data['success'] = False
            data['message'] = str(e)
        return JsonResponse(data)

class TitularesPorActaListView(View):
    def get(self, request, acta_id):
        try:
            acta = Acta.objects.get(pk=acta_id)

            titulares = acta.titulares.all()
            
            titulares_data = [
                {
                    'id': titular.id,
                    'copia_doc_identidad': titular.copia_doc_identidad,
                    'apellidos': titular.apellidos,
                    'nombres': titular.nombres,
                    'estado_civil': titular.estado_civil,
                    'num_doc': titular.num_doc,
                    'representante': titular.representante,
                } 
                for titular in titulares
            ]
            # Devolver la respuesta JSON
            return JsonResponse({'titulares': titulares_data})
        except Acta.DoesNotExist:
            return JsonResponse({'error': 'El acta especificada no existe'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)