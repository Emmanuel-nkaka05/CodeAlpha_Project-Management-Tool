from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import ProjectViewSet, TaskViewSet, CommentViewSet, NotificationViewSet
from .views import RegisterView

router = DefaultRouter()
router.register(r"projects", ProjectViewSet, basename="project")
router.register(r"tasks", TaskViewSet, basename="task")
router.register(r"comments", CommentViewSet, basename="comment")
router.register(r"notifications", NotificationViewSet, basename="notification")

urlpatterns = [
    path("auth/login/", TokenObtainPairView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("", include(router.urls)),
    path("auth/register/", RegisterView.as_view(), name="register"),
]