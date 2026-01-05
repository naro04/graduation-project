const express = require('express');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Upload multiple images
router.post('/upload-images', upload.array('images', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        // Generate URLs for uploaded files
        const imageUrls = req.files.map(file => {
            return `/uploads/${file.filename}`;
        });

        res.status(200).json({
            status: 'success',
            images: imageUrls
        });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading files', error: error.message });
    }
});

// Delete image
router.delete('/delete-image', (req, res) => {
    try {
        const { imageUrl } = req.body;
        
        if (!imageUrl) {
            return res.status(400).json({ message: 'Image URL is required' });
        }

        // Extract filename from URL
        const filename = path.basename(imageUrl);
        const filePath = path.join(__dirname, '..', 'uploads', filename);

        // Check if file exists
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.status(200).json({ 
                status: 'success', 
                message: 'Image deleted successfully' 
            });
        } else {
            res.status(404).json({ message: 'Image not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting image', error: error.message });
    }
});

module.exports = router;
