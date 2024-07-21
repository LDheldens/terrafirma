from django.urls import path

from core.pos.views.crm.company.views import CompanyUpdateView
from core.pos.views.crm.sale.admin.views import *
from core.pos.views.crm.sale.client.views import SaleClientListView
from core.pos.views.frm.ctascollect.views import *
from core.pos.views.scm.product.views import *
from core.pos.views.scm.category.views import *
from core.pos.views.crm.client.views import *
from core.pos.views.crm.ficha_udd.views import *
from core.pos.views.crm.colindantes.views import *
from core.pos.views.crm.acta.view import *
from core.pos.views.crm.titular.view import *
from core.pos.views.crm.ficha_udd.views import *
from core.pos.views.crm.posesion.views import *
from core.pos.views.crm.ufit.views import *
from core.pos.views.crm.dashboard.views import *
from core.pos.views.crm.sale.print.views import *

urlpatterns = [
    # company
    path('crm/company/update/', CompanyUpdateView.as_view(), name='company_update'),
    # category
    path('scm/category/', CategoryListView.as_view(), name='category_list'),
    path('scm/category/add/', CategoryCreateView.as_view(), name='category_create'),
    path('scm/category/update/<int:pk>/', CategoryUpdateView.as_view(), name='category_update'),
    path('scm/category/delete/<int:pk>/', CategoryDeleteView.as_view(), name='category_delete'),
    # product
    path('scm/product/', ProductListView.as_view(), name='product_list'),
    path('scm/product/add/', ProductCreateView.as_view(), name='product_create'),
    path('scm/product/update/<int:pk>/', ProductUpdateView.as_view(), name='product_update'),
    path('scm/product/delete/<int:pk>/', ProductDeleteView.as_view(), name='product_delete'),
    path('scm/product/export/excel/', ProductExportExcelView.as_view(), name='product_export_excel'),
    # ctascollect
    path('frm/ctas/collect/', CtasCollectListView.as_view(), name='ctascollect_list'),
    path('frm/ctas/collect/add/', CtasCollectCreateView.as_view(), name='ctascollect_create'),
    path('frm/ctas/collect/delete/<int:pk>/', CtasCollectDeleteView.as_view(), name='ctascollect_delete'),
    path('frm/ctas/collect/print/voucher/<int:pk>/', PaymentPrintVoucherView.as_view(), name='ctas_collect_print_ticket'),
    # client
    path('crm/client/', ClientListView.as_view(), name='client_list'),
    path('crm/client/add/', ClientCreateView.as_view(), name='client_create'),
    path('crm/client/update/<int:pk>/', ClientUpdateView.as_view(), name='client_update'),
    path('crm/client/delete/<int:pk>/', ClientDeleteView.as_view(), name='client_delete'),
    path('crm/client/update/profile/', ClientUpdateProfileView.as_view(), name='client_update_profile'),
    # sale/admin
    path('crm/sale/admin/', SaleAdminListView.as_view(), name='sale_admin_list'),
    path('crm/sale/admin/add/', SaleAdminCreateView.as_view(), name='sale_admin_create'),
    path('crm/sale/admin/delete/<int:pk>/', SaleAdminDeleteView.as_view(), name='sale_admin_delete'),
    path('crm/sale/print/voucher/<int:pk>/', SalePrintVoucherView.as_view(), name='sale_print_ticket'),
    path('crm/sale/client/', SaleClientListView.as_view(), name='sale_client_list'),
    # Titular
    path('crm/titular/', TitularListView.as_view(), name='titular_list'),
    path('crm/titular/add/', TitularCreateView.as_view(), name='titular_create'),
    path('crm/titular/update/<int:pk>/', TitularUpdateView.as_view(), name='titular_update'),
    path('crm/titular/delete/<int:pk>/', TitularDeleteView.as_view(), name='titular_delete'),
    
    #acta - titulares
    path('crm/acta/<int:acta_id>/titulares/', TitularesPorActaListView.as_view(), name='titulares_por_acta'),


    #actas
    path('crm/acta/', ActaListView.as_view(), name='acta_list'),
    path('crm/acta/<int:pk>/', ActaView.as_view(), name='acta'),
    path('crm/acta/add/', ActaCreateView.as_view(), name='acta_create'),
    path('crm/acta/update/<int:pk>/', ActaUpdateView.as_view(), name='acta_update'),

    path('crm/acta/delete/<int:pk>/', ActaDeleteView.as_view(), name='acta_delete'),
    path('crm/search/predio/', PredioSearchView.as_view(), name='search_predio'),
    #obtener todas las actas para hacer el buscador por codigo
    path('api/actas/', GetAllActaView.as_view(), name='get_all_actas'),
    
    #acta - posecionarios
    path('crm/acta/<int:pk>/posecionarios/', PosesionariosPorActaListView.as_view(), name='posesionarios_por_acta'),
    
    #UDD 
    path('crm/ficha_udd/', FichaUddListView.as_view(), name='ficha_udd_list'),
    path('crm/ficha_udd2/', FichaUddListView.as_view(), name='ficha_udd_list2'),
    path('crm/ficha_udd/add', FichaUddCreateView.as_view(), name='ficha_udd_create'),
    path('crm/ficha_udd/update/<int:pk>/', FichaUddUpdateView.as_view(), name='ficha_udd_update'),
    path('crm/ficha/<int:pk>/login', LoginFichaView.as_view(), name='ficha_udd_login'),
    path('crm/ficha_udd/delete/<int:pk>/', FichaUddDeleteView.as_view(), name='ficha_udd_delete'),
    path('crm/ficha_udd/count/', FichaUddHighestIdView.as_view(), name='ficha_udd_count'),

    #UFIN - posesión
    path('crm/acta/posesion/add',PosesionCreateView.as_view(),name='posesion_add'),
    path('crm/acta/posesion/update/<int:pk>/',PosesionUpdateView.as_view(),name='posesion_edit'),
    path('crm/acta/posesion/delete/<int:pk>/',PosesionDeleteView.as_view(),name='posesion_delete'),
    
    #UFIT
    path('crm/ufit/add',UfitCreateView.as_view(),name='ufit_create'),
    path('crm/ufit/',UfitListView.as_view(),name='ufit_list'),
    path('crm/ufit/update/<int:pk>/',UfitUpdateView.as_view(),name='ufit_update'),
    path('crm/ufit/delete/<int:pk>/',UfitDeleteView.as_view(),name='ufit_delete'),
    path('crm/ufit/acta/<int:pk>/', ColindanciaUfinDetailView.as_view(), name='colindanciaufin_detail'),

    
    # colindancia
    path('crm/acta/<int:pk>/colindancia/', ObtenerColindanciaActaView.as_view(), name='colindancia_por_acta'),
    path('crm/acta/colindancia/add',ColindanciaCreateView.as_view(),name='colindancia_add'),
    path('crm/acta/colindancia/update/<int:pk>/',ColindanciaUpdateView.as_view(),name='colindancia_edit'),
    
    # Dashboard
    path('crm/dashboard/',DashboardView.as_view(),name='dashboard_general'),
    path('crm/porcentaje_llenado/acta/', PorcentajeLlenadoActaView.as_view(), name='porcentaje_llenado_acta'),
    
    path('crm/porcentaje_llenado/posesion-informal/', PorcentajeLlenadoPosesionInformalView.as_view(), name='porcentaje_llenado_posesion_informal'),
    
    
    
]
