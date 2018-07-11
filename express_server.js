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
  res.end("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  if (urlDatabase.hasOwnProperty(shortURL)) { // check if generated string matches an already existing one
    shortURL = generateRandomString();
  }
  if (!longURL.startsWith("http")) { // check if longURL's start is not valid
    longURL = "http://" + longURL; // add protocol to longURL
  }
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`); // redirect to shortURL page
  // else {
  //   res.status(404).send(`"${longURL}" is not a valid URL. Write your URL in the form "http://www.example.com".`) // send to error page,
  // }
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  if (urlDatabase[req.params.shortURL]) { // check if shortURL is in the database
    res.redirect(longURL); // redirect to longURL
  } else {
    res.status(404).send(`The shortened URL "${req.params.shortURL}" does not exist.`) // send to error page
  }
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase };
  res.render("urls_show", templateVars);
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