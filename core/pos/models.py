import math
import os
import re
from datetime import datetime
from django.utils import timezone
import base64

from os.path import basename
from django.db import models
from django.db.models import FloatField
from django.db.models import Sum
from django.db.models.functions import Coalesce
from django.forms import model_to_dict

from config import settings
from core.pos.choices import payment_condition, payment_method, voucher
from core.user.models import User

# from django.core.files.base import ContentFile

class Company(models.Model):
    name = models.CharField(max_length=50, verbose_name='Nombre')
    ruc = models.CharField(max_length=13, verbose_name='Ruc')
    address = models.CharField(max_length=200, verbose_name='Dirección')
    mobile = models.CharField(max_length=10, verbose_name='Teléfono celular')
    phone = models.CharField(max_length=9, verbose_name='Teléfono convencional')
    email = models.CharField(max_length=50, verbose_name='Email')
    website = models.CharField(max_length=250, verbose_name='Página web')
    desc = models.CharField(max_length=500, null=True, blank=True, verbose_name='Descripción')
    image = models.ImageField(null=True, blank=True, upload_to='company/%Y/%m/%d', verbose_name='Logo')
    igv = models.DecimalField(default=0.00, decimal_places=2, max_digits=9, verbose_name='Igv')

    def __str__(self):
        return self.name

    def get_image(self):
        if self.image:
            return '{}{}'.format(settings.MEDIA_URL, self.image)
        return '{}{}'.format(settings.STATIC_URL, 'img/default/empty.png')

    def get_igv(self):
        return format(self.igv, '.2f')

    def toJSON(self):
        item = model_to_dict(self)
        return item

    class Meta:
        verbose_name = 'Empresa'
        verbose_name_plural = 'Empresas'
        default_permissions = ()
        permissions = (
            ('view_company', 'Can view Company'),
        )
        ordering = ['-id']


class Category(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name='Nombre')
    inventoried = models.BooleanField(default=True, verbose_name='¿Es inventariado?')

    def __str__(self):
        return '{} / {}'.format(self.name, self.get_inventoried())

    def get_inventoried(self):
        if self.inventoried:
            return 'Inventariado'
        return 'No inventariado'

    def toJSON(self):
        item = model_to_dict(self)
        return item

    class Meta:
        verbose_name = 'Categoria'
        verbose_name_plural = 'Categorias'
        ordering = ['-id']

class Product(models.Model):
    name = models.CharField(max_length=150, verbose_name='Nombre')
    category = models.ForeignKey(Category, on_delete=models.PROTECT, verbose_name='Categoría')
    price = models.DecimalField(max_digits=9, decimal_places=2, default=0.00, verbose_name='Precio de Compra')
    pvp = models.DecimalField(max_digits=9, decimal_places=2, default=0.00, verbose_name='Precio de Venta')
    # image = models.ImageField(upload_to='product/%Y/%m/%d', verbose_name='Imagen', null=True, blank=True)

    def __str__(self):
        return self.name

    def toJSON(self):
        item = {
            'id': self.id,
            'name': self.name,
            'pvp':format(self.pvp, '.2f'),
            'category': self.category.name if self.category else "",  # Solo el nombre de la categoría si existe
            'cant': 1,  # Ejemplo de cantidad, reemplazar con el valor real
            'price': format(self.price, '.2f'),
            'sub': format(self.pvp * 1, '.2f'),  # Subtotal calculado
            'dsct': 0,  # Ejemplo de descuento, reemplazar con el valor real
            'total_dsct': 0,  # Ejemplo de valor de descuento, reemplazar con el valor real
            'tot': format(self.pvp * 1, '.2f'),  # Ejemplo de subtotal final, reemplazar con el valor real
        }
        return item
    
    class Meta:
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'
        ordering = ['-name']


class Client(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    mobile = models.CharField(max_length=9, unique=True, verbose_name='Teléfono')
    address = models.CharField(max_length=500, null=True, blank=True, verbose_name='Dirección')

    def __str__(self):
        return '{} / {}'.format(self.user.get_full_name(), self.user.dni)

    def birthdate_format(self):
        return self.birthdate.strftime('%Y-%m-%d')

    def toJSON(self):
        item = model_to_dict(self)
        item['user'] = self.user.toJSON()
        # item['birthdate'] = self.birthdate.strftime('%Y-%m-%d')
        return item

    class Meta:
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
        ordering = ['-id']


class Sale(models.Model):
    client = models.ForeignKey(Client, on_delete=models.PROTECT, null=True, blank=True)
    employee = models.ForeignKey(User, on_delete=models.PROTECT, null=True, blank=True)
    payment_condition = models.CharField(choices=payment_condition, max_length=50, default='contado')
    payment_method = models.CharField(choices=payment_method, max_length=50, default='efectivo')
    type_voucher = models.CharField(choices=voucher, max_length=50, default='ticket')
    date_joined = models.DateField(default=datetime.now)
    end_credit = models.DateField(default=datetime.now)
    subtotal = models.DecimalField(max_digits=9, decimal_places=2, default=0.00)
    dscto = models.DecimalField(max_digits=9, decimal_places=2, default=0.00)
    total_dscto = models.DecimalField(max_digits=9, decimal_places=2, default=0.00)
    igv = models.DecimalField(max_digits=9, decimal_places=2, default=0.00)
    total_igv = models.DecimalField(max_digits=9, decimal_places=2, default=0.00)
    total = models.DecimalField(max_digits=9, decimal_places=2, default=0.00)
    initial = models.DecimalField(max_digits=9, decimal_places=2, default=0.00)
    cash = models.DecimalField(max_digits=9, decimal_places=2, default=0.00)
    change = models.DecimalField(max_digits=9, decimal_places=2, default=0.00)
    card_number = models.CharField(max_length=30, null=True, blank=True)
    titular = models.CharField(max_length=30, null=True, blank=True)
    amount_debited = models.DecimalField(max_digits=9, decimal_places=2, default=0.00)
    predio = models.ForeignKey('pos.Acta',on_delete=models.PROTECT, null=True)


        
    def __str__(self):
        return f'{self.client.user.get_full_name()} / {self.nro()}'

    def nro(self):
        return format(self.id, '06d')

    def get_client(self):
        if self.client:
            return self.client.toJSON()
        return {}

    def card_number_format(self):
        if self.card_number:
            cardnumber = self.card_number.split(' ')
            convert = re.sub('[0-9]', 'X', ' '.join(cardnumber[1:]))
            return '{} {}'.format(cardnumber[0], convert)
        return self.card_number

    def toJSON(self):
        item = model_to_dict(self, exclude=[''])
        item['nro'] = format(self.id, '06d')
        item['card_number'] = self.card_number_format()
        item['date_joined'] = self.date_joined.strftime('%Y-%m-%d')
        item['end_credit'] = self.end_credit.strftime('%Y-%m-%d')
        item['employee'] = {} if self.employee is None else self.employee.toJSON()
        item['client'] = {} if self.client is None else self.client.toJSON()
        item['payment_condition'] = {'id': self.payment_condition, 'name': self.get_payment_condition_display()}
        item['payment_method'] = {'id': self.payment_method, 'name': self.get_payment_method_display()}
        item['type_voucher'] = {'id': self.type_voucher, 'name': self.get_type_voucher_display()}
        item['subtotal'] = '{:.2f}'.format(self.subtotal)
        item['dscto'] = '{:.2f}'.format(self.dscto)
        item['total_dscto'] = '{:.2f}'.format(self.total_dscto)
        item['igv'] = '{:.2f}'.format(self.igv)
        item['total_igv'] = '{:.2f}'.format(self.total_igv)
        item['total'] = '{:.2f}'.format(self.total)
        item['cash'] = '{:.2f}'.format(self.cash)
        item['change'] = '{:.2f}'.format(self.change)
        item['amount_debited'] = '{:.2f}'.format(self.amount_debited)
        item['initial'] = '{:.2f}'.format(self.initial)  
        return item

    def calculate_invoice(self):
        subtotal = 0.00
        for d in self.saledetail_set.filter():
            d.subtotal = float(d.price) * int(d.cant)
            d.total_dscto = float(d.dscto) * float(d.subtotal)
            d.total = d.subtotal - d.total_dscto
            d.save()
            subtotal += d.total
        self.subtotal = subtotal
        self.total_igv = self.subtotal * float(self.igv)
        self.total_dscto = self.subtotal * float(self.dscto)
        self.total = float(self.subtotal) - float(self.total_dscto) + float(self.total_igv)
        self.save()

    def delete(self, using=None, keep_parents=False):
        try:
            for i in self.saledetail_set.filter(product__category__inventoried=True):
                i.product.save()
                i.delete()
        except:
            pass
        super(Sale, self).delete()

    class Meta:
        verbose_name = 'Venta'
        verbose_name_plural = 'Ventas'
        default_permissions = ()
        permissions = (
            ('view_sale', 'Can view Ventas'),
            ('add_sale', 'Can add Ventas'),
            ('delete_sale', 'Can delete Ventas'),
        )
        ordering = ['-id']


class SaleDetail(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    cant = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=9, decimal_places=2, default=0.00)
    subtotal = models.DecimalField(max_digits=9, decimal_places=2, default=0.00)
    dscto = models.DecimalField(max_digits=9, decimal_places=2, default=0.00)
    total_dscto = models.DecimalField(max_digits=9, decimal_places=2, default=0.00)
    total = models.DecimalField(max_digits=9, decimal_places=2, default=0.00)

    def __str__(self):
        return self.product.name

    def toJSON(self):
        item = model_to_dict(self, exclude=['sale'])
        item['product'] = self.product.toJSON()
        item['price'] = format(self.price, '.2f')
        item['dscto'] = format(self.dscto, '.2f')
        item['total_dscto'] = format(self.total_dscto, '.2f')
        item['subtotal'] = format(self.subtotal, '.2f')
        item['total'] = format(self.total, '.2f')
        return item

    class Meta:
        verbose_name = 'Detalle de Venta'
        verbose_name_plural = 'Detalle de Ventas'
        default_permissions = ()
        ordering = ['-id']


class CtasCollect(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.PROTECT)
    date_joined = models.DateField(default=datetime.now)
    end_date = models.DateField(default=datetime.now)
    debt = models.DecimalField(max_digits=9, decimal_places=2, default=0.00)
    saldo = models.DecimalField(max_digits=9, decimal_places=2, default=0.00)
    state = models.BooleanField(default=True)

    # def __str__(self):
    #     return '{} / {} / ${}'.format(self.sale.client.user.get_full_name(), self.date_joined.strftime('%Y-%m-%d'),
    #                                   format(self.debt, '.2f'))
    def __str__(self):
        return f'{self.sale.client.user.get_full_name()}  |  {self.date_joined.strftime("%Y-%m-%d")}  |  S/. {self.debt:.2f}  |  Saldo: S/. {self.saldo:.2f} '


    def validate_debt(self):
        try:
            saldo = self.paymentsctacollect_set.aggregate(resp=Coalesce(Sum('valor'), 0.00, output_field=FloatField())).get('resp')
            self.saldo = float(self.debt) - float(saldo)
            self.state = self.saldo > 0.00
            self.save()
        except:
            pass

    def toJSON(self):
        item = model_to_dict(self)
        item['sale'] = self.sale.toJSON()
        item['date_joined'] = self.date_joined.strftime('%Y-%m-%d')
        item['end_date'] = self.end_date.strftime('%Y-%m-%d')
        item['debt'] = float(self.debt)
        item['saldo'] = float(self.saldo)
        item['payment_count'] = self.paymentsctacollect_set.count()
        return item


    class Meta:
        verbose_name = 'Cuenta por cobrar'
        verbose_name_plural = 'Cuentas por cobrar'
        default_permissions = ()
        permissions = (
            ('view_ctascollect', 'Can view Cuentas por cobrar'),
            ('add_ctascollect', 'Can add Cuentas por cobrar'),
            ('delete_ctascollect', 'Can delete Cuentas por cobrar'),
        )
        ordering = ['-id']


class PaymentsCtaCollect(models.Model):
    ctascollect = models.ForeignKey(CtasCollect, on_delete=models.CASCADE)
    date_joined = models.DateField(default=datetime.now, verbose_name='Fecha de registro')
    desc = models.CharField(max_length=500, null=True, blank=True, verbose_name='Detalles')
    valor = models.DecimalField(max_digits=9, decimal_places=2, default=0.00, verbose_name='Valor')
    paymentNumber = models.IntegerField(default=1, verbose_name='Número de pago')

    def __str__(self):
        return f'Pago {self.id} para CtaCollect {self.ctascollect.id}'

    def toJSON(self):
        item = model_to_dict(self, exclude=['ctascollect'])
        item['date_joined'] = self.date_joined.strftime('%Y-%m-%d')
        item['valor'] = format(self.valor, '.2f')
        return item

    class Meta:
        verbose_name = 'Pago Cuenta por cobrar'
        verbose_name_plural = 'Pagos Cuentas por cobrar'
        default_permissions = ()
        ordering = ['-id']

# ------- MODELOS XDD -------# 

class PosesionInformal(models.Model):
    #datos posecion informal
    fecha = models.DateField()
    codigo = models.CharField(max_length=100, unique=True)
    departamento = models.CharField(max_length=100)
    provincia = models.CharField(max_length=100)
    distrito = models.CharField(max_length=100)
    coordenada_x = models.DecimalField(max_digits=30, decimal_places=4, blank=True, null=True) 
    coordenada_y = models.DecimalField(max_digits=30, decimal_places=4, blank=True, null=True)
    tipo_posecion_informal = models.CharField(max_length=100)
    denominacion_segun_inei= models.CharField(max_length=200)
    #forma de asentamiento
    tipo_matriz = models.CharField(max_length = 150)
    contexto_legal = models.CharField(max_length = 150)
    aciones_de_formalizacion = models.CharField(max_length = 150)
    #accesibilidad
    tipo_calzada = models.CharField(max_length = 150)
    tipo_calzada_distancia = models.DecimalField(max_digits=6, decimal_places=3, blank=True, null=True)
    referencia_local = models.CharField(max_length=200)
    referencia_local_tiempo = models.TimeField()
    ruta = models.CharField(max_length = 100)
    ruta_especifica = models.CharField(max_length = 200)
    #configuracion urbana
    tipo_configuracion_urbana = models.CharField(max_length=20)
    numero_lotes = models.IntegerField(blank=True, null=True)
    numero_manzanas = models.IntegerField(blank=True, null=True)
    porcentaje_vivencia = models.DecimalField(max_digits=6, decimal_places=3, blank=True, null=True)
    equipamientos = models.JSONField()
    material_predominante = models.JSONField()
    servicios_basicos = models.JSONField()
    #zonificacion_municipal
    zonificacion_municipal = models.BooleanField(default=True)
    #areas restringidas y/o formas de dominio
    zonas_reservadas = models.CharField(max_length=200)
    zonas_arquelogicas_o_reservas = models.BooleanField()
    zonas_a_o_r_nombre = models.CharField(null=True, blank=True,max_length=200)
    zonas_a_o_r_ubicacion = models.CharField(null=True, blank=True,max_length=200)
    zonas_arquelogicas_o_reservas_pdf = models.FileField(upload_to='posesion_informal/archivos', blank=True, null=True)

    zonas_riesgo = models.BooleanField()
    zonas_riesgo_nombre = models.CharField(null=True, blank=True,max_length=200)
    zonas_riesgo_ubicacion = models.CharField(null=True, blank=True,max_length=200)
    zonas_riesgo_pdf = models.FileField(upload_to='posesion_informal/archivos', null=True)

    conceciones_mineras = models.CharField(max_length=100)
    canales_postes_cables = models.TextField(max_length=500)
    posibles_propietarios = models.TextField(max_length=500)
    otros = models.CharField(null=True, blank=True, max_length=200)
    #conflictos dirigenciales
    conflictos_dirigenciales = models.BooleanField()
    conflictos_dirigenciales_nombre = models.TextField(max_length=300)
    conflictos_dirigenciales_pdf = models.FileField(upload_to='posesion_informal/archivos', null=True)
    conflictos_dirigenciales_comentarios = models.TextField(max_length=300)
    #conflictos judiciales
    conflictos_judiciales = models.BooleanField()
    conflictos_judiciales_descripcion = models.TextField(max_length=300)
    #imagen satelital de lamposecion informal
    imagen_satelital_pdf = models.FileField(upload_to='posesion_informal/archivos', null=True)
    #comentario u observaciones
    comentarios_observaciones = models.TextField(max_length=300)
    is_matriz = models.BooleanField(default=False)
    predios_habitados = models.IntegerField(blank=True, null=True)
    # is_matriz = models.BooleanField(default=False)
    def calcular_porcentaje_llenado(self):
        total_campos = len(self._meta.fields) - 1  # Excluir el campo 'id'
        if total_campos == 0:
            return 0  # Manejar el caso de que no haya campos para evitar división por cero
        campos_llenos = sum(1 for field in self._meta.fields if getattr(self, field.name))

        return (campos_llenos / total_campos) * 100
    
    def toJSON(self):
        # Crear un diccionario con todos los campos, excluyendo los campos JSON
        exclude_fields = [
            'equipamientos',
            'material_predominante',
            'servicios_basicos',
            'zonas_arquelogicas_o_reservas_pdf',
            'zonas_riesgo_pdf',
            'conflictos_dirigenciales_pdf',
            'imagen_satelital_pdf',
            ]
        item = model_to_dict(self, exclude=exclude_fields)
        item['porcentaje_llenado'] = self.calcular_porcentaje_llenado()
        return item

class Acta(models.Model):
    posesion_informal = models.ForeignKey(PosesionInformal, related_name='actas', on_delete=models.CASCADE)
    # INICIAL
    codigo_predio = models.CharField(max_length = 150, unique=True)
    fecha = models.DateField()
    cel_wsp = models.CharField(max_length=20)
    # 1.- DATOS DE LA POSESIÓN INFORMAL
    # departamento = models.CharField(max_length=100)
    # provincia = models.CharField(max_length=100)
    # distrito = models.CharField(max_length=100)
    # posesion_informal = models.CharField(max_length=200)
    # sector = models.CharField(max_length=100)
    # etapa = models.CharField(max_length=10)
    # 2.- IDENTIFICACIÓN DEL PREDIO
    direccion_fiscal = models.CharField(max_length=20)
    descripcion_fisica = models.CharField(max_length=20)
    descripcion_fisica_otros = models.CharField(max_length=20)
    tipo_uso = models.CharField(max_length=20)
    tipo_uso_otros = models.CharField(max_length=20)
    servicios_basicos = models.JSONField()
    # 3.- DATOS DE(LOS) TITULAR(ES)/REPRESENTANTE(S)
    # 4.- BOCETO DEL PREDIO
    hitos_consolidados = models.CharField(max_length=10)
    acceso_a_via = models.CharField(max_length=10)
    requiere_subdivision = models.CharField(max_length=10)
    cantidad_lotes = models.IntegerField(blank=True, null=True)
    requiere_alineamiento = models.CharField(max_length=10)
    apertura_de_via = models.CharField(max_length=10)
    libre_de_riesgo = models.CharField(max_length=10)
    req_transf_de_titular = models.CharField(max_length=10)
    litigio_denuncia = models.CharField(max_length=10)
    area_segun_el_titular_representante = models.FloatField(blank=True, null=True)
    comentario1 = models.TextField()
    # carta_poder = models.CharField(null=True, blank=True,max_length=10)
    # 5.- DEL LEVANTAMIENTO TOPOGRÁFICO:
    codigo_dlt = models.CharField(max_length=50,blank=True, null=True)
    hora = models.TimeField()
    n_punto = models.IntegerField(blank=True, null=True)
    tiempo_atmosferico = models.CharField(max_length = 20)
    # operador = models.CharField(max_length=100)
    # equipo_tp = models.CharField(max_length=100)
    # comentario con respecto al predio
    comentario2 = models.TextField()
    # 6.- DE LOS TITULAR(ES) O REPRESENTATE(S)
    # Aquí solo hay texto
    # 7.- DE LAS AUTORIDADES Y/O MIEMBROS DE COMISIÓN DESIGNADOS:
    # Aquí solo hay texto
    # 8.- ADICIONALES:
    casos_toma_predio = models.CharField(max_length=4)
    descripcion_toma_predio = models.TextField()
    # 9.- FIRMA DEL OPERADOR TOPOGRÁFICO, REPRESENTANTE DE LA COMISIÓN Y SUPERVISOR DE CAMPO
    comentario3 = models.TextField()
    
    def calcular_porcentaje_llenado(self):
        total_campos = len(self._meta.fields) - 1  # Excluir el campo 'id'
        if total_campos == 0:
            return 0  # Manejar el caso de que no haya campos para evitar división por cero
        campos_llenos = sum(1 for field in self._meta.fields if getattr(self, field.name) or getattr(self, field.name) == 0)
        return (campos_llenos / total_campos) * 100

    
    def toJSON(self):
        # Obtener el primer titular asociado a esta acta
        primer_titular = self.titulares.first()
        # Obtener el número total de titulares asociados a esta acta
        num_titulares = self.titulares.count()
        # Convertir la fecha y la hora en formato deseado
        fecha_str = self.fecha.strftime('%Y-%m-%d')
        hora_str = self.hora.strftime('%Y-%m-%d')
        
        # Crear un diccionario con los datos del acta y los datos del primer titular
        item = model_to_dict(self, exclude=["titulares"])
        item['porcentaje_llenado'] = self.calcular_porcentaje_llenado()
        item['fecha'] = fecha_str
        item['hora'] = hora_str
        # item['area_segun_el_titular_representante'] = float(self.area_segun_el_titular_representante)
        item['primer_titular'] = f"{primer_titular.nombres} {primer_titular.apellidos}" if primer_titular else None
        item['num_titulares'] = num_titulares
        
        return item

class Posesion(models.Model):
    acta = models.ForeignKey(Acta, related_name='posesionarios', on_delete=models.CASCADE, null=True, blank=True)
    copia_doc_identidad = models.CharField(max_length=3, default='no')
    apellidos = models.CharField(max_length=100)
    nombres = models.CharField(max_length=100)
    estado_civil = models.CharField(max_length=20)
    num_doc = models.CharField(max_length=20)
    fecha_inicio = models.DateField(blank=True, null=True)
    fecha_fin = models.DateField(blank=True, null=True)
    anios_posesion = models.IntegerField(default=1)
    pdf_documento = models.FileField(upload_to='posesion/', blank=True, null=True)


class Titular(models.Model):
    copia_doc_identidad = models.CharField(max_length=3, default='no')
    apellidos = models.CharField(max_length=100)
    nombres = models.CharField(max_length=100)
    estado_civil = models.CharField(max_length=20)
    num_doc = models.CharField(max_length=20)
    pdf_documento = models.FileField(upload_to='titulares/', blank=True, null=True)
    acta = models.ForeignKey(Acta, related_name='titulares', on_delete=models.CASCADE, null=True, blank=True)
    representante = models.CharField(max_length=4)
    observaciones = models.TextField(blank=True, null=True)

    def toJSON(self):
        return {
            'id': self.id,
            'copia_doc_identidad': self.copia_doc_identidad,
            'apellidos': self.apellidos,
            'nombres': self.nombres,
            'estado_civil': self.estado_civil,
            'num_doc': self.num_doc,
        }

class Colindancia(models.Model):
    acta = models.OneToOneField(Acta, on_delete=models.CASCADE, related_name='colindancia')
    frente_nombre = models.CharField(max_length=100)
    frente_distancia = models.DecimalField(max_digits=10, decimal_places=2)
    frente_direccion = models.CharField(max_length=1, blank=True, null=True)
    derecha_nombre = models.CharField(max_length=100)
    derecha_distancia = models.DecimalField(max_digits=10, decimal_places=2)
    derecha_direccion = models.CharField(max_length=1, blank=True, null=True)
    fondo_nombre = models.CharField(max_length=100)
    fondo_distancia = models.DecimalField(max_digits=10, decimal_places=2)
    fondo_direccion = models.CharField(max_length=1, blank=True, null=True)
    izquierda_nombre = models.CharField(max_length=100)
    izquierda_distancia = models.DecimalField(max_digits=10, decimal_places=2)
    izquierda_direccion = models.CharField(max_length=1, blank=True, null=True)
    area = models.DecimalField(max_digits=10, decimal_places=2,blank=True, null=True)
    perimetro = models.DecimalField(max_digits=10, decimal_places=2,blank=True, null=True)
    

class ColindanciaUfin(models.Model):
    acta = models.OneToOneField(Acta, on_delete=models.CASCADE, related_name='colindancia_ufin')
    frente_descripcion = models.CharField(max_length=100)
    frente_distancia = models.DecimalField(max_digits=10, decimal_places=2)
    frente_n_tramos = models.IntegerField()
    frente_tramos = models.JSONField()
    derecha_descripcion = models.CharField(max_length=100)
    derecha_distancia = models.DecimalField(max_digits=10, decimal_places=2)
    derecha_n_tramos = models.IntegerField()
    derecha_tramos = models.JSONField()
    izquierda_descripcion = models.CharField(max_length=100)
    izquierda_distancia = models.DecimalField(max_digits=10, decimal_places=2)
    izquierda_n_tramos = models.IntegerField()
    izquierda_tramos = models.JSONField()
    fondo_descripcion = models.CharField(max_length=100)
    fondo_distancia = models.DecimalField(max_digits=10, decimal_places=2)
    fondo_n_tramos = models.IntegerField()
    fondo_tramos = models.JSONField()
    numero_lote = models.CharField(max_length = 150)
    numero_manzana = models.CharField(max_length = 150)
    area = models.DecimalField(max_digits=10, decimal_places=2)
    perimetro = models.DecimalField(max_digits=10, decimal_places=2)
    
    def toJSON(self):
        item = model_to_dict(self)
        item['acta_codigo'] = self.acta.codigo_predio 
        return item
    

class ImagenActa(models.Model):
    acta = models.ForeignKey(Acta, on_delete=models.CASCADE, related_name='imagenes')
    boceto_pdf = models.FileField(upload_to='acta/archivos', null=True)
    toma_predio_imagen = models.ImageField(upload_to='acta/imagenes/', null=True)
    documento_predio_pdf = models.FileField(upload_to='acta/archivos/', null=True)
    archivo_firmas_pdf = models.FileField(upload_to='acta/archivos', null=True)
    comentario3 = models.TextField(blank=True, null=True)