const multer = require("multer");
const fs = require("fs");
const path = require("path");

const directory = path.join(process.cwd(), "uploads", "vaccinations");
fs.mkdirSync(directory, { recursive: true });
module.exports = multer({
  storage: multer.diskStorage({
    destination: (_, __, done) => done(null, directory),
    filename: (_, file, done) => done(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, done) => done(null, /pdf|image\//.test(file.mimetype)),
});
