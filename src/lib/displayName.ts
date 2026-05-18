/**
 * Shared display-name (gebruikersnaam) validation. Used at signup AND when
 * the user renames themselves via /profiel/instellingen so the rules can't
 * drift between the two entry points.
 *
 * The DB enforces a length check (1..24) but does NOT enforce the charset
 * — keep this util as the single source of truth for the charset rule.
 */
export const DISPLAY_NAME_MIN = 3;
export const DISPLAY_NAME_MAX = 24;
const DISPLAY_NAME_RE = /^[a-zA-Z0-9_-]+$/;

export function validateDisplayName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < DISPLAY_NAME_MIN)
    return `Gebruikersnaam moet minimaal ${DISPLAY_NAME_MIN} tekens zijn.`;
  if (trimmed.length > DISPLAY_NAME_MAX)
    return `Gebruikersnaam mag maximaal ${DISPLAY_NAME_MAX} tekens zijn.`;
  // Check space first — most common mistake, deserves a dedicated message
  if (/\s/.test(trimmed))
    return "Gebruikersnaam mag geen spaties bevatten.";
  if (!DISPLAY_NAME_RE.test(trimmed))
    return "Gebruikersnaam mag alleen letters, cijfers, _ en - bevatten.";
  return null;
}
