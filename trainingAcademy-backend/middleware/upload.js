const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("../config/cloudinary")

const IMG_TRANSFORM = [
  { quality: "auto:good", fetch_format: "auto" },
  { width: 2000, height: 2000, crop: "limit" },
]

const isPdfFile = (file) =>
  file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")

const FILE_SIZE_LIMIT = 15 * 1024 * 1024 // 15 MB

const courseStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const cleanName = file.originalname.split(".")[0].replace(/[^a-zA-Z0-9]/g, "_")
    const isPdf = isPdfFile(file)
    const extension = file.originalname.split(".").pop()
    return {
      folder: "courses",
      resource_type: isPdf ? "raw" : "auto",
      public_id: isPdf ? `${cleanName}-${Date.now()}.${extension}` : `${cleanName}-${Date.now()}`,
      ...(isPdf ? {} : { transformation: IMG_TRANSFORM }),
    }
  },
})

const paymentStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const cleanName = file.originalname.split(".")[0].replace(/[^a-zA-Z0-9]/g, "_")
    const isPdf = isPdfFile(file)
    return {
      folder: "payment-slips",
      resource_type: "auto",
      public_id: `${cleanName}-${Date.now()}`,
      ...(isPdf ? {} : { transformation: IMG_TRANSFORM }),
    }
  },
})

const enrollmentStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const cleanName = file.originalname.split(".")[0].replace(/[^a-zA-Z0-9]/g, "_")
    const isPdf = isPdfFile(file)
    return {
      folder: "enrollment-docs",
      resource_type: "auto",
      public_id: `${cleanName}-${Date.now()}`,
      ...(isPdf ? {} : { transformation: IMG_TRANSFORM }),
    }
  },
})

const galleryStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const cleanName = file.originalname.split(".")[0].replace(/[^a-zA-Z0-9]/g, "_")
    return {
      folder: "gallery",
      resource_type: "auto",
      public_id: `${cleanName}-${Date.now()}`,
      transformation: IMG_TRANSFORM,
    }
  },
})

const categoryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "categories",
    resource_type: "auto",
    transformation: IMG_TRANSFORM,
  },
})

const sliderStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "sliders",
    resource_type: "auto",
    transformation: IMG_TRANSFORM,
  },
})

const partnerStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "partners",
    resource_type: "auto",
    transformation: IMG_TRANSFORM,
  },
})

const uploadGallery = multer({ storage: galleryStorage, limits: { fileSize: FILE_SIZE_LIMIT } })
const uploadEnrollment = multer({ storage: enrollmentStorage, limits: { fileSize: FILE_SIZE_LIMIT } })
const uploadCourse = multer({ storage: courseStorage, limits: { fileSize: FILE_SIZE_LIMIT } })
const uploadPayment = multer({ storage: paymentStorage, limits: { fileSize: FILE_SIZE_LIMIT } })
const uploadCategory = multer({ storage: categoryStorage, limits: { fileSize: FILE_SIZE_LIMIT } })
const uploadSlider = multer({ storage: sliderStorage, limits: { fileSize: FILE_SIZE_LIMIT } })
const uploadPartner = multer({ storage: partnerStorage, limits: { fileSize: FILE_SIZE_LIMIT } })

module.exports = {
  uploadCourse,
  uploadPayment,
  uploadEnrollment,
  uploadGallery,
  uploadCategory,
  uploadSlider,
  uploadPartner,
}
