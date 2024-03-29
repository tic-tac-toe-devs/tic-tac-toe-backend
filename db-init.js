import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { TABLE_GAMES, TABLE_ONLINE_USERS } from './src/constants.js'

const { NODE_ENV, SETUP_DB = false } = process.env

if (!SETUP_DB) throw new Error("To init the database, you must set the 'SETUP_DB' env variable to 'true'!")

if (NODE_ENV === 'production') throw new Error('The database should not be initialized in production!')

const client = new DynamoDB({ endpoint: 'http://localhost:8000' })

const onlineUsersParams = {
  AttributeDefinitions: [
    {
      AttributeName: 'id',
      AttributeType: 'S'
    }
  ],
  KeySchema: [
    {
      AttributeName: 'id',
      KeyType: 'HASH'
    }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  },
  TableName: TABLE_ONLINE_USERS
}
await client.createTable(onlineUsersParams).catch((e) => console.error(e))

const gamesParams = {
  AttributeDefinitions: [
    {
      AttributeName: 'id',
      AttributeType: 'S'
    }
  ],
  KeySchema: [
    {
      AttributeName: 'id',
      KeyType: 'HASH'
    }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  },
  TableName: TABLE_GAMES
}
await client.createTable(gamesParams).catch((e) => console.error(e))
