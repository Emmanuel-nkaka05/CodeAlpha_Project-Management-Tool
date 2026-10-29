from rest_framework import serializers
from .models import Project, Task, Comment, User, Notification

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "avatar"]

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    class Meta:
        model = Comment
        fields = ["id", "text", "task", "author", "created_at"]
        read_only_fields = ["author"]

class TaskSerializer(serializers.ModelSerializer):
    assignee = UserSerializer(read_only=True)
    assignee_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source="assignee", write_only=True, required=False, allow_null=True)
    comments = CommentSerializer(many=True, read_only=True)
    class Meta:
        model = Task
        fields = ["id", "title", "description", "status", "project", "assignee", "assignee_id", "order", "comments", "created_at"]

class ProjectSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    members = UserSerializer(many=True, read_only=True)
    add_member = serializers.CharField(write_only=True, required=False)
    tasks = TaskSerializer(many=True, read_only=True)
    class Meta:
        model = Project
        fields = ["id", "title", "description", "owner", "members", "add_member", "tasks", "created_at"]

    def update(self, instance, validated_data):
        add_member_username = validated_data.pop("add_member", None)
        if add_member_username:
            try:
                user_to_add = User.objects.get(username=add_member_username)
                instance.members.add(user_to_add)
                Notification.objects.create(
                    user=user_to_add,
                    message=f"You were added to project: {instance.title}"
                )
            except User.DoesNotExist:
                raise serializers.ValidationError({"add_member": "User not found."})
        return super().update(instance, validated_data)

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"
        
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ("username", "email", "password")
        
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user