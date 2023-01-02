const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const mongoose = require("mongoose");
const bcrypt= require('bcrypt');
const User= require('./models/auth')
const methodOverride = require("method-override");
const { MongoClient } = require("mongodb");
const auth= require('./models/auth')
const Blog = require("./models/blog");
const url = "mongodb+srv://ice-009:Armaan%4006@cluster0.ynzphiq.mongodb.net/";
const databaseName = "apiMatcom";
const session = require('express-session')
const client = new MongoClient(url);
async function dbConnect() {
  let result = await client.connect();
  db = result.db(databaseName);
  return db.collection("blogs");
}
module.exports = dbConnect;
mongoose
  .connect(
    "mongodb+srv://ice-009:Armaan%4006@cluster0.ynzphiq.mongodb.net/apiMatcom",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("MONGO CONNECTION OPEN!!!");
  })
  .catch((err) => {
    console.log("OH NO MONGO CONNECTION ERROR!!!!");
    console.log(err);
  });
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(session({secret:'thisisasecret'}))
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
const requireLogin= (req,res,next)=>{
  if(!req.session.user_id){
    res.redirect('/login');
  }
  next();
}
const categories = [];
app.get('/', (req,res)=>{
  res.render('blogs/home');
})

// app.get('/register', (req,res)=>{
//   res.render('blogs/register');
// })
app.post('/register', async (req,res)=>{
  const {username, password} = req.body;
  const hash=  await bcrypt.hash(password, 12)
  const user = new User({
    username,
    password:hash
  })
  await user.save();
  res.redirect('/');
})

app.get('/login', (req,res)=>{
  res.render('blogs/login');
})
app.post('/login', async(req,res)=>{
  const {username, password} = req.body;
  const user= await User.findOne({username})
  const validPass = await bcrypt.compare(password, user.password)
    if (validPass){
      req.session.user_id= user._id
      res.redirect('/blogs')
     }
    else {
      res.send('try again')
    }
})

app.get("/blogs", requireLogin, async (req, res) => {
  const { category } = req.query;
  if (category) {
    const blogs = await Blog.find({ category });
    res.render("blogs/index", { blogs, category });
  } else {
    const blogs = await Blog.find({});
    res.render("blogs/index", { blogs, category: "All" });
  }
});

app.get("/blogs/new", requireLogin,(req, res) => {
  res.render("blogs/new", { categories });
});

app.post("/blogs",requireLogin, async (req, res) => {
  const newBlog = new Blog(req.body);
  await newBlog.save();
  res.redirect(`/blogs/${newBlog._id}`);
});

app.get("/blogs/:id",requireLogin, async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);
  res.render("blogs/show", { blog });
});

app.get("/blogs/:id/edit", requireLogin,async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);
  res.render("blogs/edit", { blog, categories });
});

app.put("/blogs/:id",requireLogin, async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findByIdAndUpdate(id, req.body, {
    runValidators: true,
    new: true,
  });
  res.redirect(`/blogs/${blog._id}`);
});

app.delete("/blogs/:id", requireLogin,async (req, res) => {
  const { id } = req.params;
  const deletedProduct = await Blog.findByIdAndDelete(id);
  res.redirect("/blogs");
});

app.use(express.json());
app.get("/api", async (req ,res) => {
  let data = await dbConnect();
  data = await data.find().toArray();
  res.send(data);
});
app.listen(port, () => {
  console.log("APP IS LISTENING ON PORT 3000!");
});
