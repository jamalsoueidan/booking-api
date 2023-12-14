import { faker } from "@faker-js/faker";

import mongoose from "mongoose";
import { ShippingModel } from "../shipping.model";
import { ShippingServiceRates } from "./rates";

require("~/library/jest/mongoose/mongodb.jest");

describe("ShippingServiceRates", () => {
  it("should calculate destination in available slots", async () => {
    const shipping = await ShippingModel.create({
      location: new mongoose.Types.ObjectId(),
      origin: {
        name: faker.person.firstName(),
        customerId: faker.number.int({ min: 1, max: 100000 }),
        fullAddress: faker.location.streetAddress(),
        distanceHourlyRate: 100,
        fixedRatePerKm: 20,
        distanceForFree: 5,
      },
      destination: {
        name: faker.person.firstName(),
        fullAddress: faker.location.streetAddress(),
      },
      duration: {
        text: "1 hour",
        value: 60,
      },
      cost: {
        currency: "DKK",
        value: 100,
      },
      distance: { text: "5.3 km", value: 5.3 },
    });

    const shippingBody = {
      rate: {
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
              _shippingId: shipping._id.toString(),
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
      },
    };

    const response = await ShippingServiceRates(shippingBody);
    expect(response).toEqual({
      rates: [
        {
          service_name: "Udgifter i forbindelse med kørsel",
          service_code: "ETON",
          total_price: 10000,
          currency: "DKK",
          phone_required: true,
        },
      ],
    });
  });

  it("should return 0 price when _freeShipping is in properties", async () => {
    const shipping = await ShippingModel.create({
      location: new mongoose.Types.ObjectId(),
      origin: {
        name: faker.person.firstName(),
        customerId: faker.number.int({ min: 1, max: 100000 }),
        fullAddress: faker.location.streetAddress(),
        distanceHourlyRate: 100,
        fixedRatePerKm: 20,
        distanceForFree: 5,
      },
      destination: {
        name: faker.person.firstName(),
        fullAddress: faker.location.streetAddress(),
      },
      duration: {
        text: "1 hour",
        value: 60,
      },
      cost: {
        currency: "DKK",
        value: 100,
      },
      distance: { text: "5.3 km", value: 5.3 },
    });

    const shippingBody = {
      rate: {
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
              _shippingId: shipping._id.toString(),
              _freeShipping: "true",
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
      },
    };

    const response = await ShippingServiceRates(shippingBody);
    expect(response).toEqual({
      rates: [
        {
          service_name: "Demo (udgifter 10000)",
          service_code: "ETON",
          total_price: 0,
          currency: "DKK",
          phone_required: true,
        },
      ],
    });
  });
});
