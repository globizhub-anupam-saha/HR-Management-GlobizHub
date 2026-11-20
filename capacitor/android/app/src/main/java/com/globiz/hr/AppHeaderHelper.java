package com.globiz.hr;

import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.globiz.hr.network.ApiClient;

import java.util.Locale;

public class AppHeaderHelper {

    /**
     * Configures the unified GlobizHR header on any activity.
     *
     * @param activity      The host activity
     * @param screenTitle   The name of the module/screen (e.g., "Dashboard", "Attendance", "More", etc.)
     * @param isBackVisible Whether the back arrow should be visible
     */
    public static void setupHeader(
            AppCompatActivity activity,
            String screenTitle,
            boolean isBackVisible
    ) {
        setupHeader(activity, screenTitle, isBackVisible, null);
    }

    /**
     * Configures the unified GlobizHR header with an optional custom back listener.
     */
    public static void setupHeader(
            AppCompatActivity activity,
            String screenTitle,
            boolean isBackVisible,
            View.OnClickListener customBackListener
    ) {
        if (activity == null) return;

        // 1. Standardize Status Bar: White background with crisp dark icons (Android 6.0+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            activity.getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
            activity.getWindow().setStatusBarColor(Color.WHITE);
        }

        // 2. Tablet responsiveness constraint
        View topBarContent = activity.findViewById(R.id.topBarContent);
        if (topBarContent != null) {
            TabletHelper.applyTabletConstraint(topBarContent);
        }

        // 3. Brand & Page Title
        TextView tvBrand = activity.findViewById(R.id.tvHeaderBrand);
        if (tvBrand != null) {
            tvBrand.setText("GLOBIZHR");
        }

        TextView tvTitle = activity.findViewById(R.id.tvHeaderTitle);
        if (tvTitle == null) tvTitle = activity.findViewById(R.id.tvHomeTitle);
        if (tvTitle == null) tvTitle = activity.findViewById(R.id.tvAttendanceTitle);
        if (tvTitle == null) tvTitle = activity.findViewById(R.id.tvMoreTitle);
        if (tvTitle == null) tvTitle = activity.findViewById(R.id.tvSettingsTitle);
        if (tvTitle == null) tvTitle = activity.findViewById(R.id.tvNotificationsTitle);
        if (tvTitle == null) tvTitle = activity.findViewById(R.id.tvCustomizeTitle);
        if (tvTitle == null) tvTitle = activity.findViewById(R.id.tvDeleteAccountTitle);

        if (tvTitle != null && screenTitle != null) {
            tvTitle.setText(screenTitle);
        }

        // 4. Back Arrow Navigation
        View btnBack = activity.findViewById(R.id.btnHeaderBack);
        if (btnBack == null) btnBack = activity.findViewById(R.id.btnCustomizeBack);
        if (btnBack == null) btnBack = activity.findViewById(R.id.btnNotificationsBack);
        if (btnBack == null) btnBack = activity.findViewById(R.id.btnBack);
        if (btnBack == null) btnBack = activity.findViewById(R.id.btnDeleteAccountBack);

        if (btnBack != null) {
            if (isBackVisible) {
                btnBack.setVisibility(View.VISIBLE);
                btnBack.setOnClickListener(customBackListener != null ? customBackListener : v -> activity.finish());
            } else {
                btnBack.setVisibility(View.GONE);
            }
        }

        // 5. Notifications Bell & Real-time Red Dot
        View btnNotifications = activity.findViewById(R.id.btnNotifications);
        View viewNotificationDot = activity.findViewById(R.id.viewNotificationDot);
        ApiClient apiClient = ApiClient.getInstance(activity);

        if (viewNotificationDot != null) {
            boolean hasUnread = apiClient.hasUnreadLocalNotifications();
            viewNotificationDot.setVisibility(hasUnread ? View.VISIBLE : View.GONE);
        }

        if (btnNotifications != null) {
            btnNotifications.setOnClickListener(v -> {
                apiClient.markLocalNotificationsAsRead();
                if (viewNotificationDot != null) {
                    viewNotificationDot.setVisibility(View.GONE);
                }
                if (!(activity instanceof NotificationsActivity)) {
                    Intent intent = new Intent(activity, NotificationsActivity.class);
                    activity.startActivity(intent);
                }
            });
        }

        // 6. User Profile Avatar
        View flAvatarContainer = activity.findViewById(R.id.flAvatarContainer);
        TextView tvAvatarInitials = activity.findViewById(R.id.tvAvatarInitials);

        if (tvAvatarInitials != null) {
            String firstName = apiClient.getFirstName();
            if (firstName != null && !firstName.trim().isEmpty()) {
                tvAvatarInitials.setText(firstName.trim().substring(0, 1).toUpperCase(Locale.ROOT));
            } else {
                tvAvatarInitials.setText("U");
            }
        }

        if (flAvatarContainer != null) {
            flAvatarContainer.setOnClickListener(v -> {
                if (!(activity instanceof SettingsActivity)) {
                    Intent intent = new Intent(activity, SettingsActivity.class);
                    activity.startActivity(intent);
                }
            });
        }

        // 7. Safe Window Insets (Top Status Bar & Bottom Navigation Bar)
        applyWindowInsets(activity);
    }

    /**
     * Applies safe window insets to keep the top bar safely below the status bar/camera notch,
     * and lifts the bottom navigation bar up comfortably above the gesture handle on Android.
     */
    public static void applyWindowInsets(AppCompatActivity activity) {
        if (activity == null) return;

        Window window = activity.getWindow();
        if (window != null) {
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(Color.WHITE);
            window.setNavigationBarColor(Color.WHITE);

            WindowInsetsControllerCompat insetsController = WindowCompat.getInsetsController(window, window.getDecorView());
            if (insetsController != null) {
                insetsController.setAppearanceLightStatusBars(true);
                insetsController.setAppearanceLightNavigationBars(true);
            }
        }

        final int initialStatusHeight = getStatusBarHeight(activity);
        final int initialNavHeight = 0;

        // Apply immediately so there is never a flash of overlapping header during activity transition
        applyInsetsToViews(activity, initialStatusHeight, initialNavHeight);

        // Listen on root content frame to capture real dynamic camera cutouts & gesture bar insets
        View rootView = activity.findViewById(android.R.id.content);
        if (rootView != null) {
            ViewCompat.setOnApplyWindowInsetsListener(rootView, (v, insets) -> {
                Insets statusInsets = insets.getInsets(
                        WindowInsetsCompat.Type.statusBars() | WindowInsetsCompat.Type.displayCutout()
                );
                int topInset = Math.max(statusInsets.top, getStatusBarHeight(activity));

                Insets navInsets = insets.getInsets(WindowInsetsCompat.Type.navigationBars());
                int bottomInset = navInsets.bottom;

                applyInsetsToViews(activity, topInset, bottomInset);
                return insets;
            });
            ViewCompat.requestApplyInsets(rootView);
        }
    }

    private static void applyInsetsToViews(AppCompatActivity activity, int topInset, int bottomInset) {
        if (activity == null) return;

        // 1. Status Bar Inset: Locks topBar to (64dp + topInset).
        // topBarContent has height=64dp and layout_alignParentBottom=true,
        // so the topInset area is pure blank whitespace behind the system status bar/punch hole.
        View topBar = activity.findViewById(R.id.topBar);
        if (topBar == null) topBar = activity.findViewById(R.id.settingsTopBar);
        if (topBar == null) topBar = activity.findViewById(R.id.notificationsTopBar);
        if (topBar == null) topBar = activity.findViewById(R.id.customizeTopBar);
        if (topBar == null) topBar = activity.findViewById(R.id.deleteAccountTopBar);

        if (topBar != null) {
            int originalHeight = dpToPx(activity, 64);
            ViewGroup.LayoutParams lp = topBar.getLayoutParams();
            if (lp != null) {
                lp.height = originalHeight + topInset;
                topBar.setLayoutParams(lp);
            }
        }

        // 2. Navigation Bar Inset: Lifts the bottom navigation bar comfortably up for thumbs & gesture bar
        View bottomNavBar = activity.findViewById(R.id.bottomNavBar);
        final int comfortLift = dpToPx(activity, 16);
        final int baseNavHeight = dpToPx(activity, 60);
        final int totalNavHeight = baseNavHeight + bottomInset + comfortLift;

        if (bottomNavBar != null) {
            bottomNavBar.setPadding(0, dpToPx(activity, 4), 0, bottomInset + comfortLift);
            ViewGroup.LayoutParams bLp = bottomNavBar.getLayoutParams();
            if (bLp != null) {
                bLp.height = totalNavHeight;
                bottomNavBar.setLayoutParams(bLp);
            }

            // Adjust main ScrollView padding bottom so cards scroll above the elevated navbar
            View scrollView = activity.findViewById(R.id.scrollView);
            if (scrollView != null) {
                scrollView.setPadding(
                        scrollView.getPaddingLeft(),
                        scrollView.getPaddingTop(),
                        scrollView.getPaddingRight(),
                        totalNavHeight + dpToPx(activity, 16)
                );
            }
            View rvModules = activity.findViewById(R.id.rvModules);
            if (rvModules != null) {
                rvModules.setPadding(
                        rvModules.getPaddingLeft(),
                        rvModules.getPaddingTop(),
                        rvModules.getPaddingRight(),
                        totalNavHeight + dpToPx(activity, 16)
                );
            }
        } else {
            // For screens without a bottom navigation bar (Settings, Notifications, Customize, etc.),
            // apply navigation bar insets to the scroll/content container so bottom actions stay comfortably reachable
            View contentContainer = activity.findViewById(R.id.settingsContentContainer);
            if (contentContainer == null) contentContainer = activity.findViewById(R.id.lvNotifications);
            if (contentContainer == null) contentContainer = activity.findViewById(R.id.rvCustomizeTabs);
            if (contentContainer == null) contentContainer = activity.findViewById(R.id.btnDoDeleteAccount);

            if (contentContainer != null) {
                contentContainer.setPadding(
                        contentContainer.getPaddingLeft(),
                        contentContainer.getPaddingTop(),
                        contentContainer.getPaddingRight(),
                        bottomInset + dpToPx(activity, 24)
                );
            }
        }
    }

    public static int getStatusBarHeight(Context context) {
        int statusBarHeight = 0;
        int resourceId = context.getResources().getIdentifier("status_bar_height", "dimen", "android");
        if (resourceId > 0) {
            statusBarHeight = context.getResources().getDimensionPixelSize(resourceId);
        }
        // Modern punch-hole / notch displays need at least 38-42dp safe clearance
        int minSafeHeight = dpToPx(context, 40);
        return Math.max(statusBarHeight, minSafeHeight);
    }

    public static int dpToPx(Context context, int dp) {
        float density = context.getResources().getDisplayMetrics().density;
        return Math.round(dp * density);
    }

    /**
     * Refreshes notification badge and user initials dynamically on resume.
     */
    public static void refreshHeaderState(AppCompatActivity activity) {
        if (activity == null) return;

        ApiClient apiClient = ApiClient.getInstance(activity);

        // Update Notification Red Dot
        View viewNotificationDot = activity.findViewById(R.id.viewNotificationDot);
        if (viewNotificationDot != null) {
            boolean hasUnread = apiClient.hasUnreadLocalNotifications();
            viewNotificationDot.setVisibility(hasUnread ? View.VISIBLE : View.GONE);
        }

        // Update Avatar Initial
        TextView tvAvatarInitials = activity.findViewById(R.id.tvAvatarInitials);
        if (tvAvatarInitials != null) {
            String firstName = apiClient.getFirstName();
            if (firstName != null && !firstName.trim().isEmpty()) {
                tvAvatarInitials.setText(firstName.trim().substring(0, 1).toUpperCase(Locale.ROOT));
            } else {
                tvAvatarInitials.setText("U");
            }
        }
    }
}
