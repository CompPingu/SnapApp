import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Meal } from "../api/types";

export function MealListItem({
  meal,
  onDelete
}: {
  meal: Meal;
  onDelete?: (id: string) => void;
}) {
  const time = new Date(meal.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.title}>
          {meal.name} <Text style={styles.badge}>{meal.source}</Text>
        </Text>
        <Text style={styles.subtitle}>
          {time} · {meal.calories} kcal · {meal.protein} g protein
        </Text>
      </View>
      {onDelete ? (
        <Pressable onPress={() => onDelete(meal.id)} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd"
  },
  left: { flex: 1, paddingRight: 12 },
  title: { fontSize: 16, fontWeight: "600" },
  subtitle: { marginTop: 2, color: "#555" },
  badge: { fontSize: 12, color: "#666" },
  deleteBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#f2f2f2"
  },
  deleteText: { color: "#b00020", fontWeight: "600" }
});


