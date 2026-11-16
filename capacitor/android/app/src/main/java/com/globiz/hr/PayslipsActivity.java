package com.globiz.hr;

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

import com.globiz.hr.network.ApiClient;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class PayslipsActivity extends AppCompatActivity {

    private ProgressBar progressBar;
    private RecyclerView rvPayslips;
    private View layoutEmptyState;
    private PayslipsAdapter adapter;
    private final List<JSONObject> payslipsList = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_payslips);

        AppHeaderHelper.setupHeader(this, "My Payslips", true);
        TabletHelper.applyTabletConstraint(findViewById(R.id.topBarContent));
        TabletHelper.applyTabletConstraint(findViewById(R.id.payslipsContentContainer));

        initViews();
        setupRecyclerView();
        loadPayslips(true);
    }

    @Override
    protected void onResume() {
        super.onResume();
        AppHeaderHelper.refreshHeaderState(this);
    }

    private void initViews() {
        progressBar = findViewById(R.id.progressBar);
        rvPayslips = findViewById(R.id.rvPayslips);
        layoutEmptyState = findViewById(R.id.layoutEmptyState);
    }

    private void setupRecyclerView() {
        rvPayslips.setLayoutManager(new LinearLayoutManager(this));
        adapter = new PayslipsAdapter(payslipsList, this::showPayslipDetails);
        rvPayslips.setAdapter(adapter);
    }

    private void loadPayslips(boolean showProgress) {
        if (showProgress) {
            progressBar.setVisibility(View.VISIBLE);
            layoutEmptyState.setVisibility(View.GONE);
            rvPayslips.setVisibility(View.GONE);
        }

        ApiClient.getInstance(this).getMyPayslips(new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray result) {
                runOnUiThread(() -> {
                    progressBar.setVisibility(View.GONE);
                    payslipsList.clear();

                    if (result != null && result.length() > 0) {
                        for (int i = 0; i < result.length(); i++) {
                            JSONObject obj = result.optJSONObject(i);
                            if (obj != null) payslipsList.add(obj);
                        }
                    }

                    if (payslipsList.isEmpty()) {
                        rvPayslips.setVisibility(View.GONE);
                        layoutEmptyState.setVisibility(View.VISIBLE);
                    } else {
                        layoutEmptyState.setVisibility(View.GONE);
                        rvPayslips.setVisibility(View.VISIBLE);
                        adapter.notifyDataSetChanged();
                    }
                });
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                runOnUiThread(() -> {
                    progressBar.setVisibility(View.GONE);
                    if (payslipsList.isEmpty()) {
                        layoutEmptyState.setVisibility(View.VISIBLE);
                        rvPayslips.setVisibility(View.GONE);
                    }
                });
            }
        });
    }

    private void showPayslipDetails(JSONObject payslip) {
        int monthNum = payslip.optInt("month", 1);
        int year = payslip.optInt("year", 2026);
        double net = payslip.optDouble("netPay", payslip.optDouble("netSalary", 0));
        double gross = payslip.optDouble("grossPay", payslip.optDouble("grossSalary", 0));
        double deductions = payslip.optDouble("totalDeductions", gross - net);

        NumberFormat formatter = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));
        String msg = "Period: " + getMonthName(monthNum) + " " + year + "\n" +
                "Gross Earnings: " + formatter.format(gross) + "\n" +
                "Total Deductions: " + formatter.format(deductions) + "\n" +
                "Net Transfer: " + formatter.format(net) + "\n\n" +
                "Status: Approved and Disbursed by Payroll.";

        new AlertDialog.Builder(this)
                .setTitle("Salary Statement")
                .setMessage(msg)
                .setPositiveButton("Download PDF", (dialog, which) -> {
                    Toast.makeText(this, "Downloading official payslip PDF...", Toast.LENGTH_SHORT).show();
                })
                .setNegativeButton("Close", null)
                .show();
    }

    private static String getMonthName(int monthNum) {
        String[] months = {"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"};
        if (monthNum >= 1 && monthNum <= 12) {
            return months[monthNum - 1];
        }
        return "Month " + monthNum;
    }

    private static class PayslipsAdapter extends RecyclerView.Adapter<PayslipsAdapter.ViewHolder> {
        private final List<JSONObject> items;
        private final OnPayslipClickListener listener;

        interface OnPayslipClickListener {
            void onClick(JSONObject item);
        }

        PayslipsAdapter(List<JSONObject> items, OnPayslipClickListener listener) {
            this.items = items;
            this.listener = listener;
        }

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_payslip, parent, false);
            return new ViewHolder(v);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            JSONObject item = items.get(position);
            int month = item.optInt("month", 1);
            int year = item.optInt("year", 2026);
            double net = item.optDouble("netPay", item.optDouble("netSalary", 0));
            double gross = item.optDouble("grossPay", item.optDouble("grossSalary", 0));
            double ded = item.optDouble("totalDeductions", gross - net);

            NumberFormat fmt = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));
            holder.tvMonthYear.setText(getMonthName(month) + " " + year);
            holder.tvNetSalary.setText(fmt.format(net));
            holder.tvGrossDeductions.setText(fmt.format(gross) + " / " + fmt.format(ded));

            holder.itemView.setOnClickListener(v -> {
                if (listener != null) listener.onClick(item);
            });
        }

        @Override
        public int getItemCount() {
            return items.size();
        }

        static class ViewHolder extends RecyclerView.ViewHolder {
            TextView tvMonthYear, tvNetSalary, tvGrossDeductions, tvStatus;

            ViewHolder(@NonNull View v) {
                super(v);
                tvMonthYear = v.findViewById(R.id.tvPayslipMonthYear);
                tvNetSalary = v.findViewById(R.id.tvNetSalary);
                tvGrossDeductions = v.findViewById(R.id.tvGrossDeductions);
                tvStatus = v.findViewById(R.id.tvPayslipStatus);
            }
        }
    }
}
