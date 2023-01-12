const express = require("express");
const app = express();

const router = require("./routes");

app.use(express.json());
app.use(express.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

app.use("/", router);

app.listen(3000, () => {
    console.log("Server started on port 3000");
});
