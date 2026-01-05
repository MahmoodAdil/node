const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/videos.db');

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS videos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, filePath TEXT, thumbnailPath TEXT)");
});

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS albums (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS video_albums (video_id INTEGER, album_id INTEGER, FOREIGN KEY(video_id) REFERENCES videos(id), FOREIGN KEY(album_id) REFERENCES albums(id))");
});

module.exports = db;