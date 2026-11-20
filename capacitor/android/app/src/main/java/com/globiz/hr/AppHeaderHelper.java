package com.globiz.hr;

import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

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

        // 1. Status Bar Inset: Prevents top bar from colliding with notification drawer & camera cutouts
        View topBar = activity.findViewById(R.id.topBar);
        if (topBar == null) topBar = activity.findViewById(R.id.settingsTopBar);
        if (topBar == null) topBar = activity.findViewById(R.id.notificationsTopBar);
        if (topBar == null) topBar = activity.findViewById(R.id.customizeTopBar);
        if (topBar == null) topBar = activity.findViewById(R.id.deleteAccountTopBar);

        if (topBar != null) {
            final View tb = topBar;
            final int initialStatusHeight = getStatusBarHeight(activity);
            final int originalHeight = dpToPx(activity, 64);

            tb.setPadding(tb.getPaddingLeft(), initialStatusHeight, tb.getPaddingRight(), tb.getPaddingBottom());
            ViewGroup.LayoutParams lp = tb.getLayoutParams();
            if (lp != null) {
                lp.height = originalHeight + initialStatusHeight;
                tb.setLayoutParams(lp);
            }

            ViewCompat.setOnApplyWindowInsetsListener(tb, (v, insets) -> {
                Insets statusInsets = insets.getInsets(WindowInsetsCompat.Type.statusBars() | WindowInsetsCompat.Type.displayCutout());
                int topInset = Math.max(statusInsets.top, initialStatusHeight);
                v.setPadding(v.getPaddingLeft(), topInset, v.getPaddingRight(), v.getPaddingBottom());
                ViewGroup.LayoutParams layoutParams = v.getLayoutParams();
                if (layoutParams != null) {
                    layoutParams.height = originalHeight + topInset;
                    v.setLayoutParams(layoutParams);
                }
                return insets;
            });
        }

        // 2. Navigation Bar Inset: Lifts the bottom navigation bar comfortably up for thumbs & gesture bar
        View bottomNavBar = activity.findViewById(R.id.bottomNavBar);
        if (bottomNavBar != null) {
            final View bnb = bottomNavBar;
            final int comfortLift = dpToPx(activity, 12);
            final int baseNavHeight = dpToPx(activity, 64);

            bnb.setPadding(bnb.getPaddingLeft(), 0, bnb.getPaddingRight(), comfortLift);
            ViewGroup.LayoutParams bLp = bnb.getLayoutParams();
            if (bLp != null) {
                bLp.height = baseNavHeight + comfortLift;
                bnb.setLayoutParams(bLp);
            }

            ViewCompat.setOnApplyWindowInsetsListener(bnb, (v, insets) -> {
                Insets navInsets = insets.getInsets(WindowInsetsCompat.Type.navigationBars());
                int bottomPadding = navInsets.bottom + comfortLift;
                v.setPadding(v.getPaddingLeft(), 0, v.getPaddingRight(), bottomPadding);
                ViewGroup.LayoutParams layoutParams = v.getLayoutParams();
                if (layoutParams != null) {
                    layoutParams.height = baseNavHeight + bottomPadding;
                    v.setLayoutParams(layoutParams);
                }
                return insets;
            });
        }
    }

    public static int getStatusBarHeight(Context context) {
        int resourceId = context.getResources().getIdentifier("status_bar_height", "dimen", "android");
        if (resourceId > 0) {
            return context.getResources().getDimensionPixelSize(resourceId);
        }
        return dpToPx(context, 28);
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
