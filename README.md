# Booking Shopify Api

I have developed two applications that use Azure Function API endpoints.

The API specification can be seen hosted at [https://jamalsoueidan.github.io/booking-shopify-api](https://jamalsoueidan.github.io/booking-shopify-api).

I am moving the API endpoints from Node/Express, which are hosted on Heroku, to Azure Functions. This allows me to primarily focus on the endpoints, rather than managing the Node Express server with its associated plugins and middleware.

## 1. Create local.settings.json

Assign the correct value to all env values.

```js
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsFeatureFlags": "EnableWorkerIndexing",
    "CosmosDbConnectionString": "",
    "TokenSecret": ""
  }
}
```

## 2. To enable V4 you have to add this env to your Azure Function App

To enable your V4 programming model app to run in Azure, you need to add a new application setting named AzureWebJobsFeatureFlags with a value of EnableWorkerIndexing. This setting is already in your local.settings.json file.

## OpenAPI fragments and components

These files are part of the OpenAPI definition but not yet bundled together. These individual files contain different parts of the API specification, such as paths, schemas, or security definitions. These components are organized in a modular way, making it easier to maintain and update the API documentation.

### Bundle openapi

npm run bundle

The API specification can be seen hosted at
[https://jamalsoueidan.github.io/booking-shopify-api](https://jamalsoueidan.github.io/booking-shopify-api).

The api openapi file is hosted here:
missing file

