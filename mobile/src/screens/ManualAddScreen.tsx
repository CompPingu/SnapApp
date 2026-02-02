import React from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { addMealManual } from "../api/client";

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
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <Text style={styles.title}>Log a meal</Text>

      <Text style={styles.label}>Food name</Text>
      <TextInput value={name} onChangeText={setName} placeholder="e.g., oatmeal" style={styles.input} />

      <View style={styles.row}>
        <View style={styles.flex}>
          <Text style={styles.label}>Calories</Text>
          <TextInput
            value={calories}
            onChangeText={setCalories}
            placeholder="0"
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
            keyboardType="numeric"
            style={styles.input}
          />
        </View>
      </View>

      <Pressable disabled={busy} onPress={submit} style={[styles.button, busy && styles.buttonDisabled]}>
        <Text style={styles.buttonText}>{busy ? "Saving..." : "Save"}</Text>
      </Pressable>

      <Text style={styles.help}>
        Tip: if you want accurate numbers automatically, use the Scan screen (image → backend → USDA lookup).
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 14 },
  label: { marginTop: 10, marginBottom: 6, fontWeight: "700", color: "#333" },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fafafa"
  },
  row: { flexDirection: "row", marginTop: 6 },
  flex: { flex: 1 },
  gap: { width: 12 },
  button: { marginTop: 18, paddingVertical: 14, borderRadius: 14, backgroundColor: "#111", alignItems: "center" },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  help: { marginTop: 14, color: "#666", lineHeight: 18 }
});


