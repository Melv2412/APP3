from django.urls import path

from .views import (
    ClustersView,
    HealthJournalView,
    HealthJournalSummaryView,
    HealthJournalExportView,
    PollutionMapView,
    PublicHealthStatsView,
    RiskZonesView,
    TrendsView,
)

urlpatterns = [
    path("public-health/stats/", PublicHealthStatsView.as_view(), name="public-health-stats"),
    path("risk-zones/", RiskZonesView.as_view(), name="risk-zones"),
    path("clusters/", ClustersView.as_view(), name="clusters"),
    path("trends/", TrendsView.as_view(), name="trends"),
    path("pollution-map/", PollutionMapView.as_view(), name="pollution-map"),
    path("health-journal/", HealthJournalView.as_view(), name="health-journal"),
    path("health-journal/summary/", HealthJournalSummaryView.as_view(), name="health-journal-summary"),
    path("health-journal/export/", HealthJournalExportView.as_view(), name="health-journal-export"),
]
