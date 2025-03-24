import { ApiHandler } from "sst/node/api";
import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();

export const handler = ApiHandler(async (event) => {
  try {
    const userId = event.requestContext.authorizer?.claims.sub;

    const params = {
      TableName: "Investments",
      IndexName: "userIdIndex",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    };

    const result = await dynamoDb.query(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    console.error("Error listing investments:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not list investments" }),
    };
  }
}); 