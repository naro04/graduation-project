const express = require('express');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Upload multiple images
router.post('/upload-images', upload.array('images', 10), (req, res, next) => {
    if (req.files && req.files.length > 0) {
        console.log('---------------- MULTER ARRAY DIAGNOSTIC ----------------');
        req.files.forEach((file, i) => {
            console.log(`File ${i} path:`, file.path);
        });
        console.log('---------------------------------------------------------');
    }
    next();
}, (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        // Generate URLs for uploaded files
        const imageUrls = req.files.map(file => {
            return file.path;
        });

        res.status(200).json({
            status: 'success',
            images: imageUrls
        });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading files', error: error.message });
    }
});

// Upload single support file
router.post('/upload-support-file', upload.single('file'), (req, res, next) => {
    if (req.file) {
        console.log('---------------- MULTER SINGLE DIAGNOSTIC ----------------');
        console.log('File path (URL):', req.file.path);
        console.log('-----------------------------------------------------------');
    }
    next();
}, (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        res.status(200).json({
            status: 'success',
            url: req.file.path
        });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading file', error: error.message });
    }
});

// Delete image/file from Cloudinary
router.delete('/delete-image', async (req, res) => {
    try {
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ message: 'URL is required' });
        }

        // If it's a Cloudinary URL, we should ideally delete it from Cloudinary
        // But for safety during migration, we'll check if it's a local path first
        if (imageUrl.includes('res.cloudinary.com')) {
            try {
                // Extract public_id from Cloudinary URL
                // Example: https://res.cloudinary.com/dvhhxjzeo/image/upload/v123456789/hr-system/public_id.jpg
                const parts = imageUrl.split('/');
                const lastPart = parts[parts.length - 1];
                const filename = lastPart.split('.')[0];
                const folder = parts[parts.length - 2];
                const publicId = `${folder}/${filename}`;

                const result = await require('cloudinary').v2.uploader.destroy(publicId);
                return res.status(200).json({
                    status: 'success',
                    message: 'Image deleted from Cloudinary',
                    result
                });
            } catch (clErr) {
                console.error('Cloudinary deletion error:', clErr);
                // Continue to local check as fallback
            }
        }

        // Fallback for local files (old logic)
        const filename = path.basename(imageUrl);
        const filePath = path.join(__dirname, '..', 'uploads', filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.status(200).json({
                status: 'success',
                message: 'Local file deleted successfully'
            });
        } else {
            // If not found locally and wasn't a recognized Cloudinary URL handled above
            res.status(200).json({ status: 'success', message: 'File already removed or not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting image', error: error.message });
    }
});

module.exports = router;
