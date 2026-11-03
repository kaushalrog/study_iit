import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { describeTrend, TrendPoint } from '../features/progress/trend';
import { AppText, space, useTheme } from './design-system';

const W = 320, H = 150, L = 34, R = 10, T = 10, B = 22;

/** Percent-of-marks line chart. With fewer than two points it shows text only, never an invented line. */
export function TrendChart({ points, noun, color }: { points: TrendPoint[]; noun: string; color?: string }) {
  const { colors } = useTheme();
  const stroke = color ?? colors.accentStrong;
  const summary = describeTrend(points, noun);
  const x = (i: number) => L + (points.length === 1 ? (W - L - R) / 2 : (i * (W - L - R)) / (points.length - 1));
  const y = (p: number) => T + ((100 - p) / 100) * (H - T - B);
  return (
    <View style={{ gap: space.xs }}>
      {points.length >= 2 && (
        <View accessible accessibilityRole="image" accessibilityLabel={summary}>
          <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
            {[0, 50, 100].map((g) => (
              <React.Fragment key={g}>
                <Line x1={L} x2={W - R} y1={y(g)} y2={y(g)} stroke={colors.border} strokeWidth={1} />
                <SvgText x={L - 6} y={y(g) + 4} fontSize={10} fill={colors.textMuted} textAnchor="end">{g}%</SvgText>
              </React.Fragment>
            ))}
            <Polyline points={points.map((p, i) => `${x(i)},${y(p.pct)}`).join(' ')} fill="none" stroke={stroke} strokeWidth={2.5} strokeLinejoin="round" />
            {points.map((p, i) => <Circle key={p.at + p.label} cx={x(i)} cy={y(p.pct)} r={4} fill={colors.surface} stroke={stroke} strokeWidth={2} />)}
          </Svg>
        </View>
      )}
      <AppText variant="caption">{summary}</AppText>
    </View>
  );
}
