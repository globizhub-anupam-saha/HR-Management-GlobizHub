import UIKit

class EmployeesViewController: UIViewController, UIScrollViewDelegate, UITextFieldDelegate {

    // MARK: - Properties & State
    private var employees: [[String: Any]] = []
    private var filteredEmployees: [[String: Any]] = []
    private var departments: [[String: Any]] = []

    private var selectedStatus: String = "ALL"
    private var searchTerm: String = ""
    private var selectedDepartmentId: String = ""
    private var selectedRole: String = ""
    private var isLoading: Bool = false

    // MARK: - UI Elements
    private let topBar = UIView()
    private let topBarContainer = UIView()
    private let topBarTitleLabel = UILabel()
    private let inviteHeaderButton = UIButton(type: .system)
    private let notificationBellButton = UIButton(type: .custom)
    private let notificationBadgeDot = UIView()
    private let avatarContainer = UIView()
    private let avatarInitialsLabel = UILabel()

    private let scrollView = UIScrollView()
    private let refreshControl = UIRefreshControl()
    private let contentView = UIView()
    private let contentStackView = UIStackView()

    // KPI Cards
    private let kpiStackView = UIStackView()
    private let cardAllStaff = UIView()
    private let cardActive = UIView()
    private let cardInvited = UIView()
    private let cardTerminated = UIView()

    private let countAllStaffLabel = UILabel()
    private let countActiveLabel = UILabel()
    private let countInvitedLabel = UILabel()
    private let countTerminatedLabel = UILabel()

    // Filter Chips
    private let filterTabsScrollView = UIScrollView()
    private let filterTabsStackView = UIStackView()

    // Search and Dropdown Filters
    private let searchTextField = UITextField()
    private let deptFilterButton = UIButton(type: .system)
    private let roleFilterButton = UIButton(type: .system)

    // Employees List
    private let employeesStackView = UIStackView()
    private let emptyStateView = UIView()
    private let loadingIndicator = UIActivityIndicatorView(style: .medium)

    // Bottom Navigation
    private let bottomNavBar = UIView()
    private let bottomNavContainer = UIView()
    private var lastScrollOffsetY: CGFloat = 0
    private var isNavBarHidden: Bool = false

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
        navigationController?.setNavigationBarHidden(true, animated: false)

        setupTopBar()
        setupScrollView()
        setupHeaderBanner()
        setupKpiCards()
        setupFilterTabs()
        setupSearchAndFilterRow()
        setupEmployeesListContainer()
        setupBottomNavBar()

        fetchDepartments()
        loadEmployeesData()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        setupBottomNavBar()
        view.bringSubviewToFront(bottomNavBar)
        updateHeaderState()
        loadEmployeesData()
    }

    private func updateHeaderState() {
        notificationBadgeDot.isHidden = !AuthService.shared.hasUnreadLocalNotifications()
        let name = AuthService.shared.getFirstName()
        avatarInitialsLabel.text = name.isEmpty ? "U" : String(name.prefix(1)).uppercased()
    }

    // MARK: - Top Bar
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

        topBarTitleLabel.text = "Employee Directory"
        topBarTitleLabel.font = .systemFont(ofSize: 20, weight: .bold)
        topBarTitleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        brandHeaderStack.addArrangedSubview(topBarTitleLabel)

        let rightActionsStack = UIStackView()
        rightActionsStack.axis = .horizontal
        rightActionsStack.spacing = 10
        rightActionsStack.alignment = .center
        rightActionsStack.translatesAutoresizingMaskIntoConstraints = false
        topBarContainer.addSubview(rightActionsStack)

        // Invite Button in Top Bar
        inviteHeaderButton.setTitle("+ Invite", for: .normal)
        inviteHeaderButton.titleLabel?.font = .systemFont(ofSize: 13, weight: .semibold)
        inviteHeaderButton.setTitleColor(.white, for: .normal)
        inviteHeaderButton.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        inviteHeaderButton.layer.cornerRadius = 8
        inviteHeaderButton.contentEdgeInsets = UIEdgeInsets(top: 6, left: 12, bottom: 6, right: 12)
        inviteHeaderButton.addTarget(self, action: #selector(didTapInviteEmployee), for: .touchUpInside)
        rightActionsStack.addArrangedSubview(inviteHeaderButton)

        // Notification Bell
        let bellConfig = UIImage.SymbolConfiguration(pointSize: 18, weight: .regular)
        notificationBellButton.setImage(UIImage(systemName: "bell", withConfiguration: bellConfig), for: .normal)
        notificationBellButton.tintColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        notificationBellButton.addTarget(self, action: #selector(didTapNotificationBell), for: .touchUpInside)
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
        avatarContainer.layer.cornerRadius = 16
        avatarContainer.layer.masksToBounds = true
        avatarContainer.isUserInteractionEnabled = true
        avatarContainer.addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(didTapAvatar)))
        avatarContainer.translatesAutoresizingMaskIntoConstraints = false
        rightActionsStack.addArrangedSubview(avatarContainer)

        avatarInitialsLabel.textColor = .white
        avatarInitialsLabel.font = .systemFont(ofSize: 13, weight: .bold)
        avatarInitialsLabel.textAlignment = .center
        avatarInitialsLabel.translatesAutoresizingMaskIntoConstraints = false
        avatarContainer.addSubview(avatarInitialsLabel)

        NSLayoutConstraint.activate([
            topBar.topAnchor.constraint(equalTo: view.topAnchor),
            topBar.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            topBar.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            topBar.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 56),

            topBarContainer.leadingAnchor.constraint(equalTo: topBar.leadingAnchor, constant: 16),
            topBarContainer.trailingAnchor.constraint(equalTo: topBar.trailingAnchor, constant: -16),
            topBarContainer.bottomAnchor.constraint(equalTo: topBar.bottomAnchor, constant: -8),
            topBarContainer.heightAnchor.constraint(equalToConstant: 44),

            brandHeaderStack.leadingAnchor.constraint(equalTo: topBarContainer.leadingAnchor),
            brandHeaderStack.centerYAnchor.constraint(equalTo: topBarContainer.centerYAnchor),

            rightActionsStack.trailingAnchor.constraint(equalTo: topBarContainer.trailingAnchor),
            rightActionsStack.centerYAnchor.constraint(equalTo: topBarContainer.centerYAnchor),

            notificationBellButton.widthAnchor.constraint(equalToConstant: 32),
            notificationBellButton.heightAnchor.constraint(equalToConstant: 32),

            notificationBadgeDot.topAnchor.constraint(equalTo: notificationBellButton.topAnchor, constant: 2),
            notificationBadgeDot.trailingAnchor.constraint(equalTo: notificationBellButton.trailingAnchor, constant: -2),
            notificationBadgeDot.widthAnchor.constraint(equalToConstant: 8),
            notificationBadgeDot.heightAnchor.constraint(equalToConstant: 8),

            avatarContainer.widthAnchor.constraint(equalToConstant: 32),
            avatarContainer.heightAnchor.constraint(equalToConstant: 32),

            avatarInitialsLabel.centerXAnchor.constraint(equalTo: avatarContainer.centerXAnchor),
            avatarInitialsLabel.centerYAnchor.constraint(equalTo: avatarContainer.centerYAnchor)
        ])
    }

    // MARK: - Scroll View
    private func setupScrollView() {
        scrollView.delegate = self
        scrollView.showsVerticalScrollIndicator = false
        scrollView.alwaysBounceVertical = true
        scrollView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(scrollView)

        refreshControl.addTarget(self, action: #selector(handlePullToRefresh), for: .valueChanged)
        scrollView.refreshControl = refreshControl

        contentView.translatesAutoresizingMaskIntoConstraints = false
        scrollView.addSubview(contentView)

        contentStackView.axis = .vertical
        contentStackView.spacing = 16
        contentStackView.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(contentStackView)

        NSLayoutConstraint.activate([
            scrollView.topAnchor.constraint(equalTo: topBar.bottomAnchor),
            scrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scrollView.bottomAnchor.constraint(equalTo: view.bottomAnchor),

            contentView.topAnchor.constraint(equalTo: scrollView.topAnchor),
            contentView.leadingAnchor.constraint(equalTo: scrollView.leadingAnchor),
            contentView.trailingAnchor.constraint(equalTo: scrollView.trailingAnchor),
            contentView.bottomAnchor.constraint(equalTo: scrollView.bottomAnchor),
            contentView.widthAnchor.constraint(equalTo: scrollView.widthAnchor),

            contentStackView.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 16),
            contentStackView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            contentStackView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            contentStackView.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -90)
        ])
    }

    // MARK: - Header Banner
    private func setupHeaderBanner() {
        let container = UIView()
        container.backgroundColor = .white
        container.layer.cornerRadius = 14
        container.layer.borderWidth = 1
        container.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        container.translatesAutoresizingMaskIntoConstraints = false

        let stack = UIStackView()
        stack.axis = .vertical
        stack.spacing = 4
        stack.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(stack)

        let titleLabel = UILabel()
        titleLabel.text = "All Organizational Members"
        titleLabel.font = .systemFont(ofSize: 17, weight: .bold)
        titleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        stack.addArrangedSubview(titleLabel)

        let subLabel = UILabel()
        subLabel.text = "Search, filter, invite, and manage team members across all organizational departments."
        subLabel.font = .systemFont(ofSize: 13, weight: .regular)
        subLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        subLabel.numberOfLines = 0
        stack.addArrangedSubview(subLabel)

        NSLayoutConstraint.activate([
            stack.topAnchor.constraint(equalTo: container.topAnchor, constant: 14),
            stack.leadingAnchor.constraint(equalTo: container.leadingAnchor, constant: 14),
            stack.trailingAnchor.constraint(equalTo: container.trailingAnchor, constant: -14),
            stack.bottomAnchor.constraint(equalTo: container.bottomAnchor, constant: -14)
        ])

        contentStackView.addArrangedSubview(container)
    }

    // MARK: - KPI Statistics Cards
    private func setupKpiCards() {
        let gridContainer = UIStackView()
        gridContainer.axis = .vertical
        gridContainer.spacing = 10
        gridContainer.distribution = .fillEqually

        let row1 = UIStackView()
        row1.axis = .horizontal
        row1.spacing = 10
        row1.distribution = .fillEqually

        let row2 = UIStackView()
        row2.axis = .horizontal
        row2.spacing = 10
        row2.distribution = .fillEqually

        // Card 1: All Staff
        setupKpiBox(card: cardAllStaff, title: "All Staff", countLabel: countAllStaffLabel, color: UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0), statusFilter: "ALL")
        // Card 2: Active
        setupKpiBox(card: cardActive, title: "Active", countLabel: countActiveLabel, color: UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0), statusFilter: "ACTIVE")
        // Card 3: Invited
        setupKpiBox(card: cardInvited, title: "Invited", countLabel: countInvitedLabel, color: UIColor(red: 245/255, green: 158/255, blue: 11/255, alpha: 1.0), statusFilter: "INVITED")
        // Card 4: Terminated
        setupKpiBox(card: cardTerminated, title: "Terminated", countLabel: countTerminatedLabel, color: UIColor(red: 239/255, green: 68/255, blue: 68/255, alpha: 1.0), statusFilter: "TERMINATED")

        row1.addArrangedSubview(cardAllStaff)
        row1.addArrangedSubview(cardActive)
        row2.addArrangedSubview(cardInvited)
        row2.addArrangedSubview(cardTerminated)

        gridContainer.addArrangedSubview(row1)
        gridContainer.addArrangedSubview(row2)

        contentStackView.addArrangedSubview(gridContainer)
    }

    private func setupKpiBox(card: UIView, title: String, countLabel: UILabel, color: UIColor, statusFilter: String) {
        card.backgroundColor = .white
        card.layer.cornerRadius = 14
        card.layer.borderWidth = 1.5
        card.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        card.isUserInteractionEnabled = true
        card.translatesAutoresizingMaskIntoConstraints = false

        let tap = UITapGestureRecognizer(target: self, action: #selector(didTapKpiCard(_:)))
        card.addGestureRecognizer(tap)
        card.accessibilityIdentifier = statusFilter

        let stack = UIStackView()
        stack.axis = .vertical
        stack.spacing = 4
        stack.translatesAutoresizingMaskIntoConstraints = false
        card.addSubview(stack)

        let titleLabel = UILabel()
        titleLabel.text = title.uppercased()
        titleLabel.font = .systemFont(ofSize: 11, weight: .bold)
        titleLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        stack.addArrangedSubview(titleLabel)

        countLabel.text = "0"
        countLabel.font = .systemFont(ofSize: 22, weight: .heavy)
        countLabel.textColor = color
        stack.addArrangedSubview(countLabel)

        NSLayoutConstraint.activate([
            stack.topAnchor.constraint(equalTo: card.topAnchor, constant: 12),
            stack.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 14),
            stack.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -14),
            stack.bottomAnchor.constraint(equalTo: card.bottomAnchor, constant: -12)
        ])
    }

    @objc private func didTapKpiCard(_ gesture: UITapGestureRecognizer) {
        guard let view = gesture.view, let filter = view.accessibilityIdentifier else { return }
        selectedStatus = filter
        updateFilterTabsUI()
        applyFilters()
    }

    // MARK: - Filter Tabs Bar
    private func setupFilterTabs() {
        filterTabsScrollView.showsHorizontalScrollIndicator = false
        filterTabsScrollView.alwaysBounceHorizontal = true
        filterTabsScrollView.translatesAutoresizingMaskIntoConstraints = false
        filterTabsScrollView.heightAnchor.constraint(equalToConstant: 40).isActive = true

        filterTabsStackView.axis = .horizontal
        filterTabsStackView.spacing = 8
        filterTabsStackView.translatesAutoresizingMaskIntoConstraints = false
        filterTabsScrollView.addSubview(filterTabsStackView)

        NSLayoutConstraint.activate([
            filterTabsStackView.topAnchor.constraint(equalTo: filterTabsScrollView.topAnchor),
            filterTabsStackView.leadingAnchor.constraint(equalTo: filterTabsScrollView.leadingAnchor),
            filterTabsStackView.trailingAnchor.constraint(equalTo: filterTabsScrollView.trailingAnchor),
            filterTabsStackView.bottomAnchor.constraint(equalTo: filterTabsScrollView.bottomAnchor),
            filterTabsStackView.heightAnchor.constraint(equalTo: filterTabsScrollView.heightAnchor)
        ])

        contentStackView.addArrangedSubview(filterTabsScrollView)
        renderFilterTabButtons()
    }

    private let filterTabsList: [(label: String, value: String)] = [
        ("All", "ALL"),
        ("Active", "ACTIVE"),
        ("Invited", "INVITED"),
        ("Onboarding", "ONBOARDING"),
        ("Notice Period", "NOTICE_PERIOD"),
        ("Terminated", "TERMINATED"),
        ("Resigned", "RESIGNED")
    ]

    private func renderFilterTabButtons() {
        filterTabsStackView.arrangedSubviews.forEach { $0.removeFromSuperview() }

        for item in filterTabsList {
            let button = UIButton(type: .system)
            button.setTitle(item.label, for: .normal)
            button.titleLabel?.font = .systemFont(ofSize: 13, weight: .semibold)
            button.layer.cornerRadius = 10
            button.layer.borderWidth = 1
            button.contentEdgeInsets = UIEdgeInsets(top: 8, left: 14, bottom: 8, right: 14)
            button.accessibilityIdentifier = item.value
            button.addTarget(self, action: #selector(didSelectFilterTab(_:)), for: .touchUpInside)

            if selectedStatus == item.value {
                button.backgroundColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
                button.setTitleColor(.white, for: .normal)
                button.layer.borderColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0).cgColor
            } else {
                button.backgroundColor = .white
                button.setTitleColor(UIColor(red: 71/255, green: 85/255, blue: 105/255, alpha: 1.0), for: .normal)
                button.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
            }
            filterTabsStackView.addArrangedSubview(button)
        }
    }

    private func updateFilterTabsUI() {
        for subview in filterTabsStackView.arrangedSubviews {
            if let button = subview as? UIButton, let val = button.accessibilityIdentifier {
                if selectedStatus == val {
                    button.backgroundColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
                    button.setTitleColor(.white, for: .normal)
                    button.layer.borderColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0).cgColor
                } else {
                    button.backgroundColor = .white
                    button.setTitleColor(UIColor(red: 71/255, green: 85/255, blue: 105/255, alpha: 1.0), for: .normal)
                    button.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
                }
            }
        }

        // Highlight selected KPI Card
        cardAllStaff.layer.borderColor = (selectedStatus == "ALL")
            ? UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0).cgColor
            : UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor

        cardActive.layer.borderColor = (selectedStatus == "ACTIVE")
            ? UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0).cgColor
            : UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor

        cardInvited.layer.borderColor = (selectedStatus == "INVITED")
            ? UIColor(red: 245/255, green: 158/255, blue: 11/255, alpha: 1.0).cgColor
            : UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor

        cardTerminated.layer.borderColor = (selectedStatus == "TERMINATED")
            ? UIColor(red: 239/255, green: 68/255, blue: 68/255, alpha: 1.0).cgColor
            : UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
    }

    @objc private func didSelectFilterTab(_ sender: UIButton) {
        guard let val = sender.accessibilityIdentifier else { return }
        selectedStatus = val
        updateFilterTabsUI()
        applyFilters()
    }

    // MARK: - Search & Filter Row
    private func setupSearchAndFilterRow() {
        let container = UIStackView()
        container.axis = .vertical
        container.spacing = 10

        // Search Input
        let searchBox = UIView()
        searchBox.backgroundColor = .white
        searchBox.layer.cornerRadius = 12
        searchBox.layer.borderWidth = 1
        searchBox.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        searchBox.translatesAutoresizingMaskIntoConstraints = false
        searchBox.heightAnchor.constraint(equalToConstant: 44).isActive = true

        let icon = UIImageView(image: UIImage(systemName: "magnifyingglass"))
        icon.tintColor = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 1.0)
        icon.translatesAutoresizingMaskIntoConstraints = false
        searchBox.addSubview(icon)

        searchTextField.placeholder = "Search by name, email, or employee ID..."
        searchTextField.font = .systemFont(ofSize: 14, weight: .regular)
        searchTextField.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        searchTextField.clearButtonMode = .whileEditing
        searchTextField.autocapitalizationType = .none
        searchTextField.autocorrectionType = .no
        searchTextField.delegate = self
        searchTextField.addTarget(self, action: #selector(didChangeSearchText), for: .editingChanged)
        searchTextField.translatesAutoresizingMaskIntoConstraints = false
        searchBox.addSubview(searchTextField)

        NSLayoutConstraint.activate([
            icon.leadingAnchor.constraint(equalTo: searchBox.leadingAnchor, constant: 12),
            icon.centerYAnchor.constraint(equalTo: searchBox.centerYAnchor),
            icon.widthAnchor.constraint(equalToConstant: 18),
            icon.heightAnchor.constraint(equalToConstant: 18),

            searchTextField.leadingAnchor.constraint(equalTo: icon.trailingAnchor, constant: 10),
            searchTextField.trailingAnchor.constraint(equalTo: searchBox.trailingAnchor, constant: -12),
            searchTextField.centerYAnchor.constraint(equalTo: searchBox.centerYAnchor),
            searchTextField.heightAnchor.constraint(equalToConstant: 40)
        ])
        container.addArrangedSubview(searchBox)

        // Dropdown Pickers Row (Department & Role)
        let pickersRow = UIStackView()
        pickersRow.axis = .horizontal
        pickersRow.spacing = 10
        pickersRow.distribution = .fillEqually

        deptFilterButton.setTitle("Dept: All", for: .normal)
        deptFilterButton.titleLabel?.font = .systemFont(ofSize: 13, weight: .medium)
        deptFilterButton.setTitleColor(UIColor(red: 51/255, green: 65/255, blue: 85/255, alpha: 1.0), for: .normal)
        deptFilterButton.backgroundColor = .white
        deptFilterButton.layer.cornerRadius = 10
        deptFilterButton.layer.borderWidth = 1
        deptFilterButton.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        deptFilterButton.contentEdgeInsets = UIEdgeInsets(top: 8, left: 10, bottom: 8, right: 10)
        deptFilterButton.addTarget(self, action: #selector(didTapDepartmentFilter), for: .touchUpInside)

        roleFilterButton.setTitle("Role: All", for: .normal)
        roleFilterButton.titleLabel?.font = .systemFont(ofSize: 13, weight: .medium)
        roleFilterButton.setTitleColor(UIColor(red: 51/255, green: 65/255, blue: 85/255, alpha: 1.0), for: .normal)
        roleFilterButton.backgroundColor = .white
        roleFilterButton.layer.cornerRadius = 10
        roleFilterButton.layer.borderWidth = 1
        roleFilterButton.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        roleFilterButton.contentEdgeInsets = UIEdgeInsets(top: 8, left: 10, bottom: 8, right: 10)
        roleFilterButton.addTarget(self, action: #selector(didTapRoleFilter), for: .touchUpInside)

        pickersRow.addArrangedSubview(deptFilterButton)
        pickersRow.addArrangedSubview(roleFilterButton)
        container.addArrangedSubview(pickersRow)

        contentStackView.addArrangedSubview(container)
    }

    @objc private func didChangeSearchText() {
        searchTerm = searchTextField.text?.trimmingCharacters(in: .whitespaces) ?? ""
        applyFilters()
    }

    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        textField.resignFirstResponder()
        return true
    }

    @objc private func didTapDepartmentFilter() {
        let alert = UIAlertController(title: "Select Department", message: nil, preferredStyle: .actionSheet)
        alert.addAction(UIAlertAction(title: "All Departments", style: .default, handler: { [weak self] _ in
            self?.selectedDepartmentId = ""
            self?.deptFilterButton.setTitle("Dept: All", for: .normal)
            self?.applyFilters()
        }))

        for d in departments {
            let id = d["id"] as? String ?? ""
            let name = d["name"] as? String ?? "Department"
            alert.addAction(UIAlertAction(title: name, style: .default, handler: { [weak self] _ in
                self?.selectedDepartmentId = id
                self?.deptFilterButton.setTitle("Dept: \(name)", for: .normal)
                self?.applyFilters()
            }))
        }
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        present(alert, animated: true)
    }

    @objc private func didTapRoleFilter() {
        let alert = UIAlertController(title: "Select Role", message: nil, preferredStyle: .actionSheet)
        let roles: [(label: String, value: String)] = [
            ("All Roles", ""),
            ("Super Admin", "SUPER_ADMIN"),
            ("HR Head", "HR_HEAD"),
            ("Owner", "OWNER"),
            ("Manager", "MANAGER"),
            ("Employee", "EMPLOYEE")
        ]

        for r in roles {
            alert.addAction(UIAlertAction(title: r.label, style: .default, handler: { [weak self] _ in
                self?.selectedRole = r.value
                self?.roleFilterButton.setTitle(r.value.isEmpty ? "Role: All" : "Role: \(r.label)", for: .normal)
                self?.applyFilters()
            }))
        }
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        present(alert, animated: true)
    }

    // MARK: - Employees List Container
    private func setupEmployeesListContainer() {
        employeesStackView.axis = .vertical
        employeesStackView.spacing = 12
        employeesStackView.translatesAutoresizingMaskIntoConstraints = false
        contentStackView.addArrangedSubview(employeesStackView)

        // Loading indicator
        loadingIndicator.hidesWhenStopped = true
        contentStackView.addArrangedSubview(loadingIndicator)

        // Empty state view
        emptyStateView.backgroundColor = .white
        emptyStateView.layer.cornerRadius = 14
        emptyStateView.layer.borderWidth = 1
        emptyStateView.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        emptyStateView.isHidden = true
        emptyStateView.translatesAutoresizingMaskIntoConstraints = false

        let emptyStack = UIStackView()
        emptyStack.axis = .vertical
        emptyStack.spacing = 8
        emptyStack.alignment = .center
        emptyStack.translatesAutoresizingMaskIntoConstraints = false
        emptyStateView.addSubview(emptyStack)

        let emptyIcon = UIImageView(image: UIImage(systemName: "person.2.slash"))
        emptyIcon.tintColor = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 1.0)
        emptyIcon.translatesAutoresizingMaskIntoConstraints = false
        emptyIcon.widthAnchor.constraint(equalToConstant: 36).isActive = true
        emptyIcon.heightAnchor.constraint(equalToConstant: 36).isActive = true
        emptyStack.addArrangedSubview(emptyIcon)

        let emptyTitle = UILabel()
        emptyTitle.text = "No Employees Found"
        emptyTitle.font = .systemFont(ofSize: 16, weight: .bold)
        emptyTitle.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        emptyStack.addArrangedSubview(emptyTitle)

        let emptyMsg = UILabel()
        emptyMsg.text = "No team members matched your selected search criteria or status filter."
        emptyMsg.font = .systemFont(ofSize: 13, weight: .regular)
        emptyMsg.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        emptyMsg.textAlignment = .center
        emptyMsg.numberOfLines = 0
        emptyStack.addArrangedSubview(emptyMsg)

        let inviteEmptyBtn = UIButton(type: .system)
        inviteEmptyBtn.setTitle("+ Invite Employee", for: .normal)
        inviteEmptyBtn.titleLabel?.font = .systemFont(ofSize: 13, weight: .semibold)
        inviteEmptyBtn.setTitleColor(.white, for: .normal)
        inviteEmptyBtn.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        inviteEmptyBtn.layer.cornerRadius = 8
        inviteEmptyBtn.contentEdgeInsets = UIEdgeInsets(top: 8, left: 16, bottom: 8, right: 16)
        inviteEmptyBtn.addTarget(self, action: #selector(didTapInviteEmployee), for: .touchUpInside)
        emptyStack.addArrangedSubview(inviteEmptyBtn)

        NSLayoutConstraint.activate([
            emptyStack.topAnchor.constraint(equalTo: emptyStateView.topAnchor, constant: 32),
            emptyStack.leadingAnchor.constraint(equalTo: emptyStateView.leadingAnchor, constant: 20),
            emptyStack.trailingAnchor.constraint(equalTo: emptyStateView.trailingAnchor, constant: -20),
            emptyStack.bottomAnchor.constraint(equalTo: emptyStateView.bottomAnchor, constant: -32)
        ])

        contentStackView.addArrangedSubview(emptyStateView)
    }

    // MARK: - Data Fetching
    private func fetchDepartments() {
        AuthService.shared.getDepartments { [weak self] result in
            guard let self = self else { return }
            switch result {
            case .success(let depts):
                self.departments = depts
            case .failure:
                break
            }
        }
    }

    private func loadEmployeesData() {
        if !refreshControl.isRefreshing {
            loadingIndicator.startAnimating()
        }
        isLoading = true

        AuthService.shared.getEmployees { [weak self] result in
            guard let self = self else { return }
            self.isLoading = false
            self.loadingIndicator.stopAnimating()
            self.refreshControl.endRefreshing()

            switch result {
            case .success(let data):
                self.employees = data
                self.updateKpiCounters()
                self.applyFilters()
            case .failure(let error):
                print("Failed to load employees:", error)
            }
        }
    }

    @objc private func handlePullToRefresh() {
        fetchDepartments()
        loadEmployeesData()
    }

    private func updateKpiCounters() {
        let total = employees.count
        let active = employees.filter {
            let st = ($0["employmentStatus"] as? String) ?? "ACTIVE"
            return st == "ACTIVE" || st.isEmpty
        }.count
        let invited = employees.filter { ($0["employmentStatus"] as? String) == "INVITED" }.count
        let terminated = employees.filter {
            let st = ($0["employmentStatus"] as? String) ?? ""
            return st == "TERMINATED" || st == "RESIGNED"
        }.count

        countAllStaffLabel.text = "\(total)"
        countActiveLabel.text = "\(active)"
        countInvitedLabel.text = "\(invited)"
        countTerminatedLabel.text = "\(terminated)"
    }

    private func applyFilters() {
        filteredEmployees = employees.filter { emp in
            // Search
            let firstName = emp["firstName"] as? String ?? ""
            let lastName = emp["lastName"] as? String ?? ""
            let fullName = "\(firstName) \(lastName)".lowercased()
            let email = (emp["email"] as? String ?? "").lowercased()
            let code = (emp["employeeCode"] as? String ?? "").lowercased()

            let matchesSearch: Bool
            if searchTerm.isEmpty {
                matchesSearch = true
            } else {
                let term = searchTerm.lowercased()
                matchesSearch = fullName.contains(term) || email.contains(term) || code.contains(term)
            }

            // Status
            let empStatus = (emp["employmentStatus"] as? String) ?? "ACTIVE"
            let matchesStatus: Bool
            if selectedStatus == "ALL" {
                matchesStatus = true
            } else {
                matchesStatus = (empStatus == selectedStatus)
            }

            // Department
            let matchesDept: Bool
            if selectedDepartmentId.isEmpty {
                matchesDept = true
            } else {
                let deptId = emp["departmentId"] as? String ?? (emp["department"] as? [String: Any])?["id"] as? String ?? ""
                matchesDept = (deptId == selectedDepartmentId)
            }

            // Role
            let matchesRole: Bool
            if selectedRole.isEmpty {
                matchesRole = true
            } else {
                let r = emp["role"] as? String ?? ""
                matchesRole = (r == selectedRole)
            }

            return matchesSearch && matchesStatus && matchesDept && matchesRole
        }

        renderEmployeeCards()
    }

    // MARK: - Render Cards
    private func renderEmployeeCards() {
        employeesStackView.arrangedSubviews.forEach { $0.removeFromSuperview() }

        if filteredEmployees.isEmpty {
            emptyStateView.isHidden = false
            return
        }
        emptyStateView.isHidden = true

        for emp in filteredEmployees {
            let card = buildEmployeeCard(emp)
            employeesStackView.addArrangedSubview(card)
        }
    }

    private func buildEmployeeCard(_ emp: [String: Any]) -> UIView {
        let card = UIView()
        card.backgroundColor = .white
        card.layer.cornerRadius = 14
        card.layer.borderWidth = 1
        card.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        card.translatesAutoresizingMaskIntoConstraints = false

        let innerStack = UIStackView()
        innerStack.axis = .vertical
        innerStack.spacing = 12
        innerStack.translatesAutoresizingMaskIntoConstraints = false
        card.addSubview(innerStack)

        // Top Row: Avatar + Name/Role + Status Badge
        let topRow = UIStackView()
        topRow.axis = .horizontal
        topRow.spacing = 12
        topRow.alignment = .center

        // Avatar
        let firstName = emp["firstName"] as? String ?? ""
        let lastName = emp["lastName"] as? String ?? ""
        let initials = "\(firstName.prefix(1))\(lastName.prefix(1))".uppercased()

        let avatarView = UIView()
        avatarView.backgroundColor = colorForInitials(initials)
        avatarView.layer.cornerRadius = 20
        avatarView.translatesAutoresizingMaskIntoConstraints = false
        avatarView.widthAnchor.constraint(equalToConstant: 40).isActive = true
        avatarView.heightAnchor.constraint(equalToConstant: 40).isActive = true

        let avatarLabel = UILabel()
        avatarLabel.text = initials.isEmpty ? "E" : initials
        avatarLabel.textColor = .white
        avatarLabel.font = .systemFont(ofSize: 15, weight: .bold)
        avatarLabel.textAlignment = .center
        avatarLabel.translatesAutoresizingMaskIntoConstraints = false
        avatarView.addSubview(avatarLabel)
        avatarLabel.centerXAnchor.constraint(equalTo: avatarView.centerXAnchor).isActive = true
        avatarLabel.centerYAnchor.constraint(equalTo: avatarView.centerYAnchor).isActive = true
        topRow.addArrangedSubview(avatarView)

        // Name and Designation Stack
        let nameStack = UIStackView()
        nameStack.axis = .vertical
        nameStack.spacing = 2

        let nameLabel = UILabel()
        nameLabel.text = "\(firstName) \(lastName)".trimmingCharacters(in: .whitespaces)
        nameLabel.font = .systemFont(ofSize: 15, weight: .bold)
        nameLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        nameStack.addArrangedSubview(nameLabel)

        let desigName = (emp["designation"] as? [String: Any])?["name"] as? String ?? emp["role"] as? String ?? "Team Member"
        let desigLabel = UILabel()
        desigLabel.text = formatRoleOrDesig(desigName)
        desigLabel.font = .systemFont(ofSize: 12, weight: .medium)
        desigLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        nameStack.addArrangedSubview(desigLabel)
        topRow.addArrangedSubview(nameStack)

        let topSpacer = UIView()
        topSpacer.setContentHuggingPriority(.defaultLow, for: .horizontal)
        topSpacer.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)
        topRow.addArrangedSubview(topSpacer)

        // Status Badge Pill
        let status = (emp["employmentStatus"] as? String) ?? "ACTIVE"
        let statusPill = buildStatusPill(status: status)
        topRow.addArrangedSubview(statusPill)

        innerStack.addArrangedSubview(topRow)

        // Divider
        let divider = UIView()
        divider.backgroundColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0)
        divider.heightAnchor.constraint(equalToConstant: 1).isActive = true
        innerStack.addArrangedSubview(divider)

        // Middle Info: Email & Department & Code
        let infoStack = UIStackView()
        infoStack.axis = .vertical
        infoStack.spacing = 6

        let email = emp["email"] as? String ?? ""
        if !email.isEmpty {
            let emailRow = UIStackView()
            emailRow.axis = .horizontal
            emailRow.spacing = 6
            emailRow.alignment = .center

            let mailIcon = UIImageView(image: UIImage(systemName: "envelope"))
            mailIcon.tintColor = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 1.0)
            mailIcon.translatesAutoresizingMaskIntoConstraints = false
            mailIcon.widthAnchor.constraint(equalToConstant: 14).isActive = true
            mailIcon.heightAnchor.constraint(equalToConstant: 14).isActive = true
            emailRow.addArrangedSubview(mailIcon)

            let emailLabel = UILabel()
            emailLabel.text = email
            emailLabel.font = .systemFont(ofSize: 12, weight: .regular)
            emailLabel.textColor = UIColor(red: 71/255, green: 85/255, blue: 105/255, alpha: 1.0)
            emailRow.addArrangedSubview(emailLabel)
            infoStack.addArrangedSubview(emailRow)
        }

        let deptName = (emp["department"] as? [String: Any])?["name"] as? String ?? ""
        let empCode = emp["employeeCode"] as? String ?? ""

        let badgesRow = UIStackView()
        badgesRow.axis = .horizontal
        badgesRow.spacing = 8
        badgesRow.alignment = .center

        if !deptName.isEmpty {
            let deptPill = UILabel()
            deptPill.text = deptName
            deptPill.font = .systemFont(ofSize: 11, weight: .semibold)
            deptPill.textColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
            deptPill.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 0.08)
            deptPill.layer.cornerRadius = 6
            deptPill.layer.masksToBounds = true
            deptPill.textAlignment = .center
            deptPill.translatesAutoresizingMaskIntoConstraints = false
            deptPill.heightAnchor.constraint(equalToConstant: 22).isActive = true
            badgesRow.addArrangedSubview(deptPill)
        }

        if !empCode.isEmpty {
            let codeLabel = UILabel()
            codeLabel.text = "ID: \(empCode)"
            codeLabel.font = .systemFont(ofSize: 11, weight: .medium)
            codeLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
            badgesRow.addArrangedSubview(codeLabel)
        }

        let spacer = UIView()
        spacer.setContentHuggingPriority(.defaultLow, for: .horizontal)
        badgesRow.addArrangedSubview(spacer)

        infoStack.addArrangedSubview(badgesRow)
        innerStack.addArrangedSubview(infoStack)

        // Actions Row: Details, Deactivate, Resend Invite
        let actionsRow = UIStackView()
        actionsRow.axis = .horizontal
        actionsRow.spacing = 8
        actionsRow.distribution = .fillProportionally

        let empId = emp["id"] as? String ?? ""

        if status == "INVITED" {
            let resendBtn = UIButton(type: .system)
            resendBtn.setTitle("Resend Invite", for: .normal)
            resendBtn.titleLabel?.font = .systemFont(ofSize: 12, weight: .semibold)
            resendBtn.setTitleColor(UIColor(red: 245/255, green: 158/255, blue: 11/255, alpha: 1.0), for: .normal)
            resendBtn.backgroundColor = UIColor(red: 254/255, green: 243/255, blue: 199/255, alpha: 0.8)
            resendBtn.layer.cornerRadius = 8
            resendBtn.contentEdgeInsets = UIEdgeInsets(top: 6, left: 10, bottom: 6, right: 10)
            resendBtn.addAction(UIAction(handler: { [weak self] _ in
                self?.handleResendInvite(employeeId: empId, email: email)
            }), for: .touchUpInside)
            actionsRow.addArrangedSubview(resendBtn)
        }

        let detailsBtn = UIButton(type: .system)
        detailsBtn.setTitle("Details", for: .normal)
        detailsBtn.titleLabel?.font = .systemFont(ofSize: 12, weight: .semibold)
        detailsBtn.setTitleColor(UIColor(red: 51/255, green: 65/255, blue: 85/255, alpha: 1.0), for: .normal)
        detailsBtn.backgroundColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0)
        detailsBtn.layer.cornerRadius = 8
        detailsBtn.contentEdgeInsets = UIEdgeInsets(top: 6, left: 12, bottom: 6, right: 12)
        detailsBtn.addAction(UIAction(handler: { [weak self] _ in
            self?.presentDetailsModal(for: emp)
        }), for: .touchUpInside)
        actionsRow.addArrangedSubview(detailsBtn)

        let deleteBtn = UIButton(type: .system)
        deleteBtn.setTitle("Deactivate", for: .normal)
        deleteBtn.titleLabel?.font = .systemFont(ofSize: 12, weight: .semibold)
        deleteBtn.setTitleColor(UIColor(red: 239/255, green: 68/255, blue: 68/255, alpha: 1.0), for: .normal)
        deleteBtn.backgroundColor = UIColor(red: 254/255, green: 242/255, blue: 242/255, alpha: 1.0)
        deleteBtn.layer.cornerRadius = 8
        deleteBtn.contentEdgeInsets = UIEdgeInsets(top: 6, left: 10, bottom: 6, right: 10)
        deleteBtn.addAction(UIAction(handler: { [weak self] _ in
            self?.handleDeleteEmployee(employeeId: empId, name: "\(firstName) \(lastName)")
        }), for: .touchUpInside)
        actionsRow.addArrangedSubview(deleteBtn)

        innerStack.addArrangedSubview(actionsRow)

        NSLayoutConstraint.activate([
            innerStack.topAnchor.constraint(equalTo: card.topAnchor, constant: 14),
            innerStack.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 14),
            innerStack.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -14),
            innerStack.bottomAnchor.constraint(equalTo: card.bottomAnchor, constant: -14)
        ])

        return card
    }

    private func buildStatusPill(status: String) -> UIView {
        let pill = UIStackView()
        pill.axis = .horizontal
        pill.spacing = 4
        pill.alignment = .center
        pill.layer.cornerRadius = 6
        pill.layer.borderWidth = 1
        pill.isLayoutMarginsRelativeArrangement = true
        pill.layoutMargins = UIEdgeInsets(top: 3, left: 8, bottom: 3, right: 8)
        pill.setContentHuggingPriority(.required, for: .horizontal)
        pill.setContentCompressionResistancePriority(.required, for: .horizontal)

        let dot = UIView()
        dot.layer.cornerRadius = 3
        dot.translatesAutoresizingMaskIntoConstraints = false
        dot.widthAnchor.constraint(equalToConstant: 6).isActive = true
        dot.heightAnchor.constraint(equalToConstant: 6).isActive = true

        let label = UILabel()
        label.font = .systemFont(ofSize: 11, weight: .bold)

        switch status {
        case "ACTIVE":
            pill.backgroundColor = UIColor(red: 236/255, green: 253/255, blue: 245/255, alpha: 1.0)
            pill.layer.borderColor = UIColor(red: 167/255, green: 243/255, blue: 208/255, alpha: 1.0).cgColor
            dot.backgroundColor = UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0)
            label.textColor = UIColor(red: 4/255, green: 120/255, blue: 87/255, alpha: 1.0)
            label.text = "Active"
        case "INVITED":
            pill.backgroundColor = UIColor(red: 254/255, green: 243/255, blue: 199/255, alpha: 1.0)
            pill.layer.borderColor = UIColor(red: 253/255, green: 230/255, blue: 138/255, alpha: 1.0).cgColor
            dot.backgroundColor = UIColor(red: 245/255, green: 158/255, blue: 11/255, alpha: 1.0)
            label.textColor = UIColor(red: 180/255, green: 83/255, blue: 9/255, alpha: 1.0)
            label.text = "Invited"
        case "ONBOARDING":
            pill.backgroundColor = UIColor(red: 239/255, green: 246/255, blue: 255/255, alpha: 1.0)
            pill.layer.borderColor = UIColor(red: 191/255, green: 219/255, blue: 254/255, alpha: 1.0).cgColor
            dot.backgroundColor = UIColor(red: 59/255, green: 130/255, blue: 246/255, alpha: 1.0)
            label.textColor = UIColor(red: 29/255, green: 78/255, blue: 216/255, alpha: 1.0)
            label.text = "Onboarding"
        case "NOTICE_PERIOD":
            pill.backgroundColor = UIColor(red: 250/255, green: 245/255, blue: 255/255, alpha: 1.0)
            pill.layer.borderColor = UIColor(red: 233/255, green: 213/255, blue: 255/255, alpha: 1.0).cgColor
            dot.backgroundColor = UIColor(red: 168/255, green: 85/255, blue: 247/255, alpha: 1.0)
            label.textColor = UIColor(red: 126/255, green: 34/255, blue: 206/255, alpha: 1.0)
            label.text = "Notice Period"
        case "TERMINATED":
            pill.backgroundColor = UIColor(red: 254/255, green: 242/255, blue: 242/255, alpha: 1.0)
            pill.layer.borderColor = UIColor(red: 254/255, green: 202/255, blue: 202/255, alpha: 1.0).cgColor
            dot.backgroundColor = UIColor(red: 239/255, green: 68/255, blue: 68/255, alpha: 1.0)
            label.textColor = UIColor(red: 185/255, green: 28/255, blue: 28/255, alpha: 1.0)
            label.text = "Terminated"
        case "RESIGNED":
            pill.backgroundColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0)
            pill.layer.borderColor = UIColor(red: 203/255, green: 213/255, blue: 225/255, alpha: 1.0).cgColor
            dot.backgroundColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
            label.textColor = UIColor(red: 51/255, green: 65/255, blue: 85/255, alpha: 1.0)
            label.text = "Resigned"
        default:
            pill.backgroundColor = UIColor(red: 236/255, green: 253/255, blue: 245/255, alpha: 1.0)
            pill.layer.borderColor = UIColor(red: 167/255, green: 243/255, blue: 208/255, alpha: 1.0).cgColor
            dot.backgroundColor = UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0)
            label.textColor = UIColor(red: 4/255, green: 120/255, blue: 87/255, alpha: 1.0)
            label.text = "Active"
        }

        pill.addArrangedSubview(dot)
        pill.addArrangedSubview(label)
        return pill
    }

    private func colorForInitials(_ initials: String) -> UIColor {
        let colors: [UIColor] = [
            UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0),
            UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0),
            UIColor(red: 139/255, green: 92/255, blue: 246/255, alpha: 1.0),
            UIColor(red: 245/255, green: 158/255, blue: 11/255, alpha: 1.0),
            UIColor(red: 236/255, green: 72/255, blue: 153/255, alpha: 1.0)
        ]
        let hash = abs(initials.hashValue) % colors.count
        return colors[hash]
    }

    private func formatRoleOrDesig(_ raw: String) -> String {
        return raw.replacingOccurrences(of: "_", with: " ").capitalized
    }

    // MARK: - Actions: Resend Invite & Delete
    private func handleResendInvite(employeeId: String, email: String) {
        let hud = UIAlertController(title: "Resending Invitation", message: "Please wait...", preferredStyle: .alert)
        present(hud, animated: true)

        AuthService.shared.resendEmployeeInvite(employeeId: employeeId) { [weak self] result in
            hud.dismiss(animated: true) {
                switch result {
                case .success:
                    let alert = UIAlertController(title: "Invitation Sent", message: "Invitation email resent successfully to \(email)", preferredStyle: .alert)
                    alert.addAction(UIAlertAction(title: "OK", style: .default))
                    self?.present(alert, animated: true)
                case .failure(let err):
                    let alert = UIAlertController(title: "Failed to Resend", message: err.localizedDescription, preferredStyle: .alert)
                    alert.addAction(UIAlertAction(title: "OK", style: .default))
                    self?.present(alert, animated: true)
                }
            }
        }
    }

    private func handleDeleteEmployee(employeeId: String, name: String) {
        let confirm = UIAlertController(title: "Deactivate Employee", message: "Are you sure you want to deactivate and remove \(name) from the organization directory?", preferredStyle: .alert)
        confirm.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        confirm.addAction(UIAlertAction(title: "Deactivate", style: .destructive, handler: { [weak self] _ in
            guard let self = self else { return }
            AuthService.shared.deleteEmployee(employeeId: employeeId) { [weak self] result in
                switch result {
                case .success:
                    self?.employees.removeAll { ($0["id"] as? String) == employeeId }
                    self?.updateKpiCounters()
                    self?.applyFilters()
                case .failure(let err):
                    let alert = UIAlertController(title: "Error", message: err.localizedDescription, preferredStyle: .alert)
                    alert.addAction(UIAlertAction(title: "OK", style: .default))
                    self?.present(alert, animated: true)
                }
            }
        }))
        present(confirm, animated: true)
    }

    // MARK: - "+ Invite Employee" Modal
    @objc private func didTapInviteEmployee() {
        let inviteVC = InviteEmployeeModalViewController(departments: departments) { [weak self] in
            self?.loadEmployeesData()
        }
        inviteVC.modalPresentationStyle = .pageSheet
        if #available(iOS 15.0, *) {
            if let sheet = inviteVC.sheetPresentationController {
                sheet.detents = [.medium(), .large()]
                sheet.prefersGrabberVisible = true
            }
        }
        present(inviteVC, animated: true)
    }

    // MARK: - Employee Details Modal
    private func presentDetailsModal(for emp: [String: Any]) {
        let detailsVC = EmployeeDetailsModalViewController(employee: emp, departments: departments)
        detailsVC.modalPresentationStyle = .pageSheet
        if #available(iOS 15.0, *) {
            if let sheet = detailsVC.sheetPresentationController {
                sheet.detents = [.medium(), .large()]
                sheet.prefersGrabberVisible = true
            }
        }
        present(detailsVC, animated: true)
    }

    // MARK: - Navigation Handlers
    @objc private func didTapNotificationBell() {
        let notifVC = NotificationsViewController()
        notifVC.modalPresentationStyle = .fullScreen
        present(notifVC, animated: true)
    }

    @objc private func didTapAvatar() {
        let accountVC = AccountSettingsViewController()
        accountVC.modalPresentationStyle = .fullScreen
        present(accountVC, animated: true)
    }

    // MARK: - Bottom Navigation
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

            bottomNavContainer.leadingAnchor.constraint(greaterThanOrEqualTo: bottomNavBar.leadingAnchor),
            bottomNavContainer.trailingAnchor.constraint(lessThanOrEqualTo: bottomNavBar.trailingAnchor),
            bottomNavContainer.topAnchor.constraint(equalTo: bottomNavBar.topAnchor),
            bottomNavContainer.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor),
            bottomNavContainer.centerXAnchor.constraint(equalTo: bottomNavBar.centerXAnchor),
            bottomNavContainer.widthAnchor.constraint(lessThanOrEqualToConstant: 680)
        ])

        RoleNavigationManager.setupBottomNavBar(
            in: self,
            navBar: bottomNavBar,
            container: bottomNavContainer,
            activeTabId: "employees",
            scrollHandler: { [weak self] in
                self?.scrollView.setContentOffset(.zero, animated: true)
            }
        )
    }

    // MARK: - Scroll Delegate for Bottom Nav Auto-Hide
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
            UIView.animate(withDuration: 0.25, delay: 0, options: [.curveEaseInOut, .beginFromCurrentState]) {
                self.bottomNavBar.transform = CGAffineTransform(translationX: 0, y: translationY)
            }
        } else {
            self.bottomNavBar.transform = CGAffineTransform(translationX: 0, y: translationY)
        }
    }
}

// MARK: - Invite Employee Modal ViewController
class InviteEmployeeModalViewController: UIViewController {

    private let departments: [[String: Any]]
    private let onInviteSuccess: () -> Void

    private let firstNameField = UITextField()
    private let lastNameField = UITextField()
    private let emailField = UITextField()
    private let roleSegmentedControl = UISegmentedControl(items: ["Employee", "Manager", "HR Head", "Admin"])
    private let deptPickerButton = UIButton(type: .system)
    private var selectedDeptId: String? = nil
    private let submitButton = UIButton(type: .system)
    private let spinner = UIActivityIndicatorView(style: .medium)

    init(departments: [[String: Any]], onInviteSuccess: @escaping () -> Void) {
        self.departments = departments
        self.onInviteSuccess = onInviteSuccess
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white
        setupLayout()
    }

    private func setupLayout() {
        let stack = UIStackView()
        stack.axis = .vertical
        stack.spacing = 16
        stack.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(stack)

        // Title & Description
        let headerStack = UIStackView()
        headerStack.axis = .vertical
        headerStack.spacing = 4

        let titleLabel = UILabel()
        titleLabel.text = "Invite New Candidate"
        titleLabel.font = .systemFont(ofSize: 20, weight: .bold)
        titleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        headerStack.addArrangedSubview(titleLabel)

        let descLabel = UILabel()
        descLabel.text = "Enter candidate details. They will be added to the Onboarding Pipeline and directory."
        descLabel.font = .systemFont(ofSize: 13, weight: .regular)
        descLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        descLabel.numberOfLines = 0
        headerStack.addArrangedSubview(descLabel)
        stack.addArrangedSubview(headerStack)

        // Name Fields Row
        let nameRow = UIStackView()
        nameRow.axis = .horizontal
        nameRow.spacing = 12
        nameRow.distribution = .fillEqually

        setupTextField(firstNameField, placeholder: "First Name")
        setupTextField(lastNameField, placeholder: "Last Name")
        nameRow.addArrangedSubview(firstNameField)
        nameRow.addArrangedSubview(lastNameField)
        stack.addArrangedSubview(nameRow)

        // Email Field
        setupTextField(emailField, placeholder: "Work Email (e.g. name@globizhub.com)")
        emailField.keyboardType = .emailAddress
        emailField.autocapitalizationType = .none
        stack.addArrangedSubview(emailField)

        // Role Selector
        let roleTitle = UILabel()
        roleTitle.text = "Role"
        roleTitle.font = .systemFont(ofSize: 12, weight: .bold)
        roleTitle.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        stack.addArrangedSubview(roleTitle)

        roleSegmentedControl.selectedSegmentIndex = 0
        stack.addArrangedSubview(roleSegmentedControl)

        // Department Selector Button
        let deptTitle = UILabel()
        deptTitle.text = "Department"
        deptTitle.font = .systemFont(ofSize: 12, weight: .bold)
        deptTitle.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        stack.addArrangedSubview(deptTitle)

        deptPickerButton.setTitle("Select Department (Optional)", for: .normal)
        deptPickerButton.titleLabel?.font = .systemFont(ofSize: 14, weight: .medium)
        deptPickerButton.setTitleColor(UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0), for: .normal)
        deptPickerButton.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
        deptPickerButton.layer.cornerRadius = 10
        deptPickerButton.layer.borderWidth = 1
        deptPickerButton.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        deptPickerButton.contentHorizontalAlignment = .leading
        deptPickerButton.contentEdgeInsets = UIEdgeInsets(top: 12, left: 14, bottom: 12, right: 14)
        deptPickerButton.addTarget(self, action: #selector(didTapSelectDept), for: .touchUpInside)
        stack.addArrangedSubview(deptPickerButton)

        // Submit Button
        submitButton.setTitle("Send Invitation", for: .normal)
        submitButton.titleLabel?.font = .systemFont(ofSize: 15, weight: .bold)
        submitButton.setTitleColor(.white, for: .normal)
        submitButton.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        submitButton.layer.cornerRadius = 12
        submitButton.contentEdgeInsets = UIEdgeInsets(top: 14, left: 16, bottom: 14, right: 16)
        submitButton.addTarget(self, action: #selector(didSubmitInvitation), for: .touchUpInside)
        stack.addArrangedSubview(submitButton)

        spinner.hidesWhenStopped = true
        spinner.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(spinner)

        NSLayoutConstraint.activate([
            stack.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 24),
            stack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            stack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),

            spinner.centerXAnchor.constraint(equalTo: submitButton.centerXAnchor),
            spinner.centerYAnchor.constraint(equalTo: submitButton.centerYAnchor)
        ])
    }

    private func setupTextField(_ tf: UITextField, placeholder: String) {
        tf.placeholder = placeholder
        tf.font = .systemFont(ofSize: 14, weight: .regular)
        tf.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
        tf.layer.cornerRadius = 10
        tf.layer.borderWidth = 1
        tf.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        tf.leftView = UIView(frame: CGRect(x: 0, y: 0, width: 12, height: 44))
        tf.leftViewMode = .always
        tf.heightAnchor.constraint(equalToConstant: 44).isActive = true
    }

    @objc private func didTapSelectDept() {
        let sheet = UIAlertController(title: "Select Department", message: nil, preferredStyle: .actionSheet)
        sheet.addAction(UIAlertAction(title: "None (Unassigned)", style: .default, handler: { [weak self] _ in
            self?.selectedDeptId = nil
            self?.deptPickerButton.setTitle("Select Department (Optional)", for: .normal)
        }))
        for d in departments {
            let id = d["id"] as? String ?? ""
            let name = d["name"] as? String ?? "Department"
            sheet.addAction(UIAlertAction(title: name, style: .default, handler: { [weak self] _ in
                self?.selectedDeptId = id
                self?.deptPickerButton.setTitle(name, for: .normal)
            }))
        }
        sheet.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        present(sheet, animated: true)
    }

    @objc private func didSubmitInvitation() {
        let fn = firstNameField.text?.trimmingCharacters(in: .whitespaces) ?? ""
        let ln = lastNameField.text?.trimmingCharacters(in: .whitespaces) ?? ""
        let email = emailField.text?.trimmingCharacters(in: .whitespaces) ?? ""

        guard !fn.isEmpty else {
            showAlert("First name is required.")
            return
        }
        guard !ln.isEmpty else {
            showAlert("Last name is required.")
            return
        }
        guard !email.isEmpty, email.contains("@") else {
            showAlert("Please enter a valid work email address.")
            return
        }

        let rolesMap = ["EMPLOYEE", "MANAGER", "HR_HEAD", "SUPER_ADMIN"]
        let selectedRole = rolesMap[roleSegmentedControl.selectedSegmentIndex]

        submitButton.setTitle("", for: .normal)
        spinner.startAnimating()
        submitButton.isEnabled = false

        AuthService.shared.inviteEmployee(firstName: fn, lastName: ln, email: email, role: selectedRole, departmentId: selectedDeptId) { [weak self] result in
            guard let self = self else { return }
            self.spinner.stopAnimating()
            self.submitButton.setTitle("Send Invitation", for: .normal)
            self.submitButton.isEnabled = true

            switch result {
            case .success:
                self.dismiss(animated: true) {
                    self.onInviteSuccess()
                }
            case .failure(let err):
                self.showAlert(err.localizedDescription)
            }
        }
    }

    private func showAlert(_ message: String) {
        let alert = UIAlertController(title: "Notice", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
}

// MARK: - Employee Details Modal ViewController
class EmployeeDetailsModalViewController: UIViewController {

    private let employee: [String: Any]
    private let departments: [[String: Any]]

    init(employee: [String: Any], departments: [[String: Any]]) {
        self.employee = employee
        self.departments = departments
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white
        setupLayout()
    }

    private func setupLayout() {
        let stack = UIStackView()
        stack.axis = .vertical
        stack.spacing = 16
        stack.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(stack)

        let fn = employee["firstName"] as? String ?? ""
        let ln = employee["lastName"] as? String ?? ""
        let email = employee["email"] as? String ?? ""
        let role = employee["role"] as? String ?? "EMPLOYEE"
        let status = employee["employmentStatus"] as? String ?? "ACTIVE"
        let code = employee["employeeCode"] as? String ?? "Unassigned"
        let dept = (employee["department"] as? [String: Any])?["name"] as? String ?? "Unassigned"

        // Title
        let titleLabel = UILabel()
        titleLabel.text = "\(fn) \(ln)"
        titleLabel.font = .systemFont(ofSize: 20, weight: .bold)
        titleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        stack.addArrangedSubview(titleLabel)

        // Detail Rows
        addDetailRow(to: stack, label: "Work Email", value: email)
        addDetailRow(to: stack, label: "Employee ID", value: code)
        addDetailRow(to: stack, label: "Role", value: role.replacingOccurrences(of: "_", with: " ").capitalized)
        addDetailRow(to: stack, label: "Department", value: dept)
        addDetailRow(to: stack, label: "Status", value: status)

        // Close Button
        let closeBtn = UIButton(type: .system)
        closeBtn.setTitle("Done", for: .normal)
        closeBtn.titleLabel?.font = .systemFont(ofSize: 15, weight: .bold)
        closeBtn.setTitleColor(.white, for: .normal)
        closeBtn.backgroundColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        closeBtn.layer.cornerRadius = 10
        closeBtn.contentEdgeInsets = UIEdgeInsets(top: 12, left: 16, bottom: 12, right: 16)
        closeBtn.addAction(UIAction(handler: { [weak self] _ in
            self?.dismiss(animated: true)
        }), for: .touchUpInside)
        stack.addArrangedSubview(closeBtn)

        NSLayoutConstraint.activate([
            stack.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 24),
            stack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            stack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20)
        ])
    }

    private func addDetailRow(to stack: UIStackView, label: String, value: String) {
        let row = UIStackView()
        row.axis = .horizontal
        row.distribution = .equalSpacing

        let l = UILabel()
        l.text = label
        l.font = .systemFont(ofSize: 13, weight: .medium)
        l.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        row.addArrangedSubview(l)

        let v = UILabel()
        v.text = value
        v.font = .systemFont(ofSize: 14, weight: .semibold)
        v.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        row.addArrangedSubview(v)

        stack.addArrangedSubview(row)
    }
}
