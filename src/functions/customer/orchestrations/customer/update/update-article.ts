import { CustomerServiceGet } from "~/functions/customer/services/customer/get";
import { ScheduleModel } from "~/functions/schedule";
import { UserScheduleServiceLocationsList } from "~/functions/user/services/schedule/locations-list";
import { shopifyRest } from "~/library/shopify/rest";

export const updateArticleName = "updateArticle";
export const updateArticle = async ({
  customerId,
}: {
  customerId: number;
}): Promise<RootObject> => {
  const user = await CustomerServiceGet({ customerId });

  const schedules = await ScheduleModel.find({
    customerId: user.customerId,
  });

  const collectionIds = schedules.flatMap((schedule) =>
    schedule.products
      .filter((p) => p.active)
      .flatMap((product) => product.collectionIds)
  );

  const tags = []; //user.username
  if (collectionIds.length > 0 && user.active) {
    const days = schedules.flatMap((schedule) =>
      schedule.slots.map((slot) => slot.day.toLowerCase())
    );

    if (user.professions) {
      tags.push(`profession-${user.professions.join(", profession-")}`);
    }

    if (user.languages) {
      tags.push(`language-${user.languages.join(", language-")}`);
    }

    tags.push(`collectionid-${collectionIds.join(", collectionid-")}`);

    if (days.length > 0) {
      tags.push(`day-${days.join(", day-")}`);
    }

    const schedule = await UserScheduleServiceLocationsList({
      customerId,
    });

    const locations = schedule.map((item) => item.locations).flat();

    if (locations.length > 0) {
      tags.push(
        `city-${locations.map((l) => l.city.toLowerCase()).join(", city-")}`
      );
      tags.push(
        `location_type-${locations
          .map((l) => l.locationType)
          .join(", location_type-")}`
      );
    }

    tags.push(`gender-${user.gender}`);
  }

  const data = {
    article: {
      id: user.articleId,
      body_html: user.aboutMeHtml,
      tags: tags.join(", "),
      summary_html: user.shortDescription,
      ...(user.images?.profile?.url
        ? {
            image: {
              src: user.images?.profile.url.includes("?")
                ? user.images?.profile.url.split("?")[0]
                : user.images?.profile.url,
              alt: user.username,
            },
          }
        : {}),
      published_at: user.active ? user.createdAt : null,
    },
  };

  const response = await shopifyRest().put(
    `blogs/105364226375/articles/${user.articleId}`,
    {
      data,
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
