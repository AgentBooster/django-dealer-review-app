from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.timezone import now


class CarMake(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    country = models.CharField(max_length=100, default="USA")

    def __str__(self):
        return self.name


class CarModel(models.Model):
    SEDAN = "Sedan"
    SUV = "SUV"
    WAGON = "Wagon"
    COUPE = "Coupe"
    HATCHBACK = "Hatchback"
    TRUCK = "Truck"
    CONVERTIBLE = "Convertible"
    MINIVAN = "Minivan"
    PICKUP = "Pickup"

    BODY_TYPE_CHOICES = [
        (SEDAN, "Sedan"),
        (SUV, "SUV"),
        (WAGON, "Wagon"),
        (COUPE, "Coupe"),
        (HATCHBACK, "Hatchback"),
        (TRUCK, "Truck"),
        (CONVERTIBLE, "Convertible"),
        (MINIVAN, "Minivan"),
        (PICKUP, "Pickup"),
    ]

    car_make = models.ForeignKey(
        CarMake,
        on_delete=models.CASCADE,
        related_name="models",
    )
    name = models.CharField(max_length=100)
    dealer_id = models.PositiveIntegerField(default=0)
    type = models.CharField(max_length=20, choices=BODY_TYPE_CHOICES)
    year = models.IntegerField(
        validators=[MinValueValidator(2015), MaxValueValidator(now().year + 1)]
    )
    mileage = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("car_make", "name", "year", "dealer_id")
        ordering = ["car_make__name", "name", "-year"]

    def __str__(self):
        return f"{self.car_make.name} {self.name} ({self.year})"
