//
//  PayrollViewController.swift
//  App
//
//  Complete Payroll Processing and Administration dashboard matching the web portal.
//

import UIKit

class PayrollViewController: UIViewController, UIScrollViewDelegate, UITextFieldDelegate {

    // MARK: - UI Components
    private let topBar = UIView()
    private let topBarContainer = UIView()
    private let topBarTitleLabel = UILabel()
    private let notificationBellButton = UIButton(type: .system)
    private let notificationBadgeDot = UIView()
    private let avatarContainer = UIView()
    private let avatarInitialsLabel = UILabel()
    private let btnRunPayrollHeader = UIButton(type: .system)

    private let scrollView = UIScrollView()
    private let refreshControl = UIRefreshControl()
    private let contentView = UIView()
    private let contentStackView = UIStackView()

    // Period Selector
    private let periodContainer = UIView()
    private let periodLabel = UILabel()
    private let btnChangePeriod = UIButton(type: .system)

    // KPI Cards
    private let cardNetPayout = UIView()
    private let cardDeductions = UIView()
    private let cardProcessed = UIView()
    private let cardOnHold = UIView()
    private let amountNetPayoutLabel = UILabel()
    private let amountDeductionsLabel = UILabel()
    private let countProcessedLabel = UILabel()
    private let countOnHoldLabel = UILabel()

    // Filter Tabs
    private let filterTabsScroll = UIScrollView()
    private let filterTabsStack = UIStackView()
    private var filterButtons: [String: UIButton] = [:]

    // Search Bar
    private let searchContainer = UIView()
    private let searchTextField = UITextField()
    private let searchClearButton = UIButton(type: .system)

    // Payroll List
    private let payrollListContainer = UIStackView()
    private let loadingIndicator = UIActivityIndicatorView(style: .medium)
    private let emptyStateView = UIView()

    // Bottom Navigation
    private let bottomNavBar = UIView()
    private let bottomNavContainer = UIView()

    // Modals
    private var activeModalOverlay: UIView?

    // MARK: - Data State
    private var selectedMonth: Int = Calendar.current.component(.month, from: Date())
    private var selectedYear: Int = Calendar.current.component(.year, from: Date())
    private var allPayrolls: [[String: Any]] = []
    private var filteredPayrolls: [[String: Any]] = []
    private var companyEmployees: [[String: Any]] = []
    private var selectedStatus: String = "ALL"
    private var searchQuery: String = ""
    private var isLoadingPayroll: Bool = false
    private var lastScrollOffsetY: CGFloat = 0
    private var isNavBarHidden: Bool = false

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
        navigationController?.setNavigationBarHidden(true, animated: false)

        setupTopBar()
        setupScrollView()
        setupHeaderBanner()
        setupPeriodSelector()
        setupKpiCards()
        setupFilterTabs()
        setupSearchRow()
        setupPayrollListContainer()
        setupBottomNavBar()

        fetchEmployeesList()
        loadPayrollData()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        if !AuthService.shared.isApprovedEmployee() {
            dismiss(animated: false, completion: nil)
            return
        }
        setupBottomNavBar()
        view.bringSubviewToFront(bottomNavBar)
        updateHeaderState()
        loadPayrollData()
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

        topBarTitleLabel.text = "Payroll Processing"
        topBarTitleLabel.font = .systemFont(ofSize: 20, weight: .bold)
        topBarTitleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        brandHeaderStack.addArrangedSubview(topBarTitleLabel)

        let rightActionsStack = UIStackView()
        rightActionsStack.axis = .horizontal
        rightActionsStack.spacing = 8
        rightActionsStack.alignment = .center
        rightActionsStack.translatesAutoresizingMaskIntoConstraints = false
        topBarContainer.addSubview(rightActionsStack)

        // Run Payroll Button
        btnRunPayrollHeader.setTitle("+ Run", for: .normal)
        btnRunPayrollHeader.titleLabel?.font = .systemFont(ofSize: 13, weight: .bold)
        btnRunPayrollHeader.setTitleColor(.white, for: .normal)
        btnRunPayrollHeader.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        btnRunPayrollHeader.layer.cornerRadius = 8
        btnRunPayrollHeader.contentEdgeInsets = UIEdgeInsets(top: 6, left: 10, bottom: 6, right: 10)
        btnRunPayrollHeader.addTarget(self, action: #selector(didTapRunPayrollModal), for: .touchUpInside)
        rightActionsStack.addArrangedSubview(btnRunPayrollHeader)

        // Notification Bell
        let bellConfig = UIImage.SymbolConfiguration(pointSize: 16, weight: .semibold)
        notificationBellButton.setImage(UIImage(systemName: "bell", withConfiguration: bellConfig), for: .normal)
        notificationBellButton.tintColor = UIColor(red: 71/255, green: 85/255, blue: 105/255, alpha: 1.0)
        notificationBellButton.backgroundColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0)
        notificationBellButton.layer.cornerRadius = 16
        notificationBellButton.addTarget(self, action: #selector(didTapNotificationBell), for: .touchUpInside)
        notificationBellButton.translatesAutoresizingMaskIntoConstraints = false
        rightActionsStack.addArrangedSubview(notificationBellButton)

        notificationBadgeDot.backgroundColor = UIColor(red: 239/255, green: 68/255, blue: 68/255, alpha: 1.0)
        notificationBadgeDot.layer.cornerRadius = 4
        notificationBadgeDot.layer.borderWidth = 1.5
        notificationBadgeDot.layer.borderColor = UIColor.white.cgColor
        notificationBadgeDot.translatesAutoresizingMaskIntoConstraints = false
        notificationBadgeDot.isHidden = true
        notificationBellButton.addSubview(notificationBadgeDot)

        // Avatar
        avatarContainer.backgroundColor = UIColor(red: 224/255, green: 231/255, blue: 255/255, alpha: 1.0)
        avatarContainer.layer.cornerRadius = 16
        avatarContainer.layer.masksToBounds = true
        avatarContainer.translatesAutoresizingMaskIntoConstraints = false
        avatarContainer.isUserInteractionEnabled = true
        let avatarTap = UITapGestureRecognizer(target: self, action: #selector(didTapAvatar))
        avatarContainer.addGestureRecognizer(avatarTap)
        rightActionsStack.addArrangedSubview(avatarContainer)

        avatarInitialsLabel.text = "U"
        avatarInitialsLabel.font = .systemFont(ofSize: 13, weight: .bold)
        avatarInitialsLabel.textColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
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
        titleLabel.text = "Payroll Administration"
        titleLabel.font = .systemFont(ofSize: 17, weight: .bold)
        titleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        stack.addArrangedSubview(titleLabel)

        let subLabel = UILabel()
        subLabel.text = "Review, process, and disburse employee monthly salary cycles."
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

    // MARK: - Period Selector
    private func setupPeriodSelector() {
        periodContainer.backgroundColor = .white
        periodContainer.layer.cornerRadius = 12
        periodContainer.layer.borderWidth = 1
        periodContainer.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        periodContainer.translatesAutoresizingMaskIntoConstraints = false

        let row = UIStackView()
        row.axis = .horizontal
        row.spacing = 8
        row.alignment = .center
        row.translatesAutoresizingMaskIntoConstraints = false
        periodContainer.addSubview(row)

        let calIcon = UIImageView(image: UIImage(systemName: "calendar"))
        calIcon.tintColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        calIcon.contentMode = .scaleAspectFit
        calIcon.translatesAutoresizingMaskIntoConstraints = false
        calIcon.widthAnchor.constraint(equalToConstant: 18).isActive = true
        calIcon.heightAnchor.constraint(equalToConstant: 18).isActive = true
        row.addArrangedSubview(calIcon)

        updatePeriodLabel()
        periodLabel.font = .systemFont(ofSize: 14, weight: .bold)
        periodLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        row.addArrangedSubview(periodLabel)

        let spacer = UIView()
        spacer.setContentHuggingPriority(.defaultLow, for: .horizontal)
        row.addArrangedSubview(spacer)

        btnChangePeriod.setTitle("Change Cycle", for: .normal)
        btnChangePeriod.titleLabel?.font = .systemFont(ofSize: 12, weight: .semibold)
        btnChangePeriod.setTitleColor(UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0), for: .normal)
        btnChangePeriod.backgroundColor = UIColor(red: 238/255, green: 242/255, blue: 255/255, alpha: 1.0)
        btnChangePeriod.layer.cornerRadius = 6
        btnChangePeriod.contentEdgeInsets = UIEdgeInsets(top: 4, left: 10, bottom: 4, right: 10)
        btnChangePeriod.addTarget(self, action: #selector(didTapChangePeriod), for: .touchUpInside)
        row.addArrangedSubview(btnChangePeriod)

        NSLayoutConstraint.activate([
            periodContainer.heightAnchor.constraint(equalToConstant: 46),
            row.topAnchor.constraint(equalTo: periodContainer.topAnchor),
            row.bottomAnchor.constraint(equalTo: periodContainer.bottomAnchor),
            row.leadingAnchor.constraint(equalTo: periodContainer.leadingAnchor, constant: 14),
            row.trailingAnchor.constraint(equalTo: periodContainer.trailingAnchor, constant: -14)
        ])

        contentStackView.addArrangedSubview(periodContainer)
    }

    private func updatePeriodLabel() {
        let monthName = DateFormatter().monthSymbols[selectedMonth - 1]
        periodLabel.text = "Pay Cycle: \(monthName) \(selectedYear)"
    }

    @objc private func didTapChangePeriod() {
        let alert = UIAlertController(title: "Select Pay Cycle", message: "Choose month and year for payroll processing", preferredStyle: .actionSheet)

        let months = DateFormatter().monthSymbols ?? []
        for (idx, mName) in months.enumerated() {
            let mVal = idx + 1
            alert.addAction(UIAlertAction(title: "\(mName) \(selectedYear)", style: .default, handler: { [weak self] _ in
                guard let self = self else { return }
                self.selectedMonth = mVal
                self.updatePeriodLabel()
                self.loadPayrollData()
            }))
        }

        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        if let popover = alert.popoverPresentationController {
            popover.sourceView = btnChangePeriod
            popover.sourceRect = btnChangePeriod.bounds
        }
        present(alert, animated: true)
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

        setupKpiBox(card: cardNetPayout, title: "Net Payout", countLabel: amountNetPayoutLabel, color: UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0), statusFilter: "ALL")
        setupKpiBox(card: cardDeductions, title: "Deductions", countLabel: amountDeductionsLabel, color: UIColor(red: 239/255, green: 68/255, blue: 68/255, alpha: 1.0), statusFilter: "ALL")
        setupKpiBox(card: cardProcessed, title: "Processed", countLabel: countProcessedLabel, color: UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0), statusFilter: "APPROVED")
        setupKpiBox(card: cardOnHold, title: "On Hold", countLabel: countOnHoldLabel, color: UIColor(red: 245/255, green: 158/255, blue: 11/255, alpha: 1.0), statusFilter: "HELD")

        row1.addArrangedSubview(cardNetPayout)
        row1.addArrangedSubview(cardDeductions)
        row2.addArrangedSubview(cardProcessed)
        row2.addArrangedSubview(cardOnHold)

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

        countLabel.text = "₹0"
        countLabel.font = .systemFont(ofSize: 20, weight: .heavy)
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

    // MARK: - Filter Tabs
    private func setupFilterTabs() {
        filterTabsScroll.showsHorizontalScrollIndicator = false
        filterTabsScroll.alwaysBounceHorizontal = true
        filterTabsScroll.translatesAutoresizingMaskIntoConstraints = false

        filterTabsStack.axis = .horizontal
        filterTabsStack.spacing = 8
        filterTabsStack.translatesAutoresizingMaskIntoConstraints = false
        filterTabsScroll.addSubview(filterTabsStack)

        NSLayoutConstraint.activate([
            filterTabsStack.topAnchor.constraint(equalTo: filterTabsScroll.topAnchor),
            filterTabsStack.leadingAnchor.constraint(equalTo: filterTabsScroll.leadingAnchor),
            filterTabsStack.trailingAnchor.constraint(equalTo: filterTabsScroll.trailingAnchor),
            filterTabsStack.bottomAnchor.constraint(equalTo: filterTabsScroll.bottomAnchor),
            filterTabsStack.heightAnchor.constraint(equalTo: filterTabsScroll.heightAnchor),
            filterTabsScroll.heightAnchor.constraint(equalToConstant: 40)
        ])

        let tabs = [
            ("ALL", "All Records"),
            ("APPROVED", "Processed"),
            ("DRAFT", "Pending / Draft"),
            ("HELD", "On Hold")
        ]

        for (key, title) in tabs {
            let btn = UIButton(type: .system)
            btn.setTitle(title, for: .normal)
            btn.titleLabel?.font = .systemFont(ofSize: 13, weight: .semibold)
            btn.layer.cornerRadius = 20
            btn.layer.borderWidth = 1
            btn.contentEdgeInsets = UIEdgeInsets(top: 8, left: 16, bottom: 8, right: 16)
            btn.accessibilityIdentifier = key
            btn.addTarget(self, action: #selector(didTapFilterTab(_:)), for: .touchUpInside)
            filterButtons[key] = btn
            filterTabsStack.addArrangedSubview(btn)
        }

        updateFilterTabsUI()
        contentStackView.addArrangedSubview(filterTabsScroll)
    }

    private func updateFilterTabsUI() {
        for (key, btn) in filterButtons {
            let isSelected = (key == selectedStatus)
            if isSelected {
                btn.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
                btn.setTitleColor(.white, for: .normal)
                btn.layer.borderColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0).cgColor
            } else {
                btn.backgroundColor = .white
                btn.setTitleColor(UIColor(red: 71/255, green: 85/255, blue: 105/255, alpha: 1.0), for: .normal)
                btn.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
            }
        }
    }

    @objc private func didTapFilterTab(_ sender: UIButton) {
        guard let key = sender.accessibilityIdentifier else { return }
        selectedStatus = key
        updateFilterTabsUI()
        applyFilters()
    }

    // MARK: - Search Row
    private func setupSearchRow() {
        searchContainer.backgroundColor = .white
        searchContainer.layer.cornerRadius = 12
        searchContainer.layer.borderWidth = 1
        searchContainer.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        searchContainer.translatesAutoresizingMaskIntoConstraints = false

        let searchIcon = UIImageView(image: UIImage(systemName: "magnifyingglass"))
        searchIcon.tintColor = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 1.0)
        searchIcon.contentMode = .scaleAspectFit
        searchIcon.translatesAutoresizingMaskIntoConstraints = false
        searchContainer.addSubview(searchIcon)

        searchTextField.placeholder = "Search employee by name, code, email..."
        searchTextField.font = .systemFont(ofSize: 14)
        searchTextField.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        searchTextField.clearButtonMode = .whileEditing
        searchTextField.autocorrectionType = .no
        searchTextField.autocapitalizationType = .none
        searchTextField.delegate = self
        searchTextField.addTarget(self, action: #selector(searchTextChanged), for: .editingChanged)
        searchTextField.translatesAutoresizingMaskIntoConstraints = false
        searchContainer.addSubview(searchTextField)

        NSLayoutConstraint.activate([
            searchContainer.heightAnchor.constraint(equalToConstant: 44),

            searchIcon.leadingAnchor.constraint(equalTo: searchContainer.leadingAnchor, constant: 12),
            searchIcon.centerYAnchor.constraint(equalTo: searchContainer.centerYAnchor),
            searchIcon.widthAnchor.constraint(equalToConstant: 18),
            searchIcon.heightAnchor.constraint(equalToConstant: 18),

            searchTextField.leadingAnchor.constraint(equalTo: searchIcon.trailingAnchor, constant: 8),
            searchTextField.trailingAnchor.constraint(equalTo: searchContainer.trailingAnchor, constant: -12),
            searchTextField.centerYAnchor.constraint(equalTo: searchContainer.centerYAnchor)
        ])

        contentStackView.addArrangedSubview(searchContainer)
    }

    @objc private func searchTextChanged() {
        searchQuery = searchTextField.text?.trimmingCharacters(in: .whitespacesAndNewlines).lowercased() ?? ""
        applyFilters()
    }

    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        textField.resignFirstResponder()
        return true
    }

    // MARK: - Payroll List Container
    private func setupPayrollListContainer() {
        payrollListContainer.axis = .vertical
        payrollListContainer.spacing = 12
        payrollListContainer.translatesAutoresizingMaskIntoConstraints = false

        loadingIndicator.hidesWhenStopped = true
        loadingIndicator.color = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        loadingIndicator.translatesAutoresizingMaskIntoConstraints = false

        emptyStateView.backgroundColor = .white
        emptyStateView.layer.cornerRadius = 14
        emptyStateView.layer.borderWidth = 1
        emptyStateView.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        emptyStateView.isHidden = true
        emptyStateView.translatesAutoresizingMaskIntoConstraints = false

        let emptyStack = UIStackView()
        emptyStack.axis = .vertical
        emptyStack.alignment = .center
        emptyStack.spacing = 8
        emptyStack.translatesAutoresizingMaskIntoConstraints = false
        emptyStateView.addSubview(emptyStack)

        let iconConfig = UIImage.SymbolConfiguration(pointSize: 32, weight: .medium)
        let emptyIcon = UIImageView(image: UIImage(systemName: "banknote", withConfiguration: iconConfig))
        emptyIcon.tintColor = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 1.0)
        emptyStack.addArrangedSubview(emptyIcon)

        let emptyTitle = UILabel()
        emptyTitle.text = "No payroll records found"
        emptyTitle.font = .systemFont(ofSize: 15, weight: .bold)
        emptyTitle.textColor = UIColor(red: 30/255, green: 41/255, blue: 59/255, alpha: 1.0)
        emptyStack.addArrangedSubview(emptyTitle)

        let emptySub = UILabel()
        emptySub.text = "Run the payroll engine to generate salaries for this pay cycle."
        emptySub.font = .systemFont(ofSize: 13, weight: .regular)
        emptySub.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        emptySub.textAlignment = .center
        emptyStack.addArrangedSubview(emptySub)

        let btnRunEmpty = UIButton(type: .system)
        btnRunEmpty.setTitle("+ Run Payroll Now", for: .normal)
        btnRunEmpty.titleLabel?.font = .systemFont(ofSize: 13, weight: .bold)
        btnRunEmpty.setTitleColor(.white, for: .normal)
        btnRunEmpty.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        btnRunEmpty.layer.cornerRadius = 8
        btnRunEmpty.contentEdgeInsets = UIEdgeInsets(top: 8, left: 16, bottom: 8, right: 16)
        btnRunEmpty.addTarget(self, action: #selector(didTapRunPayrollModal), for: .touchUpInside)
        emptyStack.addArrangedSubview(btnRunEmpty)

        NSLayoutConstraint.activate([
            emptyStack.topAnchor.constraint(equalTo: emptyStateView.topAnchor, constant: 32),
            emptyStack.leadingAnchor.constraint(equalTo: emptyStateView.leadingAnchor, constant: 16),
            emptyStack.trailingAnchor.constraint(equalTo: emptyStateView.trailingAnchor, constant: -16),
            emptyStack.bottomAnchor.constraint(equalTo: emptyStateView.bottomAnchor, constant: -32)
        ])

        contentStackView.addArrangedSubview(loadingIndicator)
        contentStackView.addArrangedSubview(emptyStateView)
        contentStackView.addArrangedSubview(payrollListContainer)
    }

    // MARK: - Data Loading & Filtering
    private func fetchEmployeesList() {
        AuthService.shared.getEmployees { [weak self] result in
            guard let self = self else { return }
            if case .success(let emps) = result {
                self.companyEmployees = emps
            }
        }
    }

    @objc private func handlePullToRefresh() {
        loadPayrollData()
    }

    private func loadPayrollData() {
        if isLoadingPayroll { return }
        isLoadingPayroll = true
        loadingIndicator.startAnimating()

        AuthService.shared.getCompanyPayrolls(month: selectedMonth, year: selectedYear) { [weak self] result in
            guard let self = self else { return }
            self.isLoadingPayroll = false
            self.loadingIndicator.stopAnimating()
            self.refreshControl.endRefreshing()

            switch result {
            case .success(let payrolls):
                if payrolls.isEmpty && ProcessInfo.processInfo.arguments.contains("-testRoutePayroll") {
                    self.allPayrolls = [
                        [
                            "id": "demo-payroll-1",
                            "status": "APPROVED",
                            "month": self.selectedMonth,
                            "year": self.selectedYear,
                            "basicPay": 50000.0,
                            "allowances": 45000.0,
                            "deductions": 10000.0,
                            "netSalary": 85000.0,
                            "totalWorkingDays": 31,
                            "presentDays": 29,
                            "unpaidLeaves": 0,
                            "employee": [
                                "id": "emp-1",
                                "firstName": "Monowar",
                                "lastName": "Safi",
                                "employeeCode": "EMP-001",
                                "email": "monowar@globizhub.com"
                            ]
                        ],
                        [
                            "id": "demo-payroll-2",
                            "status": "PAID",
                            "month": self.selectedMonth,
                            "year": self.selectedYear,
                            "basicPay": 55000.0,
                            "allowances": 40000.0,
                            "deductions": 10000.0,
                            "netSalary": 85000.0,
                            "totalWorkingDays": 31,
                            "presentDays": 28,
                            "unpaidLeaves": 1,
                            "employee": [
                                "id": "emp-2",
                                "firstName": "David",
                                "lastName": "Miller",
                                "employeeCode": "EMP-002",
                                "email": "david.m@globizhub.com"
                            ]
                        ],
                        [
                            "id": "demo-payroll-3",
                            "status": "HELD",
                            "month": self.selectedMonth,
                            "year": self.selectedYear,
                            "basicPay": 40000.0,
                            "allowances": 30000.0,
                            "deductions": 5000.0,
                            "netSalary": 65000.0,
                            "totalWorkingDays": 31,
                            "presentDays": 25,
                            "unpaidLeaves": 2,
                            "holdReason": "Pending clearance of asset return and IT compliance documents.",
                            "employee": [
                                "id": "emp-3",
                                "firstName": "Sarah",
                                "lastName": "Jenkins",
                                "employeeCode": "EMP-004",
                                "email": "sarah.j@globizhub.com"
                            ]
                        ]
                    ]
                } else {
                    self.allPayrolls = payrolls
                }
                self.updateKpiCounts()
                self.applyFilters()
            case .failure(let error):
                print("Failed to fetch company payroll: \(error)")
                self.emptyStateView.isHidden = false
            }
        }
    }

    private func updateKpiCounts() {
        var totalPayout: Double = 0
        var totalDeductions: Double = 0
        var processedCount = 0
        var heldCount = 0
        var draftCount = 0

        for r in allPayrolls {
            let net = r["netSalary"] as? Double ?? 0
            let ded = r["deductions"] as? Double ?? 0
            let status = (r["status"] as? String ?? "").uppercased()

            totalPayout += net
            totalDeductions += ded

            if status == "APPROVED" || status == "PAID" {
                processedCount += 1
            } else if status == "HELD" {
                heldCount += 1
            } else {
                draftCount += 1
            }
        }

        amountNetPayoutLabel.text = formatCurrency(totalPayout)
        amountDeductionsLabel.text = formatCurrency(totalDeductions)
        countProcessedLabel.text = "\(processedCount)"
        countOnHoldLabel.text = "\(heldCount)"

        filterButtons["ALL"]?.setTitle("All (\(allPayrolls.count))", for: .normal)
        filterButtons["APPROVED"]?.setTitle("Processed (\(processedCount))", for: .normal)
        filterButtons["DRAFT"]?.setTitle("Pending (\(draftCount))", for: .normal)
        filterButtons["HELD"]?.setTitle("On Hold (\(heldCount))", for: .normal)
    }

    private func formatCurrency(_ value: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencySymbol = "₹"
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: value)) ?? "₹\(Int(value))"
    }

    private func applyFilters() {
        filteredPayrolls = allPayrolls.filter { item in
            let status = (item["status"] as? String ?? "").uppercased()

            // Filter by tab
            if selectedStatus == "APPROVED" && !(status == "APPROVED" || status == "PAID") {
                return false
            } else if selectedStatus == "DRAFT" && !(status == "DRAFT" || status == "PENDING") {
                return false
            } else if selectedStatus == "HELD" && status != "HELD" {
                return false
            }

            // Search query filter
            if !searchQuery.isEmpty {
                let emp = item["employee"] as? [String: Any]
                let firstName = (emp?["firstName"] as? String ?? "").lowercased()
                let lastName = (emp?["lastName"] as? String ?? "").lowercased()
                let code = (emp?["employeeCode"] as? String ?? "").lowercased()
                let email = (emp?["email"] as? String ?? "").lowercased()

                let matches = firstName.contains(searchQuery) ||
                              lastName.contains(searchQuery) ||
                              code.contains(searchQuery) ||
                              email.contains(searchQuery)

                if !matches { return false }
            }

            return true
        }

        renderPayrollList()
    }

    private func renderPayrollList() {
        for sub in payrollListContainer.arrangedSubviews {
            sub.removeFromSuperview()
        }

        if filteredPayrolls.isEmpty {
            emptyStateView.isHidden = false
        } else {
            emptyStateView.isHidden = true
            for record in filteredPayrolls {
                let card = createPayrollRecordCard(record: record)
                payrollListContainer.addArrangedSubview(card)
            }
        }
    }

    // MARK: - Payroll Record Card
    private func createPayrollRecordCard(record: [String: Any]) -> UIView {
        let card = UIView()
        card.backgroundColor = .white
        card.layer.cornerRadius = 14
        card.layer.borderWidth = 1
        card.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        card.layer.shadowColor = UIColor.black.cgColor
        card.layer.shadowOpacity = 0.02
        card.layer.shadowOffset = CGSize(width: 0, height: 1)
        card.layer.shadowRadius = 3
        card.translatesAutoresizingMaskIntoConstraints = false

        let cardStack = UIStackView()
        cardStack.axis = .vertical
        cardStack.spacing = 12
        cardStack.translatesAutoresizingMaskIntoConstraints = false
        card.addSubview(cardStack)

        let recordId = record["id"] as? String ?? ""
        let status = (record["status"] as? String ?? "DRAFT").uppercased()
        let basicPay = record["basicPay"] as? Double ?? 0
        let allowances = record["allowances"] as? Double ?? 0
        let deductions = record["deductions"] as? Double ?? 0
        let netSalary = record["netSalary"] as? Double ?? 0
        let grossEarnings = basicPay + allowances
        let presentDays = record["presentDays"] as? Int ?? 30
        let totalWorkingDays = record["totalWorkingDays"] as? Int ?? 31
        let unpaidLeaves = record["unpaidLeaves"] as? Int ?? 0
        let holdReason = record["holdReason"] as? String

        let emp = record["employee"] as? [String: Any]
        let firstName = emp?["firstName"] as? String ?? "Staff"
        let lastName = emp?["lastName"] as? String ?? ""
        let fullName = "\(firstName) \(lastName)".trimmingCharacters(in: .whitespacesAndNewlines)
        let employeeCode = emp?["employeeCode"] as? String ?? ""
        let email = emp?["email"] as? String ?? ""

        // Top Row: Avatar + Name & Code + Status Pill
        let topRow = UIStackView()
        topRow.axis = .horizontal
        topRow.spacing = 10
        topRow.alignment = .center
        topRow.translatesAutoresizingMaskIntoConstraints = false

        let avatarView = UIView()
        avatarView.backgroundColor = UIColor(red: 238/255, green: 242/255, blue: 255/255, alpha: 1.0)
        avatarView.layer.cornerRadius = 18
        avatarView.translatesAutoresizingMaskIntoConstraints = false
        avatarView.widthAnchor.constraint(equalToConstant: 36).isActive = true
        avatarView.heightAnchor.constraint(equalToConstant: 36).isActive = true

        let avatarLabel = UILabel()
        avatarLabel.text = String(firstName.prefix(1)).uppercased()
        avatarLabel.font = .systemFont(ofSize: 14, weight: .bold)
        avatarLabel.textColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        avatarLabel.translatesAutoresizingMaskIntoConstraints = false
        avatarView.addSubview(avatarLabel)
        avatarLabel.centerXAnchor.constraint(equalTo: avatarView.centerXAnchor).isActive = true
        avatarLabel.centerYAnchor.constraint(equalTo: avatarView.centerYAnchor).isActive = true
        topRow.addArrangedSubview(avatarView)

        let nameStack = UIStackView()
        nameStack.axis = .vertical
        nameStack.spacing = 2
        nameStack.translatesAutoresizingMaskIntoConstraints = false

        let nameLabel = UILabel()
        nameLabel.text = fullName.isEmpty ? "Employee" : fullName
        nameLabel.font = .systemFont(ofSize: 15, weight: .bold)
        nameLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        nameStack.addArrangedSubview(nameLabel)

        let subtitleLabel = UILabel()
        var subParts: [String] = []
        if !employeeCode.isEmpty { subParts.append(employeeCode) }
        if !email.isEmpty { subParts.append(email) }
        subtitleLabel.text = subParts.joined(separator: " · ")
        subtitleLabel.font = .systemFont(ofSize: 12, weight: .regular)
        subtitleLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        nameStack.addArrangedSubview(subtitleLabel)
        topRow.addArrangedSubview(nameStack)

        let spacer = UIView()
        spacer.setContentHuggingPriority(.defaultLow, for: .horizontal)
        topRow.addArrangedSubview(spacer)

        let statusPill = createStatusPill(status: status)
        statusPill.setContentHuggingPriority(.required, for: .horizontal)
        topRow.addArrangedSubview(statusPill)
        cardStack.addArrangedSubview(topRow)

        // Middle Section: Net Payout Banner & Days
        let payoutRow = UIStackView()
        payoutRow.axis = .horizontal
        payoutRow.alignment = .center
        payoutRow.distribution = .equalSpacing
        payoutRow.translatesAutoresizingMaskIntoConstraints = false

        let netStack = UIStackView()
        netStack.axis = .vertical
        netStack.spacing = 2

        let netTitle = UILabel()
        netTitle.text = "NET SALARY".uppercased()
        netTitle.font = .systemFont(ofSize: 10, weight: .bold)
        netTitle.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        netStack.addArrangedSubview(netTitle)

        let netAmount = UILabel()
        netAmount.text = formatCurrency(netSalary)
        netAmount.font = .systemFont(ofSize: 22, weight: .heavy)
        netAmount.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        netStack.addArrangedSubview(netAmount)
        payoutRow.addArrangedSubview(netStack)

        let daysStack = UIStackView()
        daysStack.axis = .vertical
        daysStack.alignment = .trailing
        daysStack.spacing = 3

        let daysLabel = UILabel()
        daysLabel.text = "\(presentDays) / \(totalWorkingDays) working days"
        daysLabel.font = .systemFont(ofSize: 12, weight: .medium)
        daysLabel.textColor = UIColor(red: 71/255, green: 85/255, blue: 105/255, alpha: 1.0)
        daysStack.addArrangedSubview(daysLabel)

        if unpaidLeaves > 0 {
            let lopPill = createTagPill(text: "\(unpaidLeaves) LOP Days", bgColor: UIColor(red: 254/255, green: 242/255, blue: 242/255, alpha: 1.0), textColor: UIColor(red: 220/255, green: 38/255, blue: 38/255, alpha: 1.0))
            daysStack.addArrangedSubview(lopPill)
        }
        payoutRow.addArrangedSubview(daysStack)
        cardStack.addArrangedSubview(payoutRow)

        // Breakdown Summary Row
        let breakdownRow = UIStackView()
        breakdownRow.axis = .horizontal
        breakdownRow.spacing = 8
        breakdownRow.distribution = .fillEqually
        breakdownRow.translatesAutoresizingMaskIntoConstraints = false

        let grossPill = createTagPill(text: "Gross: \(formatCurrency(grossEarnings))", bgColor: UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0), textColor: UIColor(red: 51/255, green: 65/255, blue: 85/255, alpha: 1.0))
        let dedPill = createTagPill(text: "Deductions: - \(formatCurrency(deductions))", bgColor: UIColor(red: 254/255, green: 242/255, blue: 242/255, alpha: 1.0), textColor: UIColor(red: 220/255, green: 38/255, blue: 38/255, alpha: 1.0))

        breakdownRow.addArrangedSubview(grossPill)
        breakdownRow.addArrangedSubview(dedPill)
        cardStack.addArrangedSubview(breakdownRow)

        // Hold Reason Callout (if HELD)
        if status == "HELD", let reason = holdReason, !reason.isEmpty {
            let holdBox = UIView()
            holdBox.backgroundColor = UIColor(red: 254/255, green: 242/255, blue: 242/255, alpha: 1.0)
            holdBox.layer.cornerRadius = 8
            holdBox.layer.borderWidth = 1
            holdBox.layer.borderColor = UIColor(red: 254/255, green: 202/255, blue: 202/255, alpha: 1.0).cgColor
            holdBox.translatesAutoresizingMaskIntoConstraints = false

            let holdText = UILabel()
            holdText.text = "Hold Reason: \(reason)"
            holdText.font = .systemFont(ofSize: 12, weight: .medium)
            holdText.textColor = UIColor(red: 220/255, green: 38/255, blue: 38/255, alpha: 1.0)
            holdText.numberOfLines = 0
            holdText.translatesAutoresizingMaskIntoConstraints = false
            holdBox.addSubview(holdText)

            NSLayoutConstraint.activate([
                holdText.topAnchor.constraint(equalTo: holdBox.topAnchor, constant: 8),
                holdText.leadingAnchor.constraint(equalTo: holdBox.leadingAnchor, constant: 10),
                holdText.trailingAnchor.constraint(equalTo: holdBox.trailingAnchor, constant: -10),
                holdText.bottomAnchor.constraint(equalTo: holdBox.bottomAnchor, constant: -8)
            ])
            cardStack.addArrangedSubview(holdBox)
        }

        // Actions Row
        let actionsRow = UIStackView()
        actionsRow.axis = .horizontal
        actionsRow.spacing = 8
        actionsRow.distribution = .fillEqually
        actionsRow.translatesAutoresizingMaskIntoConstraints = false

        let btnPayslip = UIButton(type: .system)
        btnPayslip.setTitle("Payslip", for: .normal)
        btnPayslip.titleLabel?.font = .systemFont(ofSize: 13, weight: .semibold)
        btnPayslip.setTitleColor(UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0), for: .normal)
        btnPayslip.backgroundColor = UIColor(red: 238/255, green: 242/255, blue: 255/255, alpha: 1.0)
        btnPayslip.layer.cornerRadius = 8
        btnPayslip.addTarget(self, action: #selector(didTapViewPayslip(_:)), for: .touchUpInside)
        btnPayslip.tag = allPayrolls.firstIndex(where: { ($0["id"] as? String) == recordId }) ?? 0
        actionsRow.addArrangedSubview(btnPayslip)

        if status == "DRAFT" {
            let btnApprove = UIButton(type: .system)
            btnApprove.setTitle("Approve", for: .normal)
            btnApprove.titleLabel?.font = .systemFont(ofSize: 13, weight: .bold)
            btnApprove.setTitleColor(.white, for: .normal)
            btnApprove.backgroundColor = UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0)
            btnApprove.layer.cornerRadius = 8
            btnApprove.accessibilityIdentifier = recordId
            btnApprove.addTarget(self, action: #selector(didTapApprovePayroll(_:)), for: .touchUpInside)
            actionsRow.addArrangedSubview(btnApprove)
        } else if status == "APPROVED" {
            let btnMarkPaid = UIButton(type: .system)
            btnMarkPaid.setTitle("Mark Paid", for: .normal)
            btnMarkPaid.titleLabel?.font = .systemFont(ofSize: 13, weight: .bold)
            btnMarkPaid.setTitleColor(.white, for: .normal)
            btnMarkPaid.backgroundColor = UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0)
            btnMarkPaid.layer.cornerRadius = 8
            btnMarkPaid.accessibilityIdentifier = recordId
            btnMarkPaid.addTarget(self, action: #selector(didTapMarkPaid(_:)), for: .touchUpInside)
            actionsRow.addArrangedSubview(btnMarkPaid)
        }

        if status == "HELD" {
            let btnRelease = UIButton(type: .system)
            btnRelease.setTitle("Release", for: .normal)
            btnRelease.titleLabel?.font = .systemFont(ofSize: 13, weight: .bold)
            btnRelease.setTitleColor(.white, for: .normal)
            btnRelease.backgroundColor = UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0)
            btnRelease.layer.cornerRadius = 8
            btnRelease.accessibilityIdentifier = recordId
            btnRelease.addTarget(self, action: #selector(didTapReleasePayroll(_:)), for: .touchUpInside)
            actionsRow.addArrangedSubview(btnRelease)
        } else if status != "PAID" {
            let btnHold = UIButton(type: .system)
            btnHold.setTitle("Hold", for: .normal)
            btnHold.titleLabel?.font = .systemFont(ofSize: 13, weight: .semibold)
            btnHold.setTitleColor(UIColor(red: 220/255, green: 38/255, blue: 38/255, alpha: 1.0), for: .normal)
            btnHold.backgroundColor = UIColor(red: 254/255, green: 242/255, blue: 242/255, alpha: 1.0)
            btnHold.layer.cornerRadius = 8
            btnHold.accessibilityIdentifier = recordId
            btnHold.addTarget(self, action: #selector(didTapHoldPayroll(_:)), for: .touchUpInside)
            actionsRow.addArrangedSubview(btnHold)
        }

        actionsRow.heightAnchor.constraint(equalToConstant: 36).isActive = true
        cardStack.addArrangedSubview(actionsRow)

        NSLayoutConstraint.activate([
            cardStack.topAnchor.constraint(equalTo: card.topAnchor, constant: 14),
            cardStack.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 14),
            cardStack.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -14),
            cardStack.bottomAnchor.constraint(equalTo: card.bottomAnchor, constant: -14)
        ])

        return card
    }

    private func createStatusPill(status: String) -> UIView {
        let pill = UIView()
        pill.layer.cornerRadius = 6
        pill.translatesAutoresizingMaskIntoConstraints = false

        let label = UILabel()
        label.text = status.uppercased()
        label.font = .systemFont(ofSize: 11, weight: .bold)
        label.translatesAutoresizingMaskIntoConstraints = false
        pill.addSubview(label)

        if status == "APPROVED" || status == "PAID" {
            pill.backgroundColor = UIColor(red: 209/255, green: 250/255, blue: 229/255, alpha: 1.0)
            label.textColor = UIColor(red: 5/255, green: 150/255, blue: 105/255, alpha: 1.0)
        } else if status == "HELD" {
            pill.backgroundColor = UIColor(red: 254/255, green: 226/255, blue: 226/255, alpha: 1.0)
            label.textColor = UIColor(red: 220/255, green: 38/255, blue: 38/255, alpha: 1.0)
        } else {
            // DRAFT / PENDING
            pill.backgroundColor = UIColor(red: 254/255, green: 243/255, blue: 199/255, alpha: 1.0)
            label.textColor = UIColor(red: 217/255, green: 119/255, blue: 6/255, alpha: 1.0)
        }

        NSLayoutConstraint.activate([
            label.topAnchor.constraint(equalTo: pill.topAnchor, constant: 4),
            label.leadingAnchor.constraint(equalTo: pill.leadingAnchor, constant: 8),
            label.trailingAnchor.constraint(equalTo: pill.trailingAnchor, constant: -8),
            label.bottomAnchor.constraint(equalTo: pill.bottomAnchor, constant: -4)
        ])

        return pill
    }

    private func createTagPill(text: String, bgColor: UIColor, textColor: UIColor) -> UIView {
        let pill = UIView()
        pill.backgroundColor = bgColor
        pill.layer.cornerRadius = 6
        pill.translatesAutoresizingMaskIntoConstraints = false

        let label = UILabel()
        label.text = text
        label.font = .systemFont(ofSize: 11, weight: .semibold)
        label.textColor = textColor
        label.translatesAutoresizingMaskIntoConstraints = false
        pill.addSubview(label)

        NSLayoutConstraint.activate([
            label.topAnchor.constraint(equalTo: pill.topAnchor, constant: 4),
            label.leadingAnchor.constraint(equalTo: pill.leadingAnchor, constant: 8),
            label.trailingAnchor.constraint(equalTo: pill.trailingAnchor, constant: -8),
            label.bottomAnchor.constraint(equalTo: pill.bottomAnchor, constant: -4)
        ])

        return pill
    }

    // MARK: - Actions (Approve, Mark Paid, Hold, Release, Run, Payslip)
    @objc private func didTapApprovePayroll(_ sender: UIButton) {
        guard let recordId = sender.accessibilityIdentifier, !recordId.isEmpty else { return }
        sender.isEnabled = false
        AuthService.shared.updatePayrollStatus(id: recordId, status: "APPROVED") { [weak self] _ in
            sender.isEnabled = true
            self?.showToast(message: "Payroll approved successfully")
            self?.loadPayrollData()
        }
    }

    @objc private func didTapMarkPaid(_ sender: UIButton) {
        guard let recordId = sender.accessibilityIdentifier, !recordId.isEmpty else { return }
        sender.isEnabled = false
        AuthService.shared.updatePayrollStatus(id: recordId, status: "PAID") { [weak self] _ in
            sender.isEnabled = true
            self?.showToast(message: "Marked as paid")
            self?.loadPayrollData()
        }
    }

    @objc private func didTapReleasePayroll(_ sender: UIButton) {
        guard let recordId = sender.accessibilityIdentifier, !recordId.isEmpty else { return }
        sender.isEnabled = false
        AuthService.shared.releasePayroll(id: recordId) { [weak self] _ in
            sender.isEnabled = true
            self?.showToast(message: "Payroll released from hold")
            self?.loadPayrollData()
        }
    }

    @objc private func didTapHoldPayroll(_ sender: UIButton) {
        guard let recordId = sender.accessibilityIdentifier, !recordId.isEmpty else { return }

        let alert = UIAlertController(title: "Hold Payroll", message: "Provide a reason for withholding this payout", preferredStyle: .alert)
        alert.addTextField { tf in
            tf.placeholder = "e.g. Asset return pending, documentation required"
        }
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        alert.addAction(UIAlertAction(title: "Confirm Hold", style: .destructive, handler: { [weak self] _ in
            let reason = alert.textFields?.first?.text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
            AuthService.shared.holdPayroll(id: recordId, reason: reason) { _ in
                self?.showToast(message: "Payroll placed on hold")
                self?.loadPayrollData()
            }
        }))
        present(alert, animated: true)
    }

    @objc private func didTapViewPayslip(_ sender: UIButton) {
        let index = sender.tag
        guard index >= 0 && index < allPayrolls.count else { return }
        let record = allPayrolls[index]
        let payslipVC = PayslipDetailViewController(payslip: record)
        payslipVC.modalPresentationStyle = .pageSheet
        present(payslipVC, animated: true)
    }

    @objc private func didTapRunPayrollModal() {
        if companyEmployees.isEmpty {
            fetchEmployeesList()
        }

        let alert = UIAlertController(title: "Run Payroll", message: "Select employee to generate payroll for cycle \(selectedMonth)/\(selectedYear)", preferredStyle: .actionSheet)

        if companyEmployees.isEmpty {
            alert.addAction(UIAlertAction(title: "All Active Employees", style: .default, handler: { [weak self] _ in
                self?.executeRunPayroll(employeeId: "all")
            }))
        } else {
            for emp in companyEmployees {
                let fn = emp["firstName"] as? String ?? "Staff"
                let ln = emp["lastName"] as? String ?? ""
                let code = emp["employeeCode"] as? String ?? ""
                let empId = emp["id"] as? String ?? ""
                let title = "\(fn) \(ln) (\(code.isEmpty ? "EMP" : code))"
                alert.addAction(UIAlertAction(title: title, style: .default, handler: { [weak self] _ in
                    self?.executeRunPayroll(employeeId: empId)
                }))
            }
        }

        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        if let popover = alert.popoverPresentationController {
            popover.sourceView = btnRunPayrollHeader
            popover.sourceRect = btnRunPayrollHeader.bounds
        }
        present(alert, animated: true)
    }

    private func executeRunPayroll(employeeId: String) {
        AuthService.shared.generatePayroll(employeeId: employeeId, month: selectedMonth, year: selectedYear) { [weak self] result in
            switch result {
            case .success:
                self?.showToast(message: "Payroll generated successfully")
                self?.loadPayrollData()
            case .failure(let err):
                self?.showToast(message: "Failed: \(err.localizedDescription)")
            }
        }
    }

    private func showToast(message: String) {
        let toast = UILabel()
        toast.text = message
        toast.font = .systemFont(ofSize: 13, weight: .semibold)
        toast.textColor = .white
        toast.backgroundColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 0.9)
        toast.textAlignment = .center
        toast.layer.cornerRadius = 18
        toast.layer.masksToBounds = true
        toast.alpha = 0
        toast.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(toast)

        NSLayoutConstraint.activate([
            toast.bottomAnchor.constraint(equalTo: bottomNavBar.topAnchor, constant: -16),
            toast.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            toast.heightAnchor.constraint(equalToConstant: 36),
            toast.widthAnchor.constraint(greaterThanOrEqualToConstant: 200)
        ])

        UIView.animate(withDuration: 0.25, animations: {
            toast.alpha = 1
        }, completion: { _ in
            UIView.animate(withDuration: 0.25, delay: 2.0, options: [], animations: {
                toast.alpha = 0
            }, completion: { _ in
                toast.removeFromSuperview()
            })
        })
    }

    // MARK: - Top Bar Actions
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
            activeTabId: "payroll",
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
        isNavBarHidden = hidden
        let translation = hidden ? 100 : 0
        if animated {
            UIView.animate(withDuration: 0.3, delay: 0, options: [.curveEaseInOut, .allowUserInteraction]) {
                self.bottomNavBar.transform = CGAffineTransform(translationX: 0, y: CGFloat(translation))
            }
        } else {
            bottomNavBar.transform = CGAffineTransform(translationX: 0, y: CGFloat(translation))
        }
    }
}
