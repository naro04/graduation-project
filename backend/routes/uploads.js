const express = require('express');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

const cloudinary = require('cloudinary').v2;
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

        // All images/files are now on Cloudinary
        if (imageUrl.includes('res.cloudinary.com')) {
            try {
                // Extract public_id from Cloudinary URL
                const parts = imageUrl.split('/');
                const lastPart = parts[parts.length - 1];
                const filename = lastPart.split('.')[0];
                const folder = parts[parts.length - 2];
                const publicId = `${folder}/${filename}`;

                const result = await cloudinary.uploader.destroy(publicId);
                return res.status(200).json({
                    status: 'success',
                    message: 'File deleted from Cloudinary',
                    result
                });
            } catch (clErr) {
                console.error('Cloudinary deletion error:', clErr);
                return res.status(500).json({ message: 'Error deleting from Cloudinary', error: clErr.message });
            }
        }

        res.status(400).json({ message: 'Invalid storage URL or file not found on Cloudinary' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting image', error: error.message });
    }
});

module.exports = router;
