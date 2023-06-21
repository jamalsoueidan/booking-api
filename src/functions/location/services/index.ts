import axios from "axios";
import { BadError, NotFoundError } from "~/library/handler";
import { LocationModel } from "../location.model";
import { Location } from "../location.types";

export const LocationServiceCreate = (body: Omit<Location, "_id">) => {
  const location = new LocationModel(body);
  return location.save();
};

type LocationUpdateProps = {
  locationId: Location["_id"];
};

export const LocationServiceUpdate = async (
  filter: LocationUpdateProps,
  body: Omit<Location, "_id">
) => {
  return LocationModel.findOneAndUpdate(filter, body).orFail(
    new NotFoundError([
      {
        code: "custom",
        message: "LOCATION_NOT_FOUND",
        path: ["location"],
      },
    ])
  );
};

type LocationServiceGetCoordinates = Pick<Location, "fullAddress">;

type GoogleGeoLocationResponse = {
  results: Array<{
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: Array<string>;
    }>;
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
      location_type: string;
      viewport: {
        northeast: {
          lat: number;
          lng: number;
        };
        southwest: {
          lat: number;
          lng: number;
        };
      };
    };
    place_id: string;
    types: Array<string>;
  }>;
  status: string;
};

export const LocationServiceGetCoordinates = async (
  params: LocationServiceGetCoordinates
) => {
  const url = "https://maps.googleapis.com/maps/api/geocode/json";
  const response = await axios.get<GoogleGeoLocationResponse>(url, {
    params: {
      address: params.fullAddress,
      key: process.env["GoogleMapApi"] || "",
    },
  });

  if (
    response.data.status === "OK" &&
    response.data.results &&
    response.data.results.length > 0
  ) {
    const location = response.data.results[0].geometry.location;
    const formatted_address = response.data.results[0].formatted_address;
    return { location, formatted_address };
  }

  throw new BadError([
    {
      code: "custom",
      message: "FULL_ADDRESS_INVALID",
      path: ["fullAddress"],
    },
  ]);
};

type LocationServiceGetTravelTimeProps = {
  origin: string;
  destination: string;
};

type GoogleDirectionResponse = {
  geocoded_waypoints: Array<{
    geocoder_status: string;
    place_id: string;
    types: Array<string>;
    partial_match?: boolean;
  }>;
  routes: Array<{
    bounds: {
      northeast: {
        lat: number;
        lng: number;
      };
      southwest: {
        lat: number;
        lng: number;
      };
    };
    copyrights: string;
    legs: Array<{
      distance: {
        text: string;
        value: number;
      };
      duration: {
        text: string;
        value: number;
      };
      end_address: string;
      end_location: {
        lat: number;
        lng: number;
      };
      start_address: string;
      start_location: {
        lat: number;
        lng: number;
      };
      steps: Array<{
        distance: {
          text: string;
          value: number;
        };
        duration: {
          text: string;
          value: number;
        };
        end_location: {
          lat: number;
          lng: number;
        };
        html_instructions: string;
        polyline: {
          points: string;
        };
        start_location: {
          lat: number;
          lng: number;
        };
        travel_mode: string;
        maneuver?: string;
      }>;
      traffic_speed_entry: Array<any>;
      via_waypoint: Array<any>;
    }>;
    overview_polyline: {
      points: string;
    };
    summary: string;
    warnings: Array<any>;
    waypoint_order: Array<any>;
  }>;
  status: string;
};

export const LocationServiceGetTravelTime = async (
  params: LocationServiceGetTravelTimeProps
) => {
  const response = await axios.get<GoogleDirectionResponse>(
    "https://maps.googleapis.com/maps/api/directions/json",
    {
      params: {
        ...params,
        key: process.env["GoogleMapApi"] || "",
      },
    }
  );

  if (response.data.routes && response.data.routes.length > 0) {
    const route = response.data.routes[0];
    if (route.legs && route.legs.length > 0) {
      const leg = route.legs[0];
      const duration = leg.duration;
      return duration;
    }
  }

  throw new BadError([
    {
      code: "custom",
      message: "FULL_ADDRESS_INVALID",
      path: ["origin", "destination"],
    },
  ]);
};

type DataVaskAdresserResponse = {
  kategori: string;
  resultater: Array<{
    adresse: {
      id: string;
      vejnavn: string;
      adresseringsvejnavn: string;
      husnr: string;
      supplerendebynavn: any;
      postnr: string;
      postnrnavn: string;
      status: number;
      virkningstart: string;
      virkningslut: any;
      adgangsadresseid: string;
      etage: any;
      dør: any;
      href: string;
    };
    aktueladresse: {
      id: string;
      vejnavn: string;
      adresseringsvejnavn: string;
      husnr: string;
      supplerendebynavn: any;
      postnr: string;
      postnrnavn: string;
      status: number;
      virkningstart: string;
      virkningslut: any;
      adgangsadresseid: string;
      etage: any;
      dør: any;
      href: string;
    };
    vaskeresultat: {
      variant: {
        vejnavn: string;
        husnr: string;
        etage: any;
        dør: any;
        supplerendebynavn: any;
        postnr: string;
        postnrnavn: string;
      };
      afstand: number;
      forskelle: {
        vejnavn: number;
        husnr: number;
        postnr: number;
        postnrnavn: number;
      };
      parsetadresse: {
        vejnavn: string;
        husnr: string;
        postnr: string;
        postnrnavn: string;
      };
      ukendtetokens: Array<any>;
      anvendtstormodtagerpostnummer: any;
    };
  }>;
};

type LocationServiceValidateAddressProps = Pick<Location, "fullAddress">;

export const LocationServiceValidateAddress = async (
  props: LocationServiceValidateAddressProps
) => {
  const response = await axios.get<DataVaskAdresserResponse>(
    "https://api.dataforsyningen.dk/datavask/adresser?",
    {
      params: {
        betegnelse: props.fullAddress,
        token: process.env["DataforsyningenToken"] || "",
      },
    }
  );

  if (response.data.resultater.length === 1) {
    return { validate: true };
  }

  throw new BadError([
    {
      code: "custom",
      message: "LOCATION_NOT_VALIDATED",
      path: ["locationId"],
    },
  ]);
};
