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

import java.util.ArrayList;
import java.util.List;

public class DocumentsActivity extends AppCompatActivity {

    private ProgressBar progressBar;
    private RecyclerView rvDocuments;
    private View layoutEmptyState;
    private View btnUploadDoc;
    private DocumentsAdapter adapter;
    private final List<JSONObject> documentsList = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_documents);

        AppHeaderHelper.setupHeader(this, "My Documents", true);
        TabletHelper.applyTabletConstraint(findViewById(R.id.topBarContent));
        TabletHelper.applyTabletConstraint(findViewById(R.id.documentsContentContainer));

        initViews();
        setupRecyclerView();
        loadDocuments(true);
    }

    @Override
    protected void onResume() {
        super.onResume();
        AppHeaderHelper.refreshHeaderState(this);
    }

    private void initViews() {
        progressBar = findViewById(R.id.progressBar);
        rvDocuments = findViewById(R.id.rvDocuments);
        layoutEmptyState = findViewById(R.id.layoutEmptyState);
        btnUploadDoc = findViewById(R.id.btnUploadDoc);

        if (btnUploadDoc != null) {
            btnUploadDoc.setOnClickListener(v -> showUploadDialog());
        }
    }

    private void setupRecyclerView() {
        rvDocuments.setLayoutManager(new LinearLayoutManager(this));
        adapter = new DocumentsAdapter(documentsList, this::showDocumentDetails);
        rvDocuments.setAdapter(adapter);
    }

    private void loadDocuments(boolean showProgress) {
        if (showProgress) {
            progressBar.setVisibility(View.VISIBLE);
            layoutEmptyState.setVisibility(View.GONE);
            rvDocuments.setVisibility(View.GONE);
        }

        ApiClient.getInstance(this).getMyDocuments(new ApiClient.ApiCallback<JSONArray>() {
            @Override
            public void onSuccess(JSONArray result) {
                runOnUiThread(() -> {
                    progressBar.setVisibility(View.GONE);
                    documentsList.clear();

                    if (result != null && result.length() > 0) {
                        for (int i = 0; i < result.length(); i++) {
                            JSONObject obj = result.optJSONObject(i);
                            if (obj != null) documentsList.add(obj);
                        }
                    }

                    if (documentsList.isEmpty()) {
                        rvDocuments.setVisibility(View.GONE);
                        layoutEmptyState.setVisibility(View.VISIBLE);
                    } else {
                        layoutEmptyState.setVisibility(View.GONE);
                        rvDocuments.setVisibility(View.VISIBLE);
                        adapter.notifyDataSetChanged();
                    }
                });
            }

            @Override
            public void onError(String errorMessage, int statusCode) {
                runOnUiThread(() -> {
                    progressBar.setVisibility(View.GONE);
                    if (documentsList.isEmpty()) {
                        layoutEmptyState.setVisibility(View.VISIBLE);
                        rvDocuments.setVisibility(View.GONE);
                    }
                });
            }
        });
    }

    private void showUploadDialog() {
        String[] categories = {"Government Identity Proof (Aadhaar / Passport / Voter ID)", "Employment Contract / Signed NDA", "Educational Certificates / Degree", "Bank Passbook / Cancelled Cheque"};
        new AlertDialog.Builder(this)
                .setTitle("Select Document Category")
                .setItems(categories, (dialog, which) -> {
                    String selectedCategory = categories[which];
                    Toast.makeText(this, "Document upload requested for: " + selectedCategory + ". HR notification dispatched.", Toast.LENGTH_LONG).show();
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void showDocumentDetails(JSONObject doc) {
        String name = doc.optString("name", "Document");
        String category = doc.optString("category", "GENERAL");
        String status = doc.optString("status", "VERIFIED");

        new AlertDialog.Builder(this)
                .setTitle(name)
                .setMessage("Category: " + category + "\nVerification Status: " + status + "\n\nThis document is securely stored in your organization vault.")
                .setPositiveButton("View Document", (dialog, which) -> {
                    Toast.makeText(this, "Opening " + name + "...", Toast.LENGTH_SHORT).show();
                })
                .setNegativeButton("Close", null)
                .show();
    }

    private static class DocumentsAdapter extends RecyclerView.Adapter<DocumentsAdapter.ViewHolder> {
        private final List<JSONObject> items;
        private final OnDocumentClickListener listener;

        interface OnDocumentClickListener {
            void onClick(JSONObject item);
        }

        DocumentsAdapter(List<JSONObject> items, OnDocumentClickListener listener) {
            this.items = items;
            this.listener = listener;
        }

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_document, parent, false);
            return new ViewHolder(v);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            JSONObject item = items.get(position);
            String name = item.optString("name", item.optString("title", "Document"));
            String category = item.optString("category", "EMPLOYMENT");
            String status = item.optString("status", "VERIFIED");

            holder.tvName.setText(name);
            holder.tvCategory.setText(category.toUpperCase());
            holder.tvStatus.setText(status.toUpperCase());

            holder.itemView.setOnClickListener(v -> {
                if (listener != null) listener.onClick(item);
            });
        }

        @Override
        public int getItemCount() {
            return items.size();
        }

        static class ViewHolder extends RecyclerView.ViewHolder {
            TextView tvName, tvCategory, tvStatus;

            ViewHolder(@NonNull View v) {
                super(v);
                tvName = v.findViewById(R.id.tvDocName);
                tvCategory = v.findViewById(R.id.tvDocCategory);
                tvStatus = v.findViewById(R.id.tvDocStatus);
            }
        }
    }
}
