package com.globiz.hr;

import android.app.AlertDialog;
import android.app.DatePickerDialog;
import android.os.Bundle;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.RelativeLayout;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.globiz.hr.network.ApiClient;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

public class LeaveActivity extends AppCompatActivity {

    private ApiClient apiClient;
    private TextView tvLeaveYear;
    private TextView tvCasualCount;
    private TextView tvSickCount;
    private TextView tvEarnedCount;
    private LinearLayout llRecentLeavesList;
    private LinearLayout llLeaveHistoryEmpty;

    private final SimpleDateFormat apiDateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
    private final SimpleDateFormat displayDateFormat = new SimpleDateFormat("MMM d, yyyy", Locale.US);

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_leave);

        apiClient = ApiClient.getInstance(this);
        tvLeaveYear = findViewById(R.id.tvLeaveYear);
        tvCasualCount = findViewById(R.id.tvCasualCount);
        tvSickCount = findViewById(R.id.tvSickCount);
        tvEarnedCount = findViewById(R.id.tvEarnedCount);
        llRecentLeavesList = findViewById(R.id.llRecentLeavesList);
        llLeaveHistoryEmpty = findViewById(R.id.llLeaveHistoryEmpty);

        int currentYear = Calendar.getInstance().get(Calendar.YEAR);
        if (tvLeaveYear != null) {
            tvLeaveYear.setText("Year " + currentYear);
        }

        // Unified GlobizHR Header
        AppHeaderHelper.setupHeader(this, "Leaves", false);

        setupBottomNav();
        setupListeners();
        loadLeaveBalances();
        loadLeaveHistory();
        NavBarScrollHelper.attachToScrollView(findViewById(R.id.scrollView), findViewById(R.id.bottomNavBar));
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (!ApiClient.getInstance(this).isApprovedEmployee()) {
            Toast.makeText(this, "Access restricted until onboarding approval.", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }
        BottomNavHelper.setupBottomNav(this, "leave");
        AppHeaderHelper.refreshHeaderState(this);
        loadLeaveBalances();
        loadLeaveHistory();
    }

    private void loadLeaveBalances() {
        apiClient.getLeaveBalanceObject(new ApiClient.ApiCallback<JSONObject>() {
            @Override
            public void onSuccess(JSONObject result) {
                runOnUiThread(() -> {
                    try {
                        int casual = result.optInt("casual", 0);
                        int medical = result.optInt("medical", 0);
                        int earned = result.optInt("earned", 0);

                        if (tvCasualCount != null) tvCasualCount.setText(String.valueOf(casual));
                        if (tvSickCount != null) tvSickCount.setText(String.valueOf(medical));
                        if (tvEarnedCount != null) tvEarnedCount.setText(String.valueOf(earned));
                    } catch (Exception ignored) {}
                });
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                // Fallback to array endpoint if needed
                apiClient.getLeaveBalance(new ApiClient.ApiCallback<JSONArray>() {
                    @Override
                    public void onSuccess(JSONArray result) {
                        runOnUiThread(() -> {
                            try {
                                for (int i = 0; i < result.length(); i++) {
                                    JSONObject item = result.optJSONObject(i);
                                    if (item != null) {
                                        String type = item.optString("leaveType", item.optString("type", "")).toUpperCase();
                                        int remaining = item.optInt("remainingDays", item.optInt("balance", 0));
                                        if (type.contains("CASUAL") && tvCasualCount != null) {
                                            tvCasualCount.setText(String.valueOf(Math.max(0, remaining)));
                                        } else if ((type.contains("SICK") || type.contains("MEDICAL")) && tvSickCount != null) {
                                            tvSickCount.setText(String.valueOf(Math.max(0, remaining)));
                                        } else if ((type.contains("EARNED") || type.contains("ANNUAL")) && tvEarnedCount != null) {
                                            tvEarnedCount.setText(String.valueOf(Math.max(0, remaining)));
                                        }
                                    }
                                }
                            } catch (Exception ignored) {}
                        });
                    }

                    @Override
                    public void onError(String errorMessage, int statusCode) {
                        runOnUiThread(() -> {
                            if (tvCasualCount != null && tvCasualCount.getText().equals("0")) tvCasualCount.setText("0");
                            if (tvSickCount != null && tvSickCount.getText().equals("0")) tvSickCount.setText("0");
                            if (tvEarnedCount != null && tvEarnedCount.getText().equals("0")) tvEarnedCount.setText("0");
                        });
                    }
                });
            }
        });
    }

    private void loadLeaveHistory() {
        apiClient.getMyLeaves(new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray result) {
                runOnUiThread(() -> renderLeaveHistory(result));
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                runOnUiThread(() -> {
                    if (llRecentLeavesList != null && llRecentLeavesList.getChildCount() == 0) {
                        if (llLeaveHistoryEmpty != null) llLeaveHistoryEmpty.setVisibility(View.VISIBLE);
                    }
                });
            }
        });
    }

    private void renderLeaveHistory(JSONArray records) {
        if (llRecentLeavesList == null) return;
        llRecentLeavesList.removeAllViews();

        if (records == null || records.length() == 0) {
            if (llLeaveHistoryEmpty != null) llLeaveHistoryEmpty.setVisibility(View.VISIBLE);
            return;
        }

        if (llLeaveHistoryEmpty != null) llLeaveHistoryEmpty.setVisibility(View.GONE);

        for (int i = 0; i < records.length(); i++) {
            JSONObject item = records.optJSONObject(i);
            if (item == null) continue;

            View cardView = createLeaveHistoryCard(item);
            if (cardView != null) {
                llRecentLeavesList.addView(cardView);
            }
        }
    }

    private View createLeaveHistoryCard(JSONObject item) {
        String id = item.optString("id", "");
        String rawType = item.optString("type", "CASUAL").toUpperCase();
        String status = item.optString("status", "PENDING").toUpperCase();
        String startDateStr = item.optString("startDate", "");
        String endDateStr = item.optString("endDate", "");
        double totalDays = item.optDouble("totalDays", 1.0);
        String reason = item.optString("reason", "No reason provided");
        String rejectionReason = item.optString("rejectionReason", "");

        String displayType = formatLeaveType(rawType);
        String dateRangeText = formatDateRange(startDateStr, endDateStr);
        String daysText = (totalDays == 0.5) ? "0.5 days" : (int) totalDays + (totalDays == 1.0 ? " day" : " days");

        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        params.topMargin = dpToPx(10);
        card.setLayoutParams(params);
        card.setBackgroundResource(R.drawable.bg_day_pill_inactive);
        card.setPadding(dpToPx(14), dpToPx(12), dpToPx(14), dpToPx(12));

        // Top Row: Type & Status Pill
        RelativeLayout topRow = new RelativeLayout(this);
        RelativeLayout.LayoutParams topRowParams = new RelativeLayout.LayoutParams(
                RelativeLayout.LayoutParams.MATCH_PARENT, RelativeLayout.LayoutParams.WRAP_CONTENT);
        topRow.setLayoutParams(topRowParams);

        TextView tvType = new TextView(this);
        tvType.setText(displayType);
        tvType.setTextColor(0xFF0F172A);
        tvType.setTextSize(14);
        tvType.setTypeface(null, android.graphics.Typeface.BOLD);
        RelativeLayout.LayoutParams typeParams = new RelativeLayout.LayoutParams(
                RelativeLayout.LayoutParams.WRAP_CONTENT, RelativeLayout.LayoutParams.WRAP_CONTENT);
        typeParams.addRule(RelativeLayout.ALIGN_PARENT_START);
        typeParams.addRule(RelativeLayout.CENTER_VERTICAL);
        topRow.addView(tvType, typeParams);

        TextView tvStatus = new TextView(this);
        tvStatus.setTextSize(11);
        tvStatus.setTypeface(null, android.graphics.Typeface.BOLD);
        tvStatus.setPadding(dpToPx(8), dpToPx(3), dpToPx(8), dpToPx(3));
        applyStatusBadge(tvStatus, status);
        RelativeLayout.LayoutParams statusParams = new RelativeLayout.LayoutParams(
                RelativeLayout.LayoutParams.WRAP_CONTENT, RelativeLayout.LayoutParams.WRAP_CONTENT);
        statusParams.addRule(RelativeLayout.ALIGN_PARENT_END);
        statusParams.addRule(RelativeLayout.CENTER_VERTICAL);
        topRow.addView(tvStatus, statusParams);

        card.addView(topRow);

        // Date & Days Subtitle
        TextView tvSub = new TextView(this);
        tvSub.setText(dateRangeText + " • " + daysText);
        tvSub.setTextColor(0xFF64748B);
        tvSub.setTextSize(12);
        LinearLayout.LayoutParams subParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        subParams.topMargin = dpToPx(4);
        card.addView(tvSub, subParams);

        // Reason
        if (!reason.isEmpty()) {
            TextView tvReason = new TextView(this);
            tvReason.setText(reason);
            tvReason.setTextColor(0xFF334155);
            tvReason.setTextSize(12);
            LinearLayout.LayoutParams reasonParams = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
            reasonParams.topMargin = dpToPx(4);
            card.addView(tvReason, reasonParams);
        }

        // Rejection Reason
        if ("REJECTED".equals(status) && !rejectionReason.isEmpty()) {
            TextView tvRejection = new TextView(this);
            tvRejection.setText("Rejected: " + rejectionReason);
            tvRejection.setTextColor(0xFFE11D48);
            tvRejection.setTextSize(11);
            tvRejection.setTypeface(null, android.graphics.Typeface.BOLD);
            LinearLayout.LayoutParams rejParams = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
            rejParams.topMargin = dpToPx(4);
            card.addView(tvRejection, rejParams);
        }

        // Withdraw Action Button if PENDING or future APPROVED
        boolean isWithdrawable = "PENDING".equals(status) || ("APPROVED".equals(status) && isFutureDate(endDateStr));
        if (isWithdrawable && !id.isEmpty()) {
            LinearLayout actionRow = new LinearLayout(this);
            actionRow.setOrientation(LinearLayout.HORIZONTAL);
            actionRow.setGravity(Gravity.END);
            LinearLayout.LayoutParams actionRowParams = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
            actionRowParams.topMargin = dpToPx(6);
            actionRow.setLayoutParams(actionRowParams);

            TextView btnWithdraw = new TextView(this);
            btnWithdraw.setText("PENDING".equals(status) ? "Withdraw Request" : "Cancel Leave");
            btnWithdraw.setTextColor(0xFFE11D48);
            btnWithdraw.setTextSize(12);
            btnWithdraw.setTypeface(null, android.graphics.Typeface.BOLD);
            btnWithdraw.setPadding(dpToPx(8), dpToPx(4), dpToPx(8), dpToPx(4));
            btnWithdraw.setClickable(true);
            btnWithdraw.setFocusable(true);
            btnWithdraw.setOnClickListener(v -> confirmWithdraw(id, displayType));
            actionRow.addView(btnWithdraw);

            card.addView(actionRow);
        }

        return card;
    }

    private void confirmWithdraw(String id, String leaveType) {
        new AlertDialog.Builder(this)
                .setTitle("Withdraw Leave Request")
                .setMessage("Are you sure you want to withdraw your " + leaveType + " request?")
                .setPositiveButton("Withdraw", (dialog, which) -> {
                    apiClient.withdrawLeave(id, new ApiClient.ApiCallback<JSONObject>() {
                        @Override
                        public void onSuccess(JSONObject result) {
                            runOnUiThread(() -> {
                                Toast.makeText(LeaveActivity.this, "Leave request withdrawn successfully.", Toast.LENGTH_SHORT).show();
                                loadLeaveBalances();
                                loadLeaveHistory();
                            });
                        }

                        @Override
                        public void onError(String errorMessage, int statusCode) {
                            runOnUiThread(() -> {
                                Toast.makeText(LeaveActivity.this, "Unable to withdraw leave: " + errorMessage, Toast.LENGTH_SHORT).show();
                            });
                        }
                    });
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void applyStatusBadge(TextView tv, String status) {
        tv.setText(status);
        switch (status) {
            case "APPROVED":
                tv.setBackgroundResource(R.drawable.bg_mint_pill);
                tv.setTextColor(0xFF059669);
                break;
            case "PENDING":
                tv.setBackgroundResource(R.drawable.bg_badge_late);
                tv.setTextColor(0xFFD97706);
                break;
            case "REJECTED":
                tv.setBackgroundResource(R.drawable.bg_badge_absent);
                tv.setTextColor(0xFFDC2626);
                break;
            case "WITHDRAWN":
            default:
                tv.setBackgroundResource(R.drawable.bg_pill_inactive);
                tv.setTextColor(0xFF64748B);
                break;
        }
    }

    private String formatLeaveType(String raw) {
        switch (raw) {
            case "CASUAL":
                return "Casual Leave";
            case "MEDICAL":
            case "SICK":
                return "Medical Leave";
            case "EARNED":
                return "Earned Leave";
            case "UNPAID":
                return "Unpaid Leave";
            default:
                return raw.replace("_", " ") + " Leave";
        }
    }

    private String formatDateRange(String startIso, String endIso) {
        try {
            Date s = parseDate(startIso);
            Date e = parseDate(endIso);
            if (s != null && e != null) {
                if (apiDateFormat.format(s).equals(apiDateFormat.format(e))) {
                    return displayDateFormat.format(s);
                }
                return displayDateFormat.format(s) + " - " + displayDateFormat.format(e);
            }
        } catch (Exception ignored) {}
        return startIso + (endIso.isEmpty() ? "" : " - " + endIso);
    }

    private boolean isFutureDate(String dateIso) {
        Date d = parseDate(dateIso);
        if (d != null) {
            Calendar today = Calendar.getInstance();
            today.set(Calendar.HOUR_OF_DAY, 0);
            today.set(Calendar.MINUTE, 0);
            today.set(Calendar.SECOND, 0);
            today.set(Calendar.MILLISECOND, 0);
            return !d.before(today.getTime());
        }
        return false;
    }

    private Date parseDate(String str) {
        if (str == null || str.isEmpty()) return null;
        try {
            if (str.length() >= 10) {
                return apiDateFormat.parse(str.substring(0, 10));
            }
        } catch (Exception ignored) {}
        return null;
    }

    private void setupListeners() {
        View btnApplyLeave = findViewById(R.id.btnApplyLeave);
        if (btnApplyLeave != null) {
            btnApplyLeave.setOnClickListener(v -> showApplyLeaveDialog());
        }

        View btnEmptyApplyLeave = findViewById(R.id.btnEmptyApplyLeave);
        if (btnEmptyApplyLeave != null) {
            btnEmptyApplyLeave.setOnClickListener(v -> showApplyLeaveDialog());
        }
    }

    private void showApplyLeaveDialog() {
        View dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_apply_leave, null);
        AlertDialog dialog = new AlertDialog.Builder(this)
                .setView(dialogView)
                .create();

        if (dialog.getWindow() != null) {
            dialog.getWindow().setBackgroundDrawableResource(android.R.color.transparent);
        }

        Spinner spinnerType = dialogView.findViewById(R.id.spinnerLeaveType);
        CheckBox cbHalfDay = dialogView.findViewById(R.id.cbHalfDay);
        TextView tvHalfDayLabel = dialogView.findViewById(R.id.tvHalfDayLabel);
        View layoutFullDay = dialogView.findViewById(R.id.layoutFullDayDates);
        View layoutHalfDay = dialogView.findViewById(R.id.layoutHalfDayDates);
        TextView tvStartDate = dialogView.findViewById(R.id.tvStartDate);
        TextView tvEndDate = dialogView.findViewById(R.id.tvEndDate);
        TextView tvSingleDate = dialogView.findViewById(R.id.tvSingleDate);
        Spinner spinnerHalfDaySession = dialogView.findViewById(R.id.spinnerHalfDaySession);
        TextView tvTotalDays = dialogView.findViewById(R.id.tvTotalRequestedDays);
        EditText etReason = dialogView.findViewById(R.id.etLeaveReason);
        TextView tvError = dialogView.findViewById(R.id.tvApplyLeaveError);
        View btnCancel = dialogView.findViewById(R.id.btnCancelLeave);
        View btnSubmit = dialogView.findViewById(R.id.btnSubmitLeave);
        TextView tvSubmitText = dialogView.findViewById(R.id.tvSubmitLeaveText);
        ProgressBar pbSubmitProgress = dialogView.findViewById(R.id.pbSubmitLeaveProgress);

        // Leave Types Spinner
        String[] displayTypes = {"Casual Leave", "Medical Leave", "Earned Leave", "Unpaid Leave"};
        String[] apiTypes = {"CASUAL", "MEDICAL", "EARNED", "UNPAID"};
        ArrayAdapter<String> typeAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, displayTypes);
        spinnerType.setAdapter(typeAdapter);

        // Half Day Session Spinner
        String[] sessions = {"First Half (Morning)", "Second Half (Afternoon)"};
        String[] apiSessions = {"FIRST_HALF", "SECOND_HALF"};
        ArrayAdapter<String> sessionAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, sessions);
        spinnerHalfDaySession.setAdapter(sessionAdapter);

        // Dates setup (default tomorrow)
        Calendar calStart = Calendar.getInstance();
        calStart.add(Calendar.DAY_OF_YEAR, 1);
        Calendar calEnd = Calendar.getInstance();
        calEnd.add(Calendar.DAY_OF_YEAR, 1);
        Calendar calSingle = Calendar.getInstance();
        calSingle.add(Calendar.DAY_OF_YEAR, 1);

        tvStartDate.setText(apiDateFormat.format(calStart.getTime()));
        tvEndDate.setText(apiDateFormat.format(calEnd.getTime()));
        tvSingleDate.setText(apiDateFormat.format(calSingle.getTime()));

        Runnable updateTotalDays = () -> {
            if (cbHalfDay.isChecked()) {
                tvTotalDays.setText("0.5 days");
            } else {
                long diff = calEnd.getTimeInMillis() - calStart.getTimeInMillis();
                if (diff < 0) {
                    tvTotalDays.setText("0 days");
                } else {
                    int days = (int) (diff / (1000 * 60 * 60 * 24)) + 1;
                    tvTotalDays.setText(days + (days == 1 ? " day" : " days"));
                }
            }
        };
        updateTotalDays.run();

        // Half Day toggle
        cbHalfDay.setOnCheckedChangeListener((buttonView, isChecked) -> {
            layoutFullDay.setVisibility(isChecked ? View.GONE : View.VISIBLE);
            layoutHalfDay.setVisibility(isChecked ? View.VISIBLE : View.GONE);
            updateTotalDays.run();
        });
        if (tvHalfDayLabel != null) {
            tvHalfDayLabel.setOnClickListener(v -> cbHalfDay.toggle());
        }

        // Date pickers
        View layoutStartDate = dialogView.findViewById(R.id.layoutStartDate);
        if (layoutStartDate != null) {
            layoutStartDate.setOnClickListener(v -> {
                new DatePickerDialog(this, (view, year, month, dayOfMonth) -> {
                    calStart.set(year, month, dayOfMonth);
                    tvStartDate.setText(apiDateFormat.format(calStart.getTime()));
                    if (calEnd.before(calStart)) {
                        calEnd.set(year, month, dayOfMonth);
                        tvEndDate.setText(apiDateFormat.format(calEnd.getTime()));
                    }
                    updateTotalDays.run();
                }, calStart.get(Calendar.YEAR), calStart.get(Calendar.MONTH), calStart.get(Calendar.DAY_OF_MONTH)).show();
            });
        }

        View layoutEndDate = dialogView.findViewById(R.id.layoutEndDate);
        if (layoutEndDate != null) {
            layoutEndDate.setOnClickListener(v -> {
                new DatePickerDialog(this, (view, year, month, dayOfMonth) -> {
                    calEnd.set(year, month, dayOfMonth);
                    tvEndDate.setText(apiDateFormat.format(calEnd.getTime()));
                    updateTotalDays.run();
                }, calEnd.get(Calendar.YEAR), calEnd.get(Calendar.MONTH), calEnd.get(Calendar.DAY_OF_MONTH)).show();
            });
        }

        View layoutSingleDate = dialogView.findViewById(R.id.layoutSingleDate);
        if (layoutSingleDate != null) {
            layoutSingleDate.setOnClickListener(v -> {
                new DatePickerDialog(this, (view, year, month, dayOfMonth) -> {
                    calSingle.set(year, month, dayOfMonth);
                    tvSingleDate.setText(apiDateFormat.format(calSingle.getTime()));
                }, calSingle.get(Calendar.YEAR), calSingle.get(Calendar.MONTH), calSingle.get(Calendar.DAY_OF_MONTH)).show();
            });
        }

        btnCancel.setOnClickListener(v -> dialog.dismiss());

        btnSubmit.setOnClickListener(v -> {
            String selectedType = apiTypes[spinnerType.getSelectedItemPosition()];
            boolean isHalfDay = cbHalfDay.isChecked();
            String startDate = isHalfDay ? tvSingleDate.getText().toString().trim() : tvStartDate.getText().toString().trim();
            String endDate = isHalfDay ? startDate : tvEndDate.getText().toString().trim();
            String session = isHalfDay ? apiSessions[spinnerHalfDaySession.getSelectedItemPosition()] : null;
            String reason = etReason.getText().toString().trim();

            if (!isHalfDay && calEnd.before(calStart)) {
                tvError.setText("End date cannot be earlier than start date.");
                tvError.setVisibility(View.VISIBLE);
                return;
            }

            if (reason.isEmpty()) {
                tvError.setText("Please enter a brief reason for your leave.");
                tvError.setVisibility(View.VISIBLE);
                return;
            }

            tvError.setVisibility(View.GONE);
            btnSubmit.setEnabled(false);
            if (tvSubmitText != null) tvSubmitText.setVisibility(View.GONE);
            if (pbSubmitProgress != null) pbSubmitProgress.setVisibility(View.VISIBLE);

            apiClient.applyLeave(selectedType, startDate, endDate, reason, isHalfDay, session, new ApiClient.ApiCallback<JSONObject>() {
                @Override
                public void onSuccess(JSONObject result) {
                    runOnUiThread(() -> {
                        dialog.dismiss();
                        Toast.makeText(LeaveActivity.this, "Leave application submitted successfully.", Toast.LENGTH_LONG).show();
                        loadLeaveBalances();
                        loadLeaveHistory();
                    });
                }

                @Override
                public void onError(String errorMessage, int statusCode) {
                    runOnUiThread(() -> {
                        btnSubmit.setEnabled(true);
                        if (tvSubmitText != null) tvSubmitText.setVisibility(View.VISIBLE);
                        if (pbSubmitProgress != null) pbSubmitProgress.setVisibility(View.GONE);
                        tvError.setText(errorMessage != null && !errorMessage.isEmpty() ? errorMessage : "Failed to apply for leave. Please try again.");
                        tvError.setVisibility(View.VISIBLE);
                    });
                }
            });
        });

        dialog.show();
    }

    private void setupBottomNav() {
        BottomNavHelper.setupBottomNav(this, "leave");
    }

    private int dpToPx(int dp) {
        return (int) (dp * getResources().getDisplayMetrics().density);
    }
}
