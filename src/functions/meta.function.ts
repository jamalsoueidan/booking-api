import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
  app,
} from "@azure/functions";
import "module-alias/register";
import { Professions, Specialties } from "./user";

async function MetaProfessions(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(
    `Http function processed request for url "${request.url}" ${request.method}`
  );

  const professions = Object.values(Professions);

  const translate = {
    makeup_artist: "Makeup artist",
    hair_stylist: "Frisør",
    nail_technician: "Negle tekniker",
    lash_technician: "Vippe tekniker",
    brow_technician: "Bryn tekniker",
    massage_therapist: "Massage terapeut",
    esthetician: "Kosmetolog",
    barber: "barber",
    cosmetologist: "cosmetologist",
    spa_therapist: "spa_therapist",
    tattoo_artist: "tattoo_artist",
    piercing_technician: "piercing_technician",
    aromatherapist: "aromatherapist",
    skincare_specialist: "skincare_specialist",
    hair_colorist: "hair_colorist",
    bridal_stylist: "bridal_stylist",
  };

  const list = professions.map((profession) => ({
    label: translate[profession] || "",
    value: profession,
  }));

  return {
    jsonBody: {
      success: true,
      payload: list,
    },
  };
}

async function MetaSpecialties(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(
    `Http function processed request for url "${request.url}" ${request.method}`
  );

  const specialties = Object.values(Specialties);

  const translate = {
    bridal_makeup: "Bryllups Makeup",
    sfx_makeup: "SFX Makeup",
    editorial_makeup: "Redaktionel Makeup",
    celebrity_makeup: "Kendis Makeup",
    airbrush_makeup: "Airbrush Makeup",
    stage_makeup: "Scene Makeup",
    ethereal_makeup: "Etereal Makeup",
    vintage_styles: "Vintage Stilarter",
    hair_coloring: "Hår Farvning",
    hair_extensions: "Hår Extensions",
    keratin_treatments: "Keratin Behandlinger",
    balayage_specialist: "Balayage Specialist",
    nail_art: "Negl Kunst",
    gel_nails: "Gel Negle",
    acrylic_nails: "Akryl Negle",
    manicure_pedicure: "Manicure Pedicure",
    eyelash_extensions: "Vippe Extensions",
    eyebrow_shaping: "Bryn Formning",
    facial_treatments: "Ansigtsbehandlinger",
    body_treatments: "Kropsbehandlinger",
    waxing_hair_removal: "Voks Hårfjerning",
    massage: "Massage",
    skin_care: "Hudpleje",
    permanent_makeup: "Permanent Makeup",
    microblading: "Microblading",
    cosmetic_teeth_whitening: "Kosmetisk Tandblegning",
    tattoo_removal: "Tatoveringsfjernelse",
    scar_treatment: "Ar Behandling",
  };

  const list = specialties.map((specialty) => ({
    label: translate[specialty],
    value: specialty,
  }));

  return {
    jsonBody: {
      success: true,
      payload: list,
    },
  };
}

app.http("metaProfessions", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "meta/professions",
  handler: MetaProfessions,
});

app.http("metaSpecialties", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "meta/specialties",
  handler: MetaSpecialties,
});
