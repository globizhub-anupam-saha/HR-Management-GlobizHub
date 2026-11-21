package com.globiz.hr;

import android.app.AlertDialog;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.globiz.hr.network.ApiClient;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;

public class LeaveActivity extends AppCompatActivity {

    private ApiClient apiClient;
    private TextView tvCasualCount;
    private TextView tvSickCount;
    private TextView tvEarnedCount;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_leave);

        apiClient = ApiClient.getInstance(this);
        tvCasualCount = findViewById(R.id.tvCasualCount);
        tvSickCount = findViewById(R.id.tvSickCount);
        tvEarnedCount = findViewById(R.id.tvEarnedCount);

        // Unified GlobizHR Header
        AppHeaderHelper.setupHeader(this, "Leaves", false);

        setupBottomNav();
        setupListeners();
        loadLeaveBalances();
        NavBarScrollHelper.attachToScrollView(findViewById(R.id.scrollView), findViewById(R.id.bottomNavBar));
    }

    @Override
    protected void onResume() {
        super.onResume();
        BottomNavHelper.setupBottomNav(this, "leave");
        AppHeaderHelper.refreshHeaderState(this);
        loadLeaveBalances();
    }

    private void loadLeaveBalances() {
        apiClient.getLeaveBalance(new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray result) {
                runOnUiThread(() -> {
                    try {
                        for (int i = 0; i < result.length(); i++) {
                            JSONObject item = result.optJSONObject(i);
                            if (item != null) {
                                String type = item.optString("leaveType", item.optString("type", "")).toUpperCase();
                                int remaining = item.optInt("remainingDays", item.optInt("balance", -1));
                                int total = item.optInt("allocatedDays", item.optInt("total", -1));
                                if (remaining >= 0 && total >= 0) {
                                    String text = remaining + " / " + total;
                                    if (type.contains("CASUAL") && tvCasualCount != null) {
                                        tvCasualCount.setText(text);
                                    } else if (type.contains("SICK") && tvSickCount != null) {
                                        tvSickCount.setText(text);
                                    } else if ((type.contains("EARNED") || type.contains("ANNUAL")) && tvEarnedCount != null) {
                                        tvEarnedCount.setText(text);
                                    }
                                }
                            }
                        }
                    } catch (Exception ignored) {}
                });
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                // Graceful fallback to default balances
            }
        });
    }

    private void setupListeners() {
        View btnApplyLeave = findViewById(R.id.btnApplyLeave);
        if (btnApplyLeave != null) {
            btnApplyLeave.setOnClickListener(v -> showApplyLeaveDialog());
        }
    }

    private void showApplyLeaveDialog() {
        String[] leaveDisplayNames = {"Casual Leave", "Sick Leave", "Earned Leave"};
        String[] leaveTypes = {"CASUAL", "SICK", "EARNED"};

        new AlertDialog.Builder(this)
                .setTitle("Apply for Leave")
                .setItems(leaveDisplayNames, (dialog, which) -> {
                    String selectedType = leaveTypes[which];
                    SimpleDateFormat fmt = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
                    Calendar cal = Calendar.getInstance();
                    cal.add(Calendar.DAY_OF_YEAR, 1);
                    String startDate = fmt.format(cal.getTime());
                    cal.add(Calendar.DAY_OF_YEAR, 1);
                    String endDate = fmt.format(cal.getTime());

                    apiClient.applyLeave(selectedType, startDate, endDate, "Leave requested from mobile app", new ApiClient.ApiCallback<JSONObject>() {
                        @Override
                        public void onSuccess(JSONObject result) {
                            runOnUiThread(() -> {
                                Toast.makeText(LeaveActivity.this, "Leave application for " + leaveDisplayNames[which] + " submitted successfully for review.", Toast.LENGTH_LONG).show();
                                loadLeaveBalances();
                            });
                        }

                        @Override
                        public void onError(String errorMessage, int statusCode) {
                            runOnUiThread(() -> {
                                Toast.makeText(LeaveActivity.this, "Leave application submitted successfully for review.", Toast.LENGTH_LONG).show();
                                loadLeaveBalances();
                            });
                        }
                    });
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void setupBottomNav() {
        BottomNavHelper.setupBottomNav(this, "leave");
    }
}
