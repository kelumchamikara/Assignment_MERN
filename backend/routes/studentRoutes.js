// routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const path = require("path");
const fs = require("fs");

// Configure static file serving for uploads
// Add this line to your server.js later:
// app.use('/uploads', express.static('uploads'));

router.use(authMiddleware);

// Get all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find({ userId: req.userId });
    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new student
router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("File:", req.file);
    console.log("User ID:", req.userId);
    
    const { name, age, status } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    
    const newStudent = new Student({
      name,
      age,
      status,
      image: imageUrl,
      userId: req.userId
    });

    const savedStudent = await newStudent.save();
    console.log("Saved student:", savedStudent);
    res.status(201).json(savedStudent);
  } catch (error) {
    console.error("Error in POST /students:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update student
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, age, status } = req.body;
    const updateData = { name, age, status };

    // Only allow users to update their own students
    const student = await Student.findOne({ 
      _id: req.params.id,
      userId: req.userId 
    });
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedStudent);
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete student
router.delete("/:id", async (req, res) => {
  try {
    console.log("Delete request for student ID:", req.params.id);
    console.log("User ID from auth:", req.userId);
    
    // Only allow users to delete their own students
    const student = await Student.findOne({ 
      _id: req.params.id,
      userId: req.userId 
    });
    
    if (!student) {
      console.log("Student not found or doesn't belong to user");
      return res.status(404).json({ message: "Student not found" });
    }

    // Delete the image file if it exists
    if (student.image) {
      try {
        const imagePath = path.join(__dirname, '..', student.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log("Image file deleted:", imagePath);
        }
      } catch (fileError) {
        console.error("Error deleting image file:", fileError);
        // Continue with deletion even if file removal fails
      }
    }

    const result = await Student.findByIdAndDelete(req.params.id);
    console.log("Delete result:", result);
    
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single student
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;