import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;
const API_URL = "http://app1:4000"; // 'app1' is the service name of the other container in your docker-compose file

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route to render the main page
app.get("/", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/posts`);
    console.log(response);
    res.render("index.ejs", { posts: response.data });
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// Route to render the edit page
app.get("/new", (req, res) => {
  res.render("modify.ejs", { heading: "New Post", submit: "Create Post" });
});

app.get("/edit/:id", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/posts/${req.params.id}`);
    const post = response.data;

    res.render("modify.ejs", {
      heading: "Edit Post",
      submitAction: "/api/posts/" + post._id, // specifying where the form should be submitted
      post: post, // passing the current post data to pre-fill the form
      submit: "Update Post" // Here's where you define what text you want on the submit button
    });    
  } catch (error) {
    res.status(500).send("Error retrieving post to edit.");
  }
});


// Create a new post
app.post("/api/posts", async (req, res) => {
  try {
    const response = await axios.post(`${API_URL}/posts`, req.body);
    console.log(response.data);
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Error creating post" });
  }
});

// Route to handle updating a post, triggered by a form in your frontend
app.post("/api/posts/update/:id", async (req, res) => {
  try {
    // The actual PATCH request to your backend
    await axios.patch(`${API_URL}/posts/${req.params.id}`, req.body);
    res.redirect("/"); // Redirect to the homepage after the update
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating post" });
  }
});

app.post("/delete-post/:id", async (req, res) => {
  try {
    await axios.delete(`${API_URL}/posts/${req.params.id}`);
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Error deleting post" });
  }
});


app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
