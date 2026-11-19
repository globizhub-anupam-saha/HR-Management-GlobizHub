package com.globiz.hr;

import android.view.View;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.widget.ScrollView;
import androidx.recyclerview.widget.RecyclerView;

/**
 * Attaches smooth slide-to-hide (on scroll down) and slide-to-reveal (on scroll up)
 * behavior to the unified bottom navigation bar across all main modules.
 */
public class NavBarScrollHelper {

    public static void attachToScrollView(ScrollView scrollView, final View bottomNav) {
        if (scrollView == null || bottomNav == null) return;

        final boolean[] isHidden = {false};
        scrollView.setOnScrollChangeListener((v, scrollX, scrollY, oldScrollX, oldScrollY) -> {
            int dy = scrollY - oldScrollY;
            if (dy > 12 && !isHidden[0]) {
                isHidden[0] = true;
                int targetY = bottomNav.getHeight() > 0 ? bottomNav.getHeight() + 30 : 240;
                bottomNav.animate()
                        .translationY(targetY)
                        .setDuration(260)
                        .setInterpolator(new AccelerateDecelerateInterpolator())
                        .start();
            } else if (dy < -12 && isHidden[0]) {
                isHidden[0] = false;
                bottomNav.animate()
                        .translationY(0)
                        .setDuration(260)
                        .setInterpolator(new AccelerateDecelerateInterpolator())
                        .start();
            }
        });
    }

    public static void attachToRecyclerView(RecyclerView recyclerView, final View bottomNav) {
        if (recyclerView == null || bottomNav == null) return;

        final boolean[] isHidden = {false};
        recyclerView.addOnScrollListener(new RecyclerView.OnScrollListener() {
            @Override
            public void onScrolled(RecyclerView rv, int dx, int dy) {
                super.onScrolled(rv, dx, dy);
                if (dy > 12 && !isHidden[0]) {
                    isHidden[0] = true;
                    int targetY = bottomNav.getHeight() > 0 ? bottomNav.getHeight() + 30 : 240;
                    bottomNav.animate()
                            .translationY(targetY)
                            .setDuration(260)
                            .setInterpolator(new AccelerateDecelerateInterpolator())
                            .start();
                } else if (dy < -12 && isHidden[0]) {
                    isHidden[0] = false;
                    bottomNav.animate()
                            .translationY(0)
                            .setDuration(260)
                            .setInterpolator(new AccelerateDecelerateInterpolator())
                            .start();
                }
            }
        });
    }
}
