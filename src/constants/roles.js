// Mirrors the Postgres `user_roles` enum. Reference roles by name only —
// these were previously positional array indices, which meant adding or
// removing a role silently repointed every route guard and permission check.
export const ROLES = Object.freeze({
  ADMIN: "admin",
  COORDINATOR: "coordinator",
  VOLUNTEER: "volunteer",
  PARISHIONER: "parishioner",
});

// Every valid role, for guards that allow all of them.
export const ALL_ROLES = Object.freeze(Object.values(ROLES));
