package com.globiz.hr;

import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.globiz.hr.network.ApiClient;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

public class TasksActivity extends AppCompatActivity {

    private ApiClient apiClient;
    private LinearLayout llWeekOverview;
    private LinearLayout llUpcomingShifts;
    private TextView tvEmptyShifts;
    private ProgressBar pbLoading;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tasks);

        apiClient = ApiClient.getInstance(this);
        llWeekOverview = findViewById(R.id.llWeekOverview);
        llUpcomingShifts = findViewById(R.id.llUpcomingShifts);
        tvEmptyShifts = findViewById(R.id.tvEmptyShifts);
        pbLoading = findViewById(R.id.pbLoading);

        // Header Title: Schedule
        AppHeaderHelper.setupHeader(this, "Schedule", false);

        setupBottomNav();
        loadScheduleData();
        NavBarScrollHelper.attachToScrollView(findViewById(R.id.scrollView), findViewById(R.id.bottomNavBar));
    }

    @Override
    protected void onResume() {
        super.onResume();
        BottomNavHelper.setupBottomNav(this, "schedules");
        AppHeaderHelper.refreshHeaderState(this);
        loadScheduleData();
    }

    private void setupBottomNav() {
        BottomNavHelper.setupBottomNav(this, "schedules");

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
                startActivity(new Intent(this, AttendanceActivity.class));
                finish();
            });
        }

        View navTabLeave = findViewById(R.id.navTabLeave);
        if (navTabLeave != null) {
            navTabLeave.setOnClickListener(v -> {
                startActivity(new Intent(this, LeaveActivity.class));
                finish();
            });
        }

        View navTabMore = findViewById(R.id.navTabMore);
        if (navTabMore != null) {
            navTabMore.setOnClickListener(v -> {
                startActivity(new Intent(this, MoreActivity.class));
                finish();
            });
        }
    }

    private void loadScheduleData() {
        if (pbLoading != null) pbLoading.setVisibility(View.VISIBLE);

        apiClient.getMySchedule(new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray result) {
                runOnUiThread(() -> {
                    if (pbLoading != null) pbLoading.setVisibility(View.GONE);
                    renderSchedule(result);
                });
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                runOnUiThread(() -> {
                    if (pbLoading != null) pbLoading.setVisibility(View.GONE);
                    if (llWeekOverview != null && llWeekOverview.getChildCount() == 0) {
                        renderFallbackWeek();
                    }
                });
            }
        });
    }

    private void renderSchedule(JSONArray schedules) {
        if (llWeekOverview != null) llWeekOverview.removeAllViews();
        if (llUpcomingShifts != null) llUpcomingShifts.removeAllViews();

        if (schedules == null || schedules.length() == 0) {
            renderFallbackWeek();
            if (tvEmptyShifts != null) tvEmptyShifts.setVisibility(View.VISIBLE);
            return;
        }

        int upcomingCount = 0;
        for (int i = 0; i < schedules.length(); i++) {
            JSONObject s = schedules.optJSONObject(i);
            if (s == null) continue;

            String dateStr = s.optString("date", "");
            boolean isDayOff = s.optBoolean("isDayOff", false);
            boolean isOverride = s.optBoolean("isOverride", false);

            JSONObject shift = s.optJSONObject("shift");
            String shiftName = shift != null ? shift.optString("name", "Shift") : "General Shift";
            String startTime = shift != null ? shift.optString("startTime", "09:00") : "09:00";
            String endTime = shift != null ? shift.optString("endTime", "18:00") : "18:00";
            boolean isNightShift = shift != null && shift.optBoolean("isNightShift", false);

            JSONObject swap = s.optJSONObject("relatedSwapRequest");
            String requesterName = "";
            String targetName = "";
            if (swap != null) {
                JSONObject req = swap.optJSONObject("requester");
                if (req != null) requesterName = req.optString("firstName", "") + " " + req.optString("lastName", "");
                JSONObject tgt = swap.optJSONObject("target");
                if (tgt != null) targetName = tgt.optString("firstName", "") + " " + tgt.optString("lastName", "");
            }

            // 1. Add to Week Overview
            if (llWeekOverview != null) {
                View dayCard = createDayCardView(dateStr, isDayOff, isOverride, isNightShift, shiftName, startTime, endTime, requesterName, targetName);
                llWeekOverview.addView(dayCard);
            }

            // 2. Add to Upcoming Shifts Details if active or override
            if (!isDayOff || isOverride) {
                upcomingCount++;
                if (llUpcomingShifts != null) {
                    View shiftDetailCard = createShiftDetailCardView(dateStr, isDayOff, isOverride, isNightShift, shiftName, startTime, endTime, requesterName, targetName);
                    llUpcomingShifts.addView(shiftDetailCard);
                }
            }
        }

        if (tvEmptyShifts != null) {
            tvEmptyShifts.setVisibility(upcomingCount == 0 ? View.VISIBLE : View.GONE);
        }
    }

    private View createDayCardView(String dateStr, boolean isDayOff, boolean isOverride, boolean isNightShift,
                                  String shiftName, String startTime, String endTime, String requesterName, String targetName) {
        boolean isGiver = isOverride && isDayOff;
        boolean isProxy = isOverride && !isDayOff;

        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        int pad = dpToPx(12);
        card.setPadding(pad, pad, pad, pad);

        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(dpToPx(124), LinearLayout.LayoutParams.WRAP_CONTENT);
        lp.setMarginEnd(dpToPx(10));
        card.setLayoutParams(lp);

        // Styling based on state
        if (isGiver) {
            card.setBackgroundResource(R.drawable.bg_tag_absent);
        } else if (isProxy) {
            card.setBackgroundResource(R.drawable.bg_mint_pill);
        } else if (isDayOff) {
            card.setBackgroundResource(R.drawable.bg_tag_weekend);
        } else if (isNightShift) {
            card.setBackgroundResource(R.drawable.bg_stat_card_indigo);
        } else {
            card.setBackgroundResource(R.drawable.bg_attendance_banner);
        }

        // Top row: Day Name + Icon
        LinearLayout topRow = new LinearLayout(this);
        topRow.setOrientation(LinearLayout.HORIZONTAL);
        topRow.setGravity(Gravity.CENTER_VERTICAL);

        LinearLayout textCol = new LinearLayout(this);
        textCol.setOrientation(LinearLayout.VERTICAL);
        LinearLayout.LayoutParams textLp = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f);
        textCol.setLayoutParams(textLp);

        TextView tvDay = new TextView(this);
        tvDay.setText(getDayName(dateStr).toUpperCase(Locale.ROOT));
        tvDay.setTextSize(12);
        tvDay.setTypeface(null, Typeface.BOLD);
        tvDay.setTextColor(0xFF0F172A);
        textCol.addView(tvDay);

        TextView tvDate = new TextView(this);
        tvDate.setText(formatScheduleDate(dateStr));
        tvDate.setTextSize(10);
        tvDate.setTextColor(0xFF64748B);
        textCol.addView(tvDate);

        topRow.addView(textCol);

        ImageView ivIcon = new ImageView(this);
        LinearLayout.LayoutParams ivLp = new LinearLayout.LayoutParams(dpToPx(20), dpToPx(20));
        ivIcon.setLayoutParams(ivLp);
        if (isDayOff) {
            ivIcon.setImageResource(R.drawable.ic_coffee_cup);
            ivIcon.setColorFilter(0xFF94A3B8);
        } else if (isNightShift) {
            ivIcon.setImageResource(R.drawable.ic_moon);
            ivIcon.setColorFilter(0xFF6366F1);
        } else {
            ivIcon.setImageResource(R.drawable.ic_sun);
            ivIcon.setColorFilter(0xFFF59E0B);
        }
        topRow.addView(ivIcon);

        card.addView(topRow);

        // Status badge
        TextView tvBadge = new TextView(this);
        LinearLayout.LayoutParams badgeLp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        badgeLp.topMargin = dpToPx(10);
        tvBadge.setLayoutParams(badgeLp);
        tvBadge.setGravity(Gravity.CENTER);
        tvBadge.setPadding(dpToPx(4), dpToPx(3), dpToPx(4), dpToPx(3));
        tvBadge.setTextSize(10);
        tvBadge.setTypeface(null, Typeface.BOLD);
        tvBadge.setBackgroundResource(R.drawable.bg_date_badge);

        if (isGiver) {
            tvBadge.setText("Shift Given");
            tvBadge.setTextColor(0xFFE11D48);
        } else if (isProxy) {
            tvBadge.setText("Proxy Swap");
            tvBadge.setTextColor(0xFF059669);
        } else if (isDayOff) {
            tvBadge.setText("Day Off");
            tvBadge.setTextColor(0xFF64748B);
        } else {
            tvBadge.setText(shiftName);
            tvBadge.setTextColor(0xFF0F172A);
        }
        card.addView(tvBadge);

        // Subtext if override
        if (isGiver && !requesterName.trim().isEmpty()) {
            TextView tvSub = new TextView(this);
            tvSub.setText("To " + requesterName);
            tvSub.setTextSize(9);
            tvSub.setTextColor(0xFFE11D48);
            tvSub.setGravity(Gravity.CENTER);
            card.addView(tvSub);
        } else if (isProxy && !targetName.trim().isEmpty()) {
            TextView tvSub = new TextView(this);
            tvSub.setText("For " + targetName);
            tvSub.setTextSize(9);
            tvSub.setTextColor(0xFF059669);
            tvSub.setGravity(Gravity.CENTER);
            card.addView(tvSub);
        }

        // Timing row
        TextView tvTime = new TextView(this);
        LinearLayout.LayoutParams timeLp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        timeLp.topMargin = dpToPx(6);
        tvTime.setLayoutParams(timeLp);
        tvTime.setGravity(Gravity.CENTER);
        tvTime.setText(isDayOff ? "--:--" : (startTime + " - " + endTime));
        tvTime.setTextSize(10);
        tvTime.setTypeface(null, Typeface.BOLD);
        tvTime.setTextColor(0xFF334155);
        card.addView(tvTime);

        return card;
    }

    private View createShiftDetailCardView(String dateStr, boolean isDayOff, boolean isOverride, boolean isNightShift,
                                           String shiftName, String startTime, String endTime, String requesterName, String targetName) {
        boolean isGiver = isOverride && isDayOff;
        boolean isProxy = isOverride && !isDayOff;

        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setGravity(Gravity.CENTER_VERTICAL);
        int pad = dpToPx(12);
        row.setPadding(pad, pad, pad, pad);
        row.setBackgroundResource(R.drawable.bg_card_unselected);

        LinearLayout.LayoutParams rowLp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        rowLp.topMargin = dpToPx(8);
        row.setLayoutParams(rowLp);

        // Icon Box
        LinearLayout iconBox = new LinearLayout(this);
        iconBox.setGravity(Gravity.CENTER);
        int boxSize = dpToPx(40);
        LinearLayout.LayoutParams boxLp = new LinearLayout.LayoutParams(boxSize, boxSize);
        boxLp.setMarginEnd(dpToPx(12));
        iconBox.setLayoutParams(boxLp);

        ImageView iv = new ImageView(this);
        LinearLayout.LayoutParams ivLp = new LinearLayout.LayoutParams(dpToPx(20), dpToPx(20));
        iv.setLayoutParams(ivLp);

        if (isGiver) {
            iconBox.setBackgroundResource(R.drawable.bg_red_circle);
            iv.setImageResource(R.drawable.ic_coffee_cup);
            iv.setColorFilter(0xFFEF4444);
        } else if (isProxy) {
            iconBox.setBackgroundResource(R.drawable.bg_mint_circle);
            iv.setImageResource(R.drawable.ic_clock);
            iv.setColorFilter(0xFF10B981);
        } else if (isNightShift) {
            iconBox.setBackgroundResource(R.drawable.bg_stat_card_indigo);
            iv.setImageResource(R.drawable.ic_moon);
            iv.setColorFilter(0xFF6366F1);
        } else {
            iconBox.setBackgroundResource(R.drawable.bg_attendance_banner);
            iv.setImageResource(R.drawable.ic_sun);
            iv.setColorFilter(0xFFF59E0B);
        }
        iconBox.addView(iv);
        row.addView(iconBox);

        // Text details column
        LinearLayout textCol = new LinearLayout(this);
        textCol.setOrientation(LinearLayout.VERTICAL);
        LinearLayout.LayoutParams textLp = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f);
        textCol.setLayoutParams(textLp);

        // Date row with optional OVERRIDE pill
        LinearLayout titleRow = new LinearLayout(this);
        titleRow.setOrientation(LinearLayout.HORIZONTAL);
        titleRow.setGravity(Gravity.CENTER_VERTICAL);

        TextView tvTitle = new TextView(this);
        tvTitle.setText(formatScheduleDate(dateStr) + " (" + getDayName(dateStr) + ")");
        tvTitle.setTextSize(13);
        tvTitle.setTypeface(null, Typeface.BOLD);
        tvTitle.setTextColor(0xFF0F172A);
        titleRow.addView(tvTitle);

        if (isOverride) {
            TextView tvOverride = new TextView(this);
            tvOverride.setText(" OVERRIDE ");
            tvOverride.setTextSize(9);
            tvOverride.setTypeface(null, Typeface.BOLD);
            tvOverride.setTextColor(0xFF4F46E5);
            tvOverride.setBackgroundResource(R.drawable.bg_date_badge);
            LinearLayout.LayoutParams overLp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
            overLp.setMarginStart(dpToPx(6));
            tvOverride.setLayoutParams(overLp);
            titleRow.addView(tvOverride);
        }
        textCol.addView(titleRow);

        // Subtitle with timing & details
        TextView tvSub = new TextView(this);
        String subText = isGiver ? "No attendance required" : (startTime + " - " + endTime);
        if (isGiver && !requesterName.trim().isEmpty()) {
            subText += " • Given to " + requesterName;
        } else if (isProxy && !targetName.trim().isEmpty()) {
            subText += " • Proxy for " + targetName;
        }
        tvSub.setText(subText);
        tvSub.setTextSize(11);
        tvSub.setTextColor(0xFF64748B);
        tvSub.setLayoutParams(new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT));
        textCol.addView(tvSub);

        row.addView(textCol);

        // Badge at right
        TextView tvRightBadge = new TextView(this);
        tvRightBadge.setText(isGiver ? "Shift Given" : isProxy ? "Proxy" : shiftName);
        tvRightBadge.setTextSize(11);
        tvRightBadge.setTypeface(null, Typeface.BOLD);
        tvRightBadge.setPadding(dpToPx(8), dpToPx(4), dpToPx(8), dpToPx(4));

        if (isGiver) {
            tvRightBadge.setBackgroundResource(R.drawable.bg_tag_absent);
            tvRightBadge.setTextColor(0xFFE11D48);
        } else if (isProxy) {
            tvRightBadge.setBackgroundResource(R.drawable.bg_mint_pill);
            tvRightBadge.setTextColor(0xFF059669);
        } else {
            tvRightBadge.setBackgroundResource(R.drawable.bg_date_badge);
            tvRightBadge.setTextColor(0xFF334155);
        }
        row.addView(tvRightBadge);

        return row;
    }

    private void renderFallbackWeek() {
        if (llWeekOverview == null) return;
        llWeekOverview.removeAllViews();

        Calendar cal = Calendar.getInstance();
        SimpleDateFormat isoFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.ROOT);

        for (int i = 0; i < 7; i++) {
            String dateStr = isoFormat.format(cal.getTime());
            int dayOfWeek = cal.get(Calendar.DAY_OF_WEEK);
            boolean isDayOff = (dayOfWeek == Calendar.SUNDAY);

            View card = createDayCardView(dateStr, isDayOff, false, false, "General Shift", "09:00", "18:00", "", "");
            llWeekOverview.addView(card);

            cal.add(Calendar.DAY_OF_YEAR, 1);
        }
    }

    private String formatScheduleDate(String dateString) {
        if (dateString == null || dateString.length() < 10) return "";
        try {
            SimpleDateFormat inFmt = new SimpleDateFormat("yyyy-MM-dd", Locale.ROOT);
            Date date = inFmt.parse(dateString.substring(0, 10));
            if (date == null) return dateString;

            Calendar cal = Calendar.getInstance();
            cal.set(Calendar.HOUR_OF_DAY, 0); cal.set(Calendar.MINUTE, 0); cal.set(Calendar.SECOND, 0); cal.set(Calendar.MILLISECOND, 0);
            Date today = cal.getTime();

            cal.add(Calendar.DAY_OF_YEAR, 1);
            Date tomorrow = cal.getTime();

            if (inFmt.format(date).equals(inFmt.format(today))) return "Today";
            if (inFmt.format(date).equals(inFmt.format(tomorrow))) return "Tomorrow";

            SimpleDateFormat outFmt = new SimpleDateFormat("MMM d", Locale.ROOT);
            return outFmt.format(date);
        } catch (Exception e) {
            return dateString.substring(0, Math.min(10, dateString.length()));
        }
    }

    private String getDayName(String dateString) {
        if (dateString == null || dateString.length() < 10) return "";
        try {
            SimpleDateFormat inFmt = new SimpleDateFormat("yyyy-MM-dd", Locale.ROOT);
            Date date = inFmt.parse(dateString.substring(0, 10));
            if (date == null) return "";
            SimpleDateFormat outFmt = new SimpleDateFormat("EEE", Locale.ROOT);
            return outFmt.format(date);
        } catch (Exception e) {
            return "";
        }
    }

    private int dpToPx(int dp) {
        float density = getResources().getDisplayMetrics().density;
        return Math.round(dp * density);
    }
}
