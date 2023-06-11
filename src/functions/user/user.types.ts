import { z } from "zod";
import {
  BooleanOrStringType,
  GidFormat,
  NumberOrStringType,
} from "~/library/zod";

export enum Professions {
  MAKEUP_ARTIST = "makeup_artist",
  HAIR_STYLIST = "hair_stylist",
  NAIL = "nail_technician",
  LASH = "lash_technician",
  BROW = "brow_technician",
  MASSAGE = "massage_therapist",
  ESTHETICIAN = "esthetician",
}

export enum Specialties {
  BRIDAL_MAKEUP = "bridal_makeup",
  SFX_MAKEUP = "sfx_makeup",
  EDITORIAL_MAKEUP = "editorial_makeup",
  CELEBRITY_MAKEUP = "celebrity_makeup",
  AIRBRUSH_MAKEUP = "airbrush_makeup",
  STAGE_MAKEUP = "stage_makeup",
  ETHEREAL_MAKEUP = "ethereal_makeup",
  VINTAGE_STYLES = "vintage_styles",
  HAIR_COLORING = "hair_coloring",
  HAIR_EXTENSIONS = "hair_extensions",
  KERATIN_TREATMENTS = "keratin_treatments",
  BALAYAGE_SPECIALIST = "balayage_specialist",
  NAIL_ART = "nail_art",
  GEL_NAILS = "gel_nails",
  ACRYLIC_NAILS = "acrylic_nails",
  MANICURE_PEDICURE = "manicure_pedicure",
  EYELASH_EXTENSIONS = "eyelash_extensions",
  EYEBROW_SHAPING = "eyebrow_shaping",
  FACIAL_TREATMENTS = "facial_treatments",
  BODY_TREATMENTS = "body_treatments",
  WAXING_HAIR_REMOVAL = "waxing_hair_removal",
  MASSAGE = "massage",
  SKIN_CARE = "skin_care",
  PERMANENT_MAKEUP = "permanent_makeup",
  MICROBLADING = "microblading",
  COSMETIC_TEETH_WHITENING = "cosmetic_teeth_whitening",
  TATTOO_REMOVAL = "tattoo_removal",
  SCAR_TREATMENT = "scar_treatment",
}

export const UserZodSchema = z.object({
  _id: z.string(),
  customerId: GidFormat,
  isBusiness: BooleanOrStringType,
  yearsExperience: NumberOrStringType.optional(),
  professions: z.array(z.nativeEnum(Professions)).optional(),
  specialties: z.array(z.string()).optional(),
  username: z
    .string()
    .transform((input) => input.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase())
    .optional(),
  aboutMe: z.string().optional(),
  shortDescription: z.string().optional(),
  gender: z.string().optional(),
  social: z
    .object({
      youtube: z.string().optional(),
      twitter: z.string().optional(),
      instagram: z.string().optional(),
    })
    .optional(),
  images: z
    .object({
      profile: z
        .object({
          url: z.string().url({ message: "Invalid url" }).optional(),
          width: z.number().optional(),
          height: z.number().optional(),
        })
        .optional(),
    })
    .optional(),
  speaks: z.array(z.string()).optional(),
  fullname: z.string().optional(),
  active: z.boolean().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
});

export type User = z.infer<typeof UserZodSchema>;
