const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, CURSOR_FLAGS, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.stdhw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('smartBike').collection('product');
        const myItemsCollection = client.db('smartBike').collection('myitems');

        app.get('/product', async (req, res) => {
            const query = {}
            const cursor = productCollection.find(query)
            const products = await cursor.toArray()
            res.send(products)
        });

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query)
            res.send(product);
        })


        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            console.log(newProduct)
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        });



        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const updatedQuantity = req.body
            const filter = { _id: ObjectId(id) };
            const option = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updatedQuantity.updatedQuantityCount
                }
            }
            const result = await productCollection.updateOne(filter, updatedDoc, option);
            res.send(result)
            console.log(result)
        })

        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const deletedQuantity = req.body
            console.log(deletedQuantity)
            const filter = { _id: ObjectId(id) };
            const option = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: deletedQuantity.deletedQuantityCount
                }
            }
            const result = await productCollection.updateOne(filter, updatedDoc, option);
            res.send(result)
            console.log(result)
        })



        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        });

        app.get('/myitems', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = myItemsCollection.find(query);
                const addedItems = await cursor.toArray();
                res.send(addedItems);
            }
            else {
                res.status(403).send({ message: 'forbidden access' })
            }
        })

        app.post('/myitems', async (req, res) => {
            const items = req.body;
            const result = await myItemsCollection.insertOne(items);
            res.send(result);
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
