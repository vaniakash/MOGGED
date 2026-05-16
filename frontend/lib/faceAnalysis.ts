/**
 * Face Analysis Engine
 * Uses MediaPipe FaceMesh landmark data to derive facial metrics.
 * Results are heuristic / entertainment-only.
 */

export interface FaceScore {
  total: number;          // 0–10
  symmetry: number;
  jawScore: number;
  eyeScore: number;
  harmony: number;
  traits: string[];
  verdict: string;
}

// 468-landmark indices (MediaPipe FaceMesh)
const LANDMARKS = {
  leftEyeInner: 133,
  leftEyeOuter: 33,
  rightEyeInner: 362,
  rightEyeOuter: 263,
  leftEyeTop: 159,
  leftEyeBottom: 145,
  rightEyeTop: 386,
  rightEyeBottom: 374,
  noseTop: 168,
  noseTip: 4,
  leftMouth: 61,
  rightMouth: 291,
  chin: 152,
  leftJaw: 234,
  rightJaw: 454,
  leftTemple: 21,
  rightTemple: 251,
  foreheadCenter: 10,
  leftCheek: 116,
  rightCheek: 345,
};

type Point = { x: number; y: number; z?: number };

function dist(a: Point, b: Point) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function normalize(v: number, min: number, max: number) {
  return clamp((v - min) / (max - min), 0, 1);
}

export function analyzeFace(landmarks: Point[]): FaceScore {
  if (!landmarks || landmarks.length < 468) {
    return { total: 0, symmetry: 0, jawScore: 0, eyeScore: 0, harmony: 0, traits: [], verdict: 'No face detected' };
  }

  const lm = landmarks;

  // ── Symmetry ────────────────────────────────
  const leftEyeX = lm[LANDMARKS.leftEyeInner].x;
  const rightEyeX = lm[LANDMARKS.rightEyeInner].x;
  const midX = (leftEyeX + rightEyeX) / 2;
  const noseTipX = lm[LANDMARKS.noseTip].x;
  const mouthMidX = (lm[LANDMARKS.leftMouth].x + lm[LANDMARKS.rightMouth].x) / 2;
  const symmetryOffset = (Math.abs(noseTipX - midX) + Math.abs(mouthMidX - midX)) / 2;
  const symmetry = clamp(1 - symmetryOffset * 20, 0, 1);

  // ── Eye spacing ─────────────────────────────
  const eyeSpacing = dist(lm[LANDMARKS.leftEyeInner], lm[LANDMARKS.rightEyeInner]);
  const faceWidth = dist(lm[LANDMARKS.leftJaw], lm[LANDMARKS.rightJaw]);
  const eyeRatio = eyeSpacing / faceWidth;
  // Ideal ~0.42–0.50
  const eyeSpacingScore = 1 - Math.abs(eyeRatio - 0.46) * 8;

  // ── Eye tilt (canthal tilt) ─────────────────
  const leftEyeOuterY = lm[LANDMARKS.leftEyeOuter].y;
  const leftEyeInnerY = lm[LANDMARKS.leftEyeInner].y;
  const rightEyeOuterY = lm[LANDMARKS.rightEyeOuter].y;
  const rightEyeInnerY = lm[LANDMARKS.rightEyeInner].y;
  const leftTilt = leftEyeOuterY - leftEyeInnerY;
  const rightTilt = rightEyeInnerY - rightEyeOuterY;
  const avgTilt = (leftTilt + rightTilt) / 2;
  // Positive = hunter eyes (upward outer corners)
  const canthalScore = clamp(0.5 + avgTilt * 40, 0, 1);

  // ── Eye openness ────────────────────────────
  const leftEyeHeight = dist(lm[LANDMARKS.leftEyeTop], lm[LANDMARKS.leftEyeBottom]);
  const rightEyeHeight = dist(lm[LANDMARKS.rightEyeTop], lm[LANDMARKS.rightEyeBottom]);
  const avgEyeHeight = (leftEyeHeight + rightEyeHeight) / 2;
  const eyeWidth = dist(lm[LANDMARKS.leftEyeOuter], lm[LANDMARKS.leftEyeInner]);
  const eyeAspect = avgEyeHeight / (eyeWidth + 0.0001);
  // Ideal 0.28–0.38
  const opennessScore = 1 - Math.abs(eyeAspect - 0.33) * 10;

  const eyeScore = clamp((eyeSpacingScore + canthalScore + opennessScore) / 3, 0, 1);

  // ── Jawline sharpness ───────────────────────
  const faceHeight = dist(lm[LANDMARKS.foreheadCenter], lm[LANDMARKS.chin]);
  const jawWidth = dist(lm[LANDMARKS.leftJaw], lm[LANDMARKS.rightJaw]);
  const jawRatio = jawWidth / (faceHeight + 0.0001);
  // Ideal masculine ~0.75–0.85
  const jawScore = clamp(1 - Math.abs(jawRatio - 0.78) * 5, 0, 1);

  // ── Facial thirds harmony ───────────────────
  const topThird = dist(lm[LANDMARKS.foreheadCenter], lm[LANDMARKS.leftEyeTop]);
  const midThird = dist(lm[LANDMARKS.leftEyeTop], lm[LANDMARKS.noseTip]);
  const bottomThird = dist(lm[LANDMARKS.noseTip], lm[LANDMARKS.chin]);
  const avgThird = (topThird + midThird + bottomThird) / 3;
  const harmonyDev = (Math.abs(topThird - avgThird) + Math.abs(midThird - avgThird) + Math.abs(bottomThird - avgThird)) / (3 * avgThird);
  const harmony = clamp(1 - harmonyDev * 3, 0, 1);

  // ── Weighted total ──────────────────────────
  const rawTotal = (
    symmetry * 0.25 +
    eyeScore * 0.30 +
    jawScore * 0.20 +
    harmony * 0.25
  );

  // Scale to 4.0–9.8 range (feels realistic and fun)
  const total = parseFloat((rawTotal * 5.8 + 4.0).toFixed(1));

  // ── Trait labels ─────────────────────────────
  const traits: string[] = [];

  // Canthal tilt
  if (avgTilt > 0.01) traits.push('🦅 Hunter Eyes');
  else if (avgTilt < -0.01) traits.push('😶 Negative Canthal Tilt');
  else traits.push('👁️ Neutral Tilt');

  // Jaw
  if (jawScore > 0.75) traits.push('💪 Sharp Jawline');
  else if (jawScore > 0.50) traits.push('🔲 Average Jawline');
  else traits.push('🫤 Weak Jawline');

  // Symmetry
  if (symmetry > 0.85) traits.push('✨ High Symmetry');
  else if (symmetry < 0.60) traits.push('🌀 Asymmetric Face');

  // Eye spacing
  if (eyeRatio > 0.50) traits.push('👀 Wide-Set Eyes');
  else if (eyeRatio < 0.42) traits.push('👀 Close-Set Eyes');
  else traits.push('👁️ Ideal Eye Spacing');

  // Score-based extra
  if (total >= 8.5) traits.push('🔥 Gigachad Aura');
  else if (total >= 7.5) traits.push('💅 High Tier');
  else if (total >= 6.5) traits.push('😎 Mid-High');
  else if (total >= 5.5) traits.push('📊 Average');
  else traits.push('💀 NPC Face');

  // Verdict
  let verdict = '';
  if (total >= 8.5) verdict = 'ABSOLUTE UNIT';
  else if (total >= 7.5) verdict = 'CHAD DETECTED';
  else if (total >= 6.5) verdict = 'DECENT';
  else if (total >= 5.5) verdict = 'MID';
  else verdict = 'BRUTALLY MOGGED';

  return { total, symmetry, jawScore, eyeScore, harmony, traits, verdict };
}
