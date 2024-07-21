from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import json
# from services.ApisNetPe import ApisNetPe
from .services.ApisNetPe import ApisNetPe
from .services.UbigeoPe import UbigeoPe

@method_decorator(csrf_exempt, name='dispatch')
class SearchDniPe(View):
    def post(self, request):
        content_type = request.content_type
        data = { }
        if content_type == 'application/json':
            data = json.loads(request.body)
        elif content_type == 'application/x-www-form-urlencoded':
            data = request.POST.dict()
        else:
            data = { }
        dni = data['dni']
        api = ApisNetPe()
        data = api.get_person(dni)
        return JsonResponse(data)
    def get(self, request):
        data = { 'msg': 'Welcome Dni' }
        return JsonResponse(data)

@method_decorator(csrf_exempt, name='dispatch')
class SearchUbigeosPe(View):
    def post(self, request):
        content_type = request.content_type
        data = { }
        if content_type == 'application/json':
            data = json.loads(request.body)
        elif content_type == 'application/x-www-form-urlencoded':
            data = request.POST.dict()
        else:
            data = { }
        allData = data['allData']
        if allData == True:
            api = UbigeoPe
            data = api.getAllUbigeos()
            # print(data)
        return JsonResponse(data)
    def get(self, request):
        data = { 'msg': 'Welcome Ubigeo' }
        return JsonResponse(data)