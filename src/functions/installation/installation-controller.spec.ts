import { HttpRequest, InvocationContext } from "@azure/functions";
import { UserControllerCreateUserBody } from "~/functions/user";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { getUserObject } from "~/library/jest/helpers";
import {
  InstallationControllerGetStatus,
  InstallationControllerGetStatusResponse,
  InstallationControllerSetup,
  InstallationControllerSetupRequest,
} from "./installation-controller";

require("~/library/jest/mongoose/mongodb.jest");

describe("InstallationController", () => {
  let context: InvocationContext;
  let request: HttpRequest;
  let response: HttpSuccessResponse<unknown>;

  beforeEach(() => {
    context = createContext();
  });

  it("Should be able to get false status of the installation", async () => {
    request = await createHttpRequest({});

    const response: HttpSuccessResponse<InstallationControllerGetStatusResponse> =
      await InstallationControllerGetStatus(request, context);

    expect(response.jsonBody?.success).toBeTruthy();
    expect(response.jsonBody?.payload.done).toBeFalsy();
  });

  it("Should be able to get true when installation is done", async () => {
    let newUser: UserControllerCreateUserBody = await getUserObject();

    // install
    request = await createHttpRequest<InstallationControllerSetupRequest>({
      body: newUser,
    });
    response = await InstallationControllerSetup(request, context);

    // check status
    request = await createHttpRequest({});
    response = await InstallationControllerGetStatus(request, context);

    expect(response.jsonBody?.success).toBeTruthy();
    const status = response.jsonBody
      ?.payload as InstallationControllerGetStatusResponse;
    expect(status.done).toBeTruthy();
  });
});
