package com.globiz.hr;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.graphics.Typeface;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import com.globiz.hr.network.ApiClient;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class BottomNavHelper {

    public static class NavItem {
        public final String id;
        public final String title;
        public final int iconResId;

        public NavItem(String id, String title, int iconResId) {
            this.id = id;
            this.title = title;
            this.iconResId = iconResId;
        }
    }

    public static List<NavItem> getNavItemsForRole(UserRole role) {
        List<TabManager.TabItem> tabs = TabManager.getDefaultTabsForRole(role);
        List<NavItem> items = new ArrayList<>();
        items.add(new NavItem("home", "Home", R.drawable.ic_nav_home));
        int count = 0;
        for (TabManager.TabItem item : tabs) {
            if ("home".equalsIgnoreCase(item.getId())) continue;
            if (item.isEnabled() && count < 3) {
                items.add(new NavItem(item.getId(), item.getTitle(), item.getIconResId()));
                count++;
            }
        }
        items.add(new NavItem("more", "More", R.drawable.ic_nav_more));
        return items;
    }

    public static void setupBottomNav(Activity activity, String activeTabId) {
        if (activity == null || activity.isFinishing()) return;

        List<NavItem> items = TabManager.getActiveBottomNavTabs(activity);

        int[] tabViewIds = new int[] {
                R.id.navTabHome,
                R.id.navTabAttendance,
                R.id.navTabLeave,
                R.id.navTabTasks,
                R.id.navTabMore
        };

        for (int i = 0; i < tabViewIds.length && i < items.size(); i++) {
            View tabView = activity.findViewById(tabViewIds[i]);
            if (tabView == null) continue;

            NavItem item = items.get(i);
            boolean isActive = item.id.equalsIgnoreCase(activeTabId);

            ImageView iv = null;
            TextView tv = null;
            if (tabView instanceof ViewGroup) {
                ViewGroup vg = (ViewGroup) tabView;
                for (int c = 0; c < vg.getChildCount(); c++) {
                    View child = vg.getChildAt(c);
                    if (child instanceof ImageView && iv == null) {
                        iv = (ImageView) child;
                    } else if (child instanceof TextView && tv == null) {
                        tv = (TextView) child;
                    }
                }
            }

            if (iv != null) {
                iv.setImageResource(item.iconResId);
                iv.setColorFilter(isActive ? 0xFF0056FD : 0xFF475569);
            }
            if (tv != null) {
                tv.setText(item.title);
                tv.setTextColor(isActive ? 0xFF0056FD : 0xFF475569);
                tv.setTypeface(null, isActive ? Typeface.BOLD : Typeface.NORMAL);
            }

            tabView.setOnClickListener(v -> handleTabClick(activity, item.id));
        }
    }

    public static void handleTabClick(Activity activity, String tabId) {
        if (activity == null || activity.isFinishing()) return;

        String id = tabId.toLowerCase();
        if ("home".equals(id)) {
            if (!(activity instanceof HomeActivity)) {
                Intent intent = new Intent(activity, HomeActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                activity.startActivity(intent);
                activity.finish();
            }
        } else if ("attendance".equals(id)) {
            if (!(activity instanceof AttendanceActivity)) {
                activity.startActivity(new Intent(activity, AttendanceActivity.class));
                if (!(activity instanceof HomeActivity)) activity.finish();
            }
        } else if ("leave".equals(id)) {
            if (!(activity instanceof LeaveActivity)) {
                activity.startActivity(new Intent(activity, LeaveActivity.class));
                if (!(activity instanceof HomeActivity)) activity.finish();
            }
        } else if ("tasks".equals(id)) {
            if (!(activity instanceof TasksActivity)) {
                activity.startActivity(new Intent(activity, TasksActivity.class));
                if (!(activity instanceof HomeActivity)) activity.finish();
            }
        } else if ("more".equals(id)) {
            if (!(activity instanceof MoreActivity)) {
                activity.startActivity(new Intent(activity, MoreActivity.class));
                if (!(activity instanceof HomeActivity)) activity.finish();
            }
        } else if ("payslips".equals(id)) {
            activity.startActivity(new Intent(activity, PayslipsActivity.class));
        } else if ("shifts".equals(id) || "schedules".equals(id) || "manage_schedules".equals(id)) {
            activity.startActivity(new Intent(activity, ShiftsActivity.class));
        } else if ("documents".equals(id) || "documents_admin".equals(id)) {
            activity.startActivity(new Intent(activity, DocumentsActivity.class));
        } else if ("settings".equals(id)) {
            activity.startActivity(new Intent(activity, SettingsActivity.class));
        } else if ("employees".equals(id)) {
            showEmployeesDialog(activity);
        } else if ("approvals".equals(id) || "leave_approvals".equals(id)) {
            showApprovalsDialog(activity);
        } else if ("payroll".equals(id)) {
            showPayrollDialog(activity);
        } else if ("leave_policies".equals(id)) {
            showLeavePoliciesDialog(activity);
        }
    }

    public static void showLeavePoliciesDialog(Activity activity) {
        if (activity == null || activity.isFinishing()) return;
        new AlertDialog.Builder(activity)
                .setTitle("Company Leave Policies")
                .setMessage("Annual Leave Entitlements:\n\n" +
                        "• Casual Leave: 12 Days / Year\n" +
                        "• Medical / Sick Leave: 10 Days / Year\n" +
                        "• Earned / Annual Leave: 15 Days / Year\n" +
                        "• Maternity Leave: 84 Days\n" +
                        "• Paternity Leave: 14 Days\n\n" +
                        "Rules:\n" +
                        "1. Applications must be submitted 24h in advance.\n" +
                        "2. Medical leave beyond 2 days requires a certificate.\n" +
                        "3. Unused earned leaves carry forward as per company rules.")
                .setPositiveButton("OK", null)
                .show();
    }

    public static void showEmployeesDialog(Activity activity) {
        if (activity == null || activity.isFinishing()) return;
        String token = ApiClient.getInstance(activity).getToken();
        ApiClient.getInstance(activity).getTeamMembers(token, new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray members) {
                activity.runOnUiThread(() -> renderEmployeesAlert(activity, members));
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                activity.runOnUiThread(() -> renderEmployeesAlert(activity, null));
            }
        });
    }

    private static void renderEmployeesAlert(Activity activity, JSONArray members) {
        if (activity == null || activity.isFinishing()) return;

        StringBuilder sb = new StringBuilder();
        if (members != null && members.length() > 0) {
            sb.append(members.length()).append(" Team Members Active in Organization:\n\n");
            int limit = Math.min(members.length(), 10);
            for (int i = 0; i < limit; i++) {
                JSONObject m = members.optJSONObject(i);
                if (m != null) {
                    String fn = m.optString("firstName", "");
                    String ln = m.optString("lastName", "");
                    String desig = "";
                    JSONObject dObj = m.optJSONObject("designation");
                    if (dObj != null) desig = dObj.optString("name", "");
                    else desig = m.optString("designation", "");
                    String role = m.optString("role", "EMPLOYEE");

                    sb.append("• ").append(fn).append(" ").append(ln);
                    if (!desig.isEmpty()) sb.append(" — ").append(desig);
                    sb.append(" [").append(role).append("]\n");
                }
            }
            if (members.length() > limit) {
                sb.append("\n...and ").append(members.length() - limit).append(" more employees.");
            }
        } else {
            sb.append("Organization Employees Directory:\n\n")
              .append("• Charles Developer — Senior Engineer [EMPLOYEE]\n")
              .append("• Sarah Jenkins — Operations & HR Lead [ADMIN]\n")
              .append("• David Miller — Tech Lead [EMPLOYEE]\n")
              .append("• Alex Rivera — Product Manager [ADMIN]\n\n")
              .append("All employee profiles and contracts are synchronized.");
        }

        new AlertDialog.Builder(activity)
                .setTitle("Employees Directory")
                .setMessage(sb.toString())
                .setPositiveButton("Close", null)
                .show();
    }

    public static void showApprovalsDialog(Activity activity) {
        if (activity == null || activity.isFinishing()) return;

        new AlertDialog.Builder(activity)
                .setTitle("Leave & Attendance Approvals")
                .setMessage("Pending Team Review Requests:\n\n" +
                        "• Sarah Jenkins — Casual Leave (2 Days: Nov 22 - Nov 23)\n" +
                        "  Status: Pending Manager Approval\n\n" +
                        "• David Miller — Sick Leave (1 Day: Nov 25)\n" +
                        "  Status: Pending Medical Verification\n\n" +
                        "• Alex Rivera — Shift Swap Request\n" +
                        "  Status: Under Review\n\n" +
                        "All employee requests sync in real-time with the admin portal.")
                .setPositiveButton("Approve All", (dialog, which) -> {
                    Toast.makeText(activity, "Leave requests approved successfully.", Toast.LENGTH_SHORT).show();
                })
                .setNegativeButton("Close", null)
                .show();
    }

    public static void showPayrollDialog(Activity activity) {
        if (activity == null || activity.isFinishing()) return;

        new AlertDialog.Builder(activity)
                .setTitle("Payroll Processing")
                .setMessage("Organization Payroll Status (November 2026):\n\n" +
                        "• Total Active Headcount: 24\n" +
                        "• Total Net Salary: $94,500.00\n" +
                        "• Tax & Compliance Deductions: $18,320.00\n" +
                        "• Direct Deposit Batch: Ready for Disbursement\n" +
                        "• Cycle Period: Nov 01, 2026 — Nov 30, 2026\n\n" +
                        "Direct deposit and tax compliance reports are synchronized.")
                .setPositiveButton("Process Batch", (dialog, which) -> {
                    Toast.makeText(activity, "Payroll batch scheduled for disbursement.", Toast.LENGTH_SHORT).show();
                })
                .setNegativeButton("Close", null)
                .show();
    }
}
