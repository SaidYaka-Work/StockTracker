import { ApiHandler } from "sst/node/api";
import { DynamoDB } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const dynamoDb = new DynamoDB.DocumentClient();

export const handler = ApiHandler(async (event) => {
  try {
    const data = JSON.parse(event.body || "{}");
    const timestamp = new Date().toISOString();

    const params = {
      TableName: "Investments",
      Item: {
        id: uuidv4(),
        userId: event.requestContext.authorizer?.claims.sub,
        symbol: data.symbol,
        quantity: data.quantity,
        purchasePrice: data.purchasePrice,
        purchaseDate: data.purchaseDate,
        notes: data.notes || "",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    };

    await dynamoDb.put(params).promise();

    return {
      statusCode: 201,
      body: JSON.stringify(params.Item),
    };
  } catch (error) {
    console.error("Error creating investment:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not create investment" }),
    };
  }
}); 