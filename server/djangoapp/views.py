from datetime import datetime
import json
import logging

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import CarModel
from .populate import initiate
from .restapis import analyze_review_sentiments, get_request, post_review

logger = logging.getLogger(__name__)


@csrf_exempt
def login_user(request):
    data = json.loads(request.body)
    username = data['userName']
    password = data['password']
    user = authenticate(username=username, password=password)
    response = {"userName": username}
    if user is not None:
        login(request, user)
        response = {
            "userName": username,
            "firstName": user.first_name,
            "lastName": user.last_name,
            "status": "Authenticated",
        }
    return JsonResponse(response)


def logout_user(request):
    logout(request)
    return JsonResponse({"status": "Logged out"})


@csrf_exempt
def registration(request):
    if request.method != "POST":
        return JsonResponse({"status": 405, "message": "Method not allowed"}, status=405)

    data = json.loads(request.body)
    username = data["userName"]
    password = data["password"]
    first_name = data.get("firstName", "")
    last_name = data.get("lastName", "")
    email = data.get("email", "")

    if User.objects.filter(username=username).exists():
        return JsonResponse(
            {"status": 409, "message": "Username already exists"},
            status=409,
        )

    user = User.objects.create_user(
        username=username,
        password=password,
        first_name=first_name,
        last_name=last_name,
        email=email,
    )
    login(request, user)
    return JsonResponse(
        {
            "status": 201,
            "userName": user.username,
            "firstName": user.first_name,
            "lastName": user.last_name,
        },
        status=201,
    )


def get_dealerships(request, state="All"):
    try:
        if state == "All":
            dealerships = get_request("/fetchDealers")
        else:
            dealerships = get_request(f"/fetchDealers/{state}")
        return JsonResponse({"status": 200, "dealers": dealerships})
    except Exception as exc:
        logger.exception("Unable to fetch dealerships: %s", exc)
        return JsonResponse(
            {"status": 500, "message": "Unable to fetch dealerships"},
            status=500,
        )


def get_dealer_reviews(request, dealer_id):
    try:
        reviews = get_request(f"/fetchReviews/dealer/{dealer_id}")
        for review in reviews:
            review["sentiment"] = analyze_review_sentiments(review.get("review", ""))
        return JsonResponse({"status": 200, "reviews": reviews})
    except Exception as exc:
        logger.exception("Unable to fetch reviews: %s", exc)
        return JsonResponse(
            {"status": 500, "message": "Unable to fetch reviews"},
            status=500,
        )


def get_dealer_details(request, dealer_id):
    try:
        dealer = get_request(f"/fetchDealer/{dealer_id}")
        return JsonResponse({"status": 200, "dealer": dealer})
    except Exception as exc:
        logger.exception("Unable to fetch dealer details: %s", exc)
        return JsonResponse(
            {"status": 500, "message": "Unable to fetch dealer details"},
            status=500,
        )


@csrf_exempt
def add_review(request):
    if request.method != "POST":
        return JsonResponse({"status": 405, "message": "Method not allowed"}, status=405)

    try:
        data = json.loads(request.body)
        purchase_date = data.get("purchase_date")
        if purchase_date:
            datetime.strptime(purchase_date, "%Y-%m-%d")
        data["sentiment"] = analyze_review_sentiments(data.get("review", ""))
        response = post_review(data)
        return JsonResponse({"status": 200, "review": response})
    except Exception as exc:
        logger.exception("Unable to add review: %s", exc)
        return JsonResponse(
            {"status": 500, "message": "Unable to add review"},
            status=500,
        )


def get_cars(request):
    if not CarModel.objects.exists():
        initiate()

    car_models = list(
        CarModel.objects.select_related("car_make")
        .values("id", "name", "year", "type", "car_make__name")
        .order_by("car_make__name", "name", "-year")
    )
    deduped = {}
    for car_model in car_models:
        key = (car_model["car_make__name"], car_model["name"])
        deduped.setdefault(
            key,
            {
                "id": car_model["id"],
                "CarMake": car_model["car_make__name"],
                "CarModel": car_model["name"],
                "Year": car_model["year"],
                "Type": car_model["type"],
            },
        )

    response = list(deduped.values())
    return JsonResponse({"status": 200, "CarModels": response})


def analyze_review(request, text):
    sentiment = analyze_review_sentiments(text)
    return JsonResponse({"status": 200, "review": text, "sentiment": sentiment})
