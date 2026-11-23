package com.globiz.hr;

import android.app.AlertDialog;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

import com.globiz.hr.network.ApiClient;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class EmployeesActivity extends AppCompatActivity {

    private ApiClient apiClient;

    private JSONArray allEmployees = new JSONArray();
    private List<JSONObject> filteredEmployees = new ArrayList<>();
    private JSONArray departments = new JSONArray();

    private String selectedStatus = "ALL";
    private String searchTerm = "";
    private String selectedDeptId = "";
    private String selectedRole = "";

    // Views
    private TextView tvCountAllStaff, tvCountActive, tvCountInvited, tvCountTerminated;
    private View cardAllStaff, cardActive, cardInvited, cardTerminated;
    private LinearLayout llFilterTabs;
    private EditText etSearch;
    private TextView btnFilterDept, btnFilterRole;
    private ProgressBar pbLoading;
    private LinearLayout llEmptyState;
    private LinearLayout llEmployeesList;
    private View btnInviteHeader, btnEmptyInvite;
    private View btnNotifications;
    private View viewNotificationDot;
    private View flAvatarContainer;
    private TextView tvAvatarInitials;

    private final String[][] filterTabs = {
            {"All", "ALL"},
            {"Active", "ACTIVE"},
            {"Invited", "INVITED"},
            {"Onboarding", "ONBOARDING"},
            {"Notice Period", "NOTICE_PERIOD"},
            {"Terminated", "TERMINATED"},
            {"Resigned", "RESIGNED"}
    };

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_employees);

        apiClient = ApiClient.getInstance(this);

        initViews();
        setupHeader();
        setupKpiCards();
        setupFilterTabs();
        setupSearchAndFilters();
        setupBottomNav();

        fetchDepartments();
        loadEmployeesData();
    }

    @Override
    protected void onResume() {
        super.onResume();
        BottomNavHelper.setupBottomNav(this, "employees");
        refreshHeaderState();
        loadEmployeesData();
    }

    private void initViews() {
        tvCountAllStaff = findViewById(R.id.tvCountAllStaff);
        tvCountActive = findViewById(R.id.tvCountActive);
        tvCountInvited = findViewById(R.id.tvCountInvited);
        tvCountTerminated = findViewById(R.id.tvCountTerminated);

        cardAllStaff = findViewById(R.id.cardAllStaff);
        cardActive = findViewById(R.id.cardActive);
        cardInvited = findViewById(R.id.cardInvited);
        cardTerminated = findViewById(R.id.cardTerminated);

        llFilterTabs = findViewById(R.id.llFilterTabs);
        etSearch = findViewById(R.id.etSearch);
        btnFilterDept = findViewById(R.id.btnFilterDept);
        btnFilterRole = findViewById(R.id.btnFilterRole);
        pbLoading = findViewById(R.id.pbLoading);
        llEmptyState = findViewById(R.id.llEmptyState);
        llEmployeesList = findViewById(R.id.llEmployeesList);

        btnInviteHeader = findViewById(R.id.btnInviteHeader);
        btnEmptyInvite = findViewById(R.id.btnEmptyInvite);
        btnNotifications = findViewById(R.id.btnNotifications);
        viewNotificationDot = findViewById(R.id.viewNotificationDot);
        flAvatarContainer = findViewById(R.id.flAvatarContainer);
        tvAvatarInitials = findViewById(R.id.tvAvatarInitials);

        View.OnClickListener inviteClick = v -> showInviteDialog();
        btnInviteHeader.setOnClickListener(inviteClick);
        btnEmptyInvite.setOnClickListener(inviteClick);
    }

    private void setupHeader() {
        btnNotifications.setOnClickListener(v -> startActivity(new Intent(this, NotificationsActivity.class)));
        flAvatarContainer.setOnClickListener(v -> startActivity(new Intent(this, AccountSettingsActivity.class)));
        refreshHeaderState();
    }

    private void refreshHeaderState() {
        if (viewNotificationDot != null) {
            viewNotificationDot.setVisibility(apiClient.hasUnreadLocalNotifications() ? View.VISIBLE : View.GONE);
        }
        if (tvAvatarInitials != null) {
            String initials = apiClient.getUserInitials();
            tvAvatarInitials.setText(initials.isEmpty() ? "M" : initials);
        }
    }

    private void setupBottomNav() {
        BottomNavHelper.setupBottomNav(this, "employees");
        NavBarScrollHelper.attachToScrollView(findViewById(R.id.scrollView), findViewById(R.id.bottomNavBar));
    }

    // MARK: - KPI Statistics Cards
    private void setupKpiCards() {
        cardAllStaff.setOnClickListener(v -> selectStatus("ALL"));
        cardActive.setOnClickListener(v -> selectStatus("ACTIVE"));
        cardInvited.setOnClickListener(v -> selectStatus("INVITED"));
        cardTerminated.setOnClickListener(v -> selectStatus("TERMINATED"));
    }

    private void selectStatus(String status) {
        selectedStatus = status;
        updateFilterTabsHighlight();
        applyFilters();
    }

    private void updateKpiCounters() {
        int total = allEmployees.length();
        int active = 0;
        int invited = 0;
        int terminated = 0;

        for (int i = 0; i < total; i++) {
            JSONObject obj = allEmployees.optJSONObject(i);
            if (obj == null) continue;
            String st = obj.optString("employmentStatus", "ACTIVE");
            if (st.isEmpty() || "ACTIVE".equalsIgnoreCase(st)) {
                active++;
            } else if ("INVITED".equalsIgnoreCase(st)) {
                invited++;
            } else if ("TERMINATED".equalsIgnoreCase(st) || "RESIGNED".equalsIgnoreCase(st)) {
                terminated++;
            }
        }

        tvCountAllStaff.setText(String.valueOf(total));
        tvCountActive.setText(String.valueOf(active));
        tvCountInvited.setText(String.valueOf(invited));
        tvCountTerminated.setText(String.valueOf(terminated));
    }

    // MARK: - Filter Tabs Horizontal Bar
    private void setupFilterTabs() {
        llFilterTabs.removeAllViews();
        for (int i = 0; i < filterTabs.length; i++) {
            final String label = filterTabs[i][0];
            final String value = filterTabs[i][1];

            TextView chip = new TextView(this);
            chip.setText(label);
            chip.setTextSize(13);
            chip.setTypeface(null, Typeface.BOLD);
            chip.setPadding(36, 18, 36, 18);
            chip.setTag(value);

            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
            );
            lp.setMargins(0, 0, 16, 0);
            chip.setLayoutParams(lp);

            chip.setOnClickListener(v -> selectStatus(value));
            llFilterTabs.addView(chip);
        }
        updateFilterTabsHighlight();
    }

    private void updateFilterTabsHighlight() {
        for (int i = 0; i < llFilterTabs.getChildCount(); i++) {
            View child = llFilterTabs.getChildAt(i);
            if (child instanceof TextView) {
                TextView chip = (TextView) child;
                String tag = (String) chip.getTag();
                if (selectedStatus.equalsIgnoreCase(tag)) {
                    chip.setBackgroundResource(R.drawable.bg_black_pill);
                    chip.setTextColor(Color.WHITE);
                } else {
                    chip.setBackgroundResource(R.drawable.bg_secondary_button);
                    chip.setTextColor(Color.parseColor("#475569"));
                }
            }
        }
    }

    // MARK: - Search and Filters
    private void setupSearchAndFilters() {
        etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                searchTerm = s.toString().trim();
                applyFilters();
            }
            @Override
            public void afterTextChanged(Editable s) {}
        });

        btnFilterDept.setOnClickListener(v -> showDepartmentFilterDialog());
        btnFilterRole.setOnClickListener(v -> showRoleFilterDialog());
    }

    private void showDepartmentFilterDialog() {
        List<String> names = new ArrayList<>();
        List<String> ids = new ArrayList<>();
        names.add("All Departments");
        ids.add("");

        for (int i = 0; i < departments.length(); i++) {
            JSONObject d = departments.optJSONObject(i);
            if (d != null) {
                names.add(d.optString("name", "Department"));
                ids.add(d.optString("id", ""));
            }
        }

        new AlertDialog.Builder(this)
                .setTitle("Select Department")
                .setItems(names.toArray(new String[0]), (dialog, which) -> {
                    selectedDeptId = ids.get(which);
                    btnFilterDept.setText(which == 0 ? "Dept: All" : "Dept: " + names.get(which));
                    applyFilters();
                })
                .show();
    }

    private void showRoleFilterDialog() {
        final String[] roleLabels = {"All Roles", "Super Admin", "HR Head", "Owner", "Manager", "Employee"};
        final String[] roleValues = {"", "SUPER_ADMIN", "HR_HEAD", "OWNER", "MANAGER", "EMPLOYEE"};

        new AlertDialog.Builder(this)
                .setTitle("Select Role")
                .setItems(roleLabels, (dialog, which) -> {
                    selectedRole = roleValues[which];
                    btnFilterRole.setText(which == 0 ? "Role: All" : "Role: " + roleLabels[which]);
                    applyFilters();
                })
                .show();
    }

    // MARK: - Network Loading
    private void fetchDepartments() {
        apiClient.getDepartments(new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray result) {
                runOnUiThread(() -> departments = result != null ? result : new JSONArray());
            }

            @Override
            public void onError(String errorMessage, int statusCode) {}
        });
    }

    private void loadEmployeesData() {
        pbLoading.setVisibility(View.VISIBLE);

        apiClient.getEmployees(selectedStatus, searchTerm, selectedDeptId, selectedRole, new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray result) {
                runOnUiThread(() -> {
                    pbLoading.setVisibility(View.GONE);
                    allEmployees = result != null ? result : new JSONArray();
                    updateKpiCounters();
                    applyFilters();
                });
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                runOnUiThread(() -> {
                    pbLoading.setVisibility(View.GONE);
                });
            }
        });
    }

    private void applyFilters() {
        filteredEmployees.clear();
        String lowerTerm = searchTerm.toLowerCase();

        for (int i = 0; i < allEmployees.length(); i++) {
            JSONObject emp = allEmployees.optJSONObject(i);
            if (emp == null) continue;

            // Search filter
            String fn = emp.optString("firstName", "");
            String ln = emp.optString("lastName", "");
            String fullName = (fn + " " + ln).toLowerCase();
            String email = emp.optString("email", "").toLowerCase();
            String code = emp.optString("employeeCode", "").toLowerCase();

            boolean matchesSearch = lowerTerm.isEmpty()
                    || fullName.contains(lowerTerm)
                    || email.contains(lowerTerm)
                    || code.contains(lowerTerm);

            // Status filter
            String st = emp.optString("employmentStatus", "ACTIVE");
            boolean matchesStatus = "ALL".equalsIgnoreCase(selectedStatus) || selectedStatus.equalsIgnoreCase(st);

            // Department filter
            boolean matchesDept = true;
            if (!selectedDeptId.isEmpty()) {
                String dId = emp.optString("departmentId", "");
                if (dId.isEmpty()) {
                    JSONObject dObj = emp.optJSONObject("department");
                    if (dObj != null) dId = dObj.optString("id", "");
                }
                matchesDept = selectedDeptId.equalsIgnoreCase(dId);
            }

            // Role filter
            boolean matchesRole = true;
            if (!selectedRole.isEmpty()) {
                matchesRole = selectedRole.equalsIgnoreCase(emp.optString("role", ""));
            }

            if (matchesSearch && matchesStatus && matchesDept && matchesRole) {
                filteredEmployees.add(emp);
            }
        }

        renderEmployeeCards();
    }

    // MARK: - Render Cards
    private void renderEmployeeCards() {
        llEmployeesList.removeAllViews();

        if (filteredEmployees.isEmpty()) {
            llEmptyState.setVisibility(View.VISIBLE);
            return;
        }
        llEmptyState.setVisibility(View.GONE);

        LayoutInflater inflater = LayoutInflater.from(this);
        for (JSONObject emp : filteredEmployees) {
            View card = inflater.inflate(R.layout.item_employee_card, llEmployeesList, false);

            TextView tvEmpInitials = card.findViewById(R.id.tvEmpInitials);
            TextView tvEmpName = card.findViewById(R.id.tvEmpName);
            TextView tvEmpDesignation = card.findViewById(R.id.tvEmpDesignation);
            TextView tvEmpStatus = card.findViewById(R.id.tvEmpStatus);
            TextView tvEmpEmail = card.findViewById(R.id.tvEmpEmail);
            TextView tvEmpDepartment = card.findViewById(R.id.tvEmpDepartment);
            TextView tvEmpCode = card.findViewById(R.id.tvEmpCode);

            TextView btnResendInvite = card.findViewById(R.id.btnEmpResendInvite);
            TextView btnDetails = card.findViewById(R.id.btnEmpDetails);
            TextView btnDeactivate = card.findViewById(R.id.btnEmpDeactivate);

            String fn = emp.optString("firstName", "");
            String ln = emp.optString("lastName", "");
            String fullName = (fn + " " + ln).trim();
            tvEmpName.setText(fullName.isEmpty() ? "Employee" : fullName);

            String initials = getInitials(fn, ln);
            tvEmpInitials.setText(initials);

            // Designation / Role
            String desig = "";
            JSONObject desigObj = emp.optJSONObject("designation");
            if (desigObj != null) desig = desigObj.optString("name", "");
            if (desig.isEmpty()) desig = emp.optString("role", "Team Member");
            tvEmpDesignation.setText(formatRole(desig));

            // Status Pill
            String status = emp.optString("employmentStatus", "ACTIVE");
            applyStatusStyle(tvEmpStatus, status);

            // Email & Code
            String email = emp.optString("email", "");
            tvEmpEmail.setText(email);

            String code = emp.optString("employeeCode", "");
            if (code.isEmpty()) {
                tvEmpCode.setVisibility(View.GONE);
            } else {
                tvEmpCode.setVisibility(View.VISIBLE);
                tvEmpCode.setText("ID: " + code);
            }

            // Department
            String deptName = "";
            JSONObject deptObj = emp.optJSONObject("department");
            if (deptObj != null) deptName = deptObj.optString("name", "");
            if (deptName.isEmpty()) {
                tvEmpDepartment.setVisibility(View.GONE);
            } else {
                tvEmpDepartment.setVisibility(View.VISIBLE);
                tvEmpDepartment.setText(deptName);
            }

            final String empId = emp.optString("id", "");

            // Resend Invite (only if invited)
            if ("INVITED".equalsIgnoreCase(status)) {
                btnResendInvite.setVisibility(View.VISIBLE);
                btnResendInvite.setOnClickListener(v -> handleResendInvite(empId, email));
            } else {
                btnResendInvite.setVisibility(View.GONE);
            }

            btnDetails.setOnClickListener(v -> showDetailsDialog(emp));
            btnDeactivate.setOnClickListener(v -> handleDeactivate(empId, fullName));

            llEmployeesList.addView(card);
        }
    }

    private void applyStatusStyle(TextView pill, String status) {
        if ("ACTIVE".equalsIgnoreCase(status)) {
            pill.setText("• Active");
            pill.setBackgroundResource(R.drawable.bg_pill_active);
            pill.setTextColor(Color.parseColor("#047857"));
        } else if ("INVITED".equalsIgnoreCase(status)) {
            pill.setText("Invited");
            pill.setBackgroundResource(R.drawable.bg_stat_card_orange);
            pill.setTextColor(Color.parseColor("#B45309"));
        } else if ("ONBOARDING".equalsIgnoreCase(status)) {
            pill.setText("Onboarding");
            pill.setBackgroundResource(R.drawable.bg_badge_inprogress);
            pill.setTextColor(Color.parseColor("#1D4ED8"));
        } else if ("NOTICE_PERIOD".equalsIgnoreCase(status)) {
            pill.setText("Notice Period");
            pill.setBackgroundResource(R.drawable.bg_card_selected);
            pill.setTextColor(Color.parseColor("#7E22CE"));
        } else if ("TERMINATED".equalsIgnoreCase(status)) {
            pill.setText("Terminated");
            pill.setBackgroundResource(R.drawable.bg_stat_card_red);
            pill.setTextColor(Color.parseColor("#B91C1C"));
        } else if ("RESIGNED".equalsIgnoreCase(status)) {
            pill.setText("Resigned");
            pill.setBackgroundResource(R.drawable.bg_secondary_button);
            pill.setTextColor(Color.parseColor("#475569"));
        } else {
            pill.setText("• Active");
            pill.setBackgroundResource(R.drawable.bg_pill_active);
            pill.setTextColor(Color.parseColor("#047857"));
        }
    }

    private String getInitials(String first, String last) {
        StringBuilder sb = new StringBuilder();
        if (first != null && !first.isEmpty()) sb.append(first.substring(0, 1).toUpperCase());
        if (last != null && !last.isEmpty()) sb.append(last.substring(0, 1).toUpperCase());
        return sb.length() > 0 ? sb.toString() : "E";
    }

    private String formatRole(String raw) {
        return raw.replace("_", " ").toLowerCase();
    }

    // MARK: - Actions
    private void handleResendInvite(String empId, String email) {
        apiClient.resendEmployeeInvite(empId, new ApiClient.ApiCallback<JSONObject>() {
            @Override
            public void onSuccess(JSONObject result) {
                runOnUiThread(() -> Toast.makeText(EmployeesActivity.this, "Invitation resent successfully to " + email, Toast.LENGTH_SHORT).show());
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                runOnUiThread(() -> Toast.makeText(EmployeesActivity.this, errorMessage, Toast.LENGTH_SHORT).show());
            }
        });
    }

    private void handleDeactivate(String empId, String name) {
        new AlertDialog.Builder(this)
                .setTitle("Deactivate Employee")
                .setMessage("Are you sure you want to deactivate and remove " + name + " from the organization directory?")
                .setNegativeButton("Cancel", null)
                .setPositiveButton("Deactivate", (dialog, which) -> {
                    apiClient.deleteEmployee(empId, new ApiClient.ApiCallback<JSONObject>() {
                        @Override
                        public void onSuccess(JSONObject result) {
                            runOnUiThread(() -> {
                                Toast.makeText(EmployeesActivity.this, "Employee deactivated", Toast.LENGTH_SHORT).show();
                                loadEmployeesData();
                            });
                        }

                        @Override
                        public void onError(String errorMessage, int statusCode) {
                            runOnUiThread(() -> Toast.makeText(EmployeesActivity.this, errorMessage, Toast.LENGTH_SHORT).show());
                        }
                    });
                })
                .show();
    }

    // MARK: - Dialogs
    private void showInviteDialog() {
        View dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_invite_employee, null);
        AlertDialog dialog = new AlertDialog.Builder(this)
                .setView(dialogView)
                .create();

        EditText etFn = dialogView.findViewById(R.id.etInviteFirstName);
        EditText etLn = dialogView.findViewById(R.id.etInviteLastName);
        EditText etEmail = dialogView.findViewById(R.id.etInviteEmail);
        Spinner spRole = dialogView.findViewById(R.id.spInviteRole);
        Spinner spDept = dialogView.findViewById(R.id.spInviteDepartment);
        ProgressBar pbLoading = dialogView.findViewById(R.id.pbInviteLoading);
        TextView btnCancel = dialogView.findViewById(R.id.btnCancelInvite);
        TextView btnSubmit = dialogView.findViewById(R.id.btnSubmitInvite);

        // Populate Roles
        String[] roles = {"Employee", "Manager", "HR Head", "Admin"};
        String[] roleValues = {"EMPLOYEE", "MANAGER", "HR_HEAD", "SUPER_ADMIN"};
        ArrayAdapter<String> roleAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, roles);
        spRole.setAdapter(roleAdapter);

        // Populate Departments
        List<String> deptNames = new ArrayList<>();
        List<String> deptIds = new ArrayList<>();
        deptNames.add("Unassigned");
        deptIds.add("");
        for (int i = 0; i < departments.length(); i++) {
            JSONObject d = departments.optJSONObject(i);
            if (d != null) {
                deptNames.add(d.optString("name", ""));
                deptIds.add(d.optString("id", ""));
            }
        }
        ArrayAdapter<String> deptAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, deptNames);
        spDept.setAdapter(deptAdapter);

        btnCancel.setOnClickListener(v -> dialog.dismiss());
        btnSubmit.setOnClickListener(v -> {
            String fn = etFn.getText().toString().trim();
            String ln = etLn.getText().toString().trim();
            String email = etEmail.getText().toString().trim();

            if (fn.isEmpty()) {
                etFn.setError("First name is required");
                return;
            }
            if (ln.isEmpty()) {
                etLn.setError("Last name is required");
                return;
            }
            if (email.isEmpty() || !email.contains("@")) {
                etEmail.setError("Valid email is required");
                return;
            }

            int roleIdx = spRole.getSelectedItemPosition();
            String chosenRole = roleValues[Math.max(0, roleIdx)];
            int deptIdx = spDept.getSelectedItemPosition();
            String chosenDeptId = deptIds.get(Math.max(0, deptIdx));

            pbLoading.setVisibility(View.VISIBLE);
            btnSubmit.setEnabled(false);

            try {
                JSONObject payload = new JSONObject();
                payload.put("firstName", fn);
                payload.put("lastName", ln);
                payload.put("email", email);
                payload.put("role", chosenRole);
                if (!chosenDeptId.isEmpty()) {
                    payload.put("departmentId", chosenDeptId);
                }

                apiClient.inviteEmployee(payload, new ApiClient.ApiCallback<JSONObject>() {
                    @Override
                    public void onSuccess(JSONObject result) {
                        runOnUiThread(() -> {
                            dialog.dismiss();
                            Toast.makeText(EmployeesActivity.this, "Invitation sent to " + email, Toast.LENGTH_SHORT).show();
                            loadEmployeesData();
                        });
                    }

                    @Override
                    public void onError(String errorMessage, int statusCode) {
                        runOnUiThread(() -> {
                            pbLoading.setVisibility(View.GONE);
                            btnSubmit.setEnabled(true);
                            Toast.makeText(EmployeesActivity.this, errorMessage, Toast.LENGTH_LONG).show();
                        });
                    }
                });
            } catch (Exception e) {
                pbLoading.setVisibility(View.GONE);
                btnSubmit.setEnabled(true);
            }
        });

        dialog.show();
    }

    private void showDetailsDialog(JSONObject emp) {
        View dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_employee_details, null);
        AlertDialog dialog = new AlertDialog.Builder(this)
                .setView(dialogView)
                .create();

        TextView tvInitials = dialogView.findViewById(R.id.tvDetailsInitials);
        TextView tvName = dialogView.findViewById(R.id.tvDetailsName);
        TextView tvDesig = dialogView.findViewById(R.id.tvDetailsDesignation);
        TextView tvEmail = dialogView.findViewById(R.id.tvDetailsEmail);
        TextView tvCode = dialogView.findViewById(R.id.tvDetailsCode);
        TextView tvRole = dialogView.findViewById(R.id.tvDetailsRole);
        TextView tvDept = dialogView.findViewById(R.id.tvDetailsDept);
        TextView tvStatus = dialogView.findViewById(R.id.tvDetailsStatus);
        TextView btnClose = dialogView.findViewById(R.id.btnDetailsClose);

        String fn = emp.optString("firstName", "");
        String ln = emp.optString("lastName", "");
        tvName.setText((fn + " " + ln).trim());
        tvInitials.setText(getInitials(fn, ln));

        String desig = "";
        JSONObject desigObj = emp.optJSONObject("designation");
        if (desigObj != null) desig = desigObj.optString("name", "");
        if (desig.isEmpty()) desig = emp.optString("role", "Employee");
        tvDesig.setText(formatRole(desig));

        tvEmail.setText(emp.optString("email", "-"));
        tvCode.setText(emp.optString("employeeCode", "Unassigned"));
        tvRole.setText(formatRole(emp.optString("role", "EMPLOYEE")));

        String deptName = "Unassigned";
        JSONObject deptObj = emp.optJSONObject("department");
        if (deptObj != null) deptName = deptObj.optString("name", "Unassigned");
        tvDept.setText(deptName);

        tvStatus.setText(emp.optString("employmentStatus", "ACTIVE"));

        btnClose.setOnClickListener(v -> dialog.dismiss());
        dialog.show();
    }
}
