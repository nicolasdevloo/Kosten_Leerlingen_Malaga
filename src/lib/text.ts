/** Zet de eerste letter in hoofdletter, voor namen zoals "meneer Devloo" aan het begin van een zin. */
export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
