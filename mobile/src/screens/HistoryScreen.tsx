import React from "react";
import { ActivityIndicator, Alert, Pressable, SectionList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { deleteMeal, fetchHistory } from "../api/client";
import type { HistoryDay, Meal } from "../api/types";
import { MealListItem } from "../components/MealListItem";

export function HistoryScreen() {
  const [items, setItems] = React.useState<HistoryDay[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [days, setDays] = React.useState(14);

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

  const sections = items.map((d) => ({
    title: `${d.date} · ${Math.round(d.totals.calories)} kcal · ${Math.round(d.totals.protein)} g`,
    data: d.meals as Meal[]
  }));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.hint}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Past {days} days</Text>
        <Pressable
          onPress={() => setDays((d) => (d === 7 ? 14 : d === 14 ? 30 : 7))}
          style={styles.daysBtn}
        >
          <Text style={styles.daysBtnText}>Change</Text>
        </Pressable>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <MealListItem meal={item} onDelete={onDelete} />}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No history yet.</Text>}
        contentContainerStyle={sections.length ? undefined : { padding: 12 }}
        stickySectionHeadersEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  hint: { marginTop: 10, color: "#555" },
  topBar: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8, flexDirection: "row", alignItems: "center" },
  title: { flex: 1, fontWeight: "800", fontSize: 16 },
  daysBtn: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, backgroundColor: "#f2f2f2" },
  daysBtnText: { fontWeight: "700" },
  sectionHeader: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#fafafa" },
  sectionTitle: { fontWeight: "800", color: "#333" },
  empty: { color: "#666" }
});


