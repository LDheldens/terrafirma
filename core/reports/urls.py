from django.urls import path
from .views.sale_report.views import SaleReportView
from .views.ctascollect_report.views import CtasCollectReportView


urlpatterns = [
    path('sale/', SaleReportView.as_view(), name='sale_report'),
    path('ctas/collect/', CtasCollectReportView.as_view(), name='ctascollect_report'),
]
