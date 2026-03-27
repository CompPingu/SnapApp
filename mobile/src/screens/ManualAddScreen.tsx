import React from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { addMealManual } from "../api/client";
import { Screen } from "../ui/Screen";
import { Card } from "../ui/Card";
import { PrimaryButton } from "../ui/Button";
import { theme } from "../ui/theme";

export function ManualAddScreen() {
  const [name, setName] = React.useState("");
  const [calories, setCalories] = React.useState("");
  const [protein, setProtein] = React.useState("");
  const [carbs, setCarbs] = React.useState("");
  const [fat, setFat] = React.useState("");
  const [quantity, setQuantity] = React.useState(1);
  const [busy, setBusy] = React.useState(false);

  const submit = React.useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) return Alert.alert("Missing name", "Enter a food name.");

    const cals = Number(calories || 0);
    const prot = Number(protein || 0);
    const cb = Number(carbs || 0);
    const ft = Number(fat || 0);
    if ([cals, prot, cb, ft].some((v) => Number.isNaN(v))) {
      return Alert.alert("Invalid numbers", "All values must be numbers.");
    }

    try {
      setBusy(true);
      await addMealManual({
        name: quantity > 1 ? `${trimmed} (x${quantity})` : trimmed,
        calories: Math.round(cals * quantity),
        protein: Math.round(prot * quantity),
        carbs: Math.round(cb * quantity),
        fat: Math.round(ft * quantity),
      });
      setName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      setQuantity(1);
      Alert.alert("Saved", "Meal added successfully.");
    } catch (e: any) {
      Alert.alert("Error", e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }, [name, calories, protein, carbs, fat, quantity]);

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Manual log</Text>
          <Text style={styles.subtitle}>
            Quick add when you already know the macros.
          </Text>

          <Card style={styles.formCard} strong>
            <Text style={styles.label}>Food name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g., oatmeal"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
            />

            <Text style={styles.label}>Quantity / Servings</Text>
            <View style={styles.quantityRow}>
              <Pressable
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                style={({ pressed }) => [
                  styles.quantityBtn,
                  pressed && styles.quantityBtnPressed,
                ]}
              >
                <Ionicons name="remove" size={20} color={theme.colors.text} />
              </Pressable>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <Pressable
                onPress={() => setQuantity((q) => q + 1)}
                style={({ pressed }) => [
                  styles.quantityBtn,
                  pressed && styles.quantityBtnPressed,
                ]}
              >
                <Ionicons name="add" size={20} color={theme.colors.text} />
              </Pressable>
            </View>

            {quantity > 1 ? (
              <Text style={styles.quantityHint}>
                Macros below are per serving. Total will be multiplied by {quantity}.
              </Text>
            ) : null}

            <View style={styles.macroGrid}>
              <MacroField
                icon="flame-outline"
                label="Calories"
                value={calories}
                onChange={setCalories}
                color={theme.colors.calories}
                bg={theme.colors.caloriesBg}
              />
              <MacroField
                icon="fitness-outline"
                label="Protein (g)"
                value={protein}
                onChange={setProtein}
                color={theme.colors.protein}
                bg={theme.colors.proteinBg}
              />
              <MacroField
                icon="leaf-outline"
                label="Carbs (g)"
                value={carbs}
                onChange={setCarbs}
                color={theme.colors.carbs}
                bg={theme.colors.carbsBg}
              />
              <MacroField
                icon="water-outline"
                label="Fat (g)"
                value={fat}
                onChange={setFat}
                color={theme.colors.fat}
                bg={theme.colors.fatBg}
              />
            </View>

            <PrimaryButton
              title={busy ? "Saving..." : "Save"}
              onPress={submit}
              disabled={busy}
              style={styles.btn}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function MacroField({
  icon,
  label,
  value,
  onChange,
  color,
  bg,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onChange: (v: string) => void;
  color: string;
  bg: string;
}) {
  return (
    <View style={[styles.macroField, { backgroundColor: bg }]}>
      <View style={styles.macroFieldHeader}>
        <Ionicons name={icon} size={16} color={color} />
        <Text style={[styles.macroFieldLabel, { color }]}>{label}</Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="0"
        placeholderTextColor={theme.colors.textMuted}
        keyboardType="numeric"
        style={styles.macroFieldInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.md },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: theme.colors.text,
    marginTop: 6,
  },
  subtitle: {
    marginTop: 6,
    color: theme.colors.textSecondary,
    fontWeight: "600",
    fontSize: 14,
  },
  formCard: { marginTop: 16 },
  label: {
    marginBottom: 6,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: theme.colors.bg,
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  macroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  macroField: {
    width: "47%",
    flexGrow: 1,
    borderRadius: theme.radius.md,
    padding: 14,
  },
  macroFieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  macroFieldLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  macroFieldInput: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.text,
    padding: 0,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: theme.colors.bg,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 10,
  },
  quantityBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityBtnPressed: {
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.sm,
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.text,
    minWidth: 36,
    textAlign: "center",
  },
  quantityHint: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textMuted,
    marginBottom: 12,
  },
  btn: { marginTop: 20 },
});
