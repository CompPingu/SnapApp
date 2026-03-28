import React from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { deleteMeal, fetchHistory } from "../api/client";
import type { HistoryDay, Meal } from "../api/types";
import { MealListItem } from "../components/MealListItem";
import { EditMealModal } from "../components/EditMealModal";
import { Screen } from "../ui/Screen";
import { Card } from "../ui/Card";
import { theme } from "../ui/theme";

export function HistoryScreen() {
  const [items, setItems] = React.useState<HistoryDay[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [days, setDays] = React.useState(14);
  const [editMeal, setEditMeal] = React.useState<Meal | null>(null);

  const load = React.useCallback(async () => {
    const res = await fetchHistory(days);
    setItems(res.items || []);
  }, [days]);

  useFocusEffect(
    React.useCallback(() => {
      let alive = true;
      (async () => {
        try {
          setLoading(true);
          const res = await fetchHistory(days);
          if (alive) setItems(res.items || []);
        } catch (e: any) {
          Alert.alert("Error", e?.message || String(e));
        } finally {
          if (alive) setLoading(false);
        }
      })();
      return () => {
        alive = false;
      };
    }, [days])
  );

  const sections = items.map((d) => ({
    title: d.date,
    calories: Math.round(d.totals.calories),
    protein: Math.round(d.totals.protein),
    carbs: Math.round(d.totals.carbs || 0),
    fat: Math.round(d.totals.fat || 0),
    data: d.meals as Meal[],
  }));

  if (loading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.topBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>History</Text>
          <Text style={styles.subtitle}>Past {days} days</Text>
        </View>
        <Pressable
          onPress={() => setDays((d) => (d === 7 ? 14 : d === 14 ? 30 : 7))}
          style={styles.daysBtn}
        >
          <Text style={styles.daysBtnText}>Last {days}d</Text>
        </Pressable>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <MealListItem meal={item} onPress={setEditMeal} />
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeaderWrap}>
            <Card style={styles.sectionHeader}>
              <Text style={styles.sectionDate}>{section.title}</Text>
              <Text style={styles.sectionMacros}>
                {section.calories} cal · {section.protein}g P · {section.carbs}g C · {section.fat}g F
              </Text>
            </Card>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No history yet.</Text>
          </View>
        }
        contentContainerStyle={
          sections.length ? { paddingBottom: 24 } : { padding: 16 }
        }
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />

      <EditMealModal
        meal={editMeal}
        visible={!!editMeal}
        onClose={() => setEditMeal(null)}
        onSaved={load}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  loadingText: {
    marginTop: 10,
    color: theme.colors.textMuted,
    fontWeight: "600",
  },
  topBar: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontWeight: "900",
    fontSize: 26,
    color: theme.colors.text,
  },
  subtitle: {
    marginTop: 4,
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  daysBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow,
  },
  daysBtnText: {
    fontWeight: "700",
    color: theme.colors.text,
    fontSize: 13,
  },
  sectionHeaderWrap: {
    marginTop: 10,
    marginHorizontal: theme.spacing.md,
  },
  sectionHeader: {
    paddingVertical: 12,
  },
  sectionDate: {
    fontWeight: "800",
    color: theme.colors.text,
    fontSize: 15,
  },
  sectionMacros: {
    marginTop: 3,
    color: theme.colors.textSecondary,
    fontWeight: "600",
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontWeight: "600",
  },
});
