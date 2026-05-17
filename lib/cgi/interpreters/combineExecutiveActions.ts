export function combineExecutiveActions(
  actions: Array<string | undefined | null>
): string {
  const cleaned = actions
    .filter(Boolean)
    .map((action) => action!.trim())
    .filter((action) => action.length > 0)

  const unique = Array.from(new Set(cleaned))

  if (unique.length === 0) {
    return 'Continue governed continuity monitoring.'
  }

  return unique.join(' ')
}