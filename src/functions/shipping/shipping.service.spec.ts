import { faker } from "@faker-js/faker";
import { LookupModel } from "../lookup";
import {
  ShippingServiceCalculateCost,
  ShippingServiceGet,
} from "./shipping.service";

require("~/library/jest/mongoose/mongodb.jest");

describe("ShippingService", () => {
  it("should correctly calculate the cost", () => {
    const lookup = {
      origin: {
        name: faker.name.firstName(),
        customerId: faker.datatype.number({ min: 1, max: 100000 }),
        fullAddress: faker.address.streetAddress(),
        distanceHourlyRate: 100,
        fixedRatePerKm: 20,
        minDistanceForFree: 5,
      },
      destination: {
        name: faker.name.firstName(),
        fullAddress: faker.address.streetAddress(),
      },
      duration: {
        text: "1 hour",
        value: 60,
      },
      distance: { text: "5.3 km", value: 5342 },
    };

    const actualCost = ShippingServiceCalculateCost(lookup);

    expect(actualCost).toEqual(107);
  });

  it("should calculate destination in available slots", async () => {
    const lookup = await LookupModel.create({
      origin: {
        name: faker.name.firstName(),
        customerId: faker.datatype.number({ min: 1, max: 100000 }),
        fullAddress: faker.address.streetAddress(),
        distanceHourlyRate: 100,
        fixedRatePerKm: 20,
        minDistanceForFree: 5,
      },
      destination: {
        name: faker.name.firstName(),
        fullAddress: faker.address.streetAddress(),
      },
      duration: {
        text: "1 hour",
        value: 60,
      },
      distance: { text: "5.3 km", value: 5342 },
    });

    const shippingBody = {
      origin: {
        country: "DK",
        postal_code: "8000",
        province: null,
        city: "Aarhus",
        name: null,
        address1: "Trepkasgade 25, st",
        address2: "",
        address3: null,
        latitude: 56.14482400000001,
        longitude: 10.189414,
        phone: "+4570603062",
        fax: null,
        email: null,
        address_type: null,
        company_name: "BySisters",
      },
      destination: {
        country: "DK",
        postal_code: "8220",
        province: null,
        city: "Brabrand",
        name: "Jam koads",
        address1: "Dortesvej 21, 1 th",
        address2: null,
        address3: null,
        latitude: 56.15948239999999,
        longitude: 10.131725,
        phone: null,
        fax: null,
        email: null,
        address_type: null,
        company_name: null,
      },
      items: [
        {
          name: "Børneklip (fra 6 år) - Artist 0",
          sku: "",
          quantity: 1,
          grams: 0,
          price: 0,
          vendor: "By Sisters",
          requires_shipping: true,
          taxable: null,
          fulfillment_service: "manual",
          properties: {
            _from: "2023-07-12T08:00:00.000Z",
            _to: "2023-07-12T09:15:00.000Z",
            _customerId: "7106990342471",
            Dato: "onsdag, 12. juli ",
            Tid: "10:00",
            Behandler: "hana nielsen",
            Varighed: "1 timer",
            _lookupId: lookup._id,
          },
          product_id: 8022088646930,
          variant_id: 46727191036231,
        },
        {
          name: "Børneklip (fra 6 år) - Artist 0",
          sku: "",
          quantity: 1,
          grams: 0,
          price: 0,
          vendor: "By Sisters",
          requires_shipping: true,
          taxable: null,
          fulfillment_service: "manual",
          properties: {
            _from: "2023-07-12T08:00:00.000Z",
            _to: "2023-07-12T09:15:00.000Z",
            _customerId: "7106990342471",
            Dato: "onsdag, 12. juli ",
            Tid: "10:00",
            Behandler: "hana nielsen",
            Varighed: "1 timer",
          },
          product_id: 8022088646930,
          variant_id: 46727191036231,
        },
        {
          name: "Børneklip (fra 6 år) - Artist 0",
          sku: "",
          quantity: 1,
          grams: 0,
          price: 0,
          vendor: "By Sisters",
          requires_shipping: true,
          taxable: null,
          fulfillment_service: "manual",
          product_id: 8022088646930,
          variant_id: 46727191036231,
        },
      ],
      currency: "DKK",
      locale: "da-DK",
    };

    const response = await ShippingServiceGet(shippingBody);
  });
});
