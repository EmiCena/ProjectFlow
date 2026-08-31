from rest_framework.permissions import BasePermission

class IsWorkspaceMember(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        # allow if user belongs to active_workspace
        return request.user.active_workspace_id is not None

class IsWorkspaceOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner_id == request.user.id
