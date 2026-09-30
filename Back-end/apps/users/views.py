
from rest_framework import viewsets, mixins
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import APIView, action
from rest_framework.response import Response
from .serializers import RegisterSerializer, UserSerializer, RoleSerializer, MeUpdateSerializer
from .models import User, Role
from rest_framework.permissions import AllowAny
from rest_framework import status
from .permissions import IsAdmin

    
class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all().order_by('id')
    serializer_class = RoleSerializer
    permission_classes = [IsAdmin]
    
class UserViewSet(mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        qs = User.objects.select_related('role').order_by('id')
        user = self.request.user
        if user.is_authenticated and getattr(user, 'role', None) and user.role.name == 'Admin':
            return qs
        if user.is_authenticated:
            return qs.filter(id=user.id)
        return qs.none()

    @action(detail=False, methods=['get', 'put', 'patch'], permission_classes=[IsAuthenticated])
    def me(self, request):
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)

        serializer = MeUpdateSerializer(
            request.user,
            data=request.data,
            partial=request.method == 'PATCH'
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        response_serializer = self.get_serializer(request.user)
        return Response(response_serializer.data)
    
class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):

        serializer = RegisterSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )
