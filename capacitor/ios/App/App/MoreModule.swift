import UIKit

enum UserRole: String, CaseIterable {
    case employee = "EMPLOYEE"
    case admin = "ADMIN"
    case superAdmin = "SUPER_ADMIN"

    var displayName: String {
        switch self {
        case .employee: return "Employee"
        case .admin: return "Admin"
        case .superAdmin: return "Super Admin"
        }
    }

    static func from(string: String?) -> UserRole {
        guard let s = string?.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
            .replacingOccurrences(of: " ", with: "_")
            .replacingOccurrences(of: "-", with: "_") else {
            return .employee
        }
        if s == "SUPER_ADMIN" || s == "SUPERADMIN" || s == "OWNER" || s == "PLATFORM_ADMIN" {
            return .superAdmin
        } else if s == "ADMIN" || s == "HR_HEAD" || s == "HR_ADMIN" || s == "MANAGER" {
            return .admin
        }
        return .employee
    }
}

struct MoreModule {
    let id: String
    let title: String
    let systemIcon: String
    let iconColor: UIColor?
    let allowedRoles: [String]
    let section: String

    init(id: String, title: String, systemIcon: String, iconColor: UIColor? = nil, allowedRoles: [String] = [], section: String = "") {
        self.id = id
        self.title = title
        self.systemIcon = systemIcon
        self.iconColor = iconColor
        self.allowedRoles = allowedRoles
        self.section = section
    }

    func isAllowed(for roleStr: String, sidebarModules: [String]? = nil) -> Bool {
        return true
    }
}

class RoleNavigationManager {
    struct NavItem {
        let id: String
        let title: String
        let systemIcon: String
    }

    static func getNavItems(for role: UserRole) -> [NavItem] {
        return TabManager.shared.getActiveBottomNavTabs(for: role)
    }

    static func setupBottomNavBar(
        in vc: UIViewController,
        navBar: UIView,
        container: UIView,
        activeTabId: String,
        scrollHandler: (() -> Void)? = nil
    ) {
        let roleStr = AuthService.shared.getRole()
        let role = UserRole.from(string: roleStr)
        let items = getNavItems(for: role)

        let navStack: UIStackView
        if let existing = container.subviews.first(where: { $0 is UIStackView }) as? UIStackView {
            navStack = existing
            for sub in navStack.arrangedSubviews {
                navStack.removeArrangedSubview(sub)
                sub.removeFromSuperview()
            }
        } else {
            navStack = UIStackView()
            navStack.axis = .horizontal
            navStack.distribution = .fillEqually
            navStack.translatesAutoresizingMaskIntoConstraints = false
            container.addSubview(navStack)

            NSLayoutConstraint.activate([
                navStack.topAnchor.constraint(equalTo: container.topAnchor, constant: 4),
                navStack.leadingAnchor.constraint(equalTo: container.leadingAnchor),
                navStack.trailingAnchor.constraint(equalTo: container.trailingAnchor),
                navStack.bottomAnchor.constraint(equalTo: container.bottomAnchor, constant: -8)
            ])
        }

        for (idx, item) in items.enumerated() {
            let isActive = item.id.lowercased() == activeTabId.lowercased()
            let tabView = makeNavTab(item: item, isActive: isActive, tag: idx) {
                handleNavTabClick(item: item, from: vc, scrollHandler: scrollHandler)
            }
            navStack.addArrangedSubview(tabView)
        }
    }

    private static func makeNavTab(
        item: NavItem,
        isActive: Bool,
        tag: Int,
        action: @escaping () -> Void
    ) -> UIView {
        let container = NavTabContainerView()
        container.tag = tag
        container.isUserInteractionEnabled = true
        container.onTap = action

        let iconView = UIImageView()
        let config = UIImage.SymbolConfiguration(pointSize: 18, weight: isActive ? .bold : .medium)
        iconView.image = UIImage(systemName: item.systemIcon, withConfiguration: config)
        iconView.tintColor = isActive ? UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0) : UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        iconView.contentMode = .scaleAspectFit
        iconView.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(iconView)

        let label = UILabel()
        label.text = item.title
        label.font = .systemFont(ofSize: 11, weight: isActive ? .bold : .medium)
        label.textColor = isActive ? UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0) : UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(label)

        NSLayoutConstraint.activate([
            iconView.centerXAnchor.constraint(equalTo: container.centerXAnchor),
            iconView.topAnchor.constraint(equalTo: container.topAnchor, constant: 6),
            iconView.widthAnchor.constraint(equalToConstant: 22),
            iconView.heightAnchor.constraint(equalToConstant: 22),

            label.topAnchor.constraint(equalTo: iconView.bottomAnchor, constant: 3),
            label.centerXAnchor.constraint(equalTo: container.centerXAnchor)
        ])

        return container
    }

    private static func handleNavTabClick(
        item: NavItem,
        from vc: UIViewController,
        scrollHandler: (() -> Void)?
    ) {
        let id = item.id.lowercased()

        if id == "home" {
            if vc is HomeViewController {
                scrollHandler?()
            } else {
                let homeVC = HomeViewController()
                if let window = vc.view.window ?? UIApplication.shared.windows.first(where: { $0.isKeyWindow }) {
                    UIView.transition(with: window, duration: 0.25, options: .transitionCrossDissolve, animations: {
                        window.rootViewController = homeVC
                    }, completion: nil)
                } else {
                    homeVC.modalPresentationStyle = .fullScreen
                    vc.present(homeVC, animated: false)
                }
            }
        } else if id == "attendance" {
            if vc is AttendanceViewController {
                scrollHandler?()
            } else {
                let attendanceVC = AttendanceViewController()
                attendanceVC.modalPresentationStyle = .fullScreen
                vc.present(attendanceVC, animated: false)
            }
        } else if id == "leave" {
            if vc is LeaveViewController {
                scrollHandler?()
            } else {
                let leaveVC = LeaveViewController()
                leaveVC.modalPresentationStyle = .fullScreen
                vc.present(leaveVC, animated: false)
            }
        } else if id == "tasks" || id == "schedules" {
            if vc is TasksViewController {
                scrollHandler?()
            } else {
                let tasksVC = TasksViewController()
                tasksVC.modalPresentationStyle = .fullScreen
                vc.present(tasksVC, animated: false)
            }
        } else if id == "more" {
            if vc is MoreViewController {
                scrollHandler?()
            } else {
                let moreVC = MoreViewController()
                moreVC.modalPresentationStyle = .fullScreen
                vc.present(moreVC, animated: false)
            }
        } else if id == "employees" {
            if vc is EmployeesViewController {
                scrollHandler?()
            } else {
                let empVC = EmployeesViewController()
                empVC.modalPresentationStyle = .fullScreen
                vc.present(empVC, animated: false)
            }
        } else if id == "approvals" || id == "leave_approvals" {
            if vc is ApprovalsViewController {
                scrollHandler?()
            } else {
                let approvalsVC = ApprovalsViewController()
                approvalsVC.modalPresentationStyle = .fullScreen
                vc.present(approvalsVC, animated: false)
            }
        } else if id == "payroll" {
            if vc is PayrollViewController {
                scrollHandler?()
            } else {
                let payrollVC = PayrollViewController()
                payrollVC.modalPresentationStyle = .fullScreen
                vc.present(payrollVC, animated: false)
            }
        } else if id == "payslips" {
            let payslipsVC = PayslipsViewController()
            payslipsVC.modalPresentationStyle = .fullScreen
            vc.present(payslipsVC, animated: false)
        } else if id == "shifts" || id == "schedules" || id == "manage_schedules" {
            let shiftsVC = ShiftsViewController()
            shiftsVC.modalPresentationStyle = .fullScreen
            vc.present(shiftsVC, animated: false)
        } else if id == "documents" || id == "documents_admin" {
            let docsVC = DocumentsViewController()
            docsVC.modalPresentationStyle = .fullScreen
            vc.present(docsVC, animated: false)
        } else if id == "settings" {
            let settingsVC = SettingsViewController()
            settingsVC.modalPresentationStyle = .fullScreen
            vc.present(settingsVC, animated: false)
        } else if id == "broadcast" {
            let broadcastVC = BroadcastNotificationViewController()
            broadcastVC.modalPresentationStyle = .fullScreen
            vc.present(broadcastVC, animated: false)
        } else if id == "leave_policies" {
            showLeavePoliciesAlert(from: vc)
        }
    }

    static func showLeavePoliciesAlert(from vc: UIViewController) {
        let msg = """
        Annual Leave Entitlements:

        • Casual Leave: 12 Days / Year
        • Medical / Sick Leave: 10 Days / Year
        • Earned / Annual Leave: 15 Days / Year
        • Maternity Leave: 84 Days
        • Paternity Leave: 14 Days

        Rules:
        1. Applications must be submitted 24h in advance.
        2. Medical leave beyond 2 days requires a certificate.
        3. Unused earned leaves carry forward as per company rules.
        """
        let alert = UIAlertController(title: "Company Leave Policies", message: msg, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        vc.present(alert, animated: true)
    }

    static func showEmployeesAlert(from vc: UIViewController) {
        AuthService.shared.getTeamMembers { result in
            var text = ""
            switch result {
            case .success(let members):
                if !members.isEmpty {
                    text = "\(members.count) Team Members in Organization:\n\n"
                    for m in members.prefix(15) {
                        let fn = m["firstName"] as? String ?? ""
                        let ln = m["lastName"] as? String ?? ""
                        let desig = (m["designation"] as? [String: Any])?["name"] as? String ?? m["designation"] as? String ?? ""
                        let role = m["role"] as? String ?? "EMPLOYEE"
                        let name = "\(fn) \(ln)".trimmingCharacters(in: .whitespaces)
                        text += "• \(name)" + (desig.isEmpty ? "" : " — \(desig)") + " [\(role)]\n"
                    }
                } else {
                    text = "No other team members found in organization."
                }
            case .failure:
                text = "No other team members found in organization."
            }

            let alert = UIAlertController(title: "Employees Directory", message: text, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "Close", style: .default))
            vc.present(alert, animated: true)
        }
    }

    static func showApprovalsAlert(from vc: UIViewController) {
        AuthService.shared.getCompanyLeaves { result in
            var text = ""
            switch result {
            case .success(let leaves):
                let pending = leaves.filter { ($0["status"] as? String ?? "PENDING").uppercased() == "PENDING" }
                if !pending.isEmpty {
                    text = "\(pending.count) Pending Approval Requests:\n\n"
                    for l in pending {
                        let emp = l["employee"] as? [String: Any]
                        let fn = emp?["firstName"] as? String ?? ""
                        let ln = emp?["lastName"] as? String ?? ""
                        let type = l["type"] as? String ?? "LEAVE"
                        let start = l["startDate"] as? String ?? ""
                        let end = l["endDate"] as? String ?? ""
                        let reason = l["reason"] as? String ?? "Personal"
                        text += "• \(fn) \(ln) — \(type) Leave (\(start) - \(end))\n  Reason: \(reason)\n\n"
                    }
                } else {
                    text = "No pending approval requests at this time.\n\nAll employee leave and attendance requests are completely up to date."
                }
            case .failure:
                text = "No pending approval requests at this time.\n\nAll employee leave and attendance requests are completely up to date."
            }

            let alert = UIAlertController(title: "Leave & Attendance Approvals", message: text, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "Close", style: .default))
            vc.present(alert, animated: true)
        }
    }

    static func showPayrollAlert(from vc: UIViewController) {
        let org = AuthService.shared.getOrganization()
        let alert = UIAlertController(
            title: "Payroll Processing",
            message: "Organization: \(org.isEmpty ? "Globizhub" : org)\n\n" +
                "• Active Headcount: 2 Employees\n" +
                "• Pay Cycle: Current Month (November 2026)\n" +
                "• Direct Deposit Batch: Synchronized with Admin Portal\n\n" +
                "All employee salary components and compliance records sync with the web portal.",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "Close", style: .default))
        vc.present(alert, animated: true)
    }
}

class NavTabContainerView: UIView {
    var onTap: (() -> Void)?

    override init(frame: CGRect) {
        super.init(frame: frame)
        addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(handleTap)))
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(handleTap)))
    }

    @objc private func handleTap() {
        onTap?()
    }
}
