import React from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { addMealManual } from "../api/client";
import { Screen } from "../ui/Screen";
import { Card } from "../ui/Card";
import { PrimaryButton } from "../ui/Button";
import { theme } from "../ui/theme";

export function ManualAddScreen() {
  const [name, setName] = React.useState("");
  const [calories, setCalories] = React.useState("");
  const [protein, setProtein] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const submit = React.useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) return Alert.alert("Missing name", "Enter a food name.");

    const cals = Number(calories || 0);
    const prot = Number(protein || 0);
    if (Number.isNaN(cals) || Number.isNaN(prot)) {
      return Alert.alert("Invalid numbers", "Calories and protein must be numbers.");
    }

    try {
      setBusy(true);
      await addMealManual({ name: trimmed, calories: cals, protein: prot });
      setName("");
      setCalories("");
      setProtein("");
      Alert.alert("Saved", "Meal added.");
    } catch (e: any) {
      Alert.alert("Error", e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }, [name, calories, protein]);

  return (
    <Screen>
      <LinearGradient
        colors={["rgba(124,58,237,0.40)", "rgba(59,130,246,0.18)", "rgba(15,23,42,0.0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGlow}
      />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
        <Text style={styles.title}>Manual log</Text>
        <Text style={styles.subtitle}>Quick add when you already know the macros.</Text>

        <Card style={styles.formCard} strong>
          <Text style={styles.label}>Food name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g., oatmeal"
            placeholderTextColor="rgba(230,234,242,0.45)"
            style={styles.input}
          />

          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.label}>Calories</Text>
              <TextInput
                value={calories}
                onChangeText={setCalories}
                placeholder="0"
                placeholderTextColor="rgba(230,234,242,0.45)"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
            <View style={styles.gap} />
            <View style={styles.flex}>
              <Text style={styles.label}>Protein (g)</Text>
              <TextInput
                value={protein}
                onChangeText={setProtein}
                placeholder="0"
                placeholderTextColor="rgba(230,234,242,0.45)"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          </View>

          <PrimaryButton title={busy ? "Saving..." : "Save"} onPress={submit} disabled={busy} style={styles.btn} />

          <Text style={styles.help}>
            Tip: for automatic nutrition, use Scan (image → backend → USDA lookup).
          </Text>
        </Card>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerGlow: {
    position: "absolute",
    top: -110,
    left: -70,
    right: -70,
    height: 240
  },
  container: { flex: 1, padding: theme.spacing.md },
  title: { fontSize: 24, fontWeight: "900", color: theme.colors.text, marginTop: 6 },
  subtitle: { marginTop: 6, color: theme.colors.textMuted, fontWeight: "700" },
  formCard: { marginTop: 14, ...theme.shadow },
  label: { marginTop: 12, marginBottom: 6, fontWeight: "800", color: theme.colors.text },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(0,0,0,0.14)",
    color: theme.colors.text
  },
  row: { flexDirection: "row", marginTop: 6 },
  flex: { flex: 1 },
  gap: { width: 12 },
  btn: { marginTop: 18 },
  help: { marginTop: 12, color: theme.colors.textMuted, lineHeight: 18, fontWeight: "600" }
});


