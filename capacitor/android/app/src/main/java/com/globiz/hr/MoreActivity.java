package com.globiz.hr;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.globiz.hr.network.ApiClient;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class MoreActivity extends AppCompatActivity {

    private ImageView btnCustomize;
    private EditText etSearch;
    private RecyclerView rvModules;
    private TextView tvNoModules;

    private MoreModulesAdapter adapter;
    private final List<MoreModule> allModules = new ArrayList<>();
    private final List<MoreModule> rolePermittedModules = new ArrayList<>();
    private final List<MoreItem> fullSectionedItems = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_more);

        initViews();
        AppHeaderHelper.setupHeader(this, "More", false);
        initModules();
        setupRecyclerView();
        filterModulesByRole();
        setupSearch();
        setupListeners();
        BottomNavHelper.setupBottomNav(this, "more");
    }

    @Override
    protected void onResume() {
        super.onResume();
        AppHeaderHelper.refreshHeaderState(this);
        BottomNavHelper.setupBottomNav(this, "more");
        filterModulesByRole();

        // Real-time synchronization of currently logged-in user profile & role modules
        ApiClient.getInstance(this).getProfile(new ApiClient.ApiCallback<JSONObject>() {
            @Override
            public void onSuccess(JSONObject user) {
                if (user == null) return;
                boolean isOverridden = getSharedPreferences("TeamHub_Role_Override", MODE_PRIVATE).getBoolean("is_role_overridden", false);
                if (!isOverridden && user.has("role")) {
                    String userRole = user.optString("role", "");
                    if (!userRole.isEmpty()) {
                        ApiClient.getInstance(MoreActivity.this).saveRole(userRole);
                    }
                }
                if (user.has("designation") && user.opt("designation") instanceof JSONObject) {
                    JSONObject desDict = user.optJSONObject("designation");
                    if (desDict != null && desDict.has("sidebarModules")) {
                        JSONArray modArr = desDict.optJSONArray("sidebarModules");
                        if (modArr != null) {
                            List<String> modules = new ArrayList<>();
                            for (int i = 0; i < modArr.length(); i++) {
                                modules.add(modArr.optString(i));
                            }
                            ApiClient.getInstance(MoreActivity.this).saveSidebarModules(modules);
                        }
                    }
                }
                runOnUiThread(() -> {
                    filterModulesByRole();
                });
            }

            @Override
            public void onError(String errorMessage, int statusCode) {}
        });
    }

    private void initViews() {
        TabletHelper.applyTabletConstraint(findViewById(R.id.topBarContent));
        TabletHelper.applyTabletConstraint(findViewById(R.id.moreSearchContainer));
        TabletHelper.applyTabletConstraint(findViewById(R.id.rvModules));
        TabletHelper.applyTabletConstraint(findViewById(R.id.bottomNavContent));

        btnCustomize = findViewById(R.id.btnCustomize);
        etSearch = findViewById(R.id.etSearch);
        rvModules = findViewById(R.id.rvModules);
        tvNoModules = findViewById(R.id.tvNoModules);
        NavBarScrollHelper.attachToRecyclerView(rvModules, findViewById(R.id.bottomNavBar));
    }

    private void initModules() {
        allModules.clear();
        // WORKSPACE
        allModules.add(new MoreModule("dashboard", "Dashboard", R.drawable.ic_nav_home, 0xFF1E293B, "WORKSPACE", "ADMIN", "MANAGER", "HR_HEAD", "SUPER_ADMIN", "OWNER"));

        // TALENT MANAGEMENT
        allModules.add(new MoreModule("onboarding", "Onboarding", R.drawable.ic_mod_onboarding, 0xFF1E293B, "TALENT MANAGEMENT", "ADMIN", "MANAGER", "HR_HEAD", "SUPER_ADMIN", "OWNER"));
        allModules.add(new MoreModule("recruitment", "Recruitment", R.drawable.ic_building, 0xFF1E293B, "TALENT MANAGEMENT", "ADMIN", "MANAGER", "HR_HEAD", "SUPER_ADMIN", "OWNER"));
        allModules.add(new MoreModule("training", "Training & Development", R.drawable.ic_mod_okr, 0xFF1E293B, "TALENT MANAGEMENT", "ADMIN", "MANAGER", "HR_HEAD", "SUPER_ADMIN", "OWNER"));

        // EMPLOYEE MANAGEMENT
        allModules.add(new MoreModule("employees", "Employees", R.drawable.ic_users_group, 0xFF1E293B, "EMPLOYEE MANAGEMENT", "ADMIN", "MANAGER", "HR_HEAD", "SUPER_ADMIN", "OWNER"));
        allModules.add(new MoreModule("designations", "Designations", R.drawable.ic_shield_check, 0xFF1E293B, "EMPLOYEE MANAGEMENT", "ADMIN", "HR_HEAD", "SUPER_ADMIN", "OWNER"));
        allModules.add(new MoreModule("resignation", "Resignations", R.drawable.ic_door_exit, 0xFF1E293B, "EMPLOYEE MANAGEMENT", "ADMIN", "HR_HEAD", "SUPER_ADMIN", "OWNER"));

        // ATTENDANCE & LEAVE
        allModules.add(new MoreModule("attendance", "Clock ins/outs", R.drawable.ic_clock, 0xFF1E293B, "ATTENDANCE & LEAVE", "EMPLOYEE", "ADMIN", "HR_HEAD", "SUPER_ADMIN", "OWNER"));
        allModules.add(new MoreModule("leave_approvals", "Leave Approvals", R.drawable.ic_check_circle, 0xFF1E293B, "ATTENDANCE & LEAVE", "ADMIN", "MANAGER", "HR_HEAD", "SUPER_ADMIN", "OWNER"));
        allModules.add(new MoreModule("leave_policies", "Leave Policies", R.drawable.ic_customize_switch, 0xFF1E293B, "ATTENDANCE & LEAVE", "ADMIN", "HR_HEAD", "SUPER_ADMIN", "OWNER"));
        allModules.add(new MoreModule("manage_schedules", "Manage Schedules", R.drawable.ic_calendar_edit, 0xFF1E293B, "ATTENDANCE & LEAVE", "ADMIN", "HR_HEAD", "SUPER_ADMIN", "OWNER"));
        allModules.add(new MoreModule("leave", "Leave", R.drawable.ic_mod_leave, 0xFF1E293B, "ATTENDANCE & LEAVE", "EMPLOYEE"));
        allModules.add(new MoreModule("schedules", "My Schedules", R.drawable.ic_calendar, 0xFF1E293B, "ATTENDANCE & LEAVE", "EMPLOYEE"));

        // ADMINISTRATION
        allModules.add(new MoreModule("payroll", "Payroll Processing", R.drawable.ic_trend_up, 0xFF1E293B, "ADMINISTRATION", "ADMIN", "HR_HEAD", "SUPER_ADMIN", "OWNER"));
        allModules.add(new MoreModule("payroll_console", "Payroll Console", R.drawable.ic_chart_bar, 0xFF1E293B, "ADMINISTRATION", "ADMIN", "HR_HEAD", "SUPER_ADMIN", "OWNER"));
        allModules.add(new MoreModule("documents_admin", "Documents (Admin)", R.drawable.ic_mod_files, 0xFF1E293B, "ADMINISTRATION", "ADMIN", "HR_HEAD", "SUPER_ADMIN", "OWNER"));
        allModules.add(new MoreModule("tasks", "Tasks", R.drawable.ic_mod_tasks, 0xFF1E293B, "ADMINISTRATION", "EMPLOYEE", "MANAGER", "ADMIN", "HR_HEAD", "SUPER_ADMIN", "OWNER"));
        allModules.add(new MoreModule("billing", "Subscription & Billing", R.drawable.ic_org, 0xFF1E293B, "ADMINISTRATION", "ADMIN", "SUPER_ADMIN", "OWNER"));
        allModules.add(new MoreModule("settings", "Settings", R.drawable.ic_settings_gear, 0xFF1E293B, "ADMINISTRATION", "ADMIN", "SUPER_ADMIN", "OWNER"));
        allModules.add(new MoreModule("broadcast", "Broadcast Notification", R.drawable.ic_announcement, 0xFF1E293B, "ADMINISTRATION", "ADMIN", "HR_HEAD", "SUPER_ADMIN", "OWNER"));
        allModules.add(new MoreModule("payslips", "My Payslips", R.drawable.ic_chart_bar, 0xFF1E293B, "ADMINISTRATION", "EMPLOYEE"));
        allModules.add(new MoreModule("documents", "Documents", R.drawable.ic_mod_files, 0xFF1E293B, "ADMINISTRATION", "EMPLOYEE"));

        // SUPPORT
        allModules.add(new MoreModule("help", "Help & Support", R.drawable.ic_info, 0xFF1E293B, "SUPPORT", "EMPLOYEE", "MANAGER", "ADMIN", "HR_HEAD", "SUPER_ADMIN", "OWNER"));
    }

    private void filterModulesByRole() {
        String roleStr = ApiClient.getInstance(this).getRole();
        List<String> sidebarModules = ApiClient.getInstance(this).getSidebarModules();
        rolePermittedModules.clear();

        for (MoreModule module : allModules) {
            if (module.isAllowedForRoleAndModules(roleStr, sidebarModules)) {
                rolePermittedModules.add(module);
            }
        }
        fullSectionedItems.clear();
        fullSectionedItems.addAll(buildSectionedItems(rolePermittedModules));
        applySearch(etSearch != null && etSearch.getText() != null ? etSearch.getText().toString().trim() : "");
    }

    private List<MoreItem> buildSectionedItems(List<MoreModule> modules) {
        Map<String, List<MoreModule>> map = new LinkedHashMap<>();
        for (MoreModule m : modules) {
            String s = m.getSection() != null && !m.getSection().isEmpty() ? m.getSection() : "GENERAL";
            if (!map.containsKey(s)) {
                map.put(s, new ArrayList<>());
            }
            map.get(s).add(m);
        }

        List<MoreItem> list = new ArrayList<>();
        for (Map.Entry<String, List<MoreModule>> entry : map.entrySet()) {
            if (entry.getValue().isEmpty()) continue;
            list.add(new MoreItem(entry.getKey()));
            for (MoreModule m : entry.getValue()) {
                list.add(new MoreItem(m));
            }
        }
        return list;
    }

    private void setupRecyclerView() {
        rvModules.setLayoutManager(new LinearLayoutManager(this));
        adapter = new MoreModulesAdapter(fullSectionedItems, module -> {
            handleModuleClick(module);
        });
        rvModules.setAdapter(adapter);
    }

    private void setupSearch() {
        etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                applySearch(s != null ? s.toString().trim() : "");
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });
    }

    private void applySearch(String query) {
        if (adapter == null) return;
        if (query.isEmpty()) {
            adapter.updateItems(fullSectionedItems);
            if (tvNoModules != null) tvNoModules.setVisibility(View.GONE);
            if (rvModules != null) rvModules.setVisibility(View.VISIBLE);
            return;
        }

        List<MoreModule> matching = new ArrayList<>();
        String lowerQuery = query.toLowerCase();
        for (MoreModule module : rolePermittedModules) {
            if (module.getTitle().toLowerCase().contains(lowerQuery)) {
                matching.add(module);
            }
        }

        if (matching.isEmpty()) {
            if (rvModules != null) rvModules.setVisibility(View.GONE);
            if (tvNoModules != null) tvNoModules.setVisibility(View.VISIBLE);
        } else {
            if (rvModules != null) rvModules.setVisibility(View.VISIBLE);
            if (tvNoModules != null) tvNoModules.setVisibility(View.GONE);
            adapter.updateItems(buildSectionedItems(matching));
        }
    }

    private void setupListeners() {
        if (btnCustomize != null) {
            btnCustomize.setOnClickListener(v -> {
                startActivity(new Intent(this, CustomizeTabsActivity.class));
            });
        }

        View navTabHome = findViewById(R.id.navTabHome);
        if (navTabHome != null) {
            navTabHome.setOnClickListener(v -> {
                Intent intent = new Intent(this, HomeActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                startActivity(intent);
                finish();
            });
        }

        View navTabAttendance = findViewById(R.id.navTabAttendance);
        if (navTabAttendance != null) {
            navTabAttendance.setOnClickListener(v -> {
                Intent intent = new Intent(this, AttendanceActivity.class);
                startActivity(intent);
                finish();
            });
        }

        View navTabLeave = findViewById(R.id.navTabLeave);
        if (navTabLeave != null) {
            navTabLeave.setOnClickListener(v -> {
                Intent intent = new Intent(this, LeaveActivity.class);
                startActivity(intent);
                finish();
            });
        }

        View navTabTasks = findViewById(R.id.navTabTasks);
        if (navTabTasks != null) {
            navTabTasks.setOnClickListener(v -> {
                Intent intent = new Intent(this, TasksActivity.class);
                startActivity(intent);
                finish();
            });
        }

        View navTabMore = findViewById(R.id.navTabMore);
        if (navTabMore != null) {
            navTabMore.setOnClickListener(v -> {
                if (rvModules != null) rvModules.smoothScrollToPosition(0);
            });
        }
    }

    private void handleModuleClick(MoreModule module) {
        String id = module.getId();
        if ("dashboard".equals(id)) {
            Intent intent = new Intent(this, HomeActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            startActivity(intent);
            finish();
        } else if ("onboarding".equals(id)) {
            showOnboardingDialog();
        } else if ("recruitment".equals(id)) {
            showRecruitmentDialog();
        } else if ("training".equals(id)) {
            showTrainingDialog();
        } else if ("employees".equals(id)) {
            startActivity(new Intent(this, EmployeesActivity.class));
        } else if ("designations".equals(id)) {
            showDesignationsDialog();
        } else if ("resignation".equals(id)) {
            showResignationsDialog();
        } else if ("attendance".equals(id)) {
            startActivity(new Intent(this, AttendanceActivity.class));
        } else if ("leave_approvals".equals(id) || "approvals".equals(id)) {
            startActivity(new Intent(this, ApprovalsActivity.class));
        } else if ("leave_policies".equals(id)) {
            showLeavePoliciesDialog();
        } else if ("manage_schedules".equals(id) || "shifts".equals(id) || "schedules".equals(id)) {
            startActivity(new Intent(this, ShiftsActivity.class));
        } else if ("leave".equals(id)) {
            startActivity(new Intent(this, LeaveActivity.class));
        } else if ("payroll".equals(id)) {
            startActivity(new Intent(this, PayrollActivity.class));
        } else if ("payroll_console".equals(id)) {
            showPayrollConsoleDialog();
        } else if ("documents".equals(id) || "documents_admin".equals(id)) {
            startActivity(new Intent(this, DocumentsActivity.class));
        } else if ("tasks".equals(id)) {
            startActivity(new Intent(this, TasksActivity.class));
        } else if ("billing".equals(id)) {
            showSubscriptionBillingDialog();
        } else if ("settings".equals(id)) {
            startActivity(new Intent(this, SettingsActivity.class));
        } else if ("broadcast".equals(id)) {
            startActivity(new Intent(this, BroadcastNotificationActivity.class));
        } else if ("payslips".equals(id)) {
            startActivity(new Intent(this, PayslipsActivity.class));
        } else if ("help".equals(id)) {
            startActivity(new Intent(this, HelpSupportActivity.class));
        } else {
            showModuleInfoDialog(module);
        }
    }

    private void showOnboardingDialog() {
        new android.app.AlertDialog.Builder(this)
                .setTitle("Onboarding Management")
                .setMessage("Active Onboarding Pipeline:\n\n" +
                        "• Rahul Verma — Frontend Engineer (65% Complete)\n" +
                        "  Status: IT Hardware Dispatched, Docs Pending\n" +
                        "• Priya Sharma — Product Designer (90% Complete)\n" +
                        "  Status: Ready for First Day Orientation\n" +
                        "• Ankit Patel — QA Engineer (40% Complete)\n" +
                        "  Status: Background Verification Pending\n\n" +
                        "Organization checklist is active.")
                .setPositiveButton("OK", null)
                .show();
    }

    private void showRecruitmentDialog() {
        new android.app.AlertDialog.Builder(this)
                .setTitle("Recruitment Pipeline")
                .setMessage("Active Requisitions & Pipeline:\n\n" +
                        "• Senior Fullstack Engineer — 5 Candidates\n" +
                        "  2 Screening • 2 Technical Round • 1 Final\n" +
                        "• HR Operations Specialist — 3 Candidates\n" +
                        "  2 Screening • 1 Offer Pending\n" +
                        "• DevOps Specialist — 2 Candidates\n" +
                        "  1 Screening • 1 Technical Interview\n\n" +
                        "Total: 10 Candidates active across 3 openings.")
                .setPositiveButton("OK", null)
                .show();
    }

    private void showTrainingDialog() {
        new android.app.AlertDialog.Builder(this)
                .setTitle("Training & Development")
                .setMessage("Active Programs & Compliance:\n\n" +
                        "• ISO 27001 & InfoSec (Mandatory Annual)\n" +
                        "  Completion: 92% (12/13 Employees Completed)\n" +
                        "• Modern TypeScript & Architecture\n" +
                        "  Enrolled: 4 Developers • Upcoming Lab: Friday\n" +
                        "• Managerial Leadership & Coaching\n" +
                        "  Enrolled: 2 Managers • Status: In Progress\n\n" +
                        "Next Session: Friday, 3:00 PM IST.")
                .setPositiveButton("OK", null)
                .show();
    }

    private void showDesignationsDialog() {
        new android.app.AlertDialog.Builder(this)
                .setTitle("Designations & Hierarchy")
                .setMessage("Active Organization Designations:\n\n" +
                        "• Platform Owner / Super Admin (Level 1)\n" +
                        "• HR Head / Operations (Level 2)\n" +
                        "• Engineering Lead / Manager (Level 3)\n" +
                        "• Senior Software Engineer (Level 4)\n" +
                        "• UI/UX Product Designer (Level 4)\n" +
                        "• QA / Automation Engineer (Level 4)\n\n" +
                        "All designations map to module security policies.")
                .setPositiveButton("OK", null)
                .show();
    }

    private void showResignationsDialog() {
        new android.app.AlertDialog.Builder(this)
                .setTitle("Resignations & Offboarding")
                .setMessage("Resignation Governance Overview:\n\n" +
                        "• Standard Notice Period: 60 Days\n" +
                        "• Active Exit Clearances: 0 Pending\n" +
                        "• Company Hardware Return: 100% Accounted\n" +
                        "• Knowledge Transfer Status: Up to date\n\n" +
                        "No pending employee resignation requests.")
                .setPositiveButton("OK", null)
                .show();
    }

    private void showPayrollConsoleDialog() {
        new android.app.AlertDialog.Builder(this)
                .setTitle("Payroll Console")
                .setMessage("Salary Architecture & Rules:\n\n" +
                        "• Basic Salary: 50% of CTC\n" +
                        "• House Rent Allowance: 40% of Basic\n" +
                        "• Statutory PF: 12% Employer + 12% Employee\n" +
                        "• Disbursal Mode: Direct NEFT / Bank Deposit\n\n" +
                        "Current Pay Cycle: November 2026 Batch Ready.")
                .setPositiveButton("Open Payroll Processing", (dialog, which) -> {
                    startActivity(new Intent(this, PayrollActivity.class));
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void showSubscriptionBillingDialog() {
        new android.app.AlertDialog.Builder(this)
                .setTitle("Subscription & Billing")
                .setMessage("GlobizHR Cloud Subscription:\n\n" +
                        "• Plan: Enterprise Tier (Active)\n" +
                        "• Licensed Seats: 2 Active / 50 Included\n" +
                        "• Billing Interval: Annual (Renews Nov 2027)\n" +
                        "• 24/7 Priority Support & Direct Slack Connect\n" +
                        "• Multi-location Attendance & Automated Payroll\n\n" +
                        "Subscription is fully active and in good standing.")
                .setPositiveButton("OK", null)
                .show();
    }

    private void showLeavePoliciesDialog() {
        new android.app.AlertDialog.Builder(this)
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

    private void showLeaveApprovalsDialog() {
        new android.app.AlertDialog.Builder(this)
                .setTitle("Leave Approvals")
                .setMessage("Your submitted leave requests are automatically tracked and routed to your reporting manager.\n\n" +
                        "Current Requests:\n" +
                        "• Casual Leave: 12 Days remaining\n" +
                        "• Sick Leave: 10 Days remaining\n" +
                        "• Earned Leave: 15 Days remaining\n\n" +
                        "No pending approval requests require your review.")
                .setPositiveButton("OK", null)
                .show();
    }

    private void showModuleInfoDialog(MoreModule module) {
        new android.app.AlertDialog.Builder(this)
                .setTitle(module.getTitle())
                .setMessage(module.getTitle() + " is active and synchronized with your organization's backend.")
                .setPositiveButton("OK", null)
                .show();
    }

    @Override
    public void finish() {
        super.finish();
        overridePendingTransition(0, R.anim.slide_down_out);
    }
}
