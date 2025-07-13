const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const bcrypt = require("bcryptjs");
const prisma = require('./utils/prisma');
const cors = require("cors");

const dotenv = require('dotenv');
dotenv.config();

const app = express();
// Routes
const posts = require("./routes/posts.js");
const contacts = require("./routes/contact.js");
const analyticsRoutes = require('./routes/analytics');

app.use(cors({
  origin: ["https://digital-agency-front-end-rosy.vercel.app", "https://digital-agency-front-end-rosy.vercel.app/login", "https://digital-agency-front-end-rosy.vercel.app/register",
    "https://digital-agency-front-end-rosy.vercel.app/dashboard/messages"
  ],
  credentials: true,
}));
app.use(express.json());

app.use(session({
  secret: "your_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    sameSite: "none" 
  }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return done(null, false, { message: "Incorrect username." });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return done(null, false, { message: "Incorrect password." });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));


passport.serializeUser((user, done) => {
  done(null, user.id);
});


passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user || false);
  } catch (err) {
    done(err);
  }
});


app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    req.login(newUser, (err) => {
      if (err) return res.status(500).json({ message: "Registration succeeded but login failed" });
      return res.status(201).json({ id: newUser.id, username: newUser.username });
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


app.post("/api/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: info.message });

    req.logIn(user, err => {
      if (err) return next(err);
      return res.json({ id: user.id, username: user.username });
    });
  })(req, res, next);
});


app.post("/api/logout", (req, res) => {
  req.logout(() => {
    res.json({ message: "Logged out" });
  });
});

app.get("/api/profile", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  res.json({ id: req.user.id, username: req.user.username });
});

app.use("/api/posts", posts);
app.use("/api/contacts", contacts);
app.use('/api/analytics', analyticsRoutes);



app.listen(5000, () => console.log("server is working"));