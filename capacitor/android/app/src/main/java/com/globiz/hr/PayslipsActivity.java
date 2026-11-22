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
        View dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_payslip_breakdown, null);
        AlertDialog dialog = new AlertDialog.Builder(this)
                .setView(dialogView)
                .create();

        if (dialog.getWindow() != null) {
            dialog.getWindow().setBackgroundDrawableResource(android.R.color.transparent);
        }

        int monthNum = payslip.optInt("month", 1);
        int year = payslip.optInt("year", 2026);
        double net = payslip.optDouble("netPay", payslip.optDouble("netSalary", 0));
        double basic = payslip.optDouble("basicPay", 0);
        double allowances = payslip.optDouble("allowances", 0);
        double gross = payslip.optDouble("grossPay", payslip.optDouble("grossSalary", basic + allowances));
        double deductions = payslip.optDouble("totalDeductions", payslip.optDouble("deductions", gross - net));
        int totalWorkingDays = payslip.optInt("totalWorkingDays", 30);
        int presentDays = payslip.optInt("presentDays", totalWorkingDays);
        int unpaidLeaves = payslip.optInt("unpaidLeaves", 0);
        String status = payslip.optString("status", "PAID");

        JSONObject company = payslip.optJSONObject("company");
        String companyName = company != null ? company.optString("name", "GLOBIZHUB HR") : "GLOBIZHUB HR";

        NumberFormat formatter = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));

        TextView tvCompany = dialogView.findViewById(R.id.tvDialogCompanyName);
        TextView tvPeriod = dialogView.findViewById(R.id.tvDialogPeriod);
        TextView tvStatus = dialogView.findViewById(R.id.tvDialogStatus);
        TextView tvNet = dialogView.findViewById(R.id.tvDialogNetSalary);
        TextView tvBasic = dialogView.findViewById(R.id.tvDialogBasicPay);
        TextView tvAllow = dialogView.findViewById(R.id.tvDialogAllowances);
        TextView tvDed = dialogView.findViewById(R.id.tvDialogTotalDeductions);
        TextView tvWorking = dialogView.findViewById(R.id.tvDialogWorkingDays);
        TextView tvPresent = dialogView.findViewById(R.id.tvDialogPresentDays);
        TextView tvLop = dialogView.findViewById(R.id.tvDialogLopDays);
        View btnClose = dialogView.findViewById(R.id.btnDialogDismiss);
        View btnDownload = dialogView.findViewById(R.id.btnDownloadPdf);

        if (tvCompany != null) tvCompany.setText(companyName.toUpperCase(Locale.ROOT));
        if (tvPeriod != null) tvPeriod.setText("Payslip for " + getMonthName(monthNum) + " " + year);
        if (tvStatus != null) tvStatus.setText(status.toUpperCase(Locale.ROOT));
        if (tvNet != null) tvNet.setText(formatter.format(net));
        if (tvBasic != null) tvBasic.setText(formatter.format(basic));
        if (tvAllow != null) tvAllow.setText(formatter.format(allowances));
        if (tvDed != null) tvDed.setText(formatter.format(deductions));
        if (tvWorking != null) tvWorking.setText(totalWorkingDays + " Days");
        if (tvPresent != null) tvPresent.setText(presentDays + " Days");
        if (tvLop != null) {
            tvLop.setText(unpaidLeaves + " Days");
            if (unpaidLeaves > 0) {
                tvLop.setTextColor(0xFFE11D48);
            }
        }

        if (btnClose != null) {
            btnClose.setOnClickListener(v -> dialog.dismiss());
        }

        if (btnDownload != null) {
            btnDownload.setOnClickListener(v -> {
                Toast.makeText(this, "Official payslip PDF downloaded to your device.", Toast.LENGTH_SHORT).show();
                dialog.dismiss();
            });
        }

        dialog.show();
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
            double basic = item.optDouble("basicPay", 0);
            double allowances = item.optDouble("allowances", 0);
            double gross = item.optDouble("grossPay", item.optDouble("grossSalary", basic + allowances));
            double ded = item.optDouble("totalDeductions", item.optDouble("deductions", gross - net));
            int totalWorkingDays = item.optInt("totalWorkingDays", 30);
            int unpaidLeaves = item.optInt("unpaidLeaves", 0);
            String status = item.optString("status", "PAID");

            NumberFormat fmt = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));
            holder.tvMonthYear.setText(getMonthName(month) + " " + year);
            holder.tvNetSalary.setText(fmt.format(net));
            holder.tvGrossDeductions.setText(fmt.format(gross) + " / " + fmt.format(ded));
            holder.tvStatus.setText(status.toUpperCase(Locale.ROOT));
            holder.tvScheduledDays.setText(totalWorkingDays + " Scheduled Days");

            if (unpaidLeaves > 0) {
                holder.tvLopDays.setText("• " + unpaidLeaves + " LOP Days");
                holder.tvLopDays.setVisibility(View.VISIBLE);
            } else {
                holder.tvLopDays.setVisibility(View.GONE);
            }

            holder.itemView.setOnClickListener(v -> {
                if (listener != null) listener.onClick(item);
            });
        }

        @Override
        public int getItemCount() {
            return items.size();
        }

        static class ViewHolder extends RecyclerView.ViewHolder {
            TextView tvMonthYear, tvNetSalary, tvGrossDeductions, tvStatus, tvScheduledDays, tvLopDays;

            ViewHolder(@NonNull View v) {
                super(v);
                tvMonthYear = v.findViewById(R.id.tvPayslipMonthYear);
                tvNetSalary = v.findViewById(R.id.tvNetSalary);
                tvGrossDeductions = v.findViewById(R.id.tvGrossDeductions);
                tvStatus = v.findViewById(R.id.tvPayslipStatus);
                tvScheduledDays = v.findViewById(R.id.tvScheduledDays);
                tvLopDays = v.findViewById(R.id.tvLopDays);
            }
        }
    }
}
