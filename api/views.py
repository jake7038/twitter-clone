from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from .models import Post, Comment, Like
from .serializers import (
    RegisterSerializer, UserSerializer, UpdateProfileSerializer,
    PostSerializer, CommentSerializer,
)

User = get_user_model()


# ──────────────────────────────────────────────
# Auth
# ──────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/"""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            UserSerializer(user, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


# ──────────────────────────────────────────────
# Users / Profile
# ──────────────────────────────────────────────

class MeView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/users/me/"""
    serializer_class = UserSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return UpdateProfileSerializer
        return UserSerializer

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)


class UserDetailView(generics.RetrieveAPIView):
    """GET /api/users/<username>/"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'username'
    queryset = User.objects.all()


class FollowToggleView(APIView):
    """POST /api/users/<username>/follow/"""

    def post(self, request, username):
        target = get_object_or_404(User, username=username)
        if target == request.user:
            return Response({'detail': 'Você não pode se seguir.'}, status=status.HTTP_400_BAD_REQUEST)

        if request.user.following.filter(id=target.id).exists():
            request.user.following.remove(target)
            return Response({'following': False, 'followers_count': target.followers.count()})
        else:
            request.user.following.add(target)
            return Response({'following': True, 'followers_count': target.followers.count()})


class FollowersListView(generics.ListAPIView):
    """GET /api/users/<username>/followers/"""
    serializer_class = UserSerializer

    def get_queryset(self):
        user = get_object_or_404(User, username=self.kwargs['username'])
        return user.followers.all()


class FollowingListView(generics.ListAPIView):
    """GET /api/users/<username>/following/"""
    serializer_class = UserSerializer

    def get_queryset(self):
        user = get_object_or_404(User, username=self.kwargs['username'])
        return user.following.all()


class SearchUsersView(generics.ListAPIView):
    """GET /api/users/search/?q=<query>"""
    serializer_class = UserSerializer

    def get_queryset(self):
        q = self.request.query_params.get('q', '').strip()
        if not q:
            return User.objects.none()
        return User.objects.filter(username__icontains=q).exclude(id=self.request.user.id)[:20]


# ──────────────────────────────────────────────
# Posts
# ──────────────────────────────────────────────

class FeedView(generics.ListAPIView):
    """GET /api/posts/feed/  — posts from followed users"""
    serializer_class = PostSerializer

    def get_queryset(self):
        followed_ids = self.request.user.following.values_list('id', flat=True)
        return Post.objects.filter(author_id__in=followed_ids).prefetch_related('comments__author', 'likes')


class PostListCreateView(generics.ListCreateAPIView):
    """GET /api/posts/  — own posts  |  POST /api/posts/  — create"""
    serializer_class = PostSerializer

    def get_queryset(self):
        return Post.objects.filter(author=self.request.user).prefetch_related('comments__author', 'likes')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class UserPostsView(generics.ListAPIView):
    """GET /api/users/<username>/posts/"""
    serializer_class = PostSerializer

    def get_queryset(self):
        user = get_object_or_404(User, username=self.kwargs['username'])
        return Post.objects.filter(author=user).prefetch_related('comments__author', 'likes')


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/posts/<id>/"""
    serializer_class = PostSerializer

    def get_queryset(self):
        return Post.objects.prefetch_related('comments__author', 'likes')

    def get_object(self):
        post = get_object_or_404(Post, id=self.kwargs['pk'])
        if self.request.method in ('PUT', 'PATCH', 'DELETE'):
            if post.author != self.request.user:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied('Você só pode editar/deletar seus próprios posts.')
        return post

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)


class LikeToggleView(APIView):
    """POST /api/posts/<id>/like/"""

    def post(self, request, pk):
        post = get_object_or_404(Post, id=pk)
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        if not created:
            like.delete()
            return Response({'liked': False, 'likes_count': post.likes.count()})
        return Response({'liked': True, 'likes_count': post.likes.count()})


# ──────────────────────────────────────────────
# Comments
# ──────────────────────────────────────────────

class CommentListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/posts/<id>/comments/"""
    serializer_class = CommentSerializer

    def get_queryset(self):
        return Comment.objects.filter(post_id=self.kwargs['pk']).select_related('author')

    def perform_create(self, serializer):
        post = get_object_or_404(Post, id=self.kwargs['pk'])
        serializer.save(author=self.request.user, post=post)


class CommentDeleteView(generics.DestroyAPIView):
    """DELETE /api/posts/<post_pk>/comments/<comment_pk>/"""
    serializer_class = CommentSerializer

    def get_object(self):
        comment = get_object_or_404(Comment, id=self.kwargs['comment_pk'], post_id=self.kwargs['pk'])
        if comment.author != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Você só pode deletar seus próprios comentários.')
        return comment