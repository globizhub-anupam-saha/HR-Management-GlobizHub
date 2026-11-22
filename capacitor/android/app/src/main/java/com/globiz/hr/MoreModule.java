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

        switch (role) {
            case SUPER_ADMIN:
                // Super Admin has master administration modules in More
                return "attendance".equals(id)
                        || "tasks".equals(id)
                        || "manage_schedules".equals(id)
                        || "leave_policies".equals(id)
                        || "documents_admin".equals(id)
                        || "settings".equals(id)
                        || "help".equals(id);

            case ADMIN:
                // Admin has management and operations modules in More
                return "tasks".equals(id)
                        || "manage_schedules".equals(id)
                        || "leave_policies".equals(id)
                        || "payroll".equals(id)
                        || "documents_admin".equals(id)
                        || "help".equals(id);

            case EMPLOYEE:
            default:
                // Employee only has personal self-service modules in More
                return "payslips".equals(id)
                        || "help".equals(id);
        }
    }
}
