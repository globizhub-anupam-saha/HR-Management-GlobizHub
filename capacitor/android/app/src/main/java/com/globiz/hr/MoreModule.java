package com.globiz.hr;

import java.util.Arrays;
import java.util.List;

public class MoreModule {
    private final String id;
    private final String title;
    private final int iconResId;
    private final Integer tintColor;
    private final List<String> allowedRoles;

    public MoreModule(String id, String title, int iconResId, Integer tintColor, String... allowedRoles) {
        this.id = id;
        this.title = title;
        this.iconResId = iconResId;
        this.tintColor = tintColor;
        this.allowedRoles = Arrays.asList(allowedRoles);
    }

    public String getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public int getIconResId() {
        return iconResId;
    }

    public Integer getTintColor() {
        return tintColor;
    }

    public boolean isAllowedForRole(String role) {
        return isAllowedForRoleAndModules(role, null);
    }

    public boolean isAllowedForRoleAndModules(String roleStr, List<String> sidebarModules) {
        UserRole role = UserRole.fromString(roleStr);

        if (sidebarModules != null && !sidebarModules.isEmpty()) {
            return sidebarModules.contains(id);
        }

        switch (role) {
            case SUPER_ADMIN:
                // Super Admin has unrestricted access to all admin and settings modules
                return true;

            case ADMIN:
                // Admin has full management access, but NOT super_admin system configuration or personal-only items
                if ("settings".equals(id)) return false;
                if ("shifts".equals(id) || "schedules".equals(id) || "payslips".equals(id)) return false;
                for (String allowed : allowedRoles) {
                    if (allowed.equals("ADMIN") || allowed.equals("MANAGER") || allowed.equals("HR_HEAD") || allowed.equals("ALL")) {
                        return true;
                    }
                }
                return false;

            case EMPLOYEE:
            default:
                // Employee only has access to personal employee self-service modules
                return allowedRoles.contains("EMPLOYEE") || allowedRoles.contains("ALL");
        }
    }
}
