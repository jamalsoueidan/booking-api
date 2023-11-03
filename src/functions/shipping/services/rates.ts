import mongoose from "mongoose";

import { ShippingModel } from "../shipping.model";

export type ShippingBody = {
  origin: {
    country: string;
    postal_code: string;
    province: any;
    city: string;
    name: any;
    address1: string;
    address2: string;
    address3: any;
    latitude: number;
    longitude: number;
    phone: string;
    fax: any;
    email: any;
    address_type: any;
    company_name: string;
  };
  destination: {
    country: string;
    postal_code: string;
    province: any;
    city: string;
    name: string;
    address1: string;
    address2: any;
    address3: any;
    latitude: number;
    longitude: number;
    phone: any;
    fax: any;
    email: any;
    address_type: any;
    company_name: any;
  };
  items: Array<{
    name: string;
    sku: string;
    quantity: number;
    grams: number;
    price: number;
    vendor: string;
    requires_shipping: boolean;
    taxable: any;
    fulfillment_service: string;
    properties?: {
      _from: string;
      _to: string;
      _customerId: string;
      Dato: string;
      Tid: string;
      Behandler: string;
      Varighed: string;
      _shippingId?: string;
    };
    product_id: number;
    variant_id: number;
  }>;
  currency: string;
  locale: string;
};

export const ShippingServiceRates = async (body: ShippingBody) => {
  let shippingIds = body.items
    .map((item) => item.properties?._shippingId)
    .filter((id) => typeof id === "string"); // Ensure only numbers

  shippingIds = [...new Set(shippingIds)];

  const onMinDate = new Date(Date.now() + 86400000).toISOString(); // +1 day
  const onMaxDate = new Date(Date.now() + 2 * 86400000).toISOString(); // +2 days

  if (!shippingIds.length) {
    return {
      rates: [
        {
          service_name: `Gratis leverings`,
          service_code: "ETON",
          total_price: 0,
          currency: "DKK",
          min_delivery_date: onMinDate,
          max_delivery_date: onMaxDate,
        },
      ],
    };
  }

  const shippings = await ShippingModel.find({
    _id: { $in: shippingIds.map((l) => new mongoose.Types.ObjectId(l)) },
  });

  const prices = shippings.map((l) => l.cost);

  const totalPrices = prices.reduce((total, price) => total + price, 0);

  return {
    rates: [
      {
        service_name: `${shippings.length} skønhedseksperter til din lokation`,
        description: "Inkludere alle udgifter",
        service_code: "ETON",
        total_price: totalPrices * 100,
        currency: "DKK",
        phone_required: true,
        //min_delivery_date: onMinDate,
        //max_delivery_date: onMaxDate,
      },
    ],
  };
};
