$(document).ready(function () {
    // Get video and control elements
    const videoPlayer = document.getElementById('videoPlayer');
    const playPauseBtn = $('#playPauseBtn');
    const playPauseIcon = $('#playPauseIcon');
    const loopBtn = $('#loopBtn');
    const loopIcon = $('#loopIcon');
    const muteBtn = $('#muteBtn');
    const volumeSlider = $('#volumeSlider');
    const volumeIcon = $('#volumeIcon');
    const progressBar = $('#progressBar');

    // Play/Pause Button
    playPauseBtn.on('click', function () {
        if (videoPlayer.paused) {
            videoPlayer.play().then(() => {
                // console.log('Video Played');
                playPauseIcon.removeClass('fa-play').addClass('fa-pause');
                playPauseBtn.html('<i class="fas fa-pause"></i> Pause').removeClass('btn-success').addClass('btn-warning');
            }).catch((error) => {
                console.error('Error Playing Video:', error);
            });
        } else {
            videoPlayer.pause();
            // console.log('Video Paused');
            playPauseIcon.removeClass('fa-pause').addClass('fa-play');
            playPauseBtn.html('<i class="fas fa-play"></i> Play').removeClass('btn-warning').addClass('btn-success');
        }
    });

    // Sync play/pause button with video state
    videoPlayer.addEventListener('play', function () {
        // console.log('Video Play Event Triggered');
        playPauseIcon.removeClass('fa-play').addClass('fa-pause');
        playPauseBtn.html('<i class="fas fa-pause"></i> Pause').removeClass('btn-success').addClass('btn-warning');
    });

    videoPlayer.addEventListener('pause', function () {
        // console.log('Video Pause Event Triggered');
        playPauseIcon.removeClass('fa-pause').addClass('fa-play');
        playPauseBtn.html('<i class="fas fa-play"></i> Play').removeClass('btn-warning').addClass('btn-success');
    });

    // Loop Toggle Button
    loopBtn.on('click', function () {
        videoPlayer.loop = !videoPlayer.loop;
        // console.log('Loop Button Toggled:', videoPlayer.loop);
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
        // console.log('Video Metadata Loaded');
        if (videoPlayer.loop) {
            loopBtn.html('<i class="fas fa-sync-alt"></i> Loop On').removeClass('btn-info').addClass('btn-success');
        } else {
            loopBtn.html('<i class="fas fa-sync"></i> Loop Off').removeClass('btn-success').addClass('btn-info');
        }
    });

    // Mute Button
    muteBtn.on('click', function () {
        // console.log('Mute Button Clicked');
        videoPlayer.muted = !videoPlayer.muted;
        if (videoPlayer.muted) {
            volumeIcon.removeClass('fa-volume-up').addClass('fa-volume-mute');
            muteBtn.removeClass('btn-secondary').addClass('btn-danger'); // Red color when muted
        } else {
            volumeIcon.removeClass('fa-volume-mute').addClass('fa-volume-up');
            muteBtn.removeClass('btn-danger').addClass('btn-secondary'); // Gray color when unmuted
        }
    });

    // Volume Slider
    volumeSlider.on('input', function () {
        const volume = this.value;
        // console.log('Volume Slider Changed:', volume);

        // Set video volume and mute state
        videoPlayer.volume = volume;
        videoPlayer.muted = volume == 0;

        // Toggle volume icon based on volume level
        if (volume == 0) {
            volumeIcon.removeClass('fa-volume-up').addClass('fa-volume-mute');
            muteBtn.removeClass('btn-secondary').addClass('btn-danger'); // Red color when muted
        } else {
            volumeIcon.removeClass('fa-volume-mute').addClass('fa-volume-up');
            muteBtn.removeClass('btn-danger').addClass('btn-secondary'); // Gray color when unmuted
        }

        // Update volume percentage display
        $('#volumeValue').text(`${Math.round(volume * 100)}%`);
    });

    // Progress Bar
    videoPlayer.addEventListener('timeupdate', function () {
        const progress = (videoPlayer.currentTime / videoPlayer.duration) * 100;
        progressBar.css('width', progress + '%');
        // console.log('Video Progress:', progress + '%');
    });

    // Make progress bar seekable
    $('.progress').on('click', function (e) {
        const rect = this.getBoundingClientRect();
        const clickPosition = (e.clientX - rect.left) / rect.width;
        videoPlayer.currentTime = clickPosition * videoPlayer.duration;
        // console.log('Progress Bar Clicked:', clickPosition);
    });

    // Play Video Function
    window.playVideo = function (filePath, title) {
        // console.log('Playing Video:', filePath);
        videoPlayer.setAttribute('src', filePath);
        videoPlayer.play().then(() => {
            // console.log('Video Played Successfully');
        }).catch((error) => {
            console.error('Error Playing Video:', error);
        });
        $('.main-content strong').text(title);
    };


});



$(document).ready(function() {
    $('#toggle-example').bootstrapToggle();
  });