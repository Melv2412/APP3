"""URLs placeholder for `community` app — left empty intentionally."""

from django.urls import path

from asiko_connect.apps.community.views import ZoneRiskRankingAPIView

urlpatterns = [

        path("zones/ranking/", ZoneRiskRankingAPIView.as_view()),

]
