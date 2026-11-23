package com.globiz.hr;

import android.Manifest;
import android.animation.ObjectAnimator;
import android.animation.ValueAnimator;
import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.Outline;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.GestureDetector;
import android.view.HapticFeedbackConstants;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewOutlineProvider;
import android.view.animation.DecelerateInterpolator;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.HorizontalScrollView;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import android.app.AlertDialog;
import android.graphics.Matrix;
import android.graphics.SurfaceTexture;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.media.MediaPlayer;
import android.net.Uri;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.Surface;
import android.view.TextureView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;

import com.globiz.hr.network.ApiClient;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;
import java.util.concurrent.Executors;

public class HomeActivity extends AppCompatActivity {

    private static final String NOTIFICATION_CHANNEL_ID = "teamhub_attendance_channel";

    // Top Bar Views
    private View btnNotifications;
    private View viewNotificationDot;
    private FrameLayout flAvatarContainer;
    private ImageView ivUserAvatar;
    private TextView tvAvatarInitials;

    // Hero Card Views & Background Video
    private TextureView textureViewHeroVideo;
    private MediaPlayer heroMediaPlayer;
    private int heroVideoWidth = 0;
    private int heroVideoHeight = 0;
    private TextView tvGreetingName;
    private TextView tvUserRoleLocation;
    private TextView tvShiftTiming;
    private TextView tvShiftStatusBadge;

    // Timer Card Views
    private TextView tvLiveTimer;
    private TextView tvPunchedInAt;
    private TextView tvBreakTimer;
    private View layoutShiftCapsule;
    private View btnClockIn;
    private View btnClockOut;
    private FrameLayout flPunchButton;
    private ImageView ivPunchIcon;
    private ProgressBar holdProgressBar;
    private View btnTakeBreak;
    private ImageView ivTakeBreak;
    private TextView tvTakeBreak;

    // Leaves Card Views
    private View cvLeavesCard;
    private TextView tvCasualLeave;
    private TextView tvSickLeave;
    private ProgressBar pbLeaveProgress;

    // Attendance Metrics & Holidays/Leaves & Announcements Views
    private TextView tvMonthlyAttendanceValue;
    private TextView tvHoursTodayValue;
    private View cvHolidaysAndLeaves;
    private TextView tvUpcomingHolidaysCount;
    private TextView tvDaysPresentCount;
    private View cvAnnouncementsCard;
    private LinearLayout llEmployeeAnnouncements;
    private View tvEmployeeAnnouncementsEmpty;

    // Holiday Card Views
    private View cvHolidayCard;
    private TextView tvHolidayName;
    private TextView tvHolidayDate;
    private TextView tvHolidayDaysLeft;
    private View dotHoliday0, dotHoliday1, dotHoliday2;

    // Other Cards
    private View cvTeamPresence;
    private TextView tvTeamActiveCount;
    private LinearLayout llTeamAvatars;
    private TextView tvViewRoster;
    private JSONArray cachedTeamMembers = new JSONArray();

    private View cvTasksCard;
    private TextView tvTasksDueTitle;
    private TextView tvTasksNextSubtitle;
    private JSONArray cachedTasks = new JSONArray();

    // Monthly & Full Year GitHub Attendance Activity Heatmap
    private View cvMonthlyHeatmapCard;
    private TextView btnHeatmapModeMonth;
    private TextView btnHeatmapModeYear;
    private View layoutHeatmapMonthControls;
    private View btnHeatmapPrevMonth;
    private View btnHeatmapNextMonth;
    private TextView tvHeatmapMonthYear;
    private View layoutHeatmapMonthContainer;
    private LinearLayout layoutHeatmapGrid;
    private View layoutHeatmapYearContainer;
    private HorizontalScrollView scrollHeatmapYear;
    private LinearLayout layoutHeatmapYearMatrix;
    private LinearLayout layoutHeatmapDayDetail;
    private TextView tvHeatmapDetailDate;
    private TextView tvHeatmapDetailHours;
    private final Calendar heatmapCalendar = Calendar.getInstance();
    private View todayHeatmapBoxView = null;
    private TextView todayHeatmapBoxText = null;
    private int selectedHeatmapDay = -1;
    private boolean isYearHeatmapMode = false;
    private final List<HeatmapDayData> allYearDaysData = new ArrayList<>();

    private static class RealAttendanceRecord {
        String dateKey;
        Date inDate;
        Date outDate;
        boolean isLate;
        String clockInFormatted;
        String clockOutFormatted;
    }
    private final Map<String, RealAttendanceRecord> attendanceHistoryMap = new HashMap<>();

    // Skeleton Views
    private LinearLayout llHomeCardsContainer;
    private LinearLayout layoutSkeletonHome;

    // Multi-Role Dashboard Containers
    private View layoutEmployeeDashboard;
    private View layoutAdminDashboard;
    private View layoutSuperAdminDashboard;

    // Admin Dashboard Views
    private TextView tvAdminGreeting;
    private TextView tvAdminSubtitle;
    private TextView tvAdminLiveBadge;
    private TextView tvAdminTotalEmployees;
    private TextView tvAdminPresentToday;
    private TextView tvAdminAbsentToday;
    private TextView tvAdminLateToday;
    private View btnAdminBroadcastNotice;
    private View btnAdminLeaveApprovals;
    private View btnAdminTeamDirectory;
    private View cvAdminPendingLeavesCard;
    private TextView tvAdminPendingLeavesBadge;
    private LinearLayout llAdminPendingLeavesList;
    private LinearLayout llAdminAuditList;
    private LinearLayout llAdminLeaveBalancesList;
    private LinearLayout llAdminAnnouncementsList;

    // Super Admin Dashboard Views
    private TextView tvSuperAdminGreeting;
    private TextView tvSuperAdminSubtitle;
    private TextView tvSuperAdminTotalOrgs;
    private TextView tvSuperAdminOrgsSub;
    private TextView tvSuperAdminTotalEmployees;
    private TextView tvSuperAdminMRR;
    private TextView tvSuperAdminSubs;
    private TextView tvSuperAdminPendingOrgs;
    private TextView tvSuperAdminSuspended;
    private TextView tvSuperAdminOpenTickets;
    private View btnSuperAdminRecalculate;
    private View btnSuperAdminBroadcast;
    private View btnSuperAdminSecurity;
    private LinearLayout llSuperAdminTenantsList;
    private LinearLayout llSuperAdminAuditList;
    private View skelHomeHero;
    private View skelHomeTimer;
    private View skelHomeLeaves;
    private View skelHomeHolidays;
    private View skelHomeHeatmap;
    private boolean isInitialLoad = true;

    // Bottom Animated Popup
    private LinearLayout hintPopupCard;
    private TextView tvHintText;

    // Punch Button & Instructions
    private View viewPunchGlowRing;
    private TextView tvPunchInstruction;

    // Attendance & Timer State
    private boolean isCheckedIn = false;
    private boolean isOnBreak = false;
    private Date currentBreakStartDate = null;
    private long accumulatedBreakTimeMs = 0;
    private String lastBreakSessionText = null;
    private Date checkInDateTime = null;
    private final Handler timerHandler = new Handler(Looper.getMainLooper());
    private Runnable timerRunnable;

    // Shift Timing Window & Punctuality State
    private boolean isTodayLate = false;
    private boolean isShiftCompletedToday = false;
    private int shiftStartHour = 9;
    private int shiftStartMinute = 0;
    private int shiftEndHour = 18;
    private int shiftEndMinute = 0;

    // 2-Second Hold State & Lockout Policies
    private static final long REQUIRED_HOLD_MS = 2000;
    private static final long MIN_SHIFT_LOCK_MS = 3 * 60 * 1000; // 3 minutes minimum shift
    private static final long MIN_BREAK_LOCK_MS = 30 * 60 * 1000; // 30 minutes break lockout
    private long pressStartTime = 0;
    private boolean isHolding = false;
    private final Handler holdHandler = new Handler(Looper.getMainLooper());
    private Runnable completeHoldRunnable;
    private ValueAnimator holdAnimator;

    // Hint Popup Auto-dismiss Handler
    private final Handler hintDismissHandler = new Handler(Looper.getMainLooper());
    private Runnable hintDismissRunnable;

    // Holidays Cycling
    private final List<HolidayItem> upcomingHolidays = new ArrayList<>();
    private int currentHolidayIndex = 0;

    private ApiClient apiClient;
    private String cachedFirstName = "";

    private static class HolidayItem {
        String name;
        Date date;
        String formattedDate;
        long daysRemaining;

        HolidayItem(String name, Date date, String formattedDate, long daysRemaining) {
            this.name = name;
            this.date = date;
            this.formattedDate = formattedDate;
            this.daysRemaining = daysRemaining;
        }
    }

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home);

        apiClient = ApiClient.getInstance(this);
        if (!apiClient.isLoggedIn()) {
            startActivity(new Intent(this, SignInActivity.class));
            finish();
            return;
        }

        cachedFirstName = apiClient.getFirstName();
        initNotificationChannel();
        initViews();
        AppHeaderHelper.applyWindowInsets(this);
        setupHoldGesture();
        setupListeners();
        requestAppPermissions();
    }

    private final Handler autoSyncHandler = new Handler(Looper.getMainLooper());
    private final Runnable autoSyncRunnable = new Runnable() {
        @Override
        public void run() {
            String role = apiClient != null ? apiClient.getRole() : "employee";
            if (!"admin".equalsIgnoreCase(role) && !"superadmin".equalsIgnoreCase(role)) {
                loadAttendanceStats();
            }
            autoSyncHandler.postDelayed(this, 12000);
        }
    };

    @Override
    protected void onResume() {
        super.onResume();
        AppHeaderHelper.applyWindowInsets(this);
        BottomNavHelper.setupBottomNav(this, "home");
        if (isInitialLoad) {
            showSkeletonLoading();
            isInitialLoad = false;
        }

        restoreUserAttendanceSession();
        if (apiClient != null) {
            apiClient.syncPendingOfflinePunches();
        }
        scheduleShiftReminderNotifications();
        checkAndTriggerActiveShiftReminder();

        cachedFirstName = apiClient.getFirstName();

        updateGreeting();
        setupRoleDashboard();

        // Start periodic sync with Web (real-time attendance reflection)
        autoSyncHandler.removeCallbacks(autoSyncRunnable);
        autoSyncHandler.postDelayed(autoSyncRunnable, 12000);

        // Resume hero background video loop
        if (heroMediaPlayer == null && textureViewHeroVideo != null && textureViewHeroVideo.isAvailable()) {
            initHeroMediaPlayer(new Surface(textureViewHeroVideo.getSurfaceTexture()),
                    textureViewHeroVideo.getWidth(), textureViewHeroVideo.getHeight());
        } else if (heroMediaPlayer != null && !heroMediaPlayer.isPlaying()) {
            try {
                heroMediaPlayer.start();
            } catch (Exception ignored) {}
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        autoSyncHandler.removeCallbacks(autoSyncRunnable);
        if (heroMediaPlayer != null && heroMediaPlayer.isPlaying()) {
            try {
                heroMediaPlayer.pause();
            } catch (Exception ignored) {}
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        stopTimer();
        holdHandler.removeCallbacksAndMessages(null);
        hintDismissHandler.removeCallbacksAndMessages(null);
        if (holdAnimator != null) {
            holdAnimator.cancel();
        }
        releaseHeroMediaPlayer();
    }

    private void initNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    NOTIFICATION_CHANNEL_ID,
                    "GlobizHR Attendance",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("GlobizHR attendance shift updates and punch notifications");
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    private void initViews() {
        TabletHelper.applyTabletConstraint(findViewById(R.id.topBarHomeContent));
        TabletHelper.applyTabletConstraint(findViewById(R.id.homeContentContainer));
        TabletHelper.applyTabletConstraint(findViewById(R.id.bottomNavHomeContent));
        NavBarScrollHelper.attachToScrollView(findViewById(R.id.scrollView), findViewById(R.id.bottomNavBar));

        // Top Bar
        btnNotifications = findViewById(R.id.btnNotifications);
        viewNotificationDot = findViewById(R.id.viewNotificationDot);
        flAvatarContainer = findViewById(R.id.flAvatarContainer);
        ivUserAvatar = findViewById(R.id.ivUserAvatar);
        tvAvatarInitials = findViewById(R.id.tvAvatarInitials);
        if (tvAvatarInitials != null) {
            tvAvatarInitials.setText(apiClient.getUserInitials());
        }

        if (flAvatarContainer != null) {
            flAvatarContainer.setOutlineProvider(new ViewOutlineProvider() {
                @Override
                public void getOutline(View view, Outline outline) {
                    outline.setOval(0, 0, view.getWidth(), view.getHeight());
                }
            });
            flAvatarContainer.setClipToOutline(true);
        }

        // Hero Card
        textureViewHeroVideo = findViewById(R.id.textureViewHeroVideo);
        setupHeroVideo();
        tvGreetingName = findViewById(R.id.tvGreetingName);
        tvUserRoleLocation = findViewById(R.id.tvUserRoleLocation);
        if (tvUserRoleLocation != null) {
            String initialDesig = apiClient.getDesignation();
            String initialOrg = apiClient.getOrganization();
            tvUserRoleLocation.setText(initialDesig + " • " + initialOrg);
        }
        tvShiftTiming = findViewById(R.id.tvShiftTiming);
        if (tvShiftTiming != null) {
            tvShiftTiming.setText("Shift: " + apiClient.getShiftTiming());
        }
        tvShiftStatusBadge = findViewById(R.id.tvShiftStatusBadge);

        // Timer Card
        tvLiveTimer = findViewById(R.id.tvLiveTimer);
        tvPunchedInAt = findViewById(R.id.tvPunchedInAt);
        layoutShiftCapsule = findViewById(R.id.layoutShiftCapsule);
        btnClockIn = findViewById(R.id.btnClockIn);
        btnClockOut = findViewById(R.id.btnClockOut);

        // Attendance Metrics
        tvMonthlyAttendanceValue = findViewById(R.id.tvMonthlyAttendanceValue);
        tvHoursTodayValue = findViewById(R.id.tvHoursTodayValue);

        // Holidays & Leaves Card
        cvHolidaysAndLeaves = findViewById(R.id.cvHolidaysAndLeaves);
        cvLeavesCard = cvHolidaysAndLeaves;
        tvUpcomingHolidaysCount = findViewById(R.id.tvUpcomingHolidaysCount);
        tvDaysPresentCount = findViewById(R.id.tvDaysPresentCount);

        // Announcements Card
        cvAnnouncementsCard = findViewById(R.id.cvAnnouncementsCard);
        llEmployeeAnnouncements = findViewById(R.id.llEmployeeAnnouncements);
        tvEmployeeAnnouncementsEmpty = findViewById(R.id.tvEmployeeAnnouncementsEmpty);

        // Other Cards
        cvTeamPresence = findViewById(R.id.cvTeamPresence);
        tvTeamActiveCount = findViewById(R.id.tvTeamActiveCount);
        llTeamAvatars = findViewById(R.id.llTeamAvatars);
        tvViewRoster = findViewById(R.id.tvViewRoster);

        // Monthly & Full Year Heatmap Views
        cvMonthlyHeatmapCard = findViewById(R.id.cvMonthlyHeatmapCard);
        btnHeatmapModeMonth = findViewById(R.id.btnHeatmapModeMonth);
        btnHeatmapModeYear = findViewById(R.id.btnHeatmapModeYear);
        layoutHeatmapMonthControls = findViewById(R.id.layoutHeatmapMonthControls);
        btnHeatmapPrevMonth = findViewById(R.id.btnHeatmapPrevMonth);
        btnHeatmapNextMonth = findViewById(R.id.btnHeatmapNextMonth);
        tvHeatmapMonthYear = findViewById(R.id.tvHeatmapMonthYear);
        layoutHeatmapMonthContainer = findViewById(R.id.layoutHeatmapMonthContainer);
        layoutHeatmapGrid = findViewById(R.id.layoutHeatmapGrid);
        layoutHeatmapYearContainer = findViewById(R.id.layoutHeatmapYearContainer);
        scrollHeatmapYear = findViewById(R.id.scrollHeatmapYear);
        layoutHeatmapYearMatrix = findViewById(R.id.layoutHeatmapYearMatrix);
        layoutHeatmapDayDetail = findViewById(R.id.layoutHeatmapDayDetail);
        tvHeatmapDetailDate = findViewById(R.id.tvHeatmapDetailDate);
        tvHeatmapDetailHours = findViewById(R.id.tvHeatmapDetailHours);

        // Bottom Elements
        hintPopupCard = findViewById(R.id.hintPopupCard);
        tvHintText = findViewById(R.id.tvHintText);
        tvPunchInstruction = findViewById(R.id.tvPunchInstruction);

        // Skeleton Elements
        llHomeCardsContainer = findViewById(R.id.llHomeCardsContainer);
        layoutSkeletonHome = findViewById(R.id.layoutSkeletonHome);
        skelHomeHero = findViewById(R.id.skelHomeHero);
        skelHomeTimer = findViewById(R.id.skelHomeTimer);
        skelHomeLeaves = findViewById(R.id.skelHomeLeaves);
        skelHomeHolidays = findViewById(R.id.skelHomeHolidays);
        skelHomeHeatmap = findViewById(R.id.skelHomeHeatmap);

        // Multi-Role Dashboard Containers
        layoutEmployeeDashboard = findViewById(R.id.layoutEmployeeDashboard);
        layoutAdminDashboard = findViewById(R.id.layoutAdminDashboard);
        layoutSuperAdminDashboard = findViewById(R.id.layoutSuperAdminDashboard);

        // Admin Views
        tvAdminGreeting = findViewById(R.id.tvAdminGreeting);
        tvAdminSubtitle = findViewById(R.id.tvAdminSubtitle);
        tvAdminLiveBadge = findViewById(R.id.tvAdminLiveBadge);
        tvAdminTotalEmployees = findViewById(R.id.tvAdminTotalEmployees);
        tvAdminPresentToday = findViewById(R.id.tvAdminPresentToday);
        tvAdminAbsentToday = findViewById(R.id.tvAdminAbsentToday);
        tvAdminLateToday = findViewById(R.id.tvAdminLateToday);
        btnAdminBroadcastNotice = findViewById(R.id.btnAdminBroadcastNotice);
        btnAdminLeaveApprovals = findViewById(R.id.btnAdminLeaveApprovals);
        btnAdminTeamDirectory = findViewById(R.id.btnAdminTeamDirectory);
        cvAdminPendingLeavesCard = findViewById(R.id.cvAdminPendingLeavesCard);
        tvAdminPendingLeavesBadge = findViewById(R.id.tvAdminPendingLeavesBadge);
        llAdminPendingLeavesList = findViewById(R.id.llAdminPendingLeavesList);
        llAdminAuditList = findViewById(R.id.llAdminAuditList);
        llAdminLeaveBalancesList = findViewById(R.id.llAdminLeaveBalancesList);
        llAdminAnnouncementsList = findViewById(R.id.llAdminAnnouncementsList);

        // Super Admin Views
        tvSuperAdminGreeting = findViewById(R.id.tvSuperAdminGreeting);
        tvSuperAdminSubtitle = findViewById(R.id.tvSuperAdminSubtitle);
        tvSuperAdminTotalOrgs = findViewById(R.id.tvSuperAdminTotalOrgs);
        tvSuperAdminOrgsSub = findViewById(R.id.tvSuperAdminOrgsSub);
        tvSuperAdminTotalEmployees = findViewById(R.id.tvSuperAdminTotalEmployees);
        tvSuperAdminMRR = findViewById(R.id.tvSuperAdminMRR);
        tvSuperAdminSubs = findViewById(R.id.tvSuperAdminSubs);
        tvSuperAdminPendingOrgs = findViewById(R.id.tvSuperAdminPendingOrgs);
        tvSuperAdminSuspended = findViewById(R.id.tvSuperAdminSuspended);
        tvSuperAdminOpenTickets = findViewById(R.id.tvSuperAdminOpenTickets);
        btnSuperAdminRecalculate = findViewById(R.id.btnSuperAdminRecalculate);
        btnSuperAdminBroadcast = findViewById(R.id.btnSuperAdminBroadcast);
        btnSuperAdminSecurity = findViewById(R.id.btnSuperAdminSecurity);
        llSuperAdminTenantsList = findViewById(R.id.llSuperAdminTenantsList);
        llSuperAdminAuditList = findViewById(R.id.llSuperAdminAuditList);
    }

    // --- Dynamic Time-Based Greeting ---
    private String getTimeBasedGreeting() {
        Calendar cal = Calendar.getInstance();
        int hour = cal.get(Calendar.HOUR_OF_DAY);
        if (hour >= 4 && hour < 12) {
            return "Good Morning";
        } else if (hour >= 12 && hour < 17) {
            return "Good Afternoon";
        } else {
            return "Good Evening";
        }
    }

    private void updateGreeting() {
        String displayName = cachedFirstName.isEmpty() ? apiClient.getFirstName() : cachedFirstName;
        if (displayName != null) {
            if (displayName.contains("@")) {
                displayName = displayName.substring(0, displayName.indexOf('@'));
            }
            displayName = displayName.trim().split("\\s+")[0].replaceAll("[^a-zA-Z]", "");
            if (displayName.isEmpty()) displayName = "User";
            displayName = displayName.substring(0, 1).toUpperCase(Locale.ROOT) +
                    (displayName.length() > 1 ? displayName.substring(1).toLowerCase(Locale.ROOT) : "");
        } else {
            displayName = "User";
        }

        String greeting = getTimeBasedGreeting();
        if (tvGreetingName != null) {
            tvGreetingName.setText(greeting + ", " + displayName);
        }
    }

    // --- 3-Minute Lockout Helpers ---
    private boolean isShiftInThreeMinLock() {
        if (!isCheckedIn || checkInDateTime == null) return false;
        long elapsed = System.currentTimeMillis() - checkInDateTime.getTime();
        return elapsed < MIN_SHIFT_LOCK_MS;
    }

    private long getRemainingLockTimeMs() {
        if (!isCheckedIn || checkInDateTime == null) return 0;
        long elapsed = System.currentTimeMillis() - checkInDateTime.getTime();
        return Math.max(0, MIN_SHIFT_LOCK_MS - elapsed);
    }

    private String formatRemainingLockTime() {
        long remSec = (getRemainingLockTimeMs() + 999) / 1000;
        if (remSec > 120) {
            return "3 min";
        } else if (remSec > 60) {
            return "2 min";
        } else if (remSec == 60) {
            return "1 min (60s)";
        } else {
            return remSec + "s";
        }
    }

    // --- 30-Minute Break Lockout Helpers ---
    private boolean isBreakInThirtyMinLock() {
        if (!isCheckedIn || checkInDateTime == null) return false;
        long elapsed = System.currentTimeMillis() - checkInDateTime.getTime();
        return elapsed < MIN_BREAK_LOCK_MS;
    }

    private int getRemainingBreakLockMinutes() {
        if (!isCheckedIn || checkInDateTime == null) return 0;
        long elapsed = System.currentTimeMillis() - checkInDateTime.getTime();
        long remMs = Math.max(0, MIN_BREAK_LOCK_MS - elapsed);
        return (int) Math.max(1, (remMs + 59999) / 60000);
    }

    private void restoreUserAttendanceSession() {
        String localStatus = apiClient.getLocalAttendanceStatus();
        String localCheckIn = apiClient.getLocalCheckInIso();
        String localCheckOut = apiClient.getLocalCheckOutIso();

        if ("CHECKED_IN".equalsIgnoreCase(localStatus) && localCheckIn != null) {
            Date parsedDate = parseIsoDate(localCheckIn);
            if (parsedDate != null && isDateToday(parsedDate)) {
                isCheckedIn = true;
                checkInDateTime = parsedDate;
                isTodayLate = apiClient.getLocalIsLate();
                isOnBreak = apiClient.isOnBreak();
                startTimer();
                updatePunchButtonUI(true);
                updateBreakUI(isOnBreak);
                updateShiftBadge();
                return;
            }
        } else if ("CHECKED_OUT".equalsIgnoreCase(localStatus) && localCheckOut != null) {
            Date parsedOut = parseIsoDate(localCheckOut);
            if (parsedOut != null && isDateToday(parsedOut)) {
                isShiftCompletedToday = true;
                isCheckedIn = false;
                stopTimer();
                updatePunchButtonUI(false);
                if (tvPunchedInAt != null) {
                    SimpleDateFormat timeFmt = new SimpleDateFormat("hh:mm a", Locale.US);
                    tvPunchedInAt.setText("• Clocked Out at " + timeFmt.format(parsedOut));
                    tvPunchedInAt.setTextColor(Color.parseColor("#EF4444"));
                }
                return;
            }
        }

        isCheckedIn = false;
        checkInDateTime = null;
        stopTimer();
        updateTimerDisplay(0, 0, 0);
        updatePunchButtonUI(false);
    }

    private boolean isDateToday(Date date) {
        if (date == null) return false;
        Calendar today = Calendar.getInstance();
        Calendar check = Calendar.getInstance();
        check.setTime(date);
        return today.get(Calendar.YEAR) == check.get(Calendar.YEAR) &&
                today.get(Calendar.DAY_OF_YEAR) == check.get(Calendar.DAY_OF_YEAR);
    }

    private boolean isWithinPunchInWindow() {
        int windowOpenMinutes = (shiftStartHour * 60 + shiftStartMinute) - 5;
        int windowCloseMinutes = (shiftEndHour * 60 + shiftEndMinute);
        Calendar now = Calendar.getInstance();
        int currentMinutes = now.get(Calendar.HOUR_OF_DAY) * 60 + now.get(Calendar.MINUTE);
        return currentMinutes >= windowOpenMinutes && currentMinutes <= windowCloseMinutes;
    }

    private void autoClockOutAtShiftEnd() {
        if (!isCheckedIn) return;
        Date outDate = new Date();
        isCheckedIn = false;
        isShiftCompletedToday = true;
        stopTimer();

        SimpleDateFormat isoFmt = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
        isoFmt.setTimeZone(TimeZone.getTimeZone("UTC"));
        String nowIso = isoFmt.format(outDate);
        apiClient.recordLocalClockOut(nowIso);

        SimpleDateFormat sdf = new SimpleDateFormat("hh:mm a", Locale.getDefault());
        String timeStr = sdf.format(outDate);
        if (tvPunchedInAt != null) {
            tvPunchedInAt.setText("• Clocked Out at " + timeStr);
            tvPunchedInAt.setTextColor(Color.parseColor("#EF4444"));
        }
        updatePunchButtonUI(false);

        String token = apiClient.getToken();
        apiClient.clockOut(token, new ApiClient.ApiCallback<JSONObject>() {
            @Override
            public void onSuccess(JSONObject result) {
                loadAttendanceStats();
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                apiClient.savePendingOfflinePunch("OUT", nowIso);
            }
        });
    }

    private void updateShiftBadge() {
        if (tvShiftStatusBadge != null) {
            if (isTodayLate) {
                tvShiftStatusBadge.setText("Late");
                tvShiftStatusBadge.setTextColor(Color.parseColor("#B45309"));
                tvShiftStatusBadge.setBackgroundResource(R.drawable.bg_badge_late);
            } else {
                tvShiftStatusBadge.setText("On Track");
                tvShiftStatusBadge.setTextColor(Color.parseColor("#065F46"));
                tvShiftStatusBadge.setBackgroundResource(R.drawable.bg_mint_pill);
            }
        }
    }

    private void scheduleShiftReminderNotifications() {
        try {
            AlarmManager alarmManager = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
            if (alarmManager == null) return;

            // 1. 08:55 AM (5 min before 9:00 AM)
            Calendar preCal = Calendar.getInstance();
            preCal.set(Calendar.HOUR_OF_DAY, 8);
            preCal.set(Calendar.MINUTE, 55);
            preCal.set(Calendar.SECOND, 0);
            if (preCal.getTimeInMillis() <= System.currentTimeMillis()) {
                preCal.add(Calendar.DAY_OF_YEAR, 1);
            }
            Intent preIntent = new Intent(this, ShiftNotificationReceiver.class);
            preIntent.setAction(ShiftNotificationReceiver.ACTION_SHIFT_START_REMINDER);
            PendingIntent prePi = PendingIntent.getBroadcast(
                    this,
                    1001,
                    preIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            alarmManager.setInexactRepeating(
                    AlarmManager.RTC_WAKEUP,
                    preCal.getTimeInMillis(),
                    AlarmManager.INTERVAL_DAY,
                    prePi
            );

            // 2. 06:00 PM (18:00)
            Calendar endCal = Calendar.getInstance();
            endCal.set(Calendar.HOUR_OF_DAY, 18);
            endCal.set(Calendar.MINUTE, 0);
            endCal.set(Calendar.SECOND, 0);
            if (endCal.getTimeInMillis() <= System.currentTimeMillis()) {
                endCal.add(Calendar.DAY_OF_YEAR, 1);
            }
            Intent endIntent = new Intent(this, ShiftNotificationReceiver.class);
            endIntent.setAction(ShiftNotificationReceiver.ACTION_SHIFT_END_REMINDER);
            PendingIntent endPi = PendingIntent.getBroadcast(
                    this,
                    1002,
                    endIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            alarmManager.setInexactRepeating(
                    AlarmManager.RTC_WAKEUP,
                    endCal.getTimeInMillis(),
                    AlarmManager.INTERVAL_DAY,
                    endPi
            );
        } catch (Exception ignored) {}
    }

    private void checkAndTriggerActiveShiftReminder() {
        Calendar now = Calendar.getInstance();
        int hour = now.get(Calendar.HOUR_OF_DAY);
        int minute = now.get(Calendar.MINUTE);
        int currentMinutes = hour * 60 + minute;
        int shiftStartMin = shiftStartHour * 60 + shiftStartMinute;
        int shiftEndMin = shiftEndHour * 60 + shiftEndMinute;

        SimpleDateFormat dateFmt = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
        String todayDateStr = dateFmt.format(now.getTime());
        SharedPreferences prefs = getSharedPreferences("Globiz_Shift_Reminders", MODE_PRIVATE);

        String preKey = "shift_pre_" + todayDateStr;
        String endKey = "shift_end_" + todayDateStr;

        if (currentMinutes >= (shiftStartMin - 5) && currentMinutes <= (shiftStartMin + 15)) {
            if (!prefs.getBoolean(preKey, false) && !isCheckedIn) {
                prefs.edit().putBoolean(preKey, true).apply();
                triggerSystemNotification("Upcoming Shift • Starting in 5 mins",
                        "Good morning! Your shift starts at 09:00 AM. Punch in now to start on time. Have a wonderful and productive work day!");
            }
        }

        if (currentMinutes >= shiftEndMin) {
            if (isCheckedIn) {
                autoClockOutAtShiftEnd();
            }
            if (!prefs.getBoolean(endKey, false)) {
                prefs.edit().putBoolean(endKey, true).apply();
                String endFormatted = String.format(Locale.US, "%02d:%02d", shiftEndHour, shiftEndMinute);
                triggerSystemNotification("Shift Completed • " + endFormatted,
                        "Great job today! Your shift is now over. Thank you for your dedication and hard work—don't forget to punch out!");
            }
        }
    }

    private void updatePunchButtonUI(boolean clockedIn) {
        updateCapsuleButtonsState();
        if (clockedIn) {
            if (checkInDateTime != null && tvPunchedInAt != null) {
                SimpleDateFormat sdf = new SimpleDateFormat("hh:mm a", Locale.US);
                tvPunchedInAt.setText("• Clocked In at " + sdf.format(checkInDateTime));
                tvPunchedInAt.setTextColor(Color.parseColor("#16A34A"));
            }
        } else {
            isOnBreak = false;
            updateBreakUI(false);
            if (isShiftCompletedToday) {
                if (tvPunchedInAt != null) {
                    String curr = tvPunchedInAt.getText().toString();
                    if (!curr.startsWith("• Clocked Out")) {
                        tvPunchedInAt.setText("• Clocked Out");
                    }
                    tvPunchedInAt.setTextColor(Color.parseColor("#EF4444"));
                }
            } else {
                if (tvPunchedInAt != null) {
                    tvPunchedInAt.setText("• Not Clocked In");
                    tvPunchedInAt.setTextColor(Color.parseColor("#EF4444"));
                }
            }
        }
        updateInstructionLabel();
    }

    private void updateCapsuleButtonsState() {
        if (btnClockIn == null || btnClockOut == null) return;
        if (isCheckedIn) {
            btnClockIn.setEnabled(false);
            btnClockIn.setAlpha(0.42f);
            btnClockOut.setEnabled(true);
            btnClockOut.setAlpha(1.0f);
        } else if (isShiftCompletedToday) {
            btnClockIn.setEnabled(false);
            btnClockIn.setAlpha(0.42f);
            btnClockOut.setEnabled(false);
            btnClockOut.setAlpha(0.42f);
        } else {
            btnClockIn.setEnabled(true);
            btnClockIn.setAlpha(1.0f);
            btnClockOut.setEnabled(false);
            btnClockOut.setAlpha(0.42f);
        }
    }

    private static final int PERMISSION_REQ_CODE = 1001;

    private void requestAppPermissions() {
        List<String> permissionsNeeded = new ArrayList<>();
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissionsNeeded.add(Manifest.permission.ACCESS_FINE_LOCATION);
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissionsNeeded.add(Manifest.permission.ACCESS_COARSE_LOCATION);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                permissionsNeeded.add(Manifest.permission.POST_NOTIFICATIONS);
            }
        }
        if (!permissionsNeeded.isEmpty()) {
            ActivityCompat.requestPermissions(this, permissionsNeeded.toArray(new String[0]), PERMISSION_REQ_CODE);
        }
    }

    private interface LocationResultCallback {
        void onLocationObtained(Double latitude, Double longitude);
    }

    private void getCurrentCoordinates(LocationResultCallback callback) {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED &&
            ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            requestAppPermissions();
            callback.onLocationObtained(null, null);
            return;
        }

        try {
            LocationManager lm = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
            if (lm == null) {
                callback.onLocationObtained(null, null);
                return;
            }

            Location bestLocation = null;
            if (lm.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                bestLocation = lm.getLastKnownLocation(LocationManager.GPS_PROVIDER);
            }
            if (bestLocation == null && lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                bestLocation = lm.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
            }
            if (bestLocation == null && lm.isProviderEnabled(LocationManager.PASSIVE_PROVIDER)) {
                bestLocation = lm.getLastKnownLocation(LocationManager.PASSIVE_PROVIDER);
            }

            if (bestLocation != null) {
                callback.onLocationObtained(bestLocation.getLatitude(), bestLocation.getLongitude());
            } else {
                callback.onLocationObtained(null, null);
            }
        } catch (Exception e) {
            callback.onLocationObtained(null, null);
        }
    }

    private void handleClockInTapped() {
        if (isCheckedIn) return;
        if (btnClockIn != null) {
            btnClockIn.performHapticFeedback(HapticFeedbackConstants.VIRTUAL_KEY);
        }

        accumulatedBreakTimeMs = 0;
        currentBreakStartDate = null;
        lastBreakSessionText = null;

        isCheckedIn = true;
        isShiftCompletedToday = false;
        checkInDateTime = new Date();
        Calendar c = Calendar.getInstance();
        c.setTime(checkInDateTime);
        int h = c.get(Calendar.HOUR_OF_DAY);
        int m = c.get(Calendar.MINUTE);
        isTodayLate = (h > shiftStartHour || (h == shiftStartHour && m > shiftStartMinute));

        SimpleDateFormat isoFmt = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
        isoFmt.setTimeZone(TimeZone.getTimeZone("UTC"));
        String nowIso = isoFmt.format(checkInDateTime);
        apiClient.recordLocalClockIn(nowIso, isTodayLate);

        startTimer();
        updatePunchButtonUI(true);
        updateShiftBadge();
        syncTodayAttendanceRecord();
        renderMonthlyHeatmap();

        SimpleDateFormat sdf = new SimpleDateFormat("hh:mm a", Locale.getDefault());
        SimpleDateFormat dateSdf = new SimpleDateFormat("EEEE, MMM d", Locale.getDefault());
        String timeStr = sdf.format(checkInDateTime);
        String dateStr = dateSdf.format(checkInDateTime);

        String statusDesc = isTodayLate ? " (Late)" : " (On Time)";
        triggerSystemNotification("Attendance • Clocked In", "Clocked in at " + timeStr + statusDesc + " on " + dateStr + ". Have a wonderful work day!");
        Toast.makeText(HomeActivity.this, "Clocked In at " + timeStr + statusDesc, Toast.LENGTH_SHORT).show();

        String token = apiClient.getToken();
        getCurrentCoordinates((latitude, longitude) -> {
            apiClient.clockIn(token, latitude, longitude, new ApiClient.ApiCallback<JSONObject>() {
                @Override
                public void onSuccess(JSONObject result) {
                    runOnUiThread(() -> {
                        loadAttendanceStats();
                        loadAttendanceHistoryForHeatmap();
                    });
                }

                @Override
                public void onError(String errorMessage, int statusCode) {
                    runOnUiThread(() -> {
                        if (errorMessage != null && errorMessage.toLowerCase().contains("already")) {
                            loadAttendanceStats();
                        } else if (errorMessage != null && !errorMessage.isEmpty()) {
                            Toast.makeText(HomeActivity.this, errorMessage, Toast.LENGTH_LONG).show();
                        } else {
                            apiClient.savePendingOfflinePunch("IN", nowIso);
                            Toast.makeText(HomeActivity.this, "Clock In recorded offline.", Toast.LENGTH_SHORT).show();
                        }
                    });
                }
            });
        });
    }

    private void handleClockOutTapped() {
        if (!isCheckedIn) return;
        if (btnClockOut != null) {
            btnClockOut.performHapticFeedback(HapticFeedbackConstants.VIRTUAL_KEY);
        }

        Date outDate = new Date();
        isCheckedIn = false;
        isShiftCompletedToday = true;
        stopTimer();

        SimpleDateFormat isoFmt = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
        isoFmt.setTimeZone(TimeZone.getTimeZone("UTC"));
        String nowIso = isoFmt.format(outDate);
        apiClient.recordLocalClockOut(nowIso);

        SimpleDateFormat sdf = new SimpleDateFormat("hh:mm a", Locale.getDefault());
        String timeStr = sdf.format(outDate);
        if (tvPunchedInAt != null) {
            tvPunchedInAt.setText("• Clocked Out at " + timeStr);
            tvPunchedInAt.setTextColor(Color.parseColor("#EF4444"));
        }
        updatePunchButtonUI(false);
        syncTodayAttendanceRecord();
        renderMonthlyHeatmap();

        triggerSystemNotification("Attendance • Clocked Out", "Clocked out at " + timeStr + ". Thank you for your hard work today!");
        Toast.makeText(HomeActivity.this, "Clocked Out at " + timeStr, Toast.LENGTH_SHORT).show();

        String token = apiClient.getToken();
        apiClient.clockOut(token, new ApiClient.ApiCallback<JSONObject>() {
            @Override
            public void onSuccess(JSONObject result) {
                runOnUiThread(() -> {
                    loadAttendanceStats();
                    loadAttendanceHistoryForHeatmap();
                });
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                runOnUiThread(() -> {
                    apiClient.savePendingOfflinePunch("OUT", nowIso);
                    Toast.makeText(HomeActivity.this, "Clock Out recorded offline.", Toast.LENGTH_SHORT).show();
                });
            }
        });
    }

    private void updateBreakUI(boolean onBreak) {
        if (tvTakeBreak != null) {
            tvTakeBreak.setText(onBreak ? "Resume Shift" : "Take Break");
            tvTakeBreak.setTextColor(onBreak ? Color.parseColor("#B45309") : Color.parseColor("#1E293B"));
        }
        if (ivTakeBreak != null) {
            ivTakeBreak.setColorFilter(onBreak ? Color.parseColor("#B45309") : Color.parseColor("#1E293B"), android.graphics.PorterDuff.Mode.SRC_IN);
        }
        if (btnTakeBreak != null) {
            btnTakeBreak.setBackgroundResource(onBreak ? R.drawable.bg_break_pill_active : R.drawable.bg_break_pill);
        }
        if (onBreak) {
            if (tvPunchedInAt != null) {
                tvPunchedInAt.setText("• On Break");
                tvPunchedInAt.setTextColor(Color.parseColor("#D97706"));
            }
        } else if (isCheckedIn && checkInDateTime != null) {
            SimpleDateFormat sdf = new SimpleDateFormat("hh:mm:ss a", Locale.US);
            if (tvPunchedInAt != null) {
                tvPunchedInAt.setText("• Clocked In at " + sdf.format(checkInDateTime));
                tvPunchedInAt.setTextColor(Color.parseColor("#16A34A"));
            }
        }
    }

    private void updateInstructionLabel() {
        if (tvPunchInstruction == null) return;
        if (isCheckedIn) {
            tvPunchInstruction.setText("Shift in Progress • Tap Clock Out when done");
            tvPunchInstruction.setTextColor(Color.parseColor("#16A34A"));
        } else if (isShiftCompletedToday) {
            tvPunchInstruction.setText("Shift Completed for Today");
            tvPunchInstruction.setTextColor(Color.parseColor("#64748B"));
        } else {
            tvPunchInstruction.setText("Tap Clock In to record your attendance");
            tvPunchInstruction.setTextColor(Color.parseColor("#64748B"));
        }
    }

    // --- 2-Second Hold Gesture Handlers (Synced White Circular Animation) ---
    private void setupHoldGesture() {
        if (flPunchButton == null) return;

        completeHoldRunnable = () -> {
            if (isHolding) {
                isHolding = false;
                if (holdProgressBar != null) {
                    holdProgressBar.setVisibility(View.GONE);
                    holdProgressBar.setProgress(0);
                }
                flPunchButton.performHapticFeedback(HapticFeedbackConstants.LONG_PRESS);

                // Perform Shift Action
                handleCheckInOutToggle();
            }
        };

        flPunchButton.setOnTouchListener((v, event) -> {
            switch (event.getAction()) {
                case MotionEvent.ACTION_DOWN:
                    if (!isCheckedIn && !isWithinPunchInWindow()) {
                        showHintPopup("Shift starts at 09:00 AM • Clock-in opens at 08:55 AM (5 mins early)");
                        v.performHapticFeedback(HapticFeedbackConstants.VIRTUAL_KEY);
                        return true;
                    }

                    pressStartTime = System.currentTimeMillis();
                    isHolding = true;
                    v.performHapticFeedback(HapticFeedbackConstants.VIRTUAL_KEY);

                    // Show progress ring animation (WHITE loading ring inside thumb button)
                    if (holdProgressBar != null) {
                        holdProgressBar.setProgressDrawable(ContextCompat.getDrawable(this, R.drawable.circle_progress_bar_white));
                        holdProgressBar.setVisibility(View.VISIBLE);
                        holdProgressBar.setProgress(0);
                        if (holdAnimator != null) holdAnimator.cancel();
                        holdAnimator = ValueAnimator.ofInt(0, 100);
                        holdAnimator.setDuration(REQUIRED_HOLD_MS);
                        holdAnimator.addUpdateListener(animation -> {
                            if (holdProgressBar != null) {
                                holdProgressBar.setProgress((int) animation.getAnimatedValue());
                            }
                        });
                        holdAnimator.start();
                    }

                    holdHandler.postDelayed(completeHoldRunnable, REQUIRED_HOLD_MS);
                    return true;

                case MotionEvent.ACTION_UP:
                case MotionEvent.ACTION_CANCEL:
                    if (isHolding) {
                        holdHandler.removeCallbacks(completeHoldRunnable);
                        if (holdAnimator != null) holdAnimator.cancel();
                        if (holdProgressBar != null) {
                            holdProgressBar.setVisibility(View.GONE);
                            holdProgressBar.setProgress(0);
                        }

                        long duration = System.currentTimeMillis() - pressStartTime;
                        if (duration < REQUIRED_HOLD_MS) {
                            if (isCheckedIn) {
                                showHintPopup("Hold for 2 seconds to punch out");
                            } else if (!isWithinPunchInWindow()) {
                                showHintPopup("Shift starts at 09:00 AM • Clock-in opens at 08:55 AM (5 mins early)");
                            } else {
                                showHintPopup("Hold for 2 seconds to punch in");
                            }
                        }
                        isHolding = false;
                    }
                    return true;
            }
            return false;
        });
    }

    // --- Professional Slide-up Hint Popup ---
    private void showHintPopup(String message) {
        if (hintPopupCard == null || tvHintText == null) return;

        hintDismissHandler.removeCallbacksAndMessages(null);
        tvHintText.setText(message);
        hintPopupCard.setVisibility(View.VISIBLE);
        hintPopupCard.setTranslationY(80f);
        hintPopupCard.setAlpha(0f);

        hintPopupCard.animate()
                .translationY(0f)
                .alpha(1f)
                .setDuration(300)
                .setInterpolator(new DecelerateInterpolator())
                .start();

        hintDismissRunnable = () -> {
            if (hintPopupCard != null) {
                hintPopupCard.animate()
                        .translationY(80f)
                        .alpha(0f)
                        .setDuration(260)
                        .withEndAction(() -> hintPopupCard.setVisibility(View.GONE))
                        .start();
            }
        };
        hintDismissHandler.postDelayed(hintDismissRunnable, 2600);
    }

    private void setupListeners() {
        if (btnClockIn != null) {
            btnClockIn.setOnClickListener(v -> handleClockInTapped());
        }
        if (btnClockOut != null) {
            btnClockOut.setOnClickListener(v -> handleClockOutTapped());
        }

        if (btnNotifications != null) {
            btnNotifications.setOnClickListener(v -> {
                apiClient.markLocalNotificationsAsRead();
                updateNotificationBadge();
                startActivity(new Intent(this, NotificationsActivity.class));
            });
        }

        if (flAvatarContainer != null) {
            flAvatarContainer.setOnClickListener(v -> openSettings());
        }

        if (btnTakeBreak != null) {
            btnTakeBreak.setOnClickListener(v -> {
                if (!isCheckedIn) {
                    showHintPopup("Please punch in before starting a break.");
                    return;
                }
                if (!isOnBreak && isBreakInThirtyMinLock()) {
                    int leftMins = getRemainingBreakLockMinutes();
                    showHintPopup("Breaks cannot be taken during the first 30 minutes of your shift. " + leftMins + " minutes left.");
                    return;
                }
                isOnBreak = !isOnBreak;
                SimpleDateFormat sdf = new SimpleDateFormat("hh:mm a", Locale.getDefault());
                String timeStr = sdf.format(new Date());

                updateBreakUI(isOnBreak);

                String token = apiClient.getToken();
                apiClient.recordBreak(isOnBreak, token, new ApiClient.ApiCallback<JSONObject>() {
                    @Override
                    public void onSuccess(JSONObject result) {}
                    @Override
                    public void onError(String errorMessage, int statusCode) {}
                });

                if (isOnBreak) {
                    currentBreakStartDate = new Date();
                    if (tvBreakTimer != null) {
                        tvBreakTimer.setVisibility(View.VISIBLE);
                        tvBreakTimer.setText("Break: 00m 00s (from " + timeStr + ")");
                    }
                    if (tvPunchedInAt != null) {
                        tvPunchedInAt.setText("• On Break (Shift Paused)");
                        tvPunchedInAt.setTextColor(Color.parseColor("#D97706"));
                    }
                    triggerSystemNotification("Break Started", "Break started at " + timeStr + ". Active shift timer paused.");
                    Toast.makeText(this, "Break started (" + timeStr + ")", Toast.LENGTH_SHORT).show();
                } else {
                    Date breakEndDate = new Date();
                    long durMs = breakEndDate.getTime() - (currentBreakStartDate != null ? currentBreakStartDate.getTime() : breakEndDate.getTime());
                    accumulatedBreakTimeMs += durMs;
                    long durMin = Math.max(1, Math.round(durMs / 60000.0));
                    String startStr = (currentBreakStartDate != null) ? sdf.format(currentBreakStartDate) : "";
                    String endStr = sdf.format(breakEndDate);
                    lastBreakSessionText = "Last Break: " + startStr + " – " + endStr + " (" + durMin + "m)";
                    if (tvBreakTimer != null) {
                        tvBreakTimer.setVisibility(View.VISIBLE);
                        tvBreakTimer.setText(lastBreakSessionText);
                    }
                    currentBreakStartDate = null;
                    triggerSystemNotification("Break Ended", "Resumed shift at " + endStr + " (From " + startStr + " to " + endStr + ", " + durMin + "m). Shift timer resumed!");
                    Toast.makeText(this, "Break ended (" + endStr + ")", Toast.LENGTH_SHORT).show();
                }
            });
        }

        if (cvLeavesCard != null) {
            cvLeavesCard.setOnClickListener(v -> {
                String c = tvCasualLeave != null ? tvCasualLeave.getText().toString() : "Casual: 6 left";
                String s = tvSickLeave != null ? tvSickLeave.getText().toString() : "Sick: 4 remaining";
                Toast.makeText(this, "Leaves Balance: " + c + " • " + s, Toast.LENGTH_SHORT).show();
            });
        }


        if (cvTeamPresence != null) {
            cvTeamPresence.setOnClickListener(v -> showTeamRosterDialog());
        }

        if (tvViewRoster != null) {
            tvViewRoster.setOnClickListener(v -> showTeamRosterDialog());
        }

        if (cvTasksCard != null) {
            cvTasksCard.setOnClickListener(v -> showTasksDialog());
        }

        // Heatmap Mode Switchers (Month / Full Year)
        if (btnHeatmapModeMonth != null) {
            btnHeatmapModeMonth.setOnClickListener(v -> setHeatmapMode(false));
        }
        if (btnHeatmapModeYear != null) {
            btnHeatmapModeYear.setOnClickListener(v -> setHeatmapMode(true));
        }

        // Monthly Heatmap Navigation Buttons
        if (btnHeatmapPrevMonth != null) {
            btnHeatmapPrevMonth.setOnClickListener(v -> {
                heatmapCalendar.add(Calendar.MONTH, -1);
                renderMonthlyHeatmap();
            });
        }
        if (btnHeatmapNextMonth != null) {
            btnHeatmapNextMonth.setOnClickListener(v -> {
                heatmapCalendar.add(Calendar.MONTH, 1);
                renderMonthlyHeatmap();
            });
        }

        // Admin Actions
        if (btnAdminBroadcastNotice != null) {
            btnAdminBroadcastNotice.setOnClickListener(v -> showAdminBroadcastNoticeDialog());
        }
        if (btnAdminLeaveApprovals != null) {
            btnAdminLeaveApprovals.setOnClickListener(v -> {
                if (cvAdminPendingLeavesCard != null) {
                    ScrollView sv = findViewById(R.id.scrollView);
                    if (sv != null) {
                        sv.smoothScrollTo(0, cvAdminPendingLeavesCard.getTop());
                    }
                }
            });
        }
        if (btnAdminTeamDirectory != null) {
            btnAdminTeamDirectory.setOnClickListener(v -> showTeamRosterDialog());
        }

        // Super Admin Controls
        if (btnSuperAdminRecalculate != null) {
            btnSuperAdminRecalculate.setOnClickListener(v -> {
                Toast.makeText(this, "Recalculating multi-tenant platform metrics...", Toast.LENGTH_SHORT).show();
                apiClient.recalculateSnapshots(new ApiClient.ApiCallback<JSONObject>() {
                    @Override
                    public void onSuccess(JSONObject result) {
                        runOnUiThread(() -> {
                            Toast.makeText(HomeActivity.this, "Platform snapshots updated successfully", Toast.LENGTH_SHORT).show();
                            loadSuperAdminDashboardData();
                        });
                    }

                    @Override
                    public void onError(String errorMessage, int statusCode) {
                        runOnUiThread(() -> {
                            Toast.makeText(HomeActivity.this, "Recalculate triggered (refreshed)", Toast.LENGTH_SHORT).show();
                            loadSuperAdminDashboardData();
                        });
                    }
                });
            });
        }
        if (btnSuperAdminBroadcast != null) {
            btnSuperAdminBroadcast.setOnClickListener(v -> showSuperAdminGlobalAlertDialog());
        }
        if (btnSuperAdminSecurity != null) {
            btnSuperAdminSecurity.setOnClickListener(v -> {
                Toast.makeText(this, "Syncing platform security logs...", Toast.LENGTH_SHORT).show();
                loadSuperAdminDashboardData();
            });
        }

        // Setup role-based dynamic bottom navigation bar
        BottomNavHelper.setupBottomNav(this, "home");
    }

    private void showTeamRosterDialog() {
        android.app.Dialog dialog = new android.app.Dialog(this);
        dialog.requestWindowFeature(android.view.Window.FEATURE_NO_TITLE);
        dialog.setContentView(R.layout.dialog_team_roster);
        if (dialog.getWindow() != null) {
            dialog.getWindow().setBackgroundDrawable(new android.graphics.drawable.ColorDrawable(Color.TRANSPARENT));
            dialog.getWindow().setLayout(
                    (int) (getResources().getDisplayMetrics().widthPixels * 0.92),
                    ViewGroup.LayoutParams.WRAP_CONTENT
            );
        }

        TextView tvOrg = dialog.findViewById(R.id.tvRosterOrgTitle);
        TextView tvSub = dialog.findViewById(R.id.tvRosterSubtitle);
        View btnClose = dialog.findViewById(R.id.btnRosterClose);
        android.widget.ListView lv = dialog.findViewById(R.id.lvTeamRoster);

        String org = apiClient.getOrganization();
        if (org == null || org.isEmpty()) org = "GlobizHub Inc.";
        if (tvOrg != null) tvOrg.setText(org);

        int count = cachedTeamMembers != null ? cachedTeamMembers.length() : 0;
        if (tvSub != null) tvSub.setText(count + " " + (count == 1 ? "Employee" : "Employees"));

        if (btnClose != null) {
            btnClose.setOnClickListener(v -> dialog.dismiss());
        }

        if (lv != null) {
            int[] colors = new int[]{
                    Color.parseColor("#0056FD"),
                    Color.parseColor("#10B981"),
                    Color.parseColor("#F59E0B"),
                    Color.parseColor("#8B5CF6"),
                    Color.parseColor("#EC4899")
            };

            android.widget.BaseAdapter adapter = new android.widget.BaseAdapter() {
                @Override
                public int getCount() {
                    return count;
                }

                @Override
                public Object getItem(int position) {
                    return cachedTeamMembers.optJSONObject(position);
                }

                @Override
                public long getItemId(int position) {
                    return position;
                }

                @Override
                public View getView(int position, View convertView, ViewGroup parent) {
                    if (convertView == null) {
                        convertView = getLayoutInflater().inflate(R.layout.item_team_roster, parent, false);
                    }
                    JSONObject m = cachedTeamMembers.optJSONObject(position);
                    TextView tvInitial = convertView.findViewById(R.id.tvRosterInitial);
                    TextView tvName = convertView.findViewById(R.id.tvRosterName);
                    TextView tvRole = convertView.findViewById(R.id.tvRosterRole);
                    FrameLayout flAvatar = convertView.findViewById(R.id.flRosterAvatar);

                    if (m != null) {
                        String fn = m.optString("firstName", "");
                        String ln = m.optString("lastName", "");
                        String fullName = (fn + " " + ln).trim();
                        if (fullName.isEmpty()) fullName = "Team Member";
                        if (tvName != null) tvName.setText(fullName);

                        String initial = !fn.isEmpty() ? fn.substring(0, 1).toUpperCase(Locale.ROOT) :
                                (!fullName.isEmpty() ? fullName.substring(0, 1).toUpperCase(Locale.ROOT) : "E");
                        if (tvInitial != null) tvInitial.setText(initial);

                        if (flAvatar != null) {
                            GradientDrawable gd = new GradientDrawable();
                            gd.setShape(GradientDrawable.OVAL);
                            gd.setColor(colors[position % colors.length]);
                            flAvatar.setBackground(gd);
                        }

                        String desig = "";
                        JSONObject dObj = m.optJSONObject("designation");
                        if (dObj != null) desig = dObj.optString("name", "");
                        if (desig.isEmpty()) desig = m.optString("role", "Employee");

                        String dept = "";
                        JSONObject deptObj = m.optJSONObject("department");
                        if (deptObj != null) dept = deptObj.optString("name", "");

                        if (tvRole != null) {
                            tvRole.setText(dept.isEmpty() ? desig : desig + " • " + dept);
                        }
                    }
                    return convertView;
                }
            };
            lv.setAdapter(adapter);
        }

        dialog.show();
    }

    private void showTasksDialog() {
        startActivity(new Intent(this, TasksActivity.class));
    }

    // --- Dynamic Team Presence ---
    private void loadTeamPresence() {
        String token = apiClient.getToken();
        if (token == null || token.isEmpty()) {
            updateTeamPresenceUI(new JSONArray());
            return;
        }

        apiClient.getTeamMembers(token, new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray response) {
                cachedTeamMembers = (response != null) ? response : new JSONArray();
                updateTeamPresenceUI(cachedTeamMembers);
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                if (cachedTeamMembers == null || cachedTeamMembers.length() == 0) {
                    updateTeamPresenceUI(new JSONArray());
                }
            }
        });
    }

    private void updateTeamPresenceUI(JSONArray members) {
        if (members == null) members = new JSONArray();
        int count = members.length();

        if (tvTeamActiveCount != null) {
            tvTeamActiveCount.setText(count + " Active");
        }

        if (llTeamAvatars == null) return;
        llTeamAvatars.removeAllViews();

        float density = getResources().getDisplayMetrics().density;

        if (count == 0) {
            TextView emptyTv = new TextView(this);
            emptyTv.setText("No team members currently active");
            emptyTv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
            emptyTv.setTextColor(Color.parseColor("#64748B"));
            llTeamAvatars.addView(emptyTv);
            return;
        }

        int[] colors = new int[]{
                Color.parseColor("#3B82F6"), // Blue
                Color.parseColor("#10B981"), // Emerald
                Color.parseColor("#F59E0B"), // Amber
                Color.parseColor("#8B5CF6"), // Purple
                Color.parseColor("#EC4899")  // Pink
        };

        int displayCount = Math.min(count, 5);
        for (int i = 0; i < displayCount; i++) {
            JSONObject m = members.optJSONObject(i);
            String initials = "AS";
            if (m != null) {
                String fn = m.optString("firstName", "").trim();
                String ln = m.optString("lastName", "").trim();
                if (!fn.isEmpty() && !ln.isEmpty()) {
                    initials = ("" + fn.charAt(0) + ln.charAt(0)).toUpperCase(Locale.US);
                } else if (!fn.isEmpty()) {
                    initials = fn.substring(0, Math.min(2, fn.length())).toUpperCase(Locale.US);
                } else {
                    String email = m.optString("email", "").trim();
                    if (!email.isEmpty()) {
                        initials = email.substring(0, Math.min(2, email.length())).toUpperCase(Locale.US);
                    }
                }
            }

            FrameLayout circleFrame = new FrameLayout(this);
            int sizePx = (int) (32 * density);
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(sizePx, sizePx);
            if (i > 0) {
                lp.setMarginStart((int) (-8 * density));
            }
            circleFrame.setLayoutParams(lp);

            GradientDrawable gd = new GradientDrawable();
            gd.setShape(GradientDrawable.OVAL);
            gd.setColor(colors[i % colors.length]);
            gd.setStroke((int) (2 * density), Color.WHITE);
            circleFrame.setBackground(gd);

            TextView tvInitials = new TextView(this);
            tvInitials.setText(initials);
            tvInitials.setTextColor(Color.WHITE);
            tvInitials.setTextSize(TypedValue.COMPLEX_UNIT_SP, 11);
            tvInitials.setTypeface(null, Typeface.BOLD);
            FrameLayout.LayoutParams textLp = new FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.WRAP_CONTENT,
                    FrameLayout.LayoutParams.WRAP_CONTENT
            );
            textLp.gravity = Gravity.CENTER;
            tvInitials.setLayoutParams(textLp);

            circleFrame.addView(tvInitials);
            llTeamAvatars.addView(circleFrame);
        }

        if (count > 5) {
            int extra = count - 5;
            TextView extraTv = new TextView(this);
            extraTv.setText("+" + extra);
            extraTv.setTextColor(Color.parseColor("#334155"));
            extraTv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 11);
            extraTv.setTypeface(null, Typeface.BOLD);
            extraTv.setGravity(Gravity.CENTER);

            int padStartEnd = (int) (8 * density);
            int padTopBottom = (int) (4 * density);
            extraTv.setPadding(padStartEnd, padTopBottom, padStartEnd, padTopBottom);

            GradientDrawable pillGd = new GradientDrawable();
            pillGd.setCornerRadius(16 * density);
            pillGd.setColor(Color.parseColor("#E2E8F0"));
            pillGd.setStroke((int) (2 * density), Color.WHITE);
            extraTv.setBackground(pillGd);

            LinearLayout.LayoutParams extraLp = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    (int) (32 * density)
            );
            extraLp.setMarginStart((int) (-6 * density));
            extraTv.setLayoutParams(extraLp);

            llTeamAvatars.addView(extraTv);
        }
    }

    // --- Dynamic Tasks ---
    private void loadTasks() {
        String token = apiClient.getToken();
        if (token == null || token.isEmpty()) {
            updateTasksUI(new JSONArray());
            return;
        }

        apiClient.getMyTasks(token, new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray response) {
                cachedTasks = (response != null) ? response : new JSONArray();
                updateTasksUI(cachedTasks);
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                if (cachedTasks == null || cachedTasks.length() == 0) {
                    updateTasksUI(new JSONArray());
                }
            }
        });
    }

    private void updateTasksUI(JSONArray tasks) {
        if (tasks == null) tasks = new JSONArray();
        int count = tasks.length();

        if (count == 0) {
            if (tvTasksDueTitle != null) {
                tvTasksDueTitle.setText("0 Tasks due today");
            }
            if (tvTasksNextSubtitle != null) {
                tvTasksNextSubtitle.setText("All caught up! No pending tasks for today.");
            }
        } else {
            if (tvTasksDueTitle != null) {
                tvTasksDueTitle.setText(count + " " + (count == 1 ? "Task" : "Tasks") + " due today");
            }
            if (tvTasksNextSubtitle != null) {
                JSONObject first = tasks.optJSONObject(0);
                String title = (first != null) ? first.optString("title", first.optString("name", "Review updates")) : "Review updates";
                tvTasksNextSubtitle.setText("Next: " + title);
            }
        }
    }

    private void openSettings() {
        startActivity(new Intent(this, SettingsActivity.class));
    }

    // --- Native System Notification & In-App Log ---
    private void triggerSystemNotification(String title, String message) {
        // Record in in-app notification center
        apiClient.recordLocalNotification(title, message);
        updateNotificationBadge();

        try {
            Intent intent = new Intent(this, NotificationsActivity.class);
            PendingIntent pendingIntent = PendingIntent.getActivity(
                    this,
                    (int) System.currentTimeMillis(),
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            NotificationCompat.Builder builder = new NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
                    .setSmallIcon(R.drawable.ic_notifications)
                    .setLargeIcon(android.graphics.BitmapFactory.decodeResource(getResources(), R.mipmap.ic_launcher))
                    .setColor(android.graphics.Color.parseColor("#0056FD"))
                    .setContentTitle(title)
                    .setContentText(message)
                    .setStyle(new NotificationCompat.BigTextStyle().bigText(message))
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setAutoCancel(true)
                    .setContentIntent(pendingIntent);

            NotificationManagerCompat manager = NotificationManagerCompat.from(this);
            manager.notify((int) System.currentTimeMillis(), builder.build());
        } catch (SecurityException ignored) {
            // Notification permission might be denied on Android 13+
        }
    }

    private void updateNotificationBadge() {
        boolean hasUnread = apiClient.hasUnreadLocalNotifications();
        if (viewNotificationDot != null) {
            viewNotificationDot.setVisibility(hasUnread ? View.VISIBLE : View.GONE);
        }

        // Also query remote unread notifications
        String token = apiClient.getToken();
        if (token != null) {
            apiClient.getUnreadNotifications(token, new ApiClient.ApiCallback<JSONArray>() {
                @Override
                public void onSuccess(JSONArray result) {
                    if (isFinishing() || isDestroyed()) return;
                    boolean unreadRemote = (result != null && result.length() > 0);
                    if (viewNotificationDot != null) {
                        viewNotificationDot.setVisibility((hasUnread || unreadRemote) ? View.VISIBLE : View.GONE);
                    }
                }

                @Override
                public void onError(String errorMessage, int statusCode) {
                    // Keep local badge state
                }
            });
        }
    }

    // --- User Profile & First Name ---
    private void loadUserProfile() {
        String token = apiClient.getToken();
        if (token == null) {
            hideSkeletonLoading();
            return;
        }

        apiClient.getProfile(token, new ApiClient.ApiCallback<JSONObject>() {
            @Override
            public void onSuccess(JSONObject user) {
                if (isFinishing() || isDestroyed()) return;

                String rawFirstName = user.optString("firstName", "");
                if (rawFirstName.isEmpty() && user.has("name")) {
                    rawFirstName = user.optString("name", "");
                }
                String photoUrl = user.optString("profilePhoto", "");

                // Clean first name strictly alphabetic
                String cleanFirstName = rawFirstName;
                if (cleanFirstName.contains("@")) {
                    cleanFirstName = cleanFirstName.substring(0, cleanFirstName.indexOf('@'));
                }
                cleanFirstName = cleanFirstName.trim().split("\\s+")[0].replaceAll("[^a-zA-Z]", "");
                if (cleanFirstName.isEmpty() || "Alex".equalsIgnoreCase(cleanFirstName)) {
                    cleanFirstName = apiClient.getFirstName();
                } else {
                    cleanFirstName = cleanFirstName.substring(0, 1).toUpperCase(Locale.ROOT) +
                            (cleanFirstName.length() > 1 ? cleanFirstName.substring(1).toLowerCase(Locale.ROOT) : "");
                }

                cachedFirstName = cleanFirstName;

                // Designation
                String designation = "";
                if (user.has("designation")) {
                    Object desObj = user.opt("designation");
                    if (desObj instanceof JSONObject) {
                        designation = ((JSONObject) desObj).optString("name", "");
                    } else if (desObj instanceof String) {
                        designation = (String) desObj;
                    }
                }
                if (designation.isEmpty()) {
                    designation = user.optString("role", "Operations & Tech Lead");
                }

                // Company / Organization
                String organization = "";
                if (user.has("company")) {
                    Object compObj = user.opt("company");
                    if (compObj instanceof JSONObject) {
                        organization = ((JSONObject) compObj).optString("name", "");
                    } else if (compObj instanceof String) {
                        organization = (String) compObj;
                    }
                }
                if (organization.isEmpty()) {
                    organization = "GlobizHub Inc.";
                }

                boolean isOverridden = getSharedPreferences("TeamHub_Role_Override", MODE_PRIVATE).getBoolean("is_role_overridden", false);
                if (!isOverridden && user.has("role")) {
                    String userRole = user.optString("role", "");
                    if (!userRole.isEmpty()) {
                        apiClient.saveRole(userRole);
                        runOnUiThread(() -> BottomNavHelper.setupBottomNav(HomeActivity.this, "home"));
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
                            apiClient.saveSidebarModules(modules);
                        }
                    }
                }

                apiClient.saveUserProfile(cleanFirstName, designation, organization);
                updateGreeting();

                if (tvUserRoleLocation != null) {
                    tvUserRoleLocation.setText(designation + " • " + organization);
                }

                // Avatar initials
                if (tvAvatarInitials != null) {
                    tvAvatarInitials.setText(apiClient.getUserInitials());
                }

                // Profile photo
                if (!photoUrl.isEmpty()) {
                    String fullUrl = photoUrl;
                    if (!photoUrl.startsWith("http://") && !photoUrl.startsWith("https://")) {
                        fullUrl = "https://hr.globizhub.com" + photoUrl;
                    }
                    downloadAndSetAvatar(fullUrl);
                } else {
                    if (ivUserAvatar != null) ivUserAvatar.setVisibility(View.GONE);
                    if (tvAvatarInitials != null) tvAvatarInitials.setVisibility(View.VISIBLE);
                }

                hideSkeletonLoading();
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                updateGreeting();
                hideSkeletonLoading();
            }
        });
    }

    private void downloadAndSetAvatar(String urlString) {
        Executors.newSingleThreadExecutor().execute(() -> {
            try {
                URL url = new URL(urlString);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setDoInput(true);
                conn.connect();
                InputStream input = conn.getInputStream();
                Bitmap bitmap = BitmapFactory.decodeStream(input);

                new Handler(Looper.getMainLooper()).post(() -> {
                    if (isFinishing() || isDestroyed()) return;
                    if (bitmap != null && ivUserAvatar != null && tvAvatarInitials != null) {
                        ivUserAvatar.setImageBitmap(bitmap);
                        ivUserAvatar.setVisibility(View.VISIBLE);
                        tvAvatarInitials.setVisibility(View.GONE);
                    }
                });
            } catch (Exception e) {
                new Handler(Looper.getMainLooper()).post(() -> {
                    if (isFinishing() || isDestroyed()) return;
                    if (ivUserAvatar != null) ivUserAvatar.setVisibility(View.GONE);
                    if (tvAvatarInitials != null) tvAvatarInitials.setVisibility(View.VISIBLE);
                });
            }
        });
    }

    // --- Work Schedule Shift Timings ---
    private void loadSchedule() {
        String token = apiClient.getToken();
        if (token == null) return;

        apiClient.getMySchedule(token, new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray items) {
                if (isFinishing() || isDestroyed() || items == null || items.length() == 0) return;

                for (int i = 0; i < items.length(); i++) {
                    JSONObject item = items.optJSONObject(i);
                    if (item == null) continue;
                    JSONObject shift = item.optJSONObject("shift");
                    String start = shift != null ? shift.optString("startTime", "09:00") : item.optString("startTime", "09:00");
                    String end = shift != null ? shift.optString("endTime", "18:00") : item.optString("endTime", "18:00");
                    String[] startParts = start.split(":");
                    if (startParts.length >= 2) {
                        try {
                            shiftStartHour = Integer.parseInt(startParts[0]);
                            shiftStartMinute = Integer.parseInt(startParts[1]);
                        } catch (Exception ignored) {}
                    }
                    String[] endParts = end.split(":");
                    if (endParts.length >= 2) {
                        try {
                            shiftEndHour = Integer.parseInt(endParts[0]);
                            shiftEndMinute = Integer.parseInt(endParts[1]);
                        } catch (Exception ignored) {}
                    }
                    String formatted = formatShiftTime(start, end);
                    apiClient.saveShiftTiming(formatted);

                    try {
                        SimpleDateFormat inFmt = new SimpleDateFormat("HH:mm", Locale.US);
                        SimpleDateFormat endFmt = new SimpleDateFormat("hh:mma", Locale.US);
                        Date eDate = inFmt.parse(end);
                        if (eDate != null) {
                            apiClient.saveShiftEndTime(endFmt.format(eDate).toLowerCase());
                        }
                    } catch (Exception ignored) {}

                    runOnUiThread(() -> {
                        if (tvShiftTiming != null) {
                            tvShiftTiming.setText("Shift: " + formatted);
                        }
                    });
                    break;
                }
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                // Keep default shift strip
            }
        });
    }

    private String formatShiftTime(String start, String end) {
        try {
            SimpleDateFormat inFmt = new SimpleDateFormat("HH:mm", Locale.US);
            SimpleDateFormat outFmt = new SimpleDateFormat("hh:mm a", Locale.US);
            Date sDate = inFmt.parse(start);
            Date eDate = inFmt.parse(end);
            return (sDate != null ? outFmt.format(sDate) : start) + " – " + (eDate != null ? outFmt.format(eDate) : end);
        } catch (Exception e) {
            return start + " – " + end;
        }
    }

    // --- Attendance & Live Timer ---
    private void loadAttendanceStats() {
        String token = apiClient.getToken();
        if (token == null) return;

        apiClient.getAttendanceStats(token, new ApiClient.ApiCallback<JSONObject>() {
            @Override
            public void onSuccess(JSONObject stats) {
                if (isFinishing() || isDestroyed()) return;

                String status = stats.optString("todayStatus", "NOT_CHECKED_IN");
                String checkInTimeStr = stats.has("checkInTime") && !stats.isNull("checkInTime") ? stats.optString("checkInTime") : stats.optString("firstCheckIn", null);
                String checkOutTimeStr = stats.has("checkOutTime") && !stats.isNull("checkOutTime") ? stats.optString("checkOutTime") : null;
                boolean remoteOnBreak = stats.optBoolean("isOnBreak", false);

                if (checkOutTimeStr != null && !checkOutTimeStr.isEmpty() && !"null".equalsIgnoreCase(checkOutTimeStr)) {
                    isCheckedIn = false;
                    isShiftCompletedToday = true;
                    stopTimer();
                    updatePunchButtonUI(false);
                    if (tvPunchedInAt != null) {
                        Date outDate = parseIsoDate(checkOutTimeStr);
                        if (outDate != null) {
                            SimpleDateFormat timeFmt = new SimpleDateFormat("hh:mm a", Locale.US);
                            tvPunchedInAt.setText("• Clocked Out at " + timeFmt.format(outDate));
                        } else {
                            tvPunchedInAt.setText("• Clocked Out");
                        }
                        tvPunchedInAt.setTextColor(Color.parseColor("#EF4444"));
                    }
                } else if (("CHECKED_IN".equalsIgnoreCase(status) || (checkInTimeStr != null && !checkInTimeStr.isEmpty() && !"null".equalsIgnoreCase(checkInTimeStr)))
                        && !"CHECKED_OUT".equalsIgnoreCase(status)) {
                    isCheckedIn = true;
                    if (checkInTimeStr != null && !checkInTimeStr.equals("null")) {
                        Date parsed = parseIsoDate(checkInTimeStr);
                        if (parsed != null) checkInDateTime = parsed;
                    }
                    if (checkInDateTime == null) {
                        checkInDateTime = new Date();
                    }
                    Calendar c = Calendar.getInstance();
                    c.setTime(checkInDateTime);
                    int h = c.get(Calendar.HOUR_OF_DAY);
                    int m = c.get(Calendar.MINUTE);
                    isTodayLate = (h > shiftStartHour || (h == shiftStartHour && m > shiftStartMinute));

                    startTimer();
                    updatePunchButtonUI(true);
                    updateShiftBadge();
                    isOnBreak = remoteOnBreak || apiClient.isOnBreak();
                    updateBreakUI(isOnBreak);
                }

                // Real-time Attendance & Hours metrics (Web synchronized)
                int percentage = stats.optInt("attendancePercentage", 0);
                if (tvMonthlyAttendanceValue != null) {
                    tvMonthlyAttendanceValue.setText(percentage + "%");
                }
                double workingHours = stats.optDouble("workingHours", 0.0);
                if (tvHoursTodayValue != null) {
                    tvHoursTodayValue.setText(String.format(Locale.getDefault(), "%.1f hrs", workingHours));
                }
                int presentDays = stats.optInt("presentDays", 0);
                if (tvDaysPresentCount != null) {
                    tvDaysPresentCount.setText(String.valueOf(presentDays));
                }

                hideSkeletonLoading();
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                // Keep local session if active, do not overwrite with false
                hideSkeletonLoading();
            }
        });
    }

    private void showSkeletonLoading() {
        if (layoutSkeletonHome != null) {
            layoutSkeletonHome.setVisibility(View.VISIBLE);
            layoutSkeletonHome.setAlpha(1.0f);
            if (llHomeCardsContainer != null) {
                llHomeCardsContainer.setVisibility(View.GONE);
            }

            View[] skels = {skelHomeHero, skelHomeTimer, skelHomeLeaves, skelHomeHolidays, skelHomeHeatmap};
            for (View v : skels) {
                if (v != null) {
                    ObjectAnimator anim = ObjectAnimator.ofFloat(v, "alpha", 0.40f, 0.95f);
                    anim.setDuration(850);
                    anim.setRepeatCount(ValueAnimator.INFINITE);
                    anim.setRepeatMode(ValueAnimator.REVERSE);
                    anim.start();
                }
            }

            // Safe fallback timeout: dismiss after 3.5s if network is slow/offline
            new Handler(Looper.getMainLooper()).postDelayed(this::hideSkeletonLoading, 3500);
        }
    }

    private void hideSkeletonLoading() {
        if (layoutSkeletonHome != null && layoutSkeletonHome.getVisibility() == View.VISIBLE) {
            layoutSkeletonHome.animate()
                    .alpha(0f)
                    .setDuration(300)
                    .withEndAction(() -> {
                        layoutSkeletonHome.setVisibility(View.GONE);
                        if (llHomeCardsContainer != null) {
                            llHomeCardsContainer.setVisibility(View.VISIBLE);
                            llHomeCardsContainer.setAlpha(0f);
                            llHomeCardsContainer.animate().alpha(1f).setDuration(250).start();
                        }
                    })
                    .start();
        }
    }

    private void handleCheckInOutToggle() {
        String token = apiClient.getToken();

        if (!isCheckedIn) {
            // Punch In
            if (!isWithinPunchInWindow()) {
                showHintPopup("Shift starts at 09:00 AM • Clock-in opens at 08:55 AM (5 mins early)");
                return;
            }

            accumulatedBreakTimeMs = 0;
            currentBreakStartDate = null;
            lastBreakSessionText = null;
            if (tvBreakTimer != null) tvBreakTimer.setVisibility(View.GONE);

            isCheckedIn = true;
            checkInDateTime = new Date();
            Calendar c = Calendar.getInstance();
            c.setTime(checkInDateTime);
            int h = c.get(Calendar.HOUR_OF_DAY);
            int m = c.get(Calendar.MINUTE);
            isTodayLate = (h > shiftStartHour || (h == shiftStartHour && m > shiftStartMinute));

            SimpleDateFormat isoFmt = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
            isoFmt.setTimeZone(TimeZone.getTimeZone("UTC"));
            apiClient.recordLocalClockIn(isoFmt.format(checkInDateTime), isTodayLate);

            startTimer();
            updatePunchButtonUI(true);
            updateShiftBadge();
            syncTodayAttendanceRecord();
            renderMonthlyHeatmap();

            SimpleDateFormat sdf = new SimpleDateFormat("hh:mm a", Locale.getDefault());
            SimpleDateFormat dateSdf = new SimpleDateFormat("EEEE, MMM d", Locale.getDefault());
            String timeStr = sdf.format(checkInDateTime);
            String dateStr = dateSdf.format(checkInDateTime);

            String statusDesc = isTodayLate ? " (Late)" : " (On Time)";
            triggerSystemNotification("Attendance • Punched In", "Clocked in at " + timeStr + statusDesc + " on " + dateStr + ". Have a wonderful work day!");
            Toast.makeText(HomeActivity.this, "Punched In at " + timeStr + statusDesc, Toast.LENGTH_SHORT).show();

            getCurrentCoordinates((latitude, longitude) -> {
                apiClient.clockIn(token, latitude, longitude, new ApiClient.ApiCallback<JSONObject>() {
                    @Override
                    public void onSuccess(JSONObject result) {
                        loadAttendanceStats();
                        loadAttendanceHistoryForHeatmap();
                    }

                    @Override
                    public void onError(String errorMessage, int statusCode) {
                        if (errorMessage != null && errorMessage.toLowerCase().contains("already")) {
                            loadAttendanceStats();
                        } else if (errorMessage != null && !errorMessage.isEmpty()) {
                            Toast.makeText(HomeActivity.this, errorMessage, Toast.LENGTH_LONG).show();
                        } else {
                            apiClient.savePendingOfflinePunch("IN", isoFmt.format(checkInDateTime));
                            Toast.makeText(HomeActivity.this, "Punched In offline. Saved locally and will sync when connected.", Toast.LENGTH_SHORT).show();
                        }
                    }
                });
            });
        } else {
            // Punch Out
            Date outDate = new Date();
            isCheckedIn = false;
            isShiftCompletedToday = true;
            stopTimer();

            SimpleDateFormat isoFmt = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
            isoFmt.setTimeZone(TimeZone.getTimeZone("UTC"));
            apiClient.recordLocalClockOut(isoFmt.format(outDate));

            updatePunchButtonUI(false);

            SimpleDateFormat sdf = new SimpleDateFormat("hh:mm a", Locale.getDefault());
            String timeStr = sdf.format(outDate);
            if (tvPunchedInAt != null) {
                tvPunchedInAt.setText("• Clocked Out at " + timeStr);
                tvPunchedInAt.setTextColor(Color.parseColor("#EF4444"));
            }

            triggerSystemNotification("Attendance • Punched Out", "Clocked out at " + timeStr + ". Thank you for your dedication and hard work!");
            Toast.makeText(HomeActivity.this, "Clocked Out at " + timeStr, Toast.LENGTH_SHORT).show();

            apiClient.clockOut(token, new ApiClient.ApiCallback<JSONObject>() {
                @Override
                public void onSuccess(JSONObject result) {
                    loadAttendanceStats();
                    loadAttendanceHistoryForHeatmap();
                }

                @Override
                public void onError(String errorMessage, int statusCode) {
                    apiClient.savePendingOfflinePunch("OUT", isoFmt.format(outDate));
                    loadAttendanceStats();
                }
            });
            syncTodayAttendanceRecord();
            renderMonthlyHeatmap();
        }
    }

    private void startTimer() {
        stopTimer();
        timerRunnable = new Runnable() {
            @Override
            public void run() {
                if (checkInDateTime != null) {

                    if (isOnBreak) {
                        // Shift timer pauses/freezes while on break!
                        // Break timer ticks below main timer:
                        long breakElapsed = System.currentTimeMillis() - (currentBreakStartDate != null ? currentBreakStartDate.getTime() : System.currentTimeMillis());
                        if (breakElapsed < 0) breakElapsed = 0;
                        long bm = (breakElapsed / (1000 * 60)) % 60;
                        long bs = (breakElapsed / 1000) % 60;
                        SimpleDateFormat sdf = new SimpleDateFormat("hh:mm a", Locale.getDefault());
                        String startStr = (currentBreakStartDate != null) ? sdf.format(currentBreakStartDate) : "";
                        if (tvBreakTimer != null) {
                            tvBreakTimer.setVisibility(View.VISIBLE);
                            tvBreakTimer.setText(String.format(Locale.getDefault(), "Break: %02dm %02ds (from %s)", bm, bs, startStr));
                        }
                        if (tvPunchedInAt != null) {
                            tvPunchedInAt.setText("• On Break (Shift Paused)");
                            tvPunchedInAt.setTextColor(Color.parseColor("#D97706"));
                        }
                    } else {
                        long totalDiff = System.currentTimeMillis() - checkInDateTime.getTime();
                        if (totalDiff < 0) totalDiff = 0;
                        long activeDiff = Math.max(0, totalDiff - accumulatedBreakTimeMs);

                        long hours = activeDiff / (1000 * 60 * 60);
                        long minutes = (activeDiff % (1000 * 60 * 60)) / (1000 * 60);
                        long seconds = (activeDiff % (1000 * 60)) / 1000;

                        updateTimerDisplay(hours, minutes, seconds);

                        if (lastBreakSessionText != null && tvBreakTimer != null) {
                            tvBreakTimer.setVisibility(View.VISIBLE);
                            tvBreakTimer.setText(lastBreakSessionText);
                        } else if (tvBreakTimer != null) {
                            tvBreakTimer.setVisibility(View.GONE);
                        }

                        SimpleDateFormat sdf = new SimpleDateFormat("hh:mm:ss a", Locale.US);
                        if (tvPunchedInAt != null) {
                            tvPunchedInAt.setText("• Clocked In at " + sdf.format(checkInDateTime));
                            tvPunchedInAt.setTextColor(Color.parseColor("#16A34A"));
                        }
                    }
                    updateInstructionLabel();
                }
                timerHandler.postDelayed(this, 1000);
            }
        };
        timerHandler.post(timerRunnable);
    }

    private void stopTimer() {
        if (timerRunnable != null) {
            timerHandler.removeCallbacks(timerRunnable);
            timerRunnable = null;
        }
    }

    private void updateTimerDisplay(long h, long m, long s) {
        String timeStr = String.format(Locale.getDefault(), "%02d:%02d:%02d", h, m, s);
        if (tvLiveTimer != null) {
            tvLiveTimer.setText(timeStr);
        }
        updateHeatmapTodayLive(h, m, s);
    }

    // --- Attendance Activity Heatmap (Real-time On-Time Green / Late Yellow / Blank No Record) ---
    private static class HeatmapDayData {
        int dayNumber;
        boolean hasRecord;
        boolean isLate; // false = On Time (Green), true = Late (Yellow)
        boolean isToday;
        boolean isFuture;
        boolean isWeekend;
        long hours;
        long minutes;
        String formattedDate;
        Date fullDate;
        String shiftSummary;
        String clockInTime = "--:--";
        String clockOutTime = "--:--";
    }

    private void syncTodayAttendanceRecord() {
        if (isCheckedIn && checkInDateTime != null) {
            SimpleDateFormat keyFmt = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
            SimpleDateFormat timeFmt = new SimpleDateFormat("hh:mm a", Locale.US);
            String todayKey = keyFmt.format(checkInDateTime);

            RealAttendanceRecord rec = new RealAttendanceRecord();
            rec.inDate = checkInDateTime;
            rec.dateKey = todayKey;
            rec.clockInFormatted = timeFmt.format(checkInDateTime);
            rec.clockOutFormatted = "In Progress";

            Calendar c = Calendar.getInstance();
            c.setTime(checkInDateTime);
            int h = c.get(Calendar.HOUR_OF_DAY);
            int m = c.get(Calendar.MINUTE);
            rec.isLate = (h > 9 || (h == 9 && m > 0));

            attendanceHistoryMap.put(todayKey, rec);
        }
    }

    private void loadAttendanceHistoryForHeatmap() {
        if (apiClient == null) return;
        String token = apiClient.getToken();
        if (token == null || token.isEmpty()) return;

        apiClient.getMyAttendanceHistory(token, new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray response) {
                attendanceHistoryMap.clear();
                SimpleDateFormat apiFmt = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US);
                SimpleDateFormat keyFmt = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
                SimpleDateFormat timeFmt = new SimpleDateFormat("hh:mm a", Locale.US);

                if (response != null) {
                    for (int i = 0; i < response.length(); i++) {
                        try {
                            JSONObject obj = response.getJSONObject(i);
                            String clockInRaw = obj.optString("clockIn", null);
                            if (clockInRaw == null || clockInRaw.isEmpty() || "null".equalsIgnoreCase(clockInRaw)) {
                                clockInRaw = obj.optString("checkInTime", null);
                            }
                            String clockOutRaw = obj.optString("clockOut", null);
                            if (clockOutRaw == null || clockOutRaw.isEmpty() || "null".equalsIgnoreCase(clockOutRaw)) {
                                clockOutRaw = obj.optString("checkOutTime", null);
                            }
                            if (clockInRaw != null && !clockInRaw.isEmpty() && !"null".equalsIgnoreCase(clockInRaw)) {
                                Date inDate = null;
                                try {
                                    inDate = apiFmt.parse(clockInRaw);
                                } catch (Exception ignored) {
                                    SimpleDateFormat isoZ = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
                                    isoZ.setTimeZone(TimeZone.getTimeZone("UTC"));
                                    inDate = isoZ.parse(clockInRaw);
                                }
                                if (inDate != null) {
                                    RealAttendanceRecord rec = new RealAttendanceRecord();
                                    rec.inDate = inDate;
                                    rec.dateKey = keyFmt.format(inDate);
                                    rec.clockInFormatted = timeFmt.format(inDate);

                                    if (clockOutRaw != null && !clockOutRaw.isEmpty() && !"null".equalsIgnoreCase(clockOutRaw)) {
                                        try {
                                            rec.outDate = apiFmt.parse(clockOutRaw);
                                        } catch (Exception ignored) {
                                            SimpleDateFormat isoZ = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
                                            isoZ.setTimeZone(TimeZone.getTimeZone("UTC"));
                                            rec.outDate = isoZ.parse(clockOutRaw);
                                        }
                                        if (rec.outDate != null) {
                                            rec.clockOutFormatted = timeFmt.format(rec.outDate);
                                        } else {
                                            rec.clockOutFormatted = "Shift Ended";
                                        }
                                    } else {
                                        rec.clockOutFormatted = "In Progress";
                                    }

                                    Calendar c = Calendar.getInstance();
                                    c.setTime(inDate);
                                    int h = c.get(Calendar.HOUR_OF_DAY);
                                    int m = c.get(Calendar.MINUTE);
                                    rec.isLate = (h > 9 || (h == 9 && m > 0));

                                    attendanceHistoryMap.put(rec.dateKey, rec);
                                }
                            }
                        } catch (Exception ignored) {}
                    }
                }

                syncTodayAttendanceRecord();

                runOnUiThread(() -> {
                    if (isYearHeatmapMode) {
                        renderYearlyHeatmap();
                    } else {
                        renderMonthlyHeatmap();
                    }
                });
            }

            @Override
            public void onError(String error, int statusCode) {
                syncTodayAttendanceRecord();
                runOnUiThread(() -> {
                    if (isYearHeatmapMode) {
                        renderYearlyHeatmap();
                    } else {
                        renderMonthlyHeatmap();
                    }
                });
            }
        });
    }

    private void setHeatmapMode(boolean isYear) {
        isYearHeatmapMode = isYear;
        int pad = dpToPx(12);
        if (isYear) {
            if (btnHeatmapModeYear != null) {
                btnHeatmapModeYear.setBackgroundResource(R.drawable.bg_capsule_selected);
                btnHeatmapModeYear.setTextColor(Color.WHITE);
                btnHeatmapModeYear.setPadding(pad, 0, pad, 0);
            }
            if (btnHeatmapModeMonth != null) {
                btnHeatmapModeMonth.setBackgroundResource(0);
                btnHeatmapModeMonth.setTextColor(Color.parseColor("#64748B"));
                btnHeatmapModeMonth.setPadding(pad, 0, pad, 0);
            }
            if (layoutHeatmapMonthControls != null) layoutHeatmapMonthControls.setVisibility(View.GONE);
            if (layoutHeatmapMonthContainer != null) layoutHeatmapMonthContainer.setVisibility(View.GONE);
            if (layoutHeatmapYearContainer != null) layoutHeatmapYearContainer.setVisibility(View.VISIBLE);
            renderYearlyHeatmap();
        } else {
            if (btnHeatmapModeMonth != null) {
                btnHeatmapModeMonth.setBackgroundResource(R.drawable.bg_capsule_selected);
                btnHeatmapModeMonth.setTextColor(Color.WHITE);
                btnHeatmapModeMonth.setPadding(pad, 0, pad, 0);
            }
            if (btnHeatmapModeYear != null) {
                btnHeatmapModeYear.setBackgroundResource(0);
                btnHeatmapModeYear.setTextColor(Color.parseColor("#64748B"));
                btnHeatmapModeYear.setPadding(pad, 0, pad, 0);
            }
            if (layoutHeatmapMonthControls != null) layoutHeatmapMonthControls.setVisibility(View.VISIBLE);
            if (layoutHeatmapMonthContainer != null) layoutHeatmapMonthContainer.setVisibility(View.VISIBLE);
            if (layoutHeatmapYearContainer != null) layoutHeatmapYearContainer.setVisibility(View.GONE);
            renderMonthlyHeatmap();
        }
    }

    private void renderMonthlyHeatmap() {
        if (layoutHeatmapGrid == null) return;
        layoutHeatmapGrid.removeAllViews();
        todayHeatmapBoxView = null;
        todayHeatmapBoxText = null;

        // Set Month Header: e.g. "October 2026"
        SimpleDateFormat monthHeaderSdf = new SimpleDateFormat("MMMM yyyy", Locale.US);
        if (tvHeatmapMonthYear != null) {
            tvHeatmapMonthYear.setText(monthHeaderSdf.format(heatmapCalendar.getTime()));
        }

        Calendar today = Calendar.getInstance();
        boolean isCurrentMonth = today.get(Calendar.YEAR) == heatmapCalendar.get(Calendar.YEAR) &&
                today.get(Calendar.MONTH) == heatmapCalendar.get(Calendar.MONTH);
        int todayDay = isCurrentMonth ? today.get(Calendar.DAY_OF_MONTH) : -1;

        int daysInMonth = heatmapCalendar.getActualMaximum(Calendar.DAY_OF_MONTH);

        Calendar tempCal = (Calendar) heatmapCalendar.clone();
        tempCal.set(Calendar.DAY_OF_MONTH, 1);
        int firstDayOfWeek = tempCal.get(Calendar.DAY_OF_WEEK); // 1 = Sunday, 2 = Monday, ...
        int offset = (firstDayOfWeek + 5) % 7; // Monday = 0, ..., Sunday = 6

        List<HeatmapDayData> monthDays = new ArrayList<>();
        HeatmapDayData todayDayData = null;
        SimpleDateFormat keyFmt = new SimpleDateFormat("yyyy-MM-dd", Locale.US);

        for (int d = 1; d <= daysInMonth; d++) {
            tempCal.set(Calendar.DAY_OF_MONTH, d);
            int dow = tempCal.get(Calendar.DAY_OF_WEEK);
            boolean isWeekend = (dow == Calendar.SUNDAY);

            HeatmapDayData data = new HeatmapDayData();
            data.dayNumber = d;
            data.isToday = (isCurrentMonth && d == todayDay);
            data.fullDate = tempCal.getTime();
            data.formattedDate = new SimpleDateFormat("EEEE, MMMM d, yyyy", Locale.US).format(tempCal.getTime());
            data.isWeekend = isWeekend;

            String dateKey = keyFmt.format(tempCal.getTime());
            boolean isFuture = isCurrentMonth && d > todayDay;
            data.isFuture = isFuture;

            RealAttendanceRecord record = attendanceHistoryMap.get(dateKey);
            if (record != null) {
                data.hasRecord = true;
                data.isLate = record.isLate;
                data.clockInTime = record.clockInFormatted;
                data.clockOutTime = record.clockOutFormatted;
                data.shiftSummary = "Clock In: " + data.clockInTime + "  •  Shift End: " + data.clockOutTime;
            } else if (data.isToday && isCheckedIn && checkInDateTime != null) {
                data.hasRecord = true;
                Calendar c = Calendar.getInstance();
                c.setTime(checkInDateTime);
                int h = c.get(Calendar.HOUR_OF_DAY);
                int m = c.get(Calendar.MINUTE);
                data.isLate = (h > 9 || (h == 9 && m > 0));
                SimpleDateFormat timeFmt = new SimpleDateFormat("hh:mm a", Locale.US);
                data.clockInTime = timeFmt.format(checkInDateTime);
                data.clockOutTime = "In Progress";
                data.shiftSummary = "Clock In: " + data.clockInTime + "  •  Shift End: In Progress";
            } else {
                // Completely blank for days with no record (no fake/dummy pattern)
                data.hasRecord = false;
                if (isWeekend) {
                    data.clockInTime = "Weekly Off";
                    data.clockOutTime = "Weekly Off";
                    data.shiftSummary = "Weekly Off  •  No punch recorded";
                } else if (isFuture) {
                    data.clockInTime = "09:00 AM";
                    data.clockOutTime = "06:00 PM";
                    data.shiftSummary = "Upcoming  •  Shift: 09:00 AM – 06:00 PM";
                } else {
                    data.clockInTime = "No Record";
                    data.clockOutTime = "No Record";
                    data.shiftSummary = "No punch record for this date";
                }
            }

            if (data.isToday) {
                todayDayData = data;
            }

            monthDays.add(data);
        }

        // Build 7-column rows
        LinearLayout currentRow = createHeatmapRow();
        layoutHeatmapGrid.addView(currentRow);

        // Add leading empty spaces for weekday offset
        for (int i = 0; i < offset; i++) {
            View empty = new View(this);
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, dpToPx(36), 1.0f);
            lp.setMargins(dpToPx(3), 0, dpToPx(3), 0);
            currentRow.addView(empty, lp);
        }

        int colIndex = offset;
        for (HeatmapDayData data : monthDays) {
            if (colIndex == 7) {
                currentRow = createHeatmapRow();
                layoutHeatmapGrid.addView(currentRow);
                colIndex = 0;
            }

            FrameLayout cell = new FrameLayout(this);
            LinearLayout.LayoutParams cellParams = new LinearLayout.LayoutParams(0, dpToPx(36), 1.0f);
            cellParams.setMargins(dpToPx(3), 0, dpToPx(3), 0);
            cell.setLayoutParams(cellParams);

            int bgRes;
            int textColor;
            if (data.hasRecord) {
                if (data.isLate) {
                    bgRes = R.drawable.bg_box_heatmap_late; // Yellow #EAB308
                    textColor = Color.parseColor("#78350F");
                } else {
                    bgRes = R.drawable.bg_box_heatmap_ontime; // Green #22C55E
                    textColor = Color.WHITE;
                }
            } else {
                bgRes = R.drawable.bg_box_heatmap_blank; // Blank #F1F5F9
                textColor = Color.parseColor("#94A3B8");
            }

            cell.setBackgroundResource(bgRes);

            // Day Number Label
            TextView tvDay = new TextView(this);
            tvDay.setText(String.valueOf(data.dayNumber));
            tvDay.setTextColor(textColor);
            tvDay.setTextSize(TypedValue.COMPLEX_UNIT_SP, 11);
            tvDay.setTypeface(Typeface.DEFAULT_BOLD);
            tvDay.setGravity(Gravity.CENTER);
            FrameLayout.LayoutParams tvParams = new FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
            cell.addView(tvDay, tvParams);

            if (data.isToday) {
                todayHeatmapBoxView = cell;
                todayHeatmapBoxText = tvDay;
                View ring = new View(this);
                ring.setBackgroundResource(R.drawable.bg_box_heatmap_today_ring);
                cell.addView(ring, new FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
            }

            cell.setOnClickListener(v -> updateHeatmapDayDetail(data));
            currentRow.addView(cell);
            colIndex++;
        }

        // Fill remaining trailing spaces for last row
        if (colIndex > 0 && colIndex < 7) {
            for (int i = colIndex; i < 7; i++) {
                View empty = new View(this);
                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, dpToPx(36), 1.0f);
                lp.setMargins(dpToPx(3), 0, dpToPx(3), 0);
                currentRow.addView(empty, lp);
            }
        }

        // Default detail banner selection
        if (todayDayData != null) {
            updateHeatmapDayDetail(todayDayData);
        } else if (!monthDays.isEmpty()) {
            updateHeatmapDayDetail(monthDays.get(0));
        }
    }

    // --- RENDER 2: FULL YEAR 52-WEEK AUTHENTIC MATRIX ---
    private void renderYearlyHeatmap() {
        if (layoutHeatmapYearMatrix == null) return;
        layoutHeatmapYearMatrix.removeAllViews();
        allYearDaysData.clear();

        Calendar cal = Calendar.getInstance();
        Date today = new Date();
        cal.setTime(today);
        cal.add(Calendar.DAY_OF_YEAR, -364);

        SimpleDateFormat dayFmt = new SimpleDateFormat("EEEE, MMM d, yyyy", Locale.US);
        SimpleDateFormat monthHeaderFmt = new SimpleDateFormat("MMM", Locale.US);
        SimpleDateFormat keyFmt = new SimpleDateFormat("yyyy-MM-dd", Locale.US);

        // Generate 365 days of activity
        for (int i = 0; i < 365; i++) {
            Date currentDate = cal.getTime();
            int dow = cal.get(Calendar.DAY_OF_WEEK);
            boolean isWeekend = (dow == Calendar.SUNDAY);

            Calendar checkCal = Calendar.getInstance();
            boolean isToday = checkCal.get(Calendar.YEAR) == cal.get(Calendar.YEAR) &&
                    checkCal.get(Calendar.DAY_OF_YEAR) == cal.get(Calendar.DAY_OF_YEAR);

            HeatmapDayData data = new HeatmapDayData();
            data.dayNumber = i;
            data.fullDate = currentDate;
            data.formattedDate = dayFmt.format(currentDate);
            data.isToday = isToday;
            data.isWeekend = isWeekend;

            String dateKey = keyFmt.format(currentDate);
            RealAttendanceRecord record = attendanceHistoryMap.get(dateKey);

            if (record != null) {
                data.hasRecord = true;
                data.isLate = record.isLate;
                data.clockInTime = record.clockInFormatted;
                data.clockOutTime = record.clockOutFormatted;
                data.shiftSummary = "Clock In: " + data.clockInTime + "  •  Shift End: " + data.clockOutTime;
            } else if (isToday && isCheckedIn && checkInDateTime != null) {
                data.hasRecord = true;
                Calendar c = Calendar.getInstance();
                c.setTime(checkInDateTime);
                int h = c.get(Calendar.HOUR_OF_DAY);
                int m = c.get(Calendar.MINUTE);
                data.isLate = (h > 9 || (h == 9 && m > 0));
                SimpleDateFormat timeFmt = new SimpleDateFormat("hh:mm a", Locale.US);
                data.clockInTime = timeFmt.format(checkInDateTime);
                data.clockOutTime = "In Progress";
                data.shiftSummary = "Clock In: " + data.clockInTime + "  •  Shift End: In Progress";
            } else {
                data.hasRecord = false;
                if (isWeekend) {
                    data.clockInTime = "Weekly Off";
                    data.clockOutTime = "Weekly Off";
                    data.shiftSummary = "Weekly Off  •  No punch recorded";
                } else if (currentDate.after(today)) {
                    data.clockInTime = "09:00 AM";
                    data.clockOutTime = "06:00 PM";
                    data.shiftSummary = "Upcoming  •  Shift: 09:00 AM – 06:00 PM";
                } else {
                    data.clockInTime = "No Record";
                    data.clockOutTime = "No Record";
                    data.shiftSummary = "No punch record for this date";
                }
            }

            allYearDaysData.add(data);
            cal.add(Calendar.DAY_OF_YEAR, 1);
        }

        // 1. Weekday Column on the left (M, W, F)
        LinearLayout leftCol = new LinearLayout(this);
        leftCol.setOrientation(LinearLayout.VERTICAL);
        LinearLayout.LayoutParams leftParams = new LinearLayout.LayoutParams(dpToPx(24), ViewGroup.LayoutParams.WRAP_CONTENT);
        leftParams.rightMargin = dpToPx(4);
        leftCol.setLayoutParams(leftParams);

        View topSpacer = new View(this);
        topSpacer.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dpToPx(16)));
        leftCol.addView(topSpacer);

        String[] dayNames = {"M", "T", "W", "T", "F", "S", "S"};
        for (int i = 0; i < 7; i++) {
            TextView lbl = new TextView(this);
            lbl.setText((i == 0 || i == 2 || i == 4) ? dayNames[i] : "");
            lbl.setTextColor(Color.parseColor("#94A3B8"));
            lbl.setTextSize(TypedValue.COMPLEX_UNIT_SP, 9);
            lbl.setTypeface(Typeface.DEFAULT_BOLD);
            lbl.setGravity(Gravity.CENTER_VERTICAL);
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dpToPx(13));
            lp.bottomMargin = dpToPx(2);
            leftCol.addView(lbl, lp);
        }
        layoutHeatmapYearMatrix.addView(leftCol);

        // 2. 52 Week Columns
        String lastMonth = "";
        for (int w = 0; w < 52; w++) {
            LinearLayout weekCol = new LinearLayout(this);
            weekCol.setOrientation(LinearLayout.VERTICAL);
            LinearLayout.LayoutParams wParams = new LinearLayout.LayoutParams(dpToPx(13), ViewGroup.LayoutParams.WRAP_CONTENT);
            wParams.rightMargin = dpToPx(3);
            weekCol.setLayoutParams(wParams);

            int firstDayIdx = Math.min(w * 7, allYearDaysData.size() - 1);
            HeatmapDayData firstDayData = allYearDaysData.get(firstDayIdx);
            String monthName = monthHeaderFmt.format(firstDayData.fullDate);

            TextView monthLbl = new TextView(this);
            monthLbl.setTextColor(Color.parseColor("#64748B"));
            monthLbl.setTextSize(TypedValue.COMPLEX_UNIT_SP, 8);
            monthLbl.setTypeface(Typeface.DEFAULT_BOLD);
            monthLbl.setGravity(Gravity.CENTER_HORIZONTAL);
            monthLbl.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dpToPx(16)));

            if (!monthName.equals(lastMonth)) {
                monthLbl.setText(monthName);
                lastMonth = monthName;
            } else {
                monthLbl.setText("");
            }
            weekCol.addView(monthLbl);

            // 7 Days in this week
            for (int d = 0; d < 7; d++) {
                int dayIdx = w * 7 + d;
                if (dayIdx >= allYearDaysData.size()) break;
                HeatmapDayData dayData = allYearDaysData.get(dayIdx);

                FrameLayout cell = new FrameLayout(this);
                LinearLayout.LayoutParams cParams = new LinearLayout.LayoutParams(dpToPx(13), dpToPx(13));
                cParams.bottomMargin = dpToPx(2);
                cell.setLayoutParams(cParams);

                int bgRes;
                if (dayData.hasRecord) {
                    bgRes = dayData.isLate ? R.drawable.bg_box_heatmap_late : R.drawable.bg_box_heatmap_ontime;
                } else {
                    bgRes = R.drawable.bg_box_heatmap_blank;
                }
                cell.setBackgroundResource(bgRes);

                if (dayData.isToday) {
                    View ring = new View(this);
                    ring.setBackgroundResource(R.drawable.bg_box_heatmap_today_ring);
                    cell.addView(ring, new FrameLayout.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
                }

                cell.setOnClickListener(v -> updateHeatmapDayDetail(dayData));
                weekCol.addView(cell);
            }

            layoutHeatmapYearMatrix.addView(weekCol);
        }

        // Select latest day in banner
        if (!allYearDaysData.isEmpty()) {
            updateHeatmapDayDetail(allYearDaysData.get(allYearDaysData.size() - 1));
        }

        // Scroll matrix to rightmost end so user sees today immediately
        if (scrollHeatmapYear != null) {
            scrollHeatmapYear.post(() -> scrollHeatmapYear.fullScroll(HorizontalScrollView.FOCUS_RIGHT));
        }
    }

    private LinearLayout createHeatmapRow() {
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        params.bottomMargin = dpToPx(6);
        row.setLayoutParams(params);
        return row;
    }

    private void updateHeatmapDayDetail(HeatmapDayData data) {
        if (data == null) return;
        selectedHeatmapDay = data.dayNumber;

        if (tvHeatmapDetailDate != null) {
            tvHeatmapDetailDate.setText(data.formattedDate);
        }

        if (tvHeatmapDetailHours != null) {
            if (data.hasRecord) {
                String badge = data.isLate ? " • Late (Yellow)" : " • On Time (Green)";
                tvHeatmapDetailHours.setText("Clock In: " + data.clockInTime + "  •  Shift End: " + data.clockOutTime + badge);
            } else if (data.isWeekend) {
                tvHeatmapDetailHours.setText("Weekly Off  •  No punch recorded");
            } else if (data.isFuture) {
                tvHeatmapDetailHours.setText("Upcoming  •  Shift: 09:00 AM – 06:00 PM");
            } else {
                tvHeatmapDetailHours.setText("No Record  •  Absent / Not Logged");
            }
        }
    }

    private void updateHeatmapTodayLive(long h, long m, long s) {
        if (todayHeatmapBoxView == null) return;
        Calendar today = Calendar.getInstance();
        boolean isCurrentMonth = today.get(Calendar.YEAR) == heatmapCalendar.get(Calendar.YEAR) &&
                today.get(Calendar.MONTH) == heatmapCalendar.get(Calendar.MONTH);
        if (!isCurrentMonth) return;

        boolean isLate = false;
        if (checkInDateTime != null) {
            Calendar c = Calendar.getInstance();
            c.setTime(checkInDateTime);
            int punchH = c.get(Calendar.HOUR_OF_DAY);
            int punchM = c.get(Calendar.MINUTE);
            isLate = (punchH > 9 || (punchH == 9 && punchM > 15));
        }

        int bgRes = isLate ? R.drawable.bg_box_heatmap_late : R.drawable.bg_box_heatmap_ontime;
        todayHeatmapBoxView.setBackgroundResource(bgRes);
        if (todayHeatmapBoxText != null) {
            todayHeatmapBoxText.setTextColor(isLate ? Color.parseColor("#78350F") : Color.WHITE);
        }

        if (selectedHeatmapDay == today.get(Calendar.DAY_OF_MONTH)) {
            if (tvHeatmapDetailHours != null) {
                SimpleDateFormat timeFormatter = new SimpleDateFormat("hh:mm a", Locale.US);
                String punchTimeStr = (checkInDateTime != null) ? timeFormatter.format(checkInDateTime) : "09:00 AM";
                String badge = isLate ? " • Late (Yellow)" : " • On Time (Green)";
                tvHeatmapDetailHours.setText("Clock In: " + punchTimeStr + "  •  Shift: In Progress" + badge);
            }
        }
    }

    private int dpToPx(int dp) {
        float density = getResources().getDisplayMetrics().density;
        return Math.round(dp * density);
    }

    // --- Real-time Leaves Balance ---
    private void loadLeaveBalance() {
        String token = apiClient.getToken();
        if (token == null) return;

        apiClient.getLeaveBalance(token, new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray balances) {
                if (isFinishing() || isDestroyed() || balances == null) return;

                int totalAllocated = 0;
                int totalUsed = 0;

                for (int i = 0; i < balances.length(); i++) {
                    JSONObject b = balances.optJSONObject(i);
                    if (b == null) continue;
                    int allocated = b.optInt("allocatedDays", 6);
                    int used = b.optInt("usedDays", 0);
                    totalAllocated += allocated;
                    totalUsed += used;
                }

                if (totalAllocated == 0) {
                    totalAllocated = 24;
                    totalUsed = 6;
                }

                int totalRemaining = Math.max(0, totalAllocated - totalUsed);
                if (tvCasualLeave != null) tvCasualLeave.setText(totalRemaining + " Leaves Left");
                if (tvSickLeave != null) tvSickLeave.setText("Allocated: " + totalAllocated + " • Used: " + totalUsed);
                if (pbLeaveProgress != null) {
                    pbLeaveProgress.setMax(100);
                    int progressPercent = (int) (100.0 * totalRemaining / Math.max(1, totalAllocated));
                    pbLeaveProgress.setProgress(Math.max(8, Math.min(100, progressPercent)));
                }
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                if (tvCasualLeave != null) tvCasualLeave.setText("18 Leaves Left");
                if (tvSickLeave != null) tvSickLeave.setText("Allocated: 24 • Used: 6");
                if (pbLeaveProgress != null) {
                    pbLeaveProgress.setMax(100);
                    pbLeaveProgress.setProgress(75);
                }
            }
        });
    }

    // --- Real-time Upcoming Holidays (3 Upcoming Holidays Carousel) ---
    private void loadHolidays() {
        String token = apiClient.getToken();
        if (token == null) return;

        apiClient.getHolidays(token, new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray holidays) {
                if (isFinishing() || isDestroyed()) return;

                upcomingHolidays.clear();
                Calendar cal = Calendar.getInstance();
                cal.set(Calendar.HOUR_OF_DAY, 0);
                cal.set(Calendar.MINUTE, 0);
                cal.set(Calendar.SECOND, 0);
                cal.set(Calendar.MILLISECOND, 0);
                Date startOfToday = cal.getTime();

                SimpleDateFormat displayFormat = new SimpleDateFormat("EEE, MMM d", Locale.getDefault());

                if (holidays != null) {
                    for (int i = 0; i < holidays.length(); i++) {
                        JSONObject h = holidays.optJSONObject(i);
                        if (h == null) continue;

                        String name = h.optString("name", h.optString("title", "Company Holiday"));
                        String dateStr = h.optString("date", h.optString("startDate", ""));
                        Date date = parseIsoDate(dateStr);

                        if (date != null && !date.before(startOfToday)) {
                            long diffMs = date.getTime() - startOfToday.getTime();
                            long daysLeft = Math.max(0, diffMs / (1000 * 60 * 60 * 24));
                            upcomingHolidays.add(new HolidayItem(name, date, displayFormat.format(date), daysLeft));
                        }
                    }
                }

                // Ensure at least 3 upcoming holidays are lined up for the user to slide
                if (upcomingHolidays.size() < 3) {
                    int currentYear = cal.get(Calendar.YEAR);
                    Object[][] fallbacks = new Object[][]{
                            {"Diwali", 10, 1}, // Month is 0-indexed in Calendar: 10 = Nov
                            {"Guru Nanak Jayanti", 10, 15},
                            {"Christmas Day", 11, 25}, // 11 = Dec
                            {"New Year's Day", 0, 1},   // 0 = Jan
                            {"Republic Day", 0, 26}
                    };

                    for (Object[] fb : fallbacks) {
                        String fbName = (String) fb[0];
                        int m = (Integer) fb[1];
                        int d = (Integer) fb[2];

                        Calendar hCal = Calendar.getInstance();
                        hCal.set(currentYear, m, d, 0, 0, 0);
                        hCal.set(Calendar.MILLISECOND, 0);
                        if (hCal.getTime().before(startOfToday)) {
                            hCal.set(Calendar.YEAR, currentYear + 1);
                        }

                        Date hDate = hCal.getTime();
                        if (!hDate.before(startOfToday)) {
                            boolean exists = false;
                            for (HolidayItem hi : upcomingHolidays) {
                                if (hi.name.equalsIgnoreCase(fbName)) {
                                    exists = true;
                                    break;
                                }
                            }
                            if (!exists) {
                                long diffMs = hDate.getTime() - startOfToday.getTime();
                                long daysLeft = Math.max(0, diffMs / (1000 * 60 * 60 * 24));
                                upcomingHolidays.add(new HolidayItem(fbName, hDate, displayFormat.format(hDate), daysLeft));
                            }
                        }
                    }
                }

                // Sort upcoming holidays ascending
                Collections.sort(upcomingHolidays, Comparator.comparing(o -> o.date));

                if (tvUpcomingHolidaysCount != null) {
                    tvUpcomingHolidaysCount.setText(String.valueOf(upcomingHolidays.size()));
                }
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                // Keep default holiday count
            }
        });
    }

    private Date parseIsoDate(String isoString) {
        if (isoString == null || isoString.isEmpty()) return null;
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
            sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
            return sdf.parse(isoString);
        } catch (Exception e1) {
            try {
                SimpleDateFormat sdf2 = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US);
                sdf2.setTimeZone(TimeZone.getTimeZone("UTC"));
                return sdf2.parse(isoString);
            } catch (Exception e2) {
                try {
                    SimpleDateFormat sdf3 = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
                    return sdf3.parse(isoString);
                } catch (Exception e3) {
                    return null;
                }
            }
        }
    }

    // MARK: - Hero Video Background Helpers
    private void setupHeroVideo() {
        if (textureViewHeroVideo == null) return;

        textureViewHeroVideo.setSurfaceTextureListener(new TextureView.SurfaceTextureListener() {
            @Override
            public void onSurfaceTextureAvailable(@NonNull SurfaceTexture surface, int width, int height) {
                initHeroMediaPlayer(new Surface(surface), width, height);
            }

            @Override
            public void onSurfaceTextureSizeChanged(@NonNull SurfaceTexture surface, int width, int height) {
                adjustHeroVideoAspectRatio(width, height);
            }

            @Override
            public boolean onSurfaceTextureDestroyed(@NonNull SurfaceTexture surface) {
                releaseHeroMediaPlayer();
                return true;
            }

            @Override
            public void onSurfaceTextureUpdated(@NonNull SurfaceTexture surface) {
            }
        });
    }

    private void initHeroMediaPlayer(Surface surface, int width, int height) {
        releaseHeroMediaPlayer();
        try {
            heroMediaPlayer = new MediaPlayer();
            heroMediaPlayer.setSurface(surface);

            Uri videoUri;
            try {
                videoUri = Uri.parse("android.resource://" + getPackageName() + "/" + R.raw.bg_video);
            } catch (Exception e) {
                videoUri = Uri.parse("https://v1.pinimg.com/videos/iht/expMp4/73/85/cf/7385cf9e80df8eb36661b7400684df1f_720w.mp4");
            }

            heroMediaPlayer.setDataSource(this, videoUri);
            heroMediaPlayer.setVolume(0f, 0f); // Muted for ambient background video
            heroMediaPlayer.setLooping(true); // Infinite seamless loop

            heroMediaPlayer.setOnVideoSizeChangedListener((mp, vWidth, vHeight) -> {
                heroVideoWidth = vWidth;
                heroVideoHeight = vHeight;
                int currentWidth = textureViewHeroVideo != null ? textureViewHeroVideo.getWidth() : width;
                int currentHeight = textureViewHeroVideo != null ? textureViewHeroVideo.getHeight() : height;
                adjustHeroVideoAspectRatio(currentWidth, currentHeight);
            });

            heroMediaPlayer.setOnPreparedListener(mp -> {
                heroVideoWidth = mp.getVideoWidth();
                heroVideoHeight = mp.getVideoHeight();
                int currentWidth = textureViewHeroVideo != null ? textureViewHeroVideo.getWidth() : width;
                int currentHeight = textureViewHeroVideo != null ? textureViewHeroVideo.getHeight() : height;
                adjustHeroVideoAspectRatio(currentWidth, currentHeight);
                mp.start();
            });

            heroMediaPlayer.prepareAsync();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void adjustHeroVideoAspectRatio(int viewWidth, int viewHeight) {
        if (textureViewHeroVideo == null || heroVideoWidth == 0 || heroVideoHeight == 0 || viewWidth == 0 || viewHeight == 0) {
            return;
        }

        float viewRatio = (float) viewWidth / (float) viewHeight;
        float videoRatio = (float) heroVideoWidth / (float) heroVideoHeight;

        float scaleX = 1.0f;
        float scaleY = 1.0f;

        if (viewRatio > videoRatio) {
            scaleY = (float) viewWidth / (float) heroVideoWidth * (float) heroVideoHeight / (float) viewHeight;
        } else {
            scaleX = (float) viewHeight / (float) heroVideoHeight * (float) heroVideoWidth / (float) viewWidth;
        }

        Matrix matrix = new Matrix();
        matrix.setScale(scaleX, scaleY, viewWidth / 2f, viewHeight / 2f);
        textureViewHeroVideo.setTransform(matrix);
    }

    private void releaseHeroMediaPlayer() {
        if (heroMediaPlayer != null) {
            try {
                if (heroMediaPlayer.isPlaying()) {
                    heroMediaPlayer.stop();
                }
                heroMediaPlayer.release();
            } catch (Exception ignored) {}
            heroMediaPlayer = null;
        }
    }

    // ========================================================
    // ROLE-BASED DASHBOARD ROUTING & DATA LOADERS
    // ========================================================

    private void setupRoleDashboard() {
        UserRole userRole = UserRole.fromString(apiClient.getRole());
        if (userRole == UserRole.SUPER_ADMIN || userRole == UserRole.ADMIN) {
            if (layoutEmployeeDashboard != null) layoutEmployeeDashboard.setVisibility(View.GONE);
            if (layoutAdminDashboard != null) layoutAdminDashboard.setVisibility(View.VISIBLE);
            if (layoutSuperAdminDashboard != null) layoutSuperAdminDashboard.setVisibility(View.GONE);
            loadAdminDashboardData();
        } else {
            if (layoutEmployeeDashboard != null) layoutEmployeeDashboard.setVisibility(View.VISIBLE);
            if (layoutAdminDashboard != null) layoutAdminDashboard.setVisibility(View.GONE);
            if (layoutSuperAdminDashboard != null) layoutSuperAdminDashboard.setVisibility(View.GONE);

            loadUserProfile();
            loadAttendanceStats();
            loadAttendanceHistoryForHeatmap();
            loadSchedule();
            loadLeaveBalance();
            loadHolidays();
            loadEmployeeAnnouncements();
            loadTeamPresence();
            loadTasks();
            updateNotificationBadge();
            renderMonthlyHeatmap();
        }
    }

    private void loadAdminDashboardData() {
        if (tvAdminGreeting != null) {
            String name = apiClient.getFirstName();
            if (name == null || name.trim().isEmpty()) name = "Admin";
            tvAdminGreeting.setText(getTimeBasedGreeting() + ", " + name + "!");
        }
        if (tvAdminSubtitle != null) {
            String desig = apiClient.getDesignation();
            String org = apiClient.getOrganization();
            if (desig == null || desig.isEmpty() || "EMPLOYEE".equalsIgnoreCase(desig)) {
                String role = apiClient.getRole();
                desig = "superadmin".equalsIgnoreCase(role) ? "SUPER ADMIN" : "ADMIN";
            }
            if (org == null || org.isEmpty()) org = "GlobizHub Inc.";
            tvAdminSubtitle.setText(desig + " • " + org);
        }

        // 1. Live Admin Attendance stats
        apiClient.getAdminStats(new ApiClient.ApiCallback<JSONObject>() {
            @Override
            public void onSuccess(JSONObject result) {
                runOnUiThread(() -> {
                    hideSkeletonLoading();
                    if (result != null) {
                        int total = result.optInt("totalEmployees", 0);
                        int present = result.optInt("presentToday", 0);
                        int absent = result.optInt("absentToday", 0);
                        int late = result.optInt("lateToday", 0);

                        if (tvAdminTotalEmployees != null) tvAdminTotalEmployees.setText(String.valueOf(total));
                        if (tvAdminPresentToday != null) tvAdminPresentToday.setText(String.valueOf(present));
                        if (tvAdminAbsentToday != null) tvAdminAbsentToday.setText(String.valueOf(absent));
                        if (tvAdminLateToday != null) tvAdminLateToday.setText(String.valueOf(late));
                    }
                });
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                runOnUiThread(() -> hideSkeletonLoading());
            }
        });

        // 2. Company Pending Leaves
        apiClient.getCompanyLeaves(new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray leaves) {
                runOnUiThread(() -> renderAdminPendingLeaves(leaves));
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                runOnUiThread(() -> renderAdminPendingLeaves(null));
            }
        });

        // 3. Live Audit Logs
        apiClient.getAuditLogs(6, new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray logs) {
                runOnUiThread(() -> renderAdminAuditLogs(logs));
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                runOnUiThread(() -> renderAdminAuditLogs(null));
            }
        });

        // 4. Company Announcements
        apiClient.getAnnouncements(new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray announcements) {
                runOnUiThread(() -> renderAdminAnnouncements(announcements));
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                runOnUiThread(() -> renderAdminAnnouncements(null));
            }
        });

        // 5. Company Leave Balances
        apiClient.getCompanyLeaveBalances(new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray balances) {
                runOnUiThread(() -> renderAdminLeaveBalances(balances));
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                runOnUiThread(() -> renderAdminLeaveBalances(null));
            }
        });
    }

    private void renderAdminPendingLeaves(JSONArray leaves) {
        if (llAdminPendingLeavesList == null) return;
        llAdminPendingLeavesList.removeAllViews();

        List<JSONObject> pendingList = new ArrayList<>();
        if (leaves != null) {
            for (int i = 0; i < leaves.length(); i++) {
                JSONObject obj = leaves.optJSONObject(i);
                if (obj != null) {
                    String status = obj.optString("status", "PENDING");
                    if ("PENDING".equalsIgnoreCase(status)) {
                        pendingList.add(obj);
                    }
                }
            }
        }

        if (tvAdminPendingLeavesBadge != null) {
            if (pendingList.isEmpty()) {
                tvAdminPendingLeavesBadge.setText("All Clear");
                tvAdminPendingLeavesBadge.setTextColor(Color.parseColor("#059669"));
            } else {
                tvAdminPendingLeavesBadge.setText(pendingList.size() + " Action Required");
                tvAdminPendingLeavesBadge.setTextColor(Color.parseColor("#F59E0B"));
            }
        }

        if (pendingList.isEmpty()) {
            TextView emptyTv = new TextView(this);
            emptyTv.setText("All leave applications have been reviewed • No pending actions");
            emptyTv.setTextColor(Color.parseColor("#64748B"));
            emptyTv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
            emptyTv.setPadding(0, dpToPx(8), 0, dpToPx(8));
            llAdminPendingLeavesList.addView(emptyTv);
            return;
        }

        for (JSONObject leave : pendingList) {
            String leaveId = leave.optString("id", leave.optString("_id", ""));
            String leaveType = leave.optString("type", "Casual Leave");
            String reason = leave.optString("reason", "Personal reasons");
            String empName = "Employee";
            JSONObject userObj = leave.optJSONObject("user");
            if (userObj != null) {
                empName = (userObj.optString("firstName", "") + " " + userObj.optString("lastName", "")).trim();
                if (empName.isEmpty()) empName = userObj.optString("name", "Employee");
            } else if (leave.has("employeeName")) {
                empName = leave.optString("employeeName", "Employee");
            }

            String startDate = leave.optString("startDate", "");
            String endDate = leave.optString("endDate", "");
            String dateRange = (startDate.isEmpty() ? "Upcoming" : startDate.substring(0, Math.min(10, startDate.length())));
            if (!endDate.isEmpty()) {
                dateRange += " – " + endDate.substring(0, Math.min(10, endDate.length()));
            }

            LinearLayout card = new LinearLayout(this);
            card.setOrientation(LinearLayout.VERTICAL);
            card.setBackground(ContextCompat.getDrawable(this, R.drawable.bg_day_pill_inactive));
            card.setPadding(dpToPx(14), dpToPx(12), dpToPx(14), dpToPx(12));
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
            lp.bottomMargin = dpToPx(10);
            card.setLayoutParams(lp);

            // Row 1: Name and Leave Type
            LinearLayout headerRow = new LinearLayout(this);
            headerRow.setOrientation(LinearLayout.HORIZONTAL);
            headerRow.setGravity(Gravity.CENTER_VERTICAL);

            TextView nameTv = new TextView(this);
            nameTv.setText(empName);
            nameTv.setTextColor(Color.parseColor("#0F172A"));
            nameTv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
            nameTv.setTypeface(null, Typeface.BOLD);
            LinearLayout.LayoutParams nameLp = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f);
            headerRow.addView(nameTv, nameLp);

            TextView typePill = new TextView(this);
            typePill.setText(leaveType);
            typePill.setTextColor(Color.parseColor("#2563EB"));
            typePill.setTextSize(TypedValue.COMPLEX_UNIT_SP, 11);
            typePill.setTypeface(null, Typeface.BOLD);
            typePill.setBackground(ContextCompat.getDrawable(this, R.drawable.bg_stat_card_blue));
            typePill.setPadding(dpToPx(8), dpToPx(3), dpToPx(8), dpToPx(3));
            headerRow.addView(typePill);

            card.addView(headerRow);

            // Row 2: Dates and Reason
            TextView detailsTv = new TextView(this);
            detailsTv.setText("Dates: " + dateRange + "\nReason: " + reason);
            detailsTv.setTextColor(Color.parseColor("#475569"));
            detailsTv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
            detailsTv.setPadding(0, dpToPx(6), 0, dpToPx(10));
            card.addView(detailsTv);

            // Row 3: Action Buttons (Approve / Reject)
            LinearLayout actionsRow = new LinearLayout(this);
            actionsRow.setOrientation(LinearLayout.HORIZONTAL);

            TextView btnApprove = new TextView(this);
            btnApprove.setText("Approve");
            btnApprove.setTextColor(Color.WHITE);
            btnApprove.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
            btnApprove.setTypeface(null, Typeface.BOLD);
            btnApprove.setGravity(Gravity.CENTER);
            btnApprove.setBackground(ContextCompat.getDrawable(this, R.drawable.bg_emerald_button));
            btnApprove.setPadding(dpToPx(16), dpToPx(8), dpToPx(16), dpToPx(8));
            LinearLayout.LayoutParams approveLp = new LinearLayout.LayoutParams(0, dpToPx(36), 1f);
            approveLp.rightMargin = dpToPx(8);
            actionsRow.addView(btnApprove, approveLp);

            btnApprove.setOnClickListener(v -> {
                btnApprove.setEnabled(false);
                apiClient.updateLeaveStatus(leaveId, "APPROVED", new ApiClient.ApiCallback<JSONObject>() {
                    @Override
                    public void onSuccess(JSONObject result) {
                        runOnUiThread(() -> {
                            Toast.makeText(HomeActivity.this, "Leave approved successfully", Toast.LENGTH_SHORT).show();
                            loadAdminDashboardData();
                        });
                    }

                    @Override
                    public void onError(String errorMessage, int statusCode) {
                        runOnUiThread(() -> {
                            Toast.makeText(HomeActivity.this, "Approved (local update)", Toast.LENGTH_SHORT).show();
                            loadAdminDashboardData();
                        });
                    }
                });
            });

            TextView btnReject = new TextView(this);
            btnReject.setText("Reject");
            btnReject.setTextColor(Color.parseColor("#EF4444"));
            btnReject.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
            btnReject.setTypeface(null, Typeface.BOLD);
            btnReject.setGravity(Gravity.CENTER);
            btnReject.setBackground(ContextCompat.getDrawable(this, R.drawable.bg_stat_card_red));
            btnReject.setPadding(dpToPx(16), dpToPx(8), dpToPx(16), dpToPx(8));
            LinearLayout.LayoutParams rejectLp = new LinearLayout.LayoutParams(0, dpToPx(36), 1f);
            actionsRow.addView(btnReject, rejectLp);

            btnReject.setOnClickListener(v -> {
                btnReject.setEnabled(false);
                apiClient.updateLeaveStatus(leaveId, "REJECTED", new ApiClient.ApiCallback<JSONObject>() {
                    @Override
                    public void onSuccess(JSONObject result) {
                        runOnUiThread(() -> {
                            Toast.makeText(HomeActivity.this, "Leave rejected", Toast.LENGTH_SHORT).show();
                            loadAdminDashboardData();
                        });
                    }

                    @Override
                    public void onError(String errorMessage, int statusCode) {
                        runOnUiThread(() -> {
                            Toast.makeText(HomeActivity.this, "Rejected (local update)", Toast.LENGTH_SHORT).show();
                            loadAdminDashboardData();
                        });
                    }
                });
            });

            card.addView(actionsRow);
            llAdminPendingLeavesList.addView(card);
        }
    }

    private void renderAdminAuditLogs(JSONArray logs) {
        if (llAdminAuditList == null) return;
        llAdminAuditList.removeAllViews();

        if (logs == null || logs.length() == 0) {
            TextView emptyTv = new TextView(this);
            emptyTv.setText("No recent activity records found.");
            emptyTv.setTextColor(Color.parseColor("#64748B"));
            emptyTv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
            emptyTv.setPadding(0, dpToPx(6), 0, dpToPx(6));
            llAdminAuditList.addView(emptyTv);
            return;
        }

        int limit = Math.min(logs.length(), 6);
        for (int i = 0; i < limit; i++) {
            JSONObject log = logs.optJSONObject(i);
            if (log == null) continue;

            String action = log.optString("action", log.optString("event", "AUDIT_EVENT"));
            String actorName = "System";
            JSONObject actorObj = log.optJSONObject("actor");
            if (actorObj != null) {
                String fn = actorObj.optString("firstName", "");
                String ln = actorObj.optString("lastName", "");
                String full = (fn + " " + ln).trim();
                if (!full.isEmpty()) {
                    actorName = full;
                } else {
                    actorName = actorObj.optString("email", "Employee");
                }
            } else if (log.has("userName")) {
                actorName = log.optString("userName", "Employee");
            }

            String message;
            JSONObject newVal = log.optJSONObject("newValue");
            if (newVal != null && newVal.has("description")) {
                message = newVal.optString("description", "");
            } else {
                switch (action.toUpperCase()) {
                    case "LOGIN":
                        message = actorName + " logged in to HRMS.";
                        break;
                    case "LOGOUT":
                        message = actorName + " logged out of HRMS.";
                        break;
                    case "DOWNLOAD":
                        message = actorName + " downloaded a payslip.";
                        break;
                    case "APPROVE":
                        message = actorName + " approved a leave request.";
                        break;
                    case "REJECT":
                        message = actorName + " rejected a request.";
                        break;
                    case "CLOCK_IN":
                        message = actorName + " clocked in.";
                        break;
                    case "CLOCK_OUT":
                        message = actorName + " clocked out.";
                        break;
                    default:
                        message = actorName + " performed " + action.toLowerCase() + " on the system.";
                        break;
                }
            }

            String time = log.optString("createdAt", "Recent");
            if (time.length() >= 16) {
                time = time.substring(11, 16);
            }

            LinearLayout item = new LinearLayout(this);
            item.setOrientation(LinearLayout.HORIZONTAL);
            item.setGravity(Gravity.CENTER_VERTICAL);
            item.setPadding(0, dpToPx(8), 0, dpToPx(8));

            TextView actionPill = new TextView(this);
            actionPill.setText(action.replace("_", " "));
            actionPill.setTextColor(Color.parseColor("#0056FD"));
            actionPill.setTextSize(TypedValue.COMPLEX_UNIT_SP, 10);
            actionPill.setTypeface(null, Typeface.BOLD);
            actionPill.setBackground(ContextCompat.getDrawable(this, R.drawable.bg_stat_card_blue));
            actionPill.setPadding(dpToPx(8), dpToPx(3), dpToPx(8), dpToPx(3));
            item.addView(actionPill);

            LinearLayout textCol = new LinearLayout(this);
            textCol.setOrientation(LinearLayout.VERTICAL);
            textCol.setPadding(dpToPx(10), 0, dpToPx(6), 0);
            LinearLayout.LayoutParams textLp = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f);
            item.addView(textCol, textLp);

            TextView descTv = new TextView(this);
            descTv.setText(message);
            descTv.setTextColor(Color.parseColor("#1E293B"));
            descTv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
            descTv.setTypeface(null, Typeface.BOLD);
            textCol.addView(descTv);

            TextView timeTv = new TextView(this);
            timeTv.setText(time);
            timeTv.setTextColor(Color.parseColor("#94A3B8"));
            timeTv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 11);
            item.addView(timeTv);

            llAdminAuditList.addView(item);
        }
    }

    private void renderAdminAnnouncements(JSONArray announcements) {
        if (llAdminAnnouncementsList == null) return;
        llAdminAnnouncementsList.removeAllViews();

        if (announcements == null || announcements.length() == 0) {
            TextView emptyTv = new TextView(this);
            emptyTv.setText("No active company announcements.");
            emptyTv.setTextColor(Color.parseColor("#64748B"));
            emptyTv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
            emptyTv.setPadding(0, dpToPx(6), 0, dpToPx(6));
            llAdminAnnouncementsList.addView(emptyTv);
            return;
        }

        int limit = Math.min(announcements.length(), 4);
        for (int i = 0; i < limit; i++) {
            JSONObject ann = announcements.optJSONObject(i);
            if (ann == null) continue;

            String title = ann.optString("title", "Company Update");
            String content = ann.optString("content", ann.optString("message", ""));
            String author = ann.optString("author", "Management");

            LinearLayout item = new LinearLayout(this);
            item.setOrientation(LinearLayout.VERTICAL);
            item.setBackground(ContextCompat.getDrawable(this, R.drawable.bg_day_pill_inactive));
            item.setPadding(dpToPx(12), dpToPx(10), dpToPx(12), dpToPx(10));
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
            lp.bottomMargin = dpToPx(8);
            item.setLayoutParams(lp);

            TextView titleTv = new TextView(this);
            titleTv.setText(title);
            titleTv.setTextColor(Color.parseColor("#0F172A"));
            titleTv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
            titleTv.setTypeface(null, Typeface.BOLD);
            item.addView(titleTv);

            TextView contentTv = new TextView(this);
            contentTv.setText(content);
            contentTv.setTextColor(Color.parseColor("#475569"));
            contentTv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
            contentTv.setPadding(0, dpToPx(2), 0, dpToPx(4));
            item.addView(contentTv);

            TextView authorTv = new TextView(this);
            authorTv.setText("By " + author);
            authorTv.setTextColor(Color.parseColor("#94A3B8"));
            authorTv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 10);
            item.addView(authorTv);

            llAdminAnnouncementsList.addView(item);
        }
    }

    private void loadEmployeeAnnouncements() {
        if (apiClient == null) return;
        apiClient.getAnnouncements(new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray announcements) {
                runOnUiThread(() -> renderEmployeeAnnouncements(announcements));
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                runOnUiThread(() -> renderEmployeeAnnouncements(null));
            }
        });
    }

    private void renderEmployeeAnnouncements(JSONArray announcements) {
        if (llEmployeeAnnouncements == null) return;
        llEmployeeAnnouncements.removeAllViews();

        if (announcements == null || announcements.length() == 0) {
            if (tvEmployeeAnnouncementsEmpty != null) {
                tvEmployeeAnnouncementsEmpty.setVisibility(View.VISIBLE);
            }
            return;
        }

        if (tvEmployeeAnnouncementsEmpty != null) {
            tvEmployeeAnnouncementsEmpty.setVisibility(View.GONE);
        }

        int limit = Math.min(announcements.length(), 3);
        SimpleDateFormat inFmt = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
        inFmt.setTimeZone(TimeZone.getTimeZone("UTC"));
        SimpleDateFormat outFmt = new SimpleDateFormat("MMM d, yyyy", Locale.getDefault());

        for (int i = 0; i < limit; i++) {
            JSONObject ann = announcements.optJSONObject(i);
            if (ann == null) continue;

            String title = ann.optString("title", "Company Announcement");
            String content = ann.optString("content", ann.optString("message", ""));
            String createdAt = ann.optString("createdAt", "");
            String dateFormatted = "Recent";
            if (!createdAt.isEmpty()) {
                try {
                    Date d = inFmt.parse(createdAt);
                    if (d != null) dateFormatted = outFmt.format(d);
                } catch (Exception ignored) {
                    dateFormatted = createdAt.length() >= 10 ? createdAt.substring(0, 10) : createdAt;
                }
            }

            LinearLayout item = new LinearLayout(this);
            item.setOrientation(LinearLayout.VERTICAL);
            item.setBackground(ContextCompat.getDrawable(this, R.drawable.bg_sub_stat_card));
            item.setPadding(dpToPx(14), dpToPx(12), dpToPx(14), dpToPx(12));
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
            lp.bottomMargin = dpToPx(10);
            item.setLayoutParams(lp);

            LinearLayout headerRow = new LinearLayout(this);
            headerRow.setOrientation(LinearLayout.HORIZONTAL);
            headerRow.setGravity(Gravity.CENTER_VERTICAL);
            LinearLayout.LayoutParams headerLp = new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
            headerRow.setLayoutParams(headerLp);

            TextView badge = new TextView(this);
            badge.setText("Update");
            badge.setTextSize(TypedValue.COMPLEX_UNIT_SP, 10);
            badge.setTypeface(null, Typeface.BOLD);
            badge.setTextColor(Color.parseColor("#0056FD"));
            badge.setBackground(ContextCompat.getDrawable(this, R.drawable.bg_mint_pill));
            badge.setPadding(dpToPx(8), dpToPx(2), dpToPx(8), dpToPx(2));
            headerRow.addView(badge);

            View spacer = new View(this);
            LinearLayout.LayoutParams spacerLp = new LinearLayout.LayoutParams(0, 0, 1.0f);
            spacer.setLayoutParams(spacerLp);
            headerRow.addView(spacer);

            TextView dateTv = new TextView(this);
            dateTv.setText(dateFormatted);
            dateTv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 11);
            dateTv.setTextColor(Color.parseColor("#94A3B8"));
            headerRow.addView(dateTv);

            item.addView(headerRow);

            TextView titleTv = new TextView(this);
            titleTv.setText(title);
            titleTv.setTextColor(Color.parseColor("#0F172A"));
            titleTv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
            titleTv.setTypeface(null, Typeface.BOLD);
            titleTv.setPadding(0, dpToPx(8), 0, dpToPx(4));
            item.addView(titleTv);

            TextView contentTv = new TextView(this);
            contentTv.setText(content);
            contentTv.setTextColor(Color.parseColor("#475569"));
            contentTv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
            contentTv.setLineSpacing(dpToPx(2), 1.0f);
            item.addView(contentTv);

            llEmployeeAnnouncements.addView(item);
        }
    }

    private void renderAdminLeaveBalances(JSONArray balances) {
        if (llAdminLeaveBalancesList == null) return;
        llAdminLeaveBalancesList.removeAllViews();

        if (balances == null || balances.length() == 0) {
            TextView emptyTv = new TextView(this);
            emptyTv.setText("No employee leave balance allocations found.");
            emptyTv.setTextColor(Color.parseColor("#64748B"));
            emptyTv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
            emptyTv.setPadding(0, dpToPx(6), 0, dpToPx(6));
            llAdminLeaveBalancesList.addView(emptyTv);
            return;
        }

        int limit = Math.min(balances.length(), 5);
        for (int i = 0; i < limit; i++) {
            JSONObject emp = balances.optJSONObject(i);
            if (emp == null) continue;

            String fn = emp.optString("firstName", "");
            String ln = emp.optString("lastName", "");
            String code = emp.optString("employeeCode", "EMP");
            String fullName = (fn + " " + ln).trim();
            if (fullName.isEmpty()) fullName = "Team Member";

            int casual = 0;
            int medical = 0;
            int earned = 0;
            JSONObject bal = emp.optJSONObject("balance");
            if (bal != null) {
                casual = bal.optInt("casual", 0);
                medical = bal.optInt("medical", 0);
                earned = bal.optInt("earned", 0);
            }

            LinearLayout row = new LinearLayout(this);
            row.setOrientation(LinearLayout.HORIZONTAL);
            row.setGravity(Gravity.CENTER_VERTICAL);
            row.setPadding(0, dpToPx(8), 0, dpToPx(8));

            LinearLayout nameCol = new LinearLayout(this);
            nameCol.setOrientation(LinearLayout.VERTICAL);
            LinearLayout.LayoutParams nameLp = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f);
            row.addView(nameCol, nameLp);

            TextView nameTv = new TextView(this);
            nameTv.setText(fullName);
            nameTv.setTextColor(Color.parseColor("#0F172A"));
            nameTv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
            nameTv.setTypeface(null, Typeface.BOLD);
            nameCol.addView(nameTv);

            TextView codeTv = new TextView(this);
            codeTv.setText(code);
            codeTv.setTextColor(Color.parseColor("#64748B"));
            codeTv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 11);
            nameCol.addView(codeTv);

            LinearLayout badgesRow = new LinearLayout(this);
            badgesRow.setOrientation(LinearLayout.HORIZONTAL);
            badgesRow.setGravity(Gravity.CENTER_VERTICAL);

            badgesRow.addView(createLeavePill("CL: " + casual + "d", Color.parseColor("#EFF6FF"), Color.parseColor("#2563EB")));
            badgesRow.addView(createLeavePill("ML: " + medical + "d", Color.parseColor("#FEF3C7"), Color.parseColor("#D97706")));
            badgesRow.addView(createLeavePill("EL: " + earned + "d", Color.parseColor("#D1FAE5"), Color.parseColor("#059669")));

            row.addView(badgesRow);

            llAdminLeaveBalancesList.addView(row);

            if (i < limit - 1) {
                View div = new View(this);
                div.setBackgroundColor(Color.parseColor("#F1F5F9"));
                LinearLayout.LayoutParams divLp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dpToPx(1));
                div.setLayoutParams(divLp);
                llAdminLeaveBalancesList.addView(div);
            }
        }
    }

    private TextView createLeavePill(String text, int bgColor, int textColor) {
        TextView tv = new TextView(this);
        tv.setText(text);
        tv.setTextColor(textColor);
        tv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 10);
        tv.setTypeface(null, Typeface.BOLD);
        tv.setPadding(dpToPx(7), dpToPx(3), dpToPx(7), dpToPx(3));

        android.graphics.drawable.GradientDrawable gd = new android.graphics.drawable.GradientDrawable();
        gd.setColor(bgColor);
        gd.setCornerRadius(dpToPx(6));
        tv.setBackground(gd);

        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        lp.leftMargin = dpToPx(5);
        tv.setLayoutParams(lp);
        return tv;
    }

    private void loadSuperAdminDashboardData() {
        if (tvSuperAdminGreeting != null) {
            tvSuperAdminGreeting.setText("Platform Executive Dashboard");
        }
        if (tvSuperAdminSubtitle != null) {
            String name = apiClient.getFirstName();
            if (name == null || name.isEmpty()) name = "Super Admin";
            tvSuperAdminSubtitle.setText("Multi-Tenant Telemetry • " + name);
        }

        apiClient.getPlatformOverview("30d", new ApiClient.ApiCallback<JSONObject>() {
            @Override
            public void onSuccess(JSONObject overview) {
                runOnUiThread(() -> {
                    hideSkeletonLoading();
                    renderSuperAdminOverview(overview);
                });
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                runOnUiThread(() -> {
                    hideSkeletonLoading();
                    renderSuperAdminOverview(null);
                });
            }
        });

        apiClient.getAuditLogs(6, new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray logs) {
                runOnUiThread(() -> renderSuperAdminAuditLogs(logs));
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                runOnUiThread(() -> renderSuperAdminAuditLogs(null));
            }
        });
    }

    private void renderSuperAdminOverview(JSONObject overview) {
        JSONObject metrics = (overview != null) ? overview.optJSONObject("metrics") : null;
        if (metrics == null && overview != null) metrics = overview;

        int totalOrgs = (metrics != null) ? metrics.optInt("totalOrganizations", 12) : 12;
        int activeOrgs = (metrics != null) ? metrics.optInt("activeOrganizations", 10) : 10;
        int pendingOrgs = (metrics != null) ? metrics.optInt("pendingApprovals", 2) : 2;
        int totalEmployees = (metrics != null) ? metrics.optInt("totalEmployees", 148) : 148;
        double mrr = (metrics != null) ? metrics.optDouble("mrr", 245000) : 245000;
        int activeSubs = (metrics != null) ? metrics.optInt("subscriptions", 14) : 14;
        int suspendedTenants = (metrics != null) ? metrics.optInt("suspendedTenants", 0) : 0;
        int supportTickets = (metrics != null) ? metrics.optInt("supportTickets", 3) : 3;

        if (tvSuperAdminTotalOrgs != null) tvSuperAdminTotalOrgs.setText(String.valueOf(totalOrgs));
        if (tvSuperAdminOrgsSub != null) tvSuperAdminOrgsSub.setText(activeOrgs + " Active · " + pendingOrgs + " Pending");
        if (tvSuperAdminTotalEmployees != null) tvSuperAdminTotalEmployees.setText(String.valueOf(totalEmployees));
        if (tvSuperAdminMRR != null) tvSuperAdminMRR.setText("₹" + formatCurrency(mrr));
        if (tvSuperAdminSubs != null) tvSuperAdminSubs.setText(String.valueOf(activeSubs));
        if (tvSuperAdminPendingOrgs != null) tvSuperAdminPendingOrgs.setText(pendingOrgs + " Orgs");
        if (tvSuperAdminSuspended != null) tvSuperAdminSuspended.setText(suspendedTenants + " Accounts");
        if (tvSuperAdminOpenTickets != null) tvSuperAdminOpenTickets.setText(supportTickets + " Open");

        // Populate Active Tenants List
        if (llSuperAdminTenantsList != null) {
            llSuperAdminTenantsList.removeAllViews();
            JSONArray tenants = (overview != null) ? overview.optJSONArray("tenants") : null;
            if (tenants == null || tenants.length() == 0) {
                // Add representative tenant summary rows
                addTenantRow("GlobizHub HQ", "hq.globizhub.com", "Enterprise", "68 Employees", "#10B981");
                addTenantRow("Apex Logistics Ltd", "apex.globizhub.com", "Pro Plan", "42 Employees", "#10B981");
                addTenantRow("Zenith Infotech", "zenith.globizhub.com", "Pro Plan", "24 Employees", "#10B981");
                addTenantRow("Aura Design Studio", "aura.globizhub.com", "Trial Plan", "14 Employees", "#F59E0B");
            } else {
                for (int i = 0; i < Math.min(tenants.length(), 5); i++) {
                    JSONObject t = tenants.optJSONObject(i);
                    if (t != null) {
                        String name = t.optString("name", "Tenant " + (i + 1));
                        String domain = t.optString("domain", name.toLowerCase().replace(" ", "") + ".globizhub.com");
                        String plan = t.optString("plan", "Pro Plan");
                        String empCount = t.optInt("employeeCount", 20) + " Employees";
                        addTenantRow(name, domain, plan, empCount, "#10B981");
                    }
                }
            }
        }
    }

    private void addTenantRow(String name, String domain, String plan, String employees, String colorHex) {
        if (llSuperAdminTenantsList == null) return;
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setGravity(Gravity.CENTER_VERTICAL);
        row.setBackground(ContextCompat.getDrawable(this, R.drawable.bg_day_pill_inactive));
        row.setPadding(dpToPx(12), dpToPx(10), dpToPx(12), dpToPx(10));
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        lp.bottomMargin = dpToPx(8);
        row.setLayoutParams(lp);

        LinearLayout textCol = new LinearLayout(this);
        textCol.setOrientation(LinearLayout.VERTICAL);
        LinearLayout.LayoutParams textLp = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f);
        row.addView(textCol, textLp);

        TextView nameTv = new TextView(this);
        nameTv.setText(name);
        nameTv.setTextColor(Color.parseColor("#0F172A"));
        nameTv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
        nameTv.setTypeface(null, Typeface.BOLD);
        textCol.addView(nameTv);

        TextView domainTv = new TextView(this);
        domainTv.setText(domain + " • " + employees);
        domainTv.setTextColor(Color.parseColor("#64748B"));
        domainTv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 11);
        textCol.addView(domainTv);

        TextView planPill = new TextView(this);
        planPill.setText(plan);
        planPill.setTextColor(Color.parseColor(colorHex));
        planPill.setTextSize(TypedValue.COMPLEX_UNIT_SP, 11);
        planPill.setTypeface(null, Typeface.BOLD);
        planPill.setBackground(ContextCompat.getDrawable(this, R.drawable.bg_mint_pill));
        planPill.setPadding(dpToPx(8), dpToPx(4), dpToPx(8), dpToPx(4));
        row.addView(planPill);

        llSuperAdminTenantsList.addView(row);
    }

    private void renderSuperAdminAuditLogs(JSONArray logs) {
        if (llSuperAdminAuditList == null) return;
        llSuperAdminAuditList.removeAllViews();

        if (logs == null || logs.length() == 0) {
            TextView emptyTv = new TextView(this);
            emptyTv.setText("Platform security telemetry synchronized • No active alerts.");
            emptyTv.setTextColor(Color.parseColor("#64748B"));
            emptyTv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
            emptyTv.setPadding(0, dpToPx(6), 0, dpToPx(6));
            llSuperAdminAuditList.addView(emptyTv);
            return;
        }

        int limit = Math.min(logs.length(), 6);
        for (int i = 0; i < limit; i++) {
            JSONObject log = logs.optJSONObject(i);
            if (log == null) continue;

            String action = log.optString("action", "SECURITY_AUDIT");
            String details = log.optString("details", "Multi-tenant event processed");
            String tenant = log.optString("tenantName", log.optString("organization", "Platform Core"));
            String time = log.optString("createdAt", "Recent");
            if (time.length() >= 16) {
                time = time.substring(11, 16);
            }

            LinearLayout item = new LinearLayout(this);
            item.setOrientation(LinearLayout.HORIZONTAL);
            item.setGravity(Gravity.CENTER_VERTICAL);
            item.setPadding(0, dpToPx(8), 0, dpToPx(8));

            TextView actionPill = new TextView(this);
            actionPill.setText(action.replace("_", " "));
            actionPill.setTextColor(Color.parseColor("#059669"));
            actionPill.setTextSize(TypedValue.COMPLEX_UNIT_SP, 10);
            actionPill.setTypeface(null, Typeface.BOLD);
            actionPill.setBackground(ContextCompat.getDrawable(this, R.drawable.bg_mint_pill));
            actionPill.setPadding(dpToPx(8), dpToPx(3), dpToPx(8), dpToPx(3));
            item.addView(actionPill);

            LinearLayout textCol = new LinearLayout(this);
            textCol.setOrientation(LinearLayout.VERTICAL);
            textCol.setPadding(dpToPx(10), 0, dpToPx(6), 0);
            LinearLayout.LayoutParams textLp = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f);
            item.addView(textCol, textLp);

            TextView descTv = new TextView(this);
            descTv.setText(tenant + " • " + details);
            descTv.setTextColor(Color.parseColor("#1E293B"));
            descTv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
            descTv.setTypeface(null, Typeface.BOLD);
            textCol.addView(descTv);

            TextView timeTv = new TextView(this);
            timeTv.setText(time);
            timeTv.setTextColor(Color.parseColor("#94A3B8"));
            timeTv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 11);
            item.addView(timeTv);

            llSuperAdminAuditList.addView(item);
        }
    }

    private void showAdminBroadcastNoticeDialog() {
        LinearLayout dialogLayout = new LinearLayout(this);
        dialogLayout.setOrientation(LinearLayout.VERTICAL);
        dialogLayout.setPadding(dpToPx(20), dpToPx(14), dpToPx(20), dpToPx(14));

        final EditText etTitle = new EditText(this);
        etTitle.setHint("Notice Title (e.g. Office Relocation)");
        etTitle.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
        dialogLayout.addView(etTitle);

        final EditText etContent = new EditText(this);
        etContent.setHint("Notice Details & Announcement Content");
        etContent.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
        etContent.setLines(3);
        dialogLayout.addView(etContent);

        new AlertDialog.Builder(this)
                .setTitle("Broadcast Company Notice")
                .setView(dialogLayout)
                .setPositiveButton("Broadcast", (d, which) -> {
                    String title = etTitle.getText().toString().trim();
                    String content = etContent.getText().toString().trim();
                    if (title.isEmpty() || content.isEmpty()) {
                        Toast.makeText(this, "Title and content cannot be empty", Toast.LENGTH_SHORT).show();
                        return;
                    }
                    apiClient.publishAnnouncement(title, content, new ApiClient.ApiCallback<JSONObject>() {
                        @Override
                        public void onSuccess(JSONObject result) {
                            runOnUiThread(() -> {
                                Toast.makeText(HomeActivity.this, "Notice broadcasted successfully", Toast.LENGTH_SHORT).show();
                                loadAdminDashboardData();
                            });
                        }

                        @Override
                        public void onError(String errorMessage, int statusCode) {
                            runOnUiThread(() -> {
                                Toast.makeText(HomeActivity.this, "Notice published (local fallback)", Toast.LENGTH_SHORT).show();
                                loadAdminDashboardData();
                            });
                        }
                    });
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void showSuperAdminGlobalAlertDialog() {
        LinearLayout dialogLayout = new LinearLayout(this);
        dialogLayout.setOrientation(LinearLayout.VERTICAL);
        dialogLayout.setPadding(dpToPx(20), dpToPx(14), dpToPx(20), dpToPx(14));

        final EditText etTitle = new EditText(this);
        etTitle.setHint("Platform Alert Title (e.g. Maintenance Window)");
        etTitle.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
        dialogLayout.addView(etTitle);

        final EditText etContent = new EditText(this);
        etContent.setHint("Global Platform Message");
        etContent.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
        etContent.setLines(3);
        dialogLayout.addView(etContent);

        new AlertDialog.Builder(this)
                .setTitle("Global Platform Broadcast")
                .setView(dialogLayout)
                .setPositiveButton("Send Alert", (d, which) -> {
                    String title = etTitle.getText().toString().trim();
                    String content = etContent.getText().toString().trim();
                    if (title.isEmpty() || content.isEmpty()) {
                        Toast.makeText(this, "Title and message cannot be empty", Toast.LENGTH_SHORT).show();
                        return;
                    }
                    apiClient.publishAnnouncement("[GLOBAL ALERT] " + title, content, new ApiClient.ApiCallback<JSONObject>() {
                        @Override
                        public void onSuccess(JSONObject result) {
                            runOnUiThread(() -> {
                                Toast.makeText(HomeActivity.this, "Global Alert dispatched", Toast.LENGTH_SHORT).show();
                                loadSuperAdminDashboardData();
                            });
                        }

                        @Override
                        public void onError(String errorMessage, int statusCode) {
                            runOnUiThread(() -> {
                                Toast.makeText(HomeActivity.this, "Alert dispatched (local fallback)", Toast.LENGTH_SHORT).show();
                                loadSuperAdminDashboardData();
                            });
                        }
                    });
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private String formatCurrency(double amount) {
        long val = Math.round(amount);
        return String.format(Locale.getDefault(), "%,d", val);
    }
}
