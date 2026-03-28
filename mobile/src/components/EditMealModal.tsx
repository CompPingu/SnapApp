import React from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { updateMeal, deleteMeal } from "../api/client";
import type { Meal } from "../api/types";
import { theme } from "../ui/theme";

type Props = {
  meal: Meal | null;
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export function EditMealModal({ meal, visible, onClose, onSaved }: Props) {
  const [name, setName] = React.useState("");
  const [calories, setCalories] = React.useState("");
  const [protein, setProtein] = React.useState("");
  const [carbs, setCarbs] = React.useState("");
  const [fat, setFat] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (meal) {
      setName(meal.name);
      setCalories(String(Math.round(meal.calories)));
      setProtein(String(Math.round(meal.protein)));
      setCarbs(String(Math.round(meal.carbs || 0)));
      setFat(String(Math.round(meal.fat || 0)));
    }
  }, [meal]);

  if (!meal) return null;

  const time = new Date(meal.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleSave = async () => {
    try {
      setBusy(true);
      await updateMeal(meal.id, {
        name: name.trim() || meal.name,
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
      });
      onSaved();
      onClose();
    } catch (e: any) {
      Alert.alert("Error", e?.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete meal?", "This will remove it permanently.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setBusy(true);
            await deleteMeal(meal.id);
            onSaved();
            onClose();
          } catch (e: any) {
            Alert.alert("Error", e?.message || String(e));
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardView}
        >
          <View style={styles.sheet}>
            <View style={styles.handle} />

            <View style={styles.header}>
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
              </Pressable>
              <Text style={styles.headerTitle}>Edit Meal</Text>
              <Pressable onPress={handleDelete} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.time}>{time}</Text>

              <Text style={styles.label}>Food Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholderTextColor={theme.colors.textMuted}
              />

              <View style={styles.macroGrid}>
                <MacroInput
                  icon="flame-outline"
                  label="Calories"
                  value={calories}
                  onChange={setCalories}
                  color={theme.colors.calories}
                  bg={theme.colors.caloriesBg}
                />
                <MacroInput
                  icon="fitness-outline"
                  label="Protein"
                  value={protein}
                  onChange={setProtein}
                  suffix="g"
                  color={theme.colors.protein}
                  bg={theme.colors.proteinBg}
                />
                <MacroInput
                  icon="leaf-outline"
                  label="Carbs"
                  value={carbs}
                  onChange={setCarbs}
                  suffix="g"
                  color={theme.colors.carbs}
                  bg={theme.colors.carbsBg}
                />
                <MacroInput
                  icon="water-outline"
                  label="Fat"
                  value={fat}
                  onChange={setFat}
                  suffix="g"
                  color={theme.colors.fat}
                  bg={theme.colors.fatBg}
                />
              </View>

              <View style={styles.actions}>
                <Pressable
                  onPress={handleSave}
                  disabled={busy}
                  style={({ pressed }) => [
                    styles.saveBtn,
                    pressed && { opacity: 0.85 },
                    busy && { opacity: 0.5 },
                  ]}
                >
                  <Text style={styles.saveBtnText}>
                    {busy ? "Saving..." : "Done"}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function MacroInput({
  icon,
  label,
  value,
  onChange,
  suffix,
  color,
  bg,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  color: string;
  bg: string;
}) {
  return (
    <View style={[styles.macroCard, { backgroundColor: bg }]}>
      <View style={styles.macroCardHeader}>
        <Ionicons name={icon} size={18} color={color} />
        <Text style={[styles.macroLabel, { color }]}>{label}</Text>
      </View>
      <View style={styles.macroInputRow}>
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          style={[styles.macroInput, { color: theme.colors.text }]}
        />
        {suffix ? (
          <Text style={styles.macroSuffix}>{suffix}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  keyboardView: { justifyContent: "flex-end" },
  sheet: {
    backgroundColor: theme.colors.bgCard,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    maxHeight: "85%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: theme.colors.text,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  time: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    backgroundColor: theme.colors.bg,
    marginBottom: 16,
  },
  macroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  macroCard: {
    width: "48%",
    flexGrow: 1,
    borderRadius: theme.radius.md,
    padding: 14,
  },
  macroCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  macroInputRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  macroInput: {
    fontSize: 24,
    fontWeight: "800",
    minWidth: 40,
    padding: 0,
  },
  macroSuffix: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textMuted,
    marginLeft: 2,
  },
  actions: {
    marginTop: 20,
    gap: 10,
  },
  saveBtn: {
    backgroundColor: theme.colors.text,
    borderRadius: theme.radius.lg,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
