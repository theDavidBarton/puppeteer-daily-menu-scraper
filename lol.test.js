const MongoClient = require('mongodb').MongoClient

const mongoUsername = process.env.MONGO_USERNAME
const mongoPassword = process.env.MONGO_PASSWORD
const uri =
  'mongodb+srv://' +
  mongoUsername +
  ':' +
  mongoPassword +
  '@mongodailymenu001-gn6yb.gcp.mongodb.net/daily_menu?retryWrites=true&w=majority'


describe('insert', () => {
  let connection
  let db

  beforeAll(async () => {
    connection = await MongoClient.connect(
      uri,
      {
        useNewUrlParser: true
      }
    )
    db = await connection.db('daily_menu')
  })

  afterAll(async () => {
    await connection.close()
    await db.close()
  })

  it('should insert a doc into collection', async () => {
    const users = db.collection('users')

    const mockUser = { _id: 'some-user-id', name: 'John' }
    await users.insertOne(mockUser)

    const insertedUser = await users.findOne({ _id: 'some-user-id' })
    expect(insertedUser).toEqual(mockUser)
  })
})
