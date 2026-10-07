from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, F, Count, Q, ExpressionWrapper, DecimalField
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from .models import Category, Supplier, Product, StockMovement, StockAlert, DeliveryOrder
from .serializers import (
    CategorySerializer,
    SupplierSerializer,
    ProductSerializer,
    StockMovementSerializer,
    StockAlertSerializer,
    DeliveryOrderSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().prefetch_related('products')
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    search_fields = ['name', 'description']


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all().prefetch_related('products')
    serializer_class = SupplierSerializer
    permission_classes = [permissions.AllowAny]
    search_fields = ['name', 'contact_person', 'email', 'cnpj_cpf']


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().select_related('category', 'supplier')
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search')
        category_id = self.request.query_params.get('category')
        supplier_id = self.request.query_params.get('supplier')
        status_filter = self.request.query_params.get('status')
        is_active = self.request.query_params.get('is_active')
        archived = self.request.query_params.get('archived')

        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(sku__icontains=search) |
                Q(barcode__icontains=search) |
                Q(location__icontains=search)
            )

        if category_id:
            qs = qs.filter(category_id=category_id)

        if supplier_id:
            qs = qs.filter(supplier_id=supplier_id)

        if is_active is not None and is_active != '':
            qs = qs.filter(is_active=is_active.lower() == 'true')

        # Controle de exibição de itens arquivados
        if self.action in ['archive', 'unarchive']:
            pass
        elif archived == 'true':
            qs = qs.filter(is_archived=True)
        elif archived == 'all':
            pass  # Retorna tanto arquivados quanto não arquivados
        else:
            qs = qs.filter(is_archived=False)

        if status_filter == 'OUT_OF_STOCK':
            qs = qs.filter(quantity__lte=0)
        elif status_filter == 'LOW_STOCK':
            qs = qs.filter(quantity__gt=0, quantity__lte=F('min_stock'))
        elif status_filter == 'NORMAL':
            qs = qs.filter(quantity__gt=F('min_stock'))
        elif status_filter == 'ARCHIVED':
            qs = qs.filter(is_archived=True)

        return qs.order_by('name')

    @action(detail=True, methods=['post'], url_path='archive')
    def archive(self, request, pk=None):
        product = self.get_object()
        reason = request.data.get('reason', 'Arquivado manualmente pelo operador')
        product.is_archived = True
        product.archived_at = timezone.now()
        product.archive_reason = reason
        product.save(update_fields=['is_archived', 'archived_at', 'archive_reason', 'updated_at'])
        return Response({
            'message': f'Produto "{product.name}" arquivado com sucesso.',
            'product': ProductSerializer(product).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='unarchive')
    def unarchive(self, request, pk=None):
        product = self.get_object()
        product.is_archived = False
        product.archived_at = None
        product.archive_reason = None
        product.save(update_fields=['is_archived', 'archived_at', 'archive_reason', 'updated_at'])
        return Response({
            'message': f'Produto "{product.name}" desarquivado e reativado no catálogo.',
            'product': ProductSerializer(product).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='dispatch-delivery')
    def dispatch_delivery(self, request, pk=None):
        product = self.get_object()
        data = request.data.copy()
        data['product'] = product.id
        serializer = DeliveryOrderSerializer(data=data)
        if serializer.is_valid():
            delivery = serializer.save()
            product.refresh_from_db()
            return Response({
                'message': f'Ordem de entrega gerada com código {delivery.tracking_code}!',
                'delivery': serializer.data,
                'product': ProductSerializer(product).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='quick-movement')
    def quick_movement(self, request, pk=None):
        product = self.get_object()
        movement_type = request.data.get('movement_type')  # 'IN' or 'OUT'
        quantity = request.data.get('quantity')
        reason = request.data.get('reason', 'Ajuste rápido pelo painel')
        reference_doc = request.data.get('reference_doc', 'PAINEL_RAPIDO')

        try:
            quantity = int(quantity)
            if quantity <= 0:
                return Response({'error': 'Quantidade deve ser maior que 0'}, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return Response({'error': 'Quantidade inválida'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = StockMovementSerializer(data={
            'product': product.id,
            'movement_type': movement_type,
            'quantity': quantity,
            'reason': reason,
            'reference_doc': reference_doc,
            'performed_by': request.user.username if request.user.is_authenticated else 'Operador DreamStorage'
        })

        if serializer.is_valid():
            serializer.save()
            product.refresh_from_db()
            return Response({
                'message': 'Movimentação registrada com sucesso!',
                'product': ProductSerializer(product).data,
                'movement': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def movements(self, request, pk=None):
        product = self.get_object()
        movements = product.movements.all().order_by('-created_at')[:30]
        serializer = StockMovementSerializer(movements, many=True)
        return Response(serializer.data)


class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.all().select_related('product')
    serializer_class = StockMovementSerializer
    permission_classes = [permissions.AllowAny]
    http_method_names = ['get', 'post', 'head', 'options']  # Movements are audit logs, not editable directly

    def get_queryset(self):
        qs = super().get_queryset()
        product_id = self.request.query_params.get('product')
        movement_type = self.request.query_params.get('movement_type')
        search = self.request.query_params.get('search')

        if product_id:
            qs = qs.filter(product_id=product_id)
        if movement_type:
            qs = qs.filter(movement_type=movement_type)
        if search:
            qs = qs.filter(
                Q(product__name__icontains=search) |
                Q(product__sku__icontains=search) |
                Q(reason__icontains=search) |
                Q(reference_doc__icontains=search)
            )
        return qs.order_by('-created_at')


class StockAlertViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StockAlert.objects.all().select_related('product')
    serializer_class = StockAlertSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        is_read = self.request.query_params.get('is_read')
        if is_read is not None and is_read != '':
            qs = qs.filter(is_read=is_read.lower() == 'true')
        return qs.order_by('-created_at')

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        alert = self.get_object()
        alert.is_read = True
        alert.save(update_fields=['is_read'])
        return Response({'status': 'Alerta marcado como lido'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        StockAlert.objects.filter(is_read=False).update(is_read=True)
        return Response({'status': 'Todos os alertas marcados como lidos'})


class DeliveryOrderViewSet(viewsets.ModelViewSet):
    queryset = DeliveryOrder.objects.all().select_related('product')
    serializer_class = DeliveryOrderSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        carrier = self.request.query_params.get('carrier')
        status_val = self.request.query_params.get('status')
        search = self.request.query_params.get('search')

        if carrier:
            qs = qs.filter(carrier=carrier)
        if status_val:
            qs = qs.filter(status=status_val)
        if search:
            qs = qs.filter(
                Q(tracking_code__icontains=search) |
                Q(recipient_name__icontains=search) |
                Q(recipient_address__icontains=search) |
                Q(product__name__icontains=search) |
                Q(product__sku__icontains=search)
            )
        return qs.order_by('-created_at')

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        delivery = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(DeliveryOrder.STATUS_CHOICES):
            delivery.status = new_status
            delivery.save(update_fields=['status', 'updated_at'])
            return Response({
                'message': f'Status atualizado para {delivery.get_status_display()}',
                'delivery': DeliveryOrderSerializer(delivery).data
            })
        return Response({'error': 'Status inválido'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def dashboard_overview(request):
    """
    Retorna métricas consolidadas em tempo real para o Dashboard Liquid Glass.
    """
    products = Product.objects.filter(is_active=True)
    total_products = products.count()
    
    total_stock_units = products.aggregate(total=Sum('quantity'))['total'] or 0

    # Cálculo do valor do inventário
    cost_expr = ExpressionWrapper(F('quantity') * F('cost_price'), output_field=DecimalField(max_digits=16, decimal_places=2))
    selling_expr = ExpressionWrapper(F('quantity') * F('selling_price'), output_field=DecimalField(max_digits=16, decimal_places=2))

    total_inventory_cost = products.annotate(subtotal=cost_expr).aggregate(total=Sum('subtotal'))['total'] or Decimal('0.00')
    total_inventory_selling = products.annotate(subtotal=selling_expr).aggregate(total=Sum('subtotal'))['total'] or Decimal('0.00')
    potential_profit = total_inventory_selling - total_inventory_cost

    # Contagem de estados de estoque
    out_of_stock_count = products.filter(quantity__lte=0).count()
    low_stock_count = products.filter(quantity__gt=0, quantity__lte=F('min_stock')).count()
    healthy_stock_count = total_products - (out_of_stock_count + low_stock_count)

    # Movimentações do mês
    now = timezone.now()
    first_day_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    month_in_movements = StockMovement.objects.filter(created_at__gte=first_day_of_month, movement_type='IN')
    month_out_movements = StockMovement.objects.filter(created_at__gte=first_day_of_month, movement_type='OUT')

    month_in_units = month_in_movements.aggregate(total=Sum('quantity'))['total'] or 0
    month_out_units = month_out_movements.aggregate(total=Sum('quantity'))['total'] or 0

    # Movimentações recentes
    recent_movements = StockMovement.objects.select_related('product').order_by('-created_at')[:8]
    recent_movements_data = StockMovementSerializer(recent_movements, many=True).data

    # Produtos críticos que exigem reposição
    critical_products = products.filter(quantity__lte=F('min_stock')).order_by('quantity')[:6]
    critical_products_data = ProductSerializer(critical_products, many=True).data

    # Distribuição por Categoria
    categories = Category.objects.annotate(
        items_count=Count('products', filter=Q(products__is_active=True)),
        total_units=Sum('products__quantity', filter=Q(products__is_active=True))
    )
    categories_distribution = []
    for cat in categories:
        categories_distribution.append({
            'id': cat.id,
            'name': cat.name,
            'color': cat.color,
            'items_count': cat.items_count,
            'total_units': cat.total_units or 0
        })

    return Response({
        'summary': {
            'total_products': total_products,
            'total_stock_units': total_stock_units,
            'total_inventory_cost': float(total_inventory_cost),
            'total_inventory_selling': float(total_inventory_selling),
            'potential_profit': float(potential_profit),
            'out_of_stock_count': out_of_stock_count,
            'low_stock_count': low_stock_count,
            'healthy_stock_count': healthy_stock_count,
            'total_categories': Category.objects.count(),
            'total_suppliers': Supplier.objects.count(),
            'month_in_units': month_in_units,
            'month_out_units': month_out_units,
        },
        'recent_movements': recent_movements_data,
        'critical_products': critical_products_data,
        'categories_distribution': categories_distribution,
    })
