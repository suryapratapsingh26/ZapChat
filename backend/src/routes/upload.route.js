import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chat_app_profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
    public_id: (req, file) => `user-${req.user._id}-${Date.now()}`
  }
});

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}).single('profilePic');

// Upload route handler
router.post('/profile-pic', protectRoute, (req, res) => {
  upload(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          error: 'File upload error',
          details: err.message
        });
      } else if (err) {
        return res.status(500).json({
          error: 'Server error',
          details: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // If user already has a profile picture, delete the old one
      if (req.user.profilePic) {
        try {
          const publicId = req.user.profilePic.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error('Error deleting old profile picture:', error);
          // Continue with the update even if deletion fails
        }
      }

      // Update user profile with new image URL
      req.user.profilePic = req.file.path;
      await req.user.save();

      res.status(200).json({
        message: 'Profile picture updated successfully',
        fileUrl: req.file.path
      });
    } catch (error) {
      console.error('Error in profile picture upload:', error);
      res.status(500).json({
        error: 'Error uploading profile picture',
        details: error.message
      });
    }
  });
});

export default router;