const express = require('express');
const fs = require('fs');
const path = require('path');
const ytdl = require('@distube/ytdl-core');

const app = express();
const PORT = 3001;

app.use(express.static('public'));

app.get('/info', async (req, res) => {
    const videoURL = req.query.url;

    if (!ytdl.validateURL(videoURL)) {
        return res.json({ success: false, message: 'Invalid YouTube URL' });
    }

    try {
        const info = await ytdl.getInfo(videoURL);

        const videoDetails = {
            title: info.videoDetails.title,
            thumbnail: info.videoDetails.thumbnails.pop().url,  // Get highest resolution thumbnail
            duration: `${Math.floor(info.videoDetails.lengthSeconds / 60)}:${info.videoDetails.lengthSeconds % 60}`,
            uploader: info.videoDetails.author.name,
            views: info.videoDetails.viewCount,
            uploadDate: info.videoDetails.uploadDate,
            formats: info.formats.map(format => ({
                quality: format.qualityLabel,
                mimeType: format.mimeType
            }))
        };

        res.json({ success: true, videoDetails });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Failed to fetch video info' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
