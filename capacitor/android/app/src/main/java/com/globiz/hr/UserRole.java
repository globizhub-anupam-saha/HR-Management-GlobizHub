package com.globiz.hr;

public enum UserRole {
    EMPLOYEE("EMPLOYEE", "Employee"),
    ADMIN("ADMIN", "Admin"),
    SUPER_ADMIN("SUPER_ADMIN", "Super Admin");

    private final String id;
    private final String displayName;

    UserRole(String id, String displayName) {
        this.id = id;
        this.displayName = displayName;
    }

    public String getId() {
        return id;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static UserRole fromString(String role) {
        if (role == null) return EMPLOYEE;
        String upper = role.trim().toUpperCase().replace(" ", "_").replace("-", "_");
        if (upper.equals("SUPER_ADMIN") || upper.equals("SUPERADMIN") || upper.equals("OWNER") || upper.equals("PLATFORM_ADMIN")) {
            return SUPER_ADMIN;
        } else if (upper.equals("ADMIN") || upper.equals("HR_HEAD") || upper.equals("HR_ADMIN") || upper.equals("MANAGER")) {
            return ADMIN;
        }
        return EMPLOYEE;
    }
}
