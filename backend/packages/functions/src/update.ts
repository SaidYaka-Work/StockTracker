import { ApiHandler } from "sst/node/api";
import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();

export const handler = ApiHandler(async (event) => {
  try {
    const userId = event.requestContext.authorizer?.claims.sub;
    const id = event.pathParameters?.id;
    const data = JSON.parse(event.body || "{}");
    const timestamp = new Date().toISOString();

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
        body: JSON.stringify({ error: "Not authorized to update this investment" }),
      };
    }

    // Update the investment
    const updateParams = {
      TableName: "Investments",
      Key: {
        id,
      },
      UpdateExpression: "SET #symbol = :symbol, #quantity = :quantity, #purchasePrice = :purchasePrice, #purchaseDate = :purchaseDate, #notes = :notes, #updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#symbol": "symbol",
        "#quantity": "quantity",
        "#purchasePrice": "purchasePrice",
        "#purchaseDate": "purchaseDate",
        "#notes": "notes",
        "#updatedAt": "updatedAt",
      },
      ExpressionAttributeValues: {
        ":symbol": data.symbol,
        ":quantity": data.quantity,
        ":purchasePrice": data.purchasePrice,
        ":purchaseDate": data.purchaseDate,
        ":notes": data.notes || "",
        ":updatedAt": timestamp,
      },
      ReturnValues: "ALL_NEW",
    };

    const updateResult = await dynamoDb.update(updateParams).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(updateResult.Attributes),
    };
  } catch (error) {
    console.error("Error updating investment:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not update investment" }),
    };
  }
}); 