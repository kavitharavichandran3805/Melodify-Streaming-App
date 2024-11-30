# Generated by Django 5.1.1 on 2024-11-14 11:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('spotifyhome', '0004_remove_playlistmodel_songs'),
    ]

    operations = [
        migrations.AddField(
            model_name='playlistmodel',
            name='songs',
            field=models.ManyToManyField(related_name='playlists', through='spotifyhome.PlaylistSongsModel', to='spotifyhome.songsmodel'),
        ),
    ]