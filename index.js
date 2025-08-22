const express = require("express");
const app = express();
app.use(express.json());
const { Client } = require("pg");
const con = new Client({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "1911",
  database: "postgres",
});
con.connect().then(() => console.log("connected"));
app.post("/testPost", (req, res) => {
  const { id, username, email, hashed_pass, name } = req.body;
  const insert_query =
    "INSERT INTO users (user_id,username,email,hashed_pass,certificate_name) VALUES ($1,$2,$3,$4,$5)";
  con.query(
    insert_query,
    [id, username, email, hashed_pass, name],
    (err, result) => {
      if (err) {
        res.status(401).json(err);
      } else {
        console.log(result);
        res.send("Posted Data");
      }
    }
  );
});
app.get("/", (req, res) => {
  const fetch_query = "SELECT * FROM users";
  con.query(fetch_query, (err, result) => {
    if (err) {
      res.status(400).json(err);
    } else res.json(result.rows);
  });
});
app.listen(3000, () => {
  console.log("listenenig on port 3000");
});
