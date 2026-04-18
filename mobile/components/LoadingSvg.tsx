import { Image } from "react-native";
import { SvgUri } from "react-native-svg";
import loadingAsset from "../assets/loading.svg";

type LoadingSvgProps = {
  width?: number;
  height?: number;
};

export default function LoadingSvg({ width = 220, height = 220 }: LoadingSvgProps) {
  const source = Image.resolveAssetSource(loadingAsset);
  return <SvgUri uri={source.uri} width={width} height={height} />;
}
