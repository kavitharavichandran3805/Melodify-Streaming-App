from django.urls import path
from spotifyhome.views import mainpage,YoutubeAPI,LoginAPI,SigninAPI,UserDetailsAPI,EmailAPI,LogoutAPI,LikedSongsAPI,CheckLikedAPI,LikedSampleAPI,FavouriteSongsAPI,FavouritesSampleAPI,checkFavAPI,PlaylistAPI,PlaylistSampleAPI

urlpatterns = [
    path('mainpage/',mainpage),
    path('youtube/',YoutubeAPI.as_view()),
    path('login/',LoginAPI.as_view()),
    path('signin/',SigninAPI.as_view()),
    path('user_details/',UserDetailsAPI.as_view()),
    path('email/',EmailAPI.as_view()),
    path('logout/',LogoutAPI.as_view()),
    path('liked/',LikedSongsAPI.as_view()),
    path('checkLiked/',CheckLikedAPI.as_view()),
    path('sampleCheck/',LikedSampleAPI.as_view()),
    path('favourite/',FavouriteSongsAPI.as_view()),
    path('sampleFavourite/',FavouritesSampleAPI.as_view()),
    path('checkFav/',checkFavAPI.as_view()),
    path('playlist/',PlaylistAPI.as_view()),
    path('samplePlaylist/',PlaylistSampleAPI.as_view())

]
