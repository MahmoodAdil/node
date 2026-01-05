$(document).ready(function () {
    // Get video and control elements
    const videoPlayer = document.getElementById('videoPlayer');
    const playPauseBtn = $('#playPauseBtn');
    const playPauseIcon = $('#playPauseIcon');
    const loopBtn = $('#loopBtn');
    const loopIcon = $('#loopIcon');
    const playAllBtn = $('#playAllBtn');
    const playAllIcon = $('#playAllIcon');
    const muteBtn = $('#muteBtn');
    const volumeSlider = $('#volumeSlider');
    const volumeIcon = $('#volumeIcon');
    const progressBar = $('#progressBar');

    let isPlayAllEnabled = false;
    let currentVideoIndex = 0;
    let videos = []; // Array to store video file paths and titles

    // Fetch videos from the server or populate from the DOM
    function fetchVideos() {
        videos = [];
        $('.list-group-item').each(function () {
            const filePath = $(this).attr('onclick').match(/'(.*?)'/)[1];
            const title = $(this).find('strong').text();
            videos.push({ filePath, title });
        });
    }

    // Play/Pause Button
    playPauseBtn.on('click', function () {
        if (videoPlayer.paused) {
            videoPlayer.play().then(() => {
                playPauseIcon.removeClass('fa-play').addClass('fa-pause');
                playPauseBtn.html('<i class="fas fa-pause"></i> Pause').removeClass('btn-success').addClass('btn-warning');
            }).catch((error) => {
                console.error('Error Playing Video:', error);
            });
        } else {
            videoPlayer.pause();
            playPauseIcon.removeClass('fa-pause').addClass('fa-play');
            playPauseBtn.html('<i class="fas fa-play"></i> Play').removeClass('btn-warning').addClass('btn-success');
        }
    });

    // Sync play/pause button with video state
    videoPlayer.addEventListener('play', function () {
        playPauseIcon.removeClass('fa-play').addClass('fa-pause');
        playPauseBtn.html('<i class="fas fa-pause"></i> Pause').removeClass('btn-success').addClass('btn-warning');
    });

    videoPlayer.addEventListener('pause', function () {
        playPauseIcon.removeClass('fa-pause').addClass('fa-play');
        playPauseBtn.html('<i class="fas fa-play"></i> Play').removeClass('btn-warning').addClass('btn-success');
    });

    // Loop Toggle Button
    loopBtn.on('click', function () {
        videoPlayer.loop = !videoPlayer.loop;
        if (videoPlayer.loop) {
            loopIcon.removeClass('fa-sync').addClass('fa-sync-alt');
            loopBtn.html('<i class="fas fa-sync-alt"></i> Loop On').removeClass('btn-info').addClass('btn-success');
        } else {
            loopIcon.removeClass('fa-sync-alt').addClass('fa-sync');
            loopBtn.html('<i class="fas fa-sync"></i> Loop Off').removeClass('btn-success').addClass('btn-info');
        }
    });

    // Sync loop button with video state
    videoPlayer.addEventListener('loadedmetadata', function () {
        if (videoPlayer.loop) {
            loopBtn.html('<i class="fas fa-sync-alt"></i> Loop On').removeClass('btn-info').addClass('btn-success');
        } else {
            loopBtn.html('<i class="fas fa-sync"></i> Loop Off').removeClass('btn-success').addClass('btn-info');
        }
    });

    // Mute Button
    muteBtn.on('click', function () {
        videoPlayer.muted = !videoPlayer.muted;
        if (videoPlayer.muted) {
            volumeIcon.removeClass('fa-volume-up').addClass('fa-volume-mute');
            muteBtn.removeClass('btn-secondary').addClass('btn-danger');
        } else {
            volumeIcon.removeClass('fa-volume-mute').addClass('fa-volume-up');
            muteBtn.removeClass('btn-danger').addClass('btn-secondary');
        }
    });

    // Volume Slider
    volumeSlider.on('input', function () {
        const volume = this.value;
        videoPlayer.volume = volume;
        videoPlayer.muted = volume == 0;

        if (volume == 0) {
            volumeIcon.removeClass('fa-volume-up').addClass('fa-volume-mute');
            muteBtn.removeClass('btn-secondary').addClass('btn-danger');
        } else {
            volumeIcon.removeClass('fa-volume-mute').addClass('fa-volume-up');
            muteBtn.removeClass('btn-danger').addClass('btn-secondary');
        }

        $('#volumeValue').text(`${Math.round(volume * 100)}%`);
    });

    // Progress Bar
    videoPlayer.addEventListener('timeupdate', function () {
        const progress = (videoPlayer.currentTime / videoPlayer.duration) * 100;
        progressBar.css('width', progress + '%');
    });

    // Make progress bar seekable
    $('.progress').on('click', function (e) {
        const rect = this.getBoundingClientRect();
        const clickPosition = (e.clientX - rect.left) / rect.width;
        videoPlayer.currentTime = clickPosition * videoPlayer.duration;
    });

    // Play Video Function
    window.playVideo = function (filePath, title) {
        videoPlayer.setAttribute('src', filePath);
        videoPlayer.play().then(() => {
            // Update the current video index
            currentVideoIndex = videos.findIndex(video => video.filePath === filePath);
        }).catch((error) => {
            console.error('Error Playing Video:', error);
        });
        $('.main-content strong').text(title);
    };

    // Play All Button
    playAllBtn.on('click', function () {
        isPlayAllEnabled = !isPlayAllEnabled;
        if (isPlayAllEnabled) {
            playAllIcon.removeClass('fa-play-circle').addClass('fa-stop-circle');
            playAllBtn.html('<i class="fas fa-stop-circle"></i> Stop All').removeClass('btn-primary').addClass('btn-danger');
            playNextVideo();
        } else {
            playAllIcon.removeClass('fa-stop-circle').addClass('fa-play-circle');
            playAllBtn.html('<i class="fas fa-play-circle"></i> Play All').removeClass('btn-danger').addClass('btn-primary');
        }
    });

    // Play the next video in the list
    function playNextVideo() {
        if (isPlayAllEnabled && currentVideoIndex < videos.length - 1) {
            currentVideoIndex++;
            const nextVideo = videos[currentVideoIndex];
            playVideo(nextVideo.filePath, nextVideo.title);
        } else if (isPlayAllEnabled && currentVideoIndex === videos.length - 1) {
            // If it's the last video, stop Play All
            isPlayAllEnabled = false;
            playAllIcon.removeClass('fa-stop-circle').addClass('fa-play-circle');
            playAllBtn.html('<i class="fas fa-play-circle"></i> Play All').removeClass('btn-danger').addClass('btn-primary');
        }
    }

    // Automatically play the next video when the current one ends
    videoPlayer.addEventListener('ended', function () {
        if (isPlayAllEnabled) {
            playNextVideo();
        }
    });

    // Fetch videos when the page loads
    fetchVideos();
});