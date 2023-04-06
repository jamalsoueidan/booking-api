import {
  addDays,
  addHours,
  endOfMonth,
  endOfToday,
  endOfWeek,
  setHours,
  startOfMonth,
  startOfToday,
  startOfWeek,
} from "date-fns";
import { createUser } from "~/library/jest/helpers";
import { User } from "../user";
import { resetTime } from "./shift.helper";
import { IShift } from "./shift.schema";
import {
  ShiftServiceCreate,
  ShiftServiceCreateGroup,
  ShiftServiceDestroy,
  ShiftServiceDestroyGroup,
  ShiftServiceGetAll,
  ShiftServiceUpdate,
  ShiftServiceUpdateGroup,
} from "./shift.service";
import { Tag } from "./shift.types";

require("~/library/jest/mongoose/mongodb.jest");

const tag = Tag.weekday;

describe("shift service test", () => {
  let user: User;

  beforeEach(async () => {
    user = await createUser();
  });

  it("Should be able to add one shift and get it by date range", async () => {
    const userId = user._id;
    const end = endOfToday();
    const start = startOfToday();

    await ShiftServiceCreate(
      {
        userId,
      },
      {
        end,
        start,
        tag,
      }
    );

    const shifts = await ShiftServiceGetAll({
      end,
      userId,
      start,
    });

    expect(shifts.length).toEqual(1);
  });

  it("should be able to update shift", async () => {
    const shift = await ShiftServiceCreate(
      {
        userId: user._id,
      },
      {
        end: addHours(new Date(), 6),
        start: new Date(),
        tag,
      }
    );

    const start = addDays(new Date(), 1);
    const end = addHours(start, 1);
    const updated = await ShiftServiceUpdate(
      {
        shift: shift._id,
        userId: user._id,
      },
      {
        end,
        start,
      }
    );

    expect(updated?.start).toStrictEqual(resetTime(start));
    expect(updated?.end).toStrictEqual(resetTime(end));
  });

  it("Should be able to create group shift and get them by date range", async () => {
    const start = startOfWeek(startOfToday());
    const end = endOfWeek(setHours(new Date(), 18));

    await ShiftServiceCreateGroup(
      {
        userId: user._id,
      },
      {
        days: ["thursday"],
        end,
        start,
        tag,
      }
    );

    const shifts = await ShiftServiceGetAll({
      end,
      userId: user._id,
      start,
    });

    const groupIds = shifts.map(({ groupId }: IShift) => groupId);
    const unqiue = [...new Set(groupIds)];

    expect(shifts.length).toEqual(1);
    expect(unqiue.length).toEqual(1);
  });

  it("Should be able to create group shift and update them", async () => {
    let start = startOfMonth(new Date(2022, 2));
    let end = endOfMonth(new Date(2022, 2));

    const createdShifts = await ShiftServiceCreateGroup(
      {
        userId: user._id,
      },
      {
        days: ["thursday"],
        end,
        start,
        tag,
      }
    );

    start = startOfMonth(new Date(2022, 3));
    end = endOfMonth(new Date(2022, 3));

    const updatedShifts = await ShiftServiceUpdateGroup(
      {
        groupId: createdShifts[0].groupId || "",
        userId: user._id,
      },
      {
        days: ["wednesday"],
        end,
        start,
        tag,
      }
    );

    const shifts = await ShiftServiceGetAll({
      end,
      userId: user._id,
      start,
    });

    expect(createdShifts.length).toBe(5);
    expect(updatedShifts.length).toBe(4);
    expect(shifts.length).toBe(4);
  });

  it("Should be able to delete shift", async () => {
    const shift = await ShiftServiceCreate(
      {
        userId: user._id,
      },
      {
        end: endOfToday(),
        start: startOfToday(),
        tag,
      }
    );

    const destroyed = await ShiftServiceDestroy({
      shift: shift._id.toString(),
      userId: user._id.toString(),
    });

    expect(destroyed.deletedCount).toBe(1);
  });

  it("Should be able to delete group shift", async () => {
    let start = startOfMonth(new Date(2022, 2));
    let end = endOfMonth(new Date(2022, 2));

    const createdShifts = await ShiftServiceCreateGroup(
      {
        userId: user._id,
      },
      {
        days: ["thursday"],
        end,
        start,
        tag,
      }
    );

    const groupId = createdShifts[0].groupId || "";

    const destroyed = await ShiftServiceDestroyGroup({
      groupId,
      userId: user._id.toString(),
    });

    expect(destroyed.deletedCount).toBe(5);
  });
});
