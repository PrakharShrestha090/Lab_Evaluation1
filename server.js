const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

// User Schema (for login/register)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  course: { type: String, required: true },
  contact: { type: String, required: true },
});

const User = mongoose.model("User", UserSchema);

// API Routes

// Register a new user
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, course, contact } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const user = new User({ name, email, password, course, contact });
    await user.save();
    res
      .status(201)
      .json({
        message: "Registration successful",
        user: { name, email, course, contact },
      });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "No account found for this email" });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    res.json({
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        course: user.course,
        contact: user.contact,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users/students
app.get("/api/students", async (req, res) => {
  try {
    const students = await User.find().select("-password");
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single user by email (for profile)
app.get("/api/user/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select(
      "-password"
    );
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a student
app.delete("/api/students/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve HTML pages
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/register.html", (req, res) =>
  res.sendFile(path.join(__dirname, "register.html"))
);
app.get("/home.html", (req, res) =>
  res.sendFile(path.join(__dirname, "home.html"))
);
app.get("/students.html", (req, res) =>
  res.sendFile(path.join(__dirname, "students.html"))
);
app.get("/profile.html", (req, res) =>
  res.sendFile(path.join(__dirname, "profile.html"))
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
