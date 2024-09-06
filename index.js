const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");

app.use(cors());
app.use(express.json());
require("dotenv").config();

app.get("/", (req, res) => {
  res.send(`Travel App running on port ${port}`);
});

// Mongo db connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@travel-app-24.h3cwe5f.mongodb.net/?retryWrites=true&w=majority&appName=Travel-App-24`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const travelCollection = client.db("spotsDB").collection("spots");
    const myListCollection = client.db("spotsDB").collection("myList");

    // create a get connection

    app.get("/spots", async (req, res) => {
      const cursor = travelCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // send data to sever side then to DB
    app.post("/spots", async (req, res) => {
      const newSpot = req.body;
      const result = await travelCollection.insertOne(newSpot);
      res.send(result);
    });

    //post myList to myList collection DB
    app.post("/myList", async (req, res) => {
      const myList = req.body;
      const query = { listId: myList.listId, email: myList.email };
      const existingList = await myListCollection.findOne(query);
      if (existingList) {
        return res.send({ message: "already listed", insertedId: null });
      }
      const result = await myListCollection.insertOne(myList);
      res.send(result);
    });

    //get from myList
    app.get("/myList", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await myListCollection.find(query).toArray();
      res.send(result);
    });

    //delete for list
    app.delete("/myList/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await myListCollection.deleteOne(query);
      res.send(result);
    });

    // get single data
    app.get("/spots/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await travelCollection.findOne(query);
      res.send(result);
    });

    //delete spots
    app.delete("/myUpdates/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await travelCollection.deleteOne(query);
      res.send(result);
    });

    //get sports by email
    app.get("/myUpdates", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await travelCollection.find(query).toArray();
      res.send(result);
    });

    // update spot data
    app.put("/spots/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateSpot = req.body;
      const spot = {
        $set: {
          name: updateSpot.name,
          zone: updateSpot.zone,
          country: updateSpot.country,
          location: updateSpot.location,
          description: updateSpot.description,
          seasonality: updateSpot.seasonality,
          travelTime: updateSpot.travelTime,
          averageCost: updateSpot.averageCost,
          visitor: updateSpot.visitor,
          email: updateSpot.email,
          username: updateSpot.username,
          photo: updateSpot.photo,
        },
      };

      const result = await travelCollection.updateOne(query, spot, options);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// Define API endpoints

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
