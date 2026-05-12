const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const userModel = require("./models/user");
const postModel = require("./models/post");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/profile", isLoggedIn, (req, res) => {
  console.log(req.user);
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

app.post("/register", async (req, res) => {
  let { email, password, username, name, age } = req.body;

  let existedUser = await userModel.findOne({ email });
  if (existedUser) return res.status(500).send("User already exists");

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let createdUser = await userModel.create({
        email,
        password: hash,
        username,
        name,
        age,
      });
      let token = jwt.sign({ email, userid: createdUser._id }, "secretKey");
      res.cookie("token", token);

      res.status(200).send(createdUser);
    });
  });
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;

  let user = await userModel.findOne({ email });

  if (!user) return res.status(404).send("User not found");

  bcrypt.compare(password, user.password, (err, result) => {
    if (result) {
      let token = jwt.sign({ email: user.email }, "secretKey");
      res.cookie("token", token);
      res.send("Login successful");
    } else {
      res.send("Something went wrong");
    }
  });
});

function isLoggedIn(req, res, next) {
  if (!req.cookies.token) {
    res.send("You need to login first");
  } else {
    let data = jwt.verify(req.cookies.token, "secretKey");
    req.user = data;
    next();
  }
}

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
