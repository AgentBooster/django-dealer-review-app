import json
from pathlib import Path

from .models import CarMake, CarModel


def initiate():
    data_file = (
        Path(__file__).resolve().parent.parent
        / "database"
        / "data"
        / "car_records.json"
    )

    if not data_file.exists():
        return {"created_makes": 0, "created_models": 0}

    records = json.loads(data_file.read_text())["cars"]
    created_makes = 0
    created_models = 0

    for record in records:
        car_make, make_created = CarMake.objects.get_or_create(
            name=record["make"],
            defaults={
                "description": f"{record['make']} lineup available through our dealer network.",
                "country": "USA",
            },
        )
        if make_created:
            created_makes += 1

        _, model_created = CarModel.objects.get_or_create(
            car_make=car_make,
            name=record["model"],
            year=record["year"],
            dealer_id=record["dealer_id"],
            defaults={
                "type": record["bodyType"],
                "mileage": record["mileage"],
            },
        )
        if model_created:
            created_models += 1

    return {"created_makes": created_makes, "created_models": created_models}
