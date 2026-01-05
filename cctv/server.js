const express = require('express');
const path = require('path');
const { exec } = require('child_process');

// Create an Express app
const app = express();
const port = 3000;

// Serve the HLS files
app.use(express.static(path.join(__dirname, 'hls')));

// Serve the HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Convert RTSP to HLS using FFmpeg
const ffmpegCommand = `
ffmpeg -rtsp_transport tcp -i "rtsp://admin:123456@192.168.0.24:554/live/ch0?token=2d08086927f4d87a31154aaf0ba2e067" \
  -c:v libx264 -b:v 3000k -maxrate 3000k -bufsize 1500k -g 10 -preset ultrafast -tune zerolatency \
  -vf "scale=1280:720" \
  -c:a aac -b:a 64k \
  -f hls -hls_time 0.5 -hls_list_size 3 -hls_flags delete_segments+split_by_time+independent_segments \
  -hls_segment_type mpegts -hls_segment_filename "./hls/stream_%03d.ts" "./hls/stream.m3u8"

`;

exec(ffmpegCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(`FFmpeg error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`FFmpeg stderr: ${stderr}`);
    return;
  }
  console.log(`FFmpeg stdout: ${stdout}`);
});