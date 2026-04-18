require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");
const { z } = require("zod");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FOURSQUARE_API_KEY = process.env.FOURSQUARE_API_KEY;

if (!SUPABASE_URL) {
  throw new Error("Missing SUPABASE_URL");
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
}

if (!FOURSQUARE_API_KEY) {
  throw new Error("Missing FOURSQUARE_API_KEY");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const FOURSQUARE_SEARCH_URL = "https://api.foursquare.com/v3/places/search";
const COUNTRY_DELAY_MS = 1000;
const BACKOFF_DELAYS_MS = [2000, 4000, 8000];
const RESULTS_LIMIT = 30;

const photoSchema = z.object({
  prefix: z.string().default(""),
  suffix: z.string().default(""),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

const placeSchema = z.object({
  fsq_id: z.string().min(1),
  name: z.string().min(1).catch("Untitled attraction"),
  description: z.string().nullish(),
  photos: z.array(photoSchema).nullish().default([]),
  hours: z
    .object({
      display: z.string().nullish(),
    })
    .nullish(),
  rating: z.number().nullish(),
  price: z.number().int().nonnegative().nullish(),
});

const placesResponseSchema = z.object({
  results: z.array(z.unknown()).default([]),
});

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const shouldRetryStatus = (status) => status === 429 || status >= 500;

const fetchWithBackoff = async (url, options = {}) => {
  let lastError;

  for (let attempt = 0; attempt <= BACKOFF_DELAYS_MS.length; attempt += 1) {
    try {
      const response = await fetch(url, options);

      if (response.ok) {
        return response;
      }

      if (!shouldRetryStatus(response.status) || attempt === BACKOFF_DELAYS_MS.length) {
        const responseBody = await response.text();
        throw new Error(`Foursquare request failed (${response.status}): ${responseBody}`);
      }

      const delay = BACKOFF_DELAYS_MS[attempt];
      console.warn(
        `[retry] Foursquare status ${response.status}. Retrying in ${delay}ms (attempt ${attempt + 1}/${BACKOFF_DELAYS_MS.length}).`
      );
      await sleep(delay);
    } catch (error) {
      lastError = error;
      if (attempt === BACKOFF_DELAYS_MS.length) {
        throw error;
      }

      const delay = BACKOFF_DELAYS_MS[attempt];
      console.warn(`[retry] Network error. Retrying in ${delay}ms (attempt ${attempt + 1}/${BACKOFF_DELAYS_MS.length}).`);
      await sleep(delay);
    }
  }

  throw lastError ?? new Error("Foursquare request failed unexpectedly.");
};

const buildPhotoUrl = (photos) => {
  if (!Array.isArray(photos) || photos.length === 0) {
    return null;
  }

  const first = photos[0];
  const sizePart = first.width && first.height ? `${first.width}x${first.height}` : "original";
  return `${first.prefix}${sizePart}${first.suffix}`;
};

const getOpeningHours = (hours) => {
  if (!hours || typeof hours !== "object") {
    return null;
  }

  const display = hours.display;
  return typeof display === "string" && display.trim().length > 0 ? display : null;
};

const transformPlace = (country, place) => {
  const safe = placeSchema.safeParse(place);

  if (!safe.success) {
    return null;
  }

  const value = safe.data;
  const title = value.name?.trim() || "Untitled attraction";
  const description = value.description?.trim() || `Tourist attraction in ${country.name}`;
  const imageUrl = buildPhotoUrl(value.photos ?? []);
  const openingHours = getOpeningHours(value.hours);

  return {
    country_id: country.id,
    fsq_id: value.fsq_id,
    title,
    description,
    image_url: imageUrl,
    price: typeof value.price === "number" ? value.price : null,
    opening_hours: openingHours,
    map_link: `https://foursquare.com/v/${value.fsq_id}`,
  };
};

const fetchTouristAttractions = async (country) => {
  const params = new URLSearchParams({
    query: "tourist attraction",
    near: country.name,
    limit: String(RESULTS_LIMIT),
    fields: "fsq_id,name,description,photos,hours,rating,price",
  });

  const response = await fetchWithBackoff(`${FOURSQUARE_SEARCH_URL}?${params.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: FOURSQUARE_API_KEY,
    },
  });

  const rawJson = await response.json();
  const parsed = placesResponseSchema.safeParse(rawJson);

  if (!parsed.success) {
    throw new Error(`Unexpected Foursquare payload for ${country.code}`);
  }

  return parsed.data.results;
};

const getActiveCountries = async () => {
  const { data, error } = await supabase
    .from("countries")
    .select("id, name, code")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch countries: ${error.message}`);
  }

  return data ?? [];
};

const upsertAttractions = async (rows) => {
  if (rows.length === 0) {
    return;
  }

  const { error } = await supabase
    .from("attractions")
    .upsert(rows, { onConflict: "fsq_id" });

  if (error) {
    throw new Error(`Upsert failed: ${error.message}`);
  }
};

const run = async () => {
  const countries = await getActiveCountries();

  if (countries.length === 0) {
    console.log("No active countries found. Nothing to process.");
    return;
  }

  console.log(`Starting ETL for ${countries.length} countries.`);

  for (const [index, country] of countries.entries()) {
    console.log(`\n[${index + 1}/${countries.length}] Processing ${country.name} (${country.code})`);

    try {
      const rawPlaces = await fetchTouristAttractions(country);
      const transformed = [];
      let skipped = 0;

      for (const place of rawPlaces) {
        const mapped = transformPlace(country, place);
        if (!mapped) {
          skipped += 1;
          continue;
        }
        transformed.push(mapped);
      }

      await upsertAttractions(transformed);
      console.log(`Upserted ${transformed.length} attractions. Skipped ${skipped} invalid records.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Failed processing ${country.code}: ${message}`);
    }

    if (index < countries.length - 1) {
      await sleep(COUNTRY_DELAY_MS);
    }
  }

  console.log("\nETL completed.");
};

run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`ETL failed: ${message}`);
  process.exit(1);
});
