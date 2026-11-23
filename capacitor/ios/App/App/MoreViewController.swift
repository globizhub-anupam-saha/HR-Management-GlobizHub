import UIKit

class MoreModuleCell: UITableViewCell {
    static let identifier = "MoreModuleCell"

    private let iconImageView = UIImageView()
    private let titleLabel = UILabel()

    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        setupViews()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupViews()
    }

    private func setupViews() {
        backgroundColor = .white
        contentView.backgroundColor = .white
        selectionStyle = .default

        iconImageView.contentMode = .scaleAspectFit
        iconImageView.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(iconImageView)

        titleLabel.font = .systemFont(ofSize: 16, weight: .regular)
        titleLabel.textColor = UIColor(red: 30/255, green: 41/255, blue: 59/255, alpha: 1.0)
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(titleLabel)

        NSLayoutConstraint.activate([
            iconImageView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 24),
            iconImageView.centerYAnchor.constraint(equalTo: contentView.centerYAnchor),
            iconImageView.widthAnchor.constraint(equalToConstant: 22),
            iconImageView.heightAnchor.constraint(equalToConstant: 22),

            titleLabel.leadingAnchor.constraint(equalTo: iconImageView.trailingAnchor, constant: 16),
            titleLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -24),
            titleLabel.centerYAnchor.constraint(equalTo: contentView.centerYAnchor)
        ])
    }

    func configure(with module: MoreModule) {
        titleLabel.text = module.title

        let config = UIImage.SymbolConfiguration(pointSize: 18, weight: .regular)
        iconImageView.image = UIImage(systemName: module.systemIcon, withConfiguration: config)

        if let tint = module.iconColor {
            iconImageView.tintColor = tint
        } else {
            iconImageView.tintColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        }
    }
}

class MoreViewController: UIViewController, UITableViewDataSource, UITableViewDelegate, UITextFieldDelegate {

    private let topBar = UIView()
    private let topBarContainer = UIView()
    private let titleLabel = UILabel()
    private let notificationBellButton = UIButton(type: .system)
    private let notificationBadgeDot = UIView()
    private let avatarContainer = UIView()
    private let avatarInitialsLabel = UILabel()

    // Bottom Navigation Bar
    private let bottomNavBar = UIView()
    private let bottomNavContainer = UIView()

    private let searchContainer = UIView()
    private let searchIconView = UIImageView()
    private let searchTextField = UITextField()

    private let tableView = UITableView()
    private let emptyLabel = UILabel()

    // MARK: - Auto-Hide Bottom Navigation on Scroll Down, Reveal on Scroll Up
    private var lastScrollOffsetY: CGFloat = 0
    private var isNavBarHidden: Bool = false

    struct ModuleSection {
        let title: String
        var modules: [MoreModule]
    }

    private var allModules: [MoreModule] = []
    private var moduleSections: [ModuleSection] = []
    private var filteredSections: [ModuleSection] = []

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white

        initModules()
        setupTopBar()
        setupSearchBar()
        setupTableView()
        setupBottomNavBar()
        filterModulesByRole()

        let swipeGesture = UISwipeGestureRecognizer(target: self, action: #selector(handleBack))
        swipeGesture.direction = .right
        view.addGestureRecognizer(swipeGesture)
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        setupBottomNavBar()
        view.bringSubviewToFront(bottomNavBar)
        filterModulesByRole()
        updateHeaderState()
        updateNotificationBadge()

        // Real-time synchronization of currently logged-in user profile & role modules
        AuthService.shared.getProfile { [weak self] result in
            guard let self = self else { return }
            switch result {
            case .success(let profile):
                if !UserDefaults.standard.bool(forKey: "isUserManualRoleOverride"),
                   let userRole = profile["role"] as? String, !userRole.isEmpty {
                    AuthService.shared.saveRole(userRole)
                }
                if let desigDict = profile["designation"] as? [String: Any],
                   let modules = desigDict["sidebarModules"] as? [String] {
                    AuthService.shared.saveSidebarModules(modules)
                }
                self.filterModulesByRole()
            case .failure:
                break
            }
        }
    }

    private func updateHeaderState() {
        let name = AuthService.shared.getFirstName()
        avatarInitialsLabel.text = name.isEmpty ? "U" : String(name.prefix(1)).uppercased()
    }

    private func updateNotificationBadge() {
        notificationBadgeDot.isHidden = !AuthService.shared.hasUnreadLocalNotifications()
    }

    @objc private func handleNotifications() {
        notificationBadgeDot.isHidden = true
        let notifVC = NotificationsViewController()
        notifVC.modalPresentationStyle = .fullScreen
        present(notifVC, animated: true)
    }

    @objc private func handleBack() {
        if let nav = navigationController {
            nav.popViewController(animated: true)
        } else {
            dismiss(animated: true)
        }
    }

    @objc private func didTapAvatar() {
        let settingsVC = SettingsViewController()
        settingsVC.modalPresentationStyle = .fullScreen
        present(settingsVC, animated: true)
    }

    private func initModules() {
        allModules = [
            // WORKSPACE
            MoreModule(id: "dashboard", title: "Dashboard", systemIcon: "square.grid.2x2", iconColor: nil, allowedRoles: ["ADMIN", "MANAGER", "HR_HEAD", "SUPER_ADMIN", "OWNER"], section: "WORKSPACE"),

            // TALENT MANAGEMENT
            MoreModule(id: "onboarding", title: "Onboarding", systemIcon: "person.crop.circle.badge.checkmark", iconColor: nil, allowedRoles: ["ADMIN", "MANAGER", "HR_HEAD", "SUPER_ADMIN", "OWNER"], section: "TALENT MANAGEMENT"),
            MoreModule(id: "recruitment", title: "Recruitment", systemIcon: "briefcase", iconColor: nil, allowedRoles: ["ADMIN", "MANAGER", "HR_HEAD", "SUPER_ADMIN", "OWNER"], section: "TALENT MANAGEMENT"),
            MoreModule(id: "training", title: "Training & Development", systemIcon: "graduationcap", iconColor: nil, allowedRoles: ["ADMIN", "MANAGER", "HR_HEAD", "SUPER_ADMIN", "OWNER"], section: "TALENT MANAGEMENT"),

            // EMPLOYEE MANAGEMENT
            MoreModule(id: "employees", title: "Employees", systemIcon: "person.2", iconColor: nil, allowedRoles: ["ADMIN", "MANAGER", "HR_HEAD", "SUPER_ADMIN", "OWNER"], section: "EMPLOYEE MANAGEMENT"),
            MoreModule(id: "designations", title: "Designations", systemIcon: "shield", iconColor: nil, allowedRoles: ["ADMIN", "HR_HEAD", "SUPER_ADMIN", "OWNER"], section: "EMPLOYEE MANAGEMENT"),
            MoreModule(id: "resignation", title: "Resignations", systemIcon: "rectangle.portrait.and.arrow.right", iconColor: nil, allowedRoles: ["ADMIN", "HR_HEAD", "SUPER_ADMIN", "OWNER"], section: "EMPLOYEE MANAGEMENT"),

            // ATTENDANCE & LEAVE
            MoreModule(id: "attendance", title: "Clock ins/outs", systemIcon: "clock", iconColor: nil, allowedRoles: ["EMPLOYEE", "ADMIN", "HR_HEAD", "SUPER_ADMIN", "OWNER"], section: "ATTENDANCE & LEAVE"),
            MoreModule(id: "leave_approvals", title: "Leave Approvals", systemIcon: "calendar.badge.checkmark", iconColor: nil, allowedRoles: ["ADMIN", "MANAGER", "HR_HEAD", "SUPER_ADMIN", "OWNER"], section: "ATTENDANCE & LEAVE"),
            MoreModule(id: "leave_policies", title: "Leave Policies", systemIcon: "slider.horizontal.3", iconColor: nil, allowedRoles: ["ADMIN", "HR_HEAD", "SUPER_ADMIN", "OWNER"], section: "ATTENDANCE & LEAVE"),
            MoreModule(id: "manage_schedules", title: "Manage Schedules", systemIcon: "calendar.badge.plus", iconColor: nil, allowedRoles: ["ADMIN", "HR_HEAD", "SUPER_ADMIN", "OWNER"], section: "ATTENDANCE & LEAVE"),

            // ADMINISTRATION
            MoreModule(id: "payroll", title: "Payroll Processing", systemIcon: "tablecells", iconColor: nil, allowedRoles: ["ADMIN", "HR_HEAD", "SUPER_ADMIN", "OWNER"], section: "ADMINISTRATION"),
            MoreModule(id: "payroll_console", title: "Payroll Console", systemIcon: "wallet.pass", iconColor: nil, allowedRoles: ["ADMIN", "HR_HEAD", "SUPER_ADMIN", "OWNER"], section: "ADMINISTRATION"),
            MoreModule(id: "documents_admin", title: "Documents (Admin)", systemIcon: "folder.badge.gearshape", iconColor: nil, allowedRoles: ["ADMIN", "HR_HEAD", "SUPER_ADMIN", "OWNER"], section: "ADMINISTRATION"),
            MoreModule(id: "tasks", title: "Tasks", systemIcon: "checklist", iconColor: nil, allowedRoles: ["EMPLOYEE", "MANAGER", "ADMIN", "HR_HEAD", "SUPER_ADMIN", "OWNER"], section: "ADMINISTRATION"),
            MoreModule(id: "billing", title: "Subscription & Billing", systemIcon: "creditcard", iconColor: nil, allowedRoles: ["ADMIN", "SUPER_ADMIN", "OWNER"], section: "ADMINISTRATION"),
            MoreModule(id: "settings", title: "Settings", systemIcon: "gearshape", iconColor: nil, allowedRoles: ["ADMIN", "SUPER_ADMIN", "OWNER"], section: "ADMINISTRATION"),
            MoreModule(id: "broadcast", title: "Broadcast Notification", systemIcon: "megaphone", iconColor: nil, allowedRoles: ["ADMIN", "HR_HEAD", "SUPER_ADMIN", "OWNER"], section: "ADMINISTRATION"),

            // SUPPORT
            MoreModule(id: "help", title: "Help & Support", systemIcon: "questionmark.circle", iconColor: nil, allowedRoles: ["EMPLOYEE", "MANAGER", "ADMIN", "HR_HEAD", "SUPER_ADMIN", "OWNER"], section: "SUPPORT")
        ]
    }

    private func filterModulesByRole() {
        var sectionMap: [String: [MoreModule]] = [:]
        var sectionOrder: [String] = []

        for m in allModules {
            let s = m.section.isEmpty ? "GENERAL" : m.section
            if sectionMap[s] == nil {
                sectionMap[s] = []
                sectionOrder.append(s)
            }
            sectionMap[s]?.append(m)
        }

        moduleSections = sectionOrder.compactMap { s in
            guard let list = sectionMap[s], !list.isEmpty else { return nil }
            return ModuleSection(title: s, modules: list)
        }

        applySearchQuery(searchTextField.text ?? "")
    }

    private func applySearchQuery(_ text: String) {
        let query = text.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        if query.isEmpty {
            filteredSections = moduleSections
            emptyLabel.isHidden = true
            tableView.isHidden = false
        } else {
            filteredSections = moduleSections.compactMap { sec in
                let matching = sec.modules.filter { $0.title.lowercased().contains(query) }
                return matching.isEmpty ? nil : ModuleSection(title: sec.title, modules: matching)
            }
            let hasResults = !filteredSections.isEmpty
            emptyLabel.isHidden = hasResults
            tableView.isHidden = !hasResults
        }
        tableView.reloadData()
    }

    private func setupTopBar() {
        topBar.backgroundColor = .white
        topBar.layer.shadowColor = UIColor.black.cgColor
        topBar.layer.shadowOpacity = 0.03
        topBar.layer.shadowOffset = CGSize(width: 0, height: 1)
        topBar.layer.shadowRadius = 4
        topBar.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(topBar)

        topBarContainer.translatesAutoresizingMaskIntoConstraints = false
        topBar.addSubview(topBarContainer)

        let brandHeaderStack = UIStackView()
        brandHeaderStack.axis = .vertical
        brandHeaderStack.spacing = 1
        brandHeaderStack.translatesAutoresizingMaskIntoConstraints = false
        topBarContainer.addSubview(brandHeaderStack)

        let appLabel = UILabel()
        appLabel.text = "GLOBIZHR"
        appLabel.font = .systemFont(ofSize: 11, weight: .heavy)
        appLabel.textColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        brandHeaderStack.addArrangedSubview(appLabel)

        titleLabel.text = "More"
        titleLabel.font = .systemFont(ofSize: 20, weight: .bold)
        titleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        brandHeaderStack.addArrangedSubview(titleLabel)

        let rightActionsStack = UIStackView()
        rightActionsStack.axis = .horizontal
        rightActionsStack.spacing = 12
        rightActionsStack.alignment = .center
        rightActionsStack.translatesAutoresizingMaskIntoConstraints = false
        topBarContainer.addSubview(rightActionsStack)

        // Customize Tabs Action Button
        let customizeConfig = UIImage.SymbolConfiguration(pointSize: 18, weight: .regular)
        let customizeButton = UIButton(type: .system)
        customizeButton.setImage(UIImage(systemName: "slider.horizontal.3", withConfiguration: customizeConfig), for: .normal)
        customizeButton.tintColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        customizeButton.addTarget(self, action: #selector(openCustomizeTabs), for: .touchUpInside)
        customizeButton.translatesAutoresizingMaskIntoConstraints = false
        rightActionsStack.addArrangedSubview(customizeButton)

        // Notification Bell with Conditional Red Dot
        let bellConfig = UIImage.SymbolConfiguration(pointSize: 19, weight: .regular)
        notificationBellButton.setImage(UIImage(systemName: "bell", withConfiguration: bellConfig), for: .normal)
        notificationBellButton.tintColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        notificationBellButton.addTarget(self, action: #selector(handleNotifications), for: .touchUpInside)
        notificationBellButton.translatesAutoresizingMaskIntoConstraints = false
        rightActionsStack.addArrangedSubview(notificationBellButton)

        notificationBadgeDot.backgroundColor = UIColor(red: 239/255, green: 68/255, blue: 68/255, alpha: 1.0)
        notificationBadgeDot.layer.cornerRadius = 4
        notificationBadgeDot.layer.borderWidth = 1.5
        notificationBadgeDot.layer.borderColor = UIColor.white.cgColor
        notificationBadgeDot.isHidden = true
        notificationBadgeDot.translatesAutoresizingMaskIntoConstraints = false
        notificationBellButton.addSubview(notificationBadgeDot)

        // Avatar
        avatarContainer.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        avatarContainer.layer.cornerRadius = 18
        avatarContainer.layer.masksToBounds = true
        avatarContainer.isUserInteractionEnabled = true
        avatarContainer.addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(didTapAvatar)))
        avatarContainer.translatesAutoresizingMaskIntoConstraints = false
        rightActionsStack.addArrangedSubview(avatarContainer)

        avatarInitialsLabel.text = "A"
        avatarInitialsLabel.font = .systemFont(ofSize: 14, weight: .bold)
        avatarInitialsLabel.textColor = .white
        avatarInitialsLabel.textAlignment = .center
        avatarInitialsLabel.translatesAutoresizingMaskIntoConstraints = false
        avatarContainer.addSubview(avatarInitialsLabel)

        let topBarWidth = topBarContainer.widthAnchor.constraint(equalTo: topBar.widthAnchor, constant: -32)
        topBarWidth.priority = UILayoutPriority(999)
        topBarWidth.isActive = true

        NSLayoutConstraint.activate([
            topBar.topAnchor.constraint(equalTo: view.topAnchor),
            topBar.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            topBar.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            topBar.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 58),

            topBarContainer.leadingAnchor.constraint(greaterThanOrEqualTo: topBar.leadingAnchor, constant: 16),
            topBarContainer.trailingAnchor.constraint(lessThanOrEqualTo: topBar.trailingAnchor, constant: -16),
            topBarContainer.centerXAnchor.constraint(equalTo: topBar.centerXAnchor),
            topBarContainer.widthAnchor.constraint(lessThanOrEqualToConstant: 680),
            topBarContainer.bottomAnchor.constraint(equalTo: topBar.bottomAnchor, constant: -10),
            topBarContainer.heightAnchor.constraint(equalToConstant: 44),

            brandHeaderStack.leadingAnchor.constraint(equalTo: topBarContainer.leadingAnchor),
            brandHeaderStack.centerYAnchor.constraint(equalTo: topBarContainer.centerYAnchor),

            rightActionsStack.trailingAnchor.constraint(equalTo: topBarContainer.trailingAnchor),
            rightActionsStack.centerYAnchor.constraint(equalTo: topBarContainer.centerYAnchor),

            notificationBellButton.widthAnchor.constraint(equalToConstant: 38),
            notificationBellButton.heightAnchor.constraint(equalToConstant: 38),

            notificationBadgeDot.topAnchor.constraint(equalTo: notificationBellButton.topAnchor, constant: 4),
            notificationBadgeDot.trailingAnchor.constraint(equalTo: notificationBellButton.trailingAnchor, constant: -4),
            notificationBadgeDot.widthAnchor.constraint(equalToConstant: 8),
            notificationBadgeDot.heightAnchor.constraint(equalToConstant: 8),

            avatarContainer.widthAnchor.constraint(equalToConstant: 36),
            avatarContainer.heightAnchor.constraint(equalToConstant: 36),

            avatarInitialsLabel.centerXAnchor.constraint(equalTo: avatarContainer.centerXAnchor),
            avatarInitialsLabel.centerYAnchor.constraint(equalTo: avatarContainer.centerYAnchor)
        ])
    }

    // MARK: - Bottom Navigation Bar Setup
    private func setupBottomNavBar() {
        bottomNavBar.backgroundColor = .white
        bottomNavBar.layer.shadowColor = UIColor.black.cgColor
        bottomNavBar.layer.shadowOpacity = 0.06
        bottomNavBar.layer.shadowOffset = CGSize(width: 0, height: -2)
        bottomNavBar.layer.shadowRadius = 6
        bottomNavBar.translatesAutoresizingMaskIntoConstraints = false
        if bottomNavBar.superview == nil {
            view.addSubview(bottomNavBar)
        }

        bottomNavContainer.translatesAutoresizingMaskIntoConstraints = false
        if bottomNavContainer.superview == nil {
            bottomNavBar.addSubview(bottomNavContainer)
        }

        let navWidth = bottomNavContainer.widthAnchor.constraint(equalTo: bottomNavBar.widthAnchor)
        navWidth.priority = .defaultHigh
        navWidth.isActive = true

        NSLayoutConstraint.activate([
            bottomNavBar.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            bottomNavBar.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            bottomNavBar.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            bottomNavBar.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -56),

            bottomNavContainer.topAnchor.constraint(equalTo: bottomNavBar.topAnchor),
            bottomNavContainer.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor),
            bottomNavContainer.centerXAnchor.constraint(equalTo: bottomNavBar.centerXAnchor),
            bottomNavContainer.widthAnchor.constraint(lessThanOrEqualToConstant: 680)
        ])

        RoleNavigationManager.setupBottomNavBar(
            in: self,
            navBar: bottomNavBar,
            container: bottomNavContainer,
            activeTabId: "more",
            scrollHandler: { [weak self] in
                self?.tableView.setContentOffset(.zero, animated: true)
            }
        )
        view.bringSubviewToFront(bottomNavBar)
    }

    private func makeNavItem(icon: String, title: String, isSelected: Bool, tag: Int) -> UIView {
        let container = UIView()
        container.tag = tag
        container.isUserInteractionEnabled = true
        container.addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(didTapNavTab(_:))))

        let stack = UIStackView()
        stack.axis = .vertical
        stack.alignment = .center
        stack.spacing = 2
        stack.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(stack)

        let config = UIImage.SymbolConfiguration(pointSize: 18, weight: isSelected ? .semibold : .regular)
        let imageView = UIImageView(image: UIImage(systemName: icon, withConfiguration: config))
        imageView.tintColor = isSelected ? UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0) : UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        imageView.contentMode = .scaleAspectFit
        stack.addArrangedSubview(imageView)

        let label = UILabel()
        label.text = title
        label.font = .systemFont(ofSize: 11, weight: isSelected ? .bold : .medium)
        label.textColor = isSelected ? UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0) : UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        stack.addArrangedSubview(label)

        NSLayoutConstraint.activate([
            stack.centerXAnchor.constraint(equalTo: container.centerXAnchor),
            stack.centerYAnchor.constraint(equalTo: container.centerYAnchor),
            imageView.heightAnchor.constraint(equalToConstant: 22)
        ])
        return container
    }

    @objc private func didTapNavTab(_ gesture: UITapGestureRecognizer) {
        guard let view = gesture.view else { return }
        switch view.tag {
        case 0:
            let homeVC = HomeViewController()
            homeVC.modalPresentationStyle = .fullScreen
            present(homeVC, animated: false)
        case 1:
            let attendanceVC = AttendanceViewController()
            attendanceVC.modalPresentationStyle = .fullScreen
            present(attendanceVC, animated: false)
        case 2:
            let leaveVC = LeaveViewController()
            leaveVC.modalPresentationStyle = .fullScreen
            present(leaveVC, animated: false)
        case 3:
            let tasksVC = TasksViewController()
            tasksVC.modalPresentationStyle = .fullScreen
            present(tasksVC, animated: false)
        case 4:
            // Already in More
            break
        default:
            break
        }
    }

    private func setupSearchBar() {
        searchContainer.backgroundColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0)
        searchContainer.layer.cornerRadius = 22
        searchContainer.clipsToBounds = true
        searchContainer.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(searchContainer)

        let searchConfig = UIImage.SymbolConfiguration(pointSize: 16, weight: .medium)
        searchIconView.image = UIImage(systemName: "magnifyingglass", withConfiguration: searchConfig)
        searchIconView.tintColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        searchIconView.contentMode = .scaleAspectFit
        searchIconView.translatesAutoresizingMaskIntoConstraints = false
        searchContainer.addSubview(searchIconView)

        searchTextField.placeholder = "Search..."
        searchTextField.font = .systemFont(ofSize: 15)
        searchTextField.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        searchTextField.clearButtonMode = .whileEditing
        searchTextField.autocorrectionType = .no
        searchTextField.autocapitalizationType = .none
        searchTextField.returnKeyType = .search
        searchTextField.delegate = self
        searchTextField.addTarget(self, action: #selector(searchTextChanged(_:)), for: .editingChanged)
        searchTextField.translatesAutoresizingMaskIntoConstraints = false
        searchContainer.addSubview(searchTextField)

        let searchWidth = searchContainer.widthAnchor.constraint(equalTo: view.widthAnchor, constant: -40)
        searchWidth.priority = UILayoutPriority(999)
        searchWidth.isActive = true

        NSLayoutConstraint.activate([
            searchContainer.topAnchor.constraint(equalTo: topBar.bottomAnchor, constant: 8),
            searchContainer.leadingAnchor.constraint(greaterThanOrEqualTo: view.leadingAnchor, constant: 20),
            searchContainer.trailingAnchor.constraint(lessThanOrEqualTo: view.trailingAnchor, constant: -20),
            searchContainer.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            searchContainer.widthAnchor.constraint(lessThanOrEqualToConstant: 680),
            searchContainer.heightAnchor.constraint(equalToConstant: 44),

            searchIconView.leadingAnchor.constraint(equalTo: searchContainer.leadingAnchor, constant: 14),
            searchIconView.centerYAnchor.constraint(equalTo: searchContainer.centerYAnchor),
            searchIconView.widthAnchor.constraint(equalToConstant: 20),
            searchIconView.heightAnchor.constraint(equalToConstant: 20),

            searchTextField.leadingAnchor.constraint(equalTo: searchIconView.trailingAnchor, constant: 10),
            searchTextField.trailingAnchor.constraint(equalTo: searchContainer.trailingAnchor, constant: -14),
            searchTextField.topAnchor.constraint(equalTo: searchContainer.topAnchor),
            searchTextField.bottomAnchor.constraint(equalTo: searchContainer.bottomAnchor)
        ])
    }

    private func setupTableView() {
        tableView.backgroundColor = .white
        tableView.separatorStyle = .none
        tableView.rowHeight = 52
        tableView.dataSource = self
        tableView.delegate = self
        tableView.contentInset.bottom = 88
        tableView.scrollIndicatorInsets.bottom = 88
        tableView.register(MoreModuleCell.self, forCellReuseIdentifier: MoreModuleCell.identifier)
        tableView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(tableView)

        emptyLabel.text = "No modules found"
        emptyLabel.textColor = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 1.0)
        emptyLabel.font = .systemFont(ofSize: 15)
        emptyLabel.textAlignment = .center
        emptyLabel.isHidden = true
        emptyLabel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(emptyLabel)

        let tableWidth = tableView.widthAnchor.constraint(equalTo: view.widthAnchor)
        tableWidth.priority = UILayoutPriority(999)
        tableWidth.isActive = true

        NSLayoutConstraint.activate([
            tableView.topAnchor.constraint(equalTo: searchContainer.bottomAnchor, constant: 12),
            tableView.leadingAnchor.constraint(greaterThanOrEqualTo: view.leadingAnchor),
            tableView.trailingAnchor.constraint(lessThanOrEqualTo: view.trailingAnchor),
            tableView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            tableView.widthAnchor.constraint(lessThanOrEqualToConstant: 680),
            tableView.bottomAnchor.constraint(equalTo: view.bottomAnchor),

            emptyLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            emptyLabel.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])
        view.bringSubviewToFront(bottomNavBar)
    }

    func scrollViewDidScroll(_ scrollView: UIScrollView) {
        let currentY = scrollView.contentOffset.y
        let dy = currentY - lastScrollOffsetY

        let maxOffset = scrollView.contentSize.height - scrollView.bounds.height
        guard currentY > 0 && currentY < maxOffset else {
            lastScrollOffsetY = currentY
            return
        }

        if dy > 10 && !isNavBarHidden {
            setBottomNavBar(hidden: true, animated: true)
        } else if dy < -10 && isNavBarHidden {
            setBottomNavBar(hidden: false, animated: true)
        }

        lastScrollOffsetY = currentY
    }

    private func setBottomNavBar(hidden: Bool, animated: Bool) {
        guard isNavBarHidden != hidden else { return }
        isNavBarHidden = hidden

        let translationY: CGFloat = hidden ? (bottomNavBar.bounds.height > 0 ? bottomNavBar.bounds.height + 34 : 110) : 0
        if animated {
            UIView.animate(withDuration: 0.28, delay: 0, options: [.curveEaseInOut, .allowUserInteraction], animations: {
                self.bottomNavBar.transform = CGAffineTransform(translationX: 0, y: translationY)
            }, completion: nil)
        } else {
            self.bottomNavBar.transform = CGAffineTransform(translationX: 0, y: translationY)
        }
    }

    @objc private func searchTextChanged(_ textField: UITextField) {
        applySearchQuery(textField.text ?? "")
    }

    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        textField.resignFirstResponder()
        return true
    }

    @objc private func openCustomizeTabs() {
        let customizeVC = CustomizeTabsViewController()
        customizeVC.modalPresentationStyle = .fullScreen
        present(customizeVC, animated: true)
    }

    // MARK: - UITableViewDataSource & Delegate
    func numberOfSections(in tableView: UITableView) -> Int {
        return filteredSections.count
    }

    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return filteredSections[section].modules.count
    }

    func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        let headerView = UIView()
        headerView.backgroundColor = .white

        let label = UILabel()
        label.text = filteredSections[section].title
        label.font = .systemFont(ofSize: 11, weight: .bold)
        label.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        label.translatesAutoresizingMaskIntoConstraints = false
        headerView.addSubview(label)

        NSLayoutConstraint.activate([
            label.leadingAnchor.constraint(equalTo: headerView.leadingAnchor, constant: 24),
            label.trailingAnchor.constraint(equalTo: headerView.trailingAnchor, constant: -24),
            label.bottomAnchor.constraint(equalTo: headerView.bottomAnchor, constant: -4),
            label.topAnchor.constraint(equalTo: headerView.topAnchor, constant: 8)
        ])

        return headerView
    }

    func tableView(_ tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
        return 32
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        guard let cell = tableView.dequeueReusableCell(withIdentifier: MoreModuleCell.identifier, for: indexPath) as? MoreModuleCell else {
            return UITableViewCell()
        }
        let module = filteredSections[indexPath.section].modules[indexPath.row]
        cell.configure(with: module)
        return cell
    }

    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        let module = filteredSections[indexPath.section].modules[indexPath.row]
        handleModuleAction(module)
    }

    private func handleModuleAction(_ module: MoreModule) {
        if module.id == "dashboard" {
            let homeVC = HomeViewController()
            if let window = view.window ?? UIApplication.shared.windows.first(where: { $0.isKeyWindow }) {
                UIView.transition(with: window, duration: 0.25, options: .transitionCrossDissolve, animations: {
                    window.rootViewController = homeVC
                }, completion: nil)
            } else {
                homeVC.modalPresentationStyle = .fullScreen
                present(homeVC, animated: false)
            }
        } else if module.id == "onboarding" {
            showOnboardingPortal()
        } else if module.id == "recruitment" {
            showRecruitmentPipeline()
        } else if module.id == "training" {
            showTrainingPrograms()
        } else if module.id == "employees" {
            let empVC = EmployeesViewController()
            empVC.modalPresentationStyle = .fullScreen
            present(empVC, animated: true)
        } else if module.id == "designations" {
            showDesignationsDirectory()
        } else if module.id == "resignation" {
            showResignationsManagement()
        } else if module.id == "attendance" {
            let attendanceVC = AttendanceViewController()
            attendanceVC.modalPresentationStyle = .fullScreen
            present(attendanceVC, animated: true)
        } else if module.id == "leave_approvals" || module.id == "approvals" {
            let approvalsVC = ApprovalsViewController()
            approvalsVC.modalPresentationStyle = .fullScreen
            present(approvalsVC, animated: true)
        } else if module.id == "leave_policies" {
            showLeavePoliciesAlert()
        } else if module.id == "manage_schedules" || module.id == "shifts" || module.id == "schedules" {
            let shiftsVC = ShiftsViewController()
            shiftsVC.modalPresentationStyle = .fullScreen
            present(shiftsVC, animated: true)
        } else if module.id == "leave" {
            let leaveVC = LeaveViewController()
            leaveVC.modalPresentationStyle = .fullScreen
            present(leaveVC, animated: true)
        } else if module.id == "payroll" {
            let payrollVC = PayrollViewController()
            payrollVC.modalPresentationStyle = .fullScreen
            present(payrollVC, animated: true)
        } else if module.id == "payroll_console" {
            showPayrollConsoleDialog()
        } else if module.id == "documents" || module.id == "documents_admin" {
            let docsVC = DocumentsViewController()
            docsVC.modalPresentationStyle = .fullScreen
            present(docsVC, animated: true)
        } else if module.id == "tasks" {
            let tasksVC = TasksViewController()
            tasksVC.modalPresentationStyle = .fullScreen
            present(tasksVC, animated: true)
        } else if module.id == "billing" {
            showSubscriptionBillingDialog()
        } else if module.id == "settings" {
            let settingsVC = SettingsViewController()
            settingsVC.modalPresentationStyle = .fullScreen
            present(settingsVC, animated: true)
        } else if module.id == "broadcast" {
            let broadcastVC = BroadcastNotificationViewController()
            broadcastVC.modalPresentationStyle = .fullScreen
            present(broadcastVC, animated: true)
        } else if module.id == "payslips" {
            let payslipsVC = PayslipsViewController()
            payslipsVC.modalPresentationStyle = .fullScreen
            present(payslipsVC, animated: true)
        } else if module.id == "help" {
            let helpVC = HelpSupportViewController()
            helpVC.modalPresentationStyle = .fullScreen
            present(helpVC, animated: true)
        } else {
            let alert = UIAlertController(title: module.title, message: "\(module.title) module is active and synchronized.", preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "OK", style: .default))
            present(alert, animated: true)
        }
    }

    private func showOnboardingPortal() {
        let alert = UIAlertController(
            title: "Onboarding Management",
            message: "Active Onboarding Pipeline:\n\n• Rahul Verma — Frontend Engineer (65% Complete)\n  Status: IT Hardware Dispatched, Docs Pending\n• Priya Sharma — Product Designer (90% Complete)\n  Status: Ready for Team Orientation\n• Ankit Patel — QA Engineer (40% Complete)\n  Status: Background Verification Pending\n\nOrganization checklist is active.",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }

    private func showRecruitmentPipeline() {
        let alert = UIAlertController(
            title: "Recruitment Pipeline",
            message: "Active Job Openings & Funnel:\n\n• Senior Fullstack Engineer — 5 Candidates\n  2 Screening • 2 Technical Round • 1 Final\n• HR Operations Specialist — 3 Candidates\n  2 Screening • 1 Offer Pending\n• DevOps Specialist — 2 Candidates\n  1 Screening • 1 Technical Interview\n\nTotal: 10 Candidates active across 3 openings.",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }

    private func showTrainingPrograms() {
        let alert = UIAlertController(
            title: "Training & Development",
            message: "Active Programs & Compliance:\n\n• ISO 27001 & InfoSec (Mandatory Annual)\n  Completion: 92% (12/13 Employees Completed)\n• Modern TypeScript & Architecture\n  Enrolled: 4 Developers • Upcoming Lab: Friday\n• Managerial Leadership & Coaching\n  Enrolled: 2 Managers • Status: In Progress\n\nNext Session: Friday, 3:00 PM IST.",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }

    private func showDesignationsDirectory() {
        let alert = UIAlertController(
            title: "Designations & Hierarchy",
            message: "Active Organization Designations:\n\n• Platform Owner / Super Admin (Level 1)\n• HR Head / Operations (Level 2)\n• Engineering Lead / Manager (Level 3)\n• Senior Software Engineer (Level 4)\n• UI/UX Product Designer (Level 4)\n• QA / Automation Engineer (Level 4)\n\nAll designations map to module security policies.",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }

    private func showResignationsManagement() {
        let alert = UIAlertController(
            title: "Resignations & Offboarding",
            message: "Resignation Governance Overview:\n\n• Standard Notice Period: 60 Days\n• Active Exit Clearances: 0 Pending\n• Company Hardware Return: 100% Accounted\n• Knowledge Transfer Status: Up to date\n\nNo pending employee resignation requests.",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }

    private func showPayrollConsoleDialog() {
        let alert = UIAlertController(
            title: "Payroll Console",
            message: "Salary Architecture & Rules:\n\n• Basic Salary: 50% of CTC\n• House Rent Allowance: 40% of Basic\n• Statutory PF: 12% Employer + 12% Employee\n• Disbursal Mode: Direct NEFT / Bank Deposit\n\nCurrent Pay Cycle: November 2026 Batch Ready.",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "Open Payroll Processing", style: .default, handler: { [weak self] _ in
            let payrollVC = PayrollViewController()
            payrollVC.modalPresentationStyle = .fullScreen
            self?.present(payrollVC, animated: true)
        }))
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        present(alert, animated: true)
    }

    private func showSubscriptionBillingDialog() {
        let alert = UIAlertController(
            title: "Subscription & Billing",
            message: "GlobizHR Cloud Subscription:\n\n• Plan: Enterprise Tier (Active)\n• Licensed Seats: 2 Active / 50 Included\n• Billing Interval: Annual (Renews Nov 2027)\n• 24/7 Priority Support & Direct Slack Connect\n• Multi-location Attendance & Automated Payroll\n\nSubscription is fully active and in good standing.",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }

    private func showLeavePoliciesAlert() {
        let alert = UIAlertController(
            title: "Company Leave Policies",
            message: "Annual Leave Entitlements:\n\n• Casual Leave: 12 Days\n• Medical / Sick Leave: 10 Days\n• Earned / Annual Leave: 15 Days\n• Maternity Leave: 84 Days\n• Paternity Leave: 14 Days\n\nGuidelines:\n- Applications must be submitted 24 hours in advance.\n- Medical leave > 2 days requires a medical certificate.\n- Unused earned leaves carry forward as per company policy.",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
}
