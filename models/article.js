const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//db layout db contains a title, url, summary, saved, and date
const articleSchema = new Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  summary: {type: String, required: false},
  saved: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
});

const Article = mongoose.model("Article", articleSchema);

module.exports = Article;
