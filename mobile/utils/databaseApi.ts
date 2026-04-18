import { supabase } from "./supabase";

export type ActiveCountry = {
  id: string;
  name: string;
  code: string;
  flag: string | null;
};

export type VisaEnhancement = {
  documents: string[] | null;
  entry_requirements: string[] | null;
  rules: Record<string, unknown> | null;
  notes: string | null;
};

export type Essentials = {
  plug_types: string[] | null;
  apps: unknown;
  health: string[] | null;
  emergency_contacts: unknown;
};

export type Attraction = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: number | null;
  opening_hours: string | null;
  map_link: string | null;
};

export type CountryContent = {
  country: {
    id: string;
    name: string;
    code: string;
    flag: string | null;
    currency: string | null;
  };
  visaEnhancement: VisaEnhancement | null;
  essentials: Essentials | null;
  attractions: Attraction[];
};

export const getActiveCountries = async (): Promise<ActiveCountry[]> => {
  const { data, error } = await supabase
    .from("countries")
    .select("id, name, code, flag")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};

export const getCountryContent = async (countryCode: string): Promise<CountryContent> => {
  const normalizedCode = countryCode.toUpperCase();

  const { data: country, error: countryError } = await supabase
    .from("countries")
    .select("id, name, code, flag, currency")
    .eq("code", normalizedCode)
    .maybeSingle();

  if (countryError) {
    throw new Error(countryError.message);
  }

  if (!country) {
    throw new Error(`Country ${normalizedCode} not found`);
  }

  const [visaResult, essentialsResult, attractionsResult] = await Promise.all([
    supabase
      .from("visa_enhancements")
      .select("documents, entry_requirements, rules, notes")
      .eq("country_id", country.id)
      .maybeSingle(),
    supabase
      .from("essentials")
      .select("plug_types, apps, health, emergency_contacts")
      .eq("country_id", country.id)
      .maybeSingle(),
    supabase
      .from("attractions")
      .select("id, title, description, image_url, price, opening_hours, map_link")
      .eq("country_id", country.id)
      .order("title", { ascending: true }),
  ]);

  if (visaResult.error) {
    throw new Error(visaResult.error.message);
  }

  if (essentialsResult.error) {
    throw new Error(essentialsResult.error.message);
  }

  if (attractionsResult.error) {
    throw new Error(attractionsResult.error.message);
  }

  return {
    country,
    visaEnhancement: visaResult.data,
    essentials: essentialsResult.data,
    attractions: attractionsResult.data ?? [],
  };
};
