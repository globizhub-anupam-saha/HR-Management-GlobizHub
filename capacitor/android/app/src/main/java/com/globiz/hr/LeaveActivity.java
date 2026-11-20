package com.globiz.hr;

import android.app.AlertDialog;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

public class LeaveActivity extends AppCompatActivity {

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_leave);

        // Unified GlobizHR Header
        AppHeaderHelper.setupHeader(this, "Leaves", false);

        setupBottomNav();
        setupListeners();
        NavBarScrollHelper.attachToScrollView(findViewById(R.id.scrollView), findViewById(R.id.bottomNavBar));
    }

    @Override
    protected void onResume() {
        super.onResume();
        BottomNavHelper.setupBottomNav(this, "leave");
        AppHeaderHelper.refreshHeaderState(this);
    }

    private void setupListeners() {
        View btnApplyLeave = findViewById(R.id.btnApplyLeave);
        if (btnApplyLeave != null) {
            btnApplyLeave.setOnClickListener(v -> showApplyLeaveDialog());
        }
    }

    private void showApplyLeaveDialog() {
        String[] leaveTypes = {"Casual Leave (10 days left)", "Sick Leave (6 days left)", "Earned Leave (15 days left)"};
        new AlertDialog.Builder(this)
                .setTitle("Apply for Leave")
                .setItems(leaveTypes, (dialog, which) -> {
                    Toast.makeText(this, "Leave application submitted successfully for review.", Toast.LENGTH_LONG).show();
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void setupBottomNav() {
        BottomNavHelper.setupBottomNav(this, "leave");
    }
}
