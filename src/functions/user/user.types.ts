import { z } from "zod";
import { GidFormat, NumberOrString } from "~/library/zod";

export enum Professions {
  MAKEUP_ARTIST = "makeup_artist",
  HAIR_STYLIST = "hair_stylist",
  NAIL_TECHNICIAN = "nail_technician",
  LASH_TECHNICIAN = "lash_technician",
  BROW_TECHNICIAN = "brow_technician",
  MASSAGE_THERAPIST = "massage_therapist",
  ESTHETICIAN = "esthetician",
  BARBER = "barber",
  COSMETOLOGIST = "cosmetologist",
  SPA_THERAPIST = "spa_therapist",
  TATTOO_ARTIST = "tattoo_artist",
  PIERCING_TECHNICIAN = "piercing_technician",
  AROMATHERAPIST = "aromatherapist",
  SKINCARE_SPECIALIST = "skincare_specialist",
  HAIR_COLORIST = "hair_colorist",
  BRIDAL_STYLIST = "bridal_stylist",
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
  userMetaobjectId: z.string().optional(),
  collectionMetaobjectId: z.string().optional(),
  articleId: z.number().optional(),
  isBusiness: z.boolean(),
  yearsExperience: NumberOrString.optional(),
  professions: z
    .array(z.string())
    .or(z.string())
    .transform((value) => (Array.isArray(value) ? value : [value]))
    .transform((array) => array.filter((value) => value.trim() !== ""))
    .transform((array) => [...new Set(array)])
    .optional(),
  specialties: z
    .array(z.string())
    .or(z.string())
    .transform((value) => (Array.isArray(value) ? value : [value]))
    .transform((array) => array.filter((value) => value.trim() !== ""))
    .transform((array) => [...new Set(array)])
    .optional(),
  username: z
    .string()
    .transform((input) => input.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase()),
  aboutMe: z.string().optional(),
  aboutMeHtml: z.string().optional(),
  shortDescription: z.string().optional(),
  gender: z.string().optional(),
  social: z
    .object({
      youtube: z.string().optional(),
      x: z.string().optional(),
      instagram: z.string().optional(),
      facebook: z.string().optional(),
    })
    .optional(),
  images: z
    .object({
      profile: z
        .object({
          metaobjectId: z.string().optional(),
          url: z.string().url({ message: "Invalid url" }).optional(),
          width: z.number().optional(),
          height: z.number().optional(),
        })
        .optional(),
    })
    .optional(),
  speaks: z.array(z.string()).optional(),
  fullname: z.string(),
  active: z.boolean(),
  email: z.string(),
  phone: z.string().optional(),
  createdAt: z.date().optional(),
  theme: z
    .object({
      color: z.string(),
    })
    .optional(),
});

export type User = z.infer<typeof UserZodSchema>;

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
