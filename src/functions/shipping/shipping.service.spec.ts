import { faker } from "@faker-js/faker";
import { LocationServiceLookup } from "~/functions/location";
import { createLocation } from "~/library/jest/helpers/location";
import { LookupModel } from "../lookup";
import {
  ShippingServiceCalculate,
  ShippingServiceCalculateCost,
  ShippingServiceGet,
} from "./shipping.service";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/functions/location", () => ({
  LocationServiceLookup: jest.fn(),
}));

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
      distance: { text: "5.3 km", value: 5.3 },
    };

    const actualCost = ShippingServiceCalculateCost(lookup);

    expect(actualCost).toEqual(106);
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
      distance: { text: "5.3 km", value: 5.3 },
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
            _lookupId: lookup._id.toString(),
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
    expect(response).toEqual({
      rates: [
        {
          service_name: "1 skønhedseksperter til din lokation",
          description: "Inkludere alle udgifter",
          service_code: "ETON",
          total_price: 10600,
          currency: "DKK",
          phone_required: true,
        },
      ],
    });
  });

  it("should calculate destination from locationId", async () => {
    const location = await createLocation({
      locationType: "destination" as any,
      customerId: 1,
      distanceHourlyRate: 200,
      fixedRatePerKm: 2,
      minDistanceForFree: 0,
    });

    (LocationServiceLookup as jest.Mock).mockResolvedValue({
      location,
      travelTime: {
        duration: {
          text: "120 min",
          value: 120,
        },
        distance: {
          text: "100 km",
          value: 100,
        },
      },
    });

    const response = await ShippingServiceCalculate({
      locationId: location._id,
      destination: {
        fullAddress: "Dortesvej 17 1 th",
      },
    });

    expect(response).toEqual({
      duration: { text: "120 min", value: 120 },
      distance: { text: "100 km", value: 100 },
      cost: { value: 600, currency: "DKK" },
    });
  });
});
