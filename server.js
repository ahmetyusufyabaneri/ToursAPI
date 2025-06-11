const mongoose = require("mongoose");
const app = require("./app");

require("dotenv").config();

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("Connected db"))
  .catch((err) => console.log(err));

app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}`);
});
