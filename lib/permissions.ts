export const PERMISSIONS = {
  MANAGE_EMPLOYEES: "manage_employees",
  MANAGE_SALARIES: "manage_salaries",
  MANAGE_WARNINGS: "manage_warnings",
  MANAGE_ABSENCES: "manage_absences",
  MANAGE_BONUSES: "manage_bonuses",
  MANAGE_INVITATIONS: "manage_invitations",
  MANAGE_ROLES: "manage_roles",
  MANAGE_PRICING: "manage_pricing",
  VIEW_EMPLOYEES: "view_employees",
  VIEW_FINANCIALS: "view_financials",
  OWNER: "owner",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export function hasPermission(
  memberPermissions: string[],
  permission: Permission
): boolean {
  return (
    memberPermissions.includes(PERMISSIONS.OWNER) ||
    memberPermissions.includes(permission)
  );
}

export const PERMISSION_LABELS: Record<Permission, string> = {
  manage_employees: "Gérer les employés",
  manage_salaries: "Gérer les salaires",
  manage_warnings: "Gérer les avertissements",
  manage_absences: "Gérer les absences",
  manage_bonuses: "Gérer les primes",
  manage_invitations: "Gérer les invitations",
  manage_roles: "Gérer les rôles",
  manage_pricing: "Gérer les prix",
  view_employees: "Voir les employés",
  view_financials: "Voir les finances",
  owner: "Propriétaire (accès total)",
};
