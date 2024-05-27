import { CustomerLocationServiceList } from "~/functions/customer/services/location/list";
import { ScheduleModel } from "~/functions/schedule";
import { User } from "~/functions/user";
import { shopifyRest } from "~/library/shopify/rest";

export const updateArticleName = "updateArticle";

export const updateArticle = async ({
  user,
}: {
  user: User;
}): Promise<RootObject> => {
  const schedules = await ScheduleModel.find({
    customerId: user.customerId,
  });

  const parentIds = schedules.flatMap((schedule) =>
    schedule.products.map((product) => product.parentId)
  );

  const days = schedules.flatMap((schedule) =>
    schedule.slots.map((slot) => slot.day.toLowerCase())
  );

  const tags = []; //user.username

  if (user.professions) {
    tags.push(`profession-${user.professions.join(", profession-")}`);
  }

  if (user.speaks) {
    tags.push(`speak-${user.speaks.join(", speak-")}`);
  }

  if (parentIds.length > 0) {
    tags.push(`parentid-${parentIds.join(", parentid-")}`);
  }

  if (days.length > 0) {
    tags.push(`day-${days.join(", day-")}`);
  }

  const locations = await CustomerLocationServiceList({
    customerId: user.customerId,
  });

  if (locations.length > 0) {
    tags.push(
      `city-${locations.map((l) => l.city.toLowerCase()).join(", city-")}`
    );
  }

  const response = await shopifyRest.put(
    `blogs/105364226375/articles/${user.articleId}`,
    {
      data: {
        article: {
          id: user.articleId,
          body_html: user.aboutMeHtml,
          tags: tags.join(", "),
          summary_html: user.shortDescription,
          ...(user.images?.profile
            ? {
                image: {
                  src: user.images?.profile.url,
                  alt: user.username,
                },
              }
            : {}),
          published_at: user.active ? user.createdAt : null,
        },
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create article for user ${user.username}`);
  }

  return await response.json();
};

interface RootObject {
  article: Article;
}
interface Article {
  id: number;
  title: string;
  created_at: string;
  body_html: string;
  blog_id: number;
  author: string;
  user_id?: any;
  published_at: string;
  updated_at: string;
  summary_html: string;
  template_suffix?: any;
  handle: string;
  tags: string;
  admin_graphql_api_id: string;
  image: Image;
}
interface Image {
  created_at: string;
  alt: string;
  width: number;
  height: number;
  src: string;
}
