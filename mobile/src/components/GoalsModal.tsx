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
import { saveGoals } from "../api/client";
import type { Goals } from "../api/types";
import { theme } from "../ui/theme";

type Props = {
  goals: Goals | null;
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export function GoalsModal({ goals, visible, onClose, onSaved }: Props) {
  const [calories, setCalories] = React.useState("2000");
  const [protein, setProtein] = React.useState("150");
  const [carbs, setCarbs] = React.useState("250");
  const [fat, setFat] = React.useState("65");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (goals) {
      setCalories(String(goals.calories));
      setProtein(String(goals.protein));
      setCarbs(String(goals.carbs));
      setFat(String(goals.fat));
    }
  }, [goals]);

  const handleSave = async () => {
    try {
      setBusy(true);
      await saveGoals({
        calories: Number(calories) || 2000,
        protein: Number(protein) || 150,
        carbs: Number(carbs) || 250,
        fat: Number(fat) || 65,
      });
      onSaved();
      onClose();
    } catch (e: any) {
      Alert.alert("Error", e?.message || String(e));
    } finally {
      setBusy(false);
    }
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
              <Text style={styles.headerTitle}>Daily Goals</Text>
              <View style={{ width: 36 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.description}>
                Set your daily nutrition targets to track your progress.
              </Text>

              <GoalInput
                icon="flame-outline"
                label="Calories"
                value={calories}
                onChange={setCalories}
                color={theme.colors.calories}
                bg={theme.colors.caloriesBg}
              />
              <GoalInput
                icon="fitness-outline"
                label="Protein"
                value={protein}
                onChange={setProtein}
                suffix="g"
                color={theme.colors.protein}
                bg={theme.colors.proteinBg}
              />
              <GoalInput
                icon="leaf-outline"
                label="Carbs"
                value={carbs}
                onChange={setCarbs}
                suffix="g"
                color={theme.colors.carbs}
                bg={theme.colors.carbsBg}
              />
              <GoalInput
                icon="water-outline"
                label="Fat"
                value={fat}
                onChange={setFat}
                suffix="g"
                color={theme.colors.fat}
                bg={theme.colors.fatBg}
              />

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
                  {busy ? "Saving..." : "Save Goals"}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function GoalInput({
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
    <View style={[styles.goalRow, { backgroundColor: bg }]}>
      <View style={styles.goalLeft}>
        <Ionicons name={icon} size={20} color={color} />
        <Text style={[styles.goalLabel, { color }]}>{label}</Text>
      </View>
      <View style={styles.goalInputWrap}>
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          style={styles.goalInput}
        />
        {suffix ? <Text style={styles.goalSuffix}>{suffix}</Text> : null}
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
    maxHeight: "80%",
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
  description: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: theme.radius.md,
    marginBottom: 10,
  },
  goalLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  goalLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  goalInputWrap: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  goalInput: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.text,
    textAlign: "right",
    minWidth: 60,
    padding: 0,
  },
  goalSuffix: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textMuted,
    marginLeft: 2,
  },
  saveBtn: {
    backgroundColor: theme.colors.text,
    borderRadius: theme.radius.lg,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
