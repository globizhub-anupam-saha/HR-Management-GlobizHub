package com.globiz.hr;

public class MoreItem {
    public static final int TYPE_HEADER = 0;
    public static final int TYPE_MODULE = 1;

    private final int type;
    private final String headerTitle;
    private final MoreModule module;

    public MoreItem(String headerTitle) {
        this.type = TYPE_HEADER;
        this.headerTitle = headerTitle;
        this.module = null;
    }

    public MoreItem(MoreModule module) {
        this.type = TYPE_MODULE;
        this.headerTitle = null;
        this.module = module;
    }

    public int getType() {
        return type;
    }

    public String getHeaderTitle() {
        return headerTitle;
    }

    public MoreModule getModule() {
        return module;
    }
}
