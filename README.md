# Booking Shopify Api

I am moving the API endpoints from Node/Express, which are hosted on Heroku, to Azure Functions. This allows me to primarily focus on the endpoints, rather than managing the Node Express server with its associated plugins and middleware.

The API specification can be seen hosted at [https://jamalsoueidan.github.io/booking-shopify-api](https://jamalsoueidan.github.io/booking-shopify-api).

Download Openapi 3.x definition [https://github.com/jamalsoueidan/booking-shopify-api/blob/main/docs/openapi.yaml](https://github.com/jamalsoueidan/booking-shopify-api/blob/main/docs/openapi.yaml)

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

## OpenAPI fragments and components (openapi/)

These files are part of the OpenAPI definition but not yet bundled together. These individual files contain different parts of the API specification, such as paths, schemas, or security definitions. These components are organized in a modular way, making it easier to maintain and update the API documentation.

### Bundle openapi

npm run bundle

## Github Actions:

### pull request

1. Running all specs (jest)

### main branch

1. Bundle openapi fragments and generating the api documentation page
2. Deploy docs folder to pages
3. Deploy Azure functions to production

## Postman

In case you need to import openapi def in postman you can use this script to set token in your env after login.

Please create new environment or else below code will not work.

```js
let responseJson = pm.response.json();
let token = responseJson.payload.token;
pm.environment.set("bearerToken", token);
```

## Todo

openapi to use-query
https://xata.io/blog/openapi-typesafe-react-query-hooks
