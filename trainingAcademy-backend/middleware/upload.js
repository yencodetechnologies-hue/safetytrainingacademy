const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("../config/cloudinary")

const courseStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "courses",
allowed_formats: ["jpg", "png", "jpeg", "webp", "pdf"]
  }
})

const paymentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "payment-slips",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "pdf"],
    transformation: [{ width: 1000, crop: "limit", quality: "auto" }]
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
    allowed_formats: ["jpg", "png", "jpeg", "webp", "pdf"]
  }
})

const categoryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "categories",
    allowed_formats: ["jpg", "png", "jpeg", "webp"]
  }
})

const sliderStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "sliders",
    allowed_formats: ["jpg", "png", "jpeg", "webp"]
  }
})

const partnerStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "partners",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "svg"]
  }
})


const uploadGallery = multer({ storage: galleryStorage })
const uploadEnrollment = multer({ storage: enrollmentStorage })
const uploadCourse = multer({ storage: courseStorage })
const uploadPayment = multer({ storage: paymentStorage })
const uploadCategory = multer({ storage: categoryStorage })
const uploadSlider = multer({ storage: sliderStorage })
const uploadPartner = multer({ storage: partnerStorage })

module.exports = {
  uploadCourse,
  uploadPayment,
  uploadEnrollment,
  uploadGallery,
  uploadCategory,
  uploadSlider,
  uploadPartner,
}
