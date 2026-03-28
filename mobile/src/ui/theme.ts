import { Platform } from "react-native";

export const theme = {
  colors: {
    bg: "#F2F4F7",
    bgCard: "#FFFFFF",
    text: "#1A1D26",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    border: "#E5E7EB",
    primary: "#4F46E5",
    primaryLight: "#EEF2FF",
    calories: "#F59E0B",
    caloriesBg: "#FEF3C7",
    protein: "#EF4444",
    proteinBg: "#FEE2E2",
    carbs: "#D97706",
    carbsBg: "#FEF3C7",
    fat: "#3B82F6",
    fatBg: "#DBEAFE",
    success: "#22C55E",
    danger: "#EF4444",
    warning: "#F59E0B",
    progressTrack: "#E8ECF0",
  },
  radius: {
    sm: 12,
    md: 16,
    lg: 22,
    xl: 28,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 20,
    xl: 28,
  },
  shadow: Platform.select({
    ios: {
      shadowColor: "#1A1D26",
      shadowOpacity: 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: 3 },
    default: {},
  }) as any,
  shadowMd: Platform.select({
    ios: {
      shadowColor: "#1A1D26",
      shadowOpacity: 0.1,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: 6 },
    default: {},
  }) as any,
};
