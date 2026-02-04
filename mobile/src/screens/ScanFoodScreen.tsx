import React from "react";
import { Alert, ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { scanFoodImage } from "../api/client";
import { Screen } from "../ui/Screen";
import { Card } from "../ui/Card";
import { PrimaryButton } from "../ui/Button";
import { theme } from "../ui/theme";

export function ScanFoodScreen() {
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = React.useRef<CameraView>(null);
  const [busy, setBusy] = React.useState(false);
  const [lastResult, setLastResult] = React.useState<any>(null);

  const takeAndUpload = React.useCallback(async () => {
    try {
      setBusy(true);
      setLastResult(null);

      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.7,
        skipProcessing: false
      });
      if (!photo?.uri) throw new Error("No photo captured");

      // Reduce size a bit so uploads are quick on mobile.
      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1280 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      const result = await scanFoodImage({
        uri: manipulated.uri,
        name: "scan.jpg",
        type: "image/jpeg"
      });

      setLastResult(result);
      Alert.alert("Saved", `Logged: ${result.meal?.name || "meal"}`);
    } catch (e: any) {
      Alert.alert("Scan failed", e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }, []);

  if (!permission) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator color={theme.colors.text} />
      </Screen>
    );
  }

  if (!permission.granted) {
    return (
      <Screen style={styles.center}>
        <Text style={styles.title}>Camera permission needed</Text>
        <Text style={styles.subtitle}>Grant permission to scan food using your camera.</Text>
        <PrimaryButton title="Grant permission" onPress={() => requestPermission()} style={styles.primaryBtn} />
      </Screen>
    );
  }

  return (
    <View style={styles.container}>
      {isFocused ? (
        <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      ) : (
        <View style={styles.cameraPlaceholder} />
      )}

      {/* Top gradient vignette */}
      <LinearGradient colors={["rgba(0,0,0,0.65)", "rgba(0,0,0,0)"]} style={styles.topFade} />
      {/* Bottom gradient for readability */}
      <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.78)"]} style={styles.bottomFade} />

      <View style={styles.bottomPanel}>
        <Pressable
          disabled={busy}
          onPress={takeAndUpload}
          style={[styles.captureCircle, busy && styles.captureCircleDisabled]}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="camera" size={26} color="#fff" />
          )}
        </Pressable>
        <Text style={styles.captureText}>{busy ? "Uploading..." : "Tap to capture & log"}</Text>

        {lastResult?.meal ? (
          <Card style={styles.result} strong>
            <Text style={styles.resultTitle}>Last scan</Text>
            <Text style={styles.resultText}>
              {lastResult.meal.name} · {lastResult.meal.calories} kcal · {lastResult.meal.protein} g protein
            </Text>
            {lastResult.debug?.nutritionError ? (
              <Text style={styles.warn}>
                Nutrition lookup failed (USDA key missing?). Meal saved with 0s. See backend console / set `USDA_API_KEY`.
              </Text>
            ) : null}
          </Card>
        ) : (
          <Text style={styles.tip}>
            Tip: this project’s “vision” step is a free stub by default. It will still save a meal; you can plug in a real
            vision provider later.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  cameraPlaceholder: { flex: 1, backgroundColor: "#000" },
  topFade: { position: "absolute", left: 0, right: 0, top: 0, height: 160 },
  bottomFade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 260 },
  bottomPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    paddingTop: theme.spacing.sm
  },
  captureCircle: {
    alignSelf: "center",
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(124,58,237,0.92)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadow
  },
  captureCircleDisabled: { opacity: 0.7 },
  captureText: { marginTop: 10, color: theme.colors.text, fontSize: 15, fontWeight: "800", textAlign: "center" },
  result: { marginTop: 12, ...theme.shadow },
  resultTitle: { color: theme.colors.text, fontWeight: "900" },
  resultText: { marginTop: 6, color: theme.colors.textMuted, fontWeight: "700" },
  warn: { marginTop: 8, color: theme.colors.warning, fontWeight: "700" },
  tip: { marginTop: 12, color: "rgba(230,234,242,0.80)", lineHeight: 18, fontWeight: "600" },
  center: { alignItems: "center", justifyContent: "center", padding: 18 },
  title: { fontSize: 20, fontWeight: "900", color: theme.colors.text },
  subtitle: { marginTop: 8, color: theme.colors.textMuted, textAlign: "center", fontWeight: "700" },
  primaryBtn: { marginTop: 14, width: "100%" }
});


