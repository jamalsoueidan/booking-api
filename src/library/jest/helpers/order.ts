import { faker } from "@faker-js/faker";
import { Order } from "~/functions/order/order.types";

export const getOrderObject = ({
  customerId,
  lineItemsTotal,
}: {
  customerId: number;
  lineItemsTotal: number;
}): Order => {
  const line_items = Array(lineItemsTotal)
    .fill(lineItemsTotal)
    .map(() => ({
      id: faker.number.int({ min: 1, max: 1000000000 }),
      admin_graphql_api_id: "gid://shopify/LineItem/15174509101383",
      fulfillable_quantity: 1,
      fulfillment_service: "manual",
      fulfillment_status: null,
      gift_card: false,
      grams: 0,
      name: faker.word.sample(),
      price: "0.00",
      price_set: {
        shop_money: { amount: "0.00", currency_code: "DKK" },
        presentment_money: { amount: "0.00", currency_code: "DKK" },
      },
      product_exists: true,
      product_id: 8022088745234,
      properties: {
        ...generateRandomDateRange(),
        customerId,
      },
      quantity: 1,
      requires_shipping: false,
      sku: "",
      taxable: false,
      title: faker.word.sample(),
      total_discount: "0.00",
      total_discount_set: {
        shop_money: { amount: "0.00", currency_code: "DKK" },
        presentment_money: { amount: "0.00", currency_code: "DKK" },
      },
      variant_id: 48807163691335,
      variant_inventory_management: null,
      variant_title: "Artist 0",
      vendor: "By Sisters",
    }));

  return {
    id: faker.number.int({ min: 1, max: 1000000000 }),
    admin_graphql_api_id: "gid://shopify/Order/5874046992711",
    buyer_accepts_marketing: true,
    cancel_reason: null,
    cancelled_at: null,
    client_details: {
      accept_language: "da-DK",
      browser_height: null,
      browser_ip: "176.89.108.222",
      browser_width: null,
      session_hash: null,
      user_agent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    },
    closed_at: null,
    confirmed: true,
    contact_email: "test@soueidan.com",
    created_at: "2023-12-09T06:53:51+01:00",
    currency: "DKK",
    current_subtotal_price: "0.00",
    current_subtotal_price_set: {
      shop_money: { amount: "0.00", currency_code: "DKK" },
      presentment_money: { amount: "0.00", currency_code: "DKK" },
    },
    current_total_additional_fees_set: null,
    current_total_discounts: "0.00",
    current_total_discounts_set: {
      shop_money: { amount: "0.00", currency_code: "DKK" },
      presentment_money: { amount: "0.00", currency_code: "DKK" },
    },
    current_total_duties_set: null,
    current_total_price: "0.00",
    current_total_price_set: {
      shop_money: { amount: "0.00", currency_code: "DKK" },
      presentment_money: { amount: "0.00", currency_code: "DKK" },
    },
    current_total_tax: "0.00",
    current_total_tax_set: {
      shop_money: { amount: "0.00", currency_code: "DKK" },
      presentment_money: { amount: "0.00", currency_code: "DKK" },
    },
    customer_locale: "da-DK",
    discount_codes: [],
    email: "test@soueidan.com",
    estimated_taxes: false,
    financial_status: "paid",
    fulfillment_status: null,
    location_id: null,
    name: "#1014",
    note: null,
    note_attributes: [],
    number: 14,
    order_number: 1014,
    order_status_url:
      "https://bysistersdk.myshopify.com/68240605458/orders/3886ff2088637150765aa513c246dc16/authenticate?key=f16c8779934ac083f2016d65899baa0e",
    phone: null,
    po_number: null,
    presentment_currency: "DKK",
    processed_at: "2023-12-09T06:53:50+01:00",
    source_identifier: "95a2cd9dad9350a742e0ba7e30cf1b3c",
    subtotal_price: "0.00",
    subtotal_price_set: {
      shop_money: { amount: "0.00", currency_code: "DKK" },
      presentment_money: { amount: "0.00", currency_code: "DKK" },
    },
    tags: "",
    tax_exempt: false,
    tax_lines: [],
    taxes_included: true,
    test: false,
    total_discounts: "0.00",
    total_discounts_set: {
      shop_money: { amount: "0.00", currency_code: "DKK" },
      presentment_money: { amount: "0.00", currency_code: "DKK" },
    },
    total_line_items_price: "0.00",
    total_line_items_price_set: {
      shop_money: { amount: "0.00", currency_code: "DKK" },
      presentment_money: { amount: "0.00", currency_code: "DKK" },
    },
    total_outstanding: "0.00",
    total_price: "0.00",
    total_price_set: {
      shop_money: { amount: "0.00", currency_code: "DKK" },
      presentment_money: { amount: "0.00", currency_code: "DKK" },
    },
    total_shipping_price_set: {
      shop_money: { amount: "0.00", currency_code: "DKK" },
      presentment_money: { amount: "0.00", currency_code: "DKK" },
    },
    total_tax: "0.00",
    total_tax_set: {
      shop_money: { amount: "0.00", currency_code: "DKK" },
      presentment_money: { amount: "0.00", currency_code: "DKK" },
    },
    total_tip_received: "0.00",
    total_weight: 0,
    updated_at: "2023-12-09T07:24:58+01:00",
    user_id: null,
    billing_address: {
      first_name: "ja",
      address1: "Odensegade",
      phone: "25 12 33 12",
      city: "Østerbro",
      zip: "2100",
      province: null,
      country: "Denmark",
      last_name: "misa",
      address2: null,
      company: null,
      latitude: null,
      longitude: null,
      name: "ja misa",
      country_code: "DK",
      province_code: null,
    },
    customer: {
      id: faker.number.int({ min: 1, max: 1000000000 }),
      email: "test@soueidan.com",
      accepts_marketing: true,
      created_at: new Date("2023-05-23T22:53:49+02:00"),
      updated_at: new Date("2023-12-09T06:53:51+01:00"),
      first_name: "kunde",
      last_name: "soueidan",
      state: "invited",
      note: null,
      verified_email: true,
      multipass_identifier: null,
      tax_exempt: false,
      phone: null,
      email_marketing_consent: {
        state: "subscribed",
        opt_in_level: "single_opt_in",
        consent_updated_at: "2023-05-23T22:53:50+02:00",
      },
      sms_marketing_consent: null,
      tags: "",
      currency: "DKK",
      accepts_marketing_updated_at: "2023-05-23T22:53:50+02:00",
      marketing_opt_in_level: "single_opt_in",
      tax_exemptions: [],
      admin_graphql_api_id: "gid://shopify/Customer/7123671482695",
      default_address: {
        customer_id: faker.number.int({ min: 1, max: 1000000000 }),
        first_name: "ja",
        last_name: "misa",
        company: null,
        address1: "Odensegade",
        address2: null,
        city: "Østerbro",
        province: null,
        country: "Denmark",
        zip: "2100",
        phone: "25 12 33 12",
        name: "ja misa",
        province_code: null,
        country_code: "DK",
        country_name: "Denmark",
        default: true,
      },
    },
    discount_applications: [],
    fulfillments: [],
    line_items,
    payment_terms: null,
    refunds: [],
    shipping_address: {
      first_name: "ja",
      address1: "Odensegade",
      phone: "25 12 33 12",
      city: "Østerbro",
      zip: "2100",
      province: null,
      country: "Denmark",
      last_name: "misa",
      address2: null,
      company: null,
      latitude: 55.7001114,
      longitude: 12.5807326,
      name: "ja misa",
      country_code: "DK",
      province_code: null,
    },
    shipping_lines: [
      {
        id: 4957849485639,
        carrier_identifier: "0c9403206891a20ecd54cf28f40ddb5b",
        code: "backup_rate",
        discounted_price: "0.00",
        discounted_price_set: {
          shop_money: { amount: "0.00", currency_code: "DKK" },
          presentment_money: { amount: "0.00", currency_code: "DKK" },
        },
        phone: null,
        price: "0.00",
        price_set: {
          shop_money: { amount: "0.00", currency_code: "DKK" },
          presentment_money: { amount: "0.00", currency_code: "DKK" },
        },
        requested_fulfillment_service_id: null,
        source: "merchant_customized_by_order_value",
        title: "Levering",
      },
    ],
  };
};

const generateRandomDateRange = () => {
  // Get today's date and calculate last month and next month
  const today = new Date();
  const from = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    today.getDate()
  );
  const to = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate()
  );

  // Generate a random date between last month and next month
  const randomDate = faker.date.between({ from, to });

  // Add a random duration between 30 and 60 minutes to the random date
  const endDate = new Date(
    randomDate.getTime() + faker.number.int({ min: 30, max: 60 }) * 60000
  );

  return {
    from: randomDate,
    to: endDate,
  };
};
