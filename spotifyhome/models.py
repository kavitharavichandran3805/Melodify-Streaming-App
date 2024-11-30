from django.db import models
from django.contrib.auth.models import User


class SongsModel(models.Model):
    song_data=models.JSONField()

class LikedSongsModel(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE)
    song=models.ForeignKey(SongsModel,on_delete=models.CASCADE)

class FavouriteSongsModel(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE)
    song=models.ForeignKey(SongsModel,on_delete=models.CASCADE)

class PlaylistModel(models.Model):
    playlist_name=models.CharField(max_length=100)
    user=models.ForeignKey(User,on_delete=models.CASCADE)
    songs = models.ManyToManyField(SongsModel, through='PlaylistSongsModel', related_name='playlists')

class PlaylistSongsModel(models.Model):
    song_data=models.ForeignKey(SongsModel,on_delete=models.CASCADE)
    playlist_data=models.ForeignKey(PlaylistModel,on_delete=models.CASCADE)
