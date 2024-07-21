from datetime import datetime

from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Sum, FloatField
from django.db.models.functions import Coalesce
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import requires_csrf_token
from django.views.generic import TemplateView

from core.pos.models import Product, Sale, Client, Category, Company, PosesionInformal
from core.reports.choices import months
from core.security.models import Dashboard


class DashboardView(LoginRequiredMixin, TemplateView):
    def get_template_names(self):
        dashboard = Dashboard.objects.filter()
        if dashboard.exists():
            if dashboard[0].layout == 1:
                return 'vtcpanel.html'
        return 'hztpanel.html'

    def get(self, request, *args, **kwargs):
        request.user.set_group_session()
        return super().get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Panel de administración'
        context['company'] = Company.objects.first()
        context['clients'] = Client.objects.all().count()
        context['matrix'] = PosesionInformal.objects.all().count()
        context['category'] = Category.objects.filter().count()
        context['product'] = Product.objects.all().count()
        context['sale'] = Sale.objects.filter().order_by('-id')[0:10]
        return context


@requires_csrf_token
def error_404(request, exception):
    return render(request, '404.html', {})


@requires_csrf_token
def error_500(request, exception):
    return render(request, '500.html', {})
