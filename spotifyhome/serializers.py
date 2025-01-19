from django.contrib.auth.models import User
from rest_framework import serializers
from .models import SongsModel,LikedSongsModel,FavouriteSongsModel,PlaylistModel,PlaylistSongsModel

class UserSerializers(serializers.ModelSerializer):
    password=serializers.CharField(write_only=True)
    class Meta:
        model=User
        fields=['username','email','password']

    def create(self, validated_data):
        print("inside the create method")
        user=User(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
    
class SongsSerializers(serializers.ModelSerializer):
    class Meta:
        model=SongsModel
        fields=['song_data']

class LikedSongsSerializers(serializers.ModelSerializer):
    song=SongsSerializers()
    class Meta:
        model=LikedSongsModel
        fields=['user','song']

class FavouriteSongsSerializers(serializers.ModelSerializer):
    song=SongsSerializers()
    class Meta:
        model=FavouriteSongsModel
        fields=['user','song']

class PlaylistSerializers(serializers.ModelSerializer):
    # song=SongsSerializers()
    class Meta:
        model=PlaylistModel
        fields=['playlist_name','user']

class PlaylistSongsSerializers(serializers.ModelSerializer):
    song_data=SongsSerializers()
    playlist_data=PlaylistSerializers()
    class Meta:
        model=PlaylistSongsModel
        fields=['song_data','playlist_data','user']


