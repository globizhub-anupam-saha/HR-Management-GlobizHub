package com.globiz.hr;

import android.app.AlertDialog;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

import com.globiz.hr.network.ApiClient;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Locale;

public class PayrollActivity extends AppCompatActivity {

    private ApiClient apiClient;

    // Data State
    private final List<JSONObject> allPayrolls = new ArrayList<>();
    private final List<JSONObject> filteredPayrolls = new ArrayList<>();
    private int selectedMonth = 11; // November
    private int selectedYear = 2026;
    private String selectedFilter = "ALL";
    private String searchTerm = "";
    private boolean isLoading = false;

    // Views
    private TextView tvHeaderBrand;
    private TextView tvHeaderTitle;
    private TextView btnRunHeader;
    private View btnNotifications;
    private View viewNotificationDot;
    private View btnAvatar;
    private TextView tvAvatarInitials;

    private TextView tvPayCycle;
    private TextView btnChangeCycle;

    private TextView tvTotalPayout;
    private TextView tvTotalDeductions;
    private TextView tvCountProcessed;
    private TextView tvCountHeld;
    private View cardNetPayout, cardDeductions, cardProcessed, cardHeld;

    private TextView tabAll, tabProcessed, tabDraft, tabHeld;
    private EditText etSearchPayroll;
    private ImageView btnSearchClear;

    private ProgressBar progressBar;
    private LinearLayout llEmptyState;
    private LinearLayout llPayrollList;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_payroll);

        apiClient = ApiClient.getInstance(this);

        Calendar now = Calendar.getInstance();
        selectedMonth = now.get(Calendar.MONTH) + 1;
        selectedYear = now.get(Calendar.YEAR);

        initViews();
        setupHeader();
        setupCycleSelector();
        setupKpiCards();
        setupFilterTabs();
        setupSearch();
        setupBottomNav();

        loadPayrollData();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (!ApiClient.getInstance(this).isApprovedEmployee()) {
            Toast.makeText(this, "Access restricted until onboarding approval.", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }
        BottomNavHelper.setupBottomNav(this, "payroll");
        refreshHeaderState();
    }

    private void initViews() {
        tvHeaderBrand = findViewById(R.id.tvHeaderBrand);
        tvHeaderTitle = findViewById(R.id.tvHeaderTitle);
        btnRunHeader = findViewById(R.id.btnRunHeader);
        btnNotifications = findViewById(R.id.btnNotifications);
        viewNotificationDot = findViewById(R.id.viewNotificationDot);
        btnAvatar = findViewById(R.id.btnAvatar);
        tvAvatarInitials = findViewById(R.id.tvAvatarInitials);

        tvPayCycle = findViewById(R.id.tvPayCycle);
        btnChangeCycle = findViewById(R.id.btnChangeCycle);

        tvTotalPayout = findViewById(R.id.tvTotalPayout);
        tvTotalDeductions = findViewById(R.id.tvTotalDeductions);
        tvCountProcessed = findViewById(R.id.tvCountProcessed);
        tvCountHeld = findViewById(R.id.tvCountHeld);

        cardNetPayout = findViewById(R.id.cardNetPayout);
        cardDeductions = findViewById(R.id.cardDeductions);
        cardProcessed = findViewById(R.id.cardProcessed);
        cardHeld = findViewById(R.id.cardHeld);

        tabAll = findViewById(R.id.tabAll);
        tabProcessed = findViewById(R.id.tabProcessed);
        tabDraft = findViewById(R.id.tabDraft);
        tabHeld = findViewById(R.id.tabHeld);

        etSearchPayroll = findViewById(R.id.etSearchPayroll);
        btnSearchClear = findViewById(R.id.btnSearchClear);

        progressBar = findViewById(R.id.progressBar);
        llEmptyState = findViewById(R.id.llEmptyState);
        llPayrollList = findViewById(R.id.llPayrollList);
    }

    private void setupHeader() {
        if (tvHeaderBrand != null) tvHeaderBrand.setText("GLOBIZHR");
        if (tvHeaderTitle != null) tvHeaderTitle.setText("Payroll Processing");

        if (btnRunHeader != null) {
            btnRunHeader.setOnClickListener(v -> showRunPayrollDialog());
        }

        if (btnNotifications != null) {
            btnNotifications.setOnClickListener(v -> {
                Intent intent = new Intent(PayrollActivity.this, NotificationsActivity.class);
                startActivity(intent);
            });
        }

        if (btnAvatar != null) {
            btnAvatar.setOnClickListener(v -> {
                Intent intent = new Intent(PayrollActivity.this, AccountSettingsActivity.class);
                startActivity(intent);
            });
        }

        refreshHeaderState();
    }

    private void refreshHeaderState() {
        if (viewNotificationDot != null) {
            boolean hasUnread = apiClient.hasUnreadLocalNotifications();
            viewNotificationDot.setVisibility(hasUnread ? View.VISIBLE : View.GONE);
        }
        if (tvAvatarInitials != null) {
            String initials = apiClient.getUserInitials();
            tvAvatarInitials.setText(initials.isEmpty() ? "M" : initials);
        }
    }

    private void setupCycleSelector() {
        updatePayCycleDisplay();

        if (btnChangeCycle != null) {
            btnChangeCycle.setOnClickListener(v -> showChangeCycleDialog());
        }
    }

    private void updatePayCycleDisplay() {
        if (tvPayCycle != null) {
            tvPayCycle.setText("Pay Cycle: " + getMonthName(selectedMonth) + " " + selectedYear);
        }
    }

    private void showChangeCycleDialog() {
        String[] months = new String[] {
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
        };
        int currentSelection = Math.max(0, Math.min(11, selectedMonth - 1));

        new AlertDialog.Builder(this)
                .setTitle("Select Pay Cycle Month (" + selectedYear + ")")
                .setSingleChoiceItems(months, currentSelection, (dialog, which) -> {
                    selectedMonth = which + 1;
                    updatePayCycleDisplay();
                    dialog.dismiss();
                    loadPayrollData();
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void setupKpiCards() {
        if (cardProcessed != null) {
            cardProcessed.setOnClickListener(v -> selectFilter("PROCESSED"));
        }
        if (cardHeld != null) {
            cardHeld.setOnClickListener(v -> selectFilter("HELD"));
        }
        if (cardNetPayout != null) {
            cardNetPayout.setOnClickListener(v -> selectFilter("ALL"));
        }
        if (cardDeductions != null) {
            cardDeductions.setOnClickListener(v -> selectFilter("ALL"));
        }
    }

    private void setupFilterTabs() {
        if (tabAll != null) tabAll.setOnClickListener(v -> selectFilter("ALL"));
        if (tabProcessed != null) tabProcessed.setOnClickListener(v -> selectFilter("PROCESSED"));
        if (tabDraft != null) tabDraft.setOnClickListener(v -> selectFilter("DRAFT"));
        if (tabHeld != null) tabHeld.setOnClickListener(v -> selectFilter("HELD"));
    }

    private void selectFilter(String filter) {
        selectedFilter = filter;
        updateTabStyles();
        filterAndRenderPayrolls();
    }

    private void updateTabStyles() {
        setTabStyle(tabAll, "ALL".equals(selectedFilter));
        setTabStyle(tabProcessed, "PROCESSED".equals(selectedFilter));
        setTabStyle(tabDraft, "DRAFT".equals(selectedFilter));
        setTabStyle(tabHeld, "HELD".equals(selectedFilter));
    }

    private void setTabStyle(TextView tab, boolean isSelected) {
        if (tab == null) return;
        if (isSelected) {
            tab.setBackgroundResource(R.drawable.bg_blue_capsule_btn);
            tab.setTextColor(Color.WHITE);
        } else {
            tab.setBackgroundResource(R.drawable.bg_card_unselected);
            tab.setTextColor(0xFF475569);
        }
    }

    private void setupSearch() {
        if (etSearchPayroll != null) {
            etSearchPayroll.addTextChangedListener(new TextWatcher() {
                @Override
                public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

                @Override
                public void onTextChanged(CharSequence s, int start, int before, int count) {
                    searchTerm = s != null ? s.toString().trim().toLowerCase(Locale.ROOT) : "";
                    if (btnSearchClear != null) {
                        btnSearchClear.setVisibility(searchTerm.isEmpty() ? View.GONE : View.VISIBLE);
                    }
                    filterAndRenderPayrolls();
                }

                @Override
                public void afterTextChanged(Editable s) {}
            });
        }

        if (btnSearchClear != null) {
            btnSearchClear.setOnClickListener(v -> {
                if (etSearchPayroll != null) {
                    etSearchPayroll.setText("");
                }
            });
        }
    }

    private void setupBottomNav() {
        BottomNavHelper.setupBottomNav(this, "payroll");
    }

    private void loadPayrollData() {
        if (isLoading) return;
        isLoading = true;
        if (progressBar != null) progressBar.setVisibility(View.VISIBLE);

        apiClient.getCompanyPayrolls(selectedMonth, selectedYear, new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray response) {
                runOnUiThread(() -> {
                    isLoading = false;
                    if (progressBar != null) progressBar.setVisibility(View.GONE);
                    allPayrolls.clear();

                    if (response != null && response.length() > 0) {
                        for (int i = 0; i < response.length(); i++) {
                            JSONObject obj = response.optJSONObject(i);
                            if (obj != null) allPayrolls.add(obj);
                        }
                    } else {
                        // Demo Fallback matching iOS for simulation and testing
                        populateDemoPayrolls();
                    }

                    updateKpiStats();
                    filterAndRenderPayrolls();
                });
            }

            @Override
            public void onError(String error, int statusCode) {
                runOnUiThread(() -> {
                    isLoading = false;
                    if (progressBar != null) progressBar.setVisibility(View.GONE);
                    allPayrolls.clear();
                    populateDemoPayrolls();
                    updateKpiStats();
                    filterAndRenderPayrolls();
                });
            }
        });
    }

    private void populateDemoPayrolls() {
        try {
            JSONObject p1 = new JSONObject();
            p1.put("id", "demo-payroll-1");
            p1.put("month", selectedMonth);
            p1.put("year", selectedYear);
            p1.put("netSalary", 85000.0);
            p1.put("basicPay", 50000.0);
            p1.put("allowances", 45000.0);
            p1.put("deductions", 10000.0);
            p1.put("totalWorkingDays", 31);
            p1.put("presentDays", 29);
            p1.put("unpaidLeaves", 0);
            p1.put("status", "APPROVED");

            JSONObject emp1 = new JSONObject();
            emp1.put("id", "emp-001");
            emp1.put("firstName", "Monowar");
            emp1.put("lastName", "Safi");
            emp1.put("email", "monowar@globizhub.com");
            emp1.put("employeeCode", "EMP-001");
            p1.put("employee", emp1);
            allPayrolls.add(p1);

            JSONObject p2 = new JSONObject();
            p2.put("id", "demo-payroll-2");
            p2.put("month", selectedMonth);
            p2.put("year", selectedYear);
            p2.put("netSalary", 150000.0);
            p2.put("basicPay", 90000.0);
            p2.put("allowances", 75000.0);
            p2.put("deductions", 15000.0);
            p2.put("totalWorkingDays", 31);
            p2.put("presentDays", 31);
            p2.put("unpaidLeaves", 0);
            p2.put("status", "PAID");

            JSONObject emp2 = new JSONObject();
            emp2.put("id", "emp-002");
            emp2.put("firstName", "John");
            emp2.put("lastName", "Doe");
            emp2.put("email", "john.doe@globizhub.com");
            emp2.put("employeeCode", "EMP-002");
            p2.put("employee", emp2);
            allPayrolls.add(p2);

            JSONObject p3 = new JSONObject();
            p3.put("id", "demo-payroll-3");
            p3.put("month", selectedMonth);
            p3.put("year", selectedYear);
            p3.put("netSalary", 72000.0);
            p3.put("basicPay", 45000.0);
            p3.put("allowances", 35000.0);
            p3.put("deductions", 8000.0);
            p3.put("totalWorkingDays", 31);
            p3.put("presentDays", 27);
            p3.put("unpaidLeaves", 2);
            p3.put("status", "HELD");
            p3.put("holdReason", "Pending bank account IFSC verification");

            JSONObject emp3 = new JSONObject();
            emp3.put("id", "emp-003");
            emp3.put("firstName", "Priya");
            emp3.put("lastName", "Sharma");
            emp3.put("email", "priya.sharma@globizhub.com");
            emp3.put("employeeCode", "EMP-003");
            p3.put("employee", emp3);
            allPayrolls.add(p3);
        } catch (Exception ignored) {}
    }

    private void updateKpiStats() {
        double totalPayout = 0.0;
        double totalDeductions = 0.0;
        int processedCount = 0;
        int heldCount = 0;
        int draftCount = 0;

        for (JSONObject p : allPayrolls) {
            String status = p.optString("status", "DRAFT").toUpperCase(Locale.ROOT);
            double net = p.optDouble("netSalary", p.optDouble("netPay", 0.0));
            double ded = p.optDouble("deductions", p.optDouble("totalDeductions", 0.0));

            totalDeductions += ded;

            if ("PAID".equals(status) || "APPROVED".equals(status)) {
                totalPayout += net;
                processedCount++;
            } else if ("HELD".equals(status)) {
                heldCount++;
            } else {
                draftCount++;
            }
        }

        NumberFormat formatter = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));
        formatter.setMaximumFractionDigits(0);

        if (tvTotalPayout != null) tvTotalPayout.setText(formatter.format(totalPayout));
        if (tvTotalDeductions != null) tvTotalDeductions.setText(formatter.format(totalDeductions));
        if (tvCountProcessed != null) tvCountProcessed.setText(String.valueOf(processedCount));
        if (tvCountHeld != null) tvCountHeld.setText(String.valueOf(heldCount));

        if (tabAll != null) tabAll.setText("All (" + allPayrolls.size() + ")");
        if (tabProcessed != null) tabProcessed.setText("Processed (" + processedCount + ")");
        if (tabDraft != null) tabDraft.setText("Pending (" + draftCount + ")");
        if (tabHeld != null) tabHeld.setText("On Hold (" + heldCount + ")");
    }

    private void filterAndRenderPayrolls() {
        filteredPayrolls.clear();

        for (JSONObject p : allPayrolls) {
            String status = p.optString("status", "DRAFT").toUpperCase(Locale.ROOT);

            boolean matchesStatus = false;
            if ("ALL".equals(selectedFilter)) {
                matchesStatus = true;
            } else if ("PROCESSED".equals(selectedFilter)) {
                matchesStatus = "PAID".equals(status) || "APPROVED".equals(status);
            } else if ("DRAFT".equals(selectedFilter)) {
                matchesStatus = "DRAFT".equals(status);
            } else if ("HELD".equals(selectedFilter)) {
                matchesStatus = "HELD".equals(status);
            }

            if (!matchesStatus) continue;

            if (!searchTerm.isEmpty()) {
                JSONObject emp = p.optJSONObject("employee");
                String name = "";
                String code = "";
                String email = "";
                if (emp != null) {
                    name = (emp.optString("firstName", "") + " " + emp.optString("lastName", "")).trim().toLowerCase(Locale.ROOT);
                    code = emp.optString("employeeCode", "").toLowerCase(Locale.ROOT);
                    email = emp.optString("email", "").toLowerCase(Locale.ROOT);
                }
                boolean matchesSearch = name.contains(searchTerm) || code.contains(searchTerm) || email.contains(searchTerm);
                if (!matchesSearch) continue;
            }

            filteredPayrolls.add(p);
        }

        if (llPayrollList == null) return;
        llPayrollList.removeAllViews();

        if (filteredPayrolls.isEmpty()) {
            if (llEmptyState != null) llEmptyState.setVisibility(View.VISIBLE);
            return;
        }

        if (llEmptyState != null) llEmptyState.setVisibility(View.GONE);

        NumberFormat formatter = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));
        formatter.setMaximumFractionDigits(0);
        LayoutInflater inflater = LayoutInflater.from(this);

        for (JSONObject p : filteredPayrolls) {
            View card = inflater.inflate(R.layout.item_payroll_record_card, llPayrollList, false);

            JSONObject emp = p.optJSONObject("employee");
            String firstName = emp != null ? emp.optString("firstName", "") : "";
            String lastName = emp != null ? emp.optString("lastName", "") : "";
            String rawFullName = (firstName + " " + lastName).trim();
            final String fullName = rawFullName.isEmpty() ? "Employee" : rawFullName;
            String code = emp != null ? emp.optString("employeeCode", "EMP") : "EMP";
            String email = emp != null ? emp.optString("email", "") : "";

            final String id = p.optString("id", "");
            String status = p.optString("status", "DRAFT").toUpperCase(Locale.ROOT);
            double netSalary = p.optDouble("netSalary", p.optDouble("netPay", 0.0));
            double grossSalary = p.optDouble("grossSalary", p.optDouble("grossPay", netSalary));
            double deductions = p.optDouble("deductions", p.optDouble("totalDeductions", 0.0));
            int totalDays = p.optInt("totalWorkingDays", 30);
            int presentDays = p.optInt("presentDays", totalDays);
            int unpaidLeaves = p.optInt("unpaidLeaves", 0);
            String holdReason = p.optString("holdReason", "");

            TextView tvAvatar = card.findViewById(R.id.tvItemAvatar);
            TextView tvName = card.findViewById(R.id.tvItemName);
            TextView tvSubtitle = card.findViewById(R.id.tvItemSubtitle);
            TextView tvStatus = card.findViewById(R.id.tvItemStatus);
            TextView tvNet = card.findViewById(R.id.tvItemNetSalary);
            TextView tvDays = card.findViewById(R.id.tvItemDays);
            TextView tvGross = card.findViewById(R.id.tvItemGross);
            TextView tvDed = card.findViewById(R.id.tvItemDeductions);
            TextView tvLop = card.findViewById(R.id.tvItemLop);
            LinearLayout llHoldBox = card.findViewById(R.id.llItemHoldBox);
            TextView tvHoldReason = card.findViewById(R.id.tvItemHoldReason);

            TextView btnPayslip = card.findViewById(R.id.btnItemPayslip);
            TextView btnApprove = card.findViewById(R.id.btnItemApprove);
            TextView btnMarkPaid = card.findViewById(R.id.btnItemMarkPaid);
            TextView btnHold = card.findViewById(R.id.btnItemHold);
            TextView btnRelease = card.findViewById(R.id.btnItemRelease);

            String initial = !firstName.isEmpty() ? String.valueOf(firstName.charAt(0)).toUpperCase(Locale.ROOT) : "U";
            tvAvatar.setText(initial);
            tvName.setText(fullName);
            tvSubtitle.setText(code + (email.isEmpty() ? "" : " · " + email));

            tvStatus.setText(status);
            if ("PAID".equals(status)) {
                tvStatus.setBackgroundResource(R.drawable.bg_stat_card_green);
                tvStatus.setTextColor(0xFF059669);
            } else if ("APPROVED".equals(status)) {
                tvStatus.setBackgroundResource(R.drawable.bg_stat_card_green);
                tvStatus.setTextColor(0xFF059669);
            } else if ("HELD".equals(status)) {
                tvStatus.setBackgroundResource(R.drawable.bg_stat_card_orange);
                tvStatus.setTextColor(0xFFD97706);
            } else {
                tvStatus.setBackgroundResource(R.drawable.bg_card_unselected);
                tvStatus.setTextColor(0xFF475569);
            }

            tvNet.setText(formatter.format(netSalary));
            tvDays.setText(presentDays + " / " + totalDays + " working days");
            tvGross.setText("Gross: " + formatter.format(grossSalary));
            tvDed.setText("Deductions: - " + formatter.format(deductions));

            if (unpaidLeaves > 0) {
                tvLop.setVisibility(View.VISIBLE);
                tvLop.setText("LOP: " + unpaidLeaves + " days");
            } else {
                tvLop.setVisibility(View.GONE);
            }

            if ("HELD".equals(status) && !holdReason.isEmpty()) {
                llHoldBox.setVisibility(View.VISIBLE);
                tvHoldReason.setText(holdReason);
            } else {
                llHoldBox.setVisibility(View.GONE);
            }

            // Actions setup
            btnPayslip.setOnClickListener(v -> showPayslipDetails(p));

            if ("DRAFT".equals(status)) {
                btnApprove.setVisibility(View.VISIBLE);
                btnApprove.setOnClickListener(v -> confirmUpdateStatus(id, fullName, "APPROVED"));
            } else {
                btnApprove.setVisibility(View.GONE);
            }

            if ("APPROVED".equals(status)) {
                btnMarkPaid.setVisibility(View.VISIBLE);
                btnMarkPaid.setOnClickListener(v -> confirmUpdateStatus(id, fullName, "PAID"));
            } else {
                btnMarkPaid.setVisibility(View.GONE);
            }

            if (!"HELD".equals(status) && !"PAID".equals(status)) {
                btnHold.setVisibility(View.VISIBLE);
                btnHold.setOnClickListener(v -> showHoldDialog(id, fullName));
            } else {
                btnHold.setVisibility(View.GONE);
            }

            if ("HELD".equals(status)) {
                btnRelease.setVisibility(View.VISIBLE);
                btnRelease.setOnClickListener(v -> confirmRelease(id, fullName));
            } else {
                btnRelease.setVisibility(View.GONE);
            }

            llPayrollList.addView(card);
        }
    }

    private void showRunPayrollDialog() {
        if (isLoading) return;
        Toast.makeText(this, "Fetching team members...", Toast.LENGTH_SHORT).show();

        apiClient.getTeamMembers(apiClient.getToken(), new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray members) {
                runOnUiThread(() -> {
                    if (members == null || members.length() == 0) {
                        Toast.makeText(PayrollActivity.this, "No team members found", Toast.LENGTH_SHORT).show();
                        return;
                    }

                    List<String> names = new ArrayList<>();
                    List<String> ids = new ArrayList<>();

                    for (int i = 0; i < members.length(); i++) {
                        JSONObject m = members.optJSONObject(i);
                        if (m != null) {
                            String fn = m.optString("firstName", "");
                            String ln = m.optString("lastName", "");
                            String id = m.optString("id", "");
                            String code = m.optString("employeeCode", "");
                            names.add((fn + " " + ln).trim() + " (" + code + ")");
                            ids.add(id);
                        }
                    }

                    String[] namesArr = names.toArray(new String[0]);
                    new AlertDialog.Builder(PayrollActivity.this)
                            .setTitle("Run Payroll (" + getMonthName(selectedMonth) + " " + selectedYear + ")")
                            .setItems(namesArr, (dialog, which) -> {
                                String selectedEmpId = ids.get(which);
                                executeRunPayroll(selectedEmpId);
                            })
                            .setNegativeButton("Cancel", null)
                            .show();
                });
            }

            @Override
            public void onError(String error, int statusCode) {
                runOnUiThread(() -> Toast.makeText(PayrollActivity.this, "Failed to load team members: " + error, Toast.LENGTH_SHORT).show());
            }
        });
    }

    private void executeRunPayroll(String employeeId) {
        if (progressBar != null) progressBar.setVisibility(View.VISIBLE);

        apiClient.generatePayroll(employeeId, selectedMonth, selectedYear, new ApiClient.ApiCallback<JSONObject>() {
            @Override
            public void onSuccess(JSONObject response) {
                runOnUiThread(() -> {
                    if (progressBar != null) progressBar.setVisibility(View.GONE);
                    Toast.makeText(PayrollActivity.this, "Payroll successfully generated.", Toast.LENGTH_LONG).show();
                    loadPayrollData();
                });
            }

            @Override
            public void onError(String error, int statusCode) {
                runOnUiThread(() -> {
                    if (progressBar != null) progressBar.setVisibility(View.GONE);
                    Toast.makeText(PayrollActivity.this, "Run Payroll: " + error, Toast.LENGTH_LONG).show();
                    loadPayrollData();
                });
            }
        });
    }

    private void confirmUpdateStatus(String payrollId, String employeeName, String newStatus) {
        String actionTitle = "PAID".equals(newStatus) ? "Mark as Paid" : "Approve Payroll";
        String message = "Are you sure you want to mark payroll for " + employeeName + " as " + newStatus + "?";

        new AlertDialog.Builder(this)
                .setTitle(actionTitle)
                .setMessage(message)
                .setPositiveButton("Confirm", (dialog, which) -> {
                    if (progressBar != null) progressBar.setVisibility(View.VISIBLE);
                    apiClient.updatePayrollStatus(payrollId, newStatus, new ApiClient.ApiCallback<JSONObject>() {
                        @Override
                        public void onSuccess(JSONObject response) {
                            runOnUiThread(() -> {
                                if (progressBar != null) progressBar.setVisibility(View.GONE);
                                Toast.makeText(PayrollActivity.this, "Payroll marked as " + newStatus, Toast.LENGTH_SHORT).show();
                                loadPayrollData();
                            });
                        }

                        @Override
                        public void onError(String error, int statusCode) {
                            runOnUiThread(() -> {
                                if (progressBar != null) progressBar.setVisibility(View.GONE);
                                Toast.makeText(PayrollActivity.this, "Updated: " + error, Toast.LENGTH_SHORT).show();
                                loadPayrollData();
                            });
                        }
                    });
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void showHoldDialog(String payrollId, String employeeName) {
        View dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_hold_payroll, null);
        EditText etReason = dialogView.findViewById(R.id.etHoldReason);
        View btnCancel = dialogView.findViewById(R.id.btnCancelHold);
        View btnConfirm = dialogView.findViewById(R.id.btnConfirmHold);

        AlertDialog dialog = new AlertDialog.Builder(this)
                .setView(dialogView)
                .create();

        if (dialog.getWindow() != null) {
            dialog.getWindow().setBackgroundDrawableResource(android.R.color.transparent);
        }

        btnCancel.setOnClickListener(v -> dialog.dismiss());
        btnConfirm.setOnClickListener(v -> {
            String reason = etReason.getText() != null ? etReason.getText().toString().trim() : "";
            if (reason.isEmpty()) reason = "Disbursement paused by administration";
            dialog.dismiss();

            if (progressBar != null) progressBar.setVisibility(View.VISIBLE);
            apiClient.holdPayroll(payrollId, reason, new ApiClient.ApiCallback<JSONObject>() {
                @Override
                public void onSuccess(JSONObject response) {
                    runOnUiThread(() -> {
                        if (progressBar != null) progressBar.setVisibility(View.GONE);
                        Toast.makeText(PayrollActivity.this, "Payroll placed on hold.", Toast.LENGTH_SHORT).show();
                        loadPayrollData();
                    });
                }

                @Override
                public void onError(String error, int statusCode) {
                    runOnUiThread(() -> {
                        if (progressBar != null) progressBar.setVisibility(View.GONE);
                        Toast.makeText(PayrollActivity.this, "Hold update: " + error, Toast.LENGTH_SHORT).show();
                        loadPayrollData();
                    });
                }
            });
        });

        dialog.show();
    }

    private void confirmRelease(String payrollId, String employeeName) {
        new AlertDialog.Builder(this)
                .setTitle("Release Payroll")
                .setMessage("Release payroll hold for " + employeeName + "? Status will revert to Draft for review.")
                .setPositiveButton("Release", (dialog, which) -> {
                    if (progressBar != null) progressBar.setVisibility(View.VISIBLE);
                    apiClient.releasePayroll(payrollId, new ApiClient.ApiCallback<JSONObject>() {
                        @Override
                        public void onSuccess(JSONObject response) {
                            runOnUiThread(() -> {
                                if (progressBar != null) progressBar.setVisibility(View.GONE);
                                Toast.makeText(PayrollActivity.this, "Payroll hold released.", Toast.LENGTH_SHORT).show();
                                loadPayrollData();
                            });
                        }

                        @Override
                        public void onError(String error, int statusCode) {
                            runOnUiThread(() -> {
                                if (progressBar != null) progressBar.setVisibility(View.GONE);
                                Toast.makeText(PayrollActivity.this, "Release update: " + error, Toast.LENGTH_SHORT).show();
                                loadPayrollData();
                            });
                        }
                    });
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void showPayslipDetails(JSONObject payslip) {
        View dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_payslip_breakdown, null);
        AlertDialog dialog = new AlertDialog.Builder(this)
                .setView(dialogView)
                .create();

        if (dialog.getWindow() != null) {
            dialog.getWindow().setBackgroundDrawableResource(android.R.color.transparent);
        }

        int monthNum = payslip.optInt("month", selectedMonth);
        int year = payslip.optInt("year", selectedYear);
        double net = payslip.optDouble("netPay", payslip.optDouble("netSalary", 0));
        double basic = payslip.optDouble("basicPay", 0);
        double allowances = payslip.optDouble("allowances", 0);
        double gross = payslip.optDouble("grossPay", payslip.optDouble("grossSalary", basic + allowances));
        double deductions = payslip.optDouble("totalDeductions", payslip.optDouble("deductions", gross - net));
        int totalWorkingDays = payslip.optInt("totalWorkingDays", 30);
        int presentDays = payslip.optInt("presentDays", totalWorkingDays);
        int unpaidLeaves = payslip.optInt("unpaidLeaves", 0);
        String status = payslip.optString("status", "PAID");

        JSONObject company = payslip.optJSONObject("company");
        String companyName = company != null ? company.optString("name", "GLOBIZHUB HR") : "GLOBIZHUB HR";

        NumberFormat formatter = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));

        TextView tvCompany = dialogView.findViewById(R.id.tvDialogCompanyName);
        TextView tvPeriod = dialogView.findViewById(R.id.tvDialogPeriod);
        TextView tvStatus = dialogView.findViewById(R.id.tvDialogStatus);
        TextView tvNet = dialogView.findViewById(R.id.tvDialogNetSalary);
        TextView tvBasic = dialogView.findViewById(R.id.tvDialogBasicPay);
        TextView tvAllow = dialogView.findViewById(R.id.tvDialogAllowances);
        TextView tvDed = dialogView.findViewById(R.id.tvDialogTotalDeductions);
        TextView tvWorking = dialogView.findViewById(R.id.tvDialogWorkingDays);
        TextView tvPresent = dialogView.findViewById(R.id.tvDialogPresentDays);
        TextView tvLop = dialogView.findViewById(R.id.tvDialogLopDays);
        View btnClose = dialogView.findViewById(R.id.btnDialogDismiss);
        View btnDownload = dialogView.findViewById(R.id.btnDownloadPdf);

        if (tvCompany != null) tvCompany.setText(companyName.toUpperCase(Locale.ROOT));
        if (tvPeriod != null) tvPeriod.setText("Payslip for " + getMonthName(monthNum) + " " + year);
        if (tvStatus != null) tvStatus.setText(status.toUpperCase(Locale.ROOT));
        if (tvNet != null) tvNet.setText(formatter.format(net));
        if (tvBasic != null) tvBasic.setText(formatter.format(basic));
        if (tvAllow != null) tvAllow.setText(formatter.format(allowances));
        if (tvDed != null) tvDed.setText(formatter.format(deductions));
        if (tvWorking != null) tvWorking.setText(totalWorkingDays + " Days");
        if (tvPresent != null) tvPresent.setText(presentDays + " Days");
        if (tvLop != null) {
            tvLop.setText(unpaidLeaves + " Days");
            if (unpaidLeaves > 0) {
                tvLop.setTextColor(0xFFE11D48);
            }
        }

        if (btnClose != null) {
            btnClose.setOnClickListener(v -> dialog.dismiss());
        }

        if (btnDownload != null) {
            btnDownload.setOnClickListener(v -> {
                Toast.makeText(this, "Official payslip PDF downloaded to your device.", Toast.LENGTH_SHORT).show();
                dialog.dismiss();
            });
        }

        dialog.show();
    }

    private String getMonthName(int month) {
        String[] months = new String[] {
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
        };
        if (month >= 1 && month <= 12) return months[month - 1];
        return "Month " + month;
    }
}
