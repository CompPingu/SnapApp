import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { theme } from "./theme";

export function PrimaryButton({
  title,
  onPress,
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  title,
  onPress,
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btnSecondary,
        pressed && styles.pressedSecondary,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={styles.textSecondary}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: theme.radius.lg,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: theme.colors.text,
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  text: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  btnSecondary: {
    borderRadius: theme.radius.lg,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pressedSecondary: { backgroundColor: theme.colors.border },
  textSecondary: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
});
