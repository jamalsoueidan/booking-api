import "module-alias/register";
import { CustomerProductsControllerList } from "./customer/controllers/products/list";

import { app } from "@azure/functions";
import {
  CustomerBookingControllerGet,
  CustomerBookingControllerList,
  CustomerControllerGet,
  CustomerControllerIsBusiness,
  CustomerControllerUpdate,
  CustomerControllerUpsert,
  CustomerLocationControllerAdd,
  CustomerLocationControllerCreateDestination,
  CustomerLocationControllerCreateOrigin,
  CustomerLocationControllerGetAll,
  CustomerLocationControllerGetOne,
  CustomerLocationControllerRemove,
  CustomerLocationControllerSetDefault,
  CustomerLocationControllerUpdateDestination,
  CustomerLocationControllerUpdateOrigin,
  CustomerProductControllerAvailability,
  CustomerProductControllerDestroy,
  CustomerProductControllerGet,
  CustomerProductControllerUpsert,
  CustomerProductsControllerListIds,
} from "./customer";

/* Customer */

app.http("customerUpsert", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "customer/{customerId?}",
  handler: CustomerControllerUpsert,
});

app.http("customerUpdate", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/update",
  handler: CustomerControllerUpdate,
});

app.http("customerIsBusiness", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/isBusiness",
  handler: CustomerControllerIsBusiness,
});

app.http("customerGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}",
  handler: CustomerControllerGet,
});

/* **************** */
/* Customer/Product */
/* **************** */

app.http("customerProductsListIds", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/products/ids",
  handler: CustomerProductsControllerListIds,
});

app.http("customerProductsList", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/products",
  handler: CustomerProductsControllerList,
});

app.http("customerProductAvailability", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/product/availability",
  handler: CustomerProductControllerAvailability,
});

app.http("customerProductUpsert", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/product/{productId?}",
  handler: CustomerProductControllerUpsert,
});

app.http("customerProductGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/product/{productId?}",
  handler: CustomerProductControllerGet,
});

app.http("customerProductDestroy", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/product/{productId?}",
  handler: CustomerProductControllerDestroy,
});

/* ******* */
/* Booking */
/* ******* */

app.http("customerBookingGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/booking/{orderId?}",
  handler: CustomerBookingControllerGet,
});

app.http("customerBookingList", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/bookings",
  handler: CustomerBookingControllerList,
});

/* ******* */
/* Location */
/* ******* */

app.http("customerLocationList", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId}/locations",
  handler: CustomerLocationControllerGetAll,
});

app.http("customerLocationGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId}/location/{locationId}",
  handler: CustomerLocationControllerGetOne,
});

app.http("customerLocationCreateDestination", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "customer/{customerId}/locations/destination",
  handler: CustomerLocationControllerCreateDestination,
});

app.http("customerLocationUpdateDestination", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "customer/{customerId}/location/{locationId?}/destination",
  handler: CustomerLocationControllerUpdateDestination,
});

app.http("customerLocationCreateOrigin", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "customer/{customerId}/locations/origin",
  handler: CustomerLocationControllerCreateOrigin,
});

app.http("customerLocationUpdateOrigin", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "customer/{customerId}/location/{locationId?}/origin",
  handler: CustomerLocationControllerUpdateOrigin,
});

app.http("customerLocationAdd", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "customer/{customerId}/location/{locationId}",
  handler: CustomerLocationControllerAdd,
});

app.http("customerLocationRemove", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "customer/{customerId}/location/{locationId}",
  handler: CustomerLocationControllerRemove,
});

app.http("customerLocationSetDefault", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "customer/{customerId}/location/{locationId}/setDefault",
  handler: CustomerLocationControllerSetDefault,
});
