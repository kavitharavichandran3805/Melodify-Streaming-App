from django.shortcuts import render
import requests
# from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
# from rest_framework import viewsets
from rest_framework import status
from django.contrib.auth.models import User
from .serializers import UserSerializers,LikedSongsSerializers,FavouriteSongsSerializers,PlaylistSerializers,PlaylistSongsSerializers
from django.contrib.auth import authenticate,login,logout
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail
from django.conf import settings
from .models import LikedSongsModel,SongsModel,FavouriteSongsModel,PlaylistSongsModel,PlaylistModel
# from rest_framework.authentication import TokenAuthentications
# from django.contrib.auth import get_user_model
# from rest_framework.permissions import AllowAny

class EmailAPI(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request):
        data=request.data
        message=data['message']
        print("inside the emailapi")
        user=request.user
        print(user.email)
        if not all([user.email,message]):
            return Response({'status':False,'message':'Missing Parameter'})
        send_mail(
            'No subject',
            message,
            user.email,
            [settings.DEFAULT_TO_EMAIL],
            fail_silently=False

        )
        return Response({
            'status':True,
            'message':'success'
        })

class UserDetailsAPI(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            user = request.user
            return Response({
                'status': True,
                'user': {
                    'username': user.username,
                    'email': user.email,
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'status': False,
                'message': 'User is not authenticated'
            }, status=status.HTTP_200_OK)
    
class LogoutAPI(APIView):
    def post(self,request):
        logout(request)
        return Response({'status':True,'message':'Successfully loggedout'})


class LoginAPI(APIView):
    
    def get(self,request):
        print('inside log get')
        users=User.objects.all()
        serializers=UserSerializers(users,many=True)
        return Response(serializers.data)
    
    def post(self, request):
        data = request.data
        email = data.get('email')
        password = data.get('password')
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'status': False, 'message': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)
        
        user = authenticate(username=user.username, password=password)
        if user is not None:
            login(request,user)# this line is used to create sessions which can automatically be sent with every request to the server
            return Response({'status': True, 'message': 'Login successful'})
        return Response({'status': False, 'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class SigninAPI(APIView):
    
    def get(self,request):
        user=User.objects.all()
        serializers=UserSerializers(user,many=True)
        return Response(serializers.data)
    
    def post(self,request):
        print("inside the signinapi")
        data=request.data
        print(data)
        serializers=UserSerializers(data=data)
        if not serializers.is_valid():
            return Response({
                'status':False,
                'message':serializers.errors
            },status.HTTP_400_BAD_REQUEST)
        user=serializers.save()
        login(request,user)
        print("Sign in was successful")
        return Response({'status':True,'message':'Sign up was successful'})
    
    def delete(self,request):
        data=request.data
        obj=User.objects.get(email=data['email'])
        obj.delete()
        return Response({"message":"object deleted"})

def mainpage(request):
    return render(request,'spotifyhome/index.html')


class YoutubeAPI(APIView):

    api_key='AIzaSyCFevZuMu7BM3gaOe-I4iQBDIdupUKaiLY'

    def post(self, request):
        print("inside the youtube api")
        if request.user.is_authenticated:
            print("user is authenticated")
            data = request.data
            song_name = data.get('song_name')
            if not song_name:
                return Response({"status": False, "message": "Song name is compulsory"})
            print("Song Name:", song_name)
            url = f'https://www.googleapis.com/youtube/v3/search?part=snippet&q={song_name}&key={self.api_key}&type=video&maxResults=1'
            print("Request URL:", url)
            response = requests.get(url)
            print("Response Status Code:", response.status_code)
            print("Response JSON:", response.json())
            if response.status_code != 200:
                return Response({'error': 'Failed to fetch data from SoundCloud'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            songs = response.json().get('items',[])
            if not songs:
                return Response({"status": False, "message": "No Vidoes found"})
            video = songs[0]
            video_id = video['id']['videoId']
            video_title = video['snippet']['title']
            video_url = f'https://www.youtube.com/watch?v={video_id}'
            thumbnailUrl = video['snippet']['thumbnails']['medium']['url']
            print(video_id," ",video_title," ",video_url)
            return Response({
                'status':True,
                'message':"Success",
                'video_id': video_id,
                'title': video_title,
                'url': video_url,
                'pic_url':thumbnailUrl
            }, status=status.HTTP_200_OK)
        return Response({'status':False,'message':'No user logged in'})
        

class LikedSongsAPI(APIView):

    permission_classes=[IsAuthenticated]

    def get(self,request):
        print("Inside the likedsongsapi get request")
        print(request.user)
        data=LikedSongsModel.objects.filter(user=request.user)
        # data=LikedSongsModel.objects.all()
        serializers=LikedSongsSerializers(data,many=True)
        print(serializers.data)
        return Response({"songs":serializers.data})

    def post(self,request):
        print("Inside the likedsongsAPI")
        data=request.data
        print(data)
        print(request.user)
        song,created=SongsModel.objects.get_or_create(song_data=data)
        print(song)
        liked_song,liked_created=LikedSongsModel.objects.get_or_create(user=request.user,song=song)
        print(liked_song)

        return Response({"message":True})

    def delete(self,request):
        song_data=request.data.get('song',{})
        print(song_data)
        video_id=song_data.get('video_id')
        print(video_id)
        song_obj=SongsModel.objects.get(song_data__song__video_id=video_id) 
        liked_songs_obj=LikedSongsModel.objects.get(user=request.user,song=song_obj)
        liked_songs_obj.delete()
        return Response({"message":"Song successfully deleted"})
    
class CheckLikedAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("inside checkLikedAPI")
        data = request.data.get('songData', {})
        video_id = data.get('video_id')
        print(video_id)
        try:
            song_obj = SongsModel.objects.get(song_data__song__video_id=video_id)
        except SongsModel.DoesNotExist:
            return Response({"status": False, "message": "Song not found"}, status=404)
        is_liked = LikedSongsModel.objects.filter(user=request.user, song=song_obj).exists()
        print(is_liked)
        return Response({"status": is_liked})

class LikedSampleAPI(APIView):

    def get(self,request):
        data=LikedSongsModel.objects.all()
        serializers=LikedSongsSerializers(data,many=True)
        return Response({"data":serializers.data})
    
    def delete(self,request):
        objs=LikedSongsModel.objects.all()
        objs.delete()
        return Response({"message":"All the songs are successfully deleted"})
    
class FavouriteSongsAPI(APIView):

    permission_classes=[IsAuthenticated]

    def get(self,request):
        print("Inside the favouriteSongsAPI get request")
        print(request.user)
        data=FavouriteSongsModel.objects.filter(user=request.user)
        # data=LikedSongsModel.objects.all()
        serializers=FavouriteSongsSerializers(data,many=True)
        print(serializers.data)
        return Response({"songs":serializers.data})

    def post(self,request):
        print("Inside the favouriteSongsAPI")
        data=request.data
        print(data)
        print(request.user)
        song,created=SongsModel.objects.get_or_create(song_data=data)
        print(song)
        liked_song,liked_created=FavouriteSongsModel.objects.get_or_create(user=request.user,song=song)
        print(liked_song)

        return Response({"message":True})

    def delete(self,request):
        song_data=request.data.get('song',{})
        print(song_data)
        video_id=song_data.get('video_id')
        print(video_id)
        song_obj=SongsModel.objects.get(song_data__song__video_id=video_id) 
        liked_songs_obj=FavouriteSongsModel.objects.get(user=request.user,song=song_obj)
        liked_songs_obj.delete()
        return Response({"message":"Song successfully deleted"})
    
class checkFavAPI(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("inside checkFavAPI")
        data = request.data.get('songData', {})
        video_id = data.get('video_id')
        print(video_id)
        try:
            song_obj = SongsModel.objects.get(song_data__song__video_id=video_id)
        except SongsModel.DoesNotExist:
            return Response({"status": False, "message": "Song not found"}, status=404)
        is_liked = FavouriteSongsModel.objects.filter(user=request.user, song=song_obj).exists()
        print(is_liked)
        return Response({"status": is_liked})
        
    
class FavouritesSampleAPI(APIView):

    def get(self,request):
        data=FavouriteSongsModel.objects.all()
        serializers=FavouriteSongsSerializers(data,many=True)
        return Response({"data":serializers.data})
    
    def delete(self,request):
        objs=FavouriteSongsModel.objects.all()
        objs.delete()
        return Response({"message":"All the songs are successfully deleted"})

class PlaylistAPI(APIView):
    permission_classes=[IsAuthenticated]
    
    def get(self,request):
        objs=PlaylistModel.objects.filter(user=request.user)
        serializers=PlaylistSerializers(objs,many=True)
        print(serializers.data)
        return Response({"data":serializers.data,"status":True})

    def post(self,request):
        print("inside the playlistAPI")
        data=request.data.get('playlist_name')
        print(data)
        if PlaylistModel.objects.filter(playlist_name=data):
            return Response({"status":False,"message":"Playlist already exists"})
        objs=PlaylistModel.objects.get_or_create(playlist_name=data,user=request.user)
        print(objs)
        return Response({"status":True})

    def delete(self,request):
        playlist_name=request.data.get("playlist_name")
        objs=PlaylistModel.objects.filter(playlist_name=playlist_name)
        objs.delete()
        return Response({"status":True,"message":"Playlists are deleted"})

class PlaylistSampleAPI(APIView):
    def get(self,request):
        email=request.GET.get("email",None)
        print(email)
        objs=PlaylistModel.objects.all()
        serializers=PlaylistSerializers(objs,many=True)
        return Response({"data":serializers.data})
    def delete(self,request):
        name=request.data.get('playlist_name')
        objs=PlaylistModel.objects.filter(playlist_name=name)
        objs.delete()
        return Response({"status":True,"message":"Playlist successfully deleted"})

    