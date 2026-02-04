import React from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import { fetchToday, deleteMeal } from "../api/client";
import type { Meal, TodayResponse } from "../api/types";
import { MealListItem } from "../components/MealListItem";
import { Screen } from "../ui/Screen";
import { Card } from "../ui/Card";
import { theme } from "../ui/theme";

export function HomeScreen() {
  const [data, setData] = React.useState<TodayResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const load = React.useCallback(async () => {
    const d = await fetchToday();
    setData(d);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      let alive = true;
      (async () => {
        try {
          setLoading(true);
          const d = await fetchToday();
          if (alive) setData(d);
        } catch (e: any) {
          Alert.alert("Error", e?.message || String(e));
        } finally {
          if (alive) setLoading(false);
        }
      })();
      return () => {
        alive = false;
      };
    }, [])
  );

  const onRefresh = React.useCallback(async () => {
    try {
      setRefreshing(true);
      await load();
    } catch (e: any) {
      Alert.alert("Error", e?.message || String(e));
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const onDelete = React.useCallback(
    (id: string) => {
      Alert.alert("Delete meal?", "This will remove it from history.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMeal(id);
              await load();
            } catch (e: any) {
              Alert.alert("Error", e?.message || String(e));
            }
          }
        }
      ]);
    },
    [load]
  );

  if (loading && !data) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator color={theme.colors.text} />
        <Text style={styles.hint}>Loading today...</Text>
      </Screen>
    );
  }

  const totals = data?.totals || { calories: 0, protein: 0 };
  const meals: Meal[] = data?.meals || [];

  return (
    <Screen>
      <LinearGradient
        colors={["rgba(124,58,237,0.55)", "rgba(34,197,94,0.18)", "rgba(15,23,42,0.0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGlow}
      />

      <Card style={styles.hero} strong>
        <Text style={styles.kicker}>Today</Text>
        <Text style={styles.heroTitle}>Calories & Protein</Text>

        <View style={styles.metrics}>
          <View style={styles.metricPill}>
            <Text style={styles.metricValue}>{Math.round(totals.calories)}</Text>
            <Text style={styles.metricLabel}>kcal</Text>
          </View>
          <View style={styles.metricPill}>
            <Text style={styles.metricValue}>{Math.round(totals.protein)}</Text>
            <Text style={styles.metricLabel}>protein (g)</Text>
          </View>
        </View>
      </Card>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Meals</Text>
        <Text style={styles.sectionHint}>{meals.length} logged</Text>
      </View>

      <FlatList
        data={meals}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <MealListItem meal={item} onDelete={onDelete} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.text} />
        }
        ListEmptyComponent={<Text style={styles.empty}>No meals yet. Add one manually or scan food.</Text>}
        contentContainerStyle={meals.length ? { paddingBottom: 18 } : { padding: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  hint: { marginTop: 10, color: theme.colors.textMuted },
  headerGlow: {
    position: "absolute",
    top: -120,
    left: -80,
    right: -80,
    height: 260
  },
  hero: {
    marginTop: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    ...theme.shadow
  },
  kicker: { color: theme.colors.textMuted, fontWeight: "700", letterSpacing: 0.3 },
  heroTitle: { marginTop: 2, color: theme.colors.text, fontSize: 22, fontWeight: "900" },
  metrics: { flexDirection: "row", gap: 12, marginTop: 14 },
  metricPill: {
    flex: 1,
    borderRadius: theme.radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border
  },
  metricValue: { color: theme.colors.text, fontSize: 30, fontWeight: "900" },
  metricLabel: { marginTop: 2, color: theme.colors.textMuted, fontWeight: "700" },
  sectionRow: {
    marginTop: 14,
    marginHorizontal: theme.spacing.md,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "baseline"
  },
  sectionTitle: { flex: 1, fontWeight: "900", color: theme.colors.text, fontSize: 16 },
  sectionHint: { color: theme.colors.textMuted, fontWeight: "700" },
  empty: { color: theme.colors.textMuted }
});


