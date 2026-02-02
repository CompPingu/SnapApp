import React from "react";
import { Alert, ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { useIsFocused } from "@react-navigation/native";

import { scanFoodImage } from "../api/client";

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
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Camera permission needed</Text>
        <Text style={styles.subtitle}>Grant permission to scan food using your camera.</Text>
        <Pressable onPress={() => requestPermission()} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Grant permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isFocused ? (
        <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      ) : (
        <View style={styles.cameraPlaceholder} />
      )}

      <View style={styles.bottomPanel}>
        <Pressable disabled={busy} onPress={takeAndUpload} style={[styles.captureBtn, busy && styles.captureBtnDisabled]}>
          <Text style={styles.captureText}>{busy ? "Uploading..." : "Capture & Log"}</Text>
        </Pressable>

        {lastResult?.meal ? (
          <View style={styles.result}>
            <Text style={styles.resultTitle}>Last scan</Text>
            <Text style={styles.resultText}>
              {lastResult.meal.name} · {lastResult.meal.calories} kcal · {lastResult.meal.protein} g protein
            </Text>
            {lastResult.debug?.nutritionError ? (
              <Text style={styles.warn}>
                Nutrition lookup failed (USDA key missing?). Meal saved with 0s. See backend console / set `USDA_API_KEY`.
              </Text>
            ) : null}
          </View>
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
  bottomPanel: {
    padding: 12,
    backgroundColor: "#111"
  },
  captureBtn: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#3b82f6"
  },
  captureBtnDisabled: { opacity: 0.7 },
  captureText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  result: { marginTop: 10, padding: 12, backgroundColor: "#1b1b1b", borderRadius: 12 },
  resultTitle: { color: "#fff", fontWeight: "700" },
  resultText: { marginTop: 4, color: "#ddd" },
  warn: { marginTop: 6, color: "#fbbf24" },
  tip: { marginTop: 10, color: "#bbb", lineHeight: 18 },
  center: { flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", padding: 18 },
  title: { fontSize: 18, fontWeight: "800" },
  subtitle: { marginTop: 8, color: "#555", textAlign: "center" },
  primaryBtn: { marginTop: 14, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: "#3b82f6", borderRadius: 12 },
  primaryBtnText: { color: "#fff", fontWeight: "700" }
});


