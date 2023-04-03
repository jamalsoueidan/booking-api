import { app } from "@azure/functions";
import {
  UserControllerCreateUser,
  UserControllerCreateUserApi,
  UserControllerGetAllUsers,
  UserControllerGetById,
  UserControllerUpdate,
} from "./user/user.controller";

app.http("userGetAll", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user",
  handler: UserControllerGetAllUsers,
});

app.http("userCreateUser", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "user",
  handler: UserControllerCreateUser,
});

app.http("userCreateUserApi", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "create-user",
  handler: UserControllerCreateUserApi,
});

app.http("userGetById", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/:id",
  handler: UserControllerGetById,
});

app.http("userUpdateById", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "user/:id",
  handler: UserControllerUpdate,
});
