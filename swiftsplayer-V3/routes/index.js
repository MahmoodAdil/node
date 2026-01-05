const express = require('express');
const db = require('../database/db');
const router = express.Router();

router.get('/', (req, res) => {
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
            res.render('index', { 
                videos, 
                albums, 
                selectedAlbumId: album,
                noVideosMessage: videos.length === 0 && album ? `No videos found in this album.` : null
            });
        });
    });
});

router.post('/search', (req, res) => {
    const searchTerm = req.body.searchTerm;
    const { album } = req.query; // Get the selected album (if any)

    let query = "SELECT * FROM videos WHERE title LIKE ?";
    let params = [`%${searchTerm}%`];

    // If an album is selected, filter by album
    if (album) {
        query = `
            SELECT v.* FROM videos v
            JOIN video_albums va ON v.id = va.video_id
            WHERE va.album_id = ? AND v.title LIKE ?
        `;
        params = [album, `%${searchTerm}%`];
    }

    db.all(query, params, (err, videos) => {
        if (err) {
            throw err;
        }
        db.all("SELECT * FROM albums", [], (err, albums) => {
            if (err) {
                throw err;
            }
            res.render('index', {
                videos,
                albums,
                selectedAlbumId: album,
                noVideosMessage: videos.length === 0 ? `No videos found matching "${searchTerm}".` : null
            });
        });
    });
});


module.exports = router;