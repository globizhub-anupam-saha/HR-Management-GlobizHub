package com.globiz.hr;

import android.content.Context;
import android.content.SharedPreferences;

import com.globiz.hr.network.ApiClient;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class TabManager {

    private static final String PREF_NAME = "TeamHub_Tabs_Config";
    private static final String KEY_TABS_PREFIX = "saved_tabs_role_";

    public static class TabItem implements Serializable {
        private String id;
        private String title;
        private int iconResId;
        private boolean isLocked;
        private boolean isEnabled;

        public TabItem(String id, String title, int iconResId, boolean isLocked, boolean isEnabled) {
            this.id = id;
            this.title = title;
            this.iconResId = iconResId;
            this.isLocked = isLocked;
            this.isEnabled = isEnabled;
        }

        public String getId() { return id; }
        public String getTitle() { return title; }
        public int getIconResId() { return iconResId; }
        public boolean isLocked() { return isLocked; }
        public boolean isEnabled() { return isEnabled; }
        public void setEnabled(boolean enabled) { this.isEnabled = enabled; }

        public JSONObject toJson() {
            try {
                JSONObject obj = new JSONObject();
                obj.put("id", id);
                obj.put("title", title);
                obj.put("iconResId", iconResId);
                obj.put("isLocked", isLocked);
                obj.put("isEnabled", isEnabled);
                return obj;
            } catch (Exception e) {
                return new JSONObject();
            }
        }

        public static TabItem fromJson(JSONObject obj) {
            return new TabItem(
                    obj.optString("id", ""),
                    obj.optString("title", ""),
                    obj.optInt("iconResId", R.drawable.ic_nav_home),
                    obj.optBoolean("isLocked", false),
                    obj.optBoolean("isEnabled", true)
            );
        }
    }

    public static List<TabItem> getDefaultTabsForRole(UserRole role) {
        List<TabItem> list = new ArrayList<>();
        // Home is ALWAYS locked at index 0 for all roles
        list.add(new TabItem("home", "Home", R.drawable.ic_nav_home, true, true));

        switch (role) {
            case SUPER_ADMIN:
                list.add(new TabItem("employees", "Employees", R.drawable.ic_users_group, false, true));
                list.add(new TabItem("approvals", "Approvals", R.drawable.ic_check_circle, false, true));
                list.add(new TabItem("payroll", "Payroll", R.drawable.ic_trend_up, false, true));
                list.add(new TabItem("attendance", "Attendance", R.drawable.ic_attendance, false, false));
                list.add(new TabItem("tasks", "Tasks", R.drawable.ic_mod_tasks, false, false));
                list.add(new TabItem("manage_schedules", "Manage Schedules", R.drawable.ic_calendar_edit, false, false));
                list.add(new TabItem("leave_policies", "Leave Policies", R.drawable.ic_customize_switch, false, false));
                list.add(new TabItem("documents_admin", "Documents (Admin)", R.drawable.ic_mod_files, false, false));
                list.add(new TabItem("settings", "Settings", R.drawable.ic_settings_gear, false, false));
                break;

            case ADMIN:
                list.add(new TabItem("attendance", "Attendance", R.drawable.ic_attendance, false, true));
                list.add(new TabItem("approvals", "Approvals", R.drawable.ic_check_circle, false, true));
                list.add(new TabItem("employees", "Employees", R.drawable.ic_users_group, false, true));
                list.add(new TabItem("tasks", "Tasks", R.drawable.ic_mod_tasks, false, false));
                list.add(new TabItem("manage_schedules", "Manage Schedules", R.drawable.ic_calendar_edit, false, false));
                list.add(new TabItem("leave_policies", "Leave Policies", R.drawable.ic_customize_switch, false, false));
                list.add(new TabItem("payroll", "Payroll", R.drawable.ic_trend_up, false, false));
                list.add(new TabItem("documents_admin", "Documents (Admin)", R.drawable.ic_mod_files, false, false));
                break;

            case EMPLOYEE:
            default:
                list.add(new TabItem("attendance", "Attendance", R.drawable.ic_attendance, false, true));
                list.add(new TabItem("leave", "Leave", R.drawable.ic_nav_leave, false, true));
                list.add(new TabItem("tasks", "Tasks", R.drawable.ic_mod_tasks, false, true));
                list.add(new TabItem("schedules", "Schedules", R.drawable.ic_calendar, false, false));
                list.add(new TabItem("shifts", "Shifts", R.drawable.ic_mod_time, false, false));
                list.add(new TabItem("payslips", "My Payslips", R.drawable.ic_chart_bar, false, false));
                list.add(new TabItem("documents", "Documents", R.drawable.ic_mod_files, false, false));
                break;
        }
        return list;
    }

    public static List<TabItem> getTabs(Context context) {
        String roleStr = ApiClient.getInstance(context).getRole();
        UserRole role = UserRole.fromString(roleStr);
        return getTabs(context, role);
    }

    public static List<TabItem> getTabs(Context context, UserRole role) {
        SharedPreferences prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        String prefKey = KEY_TABS_PREFIX + role.name().toLowerCase(Locale.ROOT);
        String jsonStr = prefs.getString(prefKey, null);

        List<TabItem> defaults = getDefaultTabsForRole(role);
        if (jsonStr == null || jsonStr.trim().isEmpty()) {
            return defaults;
        }

        try {
            JSONArray arr = new JSONArray(jsonStr);
            List<TabItem> tabs = new ArrayList<>();
            List<String> seenIds = new ArrayList<>();

            for (int i = 0; i < arr.length(); i++) {
                JSONObject obj = arr.getJSONObject(i);
                TabItem item = TabItem.fromJson(obj);
                // Ensure index 0 / home is always locked and enabled
                if ("home".equalsIgnoreCase(item.getId())) {
                    item = new TabItem("home", "Home", R.drawable.ic_nav_home, true, true);
                } else {
                    int icon = getIconForId(item.getId(), defaults);
                    item = new TabItem(item.getId(), item.getTitle(), icon, false, item.isEnabled());
                }
                tabs.add(item);
                seenIds.add(item.getId().toLowerCase(Locale.ROOT));
            }

            // Ensure Home is at index 0
            int homeIdx = -1;
            for (int i = 0; i < tabs.size(); i++) {
                if ("home".equalsIgnoreCase(tabs.get(i).getId())) {
                    homeIdx = i;
                    break;
                }
            }
            if (homeIdx > 0) {
                TabItem homeItem = tabs.remove(homeIdx);
                tabs.add(0, homeItem);
            } else if (homeIdx == -1) {
                tabs.add(0, new TabItem("home", "Home", R.drawable.ic_nav_home, true, true));
            }

            // Add any role-permitted items that might be missing
            for (TabItem d : defaults) {
                if (!seenIds.contains(d.getId().toLowerCase(Locale.ROOT))) {
                    tabs.add(d);
                }
            }
            return tabs;
        } catch (Exception e) {
            return defaults;
        }
    }

    private static int getIconForId(String id, List<TabItem> defaults) {
        for (TabItem d : defaults) {
            if (d.getId().equalsIgnoreCase(id)) {
                return d.getIconResId();
            }
        }
        return R.drawable.ic_nav_more;
    }

    public static void saveTabs(Context context, List<TabItem> tabs) {
        String roleStr = ApiClient.getInstance(context).getRole();
        UserRole role = UserRole.fromString(roleStr);
        saveTabs(context, role, tabs);
    }

    public static void saveTabs(Context context, UserRole role, List<TabItem> tabs) {
        JSONArray arr = new JSONArray();
        for (TabItem item : tabs) {
            arr.put(item.toJson());
        }

        SharedPreferences prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        String prefKey = KEY_TABS_PREFIX + role.name().toLowerCase(Locale.ROOT);
        prefs.edit().putString(prefKey, arr.toString()).apply();
    }

    public static List<BottomNavHelper.NavItem> getActiveBottomNavTabs(Context context) {
        String roleStr = ApiClient.getInstance(context).getRole();
        UserRole role = UserRole.fromString(roleStr);
        List<TabItem> tabs = getTabs(context, role);

        List<BottomNavHelper.NavItem> navItems = new ArrayList<>();
        // Tab 1 is always Home (Locked)
        navItems.add(new BottomNavHelper.NavItem("home", "Home", R.drawable.ic_nav_home));

        // Up to 3 enabled modules
        int count = 0;
        for (TabItem item : tabs) {
            if ("home".equalsIgnoreCase(item.getId())) continue;
            if (item.isEnabled() && count < 3) {
                navItems.add(new BottomNavHelper.NavItem(item.getId(), item.getTitle(), item.getIconResId()));
                count++;
            }
        }

        // Tab 5 is always More
        navItems.add(new BottomNavHelper.NavItem("more", "More", R.drawable.ic_nav_more));
        return navItems;
    }
}
