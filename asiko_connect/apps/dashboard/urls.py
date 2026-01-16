from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ClustersView,
    DashboardViewSet,
    HealthJournalView,
    HealthJournalSummaryView,
    HealthJournalExportView,
    PollutionMapView,
    PublicHealthStatsView,
    RiskZonesView,
    TrendsView,
)

# Remove router to avoid converter registration issues
# router = DefaultRouter()
# router.register(r'', DashboardViewSet, basename='dashboard')

urlpatterns = [
    # path('', include(router.urls)),  # Removed to avoid converter issues
    path('health_journal/', DashboardViewSet.as_view({'get': 'health_journal'}), name='dashboard-health-journal'),
    path("public-health/stats/", PublicHealthStatsView.as_view(), name="public-health-stats"),
    path("risk-zones/", RiskZonesView.as_view(), name="risk-zones"),
    path("clusters/", ClustersView.as_view(), name="clusters"),
    path("trends/", TrendsView.as_view(), name="trends"),
    path("pollution-map/", PollutionMapView.as_view(), name="pollution-map"),
    path("health-journal/", HealthJournalView.as_view(), name="health-journal"),
    path("health-journal/summary/", HealthJournalSummaryView.as_view(), name="health-journal-summary"),
    path("health-journal/export/", HealthJournalExportView.as_view(), name="health-journal-export"),
]
