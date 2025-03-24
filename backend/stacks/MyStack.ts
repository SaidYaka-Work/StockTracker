import { StackContext, Api, Table } from "sst/constructs";

export function API({ stack }: StackContext) {
  // Create the table
  const table = new Table(stack, "Investments", {
    fields: {
      id: "string",
      userId: "string",
      symbol: "string",
      quantity: "number",
      purchasePrice: "number",
      purchaseDate: "string",
      notes: "string",
      createdAt: "string",
      updatedAt: "string",
    },
    primaryIndex: { partitionKey: "id" },
    globalIndexes: {
      userIdIndex: { partitionKey: "userId" },
    },
  });

  // Create the API
  const api = new Api(stack, "Api", {
    defaults: {
      function: {
        bind: [table],
      },
    },
    routes: {
      "POST /investments": "packages/functions/src/create.handler",
      "GET /investments": "packages/functions/src/list.handler",
      "GET /investments/{id}": "packages/functions/src/get.handler",
      "PUT /investments/{id}": "packages/functions/src/update.handler",
      "DELETE /investments/{id}": "packages/functions/src/delete.handler",
    },
  });

  // Show the API endpoint in the output
  stack.addOutputs({
    ApiEndpoint: api.url,
  });

  return {
    api,
    table,
  };
}
