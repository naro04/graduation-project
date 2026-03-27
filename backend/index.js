const app = require('./app');

const PORT = app.get('port');

app.listen(PORT, () => {
    console.log(`Server running on ${process.env.API_URL || PORT}`);
    console.log('Cloudinary Config Check:', {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Present' : 'Missing',
        api_key: process.env.CLOUDINARY_API_KEY ? 'Present' : 'Missing',
        api_secret: process.env.CLOUDINARY_API_SECRET ? 'Present' : 'Missing'
    });
});

