import React from "react";
import { SafeAreaView, StyleSheet, View, ViewStyle } from "react-native";
import { theme } from "./theme";

export function Screen({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <View style={[styles.inner, style]}>{children}</View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: theme.colors.bg },
  safe: { flex: 1 },
  inner: { flex: 1 },
});
