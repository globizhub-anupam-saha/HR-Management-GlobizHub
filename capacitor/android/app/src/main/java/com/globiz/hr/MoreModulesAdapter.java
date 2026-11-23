package com.globiz.hr;

import android.content.res.ColorStateList;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.List;

public class MoreModulesAdapter extends RecyclerView.Adapter<RecyclerView.ViewHolder> {

    public interface OnModuleClickListener {
        void onModuleClick(MoreModule module);
    }

    private List<MoreItem> items = new ArrayList<>();
    private final OnModuleClickListener listener;

    public MoreModulesAdapter(List<MoreItem> items, OnModuleClickListener listener) {
        this.items = items != null ? new ArrayList<>(items) : new ArrayList<>();
        this.listener = listener;
    }

    public void updateItems(List<MoreItem> newItems) {
        this.items = newItems != null ? new ArrayList<>(newItems) : new ArrayList<>();
        notifyDataSetChanged();
    }

    @Override
    public int getItemViewType(int position) {
        return items.get(position).getType();
    }

    @NonNull
    @Override
    public RecyclerView.ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        if (viewType == MoreItem.TYPE_HEADER) {
            View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_more_section_header, parent, false);
            return new HeaderViewHolder(view);
        } else {
            View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_more_module, parent, false);
            return new ModuleViewHolder(view);
        }
    }

    @Override
    public void onBindViewHolder(@NonNull RecyclerView.ViewHolder holder, int position) {
        MoreItem item = items.get(position);
        if (holder instanceof HeaderViewHolder) {
            ((HeaderViewHolder) holder).tvSectionTitle.setText(item.getHeaderTitle());
        } else if (holder instanceof ModuleViewHolder) {
            ModuleViewHolder mHolder = (ModuleViewHolder) holder;
            MoreModule module = item.getModule();
            if (module == null) return;

            mHolder.tvModuleName.setText(module.getTitle());
            mHolder.ivModuleIcon.setImageResource(module.getIconResId());

            if (module.getTintColor() != null) {
                mHolder.ivModuleIcon.setImageTintList(ColorStateList.valueOf(module.getTintColor()));
            } else {
                mHolder.ivModuleIcon.setImageTintList(null);
            }

            mHolder.itemView.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onModuleClick(module);
                }
            });
        }
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class HeaderViewHolder extends RecyclerView.ViewHolder {
        final TextView tvSectionTitle;

        HeaderViewHolder(@NonNull View itemView) {
            super(itemView);
            tvSectionTitle = itemView.findViewById(R.id.tvSectionTitle);
        }
    }

    static class ModuleViewHolder extends RecyclerView.ViewHolder {
        final ImageView ivModuleIcon;
        final TextView tvModuleName;

        ModuleViewHolder(@NonNull View itemView) {
            super(itemView);
            ivModuleIcon = itemView.findViewById(R.id.ivModuleIcon);
            tvModuleName = itemView.findViewById(R.id.tvModuleName);
        }
    }
}
