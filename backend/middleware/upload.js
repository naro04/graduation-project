const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'hr-system-v2',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx'],
        resource_type: 'auto', // Important to support both images and documents
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            return uniqueSuffix;
        }
    }
});

// Create multer upload instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit (increased to support documents)
    }
});

// Diagnostic middleware to check req.file properties
upload.diagnostic = (req, res, next) => {
    if (req.file) {
        console.log('---------------- MULTER DIAGNOSTIC ----------------');
        console.log('File detected:', req.file.originalname);
        console.log('File path (URL):', req.file.path);
        console.log('File filename:', req.file.filename);
        if (req.file.path && !req.file.path.startsWith('http')) {
            console.warn('⚠️ WARNING: req.file.path does not start with http! Cloudinary URL might be missing.');
        }
        console.log('----------------------------------------------------');
    }
    next();
};

module.exports = upload;
