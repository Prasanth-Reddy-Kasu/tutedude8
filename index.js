require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Todo = require("./models/Todo");

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.get("/", async (req, res) => {
  const { filter, error } = req.query;
  const todos =
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
  const taskTitle = title.trim();
  if (!taskTitle) {
    return res.redirect(`/?filter=${filter}&error=1`);
  }
  await Todo.create({ title: taskTitle, priority });
  res.redirect(`/?filter=${filter}`);
});

app.put("/edit", async (req, res) => {
  const { id } = req.params;
  const { title, priority } = req.body;
  const filter = req.query.filter || "all";
  await Todo.findByIdAndUpdate(id, { title, priority });
  res.redirect(`/?filter=${filter}`);
});

app.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  const filter = req.query.filter || "all";
  await Todo.findByIdAndDelete(id);
  res.redirect(`/?filter=${filter}`);
});

app.listen(port, () =>
  console.log(`🚀 Server running at http://localhost:${port}`)
);
