import {DynamoDB} from "@aws-sdk/client-dynamodb"

const {NODE_ENV, SETUP_DB = false} = process.env;

if (!SETUP_DB)
    throw new Error("To init the database, you must set the 'SETUP_DB' env variable to 'true'!")

if (NODE_ENV === 'production')
    throw new Error("The database should not be initialized in production!")

const client = new DynamoDB({endpoint: "http://localhost:8000"});

(async () => {
    const params = {
        AttributeDefinitions: [
            {
                AttributeName: "ID",
                AttributeType: "N",
            }
        ],
        KeySchema: [
            {
                AttributeName: "ID",
                KeyType: "HASH"
            }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
        },
        TableName: "OnlineUsers",
    };
    const createTableCommandOutput = await client.createTable(params).catch(err => console.log);
    console.log(createTableCommandOutput);
})();