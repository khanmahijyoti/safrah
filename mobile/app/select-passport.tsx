import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { COUNTRIES, type Country } from "../constants/countries";
import PassportTopRightIcon from "../components/PassportTopRightIcon";
import { useTravelStore } from "../store/useTravelStore";

export default function SelectPassportScreen() {
  const router = useRouter();
  const setPassport = useTravelStore((state) => state.setPassport);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredCountries = useMemo(
    () =>
      COUNTRIES.filter((country) =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  const onSelectPassport = (country: Country) => {
    setPassport(country.code);
    router.push("/select-country");
  };

  return (
    <View className="flex-1 bg-[#1E1F29] px-5 pt-16">
      <View className="mb-5 flex-row items-center justify-between">
        <Text className="text-2xl font-semibold text-white">Select Your Passport</Text>
        <PassportTopRightIcon size={24} />
      </View>

      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search passport country"
        placeholderTextColor="#9CA3AF"
        className="mb-4 rounded-xl bg-[#2B2D3A] px-4 py-3 text-base text-white"
      />

      <FlatList
        data={filteredCountries}
        keyExtractor={(item) => item.code}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-8"
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onSelectPassport(item)}
            className="mb-2 flex-row items-center rounded-xl bg-[#242634] px-4 py-3"
          >
            <Text className="mr-3 text-2xl">{item.flag}</Text>
            <Text className="text-base font-medium text-white">{item.name}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text className="pt-4 text-slate-300">No matching countries found.</Text>}
      />
    </View>
  );
}
