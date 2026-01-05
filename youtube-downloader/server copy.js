const express = require('express');
const fs = require('fs');
const path = require('path');
const ytdl = require('@distube/ytdl-core');

const app = express();
const PORT = 3001;

// Serve static files (HTML)
app.use(express.static('public'));

// Ensure downloads folder exists
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir);
}

app.get('/download', async (req, res) => {
    const videoURL = req.query.url;

    if (!ytdl.validateURL(videoURL)) {
        return res.json({ success: false, message: 'Invalid YouTube URL' });
    }

    try {
        const videoID = ytdl.getURLVideoID(videoURL);
        const filePath = path.join(downloadsDir, `${videoID}.mp4`);

        const videoStream = ytdl(videoURL, {
            quality: 'highest',  // Get the best quality
            filter: 'audioandvideo' // Ensure audio + video
        });

        videoStream.pipe(fs.createWriteStream(filePath))
            .on('finish', () => {
                res.json({ success: true, file: `/downloads/${videoID}.mp4` });
            })
            .on('error', (err) => {
                console.error("Download error:", err);
                res.json({ success: false, message: 'Download failed' });
            });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Download failed' });
    }
});

// Serve downloaded files
app.use('/downloads', express.static(downloadsDir));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
