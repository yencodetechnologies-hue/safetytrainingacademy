const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("../config/cloudinary")

const courseStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "courses",
    allowed_formats: ["jpg", "png", "jpeg", "webp"]
  }
})

const paymentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "payment-slips",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "pdf"]
  }
})
// middleware/upload.js-ல் add பண்ணுங்க
const enrollmentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "enrollment-docs",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "pdf"]
  }
})
const galleryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gallery",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "svg"]
  }
})


const uploadGallery = multer({ storage: galleryStorage })
const uploadEnrollment = multer({ storage: enrollmentStorage })
const uploadCourse = multer({ storage: courseStorage })
const uploadPayment = multer({ storage: paymentStorage })

module.exports = { uploadCourse, uploadPayment, uploadEnrollment, uploadGallery,  }
