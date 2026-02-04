import { Platform } from "react-native";

export const theme = {
  colors: {
    bgTop: "#0B1220",
    bgBottom: "#0F172A",
    card: "rgba(255,255,255,0.08)",
    cardStrong: "rgba(255,255,255,0.12)",
    text: "#E6EAF2",
    textMuted: "rgba(230,234,242,0.72)",
    border: "rgba(255,255,255,0.10)",
    primary: "#7C3AED",
    primary2: "#22C55E",
    danger: "#FB7185",
    warning: "#FBBF24"
  },
  radius: {
    sm: 12,
    md: 16,
    lg: 22
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 28
  },
  shadow: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 }
    },
    android: { elevation: 6 },
    default: {}
  }) as any
};




