const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database/db');
const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'video') {
            cb(null, 'public/videos/');
        } else if (file.fieldname === 'thumbnail') {
            cb(null, 'public/thumbnails/');
        }
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to avoid filename conflicts
    }
});
// Configure Multer for file uploads
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/'); // Temporary upload folder
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
//     }
// });


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

// Upload Video Route
router.post('/upload', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), (req, res) => {
    const { title, description, groups} = req.body;

    // Ensure groups is an array
    const groupIds = Array.isArray(groups) ? groups : [groups].filter(Boolean);

    const videoFile = req.files['video'][0];
    const thumbnailFile = req.files['thumbnail'][0];

    // Define destination paths
    const videoDestination = path.join(__dirname, '../public/videos', videoFile.filename);
    const thumbnailDestination = path.join(__dirname, '../public/thumbnails', thumbnailFile.filename);

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
    db.run("DELETE FROM videos WHERE id = ?", [videoId], (err) => {
        if (err) {
            throw err;
        }
        res.redirect('/admin/dashboard');
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