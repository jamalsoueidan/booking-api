import { faker } from "@faker-js/faker";
import { CustomerModel } from "~/functions/customer";

export const createCustomer = () => {
  const customer = new CustomerModel({
    customerId: parseInt(faker.random.numeric(10), 10),
    email: faker.internet.email(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    phone: "+4531317411",
  });
  return customer.save();
};
