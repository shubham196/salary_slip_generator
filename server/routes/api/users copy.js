const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Set storage engine
const storage = multer.diskStorage({
  destination: "./uploads", // Set the destination folder where images will be stored
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // Set file size limit to 1MB (adjust as needed)
}).single("image"); // "image" should be the name attribute of the input field for the file upload

// Load user model
const User = require("../../models/user");

// @route GET api/users/test
// @description tests users route
// @access Public

router.get("/test", (req, res) => res.send("user route testing!"));

// @route GET api/users
// @description Get all users
// @access Public
router.get("/", (req, res) => {
  User.find()
    .then((users) => res.json(users))
    .catch((err) => res.status(404).json({ nousersfound: "No Users found" }));
});

// @route GET api/users/:id
// @description Get single user by id
// @access Public
router.get("/:id", (req, res) => {
  User.findById(req.params.id)
    .then((user) => res.json(user))
    .catch((err) => res.status(404).json({ nouserfound: "No User found" }));
});

// @route POST api/users
// @description add/save user with image upload
// @access Public
router.post("/", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      // Handle upload error
      res.status(400).json({ error: "Unable to upload image" });
    } else {
      // Image uploaded successfully, create user
      if (!req.file) {
        // No file uploaded, handle accordingly (e.g., return an error response)
        return res.status(400).json({ error: "No image uploaded" });
      }
      
      const newUser = new User({
        name: req.body.name,
        designation: req.body.designation,
        // Add other fields as needed
        image: req.file.filename, // Save filename in the database
      });

      newUser
        .save()
        .then((user) => res.json({ msg: "User added successfully" }))
        .catch((err) => {
          res.status(400).json({ error: "Unable to add this user" });
          console.log(err);
        });
    }
  });
});


router.put("/:id", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      // Handle upload error
      console.error(err);
      res.status(400).json({ error: "Unable to upload image" });
    } else {
      // Image uploaded successfully, update user
      if (!req.file) {
        // No file uploaded, handle accordingly (e.g., return an error response)
        return res.status(400).json({ error: "No image uploaded" });
      }

      // Update user information in the database
      User.findByIdAndUpdate(
        req.params.id,
        {
          name: req.body.name,
          designation: req.body.designation,
          image: req.file.filename, // Save filename in the database
        },
        { new: true }
      )
        .then((user) => res.json(user))
        .catch((err) =>
          res.status(400).json({ error: "Unable to update the user" })
        );
    }
  });
});

router.put("/:id/calendar", (req, res) => {
  const { id } = req.params;
  const { calendarId } = req.body;
  console.log("CalendarId",calendarId);
  User.findByIdAndUpdate(id, { $set: { calendarId: calendarId } }, { new: true })
    .then((user) => res.json({ msg: "Calendar ID updated successfully", user }))
    .catch((err) =>
      res.status(400).json({ error: "Unable to update the calendar ID" })
    );
});

// @route GET api/users/:id
// @description Delete user by id
// @access Public

router.delete("/:id", (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then((user) => res.json({ mgs: "User entry deleted successfully" }))
    .catch((err) => res.status(404).json({ error: "No such a user" }));
});

module.exports = router;
