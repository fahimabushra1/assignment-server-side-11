const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, CURSOR_FLAGS, ObjectId } = require('mongodb');
const { query } = require('express');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.stdhw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('smartBike').collection('product');

        app.get('/product', async (req, res) => {
            const query = productCollection.find(query);
            const products = await CURSOR_FLAGS.toArray();
            res.send(products)
        });

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query)
            res.send(product);
        })
    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running');
});
app.listen(port, () => {
    console.log('Listening to port', port);
})
