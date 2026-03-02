const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const eventRoutes = require("./routes/eventRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const adminRoutes = require("./routes/adminRoutes");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");

app.use("/api/events", eventRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);



mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("OG Memory Vault Backend Running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

app.get("/test123", (req, res) => {
  res.send("Admin route test working");
});