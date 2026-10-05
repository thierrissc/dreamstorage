from rest_framework import serializers
from django.db import transaction
from decimal import Decimal
from .models import Category, Supplier, Product, StockMovement, StockAlert


class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'color', 'icon', 'products_count', 'created_at']
        read_only_fields = ['id', 'slug', 'created_at']


class SupplierSerializer(serializers.ModelSerializer):
    products_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Supplier
        fields = [
            'id', 'name', 'cnpj_cpf', 'contact_person', 'email', 'phone',
            'address', 'notes', 'products_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    stock_status = serializers.ReadOnlyField()
    total_cost_value = serializers.ReadOnlyField()
    total_selling_value = serializers.ReadOnlyField()
    margin_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 'sku', 'barcode', 'name', 'description',
            'category', 'category_name', 'category_color',
            'supplier', 'supplier_name',
            'unit_measure', 'cost_price', 'selling_price',
            'quantity', 'min_stock', 'max_stock', 'location',
            'is_active', 'stock_status', 'total_cost_value',
            'total_selling_value', 'margin_percentage',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_sku(self, value):
        sku_clean = value.strip().upper()
        qs = Product.objects.filter(sku__iexact=sku_clean)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Este SKU já está em uso por outro produto.")
        return sku_clean

    def validate(self, data):
        cost = data.get('cost_price', self.instance.cost_price if self.instance else Decimal('0.00'))
        selling = data.get('selling_price', self.instance.selling_price if self.instance else Decimal('0.00'))
        if selling < 0:
            raise serializers.ValidationError({"selling_price": "O preço de venda não pode ser negativo."})
        if cost < 0:
            raise serializers.ValidationError({"cost_price": "O preço de custo não pode ser negativo."})
        min_stock = data.get('min_stock', self.instance.min_stock if self.instance else 0)
        max_stock = data.get('max_stock', self.instance.max_stock if self.instance else 0)
        if min_stock < 0:
            raise serializers.ValidationError({"min_stock": "O estoque mínimo não pode ser negativo."})
        if max_stock < min_stock:
            raise serializers.ValidationError({"max_stock": "O estoque máximo deve ser maior ou igual ao mínimo."})
        return data


class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_unit = serializers.CharField(source='product.unit_measure', read_only=True)
    movement_type_display = serializers.CharField(source='get_movement_type_display', read_only=True)

    class Meta:
        model = StockMovement
        fields = [
            'id', 'product', 'product_name', 'product_sku', 'product_unit',
            'movement_type', 'movement_type_display', 'quantity',
            'previous_stock', 'new_stock', 'unit_cost', 'total_value',
            'reason', 'reference_doc', 'performed_by', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'previous_stock', 'new_stock', 'total_value', 'created_at']

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("A quantidade deve ser estritamente maior que zero.")
        return value

    def validate(self, data):
        product = data.get('product')
        movement_type = data.get('movement_type')
        quantity = data.get('quantity')

        if movement_type == StockMovement.TYPE_OUT:
            if product.quantity < quantity:
                raise serializers.ValidationError({
                    "quantity": f"Estoque insuficiente! Saldo atual é {product.quantity}, tentativa de saída: {quantity}."
                })
        return data

    @transaction.atomic
    def create(self, validated_data):
        product = validated_data['product']
        # Bloqueia a linha no banco para evitar race conditions simultaneas
        product = Product.objects.select_for_update().get(pk=product.pk)
        
        movement_type = validated_data['movement_type']
        quantity = validated_data['quantity']
        unit_cost = validated_data.get('unit_cost') or product.cost_price

        previous_stock = product.quantity

        if movement_type == StockMovement.TYPE_IN:
            new_stock = previous_stock + quantity
            if unit_cost:
                # Atualiza custo médio ponderado se entrada tiver custo
                pass
        elif movement_type == StockMovement.TYPE_OUT:
            if previous_stock < quantity:
                raise serializers.ValidationError({
                    "quantity": f"Estoque insuficiente. Saldo atual: {previous_stock}."
                })
            new_stock = previous_stock - quantity
        elif movement_type == StockMovement.TYPE_ADJUST:
            # Em ajuste, a quantidade informada é o novo saldo real apurado
            new_stock = quantity
            quantity = abs(new_stock - previous_stock)
        else:
            new_stock = previous_stock

        total_value = Decimal(quantity) * (unit_cost if unit_cost else product.cost_price)

        product.quantity = new_stock
        product.save(update_fields=['quantity', 'updated_at'])

        # Atualiza alertas
        if new_stock <= 0:
            StockAlert.objects.get_or_create(
                product=product,
                alert_type=StockAlert.ALERT_OUT,
                defaults={'message': f"O produto {product.name} (SKU: {product.sku}) está totalmente esgotado."}
            )
        elif new_stock <= product.min_stock:
            StockAlert.objects.get_or_create(
                product=product,
                alert_type=StockAlert.ALERT_LOW,
                defaults={'message': f"O produto {product.name} atingiu nível crítico: {new_stock} unidades restantes."}
            )
        else:
            # Se voltou a ter estoque saudável, marca alertas antigos como lidos
            StockAlert.objects.filter(product=product).update(is_read=True)

        movement = StockMovement.objects.create(
            product=product,
            movement_type=movement_type,
            quantity=quantity,
            previous_stock=previous_stock,
            new_stock=new_stock,
            unit_cost=unit_cost,
            total_value=total_value,
            reason=validated_data.get('reason', 'Movimentação manual'),
            reference_doc=validated_data.get('reference_doc', ''),
            performed_by=validated_data.get('performed_by', 'Administrador'),
            notes=validated_data.get('notes', '')
        )
        return movement


class StockAlertSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    current_quantity = serializers.IntegerField(source='product.quantity', read_only=True)
    min_stock = serializers.IntegerField(source='product.min_stock', read_only=True)

    class Meta:
        model = StockAlert
        fields = [
            'id', 'product', 'product_name', 'product_sku',
            'current_quantity', 'min_stock', 'alert_type',
            'message', 'is_read', 'created_at'
        ]
