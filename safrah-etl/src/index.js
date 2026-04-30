require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const { z } = require("zod");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

if (!SUPABASE_URL) throw new Error("Missing SUPABASE_URL");
if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
if (!RAPIDAPI_KEY) throw new Error("Missing RAPIDAPI_KEY");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const RAPIDAPI_URL = "https://google-map-places-new-v2.p.rapidapi.com/v1/places:searchText";
const COUNTRY_DELAY_MS = 1000;

const delay = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const GooglePlaceSchema = z
  .object({
    id: z.string().optional().nullable().catch(null),
    displayName: z
      .object({
        text: z.string().optional().nullable().catch(null),
      })
      .optional()
      .nullable()
      .catch(null),
    editorialSummary: z
      .object({
        text: z.string().optional().nullable().catch("Top attraction"),
      })
      .optional()
      .nullable()
      .catch(null),
    regularOpeningHours: z
      .object({
        weekdayDescriptions: z.array(z.string()).optional().nullable().catch([]),
      })
      .optional()
      .nullable()
      .catch(null),
    priceLevel: z.string().optional().nullable().catch(null),
    photos: z
      .array(
        z.object({
          name: z.string().optional().nullable().catch(null),
        })
      )
      .optional()
      .nullable()
      .catch([]),
  })
  .passthrough();

const GooglePlacesResponseSchema = z.object({
  places: z.array(z.unknown()).optional().nullable().catch([]),
});

const mapPriceLevel = (priceLevel) => {
  switch (priceLevel) {
    case "PRICE_LEVEL_FREE":
      return 0;
    case "PRICE_LEVEL_INEXPENSIVE":
      return 1;
    case "PRICE_LEVEL_MODERATE":
      return 2;
    case "PRICE_LEVEL_EXPENSIVE":
      return 3;
    case "PRICE_LEVEL_VERY_EXPENSIVE":
      return 4;
    default:
      return 0;
  }
};

async function fetchResponseWithBackoff(url, options, retries = 3, backoff = 2000) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorDetails = await response.text();

      if (response.status === 429 || response.status >= 500) {
        throw new Error(`Retryable HTTP error: ${response.status}`);
      }

      throw new Error(`Fatal HTTP error: ${response.status} \nAPI says: ${errorDetails}`);
    }

    return response;
  } catch (error) {
    if (retries > 0 && error.message.includes("Retryable")) {
      console.warn(`⏳ Network issue. Retrying in ${backoff}ms...`);
      await delay(backoff);
      return fetchResponseWithBackoff(url, options, retries - 1, backoff * 2);
    }

    throw error;
  }
}

async function fetchWithBackoff(url, options, retries = 3, backoff = 2000) {
  const response = await fetchResponseWithBackoff(url, options, retries, backoff);
  return await response.json();
}

async function processAndUploadImage(photoName, placeId) {
  if (!photoName || !placeId) {
    return null;
  }

  const mediaUrl = `https://google-map-places-new-v2.p.rapidapi.com/v1/${photoName}/media?maxHeightPx=800&maxWidthPx=800`;

  try {
    const mediaResponse = await fetchResponseWithBackoff(mediaUrl, {
      method: "GET",
      headers: {
        "x-rapidapi-host": "google-map-places-new-v2.p.rapidapi.com",
        "x-rapidapi-key": RAPIDAPI_KEY,
      },
    });

    const arrayBuffer = await mediaResponse.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    const safePlaceId = String(placeId).replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${safePlaceId}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("attraction-images")
      .upload(filePath, imageBuffer, { contentType: "image/jpeg", upsert: true });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from("attraction-images").getPublicUrl(filePath);
    return data?.publicUrl ?? null;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`⚠️ Image upload failed for ${placeId}: ${message}`);
    return null;
  }
}

async function getAttractionsForCountry(countryName) {
  const payload = JSON.stringify({ textQuery: `Top tourist attractions in ${countryName}` });

  const json = await fetchWithBackoff(RAPIDAPI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-rapidapi-host": "google-map-places-new-v2.p.rapidapi.com",
      "x-rapidapi-key": RAPIDAPI_KEY,
      "X-Goog-FieldMask": "places.id,places.displayName,places.editorialSummary,places.photos,places.regularOpeningHours,places.priceLevel",
    },
    body: payload,
  });

  const parsed = GooglePlacesResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("Invalid RapidAPI Google Places response payload");
  }

  return parsed.data.places;
}

async function transformAttractions(country, places) {
  const rows = [];

  for (const place of places) {
    const parsed = GooglePlaceSchema.safeParse(place);
    if (!parsed.success) {
      continue;
    }

    const valid = parsed.data;
    const placeId = valid.id;

    if (!placeId) {
      continue;
    }

    const title = valid.displayName?.text || `Attraction in ${country.name}`;
    const description = valid.editorialSummary?.text || "Top attraction";
    const openingHours = valid.regularOpeningHours?.weekdayDescriptions?.join(" | ") || "Hours vary";
    const photoName = valid.photos?.[0]?.name;
    const uploadedImageUrl = photoName ? await processAndUploadImage(photoName, placeId) : null;

    rows.push({
      place_id: placeId,
      country_id: country.id,
      title,
      description,
      image_url: uploadedImageUrl,
      price: mapPriceLevel(valid.priceLevel),
      opening_hours: openingHours,
      map_link: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
    });
  }

  return rows;
}

async function runPipeline() {
  console.log("🚀 Starting ETL Pipeline (RapidAPI Google Places wrapper)...");

  try {
    const { data: countries, error: countryError } = await supabase
      .from("countries")
      .select("id, name")
      .eq("is_active", true);

    if (countryError) throw countryError;

    console.log(`📌 Found ${countries.length} active countries.`);

    for (const country of countries) {
      console.log(`\n🔍 Processing: ${country.name}`);

      try {
        const places = await getAttractionsForCountry(country.name);

        if (!places || places.length === 0) {
          console.log(`⚠️ No attractions found for ${country.name}.`);
          await delay(COUNTRY_DELAY_MS);
          continue;
        }

        const formattedAttractions = await transformAttractions(country, places);

        if (formattedAttractions.length === 0) {
          console.log(`⚠️ No valid attractions after validation for ${country.name}.`);
          await delay(COUNTRY_DELAY_MS);
          continue;
        }

        const { error: upsertError } = await supabase
          .from("attractions")
          .upsert(formattedAttractions, { onConflict: "place_id" });

        if (upsertError) throw upsertError;

        console.log(`✅ Upserted ${formattedAttractions.length} attractions for ${country.name}.`);
      } catch (error) {
        console.error(`❌ Failed processing ${country.name}:`, error.message);
      }

      await delay(COUNTRY_DELAY_MS);
    }

    console.log("\n🎉 ETL Pipeline Complete!");
    process.exit(0);
  } catch (globalError) {
    console.error("💥 Fatal Pipeline Error:", globalError.message);
    process.exit(1);
  }
}

runPipeline();
