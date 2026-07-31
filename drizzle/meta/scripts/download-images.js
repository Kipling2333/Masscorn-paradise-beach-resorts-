const fs = require('fs');
const path = require('path');
const https = require('https');

const imagesDir = path.join(__dirname, '../public/images');
if (!fs.existsSync(imagesDir)){
    fs.mkdirSync(imagesDir, { recursive: true });
}

const placeholderImages = {
    'hero.jpg': 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1600&auto=format&fit=crop&q=80',
    'aerial.jpg': 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1600&auto=format&fit=crop&q=80',
    'villa.jpg': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1600&auto=format&fit=crop&q=80',
    'cruise.jpg': 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1600&auto=format&fit=crop&q=80',
    'dining.jpg': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
    'spa.jpg': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&auto=format&fit=crop&q=80',
    'wedding.jpg': 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&auto=format&fit=crop&q=80',
    'conference.jpg': 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&auto=format&fit=crop&q=80'
};

Object.entries(placeholderImages).forEach(([filename, url]) => {
    const filePath = path.join(imagesDir, filename);
    https.get(url, (res) => {
        const fileStream = fs.createWriteStream(filePath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
            fileStream.close();
            console.log(`Downloaded: ${filename}`);
        });
    }).on('error', (err) => {
        console.error(`Failed to download ${filename}:`, err.message);
    });
});