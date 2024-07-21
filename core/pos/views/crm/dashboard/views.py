from django.views.generic import TemplateView
from core.pos.models import PosesionInformal, Acta, Posesion, Titular, Colindancia, ColindanciaUfin, ImagenActa
from django.http import JsonResponse
from django.views.generic import View
from django.db.models import Avg

class DashboardView(TemplateView):
    template_name = 'crm/dashboard/index.html'

    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Obtener la cantidad de actas y posesiones informales
        cantidad_actas = Acta.objects.count()
        cantidad_posesiones_informales = PosesionInformal.objects.count()
        cantidad_posesiones = Posesion.objects.count()
        cantidad_titulares = Titular.objects.count()
        cantidad_colindancias = Colindancia.objects.count()
        cantidad_colindancias_ufin = ColindanciaUfin.objects.count()
        
        # Pasar los datos al contexto
        context['cantidad_actas'] = cantidad_actas
        context['cantidad_posesiones_informales'] = cantidad_posesiones_informales
        context['cantidad_posesiones'] = cantidad_posesiones
        context['cantidad_titulares'] = cantidad_titulares
        context['cantidad_colindancias'] = cantidad_colindancias
        context['cantidad_colindancias_ufin'] = cantidad_colindancias_ufin
        
        return context

class PorcentajeLlenadoActaView(View):
    def get(self, request, *args, **kwargs):
        # Obtener todos los objetos de Acta
        actas = Acta.objects.all()
        # Calcular el promedio del porcentaje llenado manualmente
        total_porcentaje = sum(acta.calcular_porcentaje_llenado() for acta in actas)
        promedio_porcentaje_llenado = total_porcentaje / len(actas) if len(actas) > 0 else 0
        return JsonResponse({'promedio_porcentaje_llenado': promedio_porcentaje_llenado})

class PorcentajeLlenadoPosesionInformalView(View):
    def get(self, request, *args, **kwargs):
        # Obtener todos los objetos de PosesionInformal
        posesiones_informales = PosesionInformal.objects.all()
        # Calcular el promedio del porcentaje llenado manualmente
        total_porcentaje = sum(pos_informal.calcular_porcentaje_llenado() for pos_informal in posesiones_informales)
        promedio_porcentaje_llenado = total_porcentaje / len(posesiones_informales) if len(posesiones_informales) > 0 else 0
        return JsonResponse({'promedio_porcentaje_llenado': promedio_porcentaje_llenado})