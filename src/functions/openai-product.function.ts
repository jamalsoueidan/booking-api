import { app } from "@azure/functions";
import "module-alias/register";
import { OpenAIControllerProductCategorize } from "./openai/controllers/product-categorize";
import { OpenAIControllerProductTitle } from "./openai/controllers/product-title";
import { OpenAIControllerProfile } from "./openai/controllers/profile";

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

app.http("openaiProfile", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "openai/profile",
  handler: OpenAIControllerProfile,
});
