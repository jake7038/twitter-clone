from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Current user
    path('users/me/', views.MeView.as_view(), name='me'),

    # Users
    path('users/search/', views.SearchUsersView.as_view(), name='search-users'),
    path('users/<str:username>/', views.UserDetailView.as_view(), name='user-detail'),
    path('users/<str:username>/follow/', views.FollowToggleView.as_view(), name='follow-toggle'),
    path('users/<str:username>/followers/', views.FollowersListView.as_view(), name='followers'),
    path('users/<str:username>/following/', views.FollowingListView.as_view(), name='following'),
    path('users/<str:username>/posts/', views.UserPostsView.as_view(), name='user-posts'),

    # Posts
    path('posts/', views.PostListCreateView.as_view(), name='post-list-create'),
    path('posts/feed/', views.FeedView.as_view(), name='feed'),
    path('posts/<int:pk>/', views.PostDetailView.as_view(), name='post-detail'),
    path('posts/<int:pk>/like/', views.LikeToggleView.as_view(), name='like-toggle'),

    # Comments
    path('posts/<int:pk>/comments/', views.CommentListCreateView.as_view(), name='comment-list-create'),
    path('posts/<int:pk>/comments/<int:comment_pk>/', views.CommentDeleteView.as_view(), name='comment-delete'),
]