import UIKit

class LeaveViewController: UIViewController, UIScrollViewDelegate {

    private let topBar = UIView()
    private let topBarContainer = UIView()
    private let topBarTitleLabel = UILabel()
    private let notificationBellButton = UIButton(type: .custom)
    private let notificationBadgeDot = UIView()
    private let avatarContainer = UIView()
    private let avatarInitialsLabel = UILabel()

    private let scrollView = UIScrollView()
    private let contentView = UIView()
    private let contentStackView = UIStackView()

    private let bottomNavBar = UIView()
    private let bottomNavContainer = UIView()

    private let yearLabel = UILabel()
    private let casualCountLabel = UILabel()
    private let sickCountLabel = UILabel()
    private let earnedCountLabel = UILabel()

    private let leaveHistoryStack = UIStackView()
    private let emptyStateView = UIView()

    private let apiDateFormatter: DateFormatter = {
        let df = DateFormatter()
        df.dateFormat = "yyyy-MM-dd"
        df.locale = Locale(identifier: "en_US_POSIX")
        return df
    }()

    private let displayDateFormatter: DateFormatter = {
        let df = DateFormatter()
        df.dateFormat = "MMM d, yyyy"
        df.locale = Locale(identifier: "en_US")
        return df
    }()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
        navigationController?.setNavigationBarHidden(true, animated: false)

        setupTopBar()
        setupScrollView()
        setupBalancesCard()
        setupLeaveHistoryCard()
        setupBottomNavBar()
        loadLeaveData()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        setupBottomNavBar()
        updateHeaderState()
        loadLeaveData()
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

        topBarTitleLabel.text = "Leaves"
        topBarTitleLabel.font = .systemFont(ofSize: 20, weight: .bold)
        topBarTitleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        brandHeaderStack.addArrangedSubview(topBarTitleLabel)

        let rightActionsStack = UIStackView()
        rightActionsStack.axis = .horizontal
        rightActionsStack.spacing = 12
        rightActionsStack.alignment = .center
        rightActionsStack.translatesAutoresizingMaskIntoConstraints = false
        topBarContainer.addSubview(rightActionsStack)

        // Notification Bell
        let bellConfig = UIImage.SymbolConfiguration(pointSize: 19, weight: .regular)
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

    // MARK: - Scroll View
    private func setupScrollView() {
        scrollView.translatesAutoresizingMaskIntoConstraints = false
        scrollView.showsVerticalScrollIndicator = false
        scrollView.delegate = self
        view.addSubview(scrollView)

        contentView.translatesAutoresizingMaskIntoConstraints = false
        scrollView.addSubview(contentView)

        contentStackView.axis = .vertical
        contentStackView.spacing = 16
        contentStackView.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(contentStackView)

        let contentWidthConstraint = contentView.widthAnchor.constraint(equalTo: scrollView.widthAnchor, constant: -32)
        contentWidthConstraint.priority = UILayoutPriority(999)
        contentWidthConstraint.isActive = true

        NSLayoutConstraint.activate([
            scrollView.topAnchor.constraint(equalTo: topBar.bottomAnchor),
            scrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scrollView.bottomAnchor.constraint(equalTo: view.bottomAnchor),

            contentView.topAnchor.constraint(equalTo: scrollView.contentLayoutGuide.topAnchor, constant: 16),
            contentView.bottomAnchor.constraint(equalTo: scrollView.contentLayoutGuide.bottomAnchor, constant: -100),
            contentView.centerXAnchor.constraint(equalTo: scrollView.centerXAnchor),
            contentView.widthAnchor.constraint(lessThanOrEqualToConstant: 680),

            contentStackView.topAnchor.constraint(equalTo: contentView.topAnchor),
            contentStackView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor),
            contentStackView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor),
            contentStackView.bottomAnchor.constraint(equalTo: contentView.bottomAnchor)
        ])
    }

    // MARK: - Leave Balances Card
    private func setupBalancesCard() {
        let card = UIView()
        card.backgroundColor = .white
        card.layer.cornerRadius = 20
        card.layer.borderWidth = 1
        card.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        card.translatesAutoresizingMaskIntoConstraints = false
        contentStackView.addArrangedSubview(card)

        let stack = UIStackView()
        stack.axis = .vertical
        stack.spacing = 16
        stack.translatesAutoresizingMaskIntoConstraints = false
        card.addSubview(stack)

        let headerRow = UIStackView()
        headerRow.axis = .horizontal
        headerRow.distribution = .equalSpacing

        let titleLabel = UILabel()
        titleLabel.text = "Leave Balances"
        titleLabel.font = .systemFont(ofSize: 17, weight: .bold)
        titleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        headerRow.addArrangedSubview(titleLabel)

        let currentYear = Calendar.current.component(.year, from: Date())
        yearLabel.text = "Year \(currentYear)"
        yearLabel.font = .systemFont(ofSize: 12, weight: .bold)
        yearLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        headerRow.addArrangedSubview(yearLabel)
        stack.addArrangedSubview(headerRow)

        // 3 Pillars Row
        let pillarsStack = UIStackView()
        pillarsStack.axis = .horizontal
        pillarsStack.distribution = .fillEqually
        pillarsStack.spacing = 10

        pillarsStack.addArrangedSubview(makeBalancePillar(title: "Casual", countLabel: casualCountLabel, initialCount: "0", color: UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)))
        pillarsStack.addArrangedSubview(makeBalancePillar(title: "Medical", countLabel: sickCountLabel, initialCount: "0", color: UIColor(red: 239/255, green: 68/255, blue: 68/255, alpha: 1.0)))
        pillarsStack.addArrangedSubview(makeBalancePillar(title: "Earned", countLabel: earnedCountLabel, initialCount: "0", color: UIColor(red: 245/255, green: 158/255, blue: 11/255, alpha: 1.0)))
        stack.addArrangedSubview(pillarsStack)

        // Apply Button
        let applyBtn = UIButton(type: .system)
        applyBtn.setTitle("Apply for Leave", for: .normal)
        applyBtn.titleLabel?.font = .systemFont(ofSize: 15, weight: .bold)
        applyBtn.setTitleColor(.white, for: .normal)
        applyBtn.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        applyBtn.layer.cornerRadius = 14
        applyBtn.heightAnchor.constraint(equalToConstant: 48).isActive = true
        applyBtn.addTarget(self, action: #selector(didTapApplyLeave), for: .touchUpInside)
        stack.addArrangedSubview(applyBtn)

        NSLayoutConstraint.activate([
            stack.topAnchor.constraint(equalTo: card.topAnchor, constant: 18),
            stack.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 18),
            stack.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -18),
            stack.bottomAnchor.constraint(equalTo: card.bottomAnchor, constant: -18)
        ])
    }

    private func makeBalancePillar(title: String, countLabel: UILabel, initialCount: String, color: UIColor) -> UIView {
        let pill = UIView()
        pill.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
        pill.layer.cornerRadius = 14
        pill.layer.borderWidth = 1
        pill.layer.borderColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0).cgColor

        let vStack = UIStackView()
        vStack.axis = .vertical
        vStack.alignment = .center
        vStack.spacing = 4
        vStack.translatesAutoresizingMaskIntoConstraints = false
        pill.addSubview(vStack)

        let tLbl = UILabel()
        tLbl.text = title
        tLbl.font = .systemFont(ofSize: 12, weight: .bold)
        tLbl.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        vStack.addArrangedSubview(tLbl)

        countLabel.text = initialCount
        countLabel.font = .systemFont(ofSize: 20, weight: .bold)
        countLabel.textColor = color
        vStack.addArrangedSubview(countLabel)

        let subLbl = UILabel()
        subLbl.text = "days available"
        subLbl.font = .systemFont(ofSize: 10, weight: .regular)
        subLbl.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        vStack.addArrangedSubview(subLbl)

        NSLayoutConstraint.activate([
            vStack.topAnchor.constraint(equalTo: pill.topAnchor, constant: 12),
            vStack.leadingAnchor.constraint(equalTo: pill.leadingAnchor, constant: 8),
            vStack.trailingAnchor.constraint(equalTo: pill.trailingAnchor, constant: -8),
            vStack.bottomAnchor.constraint(equalTo: pill.bottomAnchor, constant: -12)
        ])
        return pill
    }

    // MARK: - Leave History Card
    private func setupLeaveHistoryCard() {
        let card = UIView()
        card.backgroundColor = .white
        card.layer.cornerRadius = 20
        card.layer.borderWidth = 1
        card.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        card.translatesAutoresizingMaskIntoConstraints = false
        contentStackView.addArrangedSubview(card)

        let stack = UIStackView()
        stack.axis = .vertical
        stack.spacing = 14
        stack.translatesAutoresizingMaskIntoConstraints = false
        card.addSubview(stack)

        let headerStack = UIStackView()
        headerStack.axis = .horizontal
        headerStack.spacing = 8
        headerStack.alignment = .center

        let iconConfig = UIImage.SymbolConfiguration(pointSize: 18, weight: .semibold)
        let calendarIcon = UIImageView(image: UIImage(systemName: "calendar.badge.clock", withConfiguration: iconConfig))
        calendarIcon.tintColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        calendarIcon.contentMode = .scaleAspectFit
        calendarIcon.translatesAutoresizingMaskIntoConstraints = false
        calendarIcon.widthAnchor.constraint(equalToConstant: 22).isActive = true
        calendarIcon.heightAnchor.constraint(equalToConstant: 22).isActive = true
        headerStack.addArrangedSubview(calendarIcon)

        let titleLabel = UILabel()
        titleLabel.text = "Leave History"
        titleLabel.font = .systemFont(ofSize: 17, weight: .bold)
        titleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        titleLabel.setContentHuggingPriority(.defaultHigh, for: .horizontal)
        headerStack.addArrangedSubview(titleLabel)

        let headerSpacer = UIView()
        headerSpacer.setContentHuggingPriority(.defaultLow, for: .horizontal)
        headerStack.addArrangedSubview(headerSpacer)

        stack.addArrangedSubview(headerStack)

        // Empty state view (default visible until records load)
        emptyStateView.backgroundColor = .clear
        emptyStateView.translatesAutoresizingMaskIntoConstraints = false
        emptyStateView.isHidden = false
        let emptyStack = UIStackView()
        emptyStack.axis = .vertical
        emptyStack.alignment = .center
        emptyStack.spacing = 10
        emptyStack.translatesAutoresizingMaskIntoConstraints = false
        emptyStateView.addSubview(emptyStack)

        let emptyIconContainer = UIView()
        emptyIconContainer.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 0.1)
        emptyIconContainer.layer.cornerRadius = 28
        emptyIconContainer.translatesAutoresizingMaskIntoConstraints = false
        let emptyIcon = UIImageView(image: UIImage(systemName: "calendar", withConfiguration: UIImage.SymbolConfiguration(pointSize: 26, weight: .regular)))
        emptyIcon.tintColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        emptyIcon.contentMode = .scaleAspectFit
        emptyIcon.translatesAutoresizingMaskIntoConstraints = false
        emptyIconContainer.addSubview(emptyIcon)

        NSLayoutConstraint.activate([
            emptyIconContainer.widthAnchor.constraint(equalToConstant: 56),
            emptyIconContainer.heightAnchor.constraint(equalToConstant: 56),
            emptyIcon.centerXAnchor.constraint(equalTo: emptyIconContainer.centerXAnchor),
            emptyIcon.centerYAnchor.constraint(equalTo: emptyIconContainer.centerYAnchor)
        ])
        emptyStack.addArrangedSubview(emptyIconContainer)

        let emptyTitle = UILabel()
        emptyTitle.text = "No Leave Requests"
        emptyTitle.font = .systemFont(ofSize: 15, weight: .bold)
        emptyTitle.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        emptyStack.addArrangedSubview(emptyTitle)

        let emptySub = UILabel()
        emptySub.text = "You haven't requested any time off yet."
        emptySub.font = .systemFont(ofSize: 12, weight: .regular)
        emptySub.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        emptyStack.addArrangedSubview(emptySub)

        let emptyApplyBtn = UIButton(type: .system)
        emptyApplyBtn.setTitle("Request Time Off", for: .normal)
        emptyApplyBtn.titleLabel?.font = .systemFont(ofSize: 13, weight: .bold)
        emptyApplyBtn.setTitleColor(.white, for: .normal)
        emptyApplyBtn.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        emptyApplyBtn.layer.cornerRadius = 10
        emptyApplyBtn.contentEdgeInsets = UIEdgeInsets(top: 8, left: 16, bottom: 8, right: 16)
        emptyApplyBtn.addTarget(self, action: #selector(didTapApplyLeave), for: .touchUpInside)
        emptyStack.addArrangedSubview(emptyApplyBtn)

        NSLayoutConstraint.activate([
            emptyStack.topAnchor.constraint(equalTo: emptyStateView.topAnchor, constant: 16),
            emptyStack.bottomAnchor.constraint(equalTo: emptyStateView.bottomAnchor, constant: -16),
            emptyStack.leadingAnchor.constraint(equalTo: emptyStateView.leadingAnchor),
            emptyStack.trailingAnchor.constraint(equalTo: emptyStateView.trailingAnchor)
        ])
        stack.addArrangedSubview(emptyStateView)

        // Dynamic Leave History Stack
        leaveHistoryStack.axis = .vertical
        leaveHistoryStack.spacing = 10
        leaveHistoryStack.translatesAutoresizingMaskIntoConstraints = false
        stack.addArrangedSubview(leaveHistoryStack)

        NSLayoutConstraint.activate([
            stack.topAnchor.constraint(equalTo: card.topAnchor, constant: 18),
            stack.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 18),
            stack.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -18),
            stack.bottomAnchor.constraint(equalTo: card.bottomAnchor, constant: -18)
        ])
    }

    private func makeLeaveHistoryCard(item: [String: Any]) -> UIView {
        let box = UIView()
        box.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
        box.layer.cornerRadius = 14
        box.layer.borderWidth = 1
        box.layer.borderColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0).cgColor

        let vStack = UIStackView()
        vStack.axis = .vertical
        vStack.spacing = 6
        vStack.translatesAutoresizingMaskIntoConstraints = false
        box.addSubview(vStack)

        let topRow = UIStackView()
        topRow.axis = .horizontal
        topRow.distribution = .equalSpacing

        let id = item["id"] as? String ?? ""
        let rawType = (item["type"] as? String ?? "CASUAL").uppercased()
        let displayType = formatLeaveType(rawType)
        let status = (item["status"] as? String ?? "PENDING").uppercased()
        let start = item["startDate"] as? String ?? ""
        let end = item["endDate"] as? String ?? ""
        let totalDays = item["totalDays"] as? Double ?? 1.0
        let reason = item["reason"] as? String ?? "Personal"
        let rejectionReason = item["rejectionReason"] as? String ?? ""

        let tLbl = UILabel()
        tLbl.text = displayType
        tLbl.font = .systemFont(ofSize: 14, weight: .bold)
        tLbl.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        topRow.addArrangedSubview(tLbl)

        let (badgeText, badgeBg, badgeTextColor) = getBadgeStyle(status: status)
        let bLbl = UILabel()
        bLbl.text = "  \(badgeText)  "
        bLbl.font = .systemFont(ofSize: 11, weight: .bold)
        bLbl.textColor = badgeTextColor
        bLbl.backgroundColor = badgeBg
        bLbl.layer.cornerRadius = 6
        bLbl.layer.masksToBounds = true
        topRow.addArrangedSubview(bLbl)
        vStack.addArrangedSubview(topRow)

        // Subtitle: Date Range • Days
        let daysText = (totalDays == 0.5) ? "0.5 days" : "\(Int(totalDays)) \(totalDays == 1.0 ? "day" : "days")"
        let dateRange = formatDateRange(start: start, end: end)
        let subLbl = UILabel()
        subLbl.text = "\(dateRange) • \(daysText)"
        subLbl.font = .systemFont(ofSize: 12, weight: .medium)
        subLbl.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        vStack.addArrangedSubview(subLbl)

        // Reason
        if !reason.isEmpty {
            let reasonLbl = UILabel()
            reasonLbl.text = reason
            reasonLbl.font = .systemFont(ofSize: 12, weight: .regular)
            reasonLbl.textColor = UIColor(red: 51/255, green: 65/255, blue: 85/255, alpha: 1.0)
            reasonLbl.numberOfLines = 2
            vStack.addArrangedSubview(reasonLbl)
        }

        // Rejection Reason
        if status == "REJECTED" && !rejectionReason.isEmpty {
            let rejLbl = UILabel()
            rejLbl.text = "Rejected: \(rejectionReason)"
            rejLbl.font = .systemFont(ofSize: 11, weight: .semibold)
            rejLbl.textColor = UIColor(red: 225/255, green: 29/255, blue: 72/255, alpha: 1.0)
            rejLbl.numberOfLines = 2
            vStack.addArrangedSubview(rejLbl)
        }

        // Withdraw / Cancel Button if Pending or Future Approved
        let isWithdrawable = status == "PENDING" || (status == "APPROVED" && isFutureDate(end))
        if isWithdrawable && !id.isEmpty {
            let actionRow = UIStackView()
            actionRow.axis = .horizontal
            actionRow.alignment = .trailing
            actionRow.distribution = .equalSpacing

            let spacer = UIView()
            actionRow.addArrangedSubview(spacer)

            let withdrawBtn = UIButton(type: .system)
            withdrawBtn.setTitle(status == "PENDING" ? "Withdraw Request" : "Cancel Leave", for: .normal)
            withdrawBtn.titleLabel?.font = .systemFont(ofSize: 12, weight: .bold)
            withdrawBtn.setTitleColor(UIColor(red: 225/255, green: 29/255, blue: 72/255, alpha: 1.0), for: .normal)
            withdrawBtn.addAction(UIAction { [weak self] _ in
                self?.confirmWithdraw(id: id, leaveType: displayType)
            }, for: .touchUpInside)
            actionRow.addArrangedSubview(withdrawBtn)

            vStack.addArrangedSubview(actionRow)
        }

        NSLayoutConstraint.activate([
            vStack.topAnchor.constraint(equalTo: box.topAnchor, constant: 12),
            vStack.leadingAnchor.constraint(equalTo: box.leadingAnchor, constant: 14),
            vStack.trailingAnchor.constraint(equalTo: box.trailingAnchor, constant: -14),
            vStack.bottomAnchor.constraint(equalTo: box.bottomAnchor, constant: -12)
        ])
        return box
    }

    private func confirmWithdraw(id: String, leaveType: String) {
        let alert = UIAlertController(title: "Withdraw Leave Request", message: "Are you sure you want to withdraw your \(leaveType) request?", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
        alert.addAction(UIAlertAction(title: "Withdraw", style: .destructive, handler: { [weak self] _ in
            AuthService.shared.withdrawLeave(id: id) { [weak self] result in
                DispatchQueue.main.async {
                    switch result {
                    case .success:
                        self?.loadLeaveData()
                    case .failure(let error):
                        let errAlert = UIAlertController(title: "Error", message: error.localizedDescription, preferredStyle: .alert)
                        errAlert.addAction(UIAlertAction(title: "OK", style: .default, handler: nil))
                        self?.present(errAlert, animated: true)
                    }
                }
            }
        }))
        present(alert, animated: true)
    }

    private func getBadgeStyle(status: String) -> (String, UIColor, UIColor) {
        switch status {
        case "APPROVED":
            return ("Approved", UIColor(red: 209/255, green: 250/255, blue: 229/255, alpha: 1.0), UIColor(red: 5/255, green: 150/255, blue: 105/255, alpha: 1.0))
        case "PENDING":
            return ("Pending", UIColor(red: 254/255, green: 243/255, blue: 199/255, alpha: 1.0), UIColor(red: 217/255, green: 119/255, blue: 6/255, alpha: 1.0))
        case "REJECTED":
            return ("Rejected", UIColor(red: 254/255, green: 226/255, blue: 226/255, alpha: 1.0), UIColor(red: 220/255, green: 38/255, blue: 38/255, alpha: 1.0))
        case "WITHDRAWN":
            return ("Withdrawn", UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0), UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0))
        default:
            return (status.capitalized, UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0), UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0))
        }
    }

    private func formatLeaveType(_ raw: String) -> String {
        switch raw {
        case "CASUAL":
            return "Casual Leave"
        case "MEDICAL", "SICK":
            return "Medical Leave"
        case "EARNED":
            return "Earned Leave"
        case "UNPAID":
            return "Unpaid Leave"
        default:
            return raw.replacingOccurrences(of: "_", with: " ").capitalized + " Leave"
        }
    }

    private func formatDateRange(start: String, end: String) -> String {
        let sDate = parseDate(start)
        let eDate = parseDate(end)
        if let s = sDate, let e = eDate {
            if apiDateFormatter.string(from: s) == apiDateFormatter.string(from: e) {
                return displayDateFormatter.string(from: s)
            }
            return "\(displayDateFormatter.string(from: s)) - \(displayDateFormatter.string(from: e))"
        }
        return "\(start) - \(end)"
    }

    private func isFutureDate(_ dateStr: String) -> Bool {
        guard let d = parseDate(dateStr) else { return false }
        let cal = Calendar.current
        let today = cal.startOfDay(for: Date())
        return d >= today
    }

    private func parseDate(_ str: String) -> Date? {
        guard str.count >= 10 else { return nil }
        let prefix = String(str.prefix(10))
        return apiDateFormatter.date(from: prefix)
    }

    // MARK: - Auto-Hide Bottom Navigation on Scroll Down, Reveal on Scroll Up
    private var lastScrollOffsetY: CGFloat = 0
    private var isNavBarHidden: Bool = false

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
            bottomNavBar.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -80),

            bottomNavContainer.topAnchor.constraint(equalTo: bottomNavBar.topAnchor),
            bottomNavContainer.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor),
            bottomNavContainer.centerXAnchor.constraint(equalTo: bottomNavBar.centerXAnchor),
            bottomNavContainer.widthAnchor.constraint(lessThanOrEqualToConstant: 680)
        ])

        RoleNavigationManager.setupBottomNavBar(
            in: self,
            navBar: bottomNavBar,
            container: bottomNavContainer,
            activeTabId: "leave",
            scrollHandler: { [weak self] in
                self?.scrollView.setContentOffset(.zero, animated: true)
            }
        )
    }

    private func loadLeaveData() {
        // Real-time balance object
        AuthService.shared.getLeaveBalanceObject { [weak self] result in
            guard let self = self else { return }
            if case .success(let dict) = result {
                let casual = dict["casual"] as? Int ?? 0
                let medical = dict["medical"] as? Int ?? 0
                let earned = dict["earned"] as? Int ?? 0
                self.casualCountLabel.text = "\(casual)"
                self.sickCountLabel.text = "\(medical)"
                self.earnedCountLabel.text = "\(earned)"
            } else {
                // Fallback to array if object fails
                AuthService.shared.getLeaveBalance { [weak self] fallbackResult in
                    guard let self = self else { return }
                    if case .success(let arr) = fallbackResult {
                        for item in arr {
                            let type = (item["leaveType"] as? String ?? item["type"] as? String ?? "").uppercased()
                            let remaining = item["remainingDays"] as? Int ?? item["balance"] as? Int ?? 0
                            if type.contains("CASUAL") {
                                self.casualCountLabel.text = "\(max(0, remaining))"
                            } else if type.contains("SICK") || type.contains("MEDICAL") {
                                self.sickCountLabel.text = "\(max(0, remaining))"
                            } else if type.contains("EARNED") || type.contains("ANNUAL") {
                                self.earnedCountLabel.text = "\(max(0, remaining))"
                            }
                        }
                    }
                }
            }
        }

        // Real-time leave history
        AuthService.shared.getMyLeaves { [weak self] result in
            guard let self = self else { return }
            if case .success(let arr) = result {
                self.leaveHistoryStack.arrangedSubviews.forEach { $0.removeFromSuperview() }
                if arr.isEmpty {
                    self.emptyStateView.isHidden = false
                } else {
                    self.emptyStateView.isHidden = true
                    for item in arr {
                        let card = self.makeLeaveHistoryCard(item: item)
                        self.leaveHistoryStack.addArrangedSubview(card)
                    }
                }
            } else {
                if self.leaveHistoryStack.arrangedSubviews.isEmpty {
                    self.emptyStateView.isHidden = false
                }
            }
        }
    }

    @objc private func didTapApplyLeave() {
        let modal = ApplyLeaveModalViewController()
        modal.onSuccess = { [weak self] in
            self?.loadLeaveData()
        }
        if #available(iOS 15.0, *) {
            if let sheet = modal.sheetPresentationController {
                sheet.detents = [.medium(), .large()]
                sheet.prefersGrabberVisible = true
                sheet.preferredCornerRadius = 24
            }
        }
        present(modal, animated: true)
    }

    @objc private func didTapNotificationBell() {
        AuthService.shared.markLocalNotificationsAsRead()
        notificationBadgeDot.isHidden = true
        let notifVC = NotificationsViewController()
        notifVC.modalPresentationStyle = .fullScreen
        present(notifVC, animated: true)
    }

    @objc private func didTapAvatar() {
        let settingsVC = SettingsViewController()
        settingsVC.modalPresentationStyle = .fullScreen
        present(settingsVC, animated: true)
    }
}

// MARK: - Apply Leave Modal Sheet
class ApplyLeaveModalViewController: UIViewController {

    var onSuccess: (() -> Void)?

    private let scrollView = UIScrollView()
    private let contentView = UIView()
    private let stackView = UIStackView()

    private let errorLabel = UILabel()
    private let typeSegment = UISegmentedControl(items: ["Casual", "Medical", "Earned", "Unpaid"])
    private let halfDaySwitch = UISwitch()
    private let halfDayLabel = UILabel()

    private let fullDayStack = UIStackView()
    private let startDatePicker = UIDatePicker()
    private let endDatePicker = UIDatePicker()

    private let halfDayStack = UIStackView()
    private let singleDatePicker = UIDatePicker()
    private let sessionSegment = UISegmentedControl(items: ["First Half", "Second Half"])

    private let totalDaysContainer = UIView()
    private let totalDaysValueLabel = UILabel()

    private let reasonTextView = UITextView()
    private let submitButton = UIButton(type: .system)
    private let spinner = UIActivityIndicatorView(style: .medium)

    private let types = ["CASUAL", "MEDICAL", "EARNED", "UNPAID"]
    private let sessions = ["FIRST_HALF", "SECOND_HALF"]

    private let apiDateFormatter: DateFormatter = {
        let df = DateFormatter()
        df.dateFormat = "yyyy-MM-dd"
        df.locale = Locale(identifier: "en_US_POSIX")
        return df
    }()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white
        setupUI()
        updateTotalDays()
    }

    private func setupUI() {
        scrollView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(scrollView)

        contentView.translatesAutoresizingMaskIntoConstraints = false
        scrollView.addSubview(contentView)

        stackView.axis = .vertical
        stackView.spacing = 16
        stackView.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(stackView)

        // Header
        let headerRow = UIStackView()
        headerRow.axis = .horizontal
        headerRow.spacing = 12
        headerRow.alignment = .center

        let iconContainer = UIView()
        iconContainer.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 0.1)
        iconContainer.layer.cornerRadius = 20
        iconContainer.translatesAutoresizingMaskIntoConstraints = false
        let icon = UIImageView(image: UIImage(systemName: "calendar.badge.plus", withConfiguration: UIImage.SymbolConfiguration(pointSize: 18, weight: .semibold)))
        icon.tintColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        icon.translatesAutoresizingMaskIntoConstraints = false
        iconContainer.addSubview(icon)

        NSLayoutConstraint.activate([
            iconContainer.widthAnchor.constraint(equalToConstant: 40),
            iconContainer.heightAnchor.constraint(equalToConstant: 40),
            icon.centerXAnchor.constraint(equalTo: iconContainer.centerXAnchor),
            icon.centerYAnchor.constraint(equalTo: iconContainer.centerYAnchor)
        ])
        headerRow.addArrangedSubview(iconContainer)

        let titleStack = UIStackView()
        titleStack.axis = .vertical
        titleStack.spacing = 2

        let titleLabel = UILabel()
        titleLabel.text = "Apply for Leave"
        titleLabel.font = .systemFont(ofSize: 18, weight: .bold)
        titleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        titleStack.addArrangedSubview(titleLabel)

        let subLabel = UILabel()
        subLabel.text = "Select your leave category, date range, and reason."
        subLabel.font = .systemFont(ofSize: 12, weight: .regular)
        subLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        titleStack.addArrangedSubview(subLabel)

        headerRow.addArrangedSubview(titleStack)
        stackView.addArrangedSubview(headerRow)

        // Error Label
        errorLabel.textColor = UIColor(red: 220/255, green: 38/255, blue: 38/255, alpha: 1.0)
        errorLabel.font = .systemFont(ofSize: 12, weight: .medium)
        errorLabel.backgroundColor = UIColor(red: 254/255, green: 242/255, blue: 242/255, alpha: 1.0)
        errorLabel.layer.cornerRadius = 8
        errorLabel.layer.masksToBounds = true
        errorLabel.numberOfLines = 0
        errorLabel.isHidden = true
        stackView.addArrangedSubview(errorLabel)

        // Leave Type Segment
        let typeSection = UIStackView()
        typeSection.axis = .vertical
        typeSection.spacing = 6
        let typeLbl = UILabel()
        typeLbl.text = "LEAVE TYPE *"
        typeLbl.font = .systemFont(ofSize: 11, weight: .bold)
        typeLbl.textColor = UIColor(red: 71/255, green: 85/255, blue: 105/255, alpha: 1.0)
        typeSection.addArrangedSubview(typeLbl)

        typeSegment.selectedSegmentIndex = 0
        typeSection.addArrangedSubview(typeSegment)
        stackView.addArrangedSubview(typeSection)

        // Half Day Option
        let halfDayRow = UIStackView()
        halfDayRow.axis = .horizontal
        halfDayRow.spacing = 10
        halfDayRow.alignment = .center

        halfDaySwitch.onTintColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        halfDaySwitch.addTarget(self, action: #selector(didToggleHalfDay), for: .valueChanged)
        halfDayRow.addArrangedSubview(halfDaySwitch)

        halfDayLabel.text = "Apply for Half Day (0.5 working day)"
        halfDayLabel.font = .systemFont(ofSize: 13, weight: .semibold)
        halfDayLabel.textColor = UIColor(red: 30/255, green: 41/255, blue: 59/255, alpha: 1.0)
        halfDayRow.addArrangedSubview(halfDayLabel)
        stackView.addArrangedSubview(halfDayRow)

        // Full Day Dates (Start Date & End Date)
        fullDayStack.axis = .horizontal
        fullDayStack.distribution = .fillEqually
        fullDayStack.spacing = 10

        let startContainer = makeDateContainer(title: "START DATE *", picker: startDatePicker)
        let endContainer = makeDateContainer(title: "END DATE *", picker: endDatePicker)
        fullDayStack.addArrangedSubview(startContainer)
        fullDayStack.addArrangedSubview(endContainer)
        stackView.addArrangedSubview(fullDayStack)

        // Half Day Dates (Single Date & Session)
        halfDayStack.axis = .horizontal
        halfDayStack.distribution = .fillEqually
        halfDayStack.spacing = 10
        halfDayStack.isHidden = true

        let singleContainer = makeDateContainer(title: "DATE *", picker: singleDatePicker)
        let sessionContainer = UIStackView()
        sessionContainer.axis = .vertical
        sessionContainer.spacing = 6
        let sessionLbl = UILabel()
        sessionLbl.text = "SESSION *"
        sessionLbl.font = .systemFont(ofSize: 11, weight: .bold)
        sessionLbl.textColor = UIColor(red: 71/255, green: 85/255, blue: 105/255, alpha: 1.0)
        sessionContainer.addArrangedSubview(sessionLbl)
        sessionSegment.selectedSegmentIndex = 0
        sessionContainer.addArrangedSubview(sessionSegment)

        halfDayStack.addArrangedSubview(singleContainer)
        halfDayStack.addArrangedSubview(sessionContainer)
        stackView.addArrangedSubview(halfDayStack)

        // Date Pickers Config
        let cal = Calendar.current
        let tomorrow = cal.date(byAdding: .day, value: 1, to: Date()) ?? Date()
        startDatePicker.date = tomorrow
        endDatePicker.date = tomorrow
        singleDatePicker.date = tomorrow

        startDatePicker.addTarget(self, action: #selector(didChangeStartDate), for: .valueChanged)
        endDatePicker.addTarget(self, action: #selector(didChangeEndDate), for: .valueChanged)
        singleDatePicker.addTarget(self, action: #selector(didChangeSingleDate), for: .valueChanged)

        // Total Days Indicator Pill
        totalDaysContainer.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
        totalDaysContainer.layer.cornerRadius = 10
        totalDaysContainer.layer.borderWidth = 1
        totalDaysContainer.layer.borderColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0).cgColor

        let totalDaysRow = UIStackView()
        totalDaysRow.axis = .horizontal
        totalDaysRow.distribution = .equalSpacing
        totalDaysRow.translatesAutoresizingMaskIntoConstraints = false
        totalDaysContainer.addSubview(totalDaysRow)

        let totalLbl = UILabel()
        totalLbl.text = "Total requested days:"
        totalLbl.font = .systemFont(ofSize: 13, weight: .bold)
        totalLbl.textColor = UIColor(red: 71/255, green: 85/255, blue: 105/255, alpha: 1.0)
        totalDaysRow.addArrangedSubview(totalLbl)

        totalDaysValueLabel.font = .systemFont(ofSize: 14, weight: .bold)
        totalDaysValueLabel.textColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        totalDaysRow.addArrangedSubview(totalDaysValueLabel)

        NSLayoutConstraint.activate([
            totalDaysRow.topAnchor.constraint(equalTo: totalDaysContainer.topAnchor, constant: 10),
            totalDaysRow.bottomAnchor.constraint(equalTo: totalDaysContainer.bottomAnchor, constant: -10),
            totalDaysRow.leadingAnchor.constraint(equalTo: totalDaysContainer.leadingAnchor, constant: 14),
            totalDaysRow.trailingAnchor.constraint(equalTo: totalDaysContainer.trailingAnchor, constant: -14)
        ])
        stackView.addArrangedSubview(totalDaysContainer)

        // Reason Field
        let reasonSection = UIStackView()
        reasonSection.axis = .vertical
        reasonSection.spacing = 6
        let reasonLbl = UILabel()
        reasonLbl.text = "REASON *"
        reasonLbl.font = .systemFont(ofSize: 11, weight: .bold)
        reasonLbl.textColor = UIColor(red: 71/255, green: 85/255, blue: 105/255, alpha: 1.0)
        reasonSection.addArrangedSubview(reasonLbl)

        reasonTextView.layer.cornerRadius = 10
        reasonTextView.layer.borderWidth = 1
        reasonTextView.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        reasonTextView.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
        reasonTextView.font = .systemFont(ofSize: 14)
        reasonTextView.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        reasonTextView.heightAnchor.constraint(equalToConstant: 80).isActive = true
        reasonSection.addArrangedSubview(reasonTextView)
        stackView.addArrangedSubview(reasonSection)

        // Action Buttons Row
        let buttonsRow = UIStackView()
        buttonsRow.axis = .horizontal
        buttonsRow.spacing = 10
        buttonsRow.distribution = .fillEqually

        let cancelBtn = UIButton(type: .system)
        cancelBtn.setTitle("Cancel", for: .normal)
        cancelBtn.titleLabel?.font = .systemFont(ofSize: 14, weight: .bold)
        cancelBtn.setTitleColor(UIColor(red: 71/255, green: 85/255, blue: 105/255, alpha: 1.0), for: .normal)
        cancelBtn.backgroundColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0)
        cancelBtn.layer.cornerRadius = 12
        cancelBtn.heightAnchor.constraint(equalToConstant: 46).isActive = true
        cancelBtn.addTarget(self, action: #selector(didTapCancel), for: .touchUpInside)
        buttonsRow.addArrangedSubview(cancelBtn)

        submitButton.setTitle("Submit Request", for: .normal)
        submitButton.titleLabel?.font = .systemFont(ofSize: 14, weight: .bold)
        submitButton.setTitleColor(.white, for: .normal)
        submitButton.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        submitButton.layer.cornerRadius = 12
        submitButton.heightAnchor.constraint(equalToConstant: 46).isActive = true
        submitButton.addTarget(self, action: #selector(didTapSubmit), for: .touchUpInside)
        buttonsRow.addArrangedSubview(submitButton)

        spinner.color = .white
        spinner.hidesWhenStopped = true
        spinner.translatesAutoresizingMaskIntoConstraints = false
        submitButton.addSubview(spinner)

        stackView.addArrangedSubview(buttonsRow)

        NSLayoutConstraint.activate([
            scrollView.topAnchor.constraint(equalTo: view.topAnchor),
            scrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scrollView.bottomAnchor.constraint(equalTo: view.bottomAnchor),

            contentView.topAnchor.constraint(equalTo: scrollView.contentLayoutGuide.topAnchor),
            contentView.bottomAnchor.constraint(equalTo: scrollView.contentLayoutGuide.bottomAnchor, constant: -20),
            contentView.leadingAnchor.constraint(equalTo: scrollView.contentLayoutGuide.leadingAnchor),
            contentView.trailingAnchor.constraint(equalTo: scrollView.contentLayoutGuide.trailingAnchor),
            contentView.widthAnchor.constraint(equalTo: scrollView.widthAnchor),

            stackView.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 20),
            stackView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            stackView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20),
            stackView.bottomAnchor.constraint(equalTo: contentView.bottomAnchor),

            spinner.centerXAnchor.constraint(equalTo: submitButton.centerXAnchor),
            spinner.centerYAnchor.constraint(equalTo: submitButton.centerYAnchor)
        ])
    }

    private func makeDateContainer(title: String, picker: UIDatePicker) -> UIView {
        let container = UIStackView()
        container.axis = .vertical
        container.spacing = 6

        let label = UILabel()
        label.text = title
        label.font = .systemFont(ofSize: 11, weight: .bold)
        label.textColor = UIColor(red: 71/255, green: 85/255, blue: 105/255, alpha: 1.0)
        container.addArrangedSubview(label)

        picker.datePickerMode = .date
        if #available(iOS 14.0, *) {
            picker.preferredDatePickerStyle = .compact
        }
        container.addArrangedSubview(picker)
        return container
    }

    @objc private func didToggleHalfDay() {
        let isHalf = halfDaySwitch.isOn
        fullDayStack.isHidden = isHalf
        halfDayStack.isHidden = !isHalf
        updateTotalDays()
    }

    @objc private func didChangeStartDate() {
        if endDatePicker.date < startDatePicker.date {
            endDatePicker.date = startDatePicker.date
        }
        updateTotalDays()
    }

    @objc private func didChangeEndDate() {
        updateTotalDays()
    }

    @objc private func didChangeSingleDate() {
        updateTotalDays()
    }

    private func updateTotalDays() {
        if halfDaySwitch.isOn {
            totalDaysValueLabel.text = "0.5 days"
        } else {
            let cal = Calendar.current
            let s = cal.startOfDay(for: startDatePicker.date)
            let e = cal.startOfDay(for: endDatePicker.date)
            if e < s {
                totalDaysValueLabel.text = "0 days"
            } else {
                let diff = (cal.dateComponents([.day], from: s, to: e).day ?? 0) + 1
                totalDaysValueLabel.text = "\(diff) \(diff == 1 ? "day" : "days")"
            }
        }
    }

    @objc private func didTapCancel() {
        dismiss(animated: true)
    }

    @objc private func didTapSubmit() {
        let isHalf = halfDaySwitch.isOn
        let type = types[typeSegment.selectedSegmentIndex]
        let startDate = apiDateFormatter.string(from: isHalf ? singleDatePicker.date : startDatePicker.date)
        let endDate = isHalf ? startDate : apiDateFormatter.string(from: endDatePicker.date)
        let session = isHalf ? sessions[sessionSegment.selectedSegmentIndex] : nil
        let reason = reasonTextView.text.trimmingCharacters(in: .whitespacesAndNewlines)

        if !isHalf && endDatePicker.date < startDatePicker.date {
            errorLabel.text = "End date cannot be earlier than start date."
            errorLabel.isHidden = false
            return
        }

        if reason.isEmpty {
            errorLabel.text = "Please enter a brief reason for your leave request."
            errorLabel.isHidden = false
            return
        }

        errorLabel.isHidden = true
        submitButton.isEnabled = false
        submitButton.setTitle("", for: .normal)
        spinner.startAnimating()

        AuthService.shared.applyLeave(type: type, startDate: startDate, endDate: endDate, reason: reason, isHalfDay: isHalf, halfDaySession: session) { [weak self] result in
            DispatchQueue.main.async {
                self?.spinner.stopAnimating()
                self?.submitButton.setTitle("Submit Request", for: .normal)
                self?.submitButton.isEnabled = true

                switch result {
                case .success:
                    self?.dismiss(animated: true) {
                        self?.onSuccess?()
                    }
                case .failure(let error):
                    self?.errorLabel.text = error.localizedDescription
                    self?.errorLabel.isHidden = false
                }
            }
        }
    }
}
