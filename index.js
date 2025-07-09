require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Todo = require("./models/Todo");

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.get("/", async (req, res) => {
  const { filter, error } = req.query;
  let todos =
    filter && filter !== "all"
      ? await Todo.find({ priority: filter })
      : await Todo.find();

  res.render("index", {
    todos,
    filter: filter || "all",
    error: error || "",
  });
});

app.post("/add", async (req, res) => {
  const { title, priority } = req.body;
  const filter = req.query.filter || "all";
  const taskTitle = title.trim() || "Untitled Task";
  const showError = !title.trim();

  await Todo.create({ title: taskTitle, priority });
  res.redirect(`/?filter=${filter}${showError ? "&error=1" : ""}`);
});

app.post("/edit", async (req, res) => {
  const { id, title, priority } = req.body;
  const filter = req.query.filter || "all";
  await Todo.findByIdAndUpdate(id, { title, priority });
  res.redirect(`/?filter=${filter}`);
});

app.post("/delete", async (req, res) => {
  const { id } = req.body;
  const filter = req.query.filter || "all";
  await Todo.findByIdAndDelete(id);
  res.redirect(`/?filter=${filter}`);
});

app.listen(port, () =>
  console.log(`🚀 Server running at http://localhost:${port}`)
);
