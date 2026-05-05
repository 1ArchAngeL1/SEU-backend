import { BadRequestException } from '@nestjs/common';

export interface PolygonPoint {
  x: number;
  y: number;
}

/**
 * Parses a raw pixel coordinate string like "719,359,719,559,2911,593,2911,414"
 * and converts to percentage-based polygon points relative to image dimensions.
 */
export function parseRawPolygon(
  raw: string,
  imageWidth: number,
  imageHeight: number,
): PolygonPoint[] {
  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map(Number);

  if (parts.length < 6 || parts.length % 2 !== 0) {
    throw new BadRequestException(
      'rawPolygon must contain an even number of values (at least 3 x,y pairs)',
    );
  }

  if (parts.some((n) => isNaN(n))) {
    throw new BadRequestException('rawPolygon contains non-numeric values');
  }

  const points: PolygonPoint[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    points.push({
      x: Math.round(((parts[i] / imageWidth) * 100 + Number.EPSILON) * 100) / 100,
      y: Math.round(((parts[i + 1] / imageHeight) * 100 + Number.EPSILON) * 100) / 100,
    });
  }

  return points;
}
