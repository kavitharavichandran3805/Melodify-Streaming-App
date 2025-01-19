let youtubePlayer;
let isPlaying = false;
let song_data;
let current_searched_song;
let like;
let base_url;
let fav;
let songQueue = [];
let currentIndex = 0;
let isQueuePlaying = false;


function initializeYouTubePlayer() {
    console.log("Attempting to initialize YouTube player");
    if (typeof YT !== 'undefined' && YT.Player) {
        console.log("YouTube API is ready, calling onYouTubeIframeAPIReady");
        onYouTubeIframeAPIReady();
    } else {
        console.log("YouTube API not ready, retrying in 100ms");
        setTimeout(initializeYouTubePlayer, 100);
    }
}

function onYouTubeIframeAPIReady() {
    console.log("YouTube API is ready, initializing player");
    youtubePlayer = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: '',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
    console.log("Player initialization attempted", youtubePlayer);
}

function onPlayerError(event) {
    console.log()
    console.error('YouTube player error:', event.data);
    alert('An error occurred while trying to play the video.');
    document.getElementById("play-pause").textContent = 'Play';
}

function onPlayerReady(event) {
    console.log("Player is ready", event.target);
    youtubePlayer = event.target;
    updateProgressBar();
}

function onPlayerStateChange(event) {
    console.log("Player state changed", event.data);
    switch (event.data) {
        case YT.PlayerState.ENDED:
        case YT.PlayerState.PAUSED:
            isPlaying = false;
            document.getElementById("play-pause").textContent = 'Play';
            break;
        case YT.PlayerState.PLAYING:
            isPlaying = true;
            document.getElementById("play-pause").textContent = 'Pause';
            break;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM content loaded");

    const searchInputSide = document.getElementById("side-search");
    searchInputSide.addEventListener('keypress', handleSearchKeyPress);

    const searchInput = document.getElementById("search");
    searchInput.addEventListener('keypress', handleSearchKeyPress);

    const playPauseButton = document.getElementById("play-pause");
    playPauseButton.addEventListener('click', togglePlayPause);

    const progressBar = document.getElementById("progress-bar");
    progressBar.addEventListener('change', seekTo);

    const home = document.getElementById("home-icon");
    home.addEventListener('click', displayPage);

    like = document.getElementById("add_like");
    like.addEventListener('click', () => changeIcon('like', like, base_url));

    base_url = like.getAttribute('data-static-url');

    fav = document.getElementById("add_favadd");
    fav.addEventListener('click', () => changeIcon('fav', fav, base_url));

    const playlist = document.getElementById("side-pl-btn")
    playlist.addEventListener('click', () => showPages('playlist'));

    const create_playlist = document.getElementById('create-pl')
    create_playlist.addEventListener('click', () => openAuthOverlay('playlist'))

    const addPlaylistBtn = document.getElementById('playlistsong-create-btn')
    addPlaylistBtn.addEventListener('click', function (event) {
        event.preventDefault();
        const playlistInput = document.getElementById('playlistName')
        const playlistName = playlistInput.value
        playlistInput.value = ""
        console.log("Created playlist name is : " + playlistName)
        playlist_backend(playlistName)
    })

    const user_playlist_container = document.querySelector(".user-playlists");
    user_playlist_container.addEventListener('click', function (event) {
        if (event.target.classList.contains('deleteplaylist')) {
            const playlist_to_delete = event.target.closest('.playlists');
            if (playlist_to_delete) {
                console.log(playlist_to_delete.textContent)
                deletePlaylist(playlist_to_delete.textContent)
                playlist_to_delete.remove();
            }
        }
        else if (event.target.classList.contains('playlists')) {
            console.log("inner div was clicked" + event.target.textContent)
            showPlaylistSongs(event.target.textContent)
        }
    });

    const playlist_input = document.getElementById('playlist-search');
    playlist_input.addEventListener('keypress', function (event) {
        console.log("inside the keypress function")
        if (event.key === 'Enter') {
            event.preventDefault();
            console.log("inside the event.target if condition")
            const playlist_search_input = playlist_input.value;
            console.log("The playlist searched song name is " + playlist_search_input)
            playlist_input_display_songs(playlist_search_input);
            playlist_input.value = '';
        }
    });

    const go_playlist_home_btn = document.getElementById('go-playlist-home');
    go_playlist_home_btn.addEventListener('click', function (event) {
        console.log("playlist home button was clicked")
        showPlaylistHome();
    });

    const add_song_to_playlist = document.getElementById('add_songs_to_playlist');
    add_song_to_playlist.addEventListener('click', function (event) {
        console.log("the add button was clicked");
        addToPlaylist()
    });

    const playPlaylistSongs = document.getElementById('playlist-play-btn')
    playPlaylistSongs.addEventListener('click', function (event) {
        playToggle()
    })

    const plListBack = document.getElementById('go-pl-home')
    plListBack.addEventListener('click', () => displayPage())

    const likedsongs = document.getElementById('side-like-btn')
    likedsongs.addEventListener('click', () => showPages('liked'))

    const favsongs = document.getElementById('side-fav')
    favsongs.addEventListener('click', () => showPages('fav'))

    const likedBack = document.getElementById('go-liked-home')
    likedBack.addEventListener('click', () => displayPage())

    const favBack = document.getElementById('go-fav-home')
    favBack.addEventListener('click', () => displayPage())

    const playLikedSongs = document.querySelector('.liked-play-btn')
    playLikedSongs.addEventListener('click', () => playToggle())

    const playFavSongs = document.querySelector('.fav-play-btn')
    playFavSongs.addEventListener('click', () => playToggle())

    const login = document.getElementById("account-icon")
    login.addEventListener('click', () => checkLoggedUser());

    const reg_log_close_btn = document.getElementById("close-btn")
    reg_log_close_btn.addEventListener('click', closeAuthOverlay)

    const switch_form = document.getElementById('switch')
    switch_form.addEventListener('click', () => openAuthOverlay('signin'));

    // const user_details = document.getElementById('current-user')
    // user_details.addEventListener('click', getCurrentUser)

    const email = document.getElementById('mail-btn')
    email.addEventListener('click', () => openAuthOverlay('email'));

    const email_btn = document.getElementById('email-submit');
    email_btn.addEventListener('click', function (event) {
        event.preventDefault();
        const message = document.getElementById('message').value;
        console.log(message)
        email_submit(message)
    })

    const settings = document.getElementById('settings-btn')
    settings.addEventListener('click', () => openAuthOverlay('settings'))

    const theme = document.querySelectorAll('input[name="theme"]');
    theme.forEach((radio) => {
        radio.addEventListener('change', (event) => {
            const selectedTheme = event.target.value;
            if (selectedTheme === 'dark') {
                document.body.style.backgroundColor = '#000';
                document.body.style.color = '#fff';
                console.log("black theme selected")
            }
            else if (selectedTheme === 'white') {
                document.body.style.backgroundColor = '#fff';
                document.body.style.color = '#000';
                console.log("white theme selected")
            }
        })
    })

    const login_button = document.getElementById('login-submit');
    login_button.addEventListener('click', function (event) {
        event.preventDefault();
        const log_email = document.getElementById('loginEmail').value;
        const log_password = document.getElementById('loginPassword').value;
        console.log(log_email + " " + log_password)
        login_submit(log_email, log_password);
    });

    const logout_btn = document.getElementById('logout')
    logout_btn.addEventListener('click', function (event) {
        event.preventDefault();
        logout()
    })

    const reg_button = document.getElementById('reg-submit');
    reg_button.addEventListener('click', function (event) {
        event.preventDefault();
        const reg_username = document.getElementById('registerUsername').value;
        const reg_email = document.getElementById('registerEmail').value;
        const reg_password = document.getElementById('registerPassword').value;
        console.log(reg_username + " " + reg_email + " " + reg_password);
        reg_submit(reg_username, reg_email, reg_password);
    });

    const songsContainer = document.querySelectorAll('.songs-container');
    songsContainer.forEach(container => {
        container.addEventListener('click', function (event) {
            if (event.target.tagName === 'IMG') {
                console.log("Song clicked:", event.target.alt);
                fetch_song_details(event.target.alt);
            }
        });
    });

    setInterval(updateProgressBar, 1000);
    initializeYouTubePlayer();
    checkLoggedUser();

});

function playSongpl(videoid) {
    console.log("inside the playsongpl method")
    if (!youtubePlayer || !youtubePlayer.loadVideoById) {
        console.error('YouTube player not fully initialized. Retrying in 1 second.');
        setTimeout(() => playSong(song), 1000);
        return;
    }
    try {
        youtubePlayer.loadVideoById(videoid);
        youtubePlayer.playVideo();
        isQueuePlaying = true;
    }
    catch (error) {
        console.error("Error playing video:", error);
    }
}

function playNextSong() {
    console.log("inside the playNextSong method")
    if (currentIndex >= songQueue.length) {
        console.log("Restarting the playlist");
        currentIndex = 0;
        playSongpl(songQueue[currentIndex]);
        return;
    }
    let currentSong = songQueue[currentIndex];
    console.log("Current video id is " + currentSong)
    playSongpl(currentSong);
    const originalAlert = window.alert;
    window.alert = function (message) {
        originalAlert(message);
        if (message.includes('An error occurred while trying to play the video.')) {
            currentIndex++;
            playNextSong();
        } else {
            console.log("alert not received")
        }
    }
    youtubePlayer.addEventListener("onStateChange", (event) => {
        if (event.data === YT.PlayerState.ENDED) {
            currentIndex++;
            playNextSong()
        }
    })
}

// function playToggle(index = 0) {
//     console.log("inside the playToggle method")
//     if (index != 0) {
//         currentIndex = index
//         console.log("The current index is " + currentIndex)
//     }
//     if (isQueuePlaying) {
//         console.log("The isQueuePlaying is true")
//         printGlobalVars()
//         if (youtubePlayer && youtubePlayer.getPlayerState() === YT.PlayerState.PLAYING) {
//             console.log("before pausing the song")
//             printGlobalVars()
//             youtubePlayer.pauseVideo();
//             console.log("Paused playback at song index:", currentIndex);
//         }
//         isQueuePlaying = false;
//     }
//     else {
//         console.log("The isQueuePlaying is false");
//         printGlobalVars();
//         isQueuePlaying = true;

//         if (youtubePlayer.getPlayerState() === YT.PlayerState.PAUSED) {
//             console.log("Resuming playback from where it was paused.");
//             youtubePlayer.playVideo();  // Resumes from the current position
//         }
//         // else if (youtubePlayer.getPlayerState() === YT.PlayerState.UNSTARTED || youtubePlayer.getPlayerState() === YT.PlayerState.ENDED || index !== 0) {
//         //     console.log("Starting playback from the specified index or restarting.");
//         //     playNextSong();  // Plays from the specified index
//         // }
//         else if (youtubePlayer.getCurrentTime() === 0 || index !== 0) {
//             console.log("Starting playback from the beginning or specified index.");
//             playNextSong(currentIndex);  // Plays from the specified index
//         }
//     }
// }
// function playToggle(index = null) {
//     console.log("Inside playToggle method with index:", index);

//     // Case 1: User clicked a specific song from the list
//     if (index !== null) {
//         if (currentIndex === index && youtubePlayer.getPlayerState() === YT.PlayerState.PLAYING) {
//             // If clicking the currently playing song, pause it
//             youtubePlayer.pauseVideo();
//             isQueuePlaying = false;
//         } else {
//             // If clicking a different song or the same song that's paused
//             currentIndex = index;
//             playSongpl(songQueue[currentIndex]);
//             isQueuePlaying = true;
//         }
//         return;
//     }

//     // Case 2: User clicked the play/pause toggle button
//     const playerState = youtubePlayer.getPlayerState();

//     if (playerState === YT.PlayerState.PLAYING) {
//         // Pause the currently playing song
//         youtubePlayer.pauseVideo();
//         isQueuePlaying = false;
//     } else if (playerState === YT.PlayerState.PAUSED) {
//         // Resume the paused song
//         youtubePlayer.playVideo();
//         isQueuePlaying = true;
//     } else {
//         // Start playing from current index if no song is playing
//         playNextSong();
//         isQueuePlaying = true;
//     }
// }
function playToggle(index = null) {
    console.log("Inside playToggle method with index:", index);
    if (!youtubePlayer) {
        console.error("YouTube player not initialized");
        return;
    }
    const playerState = youtubePlayer.getPlayerState();
    console.log("Current player state:", playerState);

    if (index !== null) {
        if (currentIndex === index && playerState === YT.PlayerState.PLAYING) {
            console.log("Pausing current song");
            youtubePlayer.pauseVideo();
            isQueuePlaying = false;
        } else {
            console.log("Playing selected song");
            currentIndex = index;
            playSongpl(songQueue[currentIndex]);
            isQueuePlaying = true;
        }
        return;
    }

    console.log("Toggle button clicked, current state:", playerState);

    if (playerState === YT.PlayerState.PLAYING) {
        console.log("Pausing video");
        youtubePlayer.pauseVideo();
        isQueuePlaying = false;
    } else if (playerState === YT.PlayerState.PAUSED || playerState === YT.PlayerState.CUED) {
        console.log("Resuming video");
        youtubePlayer.playVideo();
        isQueuePlaying = true;
    } else {
        console.log("Starting playlist");
        playNextSong();
        isQueuePlaying = true;
    }
}
// else {
//     console.log("The isQueuePlaying is false")
//     printGlobalVars()
//     isQueuePlaying = true;
//     console.log("Resuming playback from song index:", currentIndex);
//     playNextSong(currentIndex);
// }
// function playToggle(index = 0) {
//     console.log("inside the playToggle method")
//     if (index != 0) {
//         currentIndex = index
//         console.log("The current index is " + currentIndex)
//     }
//     if (isQueuePlaying) {
//         console.log("The isQueuePlaying is true")
//         printGlobalVars()
//         if (youtubePlayer && youtubePlayer.getPlayerState() === YT.PlayerState.PLAYING) {
//             console.log("before pausing the song")
//             printGlobalVars()
//             youtubePlayer.pauseVideo();
//             console.log("Paused playback at song index:", currentIndex);
//         }
//         isQueuePlaying = false;
//     }
// else {
//     console.log("The isQueuePlaying is false")
//     printGlobalVars()
//     isQueuePlaying = true;
//     console.log("Resuming playback from song index:", currentIndex);
//     playNextSong(currentIndex);
// }

// if (!youtubePlayer) {
//     console.error('YouTube player not initialized');
//     return;
// }
// const playerState = youtubePlayer.getPlayerState();

// if (playerState === YT.PlayerState.PLAYING) {
//     youtubePlayer.pauseVideo();
//     isPlaying = false;
//     document.getElementById("play-pause").textContent = 'Play';
// } else {
//     youtubePlayer.playVideo();
//     isPlaying = true;
//     document.getElementById("play-pause").textContent = 'Pause';
// }

// function playToggle(index = 0) {
//     console.log("inside the playToggle method");

//     // Ensure the YouTube player is initialized
//     if (!youtubePlayer) {
//         console.error('YouTube player not initialized');
//         return;
//     }

//     // Update current index if provided
//     if (index !== 0) {
//         currentIndex = index;
//         console.log("The current index is set to: " + currentIndex);
//     }

//     // Fetch the current player state
//     const playerState = youtubePlayer.getPlayerState();

//     // If currently playing, pause the video
//     if (isQueuePlaying && playerState === YT.PlayerState.PLAYING) {
//         console.log("Pausing the song...");
//         youtubePlayer.pauseVideo();
//         isQueuePlaying = false;
//         // document.getElementById("play-pause").textContent = 'Play';
//     }
//     // If paused or video not started, resume or start playback
//     else {
//         console.log("Starting or resuming the song...");
//         if (playerState === YT.PlayerState.UNSTARTED || index !== 0) {
//             console.log("The song is unstarted and played from the beginning")
//             playNextSong(currentIndex);  // Start from specified index
//         } else {
//             console.log("Resuming the song")
//             youtubePlayer.playVideo();  // Resume current song
//         }
//         isQueuePlaying = true;
//         // document.getElementById("play-pause").textContent = 'Pause';
//     }

//     printGlobalVars();
// }


async function getPlaylistSongs() {
    try {
        resetGlobalPlaylistVariables();
        console.log("inside the getplaylistsongs method")
        let playlist_name = document.getElementById('playlist-name').textContent;
        // alert("The playlist name is " + playlist_name)
        let result = await go_backend_json('displayPlaylistSongs', 'POST', { playlist_name: playlist_name })
        if (result.status === true) {
            console.log(result.data)
            const songs = result.data.map(item => item.song_data.song_data.video_id);
            songQueue.push(...songs);
            console.log(songQueue)
            printGlobalVars()
        }
        else {
            console.log("Failed to fetch all the songs in the playlist")
        }
    }
    catch (error) {
        console.log("Error in fetching all the songs in the playlist")
    }

}

async function addToPlaylist() {
    try {
        console.log("inside the addtoplaylist method")
        console.log(current_searched_song)
        let selected_playlist_name = document.getElementById('playlist-name').textContent;
        console.log("Selected playlist name is " + selected_playlist_name);
        let result = await go_backend_json('playlistSongs', 'POST', { song_data: current_searched_song, playlist_name: selected_playlist_name });
        if (result.status === true) {
            alert("Songs successfully added to the playlist " + selected_playlist_name);
            document.getElementById('searched-songs').style.display = 'none'
            showAddedSongsPlaylist(selected_playlist_name)
        }
        else {
            alert("Song already exist in the playlist")
        }
    }
    catch (error) {
        alert("Error in adding song to the playlist")
    }
}

function resetGlobalPlaylistVariables() {
    console.log("inside the resetgloabalplaylistvariables")
    songQueue = []
    isQueuePlaying = false
    currentIndex = 0
}

function showAddedSongs(tableBody, record, index) {
    console.log("Inside the showAddedSongs")
    let songData = record.song_data.song_data;
    let playlist_name = record.playlist_data.playlist_name
    console.log("The playlist name is " + playlist_name)
    console.log("Video ID:", songData.video_id);
    console.log("Title:", songData.title);
    console.log("URL:", songData.url);
    console.log("Thumbnail URL:", songData.pic_url);
    const row = document.createElement('tr');
    row.innerHTML = `
        
        <td class='tdata'>${index + 1}</td>
        <td class='tdata'><img src="${songData.pic_url}" alt="Track Canvas" style="width: 50px; height: 50px;"></td>
        <td class='tdata'>${songData.title}</td>
        <td class='action-img-cell'>
            <img 
                src="http://127.0.0.1:8000/static/spotifyhome/remove.png" 
                alt="Action Icon" 
                style="width: 24px; height: 24px; cursor: pointer;" 
                
            >
        </td>
    `;
    // onclick="handleRowAction(this,'playlist')"
    const actionIcon = row.querySelector('.action-img-cell img');
    if (actionIcon) {
        actionIcon.addEventListener('click', function (event) {
            event.stopPropagation();
            handleRowAction(this, 'playlist');
        });
    }
    row.dataset.record = JSON.stringify(record);
    row.addEventListener('click', function (event) {
        alert("this rows is clicked and the index is " + index)
        playToggle(index)
    })
    tableBody.appendChild(row);

}

async function handleRowAction(element, input) {
    try {
        let row = element.closest('tr');
        let record = JSON.parse(row.dataset.record);
        if (input == 'playlist') {
            console.log("Record for this row:", record);
            let song_data = record.song_data;
            console.log("The song link is " + song_data.song_data.url)
            let playlist_data = record.playlist_data;
            let playlist_name = playlist_data.playlist_name
            let result = await go_backend_json('playlistSongs', 'DELETE', { song_data: song_data, playlist_data: playlist_data })
            if (result.status === true) {
                alert("Successfully removed")
                showAddedSongsPlaylist(playlist_name)
            }
            else {
                alert("Cannot remove the song")
            }
        }
        else if (input == 'liked') {
            let song_data = record.song.song_data.song;
            let result = await go_backend_json('liked', 'DELETE', { song: song_data })
            if (result.status === true) {
                alert("Successfully removed")
                getLikedSongs()
            }
            else {
                alert("Cannot remove the song")
            }
        }
        else {
            let song_data = record.song.song_data.song;
            let result = await go_backend_json('favourite', 'DELETE', { song: song_data })
            if (result.status === true) {
                alert("Successfully removed")
                getFavSongs()
            }
            else {
                alert("Cannot remove the song")
            }
        }

    }
    catch (error) {
        alert("Error in removing the song")
    }


}

async function showAddedSongsPlaylist(playlist_name) {
    console.log("inside the showAddedplaylist method and the playlist name is " + playlist_name)
    let result = await go_backend_json('displayPlaylistSongs', 'POST', { playlist_name: playlist_name })
    const playlistSongstable = document.querySelector('.song-list tbody');
    playlistSongstable.innerHTML = ''
    if (result.status === true) {
        // alert("Data was successfully fetched");
        console.log(result.data);
        document.getElementById('nosongs').style.display = 'none'
        result.data.forEach((record, index) => {
            showAddedSongs(playlistSongstable, record, index);
        });
    } else {
        const nosongsdiv = document.getElementById('nosongs')
        nosongsdiv.innerHTML = ''
        let noSongs = document.createElement('p');
        nosongsdiv.style.display = 'block'
        noSongs.textContent = "🗂️ No songs in the playlists yet! 📀 Add some!";
        noSongs.style.textAlign = 'center';
        noSongs.style.marginTop = '20px';
        noSongs.style.fontFamily = '"Dancing Script", cursive';
        noSongs.style.fontSize = '15px';
        noSongs.style.color = 'white';
        nosongsdiv.append(noSongs)

    }
}


function showPlaylistHome() {
    console.log("inside the showplaylisthome method");
    console.log("playlist home displayed")
    document.getElementById('playlistSongs').style.display = 'none';
    document.getElementById('playlist-container').style.display = 'block';
}

async function playlist_input_display_songs(song_name) {
    console.log("inside the playlist_input_display_songs")
    const result = await go_backend_json('youtube', 'POST', { song_name: song_name });
    current_searched_song = result;
    if (result && result.video_id) {
        console.log("The result is searched from the playlist : " + result);
        displaySearchedSongs(result);
    }
}

function displaySearchedSongs(result) {
    console.log("inside the displaySearchedSongs method")
    document.getElementById("searched-songs").style.display = 'block';
    document.getElementById('song-img').src = result.pic_url;
    document.getElementById('song-desc').textContent = result.title;
}

function showPlaylistSongs(playlist_name) {
    console.log("showplaylistsongs was called")
    document.getElementById("songList").style.display = 'none';
    document.getElementById("playlist-container").style.display = 'none';
    document.getElementById("playlistSongs").style.display = 'block';
    document.getElementById("playlist-name").textContent = playlist_name;
    getPlaylistSongs()
    showAddedSongsPlaylist(playlist_name)
}

async function deletePlaylist(playlist_name) {
    let result = await go_backend_json('playlist', 'DELETE', { playlist_name: playlist_name })
    if (result.status === true) {
        alert("Playlist deleted")
    }
    else {
        alert("Error in deleting the playlist")
    }

}

async function playlist_backend(playlistName) {
    console.log("inside the plalist_backend")
    let result = await go_backend_json('playlist', 'POST', { playlist_name: playlistName })
    console.log(result.status)
    if (result.status == false) {
        alert("Playlist name already exists")
        return
    }
    let user_playlist_container = document.querySelector('.user-playlists');
    playlists(user_playlist_container, playlistName)
    closeAuthOverlay()
}

function playlists(user_playlist_container, playlistName) {
    let songs_div = document.createElement('div');
    songs_div.style.width = '600px';
    songs_div.style.height = '50px';
    songs_div.style.margin = '10px 0';
    songs_div.style.backgroundColor = '#D3D3D3';
    songs_div.style.display = 'flex';
    songs_div.style.alignItems = 'center';
    songs_div.style.padding = '0 20px';
    songs_div.style.color = '#F0F0F0';
    songs_div.style.fontSize = '18px';
    songs_div.style.fontWeight = 'bold';
    songs_div.style.borderRadius = '8px';
    songs_div.style.fontFamily = '"Dancing Script", cursive';
    songs_div.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    songs_div.className = 'playlists';
    console.log("Playlist name is : " + playlistName.toUpperCase())
    songs_div.textContent = playlistName.toUpperCase();
    let delete_img = document.createElement('img');
    delete_img.src = 'http://127.0.0.1:8000/static/spotifyhome/delete.jpg';
    delete_img.alt = 'Delete';
    delete_img.style.width = '20px';
    delete_img.style.height = '20px';
    delete_img.style.cursor = 'pointer';
    delete_img.style.marginLeft = 'auto';
    delete_img.style.borderRadius = '50%';
    delete_img.className = 'deleteplaylist'
    songs_div.appendChild(delete_img);
    user_playlist_container.appendChild(songs_div);
}


async function getPlaylists() {
    try {
        let result = await go_backend_json('playlist', 'GET');
        if (result.status === true) {
            console.log("before user_playlist_container")
            let user_playlist_container = document.querySelector('.user-playlists');
            console.log("Playlist data fetched:", result.data);
            result.data.forEach(record => {
                playlists(user_playlist_container, record.playlist_name);
            });
        } else {
            console.error("Failed to fetch playlists");
        }
    } catch (error) {
        console.error("Error fetching playlists:", error);
    }
}

function showLikedAddedSongs(table, record, index) {
    let songData = record.song.song_data.song;
    let row = document.createElement('tr');
    row.innerHTML = `
        
        <td class='tdata'>${index + 1}</td>
        <td class='tdata'><img src="${songData.pic_url}" alt="Track Canvas" style="width: 50px; height: 50px;"></td>
        <td class='tdata'>${songData.title}</td>
        <td class='action-img-cell'>
            <img 
                src="http://127.0.0.1:8000/static/spotifyhome/remove.png" 
                alt="Action Icon" 
                style="width: 24px; height: 24px; cursor: pointer;" 
            >
        </td>
    `;
    const actionIcon = row.querySelector('.action-img-cell img');
    if (actionIcon) {
        actionIcon.addEventListener('click', function (event) {
            event.stopPropagation();
            handleRowAction(this, 'liked');
        });
    }
    row.dataset.record = JSON.stringify(record);
    row.addEventListener('click', function (event) {
        // alert("this rows is clicked and the index is " + index)
        playToggle(index)
    });
    row.dataset.record = JSON.stringify(record);
    table.appendChild(row);
}

async function getLikedSongs() {
    try {
        console.log("inside the getLikedSongs")
        let result = await go_backend_json('liked', 'GET')
        const likedtable = document.querySelector('.likedsong-list tbody')
        likedtable.innerHTML = ''
        if (result.status === true) {
            console.log("the if condition is passed")
            result.songs.forEach((record, index) => {
                showLikedAddedSongs(likedtable, record, index);
            });
        } else {
            console.log("The else is passed")
            const nosongsdiv = document.getElementById('nosongsliked')
            nosongsdiv.innerHTML = ''
            let noSongs = document.createElement('p');
            nosongsdiv.style.display = 'block'
            noSongs.textContent = "⭐ No liked songs yet. 👍 Add some jams!";
            noSongs.style.textAlign = 'center';
            noSongs.style.marginTop = '20px';
            noSongs.style.fontFamily = '"Dancing Script", cursive';
            noSongs.style.fontSize = '15px';
            noSongs.style.color = 'white';
            nosongsdiv.append(noSongs)

        }
    }
    catch (error) {
        console.error("Error fetching liked songs:", error);
    }
}

function showFavAddedSongs(table, record, index) {
    let songData = record.song.song_data.song;
    let row = document.createElement('tr');
    row.innerHTML = `
        
        <td class='tdata'>${index + 1}</td>
        <td class='tdata'><img src="${songData.pic_url}" alt="Track Canvas" style="width: 50px; height: 50px;"></td>
        <td class='tdata'>${songData.title}</td>
        <td class='action-img-cell'>
            <img 
                src="http://127.0.0.1:8000/static/spotifyhome/remove.png" 
                alt="Action Icon" 
                style="width: 24px; height: 24px; cursor: pointer;" 
            >
        </td>
    `;
    const actionIcon = row.querySelector('.action-img-cell img');
    if (actionIcon) {
        actionIcon.addEventListener('click', function (event) {
            event.stopPropagation();
            handleRowAction(this, 'fav');
        });
    }
    row.dataset.record = JSON.stringify(record);
    row.addEventListener('click', function (event) {
        // alert("this rows is clicked and the index is " + index)
        playToggle(index)
    })
    row.dataset.record = JSON.stringify(record);
    table.appendChild(row);
}

async function getFavSongs() {
    try {
        let result = await go_backend_json('favourite', 'GET')
        const favtable = document.querySelector('.favsong-list tbody')
        favtable.innerHTML = ''
        if (result.status === true) {
            console.log("the if condition is passed")
            result.songs.forEach((record, index) => {
                showFavAddedSongs(favtable, record, index);
            });
        } else {
            const nosongsdiv = document.getElementById('nosongsfav')
            nosongsdiv.innerHTML = ''
            let noSongs = document.createElement('p');
            nosongsdiv.style.display = 'block'
            noSongs.textContent = "💖 No favourites yet! ❤️ Add some love!";
            noSongs.style.textAlign = 'center';
            noSongs.style.marginTop = '20px';
            noSongs.style.fontFamily = '"Dancing Script", cursive';
            noSongs.style.fontSize = '15px';
            noSongs.style.color = 'white';
            nosongsdiv.append(noSongs)

        }
    }
    catch (error) {
        console.error("Error fetching liked songs:", error);
    }
}
function printGlobalVars() {
    console.log("inside the printGlobalVars method")
    console.log("The song queue is " + songQueue);
    console.log("The isQueuePlaying is " + isQueuePlaying);
    console.log("The current index is " + currentIndex)

}
async function getLikedSongsPlay() {
    resetGlobalPlaylistVariables();
    try {
        console.log("inside the getLikedSongsPlay")
        let result = await go_backend_json('liked', 'GET');
        if (result.status === true) {
            console.log(result.songs)
            const songs = result.songs.map(item => item.song.song_data.song.video_id);
            songQueue.push(...songs);
            console.log(songQueue)
            printGlobalVars()
        }
        else {
            console.log("Failed to get liked songs")
        }
    }
    catch (error) {
        console.log("Error in getting liked songs")
    }
}

async function getFavSongsPlay() {
    resetGlobalPlaylistVariables();
    try {
        console.log("inside the getFavSongsPlay")
        let result = await go_backend_json('favourite', 'GET');
        if (result.status === true) {
            console.log(result.songs)
            const songs = result.songs.map(item => item.song.song_data.song.video_id);
            songQueue.push(...songs);
            console.log(songQueue)
            printGlobalVars()
        }
        else {
            console.log("Failed to get favourite songs")
        }
    }
    catch (error) {
        console.log("Error in getting favourite songs")
    }
}

function showPages(input) {
    console.log("inside the showPages")
    if (input == 'playlist') {
        console.log("inside the playlist")
        document.getElementById("songList").style.display = 'none';
        document.getElementById('audio-player-container').style.display = 'none';
        document.getElementById('likedsongs-container').style.display = 'none';
        document.getElementById('favsongs-container').style.display = 'none'
        let playlistContainer = document.getElementById("playlist-container");
        playlistContainer.style.display = 'block';
        let remove_playlist_containers = document.querySelector('.user-playlists');
        remove_playlist_containers.innerHTML = ""
        getPlaylists()
    }
    else if (input == 'liked') {
        console.log("inside the liked")
        document.getElementById("songList").style.display = 'none';
        document.getElementById("playlist-container").style.display = 'none';
        document.getElementById('audio-player-container').style.display = 'none';
        document.getElementById('favsongs-container').style.display = 'none'
        let likedSongsContainer = document.getElementById('likedsongs-container')
        likedSongsContainer.style.display = 'block';
        getLikedSongsPlay();
        console.log("getlikedsongsplay was called")
        getLikedSongs();
        console.log("getlikedsongs was called")


    }
    else {
        console.log("inside the favorites")
        document.getElementById("songList").style.display = 'none';
        document.getElementById("playlist-container").style.display = 'none';
        document.getElementById('audio-player-container').style.display = 'none';
        document.getElementById('likedsongs-container').style.display = 'none';
        let favSongsContainer = document.getElementById('favsongs-container');
        favSongsContainer.style.display = 'block';
        getFavSongsPlay();
        console.log("getfavsongsplay was called")
        getFavSongs();
        console.log("getfavsongs was called")
    }

}

async function checkLoggedUser() {
    let userCheck = await getCurrentUser()
    console.log(userCheck)
    if (userCheck.status !== true) {
        openAuthOverlay('login')
    }
    else {
        openUserDetails()
    }
}

async function logout() {
    try {
        console.log("Inside the logout method")
        let result = await go_backend_json('logout', 'POST')
        if (result.status == true) {
            alert("Successfully logged out")
        }
        else {
            alert("Failed to log out")
        }
        closeUserDetails()
    }
    catch (error) {
        console.error('Logout Error:', error);
        alert("Can't be able to logout");
    }

}

function closeUserDetails() {
    document.getElementById('side-layout').style.display = 'none'
}

async function openUserDetails() {
    const side_layout = document.getElementById('side-layout')
    side_layout.style.display = 'block';
    const user_mail_id = document.getElementById('user-mail-id')
    const value = await getCurrentUser()
    user_mail_id.textContent = value.user.email
    document.getElementById('side-close').addEventListener('click', (event) => {
        side_layout.style.display = 'none';
    });

}

async function email_submit(message) {
    try {
        console.log("inside the email-submit method")
        let result = await go_backend_json('email', 'POST', {
            message: message
        });
        console.log(result.status);
        if (result.status === true) {
            alert('Mail Successfully sent');
            closeAuthOverlay()
        } else {
            alert('Sending failed');
        }

    } catch (error) {
        console.error('Mail Error:', error);
        alert('Cannot send mail');
    }
}


async function getCurrentUser() {
    try {
        let result = await go_backend_json('user_details', 'GET');
        console.log(result);
        if (result.status === true) {

            // alert(result.user.username + " " + result.user.email);
        } else {
            // alert('Getting userdetails Failed');
        }
        return result;

    } catch (error) {
        console.error('Userdetails Error:', error);
        alert('Cannot get user details');
        return { status: false }
    }
}

async function reg_submit(username, email, password) {
    console.log("Inside the reg_submit");
    try {
        let result = await go_backend_json('signin', 'POST', {
            username: username,
            email: email,
            password: password
        });
        console.log(result);
        if (result.status === true) {
            alert('Registration Successful');
        } else {
            alert('Not registered');
        }
        closeAuthOverlay();
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed');
    }
}

async function login_submit(email, password) {
    console.log("Inside the login_submit");
    try {
        let result = await go_backend_json('login', 'POST', {
            email: email,
            password: password
        });
        console.log(result);
        if (result.status === true) {
            alert('Login successful');
        } else {
            alert('No account exists');
        }
        closeAuthOverlay();
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed');
    }
}

function closeAuthOverlay() {
    console.log("Inside the closeAuthOverlay")
    document.getElementById('authOverlay').style.display = 'none'
}


function openAuthOverlay(action) {
    console.log("Inside the openAuthOverlay")
    document.getElementById('authOverlay').style.display = 'flex';
    document.getElementById('loginForm').style.display = action == 'login' ? 'block' : 'none';
    document.getElementById('registerForm').style.display = action == 'signin' ? 'block' : 'none';
    document.getElementById('emailForm').style.display = action == 'email' ? 'block' : 'none';
    document.getElementById('playlistSong').style.display = action == 'playlist' ? 'block' : 'none';
    document.getElementById('settings').style.display = action == 'settings' ? 'block' : 'none';
}



function changeIcon(type, element, base_url) {
    let element_path = element.src;
    console.log(element_path);
    if (type == 'like') {
        if (element_path === 'http://127.0.0.1:8000/static/spotifyhome/add_like1.jpg') {
            console.log("Inside the changeIcon method, the song_data is : " + song_data)
            addToLikedSongs(element, base_url)
        }
        else {
            removeFromLikedSongs(element, base_url)
        }
    }
    else {
        if (element_path === 'http://127.0.0.1:8000/static/spotifyhome/h1.jpg') {
            addToFavouriteSongs(element, base_url)
        }
        else {
            removeFromFavouriteSongs(element, base_url)
        }
    }

}

async function addToLikedSongs(element, base_url) {
    console.log("Inside the addToLikedSongs method")
    console.log("Song data : " + song_data)
    const pic_url = base_url + 'add_liked1.jpg';
    let result = await go_backend_json('liked', 'POST', { song: song_data })
    console.log(result.message)
    element.src = pic_url;
    alert("Added to Liked Songs : " + song_data.title)
}



async function removeFromLikedSongs(element, base_url) {
    console.log("Inside the addToLikedSongs method")
    console.log("Song data : " + song_data)
    const pic_url = base_url + 'add_like1.jpg';
    let result = await go_backend_json('liked', 'DELETE', { song: song_data })
    element.src = pic_url;
    alert("Removed from Liked Songs : " + song_data.title)
}

async function addToFavouriteSongs(element, base_url) {
    console.log("Inside the addToFavouriteSongs method")
    console.log("Song data : " + song_data)
    let result = await go_backend_json('favourite', 'POST', { song: song_data })
    const pic_url = base_url + 'h2.jpg';
    element.src = pic_url;
    alert("Added to Favourites : " + song_data.title)
}

async function removeFromFavouriteSongs(element, base_url) {
    console.log("Inside the removeFromFavouriteSongs method")
    console.log("Song data : " + song_data)
    let result = await go_backend_json('favourite', 'DELETE', { song: song_data })
    const pic_url = base_url + 'h1.jpg';
    element.src = pic_url;
    alert("Removed from Favourites : " + song_data.title)
}

function handleSearchKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleInput(event.target);
    }
}


function handleInput() {
    console.log("Inside the handle Input function");
    const searchValueSide = document.getElementById("side-search").value;
    const searchValue = document.getElementById("search").value;
    let search = '';
    if (searchValueSide) {
        search = searchValueSide;
        document.getElementById("side-search").value = '';
    } else if (searchValue) {
        search = searchValue;
        document.getElementById("search").value = '';
    }
    if (search) {
        fetch_song_details(search);
    }
    console.log("Search term:", search);
}

function displayPage() {
    console.log("Displaying main page");
    document.getElementById("audio-player-container").style.display = 'none';
    document.getElementById('playlist-container').style.display = 'none';
    document.querySelector(".scrollable-content").style.overflow = 'auto';
    document.getElementById("songList").style.display = 'block';
    document.getElementById("playlistSongs").style.display = 'none';
    document.getElementById('likedsongs-container').style.display = 'none';
    document.getElementById('favsongs-container').style.display = 'none';


}

async function fetch_song_details(song_name) {
    console.log('Fetching song:', song_name);
    const result = await go_backend_json('youtube', 'POST', { song_name: song_name });
    console.log("API response:", result);
    if (result && result.video_id) {
        playSong(result);
    } else {
        console.error('Error fetching song:', result?.error || 'Unknown error');
        alert('Failed to load the song. Please try again.');
    }
}

async function go_backend_json(endpoint = null, method = null, body = null) {
    const url = 'http://127.0.0.1:8000/api/' + endpoint + "/";
    const csrftoken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        };
        if (body !== null) {
            options.body = JSON.stringify(body);
        }
        if (method !== 'GET') {
            options.headers['X-CSRFToken'] = csrftoken;
        }

        const response = await fetch(url, options);
        console.log("Response : " + response)
        if (response.ok) {
            const result = await response.json();
            console.log("Result : " + JSON.stringify(result, null, 2))
            console.log("Inside the go_backend_json response was ok")
            if (endpoint == 'youtube') {
                song_data = result;
                console.log("Song data : " + JSON.stringify(song_data, null, 2))
            }

            return result;
        } else {
            return { error: `Error: ${response.statusText}` };
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
        return { error: error.message };
    }
}

function pathToFavButton(FavOrNot) {
    if (FavOrNot == true) {
        let fav_pic_url = base_url + 'h2.jpg';
        console.log("FavPicUrl : " + fav_pic_url)
        fav.src = fav_pic_url
    }
    else {
        let notfav_pic_url = base_url + 'h1.jpg';
        console.log("NotFavPicUrl : " + notfav_pic_url)
        fav.src = notfav_pic_url
    }
}

function pathToLikeButton(LikedOrNot) {
    if (LikedOrNot == true) {
        let liked_pic_url = base_url + 'add_liked1.jpg';
        console.log("LikedPicUrl : " + liked_pic_url)
        like.src = liked_pic_url
    }
    else {
        let notliked_pic_url = base_url + 'add_like1.jpg';
        console.log("Not Liked Pic Url : " + notliked_pic_url)
        like.src = notliked_pic_url
    }
}


async function playSong(result) {
    const videoId = result.video_id;
    console.log("Attempting to play song with ID:", videoId);
    document.getElementById("songList").style.display = 'none';
    document.getElementById("audio-player-container").style.display = 'block';
    document.querySelector(".scrollable-content").style.overflow = 'hidden';
    document.getElementById("playlistSongs").style.display = 'none';
    document.getElementById('likedsongs-container').style.display = 'none';
    document.getElementById('favsongs-container').style.display = 'none';
    document.getElementById('playlist-container').style.display = 'none';


    const playPic = document.getElementById("play-pic");
    if (playPic) {
        playPic.src = result.pic_url;
    }

    const songDetails = document.getElementById("songs-details");
    if (songDetails) {
        let videoTitle = result.title;
        if (videoTitle.includes("Video Song")) {
            videoTitle = videoTitle.replace("Video Song", "").trim();
        }
        songDetails.textContent = videoTitle;
    }

    let checkSongLikedOrNot = await go_backend_json('checkLiked', 'POST', { songData: result })
    console.log("Song present in the Likedmodel : " + checkSongLikedOrNot.status)
    pathToLikeButton(checkSongLikedOrNot.status)

    let checkSongFav = await go_backend_json('checkFav', 'POST', { songData: result })
    console.log("Song present in the FavModel : " + checkSongFav.status)
    pathToFavButton(checkSongFav.status)


    if (!youtubePlayer || !youtubePlayer.loadVideoById) {
        console.error('YouTube player not fully initialized. Retrying in 1 second.');
        setTimeout(() => playSong(videoId), 1000);
        return;
    }

    if (videoId) {
        try {

            youtubePlayer.loadVideoById(videoId);
            youtubePlayer.playVideo();
        } catch (error) {
            console.error('Error playing video:', error);
            alert('An error occurred while trying to play the video. Please try again.');
            isPlaying = false;
            document.getElementById("play-pause").textContent = 'Play';
        }
    } else {
        console.error('Invalid YouTube video ID');
        alert('Invalid video ID. Please try another song.');
        isPlaying = false;
        document.getElementById("play-pause").textContent = 'Play';
    }
}

function togglePlayPause() {
    console.log("Toggling play/pause");
    if (!youtubePlayer) {
        console.error('YouTube player not initialized');
        return;
    }
    const playerState = youtubePlayer.getPlayerState();

    if (playerState === YT.PlayerState.PLAYING) {
        youtubePlayer.pauseVideo();
        isPlaying = false;
        document.getElementById("play-pause").textContent = 'Play';
    } else {
        youtubePlayer.playVideo();
        isPlaying = true;
        document.getElementById("play-pause").textContent = 'Pause';
    }
}

function updateProgressBar() {
    if (youtubePlayer && youtubePlayer.getCurrentTime && youtubePlayer.getDuration) {
        const currentTime = youtubePlayer.getCurrentTime();
        const duration = youtubePlayer.getDuration();
        const progressPercent = (currentTime / duration) * 100;
        document.getElementById('progress-bar').value = progressPercent;
        document.getElementById('current-time').textContent = formatTime(currentTime);
        document.getElementById('duration').textContent = formatTime(duration);
    }
}

function seekTo() {
    console.log("Seeking to new position");
    if (!youtubePlayer) {
        console.error('YouTube player not initialized');
        return;
    }
    const newTime = youtubePlayer.getDuration() * (document.getElementById('progress-bar').value / 100);
    youtubePlayer.seekTo(newTime, true);
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

if (typeof YT === 'undefined') {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

window.onload = function () {
    resetGlobalPlaylistVariables()
}