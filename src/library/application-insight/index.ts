import * as appInsights from "applicationinsights";

if (!appInsights.defaultClient) {
  appInsights
    .setup(
      process.env.APPINSIGHTS_INSTRUMENTATIONKEY ||
        "Your_Instrumentation_Key_Here"
    )
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .setUseDiskRetryCaching(true)
    .start();
}

export const telemetryClient = appInsights.defaultClient;
