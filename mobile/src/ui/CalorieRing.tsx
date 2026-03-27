import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { theme } from "./theme";

type Props = {
  size: number;
  strokeWidth: number;
  eaten: number;
  goal: number;
  children?: React.ReactNode;
};

export function CalorieRing({
  size,
  strokeWidth,
  eaten,
  goal,
  children,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  const ratio = goal > 0 ? eaten / goal : 0;
  const isOver = ratio > 1;

  // Green arc fills up to 100%
  const greenProgress = Math.min(Math.max(ratio, 0), 1);
  const greenOffset = circumference * (1 - greenProgress);

  // Red overflow arc: maps how far over you are onto the ring
  // At 2x the goal the red ring is completely full
  const overAmount = isOver ? (eaten - goal) / goal : 0;
  const redProgress = Math.min(overAmount, 1);
  const redOffset = circumference * (1 - redProgress);

  // Icon / center text color follows the ring state
  const accentColor = isOver ? "#EF4444" : "#16A34A";

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="calGreenGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#86EFAC" />
            <Stop offset="0.5" stopColor="#4ADE80" />
            <Stop offset="1" stopColor="#16A34A" />
          </LinearGradient>
          <LinearGradient id="calRedGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FCA5A5" />
            <Stop offset="1" stopColor="#EF4444" />
          </LinearGradient>
        </Defs>

        {/* Background track */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={theme.colors.progressTrack}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Green progress arc */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="url(#calGreenGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={greenOffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${cx}, ${cy}`}
        />

        {/* Red overflow arc — draws on top of the green */}
        {isOver && (
          <Circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke="url(#calRedGrad)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={redOffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${cx}, ${cy}`}
            opacity={0.88}
          />
        )}
      </Svg>

      {children ? (
        <View style={styles.childOverlay}>
          {typeof children === "function"
            ? (children as (color: string) => React.ReactNode)(accentColor)
            : children}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  childOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
