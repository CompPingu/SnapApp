import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { fetchToday } from "../api/client";
import type { Goals, Meal, TodayResponse } from "../api/types";
import { MealListItem } from "../components/MealListItem";
import { EditMealModal } from "../components/EditMealModal";
import { GoalsModal } from "../components/GoalsModal";
import { Screen } from "../ui/Screen";
import { Card } from "../ui/Card";
import { CircularProgress } from "../ui/CircularProgress";
import { CalorieRing } from "../ui/CalorieRing";
import { theme } from "../ui/theme";

const DEFAULT_GOALS: Goals = { calories: 2000, protein: 150, carbs: 250, fat: 65 };

export function HomeScreen() {
  const [data, setData] = React.useState<TodayResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [editMeal, setEditMeal] = React.useState<Meal | null>(null);
  const [showGoals, setShowGoals] = React.useState(false);

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

  if (loading && !data) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading...</Text>
      </Screen>
    );
  }

  const totals = data?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const goals = data?.goals || DEFAULT_GOALS;
  const meals: Meal[] = data?.meals || [];

  const calOver = totals.calories > goals.calories;
  const calLeft = Math.max(0, Math.round(goals.calories - totals.calories));
  const calOverBy = calOver ? Math.round(totals.calories - goals.calories) : 0;

  const protProgress = goals.protein > 0 ? totals.protein / goals.protein : 0;
  const protLeft = Math.max(0, Math.round(goals.protein - totals.protein));

  const carbProgress = goals.carbs > 0 ? totals.carbs / goals.carbs : 0;
  const carbLeft = Math.max(0, Math.round(goals.carbs - totals.carbs));

  const fatProgress = goals.fat > 0 ? totals.fat / goals.fat : 0;
  const fatLeft = Math.max(0, Math.round(goals.fat - totals.fat));

  const renderHeader = () => (
    <View>
      {/* Calorie ring */}
      <Pressable onPress={() => setShowGoals(true)}>
        <Card style={styles.calorieCard} strong>
          <View style={styles.calorieRow}>
            <View style={styles.calorieInfo}>
              <Text style={styles.calorieLabel}>
                {calOver ? "Calories over" : "Calories left"}
              </Text>
              <Text
                style={[
                  styles.calorieValue,
                  calOver && { color: "#EF4444" },
                ]}
              >
                {calOver ? `+${calOverBy}` : calLeft}
              </Text>
              <Text style={styles.calorieGoal}>
                of {goals.calories} goal
              </Text>
            </View>
            <CalorieRing
              size={110}
              strokeWidth={10}
              eaten={totals.calories}
              goal={goals.calories}
            >
              <Ionicons
                name="flame"
                size={28}
                color={calOver ? "#EF4444" : "#16A34A"}
              />
            </CalorieRing>
          </View>
          <View style={styles.calorieSummary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{Math.round(totals.calories)}</Text>
              <Text style={styles.summaryLabel}>Eaten</Text>
            </View>
            <View style={[styles.summaryDivider]} />
            <View style={styles.summaryItem}>
              <Text
                style={[
                  styles.summaryValue,
                  calOver && { color: "#EF4444" },
                ]}
              >
                {calOver ? `+${calOverBy}` : calLeft}
              </Text>
              <Text style={styles.summaryLabel}>
                {calOver ? "Over" : "Remaining"}
              </Text>
            </View>
            <View style={[styles.summaryDivider]} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{goals.calories}</Text>
              <Text style={styles.summaryLabel}>Goal</Text>
            </View>
          </View>
          <View style={styles.editGoalHint}>
            <Ionicons name="settings-outline" size={13} color={theme.colors.textMuted} />
            <Text style={styles.editGoalText}>Tap to edit goals</Text>
          </View>
        </Card>
      </Pressable>

      {/* Macro cards row */}
      <View style={styles.macroRow}>
        <MacroCard
          label="Protein"
          left={protLeft}
          progress={protProgress}
          color={theme.colors.protein}
          icon="fitness-outline"
        />
        <MacroCard
          label="Carbs"
          left={carbLeft}
          progress={carbProgress}
          color={theme.colors.carbs}
          icon="leaf-outline"
        />
        <MacroCard
          label="Fat"
          left={fatLeft}
          progress={fatProgress}
          color={theme.colors.fat}
          icon="water-outline"
        />
      </View>

      {/* Recently eaten header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recently eaten</Text>
        <Text style={styles.sectionCount}>{meals.length} items</Text>
      </View>
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={meals}
        keyExtractor={(m) => m.id}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <MealListItem meal={item} onPress={setEditMeal} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={40} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>No meals logged yet</Text>
            <Text style={styles.emptySubtitle}>
              Scan food or add manually to start tracking
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <EditMealModal
        meal={editMeal}
        visible={!!editMeal}
        onClose={() => setEditMeal(null)}
        onSaved={load}
      />

      <GoalsModal
        goals={goals}
        visible={showGoals}
        onClose={() => setShowGoals(false)}
        onSaved={load}
      />
    </Screen>
  );
}

function MacroCard({
  label,
  left,
  progress,
  color,
  icon,
}: {
  label: string;
  left: number;
  progress: number;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Card style={styles.macroCard}>
      <Text style={styles.macroValue}>{left}g</Text>
      <Text style={styles.macroLabel}>{label} left</Text>
      <View style={styles.macroRingWrap}>
        <CircularProgress
          size={52}
          strokeWidth={5}
          progress={progress}
          color={color}
        >
          <Ionicons name={icon} size={16} color={color} />
        </CircularProgress>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  loadingText: {
    marginTop: 10,
    color: theme.colors.textMuted,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 24,
  },

  // Calorie card
  calorieCard: {
    marginTop: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
  },
  calorieRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  calorieInfo: {
    flex: 1,
  },
  calorieLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  calorieValue: {
    fontSize: 40,
    fontWeight: "900",
    color: theme.colors.text,
    marginTop: 2,
  },
  calorieGoal: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  calorieSummary: {
    flexDirection: "row",
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.text,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
  editGoalHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 12,
  },
  editGoalText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },

  // Macro row
  macroRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    marginHorizontal: theme.spacing.md,
  },
  macroCard: {
    flex: 1,
    alignItems: "flex-start",
  },
  macroValue: {
    fontSize: 22,
    fontWeight: "900",
    color: theme.colors.text,
  },
  macroLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  macroRingWrap: {
    alignSelf: "center",
    marginTop: 10,
  },

  // Section
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginHorizontal: theme.spacing.md,
    marginTop: 20,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.text,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },

  // Empty
  emptyContainer: {
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 6,
    textAlign: "center",
  },
});
