const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("../config/cloudinary")

const courseStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const cleanName = file.originalname.split(".")[0].replace(/[^a-zA-Z0-9]/g, "_")
    return {
      folder: "courses",
      resource_type: "auto", 
      public_id: `${cleanName}-${Date.now()}`,
    }
  }
})

const paymentStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const cleanName = file.originalname.split(".")[0].replace(/[^a-zA-Z0-9]/g, "_")
    return {
      folder: "payment-slips",
      resource_type: "auto",
      public_id: `${cleanName}-${Date.now()}`,
    }
  }
})

const enrollmentStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const cleanName = file.originalname.split(".")[0].replace(/[^a-zA-Z0-9]/g, "_")
    return {
      folder: "enrollment-docs",
      resource_type: "auto",
      public_id: `${cleanName}-${Date.now()}`,
    }
  }
})

const galleryStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const cleanName = file.originalname.split(".")[0].replace(/[^a-zA-Z0-9]/g, "_")
    return {
      folder: "gallery",
      resource_type: "auto",
      public_id: `${cleanName}-${Date.now()}`,
    }
  }
})

const categoryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "categories",
    resource_type: "auto"
  }
})

const sliderStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "sliders",
    resource_type: "auto"
  }
})

const partnerStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "partners",
    resource_type: "auto"
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
