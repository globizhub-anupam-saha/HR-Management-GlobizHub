import Foundation

struct TabItem: Codable, Equatable {
    let id: String
    let title: String
    let systemIcon: String
    let isLocked: Bool
    var isEnabled: Bool
}

class TabManager {
    static let shared = TabManager()
    private let keyPrefix = "TeamHub_Tabs_Config_"

    private init() {}

    func getDefaultTabs(for role: UserRole) -> [TabItem] {
        var list: [TabItem] = []
        // Home is permanently locked at index 0 for all roles
        list.append(TabItem(id: "home", title: "Home", systemIcon: "house.fill", isLocked: true, isEnabled: true))

        switch role {
        case .superAdmin:
            list.append(TabItem(id: "employees", title: "Employees", systemIcon: "person.2", isLocked: false, isEnabled: true))
            list.append(TabItem(id: "approvals", title: "Approvals", systemIcon: "calendar.badge.checkmark", isLocked: false, isEnabled: true))
            list.append(TabItem(id: "payroll", title: "Payroll", systemIcon: "dollarsign.circle", isLocked: false, isEnabled: true))
            list.append(TabItem(id: "attendance", title: "Attendance", systemIcon: "clock", isLocked: false, isEnabled: false))
            list.append(TabItem(id: "tasks", title: "Tasks", systemIcon: "checkmark.square", isLocked: false, isEnabled: false))
            list.append(TabItem(id: "manage_schedules", title: "Manage Schedules", systemIcon: "calendar.badge.plus", isLocked: false, isEnabled: false))
            list.append(TabItem(id: "leave_policies", title: "Leave Policies", systemIcon: "slider.horizontal.3", isLocked: false, isEnabled: false))
            list.append(TabItem(id: "documents_admin", title: "Documents (Admin)", systemIcon: "folder.badge.gearshape", isLocked: false, isEnabled: false))
            list.append(TabItem(id: "settings", title: "Settings", systemIcon: "gearshape", isLocked: false, isEnabled: false))

        case .admin:
            list.append(TabItem(id: "employees", title: "Employees", systemIcon: "person.2", isLocked: false, isEnabled: true))
            list.append(TabItem(id: "approvals", title: "Approvals", systemIcon: "calendar.badge.checkmark", isLocked: false, isEnabled: true))
            list.append(TabItem(id: "payroll", title: "Payroll", systemIcon: "dollarsign.circle", isLocked: false, isEnabled: true))
            list.append(TabItem(id: "attendance", title: "Attendance", systemIcon: "clock", isLocked: false, isEnabled: false))
            list.append(TabItem(id: "tasks", title: "Tasks", systemIcon: "checkmark.square", isLocked: false, isEnabled: false))
            list.append(TabItem(id: "manage_schedules", title: "Manage Schedules", systemIcon: "calendar.badge.plus", isLocked: false, isEnabled: false))
            list.append(TabItem(id: "leave_policies", title: "Leave Policies", systemIcon: "slider.horizontal.3", isLocked: false, isEnabled: false))
            list.append(TabItem(id: "documents_admin", title: "Documents (Admin)", systemIcon: "folder.badge.gearshape", isLocked: false, isEnabled: false))

        case .employee:
            list.append(TabItem(id: "attendance", title: "Attendance", systemIcon: "clock", isLocked: false, isEnabled: true))
            list.append(TabItem(id: "leave", title: "Leave", systemIcon: "calendar.badge.clock", isLocked: false, isEnabled: true))
            list.append(TabItem(id: "schedules", title: "Schedule", systemIcon: "calendar", isLocked: false, isEnabled: true))
            list.append(TabItem(id: "payslips", title: "My Payslips", systemIcon: "banknote", isLocked: false, isEnabled: false))
            list.append(TabItem(id: "tasks", title: "Tasks", systemIcon: "checklist", isLocked: false, isEnabled: false))
            list.append(TabItem(id: "shifts", title: "Shifts", systemIcon: "briefcase", isLocked: false, isEnabled: false))
            list.append(TabItem(id: "documents", title: "Documents", systemIcon: "folder", isLocked: false, isEnabled: false))
        }

        return list
    }

    func getTabs(for role: UserRole) -> [TabItem] {
        let key = keyPrefix + role.rawValue.lowercased()
        let defaults = getDefaultTabs(for: role)

        guard let data = UserDefaults.standard.data(forKey: key),
              let decoded = try? JSONDecoder().decode([TabItem].self, from: data) else {
            return defaults
        }

        var tabs: [TabItem] = []
        var seenIds = Set<String>()

        for item in decoded {
            var lowerId = item.id.lowercased()
            if role == .employee && lowerId == "tasks" {
                lowerId = "schedules"
            }
            if lowerId == "home" {
                tabs.append(TabItem(id: "home", title: "Home", systemIcon: "house.fill", isLocked: true, isEnabled: true))
            } else {
                let defaultIcon = defaults.first(where: { $0.id.lowercased() == lowerId })?.systemIcon ?? "square.grid.2x2"
                let defaultTitle = defaults.first(where: { $0.id.lowercased() == lowerId })?.title ?? item.title
                tabs.append(TabItem(id: lowerId, title: defaultTitle, systemIcon: defaultIcon, isLocked: false, isEnabled: item.isEnabled))
            }
            seenIds.insert(lowerId)
        }

        // Ensure Home is at index 0
        if let homeIndex = tabs.firstIndex(where: { $0.id.lowercased() == "home" }) {
            if homeIndex != 0 {
                let home = tabs.remove(at: homeIndex)
                tabs.insert(home, at: 0)
            }
        } else {
            tabs.insert(TabItem(id: "home", title: "Home", systemIcon: "house.fill", isLocked: true, isEnabled: true), at: 0)
        }

        // Add any missing default tabs for this role
        for d in defaults {
            if !seenIds.contains(d.id.lowercased()) {
                tabs.append(d)
            }
        }

        return tabs
    }

    func saveTabs(_ tabs: [TabItem], for role: UserRole) {
        let key = keyPrefix + role.rawValue.lowercased()
        if let encoded = try? JSONEncoder().encode(tabs) {
            UserDefaults.standard.set(encoded, forKey: key)
        }
    }

    func getActiveBottomNavTabs(for role: UserRole) -> [RoleNavigationManager.NavItem] {
        let tabs = getTabs(for: role)
        var items: [RoleNavigationManager.NavItem] = []

        // Slot 1: Home (Locked)
        items.append(RoleNavigationManager.NavItem(id: "home", title: "Home", systemIcon: "house.fill"))

        // Slots 2, 3, 4: Top 3 enabled items
        var count = 0
        for item in tabs {
            if item.id.lowercased() == "home" { continue }
            if item.isEnabled && count < 3 {
                items.append(RoleNavigationManager.NavItem(id: item.id, title: item.title, systemIcon: item.systemIcon))
                count += 1
            }
        }

        // Slot 5: More
        items.append(RoleNavigationManager.NavItem(id: "more", title: "More", systemIcon: "ellipsis"))
        return items
    }
}
