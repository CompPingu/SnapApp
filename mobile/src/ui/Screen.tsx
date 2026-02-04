import React from "react";
import { SafeAreaView, StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "./theme";

export function Screen({
  children,
  style
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <LinearGradient colors={[theme.colors.bgTop, theme.colors.bgBottom]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={[styles.inner, style]}>{children}</View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  inner: { flex: 1 }
});




