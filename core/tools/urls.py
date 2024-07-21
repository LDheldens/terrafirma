from django.urls import path
from .views import SearchDniPe, SearchUbigeosPe

urlpatterns = [
    path('search-dni-pe/', SearchDniPe.as_view(), name='search-dni-pe'),
    path('search-all-ubigeos-pe/', SearchUbigeosPe.as_view(), name='search-all-ubigeos-pe'),
]