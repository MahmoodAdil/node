const express = require('express');
const app = express(); //Define app instance here
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database/db');
const router = express.Router();



// YouTube Video
const ytdl = require('@distube/ytdl-core');
const axios = require('axios'); // ✅ Required to download thumbnail images
// Serve downloaded files

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); // ✅ No need for body-parser
app.use(express.json()); // ✅ Handles JSON payloads


// ✅ Define download directories
const downloadsDir = path.join(__dirname, '../public/videos');
const thumbnailsDir = path.join(__dirname, '../public/thumbnails');

// ✅ Ensure directories exist
if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir);
if (!fs.existsSync(thumbnailsDir)) fs.mkdirSync(thumbnailsDir);

// ✅ Serve static files
app.use('/downloads', express.static(downloadsDir));
app.use('/thumbnails', express.static(thumbnailsDir));






// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Temporary upload folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});


const upload = multer({ storage: storage });
// Admin login page
router.get('/login', (req, res) => {
    res.render('admin/login');
});

// Admin dashboard

router.get('/dashboard', (req, res) => {
    const { album } = req.query;
    let query = "SELECT * FROM videos";
    let params = [];
    if (album) {
        query = `
            SELECT v.* FROM videos v
            JOIN video_albums va ON v.id = va.video_id
            WHERE va.album_id = ?
        `;
        params = [album];
    }
    db.all(query, params, (err, videos) => {
        if (err) {
            throw err;
        }
        db.all("SELECT * FROM albums", [], (err, albums) => {
            if (err) {
                throw err;
            }
            res.render('admin/dashboard', {
                videos,
                albums,
                selectedAlbumId: album || null,
                noVideosMessage: videos.length === 0 && album ? `No videos found in this album.` : null
            });
        });
    });
});

// New logic to move
// Upload Video Routeconst 
router.post('/upload', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), (req, res) => {
    const { title, description, groups } = req.body;

    // Ensure groups is an array
    const groupIds = Array.isArray(groups) ? groups : [groups].filter(Boolean);

    const videoFile = req.files['video'][0];
    const thumbnailFile = req.files['thumbnail'][0];
    console.log('videoFile 1:', videoFile);
    console.log('thumbnailFile 1 :', thumbnailFile);


    // Define destination paths
    const videoDestination = path.join(__dirname, '../public/videos', videoFile.filename);
    const thumbnailDestination = path.join(__dirname, '../public/thumbnails', thumbnailFile.filename);
    console.log('videoDestination 2:', videoDestination);
    console.log('thumbnailDestination 2:', thumbnailDestination);
    
    // Move files to the destination folder
    fs.rename(videoFile.path, videoDestination, (err) => {
        if (err) {
            console.error('Error Moving Video File:', err);
            return res.status(500).send('Error Moving Video File');
        }

        fs.rename(thumbnailFile.path, thumbnailDestination, (err) => {
            if (err) {
                console.error('Error Moving Thumbnail File:', err);
                return res.status(500).send('Error Moving Thumbnail File');
            }

            // Save video details to the database
            const videoPath = `/videos/${videoFile.filename}`;
            const thumbnailPath = `/thumbnails/${thumbnailFile.filename}`;

            db.run(
                "INSERT INTO videos (title, description, filePath, thumbnailPath) VALUES (?, ?, ?, ?)",
                [title, description, videoPath, thumbnailPath],
                function (err) {
                    if (err) {
                        console.error('Error Saving Video to Database:', err);
                        return res.status(500).send('Error Saving Video to Database');
                    }

                    const videoId = this.lastID;

                    // Save selected groups for the video
                    if (groupIds.length > 0) {
                        groupIds.forEach(groupId => {
                            db.run("INSERT INTO video_albums (video_id, album_id) VALUES (?, ?)", [videoId, groupId]);
                        });
                    }

                    res.redirect('/admin/dashboard');
                }
            );
        });
    });
});



// New temp to test post

// Upload Video Routeconst 
router.post('/downloadupload', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), async (req, res) => {
    // router.post('/downloadupload', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), (req, res) => {

    // const { title, description, groups } = req.body;
    const { video_url, title, uploader,groups, duration, views, upload_date, thumbnail } = req.body;
    // Ensure groups is an array
    const groupIds = Array.isArray(groups) ? groups : [groups].filter(Boolean);

    // const videoURL = video_url;
  

    // console.log("downloadupload got calllllll");
    // console.log("video_url: ",video_url);
    // console.log("videoURL: ",videoURL);
    // if (!ytdl.validateURL(videoURL)) {
    //     return res.json({ success: false, message: 'Invalid YouTube URL' });
    // }

    // try {
    //     const videoID = ytdl.getURLVideoID(videoURL);
    //     const filePath = path.join(downloadsDir, `${videoID}.mp4`);

    //     const videoStream = ytdl(videoURL, {
    //         quality: 'highest',  // Get the best quality
    //         filter: 'audioandvideo' // Ensure audio + video
    //     });

    //     videoStream.pipe(fs.createWriteStream(filePath))
    //         .on('finish', () => {
    //             res.json({ success: true, file: `/downloads/${videoID}.mp4` });
    //         })
    //         .on('error', (err) => {
    //             console.error("Download error:", err);
    //             res.json({ success: false, message: 'Download failed' });
    //         });

    // } catch (error) {
    //     console.error(error);
    //     res.json({ success: false, message: 'Download failed' });
    // }


    // Above code success to downloadsDir,

// Part done success
    // try {
    //         if (!ytdl.validateURL(video_url)) {
    //             return res.send('Invalid YouTube URL');
    //         }

    //         const videoID = ytdl.getURLVideoID(video_url);
    //         const filePath = path.join(downloadsDir, `${videoID}.mp4`);

    //         console.log('Downloading video:', title);

    //         const videoStream = ytdl(video_url, {
    //             quality: 'highest',
    //             filter: 'audioandvideo'
    //         });

    //         const writeStream = fs.createWriteStream(filePath);

    //         videoStream.pipe(writeStream);

    //         writeStream.on('finish', () => {
    //             console.log('Download complete:', filePath);

    //             // // Save details in the database
    //             // const sql = `INSERT INTO videos (video_url, title, uploader, duration, views, upload_date, thumbnail, file_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    //             // db.query(sql, [video_url, title, uploader, duration, views, upload_date, thumbnail, filePath], (err, result) => {
    //             //     if (err) {
    //             //         console.error('Database error:', err);
    //             //         return res.send('Error saving data.');
    //             //     }
    //             //     res.send(`Video downloaded and details saved successfully! File: <a href="/downloads/${videoID}.mp4" target="_blank">Download Here</a>`);
    //             // });
    //         });

    //     } catch (error) {
    //         console.error('Error downloading video:', error);
    //         res.send('Failed to download video.');
    // }

    // Download Video Part three with Download Video & Thumbnail,


    try {
        if (!ytdl.validateURL(video_url)) {
            return res.send('Invalid YouTube URL');
        }



       


        const videoID = ytdl.getURLVideoID(video_url);


         // cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
         const timeStap = Date.now();
         // ✅ Store relative paths instead of absolute ones
         const videoFileName = `${timeStap}+${videoID}.mp4`;
         const thumbnailFileName = `${timeStap}+${videoID}.jpg`;
 
         const videoPath= `../videos/${videoFileName}`;
         const thumbnailPath = `../thumbnails/${thumbnailFileName}`;
 
       
         console.log('timeStap 2 :', timeStap);
         console.log('videoPath1 2 :', videoPath);
         console.log('thumbnailPath1 2 :', thumbnailPath);



        const videoPath2 = path.join(downloadsDir, `${videoFileName}`);
        const thumbnailPath2 = path.join(thumbnailsDir, `${thumbnailFileName}`);
        console.log('videoPath 2:', videoPath);
        console.log('thumbnailPathpoint 2 :', thumbnailPath);
        
        console.log('Downloading video:', title);

        // ✅ Download Video
        const videoStream = ytdl(video_url, {
            quality: 'highest',
            filter: 'audioandvideo'
        });

        const writeStream = fs.createWriteStream(videoPath2);
        videoStream.pipe(writeStream);

        // ✅ Download Thumbnail
        const response = await axios({
            url: thumbnail,
            responseType: 'stream'
        });

        const thumbWriteStream = fs.createWriteStream(thumbnailPath2);
        response.data.pipe(thumbWriteStream);

        // ✅ Wait for both downloads to finish
        writeStream.on('finish', () => {
            console.log('Download complete:', videoPath2);
            console.log('Thumbnail downloaded point1 :', thumbnailPath2);
            
            
            // Save video details to the database
            // const videoPath = `/videos/${videoFile.filename}`;
            // const thumbnailPath = `/thumbnails/${thumbnailFile.filename}`;

            db.run(
                "INSERT INTO videos (title, description, filePath, thumbnailPath,views, upload_date) VALUES (?, ?, ?, ?, ?, ?)",
                [title, uploader, videoPath, thumbnailPath,views, upload_date],
                function (err) {
                    if (err) {
                        console.error('Error Saving Video to Database:', err);
                        return res.status(500).send('Error Saving Video to Database');
                    }

                    const videoId = this.lastID;

                    // Save selected groups for the video
                    if (groupIds.length > 0) {
                        groupIds.forEach(groupId => {
                            db.run("INSERT INTO video_albums (video_id, album_id) VALUES (?, ?)", [videoId, groupId]);
                        });
                    }
                    console.log('Database downloaded point2 :');
                    res.redirect('/admin/dashboard');
                }
            );
            
            
            thumbWriteStream.on('finish', () => {
                console.log('Thumbnail downloaded:', thumbnailPath);

                // ✅ Save details in the database
                // const sql = `INSERT INTO videos (video_url, title, uploader, duration, views, upload_date, thumbnail, file_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                // db.query(sql, [video_url, title, uploader, duration, views, upload_date, `/thumbnails/${videoID}.jpg`, videoPath], (err, result) => {
                //     if (err) {
                //         console.error('Database error:', err);
                //         return res.send('Error saving data.');
                //     }
                //     res.send(`Video and thumbnail downloaded successfully! 
                //         <br> Video: <a href="/downloads/${videoID}.mp4" target="_blank">Download Here</a>
                //         <br> Thumbnail: <img src="/thumbnails/${videoID}.jpg" width="200">`);
                // });
            });
        });

    } catch (error) {
        console.error('Error downloading video or thumbnail:', error);
        res.send('Failed to download video or thumbnail.');
    }



});

router.post('/create-album', (req, res) => {
    const { albumName } = req.body;
    db.run("INSERT INTO albums (name) VALUES (?)", [albumName], (err) => {
        if (err) {
            throw err;
        }
        res.redirect('/admin/dashboard');
    });
});

// Handle video deletion
router.post('/delete/:id', (req, res) => {
    const videoId = req.params.id;

    // Fetch video details before deleting
    db.get("SELECT filePath, thumbnailPath FROM videos WHERE id = ?", [videoId], (err, video) => {
        if (err) {
            console.error('Error Fetching Video Details:', err);
            return res.status(500).send('Error Fetching Video Details');
        }

        // Delete video and thumbnail files
        if (video.filePath) {
            const videoFilePath = path.join(__dirname, '../public', video.filePath);
            fs.unlink(videoFilePath, (err) => {
                if (err) console.error('Error Deleting Video File:', err);
            });
        }

        if (video.thumbnailPath) {
            const thumbnailFilePath = path.join(__dirname, '../public', video.thumbnailPath);
            fs.unlink(thumbnailFilePath, (err) => {
                if (err) console.error('Error Deleting Thumbnail File:', err);
            });
        }

        // Delete video from the database
        db.run("DELETE FROM videos WHERE id = ?", [videoId], (err) => {
            if (err) {
                console.error('Error Deleting Video from Database:', err);
                return res.status(500).send('Error Deleting Video from Database');
            }

            // Delete associated groups
            db.run("DELETE FROM video_albums WHERE video_id = ?", [videoId], (err) => {
                if (err) {
                    console.error('Error Deleting Video Groups:', err);
                    return res.status(500).send('Error Deleting Video Groups');
                }

                res.redirect('/admin/dashboard');
            });
        });
    });
});



router.get('/get-groups/:videoId', (req, res) => {
    const videoId = req.params.videoId;
    db.all("SELECT * FROM albums", [], (err, groups) => {
        if (err) {
            throw err;
        }
        db.all("SELECT album_id FROM video_albums WHERE video_id = ?", [videoId], (err, selectedGroups) => {
            if (err) {
                throw err;
            }
            res.json({
                groups: groups,
                selectedGroups: selectedGroups.map(group => group.album_id)
            });
        });
    });
});

router.post('/update-groups/:videoId', (req, res) => {
    const videoId = req.params.videoId;
    const { groups } = req.body;

    db.run("DELETE FROM video_albums WHERE video_id = ?", [videoId], (err) => {
        if (err) {
            throw err;
        }
        groups.forEach(groupId => {
            db.run("INSERT INTO video_albums (video_id, album_id) VALUES (?, ?)", [videoId, groupId]);
        });
        res.json({ success: true });
    });
});

router.post('/delete-album', (req, res) => {
    const { albumId } = req.body;
    db.run("DELETE FROM albums WHERE id = ?", [albumId], (err) => {
        if (err) {
            throw err;
        }
        res.redirect('/admin/dashboard');
    });
});



module.exports = router;