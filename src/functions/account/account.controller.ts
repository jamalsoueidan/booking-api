import {
  StaffModel,
  StaffServiceFindByIdAndUpdate,
  StaffServiceFindOne,
} from "@jamalsoueidan/backend.services.staff";
import {
  AppControllerProps,
  StaffBodyUpdate,
  StaffSettingsUpdateBodyRequest,
} from "@jamalsoueidan/pkg.backend-types";

export const getSettings = ({ session }: AppControllerProps<never, never>) =>
  StaffModel.findById(session.staff, "_id language timeZone");

export const updateSettings = async ({
  body,
  session,
}: AppControllerProps<never, StaffSettingsUpdateBodyRequest>) => {
  return StaffModel.findByIdAndUpdate(
    { _id: session.staff },
    {
      timeZone: body.timeZone,
      language: body.language,
    },
    { new: true, fields: "_id language timeZone" }
  );
};

export const getAccount = ({ session }: AppControllerProps) => {
  const { staff, shop } = session;
  return StaffServiceFindOne({ _id: staff, shop });
};

export const updateAccount = ({
  body,
  session,
}: AppControllerProps<never, StaffBodyUpdate>) => {
  const id = session.staff;
  delete body.group;
  delete body.active;
  return StaffServiceFindByIdAndUpdate(id, body);
};
