package com.globiz.hr;

import java.util.Arrays;
import java.util.List;

public class MoreModule {
    private final String id;
    private final String title;
    private final int iconResId;
    private final Integer tintColor;
    private final List<String> allowedRoles;
    private final String section;

    public MoreModule(String id, String title, int iconResId, Integer tintColor, String section, String... allowedRoles) {
        this.id = id;
        this.title = title;
        this.iconResId = iconResId;
        this.tintColor = tintColor;
        this.section = section != null ? section : "";
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

    public String getSection() {
        return section;
    }

    public boolean isAllowedForRole(String role) {
        return isAllowedForRoleAndModules(role, null);
    }

    public boolean isAllowedForRoleAndModules(String roleStr, List<String> sidebarModules) {
        return true;
    }
}
