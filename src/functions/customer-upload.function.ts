import { app } from "@azure/functions";
import { CustomerUploadControllerResourceURL } from "./customer/controllers/upload/resource-url";

app.http("uploadResourceRequest", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/upload/resource-url",
  handler: CustomerUploadControllerResourceURL,
});
