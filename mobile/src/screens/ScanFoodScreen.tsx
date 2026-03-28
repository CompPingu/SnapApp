import React from "react";
import {
  Alert,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { scanFoodImage } from "../api/client";
import { Screen } from "../ui/Screen";
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
        skipProcessing: false,
      });
      if (!photo?.uri) throw new Error("No photo captured");

      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1280 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      const result = await scanFoodImage({
        uri: manipulated.uri,
        name: "scan.jpg",
        type: "image/jpeg",
      });

      setLastResult(result);
      Alert.alert(
        "Saved",
        `Logged: ${result.meal?.name || "meal"}\n${result.meal?.calories || 0} cal`
      );
    } catch (e: any) {
      Alert.alert("Scan failed", e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }, []);

  if (!permission) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </Screen>
    );
  }

  if (!permission.granted) {
    return (
      <Screen style={styles.center}>
        <Ionicons
          name="camera-outline"
          size={48}
          color={theme.colors.textMuted}
          style={{ marginBottom: 12 }}
        />
        <Text style={styles.permTitle}>Camera permission needed</Text>
        <Text style={styles.permSubtitle}>
          Grant permission to scan food using your camera.
        </Text>
        <PrimaryButton
          title="Grant permission"
          onPress={() => requestPermission()}
          style={styles.primaryBtn}
        />
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

      <LinearGradient
        colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0)"]}
        style={styles.topFade}
      />
      <LinearGradient
        colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"]}
        style={styles.bottomFade}
      />

      {/* Viewfinder brackets */}
      <View style={styles.viewfinder}>
        <View style={[styles.corner, styles.tl]} />
        <View style={[styles.corner, styles.tr]} />
        <View style={[styles.corner, styles.bl]} />
        <View style={[styles.corner, styles.br]} />
      </View>

      <View style={styles.bottomPanel}>
        <Pressable
          disabled={busy}
          onPress={takeAndUpload}
          style={[styles.captureCircle, busy && styles.captureDisabled]}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="camera" size={28} color="#fff" />
          )}
        </Pressable>
        <Text style={styles.captureText}>
          {busy ? "Analyzing..." : "Scan Food"}
        </Text>

        {lastResult?.meal ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultName}>{lastResult.meal.name}</Text>
            <Text style={styles.resultMacros}>
              {lastResult.meal.calories} cal · {lastResult.meal.protein}g P ·{" "}
              {lastResult.meal.carbs || 0}g C · {lastResult.meal.fat || 0}g F
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const CORNER_SIZE = 28;
const CORNER_THICKNESS = 3;
const CORNER_RADIUS = 12;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  cameraPlaceholder: { flex: 1, backgroundColor: "#000" },
  topFade: { position: "absolute", left: 0, right: 0, top: 0, height: 140 },
  bottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 240,
  },

  viewfinder: {
    position: "absolute",
    top: "25%",
    left: "15%",
    right: "15%",
    bottom: "35%",
  },
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  },
  tl: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderColor: "rgba(255,255,255,0.7)",
    borderTopLeftRadius: CORNER_RADIUS,
  },
  tr: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderColor: "rgba(255,255,255,0.7)",
    borderTopRightRadius: CORNER_RADIUS,
  },
  bl: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderColor: "rgba(255,255,255,0.7)",
    borderBottomLeftRadius: CORNER_RADIUS,
  },
  br: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderColor: "rgba(255,255,255,0.7)",
    borderBottomRightRadius: CORNER_RADIUS,
  },

  bottomPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
    alignItems: "center",
  },
  captureCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  captureDisabled: { opacity: 0.6 },
  captureText: {
    marginTop: 10,
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  resultCard: {
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: theme.radius.md,
    padding: 14,
    width: "100%",
    alignItems: "center",
  },
  resultName: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
  resultMacros: {
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
    fontSize: 13,
    marginTop: 4,
  },

  center: { alignItems: "center", justifyContent: "center", padding: 24 },
  permTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.text,
  },
  permSubtitle: {
    marginTop: 8,
    color: theme.colors.textSecondary,
    textAlign: "center",
    fontWeight: "600",
  },
  primaryBtn: { marginTop: 16, width: "100%" },
});
