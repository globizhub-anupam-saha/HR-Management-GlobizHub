package com.teamhub.hrms;

import android.app.AlertDialog;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.teamhub.hrms.network.ApiClient;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class ShiftsActivity extends AppCompatActivity {

    private ProgressBar progressBar;
    private RecyclerView rvShifts;
    private View layoutEmptyState;
    private ShiftsAdapter adapter;
    private final List<JSONObject> shiftsList = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_shifts);

        AppHeaderHelper.setupHeader(this, "Shifts & Schedules", true);
        TabletHelper.applyTabletConstraint(findViewById(R.id.topBarContent));
        TabletHelper.applyTabletConstraint(findViewById(R.id.shiftsContentContainer));

        initViews();
        setupRecyclerView();
        loadShifts(true);
    }

    @Override
    protected void onResume() {
        super.onResume();
        AppHeaderHelper.refreshHeaderState(this);
    }

    private void initViews() {
        progressBar = findViewById(R.id.progressBar);
        rvShifts = findViewById(R.id.rvShifts);
        layoutEmptyState = findViewById(R.id.layoutEmptyState);
    }

    private void setupRecyclerView() {
        rvShifts.setLayoutManager(new LinearLayoutManager(this));
        adapter = new ShiftsAdapter(shiftsList, this::showShiftDetails);
        rvShifts.setAdapter(adapter);
    }

    private void loadShifts(boolean showProgress) {
        if (showProgress) {
            progressBar.setVisibility(View.VISIBLE);
            layoutEmptyState.setVisibility(View.GONE);
            rvShifts.setVisibility(View.GONE);
        }

        ApiClient.getInstance(this).getCompanyShifts(new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray result) {
                runOnUiThread(() -> {
                    progressBar.setVisibility(View.GONE);
                    shiftsList.clear();

                    if (result != null && result.length() > 0) {
                        for (int i = 0; i < result.length(); i++) {
                            JSONObject obj = result.optJSONObject(i);
                            if (obj != null) shiftsList.add(obj);
                        }
                    }

                    if (shiftsList.isEmpty()) {
                        rvShifts.setVisibility(View.GONE);
                        layoutEmptyState.setVisibility(View.VISIBLE);
                    } else {
                        layoutEmptyState.setVisibility(View.GONE);
                        rvShifts.setVisibility(View.VISIBLE);
                        adapter.notifyDataSetChanged();
                    }
                });
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                runOnUiThread(() -> {
                    progressBar.setVisibility(View.GONE);
                    if (shiftsList.isEmpty()) {
                        layoutEmptyState.setVisibility(View.VISIBLE);
                        rvShifts.setVisibility(View.GONE);
                    }
                });
            }
        });
    }

    private void showShiftDetails(JSONObject shift) {
        String name = shift.optString("name", "General");
        String start = shift.optString("startTime", "09:00");
        String end = shift.optString("endTime", "18:00");
        boolean isNight = shift.optBoolean("isNightShift", false);

        String msg = "Shift Name: " + name + "\n" +
                "Work Hours: " + start + " - " + end + "\n" +
                "Shift Type: " + (isNight ? "Night Shift" : "Day Shift") + "\n" +
                "Assigned Designation: " + ApiClient.getInstance(this).getDesignation() + "\n\n" +
                "Rules:\n- Minimum 8 hours for full-day attendance.\n- 15 minutes grace period on clock in.";

        new AlertDialog.Builder(this)
                .setTitle(name + " Shift")
                .setMessage(msg)
                .setPositiveButton("Request Shift Swap", (dialog, which) -> {
                    Toast.makeText(this, "Shift swap request sent to Manager.", Toast.LENGTH_SHORT).show();
                })
                .setNegativeButton("Close", null)
                .show();
    }

    private static class ShiftsAdapter extends RecyclerView.Adapter<ShiftsAdapter.ViewHolder> {
        private final List<JSONObject> items;
        private final OnShiftClickListener listener;

        interface OnShiftClickListener {
            void onClick(JSONObject item);
        }

        ShiftsAdapter(List<JSONObject> items, OnShiftClickListener listener) {
            this.items = items;
            this.listener = listener;
        }

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_shift, parent, false);
            return new ViewHolder(v);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            JSONObject item = items.get(position);
            String name = item.optString("name", "General");
            String start = item.optString("startTime", "09:00");
            String end = item.optString("endTime", "18:00");
            boolean isNight = item.optBoolean("isNightShift", false);

            holder.tvName.setText(name);
            holder.tvTiming.setText(start + " - " + end + (isNight ? " (Night)" : " (Day)"));
            holder.tvBadge.setText(isNight ? "NIGHT" : "ACTIVE");

            holder.itemView.setOnClickListener(v -> {
                if (listener != null) listener.onClick(item);
            });
        }

        @Override
        public int getItemCount() {
            return items.size();
        }

        static class ViewHolder extends RecyclerView.ViewHolder {
            TextView tvName, tvTiming, tvBadge;

            ViewHolder(@NonNull View v) {
                super(v);
                tvName = v.findViewById(R.id.tvShiftName);
                tvTiming = v.findViewById(R.id.tvShiftTiming);
                tvBadge = v.findViewById(R.id.tvShiftBadge);
            }
        }
    }
}
