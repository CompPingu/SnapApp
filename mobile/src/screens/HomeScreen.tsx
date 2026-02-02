import React from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { fetchToday, deleteMeal } from "../api/client";
import type { Meal, TodayResponse } from "../api/types";
import { MealListItem } from "../components/MealListItem";

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
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.hint}>Loading today...</Text>
      </View>
    );
  }

  const totals = data?.totals || { calories: 0, protein: 0 };
  const meals: Meal[] = data?.meals || [];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.dateText}>Today</Text>
        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{Math.round(totals.calories)}</Text>
            <Text style={styles.metricLabel}>kcal</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{Math.round(totals.protein)}</Text>
            <Text style={styles.metricLabel}>protein (g)</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Meals</Text>
      <FlatList
        data={meals}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <MealListItem meal={item} onDelete={onDelete} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No meals yet. Add one manually or scan food.</Text>}
        contentContainerStyle={meals.length ? undefined : { padding: 12 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  hint: { marginTop: 10, color: "#555" },
  card: {
    margin: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#f6f7fb",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7ef"
  },
  dateText: { fontSize: 16, fontWeight: "700" },
  metrics: { flexDirection: "row", gap: 18, marginTop: 12 },
  metric: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: "#fff" },
  metricValue: { fontSize: 28, fontWeight: "800" },
  metricLabel: { marginTop: 2, color: "#666" },
  sectionTitle: { marginLeft: 12, marginTop: 4, marginBottom: 6, fontWeight: "700", color: "#333" },
  empty: { color: "#666" }
});


