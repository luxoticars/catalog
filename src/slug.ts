/**
 * Case- and punctuation-insensitive identity for makes and models, so
 * "HONDA"/"Honda" and "Supra"/"SUPRA" are one option. KV keys use the slug of
 * the make; the display spelling stays in the data.
 */
export function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
