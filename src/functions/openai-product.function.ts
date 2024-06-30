import { app } from "@azure/functions";
import "module-alias/register";
import { OpenAIControllerProductCategorize } from "./openai/controllers/product-categorize";
import { OpenAIControllerProductTitle } from "./openai/controllers/product-title";

app.http("openaiProductCategorize", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "openai/products-categorize",
  handler: OpenAIControllerProductCategorize,
});

app.http("openaiProductTitle", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "openai/products-title",
  handler: OpenAIControllerProductTitle,
});
