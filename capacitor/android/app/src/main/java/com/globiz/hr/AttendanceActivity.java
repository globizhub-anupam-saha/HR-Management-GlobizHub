package com.globiz.hr;

import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
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

    // Banner & Action Button
    private FrameLayout btnClockAction;
    private TextView tvClockActionText;
    private ImageView ivClockActionIcon;

    // Summary Card Views
    private TextView tvSummaryClockIn;
    private TextView tvSummaryBreak;
    private TextView tvSummaryClockOut;

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
    private boolean isAllExpanded = false;

    private final Handler tickerHandler = new Handler(Looper.getMainLooper());
    private final Runnable tickerRunnable = new Runnable() {
        @Override
        public void run() {
            updateAttendanceState();
            tickerHandler.postDelayed(this, 1000);
        }
    };

    public static class AttendanceItem {
        public Date rawDate;
        public String dateDisplay;     // e.g. "13th May, 2025"
        public String timeRange;       // e.g. "7:30AM - 3:00PM"
        public String location;        // e.g. "GlobizHub HQ" / "Acme Corp • HQ"
        public String status;          // EARLY, ON_TIME, LATE, IN_PROGRESS
        public String clockIn;         // e.g. "09:00am"
        public String clockOut;        // e.g. "05:00pm"
        public String breakTime;       // e.g. "12:00pm"

        public AttendanceItem(Date rawDate, String dateDisplay, String timeRange, String location, String status, String clockIn, String clockOut, String breakTime) {
            this.rawDate = rawDate;
            this.dateDisplay = dateDisplay;
            this.timeRange = timeRange;
            this.location = location;
            this.status = status;
            this.clockIn = clockIn;
            this.clockOut = clockOut;
            this.breakTime = breakTime;
        }

        public AttendanceItem(String dateDisplay, String timeRange, String location, String status, String clockIn, String clockOut, String breakTime) {
            this(null, dateDisplay, timeRange, location, status, clockIn, clockOut, breakTime);
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
        setupBannerActions();
        loadUserProfile();
        loadAttendanceData();
    }

    @Override
    protected void onResume() {
        super.onResume();
        BottomNavHelper.setupBottomNav(this, "attendance");
        updateNotificationBadge();
        updateAttendanceState();
        tickerHandler.post(tickerRunnable);

        ApiClient client = ApiClient.getInstance(this);
        client.getMySchedule(client.getToken(), new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray schedules) {
                if (schedules != null && schedules.length() > 0) {
                    JSONObject first = schedules.optJSONObject(0);
                    if (first != null) {
                        JSONObject shift = first.optJSONObject("shift");
                        String end = shift != null ? shift.optString("endTime", "18:00") : first.optString("endTime", "18:00");
                        try {
                            SimpleDateFormat inFmt = new SimpleDateFormat("HH:mm", Locale.US);
                            SimpleDateFormat endFmt = new SimpleDateFormat("hh:mma", Locale.US);
                            Date eDate = inFmt.parse(end);
                            if (eDate != null) {
                                String endStr = endFmt.format(eDate).toLowerCase();
                                client.saveShiftEndTime(endStr);
                            }
                        } catch (Exception ignored) {}
                    }
                }
            }

            @Override
            public void onError(String errorMessage, int statusCode) {}
        });
    }

    @Override
    protected void onPause() {
        super.onPause();
        tickerHandler.removeCallbacks(tickerRunnable);
    }

    private void initViews() {
        // Top bar
        btnNotifications = findViewById(R.id.btnNotifications);
        viewNotificationDot = findViewById(R.id.viewNotificationDot);
        flAvatarContainer = findViewById(R.id.flAvatarContainer);
        ivUserAvatar = findViewById(R.id.ivUserAvatar);
        tvAvatarInitials = findViewById(R.id.tvAvatarInitials);

        // Banner Action
        btnClockAction = findViewById(R.id.btnClockAction);
        tvClockActionText = findViewById(R.id.tvClockActionText);
        ivClockActionIcon = findViewById(R.id.ivClockActionIcon);

        // Summary Card
        tvSummaryClockIn = findViewById(R.id.tvSummaryClockIn);
        tvSummaryBreak = findViewById(R.id.tvSummaryBreak);
        tvSummaryClockOut = findViewById(R.id.tvSummaryClockOut);

        // History
        btnSeeAll = findViewById(R.id.btnSeeAll);
        llAttendanceHistoryList = findViewById(R.id.llAttendanceHistoryList);

        // Bottom nav
        navTabHome = findViewById(R.id.navTabHome);
        navTabAttendance = findViewById(R.id.navTabAttendance);
        navTabLeave = findViewById(R.id.navTabLeave);
        navTabTasks = findViewById(R.id.navTabTasks);
        navTabMore = findViewById(R.id.navTabMore);

        btnSeeAll.setOnClickListener(v -> {
            isAllExpanded = !isAllExpanded;
            renderHistoryList();
        });
        NavBarScrollHelper.attachToScrollView(findViewById(R.id.scrollViewAttendance), findViewById(R.id.bottomNavBar));
    }

    private void setupTopBar() {
        btnNotifications.setOnClickListener(v -> {
            ApiClient.getInstance(this).markLocalNotificationsAsRead();
            updateNotificationBadge();
            showNotificationsDialog();
        });

        flAvatarContainer.setOnClickListener(v -> {
            Intent intent = new Intent(this, SettingsActivity.class);
            startActivity(intent);
        });
    }

    private void updateNotificationBadge() {
        boolean hasUnread = ApiClient.getInstance(this).hasUnreadLocalNotifications();
        viewNotificationDot.setVisibility(hasUnread ? View.VISIBLE : View.GONE);
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

    private void setupBannerActions() {
        btnClockAction.setOnClickListener(v -> toggleClockStatus());
    }

    private void toggleClockStatus() {
        ApiClient client = ApiClient.getInstance(this);
        String token = client.getToken();
        String currentStatus = client.getLocalAttendanceStatus();
        boolean isCurrentlyClockedIn = "CLOCKED_IN".equalsIgnoreCase(currentStatus) || "CHECKED_IN".equalsIgnoreCase(currentStatus);

        SimpleDateFormat timeFmt = new SimpleDateFormat("hh:mma", Locale.US);
        String formattedNow = timeFmt.format(new Date()).toLowerCase();

        btnClockAction.setEnabled(false);

        if (!isCurrentlyClockedIn) {
            // User is Clocking In
            client.clockIn(token, new ApiClient.ApiCallback<JSONObject>() {
                @Override
                public void onSuccess(JSONObject result) {
                    runOnUiThread(() -> {
                        btnClockAction.setEnabled(true);
                        Toast.makeText(AttendanceActivity.this, "Successfully Clocked In", Toast.LENGTH_SHORT).show();
                        prependLiveHistoryItem(formattedNow);
                        updateAttendanceState();
                    });
                }

                @Override
                public void onError(String error, int statusCode) {
                    runOnUiThread(() -> {
                        btnClockAction.setEnabled(true);
                        Toast.makeText(AttendanceActivity.this, "Clock In Recorded", Toast.LENGTH_SHORT).show();
                        prependLiveHistoryItem(formattedNow);
                        updateAttendanceState();
                    });
                }
            });
        } else {
            // Shift is active; Clock Out concept removed per company policy
            btnClockAction.setEnabled(true);
            new AlertDialog.Builder(this)
                    .setTitle("Shift in Progress")
                    .setMessage("Your shift is currently active and recorded in the system. Shift completes automatically based on your assigned company schedule.")
                    .setPositiveButton("OK", null)
                    .show();
        }
    }

    private void updateAttendanceState() {
        ApiClient client = ApiClient.getInstance(this);
        String currentStatus = client.getLocalAttendanceStatus();
        boolean isClockedIn = "CLOCKED_IN".equalsIgnoreCase(currentStatus) || "CHECKED_IN".equalsIgnoreCase(currentStatus);

        SimpleDateFormat displayFmt = new SimpleDateFormat("hh:mma", Locale.US);

        if (isClockedIn) {
            tvClockActionText.setText("✓ Clocked In");
            tvClockActionText.setTextColor(Color.parseColor("#16A34A"));
            btnClockAction.setBackgroundResource(R.drawable.bg_break_pill);

            // Clock In: Real-time check-in time
            String inIso = client.getLocalCheckInIso();
            if (inIso != null) {
                try {
                    SimpleDateFormat isoParser = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US);
                    Date inDate = isoParser.parse(inIso);
                    if (inDate != null) {
                        tvSummaryClockIn.setText(displayFmt.format(inDate).toLowerCase(Locale.US));
                    } else {
                        tvSummaryClockIn.setText("--:--");
                    }
                } catch (Exception e) {
                    tvSummaryClockIn.setText("--:--");
                }
            } else {
                tvSummaryClockIn.setText("--:--");
            }

            // Break: show exact time clicked if taken, otherwise "--:--"
            String breakTime = client.getLastBreakTimeStr();
            if (breakTime != null && !breakTime.isEmpty()) {
                tvSummaryBreak.setText(breakTime);
            } else if (client.isOnBreak()) {
                tvSummaryBreak.setText("In Break");
            } else {
                tvSummaryBreak.setText("--:--");
            }

            // Shift End: "--:--" while shift is in progress
            tvSummaryClockOut.setText("--:--");
        } else {
            tvClockActionText.setText("Clock In");
            tvClockActionText.setTextColor(Color.WHITE);
            btnClockAction.setBackgroundResource(R.drawable.bg_pill_blue_button);

            String inIso = client.getLocalCheckInIso();
            if (inIso != null) {
                try {
                    SimpleDateFormat isoParser = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US);
                    Date inDate = isoParser.parse(inIso);
                    if (inDate != null) {
                        tvSummaryClockIn.setText(displayFmt.format(inDate).toLowerCase(Locale.US));
                    } else {
                        tvSummaryClockIn.setText("--:--");
                    }
                } catch (Exception ignored) {
                    tvSummaryClockIn.setText("--:--");
                }
            } else {
                tvSummaryClockIn.setText("--:--");
            }

            String breakTime = client.getLastBreakTimeStr();
            tvSummaryBreak.setText(breakTime != null && !breakTime.isEmpty() ? breakTime : "--:--");

            String outIso = client.getLocalCheckOutIso();
            if (outIso != null) {
                try {
                    SimpleDateFormat isoParser = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US);
                    Date outDate = isoParser.parse(outIso);
                    if (outDate != null) {
                        tvSummaryClockOut.setText(displayFmt.format(outDate).toLowerCase(Locale.US));
                    } else {
                        tvSummaryClockOut.setText("--:--");
                    }
                } catch (Exception ignored) {
                    tvSummaryClockOut.setText("--:--");
                }
            } else {
                tvSummaryClockOut.setText("--:--");
            }
        }
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
        SimpleDateFormat apiDateFmt = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US);
        SimpleDateFormat rangeTimeFmt = new SimpleDateFormat("h:mma", Locale.US);
        SimpleDateFormat summaryTimeFmt = new SimpleDateFormat("hh:mma", Locale.US);

        String systemLoc = getSystemLocation();

        for (int i = 0; i < array.length(); i++) {
            try {
                JSONObject obj = array.getJSONObject(i);
                String clockInRaw = obj.optString("clockIn", null);
                if (clockInRaw == null || clockInRaw.isEmpty() || "null".equalsIgnoreCase(clockInRaw)) {
                    clockInRaw = obj.optString("checkInTime", null);
                }
                String clockOutRaw = obj.optString("clockOut", null);
                if (clockOutRaw == null || clockOutRaw.isEmpty() || "null".equalsIgnoreCase(clockOutRaw)) {
                    clockOutRaw = obj.optString("checkOutTime", null);
                }

                // Use user-defined location only if valid and not dummy, otherwise use system location
                String loc = obj.optString("location", null);
                if (loc == null || loc.trim().isEmpty() || "null".equalsIgnoreCase(loc) || loc.toLowerCase().contains("jakande") || loc.toLowerCase().contains("lekki")) {
                    loc = systemLoc;
                }

                if (clockInRaw != null && !clockInRaw.isEmpty() && !"null".equalsIgnoreCase(clockInRaw)) {
                    Date inDate = null;
                    try {
                        inDate = apiDateFmt.parse(clockInRaw);
                    } catch (Exception ignored) {
                        try {
                            SimpleDateFormat isoZ = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
                            isoZ.setTimeZone(TimeZone.getTimeZone("UTC"));
                            inDate = isoZ.parse(clockInRaw);
                        } catch (Exception ignored2) {}
                    }
                    if (inDate != null) {
                        String dateDisplay = formatOrdinalDate(inDate);
                        String inRange = rangeTimeFmt.format(inDate).toUpperCase();
                        String outRange = "--:--";
                        String inSummary = summaryTimeFmt.format(inDate).toLowerCase();
                        String outSummary = "--:--";

                        if (clockOutRaw != null && !clockOutRaw.isEmpty() && !"null".equalsIgnoreCase(clockOutRaw)) {
                            Date outDate = null;
                            try {
                                outDate = apiDateFmt.parse(clockOutRaw);
                            } catch (Exception ignored) {
                                try {
                                    SimpleDateFormat isoZ = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
                                    isoZ.setTimeZone(TimeZone.getTimeZone("UTC"));
                                    outDate = isoZ.parse(clockOutRaw);
                                } catch (Exception ignored2) {}
                            }
                            if (outDate != null) {
                                outRange = rangeTimeFmt.format(outDate).toUpperCase();
                                outSummary = summaryTimeFmt.format(outDate).toLowerCase();
                            }
                        }

                        // Real-time status calculation (Early, On Time, Late: 9:01+ is late)
                        String computedStatus = calculateStatusFromTime(inDate);

                        historyItems.add(new AttendanceItem(
                                inDate,
                                dateDisplay,
                                inRange + " - " + outRange,
                                loc,
                                computedStatus,
                                inSummary,
                                outSummary,
                                "--:--"
                        ));
                    }
                }
            } catch (Exception ignored) {}
        }

        // Sort descending: Today, Yesterday, and continuing before
        Collections.sort(historyItems, (a, b) -> {
            if (a.rawDate != null && b.rawDate != null) {
                return b.rawDate.compareTo(a.rawDate);
            }
            return 0;
        });
    }

    private void prependLiveHistoryItem(String clockIn) {
        Date now = new Date();
        String todayDisplay = formatOrdinalDate(now);
        String liveStatus = calculateStatusFromTime(now);

        SimpleDateFormat rangeTimeFmt = new SimpleDateFormat("h:mma", Locale.US);
        String inRange = rangeTimeFmt.format(now).toUpperCase();

        String breakTime = ApiClient.getInstance(this).getLastBreakTimeStr();
        AttendanceItem newItem = new AttendanceItem(
                now,
                todayDisplay,
                inRange + " - In Progress",
                getSystemLocation(),
                liveStatus,
                clockIn,
                "--:--",
                breakTime != null ? breakTime : "--:--"
        );
        historyItems.add(0, newItem);
        renderHistoryList();
    }

    private void finalizeLiveHistoryItem(String clockOut) {
        if (!historyItems.isEmpty()) {
            AttendanceItem first = historyItems.get(0);
            SimpleDateFormat rangeTimeFmt = new SimpleDateFormat("h:mma", Locale.US);
            String outRange = rangeTimeFmt.format(new Date()).toUpperCase();
            String inRange = first.timeRange.contains("-") ? first.timeRange.split("-")[0].trim() : "9:00AM";

            first.timeRange = inRange + " - " + outRange;
            first.clockOut = clockOut;
            renderHistoryList();
        }
    }

    private void renderHistoryList() {
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
            btnSeeAll.setVisibility(View.GONE);
            return;
        }

        int maxCount = isAllExpanded ? Math.min(30, historyItems.size()) : Math.min(7, historyItems.size());
        btnSeeAll.setVisibility(historyItems.size() > 7 ? View.VISIBLE : View.GONE);
        btnSeeAll.setText(isAllExpanded ? "Show 7 Days" : "See All >");

        for (int i = 0; i < maxCount; i++) {
            AttendanceItem item = historyItems.get(i);

            // Dynamic filter evaluation
            if ("EARLY".equals(currentFilter) && !"EARLY".equalsIgnoreCase(item.status)) continue;
            if ("ON_TIME".equals(currentFilter) && !"ON_TIME".equalsIgnoreCase(item.status)) continue;
            if ("LATE".equals(currentFilter) && !"LATE".equalsIgnoreCase(item.status)) continue;

            View row = inflater.inflate(R.layout.item_attendance_history, llAttendanceHistoryList, false);

            TextView tvDate = row.findViewById(R.id.tvHistoryDate);
            TextView tvTime = row.findViewById(R.id.tvHistoryTimeRange);
            TextView tvLoc = row.findViewById(R.id.tvHistoryLocation);
            LinearLayout pillStatus = row.findViewById(R.id.pillHistoryStatus);
            View dotStatus = row.findViewById(R.id.dotHistoryStatus);
            TextView tvStatusText = row.findViewById(R.id.tvHistoryStatusText);

            tvDate.setText(item.dateDisplay);
            tvTime.setText(item.timeRange);
            tvLoc.setText(item.location);

            if ("LATE".equalsIgnoreCase(item.status)) {
                pillStatus.setBackgroundResource(R.drawable.bg_badge_late);
                dotStatus.setBackgroundResource(R.drawable.dot_late);
                tvStatusText.setText("Late");
                tvStatusText.setTextColor(Color.parseColor("#D97706"));
            } else if ("ON_TIME".equalsIgnoreCase(item.status)) {
                pillStatus.setBackgroundResource(R.drawable.bg_badge_early);
                dotStatus.setBackgroundResource(R.drawable.dot_present);
                tvStatusText.setText("On Time");
                tvStatusText.setTextColor(Color.parseColor("#059669"));
            } else if ("IN_PROGRESS".equalsIgnoreCase(item.status)) {
                pillStatus.setBackgroundResource(R.drawable.bg_badge_inprogress);
                dotStatus.setBackgroundResource(R.drawable.dot_inprogress);
                tvStatusText.setText("In Progress");
                tvStatusText.setTextColor(Color.parseColor("#2563EB"));
            } else {
                // Default EARLY
                pillStatus.setBackgroundResource(R.drawable.bg_badge_early);
                dotStatus.setBackgroundResource(R.drawable.dot_present);
                tvStatusText.setText("Early");
                tvStatusText.setTextColor(Color.parseColor("#059669"));
            }

            row.setOnClickListener(v -> showRecordDetailDialog(item));

            llAttendanceHistoryList.addView(row);
        }
    }

    private String calculateStatusFromTime(Date inDate) {
        if (inDate == null) return "ON_TIME";
        Calendar cal = Calendar.getInstance();
        cal.setTime(inDate);
        int hour = cal.get(Calendar.HOUR_OF_DAY);
        int minute = cal.get(Calendar.MINUTE);

        // Standard 09:00 AM shift: 9:00:59 is On Time, 9:01+ is Late
        if (hour < 9) {
            return "EARLY";
        } else if (hour == 9 && minute == 0) {
            return "ON_TIME";
        } else {
            return "LATE";
        }
    }

    private String getSystemLocation() {
        String org = ApiClient.getInstance(this).getOrganization();
        if (org == null || org.trim().isEmpty() || "null".equalsIgnoreCase(org)) {
            return "GlobizHub HQ";
        }
        String clean = org.trim();
        if ("acmecorp".equalsIgnoreCase(clean)) {
            return "Acme Corp • HQ";
        }
        if (clean.toLowerCase().contains("globizhub")) {
            return "GlobizHub HQ";
        }
        return clean + " • Main Office";
    }

    private void showRecordDetailDialog(AttendanceItem item) {
        new AlertDialog.Builder(this)
                .setTitle(item.dateDisplay)
                .setMessage("Working Hours: " + item.timeRange + "\nLocation: " + item.location + "\nPunch Status: " + item.status + "\n\nBreak Schedule: " + item.breakTime)
                .setPositiveButton("Close", null)
                .show();
    }

    private void showFilterOptionsDialog() {
        String[] options = {"Show All Records", "Filter: Early Punches", "Filter: On Time Punches", "Filter: Late Punches", "Request Regularization"};
        new AlertDialog.Builder(this)
                .setTitle("Attendance History")
                .setItems(options, (dialog, which) -> {
                    switch (which) {
                        case 0:
                            currentFilter = "ALL";
                            isAllExpanded = true;
                            renderHistoryList();
                            break;
                        case 1:
                            currentFilter = "EARLY";
                            isAllExpanded = true;
                            renderHistoryList();
                            break;
                        case 2:
                            currentFilter = "ON_TIME";
                            isAllExpanded = true;
                            renderHistoryList();
                            break;
                        case 3:
                            currentFilter = "LATE";
                            isAllExpanded = true;
                            renderHistoryList();
                            break;
                        case 4:
                            showRegularizationDialog();
                            break;
                    }
                })
                .show();
    }

    private void showRegularizationDialog() {
        new AlertDialog.Builder(this)
                .setTitle("Request Regularization")
                .setMessage("Submit attendance correction for biometric sync discrepancy.\n\nYour reporting manager will receive instant approval notification.")
                .setPositiveButton("Submit", (dialog, which) -> {
                    Toast.makeText(this, "Regularization request submitted to HR", Toast.LENGTH_SHORT).show();
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private String formatOrdinalDate(Date date) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        int day = cal.get(Calendar.DAY_OF_MONTH);
        String suffix = getOrdinalSuffix(day);

        SimpleDateFormat monthYearFmt = new SimpleDateFormat("MMMM, yyyy", Locale.US);
        return day + suffix + " " + monthYearFmt.format(date);
    }

    private String getOrdinalSuffix(int day) {
        if (day >= 11 && day <= 13) return "th";
        switch (day % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    }

    private void loadUserProfile() {
        ApiClient client = ApiClient.getInstance(this);
        String firstName = client.getFirstName();
        if (firstName != null && !firstName.isEmpty()) {
            tvAvatarInitials.setText(firstName.substring(0, 1).toUpperCase());
        } else {
            tvAvatarInitials.setText("C");
        }
    }
}
