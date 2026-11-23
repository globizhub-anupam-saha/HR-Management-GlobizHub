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

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;

public class ApprovalsActivity extends AppCompatActivity {

    private ApiClient apiClient;

    // Data State
    private final List<JSONObject> allLeaves = new ArrayList<>();
    private final List<JSONObject> filteredLeaves = new ArrayList<>();
    private String selectedStatus = "PENDING";
    private String searchTerm = "";
    private boolean isLoading = false;

    // Views
    private TextView tvCountPending, tvCountApproved, tvCountRejected, tvCountAll;
    private View cardPending, cardApproved, cardRejected, cardAll;
    private TextView tabPending, tabApproved, tabRejected, tabAll;
    private EditText etSearchApprovals;
    private ImageView btnSearchClear;
    private ProgressBar progressBar;
    private LinearLayout llEmptyState;
    private LinearLayout llApprovalsList;
    private View btnNotifications;
    private View viewNotificationDot;
    private View btnAvatar;
    private TextView tvAvatarInitials;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_approvals);

        apiClient = ApiClient.getInstance(this);

        initViews();
        setupHeader();
        setupKpiCards();
        setupFilterTabs();
        setupSearch();
        setupBottomNav();

        loadApprovalsData();
    }

    @Override
    protected void onResume() {
        super.onResume();
        BottomNavHelper.setupBottomNav(this, "approvals");
        refreshHeaderState();
        loadApprovalsData();
    }

    private void initViews() {
        tvCountPending = findViewById(R.id.tvCountPending);
        tvCountApproved = findViewById(R.id.tvCountApproved);
        tvCountRejected = findViewById(R.id.tvCountRejected);
        tvCountAll = findViewById(R.id.tvCountAll);

        cardPending = findViewById(R.id.cardPending);
        cardApproved = findViewById(R.id.cardApproved);
        cardRejected = findViewById(R.id.cardRejected);
        cardAll = findViewById(R.id.cardAll);

        tabPending = findViewById(R.id.tabPending);
        tabApproved = findViewById(R.id.tabApproved);
        tabRejected = findViewById(R.id.tabRejected);
        tabAll = findViewById(R.id.tabAll);

        etSearchApprovals = findViewById(R.id.etSearchApprovals);
        btnSearchClear = findViewById(R.id.btnSearchClear);
        progressBar = findViewById(R.id.progressBar);
        llEmptyState = findViewById(R.id.llEmptyState);
        llApprovalsList = findViewById(R.id.llApprovalsList);

        btnNotifications = findViewById(R.id.btnNotifications);
        viewNotificationDot = findViewById(R.id.viewNotificationDot);
        btnAvatar = findViewById(R.id.btnAvatar);
        tvAvatarInitials = findViewById(R.id.tvAvatarInitials);
    }

    private void setupHeader() {
        btnNotifications.setOnClickListener(v -> startActivity(new Intent(ApprovalsActivity.this, NotificationsActivity.class)));
        btnAvatar.setOnClickListener(v -> startActivity(new Intent(ApprovalsActivity.this, AccountSettingsActivity.class)));
        refreshHeaderState();
    }

    private void refreshHeaderState() {
        if (viewNotificationDot != null) {
            viewNotificationDot.setVisibility(apiClient.hasUnreadLocalNotifications() ? View.VISIBLE : View.GONE);
        }

        if (tvAvatarInitials != null) {
            String initials = apiClient.getUserInitials();
            tvAvatarInitials.setText(initials.isEmpty() ? "U" : initials);
        }
    }

    private void setupKpiCards() {
        cardPending.setOnClickListener(v -> selectStatusTab("PENDING"));
        cardApproved.setOnClickListener(v -> selectStatusTab("APPROVED"));
        cardRejected.setOnClickListener(v -> selectStatusTab("REJECTED"));
        cardAll.setOnClickListener(v -> selectStatusTab("ALL"));
    }

    private void setupFilterTabs() {
        tabPending.setOnClickListener(v -> selectStatusTab("PENDING"));
        tabApproved.setOnClickListener(v -> selectStatusTab("APPROVED"));
        tabRejected.setOnClickListener(v -> selectStatusTab("REJECTED"));
        tabAll.setOnClickListener(v -> selectStatusTab("ALL"));
        updateFilterTabsUI();
    }

    private void selectStatusTab(String status) {
        selectedStatus = status;
        updateFilterTabsUI();
        applyFilters();
    }

    private void updateFilterTabsUI() {
        updateTabStyle(tabPending, "PENDING".equalsIgnoreCase(selectedStatus));
        updateTabStyle(tabApproved, "APPROVED".equalsIgnoreCase(selectedStatus));
        updateTabStyle(tabRejected, "REJECTED".equalsIgnoreCase(selectedStatus));
        updateTabStyle(tabAll, "ALL".equalsIgnoreCase(selectedStatus));
    }

    private void updateTabStyle(TextView tab, boolean isSelected) {
        if (tab == null) return;
        if (isSelected) {
            tab.setBackground(ContextCompat.getDrawable(this, R.drawable.bg_blue_capsule_btn));
            tab.setTextColor(Color.WHITE);
        } else {
            tab.setBackground(ContextCompat.getDrawable(this, R.drawable.bg_card_unselected));
            tab.setTextColor(Color.parseColor("#475569"));
        }
    }

    private void setupSearch() {
        etSearchApprovals.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                searchTerm = s != null ? s.toString().trim().toLowerCase(Locale.ROOT) : "";
                btnSearchClear.setVisibility(searchTerm.isEmpty() ? View.GONE : View.VISIBLE);
                applyFilters();
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });

        btnSearchClear.setOnClickListener(v -> etSearchApprovals.setText(""));
    }

    private void setupBottomNav() {
        BottomNavHelper.setupBottomNav(this, "approvals");
    }

    private void loadApprovalsData() {
        if (isLoading) return;
        isLoading = true;
        progressBar.setVisibility(View.VISIBLE);

        apiClient.getCompanyLeaves(new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray result) {
                runOnUiThread(() -> {
                    isLoading = false;
                    progressBar.setVisibility(View.GONE);
                    allLeaves.clear();
                    if (result != null) {
                        for (int i = 0; i < result.length(); i++) {
                            JSONObject item = result.optJSONObject(i);
                            if (item != null) allLeaves.add(item);
                        }
                    }
                    updateKpiCounts();
                    applyFilters();
                });
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                runOnUiThread(() -> {
                    isLoading = false;
                    progressBar.setVisibility(View.GONE);
                    Toast.makeText(ApprovalsActivity.this, "Failed to load leave requests: " + errorMessage, Toast.LENGTH_SHORT).show();
                    applyFilters();
                });
            }
        });
    }

    private void updateKpiCounts() {
        int pending = 0;
        int approved = 0;
        int rejected = 0;

        for (JSONObject leave : allLeaves) {
            String status = leave.optString("status", "").toUpperCase(Locale.ROOT);
            if ("PENDING".equals(status)) {
                pending++;
            } else if ("APPROVED".equals(status)) {
                approved++;
            } else if ("REJECTED".equals(status)) {
                rejected++;
            }
        }

        tvCountPending.setText(String.valueOf(pending));
        tvCountApproved.setText(String.valueOf(approved));
        tvCountRejected.setText(String.valueOf(rejected));
        tvCountAll.setText(String.valueOf(allLeaves.size()));

        tabPending.setText("Pending (" + pending + ")");
        tabApproved.setText("Approved (" + approved + ")");
        tabRejected.setText("Rejected (" + rejected + ")");
        tabAll.setText("All (" + allLeaves.size() + ")");
    }

    private void applyFilters() {
        filteredLeaves.clear();

        for (JSONObject leave : allLeaves) {
            String status = leave.optString("status", "").toUpperCase(Locale.ROOT);

            // Filter by status tab
            if (!"ALL".equalsIgnoreCase(selectedStatus) && !selectedStatus.equalsIgnoreCase(status)) {
                continue;
            }

            // Filter by search query
            if (!searchTerm.isEmpty()) {
                JSONObject emp = leave.optJSONObject("employee");
                String firstName = emp != null ? emp.optString("firstName", "").toLowerCase(Locale.ROOT) : "";
                String lastName = emp != null ? emp.optString("lastName", "").toLowerCase(Locale.ROOT) : "";
                String code = emp != null ? emp.optString("employeeCode", "").toLowerCase(Locale.ROOT) : "";
                String email = emp != null ? emp.optString("email", "").toLowerCase(Locale.ROOT) : "";
                String leaveType = leave.optString("type", "").toLowerCase(Locale.ROOT);
                String reason = leave.optString("reason", "").toLowerCase(Locale.ROOT);

                boolean matches = firstName.contains(searchTerm) ||
                        lastName.contains(searchTerm) ||
                        code.contains(searchTerm) ||
                        email.contains(searchTerm) ||
                        leaveType.contains(searchTerm) ||
                        reason.contains(searchTerm);

                if (!matches) continue;
            }

            filteredLeaves.add(leave);
        }

        renderApprovalsList();
    }

    private void renderApprovalsList() {
        llApprovalsList.removeAllViews();

        if (filteredLeaves.isEmpty()) {
            llEmptyState.setVisibility(View.VISIBLE);
            return;
        }

        llEmptyState.setVisibility(View.GONE);
        LayoutInflater inflater = LayoutInflater.from(this);

        for (JSONObject leave : filteredLeaves) {
            View card = inflater.inflate(R.layout.item_leave_approval_card, llApprovalsList, false);

            TextView tvAvatar = card.findViewById(R.id.tvItemAvatar);
            TextView tvName = card.findViewById(R.id.tvItemName);
            TextView tvSubtitle = card.findViewById(R.id.tvItemSubtitle);
            TextView tvStatus = card.findViewById(R.id.tvItemStatus);
            TextView tvType = card.findViewById(R.id.tvItemType);
            TextView tvDates = card.findViewById(R.id.tvItemDates);
            TextView tvDays = card.findViewById(R.id.tvItemDays);
            TextView tvReason = card.findViewById(R.id.tvItemReason);
            View llRejectionBox = card.findViewById(R.id.llItemRejectionBox);
            TextView tvRejectionReason = card.findViewById(R.id.tvItemRejectionReason);
            View llActionsRow = card.findViewById(R.id.llItemActionsRow);
            TextView btnApprove = card.findViewById(R.id.btnItemApprove);
            TextView btnReject = card.findViewById(R.id.btnItemReject);

            String leaveId = leave.optString("id", "");
            String status = leave.optString("status", "PENDING").toUpperCase(Locale.ROOT);
            String leaveType = leave.optString("type", "LEAVE").toUpperCase(Locale.ROOT);
            String startDate = leave.optString("startDate", "");
            String endDate = leave.optString("endDate", "");
            int totalDays = leave.optInt("totalDays", leave.optInt("days", 1));
            String reason = leave.optString("reason", "No reason provided");
            String rejectionReason = leave.optString("rejectionReason", "");

            JSONObject emp = leave.optJSONObject("employee");
            String firstName = emp != null ? emp.optString("firstName", "Staff") : "Staff";
            String lastName = emp != null ? emp.optString("lastName", "") : "";
            String fullName = (firstName + " " + lastName).trim();
            String empCode = emp != null ? emp.optString("employeeCode", "") : "";
            String email = emp != null ? emp.optString("email", "") : "";

            // Avatar & Name
            tvAvatar.setText(firstName.isEmpty() ? "U" : firstName.substring(0, 1).toUpperCase(Locale.ROOT));
            tvName.setText(fullName.isEmpty() ? "Employee" : fullName);

            String subtitle = "";
            if (!empCode.isEmpty()) subtitle += empCode;
            if (!email.isEmpty()) subtitle += (subtitle.isEmpty() ? "" : " · ") + email;
            tvSubtitle.setText(subtitle.isEmpty() ? "Employee" : subtitle);

            // Status Pill
            tvStatus.setText(status);
            if ("APPROVED".equals(status)) {
                tvStatus.setBackground(ContextCompat.getDrawable(this, R.drawable.bg_stat_card_green));
                tvStatus.setTextColor(Color.parseColor("#059669"));
            } else if ("REJECTED".equals(status)) {
                tvStatus.setBackground(ContextCompat.getDrawable(this, R.drawable.bg_stat_card_red));
                tvStatus.setTextColor(Color.parseColor("#DC2626"));
            } else if ("WITHDRAWN".equals(status)) {
                tvStatus.setBackground(ContextCompat.getDrawable(this, R.drawable.bg_card_unselected));
                tvStatus.setTextColor(Color.parseColor("#64748B"));
            } else {
                tvStatus.setBackground(ContextCompat.getDrawable(this, R.drawable.bg_stat_card_orange));
                tvStatus.setTextColor(Color.parseColor("#D97706"));
            }

            // Details Pills
            tvType.setText(leaveType);
            tvDates.setText(formatDateRange(startDate, endDate));
            tvDays.setText(totalDays + (totalDays == 1 ? " day" : " days"));
            tvReason.setText("Reason: " + reason);

            // Rejection reason callout
            if ("REJECTED".equals(status) && !rejectionReason.isEmpty()) {
                llRejectionBox.setVisibility(View.VISIBLE);
                tvRejectionReason.setText("Rejection Reason: " + rejectionReason);
            } else {
                llRejectionBox.setVisibility(View.GONE);
            }

            // Actions row (Shown only for PENDING)
            if ("PENDING".equals(status)) {
                llActionsRow.setVisibility(View.VISIBLE);

                btnApprove.setOnClickListener(v -> {
                    btnApprove.setEnabled(false);
                    btnApprove.setAlpha(0.6f);
                    apiClient.updateLeaveStatus(leaveId, "APPROVED", new ApiClient.ApiCallback<JSONObject>() {
                        @Override
                        public void onSuccess(JSONObject result) {
                            runOnUiThread(() -> {
                                Toast.makeText(ApprovalsActivity.this, "Leave approved successfully", Toast.LENGTH_SHORT).show();
                                loadApprovalsData();
                            });
                        }

                        @Override
                        public void onError(String errorMessage, int statusCode) {
                            runOnUiThread(() -> {
                                btnApprove.setEnabled(true);
                                btnApprove.setAlpha(1.0f);
                                Toast.makeText(ApprovalsActivity.this, "Failed to approve: " + errorMessage, Toast.LENGTH_SHORT).show();
                            });
                        }
                    });
                });

                btnReject.setOnClickListener(v -> showRejectDialog(leaveId));
            } else {
                llActionsRow.setVisibility(View.GONE);
            }

            llApprovalsList.addView(card);
        }
    }

    private void showRejectDialog(String leaveId) {
        View dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_reject_leave, null);
        AlertDialog dialog = new AlertDialog.Builder(this)
                .setView(dialogView)
                .create();

        if (dialog.getWindow() != null) {
            dialog.getWindow().setBackgroundDrawableResource(android.R.color.transparent);
        }

        EditText etReason = dialogView.findViewById(R.id.etRejectionReason);
        View btnCancel = dialogView.findViewById(R.id.btnCancelReject);
        View btnConfirm = dialogView.findViewById(R.id.btnConfirmReject);

        btnCancel.setOnClickListener(v -> dialog.dismiss());

        btnConfirm.setOnClickListener(v -> {
            String reason = etReason.getText() != null ? etReason.getText().toString().trim() : "";
            dialog.dismiss();

            apiClient.updateLeaveStatus(leaveId, "REJECTED", reason, new ApiClient.ApiCallback<JSONObject>() {
                @Override
                public void onSuccess(JSONObject result) {
                    runOnUiThread(() -> {
                        Toast.makeText(ApprovalsActivity.this, "Leave rejected successfully", Toast.LENGTH_SHORT).show();
                        loadApprovalsData();
                    });
                }

                @Override
                public void onError(String errorMessage, int statusCode) {
                    runOnUiThread(() -> {
                        Toast.makeText(ApprovalsActivity.this, "Failed to reject: " + errorMessage, Toast.LENGTH_SHORT).show();
                    });
                }
            });
        });

        dialog.show();
    }

    private String formatDateRange(String start, String end) {
        String s = parseIsoDate(start);
        String e = parseIsoDate(end);
        if (s.equals(e)) {
            return s;
        }
        return s + " → " + e;
    }

    private String parseIsoDate(String iso) {
        if (iso == null || iso.isEmpty()) return "";
        try {
            SimpleDateFormat inFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
            inFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
            Date date = inFormat.parse(iso);
            if (date == null) {
                inFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US);
                inFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
                date = inFormat.parse(iso);
            }
            if (date != null) {
                SimpleDateFormat outFormat = new SimpleDateFormat("dd/MM/yyyy", Locale.US);
                return outFormat.format(date);
            }
        } catch (Exception ignored) {
            if (iso.contains("T")) {
                return iso.split("T")[0];
            }
        }
        return iso;
    }
}
