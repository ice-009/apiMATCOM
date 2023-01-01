const {MongoClient} = require('mongodb')
const url= 'mongodb+srv://ice-009:Armaan%4006@cluster0.ynzphiq.mongodb.net/';
const databaseName='apiMatcom'
const client= new MongoClient(url);

async function dbConnect()
{
    let result = await client.connect();
    db= result.db(databaseName);
    return db.collection('blogs');
  
}
module.exports= dbConnect;