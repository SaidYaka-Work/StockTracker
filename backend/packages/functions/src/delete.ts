import { ApiHandler } from "sst/node/api";
import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();

export const handler = ApiHandler(async (event) => {
  try {
    const userId = event.requestContext.authorizer?.claims.sub;
    const id = event.pathParameters?.id;

    // First, check if the investment exists and belongs to the user
    const getParams = {
      TableName: "Investments",
      Key: {
        id,
      },
    };

    const result = await dynamoDb.get(getParams).promise();

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Investment not found" }),
      };
    }

    if (result.Item.userId !== userId) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Not authorized to delete this investment" }),
      };
    }

    // Delete the investment
    const deleteParams = {
      TableName: "Investments",
      Key: {
        id,
      },
    };

    await dynamoDb.delete(deleteParams).promise();

    return {
      statusCode: 204,
    };
  } catch (error) {
    console.error("Error deleting investment:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not delete investment" }),
    };
  }
}); 