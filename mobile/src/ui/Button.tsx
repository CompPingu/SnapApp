import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "./theme";

export function PrimaryButton({
  title,
  onPress,
  disabled,
  style
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[style, disabled && { opacity: 0.7 }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primary2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.btn}
      >
        <Text style={styles.text}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: theme.radius.lg,
    paddingVertical: 14,
    alignItems: "center"
  },
  text: { color: theme.colors.text, fontSize: 16, fontWeight: "800" }
});




