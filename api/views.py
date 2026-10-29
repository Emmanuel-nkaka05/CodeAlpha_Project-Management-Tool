from rest_framework import viewsets, permissions
from .models import Project, Task, Comment, Notification
from .serializers import ProjectSerializer, TaskSerializer, CommentSerializer, NotificationSerializer
from .serializers import RegisterSerializer
from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import Project, Task, Comment, Notification, User


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(owner=user) | Project.objects.filter(members=user)
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Task.objects.filter(project__members=self.request.user) | Task.objects.filter(project__owner=self.request.user)

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Comment.objects.filter(task__project__members=self.request.user)
    def perform_create(self, serializer):
        comment = serializer.save(author=self.request.user)
        task = comment.task
        if task.assignee and task.assignee != self.request.user:
            Notification.objects.create(
                user=task.assignee,
                message=f"New comment on '{task.title}' by {self.request.user.username}"
            )

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by("-created_at")



class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer    