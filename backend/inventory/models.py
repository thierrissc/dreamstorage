from django.db import models
from django.utils.text import slugify
from decimal import Decimal


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Nome da Categoria")
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True, verbose_name="Descrição")
    color = models.CharField(max_length=20, default="#2563eb", verbose_name="Cor Identificadora")
    icon = models.CharField(max_length=50, default="layers", verbose_name="Ícone")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Categoria"
        verbose_name_plural = "Categorias"
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Supplier(models.Model):
    name = models.CharField(max_length=200, verbose_name="Razão Social / Nome")
    cnpj_cpf = models.CharField(max_length=25, blank=True, verbose_name="CNPJ / CPF")
    contact_person = models.CharField(max_length=100, blank=True, verbose_name="Pessoa de Contato")
    email = models.EmailField(blank=True, verbose_name="E-mail")
    phone = models.CharField(max_length=30, blank=True, verbose_name="Telefone")
    address = models.TextField(blank=True, verbose_name="Endereço Completo")
    notes = models.TextField(blank=True, verbose_name="Observações")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Fornecedor"
        verbose_name_plural = "Fornecedores"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Product(models.Model):
    UNIT_CHOICES = [
        ("UN", "Unidade"),
        ("CX", "Caixa"),
        ("PC", "Peça"),
        ("KG", "Quilograma"),
        ("MT", "Metro"),
        ("LT", "Litro"),
        ("PAR", "Par"),
        ("KIT", "Kit"),
    ]

    sku = models.CharField(max_length=60, unique=True, db_index=True, verbose_name="SKU / Código Único")
    barcode = models.CharField(max_length=100, blank=True, null=True, db_index=True, verbose_name="Código de Barras (EAN)")
    name = models.CharField(max_length=255, verbose_name="Nome do Produto")
    description = models.TextField(blank=True, verbose_name="Descrição do Produto")
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="products", verbose_name="Categoria"
    )
    supplier = models.ForeignKey(
        Supplier, on_delete=models.SET_NULL, null=True, blank=True, related_name="products", verbose_name="Fornecedor Principal"
    )
    unit_measure = models.CharField(max_length=10, choices=UNIT_CHOICES, default="UN", verbose_name="Unidade")
    cost_price = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"), verbose_name="Preço de Custo (R$)")
    selling_price = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"), verbose_name="Preço de Venda (R$)")
    quantity = models.IntegerField(default=0, verbose_name="Quantidade em Estoque")
    min_stock = models.IntegerField(default=5, verbose_name="Estoque Mínimo")
    max_stock = models.IntegerField(default=200, verbose_name="Estoque Máximo")
    location = models.CharField(max_length=120, blank=True, default="Setor A - Estante 1", verbose_name="Localização no Depósito")
    is_active = models.BooleanField(default=True, verbose_name="Ativo")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Produto"
        verbose_name_plural = "Produtos"
        ordering = ["name"]

    @property
    def stock_status(self):
        if self.quantity <= 0:
            return "OUT_OF_STOCK"
        elif self.quantity <= self.min_stock:
            return "LOW_STOCK"
        return "NORMAL"

    @property
    def total_cost_value(self):
        return round(Decimal(self.quantity) * self.cost_price, 2)

    @property
    def total_selling_value(self):
        return round(Decimal(self.quantity) * self.selling_price, 2)

    @property
    def margin_percentage(self):
        if self.cost_price > Decimal("0.00"):
            margin = ((self.selling_price - self.cost_price) / self.cost_price) * 100
            return round(margin, 2)
        return Decimal("0.00")

    def __str__(self):
        return f"{self.sku} - {self.name} ({self.quantity} {self.unit_measure})"


class StockMovement(models.Model):
    TYPE_IN = "IN"
    TYPE_OUT = "OUT"
    TYPE_ADJUST = "ADJUST"

    MOVEMENT_TYPES = [
        (TYPE_IN, "Entrada (+ Inventário)"),
        (TYPE_OUT, "Saída (- Inventário)"),
        (TYPE_ADJUST, "Ajuste / Balanço Físico"),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="movements", verbose_name="Produto")
    movement_type = models.CharField(max_length=10, choices=MOVEMENT_TYPES, verbose_name="Tipo de Movimento")
    quantity = models.IntegerField(verbose_name="Quantidade Movimentada")
    previous_stock = models.IntegerField(verbose_name="Estoque Anterior")
    new_stock = models.IntegerField(verbose_name="Novo Estoque")
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="Custo Unitário")
    total_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="Valor Total")
    reason = models.CharField(max_length=255, verbose_name="Motivo / Finalidade")
    reference_doc = models.CharField(max_length=120, blank=True, null=True, verbose_name="Doc / NF / Pedido")
    performed_by = models.CharField(max_length=120, default="Administrador", verbose_name="Responsável")
    notes = models.TextField(blank=True, verbose_name="Observações Adicionais")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Data / Hora")

    class Meta:
        verbose_name = "Movimentação de Estoque"
        verbose_name_plural = "Movimentações de Estoque"
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.get_movement_type_display()}] {self.product.name} (Qtd: {self.quantity}) em {self.created_at.strftime('%d/%m/%Y %H:%M')}"


class StockAlert(models.Model):
    ALERT_LOW = "LOW_STOCK"
    ALERT_OUT = "OUT_OF_STOCK"

    ALERT_TYPES = [
        (ALERT_LOW, "Estoque Baixo"),
        (ALERT_OUT, "Ruptura Total (Esgotado)"),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="alerts")
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Alerta {self.get_alert_type_display()} - {self.product.name}"
