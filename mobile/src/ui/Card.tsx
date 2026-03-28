import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { theme } from "./theme";

export function Card({
  children,
  style,
  strong,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  strong?: boolean;
}) {
  return (
    <View style={[styles.card, strong && styles.strong, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    ...theme.shadow,
  },
  strong: {
    ...theme.shadowMd,
  },
});
