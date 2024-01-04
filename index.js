const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const https = require('https');
const fs = require('fs');

const app = express();

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

app.use('/video', express.static('video'));

app.get('/', async (req, res) => {
    const videoUrl = req.query.video;
    const videoName = `./video/${Date.now()}_${getRandomInt(100)}.mp4`;
    const file = fs.createWriteStream(videoName);

    console.log(videoUrl);

    https.get(videoUrl, response => {
        response.pipe(file);

        file.on('finish', () => {
            const resultUrl = `${req.protocol}://${req.get('host')}${videoName.slice(1)}`;
            console.log(`video stored at ${resultUrl}`);
            res.status(200).send(resultUrl);
            file.close();
        });
    }).on('error', err => {
        console.error(`Error downloading video: ${err.message}`);
        res.status(400).send(`Error downloading video: ${err.message}`);
        fs.unlink(videoName);
    });
});

app.listen(process.env.PORT, () => {
    console.log(`Now listening on port ${process.env.PORT}`);
});