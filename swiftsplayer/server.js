const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./database/db');
const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');

// YouTube Video Downloader 
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Serve downloaded files
const downloadsDir = path.join(__dirname, 'downloads');


app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use('/fontawesome', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free')));


app.use('/', indexRouter);
app.use('/admin', adminRouter);

// YouTube Video Downloader 
// Get YouTube Video Info
app.get('/info', async (req, res) => {
    const videoURL = req.query.url;

    if (!ytdl.validateURL(videoURL)) {
        return res.json({ success: false, message: 'Invalid YouTube URL' });
    }

    try {
        const info = await ytdl.getInfo(videoURL);

        const videoDetails = {
            title: info.videoDetails.title,
            thumbnail: info.videoDetails.thumbnails.pop().url,
            duration: `${Math.floor(info.videoDetails.lengthSeconds / 60)}:${info.videoDetails.lengthSeconds % 60}`,
            uploader: info.videoDetails.author.name,
            views: info.videoDetails.viewCount,
            uploadDate: info.videoDetails.uploadDate
        };

        res.json({ success: true, videoDetails });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Failed to fetch video info' });
    }
});

// Handle Form Submission - Save to Database
// Download Video & Save to Database
app.post('/admin/upload', async (req, res) => {
    const { video_url, title, uploader, duration, views, upload_date, thumbnail } = req.body;

    try {
        if (!ytdl.validateURL(video_url)) {
            return res.send('Invalid YouTube URL');
        }

        const videoID = ytdl.getURLVideoID(video_url);
        const filePath = path.join(downloadsDir, `${videoID}.mp4`);

        console.log('Downloading video:', title);

        // const videoStream = ytdl(video_url, {
        //     quality: 'highest',
        //     filter: 'audioandvideo'
        // });

        // const writeStream = fs.createWriteStream(filePath);

        // videoStream.pipe(writeStream);

        // writeStream.on('finish', () => {
        //     console.log('Download complete:', filePath);

        //     // Save details in the database
        //     const sql = `INSERT INTO videos (video_url, title, uploader, duration, views, upload_date, thumbnail, file_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        //     db.query(sql, [video_url, title, uploader, duration, views, upload_date, thumbnail, filePath], (err, result) => {
        //         if (err) {
        //             console.error('Database error:', err);
        //             return res.send('Error saving data.');
        //         }
        //         res.send(`Video downloaded and details saved successfully! File: <a href="/downloads/${videoID}.mp4" target="_blank">Download Here</a>`);
        //     });
        // });

    } catch (error) {
        console.error('Error downloading video:', error);
        res.send('Failed to download video.');
    }
});



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
