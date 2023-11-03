import axios from "axios";
import { BadError } from "~/library/handler";
import { Location } from "../location.types";

export type LocationServiceGetCoordinates = Pick<Location, "fullAddress">;

export type ForsyningResponse = Array<{
  id: string;
  adressebetegnelse: string;
  adgangsadresse: {
    adgangspunkt: {
      koordinater: Array<number>;
    };
  };
}>;

export const LocationServiceGetCoordinates = async (
  params: LocationServiceGetCoordinates
) => {
  const response = await axios.get<ForsyningResponse>(
    "https://api.dataforsyningen.dk/adresser",
    {
      params: {
        q: params.fullAddress,
        format: "json",
        token: process.env["DataforsyningenToken"] || "",
      },
    }
  );

  if (Array.isArray(response.data) && response.data.length > 0) {
    const firstAddress = response.data[0];
    if (
      firstAddress &&
      firstAddress.adgangsadresse &&
      firstAddress.adgangsadresse.adgangspunkt.koordinater
    ) {
      const [longitude, latitude] =
        firstAddress.adgangsadresse.adgangspunkt.koordinater;

      return {
        fullAddress: firstAddress.adressebetegnelse,
        latitude,
        longitude,
      };
    }
  }

  throw new BadError([
    {
      code: "custom",
      message: "FULL_ADDRESS_INVALID",
      path: ["fullAddress"],
    },
  ]);
};
