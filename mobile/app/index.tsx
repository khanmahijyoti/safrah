import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import { useRouter } from "expo-router";
import LoadingSvg from "../components/LoadingSvg";

export default function SplashScreen() {
  const router = useRouter();
  const loadingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/select-passport");
    }, 1500);

    return () => {
      clearTimeout(timeout);
    };
  }, [router]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(loadingAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => {
      animation.stop();
      loadingAnim.setValue(0);
    };
  }, [loadingAnim]);

  const translateX = loadingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-36, 36],
  });

  return (
    <View className="flex-1 items-center justify-center bg-[#1E1F29] px-6">
      <LoadingSvg width={260} height={562} />
      <View className="mt-4 h-1.5 w-24 overflow-hidden rounded-full bg-[#2B2D3A]">
        <Animated.View
          className="h-full w-8 rounded-full bg-[#3AA3FF]"
          style={{ transform: [{ translateX }] }}
        />
      </View>
    </View>
  );
}
