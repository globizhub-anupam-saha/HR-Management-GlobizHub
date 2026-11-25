import UIKit

class AttendanceViewController: UIViewController, UIScrollViewDelegate {

    // MARK: - Properties & State
    private let scrollView = UIScrollView()
    private let contentView = UIView()

    // Top Bar
    private let topBar = UIView()
    private let topBarTitleLabel = UILabel()
    private let notificationBellButton = UIButton(type: .system)
    private let notificationBadgeDot = UIView()
    private let avatarContainer = UIView()
    private let avatarImageView = UIImageView()
    private let avatarInitialsLabel = UILabel()

    // 1. Banner Card
    private let bannerCard = UIView()
    private let bannerTitleLabel = UILabel()
    private let clockInDisabledButton = UIView()
    private let clockOutDisabledButton = UIView()

    // 2. Request Regularization Button
    private let requestRegularizationButton = UIButton(type: .system)

    // 3. My Attendance Section
    private let myAttendanceSectionView = UIView()
    private let myAttendanceTitleLabel = UILabel()
    private let myAttendanceSubtitleLabel = UILabel()
    private let todayStatusBadgeView = UIView()
    private let todayStatusDot = UIView()
    private let todayStatusLabel = UILabel()
    private let monthlyAttendanceValueLabel = UILabel()
    private let daysPresentValueLabel = UILabel()
    private let daysAbsentValueLabel = UILabel()

    // 4. History Views
    private let historyHeaderView = UIView()
    private let historyTitleLabel = UILabel()
    private let historySubtitleLabel = UILabel()
    private let seeAllButton = UIButton(type: .system)
    private let historyStackView = UIStackView()

    // Bottom Navigation Bar
    private let bottomNavBar = UIView()
    private let bottomNavContainer = UIView()

    // State Variables
    struct HistoryItem {
        var rawDate: Date? = nil
        let dateDisplay: String
        let timeRange: String
        let shiftName: String
        let status: String
        let clockIn: String
        let clockOut: String
        let workHours: String
    }

    private var historyItems: [HistoryItem] = []
    private var isExpanded: Bool = true

    // MARK: - Lifecycle
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
        navigationController?.setNavigationBarHidden(true, animated: false)

        setupTopBar()
        setupBottomNavBar()
        setupScrollView()
        setupBannerCard()
        setupRequestRegularizationButton()
        setupMyAttendanceSection()
        setupHistoryHeader()
        setupHistoryStack()

        loadAttendanceStats()
        loadAttendanceData()
        loadUserProfile()

        NotificationCenter.default.addObserver(self, selector: #selector(handleNotificationBadgeChanged), name: AppNotificationManager.notificationBadgeChangedNotification, object: nil)
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        if !AuthService.shared.isApprovedEmployee() {
            dismiss(animated: false, completion: nil)
            return
        }
        setupBottomNavBar()
        updateNotificationBadge()
        loadAttendanceStats()
        loadAttendanceData()
        loadUserProfile()
    }

    @objc private func handleNotificationBadgeChanged() {
        notificationBadgeDot.isHidden = !AuthService.shared.hasUnreadLocalNotifications()
    }

    private func updateNotificationBadge() {
        notificationBadgeDot.isHidden = !AuthService.shared.hasUnreadLocalNotifications()
    }

    // MARK: - Top Bar
    private func setupTopBar() {
        topBar.backgroundColor = .white
        topBar.layer.shadowColor = UIColor.black.cgColor
        topBar.layer.shadowOpacity = 0.04
        topBar.layer.shadowOffset = CGSize(width: 0, height: 1)
        topBar.layer.shadowRadius = 4
        topBar.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(topBar)

        let topBarContainer = UIView()
        topBarContainer.translatesAutoresizingMaskIntoConstraints = false
        topBar.addSubview(topBarContainer)

        let brandHeaderStack = UIStackView()
        brandHeaderStack.axis = .vertical
        brandHeaderStack.spacing = 1
        brandHeaderStack.translatesAutoresizingMaskIntoConstraints = false
        topBarContainer.addSubview(brandHeaderStack)

        let appLabel = UILabel()
        appLabel.text = "GLOBIZHR"
        appLabel.font = .systemFont(ofSize: 10, weight: .heavy)
        appLabel.textColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        brandHeaderStack.addArrangedSubview(appLabel)

        topBarTitleLabel.text = "Attendance"
        topBarTitleLabel.font = .systemFont(ofSize: 18, weight: .bold)
        topBarTitleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        brandHeaderStack.addArrangedSubview(topBarTitleLabel)

        let rightActionsStack = UIStackView()
        rightActionsStack.axis = .horizontal
        rightActionsStack.spacing = 10
        rightActionsStack.alignment = .center
        rightActionsStack.translatesAutoresizingMaskIntoConstraints = false
        topBarContainer.addSubview(rightActionsStack)

        // Notification Bell
        notificationBellButton.tintColor = UIColor(red: 30/255, green: 41/255, blue: 59/255, alpha: 1.0)
        let bellConfig = UIImage.SymbolConfiguration(pointSize: 18, weight: .medium)
        notificationBellButton.setImage(UIImage(systemName: "bell", withConfiguration: bellConfig), for: .normal)
        notificationBellButton.translatesAutoresizingMaskIntoConstraints = false
        notificationBellButton.addTarget(self, action: #selector(didTapNotifications), for: .touchUpInside)
        rightActionsStack.addArrangedSubview(notificationBellButton)

        // Red unread badge dot
        notificationBadgeDot.backgroundColor = UIColor(red: 239/255, green: 68/255, blue: 68/255, alpha: 1.0)
        notificationBadgeDot.layer.cornerRadius = 4
        notificationBadgeDot.layer.masksToBounds = true
        notificationBadgeDot.isHidden = true
        notificationBadgeDot.translatesAutoresizingMaskIntoConstraints = false
        notificationBellButton.addSubview(notificationBadgeDot)

        // Avatar container
        avatarContainer.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 0.12)
        avatarContainer.layer.cornerRadius = 18
        avatarContainer.layer.masksToBounds = true
        avatarContainer.translatesAutoresizingMaskIntoConstraints = false
        avatarContainer.isUserInteractionEnabled = true
        avatarContainer.addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(didTapProfile)))
        rightActionsStack.addArrangedSubview(avatarContainer)

        avatarInitialsLabel.text = "C"
        avatarInitialsLabel.font = .systemFont(ofSize: 14, weight: .bold)
        avatarInitialsLabel.textColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        avatarInitialsLabel.textAlignment = .center
        avatarInitialsLabel.translatesAutoresizingMaskIntoConstraints = false
        avatarContainer.addSubview(avatarInitialsLabel)

        avatarImageView.contentMode = .scaleAspectFill
        avatarImageView.isHidden = true
        avatarImageView.translatesAutoresizingMaskIntoConstraints = false
        avatarContainer.addSubview(avatarImageView)

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

            notificationBellButton.widthAnchor.constraint(equalToConstant: 36),
            notificationBellButton.heightAnchor.constraint(equalToConstant: 36),

            notificationBadgeDot.topAnchor.constraint(equalTo: notificationBellButton.topAnchor, constant: 5),
            notificationBadgeDot.trailingAnchor.constraint(equalTo: notificationBellButton.trailingAnchor, constant: -4),
            notificationBadgeDot.widthAnchor.constraint(equalToConstant: 8),
            notificationBadgeDot.heightAnchor.constraint(equalToConstant: 8),

            avatarContainer.widthAnchor.constraint(equalToConstant: 36),
            avatarContainer.heightAnchor.constraint(equalToConstant: 36),

            avatarInitialsLabel.centerXAnchor.constraint(equalTo: avatarContainer.centerXAnchor),
            avatarInitialsLabel.centerYAnchor.constraint(equalTo: avatarContainer.centerYAnchor),

            avatarImageView.topAnchor.constraint(equalTo: avatarContainer.topAnchor),
            avatarImageView.leadingAnchor.constraint(equalTo: avatarContainer.leadingAnchor),
            avatarImageView.trailingAnchor.constraint(equalTo: avatarContainer.trailingAnchor),
            avatarImageView.bottomAnchor.constraint(equalTo: avatarContainer.bottomAnchor)
        ])
    }

    // MARK: - Scroll View
    private func setupScrollView() {
        scrollView.showsVerticalScrollIndicator = false
        scrollView.delegate = self
        scrollView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(scrollView)

        contentView.translatesAutoresizingMaskIntoConstraints = false
        scrollView.addSubview(contentView)

        let isPad = UIDevice.current.userInterfaceIdiom == .pad
        let widthConstraint = isPad ?
            contentView.widthAnchor.constraint(equalToConstant: 680) :
            contentView.widthAnchor.constraint(equalTo: scrollView.frameLayoutGuide.widthAnchor)

        NSLayoutConstraint.activate([
            scrollView.topAnchor.constraint(equalTo: topBar.bottomAnchor),
            scrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scrollView.bottomAnchor.constraint(equalTo: view.bottomAnchor),

            contentView.topAnchor.constraint(equalTo: scrollView.contentLayoutGuide.topAnchor),
            contentView.bottomAnchor.constraint(equalTo: scrollView.contentLayoutGuide.bottomAnchor, constant: -100),
            contentView.leadingAnchor.constraint(equalTo: scrollView.contentLayoutGuide.leadingAnchor),
            contentView.trailingAnchor.constraint(equalTo: scrollView.contentLayoutGuide.trailingAnchor),
            widthConstraint
        ])

        if isPad {
            contentView.centerXAnchor.constraint(equalTo: scrollView.centerXAnchor).isActive = true
        }
    }

    // MARK: - 1. Banner Card with Disabled Buttons
    private func setupBannerCard() {
        bannerCard.backgroundColor = UIColor(red: 244/255, green: 246/255, blue: 251/255, alpha: 1.0)
        bannerCard.layer.cornerRadius = 18
        bannerCard.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        bannerCard.layer.borderWidth = 1
        bannerCard.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(bannerCard)

        let illustrationContainer = createBannerClockIllustration()
        illustrationContainer.translatesAutoresizingMaskIntoConstraints = false
        bannerCard.addSubview(illustrationContainer)

        let leftStack = UIStackView()
        leftStack.axis = .vertical
        leftStack.spacing = 14
        leftStack.alignment = .leading
        leftStack.translatesAutoresizingMaskIntoConstraints = false
        bannerCard.addSubview(leftStack)

        bannerTitleLabel.text = "Track check-ins and work\nhours with ease"
        bannerTitleLabel.numberOfLines = 2
        bannerTitleLabel.font = .systemFont(ofSize: 16, weight: .bold)
        bannerTitleLabel.textColor = UIColor(red: 30/255, green: 41/255, blue: 59/255, alpha: 1.0)
        leftStack.addArrangedSubview(bannerTitleLabel)

        // Side-by-Side Disabled Clock In & Clock Out Buttons
        let buttonsRow = UIStackView()
        buttonsRow.axis = .horizontal
        buttonsRow.spacing = 8
        buttonsRow.alignment = .center
        buttonsRow.translatesAutoresizingMaskIntoConstraints = false
        leftStack.addArrangedSubview(buttonsRow)

        // Clock In Pill (Disabled)
        configureDisabledPill(clockInDisabledButton, iconName: "stopwatch.fill", title: "Clock In")
        buttonsRow.addArrangedSubview(clockInDisabledButton)

        // Clock Out Pill (Disabled)
        configureDisabledPill(clockOutDisabledButton, iconName: "arrow.right.square.fill", title: "Clock Out")
        buttonsRow.addArrangedSubview(clockOutDisabledButton)

        NSLayoutConstraint.activate([
            bannerCard.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 14),
            bannerCard.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            bannerCard.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),

            illustrationContainer.trailingAnchor.constraint(equalTo: bannerCard.trailingAnchor, constant: -14),
            illustrationContainer.centerYAnchor.constraint(equalTo: bannerCard.centerYAnchor),
            illustrationContainer.widthAnchor.constraint(equalToConstant: 100),
            illustrationContainer.heightAnchor.constraint(equalToConstant: 85),

            leftStack.topAnchor.constraint(equalTo: bannerCard.topAnchor, constant: 18),
            leftStack.leadingAnchor.constraint(equalTo: bannerCard.leadingAnchor, constant: 18),
            leftStack.bottomAnchor.constraint(equalTo: bannerCard.bottomAnchor, constant: -18),
            leftStack.trailingAnchor.constraint(equalTo: illustrationContainer.leadingAnchor, constant: -8)
        ])
    }

    private func configureDisabledPill(_ pill: UIView, iconName: String, title: String) {
        pill.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        pill.layer.cornerRadius = 18
        pill.layer.masksToBounds = true
        pill.isUserInteractionEnabled = false
        pill.translatesAutoresizingMaskIntoConstraints = false

        let stack = UIStackView()
        stack.axis = .horizontal
        stack.spacing = 6
        stack.alignment = .center
        stack.translatesAutoresizingMaskIntoConstraints = false
        pill.addSubview(stack)

        let config = UIImage.SymbolConfiguration(pointSize: 13, weight: .bold)
        let iconView = UIImageView(image: UIImage(systemName: iconName, withConfiguration: config) ?? UIImage(systemName: "clock"))
        iconView.tintColor = .white
        iconView.contentMode = .scaleAspectFit
        iconView.translatesAutoresizingMaskIntoConstraints = false
        stack.addArrangedSubview(iconView)

        let label = UILabel()
        label.text = title
        label.font = .systemFont(ofSize: 12, weight: .bold)
        label.textColor = .white
        stack.addArrangedSubview(label)

        NSLayoutConstraint.activate([
            pill.heightAnchor.constraint(equalToConstant: 36),
            iconView.widthAnchor.constraint(equalToConstant: 14),
            iconView.heightAnchor.constraint(equalToConstant: 14),
            stack.leadingAnchor.constraint(equalTo: pill.leadingAnchor, constant: 14),
            stack.trailingAnchor.constraint(equalTo: pill.trailingAnchor, constant: -14),
            stack.centerYAnchor.constraint(equalTo: pill.centerYAnchor)
        ])
    }

    private func createBannerClockIllustration() -> UIView {
        let container = UIView()

        let cloud = UIView()
        cloud.backgroundColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 0.8)
        cloud.layer.cornerRadius = 14
        cloud.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(cloud)

        let sleeve = UIView()
        sleeve.backgroundColor = UIColor(red: 191/255, green: 219/255, blue: 254/255, alpha: 1.0)
        sleeve.layer.cornerRadius = 8
        sleeve.layer.borderColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0).cgColor
        sleeve.layer.borderWidth = 1.5
        sleeve.transform = CGAffineTransform(rotationAngle: .pi / 4.5)
        sleeve.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(sleeve)

        let clockOuter = UIView()
        clockOuter.backgroundColor = .white
        clockOuter.layer.cornerRadius = 28
        clockOuter.layer.borderColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0).cgColor
        clockOuter.layer.borderWidth = 2.5
        clockOuter.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(clockOuter)

        let crown = UIView()
        crown.backgroundColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        crown.layer.cornerRadius = 2
        crown.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(crown)

        let centerDot = UIView()
        centerDot.backgroundColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        centerDot.layer.cornerRadius = 2.5
        centerDot.translatesAutoresizingMaskIntoConstraints = false
        clockOuter.addSubview(centerDot)

        let hourHand = UIView()
        hourHand.backgroundColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        hourHand.layer.cornerRadius = 1
        hourHand.transform = CGAffineTransform(rotationAngle: -.pi / 3.0)
        hourHand.translatesAutoresizingMaskIntoConstraints = false
        clockOuter.addSubview(hourHand)

        let minuteHand = UIView()
        minuteHand.backgroundColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        minuteHand.layer.cornerRadius = 1
        minuteHand.transform = CGAffineTransform(rotationAngle: .pi / 4.0)
        minuteHand.translatesAutoresizingMaskIntoConstraints = false
        clockOuter.addSubview(minuteHand)

        NSLayoutConstraint.activate([
            cloud.bottomAnchor.constraint(equalTo: container.bottomAnchor, constant: -4),
            cloud.trailingAnchor.constraint(equalTo: container.trailingAnchor, constant: -6),
            cloud.widthAnchor.constraint(equalToConstant: 44),
            cloud.heightAnchor.constraint(equalToConstant: 24),

            sleeve.trailingAnchor.constraint(equalTo: container.trailingAnchor, constant: 4),
            sleeve.bottomAnchor.constraint(equalTo: container.bottomAnchor, constant: 6),
            sleeve.widthAnchor.constraint(equalToConstant: 34),
            sleeve.heightAnchor.constraint(equalToConstant: 44),

            clockOuter.centerXAnchor.constraint(equalTo: container.centerXAnchor, constant: 2),
            clockOuter.centerYAnchor.constraint(equalTo: container.centerYAnchor, constant: -2),
            clockOuter.widthAnchor.constraint(equalToConstant: 56),
            clockOuter.heightAnchor.constraint(equalToConstant: 56),

            crown.bottomAnchor.constraint(equalTo: clockOuter.topAnchor, constant: 2),
            crown.centerXAnchor.constraint(equalTo: clockOuter.centerXAnchor),
            crown.widthAnchor.constraint(equalToConstant: 8),
            crown.heightAnchor.constraint(equalToConstant: 5),

            centerDot.centerXAnchor.constraint(equalTo: clockOuter.centerXAnchor),
            centerDot.centerYAnchor.constraint(equalTo: clockOuter.centerYAnchor),
            centerDot.widthAnchor.constraint(equalToConstant: 5),
            centerDot.heightAnchor.constraint(equalToConstant: 5),

            hourHand.trailingAnchor.constraint(equalTo: centerDot.centerXAnchor, constant: 1),
            hourHand.centerYAnchor.constraint(equalTo: centerDot.centerYAnchor, constant: -4),
            hourHand.widthAnchor.constraint(equalToConstant: 12),
            hourHand.heightAnchor.constraint(equalToConstant: 2.5),

            minuteHand.leadingAnchor.constraint(equalTo: centerDot.centerXAnchor, constant: -1),
            minuteHand.centerYAnchor.constraint(equalTo: centerDot.centerYAnchor, constant: -5),
            minuteHand.widthAnchor.constraint(equalToConstant: 16),
            minuteHand.heightAnchor.constraint(equalToConstant: 2.5)
        ])

        return container
    }

    // MARK: - 2. Request Regularization Button
    private func setupRequestRegularizationButton() {
        requestRegularizationButton.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        requestRegularizationButton.layer.cornerRadius = 14
        requestRegularizationButton.layer.masksToBounds = true
        requestRegularizationButton.translatesAutoresizingMaskIntoConstraints = false
        requestRegularizationButton.addTarget(self, action: #selector(didTapRequestRegularization), for: .touchUpInside)
        contentView.addSubview(requestRegularizationButton)

        let stack = UIStackView()
        stack.axis = .horizontal
        stack.spacing = 10
        stack.alignment = .center
        stack.isUserInteractionEnabled = false
        stack.translatesAutoresizingMaskIntoConstraints = false
        requestRegularizationButton.addSubview(stack)

        let config = UIImage.SymbolConfiguration(pointSize: 16, weight: .bold)
        let iconView = UIImageView(image: UIImage(systemName: "calendar.badge.clock", withConfiguration: config) ?? UIImage(systemName: "calendar"))
        iconView.tintColor = .white
        iconView.contentMode = .scaleAspectFit
        iconView.translatesAutoresizingMaskIntoConstraints = false
        stack.addArrangedSubview(iconView)

        let titleLabel = UILabel()
        titleLabel.text = "Request Regularization"
        titleLabel.font = .systemFont(ofSize: 14, weight: .bold)
        titleLabel.textColor = .white
        stack.addArrangedSubview(titleLabel)

        NSLayoutConstraint.activate([
            requestRegularizationButton.topAnchor.constraint(equalTo: bannerCard.bottomAnchor, constant: 14),
            requestRegularizationButton.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            requestRegularizationButton.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            requestRegularizationButton.heightAnchor.constraint(equalToConstant: 48),

            stack.centerXAnchor.constraint(equalTo: requestRegularizationButton.centerXAnchor),
            stack.centerYAnchor.constraint(equalTo: requestRegularizationButton.centerYAnchor),
            iconView.widthAnchor.constraint(equalToConstant: 20),
            iconView.heightAnchor.constraint(equalToConstant: 20)
        ])
    }

    // MARK: - 3. My Attendance Section (4 Real-time Stat Boxes)
    private func setupMyAttendanceSection() {
        myAttendanceSectionView.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(myAttendanceSectionView)

        myAttendanceTitleLabel.text = "My Attendance"
        myAttendanceTitleLabel.font = .systemFont(ofSize: 18, weight: .bold)
        myAttendanceTitleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        myAttendanceTitleLabel.translatesAutoresizingMaskIntoConstraints = false
        myAttendanceSectionView.addSubview(myAttendanceTitleLabel)

        myAttendanceSubtitleLabel.text = "Personal monthly performance and daily status"
        myAttendanceSubtitleLabel.font = .systemFont(ofSize: 12, weight: .medium)
        myAttendanceSubtitleLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        myAttendanceSubtitleLabel.translatesAutoresizingMaskIntoConstraints = false
        myAttendanceSectionView.addSubview(myAttendanceSubtitleLabel)

        let gridStack = UIStackView()
        gridStack.axis = .vertical
        gridStack.spacing = 10
        gridStack.translatesAutoresizingMaskIntoConstraints = false
        myAttendanceSectionView.addSubview(gridStack)

        // Row 1: Today's Status & Monthly Attendance
        let row1 = UIStackView()
        row1.axis = .horizontal
        row1.spacing = 12
        row1.distribution = .fillEqually
        gridStack.addArrangedSubview(row1)

        let card1 = makeStatCardContainer()
        setupTodayStatusCard(in: card1)
        row1.addArrangedSubview(card1)

        let card2 = makeStatCardContainer()
        setupValueCard(in: card2, title: "MONTHLY ATTENDANCE", titleColor: UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0), valueLabel: monthlyAttendanceValueLabel, valueColor: UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0), defaultValue: "0%")
        row1.addArrangedSubview(card2)

        // Row 2: Days Present & Days Absent
        let row2 = UIStackView()
        row2.axis = .horizontal
        row2.spacing = 12
        row2.distribution = .fillEqually
        gridStack.addArrangedSubview(row2)

        let card3 = makeStatCardContainer()
        setupValueCard(in: card3, title: "DAYS PRESENT", titleColor: UIColor(red: 22/255, green: 163/255, blue: 74/255, alpha: 1.0), valueLabel: daysPresentValueLabel, valueColor: UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0), defaultValue: "0")
        row2.addArrangedSubview(card3)

        let card4 = makeStatCardContainer()
        setupValueCard(in: card4, title: "DAYS ABSENT", titleColor: UIColor(red: 225/255, green: 29/255, blue: 72/255, alpha: 1.0), valueLabel: daysAbsentValueLabel, valueColor: UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0), defaultValue: "0")
        row2.addArrangedSubview(card4)

        NSLayoutConstraint.activate([
            myAttendanceSectionView.topAnchor.constraint(equalTo: requestRegularizationButton.bottomAnchor, constant: 22),
            myAttendanceSectionView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            myAttendanceSectionView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),

            myAttendanceTitleLabel.topAnchor.constraint(equalTo: myAttendanceSectionView.topAnchor),
            myAttendanceTitleLabel.leadingAnchor.constraint(equalTo: myAttendanceSectionView.leadingAnchor),

            myAttendanceSubtitleLabel.topAnchor.constraint(equalTo: myAttendanceTitleLabel.bottomAnchor, constant: 2),
            myAttendanceSubtitleLabel.leadingAnchor.constraint(equalTo: myAttendanceSectionView.leadingAnchor),

            gridStack.topAnchor.constraint(equalTo: myAttendanceSubtitleLabel.bottomAnchor, constant: 12),
            gridStack.leadingAnchor.constraint(equalTo: myAttendanceSectionView.leadingAnchor),
            gridStack.trailingAnchor.constraint(equalTo: myAttendanceSectionView.trailingAnchor),
            gridStack.bottomAnchor.constraint(equalTo: myAttendanceSectionView.bottomAnchor)
        ])
    }

    private func makeStatCardContainer() -> UIView {
        let card = UIView()
        card.backgroundColor = .white
        card.layer.cornerRadius = 14
        card.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        card.layer.borderWidth = 1
        card.layer.shadowColor = UIColor.black.cgColor
        card.layer.shadowOpacity = 0.03
        card.layer.shadowOffset = CGSize(width: 0, height: 2)
        card.layer.shadowRadius = 4
        card.translatesAutoresizingMaskIntoConstraints = false
        return card
    }

    private func setupTodayStatusCard(in card: UIView) {
        let titleLabel = UILabel()
        titleLabel.text = "TODAY'S STATUS"
        titleLabel.font = .systemFont(ofSize: 11, weight: .bold)
        titleLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        card.addSubview(titleLabel)

        todayStatusBadgeView.backgroundColor = UIColor(red: 236/255, green: 253/255, blue: 245/255, alpha: 1.0)
        todayStatusBadgeView.layer.cornerRadius = 6
        todayStatusBadgeView.layer.borderColor = UIColor(red: 167/255, green: 243/255, blue: 208/255, alpha: 1.0).cgColor
        todayStatusBadgeView.layer.borderWidth = 1
        todayStatusBadgeView.translatesAutoresizingMaskIntoConstraints = false
        card.addSubview(todayStatusBadgeView)

        todayStatusDot.backgroundColor = UIColor(red: 5/255, green: 150/255, blue: 105/255, alpha: 1.0)
        todayStatusDot.layer.cornerRadius = 3
        todayStatusDot.translatesAutoresizingMaskIntoConstraints = false
        todayStatusBadgeView.addSubview(todayStatusDot)

        todayStatusLabel.text = "Pending"
        todayStatusLabel.font = .systemFont(ofSize: 12, weight: .bold)
        todayStatusLabel.textColor = UIColor(red: 5/255, green: 150/255, blue: 105/255, alpha: 1.0)
        todayStatusLabel.translatesAutoresizingMaskIntoConstraints = false
        todayStatusBadgeView.addSubview(todayStatusLabel)

        NSLayoutConstraint.activate([
            titleLabel.topAnchor.constraint(equalTo: card.topAnchor, constant: 14),
            titleLabel.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 14),

            todayStatusBadgeView.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 8),
            todayStatusBadgeView.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 14),
            todayStatusBadgeView.bottomAnchor.constraint(equalTo: card.bottomAnchor, constant: -14),
            todayStatusBadgeView.heightAnchor.constraint(equalToConstant: 28),

            todayStatusDot.leadingAnchor.constraint(equalTo: todayStatusBadgeView.leadingAnchor, constant: 8),
            todayStatusDot.centerYAnchor.constraint(equalTo: todayStatusBadgeView.centerYAnchor),
            todayStatusDot.widthAnchor.constraint(equalToConstant: 6),
            todayStatusDot.heightAnchor.constraint(equalToConstant: 6),

            todayStatusLabel.leadingAnchor.constraint(equalTo: todayStatusDot.trailingAnchor, constant: 6),
            todayStatusLabel.trailingAnchor.constraint(equalTo: todayStatusBadgeView.trailingAnchor, constant: -10),
            todayStatusLabel.centerYAnchor.constraint(equalTo: todayStatusBadgeView.centerYAnchor)
        ])
    }

    private func setupValueCard(in card: UIView, title: String, titleColor: UIColor, valueLabel: UILabel, valueColor: UIColor, defaultValue: String) {
        let titleLabel = UILabel()
        titleLabel.text = title
        titleLabel.font = .systemFont(ofSize: 11, weight: .bold)
        titleLabel.textColor = titleColor
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        card.addSubview(titleLabel)

        valueLabel.text = defaultValue
        valueLabel.font = .systemFont(ofSize: 22, weight: .bold)
        valueLabel.textColor = valueColor
        valueLabel.translatesAutoresizingMaskIntoConstraints = false
        card.addSubview(valueLabel)

        NSLayoutConstraint.activate([
            titleLabel.topAnchor.constraint(equalTo: card.topAnchor, constant: 14),
            titleLabel.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 14),

            valueLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 6),
            valueLabel.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 14),
            valueLabel.bottomAnchor.constraint(equalTo: card.bottomAnchor, constant: -14)
        ])
    }

    // MARK: - 4. History Header & Stack
    private func setupHistoryHeader() {
        historyHeaderView.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(historyHeaderView)

        let titleStack = UIStackView()
        titleStack.axis = .vertical
        titleStack.spacing = 1
        titleStack.translatesAutoresizingMaskIntoConstraints = false
        historyHeaderView.addSubview(titleStack)

        historyTitleLabel.text = "Attendance History"
        historyTitleLabel.font = .systemFont(ofSize: 18, weight: .bold)
        historyTitleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        titleStack.addArrangedSubview(historyTitleLabel)

        historySubtitleLabel.text = "Last 30 Days"
        historySubtitleLabel.font = .systemFont(ofSize: 12, weight: .medium)
        historySubtitleLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        titleStack.addArrangedSubview(historySubtitleLabel)

        seeAllButton.setTitle("See All >", for: .normal)
        seeAllButton.titleLabel?.font = .systemFont(ofSize: 13, weight: .bold)
        seeAllButton.setTitleColor(UIColor(red: 71/255, green: 85/255, blue: 105/255, alpha: 1.0), for: .normal)
        seeAllButton.translatesAutoresizingMaskIntoConstraints = false
        seeAllButton.addTarget(self, action: #selector(didTapSeeAll), for: .touchUpInside)
        historyHeaderView.addSubview(seeAllButton)

        NSLayoutConstraint.activate([
            historyHeaderView.topAnchor.constraint(equalTo: myAttendanceSectionView.bottomAnchor, constant: 24),
            historyHeaderView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            historyHeaderView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),

            titleStack.leadingAnchor.constraint(equalTo: historyHeaderView.leadingAnchor),
            titleStack.topAnchor.constraint(equalTo: historyHeaderView.topAnchor),
            titleStack.bottomAnchor.constraint(equalTo: historyHeaderView.bottomAnchor),

            seeAllButton.trailingAnchor.constraint(equalTo: historyHeaderView.trailingAnchor),
            seeAllButton.centerYAnchor.constraint(equalTo: historyHeaderView.centerYAnchor)
        ])
    }

    private func setupHistoryStack() {
        historyStackView.axis = .vertical
        historyStackView.spacing = 10
        historyStackView.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(historyStackView)

        NSLayoutConstraint.activate([
            historyStackView.topAnchor.constraint(equalTo: historyHeaderView.bottomAnchor, constant: 12),
            historyStackView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            historyStackView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            historyStackView.bottomAnchor.constraint(equalTo: contentView.bottomAnchor)
        ])
    }

    // MARK: - Auto-Hide Bottom Navigation
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

    // MARK: - Bottom Navigation Bar
    private func setupBottomNavBar() {
        bottomNavBar.backgroundColor = .white
        bottomNavBar.layer.shadowColor = UIColor.black.cgColor
        bottomNavBar.layer.shadowOpacity = 0.05
        bottomNavBar.layer.shadowOffset = CGSize(width: 0, height: -2)
        bottomNavBar.layer.shadowRadius = 8
        bottomNavBar.translatesAutoresizingMaskIntoConstraints = false
        if bottomNavBar.superview == nil {
            view.addSubview(bottomNavBar)
        }

        bottomNavContainer.translatesAutoresizingMaskIntoConstraints = false
        if bottomNavContainer.superview == nil {
            bottomNavBar.addSubview(bottomNavContainer)
        }

        let navWidth = bottomNavContainer.widthAnchor.constraint(equalTo: bottomNavBar.widthAnchor)
        navWidth.priority = UILayoutPriority(999)
        navWidth.isActive = true

        NSLayoutConstraint.activate([
            bottomNavBar.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            bottomNavBar.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            bottomNavBar.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            bottomNavBar.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -56),

            bottomNavContainer.topAnchor.constraint(equalTo: bottomNavBar.topAnchor),
            bottomNavContainer.centerXAnchor.constraint(equalTo: bottomNavBar.centerXAnchor),
            bottomNavContainer.widthAnchor.constraint(lessThanOrEqualToConstant: 680),
            bottomNavContainer.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor)
        ])

        RoleNavigationManager.setupBottomNavBar(
            in: self,
            navBar: bottomNavBar,
            container: bottomNavContainer,
            activeTabId: "attendance",
            scrollHandler: { [weak self] in
                self?.scrollView.setContentOffset(.zero, animated: true)
            }
        )
    }

    // MARK: - Actions
    @objc private func didTapSeeAll() {
        isExpanded = !isExpanded
        renderHistoryList()
    }

    @objc private func didTapNotifications() {
        AuthService.shared.markLocalNotificationsAsRead()
        updateNotificationBadge()
        let alert = UIAlertController(title: "Notifications", message: "All attendance records and shift updates are synchronized in real-time.", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }

    @objc private func didTapProfile() {
        let settingsVC = SettingsViewController()
        settingsVC.modalPresentationStyle = .fullScreen
        present(settingsVC, animated: true)
    }

    // MARK: - Regularization Modal
    @objc private func didTapRequestRegularization() {
        let modal = RegularizationModalViewController()
        modal.onSuccess = { [weak self] in
            self?.loadAttendanceStats()
            self?.loadAttendanceData()
        }
        let nav = UINavigationController(rootViewController: modal)
        nav.modalPresentationStyle = .pageSheet
        if let sheet = nav.sheetPresentationController {
            sheet.detents = [.medium(), .large()]
            sheet.prefersGrabberVisible = true
        }
        present(nav, animated: true)
    }

    // MARK: - Real-Time Data Loading
    private func loadAttendanceStats() {
        AuthService.shared.getAttendanceStats { [weak self] result in
            DispatchQueue.main.async {
                guard let self = self else { return }
                if case .success(let stats) = result {
                    self.applyAttendanceStats(stats)
                }
            }
        }
    }

    private func applyAttendanceStats(_ stats: [String: Any]) {
        let todayStatus = (stats["todayStatus"] as? String) ?? "PENDING"
        let percentage = (stats["attendancePercentage"] as? Int) ?? 0
        let presentDays = (stats["presentDays"] as? Int) ?? 0
        let absentDays = (stats["absentDays"] as? Int) ?? 0

        monthlyAttendanceValueLabel.text = "\(percentage)%"
        daysPresentValueLabel.text = "\(presentDays)"
        daysAbsentValueLabel.text = "\(absentDays)"

        applyStatusBadge(badgeView: todayStatusBadgeView, dotView: todayStatusDot, label: todayStatusLabel, status: todayStatus)
    }

    private func applyStatusBadge(badgeView: UIView, dotView: UIView, label: UILabel, status: String) {
        let upper = status.uppercased()
        dotView.isHidden = false
        badgeView.layer.cornerRadius = 6
        badgeView.layer.masksToBounds = true
        badgeView.layer.borderWidth = 1

        switch upper {
        case "PRESENT":
            badgeView.backgroundColor = UIColor(red: 236/255, green: 253/255, blue: 245/255, alpha: 1.0)
            badgeView.layer.borderColor = UIColor(red: 167/255, green: 243/255, blue: 208/255, alpha: 1.0).cgColor
            dotView.backgroundColor = UIColor(red: 5/255, green: 150/255, blue: 105/255, alpha: 1.0)
            label.textColor = UIColor(red: 5/255, green: 150/255, blue: 105/255, alpha: 1.0)
            label.text = "Present"
        case "LATE":
            badgeView.backgroundColor = UIColor(red: 254/255, green: 243/255, blue: 199/255, alpha: 1.0)
            badgeView.layer.borderColor = UIColor(red: 253/255, green: 230/255, blue: 138/255, alpha: 1.0).cgColor
            dotView.backgroundColor = UIColor(red: 217/255, green: 119/255, blue: 6/255, alpha: 1.0)
            label.textColor = UIColor(red: 217/255, green: 119/255, blue: 6/255, alpha: 1.0)
            label.text = "Late"
        case "HALF_DAY":
            badgeView.backgroundColor = UIColor(red: 254/255, green: 243/255, blue: 199/255, alpha: 1.0)
            badgeView.layer.borderColor = UIColor(red: 253/255, green: 230/255, blue: 138/255, alpha: 1.0).cgColor
            dotView.backgroundColor = UIColor(red: 146/255, green: 64/255, blue: 14/255, alpha: 1.0)
            label.textColor = UIColor(red: 146/255, green: 64/255, blue: 14/255, alpha: 1.0)
            label.text = "Half Day"
        case "ABSENT":
            badgeView.backgroundColor = UIColor(red: 255/255, green: 228/255, blue: 230/255, alpha: 1.0)
            badgeView.layer.borderColor = UIColor(red: 254/255, green: 205/255, blue: 211/255, alpha: 1.0).cgColor
            dotView.backgroundColor = UIColor(red: 225/255, green: 29/255, blue: 72/255, alpha: 1.0)
            label.textColor = UIColor(red: 225/255, green: 29/255, blue: 72/255, alpha: 1.0)
            label.text = "Absent"
        case "ON_LEAVE":
            badgeView.backgroundColor = UIColor(red: 219/255, green: 234/255, blue: 254/255, alpha: 1.0)
            badgeView.layer.borderColor = UIColor(red: 191/255, green: 219/255, blue: 254/255, alpha: 1.0).cgColor
            dotView.backgroundColor = UIColor(red: 29/255, green: 78/255, blue: 216/255, alpha: 1.0)
            label.textColor = UIColor(red: 29/255, green: 78/255, blue: 216/255, alpha: 1.0)
            label.text = "On Leave"
        case "SHIFT_GIVEN":
            badgeView.backgroundColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0)
            badgeView.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
            dotView.isHidden = true
            label.textColor = UIColor(red: 71/255, green: 85/255, blue: 105/255, alpha: 1.0)
            label.text = "Shift Given"
        case "PROXY_SHIFT_SWAP":
            badgeView.backgroundColor = UIColor(red: 239/255, green: 246/255, blue: 255/255, alpha: 1.0)
            badgeView.layer.borderColor = UIColor(red: 191/255, green: 219/255, blue: 254/255, alpha: 1.0).cgColor
            dotView.backgroundColor = UIColor(red: 37/255, green: 99/255, blue: 235/255, alpha: 1.0)
            label.textColor = UIColor(red: 37/255, green: 99/255, blue: 235/255, alpha: 1.0)
            label.text = "Proxy Present"
        default:
            badgeView.backgroundColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0)
            badgeView.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
            dotView.isHidden = true
            label.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
            label.text = "Pending"
        }
    }

    private func loadAttendanceData() {
        AuthService.shared.getMyAttendanceHistory { [weak self] result in
            DispatchQueue.main.async {
                guard let self = self else { return }
                switch result {
                case .success(let records):
                    if !records.isEmpty {
                        self.parseHistoryRecords(records)
                    } else {
                        self.historyItems.removeAll()
                    }
                case .failure:
                    self.historyItems.removeAll()
                }
                self.renderHistoryList()
            }
        }
    }

    private func parseHistoryRecords(_ records: [[String: Any]]) {
        historyItems.removeAll()
        let apiFmt = ISO8601DateFormatter()
        let isoFallback = ISO8601DateFormatter()
        isoFallback.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        let displayDateFmt = DateFormatter()
        displayDateFmt.dateFormat = "EEE, dd MMM yyyy"

        let timeFmt = DateFormatter()
        timeFmt.dateFormat = "hh:mma"

        for record in records {
            let dateRaw = record["date"] as? String ?? ""
            var parsedDate: Date? = nil
            if !dateRaw.isEmpty {
                parsedDate = apiFmt.date(from: dateRaw) ?? isoFallback.date(from: dateRaw)
            }

            let dateDisplay = parsedDate != nil ? displayDateFmt.string(from: parsedDate!) : (dateRaw.components(separatedBy: "T").first ?? "Date")
            let status = (record["status"] as? String) ?? "PRESENT"

            let clockInRaw = (record["checkInTime"] as? String) ?? (record["clockIn"] as? String)
            let clockOutRaw = (record["checkOutTime"] as? String) ?? (record["clockOut"] as? String)

            var inStr = "--:--"
            if let inRaw = clockInRaw, !inRaw.isEmpty, inRaw.lowercased() != "null",
               let inDate = apiFmt.date(from: inRaw) ?? isoFallback.date(from: inRaw) {
                inStr = timeFmt.string(from: inDate).lowercased()
            }

            var outStr = "--:--"
            if let outRaw = clockOutRaw, !outRaw.isEmpty, outRaw.lowercased() != "null",
               let outDate = apiFmt.date(from: outRaw) ?? isoFallback.date(from: outRaw) {
                outStr = timeFmt.string(from: outDate).lowercased()
            }

            let workHours = (record["workingHours"] as? Double) ?? (record["workingHours"] as? Int).map { Double($0) } ?? 0.0
            let hoursStr = workHours > 0 ? "\(workHours) hrs" : "--"

            let timeRange = "\(inStr) - \(outStr)" + (workHours > 0 ? " • \(hoursStr)" : "")

            let shiftDict = record["shift"] as? [String: Any]
            let shiftName = (shiftDict?["name"] as? String) ?? "Standard Shift"

            historyItems.append(HistoryItem(
                rawDate: parsedDate,
                dateDisplay: dateDisplay,
                timeRange: timeRange,
                shiftName: shiftName,
                status: status,
                clockIn: inStr,
                clockOut: outStr,
                workHours: hoursStr
            ))
        }

        historyItems.sort { ($0.rawDate ?? Date.distantPast) > ($1.rawDate ?? Date.distantPast) }
    }

    private func renderHistoryList() {
        historyStackView.arrangedSubviews.forEach { $0.removeFromSuperview() }

        if historyItems.isEmpty {
            let emptyLabel = UILabel()
            emptyLabel.text = "No attendance history recorded yet"
            emptyLabel.textColor = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 1.0)
            emptyLabel.font = .systemFont(ofSize: 14, weight: .medium)
            emptyLabel.textAlignment = .center
            emptyLabel.translatesAutoresizingMaskIntoConstraints = false
            historyStackView.addArrangedSubview(emptyLabel)
            emptyLabel.heightAnchor.constraint(equalToConstant: 60).isActive = true
            seeAllButton.isHidden = true
            return
        }

        let maxCount = isExpanded ? min(30, historyItems.count) : min(7, historyItems.count)
        seeAllButton.isHidden = historyItems.count <= 7
        seeAllButton.setTitle(isExpanded ? "Show 7 Days" : "See All >", for: .normal)

        for i in 0..<maxCount {
            let item = historyItems[i]
            let card = makeHistoryItemCard(item: item)
            historyStackView.addArrangedSubview(card)
        }
    }

    private func makeHistoryItemCard(item: HistoryItem) -> UIView {
        let card = UIView()
        card.backgroundColor = .white
        card.layer.cornerRadius = 16
        card.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        card.layer.borderWidth = 1
        card.layer.shadowColor = UIColor.black.cgColor
        card.layer.shadowOpacity = 0.03
        card.layer.shadowOffset = CGSize(width: 0, height: 2)
        card.layer.shadowRadius = 4
        card.translatesAutoresizingMaskIntoConstraints = false

        let iconContainer = UIView()
        iconContainer.backgroundColor = UIColor(red: 239/255, green: 246/255, blue: 255/255, alpha: 1.0)
        iconContainer.layer.cornerRadius = 22
        iconContainer.translatesAutoresizingMaskIntoConstraints = false
        card.addSubview(iconContainer)

        let icon = UIImageView()
        let config = UIImage.SymbolConfiguration(pointSize: 16, weight: .semibold)
        icon.image = UIImage(systemName: "clock.fill", withConfiguration: config) ?? UIImage(systemName: "clock")
        icon.tintColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        icon.contentMode = .scaleAspectFit
        icon.translatesAutoresizingMaskIntoConstraints = false
        iconContainer.addSubview(icon)

        let infoStack = UIStackView()
        infoStack.axis = .vertical
        infoStack.spacing = 3
        infoStack.translatesAutoresizingMaskIntoConstraints = false
        card.addSubview(infoStack)

        let dateLabel = UILabel()
        dateLabel.text = item.dateDisplay
        dateLabel.font = .systemFont(ofSize: 14, weight: .bold)
        dateLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        infoStack.addArrangedSubview(dateLabel)

        let timeLabel = UILabel()
        timeLabel.text = item.timeRange
        timeLabel.font = .systemFont(ofSize: 12, weight: .medium)
        timeLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        infoStack.addArrangedSubview(timeLabel)

        let rightStack = UIStackView()
        rightStack.axis = .vertical
        rightStack.spacing = 4
        rightStack.alignment = .trailing
        rightStack.translatesAutoresizingMaskIntoConstraints = false
        card.addSubview(rightStack)

        let shiftLabel = UILabel()
        shiftLabel.text = item.shiftName
        shiftLabel.font = .systemFont(ofSize: 12, weight: .semibold)
        shiftLabel.textColor = UIColor(red: 30/255, green: 41/255, blue: 59/255, alpha: 1.0)
        rightStack.addArrangedSubview(shiftLabel)

        let badgeView = UIView()
        badgeView.translatesAutoresizingMaskIntoConstraints = false
        let badgeDot = UIView()
        badgeDot.layer.cornerRadius = 3
        badgeDot.translatesAutoresizingMaskIntoConstraints = false
        badgeView.addSubview(badgeDot)
        let badgeLabel = UILabel()
        badgeLabel.font = .systemFont(ofSize: 11, weight: .bold)
        badgeLabel.translatesAutoresizingMaskIntoConstraints = false
        badgeView.addSubview(badgeLabel)

        applyStatusBadge(badgeView: badgeView, dotView: badgeDot, label: badgeLabel, status: item.status)
        rightStack.addArrangedSubview(badgeView)

        NSLayoutConstraint.activate([
            card.heightAnchor.constraint(greaterThanOrEqualToConstant: 68),

            iconContainer.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 14),
            iconContainer.centerYAnchor.constraint(equalTo: card.centerYAnchor),
            iconContainer.widthAnchor.constraint(equalToConstant: 44),
            iconContainer.heightAnchor.constraint(equalToConstant: 44),

            icon.centerXAnchor.constraint(equalTo: iconContainer.centerXAnchor),
            icon.centerYAnchor.constraint(equalTo: iconContainer.centerYAnchor),
            icon.widthAnchor.constraint(equalToConstant: 20),
            icon.heightAnchor.constraint(equalToConstant: 20),

            infoStack.leadingAnchor.constraint(equalTo: iconContainer.trailingAnchor, constant: 12),
            infoStack.centerYAnchor.constraint(equalTo: card.centerYAnchor),
            infoStack.trailingAnchor.constraint(lessThanOrEqualTo: rightStack.leadingAnchor, constant: -8),

            rightStack.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -14),
            rightStack.centerYAnchor.constraint(equalTo: card.centerYAnchor),

            badgeDot.leadingAnchor.constraint(equalTo: badgeView.leadingAnchor, constant: 6),
            badgeDot.centerYAnchor.constraint(equalTo: badgeView.centerYAnchor),
            badgeDot.widthAnchor.constraint(equalToConstant: 6),
            badgeDot.heightAnchor.constraint(equalToConstant: 6),

            badgeLabel.leadingAnchor.constraint(equalTo: badgeDot.trailingAnchor, constant: 4),
            badgeLabel.trailingAnchor.constraint(equalTo: badgeView.trailingAnchor, constant: -6),
            badgeLabel.topAnchor.constraint(equalTo: badgeView.topAnchor, constant: 3),
            badgeLabel.bottomAnchor.constraint(equalTo: badgeView.bottomAnchor, constant: -3)
        ])

        return card
    }

    private func loadUserProfile() {
        let firstName = AuthService.shared.getFirstName()
        let lastName = AuthService.shared.getLastName()
        if !firstName.isEmpty {
            var initial = String(firstName.prefix(1)).uppercased()
            if !lastName.isEmpty {
                initial += String(lastName.prefix(1)).uppercased()
            }
            avatarInitialsLabel.text = initial
        } else {
            avatarInitialsLabel.text = "C"
        }
    }
}

// MARK: - Regularization Modal Controller
class RegularizationModalViewController: UIViewController {

    var onSuccess: (() -> Void)?

    private let scrollView = UIScrollView()
    private let contentView = UIView()

    private let titleLabel = UILabel()
    private let subtitleLabel = UILabel()
    private let errorLabel = UILabel()

    private let datePicker = UIDatePicker()
    private let checkInPicker = UIDatePicker()
    private let checkOutPicker = UIDatePicker()
    private let reasonTextView = UITextView()
    private let submitButton = UIButton(type: .system)
    private let spinner = UIActivityIndicatorView(style: .medium)

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white
        title = "Attendance Regularization"

        navigationItem.leftBarButtonItem = UIBarButtonItem(title: "Cancel", style: .plain, target: self, action: #selector(didTapCancel))
        navigationItem.leftBarButtonItem?.tintColor = UIColor(red: 71/255, green: 85/255, blue: 105/255, alpha: 1.0)

        setupForm()
    }

    @objc private func didTapCancel() {
        dismiss(animated: true)
    }

    private func setupForm() {
        scrollView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(scrollView)

        contentView.translatesAutoresizingMaskIntoConstraints = false
        scrollView.addSubview(contentView)

        NSLayoutConstraint.activate([
            scrollView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            scrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scrollView.bottomAnchor.constraint(equalTo: view.bottomAnchor),

            contentView.topAnchor.constraint(equalTo: scrollView.contentLayoutGuide.topAnchor),
            contentView.bottomAnchor.constraint(equalTo: scrollView.contentLayoutGuide.bottomAnchor, constant: -30),
            contentView.leadingAnchor.constraint(equalTo: scrollView.contentLayoutGuide.leadingAnchor),
            contentView.trailingAnchor.constraint(equalTo: scrollView.contentLayoutGuide.trailingAnchor),
            contentView.widthAnchor.constraint(equalTo: scrollView.frameLayoutGuide.widthAnchor)
        ])

        titleLabel.text = "Request Attendance Regularization"
        titleLabel.font = .systemFont(ofSize: 18, weight: .bold)
        titleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(titleLabel)

        subtitleLabel.text = "Submit a correction request for missed clock-ins, biometric failures, or on-duty client visits."
        subtitleLabel.font = .systemFont(ofSize: 13, weight: .medium)
        subtitleLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        subtitleLabel.numberOfLines = 0
        subtitleLabel.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(subtitleLabel)

        errorLabel.textColor = UIColor(red: 185/255, green: 28/255, blue: 28/255, alpha: 1.0)
        errorLabel.font = .systemFont(ofSize: 12, weight: .semibold)
        errorLabel.numberOfLines = 0
        errorLabel.isHidden = true
        errorLabel.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(errorLabel)

        // Date Field
        let dateField = makeFieldContainer(title: "DATE TO REGULARIZE *", picker: datePicker, mode: .date)
        datePicker.date = Date()
        contentView.addSubview(dateField)

        // Time Stack (Check In & Check Out)
        let timeStack = UIStackView()
        timeStack.axis = .horizontal
        timeStack.spacing = 12
        timeStack.distribution = .fillEqually
        timeStack.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(timeStack)

        let inField = makeFieldContainer(title: "CHECK-IN TIME", picker: checkInPicker, mode: .time)
        let cal = Calendar.current
        var comps = cal.dateComponents([.year, .month, .day], from: Date())
        comps.hour = 9
        comps.minute = 0
        checkInPicker.date = cal.date(from: comps) ?? Date()
        timeStack.addArrangedSubview(inField)

        let outField = makeFieldContainer(title: "CHECK-OUT TIME", picker: checkOutPicker, mode: .time)
        comps.hour = 18
        comps.minute = 0
        checkOutPicker.date = cal.date(from: comps) ?? Date()
        timeStack.addArrangedSubview(outField)

        // Reason Field
        let reasonLabel = UILabel()
        reasonLabel.text = "REASON / NOTE *"
        reasonLabel.font = .systemFont(ofSize: 11, weight: .bold)
        reasonLabel.textColor = UIColor(red: 71/255, green: 85/255, blue: 105/255, alpha: 1.0)
        reasonLabel.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(reasonLabel)

        reasonTextView.layer.cornerRadius = 10
        reasonTextView.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        reasonTextView.layer.borderWidth = 1
        reasonTextView.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
        reasonTextView.font = .systemFont(ofSize: 14)
        reasonTextView.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        reasonTextView.textContainerInset = UIEdgeInsets(top: 10, left: 10, bottom: 10, right: 10)
        reasonTextView.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(reasonTextView)

        // Submit Button
        submitButton.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        submitButton.layer.cornerRadius = 14
        submitButton.setTitle("Submit Correction", for: .normal)
        submitButton.setTitleColor(.white, for: .normal)
        submitButton.titleLabel?.font = .systemFont(ofSize: 15, weight: .bold)
        submitButton.translatesAutoresizingMaskIntoConstraints = false
        submitButton.addTarget(self, action: #selector(didTapSubmit), for: .touchUpInside)
        contentView.addSubview(submitButton)

        spinner.color = .white
        spinner.hidesWhenStopped = true
        spinner.translatesAutoresizingMaskIntoConstraints = false
        submitButton.addSubview(spinner)

        NSLayoutConstraint.activate([
            titleLabel.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 18),
            titleLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            titleLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20),

            subtitleLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 4),
            subtitleLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            subtitleLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20),

            errorLabel.topAnchor.constraint(equalTo: subtitleLabel.bottomAnchor, constant: 8),
            errorLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            errorLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20),

            dateField.topAnchor.constraint(equalTo: subtitleLabel.bottomAnchor, constant: 18),
            dateField.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            dateField.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20),

            timeStack.topAnchor.constraint(equalTo: dateField.bottomAnchor, constant: 16),
            timeStack.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            timeStack.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20),

            reasonLabel.topAnchor.constraint(equalTo: timeStack.bottomAnchor, constant: 16),
            reasonLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),

            reasonTextView.topAnchor.constraint(equalTo: reasonLabel.bottomAnchor, constant: 6),
            reasonTextView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            reasonTextView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20),
            reasonTextView.heightAnchor.constraint(equalToConstant: 100),

            submitButton.topAnchor.constraint(equalTo: reasonTextView.bottomAnchor, constant: 22),
            submitButton.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            submitButton.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20),
            submitButton.heightAnchor.constraint(equalToConstant: 48),
            submitButton.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -20),

            spinner.centerXAnchor.constraint(equalTo: submitButton.centerXAnchor),
            spinner.centerYAnchor.constraint(equalTo: submitButton.centerYAnchor)
        ])
    }

    private func makeFieldContainer(title: String, picker: UIDatePicker, mode: UIDatePicker.Mode) -> UIView {
        let container = UIView()
        container.translatesAutoresizingMaskIntoConstraints = false

        let label = UILabel()
        label.text = title
        label.font = .systemFont(ofSize: 11, weight: .bold)
        label.textColor = UIColor(red: 71/255, green: 85/255, blue: 105/255, alpha: 1.0)
        label.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(label)

        picker.datePickerMode = mode
        if #available(iOS 14.0, *) {
            picker.preferredDatePickerStyle = .compact
        }
        picker.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(picker)

        NSLayoutConstraint.activate([
            label.topAnchor.constraint(equalTo: container.topAnchor),
            label.leadingAnchor.constraint(equalTo: container.leadingAnchor),

            picker.topAnchor.constraint(equalTo: label.bottomAnchor, constant: 6),
            picker.leadingAnchor.constraint(equalTo: container.leadingAnchor),
            picker.bottomAnchor.constraint(equalTo: container.bottomAnchor)
        ])

        return container
    }

    @objc private func didTapSubmit() {
        let reason = reasonTextView.text.trimmingCharacters(in: .whitespacesAndNewlines)
        if reason.isEmpty {
            errorLabel.text = "Please provide a reason for the attendance correction."
            errorLabel.isHidden = false
            return
        }

        errorLabel.isHidden = true
        submitButton.isEnabled = false
        submitButton.setTitle("", for: .normal)
        spinner.startAnimating()

        let df = DateFormatter()
        df.dateFormat = "yyyy-MM-dd"
        let dateStr = df.string(from: datePicker.date)

        let tf = DateFormatter()
        tf.dateFormat = "HH:mm"
        let inTimeStr = tf.string(from: checkInPicker.date)
        let outTimeStr = tf.string(from: checkOutPicker.date)

        let checkInIso = "\(dateStr)T\(inTimeStr):00"
        let checkOutIso = "\(dateStr)T\(outTimeStr):00"

        AuthService.shared.requestAttendanceCorrection(
            date: dateStr,
            requestedCheckIn: checkInIso,
            requestedCheckOut: checkOutIso,
            reason: reason
        ) { [weak self] result in
            DispatchQueue.main.async {
                guard let self = self else { return }
                self.spinner.stopAnimating()
                self.submitButton.isEnabled = true
                self.submitButton.setTitle("Submit Correction", for: .normal)

                switch result {
                case .success:
                    let alert = UIAlertController(title: "Submitted", message: "Regularization request submitted successfully!", preferredStyle: .alert)
                    alert.addAction(UIAlertAction(title: "OK", style: .default, handler: { _ in
                        self.dismiss(animated: true) {
                            self.onSuccess?()
                        }
                    }))
                    self.present(alert, animated: true)
                case .failure(let err):
                    var msg = "Failed to submit regularization request."
                    if case .serverError(let message, _) = err {
                        msg = message
                    }
                    self.errorLabel.text = msg
                    self.errorLabel.isHidden = false
                }
            }
        }
    }
}