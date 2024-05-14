import { User, UserModel } from "~/functions/user";
import { NotFoundError } from "~/library/handler";
import { shopifyAdmin } from "~/library/shopify";

export type CustomerServiceUpdate = Pick<User, "customerId">;
export type CustomerServiceUpdateBody = Partial<
  Pick<
    User,
    | "fullname"
    | "phone"
    | "email"
    | "yearsExperience"
    | "gender"
    | "professions"
    | "specialties"
    | "speaks"
    | "aboutMe"
    | "shortDescription"
    | "social"
    | "theme"
    | "images"
  >
>;

export const CustomerServiceUpdate = async (
  filter: Pick<User, "customerId">,
  body: CustomerServiceUpdateBody
) => {
  const user = await UserModel.findOne(filter).orFail(
    new NotFoundError([
      {
        path: ["customerId"],
        message: "NOT_FOUND",
        code: "custom",
      },
    ])
  );

  await UserModel.updateOne(filter, body);

  if (user.userMetaobjectId) {
    const fields: Array<{ key: string; value: string }> = [];
    if (body.fullname && user.fullname !== body.fullname) {
      fields.push({
        key: "fullname",
        value: body.fullname,
      });
    }

    if (
      body.shortDescription &&
      user.shortDescription !== body.shortDescription
    ) {
      fields.push({
        key: "short_description",
        value: body.shortDescription,
      });
    }

    if (body.aboutMe && user.aboutMe !== body.aboutMe) {
      fields.push({
        key: "about_me",
        value: body.aboutMe,
      });
    }

    if (body.professions && user.professions !== body.professions) {
      fields.push({
        key: "professions",
        value: JSON.stringify(body.professions || []),
      });
    }

    if (body.theme && user.theme?.color !== body.theme?.color) {
      fields.push({
        key: "theme",
        value: body.theme.color,
      });
    }

    if (
      body.images?.profile?.metaobjectId &&
      user.images?.profile?.metaobjectId !== body.images.profile.metaobjectId
    ) {
      fields.push({
        key: "image",
        value: body.images?.profile?.metaobjectId,
      });
    }

    await shopifyAdmin.request(UPDATE_USER_METAOBJECT, {
      variables: {
        id: user.userMetaobjectId,
        fields,
      },
    });
  }

  return { ...user, ...body };
};

export const UPDATE_USER_METAOBJECT = `#graphql
  mutation UpdateUserMetaobject($id: ID!, $fields: [MetaobjectFieldInput!]!) {
    metaobjectUpdate(id: $id, metaobject: {fields: $fields}) {
      metaobject {
        fields {
          value
          key
        }
      }
    }
  }
` as const;
