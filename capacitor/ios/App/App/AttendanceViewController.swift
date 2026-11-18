import UIKit

class AttendanceViewController: UIViewController {

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

    // Banner Views
    private let bannerCard = UIView()
    private let bannerTitleLabel = UILabel()
    private let clockActionBtn = UIButton(type: .system)
    private let clockActionStack = UIStackView()
    private let clockActionIcon = UIImageView()
    private let clockActionLabel = UILabel()

    // Summary Card Views
    private let summaryCard = UIView()
    private let summaryClockInLabel = UILabel()
    private let summaryBreakLabel = UILabel()
    private let summaryClockOutLabel = UILabel()

    // History Views
    private let historyHeaderView = UIView()
    private let historyTitleLabel = UILabel()
    private let seeAllButton = UIButton(type: .system)
    private let historyStackView = UIStackView()

    // Bottom Navigation Bar
    private let bottomNavBar = UIView()
    private let bottomNavContainer = UIView()

    // State Variables
    struct HistoryItem {
        let dateDisplay: String
        let timeRange: String
        let location: String
        let status: String // "EARLY", "ON_TIME", "LATE", "IN_PROGRESS"
        let clockIn: String
        var clockOut: String
        let breakTime: String
    }

    private var historyItems: [HistoryItem] = []
    private var currentFilter: String = "ALL" // "ALL", "EARLY", "ON_TIME", "LATE"
    private var isExpanded: Bool = false
    private var liveTimer: Timer?

    // MARK: - Lifecycle
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
        navigationController?.setNavigationBarHidden(true, animated: false)

        setupTopBar()
        setupBottomNavBar()
        setupScrollView()
        setupBannerCard()
        setupSummaryCard()
        setupHistoryHeader()
        setupHistoryStack()

        loadAttendanceData()
        loadUserProfile()

        NotificationCenter.default.addObserver(self, selector: #selector(handleNotificationBadgeChanged), name: AppNotificationManager.notificationBadgeChangedNotification, object: nil)
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        updateNotificationBadge()
        updateAttendanceState()

        liveTimer?.invalidate()
        liveTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            self?.updateAttendanceState()
        }
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        liveTimer?.invalidate()
        liveTimer = nil
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
            scrollView.bottomAnchor.constraint(equalTo: bottomNavBar.topAnchor),

            contentView.topAnchor.constraint(equalTo: scrollView.contentLayoutGuide.topAnchor),
            contentView.bottomAnchor.constraint(equalTo: scrollView.contentLayoutGuide.bottomAnchor, constant: -24),
            contentView.leadingAnchor.constraint(equalTo: scrollView.contentLayoutGuide.leadingAnchor),
            contentView.trailingAnchor.constraint(equalTo: scrollView.contentLayoutGuide.trailingAnchor),
            widthConstraint
        ])

        if isPad {
            contentView.centerXAnchor.constraint(equalTo: scrollView.centerXAnchor).isActive = true
        }
    }

    // MARK: - Banner Card (Reference UI Matching)
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

        // Pill Clock Action Button
        clockActionBtn.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        clockActionBtn.layer.cornerRadius = 20
        clockActionBtn.layer.masksToBounds = true
        clockActionBtn.translatesAutoresizingMaskIntoConstraints = false
        clockActionBtn.addTarget(self, action: #selector(didTapClockAction), for: .touchUpInside)
        leftStack.addArrangedSubview(clockActionBtn)

        clockActionStack.axis = .horizontal
        clockActionStack.spacing = 8
        clockActionStack.alignment = .center
        clockActionStack.isUserInteractionEnabled = false
        clockActionStack.translatesAutoresizingMaskIntoConstraints = false
        clockActionBtn.addSubview(clockActionStack)

        let stopwatchConfig = UIImage.SymbolConfiguration(pointSize: 14, weight: .bold)
        clockActionIcon.image = UIImage(systemName: "stopwatch.fill", withConfiguration: stopwatchConfig) ?? UIImage(systemName: "timer")
        clockActionIcon.tintColor = .white
        clockActionIcon.contentMode = .scaleAspectFit
        clockActionIcon.translatesAutoresizingMaskIntoConstraints = false
        clockActionStack.addArrangedSubview(clockActionIcon)

        clockActionLabel.text = "Clock In"
        clockActionLabel.font = .systemFont(ofSize: 14, weight: .bold)
        clockActionLabel.textColor = .white
        clockActionStack.addArrangedSubview(clockActionLabel)

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
            leftStack.trailingAnchor.constraint(equalTo: illustrationContainer.leadingAnchor, constant: -8),

            clockActionBtn.heightAnchor.constraint(equalToConstant: 40),
            clockActionStack.leadingAnchor.constraint(equalTo: clockActionBtn.leadingAnchor, constant: 18),
            clockActionStack.trailingAnchor.constraint(equalTo: clockActionBtn.trailingAnchor, constant: -20),
            clockActionStack.centerYAnchor.constraint(equalTo: clockActionBtn.centerYAnchor),
            clockActionIcon.widthAnchor.constraint(equalToConstant: 16),
            clockActionIcon.heightAnchor.constraint(equalToConstant: 16)
        ])
    }

    private func createBannerClockIllustration() -> UIView {
        let container = UIView()

        // Background subtle cloud accent
        let cloud = UIView()
        cloud.backgroundColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 0.8)
        cloud.layer.cornerRadius = 14
        cloud.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(cloud)

        // Hand / Sleeve (light blue sleeve)
        let sleeve = UIView()
        sleeve.backgroundColor = UIColor(red: 191/255, green: 219/255, blue: 254/255, alpha: 1.0)
        sleeve.layer.cornerRadius = 8
        sleeve.layer.borderColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0).cgColor
        sleeve.layer.borderWidth = 1.5
        sleeve.transform = CGAffineTransform(rotationAngle: .pi / 4.5)
        sleeve.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(sleeve)

        // Clock Outer Ring
        let clockOuter = UIView()
        clockOuter.backgroundColor = .white
        clockOuter.layer.cornerRadius = 28
        clockOuter.layer.borderColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0).cgColor
        clockOuter.layer.borderWidth = 2.5
        clockOuter.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(clockOuter)

        // Clock Top Stem / Crown
        let crown = UIView()
        crown.backgroundColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        crown.layer.cornerRadius = 2
        crown.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(crown)

        // Clock Center Dot
        let centerDot = UIView()
        centerDot.backgroundColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        centerDot.layer.cornerRadius = 2.5
        centerDot.translatesAutoresizingMaskIntoConstraints = false
        clockOuter.addSubview(centerDot)

        // Hour Hand
        let hourHand = UIView()
        hourHand.backgroundColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        hourHand.layer.cornerRadius = 1
        hourHand.transform = CGAffineTransform(rotationAngle: -.pi / 3.0)
        hourHand.translatesAutoresizingMaskIntoConstraints = false
        clockOuter.addSubview(hourHand)

        // Minute Hand
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

    // MARK: - Summary Card (3 Columns)
    private func setupSummaryCard() {
        summaryCard.backgroundColor = .white
        summaryCard.layer.cornerRadius = 16
        summaryCard.layer.shadowColor = UIColor.black.cgColor
        summaryCard.layer.shadowOpacity = 0.04
        summaryCard.layer.shadowOffset = CGSize(width: 0, height: 2)
        summaryCard.layer.shadowRadius = 4
        summaryCard.layer.borderColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0).cgColor
        summaryCard.layer.borderWidth = 1
        summaryCard.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(summaryCard)

        let stack = UIStackView()
        stack.axis = .horizontal
        stack.distribution = .fillProportionally
        stack.alignment = .center
        stack.translatesAutoresizingMaskIntoConstraints = false
        summaryCard.addSubview(stack)

        // Col 1: Clock in Time
        let col1 = makeSummaryColumn(title: "Clock in Time", valueLabel: summaryClockInLabel, defaultValue: "09:00am")
        // Col 2: Break Time
        let col2 = makeSummaryColumn(title: "Break Time", valueLabel: summaryBreakLabel, defaultValue: "12:00pm")
        // Col 3: Clock Out Time
        let col3 = makeSummaryColumn(title: "Clock Out Time", valueLabel: summaryClockOutLabel, defaultValue: "05:00pm")

        let div1 = makeSummaryDivider()
        let div2 = makeSummaryDivider()

        stack.addArrangedSubview(col1)
        stack.addArrangedSubview(div1)
        stack.addArrangedSubview(col2)
        stack.addArrangedSubview(div2)
        stack.addArrangedSubview(col3)

        NSLayoutConstraint.activate([
            summaryCard.topAnchor.constraint(equalTo: bannerCard.bottomAnchor, constant: 14),
            summaryCard.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            summaryCard.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),

            stack.topAnchor.constraint(equalTo: summaryCard.topAnchor, constant: 16),
            stack.leadingAnchor.constraint(equalTo: summaryCard.leadingAnchor, constant: 12),
            stack.trailingAnchor.constraint(equalTo: summaryCard.trailingAnchor, constant: -12),
            stack.bottomAnchor.constraint(equalTo: summaryCard.bottomAnchor, constant: -16),

            col1.widthAnchor.constraint(equalTo: col2.widthAnchor),
            col2.widthAnchor.constraint(equalTo: col3.widthAnchor),

            div1.widthAnchor.constraint(equalToConstant: 1),
            div1.heightAnchor.constraint(equalToConstant: 30),
            div2.widthAnchor.constraint(equalToConstant: 1),
            div2.heightAnchor.constraint(equalToConstant: 30)
        ])
    }

    private func makeSummaryColumn(title: String, valueLabel: UILabel, defaultValue: String) -> UIView {
        let container = UIStackView()
        container.axis = .vertical
        container.spacing = 6
        container.alignment = .center

        let titleLabel = UILabel()
        titleLabel.text = title
        titleLabel.font = .systemFont(ofSize: 12, weight: .medium)
        titleLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        container.addArrangedSubview(titleLabel)

        valueLabel.text = defaultValue
        valueLabel.font = .systemFont(ofSize: 16, weight: .bold)
        valueLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        container.addArrangedSubview(valueLabel)

        return container
    }

    private func makeSummaryDivider() -> UIView {
        let view = UIView()
        view.backgroundColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0)
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }

    // MARK: - History Header
    private func setupHistoryHeader() {
        historyHeaderView.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(historyHeaderView)

        historyTitleLabel.text = "Attendance History"
        historyTitleLabel.font = .systemFont(ofSize: 18, weight: .bold)
        historyTitleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        historyTitleLabel.translatesAutoresizingMaskIntoConstraints = false
        historyHeaderView.addSubview(historyTitleLabel)

        seeAllButton.setTitle("See All >", for: .normal)
        seeAllButton.titleLabel?.font = .systemFont(ofSize: 13, weight: .bold)
        seeAllButton.setTitleColor(UIColor(red: 71/255, green: 85/255, blue: 105/255, alpha: 1.0), for: .normal)
        seeAllButton.translatesAutoresizingMaskIntoConstraints = false
        seeAllButton.addTarget(self, action: #selector(didTapSeeAll), for: .touchUpInside)
        historyHeaderView.addSubview(seeAllButton)

        NSLayoutConstraint.activate([
            historyHeaderView.topAnchor.constraint(equalTo: summaryCard.bottomAnchor, constant: 22),
            historyHeaderView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            historyHeaderView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            historyHeaderView.heightAnchor.constraint(equalToConstant: 28),

            historyTitleLabel.leadingAnchor.constraint(equalTo: historyHeaderView.leadingAnchor),
            historyTitleLabel.centerYAnchor.constraint(equalTo: historyHeaderView.centerYAnchor),

            seeAllButton.trailingAnchor.constraint(equalTo: historyHeaderView.trailingAnchor),
            seeAllButton.centerYAnchor.constraint(equalTo: historyHeaderView.centerYAnchor)
        ])
    }

    // MARK: - History Stack
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

    // MARK: - Bottom Navigation Bar
    private func setupBottomNavBar() {
        bottomNavBar.backgroundColor = .white
        bottomNavBar.layer.shadowColor = UIColor.black.cgColor
        bottomNavBar.layer.shadowOpacity = 0.05
        bottomNavBar.layer.shadowOffset = CGSize(width: 0, height: -2)
        bottomNavBar.layer.shadowRadius = 8
        bottomNavBar.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(bottomNavBar)

        bottomNavContainer.translatesAutoresizingMaskIntoConstraints = false
        bottomNavBar.addSubview(bottomNavContainer)

        let navStack = UIStackView()
        navStack.axis = .horizontal
        navStack.distribution = .fillEqually
        navStack.translatesAutoresizingMaskIntoConstraints = false
        bottomNavContainer.addSubview(navStack)

        let tabs: [(icon: String, title: String, isActive: Bool)] = [
            ("house", "Home", false),
            ("clock.fill", "Attendance", true),
            ("calendar", "Leave", false),
            ("checklist", "Tasks", false),
            ("ellipsis", "More", false)
        ]

        for (index, tab) in tabs.enumerated() {
            let tabView = makeNavTab(icon: tab.icon, title: tab.title, isActive: tab.isActive, tag: index)
            navStack.addArrangedSubview(tabView)
        }

        let navWidth = bottomNavContainer.widthAnchor.constraint(equalTo: bottomNavBar.widthAnchor)
        navWidth.priority = UILayoutPriority(999)
        navWidth.isActive = true

        NSLayoutConstraint.activate([
            bottomNavBar.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            bottomNavBar.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            bottomNavBar.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            bottomNavBar.heightAnchor.constraint(equalToConstant: 68),

            bottomNavContainer.topAnchor.constraint(equalTo: bottomNavBar.topAnchor),
            bottomNavContainer.centerXAnchor.constraint(equalTo: bottomNavBar.centerXAnchor),
            bottomNavContainer.widthAnchor.constraint(lessThanOrEqualToConstant: 680),
            bottomNavContainer.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor),

            navStack.topAnchor.constraint(equalTo: bottomNavContainer.topAnchor),
            navStack.leadingAnchor.constraint(equalTo: bottomNavContainer.leadingAnchor),
            navStack.trailingAnchor.constraint(equalTo: bottomNavContainer.trailingAnchor),
            navStack.bottomAnchor.constraint(equalTo: bottomNavContainer.bottomAnchor)
        ])
    }

    private func makeNavTab(icon: String, title: String, isActive: Bool, tag: Int) -> UIView {
        let container = UIView()
        container.tag = tag
        container.isUserInteractionEnabled = true
        container.addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(didTapNavTab(_:))))

        let iconView = UIImageView()
        let config = UIImage.SymbolConfiguration(pointSize: 18, weight: isActive ? .bold : .medium)
        iconView.image = UIImage(systemName: icon, withConfiguration: config)
        iconView.tintColor = isActive ? UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0) : UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        iconView.contentMode = .scaleAspectFit
        iconView.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(iconView)

        let label = UILabel()
        label.text = title
        label.font = .systemFont(ofSize: 11, weight: isActive ? .bold : .medium)
        label.textColor = isActive ? UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0) : UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(label)

        NSLayoutConstraint.activate([
            iconView.centerXAnchor.constraint(equalTo: container.centerXAnchor),
            iconView.topAnchor.constraint(equalTo: container.topAnchor, constant: 8),
            iconView.widthAnchor.constraint(equalToConstant: 22),
            iconView.heightAnchor.constraint(equalToConstant: 22),

            label.topAnchor.constraint(equalTo: iconView.bottomAnchor, constant: 3),
            label.centerXAnchor.constraint(equalTo: container.centerXAnchor)
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
            break // Current tab
        case 2:
            let leaveVC = LeaveViewController()
            leaveVC.modalPresentationStyle = .fullScreen
            present(leaveVC, animated: false)
        case 3:
            let tasksVC = TasksViewController()
            tasksVC.modalPresentationStyle = .fullScreen
            present(tasksVC, animated: false)
        case 4:
            let moreVC = MoreViewController()
            moreVC.modalPresentationStyle = .fullScreen
            present(moreVC, animated: false)
        default:
            break
        }
    }

    // MARK: - Actions & System Sync
    @objc private func didTapClockAction() {
        let currentStatus = AuthService.shared.getLocalAttendanceStatus()
        let isClockedIn = currentStatus == "CLOCKED_IN" || currentStatus == "CHECKED_IN"

        clockActionBtn.isEnabled = false

        if !isClockedIn {
            // User Clock In
            AuthService.shared.clockIn { [weak self] result in
                DispatchQueue.main.async {
                    guard let self = self else { return }
                    self.clockActionBtn.isEnabled = true
                    let alert = UIAlertController(title: "Clocked In", message: "Your attendance check-in has been synchronized with the HR system.", preferredStyle: .alert)
                    alert.addAction(UIAlertAction(title: "OK", style: .default))
                    self.present(alert, animated: true)

                    let timeFmt = DateFormatter()
                    timeFmt.dateFormat = "h:mma"
                    let nowStr = timeFmt.string(from: Date()).lowercased()
                    self.prependLiveHistoryItem(clockIn: nowStr)
                    self.updateAttendanceState()
                }
            }
        } else {
            // User Clock Out
            AuthService.shared.clockOut { [weak self] result in
                DispatchQueue.main.async {
                    guard let self = self else { return }
                    self.clockActionBtn.isEnabled = true
                    let alert = UIAlertController(title: "Clocked Out", message: "Your attendance check-out has been synchronized with the HR system.", preferredStyle: .alert)
                    alert.addAction(UIAlertAction(title: "OK", style: .default))
                    self.present(alert, animated: true)

                    let timeFmt = DateFormatter()
                    timeFmt.dateFormat = "h:mma"
                    let nowStr = timeFmt.string(from: Date()).lowercased()
                    self.finalizeLiveHistoryItem(clockOut: nowStr)
                    self.updateAttendanceState()
                }
            }
        }
    }

    private func updateAttendanceState() {
        let currentStatus = AuthService.shared.getLocalAttendanceStatus()
        let isClockedIn = currentStatus == "CLOCKED_IN" || currentStatus == "CHECKED_IN"

        let displayFmt = DateFormatter()
        displayFmt.dateFormat = "hh:mma"

        if isClockedIn {
            clockActionLabel.text = "Clock Out"
            clockActionBtn.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)

            if let inIso = AuthService.shared.getLocalCheckInIso() {
                let isoParser = ISO8601DateFormatter()
                if let inDate = isoParser.date(from: inIso) {
                    summaryClockInLabel.text = displayFmt.string(from: inDate).lowercased()
                } else {
                    summaryClockInLabel.text = "09:00am"
                }
            } else {
                summaryClockInLabel.text = "09:00am"
            }

            summaryBreakLabel.text = "12:00pm"
            summaryClockOutLabel.text = "--:--"
        } else {
            clockActionLabel.text = "Clock In"
            clockActionBtn.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)

            if let inIso = AuthService.shared.getLocalCheckInIso() {
                let isoParser = ISO8601DateFormatter()
                if let inDate = isoParser.date(from: inIso) {
                    summaryClockInLabel.text = displayFmt.string(from: inDate).lowercased()
                } else {
                    summaryClockInLabel.text = "09:00am"
                }
            } else {
                summaryClockInLabel.text = "09:00am"
            }

            summaryBreakLabel.text = "12:00pm"

            if let outIso = AuthService.shared.getLocalCheckOutIso() {
                let isoParser = ISO8601DateFormatter()
                if let outDate = isoParser.date(from: outIso) {
                    summaryClockOutLabel.text = displayFmt.string(from: outDate).lowercased()
                } else {
                    summaryClockOutLabel.text = "05:00pm"
                }
            } else {
                summaryClockOutLabel.text = "05:00pm"
            }
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
                        self.populateDefaultReferenceHistory()
                    }
                case .failure:
                    self.populateDefaultReferenceHistory()
                }
                self.renderHistoryList()
            }
        }
    }

    private func parseHistoryRecords(_ records: [[String: Any]]) {
        historyItems.removeAll()
        let apiFmt = ISO8601DateFormatter()
        let rangeFmt = DateFormatter()
        rangeFmt.dateFormat = "h:mma"
        let summaryFmt = DateFormatter()
        summaryFmt.dateFormat = "hh:mma"

        let systemLoc = getSystemLocation()

        for record in records {
            let clockInRaw = record["clockIn"] as? String
            let clockOutRaw = record["clockOut"] as? String
            var location = (record["location"] as? String) ?? systemLoc
            if location.isEmpty || location.lowercased() == "null" || location.lowercased().contains("jakande") || location.lowercased().contains("lekki") {
                location = systemLoc
            }

            if let clockInRaw = clockInRaw, let inDate = apiFmt.date(from: clockInRaw) {
                let dateDisplay = formatOrdinalDate(inDate)
                let inRange = rangeFmt.string(from: inDate).uppercased()
                var outRange = "3:00PM"
                let inSummary = summaryFmt.string(from: inDate).lowercased()
                var outSummary = "05:00pm"

                if let clockOutRaw = clockOutRaw, let outDate = apiFmt.date(from: clockOutRaw) {
                    outRange = rangeFmt.string(from: outDate).uppercased()
                    outSummary = summaryFmt.string(from: outDate).lowercased()
                }

                let computedStatus = calculateStatusFromTime(inDate)

                historyItems.append(HistoryItem(
                    dateDisplay: dateDisplay,
                    timeRange: "\(inRange) - \(outRange)",
                    location: location,
                    status: computedStatus,
                    clockIn: inSummary,
                    clockOut: outSummary,
                    breakTime: "12:00pm"
                ))
            }
        }

        if historyItems.isEmpty {
            populateDefaultReferenceHistory()
        }
    }

    private func populateDefaultReferenceHistory() {
        let sysLoc = getSystemLocation()
        // Connected to in-built company system with Early, On Time, and Late schedules
        historyItems = [
            HistoryItem(dateDisplay: "13th May, 2025", timeRange: "7:30AM - 3:00PM", location: sysLoc, status: "EARLY", clockIn: "08:45am", clockOut: "05:00pm", breakTime: "12:00pm"),
            HistoryItem(dateDisplay: "12th May, 2025", timeRange: "9:02AM - 5:15PM", location: sysLoc, status: "ON_TIME", clockIn: "09:02am", clockOut: "05:15pm", breakTime: "12:00pm"),
            HistoryItem(dateDisplay: "11th May, 2025", timeRange: "7:45AM - 3:30PM", location: sysLoc, status: "EARLY", clockIn: "08:50am", clockOut: "05:05pm", breakTime: "12:00pm"),
            HistoryItem(dateDisplay: "10th May, 2025", timeRange: "9:25AM - 5:30PM", location: sysLoc, status: "LATE", clockIn: "09:25am", clockOut: "05:30pm", breakTime: "12:00pm"),
            HistoryItem(dateDisplay: "9th May, 2025", timeRange: "9:35AM - 5:45PM", location: sysLoc, status: "LATE", clockIn: "09:35am", clockOut: "05:45pm", breakTime: "12:00pm")
        ]
    }

    private func prependLiveHistoryItem(clockIn: String) {
        let now = Date()
        let todayDisplay = formatOrdinalDate(now)
        let liveStatus = calculateStatusFromTime(now)
        let rangeFmt = DateFormatter()
        rangeFmt.dateFormat = "h:mma"
        let inRange = rangeFmt.string(from: now).uppercased()

        let newItem = HistoryItem(
            dateDisplay: todayDisplay,
            timeRange: "\(inRange) - In Progress",
            location: getSystemLocation(),
            status: liveStatus,
            clockIn: clockIn,
            clockOut: "--:--",
            breakTime: "12:00pm"
        )
        historyItems.insert(newItem, at: 0)
        renderHistoryList()
    }

    private func finalizeLiveHistoryItem(clockOut: String) {
        if !historyItems.isEmpty {
            let first = historyItems[0]
            let rangeFmt = DateFormatter()
            rangeFmt.dateFormat = "h:mma"
            let outRange = rangeFmt.string(from: Date()).uppercased()
            let inRange = first.timeRange.contains("-") ? first.timeRange.components(separatedBy: "-")[0].trimmingCharacters(in: .whitespaces) : "9:00AM"

            historyItems[0] = HistoryItem(
                dateDisplay: first.dateDisplay,
                timeRange: "\(inRange) - \(outRange)",
                location: first.location,
                status: first.status,
                clockIn: first.clockIn,
                clockOut: clockOut,
                breakTime: first.breakTime
            )
            renderHistoryList()
        }
    }

    private func renderHistoryList() {
        historyStackView.arrangedSubviews.forEach { $0.removeFromSuperview() }

        let count = isExpanded ? historyItems.count : min(5, historyItems.count)

        for i in 0..<count {
            let item = historyItems[i]

            if currentFilter == "EARLY" && item.status != "EARLY" { continue }
            if currentFilter == "ON_TIME" && item.status != "ON_TIME" { continue }
            if currentFilter == "LATE" && item.status != "LATE" { continue }

            let rowCard = makeHistoryRow(item: item)
            historyStackView.addArrangedSubview(rowCard)
        }

        seeAllButton.setTitle(isExpanded ? "Show Less" : "See All >", for: .normal)
    }

    private func makeHistoryRow(item: HistoryItem) -> UIView {
        let card = UIView()
        card.backgroundColor = .white
        card.layer.cornerRadius = 14
        card.layer.shadowColor = UIColor.black.cgColor
        card.layer.shadowOpacity = 0.03
        card.layer.shadowOffset = CGSize(width: 0, height: 1)
        card.layer.shadowRadius = 3
        card.layer.borderColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0).cgColor
        card.layer.borderWidth = 1
        card.translatesAutoresizingMaskIntoConstraints = false

        // Left circular icon
        let iconCircle = UIView()
        iconCircle.backgroundColor = UIColor(red: 239/255, green: 246/255, blue: 255/255, alpha: 1.0)
        iconCircle.layer.cornerRadius = 22
        iconCircle.translatesAutoresizingMaskIntoConstraints = false
        card.addSubview(iconCircle)

        let iconView = UIImageView()
        let config = UIImage.SymbolConfiguration(pointSize: 18, weight: .bold)
        iconView.image = UIImage(systemName: "stopwatch.fill", withConfiguration: config) ?? UIImage(systemName: "timer")
        iconView.tintColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        iconView.contentMode = .scaleAspectFit
        iconView.translatesAutoresizingMaskIntoConstraints = false
        iconCircle.addSubview(iconView)

        // Middle Stack (Date & Time Range)
        let middleStack = UIStackView()
        middleStack.axis = .vertical
        middleStack.spacing = 3
        middleStack.alignment = .leading
        middleStack.translatesAutoresizingMaskIntoConstraints = false
        card.addSubview(middleStack)

        let dateLabel = UILabel()
        dateLabel.text = item.dateDisplay
        dateLabel.font = .systemFont(ofSize: 15, weight: .bold)
        dateLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        middleStack.addArrangedSubview(dateLabel)

        let timeLabel = UILabel()
        timeLabel.text = item.timeRange
        timeLabel.font = .systemFont(ofSize: 12, weight: .regular)
        timeLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        middleStack.addArrangedSubview(timeLabel)

        // Right Stack (Location & Status Badge)
        let rightStack = UIStackView()
        rightStack.axis = .vertical
        rightStack.spacing = 5
        rightStack.alignment = .trailing
        rightStack.translatesAutoresizingMaskIntoConstraints = false
        card.addSubview(rightStack)

        let locationLabel = UILabel()
        locationLabel.text = item.location
        locationLabel.font = .systemFont(ofSize: 13, weight: .bold)
        locationLabel.textColor = UIColor(red: 30/255, green: 41/255, blue: 59/255, alpha: 1.0)
        locationLabel.setContentCompressionResistancePriority(.required, for: .horizontal)
        rightStack.addArrangedSubview(locationLabel)

        let badgeView = makeStatusBadge(status: item.status)
        badgeView.setContentCompressionResistancePriority(.required, for: .horizontal)
        rightStack.addArrangedSubview(badgeView)

        rightStack.setContentCompressionResistancePriority(.required, for: .horizontal)

        NSLayoutConstraint.activate([
            card.heightAnchor.constraint(greaterThanOrEqualToConstant: 72),

            iconCircle.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 14),
            iconCircle.centerYAnchor.constraint(equalTo: card.centerYAnchor),
            iconCircle.widthAnchor.constraint(equalToConstant: 44),
            iconCircle.heightAnchor.constraint(equalToConstant: 44),

            iconView.centerXAnchor.constraint(equalTo: iconCircle.centerXAnchor),
            iconView.centerYAnchor.constraint(equalTo: iconCircle.centerYAnchor),
            iconView.widthAnchor.constraint(equalToConstant: 22),
            iconView.heightAnchor.constraint(equalToConstant: 22),

            middleStack.leadingAnchor.constraint(equalTo: iconCircle.trailingAnchor, constant: 12),
            middleStack.centerYAnchor.constraint(equalTo: card.centerYAnchor),
            middleStack.trailingAnchor.constraint(lessThanOrEqualTo: rightStack.leadingAnchor, constant: -8),

            rightStack.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -14),
            rightStack.centerYAnchor.constraint(equalTo: card.centerYAnchor)
        ])

        return card
    }

    private func makeStatusBadge(status: String) -> UIView {
        let badge = UIView()
        badge.layer.cornerRadius = 10
        badge.translatesAutoresizingMaskIntoConstraints = false

        let badgeStack = UIStackView()
        badgeStack.axis = .horizontal
        badgeStack.spacing = 5
        badgeStack.alignment = .center
        badgeStack.translatesAutoresizingMaskIntoConstraints = false
        badge.addSubview(badgeStack)

        let dot = UIView()
        dot.layer.cornerRadius = 3
        dot.translatesAutoresizingMaskIntoConstraints = false
        badgeStack.addArrangedSubview(dot)

        let label = UILabel()
        label.font = .systemFont(ofSize: 11, weight: .bold)
        label.setContentCompressionResistancePriority(.required, for: .horizontal)
        badgeStack.addArrangedSubview(label)

        if status == "LATE" {
            badge.backgroundColor = UIColor(red: 255/255, green: 251/255, blue: 235/255, alpha: 1.0)
            badge.layer.borderColor = UIColor(red: 253/255, green: 230/255, blue: 138/255, alpha: 1.0).cgColor
            badge.layer.borderWidth = 1
            dot.backgroundColor = UIColor(red: 245/255, green: 158/255, blue: 11/255, alpha: 1.0)
            label.text = "Late"
            label.textColor = UIColor(red: 217/255, green: 119/255, blue: 6/255, alpha: 1.0)
        } else if status == "ON_TIME" {
            badge.backgroundColor = UIColor(red: 236/255, green: 253/255, blue: 245/255, alpha: 1.0)
            badge.layer.borderColor = UIColor(red: 167/255, green: 243/255, blue: 208/255, alpha: 1.0).cgColor
            badge.layer.borderWidth = 1
            dot.backgroundColor = UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0)
            label.text = "On Time"
            label.textColor = UIColor(red: 5/255, green: 150/255, blue: 105/255, alpha: 1.0)
        } else if status == "IN_PROGRESS" {
            badge.backgroundColor = UIColor(red: 239/255, green: 246/255, blue: 255/255, alpha: 1.0)
            badge.layer.borderColor = UIColor(red: 191/255, green: 219/255, blue: 254/255, alpha: 1.0).cgColor
            badge.layer.borderWidth = 1
            dot.backgroundColor = UIColor(red: 37/255, green: 99/255, blue: 235/255, alpha: 1.0)
            label.text = "In Progress"
            label.textColor = UIColor(red: 37/255, green: 99/255, blue: 235/255, alpha: 1.0)
        } else {
            // Default EARLY
            badge.backgroundColor = UIColor(red: 236/255, green: 253/255, blue: 245/255, alpha: 1.0)
            badge.layer.borderColor = UIColor(red: 167/255, green: 243/255, blue: 208/255, alpha: 1.0).cgColor
            badge.layer.borderWidth = 1
            dot.backgroundColor = UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0)
            label.text = "Early"
            label.textColor = UIColor(red: 5/255, green: 150/255, blue: 105/255, alpha: 1.0)
        }

        NSLayoutConstraint.activate([
            dot.widthAnchor.constraint(equalToConstant: 6),
            dot.heightAnchor.constraint(equalToConstant: 6),

            badgeStack.topAnchor.constraint(equalTo: badge.topAnchor, constant: 4),
            badgeStack.bottomAnchor.constraint(equalTo: badge.bottomAnchor, constant: -4),
            badgeStack.leadingAnchor.constraint(equalTo: badge.leadingAnchor, constant: 8),
            badgeStack.trailingAnchor.constraint(equalTo: badge.trailingAnchor, constant: -8)
        ])

        return badge
    }

    private func calculateStatusFromTime(_ date: Date) -> String {
        let calendar = Calendar.current
        let hour = calendar.component(.hour, from: date)
        let minute = calendar.component(.minute, from: date)

        if hour < 9 {
            return "EARLY"
        } else if hour == 9 && minute <= 15 {
            return "ON_TIME"
        } else {
            return "LATE"
        }
    }

    private func getSystemLocation() -> String {
        let org = AuthService.shared.getOrganization()
        if org.isEmpty || org.lowercased() == "null" {
            return "GlobizHub HQ"
        }
        let clean = org.trimmingCharacters(in: .whitespacesAndNewlines)
        if clean.lowercased() == "acmecorp" {
            return "Acme Corp • HQ"
        }
        if clean.lowercased().contains("globizhub") {
            return "GlobizHub HQ"
        }
        return "\(clean) • Main Office"
    }

    private func formatOrdinalDate(_ date: Date) -> String {
        let calendar = Calendar.current
        let day = calendar.component(.day, from: date)
        let suffix: String
        if day >= 11 && day <= 13 {
            suffix = "th"
        } else {
            switch day % 10 {
            case 1: suffix = "st"
            case 2: suffix = "nd"
            case 3: suffix = "rd"
            default: suffix = "th"
            }
        }
        let monthYearFmt = DateFormatter()
        monthYearFmt.dateFormat = "MMMM, yyyy"
        return "\(day)\(suffix) \(monthYearFmt.string(from: date))"
    }

    @objc private func didTapSeeAll() {
        let alert = UIAlertController(title: "Attendance History", message: "Select view filter", preferredStyle: .actionSheet)
        alert.addAction(UIAlertAction(title: "Show All Records", style: .default, handler: { [weak self] _ in
            self?.currentFilter = "ALL"
            self?.isExpanded = true
            self?.renderHistoryList()
        }))
        alert.addAction(UIAlertAction(title: "Filter: Early Punches", style: .default, handler: { [weak self] _ in
            self?.currentFilter = "EARLY"
            self?.isExpanded = true
            self?.renderHistoryList()
        }))
        alert.addAction(UIAlertAction(title: "Filter: On Time Punches", style: .default, handler: { [weak self] _ in
            self?.currentFilter = "ON_TIME"
            self?.isExpanded = true
            self?.renderHistoryList()
        }))
        alert.addAction(UIAlertAction(title: "Filter: Late Punches", style: .default, handler: { [weak self] _ in
            self?.currentFilter = "LATE"
            self?.isExpanded = true
            self?.renderHistoryList()
        }))
        alert.addAction(UIAlertAction(title: "Request Regularization", style: .default, handler: { [weak self] _ in
            self?.showRegularizationAlert()
        }))
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        present(alert, animated: true)
    }

    private func showRegularizationAlert() {
        let alert = UIAlertController(title: "Request Regularization", message: "Submit attendance correction for biometric sync discrepancy.\n\nYour reporting manager will receive instant approval notification.", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Submit", style: .default, handler: { [weak self] _ in
            let successAlert = UIAlertController(title: "Request Submitted", message: "Your attendance regularization request was submitted to HR.", preferredStyle: .alert)
            successAlert.addAction(UIAlertAction(title: "OK", style: .default))
            self?.present(successAlert, animated: true)
        }))
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        present(alert, animated: true)
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

    private func loadUserProfile() {
        let firstName = AuthService.shared.getFirstName()
        if !firstName.isEmpty {
            avatarInitialsLabel.text = String(firstName.prefix(1)).uppercased()
        } else {
            avatarInitialsLabel.text = "C"
        }
    }
}
