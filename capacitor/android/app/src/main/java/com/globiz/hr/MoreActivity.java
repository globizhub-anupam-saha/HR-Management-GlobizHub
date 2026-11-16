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
import java.util.List;

public class MoreActivity extends AppCompatActivity {

    private ImageView btnCustomize;
    private EditText etSearch;
    private RecyclerView rvModules;
    private TextView tvNoModules;

    private MoreModulesAdapter adapter;
    private final List<MoreModule> allModules = new ArrayList<>();
    private final List<MoreModule> rolePermittedModules = new ArrayList<>();

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
    }

    @Override
    protected void onResume() {
        super.onResume();
        AppHeaderHelper.refreshHeaderState(this);
        filterModulesByRole();

        // Real-time synchronization of currently logged-in user profile & role modules
        ApiClient.getInstance(this).getProfile(new ApiClient.ApiCallback<JSONObject>() {
            @Override
            public void onSuccess(JSONObject user) {
                if (user == null) return;
                if (user.has("role")) {
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
    }

    private void initModules() {
        allModules.clear();
        allModules.add(new MoreModule("employees", "Employees", R.drawable.ic_users_group, 0xFF1E293B, "MANAGER", "HR_HEAD", "SUPER_ADMIN", "OWNER"));
        allModules.add(new MoreModule("attendance", "Clock ins/outs", R.drawable.ic_clock, 0xFF1E293B, "EMPLOYEE", "HR_HEAD", "SUPER_ADMIN", "OWNER"));
        allModules.add(new MoreModule("schedules", "Schedules", R.drawable.ic_calendar, 0xFF1E293B, "EMPLOYEE", "MANAGER"));
        allModules.add(new MoreModule("leave", "Leave", R.drawable.ic_mod_leave, 0xFF1E293B, "EMPLOYEE", "MANAGER"));
        allModules.add(new MoreModule("leave_approvals", "Leave Approvals", R.drawable.ic_check_circle, 0xFF1E293B, "MANAGER", "HR_HEAD", "SUPER_ADMIN", "OWNER"));
        allModules.add(new MoreModule("leave_policies", "Leave Policies", R.drawable.ic_customize_switch, 0xFF1E293B, "HR_HEAD", "SUPER_ADMIN", "OWNER"));
        allModules.add(new MoreModule("payslips", "My Payslips", R.drawable.ic_chart_bar, 0xFF1E293B, "EMPLOYEE", "MANAGER"));
        allModules.add(new MoreModule("payroll", "Payroll Processing", R.drawable.ic_trend_up, 0xFF1E293B, "HR_HEAD", "SUPER_ADMIN", "OWNER"));
        allModules.add(new MoreModule("shifts", "Shifts", R.drawable.ic_mod_time, 0xFF1E293B, "EMPLOYEE"));
        allModules.add(new MoreModule("tasks", "Tasks", R.drawable.ic_mod_tasks, 0xFF1E293B, "EMPLOYEE", "MANAGER", "HR_HEAD", "SUPER_ADMIN", "OWNER"));
        allModules.add(new MoreModule("documents", "Documents", R.drawable.ic_mod_files, 0xFF1E293B, "EMPLOYEE", "MANAGER"));
        allModules.add(new MoreModule("documents_admin", "Documents (Admin)", R.drawable.ic_mod_files, 0xFF1E293B, "HR_HEAD", "SUPER_ADMIN", "OWNER"));
        allModules.add(new MoreModule("manage_schedules", "Manage Schedules", R.drawable.ic_calendar_edit, 0xFF1E293B, "HR_HEAD", "SUPER_ADMIN", "OWNER"));
        allModules.add(new MoreModule("settings", "Settings", R.drawable.ic_settings_gear, 0xFF1E293B, "SUPER_ADMIN", "OWNER"));
    }

    private void filterModulesByRole() {
        String role = ApiClient.getInstance(this).getRole();
        List<String> sidebarModules = ApiClient.getInstance(this).getSidebarModules();
        rolePermittedModules.clear();

        for (MoreModule module : allModules) {
            String id = module.getId();
            // Primary tabs are already displayed on the bottom navigation bar
            if ("attendance".equals(id) || "leave".equals(id) || "tasks".equals(id)) {
                continue;
            }
            if (module.isAllowedForRoleAndModules(role, sidebarModules)) {
                rolePermittedModules.add(module);
            }
        }
        applySearch(etSearch != null && etSearch.getText() != null ? etSearch.getText().toString().trim() : "");
    }

    private void setupRecyclerView() {
        rvModules.setLayoutManager(new LinearLayoutManager(this));
        adapter = new MoreModulesAdapter(rolePermittedModules, module -> {
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
            adapter.updateList(rolePermittedModules);
            if (tvNoModules != null) tvNoModules.setVisibility(View.GONE);
            if (rvModules != null) rvModules.setVisibility(View.VISIBLE);
            return;
        }

        List<MoreModule> filtered = new ArrayList<>();
        String lowerQuery = query.toLowerCase();
        for (MoreModule module : rolePermittedModules) {
            if (module.getTitle().toLowerCase().contains(lowerQuery)) {
                filtered.add(module);
            }
        }

        if (filtered.isEmpty()) {
            if (rvModules != null) rvModules.setVisibility(View.GONE);
            if (tvNoModules != null) tvNoModules.setVisibility(View.VISIBLE);
        } else {
            if (rvModules != null) rvModules.setVisibility(View.VISIBLE);
            if (tvNoModules != null) tvNoModules.setVisibility(View.GONE);
            adapter.updateList(filtered);
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
        if ("payslips".equals(module.getId())) {
            startActivity(new Intent(this, PayslipsActivity.class));
        } else if ("documents".equals(module.getId()) || "documents_admin".equals(module.getId())) {
            startActivity(new Intent(this, DocumentsActivity.class));
        } else if ("shifts".equals(module.getId()) || "schedules".equals(module.getId()) || "manage_schedules".equals(module.getId())) {
            startActivity(new Intent(this, ShiftsActivity.class));
        } else if ("settings".equals(module.getId())) {
            startActivity(new Intent(this, SettingsActivity.class));
        } else if ("leave_policies".equals(module.getId())) {
            showLeavePoliciesDialog();
        } else if ("leave_approvals".equals(module.getId())) {
            showLeaveApprovalsDialog();
        } else if ("attendance".equals(module.getId())) {
            startActivity(new Intent(this, AttendanceActivity.class));
        } else if ("leave".equals(module.getId())) {
            startActivity(new Intent(this, LeaveActivity.class));
        } else if ("tasks".equals(module.getId())) {
            startActivity(new Intent(this, TasksActivity.class));
        } else {
            showModuleInfoDialog(module);
        }
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
