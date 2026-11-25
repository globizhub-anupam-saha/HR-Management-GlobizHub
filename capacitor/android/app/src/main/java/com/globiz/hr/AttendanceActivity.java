package com.globiz.hr;

import android.app.DatePickerDialog;
import android.app.TimePickerDialog;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.globiz.hr.network.ApiClient;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;

public class AttendanceActivity extends AppCompatActivity {

    // Top Bar Views
    private View btnNotifications;
    private View viewNotificationDot;
    private FrameLayout flAvatarContainer;
    private ImageView ivUserAvatar;
    private TextView tvAvatarInitials;

    // Action Button
    private View btnRequestRegularization;

    // My Attendance Stat Views
    private LinearLayout pillTodayStatus;
    private View dotTodayStatus;
    private TextView tvTodayStatusValue;
    private TextView tvMonthlyAttendanceValue;
    private TextView tvDaysPresentValue;
    private TextView tvDaysAbsentValue;

    // History Views
    private TextView btnSeeAll;
    private LinearLayout llAttendanceHistoryList;

    // Bottom Navigation
    private View navTabHome;
    private View navTabAttendance;
    private View navTabLeave;
    private View navTabTasks;
    private View navTabMore;

    // State & Data
    private List<AttendanceItem> historyItems = new ArrayList<>();
    private String currentFilter = "ALL"; // ALL, EARLY, ON_TIME, LATE
    private boolean isAllExpanded = true;

    public static class AttendanceItem {
        public Date rawDate;
        public String dateDisplay;     // e.g. "Mon, 22 Nov 2026"
        public String timeRange;       // e.g. "09:00AM - 06:00PM • 8.5 hrs"
        public String shiftName;       // e.g. "Standard Shift"
        public String status;          // PRESENT, LATE, HALF_DAY, ABSENT, ON_LEAVE, SHIFT_GIVEN, PROXY_SHIFT_SWAP
        public String clockIn;         // e.g. "09:00am"
        public String clockOut;        // e.g. "06:00pm"
        public String workHours;       // e.g. "8.5 hrs"

        public AttendanceItem(Date rawDate, String dateDisplay, String timeRange, String shiftName, String status, String clockIn, String clockOut, String workHours) {
            this.rawDate = rawDate;
            this.dateDisplay = dateDisplay;
            this.timeRange = timeRange;
            this.shiftName = shiftName;
            this.status = status;
            this.clockIn = clockIn;
            this.clockOut = clockOut;
            this.workHours = workHours;
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
            getWindow().setStatusBarColor(Color.WHITE);
        }

        setContentView(R.layout.activity_attendance);

        initViews();
        AppHeaderHelper.applyWindowInsets(this);
        setupBottomNav();
        setupTopBar();
        loadUserProfile();
        loadAttendanceStats();
        loadAttendanceData();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (!ApiClient.getInstance(this).isApprovedEmployee()) {
            Toast.makeText(this, "Access restricted until onboarding approval.", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }
        BottomNavHelper.setupBottomNav(this, "attendance");
        updateNotificationBadge();
        loadUserProfile();
        loadAttendanceStats();
        loadAttendanceData();
    }

    private void initViews() {
        // Top bar
        btnNotifications = findViewById(R.id.btnNotifications);
        viewNotificationDot = findViewById(R.id.viewNotificationDot);
        flAvatarContainer = findViewById(R.id.flAvatarContainer);
        ivUserAvatar = findViewById(R.id.ivUserAvatar);
        tvAvatarInitials = findViewById(R.id.tvAvatarInitials);

        // Request Regularization Button
        btnRequestRegularization = findViewById(R.id.btnRequestRegularization);
        if (btnRequestRegularization != null) {
            btnRequestRegularization.setOnClickListener(v -> showRegularizationDialog());
        }

        // My Attendance Stat Views
        pillTodayStatus = findViewById(R.id.pillTodayStatus);
        dotTodayStatus = findViewById(R.id.dotTodayStatus);
        tvTodayStatusValue = findViewById(R.id.tvTodayStatusValue);
        tvMonthlyAttendanceValue = findViewById(R.id.tvMonthlyAttendanceValue);
        tvDaysPresentValue = findViewById(R.id.tvDaysPresentValue);
        tvDaysAbsentValue = findViewById(R.id.tvDaysAbsentValue);

        // History Views
        btnSeeAll = findViewById(R.id.btnSeeAll);
        llAttendanceHistoryList = findViewById(R.id.llAttendanceHistoryList);

        // Bottom nav
        navTabHome = findViewById(R.id.navTabHome);
        navTabAttendance = findViewById(R.id.navTabAttendance);
        navTabLeave = findViewById(R.id.navTabLeave);
        navTabTasks = findViewById(R.id.navTabTasks);
        navTabMore = findViewById(R.id.navTabMore);

        if (btnSeeAll != null) {
            btnSeeAll.setOnClickListener(v -> {
                isAllExpanded = !isAllExpanded;
                renderHistoryList();
            });
        }
        NavBarScrollHelper.attachToScrollView(findViewById(R.id.scrollViewAttendance), findViewById(R.id.bottomNavBar));
    }

    private void setupTopBar() {
        if (btnNotifications != null) {
            btnNotifications.setOnClickListener(v -> {
                ApiClient.getInstance(this).markLocalNotificationsAsRead();
                updateNotificationBadge();
                showNotificationsDialog();
            });
        }

        if (flAvatarContainer != null) {
            flAvatarContainer.setOnClickListener(v -> {
                Intent intent = new Intent(this, SettingsActivity.class);
                startActivity(intent);
            });
        }
    }

    private void updateNotificationBadge() {
        boolean hasUnread = ApiClient.getInstance(this).hasUnreadLocalNotifications();
        if (viewNotificationDot != null) {
            viewNotificationDot.setVisibility(hasUnread ? View.VISIBLE : View.GONE);
        }
    }

    private void showNotificationsDialog() {
        new AlertDialog.Builder(this)
                .setTitle("Notifications")
                .setMessage("All attendance records and shift updates are synchronized in real-time.")
                .setPositiveButton("OK", null)
                .show();
    }

    private void setupBottomNav() {
        BottomNavHelper.setupBottomNav(this, "attendance");
    }

    private void loadAttendanceStats() {
        ApiClient client = ApiClient.getInstance(this);
        client.getAttendanceStats(client.getToken(), new ApiClient.ApiCallback<JSONObject>() {
            @Override
            public void onSuccess(JSONObject stats) {
                if (stats != null) {
                    runOnUiThread(() -> applyAttendanceStats(stats));
                }
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                // If offline or error, maintain current state
            }
        });
    }

    private void applyAttendanceStats(JSONObject stats) {
        String todayStatus = stats.optString("todayStatus", "PENDING");
        int percentage = stats.optInt("attendancePercentage", 0);
        int presentDays = stats.optInt("presentDays", 0);
        int absentDays = stats.optInt("absentDays", 0);

        if (tvMonthlyAttendanceValue != null) {
            tvMonthlyAttendanceValue.setText(percentage + "%");
        }
        if (tvDaysPresentValue != null) {
            tvDaysPresentValue.setText(String.valueOf(presentDays));
        }
        if (tvDaysAbsentValue != null) {
            tvDaysAbsentValue.setText(String.valueOf(absentDays));
        }

        applyStatusBadge(pillTodayStatus, dotTodayStatus, tvTodayStatusValue, todayStatus);
    }

    private void applyStatusBadge(LinearLayout pill, View dot, TextView text, String status) {
        if (pill == null || text == null) return;
        String upper = status != null ? status.toUpperCase() : "PENDING";
        if (dot != null) dot.setVisibility(View.VISIBLE);

        switch (upper) {
            case "PRESENT":
                pill.setBackgroundResource(R.drawable.bg_badge_early);
                if (dot != null) dot.setBackgroundResource(R.drawable.dot_present);
                text.setText("Present");
                text.setTextColor(Color.parseColor("#059669"));
                break;
            case "LATE":
                pill.setBackgroundResource(R.drawable.bg_badge_late);
                if (dot != null) dot.setBackgroundResource(R.drawable.dot_late);
                text.setText("Late");
                text.setTextColor(Color.parseColor("#D97706"));
                break;
            case "HALF_DAY":
                pill.setBackgroundResource(R.drawable.bg_badge_late);
                if (dot != null) dot.setBackgroundResource(R.drawable.dot_late);
                text.setText("Half Day");
                text.setTextColor(Color.parseColor("#92400E"));
                break;
            case "ABSENT":
                pill.setBackgroundResource(R.drawable.bg_badge_late);
                if (dot != null) dot.setBackgroundResource(R.drawable.dot_late);
                text.setText("Absent");
                text.setTextColor(Color.parseColor("#E11D48"));
                break;
            case "ON_LEAVE":
                pill.setBackgroundResource(R.drawable.bg_badge_inprogress);
                if (dot != null) dot.setBackgroundResource(R.drawable.dot_inprogress);
                text.setText("On Leave");
                text.setTextColor(Color.parseColor("#1D4ED8"));
                break;
            case "SHIFT_GIVEN":
                pill.setBackgroundResource(R.drawable.bg_sub_stat_card);
                if (dot != null) dot.setVisibility(View.GONE);
                text.setText("Shift Given");
                text.setTextColor(Color.parseColor("#475569"));
                break;
            case "PROXY_SHIFT_SWAP":
                pill.setBackgroundResource(R.drawable.bg_badge_inprogress);
                if (dot != null) dot.setBackgroundResource(R.drawable.dot_inprogress);
                text.setText("Proxy Present");
                text.setTextColor(Color.parseColor("#2563EB"));
                break;
            default:
                pill.setBackgroundResource(R.drawable.bg_sub_stat_card);
                if (dot != null) dot.setVisibility(View.GONE);
                text.setText("Pending");
                text.setTextColor(Color.parseColor("#64748B"));
                break;
        }
    }

    private void showRegularizationDialog() {
        View dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_request_regularization, null);
        AlertDialog dialog = new AlertDialog.Builder(this)
                .setView(dialogView)
                .setCancelable(true)
                .create();

        if (dialog.getWindow() != null) {
            dialog.getWindow().setBackgroundDrawableResource(android.R.color.transparent);
        }

        TextView tvDate = dialogView.findViewById(R.id.tvRegularizeDate);
        TextView tvCheckIn = dialogView.findViewById(R.id.tvRegularizeCheckIn);
        TextView tvCheckOut = dialogView.findViewById(R.id.tvRegularizeCheckOut);
        EditText etReason = dialogView.findViewById(R.id.etRegularizeReason);
        TextView tvError = dialogView.findViewById(R.id.tvRegularizeError);
        View btnCancel = dialogView.findViewById(R.id.btnRegularizeCancel);
        View btnSubmit = dialogView.findViewById(R.id.btnRegularizeSubmit);
        TextView tvSubmitText = dialogView.findViewById(R.id.tvRegularizeSubmitText);
        ProgressBar pbLoading = dialogView.findViewById(R.id.pbRegularizeLoading);

        SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
        final Calendar selectedDateCal = Calendar.getInstance();
        tvDate.setText(df.format(selectedDateCal.getTime()));

        final int[] inHour = {9};
        final int[] inMinute = {0};
        final int[] outHour = {18};
        final int[] outMinute = {0};

        dialogView.findViewById(R.id.layoutDateSelector).setOnClickListener(v -> {
            DatePickerDialog dpd = new DatePickerDialog(this, (view, year, month, dayOfMonth) -> {
                selectedDateCal.set(year, month, dayOfMonth);
                tvDate.setText(df.format(selectedDateCal.getTime()));
            }, selectedDateCal.get(Calendar.YEAR), selectedDateCal.get(Calendar.MONTH), selectedDateCal.get(Calendar.DAY_OF_MONTH));
            dpd.show();
        });

        dialogView.findViewById(R.id.layoutCheckInSelector).setOnClickListener(v -> {
            TimePickerDialog tpd = new TimePickerDialog(this, (view, hourOfDay, minute) -> {
                inHour[0] = hourOfDay;
                inMinute[0] = minute;
                tvCheckIn.setText(String.format(Locale.US, "%02d:%02d", hourOfDay, minute));
            }, inHour[0], inMinute[0], false);
            tpd.show();
        });

        dialogView.findViewById(R.id.layoutCheckOutSelector).setOnClickListener(v -> {
            TimePickerDialog tpd = new TimePickerDialog(this, (view, hourOfDay, minute) -> {
                outHour[0] = hourOfDay;
                outMinute[0] = minute;
                tvCheckOut.setText(String.format(Locale.US, "%02d:%02d", hourOfDay, minute));
            }, outHour[0], outMinute[0], false);
            tpd.show();
        });

        btnCancel.setOnClickListener(v -> dialog.dismiss());

        btnSubmit.setOnClickListener(v -> {
            String reason = etReason.getText() != null ? etReason.getText().toString().trim() : "";
            if (reason.isEmpty()) {
                tvError.setText("Please provide a reason for the attendance correction.");
                tvError.setVisibility(View.VISIBLE);
                return;
            }

            tvError.setVisibility(View.GONE);
            btnSubmit.setEnabled(false);
            tvSubmitText.setVisibility(View.GONE);
            pbLoading.setVisibility(View.VISIBLE);

            String dateStr = tvDate.getText().toString();
            String checkInIso = dateStr + "T" + tvCheckIn.getText().toString() + ":00";
            String checkOutIso = dateStr + "T" + tvCheckOut.getText().toString() + ":00";

            ApiClient.getInstance(this).requestAttendanceCorrection(dateStr, checkInIso, checkOutIso, reason, new ApiClient.ApiCallback<JSONObject>() {
                @Override
                public void onSuccess(JSONObject result) {
                    runOnUiThread(() -> {
                        dialog.dismiss();
                        Toast.makeText(AttendanceActivity.this, "Regularization request submitted successfully!", Toast.LENGTH_LONG).show();
                        loadAttendanceData();
                        loadAttendanceStats();
                    });
                }

                @Override
                public void onError(String errorMessage, int statusCode) {
                    runOnUiThread(() -> {
                        btnSubmit.setEnabled(true);
                        tvSubmitText.setVisibility(View.VISIBLE);
                        pbLoading.setVisibility(View.GONE);
                        tvError.setText(errorMessage != null ? errorMessage : "Failed to submit regularization request.");
                        tvError.setVisibility(View.VISIBLE);
                    });
                }
            });
        });

        dialog.show();
    }

    private void loadAttendanceData() {
        ApiClient client = ApiClient.getInstance(this);
        String token = client.getToken();

        client.getMyAttendanceHistory(token, new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray response) {
                if (response != null && response.length() > 0) {
                    parseHistoryJson(response);
                } else {
                    historyItems.clear();
                }
                runOnUiThread(AttendanceActivity.this::renderHistoryList);
            }

            @Override
            public void onError(String error, int statusCode) {
                historyItems.clear();
                runOnUiThread(AttendanceActivity.this::renderHistoryList);
            }
        });
    }

    private void parseHistoryJson(JSONArray array) {
        historyItems.clear();
        SimpleDateFormat apiDateFmt = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
        SimpleDateFormat displayDateFmt = new SimpleDateFormat("EEE, dd MMM yyyy", Locale.US);
        SimpleDateFormat timeFmt = new SimpleDateFormat("hh:mma", Locale.US);

        for (int i = 0; i < array.length(); i++) {
            try {
                JSONObject obj = array.getJSONObject(i);
                String dateRaw = obj.optString("date", "");
                Date rawDate = null;
                String dateDisplay = "Attendance Date";
                if (!dateRaw.isEmpty()) {
                    try {
                        SimpleDateFormat isoParser = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US);
                        rawDate = isoParser.parse(dateRaw);
                    } catch (Exception e1) {
                        try {
                            rawDate = apiDateFmt.parse(dateRaw);
                        } catch (Exception ignored) {}
                    }
                }
                if (rawDate != null) {
                    dateDisplay = displayDateFmt.format(rawDate);
                } else if (!dateRaw.isEmpty()) {
                    dateDisplay = dateRaw.split("T")[0];
                }

                String status = obj.optString("status", "PRESENT");
                String inRaw = obj.optString("checkInTime", null);
                if (inRaw == null || "null".equalsIgnoreCase(inRaw)) inRaw = obj.optString("clockIn", null);
                String outRaw = obj.optString("checkOutTime", null);
                if (outRaw == null || "null".equalsIgnoreCase(outRaw)) outRaw = obj.optString("clockOut", null);

                String inStr = "--:--";
                if (inRaw != null && !inRaw.isEmpty() && !"null".equalsIgnoreCase(inRaw)) {
                    try {
                        SimpleDateFormat iso = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US);
                        Date d = iso.parse(inRaw);
                        if (d != null) inStr = timeFmt.format(d).toLowerCase(Locale.US);
                    } catch (Exception ignored) {}
                }

                String outStr = "--:--";
                if (outRaw != null && !outRaw.isEmpty() && !"null".equalsIgnoreCase(outRaw)) {
                    try {
                        SimpleDateFormat iso = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US);
                        Date d = iso.parse(outRaw);
                        if (d != null) outStr = timeFmt.format(d).toLowerCase(Locale.US);
                    } catch (Exception ignored) {}
                }

                double workHours = obj.optDouble("workingHours", 0);
                String hoursStr = workHours > 0 ? (workHours + " hrs") : "--";

                String timeRange = inStr + " - " + outStr + (workHours > 0 ? (" • " + hoursStr) : "");

                JSONObject shiftObj = obj.optJSONObject("shift");
                String shiftName = shiftObj != null ? shiftObj.optString("name", "Standard Shift") : "Standard Shift";

                historyItems.add(new AttendanceItem(
                        rawDate,
                        dateDisplay,
                        timeRange,
                        shiftName,
                        status,
                        inStr,
                        outStr,
                        hoursStr
                ));
            } catch (Exception ignored) {}
        }

        Collections.sort(historyItems, (a, b) -> {
            if (a.rawDate != null && b.rawDate != null) {
                return b.rawDate.compareTo(a.rawDate);
            }
            return 0;
        });
    }

    private void renderHistoryList() {
        if (llAttendanceHistoryList == null) return;
        llAttendanceHistoryList.removeAllViews();
        LayoutInflater inflater = LayoutInflater.from(this);

        if (historyItems.isEmpty()) {
            TextView tvEmpty = new TextView(this);
            tvEmpty.setText("No attendance history recorded yet");
            tvEmpty.setTextColor(Color.parseColor("#94A3B8"));
            tvEmpty.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
            tvEmpty.setGravity(Gravity.CENTER);
            int pad = (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, 32, getResources().getDisplayMetrics());
            tvEmpty.setPadding(0, pad, 0, pad);
            llAttendanceHistoryList.addView(tvEmpty);
            if (btnSeeAll != null) btnSeeAll.setVisibility(View.GONE);
            return;
        }

        int maxCount = isAllExpanded ? Math.min(30, historyItems.size()) : Math.min(7, historyItems.size());
        if (btnSeeAll != null) {
            btnSeeAll.setVisibility(historyItems.size() > 7 ? View.VISIBLE : View.GONE);
            btnSeeAll.setText(isAllExpanded ? "Show 7 Days" : "See All >");
        }

        for (int i = 0; i < maxCount; i++) {
            AttendanceItem item = historyItems.get(i);

            View row = inflater.inflate(R.layout.item_attendance_history, llAttendanceHistoryList, false);

            TextView tvDate = row.findViewById(R.id.tvHistoryDate);
            TextView tvTime = row.findViewById(R.id.tvHistoryTimeRange);
            TextView tvLoc = row.findViewById(R.id.tvHistoryLocation);
            LinearLayout pillStatus = row.findViewById(R.id.pillHistoryStatus);
            View dotStatus = row.findViewById(R.id.dotHistoryStatus);
            TextView tvStatusText = row.findViewById(R.id.tvHistoryStatusText);

            tvDate.setText(item.dateDisplay);
            tvTime.setText(item.timeRange);
            tvLoc.setText(item.shiftName);

            applyStatusBadge(pillStatus, dotStatus, tvStatusText, item.status);

            row.setOnClickListener(v -> showRecordDetailDialog(item));

            llAttendanceHistoryList.addView(row);
        }
    }

    private void showRecordDetailDialog(AttendanceItem item) {
        new AlertDialog.Builder(this)
                .setTitle(item.dateDisplay)
                .setMessage("Shift: " + item.shiftName + "\nTiming: " + item.timeRange + "\nStatus: " + item.status + "\nCheck In: " + item.clockIn + "\nCheck Out: " + item.clockOut + "\nWork Hours: " + item.workHours)
                .setPositiveButton("Close", null)
                .show();
    }

    private void loadUserProfile() {
        ApiClient client = ApiClient.getInstance(this);
        String firstName = client.getFirstName();
        String lastName = client.getLastName();
        if (firstName != null && !firstName.isEmpty()) {
            String initial = firstName.substring(0, 1).toUpperCase();
            if (lastName != null && !lastName.isEmpty()) {
                initial += lastName.substring(0, 1).toUpperCase();
            }
            if (tvAvatarInitials != null) {
                tvAvatarInitials.setText(initial);
            }
        } else {
            if (tvAvatarInitials != null) {
                tvAvatarInitials.setText("C");
            }
        }
    }
}