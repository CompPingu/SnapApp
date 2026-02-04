import React from "react";
import { ActivityIndicator, Alert, Pressable, SectionList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import { deleteMeal, fetchHistory } from "../api/client";
import type { HistoryDay, Meal } from "../api/types";
import { MealListItem } from "../components/MealListItem";
import { Screen } from "../ui/Screen";
import { Card } from "../ui/Card";
import { theme } from "../ui/theme";

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
      <Screen style={styles.center}>
        <ActivityIndicator color={theme.colors.text} />
        <Text style={styles.hint}>Loading history...</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <LinearGradient
        colors={["rgba(34,197,94,0.30)", "rgba(124,58,237,0.16)", "rgba(15,23,42,0.0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGlow}
      />

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
        renderItem={({ item }) => <MealListItem meal={item} onDelete={onDelete} />}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeaderWrap}>
            <Card style={styles.sectionHeader} strong>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </Card>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No history yet.</Text>}
        contentContainerStyle={sections.length ? { paddingBottom: 18 } : { padding: 16 }}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  hint: { marginTop: 10, color: theme.colors.textMuted },
  headerGlow: { position: "absolute", top: -120, left: -80, right: -80, height: 240 },
  topBar: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center"
  },
  title: { fontWeight: "900", fontSize: 24, color: theme.colors.text },
  subtitle: { marginTop: 4, color: theme.colors.textMuted, fontWeight: "700" },
  daysBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border
  },
  daysBtnText: { fontWeight: "800", color: theme.colors.text },
  sectionHeaderWrap: { marginTop: 8, marginHorizontal: theme.spacing.md },
  sectionHeader: { paddingVertical: 12, ...theme.shadow },
  sectionTitle: { fontWeight: "900", color: theme.colors.text },
  empty: { color: theme.colors.textMuted }
});


