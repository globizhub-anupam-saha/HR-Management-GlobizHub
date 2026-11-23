//
//  ApprovalsViewController.swift
//  App
//
//  Complete Leave Approvals parity with the web dashboard.
//

import UIKit

class ApprovalsViewController: UIViewController, UIScrollViewDelegate, UITextFieldDelegate {

    // MARK: - UI Components
    private let topBar = UIView()
    private let topBarContainer = UIView()
    private let topBarTitleLabel = UILabel()
    private let notificationBellButton = UIButton(type: .system)
    private let notificationBadgeDot = UIView()
    private let avatarContainer = UIView()
    private let avatarInitialsLabel = UILabel()

    private let scrollView = UIScrollView()
    private let refreshControl = UIRefreshControl()
    private let contentView = UIView()
    private let contentStackView = UIStackView()

    // KPI Cards
    private let cardPending = UIView()
    private let cardApproved = UIView()
    private let cardRejected = UIView()
    private let cardAll = UIView()
    private let countPendingLabel = UILabel()
    private let countApprovedLabel = UILabel()
    private let countRejectedLabel = UILabel()
    private let countAllLabel = UILabel()

    // Filter Tabs
    private let filterTabsScroll = UIScrollView()
    private let filterTabsStack = UIStackView()
    private var filterButtons: [String: UIButton] = [:]

    // Search Bar
    private let searchContainer = UIView()
    private let searchTextField = UITextField()
    private let searchClearButton = UIButton(type: .system)

    // Approvals List
    private let approvalsListContainer = UIStackView()
    private let loadingIndicator = UIActivityIndicatorView(style: .medium)
    private let emptyStateView = UIView()

    // Bottom Navigation
    private let bottomNavBar = UIView()
    private let bottomNavContainer = UIView()

    // Rejection Modal
    private var rejectionOverlay: UIView?
    private var pendingRejectionLeaveId: String?
    private var rejectionTextView: UITextView?

    // MARK: - Data State
    private var allLeaves: [[String: Any]] = []
    private var filteredLeaves: [[String: Any]] = []
    private var selectedStatus: String = "PENDING"
    private var searchQuery: String = ""
    private var isLoadingLeaves: Bool = false
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
        setupSearchRow()
        setupApprovalsListContainer()
        setupBottomNavBar()

        loadApprovalsData()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        setupBottomNavBar()
        view.bringSubviewToFront(bottomNavBar)
        updateHeaderState()
        loadApprovalsData()
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

        topBarTitleLabel.text = "Leave Approvals"
        topBarTitleLabel.font = .systemFont(ofSize: 20, weight: .bold)
        topBarTitleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        brandHeaderStack.addArrangedSubview(topBarTitleLabel)

        let rightActionsStack = UIStackView()
        rightActionsStack.axis = .horizontal
        rightActionsStack.spacing = 10
        rightActionsStack.alignment = .center
        rightActionsStack.translatesAutoresizingMaskIntoConstraints = false
        topBarContainer.addSubview(rightActionsStack)

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
        titleLabel.text = "Company Leave Requests"
        titleLabel.font = .systemFont(ofSize: 17, weight: .bold)
        titleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        stack.addArrangedSubview(titleLabel)

        let subLabel = UILabel()
        subLabel.text = "Review and manage pending time-off requests from your team members."
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

        setupKpiBox(card: cardPending, title: "Pending", countLabel: countPendingLabel, color: UIColor(red: 245/255, green: 158/255, blue: 11/255, alpha: 1.0), statusFilter: "PENDING")
        setupKpiBox(card: cardApproved, title: "Approved", countLabel: countApprovedLabel, color: UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0), statusFilter: "APPROVED")
        setupKpiBox(card: cardRejected, title: "Rejected", countLabel: countRejectedLabel, color: UIColor(red: 239/255, green: 68/255, blue: 68/255, alpha: 1.0), statusFilter: "REJECTED")
        setupKpiBox(card: cardAll, title: "All Requests", countLabel: countAllLabel, color: UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0), statusFilter: "ALL")

        row1.addArrangedSubview(cardPending)
        row1.addArrangedSubview(cardApproved)
        row2.addArrangedSubview(cardRejected)
        row2.addArrangedSubview(cardAll)

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
            ("PENDING", "Pending"),
            ("APPROVED", "Approved"),
            ("REJECTED", "Rejected"),
            ("ALL", "All")
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

        // Highlight selected KPI card border
        let kpiCards = [
            ("PENDING", cardPending),
            ("APPROVED", cardApproved),
            ("REJECTED", cardRejected),
            ("ALL", cardAll)
        ]
        for (key, card) in kpiCards {
            if key == selectedStatus {
                card.layer.borderColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0).cgColor
            } else {
                card.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
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

        searchTextField.placeholder = "Search by employee, email, type..."
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

    // MARK: - Approvals List Container
    private func setupApprovalsListContainer() {
        approvalsListContainer.axis = .vertical
        approvalsListContainer.spacing = 12
        approvalsListContainer.translatesAutoresizingMaskIntoConstraints = false

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
        let emptyIcon = UIImageView(image: UIImage(systemName: "calendar.badge.checkmark", withConfiguration: iconConfig))
        emptyIcon.tintColor = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 1.0)
        emptyStack.addArrangedSubview(emptyIcon)

        let emptyTitle = UILabel()
        emptyTitle.text = "No leave requests found"
        emptyTitle.font = .systemFont(ofSize: 15, weight: .bold)
        emptyTitle.textColor = UIColor(red: 30/255, green: 41/255, blue: 59/255, alpha: 1.0)
        emptyStack.addArrangedSubview(emptyTitle)

        let emptySub = UILabel()
        emptySub.text = "All employee leave applications are currently processed."
        emptySub.font = .systemFont(ofSize: 13, weight: .regular)
        emptySub.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        emptySub.textAlignment = .center
        emptyStack.addArrangedSubview(emptySub)

        NSLayoutConstraint.activate([
            emptyStack.topAnchor.constraint(equalTo: emptyStateView.topAnchor, constant: 36),
            emptyStack.leadingAnchor.constraint(equalTo: emptyStateView.leadingAnchor, constant: 16),
            emptyStack.trailingAnchor.constraint(equalTo: emptyStateView.trailingAnchor, constant: -16),
            emptyStack.bottomAnchor.constraint(equalTo: emptyStateView.bottomAnchor, constant: -36)
        ])

        contentStackView.addArrangedSubview(loadingIndicator)
        contentStackView.addArrangedSubview(emptyStateView)
        contentStackView.addArrangedSubview(approvalsListContainer)
    }

    // MARK: - Data Loading & Filtering
    @objc private func handlePullToRefresh() {
        loadApprovalsData()
    }

    private func loadApprovalsData() {
        if isLoadingLeaves { return }
        isLoadingLeaves = true
        loadingIndicator.startAnimating()

        AuthService.shared.getCompanyLeaves { [weak self] result in
            guard let self = self else { return }
            self.isLoadingLeaves = false
            self.loadingIndicator.stopAnimating()
            self.refreshControl.endRefreshing()

            switch result {
            case .success(let leaves):
                if leaves.isEmpty && ProcessInfo.processInfo.arguments.contains("-testRouteApprovals") {
                    self.allLeaves = [
                        [
                            "id": "demo-leave-1",
                            "status": "PENDING",
                            "type": "CASUAL",
                            "startDate": "2026-12-01T00:00:00.000Z",
                            "endDate": "2026-12-03T00:00:00.000Z",
                            "totalDays": 2,
                            "reason": "Attending family wedding and travel commitments.",
                            "employee": [
                                "firstName": "Sarah",
                                "lastName": "Jenkins",
                                "employeeCode": "EMP-004",
                                "email": "sarah.j@globizhub.com"
                            ]
                        ],
                        [
                            "id": "demo-leave-2",
                            "status": "APPROVED",
                            "type": "MEDICAL",
                            "startDate": "2026-11-15T00:00:00.000Z",
                            "endDate": "2026-11-17T00:00:00.000Z",
                            "totalDays": 3,
                            "reason": "Medical procedure and doctor-advised recovery.",
                            "employee": [
                                "firstName": "David",
                                "lastName": "Miller",
                                "employeeCode": "EMP-002",
                                "email": "david.m@globizhub.com"
                            ]
                        ],
                        [
                            "id": "demo-leave-3",
                            "status": "REJECTED",
                            "type": "UNPAID",
                            "startDate": "2026-11-10T00:00:00.000Z",
                            "endDate": "2026-11-14T00:00:00.000Z",
                            "totalDays": 5,
                            "reason": "Personal vacation during release cycle.",
                            "rejectionReason": "Critical project release milestone and team coverage constraints.",
                            "employee": [
                                "firstName": "Alex",
                                "lastName": "Wong",
                                "employeeCode": "EMP-005",
                                "email": "alex.w@globizhub.com"
                            ]
                        ]
                    ]
                } else {
                    self.allLeaves = leaves
                }
                self.updateKpiCounts()
                self.applyFilters()
            case .failure(let error):
                print("Failed to fetch company leaves: \(error)")
                self.emptyStateView.isHidden = false
            }
        }
    }

    private func updateKpiCounts() {
        var pendingCount = 0
        var approvedCount = 0
        var rejectedCount = 0

        for l in allLeaves {
            let status = (l["status"] as? String ?? "").uppercased()
            if status == "PENDING" {
                pendingCount += 1
            } else if status == "APPROVED" {
                approvedCount += 1
            } else if status == "REJECTED" {
                rejectedCount += 1
            }
        }

        countPendingLabel.text = "\(pendingCount)"
        countApprovedLabel.text = "\(approvedCount)"
        countRejectedLabel.text = "\(rejectedCount)"
        countAllLabel.text = "\(allLeaves.count)"

        // Update tab titles with counts
        filterButtons["PENDING"]?.setTitle("Pending (\(pendingCount))", for: .normal)
        filterButtons["APPROVED"]?.setTitle("Approved (\(approvedCount))", for: .normal)
        filterButtons["REJECTED"]?.setTitle("Rejected (\(rejectedCount))", for: .normal)
        filterButtons["ALL"]?.setTitle("All (\(allLeaves.count))", for: .normal)
    }

    private func applyFilters() {
        filteredLeaves = allLeaves.filter { item in
            let status = (item["status"] as? String ?? "").uppercased()

            // Status filter
            if selectedStatus != "ALL" && status != selectedStatus {
                return false
            }

            // Search query filter
            if !searchQuery.isEmpty {
                let emp = item["employee"] as? [String: Any]
                let firstName = (emp?["firstName"] as? String ?? "").lowercased()
                let lastName = (emp?["lastName"] as? String ?? "").lowercased()
                let code = (emp?["employeeCode"] as? String ?? "").lowercased()
                let email = (emp?["email"] as? String ?? "").lowercased()
                let leaveType = (item["type"] as? String ?? "").lowercased()
                let reason = (item["reason"] as? String ?? "").lowercased()

                let matches = firstName.contains(searchQuery) ||
                              lastName.contains(searchQuery) ||
                              code.contains(searchQuery) ||
                              email.contains(searchQuery) ||
                              leaveType.contains(searchQuery) ||
                              reason.contains(searchQuery)

                if !matches { return false }
            }

            return true
        }

        renderApprovalsList()
    }

    private func renderApprovalsList() {
        for sub in approvalsListContainer.arrangedSubviews {
            sub.removeFromSuperview()
        }

        if filteredLeaves.isEmpty {
            emptyStateView.isHidden = false
        } else {
            emptyStateView.isHidden = true
            for leave in filteredLeaves {
                let card = createLeaveApprovalCard(leave: leave)
                approvalsListContainer.addArrangedSubview(card)
            }
        }
    }

    // MARK: - Card Construction
    private func createLeaveApprovalCard(leave: [String: Any]) -> UIView {
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

        let leaveId = leave["id"] as? String ?? ""
        let status = (leave["status"] as? String ?? "PENDING").uppercased()
        let leaveType = (leave["type"] as? String ?? "LEAVE").uppercased()
        let startDate = leave["startDate"] as? String ?? ""
        let endDate = leave["endDate"] as? String ?? ""
        let totalDays = leave["totalDays"] as? Int ?? (leave["days"] as? Int ?? 1)
        let reason = leave["reason"] as? String ?? "No reason provided"
        let rejectionReason = leave["rejectionReason"] as? String

        let emp = leave["employee"] as? [String: Any]
        let firstName = emp?["firstName"] as? String ?? "Staff"
        let lastName = emp?["lastName"] as? String ?? ""
        let fullName = "\(firstName) \(lastName)".trimmingCharacters(in: .whitespacesAndNewlines)
        let employeeCode = emp?["employeeCode"] as? String ?? ""
        let email = emp?["email"] as? String ?? ""

        // Top Row: Avatar + Name & Subtitle + Status Pill
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
        spacer.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)
        topRow.addArrangedSubview(spacer)

        let statusPill = createStatusPill(status: status)
        statusPill.setContentHuggingPriority(.required, for: .horizontal)
        statusPill.setContentCompressionResistancePriority(.required, for: .horizontal)
        topRow.addArrangedSubview(statusPill)
        cardStack.addArrangedSubview(topRow)

        // Middle Section: Details Pills (Type, Dates, Duration)
        let detailsRow = UIStackView()
        detailsRow.axis = .horizontal
        detailsRow.spacing = 8
        detailsRow.alignment = .center
        detailsRow.distribution = .fillProportionally
        detailsRow.translatesAutoresizingMaskIntoConstraints = false

        let typePill = createTagPill(text: leaveType, bgColor: UIColor(red: 239/255, green: 246/255, blue: 255/255, alpha: 1.0), textColor: UIColor(red: 37/255, green: 99/255, blue: 235/255, alpha: 1.0))
        detailsRow.addArrangedSubview(typePill)

        let formattedDates = formatDateRange(start: startDate, end: endDate)
        let datesPill = createTagPill(text: formattedDates, bgColor: UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0), textColor: UIColor(red: 51/255, green: 65/255, blue: 85/255, alpha: 1.0))
        detailsRow.addArrangedSubview(datesPill)

        let daysText = "\(totalDays) \(totalDays == 1 ? "day" : "days")"
        let daysPill = createTagPill(text: daysText, bgColor: UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0), textColor: UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0))
        detailsRow.addArrangedSubview(daysPill)

        cardStack.addArrangedSubview(detailsRow)

        // Reason Row
        let reasonLabel = UILabel()
        reasonLabel.text = "Reason: \(reason)"
        reasonLabel.font = .systemFont(ofSize: 13, weight: .regular)
        reasonLabel.textColor = UIColor(red: 71/255, green: 85/255, blue: 105/255, alpha: 1.0)
        reasonLabel.numberOfLines = 0
        cardStack.addArrangedSubview(reasonLabel)

        // Rejection Reason Callout (if rejected)
        if status == "REJECTED", let rej = rejectionReason, !rej.isEmpty {
            let rejBox = UIView()
            rejBox.backgroundColor = UIColor(red: 254/255, green: 242/255, blue: 242/255, alpha: 1.0)
            rejBox.layer.cornerRadius = 8
            rejBox.layer.borderWidth = 1
            rejBox.layer.borderColor = UIColor(red: 254/255, green: 202/255, blue: 202/255, alpha: 1.0).cgColor
            rejBox.translatesAutoresizingMaskIntoConstraints = false

            let rejLabel = UILabel()
            rejLabel.text = "Rejection Reason: \(rej)"
            rejLabel.font = .systemFont(ofSize: 12, weight: .medium)
            rejLabel.textColor = UIColor(red: 220/255, green: 38/255, blue: 38/255, alpha: 1.0)
            rejLabel.numberOfLines = 0
            rejLabel.translatesAutoresizingMaskIntoConstraints = false
            rejBox.addSubview(rejLabel)

            NSLayoutConstraint.activate([
                rejLabel.topAnchor.constraint(equalTo: rejBox.topAnchor, constant: 8),
                rejLabel.leadingAnchor.constraint(equalTo: rejBox.leadingAnchor, constant: 10),
                rejLabel.trailingAnchor.constraint(equalTo: rejBox.trailingAnchor, constant: -10),
                rejLabel.bottomAnchor.constraint(equalTo: rejBox.bottomAnchor, constant: -8)
            ])
            cardStack.addArrangedSubview(rejBox)
        }

        // Action Buttons Row (Shown when status == PENDING)
        if status == "PENDING" {
            let actionsRow = UIStackView()
            actionsRow.axis = .horizontal
            actionsRow.spacing = 10
            actionsRow.distribution = .fillEqually
            actionsRow.translatesAutoresizingMaskIntoConstraints = false

            let btnApprove = UIButton(type: .system)
            btnApprove.setTitle("Approve", for: .normal)
            btnApprove.titleLabel?.font = .systemFont(ofSize: 13, weight: .bold)
            btnApprove.setTitleColor(.white, for: .normal)
            btnApprove.backgroundColor = UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0)
            btnApprove.layer.cornerRadius = 8
            let checkIcon = UIImage(systemName: "checkmark", withConfiguration: UIImage.SymbolConfiguration(pointSize: 12, weight: .bold))
            btnApprove.setImage(checkIcon, for: .normal)
            btnApprove.tintColor = .white
            btnApprove.imageEdgeInsets = UIEdgeInsets(top: 0, left: 0, bottom: 0, right: 6)
            btnApprove.accessibilityIdentifier = leaveId
            btnApprove.addTarget(self, action: #selector(didTapApproveLeave(_:)), for: .touchUpInside)

            let btnReject = UIButton(type: .system)
            btnReject.setTitle("Reject", for: .normal)
            btnReject.titleLabel?.font = .systemFont(ofSize: 13, weight: .bold)
            btnReject.setTitleColor(.white, for: .normal)
            btnReject.backgroundColor = UIColor(red: 239/255, green: 68/255, blue: 68/255, alpha: 1.0)
            btnReject.layer.cornerRadius = 8
            let xIcon = UIImage(systemName: "xmark", withConfiguration: UIImage.SymbolConfiguration(pointSize: 12, weight: .bold))
            btnReject.setImage(xIcon, for: .normal)
            btnReject.tintColor = .white
            btnReject.imageEdgeInsets = UIEdgeInsets(top: 0, left: 0, bottom: 0, right: 6)
            btnReject.accessibilityIdentifier = leaveId
            btnReject.addTarget(self, action: #selector(didTapRejectLeave(_:)), for: .touchUpInside)

            actionsRow.addArrangedSubview(btnApprove)
            actionsRow.addArrangedSubview(btnReject)
            actionsRow.heightAnchor.constraint(equalToConstant: 38).isActive = true
            cardStack.addArrangedSubview(actionsRow)
        }

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

        if status == "APPROVED" {
            pill.backgroundColor = UIColor(red: 209/255, green: 250/255, blue: 229/255, alpha: 1.0)
            label.textColor = UIColor(red: 5/255, green: 150/255, blue: 105/255, alpha: 1.0)
        } else if status == "REJECTED" {
            pill.backgroundColor = UIColor(red: 254/255, green: 226/255, blue: 226/255, alpha: 1.0)
            label.textColor = UIColor(red: 220/255, green: 38/255, blue: 38/255, alpha: 1.0)
        } else if status == "WITHDRAWN" {
            pill.backgroundColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0)
            label.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        } else {
            // PENDING
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

    private func formatDateRange(start: String, end: String) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        var startDateObj = formatter.date(from: start)
        if startDateObj == nil {
            formatter.formatOptions = [.withInternetDateTime]
            startDateObj = formatter.date(from: start)
        }

        var endDateObj = formatter.date(from: end)
        if endDateObj == nil {
            formatter.formatOptions = [.withInternetDateTime]
            endDateObj = formatter.date(from: end)
        }

        let displayFormatter = DateFormatter()
        displayFormatter.dateFormat = "dd/MM/yyyy"

        let startStr = startDateObj != nil ? displayFormatter.string(from: startDateObj!) : (start.components(separatedBy: "T").first ?? start)
        let endStr = endDateObj != nil ? displayFormatter.string(from: endDateObj!) : (end.components(separatedBy: "T").first ?? end)

        if startStr == endStr {
            return startStr
        }
        return "\(startStr) → \(endStr)"
    }

    // MARK: - Actions (Approve & Reject)
    @objc private func didTapApproveLeave(_ sender: UIButton) {
        guard let leaveId = sender.accessibilityIdentifier, !leaveId.isEmpty else { return }

        sender.isEnabled = false
        sender.alpha = 0.6

        AuthService.shared.updateLeaveStatus(id: leaveId, status: "APPROVED") { [weak self] result in
            guard let self = self else { return }
            sender.isEnabled = true
            sender.alpha = 1.0

            switch result {
            case .success:
                self.showToast(message: "Leave approved successfully")
                self.loadApprovalsData()
            case .failure(let error):
                self.showToast(message: "Failed to approve: \(error.localizedDescription)")
            }
        }
    }

    @objc private func didTapRejectLeave(_ sender: UIButton) {
        guard let leaveId = sender.accessibilityIdentifier, !leaveId.isEmpty else { return }
        pendingRejectionLeaveId = leaveId
        presentRejectionModal()
    }

    private func presentRejectionModal() {
        if rejectionOverlay != nil { return }

        let overlay = UIView(frame: view.bounds)
        overlay.backgroundColor = UIColor.black.withAlphaComponent(0.4)
        overlay.alpha = 0
        overlay.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(overlay)
        rejectionOverlay = overlay

        let modalContainer = UIView()
        modalContainer.backgroundColor = .white
        modalContainer.layer.cornerRadius = 16
        modalContainer.layer.masksToBounds = true
        modalContainer.translatesAutoresizingMaskIntoConstraints = false
        overlay.addSubview(modalContainer)

        let modalStack = UIStackView()
        modalStack.axis = .vertical
        modalStack.spacing = 14
        modalStack.translatesAutoresizingMaskIntoConstraints = false
        modalContainer.addSubview(modalStack)

        let headerStack = UIStackView()
        headerStack.axis = .vertical
        headerStack.spacing = 4

        let titleLabel = UILabel()
        titleLabel.text = "Reject Leave Request"
        titleLabel.font = .systemFont(ofSize: 18, weight: .bold)
        titleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        headerStack.addArrangedSubview(titleLabel)

        let subLabel = UILabel()
        subLabel.text = "Provide an optional or required reason explaining why this request cannot be approved."
        subLabel.font = .systemFont(ofSize: 13, weight: .regular)
        subLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        subLabel.numberOfLines = 0
        headerStack.addArrangedSubview(subLabel)
        modalStack.addArrangedSubview(headerStack)

        let noteLabel = UILabel()
        noteLabel.text = "Rejection Note / Reason"
        noteLabel.font = .systemFont(ofSize: 12, weight: .semibold)
        noteLabel.textColor = UIColor(red: 51/255, green: 65/255, blue: 85/255, alpha: 1.0)
        modalStack.addArrangedSubview(noteLabel)

        let textView = UITextView()
        textView.font = .systemFont(ofSize: 14)
        textView.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        textView.layer.cornerRadius = 8
        textView.layer.borderWidth = 1
        textView.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        textView.heightAnchor.constraint(equalToConstant: 80).isActive = true
        rejectionTextView = textView
        modalStack.addArrangedSubview(textView)

        let buttonsRow = UIStackView()
        buttonsRow.axis = .horizontal
        buttonsRow.spacing = 10
        buttonsRow.distribution = .fillEqually
        buttonsRow.translatesAutoresizingMaskIntoConstraints = false

        let btnCancel = UIButton(type: .system)
        btnCancel.setTitle("Cancel", for: .normal)
        btnCancel.titleLabel?.font = .systemFont(ofSize: 14, weight: .semibold)
        btnCancel.setTitleColor(UIColor(red: 71/255, green: 85/255, blue: 105/255, alpha: 1.0), for: .normal)
        btnCancel.backgroundColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0)
        btnCancel.layer.cornerRadius = 8
        btnCancel.heightAnchor.constraint(equalToConstant: 40).isActive = true
        btnCancel.addTarget(self, action: #selector(dismissRejectionModal), for: .touchUpInside)

        let btnConfirm = UIButton(type: .system)
        btnConfirm.setTitle("Confirm Rejection", for: .normal)
        btnConfirm.titleLabel?.font = .systemFont(ofSize: 14, weight: .bold)
        btnConfirm.setTitleColor(.white, for: .normal)
        btnConfirm.backgroundColor = UIColor(red: 239/255, green: 68/255, blue: 68/255, alpha: 1.0)
        btnConfirm.layer.cornerRadius = 8
        btnConfirm.heightAnchor.constraint(equalToConstant: 40).isActive = true
        btnConfirm.addTarget(self, action: #selector(confirmRejection), for: .touchUpInside)

        buttonsRow.addArrangedSubview(btnCancel)
        buttonsRow.addArrangedSubview(btnConfirm)
        modalStack.addArrangedSubview(buttonsRow)

        NSLayoutConstraint.activate([
            overlay.topAnchor.constraint(equalTo: view.topAnchor),
            overlay.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            overlay.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            overlay.bottomAnchor.constraint(equalTo: view.bottomAnchor),

            modalContainer.centerYAnchor.constraint(equalTo: overlay.centerYAnchor, constant: -40),
            modalContainer.leadingAnchor.constraint(equalTo: overlay.leadingAnchor, constant: 20),
            modalContainer.trailingAnchor.constraint(equalTo: overlay.trailingAnchor, constant: -20),

            modalStack.topAnchor.constraint(equalTo: modalContainer.topAnchor, constant: 18),
            modalStack.leadingAnchor.constraint(equalTo: modalContainer.leadingAnchor, constant: 18),
            modalStack.trailingAnchor.constraint(equalTo: modalContainer.trailingAnchor, constant: -18),
            modalStack.bottomAnchor.constraint(equalTo: modalContainer.bottomAnchor, constant: -18)
        ])

        UIView.animate(withDuration: 0.25) {
            overlay.alpha = 1
        }
        textView.becomeFirstResponder()
    }

    @objc private func dismissRejectionModal() {
        guard let overlay = rejectionOverlay else { return }
        rejectionTextView?.resignFirstResponder()
        UIView.animate(withDuration: 0.2, animations: {
            overlay.alpha = 0
        }, completion: { [weak self] _ in
            overlay.removeFromSuperview()
            self?.rejectionOverlay = nil
            self?.pendingRejectionLeaveId = nil
            self?.rejectionTextView = nil
        })
    }

    @objc private func confirmRejection() {
        guard let leaveId = pendingRejectionLeaveId, !leaveId.isEmpty else { return }
        let reason = rejectionTextView?.text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""

        dismissRejectionModal()

        AuthService.shared.updateLeaveStatus(id: leaveId, status: "REJECTED", rejectionReason: reason) { [weak self] result in
            guard let self = self else { return }
            switch result {
            case .success:
                self.showToast(message: "Leave rejected successfully")
                self.loadApprovalsData()
            case .failure(let error):
                self.showToast(message: "Failed to reject: \(error.localizedDescription)")
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
            activeTabId: "approvals",
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
