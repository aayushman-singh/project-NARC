const { MongoClient } = require('mongodb');

// Replace with your MongoDB connection string (local or Atlas)
const uri = 'mongodb+srv://username:password@cluster.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'; 

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Function to connect to MongoDB
async function connectToDB() {
    try {
        await client.connect();
        console.log("Connected successfully to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

// Call this function before inserting data
connectToDB();
