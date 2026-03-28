import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Meal } from "../api/types";
import { theme } from "../ui/theme";
import { API_URL } from "../config";

export function MealListItem({
  meal,
  onPress,
  onDelete,
}: {
  meal: Meal;
  onPress?: (meal: Meal) => void;
  onDelete?: (id: string) => void;
}) {
  const time = new Date(meal.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const imageUri = meal.image ? `${API_URL}${meal.image}` : null;

  return (
    <Pressable
      onPress={() => onPress?.(meal)}
      style={({ pressed }) => [styles.card, pressed && onPress && styles.pressed]}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="fast-food-outline" size={24} color={theme.colors.textMuted} />
        </View>
      )}

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {meal.name}
          </Text>
          <Text style={styles.time}>{time}</Text>
        </View>

        <View style={styles.macroRow}>
          <View style={styles.macroPill}>
            <Ionicons name="flame" size={12} color={theme.colors.calories} />
            <Text style={styles.macroText}>{Math.round(meal.calories)} cal</Text>
          </View>
          <View style={styles.macroItems}>
            <MacroDot color={theme.colors.protein} value={Math.round(meal.protein)} suffix="g" />
            <MacroDot color={theme.colors.carbs} value={Math.round(meal.carbs || 0)} suffix="g" />
            <MacroDot color={theme.colors.fat} value={Math.round(meal.fat || 0)} suffix="g" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function MacroDot({
  color,
  value,
  suffix,
}: {
  color: string;
  value: number;
  suffix: string;
}) {
  return (
    <View style={styles.dotItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.dotText}>
        {value}
        {suffix}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.lg,
    marginHorizontal: theme.spacing.md,
    marginVertical: 5,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    ...theme.shadow,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.985 }] },
  image: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: theme.colors.bg,
  },
  imagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: theme.colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  macroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  macroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  macroText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.text,
  },
  macroItems: {
    flexDirection: "row",
    gap: 10,
  },
  dotItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  dotText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
});
