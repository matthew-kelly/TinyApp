const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/views")); // allows css in expressjs

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// home redirect to urls page
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// create login cookie, redirect to urls page
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

// delete login cookie, redirect to urls page
app.post("/logout", (req, res) => {
  res.clearCookie("username", req.body.username);
  res.redirect("/urls");
});

// render urls page
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

// render error page
app.get("/urls/error", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.status(400).render("urls_error", templateVars);
});

// render new url page
app.get("/urls/new", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

// create new short/long url pair, redirect to urls
app.post("/urls/new", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  let checker = true;
  if (urlDatabase.hasOwnProperty(shortURL)) { // check if generated string matches an already existing one
    shortURL = generateRandomString();
  }
  if (!longURL.includes("www.")) {
    checker = false;
    res.status(400).redirect("/urls/error"); // send to error page,
  }
  if (checker) {
    if (!longURL.startsWith("http")) {
      longURL = "http://" + longURL; // add protocol to longURL
      urlDatabase[shortURL] = longURL;
      res.redirect(`/urls/${shortURL}`);
    } else {
      urlDatabase[shortURL] = longURL;
      res.redirect(`/urls/${shortURL}`);
    }
  }
});

// redirect to full site
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  if (urlDatabase[req.params.shortURL]) { // check if shortURL is in the database
    res.redirect(longURL); // redirect to longURL
  } else {
    res.status(404).redirect("/urls/error"); // send to error page
  }
});

// render show page
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

// edit url, redirect to urls page
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let longURL = req.body[req.params.id];
  let checker = true;
  if (!longURL.includes("www.")) {
    checker = false;
    res.status(400).redirect("/urls/error"); // send to error page,
  }
  if (checker) {
    if (!longURL.startsWith("http")) {
      longURL = "http://" + longURL; // add protocol to longURL
      urlDatabase[shortURL] = longURL;
      res.redirect("/urls");
    } else {
      urlDatabase[shortURL] = longURL;
      res.redirect("/urls");
    }
  }
});

// delete url, redirect to urls page
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// redirect edit to show page
app.get("/urls/:id/edit", (req, res) => {
  let shortURL = req.params.id;
  res.redirect(`/urls/${shortURL}`);
});

// show json file
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// functions
// random string - sampled from https://stackoverflow.com/questions/16106701/how-to-generate-a-random-string-of-letters-and-numbers-in-javascript
// issues - Math.random()
function generateRandomString() {
  let string = "";
  const charsetLower = "0123456789abcdefghijklmnopqrstuvwxyz";
  const charsetUpper = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 6; i++) {
    if (Math.random() >= 0.5) { // 50/50 choice between uppercase and lowercase charsets
      string += charsetUpper.charAt(Math.floor(Math.random() * charsetUpper.length));
    } else {
      string += charsetLower.charAt(Math.floor(Math.random() * charsetLower.length));
    }
  }
  return string;
}