import { BookingModel } from "./booking.model";
import { Booking } from "./booking.types";

export type BookingServiceUpsertBody = Booking;

export const BookingServiceUpsert = async (
  booking: BookingServiceUpsertBody
) => {
  const exist = await BookingModel.findOne({
    orderId: booking.orderId,
  }).lean();

  if (!exist) {
    const newBooking = new BookingModel(booking);
    return newBooking.save();
  }

  await BookingModel.updateOne(
    { orderId: booking.orderId },
    {
      $set: {
        buyer: booking.buyer,
        cancelledAt: booking.cancelledAt,
        cancelReason: booking.cancelReason,
      },
    }
  );

  // Update each line item
  for (const lineItem of booking.lineItems) {
    await BookingModel.updateOne(
      {
        orderId: booking.orderId,
        "lineItems.lineItemId": lineItem.lineItemId,
      },
      { $set: { "lineItems.$.status": lineItem.status } }
    );
  }

  return BookingModel.findOne({
    orderId: booking.orderId,
  });
};
