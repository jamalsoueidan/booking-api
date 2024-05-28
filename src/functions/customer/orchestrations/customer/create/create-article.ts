import { User } from "~/functions/user";
import { shopifyRest } from "~/library/shopify/rest";

export const createArticleName = "createArticle";
export const createArticle = async ({
  user,
}: {
  user: User;
}): Promise<RootObject> => {
  if (!user.collectionMetaobjectId || !user.userMetaobjectId) {
    throw new Error(
      `Failed to create article without collectionMetaobjectId or userMetaobjectId for ${user.username}`
    );
  }

  const tags = []; //user.username

  if (user.professions) {
    tags.push(`profession-${user.professions.join(", profession-")}`);
  }

  if (user.speaks) {
    tags.push(`speak-${user.speaks.join(", speak-")}`);
  }

  tags.push(`gender-${user.gender}`);

  console.log(
    JSON.stringify(
      {
        data: {
          article: {
            blog_id: 105364226375,
            title: user.username,
            author: "System",
            tags: tags.join(", "),
            body_html: user.aboutMeHtml,
            metafields: [
              {
                key: "user",
                value: user.userMetaobjectId,
                namespace: "booking",
              },
              {
                key: "collection",
                value: user.collectionMetaobjectId,
                namespace: "booking",
              },
            ],
            summary_html: user.shortDescription,
            published_at: user.active ? user.createdAt : null,
          },
        },
      },
      null,
      2
    )
  );

  const response = await shopifyRest().post("blogs/105364226375/articles", {
    data: {
      article: {
        blog_id: 105364226375,
        title: user.username,
        author: "System",
        tags: tags.join(", "),
        body_html: user.aboutMeHtml,
        metafields: [
          {
            key: "user",
            value: user.userMetaobjectId,
            namespace: "booking",
          },
          {
            key: "collection",
            value: user.collectionMetaobjectId,
            namespace: "booking",
          },
        ],
        summary_html: user.shortDescription,
        published_at: user.active ? user.createdAt : null,
      },
    },
  });

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
