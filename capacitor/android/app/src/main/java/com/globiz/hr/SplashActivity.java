package com.globiz.hr;

import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.view.animation.DecelerateInterpolator;
import androidx.appcompat.app.AppCompatActivity;

import com.globiz.hr.network.ApiClient;

public class SplashActivity extends AppCompatActivity {

    private static final int SPLASH_DURATION_MS = 2500; // 2.5 seconds duration (clean plain white splash)

    private View layoutSplashCenter;
    private boolean isNavigated = false;
    private Handler handler;
    private Runnable navRunnable;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Light status bar with dark icons on white background
        Window window = getWindow();
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(Color.WHITE);
        window.setNavigationBarColor(Color.WHITE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            window.getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR |
                    (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O ? View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR : 0)
            );
        }

        setContentView(R.layout.activity_splash);

        layoutSplashCenter = findViewById(R.id.layoutSplashCenter);
        View rootSplash = findViewById(R.id.rootSplash);

        // Tap anywhere to skip immediately
        if (rootSplash != null) {
            rootSplash.setOnClickListener(v -> navigateToNext());
        }

        // Smooth subtle entrance animation for center branding
        if (layoutSplashCenter != null) {
            layoutSplashCenter.setAlpha(0f);
            layoutSplashCenter.setScaleX(0.90f);
            layoutSplashCenter.setScaleY(0.90f);
            layoutSplashCenter.animate()
                    .alpha(1f)
                    .scaleX(1f)
                    .scaleY(1f)
                    .setDuration(700)
                    .setInterpolator(new DecelerateInterpolator())
                    .start();
        }

        handler = new Handler(Looper.getMainLooper());
        navRunnable = this::navigateToNext;
        handler.postDelayed(navRunnable, SPLASH_DURATION_MS);
    }

    // MARK: - Navigation
    private synchronized void navigateToNext() {
        if (isNavigated || isFinishing() || isDestroyed()) {
            return;
        }
        isNavigated = true;

        if (handler != null && navRunnable != null) {
            handler.removeCallbacks(navRunnable);
        }

        Intent intent;
        if (ApiClient.getInstance(SplashActivity.this).isLoggedIn()) {
            intent = new Intent(SplashActivity.this, HomeActivity.class);
        } else {
            // First-time install / unauthenticated user starts directly with the Sign In (Auth) screen
            intent = new Intent(SplashActivity.this, SignInActivity.class);
        }
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);

        startActivity(intent);
        overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
        finish();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (handler != null && navRunnable != null) {
            handler.removeCallbacks(navRunnable);
        }
    }
}
