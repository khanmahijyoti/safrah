import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import PassportTopRightIcon from "../components/PassportTopRightIcon";
import { useTravelStore } from "../store/useTravelStore";
import { getActiveCountries, type ActiveCountry } from "../utils/databaseApi";

export default function SelectCountryScreen() {
  const router = useRouter();
  const selectedPassport = useTravelStore((state) => state.selectedPassport);
  const setDestination = useTravelStore((state) => state.setDestination);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [countries, setCountries] = useState<ActiveCountry[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadCountries = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getActiveCountries();
        if (isMounted) {
          setCountries(data);
        }
      } catch (caughtError) {
        if (isMounted) {
          const message = caughtError instanceof Error ? caughtError.message : "Failed to load countries";
          setError(message);
          setCountries([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadCountries();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCountries = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    if (!normalizedSearch) {
      return countries;
    }

    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(normalizedSearch) ||
        country.code.toLowerCase().includes(normalizedSearch)
    );
  }, [countries, searchQuery]);

  const onViewCountry = (countryCode: string) => {
    setDestination(countryCode);
    router.push(`/country/${countryCode}`);
  };

  return (
    <View className="flex-1 bg-[#1E1F29] px-6 pt-16">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-white">Select Country</Text>
        <PassportTopRightIcon size={24} />
      </View>

      <View className="flex-1">
        <Text className="mb-4 text-base text-slate-200">Browsing for: {selectedPassport ?? "US"}</Text>

        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search country"
          placeholderTextColor="#94A3B8"
          className="rounded-md border border-[#3ED0C933] bg-[#2A2D34CC] px-3 py-2 text-white"
        />

        {isLoading ? <Text className="mt-4 text-slate-200">Loading countries...</Text> : null}
        {error ? <Text className="mt-4 text-red-300">{error}</Text> : null}
        {!isLoading && !error ? <Text className="mb-2 mt-4 text-slate-300">{countries.length} countries loaded</Text> : null}

        {!isLoading && !error ? (
          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.id}
            contentContainerClassName="gap-2 pb-8"
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onViewCountry(item.code)}
                className="rounded-md border border-[#3ED0C933] bg-[#2A2D34CC] px-4 py-3"
              >
                <Text className="font-semibold text-white">
                  {item.flag ?? "🌍"} {item.name}
                </Text>
              </Pressable>
            )}
            ListEmptyComponent={<Text className="text-slate-200">No countries match your search.</Text>}
          />
        ) : null}
      </View>
    </View>
  );
}
