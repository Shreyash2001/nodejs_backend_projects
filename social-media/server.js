const express = require("express");
const neo4j = require("neo4j-driver");

const app = express();
const port = 3000;

const driver = neo4j.driver(
  "bolt+s://c4f9f7d9.databases.neo4j.io:7687", // Replace with your Neo4j connection string
  neo4j.auth.basic("neo4j", "wod365Ikk_HC_pTkc5WlwHbr3PONME-8RW04MlvtyBY") // Replace with your Neo4j credentials
);

const session = driver.session();

app.use(express.json());

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Create User API
app.post("/users", async (req, res) => {
  const { username, name } = req.body;
  try {
    const result = await session.run(
      "CREATE (u:User {username: $username, name: $name}) RETURN u",
      { username, name }
    );
    res.status(201).send(result.records[0].get("u").properties);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Follow User API
app.post("/users/:username/follow", async (req, res) => {
  const { username } = req.params;
  const { followUsername } = req.body;
  try {
    await session.run(
      "MATCH (a:User {username: $username}), (b:User {username: $followUsername}) " +
        "CREATE (a)-[:FOLLOWS]->(b)",
      { username, followUsername }
    );
    res
      .status(200)
      .send({ message: `${username} is now following ${followUsername}` });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Create Post API
app.post("/users/:username/posts", async (req, res) => {
  const { username } = req.params;
  const { content } = req.body;
  try {
    const result = await session.run(
      "MATCH (u:User {username: $username}) " +
        "CREATE (u)-[:POSTED]->(p:Post {content: $content, createdAt: datetime()}) " +
        "RETURN p",
      { username, content }
    );
    res.status(201).send(result.records[0].get("p").properties);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Like Post API
app.post("/posts/:postId/like", async (req, res) => {
  const { postId } = req.params;
  const { username } = req.body;
  try {
    await session.run(
      "MATCH (u:User {username: $username}), (p:Post) " +
        "WHERE ID(p) = $postId " +
        "CREATE (u)-[:LIKED]->(p)",
      { username, postId: parseInt(postId, 10) }
    );
    res.status(200).send({ message: `${username} liked post ${postId}` });
  } catch (error) {
    res.status(500).send(error);
  }
});
