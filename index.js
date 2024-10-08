const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5001;


// Configure CORS options
const corsOptions = {
    origin: ['http://localhost:5173'],
 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.use(express.json());
app.options('*', cors()); // Handle preflight requests for all routes

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7plli.mongodb.net/spotDB?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)

        const spotCollection = client.db('spotDB').collection('spot');
        const countryCollection = client.db('spotDB').collection('countries');

        // Get all tourists spots
        app.get('/add-tourists-spot', async (req, res) => {
            const cursor = spotCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        // Get specific spot using id
        app.get('/add-tourists-spot/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await spotCollection.findOne(query);
            res.send(result);
        });

        // Get spots added by a specific user
        app.get('/my-list', (req, res) => {
            const email = req.query.email;

            if (!email) {
                return res.status(400).send({ message: 'Email is required' });
            }
            // Query to find spots by user's email
            const query = { userEmail: email };

            spotCollection.find(query).toArray()
                .then(result => {
                    res.send(result);
                })
                .catch(error => {
                    console.error('Error fetching spots:', error);
                    res.status(500).send({ message: 'Error fetching spots' });
                });
        });

        // Get spot by ID
        app.get('/my-list/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await spotCollection.findOne(query);
            res.send(result);
        })

        // Get tourist spots by country name
        app.get('/tourist-spots/:countryName', async (req, res) => {
            const countryName = req.params.countryName;
            const query = { country: countryName };
            const spots = await spotCollection.find(query).toArray();
            res.send(spots);
        });

        // Get all countries
        app.get('/countries', (req, res) => {
            countryCollection.find().toArray()
                .then(countries => {
                    res.status(200).send(countries);
                })
                .catch(error => {
                    console.error('Error fetching countries:', error);
                    res.status(500).send({ message: 'Failed to fetch countries' });
                });
        });

        // Update spot by ID
        app.put('/my-list/:id', (req, res) => {
            const id = req.params.id;
            const updatedSpot = req.body;
            const query = { _id: new ObjectId(id) };
            const update = {
                $set: {
                    image: updatedSpot.image,
                    spotName: updatedSpot.spotName,
                    country: updatedSpot.country,
                    location: updatedSpot.location,
                    description: updatedSpot.description,
                    cost: updatedSpot.cost,
                    seasonality: updatedSpot.seasonality,
                    travelTime: updatedSpot.travelTime,
                    visitors: updatedSpot.visitors,
                    userEmail: updatedSpot.userEmail,
                    userName: updatedSpot.userName,
                },
            };

            spotCollection
                .updateOne(query, update)
                .then((result) => {
                    if (result.modifiedCount > 0) {
                        res.status(200).json({ message: 'Spot updated successfully!' });
                    } else {
                        res.status(200).json({ message: 'No changes were made.' });
                    }
                })
                .catch((error) => {
                    console.error('Error updating spot:', error);
                    res.status(500).json({ error: 'Failed to update the spot.' });
                });
        });

        // Delete spot by ID
        app.delete('/add-tourists-spot/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await spotCollection.deleteOne(query);
            res.send(result);
        });

        // Add new tourist spot
        app.post('/add-tourists-spot', async (req, res) => {
            const newSpot = req.body;
            console.log(newSpot);
            const result = await spotCollection.insertOne(newSpot);
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('travel tide server is running')
});

app.listen(port, () => {
    console.log(`travel tide server is running on ${port}`)
});