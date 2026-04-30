import { useEffect, useMemo, useState } from "react";
import { Image, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import PassportTopRightIcon from "../../components/PassportTopRightIcon";
import {
  getCountryContent,
  type CountryContent,
  type Essentials,
  type VisaEnhancement,
} from "../../utils/databaseApi";

type CountryParams = {
  id?: string;
};

type TabId = "visa" | "essentials" | "attractions" | "weather";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "visa", label: "Visa" },
  { id: "essentials", label: "Essentials" },
  { id: "attractions", label: "Attractions" },
  { id: "weather", label: "Weather" },
];

const WEATHER_NOTES = [
  "Spring: mild weather and outdoor-friendly",
  "Summer: hot and humid with possible rain",
  "Autumn: cool, pleasant temperatures",
  "Winter: colder conditions depending on region",
];

const toLines = (value: unknown): string[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === "string" ? item : JSON.stringify(item)));
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).map(([key, item]) => {
      const normalized =
        typeof item === "string"
          ? item
          : Array.isArray(item)
            ? item.join(", ")
            : item && typeof item === "object"
              ? JSON.stringify(item)
              : String(item);
      return `${key}: ${normalized}`;
    });
  }

  return [String(value)];
};

const readVisaRules = (visaEnhancement: VisaEnhancement | null): string[] => {
  if (!visaEnhancement?.rules) {
    return [];
  }
  return toLines(visaEnhancement.rules);
};

const readEssentialApps = (essentials: Essentials | null): string[] => {
  if (!essentials?.apps) {
    return [];
  }
  return toLines(essentials.apps);
};

const readEmergencyContacts = (essentials: Essentials | null): string[] => {
  if (!essentials?.emergency_contacts) {
    return [];
  }
  return toLines(essentials.emergency_contacts);
};

export default function CountryDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<CountryParams>();
  const countryCode = (params.id ?? "Unknown").toUpperCase();

  const [activeTab, setActiveTab] = useState<TabId>("visa");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<CountryContent | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadContent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getCountryContent(countryCode);
        if (isMounted) {
          setContent(response);
        }
      } catch (caughtError) {
        if (isMounted) {
          const message = caughtError instanceof Error ? caughtError.message : "Failed to load country content";
          setError(message);
          setContent(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadContent();

    return () => {
      isMounted = false;
    };
  }, [countryCode]);

  const countryFlag = content?.country.flag ?? "🌍";
  const countryName = content?.country.name ?? countryCode;
  const visaDocuments = content?.visaEnhancement?.documents ?? [];
  const visaRequirements = content?.visaEnhancement?.entry_requirements ?? [];
  const visaRules = readVisaRules(content?.visaEnhancement ?? null);
  const visaNotes = content?.visaEnhancement?.notes;
  const plugTypes = content?.essentials?.plug_types ?? [];
  const essentialHealth = content?.essentials?.health ?? [];
  const essentialApps = readEssentialApps(content?.essentials ?? null);
  const emergencyContacts = readEmergencyContacts(content?.essentials ?? null);

  const ctaLink = useMemo(() => {
    const firstRuleLink = visaRules.find((line) => line.toLowerCase().includes("http"));
    if (firstRuleLink) {
      const split = firstRuleLink.split("http");
      return split.length > 1 ? `http${split[1]}` : null;
    }
    return null;
  }, [visaRules]);

  const openExternalLink = async (link: string | null) => {
    if (!link) {
      return;
    }

    try {
      await Linking.openURL(link);
    } catch {
      setError("Unable to open external link.");
    }
  };

  return (
    <View className="flex-1 bg-[#1E1F29] px-5 pt-14">
      <View className="mb-4 flex-row items-center justify-between">
        <Pressable onPress={() => router.back()} className="rounded-md bg-[#2A2D34] px-3 py-2">
          <Text className="text-white">Back</Text>
        </Pressable>
        <View className="flex-row items-center gap-2">
          <Text className="text-xl">{countryFlag}</Text>
          <Text className="text-xl font-semibold text-white">{countryName}</Text>
        </View>
        <PassportTopRightIcon size={24} />
      </View>

      <View className="mb-4 rounded-xl border border-[#3ED0C933] bg-[#2A2D34CC] p-4">
        <Text className="text-base font-semibold text-white">{countryCode}</Text>
        <Text className="mt-1 text-slate-200">Currency: {content?.country.currency ?? "N/A"}</Text>
        {isLoading ? <Text className="mt-2 text-slate-300">Loading country content...</Text> : null}
        {error ? <Text className="mt-2 text-red-300">{error}</Text> : null}
      </View>

      <View className="mb-4 flex-row gap-2">
        {TABS.map((tab) => (
          <Pressable
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            className={`rounded-full px-3 py-2 ${activeTab === tab.id ? "bg-[#3AA3FF]" : "bg-[#2A2D34]"}`}
          >
            <Text className="text-white">{tab.label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {activeTab === "visa" ? (
          <View className="gap-4">
            <SectionCard title="Required Documents" items={visaDocuments} emptyLabel="No documents available" />
            <SectionCard
              title="Entry Requirements"
              items={visaRequirements}
              emptyLabel="No entry requirements available"
            />
            <SectionCard title="Rules" items={visaRules} emptyLabel="No visa rules available" />
            {visaNotes ? <SectionCard title="Important Notes" items={[visaNotes]} emptyLabel="" /> : null}
            <Pressable
              onPress={() => openExternalLink(ctaLink)}
              disabled={!ctaLink}
              className={`rounded-md px-4 py-3 ${ctaLink ? "bg-blue-600" : "bg-slate-500"}`}
            >
              <Text className="text-center font-semibold text-white">Get Your Visa</Text>
            </Pressable>
          </View>
        ) : null}

        {activeTab === "essentials" ? (
          <View className="gap-4">
            <SectionCard title="Plug Types" items={plugTypes} emptyLabel="No plug information available" />
            <SectionCard title="Apps" items={essentialApps} emptyLabel="No app information available" />
            <SectionCard title="Health" items={essentialHealth} emptyLabel="No health guidance available" />
            <SectionCard
              title="Emergency Contacts"
              items={emergencyContacts}
              emptyLabel="No emergency contacts available"
            />
          </View>
        ) : null}

        {activeTab === "attractions" ? (
          <View className="gap-4">
            {content?.attractions.length ? (
              content.attractions.map((attraction) => (
                <View key={attraction.id} className="rounded-xl border border-[#3ED0C933] bg-[#2A2D34CC] p-4">
                  {attraction.image_url ? (
                    <Image
                      source={{ uri: attraction.image_url }}
                      className="mb-3 h-56 w-full rounded-lg"
                      resizeMode="cover"
                    />
                  ) : null}
                  <Text className="text-base font-semibold text-white">{attraction.title}</Text>
                  {attraction.description ? <Text className="mt-1 text-slate-200">{attraction.description}</Text> : null}
                  {attraction.price !== null ? (
                    <Text className="mt-1 text-slate-300">Price: {attraction.price}</Text>
                  ) : null}
                  {attraction.opening_hours ? (
                    <Text className="mt-1 text-slate-300">Hours: {attraction.opening_hours}</Text>
                  ) : null}
                  {attraction.map_link ? (
                    <Pressable
                      onPress={() => openExternalLink(attraction.map_link)}
                      className="mt-3 rounded-md bg-[#213139] px-3 py-2"
                    >
                      <Text className="text-center text-[#4FD1C5]">Open Map</Text>
                    </Pressable>
                  ) : null}
                </View>
              ))
            ) : (
              <Text className="text-slate-300">No attractions available.</Text>
            )}
          </View>
        ) : null}

        {activeTab === "weather" ? (
          <SectionCard title="Seasonal Overview" items={WEATHER_NOTES} emptyLabel="No weather notes available" />
        ) : null}
      </ScrollView>
    </View>
  );
}

function SectionCard({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: string[];
  emptyLabel: string;
}) {
  return (
    <View className="rounded-xl border border-[#3ED0C933] bg-[#2A2D34CC] p-4">
      <Text className="mb-2 text-base font-semibold text-white">{title}</Text>
      {items.length ? (
        items.map((item) => (
          <Text key={`${title}-${item}`} className="mb-1 text-slate-200">
            - {item}
          </Text>
        ))
      ) : (
        <Text className="text-slate-300">{emptyLabel}</Text>
      )}
    </View>
  );
}
