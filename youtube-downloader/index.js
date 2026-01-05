const fs = require('fs');
// const ytdl = require('ytdl-core');
const ytdl = require("@distube/ytdl-core");

const downloadVideo = async (url, outputPath) => {
    if (!ytdl.validateURL(url)) {
        console.log("Invalid YouTube URL");
        return;
    }

    console.log("Downloading...");

    ytdl(url, { quality: 'highest' })
        .pipe(fs.createWriteStream(outputPath))
        .on('finish', () => console.log("Download complete!"))
        .on('error', (err) => console.error("Error:", err));
};

const youtubeURL = 'https://www.youtube.com/watch?v=7fyAtfGytGk&list=RD7fyAtfGytGk&start_radio=1&ab_channel=KidsMadaniChannel';
downloadVideo(youtubeURL, 'video.mp4');
