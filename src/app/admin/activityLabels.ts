/**
 * Human-readable Dutch labels for audit-log actions and point-event kinds.
 * Shared by the profile view and the dashboard activity feed so the wording
 * stays consistent in one place.
 */

export const POINT_EVENT_LABELS: Record<string, string> = {
  vote_cast: "Stem uitgebracht",
  upvote_received: "Upvote ontvangen",
  spot_published: "Plekje gepubliceerd",
  photo_added: "Foto toegevoegd",
};

export function pointEventLabel(kind: string): string {
  return POINT_EVENT_LABELS[kind] ?? kind.replace(/_/g, " ");
}

/**
 * Turn an audit row into a short Dutch sentence. `actor` is the admin's name,
 * `target` an optional human label for the affected user/location.
 */
export function describeAuditAction(
  action: string,
  actor: string,
  target?: string | null
): string {
  const t = target ? ` "${target}"` : "";
  switch (action) {
    case "approve_location":
      return `${actor} keurde plekje${t} goed`;
    case "reject_location":
      return `${actor} wees plekje${t} af`;
    case "edit_location":
      return `${actor} bewerkte plekje${t}`;
    case "delete_location":
      return `${actor} verwijderde plekje${t}`;
    case "ban_user":
      return `${actor} verbande${t || " een gebruiker"}`;
    case "unban_user":
      return `${actor} debande${t || " een gebruiker"}`;
    case "change_user_role":
      return `${actor} wijzigde de rol van${t || " een gebruiker"}`;
    case "hide_location_tag":
      return `${actor} verborg een tag op plekje${t}`;
    case "unhide_location_tag":
      return `${actor} maakte een tag weer zichtbaar op plekje${t}`;
    default:
      return `${actor}: ${action.replace(/_/g, " ")}${t}`;
  }
}

/** Which admin detail view an audit row links to, if any. */
export function auditTargetHref(
  targetType: string,
  targetId: string | null
): string | null {
  if (!targetId) return null;
  if (targetType === "user") return `/admin/community/${targetId}`;
  if (targetType === "location") return `/admin/locaties/${targetId}`;
  return null;
}
