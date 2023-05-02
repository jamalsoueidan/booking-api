import { HttpRequest, InvocationContext } from "@azure/functions";
import { AuthRole } from "~/functions/auth";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { ScheduleServiceCreate } from "../schedule.service";
import { Schedule } from "../schedule.types";
import {
  ScheduleControllerUpdate,
  ScheduleControllerUpdateRequest,
  ScheduleControllerUpdateResponse,
} from "./update";

require("~/library/jest/mongoose/mongodb.jest");

describe("ScheduleControllerUpdate", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  beforeEach(async () => {
    context = createContext();
  });

  it("should be able to create schedule", async () => {
    const newSchedule = await ScheduleServiceCreate({
      name: "asd",
      customerId: 123,
    });

    const updatedScheduleData: Omit<Schedule, "_id" | "customerId"> = {
      name: "Updated Test Schedule",
      slots: [
        {
          day: "monday",
          intervals: [
            {
              from: "09:00",
              to: "12:00",
            },
            {
              from: "13:00",
              to: "17:00",
            },
          ],
        },
        {
          day: "tuesday",
          intervals: [
            {
              from: "10:00",
              to: "12:00",
            },
            {
              from: "14:00",
              to: "18:00",
            },
          ],
        },
      ],
    };

    request = await createHttpRequest<ScheduleControllerUpdateRequest>({
      query: {
        customerId: 123,
        _id: newSchedule._id,
      },
      body: updatedScheduleData,
      loginAs: AuthRole.owner,
    });

    const res: HttpSuccessResponse<ScheduleControllerUpdateResponse> =
      await ScheduleControllerUpdate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload).toHaveProperty("_id");
    expect(res.jsonBody?.payload.slots[0].day).toEqual(
      (updatedScheduleData.slots as Schedule["slots"])[0].day
    );
    expect(res.jsonBody?.payload.slots[0].intervals).toMatchObject(
      (updatedScheduleData.slots as Schedule["slots"])[0].intervals
    );
  });
});
