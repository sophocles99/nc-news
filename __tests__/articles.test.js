const request = require("supertest");

const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return db.end();
});

describe("GET /api/articles", () => {
  test("200: returns array of all articles", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(13);
        articles.forEach((article) => {
          expect(article).toHaveProperty("author", expect.any(String));
          expect(article).toHaveProperty("title", expect.any(String));
          expect(article).toHaveProperty("article_id", expect.any(Number));
          expect(article).toHaveProperty("topic", expect.any(String));
          expect(article).toHaveProperty("created_at", expect.any(String));
          expect(article).toHaveProperty("votes", expect.any(Number));
          expect(article).toHaveProperty("article_img_url", expect.any(String));
          expect(article).toHaveProperty("comment_count", expect.any(String));

          expect(article).not.toHaveProperty("body");
        });
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: returns article object by id", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("404: returns error if no matching article_id found", () => {
    return request(app)
      .get("/api/articles/20")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found");
      });
  });
  test("400: returns error if invalid article_id parameter given", () => {
    return request(app)
      .get("/api/articles/banana")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: returns array of comments for given article_id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toHaveLength(11);
        comments.forEach((comment) => {
          expect(comment).toHaveProperty("comment_id", expect.any(Number));
          expect(comment).toHaveProperty("votes", expect.any(Number));
          expect(comment).toHaveProperty("created_at", expect.any(String));
          expect(comment).toHaveProperty("author", expect.any(String));
          expect(comment).toHaveProperty("body", expect.any(String));
          expect(comment).toHaveProperty("article_id", expect.any(Number));
        });
        expect(comments).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("200: returns empty array if article_id exists but article has no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toHaveLength(0);
      });
  });
  test("404: returns error if no matching article_id found", () => {
    return request(app)
      .get("/api/articles/20/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found");
      });
  });
  test("400: returns error if invalid article_id parameter given", () => {
    return request(app)
      .get("/api/articles/mango/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("POST: /api/articles/:article_id/comments", () => {
  test("201: returns the successfully posted comment", () => {
    const testComment = {
      newComment: {
        username: "butter_bridge",
        body: "Bemused of Basingstoke. What is this guy on?",
      },
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(testComment)
      .expect(201)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toHaveProperty("comment_id", expect.any(Number));
        expect(comment).toHaveProperty("body", expect.any(String));
        expect(comment).toHaveProperty("article_id", expect.any(Number));
        expect(comment).toHaveProperty("author", expect.any(String));
        expect(comment).toHaveProperty("votes", 0);
        expect(comment).toHaveProperty("created_at", expect.any(String));
      });
  });
  test("201: ignores any extra properties in posted object", () => {
    const testComment = {
      newComment: {
        username: "butter_bridge",
        body: "Bemused of Basingstoke. What is this guy on?",
        irrelevant1: "totally out of place",
        irrelevant2: 42,
      },
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(testComment)
      .expect(201)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).not.toHaveProperty("irrelevant1");
        expect(comment).not.toHaveProperty("irrelevant2");
      });
  });
  test("404: returns error if article_id doesn't exist", () => {
    const testComment = {
      newComment: {
        username: "butter_bridge",
        body: "Bemused of Basingstoke. What is this guy on?",
      },
    };
    return request(app)
      .post("/api/articles/14/comments")
      .send(testComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found");
      });
  });
  test("404: returns error if username doesn't exist", () => {
    const testComment = {
      newComment: {
        username: "franklin_d",
        body: "Bemused of Basingstoke. What is this guy on?",
      },
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(testComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found");
      });
  });
  test("400: returns error if article_id is of wrong data type", () => {
    const testComment = {
      newComment: {
        username: "butter_bridge",
        body: "Bemused of Basingstoke. What is this guy on?",
      },
    };
    return request(app)
      .post("/api/articles/banana/comments")
      .send(testComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("400: returns error if posted comment is malformed", () => {
    const testComment = {
      newComment: {
        dodgyKey1: "franklin_d",
        dodgyKey2: "Bemused of Basingstoke. What is this guy on?",
      },
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(testComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("PATCH: /api/articles/:article_id", () => {
  test("200: increments a given article's votes when passed newVote object with positive number", () => {
    const testVoteIncrement = {
      newVote: {
        inc_votes: 1,
      },
    };
    return request(app)
      .patch("/api/articles/1")
      .send(testVoteIncrement)
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 101,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("200: decrements a given article's votes when passed newVote object with negative number", () => {
    const testVoteIncrement = {
      newVote: {
        inc_votes: -50,
      },
    };
    return request(app)
      .patch("/api/articles/1")
      .send(testVoteIncrement)
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 50,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("200: ignores unnecessary properties in newVote object", () => {
    const testVoteIncrement = {
      newVote: {
        inc_votes: 50,
        extra_nonsense: "why am I even here?",
      },
    };
    return request(app)
      .patch("/api/articles/1")
      .send(testVoteIncrement)
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 150,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("404: returns error if article_id not found", () => {
    const testVoteIncrement = {
      newVote: {
        inc_votes: 50,
      },
    };
    return request(app)
      .patch("/api/articles/14")
      .send(testVoteIncrement)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found");
      });
  });
  test("400: returns error if article_id is of wrong data type", () => {
    const testVoteIncrement = {
      newVote: {
        inc_votes: 50,
      },
    };
    return request(app)
      .patch("/api/articles/banana")
      .send(testVoteIncrement)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("400: returns error if newVote object malformed", () => {
    const testVoteIncrement = {
      newVote: {
        these_aint_no_votes: 50,
      },
    };
    return request(app)
      .patch("/api/articles/1")
      .send(testVoteIncrement)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("400: returns error if inc_votes is wrong data type", () => {
    const testVoteIncrement = {
      newVote: {
        inc_votes: "fifty",
      },
    };
    return request(app)
      .patch("/api/articles/1")
      .send(testVoteIncrement)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});
