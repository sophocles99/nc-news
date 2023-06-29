const articleRouter = require("express").Router();
const {
  getArticles,
  getArticleById,
  getCommentsByArticleId,
  postCommentByArticleId,
  patchArticleById,
} = require("../controllers/articles.controllers");

articleRouter.get("/", getArticles);

articleRouter.get("/?query", getArticles);

articleRouter.get("/:article_id", getArticleById);

articleRouter.get("/:article_id/comments", getCommentsByArticleId);

articleRouter.post("/:article_id/comments", postCommentByArticleId);

articleRouter.patch("/:article_id", patchArticleById);

module.exports = articleRouter;