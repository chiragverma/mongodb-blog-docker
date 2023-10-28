import express from "express";
import bodyParser from "body-parser";
import mongoose from 'mongoose';

const app = express();
const port = 4000;
let lastId = 0

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// MongoDB connection
mongoose.connect("mongodb://mongodb:27017/todo-app", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const postSchema = new mongoose.Schema({
  _id: Number,
  title: String,
  content: String,
  author: String,
  date: { type: Date, default: Date.now }
});

// Create a model from the schema (this represents your collection)
const Post = mongoose.model('Post', postSchema);

// GET all posts
app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a specific post by id
app.get("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new post
app.post("/posts", async (req, res) => {
  const newId = lastId += 1;
  const post = new Post({
    _id: newId,
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
  });
  lastId = newId;

  try {
    const newPost = await post.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH a post
app.patch("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (req.body.title) post.title = req.body.title;
    if (req.body.content) post.content = req.body.content;
    if (req.body.author) post.author = req.body.author;

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// DELETE a specific post
app.delete("/posts/:id", async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndRemove(req.params.id);
    if (!deletedPost) return res.status(404).json({ message: "Post not found" });

    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
