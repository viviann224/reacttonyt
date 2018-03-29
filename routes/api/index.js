const router = require("express").Router();
const path = require("path");
const apiRoutes = require("./api");

// Book routes
router.use("/api", apiRoutes);

//if the api request fails go to index.html
router.use(function(req, res) {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});
module.exports = router;
