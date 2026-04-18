import { mmkv } from "./storage";

const RAPID_API_BASE_URL = "https://visa-requirement.p.rapidapi.com";
const RAPID_API_HOST = "visa-requirement.p.rapidapi.com";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const RATE_LIMIT_BUFFER_MS = 25;
const MAX_RATE_LIMIT_RETRIES = 2;
const RATE_LIMIT_RETRY_DELAY_MS = 1000;

let rateLimitQueue: Promise<void> = Promise.resolve();
const requestTimestamps: number[] = [];

type CacheEntry<T> = {
  expiresAt: number;
  data: T;
};

export type VisaMapResponse = {
  data?: {
    colors?: {
      green?: string;
      blue?: string;
      yellow?: string;
      red?: string;
    };
  };
};

export type VisaCheckResponse = {
  data?: {
    mandatory_registration?: {
      name?: string;
      link?: string;
    };
    visa_rules?: {
      primary_rule?: {
        name?: string;
        duration?: string;
      };
      secondary_rule?: {
        link?: string;
      };
    };
  };
};

const getRapidApiKey = (): string => {
  const key = process.env.EXPO_PUBLIC_RAPIDAPI_KEY;

  if (!key) {
    throw new Error("Missing EXPO_PUBLIC_RAPIDAPI_KEY");
  }

  return key;
};

export const createRapidApiHeaders = (): Record<string, string> => ({
  "X-RapidAPI-Key": getRapidApiKey(),
  "X-RapidAPI-Host": RAPID_API_HOST,
  "Content-Type": "application/json",
});

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const pruneOldTimestamps = (): void => {
  const now = Date.now();

  while (requestTimestamps.length > 0 && now - requestTimestamps[0] >= RATE_LIMIT_WINDOW_MS) {
    requestTimestamps.shift();
  }
};

const acquireRateLimitSlot = async (): Promise<void> => {
  while (true) {
    pruneOldTimestamps();

    if (requestTimestamps.length < RATE_LIMIT_MAX_REQUESTS) {
      requestTimestamps.push(Date.now());
      return;
    }

    const oldest = requestTimestamps[0];
    const waitTime = Math.max(0, RATE_LIMIT_WINDOW_MS - (Date.now() - oldest) + RATE_LIMIT_BUFFER_MS);
    await delay(waitTime);
  }
};

const runWithRateLimit = async <T>(task: () => Promise<T>): Promise<T> => {
  const previous = rateLimitQueue;
  let releaseQueue: () => void = () => {};

  rateLimitQueue = new Promise<void>((resolve) => {
    releaseQueue = resolve;
  });

  await previous;

  try {
    await acquireRateLimitSlot();
    return await task();
  } finally {
    releaseQueue();
  }
};

const getRetryDelay = (response: Response): number => {
  const retryAfter = response.headers.get("Retry-After");

  if (!retryAfter) {
    return RATE_LIMIT_RETRY_DELAY_MS;
  }

  const retryAfterSeconds = Number(retryAfter);

  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return retryAfterSeconds * 1000;
  }

  return RATE_LIMIT_RETRY_DELAY_MS;
};

const readCache = <T>(cacheKey: string): T | null => {
  const raw = mmkv.getString(cacheKey);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as CacheEntry<T>;

    if (Date.now() > parsed.expiresAt) {
      mmkv.remove(cacheKey);
      return null;
    }

    return parsed.data;
  } catch {
    mmkv.remove(cacheKey);
    return null;
  }
};

const writeCache = <T>(cacheKey: string, data: T): void => {
  const payload: CacheEntry<T> = {
    expiresAt: Date.now() + CACHE_TTL_MS,
    data,
  };

  mmkv.set(cacheKey, JSON.stringify(payload));
};

const postTravelBuddy = async <T>(path: string, body: Record<string, string>): Promise<T> => {
  let lastStatus: number | null = null;

  for (let attempt = 0; attempt <= MAX_RATE_LIMIT_RETRIES; attempt += 1) {
    const response = await runWithRateLimit(() =>
      fetch(`${RAPID_API_BASE_URL}${path}`, {
        method: "POST",
        headers: createRapidApiHeaders(),
        body: JSON.stringify(body),
      })
    );

    if (response.ok) {
      return (await response.json()) as T;
    }

    lastStatus = response.status;

    if (response.status !== 429 || attempt === MAX_RATE_LIMIT_RETRIES) {
      throw new Error(`Travel Buddy API failed (${response.status})`);
    }

    await delay(getRetryDelay(response));
  }

  throw new Error(`Travel Buddy API failed (${lastStatus ?? "unknown"})`);
};

export const getVisaMap = async (passportCode: string): Promise<VisaMapResponse> => {
  const normalizedPassport = passportCode.toUpperCase();
  const cacheKey = `travel_buddy:map:${normalizedPassport}`;
  const cached = readCache<VisaMapResponse>(cacheKey);

  if (cached) {
    return cached;
  }

  const fresh = await postTravelBuddy<VisaMapResponse>("/v2/visa/map", {
    passport: normalizedPassport,
  });

  writeCache(cacheKey, fresh);
  return fresh;
};

export const getVisaCheck = async (
  passportCode: string,
  destinationCode: string
): Promise<VisaCheckResponse> => {
  const normalizedPassport = passportCode.toUpperCase();
  const normalizedDestination = destinationCode.toUpperCase();
  const cacheKey = `travel_buddy:check:${normalizedPassport}:${normalizedDestination}`;
  const cached = readCache<VisaCheckResponse>(cacheKey);

  if (cached) {
    return cached;
  }

  const fresh = await postTravelBuddy<VisaCheckResponse>("/v2/visa/check", {
    passport: normalizedPassport,
    destination: normalizedDestination,
  });

  writeCache(cacheKey, fresh);
  return fresh;
};
