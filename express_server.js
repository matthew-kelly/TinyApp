const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/error", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.status(400).render("urls_error", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls/new", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  let checker = true;
  if (urlDatabase.hasOwnProperty(shortURL)) { // check if generated string matches an already existing one
    shortURL = generateRandomString();
  }
  if (!longURL.includes("www.")) {
    checker = false;
    res.status(400).redirect('/urls/error'); // send to error page,
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

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  if (urlDatabase[req.params.shortURL]) { // check if shortURL is in the database
    res.redirect(longURL); // redirect to longURL
  } else {
    res.status(404).redirect('/urls/error'); // send to error page
  }
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let longURL = req.body[req.params.id];
  let checker = true;
  if (!longURL.includes("www.")) {
    checker = false;
    res.status(400).redirect('/urls/error'); // send to error page,
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

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/urls/:id/edit", (req, res) => {
  let shortURL = req.params.id;
  res.redirect(`/urls/${shortURL}`);
});

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