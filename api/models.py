from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    avatar = models.URLField(blank=True, null=True)

class Project(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owned_projects")
    members = models.ManyToManyField(User, related_name="projects", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.title

class Task(models.Model):
    STATUS_CHOICES = (("todo", "To Do"), ("in-progress", "In Progress"), ("done", "Done"))
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="todo")
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="tasks")
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="tasks")
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.title

class Comment(models.Model):
    text = models.TextField()
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)