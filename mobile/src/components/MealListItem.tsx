import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Meal } from "../api/types";
import { theme } from "../ui/theme";
import { Card } from "../ui/Card";

export function MealListItem({
  meal,
  onDelete
}: {
  meal: Meal;
  onDelete?: (id: string) => void;
}) {
  const time = new Date(meal.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <Card style={styles.card} strong>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.title} numberOfLines={1}>
            {meal.name}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {time} · {meal.calories} kcal · {meal.protein}g protein
          </Text>
        </View>
        <View style={styles.right}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{meal.source}</Text>
          </View>
          {onDelete ? (
            <Pressable onPress={() => onDelete(meal.id)} style={styles.deleteBtn}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: theme.spacing.md,
    marginVertical: 6,
    ...theme.shadow
  },
  row: { flexDirection: "row", alignItems: "center" },
  left: { flex: 1, paddingRight: 12 },
  right: { alignItems: "flex-end", gap: 10 },
  title: { fontSize: 16, fontWeight: "800", color: theme.colors.text },
  subtitle: { marginTop: 4, color: theme.colors.textMuted },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border
  },
  pillText: { color: theme.colors.text, fontWeight: "700", fontSize: 12 },
  deleteBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "rgba(251, 113, 133, 0.14)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(251, 113, 133, 0.35)"
  },
  deleteText: { color: theme.colors.danger, fontWeight: "800" }
});


