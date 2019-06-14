const MongoClient = require('mongodb').MongoClient
const mongoUsername = process.env.MONGO_USERNAME
const mongoPassword = process.env.MONGO_PASSWORD
const uri =
  'mongodb+srv://' + mongoUsername + ':' + mongoPassword + '@mongodailymenu001-gn6yb.gcp.mongodb.net/test?retryWrites=true&w=majority'
let client

async function connectMongoDb(){
  try {
    client = await MongoClient.connect(uri, { useNewUrlParser: true })
    const db = client.db('daily_menu').collection('daily_menu_data')
    await db.insertOne({ hello: 'hello goodbye', bye: 'good bye' })
    let res = await db.find({}).toArray()
    console.log(res[res.length - 1].bye)
  } catch (e) {
    console.error(e)
  }
  client.close()
}
connectMongoDb()
