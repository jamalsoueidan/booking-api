import { faker } from "@faker-js/faker";
import { CollectionModel } from "~/functions/collection";

export const createCollection = () => {
  return CollectionModel.create({
    collectionId: parseInt(faker.random.numeric(10), 10),
    title: faker.company.name(),
  });
};
