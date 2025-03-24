import { ApiHandler } from "sst/node/api";
import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();

export const handler = ApiHandler(async (event) => {
  try {
    const userId = event.requestContext.authorizer?.claims.sub;
    const id = event.pathParameters?.id;

    const params = {
      TableName: "Investments",
      Key: {
        id,
      },
    };

    const result = await dynamoDb.get(params).promise();

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Investment not found" }),
      };
    }

    // Check if the investment belongs to the user
    if (result.Item.userId !== userId) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Not authorized to access this investment" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
  } catch (error) {
    console.error("Error getting investment:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not get investment" }),
    };
  }
}); 