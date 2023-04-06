import { UserServiceBelongsToSameGroup } from "~/functions/user";
import { SessionKey } from "~/library/handler";

export type SessionRequest = {
  query: {
    userId: string;
  };
};

export const UserCannotModifyOtherUser = async ({
  query,
  session,
}: SessionKey<SessionRequest>) => {
  if (session.isUser && query.userId !== session.userId) {
    throw { access: "not allowed to modifiy other user" };
  }
};

export const AcessOnlySameGroup = async ({
  query,
  session,
}: SessionKey<SessionRequest>) => {
  if (!session.isOwner) {
    const belongToSameGroup = await UserServiceBelongsToSameGroup({
      userId: query.userId,
      group: session.group,
    });
    if (!belongToSameGroup) {
      throw { access: "not allowed to modifiy staff in other groups" };
    }
  }
};
