# Booking Shopify Api

I have developed two distinct applications that utilize these Azure Function API endpoints.

I am transitioning the API endpoints from Node/Express, which are hosted on Heroku, to Azure Functions. This allows me to primarily focus on the endpoints, rather than managing the Node Express server with its associated plugins and middleware.

## local.settings.json

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

## IMPORTANT

To enable your V4 programming model app to run in Azure, you need to add a new application setting named AzureWebJobsFeatureFlags with a value of EnableWorkerIndexing. This setting is already in your local.settings.json file.
