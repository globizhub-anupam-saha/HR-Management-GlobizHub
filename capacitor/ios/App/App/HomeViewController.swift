import UIKit
import UserNotifications
import AVFoundation

class HomeViewController: UIViewController, UIScrollViewDelegate {

    // MARK: - UI Elements

    private let topBar = UIView()
    private let topBarContainer = UIView()
    private let headerTextStack = UIStackView()
    private let brandSubtitleLabel = UILabel()
    private let screenTitleLabel = UILabel()

    private let notificationButton = UIButton(type: .system)
    private let notifBadgeDot = UIView()
    private let avatarContainer = UIView()
    private let avatarImageView = UIImageView()
    private let avatarInitialsLabel = UILabel()

    private let scrollView = UIScrollView()
    private let contentView = UIView()
    private let cardsStackView = UIStackView()

    // Multi-Role Container Stacks
    private let employeeStackView = UIStackView()
    private let adminStackView = UIStackView()
    private let superAdminStackView = UIStackView()

    // Admin Dashboard Views
    private let adminHeroCard = UIView()
    private let adminHeroGradient = CAGradientLayer()
    private let adminGreetingLabel = UILabel()
    private let adminSubtitleLabel = UILabel()
    private let adminTotalEmployeesLabel = UILabel()
    private let adminPresentTodayLabel = UILabel()
    private let adminAbsentTodayLabel = UILabel()
    private let adminLateTodayLabel = UILabel()
    private let adminPendingLeavesCard = UIView()
    private let adminPendingBadgeLabel = UILabel()
    private let adminPendingLeavesStack = UIStackView()
    private let adminAuditStack = UIStackView()
    private let adminAnnouncementsStack = UIStackView()

    // Super Admin Dashboard Views
    private let superAdminHeroCard = UIView()
    private let superAdminHeroGradient = CAGradientLayer()
    private let superAdminGreetingLabel = UILabel()
    private let superAdminSubtitleLabel = UILabel()
    private let superAdminTotalOrgsLabel = UILabel()
    private let superAdminOrgsSubLabel = UILabel()
    private let superAdminTotalEmployeesLabel = UILabel()
    private let superAdminMRRLabel = UILabel()
    private let superAdminSubsLabel = UILabel()
    private let superAdminPendingOrgsLabel = UILabel()
    private let superAdminSuspendedLabel = UILabel()
    private let superAdminTicketsLabel = UILabel()
    private let superAdminTenantsStack = UIStackView()
    private let superAdminAuditStack = UIStackView()

    // 1. Employee Portal Hero Card
    private let heroCard = GradientCardView()
    private let heroBadgeLabel = UILabel()
    private let heroGreetingLabel = UILabel()
    private let heroSubRoleLabel = UILabel()
    private let shiftStrip = UIView()
    private let shiftClockIcon = UIImageView()
    private let shiftTimeLabel = UILabel()
    private let shiftOnTrackBadge = UIView()
    private let shiftOnTrackLabel = UILabel()

    // 2. Active Shift Timer Card
    private let timerCard = UIView()
    private let timerSectionTitle = UILabel()
    private let liveTimerLabel = UILabel()
    private let punchStatusLabel = UILabel()
    private let breakTimerLabel = UILabel()

    private let punchGlowRing = UIView()
    private let punchCircleButton = UIButton(type: .custom)
    private let punchIconView = UIImageView()
    private let progressRingLayer = CAShapeLayer()

    private let actionButtonsRow = UIStackView()
    private let takeBreakButton = UIButton(type: .custom)

    // 3. Two-Column Stats Row (Leaves & Holiday)
    private let twoColumnRow = UIStackView()

    // Card A: Leaves
    private let leavesCard = UIView()
    private let leavesTitleLabel = UILabel()
    private let leavesBadge = UIView()
    private let leavesBadgeIcon = UIImageView()
    private let leavesCasualLabel = UILabel()
    private let leavesSickLabel = UILabel()
    private let leavesProgressTrack = UIView()
    private let leavesProgressBar = UIView()
    private var leavesProgressWidthConstraint: NSLayoutConstraint?

    // Card B: Holiday (Real-time & Interactive Cycle)
    private let holidayCard = UIView()
    private let holidayTitleLabel = UILabel()
    private let holidayBadge = UIView()
    private let holidayBadgeIcon = UIImageView()
    private let holidayDotsStack = UIStackView()
    private var holidayDots: [UIView] = []
    private let holidayNameLabel = UILabel()
    private let holidayDateLabel = UILabel()
    private let holidayDaysLeftBadge = UIView()
    private let holidayDaysLeftLabel = UILabel()
    private var upcomingHolidays: [[String: Any]] = []
    private var currentHolidayIndex = 0

    // 4. Team Presence Card
    private let teamPresenceCard = UIView()
    private let teamPresenceIcon = UIImageView()
    private let teamPresenceTitle = UILabel()
    private let teamActiveCountLabel = UILabel()
    private let avatarsContainer = UIView()
    private let viewRosterButton = UIButton(type: .system)
    private var teamMembersList: [[String: Any]] = []

    // 5. Tasks Card
    private let tasksCard = UIView()
    private let taskIconContainer = UIView()
    private let taskIconView = UIImageView()
    private let taskTitleLabel = UILabel()
    private let taskSubtitleLabel = UILabel()
    private let taskArrowButton = UIButton(type: .custom)
    private var myTasksList: [[String: Any]] = []

    // 6. GitHub-Style Monthly & Yearly Attendance Activity Heatmap
    private let monthlyHeatmapCard = UIView()
    private let heatmapMonthYearLabel = UILabel()
    private let heatmapModeSegmented = UISegmentedControl(items: ["Month", "Full Year"])
    private let monthViewContainer = UIView()
    private let yearViewScrollView = UIScrollView()
    private let yearViewContentStack = UIStackView()
    private let heatmapMonthSwitcherStack = UIStackView()
    private let heatmapGridStack = UIStackView()
    private let heatmapDayDetailView = UIView()
    private let heatmapDetailDateLabel = UILabel()
    private let heatmapDetailBadgeLabel = UILabel()
    private let heatmapDetailHoursLabel = UILabel()
    private let heatmapStatDaysWorkedLabel = UILabel()
    private let heatmapStatOvertimeLabel = UILabel()
    private let heatmapStatTotalHoursLabel = UILabel()
    private let heatmapStatStreakLabel = UILabel()
    private var heatmapCurrentDate = Date()
    private var currentHeatmapDays: [HeatmapDayData] = []
    private var allYearDaysData: [HeatmapDayData] = []
    private var selectedHeatmapDay = -1
    private var selectedYearDayIndex = -1
    private var todayHeatmapBoxView: UIView?
    private var todayHeatmapBoxLabel: UILabel?
    private var todayYearBoxView: UIView?

    // Bottom Navigation Bar
    private let bottomNavBar = UIView()
    private let bottomNavContainer = UIView()

    // Interactive Floating Note/Popup (Slide-up for short tap)
    private let hintPopupCard = UIView()
    private let hintIconView = UIImageView()
    private let hintTitleLabel = UILabel()
    private let hintSubtitleLabel = UILabel()
    private var hintPopupBottomConstraint: NSLayoutConstraint?
    private var hintDismissTimer: Timer?

    // Punch Instruction Label
    private let punchInstructionLabel: UILabel = {
        let lbl = UILabel()
        lbl.font = .systemFont(ofSize: 12, weight: .semibold)
        lbl.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        lbl.textAlignment = .center
        lbl.text = "Hold 2s to Punch In"
        lbl.translatesAutoresizingMaskIntoConstraints = false
        return lbl
    }()

    // MARK: - State & Timer
    private var isCheckedIn = false
    private var isOnBreak = false
    private var currentBreakStartDate: Date?
    private var accumulatedBreakDuration: TimeInterval = 0
    private var lastBreakSessionText: String?
    private var isHoldingClockOut = false
    private var checkInDate: Date?
    private var liveTimer: Timer?
    private var cachedFirstName = AuthService.shared.getFirstName()

    // Shift Timing Window & Punctuality State
    private var shiftStartHour: Int = 9
    private var shiftStartMinute: Int = 0
    private var shiftEndHour: Int = 18
    private var shiftEndMinute: Int = 0
    private var isTodayLate: Bool = false
    private var isShiftCompletedToday: Bool = false

    private func isWithinPunchInWindow() -> Bool {
        let windowOpenMinutes = (shiftStartHour * 60 + shiftStartMinute) - 5
        let windowCloseMinutes = (shiftEndHour * 60 + shiftEndMinute)
        let cal = Calendar.current
        let currentMinutes = cal.component(.hour, from: Date()) * 60 + cal.component(.minute, from: Date())
        return currentMinutes >= windowOpenMinutes && currentMinutes <= windowCloseMinutes
    }

    private func updateShiftBadgeForStatus(isLate: Bool) {
        if isLate {
            shiftOnTrackBadge.backgroundColor = UIColor(red: 254/255, green: 243/255, blue: 199/255, alpha: 1.0)
            shiftOnTrackLabel.text = "Late"
            shiftOnTrackLabel.textColor = UIColor(red: 180/255, green: 83/255, blue: 9/255, alpha: 1.0)
        } else {
            shiftOnTrackBadge.backgroundColor = UIColor(red: 167/255, green: 243/255, blue: 208/255, alpha: 1.0)
            shiftOnTrackLabel.text = "On Track"
            shiftOnTrackLabel.textColor = UIColor(red: 6/255, green: 95/255, blue: 70/255, alpha: 1.0)
        }
    }

    // Minimum 3-Minute Shift Duration Lock
    private let minShiftLockDuration: TimeInterval = 180.0 // 3 minutes

    private var isShiftInThreeMinLock: Bool {
        guard isCheckedIn, let startDate = checkInDate else { return false }
        let elapsed = Date().timeIntervalSince(startDate)
        return elapsed < minShiftLockDuration
    }

    private var remainingLockSeconds: Int {
        guard let startDate = checkInDate else { return 0 }
        let elapsed = Date().timeIntervalSince(startDate)
        let remaining = Int(ceil(minShiftLockDuration - elapsed))
        return max(0, remaining)
    }

    private var remainingLockTimeFormatted: String {
        let sec = remainingLockSeconds
        if sec > 120 {
            return "3 min"
        } else if sec > 60 {
            return "2 min"
        } else if sec == 60 {
            return "1 min (60s)"
        } else {
            return "\(sec)s"
        }
    }

    // 30-Minute Break Duration Lock (cannot take break in first 30 mins)
    private let minBreakLockDuration: TimeInterval = 1800.0 // 30 minutes

    private var isBreakInThirtyMinLock: Bool {
        guard isCheckedIn, let startDate = checkInDate else { return false }
        let elapsed = Date().timeIntervalSince(startDate)
        return elapsed < minBreakLockDuration
    }

    private var remainingBreakLockMinutes: Int {
        guard let startDate = checkInDate else { return 0 }
        let elapsed = Date().timeIntervalSince(startDate)
        let remainingSec = max(0, minBreakLockDuration - elapsed)
        return max(1, Int(ceil(remainingSec / 60.0)))
    }

    // Skeleton Loading Overlay
    private let skeletonOverlay = HomeSkeletonOverlay()
    private var hasDismissedSkeleton = false

    // 2-Second Long Press Tracking
    private var pressStartTime: Date?
    private var holdTimer: Timer?
    private var isHoldingPunch = false
    private let requiredHoldDuration: TimeInterval = 2.0

    // MARK: - Lifecycle
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
        navigationController?.setNavigationBarHidden(true, animated: false)

        setupTopBar()
        setupScrollView()
        setupHeroCard()
        setupTimerCard()
        setupTwoColumnRow()
        setupTeamPresenceCard()
        setupTasksCard()
        setupMonthlyHeatmapCard()
        setupAdminDashboard()
        setupSuperAdminDashboard()
        setupBottomNavBar()
        setupHintPopup()
        updateGreeting()
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        adminHeroGradient.frame = adminHeroCard.bounds
        superAdminHeroGradient.frame = superAdminHeroCard.bounds
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        setupBottomNavBar()
        scrollView.setContentOffset(.zero, animated: false)

        restoreUserAttendanceSession()
        AuthService.shared.syncPendingOfflinePunches()
        scheduleShiftReminderNotifications()
        checkAndTriggerActiveShiftReminder()

        cachedFirstName = AuthService.shared.getFirstName()
        updateGreeting()

        let currentRole = AuthService.shared.getRole()
        let userRole = UserRole.from(string: currentRole)
        switch userRole {
        case .superAdmin:
            employeeStackView.isHidden = true
            adminStackView.isHidden = true
            superAdminStackView.isHidden = false
            loadSuperAdminDashboardData()
        case .admin:
            employeeStackView.isHidden = true
            adminStackView.isHidden = false
            superAdminStackView.isHidden = true
            loadAdminDashboardData()
        case .employee:
            employeeStackView.isHidden = false
            adminStackView.isHidden = true
            superAdminStackView.isHidden = true

            loadProfile()
            loadAttendanceStats()
            loadRealAttendanceHistoryForHeatmap()
            loadRealLeaves()
            loadRealHolidays()
            loadRealSchedule()
            loadTeamPresence()
            loadTasks()
            renderMonthlyHeatmap()
            heatmapModeSegmented.selectedSegmentIndex = 0
            didChangeHeatmapMode(heatmapModeSegmented)
            heroCard.play()
        }

        // Safety fallback timeout: dismiss after 3.5s if network is slow/offline
        DispatchQueue.main.asyncAfter(deadline: .now() + 3.5) { [weak self] in
            self?.dismissSkeleton()
        }
    }

    func dismissSkeleton() {
        guard !hasDismissedSkeleton else { return }
        hasDismissedSkeleton = true
        UIView.animate(withDuration: 0.35, delay: 0.1, options: [.curveEaseOut], animations: {
            self.skeletonOverlay.alpha = 0.0
        }) { _ in
            self.skeletonOverlay.removeFromSuperview()
        }
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        stopTimer()
        resetHoldAnimation()
        heroCard.pause()
    }

    // MARK: - Layout Setup

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

        // Brand Subtitle + Screen Title (Matching Attendance header exactly)
        headerTextStack.axis = .vertical
        headerTextStack.spacing = 1
        headerTextStack.translatesAutoresizingMaskIntoConstraints = false
        topBarContainer.addSubview(headerTextStack)

        brandSubtitleLabel.text = "GLOBIZHR"
        brandSubtitleLabel.font = .systemFont(ofSize: 11, weight: .heavy)
        brandSubtitleLabel.textColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        headerTextStack.addArrangedSubview(brandSubtitleLabel)

        screenTitleLabel.text = "Dashboard"
        screenTitleLabel.font = .systemFont(ofSize: 20, weight: .bold)
        screenTitleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        headerTextStack.addArrangedSubview(screenTitleLabel)

        let rightActionsStack = UIStackView()
        rightActionsStack.axis = .horizontal
        rightActionsStack.spacing = 12
        rightActionsStack.alignment = .center
        rightActionsStack.translatesAutoresizingMaskIntoConstraints = false
        topBarContainer.addSubview(rightActionsStack)

        // Notification Bell with Conditional Red Dot
        let bellConfig = UIImage.SymbolConfiguration(pointSize: 19, weight: .regular)
        notificationButton.setImage(UIImage(systemName: "bell", withConfiguration: bellConfig), for: .normal)
        notificationButton.tintColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        notificationButton.translatesAutoresizingMaskIntoConstraints = false
        notificationButton.addTarget(self, action: #selector(handleNotifications), for: .touchUpInside)
        rightActionsStack.addArrangedSubview(notificationButton)

        notifBadgeDot.backgroundColor = UIColor(red: 239/255, green: 68/255, blue: 68/255, alpha: 1.0)
        notifBadgeDot.layer.cornerRadius = 4
        notifBadgeDot.layer.borderWidth = 1.5
        notifBadgeDot.layer.borderColor = UIColor.white.cgColor
        notifBadgeDot.translatesAutoresizingMaskIntoConstraints = false
        notifBadgeDot.isHidden = true // Only shown when real notification arrives
        notificationButton.addSubview(notifBadgeDot)

        // User Avatar Button
        avatarContainer.backgroundColor = UIColor(red: 191/255, green: 219/255, blue: 254/255, alpha: 1.0)
        avatarContainer.layer.cornerRadius = 18
        avatarContainer.layer.masksToBounds = true
        avatarContainer.translatesAutoresizingMaskIntoConstraints = false
        avatarContainer.isUserInteractionEnabled = true
        avatarContainer.addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(openSettings)))
        rightActionsStack.addArrangedSubview(avatarContainer)

        avatarInitialsLabel.text = "A"
        avatarInitialsLabel.textColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        avatarInitialsLabel.font = .systemFont(ofSize: 14, weight: .bold)
        avatarInitialsLabel.textAlignment = .center
        avatarInitialsLabel.translatesAutoresizingMaskIntoConstraints = false
        avatarContainer.addSubview(avatarInitialsLabel)

        avatarImageView.contentMode = .scaleAspectFill
        avatarImageView.layer.masksToBounds = true
        avatarImageView.isHidden = true
        avatarImageView.translatesAutoresizingMaskIntoConstraints = false
        avatarContainer.addSubview(avatarImageView)

        // Top Bar Constraints matching AttendanceViewController
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

            headerTextStack.leadingAnchor.constraint(equalTo: topBarContainer.leadingAnchor),
            headerTextStack.centerYAnchor.constraint(equalTo: topBarContainer.centerYAnchor),

            rightActionsStack.trailingAnchor.constraint(equalTo: topBarContainer.trailingAnchor),
            rightActionsStack.centerYAnchor.constraint(equalTo: topBarContainer.centerYAnchor),

            notificationButton.widthAnchor.constraint(equalToConstant: 36),
            notificationButton.heightAnchor.constraint(equalToConstant: 36),

            notifBadgeDot.topAnchor.constraint(equalTo: notificationButton.topAnchor, constant: 5),
            notifBadgeDot.trailingAnchor.constraint(equalTo: notificationButton.trailingAnchor, constant: -4),
            notifBadgeDot.widthAnchor.constraint(equalToConstant: 8),
            notifBadgeDot.heightAnchor.constraint(equalToConstant: 8),

            avatarContainer.widthAnchor.constraint(equalToConstant: 36),
            avatarContainer.heightAnchor.constraint(equalToConstant: 36),

            avatarInitialsLabel.centerXAnchor.constraint(equalTo: avatarContainer.centerXAnchor),
            avatarInitialsLabel.centerYAnchor.constraint(equalTo: avatarContainer.centerYAnchor),

            avatarImageView.topAnchor.constraint(equalTo: avatarContainer.topAnchor),
            avatarImageView.bottomAnchor.constraint(equalTo: avatarContainer.bottomAnchor),
            avatarImageView.leadingAnchor.constraint(equalTo: avatarContainer.leadingAnchor),
            avatarImageView.trailingAnchor.constraint(equalTo: avatarContainer.trailingAnchor)
        ])
    }

    private func setupScrollView() {
        scrollView.showsVerticalScrollIndicator = false
        scrollView.delegate = self
        scrollView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(scrollView)

        contentView.translatesAutoresizingMaskIntoConstraints = false
        scrollView.addSubview(contentView)

        cardsStackView.axis = .vertical
        cardsStackView.spacing = 16
        cardsStackView.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(cardsStackView)

        employeeStackView.axis = .vertical
        employeeStackView.spacing = 16
        employeeStackView.translatesAutoresizingMaskIntoConstraints = false
        cardsStackView.addArrangedSubview(employeeStackView)

        adminStackView.axis = .vertical
        adminStackView.spacing = 16
        adminStackView.translatesAutoresizingMaskIntoConstraints = false
        adminStackView.isHidden = true
        cardsStackView.addArrangedSubview(adminStackView)

        superAdminStackView.axis = .vertical
        superAdminStackView.spacing = 16
        superAdminStackView.translatesAutoresizingMaskIntoConstraints = false
        superAdminStackView.isHidden = true
        cardsStackView.addArrangedSubview(superAdminStackView)

        contentView.addSubview(skeletonOverlay)

        var contentWidthConstraints: [NSLayoutConstraint] = []
        if UIDevice.current.userInterfaceIdiom == .pad {
            contentWidthConstraints = [
                contentView.widthAnchor.constraint(equalToConstant: 680),
                contentView.centerXAnchor.constraint(equalTo: scrollView.centerXAnchor)
            ]
        } else {
            contentWidthConstraints = [
                contentView.widthAnchor.constraint(equalTo: view.widthAnchor)
            ]
        }

        NSLayoutConstraint.activate([
            scrollView.topAnchor.constraint(equalTo: topBar.bottomAnchor),
            scrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scrollView.bottomAnchor.constraint(equalTo: view.bottomAnchor),

            contentView.topAnchor.constraint(equalTo: scrollView.contentLayoutGuide.topAnchor),
            contentView.bottomAnchor.constraint(equalTo: scrollView.contentLayoutGuide.bottomAnchor, constant: -100),
            contentView.leadingAnchor.constraint(equalTo: scrollView.contentLayoutGuide.leadingAnchor),
            contentView.trailingAnchor.constraint(equalTo: scrollView.contentLayoutGuide.trailingAnchor),

            cardsStackView.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 16),
            cardsStackView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            cardsStackView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            cardsStackView.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -16),

            skeletonOverlay.topAnchor.constraint(equalTo: contentView.topAnchor),
            skeletonOverlay.leadingAnchor.constraint(equalTo: contentView.leadingAnchor),
            skeletonOverlay.trailingAnchor.constraint(equalTo: contentView.trailingAnchor),
            skeletonOverlay.bottomAnchor.constraint(equalTo: contentView.bottomAnchor)
        ] + contentWidthConstraints)
    }

    // MARK: - 1. Employee Portal Hero Card
    private func setupHeroCard() {
        heroCard.layer.cornerRadius = 24
        heroCard.layer.masksToBounds = true
        heroCard.translatesAutoresizingMaskIntoConstraints = false
        employeeStackView.addArrangedSubview(heroCard)

        // Pill: EMPLOYEE PORTAL (Tick badge removed as requested)
        let badgeContainer = UIView()
        badgeContainer.backgroundColor = UIColor(white: 1.0, alpha: 0.16)
        badgeContainer.layer.cornerRadius = 12
        badgeContainer.translatesAutoresizingMaskIntoConstraints = false
        heroCard.addSubview(badgeContainer)

        heroBadgeLabel.text = "EMPLOYEE PORTAL"
        heroBadgeLabel.font = .systemFont(ofSize: 10, weight: .bold)
        heroBadgeLabel.textColor = .white
        heroBadgeLabel.translatesAutoresizingMaskIntoConstraints = false
        badgeContainer.addSubview(heroBadgeLabel)

        // Greeting & Subtitle (Time-based greeting + user login name)
        heroGreetingLabel.text = "Good day, \(AuthService.shared.getFirstName())"
        heroGreetingLabel.font = .systemFont(ofSize: 24, weight: .bold)
        heroGreetingLabel.textColor = .white
        heroGreetingLabel.translatesAutoresizingMaskIntoConstraints = false
        heroCard.addSubview(heroGreetingLabel)

        let initDesig = AuthService.shared.getDesignation()
        let initOrg = AuthService.shared.getOrganization()
        heroSubRoleLabel.text = "\(initDesig) • \(initOrg)"
        heroSubRoleLabel.font = .systemFont(ofSize: 13, weight: .regular)
        heroSubRoleLabel.textColor = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 1.0)
        heroSubRoleLabel.translatesAutoresizingMaskIntoConstraints = false
        heroCard.addSubview(heroSubRoleLabel)

        // Bottom Shift Strip
        shiftStrip.backgroundColor = UIColor(red: 238/255, green: 242/255, blue: 255/255, alpha: 1.0)
        shiftStrip.layer.cornerRadius = 18
        shiftStrip.translatesAutoresizingMaskIntoConstraints = false
        heroCard.addSubview(shiftStrip)

        let clockConfig = UIImage.SymbolConfiguration(pointSize: 15, weight: .bold)
        shiftClockIcon.image = UIImage(systemName: "clock.fill", withConfiguration: clockConfig) ?? UIImage(systemName: "clock", withConfiguration: clockConfig)
        shiftClockIcon.tintColor = UIColor(red: 37/255, green: 99/255, blue: 235/255, alpha: 1.0)
        shiftClockIcon.translatesAutoresizingMaskIntoConstraints = false
        shiftStrip.addSubview(shiftClockIcon)

        shiftTimeLabel.text = "Shift: \(AuthService.shared.getShiftTiming())"
        shiftTimeLabel.font = .systemFont(ofSize: 13, weight: .semibold)
        shiftTimeLabel.textColor = UIColor(red: 30/255, green: 41/255, blue: 59/255, alpha: 1.0)
        shiftTimeLabel.translatesAutoresizingMaskIntoConstraints = false
        shiftStrip.addSubview(shiftTimeLabel)

        shiftOnTrackBadge.backgroundColor = UIColor(red: 167/255, green: 243/255, blue: 208/255, alpha: 1.0)
        shiftOnTrackBadge.layer.cornerRadius = 9
        shiftOnTrackBadge.translatesAutoresizingMaskIntoConstraints = false
        shiftStrip.addSubview(shiftOnTrackBadge)

        shiftOnTrackLabel.text = "On Track"
        shiftOnTrackLabel.font = .systemFont(ofSize: 11, weight: .bold)
        shiftOnTrackLabel.textColor = UIColor(red: 6/255, green: 95/255, blue: 70/255, alpha: 1.0)
        shiftOnTrackLabel.translatesAutoresizingMaskIntoConstraints = false
        shiftOnTrackBadge.addSubview(shiftOnTrackLabel)

        NSLayoutConstraint.activate([
            badgeContainer.topAnchor.constraint(equalTo: heroCard.topAnchor, constant: 18),
            badgeContainer.leadingAnchor.constraint(equalTo: heroCard.leadingAnchor, constant: 18),
            badgeContainer.heightAnchor.constraint(equalToConstant: 24),

            heroBadgeLabel.leadingAnchor.constraint(equalTo: badgeContainer.leadingAnchor, constant: 10),
            heroBadgeLabel.trailingAnchor.constraint(equalTo: badgeContainer.trailingAnchor, constant: -10),
            heroBadgeLabel.centerYAnchor.constraint(equalTo: badgeContainer.centerYAnchor),

            heroGreetingLabel.topAnchor.constraint(equalTo: badgeContainer.bottomAnchor, constant: 14),
            heroGreetingLabel.leadingAnchor.constraint(equalTo: heroCard.leadingAnchor, constant: 18),
            heroGreetingLabel.trailingAnchor.constraint(equalTo: heroCard.trailingAnchor, constant: -18),

            heroSubRoleLabel.topAnchor.constraint(equalTo: heroGreetingLabel.bottomAnchor, constant: 4),
            heroSubRoleLabel.leadingAnchor.constraint(equalTo: heroCard.leadingAnchor, constant: 18),
            heroSubRoleLabel.trailingAnchor.constraint(equalTo: heroCard.trailingAnchor, constant: -18),

            shiftStrip.topAnchor.constraint(equalTo: heroSubRoleLabel.bottomAnchor, constant: 18),
            shiftStrip.leadingAnchor.constraint(equalTo: heroCard.leadingAnchor, constant: 12),
            shiftStrip.trailingAnchor.constraint(equalTo: heroCard.trailingAnchor, constant: -12),
            shiftStrip.heightAnchor.constraint(equalToConstant: 40),
            shiftStrip.bottomAnchor.constraint(equalTo: heroCard.bottomAnchor, constant: -14),

            shiftClockIcon.leadingAnchor.constraint(equalTo: shiftStrip.leadingAnchor, constant: 12),
            shiftClockIcon.centerYAnchor.constraint(equalTo: shiftStrip.centerYAnchor),
            shiftClockIcon.widthAnchor.constraint(equalToConstant: 18),
            shiftClockIcon.heightAnchor.constraint(equalToConstant: 18),

            shiftTimeLabel.leadingAnchor.constraint(equalTo: shiftClockIcon.trailingAnchor, constant: 8),
            shiftTimeLabel.centerYAnchor.constraint(equalTo: shiftStrip.centerYAnchor),

            shiftOnTrackBadge.trailingAnchor.constraint(equalTo: shiftStrip.trailingAnchor, constant: -10),
            shiftOnTrackBadge.centerYAnchor.constraint(equalTo: shiftStrip.centerYAnchor),
            shiftOnTrackBadge.heightAnchor.constraint(equalToConstant: 22),

            shiftOnTrackLabel.leadingAnchor.constraint(equalTo: shiftOnTrackBadge.leadingAnchor, constant: 8),
            shiftOnTrackLabel.trailingAnchor.constraint(equalTo: shiftOnTrackBadge.trailingAnchor, constant: -8),
            shiftOnTrackLabel.centerYAnchor.constraint(equalTo: shiftOnTrackBadge.centerYAnchor)
        ])
    }

    // MARK: - 2. Active Shift Timer Card
    private func setupTimerCard() {
        timerCard.backgroundColor = .white
        timerCard.layer.cornerRadius = 24
        timerCard.layer.borderWidth = 1
        timerCard.layer.borderColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0).cgColor
        timerCard.layer.shadowColor = UIColor.black.cgColor
        timerCard.layer.shadowOpacity = 0.04
        timerCard.layer.shadowOffset = CGSize(width: 0, height: 4)
        timerCard.layer.shadowRadius = 12
        timerCard.translatesAutoresizingMaskIntoConstraints = false
        employeeStackView.addArrangedSubview(timerCard)

        // Section Title: ACTIVE SHIFT TIMER
        timerSectionTitle.text = "ACTIVE SHIFT TIMER"
        timerSectionTitle.font = .systemFont(ofSize: 11, weight: .bold)
        timerSectionTitle.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        timerSectionTitle.textAlignment = .center
        timerSectionTitle.translatesAutoresizingMaskIntoConstraints = false
        timerCard.addSubview(timerSectionTitle)

        // Live Timer: 07h 44m 35s
        liveTimerLabel.text = "00h 00m 00s"
        liveTimerLabel.font = .monospacedDigitSystemFont(ofSize: 32, weight: .heavy)
        liveTimerLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        liveTimerLabel.textAlignment = .center
        liveTimerLabel.translatesAutoresizingMaskIntoConstraints = false
        timerCard.addSubview(liveTimerLabel)

        // Punch status
        punchStatusLabel.text = "• Clocked Out"
        punchStatusLabel.font = .systemFont(ofSize: 13, weight: .semibold)
        punchStatusLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        punchStatusLabel.textAlignment = .center
        punchStatusLabel.translatesAutoresizingMaskIntoConstraints = false
        timerCard.addSubview(punchStatusLabel)

        // Break timer & session info label below punch status
        breakTimerLabel.font = .systemFont(ofSize: 12, weight: .bold)
        breakTimerLabel.textColor = UIColor(red: 217/255, green: 119/255, blue: 6/255, alpha: 1.0)
        breakTimerLabel.textAlignment = .center
        breakTimerLabel.translatesAutoresizingMaskIntoConstraints = false
        breakTimerLabel.isHidden = true
        timerCard.addSubview(breakTimerLabel)

        // Fingerprint Punch Button (Outer Glow + Inner Blue Circle + Circular Loading Ring)
        punchGlowRing.backgroundColor = UIColor(red: 219/255, green: 234/255, blue: 254/255, alpha: 0.85)
        punchGlowRing.layer.cornerRadius = 48
        punchGlowRing.translatesAutoresizingMaskIntoConstraints = false
        timerCard.addSubview(punchGlowRing)

        punchCircleButton.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        punchCircleButton.layer.cornerRadius = 34
        punchCircleButton.layer.shadowColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 0.35).cgColor
        punchCircleButton.layer.shadowOpacity = 0.3
        punchCircleButton.layer.shadowOffset = CGSize(width: 0, height: 4)
        punchCircleButton.layer.shadowRadius = 8
        punchCircleButton.translatesAutoresizingMaskIntoConstraints = false
        punchGlowRing.addSubview(punchCircleButton)

        // Setup Circular 2-Second Hold Animation Progress Ring (White Loading Circle)
        let ringPath = UIBezierPath(arcCenter: CGPoint(x: 34, y: 34), radius: 32, startAngle: -CGFloat.pi / 2, endAngle: 1.5 * CGFloat.pi, clockwise: true)
        progressRingLayer.path = ringPath.cgPath
        progressRingLayer.strokeColor = UIColor.white.cgColor
        progressRingLayer.fillColor = UIColor.clear.cgColor
        progressRingLayer.lineWidth = 3.5
        progressRingLayer.strokeEnd = 0.0
        progressRingLayer.lineCap = .round
        punchCircleButton.layer.addSublayer(progressRingLayer)

        let fpConfig = UIImage.SymbolConfiguration(pointSize: 34, weight: .medium)
        punchIconView.image = UIImage(systemName: "touchid", withConfiguration: fpConfig)
        punchIconView.tintColor = .white
        punchIconView.contentMode = .scaleAspectFit
        punchIconView.translatesAutoresizingMaskIntoConstraints = false
        punchCircleButton.addSubview(punchIconView)

        // Add Touch Events for 2-Second Long Press Interaction
        punchCircleButton.addTarget(self, action: #selector(punchTouchDown), for: .touchDown)
        punchCircleButton.addTarget(self, action: #selector(punchTouchUp), for: [.touchUpInside, .touchUpOutside, .touchCancel])

        // Action Buttons Row: [Take Break] (Clock Out button completely removed)
        actionButtonsRow.axis = .horizontal
        actionButtonsRow.distribution = .fill
        actionButtonsRow.alignment = .center
        actionButtonsRow.spacing = 12
        actionButtonsRow.translatesAutoresizingMaskIntoConstraints = false
        timerCard.addSubview(actionButtonsRow)

        // Take Break Button
        takeBreakButton.backgroundColor = UIColor(red: 238/255, green: 242/255, blue: 255/255, alpha: 1.0)
        takeBreakButton.layer.cornerRadius = 23
        takeBreakButton.setTitle(" Take Break", for: .normal)
        takeBreakButton.setTitleColor(UIColor(red: 30/255, green: 41/255, blue: 59/255, alpha: 1.0), for: .normal)
        takeBreakButton.titleLabel?.font = .systemFont(ofSize: 14, weight: .semibold)
        let cupConfig = UIImage.SymbolConfiguration(pointSize: 14, weight: .semibold)
        let cupImg = UIImage(systemName: "cup.and.saucer.fill", withConfiguration: cupConfig) ?? UIImage(systemName: "pause.circle.fill", withConfiguration: cupConfig)
        takeBreakButton.setImage(cupImg, for: .normal)
        takeBreakButton.tintColor = UIColor(red: 30/255, green: 41/255, blue: 59/255, alpha: 1.0)
        takeBreakButton.addTarget(self, action: #selector(handleTakeBreak), for: .touchUpInside)
        actionButtonsRow.addArrangedSubview(takeBreakButton)

        timerCard.addSubview(punchInstructionLabel)

        NSLayoutConstraint.activate([
            timerSectionTitle.topAnchor.constraint(equalTo: timerCard.topAnchor, constant: 22),
            timerSectionTitle.centerXAnchor.constraint(equalTo: timerCard.centerXAnchor),

            liveTimerLabel.topAnchor.constraint(equalTo: timerSectionTitle.bottomAnchor, constant: 6),
            liveTimerLabel.centerXAnchor.constraint(equalTo: timerCard.centerXAnchor),

            punchStatusLabel.topAnchor.constraint(equalTo: liveTimerLabel.bottomAnchor, constant: 4),
            punchStatusLabel.centerXAnchor.constraint(equalTo: timerCard.centerXAnchor),

            breakTimerLabel.topAnchor.constraint(equalTo: punchStatusLabel.bottomAnchor, constant: 3),
            breakTimerLabel.centerXAnchor.constraint(equalTo: timerCard.centerXAnchor),
            breakTimerLabel.leadingAnchor.constraint(greaterThanOrEqualTo: timerCard.leadingAnchor, constant: 12),
            breakTimerLabel.trailingAnchor.constraint(lessThanOrEqualTo: timerCard.trailingAnchor, constant: -12),

            punchGlowRing.topAnchor.constraint(equalTo: breakTimerLabel.bottomAnchor, constant: 14),
            punchGlowRing.centerXAnchor.constraint(equalTo: timerCard.centerXAnchor),
            punchGlowRing.widthAnchor.constraint(equalToConstant: 96),
            punchGlowRing.heightAnchor.constraint(equalToConstant: 96),

            punchCircleButton.centerXAnchor.constraint(equalTo: punchGlowRing.centerXAnchor),
            punchCircleButton.centerYAnchor.constraint(equalTo: punchGlowRing.centerYAnchor),
            punchCircleButton.widthAnchor.constraint(equalToConstant: 68),
            punchCircleButton.heightAnchor.constraint(equalToConstant: 68),

            punchIconView.centerXAnchor.constraint(equalTo: punchCircleButton.centerXAnchor),
            punchIconView.centerYAnchor.constraint(equalTo: punchCircleButton.centerYAnchor),
            punchIconView.widthAnchor.constraint(equalToConstant: 34),
            punchIconView.heightAnchor.constraint(equalToConstant: 34),

            punchInstructionLabel.topAnchor.constraint(equalTo: punchGlowRing.bottomAnchor, constant: 10),
            punchInstructionLabel.centerXAnchor.constraint(equalTo: timerCard.centerXAnchor),
            punchInstructionLabel.leadingAnchor.constraint(greaterThanOrEqualTo: timerCard.leadingAnchor, constant: 16),
            punchInstructionLabel.trailingAnchor.constraint(lessThanOrEqualTo: timerCard.trailingAnchor, constant: -16),

            actionButtonsRow.topAnchor.constraint(equalTo: punchInstructionLabel.bottomAnchor, constant: 14),
            actionButtonsRow.centerXAnchor.constraint(equalTo: timerCard.centerXAnchor),
            actionButtonsRow.heightAnchor.constraint(equalToConstant: 46),
            actionButtonsRow.bottomAnchor.constraint(equalTo: timerCard.bottomAnchor, constant: -20),

            takeBreakButton.heightAnchor.constraint(equalToConstant: 46),
            takeBreakButton.widthAnchor.constraint(equalToConstant: 180)
        ])
    }

    // MARK: - 3. Leaves & Holiday Row
    private func setupTwoColumnRow() {
        twoColumnRow.axis = .vertical
        twoColumnRow.distribution = .fill
        twoColumnRow.spacing = 14
        twoColumnRow.translatesAutoresizingMaskIntoConstraints = false
        employeeStackView.addArrangedSubview(twoColumnRow)

        // Card A: Leaves (Full-width 1st)
        leavesCard.backgroundColor = .white
        leavesCard.layer.cornerRadius = 20
        leavesCard.layer.borderWidth = 1
        leavesCard.layer.borderColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0).cgColor
        leavesCard.layer.shadowColor = UIColor.black.cgColor
        leavesCard.layer.shadowOpacity = 0.03
        leavesCard.layer.shadowOffset = CGSize(width: 0, height: 2)
        leavesCard.layer.shadowRadius = 8
        leavesCard.translatesAutoresizingMaskIntoConstraints = false
        twoColumnRow.addArrangedSubview(leavesCard)

        leavesTitleLabel.text = "Total Leave"
        leavesTitleLabel.font = .systemFont(ofSize: 16, weight: .bold)
        leavesTitleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        leavesTitleLabel.translatesAutoresizingMaskIntoConstraints = false
        leavesCard.addSubview(leavesTitleLabel)

        leavesBadge.backgroundColor = UIColor(red: 239/255, green: 246/255, blue: 255/255, alpha: 1.0)
        leavesBadge.layer.cornerRadius = 16
        leavesBadge.translatesAutoresizingMaskIntoConstraints = false
        leavesCard.addSubview(leavesBadge)

        let calConfig = UIImage.SymbolConfiguration(pointSize: 15, weight: .semibold)
        leavesBadgeIcon.image = UIImage(systemName: "leaf.fill", withConfiguration: calConfig) ?? UIImage(systemName: "calendar", withConfiguration: calConfig)
        leavesBadgeIcon.tintColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        leavesBadgeIcon.contentMode = .scaleAspectFit
        leavesBadgeIcon.translatesAutoresizingMaskIntoConstraints = false
        leavesBadge.addSubview(leavesBadgeIcon)

        leavesCasualLabel.text = "18 Leaves Left"
        leavesCasualLabel.font = .systemFont(ofSize: 15, weight: .bold)
        leavesCasualLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        leavesCasualLabel.translatesAutoresizingMaskIntoConstraints = false
        leavesCard.addSubview(leavesCasualLabel)

        leavesSickLabel.text = "Allocated: 24 • Used: 6"
        leavesSickLabel.font = .systemFont(ofSize: 13, weight: .medium)
        leavesSickLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        leavesSickLabel.translatesAutoresizingMaskIntoConstraints = false
        leavesCard.addSubview(leavesSickLabel)

        leavesProgressTrack.backgroundColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0)
        leavesProgressTrack.layer.cornerRadius = 2.5
        leavesProgressTrack.layer.masksToBounds = true
        leavesProgressTrack.translatesAutoresizingMaskIntoConstraints = false
        leavesCard.addSubview(leavesProgressTrack)

        leavesProgressBar.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        leavesProgressBar.layer.cornerRadius = 2.5
        leavesProgressBar.translatesAutoresizingMaskIntoConstraints = false
        leavesProgressTrack.addSubview(leavesProgressBar)

        // Card B: Holiday (Full-width below Leaves)
        holidayCard.backgroundColor = .white
        holidayCard.layer.cornerRadius = 20
        holidayCard.layer.borderWidth = 1
        holidayCard.layer.borderColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0).cgColor
        holidayCard.layer.shadowColor = UIColor.black.cgColor
        holidayCard.layer.shadowOpacity = 0.03
        holidayCard.layer.shadowOffset = CGSize(width: 0, height: 2)
        holidayCard.layer.shadowRadius = 8
        holidayCard.translatesAutoresizingMaskIntoConstraints = false
        holidayCard.isUserInteractionEnabled = true
        holidayCard.addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(cycleNextHoliday)))
        let swipeLeft = UISwipeGestureRecognizer(target: self, action: #selector(cycleNextHoliday))
        swipeLeft.direction = .left
        holidayCard.addGestureRecognizer(swipeLeft)
        let swipeRight = UISwipeGestureRecognizer(target: self, action: #selector(cyclePrevHoliday))
        swipeRight.direction = .right
        holidayCard.addGestureRecognizer(swipeRight)
        twoColumnRow.addArrangedSubview(holidayCard)

        holidayTitleLabel.text = "Upcoming Holidays"
        holidayTitleLabel.font = .systemFont(ofSize: 16, weight: .bold)
        holidayTitleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        holidayTitleLabel.translatesAutoresizingMaskIntoConstraints = false
        holidayCard.addSubview(holidayTitleLabel)

        holidayDotsStack.axis = .horizontal
        holidayDotsStack.spacing = 4
        holidayDotsStack.alignment = .center
        holidayDotsStack.distribution = .fill
        holidayDotsStack.translatesAutoresizingMaskIntoConstraints = false
        holidayCard.addSubview(holidayDotsStack)

        holidayDots.removeAll()
        for i in 0..<3 {
            let dot = UIView()
            dot.backgroundColor = (i == 0) ? UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0) : UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0)
            dot.layer.cornerRadius = 3
            dot.translatesAutoresizingMaskIntoConstraints = false
            let wConstraint = dot.widthAnchor.constraint(equalToConstant: i == 0 ? 12 : 6)
            let hConstraint = dot.heightAnchor.constraint(equalToConstant: 6)
            NSLayoutConstraint.activate([wConstraint, hConstraint])
            holidayDots.append(dot)
            holidayDotsStack.addArrangedSubview(dot)
        }

        holidayNameLabel.text = "Diwali"
        holidayNameLabel.font = .systemFont(ofSize: 16, weight: .bold)
        holidayNameLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        holidayNameLabel.translatesAutoresizingMaskIntoConstraints = false
        holidayCard.addSubview(holidayNameLabel)

        holidayDateLabel.text = "Fri, Nov 1"
        holidayDateLabel.font = .systemFont(ofSize: 13, weight: .regular)
        holidayDateLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        holidayDateLabel.translatesAutoresizingMaskIntoConstraints = false
        holidayCard.addSubview(holidayDateLabel)

        holidayDaysLeftBadge.backgroundColor = UIColor(red: 254/255, green: 243/255, blue: 199/255, alpha: 1.0)
        holidayDaysLeftBadge.layer.cornerRadius = 10
        holidayDaysLeftBadge.layer.borderWidth = 1
        holidayDaysLeftBadge.layer.borderColor = UIColor(red: 253/255, green: 230/255, blue: 138/255, alpha: 1.0).cgColor
        holidayDaysLeftBadge.translatesAutoresizingMaskIntoConstraints = false
        holidayCard.addSubview(holidayDaysLeftBadge)

        holidayDaysLeftLabel.text = "In 8 days"
        holidayDaysLeftLabel.font = .systemFont(ofSize: 12, weight: .bold)
        holidayDaysLeftLabel.textColor = UIColor(red: 217/255, green: 119/255, blue: 6/255, alpha: 1.0)
        holidayDaysLeftLabel.translatesAutoresizingMaskIntoConstraints = false
        holidayDaysLeftBadge.addSubview(holidayDaysLeftLabel)

        leavesProgressWidthConstraint = leavesProgressBar.widthAnchor.constraint(equalTo: leavesProgressTrack.widthAnchor, multiplier: 0.70)
        leavesProgressWidthConstraint?.isActive = true

        NSLayoutConstraint.activate([
            leavesCard.widthAnchor.constraint(equalTo: twoColumnRow.widthAnchor),
            holidayCard.widthAnchor.constraint(equalTo: twoColumnRow.widthAnchor),

            // Leaves Card Constraints (Full width)
            leavesTitleLabel.topAnchor.constraint(equalTo: leavesCard.topAnchor, constant: 16),
            leavesTitleLabel.leadingAnchor.constraint(equalTo: leavesCard.leadingAnchor, constant: 16),

            leavesBadge.topAnchor.constraint(equalTo: leavesCard.topAnchor, constant: 14),
            leavesBadge.trailingAnchor.constraint(equalTo: leavesCard.trailingAnchor, constant: -16),
            leavesBadge.widthAnchor.constraint(equalToConstant: 32),
            leavesBadge.heightAnchor.constraint(equalToConstant: 32),

            leavesBadgeIcon.centerXAnchor.constraint(equalTo: leavesBadge.centerXAnchor),
            leavesBadgeIcon.centerYAnchor.constraint(equalTo: leavesBadge.centerYAnchor),

            leavesCasualLabel.topAnchor.constraint(equalTo: leavesTitleLabel.bottomAnchor, constant: 14),
            leavesCasualLabel.leadingAnchor.constraint(equalTo: leavesCard.leadingAnchor, constant: 16),

            leavesSickLabel.centerYAnchor.constraint(equalTo: leavesCasualLabel.centerYAnchor),
            leavesSickLabel.trailingAnchor.constraint(equalTo: leavesCard.trailingAnchor, constant: -16),
            leavesSickLabel.leadingAnchor.constraint(greaterThanOrEqualTo: leavesCasualLabel.trailingAnchor, constant: 12),

            leavesProgressTrack.topAnchor.constraint(equalTo: leavesCasualLabel.bottomAnchor, constant: 12),
            leavesProgressTrack.leadingAnchor.constraint(equalTo: leavesCard.leadingAnchor, constant: 16),
            leavesProgressTrack.trailingAnchor.constraint(equalTo: leavesCard.trailingAnchor, constant: -16),
            leavesProgressTrack.heightAnchor.constraint(equalToConstant: 5),
            leavesProgressTrack.bottomAnchor.constraint(equalTo: leavesCard.bottomAnchor, constant: -16),

            leavesProgressBar.topAnchor.constraint(equalTo: leavesProgressTrack.topAnchor),
            leavesProgressBar.bottomAnchor.constraint(equalTo: leavesProgressTrack.bottomAnchor),
            leavesProgressBar.leadingAnchor.constraint(equalTo: leavesProgressTrack.leadingAnchor),

            // Holiday Card Constraints (Full width)
            holidayTitleLabel.topAnchor.constraint(equalTo: holidayCard.topAnchor, constant: 16),
            holidayTitleLabel.leadingAnchor.constraint(equalTo: holidayCard.leadingAnchor, constant: 16),

            holidayDotsStack.centerYAnchor.constraint(equalTo: holidayTitleLabel.centerYAnchor),
            holidayDotsStack.trailingAnchor.constraint(equalTo: holidayCard.trailingAnchor, constant: -16),

            holidayNameLabel.topAnchor.constraint(equalTo: holidayTitleLabel.bottomAnchor, constant: 14),
            holidayNameLabel.leadingAnchor.constraint(equalTo: holidayCard.leadingAnchor, constant: 16),
            holidayNameLabel.trailingAnchor.constraint(lessThanOrEqualTo: holidayDaysLeftBadge.leadingAnchor, constant: -12),

            holidayDateLabel.topAnchor.constraint(equalTo: holidayNameLabel.bottomAnchor, constant: 4),
            holidayDateLabel.leadingAnchor.constraint(equalTo: holidayCard.leadingAnchor, constant: 16),
            holidayDateLabel.trailingAnchor.constraint(lessThanOrEqualTo: holidayDaysLeftBadge.leadingAnchor, constant: -12),
            holidayDateLabel.bottomAnchor.constraint(equalTo: holidayCard.bottomAnchor, constant: -16),

            holidayDaysLeftBadge.centerYAnchor.constraint(equalTo: holidayNameLabel.centerYAnchor),
            holidayDaysLeftBadge.trailingAnchor.constraint(equalTo: holidayCard.trailingAnchor, constant: -16),

            holidayDaysLeftLabel.topAnchor.constraint(equalTo: holidayDaysLeftBadge.topAnchor, constant: 4),
            holidayDaysLeftLabel.bottomAnchor.constraint(equalTo: holidayDaysLeftBadge.bottomAnchor, constant: -4),
            holidayDaysLeftLabel.leadingAnchor.constraint(equalTo: holidayDaysLeftBadge.leadingAnchor, constant: 10),
            holidayDaysLeftLabel.trailingAnchor.constraint(equalTo: holidayDaysLeftBadge.trailingAnchor, constant: -10)
        ])
    }

    // MARK: - 4. Team Presence Card
    private func setupTeamPresenceCard() {
        teamPresenceCard.backgroundColor = .white
        teamPresenceCard.layer.cornerRadius = 20
        teamPresenceCard.layer.borderWidth = 1
        teamPresenceCard.layer.borderColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0).cgColor
        teamPresenceCard.layer.shadowColor = UIColor.black.cgColor
        teamPresenceCard.layer.shadowOpacity = 0.03
        teamPresenceCard.layer.shadowOffset = CGSize(width: 0, height: 2)
        teamPresenceCard.layer.shadowRadius = 8
        teamPresenceCard.translatesAutoresizingMaskIntoConstraints = false
        employeeStackView.addArrangedSubview(teamPresenceCard)

        let grpConfig = UIImage.SymbolConfiguration(pointSize: 18, weight: .semibold)
        teamPresenceIcon.image = UIImage(systemName: "person.2.fill", withConfiguration: grpConfig) ?? UIImage(systemName: "person.3.fill", withConfiguration: grpConfig)
        teamPresenceIcon.tintColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        teamPresenceIcon.translatesAutoresizingMaskIntoConstraints = false
        teamPresenceCard.addSubview(teamPresenceIcon)

        teamPresenceTitle.text = "Team Presence"
        teamPresenceTitle.font = .systemFont(ofSize: 16, weight: .bold)
        teamPresenceTitle.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        teamPresenceTitle.translatesAutoresizingMaskIntoConstraints = false
        teamPresenceCard.addSubview(teamPresenceTitle)

        teamActiveCountLabel.text = "0 Active"
        teamActiveCountLabel.font = .systemFont(ofSize: 13, weight: .semibold)
        teamActiveCountLabel.textColor = UIColor(red: 30/255, green: 41/255, blue: 59/255, alpha: 1.0)
        teamActiveCountLabel.translatesAutoresizingMaskIntoConstraints = false
        teamPresenceCard.addSubview(teamActiveCountLabel)

        // Dynamic Avatars Container
        avatarsContainer.translatesAutoresizingMaskIntoConstraints = false
        teamPresenceCard.addSubview(avatarsContainer)

        updateTeamPresenceUI(members: [])

        // View Roster Button
        viewRosterButton.setTitle("View Roster", for: .normal)
        viewRosterButton.setTitleColor(UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0), for: .normal)
        viewRosterButton.titleLabel?.font = .systemFont(ofSize: 13, weight: .bold)
        viewRosterButton.translatesAutoresizingMaskIntoConstraints = false
        viewRosterButton.addTarget(self, action: #selector(handleViewRoster), for: .touchUpInside)
        teamPresenceCard.addSubview(viewRosterButton)

        NSLayoutConstraint.activate([
            teamPresenceIcon.leadingAnchor.constraint(equalTo: teamPresenceCard.leadingAnchor, constant: 16),
            teamPresenceIcon.topAnchor.constraint(equalTo: teamPresenceCard.topAnchor, constant: 16),
            teamPresenceIcon.widthAnchor.constraint(equalToConstant: 20),
            teamPresenceIcon.heightAnchor.constraint(equalToConstant: 20),

            teamPresenceTitle.leadingAnchor.constraint(equalTo: teamPresenceIcon.trailingAnchor, constant: 8),
            teamPresenceTitle.centerYAnchor.constraint(equalTo: teamPresenceIcon.centerYAnchor),

            teamActiveCountLabel.trailingAnchor.constraint(equalTo: teamPresenceCard.trailingAnchor, constant: -16),
            teamActiveCountLabel.centerYAnchor.constraint(equalTo: teamPresenceTitle.centerYAnchor),

            avatarsContainer.topAnchor.constraint(equalTo: teamPresenceTitle.bottomAnchor, constant: 16),
            avatarsContainer.leadingAnchor.constraint(equalTo: teamPresenceCard.leadingAnchor, constant: 16),
            avatarsContainer.heightAnchor.constraint(equalToConstant: 32),
            avatarsContainer.bottomAnchor.constraint(equalTo: teamPresenceCard.bottomAnchor, constant: -16),

            viewRosterButton.trailingAnchor.constraint(equalTo: teamPresenceCard.trailingAnchor, constant: -16),
            viewRosterButton.centerYAnchor.constraint(equalTo: avatarsContainer.centerYAnchor)
        ])
    }

    // MARK: - 5. Tasks Card
    private func setupTasksCard() {
        tasksCard.backgroundColor = UIColor(red: 241/255, green: 245/255, blue: 253/255, alpha: 1.0)
        tasksCard.layer.cornerRadius = 20
        tasksCard.layer.borderWidth = 1
        tasksCard.layer.borderColor = UIColor(red: 224/255, green: 231/255, blue: 255/255, alpha: 1.0).cgColor
        tasksCard.translatesAutoresizingMaskIntoConstraints = false
        employeeStackView.addArrangedSubview(tasksCard)

        taskIconContainer.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        taskIconContainer.layer.cornerRadius = 20
        taskIconContainer.translatesAutoresizingMaskIntoConstraints = false
        tasksCard.addSubview(taskIconContainer)

        let chkConfig = UIImage.SymbolConfiguration(pointSize: 18, weight: .bold)
        taskIconView.image = UIImage(systemName: "checklist", withConfiguration: chkConfig) ?? UIImage(systemName: "checkmark.square", withConfiguration: chkConfig)
        taskIconView.tintColor = .white
        taskIconView.contentMode = .scaleAspectFit
        taskIconView.translatesAutoresizingMaskIntoConstraints = false
        taskIconContainer.addSubview(taskIconView)

        let taskTextStack = UIStackView()
        taskTextStack.axis = .vertical
        taskTextStack.spacing = 2
        taskTextStack.translatesAutoresizingMaskIntoConstraints = false
        tasksCard.addSubview(taskTextStack)

        taskTitleLabel.text = "0 Tasks due today"
        taskTitleLabel.font = .systemFont(ofSize: 15, weight: .bold)
        taskTitleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        taskTextStack.addArrangedSubview(taskTitleLabel)

        taskSubtitleLabel.text = "All caught up! No pending tasks for today."
        taskSubtitleLabel.font = .systemFont(ofSize: 12, weight: .regular)
        taskSubtitleLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        taskTextStack.addArrangedSubview(taskSubtitleLabel)

        // Round Right Arrow Button
        taskArrowButton.backgroundColor = UIColor(red: 224/255, green: 231/255, blue: 255/255, alpha: 1.0)
        taskArrowButton.layer.cornerRadius = 18
        let arrowConfig = UIImage.SymbolConfiguration(pointSize: 14, weight: .bold)
        taskArrowButton.setImage(UIImage(systemName: "arrow.right", withConfiguration: arrowConfig), for: .normal)
        taskArrowButton.tintColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        taskArrowButton.translatesAutoresizingMaskIntoConstraints = false
        taskArrowButton.addTarget(self, action: #selector(handleTasksAction), for: .touchUpInside)
        tasksCard.addSubview(taskArrowButton)

        NSLayoutConstraint.activate([
            taskIconContainer.leadingAnchor.constraint(equalTo: tasksCard.leadingAnchor, constant: 14),
            taskIconContainer.centerYAnchor.constraint(equalTo: tasksCard.centerYAnchor),
            taskIconContainer.widthAnchor.constraint(equalToConstant: 40),
            taskIconContainer.heightAnchor.constraint(equalToConstant: 40),

            taskIconView.centerXAnchor.constraint(equalTo: taskIconContainer.centerXAnchor),
            taskIconView.centerYAnchor.constraint(equalTo: taskIconContainer.centerYAnchor),

            taskTextStack.leadingAnchor.constraint(equalTo: taskIconContainer.trailingAnchor, constant: 12),
            taskTextStack.trailingAnchor.constraint(equalTo: taskArrowButton.leadingAnchor, constant: -10),
            taskTextStack.topAnchor.constraint(equalTo: tasksCard.topAnchor, constant: 16),
            taskTextStack.bottomAnchor.constraint(equalTo: tasksCard.bottomAnchor, constant: -16),

            taskArrowButton.trailingAnchor.constraint(equalTo: tasksCard.trailingAnchor, constant: -14),
            taskArrowButton.centerYAnchor.constraint(equalTo: tasksCard.centerYAnchor),
            taskArrowButton.widthAnchor.constraint(equalToConstant: 36),
            taskArrowButton.heightAnchor.constraint(equalToConstant: 36)
        ])
    }

    // MARK: - Attendance Activity Heatmap (Real-time On-Time Green / Late Yellow / Blank No Record)
    private struct RealAttendanceRecord {
        let dateKey: String // yyyy-MM-dd
        let inDate: Date
        let outDate: Date?
        let isLate: Bool
        let clockInFormatted: String
        let clockOutFormatted: String
    }
    private var attendanceHistoryMap: [String: RealAttendanceRecord] = [:]

    private struct HeatmapDayData {
        let dayNumber: Int
        var hasRecord: Bool
        var isLate: Bool // false = On Time (Green), true = Late (Yellow)
        var isToday: Bool
        var isFuture: Bool
        var isWeekend: Bool
        let formattedDate: String
        var fullDate: Date? = nil
        var shiftSummary: String = ""
        var clockInTime: String = "--:--"
        var clockOutTime: String = "--:--"
    }

    // Heatmap Real Palette: Green = On Time, Yellow = Late, Blank = No Record
    private let ghOnTimeColor = UIColor(red: 34/255, green: 197/255, blue: 94/255, alpha: 1.0)   // #22C55E
    private let ghOnTimeBorder = UIColor(red: 22/255, green: 163/255, blue: 74/255, alpha: 1.0)  // #16A34A
    private let ghLateColor = UIColor(red: 234/255, green: 179/255, blue: 8/255, alpha: 1.0)     // #EAB308
    private let ghLateBorder = UIColor(red: 202/255, green: 138/255, blue: 4/255, alpha: 1.0)   // #CA8A04
    private let ghBlankColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0)  // #F1F5F9
    private let ghBlankBorder = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0) // #E2E8F0

    private func syncTodayAttendanceRecord() {
        if isCheckedIn, let startDate = checkInDate {
            let keyFmt = DateFormatter()
            keyFmt.dateFormat = "yyyy-MM-dd"
            keyFmt.locale = Locale(identifier: "en_US_POSIX")
            let todayKey = keyFmt.string(from: startDate)

            let timeFmt = DateFormatter()
            timeFmt.locale = Locale(identifier: "en_US_POSIX")
            timeFmt.dateFormat = "hh:mm a"
            let clockInStr = timeFmt.string(from: startDate)

            let cal = Calendar.current
            let h = cal.component(.hour, from: startDate)
            let m = cal.component(.minute, from: startDate)
            let isLate = (h > 9 || (h == 9 && m > 0))

            let rec = RealAttendanceRecord(
                dateKey: todayKey,
                inDate: startDate,
                outDate: nil,
                isLate: isLate,
                clockInFormatted: clockInStr,
                clockOutFormatted: "In Progress"
            )
            attendanceHistoryMap[todayKey] = rec
        }
    }

    private func loadRealAttendanceHistoryForHeatmap() {
        AuthService.shared.getMyAttendanceHistory { [weak self] result in
            DispatchQueue.main.async {
                guard let self = self else { return }
                switch result {
                case .success(let records):
                    self.attendanceHistoryMap.removeAll()
                    let apiFmt = ISO8601DateFormatter()
                    let isoFallback = ISO8601DateFormatter()
                    isoFallback.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
                    let keyFmt = DateFormatter()
                    keyFmt.dateFormat = "yyyy-MM-dd"
                    keyFmt.locale = Locale(identifier: "en_US_POSIX")
                    let timeFmt = DateFormatter()
                    timeFmt.locale = Locale(identifier: "en_US_POSIX")
                    timeFmt.dateFormat = "hh:mm a"

                    let cal = Calendar.current

                    for record in records {
                        let clockInRaw = (record["clockIn"] as? String) ?? (record["checkInTime"] as? String)
                        guard let clockInRaw = clockInRaw, !clockInRaw.isEmpty, clockInRaw.lowercased() != "null",
                              let inDate = apiFmt.date(from: clockInRaw) ?? isoFallback.date(from: clockInRaw) else { continue }
                        let dateKey = keyFmt.string(from: inDate)
                        let inFormatted = timeFmt.string(from: inDate)

                        var outDate: Date? = nil
                        var outFormatted = "In Progress"
                        let clockOutRaw = (record["clockOut"] as? String) ?? (record["checkOutTime"] as? String)
                        if let clockOutRaw = clockOutRaw, !clockOutRaw.isEmpty, clockOutRaw.lowercased() != "null",
                           let parsedOut = apiFmt.date(from: clockOutRaw) ?? isoFallback.date(from: clockOutRaw) {
                            outDate = parsedOut
                            outFormatted = timeFmt.string(from: parsedOut)
                        }

                        let h = cal.component(.hour, from: inDate)
                        let m = cal.component(.minute, from: inDate)
                        let isLate = (h > 9 || (h == 9 && m > 0))

                        let item = RealAttendanceRecord(
                            dateKey: dateKey,
                            inDate: inDate,
                            outDate: outDate,
                            isLate: isLate,
                            clockInFormatted: inFormatted,
                            clockOutFormatted: outFormatted
                        )
                        self.attendanceHistoryMap[dateKey] = item
                    }
                case .failure:
                    break
                }

                self.syncTodayAttendanceRecord()
                if self.heatmapModeSegmented.selectedSegmentIndex == 1 {
                    self.renderYearlyHeatmap()
                } else {
                    self.renderMonthlyHeatmap()
                }
            }
        }
    }

    private func setupMonthlyHeatmapCard() {
        monthlyHeatmapCard.backgroundColor = .white
        monthlyHeatmapCard.layer.cornerRadius = 20
        monthlyHeatmapCard.layer.borderWidth = 1
        monthlyHeatmapCard.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        monthlyHeatmapCard.translatesAutoresizingMaskIntoConstraints = false
        employeeStackView.addArrangedSubview(monthlyHeatmapCard)

        let paddingStack = UIStackView()
        paddingStack.axis = .vertical
        paddingStack.spacing = 14
        paddingStack.translatesAutoresizingMaskIntoConstraints = false
        monthlyHeatmapCard.addSubview(paddingStack)

        // Top Row: Title & View Mode Segmented Control (Month / Full Year)
        let topRow = UIStackView()
        topRow.axis = .horizontal
        topRow.distribution = .equalSpacing
        topRow.alignment = .center

        let titleStack = UIStackView()
        titleStack.axis = .vertical
        titleStack.spacing = 2

        let titleLbl = UILabel()
        titleLbl.text = "Attendance Heatmap"
        titleLbl.font = .systemFont(ofSize: 17, weight: .bold)
        titleLbl.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        titleStack.addArrangedSubview(titleLbl)

        let subLbl = UILabel()
        subLbl.text = "Daily activity & shift hours"
        subLbl.font = .systemFont(ofSize: 12, weight: .regular)
        subLbl.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        titleStack.addArrangedSubview(subLbl)
        topRow.addArrangedSubview(titleStack)

        // Mode Switcher: Month vs Full Year
        heatmapModeSegmented.selectedSegmentIndex = 0
        heatmapModeSegmented.setTitleTextAttributes([
            .font: UIFont.systemFont(ofSize: 11, weight: .bold),
            .foregroundColor: UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        ], for: .selected)
        heatmapModeSegmented.setTitleTextAttributes([
            .font: UIFont.systemFont(ofSize: 11, weight: .medium),
            .foregroundColor: UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        ], for: .normal)
        heatmapModeSegmented.addTarget(self, action: #selector(didChangeHeatmapMode(_:)), for: .valueChanged)
        topRow.addArrangedSubview(heatmapModeSegmented)

        paddingStack.addArrangedSubview(topRow)

        // --- 1. MONTH VIEW CONTAINER ---
        monthViewContainer.translatesAutoresizingMaskIntoConstraints = false
        let monthStack = UIStackView()
        monthStack.axis = .vertical
        monthStack.spacing = 10
        monthStack.translatesAutoresizingMaskIntoConstraints = false
        monthViewContainer.addSubview(monthStack)
        NSLayoutConstraint.activate([
            monthStack.topAnchor.constraint(equalTo: monthViewContainer.topAnchor),
            monthStack.leadingAnchor.constraint(equalTo: monthViewContainer.leadingAnchor),
            monthStack.trailingAnchor.constraint(equalTo: monthViewContainer.trailingAnchor),
            monthStack.bottomAnchor.constraint(equalTo: monthViewContainer.bottomAnchor)
        ])

        // Month Navigator Row: Month label + Prev / Next buttons
        heatmapMonthSwitcherStack.axis = .horizontal
        heatmapMonthSwitcherStack.distribution = .equalSpacing
        heatmapMonthSwitcherStack.alignment = .center

        let prevBtn = UIButton(type: .system)
        let chvCfg = UIImage.SymbolConfiguration(pointSize: 12, weight: .bold)
        prevBtn.setImage(UIImage(systemName: "chevron.left", withConfiguration: chvCfg), for: .normal)
        prevBtn.tintColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        prevBtn.backgroundColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0)
        prevBtn.layer.cornerRadius = 14
        prevBtn.widthAnchor.constraint(equalToConstant: 28).isActive = true
        prevBtn.heightAnchor.constraint(equalToConstant: 28).isActive = true
        prevBtn.addTarget(self, action: #selector(didTapHeatmapPrevMonth), for: .touchUpInside)

        let nextBtn = UIButton(type: .system)
        nextBtn.setImage(UIImage(systemName: "chevron.right", withConfiguration: chvCfg), for: .normal)
        nextBtn.tintColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        nextBtn.backgroundColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0)
        nextBtn.layer.cornerRadius = 14
        nextBtn.widthAnchor.constraint(equalToConstant: 28).isActive = true
        nextBtn.heightAnchor.constraint(equalToConstant: 28).isActive = true
        nextBtn.addTarget(self, action: #selector(didTapHeatmapNextMonth), for: .touchUpInside)

        heatmapMonthYearLabel.text = "October 2026"
        heatmapMonthYearLabel.font = .systemFont(ofSize: 14, weight: .bold)
        heatmapMonthYearLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)

        heatmapMonthSwitcherStack.addArrangedSubview(prevBtn)
        heatmapMonthSwitcherStack.addArrangedSubview(heatmapMonthYearLabel)
        heatmapMonthSwitcherStack.addArrangedSubview(nextBtn)
        monthStack.addArrangedSubview(heatmapMonthSwitcherStack)

        // Weekday Column Headers (M T W T F S S)
        let weekHeadersStack = UIStackView()
        weekHeadersStack.axis = .horizontal
        weekHeadersStack.distribution = .fillEqually

        let days = ["M", "T", "W", "T", "F", "S", "S"]
        for d in days {
            let lbl = UILabel()
            lbl.text = d
            lbl.textAlignment = .center
            lbl.font = .systemFont(ofSize: 11, weight: .bold)
            lbl.textColor = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 1.0)
            weekHeadersStack.addArrangedSubview(lbl)
        }
        monthStack.addArrangedSubview(weekHeadersStack)

        // Grid Stack (Dynamic rows for month)
        heatmapGridStack.axis = .vertical
        heatmapGridStack.spacing = 6
        monthStack.addArrangedSubview(heatmapGridStack)

        paddingStack.addArrangedSubview(monthViewContainer)

        // --- 2. FULL YEAR 52-WEEK GITHUB MATRIX CONTAINER ---
        yearViewScrollView.showsHorizontalScrollIndicator = false
        yearViewScrollView.isHidden = true
        yearViewScrollView.translatesAutoresizingMaskIntoConstraints = false
        yearViewScrollView.heightAnchor.constraint(equalToConstant: 142).isActive = true

        yearViewContentStack.axis = .horizontal
        yearViewContentStack.spacing = 3
        yearViewContentStack.alignment = .top
        yearViewContentStack.translatesAutoresizingMaskIntoConstraints = false
        yearViewScrollView.addSubview(yearViewContentStack)

        NSLayoutConstraint.activate([
            yearViewContentStack.topAnchor.constraint(equalTo: yearViewScrollView.contentLayoutGuide.topAnchor),
            yearViewContentStack.leadingAnchor.constraint(equalTo: yearViewScrollView.contentLayoutGuide.leadingAnchor),
            yearViewContentStack.trailingAnchor.constraint(equalTo: yearViewScrollView.contentLayoutGuide.trailingAnchor),
            yearViewContentStack.bottomAnchor.constraint(equalTo: yearViewScrollView.contentLayoutGuide.bottomAnchor),
            yearViewContentStack.heightAnchor.constraint(equalTo: yearViewScrollView.frameLayoutGuide.heightAnchor)
        ])

        paddingStack.addArrangedSubview(yearViewScrollView)

        // --- 3. INTERACTIVE DAY DETAIL BANNER ---
        heatmapDayDetailView.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
        heatmapDayDetailView.layer.cornerRadius = 12
        heatmapDayDetailView.layer.borderWidth = 1
        heatmapDayDetailView.layer.borderColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0).cgColor

        let detailStack = UIStackView()
        detailStack.axis = .vertical
        detailStack.spacing = 3
        detailStack.translatesAutoresizingMaskIntoConstraints = false
        heatmapDayDetailView.addSubview(detailStack)

        heatmapDetailDateLabel.font = .systemFont(ofSize: 13, weight: .bold)
        heatmapDetailDateLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        heatmapDetailDateLabel.text = "Saturday, October 31, 2026"
        detailStack.addArrangedSubview(heatmapDetailDateLabel)

        heatmapDetailHoursLabel.font = .systemFont(ofSize: 12, weight: .semibold)
        heatmapDetailHoursLabel.textColor = UIColor(red: 71/255, green: 85/255, blue: 105/255, alpha: 1.0)
        heatmapDetailHoursLabel.text = "Clock In: 09:12 AM  •  Clock Out: In Progress"
        detailStack.addArrangedSubview(heatmapDetailHoursLabel)

        NSLayoutConstraint.activate([
            detailStack.topAnchor.constraint(equalTo: heatmapDayDetailView.topAnchor, constant: 10),
            detailStack.leadingAnchor.constraint(equalTo: heatmapDayDetailView.leadingAnchor, constant: 12),
            detailStack.trailingAnchor.constraint(equalTo: heatmapDayDetailView.trailingAnchor, constant: -12),
            detailStack.bottomAnchor.constraint(equalTo: heatmapDayDetailView.bottomAnchor, constant: -10)
        ])
        paddingStack.addArrangedSubview(heatmapDayDetailView)

        // Divider
        let div = UIView()
        div.backgroundColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0)
        div.heightAnchor.constraint(equalToConstant: 1).isActive = true
        paddingStack.addArrangedSubview(div)

        // --- 4. LEGEND ROW ---
        let legendStack = UIStackView()
        legendStack.axis = .horizontal
        legendStack.distribution = .fill
        legendStack.spacing = 14
        legendStack.alignment = .center

        // No Record (Blank)
        let noRecStack = UIStackView()
        noRecStack.axis = .horizontal
        noRecStack.spacing = 5
        noRecStack.alignment = .center
        noRecStack.addArrangedSubview(makeHeatmapLegendSquare(color: ghBlankColor, border: ghBlankBorder))
        let noRecLabel = UILabel()
        noRecLabel.text = "No Record"
        noRecLabel.font = .systemFont(ofSize: 11, weight: .bold)
        noRecLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        noRecStack.addArrangedSubview(noRecLabel)
        legendStack.addArrangedSubview(noRecStack)

        // On Time (Green)
        let onTimeStack = UIStackView()
        onTimeStack.axis = .horizontal
        onTimeStack.spacing = 5
        onTimeStack.alignment = .center
        onTimeStack.addArrangedSubview(makeHeatmapLegendSquare(color: ghOnTimeColor, border: ghOnTimeBorder))
        let onTimeLabel = UILabel()
        onTimeLabel.text = "On Time"
        onTimeLabel.font = .systemFont(ofSize: 11, weight: .bold)
        onTimeLabel.textColor = UIColor(red: 22/255, green: 163/255, blue: 74/255, alpha: 1.0)
        onTimeStack.addArrangedSubview(onTimeLabel)
        legendStack.addArrangedSubview(onTimeStack)

        // Late (Yellow)
        let lateStack = UIStackView()
        lateStack.axis = .horizontal
        lateStack.spacing = 5
        lateStack.alignment = .center
        lateStack.addArrangedSubview(makeHeatmapLegendSquare(color: ghLateColor, border: ghLateBorder))
        let lateLabel = UILabel()
        lateLabel.text = "Late"
        lateLabel.font = .systemFont(ofSize: 11, weight: .bold)
        lateLabel.textColor = UIColor(red: 202/255, green: 138/255, blue: 4/255, alpha: 1.0)
        lateStack.addArrangedSubview(lateLabel)
        legendStack.addArrangedSubview(lateStack)

        paddingStack.addArrangedSubview(legendStack)

        NSLayoutConstraint.activate([
            paddingStack.topAnchor.constraint(equalTo: monthlyHeatmapCard.topAnchor, constant: 18),
            paddingStack.leadingAnchor.constraint(equalTo: monthlyHeatmapCard.leadingAnchor, constant: 18),
            paddingStack.trailingAnchor.constraint(equalTo: monthlyHeatmapCard.trailingAnchor, constant: -18),
            paddingStack.bottomAnchor.constraint(equalTo: monthlyHeatmapCard.bottomAnchor, constant: -18)
        ])
    }

    private func makeHeatmapLegendSquare(color: UIColor, border: UIColor) -> UIView {
        let box = UIView()
        box.backgroundColor = color
        box.layer.cornerRadius = 2.5
        box.layer.borderWidth = 0.5
        box.layer.borderColor = border.cgColor
        box.widthAnchor.constraint(equalToConstant: 11).isActive = true
        box.heightAnchor.constraint(equalToConstant: 11).isActive = true
        return box
    }

    private func makeHeatmapTextTag(color: UIColor, text: String) -> UIView {
        let stack = UIStackView()
        stack.axis = .horizontal
        stack.spacing = 4
        stack.alignment = .center

        let dot = UIView()
        dot.backgroundColor = color
        dot.layer.cornerRadius = 2.5
        dot.widthAnchor.constraint(equalToConstant: 9).isActive = true
        dot.heightAnchor.constraint(equalToConstant: 9).isActive = true
        stack.addArrangedSubview(dot)

        let lbl = UILabel()
        lbl.text = text
        lbl.font = .systemFont(ofSize: 10, weight: .bold)
        lbl.textColor = UIColor(red: 71/255, green: 85/255, blue: 105/255, alpha: 1.0)
        stack.addArrangedSubview(lbl)
        return stack
    }

    @objc private func didChangeHeatmapMode(_ sender: UISegmentedControl) {
        if sender.selectedSegmentIndex == 0 {
            // Month View
            monthViewContainer.isHidden = false
            yearViewScrollView.isHidden = true
            renderMonthlyHeatmap()
        } else {
            // Full Year View (52 Weeks GitHub Matrix)
            monthViewContainer.isHidden = true
            yearViewScrollView.isHidden = false
            renderYearlyHeatmap()
        }
    }

    @objc private func didTapHeatmapPrevMonth() {
        heatmapCurrentDate = Calendar.current.date(byAdding: .month, value: -1, to: heatmapCurrentDate) ?? Date()
        renderMonthlyHeatmap()
    }

    @objc private func didTapHeatmapNextMonth() {
        heatmapCurrentDate = Calendar.current.date(byAdding: .month, value: 1, to: heatmapCurrentDate) ?? Date()
        renderMonthlyHeatmap()
    }

    // --- RENDER 1: MONTHLY GRID (Real-time Green On-Time / Yellow Late / Blank No Record) ---
    private func renderMonthlyHeatmap() {
        heatmapGridStack.arrangedSubviews.forEach { $0.removeFromSuperview() }
        todayHeatmapBoxView = nil
        todayHeatmapBoxLabel = nil
        currentHeatmapDays.removeAll()

        let df = DateFormatter()
        df.dateFormat = "MMMM yyyy"
        heatmapMonthYearLabel.text = df.string(from: heatmapCurrentDate)

        let cal = Calendar.current
        let range = cal.range(of: .day, in: .month, for: heatmapCurrentDate) ?? 1..<31
        let daysInMonth = range.count

        var comps = cal.dateComponents([.year, .month], from: heatmapCurrentDate)
        comps.day = 1
        guard let firstDayDate = cal.date(from: comps) else { return }

        let weekday = cal.component(.weekday, from: firstDayDate) // 1 = Sunday, 2 = Monday ...
        let offset = (weekday + 5) % 7 // Monday = 0, ..., Sunday = 6

        let isCurrentMonth = cal.isDate(heatmapCurrentDate, equalTo: Date(), toGranularity: .month)
        let todayDay = isCurrentMonth ? cal.component(.day, from: Date()) : -1

        var todayDayData: HeatmapDayData?

        let keyFmt = DateFormatter()
        keyFmt.dateFormat = "yyyy-MM-dd"
        keyFmt.locale = Locale(identifier: "en_US_POSIX")

        let dateFmt = DateFormatter()
        dateFmt.dateFormat = "EEEE, MMMM d, yyyy"

        for d in 1...daysInMonth {
            var dayComps = comps
            dayComps.day = d
            let date = cal.date(from: dayComps) ?? Date()
            let dow = cal.component(.weekday, from: date)
            let isWeekend = (dow == 1) // Sunday only is weekly off
            let isToday = (isCurrentMonth && d == todayDay)
            let formattedDate = dateFmt.string(from: date)

            let dateKey = keyFmt.string(from: date)
            let isFuture = isCurrentMonth && d > todayDay

            var hasRecord = false
            var isLate = false
            var inTime = "--:--"
            var outTime = "--:--"
            var shiftDesc = ""

            if let record = attendanceHistoryMap[dateKey] {
                hasRecord = true
                isLate = record.isLate
                inTime = record.clockInFormatted
                outTime = record.clockOutFormatted
                shiftDesc = "Clock In: \(inTime)  •  Shift End: \(outTime)"
            } else if isToday && isCheckedIn, let startDate = checkInDate {
                hasRecord = true
                let tf = DateFormatter()
                tf.locale = Locale(identifier: "en_US_POSIX")
                tf.dateFormat = "hh:mm a"
                inTime = tf.string(from: startDate)
                outTime = "In Progress"

                let h = cal.component(.hour, from: startDate)
                let m = cal.component(.minute, from: startDate)
                isLate = (h > 9 || (h == 9 && m > 0))
                shiftDesc = "Clock In: \(inTime)  •  Shift End: In Progress"
            } else {
                hasRecord = false
                if isWeekend {
                    inTime = "Weekly Off"
                    outTime = "Weekly Off"
                    shiftDesc = "Weekly Off  •  No punch recorded"
                } else if isFuture {
                    inTime = "09:00 AM"
                    outTime = "06:00 PM"
                    shiftDesc = "Upcoming  •  Shift: 09:00 AM – 06:00 PM"
                } else {
                    inTime = "No Record"
                    outTime = "No Record"
                    shiftDesc = "No punch record for this date"
                }
            }

            let data = HeatmapDayData(
                dayNumber: d,
                hasRecord: hasRecord,
                isLate: isLate,
                isToday: isToday,
                isFuture: isFuture,
                isWeekend: isWeekend,
                formattedDate: formattedDate,
                fullDate: date,
                shiftSummary: shiftDesc,
                clockInTime: inTime,
                clockOutTime: outTime
            )
            currentHeatmapDays.append(data)
            if isToday {
                todayDayData = data
            }
        }

        // Build 7-column rows
        var currentRow = createHeatmapRow()
        heatmapGridStack.addArrangedSubview(currentRow)

        for _ in 0..<offset {
            let empty = UIView()
            currentRow.addArrangedSubview(empty)
        }

        var colIndex = offset
        for data in currentHeatmapDays {
            if colIndex == 7 {
                currentRow = createHeatmapRow()
                heatmapGridStack.addArrangedSubview(currentRow)
                colIndex = 0
            }

            let cell = UIView()
            cell.tag = data.dayNumber
            cell.layer.cornerRadius = 6
            cell.heightAnchor.constraint(equalToConstant: 36).isActive = true
            cell.isUserInteractionEnabled = true
            cell.addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(didTapHeatmapCell(_:))))

            let lbl = UILabel()
            lbl.text = "\(data.dayNumber)"
            lbl.font = .systemFont(ofSize: 11, weight: .bold)
            lbl.textAlignment = .center
            lbl.translatesAutoresizingMaskIntoConstraints = false
            cell.addSubview(lbl)
            NSLayoutConstraint.activate([
                lbl.centerXAnchor.constraint(equalTo: cell.centerXAnchor),
                lbl.centerYAnchor.constraint(equalTo: cell.centerYAnchor)
            ])

            if data.hasRecord {
                if data.isLate {
                    cell.backgroundColor = ghLateColor // Yellow #EAB308
                    cell.layer.borderWidth = 0.5
                    cell.layer.borderColor = ghLateBorder.cgColor
                    lbl.textColor = UIColor(red: 120/255, green: 53/255, blue: 15/255, alpha: 1.0)
                } else {
                    cell.backgroundColor = ghOnTimeColor // Green #22C55E
                    cell.layer.borderWidth = 0.5
                    cell.layer.borderColor = ghOnTimeBorder.cgColor
                    lbl.textColor = .white
                }
            } else {
                cell.backgroundColor = ghBlankColor // Blank #F1F5F9
                cell.layer.borderWidth = 0.5
                cell.layer.borderColor = ghBlankBorder.cgColor
                lbl.textColor = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 1.0)
            }

            if data.isToday {
                todayHeatmapBoxView = cell
                todayHeatmapBoxLabel = lbl
                cell.layer.borderWidth = 2.5
                cell.layer.borderColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0).cgColor
            }

            currentRow.addArrangedSubview(cell)
            colIndex += 1
        }

        if colIndex > 0 && colIndex < 7 {
            for _ in colIndex..<7 {
                let empty = UIView()
                currentRow.addArrangedSubview(empty)
            }
        }

        if let todayData = todayDayData {
            updateHeatmapDayDetail(data: todayData)
        } else if let first = currentHeatmapDays.first {
            updateHeatmapDayDetail(data: first)
        }
    }

    // --- RENDER 2: FULL YEAR 52-WEEK MATRIX (Real-time On-Time Green / Late Yellow / Blank No Record) ---
    private func renderYearlyHeatmap() {
        yearViewContentStack.arrangedSubviews.forEach { $0.removeFromSuperview() }
        allYearDaysData.removeAll()

        let cal = Calendar.current
        let today = Date()

        // 52 Weeks back from today (approx 364 days)
        guard let oneYearAgo = cal.date(byAdding: .day, value: -364, to: today) else { return }

        // Weekday column on the left (Mon, Wed, Fri)
        let leftDayLabelsStack = UIStackView()
        leftDayLabelsStack.axis = .vertical
        leftDayLabelsStack.spacing = 3
        leftDayLabelsStack.alignment = .leading
        leftDayLabelsStack.translatesAutoresizingMaskIntoConstraints = false
        leftDayLabelsStack.widthAnchor.constraint(equalToConstant: 26).isActive = true

        // Spacer matching month label height
        let topSpacer = UIView()
        topSpacer.heightAnchor.constraint(equalToConstant: 16).isActive = true
        leftDayLabelsStack.addArrangedSubview(topSpacer)

        let dayNames = ["M", "T", "W", "T", "F", "S", "S"]
        for (i, name) in dayNames.enumerated() {
            let lbl = UILabel()
            lbl.text = (i == 0 || i == 2 || i == 4) ? name : ""
            lbl.font = .systemFont(ofSize: 9, weight: .bold)
            lbl.textColor = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 1.0)
            lbl.heightAnchor.constraint(equalToConstant: 13).isActive = true
            leftDayLabelsStack.addArrangedSubview(lbl)
        }
        yearViewContentStack.addArrangedSubview(leftDayLabelsStack)

        var daysData: [HeatmapDayData] = []
        var currentDate = oneYearAgo
        let dayFmt = DateFormatter()
        dayFmt.dateFormat = "EEEE, MMM d, yyyy"

        let keyFmt = DateFormatter()
        keyFmt.dateFormat = "yyyy-MM-dd"
        keyFmt.locale = Locale(identifier: "en_US_POSIX")

        for i in 0..<365 {
            let dow = cal.component(.weekday, from: currentDate)
            let isWeekend = (dow == 1) // Sunday only is weekly off
            let isToday = cal.isDateInToday(currentDate)

            let dateKey = keyFmt.string(from: currentDate)
            var hasRecord = false
            var isLate = false
            var inTime = "--:--"
            var outTime = "--:--"
            var shiftDesc = ""

            if let record = attendanceHistoryMap[dateKey] {
                hasRecord = true
                isLate = record.isLate
                inTime = record.clockInFormatted
                outTime = record.clockOutFormatted
                shiftDesc = "Clock In: \(inTime)  •  Shift End: \(outTime)"
            } else if isToday && isCheckedIn, let startDate = checkInDate {
                hasRecord = true
                let tf = DateFormatter()
                tf.locale = Locale(identifier: "en_US_POSIX")
                tf.dateFormat = "hh:mm a"
                inTime = tf.string(from: startDate)
                outTime = "In Progress"

                let h = cal.component(.hour, from: startDate)
                let m = cal.component(.minute, from: startDate)
                isLate = (h > 9 || (h == 9 && m > 0))
                shiftDesc = "Clock In: \(inTime)  •  Shift End: In Progress"
            } else {
                hasRecord = false
                if isWeekend {
                    inTime = "Weekly Off"
                    outTime = "Weekly Off"
                    shiftDesc = "Weekly Off  •  No punch recorded"
                } else if currentDate > today {
                    inTime = "09:00 AM"
                    outTime = "06:00 PM"
                    shiftDesc = "Upcoming  •  Shift: 09:00 AM – 06:00 PM"
                } else {
                    inTime = "No Record"
                    outTime = "No Record"
                    shiftDesc = "No punch record for this date"
                }
            }

            let dayData = HeatmapDayData(
                dayNumber: i,
                hasRecord: hasRecord,
                isLate: isLate,
                isToday: isToday,
                isFuture: currentDate > today,
                isWeekend: isWeekend,
                formattedDate: dayFmt.string(from: currentDate),
                fullDate: currentDate,
                shiftSummary: shiftDesc,
                clockInTime: inTime,
                clockOutTime: outTime
            )
            daysData.append(dayData)
            currentDate = cal.date(byAdding: .day, value: 1, to: currentDate) ?? currentDate
        }

        allYearDaysData = daysData

        // Build 52 vertical week columns
        let monthHeaderFmt = DateFormatter()
        monthHeaderFmt.dateFormat = "MMM"

        var lastRenderedMonth = ""

        for weekIdx in 0..<52 {
            let weekCol = UIStackView()
            weekCol.axis = .vertical
            weekCol.spacing = 3
            weekCol.alignment = .center

            // Week header: Show month name if it's the first week of a new month
            let firstDayOfWeekIdx = min(weekIdx * 7, daysData.count - 1)
            let weekFirstDate = daysData[firstDayOfWeekIdx].fullDate ?? Date()
            let monthName = monthHeaderFmt.string(from: weekFirstDate)

            let monthHeaderLbl = UILabel()
            monthHeaderLbl.font = .systemFont(ofSize: 9, weight: .bold)
            monthHeaderLbl.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
            monthHeaderLbl.heightAnchor.constraint(equalToConstant: 16).isActive = true

            if monthName != lastRenderedMonth {
                monthHeaderLbl.text = monthName
                lastRenderedMonth = monthName
            } else {
                monthHeaderLbl.text = ""
            }
            weekCol.addArrangedSubview(monthHeaderLbl)

            // 7 days per week
            for dayInWeek in 0..<7 {
                let dataIdx = weekIdx * 7 + dayInWeek
                if dataIdx < daysData.count {
                    let d = daysData[dataIdx]
                    let cell = UIView()
                    cell.tag = 1000 + dataIdx
                    cell.layer.cornerRadius = 2.5
                    cell.layer.borderWidth = 0.5
                    cell.translatesAutoresizingMaskIntoConstraints = false
                    cell.widthAnchor.constraint(equalToConstant: 13).isActive = true
                    cell.heightAnchor.constraint(equalToConstant: 13).isActive = true
                    cell.isUserInteractionEnabled = true
                    cell.addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(didTapYearHeatmapCell(_:))))

                    if d.hasRecord {
                        if d.isLate {
                            cell.backgroundColor = ghLateColor
                            cell.layer.borderColor = ghLateBorder.cgColor
                        } else {
                            cell.backgroundColor = ghOnTimeColor
                            cell.layer.borderColor = ghOnTimeBorder.cgColor
                        }
                    } else {
                        cell.backgroundColor = ghBlankColor
                        cell.layer.borderColor = ghBlankBorder.cgColor
                    }

                    if d.isToday {
                        todayYearBoxView = cell
                        cell.layer.borderWidth = 1.5
                        cell.layer.borderColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0).cgColor
                    }

                    weekCol.addArrangedSubview(cell)
                } else {
                    let empty = UIView()
                    empty.widthAnchor.constraint(equalToConstant: 13).isActive = true
                    empty.heightAnchor.constraint(equalToConstant: 13).isActive = true
                    weekCol.addArrangedSubview(empty)
                }
            }

            yearViewContentStack.addArrangedSubview(weekCol)
        }

        // Auto-scroll to latest week (right edge)
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            let maxOffsetX = max(0, self.yearViewScrollView.contentSize.width - self.yearViewScrollView.bounds.width)
            self.yearViewScrollView.setContentOffset(CGPoint(x: maxOffsetX, y: 0), animated: false)
        }

        if let last = allYearDaysData.last {
            updateHeatmapDayDetail(data: last)
        }
    }

    private func createHeatmapRow() -> UIStackView {
        let row = UIStackView()
        row.axis = .horizontal
        row.distribution = .fillEqually
        row.spacing = 6
        return row
    }

    @objc private func didTapHeatmapCell(_ gesture: UITapGestureRecognizer) {
        guard let tag = gesture.view?.tag, let data = currentHeatmapDays.first(where: { $0.dayNumber == tag }) else { return }
        updateHeatmapDayDetail(data: data)
    }

    @objc private func didTapYearHeatmapCell(_ gesture: UITapGestureRecognizer) {
        guard let tag = gesture.view?.tag else { return }
        let idx = tag - 1000
        guard idx >= 0 && idx < allYearDaysData.count else { return }
        let data = allYearDaysData[idx]
        updateHeatmapDayDetail(data: data)
    }

    private func updateHeatmapDayDetail(data: HeatmapDayData) {
        selectedHeatmapDay = data.dayNumber
        heatmapDetailDateLabel.text = data.formattedDate

        if data.hasRecord {
            let badge = data.isLate ? " • Late (Yellow)" : " • On Time (Green)"
            heatmapDetailHoursLabel.text = "Clock In: \(data.clockInTime)  •  Shift End: \(data.clockOutTime)\(badge)"
        } else if data.isWeekend {
            heatmapDetailHoursLabel.text = "Weekly Off  •  No punch recorded"
        } else if data.isFuture {
            heatmapDetailHoursLabel.text = "Upcoming  •  Shift: 09:00 AM – 06:00 PM"
        } else {
            heatmapDetailHoursLabel.text = "No Record  •  Absent / Not Logged"
        }
    }

    private func updateHeatmapTodayLive(h: Int, m: Int, s: Int) {
        guard let box = todayHeatmapBoxView, let label = todayHeatmapBoxLabel else { return }
        let cal = Calendar.current
        let isCurrentMonth = cal.isDate(heatmapCurrentDate, equalTo: Date(), toGranularity: .month)
        guard isCurrentMonth else { return }

        var isLate = false
        if let startDate = checkInDate {
            let punchH = cal.component(.hour, from: startDate)
            let punchM = cal.component(.minute, from: startDate)
            isLate = (punchH > 9 || (punchH == 9 && punchM > 0))
        }

        let bg = isLate ? ghLateColor : ghOnTimeColor
        box.backgroundColor = bg
        label.textColor = isLate ? UIColor(red: 120/255, green: 53/255, blue: 15/255, alpha: 1.0) : .white

        if let yBox = todayYearBoxView {
            yBox.backgroundColor = bg
        }

        let todayDay = cal.component(.day, from: Date())
        if selectedHeatmapDay == todayDay {
            let tf = DateFormatter()
            tf.locale = Locale(identifier: "en_US_POSIX")
            tf.dateFormat = "hh:mm a"
            let inStr = (checkInDate != nil) ? tf.string(from: checkInDate!) : "09:00 AM"
            let badge = isLate ? " • Late (Yellow)" : " • On Time (Green)"
            heatmapDetailHoursLabel.text = "Clock In: \(inStr)  •  Shift: In Progress\(badge)"
        }
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
        navWidth.priority = UILayoutPriority(999)
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
            activeTabId: "home",
            scrollHandler: { [weak self] in
                self?.scrollView.setContentOffset(.zero, animated: true)
            }
        )
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

    // MARK: - Slide-up Professional Hint Popup (for short tap)
    private func setupHintPopup() {
        hintPopupCard.backgroundColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 0.96)
        hintPopupCard.layer.cornerRadius = 18
        hintPopupCard.layer.shadowColor = UIColor.black.cgColor
        hintPopupCard.layer.shadowOpacity = 0.25
        hintPopupCard.layer.shadowOffset = CGSize(width: 0, height: 6)
        hintPopupCard.layer.shadowRadius = 14
        hintPopupCard.translatesAutoresizingMaskIntoConstraints = false
        hintPopupCard.isHidden = true
        hintPopupCard.alpha = 0
        view.addSubview(hintPopupCard)

        let fpConfig = UIImage.SymbolConfiguration(pointSize: 22, weight: .semibold)
        hintIconView.image = UIImage(systemName: "touchid", withConfiguration: fpConfig)
        hintIconView.tintColor = UIColor(red: 110/255, green: 231/255, blue: 183/255, alpha: 1.0)
        hintIconView.translatesAutoresizingMaskIntoConstraints = false
        hintPopupCard.addSubview(hintIconView)

        let textStack = UIStackView()
        textStack.axis = .vertical
        textStack.spacing = 2
        textStack.translatesAutoresizingMaskIntoConstraints = false
        hintPopupCard.addSubview(textStack)

        hintTitleLabel.text = "Hold for 2 seconds to punch"
        hintTitleLabel.font = .systemFont(ofSize: 14, weight: .bold)
        hintTitleLabel.textColor = .white
        textStack.addArrangedSubview(hintTitleLabel)

        hintSubtitleLabel.text = "Keep your finger pressed on the button to activate shift punch."
        hintSubtitleLabel.font = .systemFont(ofSize: 12, weight: .regular)
        hintSubtitleLabel.textColor = UIColor(red: 203/255, green: 213/255, blue: 225/255, alpha: 1.0)
        hintSubtitleLabel.numberOfLines = 2
        textStack.addArrangedSubview(hintSubtitleLabel)

        hintPopupBottomConstraint = hintPopupCard.bottomAnchor.constraint(equalTo: view.bottomAnchor, constant: 180)

        NSLayoutConstraint.activate([
            hintPopupCard.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            hintPopupCard.widthAnchor.constraint(lessThanOrEqualToConstant: 500),
            hintPopupCard.leadingAnchor.constraint(greaterThanOrEqualTo: view.leadingAnchor, constant: 20),
            hintPopupCard.trailingAnchor.constraint(lessThanOrEqualTo: view.trailingAnchor, constant: -20),
            hintPopupBottomConstraint!,

            hintIconView.leadingAnchor.constraint(equalTo: hintPopupCard.leadingAnchor, constant: 16),
            hintIconView.centerYAnchor.constraint(equalTo: hintPopupCard.centerYAnchor),
            hintIconView.widthAnchor.constraint(equalToConstant: 28),
            hintIconView.heightAnchor.constraint(equalToConstant: 28),

            textStack.leadingAnchor.constraint(equalTo: hintIconView.trailingAnchor, constant: 12),
            textStack.trailingAnchor.constraint(equalTo: hintPopupCard.trailingAnchor, constant: -16),
            textStack.topAnchor.constraint(equalTo: hintPopupCard.topAnchor, constant: 12),
            textStack.bottomAnchor.constraint(equalTo: hintPopupCard.bottomAnchor, constant: -12)
        ])
    }

    private func showHintPopup() {
        hintDismissTimer?.invalidate()
        let impact = UIImpactFeedbackGenerator(style: .light)
        impact.impactOccurred()

        hintPopupCard.isHidden = false
        view.layoutIfNeeded()
        hintPopupBottomConstraint?.constant = -90
        UIView.animate(withDuration: 0.35, delay: 0, usingSpringWithDamping: 0.8, initialSpringVelocity: 0.5, options: .curveEaseOut) {
            self.hintPopupCard.alpha = 1.0
            self.view.layoutIfNeeded()
        }

        hintDismissTimer = Timer.scheduledTimer(withTimeInterval: 2.8, repeats: false) { [weak self] _ in
            self?.hideHintPopup()
        }
    }

    private func hideHintPopup() {
        hintDismissTimer?.invalidate()
        hintDismissTimer = nil
        hintPopupBottomConstraint?.constant = 180
        UIView.animate(withDuration: 0.25, delay: 0, options: .curveEaseIn, animations: {
            self.hintPopupCard.alpha = 0.0
            self.view.layoutIfNeeded()
        }, completion: { [weak self] _ in
            self?.hintPopupCard.isHidden = true
        })
    }

    // MARK: - 2-Second Hold Gesture Handlers
    @objc private func punchTouchDown() {
        if !isCheckedIn && !isWithinPunchInWindow() {
            hintTitleLabel.text = "Shift Starts at 09:00 AM"
            hintSubtitleLabel.text = "Clock-in opens 5 minutes before shift at 08:55 AM."
            hintIconView.tintColor = UIColor(red: 0/255, green: 87/255, blue: 255/255, alpha: 1.0)
            showHintPopup()
            let feedback = UIImpactFeedbackGenerator(style: .medium)
            feedback.prepare()
            feedback.impactOccurred()
            return
        }

        pressStartTime = Date()
        isHoldingPunch = true
        startHoldAnimation()
    }

    @objc private func punchTouchUp() {
        guard isHoldingPunch else { return }
        isHoldingPunch = false

        let elapsed = Date().timeIntervalSince(pressStartTime ?? Date())
        if elapsed < requiredHoldDuration {
            // Cancel hold animation & show professional slide-up hint
            resetHoldAnimation()
            showContextualShortTapHint()
        }
    }

    private func showContextualShortTapHint() {
        if !isCheckedIn {
            if !isWithinPunchInWindow() {
                hintTitleLabel.text = "Shift Starts at 09:00 AM"
                hintSubtitleLabel.text = "Clock-in opens 5 minutes before shift at 08:55 AM."
                hintIconView.tintColor = UIColor(red: 0/255, green: 87/255, blue: 255/255, alpha: 1.0)
            } else {
                hintTitleLabel.text = "Hold for 2 seconds to punch in"
                hintSubtitleLabel.text = "Keep your finger pressed on the button to start your shift."
                hintIconView.tintColor = UIColor(red: 0/255, green: 87/255, blue: 255/255, alpha: 1.0)
            }
        } else {
            hintTitleLabel.text = "Hold for 2 seconds to punch out"
            hintSubtitleLabel.text = "Keep your finger pressed on the button to end and finalize your shift."
            hintIconView.tintColor = UIColor(red: 22/255, green: 163/255, blue: 74/255, alpha: 1.0)
        }
        showHintPopup()
    }

    private func startHoldAnimation() {
        // Crisp white circular loading animation inside thumb button during 2s hold
        progressRingLayer.strokeColor = UIColor.white.cgColor

        // Animate circular progress ring from 0 to 1 over 2.0 seconds
        let strokeAnim = CABasicAnimation(keyPath: "strokeEnd")
        strokeAnim.fromValue = 0.0
        strokeAnim.toValue = 1.0
        strokeAnim.duration = requiredHoldDuration
        strokeAnim.timingFunction = CAMediaTimingFunction(name: .linear)
        strokeAnim.fillMode = .forwards
        strokeAnim.isRemovedOnCompletion = false
        progressRingLayer.add(strokeAnim, forKey: "ringProgress")

        // Haptic feedback pulses during the 2s hold
        let feedback = UIImpactFeedbackGenerator(style: .medium)
        feedback.prepare()
        feedback.impactOccurred()

        holdTimer?.invalidate()
        holdTimer = Timer.scheduledTimer(withTimeInterval: requiredHoldDuration, repeats: false) { [weak self] _ in
            guard let self = self, self.isHoldingPunch else { return }
            self.isHoldingPunch = false
            self.onHoldCompletedSuccess()
        }
    }

    private func resetHoldAnimation() {
        holdTimer?.invalidate()
        holdTimer = nil
        progressRingLayer.removeAllAnimations()
        progressRingLayer.strokeEnd = 0.0
    }

    private func onHoldCompletedSuccess() {
        resetHoldAnimation()
        isHoldingPunch = false

        // 1. Success Haptics
        let notify = UINotificationFeedbackGenerator()
        notify.notificationOccurred(.success)

        punchCircleButton.isEnabled = false
        if !isCheckedIn {
            accumulatedBreakDuration = 0
            currentBreakStartDate = nil
            lastBreakSessionText = nil
            breakTimerLabel.isHidden = true

            // Instant Seamless Watch Start (0ms delay)
            self.isCheckedIn = true
            let instantDate = Date()
            self.checkInDate = instantDate
            let cal = Calendar.current
            let h = cal.component(.hour, from: instantDate)
            let m = cal.component(.minute, from: instantDate)
            self.isTodayLate = (h > shiftStartHour || (h == shiftStartHour && m > shiftStartMinute))

            self.updateUIForAttendance(clockedIn: true)
            self.startTimer()
            self.postShiftNotification(isClockIn: true)
            self.updateShiftBadgeForStatus(isLate: self.isTodayLate)
            self.syncTodayAttendanceRecord()
            self.renderMonthlyHeatmap()

            AuthService.shared.clockIn { [weak self] result in
                guard let self = self else { return }
                self.punchCircleButton.isEnabled = true
                switch result {
                case .success:
                    self.loadAttendanceStats()
                    self.syncTodayAttendanceRecord()
                    self.loadRealAttendanceHistoryForHeatmap()
                case .failure(let err):
                    let errStr = err.localizedDescription.lowercased()
                    if errStr.contains("already") {
                        self.loadAttendanceStats()
                    } else {
                        let isoFormatter = ISO8601DateFormatter()
                        isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
                        let nowIso = isoFormatter.string(from: instantDate)
                        AuthService.shared.savePendingOfflinePunch(type: "IN", isoTime: nowIso)
                        self.showError("Punched In recorded offline. Saved locally and will sync when connected.")
                    }
                }
            }
        } else {
            // Punch Out when holding 2s while clocked in!
            let instantDate = Date()
            let timeFormatter = DateFormatter()
            timeFormatter.locale = Locale(identifier: "en_US_POSIX")
            timeFormatter.dateFormat = "hh:mm a"
            let timeStr = timeFormatter.string(from: instantDate)

            self.isCheckedIn = false
            self.isShiftCompletedToday = true
            self.stopTimer()
            self.updateUIForAttendance(clockedIn: false)
            self.punchStatusLabel.text = "• Clocked Out at \(timeStr)"
            self.postShiftNotification(isClockIn: false)
            self.syncTodayAttendanceRecord()
            self.renderMonthlyHeatmap()

            AuthService.shared.clockOut { [weak self] result in
                guard let self = self else { return }
                self.punchCircleButton.isEnabled = true
                switch result {
                case .success:
                    self.loadAttendanceStats()
                    self.loadRealAttendanceHistoryForHeatmap()
                case .failure:
                    let isoFormatter = ISO8601DateFormatter()
                    isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
                    let nowIso = isoFormatter.string(from: instantDate)
                    AuthService.shared.savePendingOfflinePunch(type: "OUT", isoTime: nowIso)
                    self.showError("Punched Out recorded offline. Saved locally and will sync when connected.")
                }
            }
        }
    }

    // MARK: - Real Local Mobile Notifications & Bell Badge
    private func postShiftNotification(isClockIn: Bool) {
        let timeFormatter = DateFormatter()
        timeFormatter.dateFormat = "hh:mm a"
        let nowTime = timeFormatter.string(from: Date())

        let dateFmt = DateFormatter()
        dateFmt.dateFormat = "EEEE, dd MMM yyyy"
        let nowDate = dateFmt.string(from: Date())

        let title = isClockIn ? "Shift Started Successfully" : "Shift Ended Successfully"
        let body = isClockIn
            ? "Punched In at \(nowTime) on \(nowDate). Have a productive day!"
            : "Clocked Out at \(nowTime) on \(nowDate). Great work today!"

        // 1. Send native phone notification to notification tray
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 0.2, repeats: false)
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)
        UNUserNotificationCenter.current().add(request, withCompletionHandler: nil)

        // 2. Store in local in-app notification records with exact timestamp
        AuthService.shared.recordLocalNotification(title: title, body: body, date: Date())

        // 3. Turn ON red badge dot on top-bar notification bell
        DispatchQueue.main.async {
            self.notifBadgeDot.isHidden = false
        }
    }

    private func updateNotificationBellBadge() {
        if AuthService.shared.hasUnreadLocalNotifications() {
            notifBadgeDot.isHidden = false
        } else {
            AuthService.shared.getUnreadNotifications { [weak self] result in
                guard let self = self else { return }
                switch result {
                case .success(let items):
                    self.notifBadgeDot.isHidden = items.isEmpty
                case .failure:
                    self.notifBadgeDot.isHidden = !AuthService.shared.hasUnreadLocalNotifications()
                }
            }
        }
    }

    // MARK: - Actions & Interactions

    @objc private func didTapNavTab(_ gesture: UITapGestureRecognizer) {
        guard let view = gesture.view else { return }
        switch view.tag {
        case 0:
            scrollView.setContentOffset(.zero, animated: true)
        case 1:
            let attendanceVC = AttendanceViewController()
            if let nav = navigationController {
                nav.pushViewController(attendanceVC, animated: false)
            } else {
                attendanceVC.modalPresentationStyle = .fullScreen
                attendanceVC.modalTransitionStyle = .crossDissolve
                present(attendanceVC, animated: false)
            }
        case 2:
            let leaveVC = LeaveViewController()
            leaveVC.modalPresentationStyle = .fullScreen
            present(leaveVC, animated: false)
        case 3:
            let tasksVC = TasksViewController()
            tasksVC.modalPresentationStyle = .fullScreen
            present(tasksVC, animated: false)
        case 4:
            openMoreSection()
        default:
            break
        }
    }

    @objc private func openMoreSection() {
        let moreVC = MoreViewController()
        moreVC.modalPresentationStyle = .fullScreen
        present(moreVC, animated: false)
    }

    @objc private func openSettings() {
        let settingsVC = SettingsViewController()
        settingsVC.modalPresentationStyle = .fullScreen
        present(settingsVC, animated: true)
    }

    @objc private func handleNotifications() {
        notifBadgeDot.isHidden = true
        let notifVC = NotificationsViewController()
        notifVC.modalPresentationStyle = .fullScreen
        present(notifVC, animated: true)
    }

    @objc private func handleTakeBreak() {
        let feedback = UIImpactFeedbackGenerator(style: .light)
        feedback.impactOccurred()

        if !isCheckedIn {
            hintTitleLabel.text = "Punch In Required"
            hintSubtitleLabel.text = "Please punch in before starting a break."
            hintIconView.tintColor = UIColor(red: 239/255, green: 68/255, blue: 68/255, alpha: 1.0)
            showHintPopup()
            return
        }

        if !isOnBreak && isBreakInThirtyMinLock {
            let leftMins = remainingBreakLockMinutes
            hintTitleLabel.text = "Break Policy Notice"
            hintSubtitleLabel.text = "Breaks cannot be taken during the first 30 minutes of your shift. \(leftMins) minutes left."
            hintIconView.tintColor = UIColor(red: 245/255, green: 158/255, blue: 11/255, alpha: 1.0)
            showHintPopup()
            return
        }

        isOnBreak.toggle()
        let timeFormatter = DateFormatter()
        timeFormatter.dateFormat = "hh:mm a"
        let nowTime = timeFormatter.string(from: Date())

        if isOnBreak {
            currentBreakStartDate = Date()
            takeBreakButton.setTitle(" Resume Shift", for: .normal)
            takeBreakButton.backgroundColor = UIColor(red: 254/255, green: 243/255, blue: 199/255, alpha: 1.0)
            takeBreakButton.setTitleColor(UIColor(red: 180/255, green: 83/255, blue: 9/255, alpha: 1.0), for: .normal)
            takeBreakButton.tintColor = UIColor(red: 180/255, green: 83/255, blue: 9/255, alpha: 1.0)
            punchStatusLabel.text = "• On Break (Shift Paused)"
            punchStatusLabel.textColor = UIColor(red: 217/255, green: 119/255, blue: 6/255, alpha: 1.0)

            breakTimerLabel.isHidden = false
            breakTimerLabel.text = "Break: 00m 00s (from \(nowTime))"

            AuthService.shared.recordBreak(onBreak: true)
            postLocalNote(title: "Break Started", body: "Break started at \(nowTime). Active shift timer paused.")
        } else {
            let breakEndDate = Date()
            let sessionDuration = breakEndDate.timeIntervalSince(currentBreakStartDate ?? breakEndDate)
            accumulatedBreakDuration += sessionDuration

            let startStr = (currentBreakStartDate != nil) ? timeFormatter.string(from: currentBreakStartDate!) : ""
            let endStr = timeFormatter.string(from: breakEndDate)
            let durMinutes = max(1, Int(round(sessionDuration / 60)))

            lastBreakSessionText = "Last Break: \(startStr) – \(endStr) (\(durMinutes)m)"
            breakTimerLabel.isHidden = false
            breakTimerLabel.text = lastBreakSessionText

            currentBreakStartDate = nil
            takeBreakButton.setTitle(" Take Break", for: .normal)
            takeBreakButton.backgroundColor = UIColor(red: 238/255, green: 242/255, blue: 255/255, alpha: 1.0)
            takeBreakButton.setTitleColor(UIColor(red: 30/255, green: 41/255, blue: 59/255, alpha: 1.0), for: .normal)
            takeBreakButton.tintColor = UIColor(red: 30/255, green: 41/255, blue: 59/255, alpha: 1.0)
            updatePunchInStatusText()

            AuthService.shared.recordBreak(onBreak: false)
            postLocalNote(title: "Shift Resumed", body: "Break ended at \(endStr) (from \(startStr) to \(endStr), \(durMinutes)m). Shift timer resumed!")
        }
    }

    private func postLocalNote(title: String, body: String) {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        let req = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: nil)
        UNUserNotificationCenter.current().add(req, withCompletionHandler: nil)
        AuthService.shared.recordLocalNotification(title: title, body: body)
        notifBadgeDot.isHidden = false
    }

    // MARK: - Real-time Team Presence & Tasks Dynamic Methods
    private func updateTeamPresenceUI(members: [[String: Any]]) {
        teamActiveCountLabel.text = "\(members.count) Active"
        avatarsContainer.subviews.forEach { $0.removeFromSuperview() }

        if members.isEmpty {
            let emptyLabel = UILabel()
            emptyLabel.text = "No team members currently active"
            emptyLabel.font = .systemFont(ofSize: 13, weight: .medium)
            emptyLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
            emptyLabel.translatesAutoresizingMaskIntoConstraints = false
            avatarsContainer.addSubview(emptyLabel)

            NSLayoutConstraint.activate([
                emptyLabel.leadingAnchor.constraint(equalTo: avatarsContainer.leadingAnchor),
                emptyLabel.centerYAnchor.constraint(equalTo: avatarsContainer.centerYAnchor)
            ])
            return
        }

        let colors: [UIColor] = [
            UIColor(red: 59/255, green: 130/255, blue: 246/255, alpha: 1.0), // Blue
            UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0), // Emerald
            UIColor(red: 245/255, green: 158/255, blue: 11/255, alpha: 1.0), // Amber
            UIColor(red: 139/255, green: 92/255, blue: 246/255, alpha: 1.0), // Purple
            UIColor(red: 236/255, green: 72/255, blue: 153/255, alpha: 1.0)  // Pink
        ]

        let displayCount = min(members.count, 5)
        for i in 0..<displayCount {
            let m = members[i]
            var initials = "AS"
            let fn = (m["firstName"] as? String ?? "").trimmingCharacters(in: .whitespaces)
            let ln = (m["lastName"] as? String ?? "").trimmingCharacters(in: .whitespaces)
            if !fn.isEmpty && !ln.isEmpty {
                initials = "\(fn.prefix(1))\(ln.prefix(1))".uppercased()
            } else if !fn.isEmpty {
                initials = String(fn.prefix(min(2, fn.count))).uppercased()
            } else if let email = m["email"] as? String, !email.isEmpty {
                initials = String(email.prefix(2)).uppercased()
            }

            let circle = UIView()
            circle.backgroundColor = colors[i % colors.count]
            circle.layer.cornerRadius = 16
            circle.layer.borderWidth = 2
            circle.layer.borderColor = UIColor.white.cgColor
            circle.clipsToBounds = true
            circle.translatesAutoresizingMaskIntoConstraints = false
            avatarsContainer.addSubview(circle)

            let lbl = UILabel()
            lbl.text = initials
            lbl.font = .systemFont(ofSize: 11, weight: .bold)
            lbl.textColor = .white
            lbl.textAlignment = .center
            lbl.translatesAutoresizingMaskIntoConstraints = false
            circle.addSubview(lbl)

            NSLayoutConstraint.activate([
                circle.leadingAnchor.constraint(equalTo: avatarsContainer.leadingAnchor, constant: CGFloat(i * 24)),
                circle.topAnchor.constraint(equalTo: avatarsContainer.topAnchor),
                circle.bottomAnchor.constraint(equalTo: avatarsContainer.bottomAnchor),
                circle.widthAnchor.constraint(equalToConstant: 32),
                circle.heightAnchor.constraint(equalToConstant: 32),

                lbl.centerXAnchor.constraint(equalTo: circle.centerXAnchor),
                lbl.centerYAnchor.constraint(equalTo: circle.centerYAnchor)
            ])
        }

        if members.count > 5 {
            let extraPill = UIView()
            extraPill.backgroundColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0)
            extraPill.layer.cornerRadius = 16
            extraPill.layer.borderWidth = 2
            extraPill.layer.borderColor = UIColor.white.cgColor
            extraPill.clipsToBounds = true
            extraPill.translatesAutoresizingMaskIntoConstraints = false
            avatarsContainer.addSubview(extraPill)

            let extraLabel = UILabel()
            extraLabel.text = "+\(members.count - 5)"
            extraLabel.font = .systemFont(ofSize: 11, weight: .bold)
            extraLabel.textColor = UIColor(red: 51/255, green: 65/255, blue: 85/255, alpha: 1.0)
            extraLabel.textAlignment = .center
            extraLabel.translatesAutoresizingMaskIntoConstraints = false
            extraPill.addSubview(extraLabel)

            NSLayoutConstraint.activate([
                extraPill.leadingAnchor.constraint(equalTo: avatarsContainer.leadingAnchor, constant: CGFloat(5 * 24)),
                extraPill.topAnchor.constraint(equalTo: avatarsContainer.topAnchor),
                extraPill.bottomAnchor.constraint(equalTo: avatarsContainer.bottomAnchor),
                extraPill.widthAnchor.constraint(equalToConstant: 32),
                extraPill.heightAnchor.constraint(equalToConstant: 32),

                extraLabel.centerXAnchor.constraint(equalTo: extraPill.centerXAnchor),
                extraLabel.centerYAnchor.constraint(equalTo: extraPill.centerYAnchor)
            ])
        }
    }

    private func loadTeamPresence() {
        AuthService.shared.getTeamMembers { [weak self] result in
            guard let self = self else { return }
            switch result {
            case .success(let members):
                self.teamMembersList = members
                self.updateTeamPresenceUI(members: members)
            case .failure:
                if self.teamMembersList.isEmpty {
                    self.updateTeamPresenceUI(members: [])
                }
            }
        }
    }

    private func loadTasks() {
        AuthService.shared.getMyTasks { [weak self] result in
            guard let self = self else { return }
            switch result {
            case .success(let tasks):
                self.myTasksList = tasks
                self.updateTasksUI(tasks: tasks)
            case .failure:
                if self.myTasksList.isEmpty {
                    self.updateTasksUI(tasks: [])
                }
            }
        }
    }

    private func updateTasksUI(tasks: [[String: Any]]) {
        let pendingTasks = tasks.filter { task in
            let status = (task["status"] as? String ?? "").lowercased()
            return status != "completed" && status != "cancelled"
        }
        let count = pendingTasks.isEmpty ? tasks.count : pendingTasks.count
        let displayList = pendingTasks.isEmpty ? tasks : pendingTasks

        if count == 0 {
            taskTitleLabel.text = "0 Tasks due today"
            taskSubtitleLabel.text = "All caught up! No pending tasks for today."
        } else {
            taskTitleLabel.text = "\(count) \(count == 1 ? "Task" : "Tasks") due today"
            let firstTask = displayList.first
            let firstTitle = (firstTask?["title"] as? String ?? firstTask?["name"] as? String ?? "Review updates").trimmingCharacters(in: .whitespaces)
            taskSubtitleLabel.text = "Next: \(firstTitle)"
        }
    }

    @objc private func handleViewRoster() {
        let rosterVC = TeamRosterModalViewController()
        rosterVC.teamMembers = teamMembersList
        let orgName = AuthService.shared.getOrganization()
        rosterVC.organizationName = orgName.isEmpty ? "GlobizHub Inc." : orgName
        rosterVC.modalPresentationStyle = .overFullScreen
        rosterVC.modalTransitionStyle = .crossDissolve
        present(rosterVC, animated: true)
    }

    @objc private func handleTasksAction() {
        let tasksVC = TasksViewController()
        navigationController?.pushViewController(tasksVC, animated: true)
    }

    private func showAlert(title: String, message: String) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }

    private func showError(_ message: String) {
        let alert = UIAlertController(title: "Notice", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }

    // MARK: - Profile & Real-time Info
    private func loadProfile() {
        let localName = AuthService.shared.getFirstName()
        let initialLetter: String
        if !localName.isEmpty {
            initialLetter = String(localName.prefix(1)).uppercased()
        } else if !AuthService.shared.getEmail().isEmpty {
            initialLetter = String(AuthService.shared.getEmail().prefix(1)).uppercased()
        } else {
            initialLetter = "U"
        }
        avatarInitialsLabel.text = initialLetter

        AuthService.shared.getProfile { [weak self] result in
            guard let self = self else { return }
            switch result {
            case .success(let user):
                let rawName = user["firstName"] as? String ?? user["name"] as? String ?? ""
                let photoUrl = user["profilePhoto"] as? String ?? ""

                var cleanName = rawName
                if cleanName.contains("@") {
                    cleanName = String(cleanName.split(separator: "@").first ?? "")
                }
                cleanName = cleanName.trimmingCharacters(in: .whitespacesAndNewlines)
                if let firstWord = cleanName.components(separatedBy: .whitespaces).first, !firstWord.isEmpty {
                    cleanName = firstWord.prefix(1).uppercased() + firstWord.dropFirst()
                }
                if cleanName.isEmpty { cleanName = "User" }

                var designation = ""
                if let desigDict = user["designation"] as? [String: Any], let dName = desigDict["name"] as? String {
                    designation = dName
                } else if let desigStr = user["designation"] as? String {
                    designation = desigStr
                } else if let role = user["role"] as? String {
                    designation = role
                }
                if designation.isEmpty {
                    designation = AuthService.shared.getDesignation()
                }

                var companyName = ""
                if let comp = user["company"] as? [String: Any], let cName = comp["name"] as? String {
                    companyName = cName
                } else if let orgStr = user["organization"] as? String {
                    companyName = orgStr
                } else {
                    companyName = AuthService.shared.getOrganization()
                }
                if companyName.isEmpty {
                    companyName = "GlobizHub Inc."
                }

                if !UserDefaults.standard.bool(forKey: "isUserManualRoleOverride"),
                   let userRole = user["role"] as? String, !userRole.isEmpty {
                    AuthService.shared.saveRole(userRole)
                    self.setupBottomNavBar()
                }
                if let desigDict = user["designation"] as? [String: Any],
                   let modules = desigDict["sidebarModules"] as? [String] {
                    AuthService.shared.saveSidebarModules(modules)
                }

                AuthService.shared.saveUserProfile(firstName: cleanName, designation: designation, organization: companyName)

                self.cachedFirstName = cleanName
                self.avatarInitialsLabel.text = String(cleanName.prefix(1)).uppercased()
                self.updateGreeting()
                self.heroSubRoleLabel.text = "\(designation) • \(companyName)"

                if !photoUrl.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                    self.loadAvatarImage(urlStr: photoUrl)
                } else {
                    self.avatarImageView.isHidden = true
                    self.avatarInitialsLabel.isHidden = false
                }
                self.dismissSkeleton()
            case .failure:
                self.updateGreeting()
                self.dismissSkeleton()
            }
        }
    }

    private func getTimeBasedGreeting() -> String {
        let hour = Calendar.current.component(.hour, from: Date())
        if hour >= 4 && hour < 12 {
            return "Good Morning"
        } else if hour >= 12 && hour < 17 {
            return "Good Afternoon"
        } else {
            return "Good Evening"
        }
    }

    private func updateGreeting() {
        var nameToShow = cachedFirstName
        if nameToShow.isEmpty || nameToShow == "User" || nameToShow.contains("@") {
            nameToShow = AuthService.shared.getFirstName()
        }
        if nameToShow.contains("@") {
            nameToShow = String(nameToShow.split(separator: "@").first ?? "User")
        }
        nameToShow = nameToShow.trimmingCharacters(in: .whitespacesAndNewlines)
        if let firstWord = nameToShow.components(separatedBy: .whitespaces).first, !firstWord.isEmpty {
            nameToShow = firstWord.prefix(1).uppercased() + firstWord.dropFirst()
        }
        if nameToShow.isEmpty { nameToShow = "User" }

        let greeting = getTimeBasedGreeting()
        heroGreetingLabel.text = "\(greeting), \(nameToShow)"
    }

    private func loadAvatarImage(urlStr: String) {
        var full = urlStr
        if !urlStr.hasPrefix("http://") && !urlStr.hasPrefix("https://") {
            full = "https://hr.globizhub.com" + urlStr
        }
        guard let url = URL(string: full) else { return }
        URLSession.shared.dataTask(with: url) { [weak self] data, _, _ in
            if let data = data, let img = UIImage(data: data) {
                DispatchQueue.main.async {
                    self?.avatarImageView.image = img
                    self?.avatarImageView.isHidden = false
                    self?.avatarInitialsLabel.isHidden = true
                }
            }
        }.resume()
    }

    // MARK: - Real-time Work Schedule Shift Timings
    private func loadRealSchedule() {
        AuthService.shared.getMySchedule { [weak self] result in
            guard let self = self else { return }
            switch result {
            case .success(let items) where !items.isEmpty:
                let todayStr = ISO8601DateFormatter().string(from: Date()).prefix(10)
                if let todayItem = items.first(where: { ($0["date"] as? String)?.prefix(10) == todayStr }),
                   let shift = todayItem["shift"] as? [String: Any],
                   let start = shift["startTime"] as? String,
                   let end = shift["endTime"] as? String {
                    self.shiftTimeLabel.text = "Shift: \(start) – \(end)"
                } else if let firstShift = items.first?["shift"] as? [String: Any],
                          let start = firstShift["startTime"] as? String,
                          let end = firstShift["endTime"] as? String {
                    self.shiftTimeLabel.text = "Shift: \(start) – \(end)"
                }
            default:
                break
            }
        }
    }

    // MARK: - Real-time Leaves Data
    private func loadRealLeaves() {
        AuthService.shared.getLeaveBalance { [weak self] result in
            guard let self = self else { return }
            switch result {
            case .success(let allocations) where !allocations.isEmpty:
                var totalAllocated: Double = 0
                var totalUsed: Double = 0

                for alloc in allocations {
                    let allocated = (alloc["allocatedDays"] as? NSNumber)?.doubleValue ?? 6.0
                    let used = (alloc["usedDays"] as? NSNumber)?.doubleValue ?? 0.0
                    totalAllocated += allocated
                    totalUsed += used
                }

                if totalAllocated == 0 {
                    totalAllocated = 24
                    totalUsed = 6
                }

                let totalRemaining = max(0, totalAllocated - totalUsed)
                let remText = (totalRemaining == floor(totalRemaining)) ? "\(Int(totalRemaining))" : String(format: "%.1f", totalRemaining)
                let allocText = (totalAllocated == floor(totalAllocated)) ? "\(Int(totalAllocated))" : String(format: "%.1f", totalAllocated)
                let usedText = (totalUsed == floor(totalUsed)) ? "\(Int(totalUsed))" : String(format: "%.1f", totalUsed)

                self.leavesCasualLabel.text = "\(remText) Leaves Left"
                self.leavesSickLabel.text = "Allocated: \(allocText) • Used: \(usedText)"

                let ratio: CGFloat = totalAllocated > 0 ? CGFloat(min(1.0, max(0.08, totalRemaining / totalAllocated))) : 1.0
                self.updateLeavesProgress(ratio: ratio)
            default:
                self.leavesCasualLabel.text = "18 Leaves Left"
                self.leavesSickLabel.text = "Allocated: 24 • Used: 6"
                self.updateLeavesProgress(ratio: 0.75)
            }
        }
    }

    private func updateLeavesProgress(ratio: CGFloat) {
        leavesProgressWidthConstraint?.isActive = false
        leavesProgressWidthConstraint = leavesProgressBar.widthAnchor.constraint(equalTo: leavesProgressTrack.widthAnchor, multiplier: ratio)
        leavesProgressWidthConstraint?.isActive = true
        UIView.animate(withDuration: 0.3) {
            self.leavesCard.layoutIfNeeded()
        }
    }

    // MARK: - Real-time Holiday Calendar & Month-wise Slider (3 Upcoming Holidays)
    private func loadRealHolidays() {
        AuthService.shared.getHolidays { [weak self] result in
            guard let self = self else { return }
            let cal = Calendar.current
            let now = Date()
            let startOfToday = cal.startOfDay(for: now)

            var upcomingList: [[String: Any]] = []

            if case .success(let holidays) = result, !holidays.isEmpty {
                let valid = holidays.compactMap { item -> (Date, [String: Any])? in
                    guard let dateStr = item["date"] as? String ?? item["startDate"] as? String,
                          let d = self.parseIsoDate(dateStr) else { return nil }
                    if d >= startOfToday {
                        return (d, item)
                    }
                    return nil
                }.sorted { $0.0 < $1.0 }.map { $0.1 }
                upcomingList = valid
            }

            // Ensure we have at least 3 upcoming holidays lined up for the user to slide
            if upcomingList.count < 3 {
                let isoFormatter = ISO8601DateFormatter()
                let currentYear = cal.component(.year, from: now)
                let fallbackTemplates: [(name: String, month: Int, day: Int)] = [
                    ("Diwali", 11, 1),
                    ("Guru Nanak Jayanti", 11, 15),
                    ("Christmas Day", 12, 25),
                    ("New Year's Day", 1, 1),
                    ("Republic Day", 1, 26)
                ]

                for t in fallbackTemplates {
                    var year = currentYear
                    var comp = DateComponents(year: year, month: t.month, day: t.day)
                    if let holidayDate = cal.date(from: comp), holidayDate < startOfToday {
                        year += 1
                        comp.year = year
                    }
                    if let hDate = cal.date(from: comp), hDate >= startOfToday {
                        let dateStr = isoFormatter.string(from: hDate)
                        let alreadyExists = upcomingList.contains { ($0["name"] as? String)?.lowercased() == t.name.lowercased() }
                        if !alreadyExists {
                            upcomingList.append([
                                "name": t.name,
                                "date": dateStr
                            ])
                        }
                    }
                }

                upcomingList.sort { (a, b) -> Bool in
                    guard let daStr = a["date"] as? String ?? a["startDate"] as? String,
                          let da = self.parseIsoDate(daStr),
                          let dbStr = b["date"] as? String ?? b["startDate"] as? String,
                          let db = self.parseIsoDate(dbStr) else { return false }
                    return da < db
                }
            }

            self.upcomingHolidays = Array(upcomingList.prefix(3))
            self.currentHolidayIndex = 0
            self.displayHolidayAtIndex(0)
        }
    }

    @objc private func cycleNextHoliday() {
        guard !upcomingHolidays.isEmpty else { return }
        currentHolidayIndex = (currentHolidayIndex + 1) % upcomingHolidays.count

        // Smooth transition animation from right
        let transition = CATransition()
        transition.type = .push
        transition.subtype = .fromRight
        transition.duration = 0.25
        transition.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
        holidayCard.layer.add(transition, forKey: "holidayTransition")

        displayHolidayAtIndex(currentHolidayIndex)
    }

    @objc private func cyclePrevHoliday() {
        guard !upcomingHolidays.isEmpty else { return }
        currentHolidayIndex = (currentHolidayIndex - 1 + upcomingHolidays.count) % upcomingHolidays.count

        // Smooth transition animation from left
        let transition = CATransition()
        transition.type = .push
        transition.subtype = .fromLeft
        transition.duration = 0.25
        transition.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
        holidayCard.layer.add(transition, forKey: "holidayTransition")

        displayHolidayAtIndex(currentHolidayIndex)
    }

    private func displayHolidayAtIndex(_ index: Int) {
        guard index < upcomingHolidays.count else { return }
        let item = upcomingHolidays[index]
        let name = item["name"] as? String ?? item["title"] as? String ?? "Holiday"
        let dateStr = item["date"] as? String ?? item["startDate"] as? String ?? ""
        guard let date = parseIsoDate(dateStr) else { return }

        let dayFmt = DateFormatter()
        dayFmt.dateFormat = "EEE, MMM d"
        holidayNameLabel.text = name
        holidayDateLabel.text = dayFmt.string(from: date)

        let cal = Calendar.current
        let daysLeft = cal.dateComponents([.day], from: cal.startOfDay(for: Date()), to: cal.startOfDay(for: date)).day ?? 0

        if daysLeft == 0 {
            holidayDaysLeftLabel.text = "Today"
            holidayDaysLeftLabel.textColor = UIColor(red: 220/255, green: 38/255, blue: 38/255, alpha: 1.0)
            holidayDaysLeftBadge.backgroundColor = UIColor(red: 254/255, green: 242/255, blue: 242/255, alpha: 1.0)
            holidayDaysLeftBadge.layer.borderColor = UIColor(red: 254/255, green: 202/255, blue: 202/255, alpha: 1.0).cgColor
        } else if daysLeft == 1 {
            holidayDaysLeftLabel.text = "Tomorrow"
            holidayDaysLeftLabel.textColor = UIColor(red: 217/255, green: 119/255, blue: 6/255, alpha: 1.0)
            holidayDaysLeftBadge.backgroundColor = UIColor(red: 254/255, green: 243/255, blue: 199/255, alpha: 1.0)
            holidayDaysLeftBadge.layer.borderColor = UIColor(red: 253/255, green: 230/255, blue: 138/255, alpha: 1.0).cgColor
        } else {
            holidayDaysLeftLabel.text = "In \(daysLeft) days"
            holidayDaysLeftLabel.textColor = UIColor(red: 217/255, green: 119/255, blue: 6/255, alpha: 1.0)
            holidayDaysLeftBadge.backgroundColor = UIColor(red: 254/255, green: 243/255, blue: 199/255, alpha: 1.0)
            holidayDaysLeftBadge.layer.borderColor = UIColor(red: 253/255, green: 230/255, blue: 138/255, alpha: 1.0).cgColor
        }

        // Update dots indicator
        for (i, dot) in holidayDots.enumerated() {
            let isActive = (i == index)
            dot.backgroundColor = isActive
                ? UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
                : UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0)
            if let wCon = dot.constraints.first(where: { $0.firstAttribute == .width }) {
                wCon.constant = isActive ? 12 : 6
            }
        }
    }

    // MARK: - Attendance API & Live Clock
    private func restoreUserAttendanceSession() {
        let localStatus = AuthService.shared.getLocalAttendanceStatus()
        let localCheckIn = AuthService.shared.getLocalCheckInIso()
        let localCheckOut = AuthService.shared.getLocalCheckOutIso()

        if localStatus == "CLOCKED_IN", let checkInStr = localCheckIn {
            let apiFmt = ISO8601DateFormatter()
            let isoFallback = ISO8601DateFormatter()
            isoFallback.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let parsedDate = apiFmt.date(from: checkInStr) ?? isoFallback.date(from: checkInStr) {
                if Calendar.current.isDateInToday(parsedDate) {
                    self.isCheckedIn = true
                    self.checkInDate = parsedDate
                    self.isTodayLate = AuthService.shared.getLocalIsLate()
                    self.startTimer()
                    self.updateUIForAttendance(clockedIn: true)
                    self.updateShiftBadgeForStatus(isLate: self.isTodayLate)
                    return
                }
            }
        } else if localStatus == "CLOCKED_OUT", let checkOutStr = localCheckOut {
            let apiFmt = ISO8601DateFormatter()
            let isoFallback = ISO8601DateFormatter()
            isoFallback.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let parsedOut = apiFmt.date(from: checkOutStr) ?? isoFallback.date(from: checkOutStr) {
                if Calendar.current.isDateInToday(parsedOut) {
                    self.isShiftCompletedToday = true
                    self.isCheckedIn = false
                    self.stopTimer()
                    self.updateUIForAttendance(clockedIn: false)
                    return
                }
            }
        }

        self.isCheckedIn = false
        self.checkInDate = nil
        self.stopTimer()
        self.updateUIForAttendance(clockedIn: false)
    }

    private func checkAndTriggerActiveShiftReminder() {
        let cal = Calendar.current
        let hour = cal.component(.hour, from: Date())
        let minute = cal.component(.minute, from: Date())
        let totalMinutes = hour * 60 + minute
        let shiftStartMin = shiftStartHour * 60 + shiftStartMinute
        let shiftEndMin = shiftEndHour * 60 + shiftEndMinute

        let todayKey = DateFormatter()
        todayKey.dateFormat = "yyyy-MM-dd"
        let dateString = todayKey.string(from: Date())

        let preKey = "ShiftNotif_Pre_\(dateString)"
        let endKey = "ShiftNotif_End_\(dateString)"

        if totalMinutes >= (shiftStartMin - 5) && totalMinutes <= (shiftStartMin + 15) {
            if !UserDefaults.standard.bool(forKey: preKey) && !isCheckedIn {
                UserDefaults.standard.set(true, forKey: preKey)
                let title = "Upcoming Shift • Starting in 5 mins"
                let body = "Good morning! Your shift starts at 09:00 AM. Punch in now to start on time. Have a wonderful and productive work day!"
                AuthService.shared.recordLocalNotification(title: title, body: body)
                updateNotificationBellBadge()
            }
        }

        if totalMinutes >= shiftEndMin {
            if isCheckedIn {
                autoClockOutAtShiftEnd()
            }
            if !UserDefaults.standard.bool(forKey: endKey) {
                UserDefaults.standard.set(true, forKey: endKey)
                let endFormatted = String(format: "%02d:%02d", shiftEndHour, shiftEndMinute)
                let title = "Shift Completed • \(endFormatted)"
                let body = "Great job today! Your shift is now over. Thank you for your dedication and hard work—don't forget to punch out!"
                AuthService.shared.recordLocalNotification(title: title, body: body)
                updateNotificationBellBadge()
            }
        }
    }

    private func autoClockOutAtShiftEnd() {
        guard isCheckedIn else { return }
        let now = Date()
        let timeFormatter = DateFormatter()
        timeFormatter.dateFormat = "hh:mm a"
        let timeStr = timeFormatter.string(from: now)

        self.isCheckedIn = false
        self.isShiftCompletedToday = true
        self.stopTimer()
        self.updateUIForAttendance(clockedIn: false)
        self.punchStatusLabel.text = "• Shift Completed at \(timeStr)"

        let isoFormatter = ISO8601DateFormatter()
        isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        let nowIso = isoFormatter.string(from: now)

        AuthService.shared.clockOut { [weak self] result in
            switch result {
            case .success:
                self?.loadAttendanceStats()
            case .failure:
                AuthService.shared.savePendingOfflinePunch(type: "OUT", isoTime: nowIso)
            }
        }
    }

    private func scheduleShiftReminderNotifications() {
        let center = UNUserNotificationCenter.current()

        let preShiftContent = UNMutableNotificationContent()
        preShiftContent.title = "Upcoming Shift • Starting in 5 mins"
        preShiftContent.body = "Good morning! Your shift starts at 09:00 AM. Punch in now to start on time. Have a wonderful and productive work day!"
        preShiftContent.sound = .default

        var preDateComponents = DateComponents()
        preDateComponents.hour = 8
        preDateComponents.minute = 55
        let preTrigger = UNCalendarNotificationTrigger(dateMatching: preDateComponents, repeats: true)
        let preRequest = UNNotificationRequest(identifier: "shift_pre_start_5m", content: preShiftContent, trigger: preTrigger)
        center.add(preRequest, withCompletionHandler: nil)

        let endShiftContent = UNMutableNotificationContent()
        endShiftContent.title = "Shift Completed • 06:00 PM"
        endShiftContent.body = "Great job today! Your shift is now over. Thank you for your dedication and hard work—don't forget to punch out!"
        endShiftContent.sound = .default

        var endDateComponents = DateComponents()
        endDateComponents.hour = 18
        endDateComponents.minute = 0
        let endTrigger = UNCalendarNotificationTrigger(dateMatching: endDateComponents, repeats: true)
        let endRequest = UNNotificationRequest(identifier: "shift_end_reminder_6pm", content: endShiftContent, trigger: endTrigger)
        center.add(endRequest, withCompletionHandler: nil)
    }

    private func formatShiftTime(start: String, end: String) -> String {
        let inFormatter = DateFormatter()
        inFormatter.dateFormat = "HH:mm"
        let inFormatterSec = DateFormatter()
        inFormatterSec.dateFormat = "HH:mm:ss"

        let outFormatter = DateFormatter()
        outFormatter.dateFormat = "hh:mm a"

        let startDate = inFormatter.date(from: start) ?? inFormatterSec.date(from: start)
        let endDate = inFormatter.date(from: end) ?? inFormatterSec.date(from: end)

        let startFormatted = startDate != nil ? outFormatter.string(from: startDate!) : start
        let endFormatted = endDate != nil ? outFormatter.string(from: endDate!) : end

        return "\(startFormatted) – \(endFormatted)"
    }

    private func loadAttendanceStats() {
        // Fetch real-time schedule and shift assigned by admin
        AuthService.shared.getMySchedule { [weak self] result in
            guard let self = self else { return }
            if case .success(let schedules) = result, let first = schedules.first, let shift = first["shift"] as? [String: Any] {
                let start = shift["startTime"] as? String ?? "09:00"
                let end = shift["endTime"] as? String ?? "18:00"
                let startComp = start.split(separator: ":").compactMap { Int($0) }
                if startComp.count >= 2 {
                    self.shiftStartHour = startComp[0]
                    self.shiftStartMinute = startComp[1]
                }
                let endComp = end.split(separator: ":").compactMap { Int($0) }
                if endComp.count >= 2 {
                    self.shiftEndHour = endComp[0]
                    self.shiftEndMinute = endComp[1]
                }
                let formatted = self.formatShiftTime(start: start, end: end)
                AuthService.shared.saveShiftTiming(formatted)

                let endFmt = DateFormatter()
                endFmt.dateFormat = "h:mma"
                let inFmt = DateFormatter()
                inFmt.dateFormat = "HH:mm"
                if let eDate = inFmt.date(from: end) {
                    AuthService.shared.saveShiftEndTime(endFmt.string(from: eDate).lowercased())
                }
                DispatchQueue.main.async {
                    self.shiftTimeLabel.text = "Shift: \(formatted)"
                }
            }
        }

        AuthService.shared.getAttendanceStats { [weak self] result in
            guard let self = self else { return }
            switch result {
            case .success(let stats):
                if let shiftDict = stats["shift"] as? [String: Any] {
                    let start = shiftDict["startTime"] as? String ?? "09:00"
                    let end = shiftDict["endTime"] as? String ?? "18:00"
                    let formatted = self.formatShiftTime(start: start, end: end)
                    AuthService.shared.saveShiftTiming(formatted)
                    DispatchQueue.main.async {
                        self.shiftTimeLabel.text = "Shift: \(formatted)"
                    }
                }

                let checkInStr = (stats["checkInTime"] as? String) ?? (stats["firstCheckIn"] as? String)
                let checkOutStr = stats["checkOutTime"] as? String

                if let checkOut = checkOutStr, !checkOut.isEmpty, checkOut != "<null>", checkOut != "null" {
                    self.isCheckedIn = false
                    self.isShiftCompletedToday = true
                    self.stopTimer()
                    self.updateUIForAttendance(clockedIn: false)
                } else if let inStr = checkInStr, !inStr.isEmpty, inStr != "<null>", inStr != "null" {
                    self.isCheckedIn = true
                    if let parsed = self.parseIsoDate(inStr) {
                        self.checkInDate = parsed
                    }
                    self.updateUIForAttendance(clockedIn: true)
                    self.startTimer()
                    self.syncTodayAttendanceRecord()
                    self.renderMonthlyHeatmap()
                }
                self.dismissSkeleton()
            case .failure:
                // Keep local session if active, do not overwrite with false
                self.dismissSkeleton()
                break
            }
        }
    }

    private func updateUIForAttendance(clockedIn: Bool) {
        if clockedIn {
            updatePunchInStatusText()
            // Active shift state: emerald green circle and soft green glow ring
            punchCircleButton.backgroundColor = UIColor(red: 22/255, green: 163/255, blue: 74/255, alpha: 1.0)
            punchCircleButton.layer.shadowColor = UIColor(red: 22/255, green: 163/255, blue: 74/255, alpha: 0.35).cgColor
            punchIconView.tintColor = .white
            punchGlowRing.backgroundColor = UIColor(red: 220/255, green: 252/255, blue: 231/255, alpha: 0.85)
        } else {
            if isShiftCompletedToday {
                punchStatusLabel.text = "• Shift Completed for Today"
                punchStatusLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
                punchCircleButton.backgroundColor = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 1.0)
                punchCircleButton.layer.shadowColor = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 0.25).cgColor
                punchIconView.tintColor = .white
                punchGlowRing.backgroundColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 0.85)
            } else if !isWithinPunchInWindow() {
                punchStatusLabel.text = "• Shift Scheduled for 09:00 AM"
                punchStatusLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
                punchCircleButton.backgroundColor = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 1.0)
                punchCircleButton.layer.shadowColor = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 0.25).cgColor
                punchIconView.tintColor = .white
                punchGlowRing.backgroundColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 0.85)
            } else {
                punchStatusLabel.text = "• Ready to Punch In"
                punchStatusLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
                punchCircleButton.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
                punchCircleButton.layer.shadowColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 0.35).cgColor
                punchIconView.tintColor = .white
                punchGlowRing.backgroundColor = UIColor(red: 219/255, green: 234/255, blue: 254/255, alpha: 0.85)
            }
        }
        updatePunchInstructionLabel()
    }

    private func updatePunchInstructionLabel() {
        if !isCheckedIn {
            if isShiftCompletedToday {
                punchInstructionLabel.text = "Shift Completed for Today"
                punchInstructionLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
            } else if !isWithinPunchInWindow() {
                punchInstructionLabel.text = "Shift starts at 09:00 AM • Opens at 08:55 AM"
                punchInstructionLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
            } else {
                punchInstructionLabel.text = "Hold 2s to Punch In"
                punchInstructionLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
            }
        } else if isOnBreak {
            punchInstructionLabel.text = "Shift on break • Resume to continue"
            punchInstructionLabel.textColor = UIColor(red: 217/255, green: 119/255, blue: 6/255, alpha: 1.0)
        } else {
            punchInstructionLabel.text = "Shift in Progress • Hold 2s to Punch Out"
            punchInstructionLabel.textColor = UIColor(red: 22/255, green: 163/255, blue: 74/255, alpha: 1.0)
        }
    }

    private func updatePunchInStatusText() {
        let timeFormatter = DateFormatter()
        timeFormatter.locale = Locale(identifier: "en_US_POSIX")
        timeFormatter.dateFormat = "hh:mm:ss a"
        let punchTimeStr = (checkInDate != nil) ? timeFormatter.string(from: checkInDate!) : "09:00:00 AM"
        punchStatusLabel.text = "• Clocked In at \(punchTimeStr)"
        punchStatusLabel.textColor = UIColor(red: 22/255, green: 163/255, blue: 74/255, alpha: 1.0)
    }

    private func startTimer() {
        stopTimer()
        liveTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            guard let self = self, let startDate = self.checkInDate else { return }

            if self.isOnBreak {
                // Main timer pauses/freezes while on break!
                // Break timer ticks below the main timer:
                let elapsedBreak = Int(Date().timeIntervalSince(self.currentBreakStartDate ?? Date()))
                let bm = (elapsedBreak % 3600) / 60
                let bs = elapsedBreak % 60
                let tf = DateFormatter()
                tf.dateFormat = "hh:mm a"
                let startStr = (self.currentBreakStartDate != nil) ? tf.string(from: self.currentBreakStartDate!) : ""
                self.breakTimerLabel.isHidden = false
                self.breakTimerLabel.text = "Break: \(String(format: "%02dm %02ds", bm, bs)) (from \(startStr))"
                self.punchStatusLabel.text = "• On Break (Shift Paused)"
                self.punchStatusLabel.textColor = UIColor(red: 217/255, green: 119/255, blue: 6/255, alpha: 1.0)
            } else {
                let totalElapsed = max(0, Int(Date().timeIntervalSince(startDate)))
                let activeElapsed = max(0, totalElapsed - Int(self.accumulatedBreakDuration))
                let h = activeElapsed / 3600
                let m = (activeElapsed % 3600) / 60
                let s = activeElapsed % 60
                self.liveTimerLabel.text = String(format: "%02dh %02dm %02ds", h, m, s)
                self.updateHeatmapTodayLive(h: h, m: m, s: s)

                if let lastBreak = self.lastBreakSessionText {
                    self.breakTimerLabel.isHidden = false
                    self.breakTimerLabel.text = lastBreak
                } else {
                    self.breakTimerLabel.isHidden = true
                }
            }
            self.updatePunchInstructionLabel()
        }
        liveTimer?.fire()
    }

    private func stopTimer() {
        liveTimer?.invalidate()
        liveTimer = nil
    }

    private func parseIsoDate(_ string: String) -> Date? {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let d = formatter.date(from: string) { return d }
        formatter.formatOptions = [.withInternetDateTime]
        if let d = formatter.date(from: string) { return d }
        let simpleFmt = DateFormatter()
        simpleFmt.dateFormat = "yyyy-MM-dd"
        return simpleFmt.date(from: string)
    }

    // MARK: - Admin Dashboard Setup & Real-time Integration

    private func setupAdminDashboard() {
        // 1. Admin Hero Card
        adminHeroCard.layer.cornerRadius = 24
        adminHeroCard.layer.masksToBounds = true
        adminHeroCard.translatesAutoresizingMaskIntoConstraints = false
        adminHeroCard.heightAnchor.constraint(greaterThanOrEqualToConstant: 180).isActive = true

        adminHeroGradient.colors = [
            UIColor(red: 30/255, green: 27/255, blue: 75/255, alpha: 1.0).cgColor,
            UIColor(red: 49/255, green: 46/255, blue: 129/255, alpha: 1.0).cgColor
        ]
        adminHeroGradient.startPoint = CGPoint(x: 0, y: 0)
        adminHeroGradient.endPoint = CGPoint(x: 1, y: 1)
        adminHeroCard.layer.insertSublayer(adminHeroGradient, at: 0)

        let heroContentStack = UIStackView()
        heroContentStack.axis = .vertical
        heroContentStack.spacing = 8
        heroContentStack.translatesAutoresizingMaskIntoConstraints = false
        adminHeroCard.addSubview(heroContentStack)

        let pillContainer = UIView()
        pillContainer.backgroundColor = UIColor(white: 1.0, alpha: 0.16)
        pillContainer.layer.cornerRadius = 12
        pillContainer.translatesAutoresizingMaskIntoConstraints = false

        let pillLabel = UILabel()
        pillLabel.text = "Admin Workspace"
        pillLabel.font = .systemFont(ofSize: 11, weight: .bold)
        pillLabel.textColor = UIColor(red: 199/255, green: 210/255, blue: 254/255, alpha: 1.0)
        pillLabel.translatesAutoresizingMaskIntoConstraints = false
        pillContainer.addSubview(pillLabel)

        NSLayoutConstraint.activate([
            pillLabel.topAnchor.constraint(equalTo: pillContainer.topAnchor, constant: 4),
            pillLabel.bottomAnchor.constraint(equalTo: pillContainer.bottomAnchor, constant: -4),
            pillLabel.leadingAnchor.constraint(equalTo: pillContainer.leadingAnchor, constant: 10),
            pillLabel.trailingAnchor.constraint(equalTo: pillContainer.trailingAnchor, constant: -10)
        ])

        let pillRow = UIStackView(arrangedSubviews: [pillContainer, UIView()])
        heroContentStack.addArrangedSubview(pillRow)

        adminGreetingLabel.text = "Welcome back, Admin!"
        adminGreetingLabel.font = .systemFont(ofSize: 22, weight: .bold)
        adminGreetingLabel.textColor = .white
        heroContentStack.addArrangedSubview(adminGreetingLabel)

        adminSubtitleLabel.text = "Workspace Administrator • GlobizHub Inc."
        adminSubtitleLabel.font = .systemFont(ofSize: 13, weight: .regular)
        adminSubtitleLabel.textColor = UIColor(red: 203/255, green: 213/255, blue: 225/255, alpha: 1.0)
        heroContentStack.addArrangedSubview(adminSubtitleLabel)

        let adminTelemetryStrip = UIView()
        adminTelemetryStrip.backgroundColor = UIColor(white: 1.0, alpha: 0.14)
        adminTelemetryStrip.layer.cornerRadius = 12
        adminTelemetryStrip.translatesAutoresizingMaskIntoConstraints = false
        adminTelemetryStrip.heightAnchor.constraint(equalToConstant: 40).isActive = true

        let dotView = UIView()
        dotView.backgroundColor = UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0)
        dotView.layer.cornerRadius = 4
        dotView.translatesAutoresizingMaskIntoConstraints = false

        let telemetryLabel = UILabel()
        telemetryLabel.text = "Live Workspace Telemetry · Real-Time Sync"
        telemetryLabel.font = .systemFont(ofSize: 12, weight: .bold)
        telemetryLabel.textColor = .white
        telemetryLabel.translatesAutoresizingMaskIntoConstraints = false

        let liveBadge = UILabel()
        liveBadge.text = "Online"
        liveBadge.font = .systemFont(ofSize: 10, weight: .bold)
        liveBadge.textColor = UIColor(red: 5/255, green: 150/255, blue: 105/255, alpha: 1.0)
        liveBadge.backgroundColor = UIColor(red: 209/255, green: 250/255, blue: 229/255, alpha: 1.0)
        liveBadge.layer.cornerRadius = 8
        liveBadge.layer.masksToBounds = true
        liveBadge.textAlignment = .center
        liveBadge.translatesAutoresizingMaskIntoConstraints = false

        adminTelemetryStrip.addSubview(dotView)
        adminTelemetryStrip.addSubview(telemetryLabel)
        adminTelemetryStrip.addSubview(liveBadge)

        NSLayoutConstraint.activate([
            dotView.leadingAnchor.constraint(equalTo: adminTelemetryStrip.leadingAnchor, constant: 12),
            dotView.centerYAnchor.constraint(equalTo: adminTelemetryStrip.centerYAnchor),
            dotView.widthAnchor.constraint(equalToConstant: 8),
            dotView.heightAnchor.constraint(equalToConstant: 8),

            telemetryLabel.leadingAnchor.constraint(equalTo: dotView.trailingAnchor, constant: 8),
            telemetryLabel.centerYAnchor.constraint(equalTo: adminTelemetryStrip.centerYAnchor),

            liveBadge.trailingAnchor.constraint(equalTo: adminTelemetryStrip.trailingAnchor, constant: -12),
            liveBadge.centerYAnchor.constraint(equalTo: adminTelemetryStrip.centerYAnchor),
            liveBadge.widthAnchor.constraint(equalToConstant: 54),
            liveBadge.heightAnchor.constraint(equalToConstant: 22),
            telemetryLabel.trailingAnchor.constraint(lessThanOrEqualTo: liveBadge.leadingAnchor, constant: -8)
        ])

        heroContentStack.addArrangedSubview(adminTelemetryStrip)

        NSLayoutConstraint.activate([
            heroContentStack.topAnchor.constraint(equalTo: adminHeroCard.topAnchor, constant: 20),
            heroContentStack.bottomAnchor.constraint(equalTo: adminHeroCard.bottomAnchor, constant: -20),
            heroContentStack.leadingAnchor.constraint(equalTo: adminHeroCard.leadingAnchor, constant: 20),
            heroContentStack.trailingAnchor.constraint(equalTo: adminHeroCard.trailingAnchor, constant: -20)
        ])

        adminStackView.addArrangedSubview(adminHeroCard)

        // 2. Admin 4 Real-time Metrics (2x2 Grid)
        let metricsGrid = UIStackView()
        metricsGrid.axis = .vertical
        metricsGrid.spacing = 12
        metricsGrid.translatesAutoresizingMaskIntoConstraints = false

        let row1 = UIStackView()
        row1.axis = .horizontal
        row1.spacing = 12
        row1.distribution = .fillEqually

        adminTotalEmployeesLabel.text = "24"
        let card1 = createStatCard(title: "Employees", iconName: "person.2.fill", iconColor: UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0), valueLabel: adminTotalEmployeesLabel, subtext: "Active in Workspace")

        adminPresentTodayLabel.text = "18"
        let card2 = createStatCard(title: "Present Today", iconName: "checkmark.circle.fill", iconColor: UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0), valueLabel: adminPresentTodayLabel, subtext: "On Duty Today", subtextColor: UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0))

        row1.addArrangedSubview(card1)
        row1.addArrangedSubview(card2)

        let row2 = UIStackView()
        row2.axis = .horizontal
        row2.spacing = 12
        row2.distribution = .fillEqually

        adminAbsentTodayLabel.text = "4"
        let card3 = createStatCard(title: "Absent", iconName: "xmark.circle.fill", iconColor: UIColor(red: 239/255, green: 68/255, blue: 68/255, alpha: 1.0), valueLabel: adminAbsentTodayLabel, subtext: "Not Clocked In", subtextColor: UIColor(red: 239/255, green: 68/255, blue: 68/255, alpha: 1.0))

        adminLateTodayLabel.text = "2"
        let card4 = createStatCard(title: "Late Arrivals", iconName: "clock.fill", iconColor: UIColor(red: 245/255, green: 158/255, blue: 11/255, alpha: 1.0), valueLabel: adminLateTodayLabel, subtext: "Clocked after 09:00", subtextColor: UIColor(red: 245/255, green: 158/255, blue: 11/255, alpha: 1.0))

        row2.addArrangedSubview(card3)
        row2.addArrangedSubview(card4)

        metricsGrid.addArrangedSubview(row1)
        metricsGrid.addArrangedSubview(row2)
        adminStackView.addArrangedSubview(metricsGrid)

        // 3. Admin Action Center
        let actionCenterCard = createSectionCard(title: "Admin Action Center")
        let actionsRow = UIStackView()
        actionsRow.axis = .horizontal
        actionsRow.spacing = 10
        actionsRow.distribution = .fillEqually
        actionsRow.translatesAutoresizingMaskIntoConstraints = false

        let btnNotice = createActionButton(title: "+ Notice", iconName: "megaphone.fill", bg: UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0), fg: .white)
        btnNotice.addTarget(self, action: #selector(handleAdminBroadcastNotice), for: .touchUpInside)

        let btnApprovals = createActionButton(title: "Approvals", iconName: "doc.text.fill", bg: UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0), fg: UIColor(red: 30/255, green: 41/255, blue: 59/255, alpha: 1.0))
        btnApprovals.addTarget(self, action: #selector(handleAdminScrollToApprovals), for: .touchUpInside)

        let btnDirectory = createActionButton(title: "Directory", iconName: "person.3.fill", bg: UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0), fg: UIColor(red: 30/255, green: 41/255, blue: 59/255, alpha: 1.0))
        btnDirectory.addTarget(self, action: #selector(handleAdminTeamDirectory), for: .touchUpInside)

        actionsRow.addArrangedSubview(btnNotice)
        actionsRow.addArrangedSubview(btnApprovals)
        actionsRow.addArrangedSubview(btnDirectory)

        if let content = actionCenterCard.subviews.first(where: { $0 is UIStackView }) as? UIStackView {
            content.addArrangedSubview(actionsRow)
        }
        adminStackView.addArrangedSubview(actionCenterCard)

        // 4. Pending Leave Requests Card
        adminPendingLeavesCard.backgroundColor = .white
        adminPendingLeavesCard.layer.cornerRadius = 20
        adminPendingLeavesCard.layer.borderWidth = 1
        adminPendingLeavesCard.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        adminPendingLeavesCard.translatesAutoresizingMaskIntoConstraints = false

        let leavesInnerStack = UIStackView()
        leavesInnerStack.axis = .vertical
        leavesInnerStack.spacing = 12
        leavesInnerStack.translatesAutoresizingMaskIntoConstraints = false
        adminPendingLeavesCard.addSubview(leavesInnerStack)

        let leavesHeaderRow = UIStackView()
        leavesHeaderRow.axis = .horizontal
        leavesHeaderRow.alignment = .center

        let leavesTitle = UILabel()
        leavesTitle.text = "Pending Approvals"
        leavesTitle.font = .systemFont(ofSize: 16, weight: .bold)
        leavesTitle.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        leavesHeaderRow.addArrangedSubview(leavesTitle)

        adminPendingBadgeLabel.text = "Action Required"
        adminPendingBadgeLabel.font = .systemFont(ofSize: 11, weight: .bold)
        adminPendingBadgeLabel.textColor = UIColor(red: 245/255, green: 158/255, blue: 11/255, alpha: 1.0)
        adminPendingBadgeLabel.backgroundColor = UIColor(red: 254/255, green: 243/255, blue: 199/255, alpha: 1.0)
        adminPendingBadgeLabel.layer.cornerRadius = 8
        adminPendingBadgeLabel.layer.masksToBounds = true
        adminPendingBadgeLabel.textAlignment = .center
        adminPendingBadgeLabel.translatesAutoresizingMaskIntoConstraints = false
        adminPendingBadgeLabel.widthAnchor.constraint(equalToConstant: 110).isActive = true
        adminPendingBadgeLabel.heightAnchor.constraint(equalToConstant: 24).isActive = true
        leavesHeaderRow.addArrangedSubview(adminPendingBadgeLabel)

        leavesInnerStack.addArrangedSubview(leavesHeaderRow)

        adminPendingLeavesStack.axis = .vertical
        adminPendingLeavesStack.spacing = 10
        leavesInnerStack.addArrangedSubview(adminPendingLeavesStack)

        NSLayoutConstraint.activate([
            leavesInnerStack.topAnchor.constraint(equalTo: adminPendingLeavesCard.topAnchor, constant: 18),
            leavesInnerStack.bottomAnchor.constraint(equalTo: adminPendingLeavesCard.bottomAnchor, constant: -18),
            leavesInnerStack.leadingAnchor.constraint(equalTo: adminPendingLeavesCard.leadingAnchor, constant: 18),
            leavesInnerStack.trailingAnchor.constraint(equalTo: adminPendingLeavesCard.trailingAnchor, constant: -18)
        ])
        adminStackView.addArrangedSubview(adminPendingLeavesCard)

        // 5. Live Activities Feed (Audit Logs)
        let auditCard = createSectionCard(title: "Live Activities Feed", badgeText: "Live Audit", subtitle: "Real-time employee activity and audit telemetry")
        adminAuditStack.axis = .vertical
        adminAuditStack.spacing = 8
        if let content = auditCard.subviews.first(where: { $0 is UIStackView }) as? UIStackView {
            content.addArrangedSubview(adminAuditStack)
        }
        adminStackView.addArrangedSubview(auditCard)

        // 6. Company Announcements
        let annCard = createSectionCard(title: "Company Announcements")
        adminAnnouncementsStack.axis = .vertical
        adminAnnouncementsStack.spacing = 10
        if let content = annCard.subviews.first(where: { $0 is UIStackView }) as? UIStackView {
            content.addArrangedSubview(adminAnnouncementsStack)
        }
        adminStackView.addArrangedSubview(annCard)
    }

    // MARK: - Super Admin Dashboard Setup & Real-time Integration

    private func setupSuperAdminDashboard() {
        // 1. Super Admin Hero Card
        superAdminHeroCard.layer.cornerRadius = 24
        superAdminHeroCard.layer.masksToBounds = true
        superAdminHeroCard.translatesAutoresizingMaskIntoConstraints = false
        superAdminHeroCard.heightAnchor.constraint(greaterThanOrEqualToConstant: 180).isActive = true

        superAdminHeroGradient.colors = [
            UIColor(red: 6/255, green: 78/255, blue: 59/255, alpha: 1.0).cgColor,
            UIColor(red: 4/255, green: 120/255, blue: 87/255, alpha: 1.0).cgColor
        ]
        superAdminHeroGradient.startPoint = CGPoint(x: 0, y: 0)
        superAdminHeroGradient.endPoint = CGPoint(x: 1, y: 1)
        superAdminHeroCard.layer.insertSublayer(superAdminHeroGradient, at: 0)

        let heroContentStack = UIStackView()
        heroContentStack.axis = .vertical
        heroContentStack.spacing = 8
        heroContentStack.translatesAutoresizingMaskIntoConstraints = false
        superAdminHeroCard.addSubview(heroContentStack)

        let pillContainer = UIView()
        pillContainer.backgroundColor = UIColor(white: 1.0, alpha: 0.16)
        pillContainer.layer.cornerRadius = 12
        pillContainer.translatesAutoresizingMaskIntoConstraints = false

        let pillLabel = UILabel()
        pillLabel.text = "Super Admin • Platform Operations"
        pillLabel.font = .systemFont(ofSize: 11, weight: .bold)
        pillLabel.textColor = UIColor(red: 167/255, green: 243/255, blue: 208/255, alpha: 1.0)
        pillLabel.translatesAutoresizingMaskIntoConstraints = false
        pillContainer.addSubview(pillLabel)

        NSLayoutConstraint.activate([
            pillLabel.topAnchor.constraint(equalTo: pillContainer.topAnchor, constant: 4),
            pillLabel.bottomAnchor.constraint(equalTo: pillContainer.bottomAnchor, constant: -4),
            pillLabel.leadingAnchor.constraint(equalTo: pillContainer.leadingAnchor, constant: 10),
            pillLabel.trailingAnchor.constraint(equalTo: pillContainer.trailingAnchor, constant: -10)
        ])

        let pillRow = UIStackView(arrangedSubviews: [pillContainer, UIView()])
        heroContentStack.addArrangedSubview(pillRow)

        superAdminGreetingLabel.text = "Platform Executive Dashboard"
        superAdminGreetingLabel.font = .systemFont(ofSize: 22, weight: .bold)
        superAdminGreetingLabel.textColor = .white
        heroContentStack.addArrangedSubview(superAdminGreetingLabel)

        superAdminSubtitleLabel.text = "Multi-Tenant Telemetry & System Health • GlobizHR"
        superAdminSubtitleLabel.font = .systemFont(ofSize: 13, weight: .regular)
        superAdminSubtitleLabel.textColor = UIColor(red: 167/255, green: 243/255, blue: 208/255, alpha: 1.0)
        heroContentStack.addArrangedSubview(superAdminSubtitleLabel)

        let telemetryStrip = UIView()
        telemetryStrip.backgroundColor = UIColor(white: 1.0, alpha: 0.14)
        telemetryStrip.layer.cornerRadius = 12
        telemetryStrip.translatesAutoresizingMaskIntoConstraints = false
        telemetryStrip.heightAnchor.constraint(equalToConstant: 40).isActive = true

        let dotView = UIView()
        dotView.backgroundColor = UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0)
        dotView.layer.cornerRadius = 4
        dotView.translatesAutoresizingMaskIntoConstraints = false

        let telemetryLabel = UILabel()
        telemetryLabel.text = "Multi-Tenant Engine Online · Real-Time Cached"
        telemetryLabel.font = .systemFont(ofSize: 12, weight: .bold)
        telemetryLabel.textColor = .white
        telemetryLabel.translatesAutoresizingMaskIntoConstraints = false

        let liveBadge = UILabel()
        liveBadge.text = "99.98% Uptime"
        liveBadge.font = .systemFont(ofSize: 10, weight: .bold)
        liveBadge.textColor = UIColor(red: 5/255, green: 150/255, blue: 105/255, alpha: 1.0)
        liveBadge.backgroundColor = UIColor(red: 209/255, green: 250/255, blue: 229/255, alpha: 1.0)
        liveBadge.layer.cornerRadius = 8
        liveBadge.layer.masksToBounds = true
        liveBadge.textAlignment = .center
        liveBadge.translatesAutoresizingMaskIntoConstraints = false

        telemetryStrip.addSubview(dotView)
        telemetryStrip.addSubview(telemetryLabel)
        telemetryStrip.addSubview(liveBadge)

        NSLayoutConstraint.activate([
            dotView.leadingAnchor.constraint(equalTo: telemetryStrip.leadingAnchor, constant: 12),
            dotView.centerYAnchor.constraint(equalTo: telemetryStrip.centerYAnchor),
            dotView.widthAnchor.constraint(equalToConstant: 8),
            dotView.heightAnchor.constraint(equalToConstant: 8),

            telemetryLabel.leadingAnchor.constraint(equalTo: dotView.trailingAnchor, constant: 8),
            telemetryLabel.centerYAnchor.constraint(equalTo: telemetryStrip.centerYAnchor),

            liveBadge.trailingAnchor.constraint(equalTo: telemetryStrip.trailingAnchor, constant: -12),
            liveBadge.centerYAnchor.constraint(equalTo: telemetryStrip.centerYAnchor),
            liveBadge.widthAnchor.constraint(equalToConstant: 96),
            liveBadge.heightAnchor.constraint(equalToConstant: 22),
            telemetryLabel.trailingAnchor.constraint(lessThanOrEqualTo: liveBadge.leadingAnchor, constant: -8)
        ])

        heroContentStack.addArrangedSubview(telemetryStrip)

        NSLayoutConstraint.activate([
            heroContentStack.topAnchor.constraint(equalTo: superAdminHeroCard.topAnchor, constant: 20),
            heroContentStack.bottomAnchor.constraint(equalTo: superAdminHeroCard.bottomAnchor, constant: -20),
            heroContentStack.leadingAnchor.constraint(equalTo: superAdminHeroCard.leadingAnchor, constant: 20),
            heroContentStack.trailingAnchor.constraint(equalTo: superAdminHeroCard.trailingAnchor, constant: -20)
        ])
        superAdminStackView.addArrangedSubview(superAdminHeroCard)

        // 2. Super Admin 4 Executive KPI Cards (2x2 Grid)
        let kpiGrid = UIStackView()
        kpiGrid.axis = .vertical
        kpiGrid.spacing = 12
        kpiGrid.translatesAutoresizingMaskIntoConstraints = false

        let row1 = UIStackView()
        row1.axis = .horizontal
        row1.spacing = 12
        row1.distribution = .fillEqually

        superAdminTotalOrgsLabel.text = "12"
        let card1 = createStatCard(title: "Organizations", iconName: "building.2.fill", iconColor: UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0), valueLabel: superAdminTotalOrgsLabel, subtext: "10 Active · 2 Pending", subtextColor: UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0))

        superAdminTotalEmployeesLabel.text = "148"
        let card2 = createStatCard(title: "All Employees", iconName: "person.3.sequence.fill", iconColor: UIColor(red: 2/255, green: 132/255, blue: 199/255, alpha: 1.0), valueLabel: superAdminTotalEmployeesLabel, subtext: "Across All Tenants", subtextColor: UIColor(red: 2/255, green: 132/255, blue: 199/255, alpha: 1.0))

        row1.addArrangedSubview(card1)
        row1.addArrangedSubview(card2)

        let row2 = UIStackView()
        row2.axis = .horizontal
        row2.spacing = 12
        row2.distribution = .fillEqually

        superAdminMRRLabel.text = "₹2,45,000"
        let card3 = createStatCard(title: "Platform MRR", iconName: "chart.line.uptrend.xyaxis", iconColor: UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0), valueLabel: superAdminMRRLabel, subtext: "ARR: ₹29.4L · +8.4%", subtextColor: UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0))

        superAdminSubsLabel.text = "14"
        let card4 = createStatCard(title: "Subscriptions", iconName: "creditcard.fill", iconColor: UIColor(red: 13/255, green: 148/255, blue: 136/255, alpha: 1.0), valueLabel: superAdminSubsLabel, subtext: "11 Pro · 3 Trial", subtextColor: UIColor(red: 13/255, green: 148/255, blue: 136/255, alpha: 1.0))

        row2.addArrangedSubview(card3)
        row2.addArrangedSubview(card4)

        kpiGrid.addArrangedSubview(row1)
        kpiGrid.addArrangedSubview(row2)
        superAdminStackView.addArrangedSubview(kpiGrid)

        // 3. Operational Status Strip
        let opsCard = createSectionCard(title: "Platform Operations & Support")
        let opsRow = UIStackView()
        opsRow.axis = .horizontal
        opsRow.spacing = 10
        opsRow.distribution = .fillEqually
        opsRow.translatesAutoresizingMaskIntoConstraints = false

        superAdminPendingOrgsLabel.text = "2 Orgs"
        let box1 = createSmallStatusBox(title: "Pending Orgs", valueLabel: superAdminPendingOrgsLabel, valueColor: UIColor(red: 245/255, green: 158/255, blue: 11/255, alpha: 1.0))

        superAdminSuspendedLabel.text = "0 Accounts"
        let box2 = createSmallStatusBox(title: "Suspended", valueLabel: superAdminSuspendedLabel, valueColor: UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0))

        superAdminTicketsLabel.text = "3 Open"
        let box3 = createSmallStatusBox(title: "Open Tickets", valueLabel: superAdminTicketsLabel, valueColor: UIColor(red: 239/255, green: 68/255, blue: 68/255, alpha: 1.0))

        opsRow.addArrangedSubview(box1)
        opsRow.addArrangedSubview(box2)
        opsRow.addArrangedSubview(box3)

        if let content = opsCard.subviews.first(where: { $0 is UIStackView }) as? UIStackView {
            content.addArrangedSubview(opsRow)
        }
        superAdminStackView.addArrangedSubview(opsCard)

        // 4. Executive Platform Controls
        let controlsCard = createSectionCard(title: "Executive Platform Controls")
        let controlsRow = UIStackView()
        controlsRow.axis = .horizontal
        controlsRow.spacing = 10
        controlsRow.distribution = .fillEqually
        controlsRow.translatesAutoresizingMaskIntoConstraints = false

        let btnRecalculate = createActionButton(title: "Recalculate", iconName: "arrow.triangle.2.circlepath", bg: UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0), fg: .white)
        btnRecalculate.addTarget(self, action: #selector(handleSuperAdminRecalculate), for: .touchUpInside)

        let btnBroadcast = createActionButton(title: "Global Alert", iconName: "bell.badge.fill", bg: UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0), fg: .white)
        btnBroadcast.addTarget(self, action: #selector(handleSuperAdminGlobalAlert), for: .touchUpInside)

        let btnSecurity = createActionButton(title: "Audit Logs", iconName: "lock.shield.fill", bg: UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0), fg: UIColor(red: 30/255, green: 41/255, blue: 59/255, alpha: 1.0))
        btnSecurity.addTarget(self, action: #selector(handleSuperAdminSecurityLogs), for: .touchUpInside)

        controlsRow.addArrangedSubview(btnRecalculate)
        controlsRow.addArrangedSubview(btnBroadcast)
        controlsRow.addArrangedSubview(btnSecurity)

        if let content = controlsCard.subviews.first(where: { $0 is UIStackView }) as? UIStackView {
            content.addArrangedSubview(controlsRow)
        }
        superAdminStackView.addArrangedSubview(controlsCard)

        // 5. Active Tenants Overview
        let tenantsCard = createSectionCard(title: "Active Tenant Organizations")
        superAdminTenantsStack.axis = .vertical
        superAdminTenantsStack.spacing = 10
        if let content = tenantsCard.subviews.first(where: { $0 is UIStackView }) as? UIStackView {
            content.addArrangedSubview(superAdminTenantsStack)
        }
        superAdminStackView.addArrangedSubview(tenantsCard)

        // 6. Global Platform Live Audit Feed
        let auditCard = createSectionCard(title: "Platform Security Audit", badgeText: "Live Telemetry", subtitle: "Multi-tenant authentication & security event stream")
        superAdminAuditStack.axis = .vertical
        superAdminAuditStack.spacing = 8
        if let content = auditCard.subviews.first(where: { $0 is UIStackView }) as? UIStackView {
            content.addArrangedSubview(superAdminAuditStack)
        }
        superAdminStackView.addArrangedSubview(auditCard)
    }

    // MARK: - Admin Data Loading

    private func loadAdminDashboardData() {
        let name = AuthService.shared.getFirstName()
        adminGreetingLabel.text = "Welcome back, \(name.isEmpty ? "Admin" : name)!"
        let desig = AuthService.shared.getDesignation()
        let org = AuthService.shared.getOrganization()
        adminSubtitleLabel.text = "\(desig.isEmpty ? "Workspace Administrator" : desig) • \(org.isEmpty ? "GlobizHub Inc." : org)"

        // 1. Admin Live Stats
        AuthService.shared.getAdminStats { [weak self] result in
            DispatchQueue.main.async {
                self?.dismissSkeleton()
                switch result {
                case .success(let stats):
                    let total = stats["totalEmployees"] as? Int ?? 24
                    let present = stats["presentToday"] as? Int ?? 18
                    let absent = stats["absentToday"] as? Int ?? 4
                    let late = stats["lateToday"] as? Int ?? 2

                    self?.adminTotalEmployeesLabel.text = "\(total)"
                    self?.adminPresentTodayLabel.text = "\(present)"
                    self?.adminAbsentTodayLabel.text = "\(absent)"
                    self?.adminLateTodayLabel.text = "\(late)"
                case .failure:
                    break
                }
            }
        }

        // 2. Company Leaves for Approval
        AuthService.shared.getCompanyLeaves { [weak self] result in
            DispatchQueue.main.async {
                switch result {
                case .success(let leaves):
                    self?.renderAdminPendingLeaves(leaves)
                case .failure:
                    self?.renderAdminPendingLeaves(nil)
                }
            }
        }

        // 3. Live Audit Logs
        AuthService.shared.getAuditLogs(limit: 6) { [weak self] result in
            DispatchQueue.main.async {
                switch result {
                case .success(let logs):
                    self?.renderAdminAuditLogs(logs)
                case .failure:
                    self?.renderAdminAuditLogs(nil)
                }
            }
        }

        // 4. Company Announcements
        AuthService.shared.getAnnouncements { [weak self] result in
            DispatchQueue.main.async {
                switch result {
                case .success(let announcements):
                    self?.renderAdminAnnouncements(announcements)
                case .failure:
                    self?.renderAdminAnnouncements(nil)
                }
            }
        }
    }

    private func renderAdminPendingLeaves(_ leaves: [[String: Any]]?) {
        adminPendingLeavesStack.arrangedSubviews.forEach { $0.removeFromSuperview() }

        var pending: [[String: Any]] = []
        if let leaves = leaves {
            pending = leaves.filter {
                let status = ($0["status"] as? String ?? "PENDING").uppercased()
                return status == "PENDING"
            }
        }

        if pending.isEmpty {
            adminPendingBadgeLabel.text = "All Clear"
            adminPendingBadgeLabel.textColor = UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0)
            adminPendingBadgeLabel.backgroundColor = UIColor(red: 209/255, green: 250/255, blue: 229/255, alpha: 1.0)

            let emptyLabel = UILabel()
            emptyLabel.text = "All leave applications have been reviewed • No pending actions"
            emptyLabel.font = .systemFont(ofSize: 13, weight: .regular)
            emptyLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
            emptyLabel.numberOfLines = 0
            adminPendingLeavesStack.addArrangedSubview(emptyLabel)
            return
        }

        adminPendingBadgeLabel.text = "\(pending.count) Action Required"
        adminPendingBadgeLabel.textColor = UIColor(red: 245/255, green: 158/255, blue: 11/255, alpha: 1.0)
        adminPendingBadgeLabel.backgroundColor = UIColor(red: 254/255, green: 243/255, blue: 199/255, alpha: 1.0)

        for leave in pending {
            let leaveId = leave["id"] as? String ?? (leave["_id"] as? String ?? "")
            let leaveType = leave["type"] as? String ?? "Casual Leave"
            let reason = leave["reason"] as? String ?? "Personal"

            var empName = "Employee"
            if let user = leave["user"] as? [String: Any] {
                let fn = user["firstName"] as? String ?? ""
                let ln = user["lastName"] as? String ?? ""
                empName = "\(fn) \(ln)".trimmingCharacters(in: .whitespaces)
                if empName.isEmpty { empName = user["name"] as? String ?? "Employee" }
            } else if let name = leave["employeeName"] as? String {
                empName = name
            }

            let start = String((leave["startDate"] as? String ?? "Upcoming").prefix(10))
            let end = String((leave["endDate"] as? String ?? "").prefix(10))
            let dates = end.isEmpty ? start : "\(start) – \(end)"

            let itemCard = UIView()
            itemCard.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
            itemCard.layer.cornerRadius = 14
            itemCard.layer.borderWidth = 1
            itemCard.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
            itemCard.translatesAutoresizingMaskIntoConstraints = false

            let col = UIStackView()
            col.axis = .vertical
            col.spacing = 8
            col.translatesAutoresizingMaskIntoConstraints = false
            itemCard.addSubview(col)

            let header = UIStackView()
            header.axis = .horizontal
            header.alignment = .center

            let nameLbl = UILabel()
            nameLbl.text = empName
            nameLbl.font = .systemFont(ofSize: 14, weight: .bold)
            nameLbl.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
            header.addArrangedSubview(nameLbl)

            let typePill = UILabel()
            typePill.text = leaveType
            typePill.font = .systemFont(ofSize: 11, weight: .bold)
            typePill.textColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
            typePill.backgroundColor = UIColor(red: 238/255, green: 242/255, blue: 255/255, alpha: 1.0)
            typePill.layer.cornerRadius = 6
            typePill.layer.masksToBounds = true
            typePill.textAlignment = .center
            typePill.translatesAutoresizingMaskIntoConstraints = false
            typePill.heightAnchor.constraint(equalToConstant: 22).isActive = true
            typePill.widthAnchor.constraint(greaterThanOrEqualToConstant: 80).isActive = true
            header.addArrangedSubview(typePill)

            col.addArrangedSubview(header)

            let detailsLbl = UILabel()
            detailsLbl.text = "Dates: \(dates)\nReason: \(reason)"
            detailsLbl.font = .systemFont(ofSize: 12, weight: .regular)
            detailsLbl.textColor = UIColor(red: 71/255, green: 85/255, blue: 105/255, alpha: 1.0)
            detailsLbl.numberOfLines = 0
            col.addArrangedSubview(detailsLbl)

            let btnRow = UIStackView()
            btnRow.axis = .horizontal
            btnRow.spacing = 10
            btnRow.distribution = .fillEqually

            let btnApprove = UIButton(type: .system)
            btnApprove.setTitle("Approve", for: .normal)
            btnApprove.titleLabel?.font = .systemFont(ofSize: 12, weight: .bold)
            btnApprove.setTitleColor(.white, for: .normal)
            btnApprove.backgroundColor = UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0)
            btnApprove.layer.cornerRadius = 8
            btnApprove.heightAnchor.constraint(equalToConstant: 34).isActive = true
            btnApprove.addAction(UIAction { [weak self] _ in
                btnApprove.isEnabled = false
                AuthService.shared.updateLeaveStatus(id: leaveId, status: "APPROVED") { _ in
                    DispatchQueue.main.async {
                        let generator = UINotificationFeedbackGenerator()
                        generator.notificationOccurred(.success)
                        self?.loadAdminDashboardData()
                    }
                }
            }, for: .touchUpInside)

            let btnReject = UIButton(type: .system)
            btnReject.setTitle("Reject", for: .normal)
            btnReject.titleLabel?.font = .systemFont(ofSize: 12, weight: .bold)
            btnReject.setTitleColor(UIColor(red: 239/255, green: 68/255, blue: 68/255, alpha: 1.0), for: .normal)
            btnReject.backgroundColor = UIColor(red: 254/255, green: 242/255, blue: 242/255, alpha: 1.0)
            btnReject.layer.cornerRadius = 8
            btnReject.heightAnchor.constraint(equalToConstant: 34).isActive = true
            btnReject.addAction(UIAction { [weak self] _ in
                btnReject.isEnabled = false
                AuthService.shared.updateLeaveStatus(id: leaveId, status: "REJECTED") { _ in
                    DispatchQueue.main.async {
                        let generator = UINotificationFeedbackGenerator()
                        generator.notificationOccurred(.warning)
                        self?.loadAdminDashboardData()
                    }
                }
            }, for: .touchUpInside)

            btnRow.addArrangedSubview(btnApprove)
            btnRow.addArrangedSubview(btnReject)
            col.addArrangedSubview(btnRow)

            NSLayoutConstraint.activate([
                col.topAnchor.constraint(equalTo: itemCard.topAnchor, constant: 12),
                col.bottomAnchor.constraint(equalTo: itemCard.bottomAnchor, constant: -12),
                col.leadingAnchor.constraint(equalTo: itemCard.leadingAnchor, constant: 14),
                col.trailingAnchor.constraint(equalTo: itemCard.trailingAnchor, constant: -14)
            ])

            adminPendingLeavesStack.addArrangedSubview(itemCard)
        }
    }

    private func renderAdminAuditLogs(_ logs: [[String: Any]]?) {
        adminAuditStack.arrangedSubviews.forEach { $0.removeFromSuperview() }

        guard let logs = logs, !logs.isEmpty else {
            let empty = UILabel()
            empty.text = "No recent audit activity records."
            empty.font = .systemFont(ofSize: 13, weight: .regular)
            empty.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
            adminAuditStack.addArrangedSubview(empty)
            return
        }

        for log in logs.prefix(6) {
            let action = log["action"] as? String ?? (log["event"] as? String ?? "AUDIT_EVENT")
            let details = log["details"] as? String ?? (log["message"] as? String ?? "Activity logged")
            let actor = log["userName"] as? String ?? (log["actorName"] as? String ?? "Employee")
            var time = log["createdAt"] as? String ?? "Recent"
            if time.count >= 16 {
                let startIdx = time.index(time.startIndex, offsetBy: 11)
                let endIdx = time.index(time.startIndex, offsetBy: 16)
                time = String(time[startIdx..<endIdx])
            }

            let row = UIStackView()
            row.axis = .horizontal
            row.alignment = .center
            row.spacing = 10

            let pill = UILabel()
            pill.text = action.replacingOccurrences(of: "_", with: " ")
            pill.font = .systemFont(ofSize: 10, weight: .bold)
            pill.textColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
            pill.backgroundColor = UIColor(red: 238/255, green: 242/255, blue: 255/255, alpha: 1.0)
            pill.layer.cornerRadius = 6
            pill.layer.masksToBounds = true
            pill.textAlignment = .center
            pill.translatesAutoresizingMaskIntoConstraints = false
            pill.heightAnchor.constraint(equalToConstant: 20).isActive = true
            pill.widthAnchor.constraint(greaterThanOrEqualToConstant: 75).isActive = true
            row.addArrangedSubview(pill)

            let desc = UILabel()
            desc.text = "\(actor) • \(details)"
            desc.font = .systemFont(ofSize: 12, weight: .semibold)
            desc.textColor = UIColor(red: 30/255, green: 41/255, blue: 59/255, alpha: 1.0)
            desc.numberOfLines = 1
            row.addArrangedSubview(desc)

            let timeLbl = UILabel()
            timeLbl.text = time
            timeLbl.font = .systemFont(ofSize: 11, weight: .regular)
            timeLbl.textColor = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 1.0)
            timeLbl.setContentHuggingPriority(.required, for: .horizontal)
            row.addArrangedSubview(timeLbl)

            adminAuditStack.addArrangedSubview(row)
        }
    }

    private func renderAdminAnnouncements(_ announcements: [[String: Any]]?) {
        adminAnnouncementsStack.arrangedSubviews.forEach { $0.removeFromSuperview() }

        guard let announcements = announcements, !announcements.isEmpty else {
            let empty = UILabel()
            empty.text = "No active company announcements."
            empty.font = .systemFont(ofSize: 13, weight: .regular)
            empty.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
            adminAnnouncementsStack.addArrangedSubview(empty)
            return
        }

        for ann in announcements.prefix(4) {
            let title = ann["title"] as? String ?? "Company Notice"
            let content = ann["content"] as? String ?? (ann["message"] as? String ?? "")
            let author = ann["author"] as? String ?? "Management"

            let card = UIView()
            card.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
            card.layer.cornerRadius = 14
            card.layer.borderWidth = 1
            card.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
            card.translatesAutoresizingMaskIntoConstraints = false

            let col = UIStackView()
            col.axis = .vertical
            col.spacing = 4
            col.translatesAutoresizingMaskIntoConstraints = false
            card.addSubview(col)

            let titleLbl = UILabel()
            titleLbl.text = title
            titleLbl.font = .systemFont(ofSize: 13, weight: .bold)
            titleLbl.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
            col.addArrangedSubview(titleLbl)

            let contentLbl = UILabel()
            contentLbl.text = content
            contentLbl.font = .systemFont(ofSize: 12, weight: .regular)
            contentLbl.textColor = UIColor(red: 71/255, green: 85/255, blue: 105/255, alpha: 1.0)
            contentLbl.numberOfLines = 2
            col.addArrangedSubview(contentLbl)

            let authorLbl = UILabel()
            authorLbl.text = "By \(author)"
            authorLbl.font = .systemFont(ofSize: 10, weight: .regular)
            authorLbl.textColor = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 1.0)
            col.addArrangedSubview(authorLbl)

            NSLayoutConstraint.activate([
                col.topAnchor.constraint(equalTo: card.topAnchor, constant: 10),
                col.bottomAnchor.constraint(equalTo: card.bottomAnchor, constant: -10),
                col.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 12),
                col.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -12)
            ])

            adminAnnouncementsStack.addArrangedSubview(card)
        }
    }

    // MARK: - Super Admin Data Loading

    private func loadSuperAdminDashboardData() {
        let name = AuthService.shared.getFirstName()
        superAdminGreetingLabel.text = "Platform Executive Dashboard"
        superAdminSubtitleLabel.text = "Multi-Tenant Telemetry • \(name.isEmpty ? "Super Admin" : name)"

        AuthService.shared.getPlatformOverview(period: "30d") { [weak self] result in
            DispatchQueue.main.async {
                self?.dismissSkeleton()
                switch result {
                case .success(let overview):
                    self?.renderSuperAdminOverview(overview)
                case .failure:
                    self?.renderSuperAdminOverview(nil)
                }
            }
        }

        AuthService.shared.getAuditLogs(limit: 6) { [weak self] result in
            DispatchQueue.main.async {
                switch result {
                case .success(let logs):
                    self?.renderSuperAdminAuditLogs(logs)
                case .failure:
                    self?.renderSuperAdminAuditLogs(nil)
                }
            }
        }
    }

    private func renderSuperAdminOverview(_ overview: [String: Any]?) {
        let metrics = (overview?["metrics"] as? [String: Any]) ?? overview

        let totalOrgs = metrics?["totalOrganizations"] as? Int ?? 12
        let activeOrgs = metrics?["activeOrganizations"] as? Int ?? 10
        let pendingOrgs = metrics?["pendingApprovals"] as? Int ?? 2
        let totalEmployees = metrics?["totalEmployees"] as? Int ?? 148
        let mrr = metrics?["mrr"] as? Double ?? 245000.0
        let activeSubs = metrics?["subscriptions"] as? Int ?? 14
        let suspendedTenants = metrics?["suspendedTenants"] as? Int ?? 0
        let supportTickets = metrics?["supportTickets"] as? Int ?? 3

        superAdminTotalOrgsLabel.text = "\(totalOrgs)"
        superAdminOrgsSubLabel.text = "\(activeOrgs) Active · \(pendingOrgs) Pending"
        superAdminTotalEmployeesLabel.text = "\(totalEmployees)"
        let mrrInt = Int(round(mrr))
        let numFormatter = NumberFormatter()
        numFormatter.numberStyle = .decimal
        let mrrFormatted = numFormatter.string(from: NSNumber(value: mrrInt)) ?? "\(mrrInt)"
        superAdminMRRLabel.text = "₹\(mrrFormatted)"
        superAdminSubsLabel.text = "\(activeSubs)"
        superAdminPendingOrgsLabel.text = "\(pendingOrgs) Orgs"
        superAdminSuspendedLabel.text = "\(suspendedTenants) Accounts"
        superAdminTicketsLabel.text = "\(supportTickets) Open"

        // Active Tenants List
        superAdminTenantsStack.arrangedSubviews.forEach { $0.removeFromSuperview() }
        let tenants = overview?["tenants"] as? [[String: Any]] ?? [
            ["name": "GlobizHub HQ", "domain": "hq.globizhub.com", "plan": "Enterprise", "employeeCount": 68],
            ["name": "Apex Logistics Ltd", "domain": "apex.globizhub.com", "plan": "Pro Plan", "employeeCount": 42],
            ["name": "Zenith Infotech", "domain": "zenith.globizhub.com", "plan": "Pro Plan", "employeeCount": 24],
            ["name": "Aura Design Studio", "domain": "aura.globizhub.com", "plan": "Trial Plan", "employeeCount": 14]
        ]

        for tenant in tenants.prefix(4) {
            let tName = tenant["name"] as? String ?? "Organization"
            let tDomain = tenant["domain"] as? String ?? "globizhub.com"
            let tPlan = tenant["plan"] as? String ?? "Pro Plan"
            let tCount = tenant["employeeCount"] as? Int ?? 20

            let row = UIStackView()
            row.axis = .horizontal
            row.alignment = .center
            row.spacing = 10
            row.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
            row.layer.cornerRadius = 12
            row.layer.borderWidth = 1
            row.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
            row.isLayoutMarginsRelativeArrangement = true
            row.layoutMargins = UIEdgeInsets(top: 10, left: 12, bottom: 10, right: 12)

            let textCol = UIStackView()
            textCol.axis = .vertical
            textCol.spacing = 2

            let nameLbl = UILabel()
            nameLbl.text = tName
            nameLbl.font = .systemFont(ofSize: 13, weight: .bold)
            nameLbl.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
            textCol.addArrangedSubview(nameLbl)

            let domainLbl = UILabel()
            domainLbl.text = "\(tDomain) • \(tCount) Employees"
            domainLbl.font = .systemFont(ofSize: 11, weight: .regular)
            domainLbl.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
            textCol.addArrangedSubview(domainLbl)

            row.addArrangedSubview(textCol)

            let planPill = UILabel()
            planPill.text = tPlan
            planPill.font = .systemFont(ofSize: 11, weight: .bold)
            planPill.textColor = UIColor(red: 5/255, green: 150/255, blue: 105/255, alpha: 1.0)
            planPill.backgroundColor = UIColor(red: 209/255, green: 250/255, blue: 229/255, alpha: 1.0)
            planPill.layer.cornerRadius = 6
            planPill.layer.masksToBounds = true
            planPill.textAlignment = .center
            planPill.translatesAutoresizingMaskIntoConstraints = false
            planPill.heightAnchor.constraint(equalToConstant: 22).isActive = true
            planPill.widthAnchor.constraint(greaterThanOrEqualToConstant: 74).isActive = true
            row.addArrangedSubview(planPill)

            superAdminTenantsStack.addArrangedSubview(row)
        }
    }

    private func renderSuperAdminAuditLogs(_ logs: [[String: Any]]?) {
        superAdminAuditStack.arrangedSubviews.forEach { $0.removeFromSuperview() }

        guard let logs = logs, !logs.isEmpty else {
            let empty = UILabel()
            empty.text = "Platform security telemetry synchronized • No active alerts."
            empty.font = .systemFont(ofSize: 13, weight: .regular)
            empty.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
            superAdminAuditStack.addArrangedSubview(empty)
            return
        }

        for log in logs.prefix(6) {
            let action = log["action"] as? String ?? "SECURITY_AUDIT"
            let details = log["details"] as? String ?? "Multi-tenant event processed"
            let tenant = log["tenantName"] as? String ?? (log["organization"] as? String ?? "Platform Core")
            var time = log["createdAt"] as? String ?? "Recent"
            if time.count >= 16 {
                let startIdx = time.index(time.startIndex, offsetBy: 11)
                let endIdx = time.index(time.startIndex, offsetBy: 16)
                time = String(time[startIdx..<endIdx])
            }

            let row = UIStackView()
            row.axis = .horizontal
            row.alignment = .center
            row.spacing = 10

            let pill = UILabel()
            pill.text = action.replacingOccurrences(of: "_", with: " ")
            pill.font = .systemFont(ofSize: 10, weight: .bold)
            pill.textColor = UIColor(red: 5/255, green: 150/255, blue: 105/255, alpha: 1.0)
            pill.backgroundColor = UIColor(red: 209/255, green: 250/255, blue: 229/255, alpha: 1.0)
            pill.layer.cornerRadius = 6
            pill.layer.masksToBounds = true
            pill.textAlignment = .center
            pill.translatesAutoresizingMaskIntoConstraints = false
            pill.heightAnchor.constraint(equalToConstant: 20).isActive = true
            pill.widthAnchor.constraint(greaterThanOrEqualToConstant: 75).isActive = true
            row.addArrangedSubview(pill)

            let desc = UILabel()
            desc.text = "\(tenant) • \(details)"
            desc.font = .systemFont(ofSize: 12, weight: .semibold)
            desc.textColor = UIColor(red: 30/255, green: 41/255, blue: 59/255, alpha: 1.0)
            desc.numberOfLines = 1
            row.addArrangedSubview(desc)

            let timeLbl = UILabel()
            timeLbl.text = time
            timeLbl.font = .systemFont(ofSize: 11, weight: .regular)
            timeLbl.textColor = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 1.0)
            timeLbl.setContentHuggingPriority(.required, for: .horizontal)
            row.addArrangedSubview(timeLbl)

            superAdminAuditStack.addArrangedSubview(row)
        }
    }

    // MARK: - Action Handlers & Helper Dialogs

    @objc private func handleAdminBroadcastNotice() {
        let alert = UIAlertController(title: "Broadcast Company Notice", message: "Send a company-wide announcement to all active employees.", preferredStyle: .alert)
        alert.addTextField { tf in tf.placeholder = "Notice Title" }
        alert.addTextField { tf in tf.placeholder = "Notice Content & Details" }
        alert.addAction(UIAlertAction(title: "Broadcast", style: .default) { [weak self] _ in
            guard let title = alert.textFields?[0].text?.trimmingCharacters(in: .whitespaces), !title.isEmpty,
                  let content = alert.textFields?[1].text?.trimmingCharacters(in: .whitespaces), !content.isEmpty else {
                return
            }
            AuthService.shared.publishAnnouncement(title: title, content: content) { _ in
                DispatchQueue.main.async {
                    let banner = UIAlertController(title: "Broadcast Published", message: "Company notice successfully delivered.", preferredStyle: .alert)
                    banner.addAction(UIAlertAction(title: "OK", style: .default))
                    self?.present(banner, animated: true)
                    self?.loadAdminDashboardData()
                }
            }
        })
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        present(alert, animated: true)
    }

    @objc private func handleAdminScrollToApprovals() {
        let frame = adminPendingLeavesCard.convert(adminPendingLeavesCard.bounds, to: scrollView)
        scrollView.scrollRectToVisible(frame, animated: true)
    }

    @objc private func handleAdminTeamDirectory() {
        let alert = UIAlertController(title: "Team Directory", message: "Workspace active employee directory and roster.", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Close", style: .default))
        present(alert, animated: true)
    }

    @objc private func handleSuperAdminRecalculate() {
        let banner = UIAlertController(title: "Recalculating Snapshots", message: "Platform metrics recalculation has been triggered.", preferredStyle: .alert)
        present(banner, animated: true)
        AuthService.shared.recalculateSnapshots { [weak self] _ in
            DispatchQueue.main.async {
                banner.dismiss(animated: true) {
                    let okAlert = UIAlertController(title: "Snapshots Updated", message: "Platform multi-tenant metrics successfully recalculated.", preferredStyle: .alert)
                    okAlert.addAction(UIAlertAction(title: "OK", style: .default))
                    self?.present(okAlert, animated: true)
                    self?.loadSuperAdminDashboardData()
                }
            }
        }
    }

    @objc private func handleSuperAdminGlobalAlert() {
        let alert = UIAlertController(title: "Global Platform Broadcast", message: "Dispatch a platform-wide system notification across all tenants.", preferredStyle: .alert)
        alert.addTextField { tf in tf.placeholder = "Alert Title (e.g. Scheduled Maintenance)" }
        alert.addTextField { tf in tf.placeholder = "Alert Message" }
        alert.addAction(UIAlertAction(title: "Send Global Alert", style: .default) { [weak self] _ in
            guard let title = alert.textFields?[0].text?.trimmingCharacters(in: .whitespaces), !title.isEmpty,
                  let content = alert.textFields?[1].text?.trimmingCharacters(in: .whitespaces), !content.isEmpty else {
                return
            }
            AuthService.shared.publishAnnouncement(title: "[GLOBAL ALERT] \(title)", content: content) { _ in
                DispatchQueue.main.async {
                    let banner = UIAlertController(title: "Global Alert Sent", message: "Notification broadcasted across all platform tenants.", preferredStyle: .alert)
                    banner.addAction(UIAlertAction(title: "OK", style: .default))
                    self?.present(banner, animated: true)
                    self?.loadSuperAdminDashboardData()
                }
            }
        })
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        present(alert, animated: true)
    }

    @objc private func handleSuperAdminSecurityLogs() {
        loadSuperAdminDashboardData()
    }

    // Helper UI Builders
    private func createStatCard(title: String, iconName: String, iconColor: UIColor, valueLabel: UILabel, subtext: String, subtextColor: UIColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)) -> UIView {
        let card = UIView()
        card.backgroundColor = .white
        card.layer.cornerRadius = 20
        card.layer.borderWidth = 1
        card.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        card.translatesAutoresizingMaskIntoConstraints = false

        let col = UIStackView()
        col.axis = .vertical
        col.spacing = 6
        col.translatesAutoresizingMaskIntoConstraints = false
        card.addSubview(col)

        let topRow = UIStackView()
        topRow.axis = .horizontal
        topRow.alignment = .center

        let titleLbl = UILabel()
        titleLbl.text = title
        titleLbl.font = .systemFont(ofSize: 12, weight: .bold)
        titleLbl.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        topRow.addArrangedSubview(titleLbl)

        let iconWrap = UIView()
        iconWrap.backgroundColor = iconColor.withAlphaComponent(0.12)
        iconWrap.layer.cornerRadius = 14
        iconWrap.translatesAutoresizingMaskIntoConstraints = false
        iconWrap.widthAnchor.constraint(equalToConstant: 28).isActive = true
        iconWrap.heightAnchor.constraint(equalToConstant: 28).isActive = true

        let iv = UIImageView(image: UIImage(systemName: iconName))
        iv.tintColor = iconColor
        iv.contentMode = .scaleAspectFit
        iv.translatesAutoresizingMaskIntoConstraints = false
        iconWrap.addSubview(iv)
        NSLayoutConstraint.activate([
            iv.centerXAnchor.constraint(equalTo: iconWrap.centerXAnchor),
            iv.centerYAnchor.constraint(equalTo: iconWrap.centerYAnchor),
            iv.widthAnchor.constraint(equalToConstant: 14),
            iv.heightAnchor.constraint(equalToConstant: 14)
        ])
        topRow.addArrangedSubview(iconWrap)
        col.addArrangedSubview(topRow)

        valueLabel.font = .systemFont(ofSize: 22, weight: .bold)
        valueLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        col.addArrangedSubview(valueLabel)

        let subLbl = UILabel()
        subLbl.text = subtext
        subLbl.font = .systemFont(ofSize: 11, weight: .medium)
        subLbl.textColor = subtextColor
        col.addArrangedSubview(subLbl)

        NSLayoutConstraint.activate([
            col.topAnchor.constraint(equalTo: card.topAnchor, constant: 14),
            col.bottomAnchor.constraint(equalTo: card.bottomAnchor, constant: -14),
            col.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 14),
            col.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -14)
        ])
        return card
    }

    private func createSectionCard(title: String, badgeText: String? = nil, subtitle: String? = nil) -> UIView {
        let card = UIView()
        card.backgroundColor = .white
        card.layer.cornerRadius = 20
        card.layer.borderWidth = 1
        card.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        card.translatesAutoresizingMaskIntoConstraints = false

        let col = UIStackView()
        col.axis = .vertical
        col.spacing = 10
        col.translatesAutoresizingMaskIntoConstraints = false
        card.addSubview(col)

        let topRow = UIStackView()
        topRow.axis = .horizontal
        topRow.alignment = .center

        let titleLbl = UILabel()
        titleLbl.text = title
        titleLbl.font = .systemFont(ofSize: 16, weight: .bold)
        titleLbl.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        topRow.addArrangedSubview(titleLbl)

        if let badgeText = badgeText {
            let badge = UILabel()
            badge.text = badgeText
            badge.font = .systemFont(ofSize: 10, weight: .bold)
            badge.textColor = UIColor(red: 5/255, green: 150/255, blue: 105/255, alpha: 1.0)
            badge.backgroundColor = UIColor(red: 209/255, green: 250/255, blue: 229/255, alpha: 1.0)
            badge.layer.cornerRadius = 6
            badge.layer.masksToBounds = true
            badge.textAlignment = .center
            badge.translatesAutoresizingMaskIntoConstraints = false
            badge.heightAnchor.constraint(equalToConstant: 20).isActive = true
            badge.widthAnchor.constraint(greaterThanOrEqualToConstant: 68).isActive = true
            topRow.addArrangedSubview(badge)
        }
        col.addArrangedSubview(topRow)

        if let subtitle = subtitle {
            let subLbl = UILabel()
            subLbl.text = subtitle
            subLbl.font = .systemFont(ofSize: 12, weight: .regular)
            subLbl.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
            col.addArrangedSubview(subLbl)
        }

        NSLayoutConstraint.activate([
            col.topAnchor.constraint(equalTo: card.topAnchor, constant: 18),
            col.bottomAnchor.constraint(equalTo: card.bottomAnchor, constant: -18),
            col.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 18),
            col.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -18)
        ])
        return card
    }

    private func createSmallStatusBox(title: String, valueLabel: UILabel, valueColor: UIColor) -> UIView {
        let box = UIView()
        box.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
        box.layer.cornerRadius = 12
        box.layer.borderWidth = 1
        box.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        box.translatesAutoresizingMaskIntoConstraints = false

        let col = UIStackView()
        col.axis = .vertical
        col.alignment = .center
        col.spacing = 2
        col.translatesAutoresizingMaskIntoConstraints = false
        box.addSubview(col)

        let titleLbl = UILabel()
        titleLbl.text = title
        titleLbl.font = .systemFont(ofSize: 10, weight: .bold)
        titleLbl.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        col.addArrangedSubview(titleLbl)

        valueLabel.font = .systemFont(ofSize: 13, weight: .bold)
        valueLabel.textColor = valueColor
        col.addArrangedSubview(valueLabel)

        NSLayoutConstraint.activate([
            col.topAnchor.constraint(equalTo: box.topAnchor, constant: 10),
            col.bottomAnchor.constraint(equalTo: box.bottomAnchor, constant: -10),
            col.leadingAnchor.constraint(equalTo: box.leadingAnchor, constant: 6),
            col.trailingAnchor.constraint(equalTo: box.trailingAnchor, constant: -6)
        ])
        return box
    }

    private func createActionButton(title: String, iconName: String, bg: UIColor, fg: UIColor) -> UIButton {
        let btn = UIButton(type: .system)
        btn.setTitle(" \(title)", for: .normal)
        btn.setImage(UIImage(systemName: iconName), for: .normal)
        btn.tintColor = fg
        btn.setTitleColor(fg, for: .normal)
        btn.titleLabel?.font = .systemFont(ofSize: 12, weight: .bold)
        btn.backgroundColor = bg
        btn.layer.cornerRadius = 10
        btn.heightAnchor.constraint(equalToConstant: 40).isActive = true
        return btn
    }
}

// MARK: - Gradient & Video Card Helper
private class GradientCardView: UIView {
    private let fallbackGradient = CAGradientLayer()
    private var player: AVQueuePlayer?
    private var playerLooper: AVPlayerLooper?
    private var playerLayer: AVPlayerLayer?
    private let overlayLayer = CAGradientLayer()

    override init(frame: CGRect) {
        super.init(frame: frame)
        setupLayers()
        setupVideo()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupLayers()
        setupVideo()
    }

    private func setupLayers() {
        layer.cornerRadius = 24
        layer.masksToBounds = true

        fallbackGradient.colors = [
            UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0).cgColor,
            UIColor(red: 2/255, green: 6/255, blue: 23/255, alpha: 1.0).cgColor
        ]
        fallbackGradient.startPoint = CGPoint(x: 0.0, y: 0.0)
        fallbackGradient.endPoint = CGPoint(x: 1.0, y: 1.0)
        layer.insertSublayer(fallbackGradient, at: 0)

        overlayLayer.colors = [
            UIColor(white: 0.0, alpha: 0.15).cgColor,
            UIColor(red: 2/255, green: 6/255, blue: 23/255, alpha: 0.35).cgColor
        ]
        overlayLayer.locations = [0.0, 1.0]
    }

    private func setupVideo() {
        let videoURL: URL?
        if let localURL = Bundle.main.url(forResource: "bg_video", withExtension: "mp4") {
            videoURL = localURL
        } else if let publicURL = Bundle.main.url(forResource: "public/bg_video", withExtension: "mp4") {
            videoURL = publicURL
        } else {
            videoURL = URL(string: "https://v1.pinimg.com/videos/iht/expMp4/73/85/cf/7385cf9e80df8eb36661b7400684df1f_720w.mp4")
        }

        guard let targetURL = videoURL else { return }

        let asset = AVURLAsset(url: targetURL)
        let playerItem = AVPlayerItem(asset: asset)
        let queuePlayer = AVQueuePlayer(playerItem: playerItem)
        queuePlayer.isMuted = true
        self.playerLooper = AVPlayerLooper(player: queuePlayer, templateItem: playerItem)
        self.player = queuePlayer

        let layer = AVPlayerLayer(player: queuePlayer)
        layer.videoGravity = .resizeAspectFill
        layer.frame = bounds
        self.playerLayer = layer

        self.layer.insertSublayer(layer, above: fallbackGradient)
        self.layer.insertSublayer(overlayLayer, above: layer)

        queuePlayer.play()

        NotificationCenter.default.addObserver(self, selector: #selector(handleAppForeground), name: UIApplication.willEnterForegroundNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(handleAppBackground), name: UIApplication.didEnterBackgroundNotification, object: nil)
    }

    @objc private func handleAppForeground() {
        player?.play()
    }

    @objc private func handleAppBackground() {
        player?.pause()
    }

    func play() {
        player?.play()
    }

    func pause() {
        player?.pause()
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        CATransaction.begin()
        CATransaction.setDisableActions(true)
        fallbackGradient.frame = bounds
        playerLayer?.frame = bounds
        overlayLayer.frame = bounds
        CATransaction.commit()
    }

    deinit {
        player?.pause()
        playerLooper = nil
        player = nil
        NotificationCenter.default.removeObserver(self)
    }
}

// MARK: - Skeleton Shimmer View for Home Dashboard
final class HomeSkeletonOverlay: UIView {
    private let scrollView = UIScrollView()
    private let stack = UIStackView()

    override init(frame: CGRect) {
        super.init(frame: frame)
        backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
        translatesAutoresizingMaskIntoConstraints = false

        scrollView.translatesAutoresizingMaskIntoConstraints = false
        scrollView.showsVerticalScrollIndicator = false
        addSubview(scrollView)

        stack.axis = .vertical
        stack.spacing = 16
        stack.translatesAutoresizingMaskIntoConstraints = false
        scrollView.addSubview(stack)

        NSLayoutConstraint.activate([
            scrollView.topAnchor.constraint(equalTo: topAnchor),
            scrollView.leadingAnchor.constraint(equalTo: leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: trailingAnchor),
            scrollView.bottomAnchor.constraint(equalTo: bottomAnchor),

            stack.topAnchor.constraint(equalTo: scrollView.topAnchor, constant: 16),
            stack.leadingAnchor.constraint(equalTo: scrollView.leadingAnchor, constant: 16),
            stack.trailingAnchor.constraint(equalTo: scrollView.trailingAnchor, constant: -16),
            stack.bottomAnchor.constraint(equalTo: scrollView.bottomAnchor, constant: -32),
            stack.widthAnchor.constraint(equalTo: scrollView.widthAnchor, constant: -32)
        ])

        // 1. Hero Card Placeholder
        stack.addArrangedSubview(createHeroSkeleton())
        // 2. Active Shift Timer Card Placeholder
        stack.addArrangedSubview(createTimerSkeleton())
        // 3. Leaves Card Placeholder
        stack.addArrangedSubview(createLeavesSkeleton())
        // 4. Upcoming Holidays Card Placeholder
        stack.addArrangedSubview(createHolidaysSkeleton())
        // 5. Heatmap Card Placeholder
        stack.addArrangedSubview(createHeatmapSkeleton())
    }

    required init?(coder: NSCoder) { fatalError() }

    private func createPulseAnimation() -> CABasicAnimation {
        let pulse = CABasicAnimation(keyPath: "opacity")
        pulse.duration = 0.85
        pulse.fromValue = 0.40
        pulse.toValue = 0.95
        pulse.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
        pulse.autoreverses = true
        pulse.repeatCount = .infinity
        return pulse
    }

    private func makeBar(width: CGFloat? = nil, height: CGFloat, cornerRadius: CGFloat = 8, color: UIColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0)) -> UIView {
        let v = UIView()
        v.backgroundColor = color
        v.layer.cornerRadius = cornerRadius
        v.translatesAutoresizingMaskIntoConstraints = false
        v.heightAnchor.constraint(equalToConstant: height).isActive = true
        if let w = width {
            v.widthAnchor.constraint(equalToConstant: w).isActive = true
        }
        v.layer.add(createPulseAnimation(), forKey: "pulse")
        return v
    }

    // 1. Hero Card
    private func createHeroSkeleton() -> UIView {
        let card = UIView()
        card.backgroundColor = UIColor(red: 13/255, green: 27/255, blue: 42/255, alpha: 1.0)
        card.layer.cornerRadius = 24
        card.layer.masksToBounds = true
        card.translatesAutoresizingMaskIntoConstraints = false

        let pillColor = UIColor.white.withAlphaComponent(0.22)
        let portalPill = makeBar(width: 110, height: 22, cornerRadius: 11, color: pillColor)
        let greeting = makeBar(width: 190, height: 26, cornerRadius: 8, color: pillColor)
        let subtitle = makeBar(width: 140, height: 14, cornerRadius: 6, color: pillColor)
        let shiftPill = makeBar(height: 38, cornerRadius: 12, color: UIColor.white.withAlphaComponent(0.28))

        card.addSubview(portalPill)
        card.addSubview(greeting)
        card.addSubview(subtitle)
        card.addSubview(shiftPill)

        NSLayoutConstraint.activate([
            portalPill.topAnchor.constraint(equalTo: card.topAnchor, constant: 18),
            portalPill.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 18),

            greeting.topAnchor.constraint(equalTo: portalPill.bottomAnchor, constant: 14),
            greeting.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 18),

            subtitle.topAnchor.constraint(equalTo: greeting.bottomAnchor, constant: 8),
            subtitle.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 18),

            shiftPill.topAnchor.constraint(equalTo: subtitle.bottomAnchor, constant: 16),
            shiftPill.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 18),
            shiftPill.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -18),
            shiftPill.bottomAnchor.constraint(equalTo: card.bottomAnchor, constant: -18)
        ])
        return card
    }

    // 2. Timer Card
    private func createTimerSkeleton() -> UIView {
        let card = UIView()
        card.backgroundColor = .white
        card.layer.cornerRadius = 24
        card.layer.shadowColor = UIColor.black.cgColor
        card.layer.shadowOpacity = 0.04
        card.layer.shadowOffset = CGSize(width: 0, height: 4)
        card.layer.shadowRadius = 10
        card.translatesAutoresizingMaskIntoConstraints = false

        let headerBar = makeBar(width: 130, height: 14, cornerRadius: 6)
        let timerBar = makeBar(width: 180, height: 34, cornerRadius: 10)
        let statusDot = makeBar(width: 100, height: 12, cornerRadius: 6)

        let punchCircle = UIView()
        punchCircle.backgroundColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0)
        punchCircle.layer.cornerRadius = 44
        punchCircle.translatesAutoresizingMaskIntoConstraints = false
        punchCircle.layer.add(createPulseAnimation(), forKey: "pulse")

        let holdText = makeBar(width: 130, height: 14, cornerRadius: 6)
        let breakPill = makeBar(width: 160, height: 42, cornerRadius: 21, color: UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0))

        card.addSubview(headerBar)
        card.addSubview(timerBar)
        card.addSubview(statusDot)
        card.addSubview(punchCircle)
        card.addSubview(holdText)
        card.addSubview(breakPill)

        NSLayoutConstraint.activate([
            headerBar.topAnchor.constraint(equalTo: card.topAnchor, constant: 22),
            headerBar.centerXAnchor.constraint(equalTo: card.centerXAnchor),

            timerBar.topAnchor.constraint(equalTo: headerBar.bottomAnchor, constant: 10),
            timerBar.centerXAnchor.constraint(equalTo: card.centerXAnchor),

            statusDot.topAnchor.constraint(equalTo: timerBar.bottomAnchor, constant: 8),
            statusDot.centerXAnchor.constraint(equalTo: card.centerXAnchor),

            punchCircle.topAnchor.constraint(equalTo: statusDot.bottomAnchor, constant: 16),
            punchCircle.centerXAnchor.constraint(equalTo: card.centerXAnchor),
            punchCircle.widthAnchor.constraint(equalToConstant: 88),
            punchCircle.heightAnchor.constraint(equalToConstant: 88),

            holdText.topAnchor.constraint(equalTo: punchCircle.bottomAnchor, constant: 14),
            holdText.centerXAnchor.constraint(equalTo: card.centerXAnchor),

            breakPill.topAnchor.constraint(equalTo: holdText.bottomAnchor, constant: 16),
            breakPill.centerXAnchor.constraint(equalTo: card.centerXAnchor),
            breakPill.bottomAnchor.constraint(equalTo: card.bottomAnchor, constant: -22)
        ])
        return card
    }

    // 3. Leaves Card
    private func createLeavesSkeleton() -> UIView {
        let card = UIView()
        card.backgroundColor = .white
        card.layer.cornerRadius = 20
        card.layer.shadowColor = UIColor.black.cgColor
        card.layer.shadowOpacity = 0.03
        card.layer.shadowOffset = CGSize(width: 0, height: 3)
        card.layer.shadowRadius = 8
        card.translatesAutoresizingMaskIntoConstraints = false

        let title = makeBar(width: 80, height: 18, cornerRadius: 8)
        let icon = makeBar(width: 24, height: 24, cornerRadius: 12)
        let metric1 = makeBar(width: 95, height: 14, cornerRadius: 6)
        let metric2 = makeBar(width: 105, height: 14, cornerRadius: 6)
        let track = makeBar(height: 8, cornerRadius: 4)

        card.addSubview(title)
        card.addSubview(icon)
        card.addSubview(metric1)
        card.addSubview(metric2)
        card.addSubview(track)

        NSLayoutConstraint.activate([
            title.topAnchor.constraint(equalTo: card.topAnchor, constant: 18),
            title.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 18),

            icon.centerYAnchor.constraint(equalTo: title.centerYAnchor),
            icon.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -18),

            metric1.topAnchor.constraint(equalTo: title.bottomAnchor, constant: 14),
            metric1.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 18),

            metric2.centerYAnchor.constraint(equalTo: metric1.centerYAnchor),
            metric2.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -18),

            track.topAnchor.constraint(equalTo: metric1.bottomAnchor, constant: 12),
            track.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 18),
            track.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -18),
            track.bottomAnchor.constraint(equalTo: card.bottomAnchor, constant: -18)
        ])
        return card
    }

    // 4. Upcoming Holidays Card
    private func createHolidaysSkeleton() -> UIView {
        let card = UIView()
        card.backgroundColor = .white
        card.layer.cornerRadius = 20
        card.layer.shadowColor = UIColor.black.cgColor
        card.layer.shadowOpacity = 0.03
        card.layer.shadowOffset = CGSize(width: 0, height: 3)
        card.layer.shadowRadius = 8
        card.translatesAutoresizingMaskIntoConstraints = false

        let title = makeBar(width: 140, height: 18, cornerRadius: 8)
        let holName = makeBar(width: 120, height: 16, cornerRadius: 6)
        let holDate = makeBar(width: 80, height: 12, cornerRadius: 6)
        let tagPill = makeBar(width: 85, height: 26, cornerRadius: 13, color: UIColor(red: 254/255, green: 243/255, blue: 199/255, alpha: 0.6))

        card.addSubview(title)
        card.addSubview(holName)
        card.addSubview(holDate)
        card.addSubview(tagPill)

        NSLayoutConstraint.activate([
            title.topAnchor.constraint(equalTo: card.topAnchor, constant: 18),
            title.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 18),

            holName.topAnchor.constraint(equalTo: title.bottomAnchor, constant: 14),
            holName.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 18),

            holDate.topAnchor.constraint(equalTo: holName.bottomAnchor, constant: 6),
            holDate.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 18),
            holDate.bottomAnchor.constraint(equalTo: card.bottomAnchor, constant: -18),

            tagPill.centerYAnchor.constraint(equalTo: holName.centerYAnchor),
            tagPill.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -18)
        ])
        return card
    }

    // 5. Heatmap Card
    private func createHeatmapSkeleton() -> UIView {
        let card = UIView()
        card.backgroundColor = .white
        card.layer.cornerRadius = 20
        card.layer.shadowColor = UIColor.black.cgColor
        card.layer.shadowOpacity = 0.03
        card.layer.shadowOffset = CGSize(width: 0, height: 3)
        card.layer.shadowRadius = 8
        card.translatesAutoresizingMaskIntoConstraints = false

        let title = makeBar(width: 150, height: 18, cornerRadius: 8)
        let seg = makeBar(width: 90, height: 28, cornerRadius: 14, color: UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0))
        let nav = makeBar(width: 130, height: 16, cornerRadius: 6)

        card.addSubview(title)
        card.addSubview(seg)
        card.addSubview(nav)

        let gridStack = UIStackView()
        gridStack.axis = .vertical
        gridStack.spacing = 6
        gridStack.translatesAutoresizingMaskIntoConstraints = false
        card.addSubview(gridStack)

        for _ in 0..<2 {
            let row = UIStackView()
            row.axis = .horizontal
            row.distribution = .equalSpacing
            for _ in 0..<7 {
                let cell = makeBar(width: 28, height: 28, cornerRadius: 6)
                row.addArrangedSubview(cell)
            }
            gridStack.addArrangedSubview(row)
        }

        NSLayoutConstraint.activate([
            title.topAnchor.constraint(equalTo: card.topAnchor, constant: 18),
            title.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 18),

            seg.centerYAnchor.constraint(equalTo: title.centerYAnchor),
            seg.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -18),

            nav.topAnchor.constraint(equalTo: title.bottomAnchor, constant: 16),
            nav.centerXAnchor.constraint(equalTo: card.centerXAnchor),

            gridStack.topAnchor.constraint(equalTo: nav.bottomAnchor, constant: 14),
            gridStack.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 18),
            gridStack.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -18),
            gridStack.bottomAnchor.constraint(equalTo: card.bottomAnchor, constant: -20)
        ])
        return card
    }
}

// MARK: - Team Roster Modal Dialog
class TeamRosterModalViewController: UIViewController, UITableViewDataSource, UITableViewDelegate {
    var teamMembers: [[String: Any]] = []
    var organizationName: String = "GlobizHub Inc."

    private let dimOverlay = UIView()
    private let containerView = UIView()
    private let titleLabel = UILabel()
    private let subtitleLabel = UILabel()
    private let closeButton = UIButton(type: .system)
    private let tableView = UITableView()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .clear

        dimOverlay.backgroundColor = UIColor.black.withAlphaComponent(0.45)
        dimOverlay.translatesAutoresizingMaskIntoConstraints = false
        dimOverlay.isUserInteractionEnabled = true
        dimOverlay.addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(didTapClose)))
        view.addSubview(dimOverlay)

        containerView.backgroundColor = .white
        containerView.layer.cornerRadius = 24
        containerView.layer.masksToBounds = true
        containerView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(containerView)

        titleLabel.text = organizationName
        titleLabel.font = .systemFont(ofSize: 18, weight: .bold)
        titleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        containerView.addSubview(titleLabel)

        let count = teamMembers.count
        subtitleLabel.text = "\(count) \(count == 1 ? "Employee" : "Employees")"
        subtitleLabel.font = .systemFont(ofSize: 13, weight: .semibold)
        subtitleLabel.textColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        subtitleLabel.translatesAutoresizingMaskIntoConstraints = false
        containerView.addSubview(subtitleLabel)

        let xConfig = UIImage.SymbolConfiguration(pointSize: 13, weight: .bold)
        closeButton.setImage(UIImage(systemName: "xmark", withConfiguration: xConfig), for: .normal)
        closeButton.tintColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        closeButton.backgroundColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0)
        closeButton.layer.cornerRadius = 16
        closeButton.translatesAutoresizingMaskIntoConstraints = false
        closeButton.addTarget(self, action: #selector(didTapClose), for: .touchUpInside)
        containerView.addSubview(closeButton)

        let divider = UIView()
        divider.backgroundColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0)
        divider.translatesAutoresizingMaskIntoConstraints = false
        containerView.addSubview(divider)

        tableView.dataSource = self
        tableView.delegate = self
        tableView.separatorStyle = .none
        tableView.backgroundColor = .clear
        tableView.translatesAutoresizingMaskIntoConstraints = false
        tableView.register(TeamRosterCell.self, forCellReuseIdentifier: "TeamRosterCell")
        containerView.addSubview(tableView)

        let modalHeight = min(500, CGFloat(120 + max(1, teamMembers.count) * 64))

        NSLayoutConstraint.activate([
            dimOverlay.topAnchor.constraint(equalTo: view.topAnchor),
            dimOverlay.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            dimOverlay.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            dimOverlay.bottomAnchor.constraint(equalTo: view.bottomAnchor),

            containerView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            containerView.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            containerView.widthAnchor.constraint(equalTo: view.widthAnchor, multiplier: 0.9, constant: 0),
            containerView.heightAnchor.constraint(equalToConstant: modalHeight),

            titleLabel.topAnchor.constraint(equalTo: containerView.topAnchor, constant: 20),
            titleLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 20),
            titleLabel.trailingAnchor.constraint(equalTo: closeButton.leadingAnchor, constant: -12),

            subtitleLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 4),
            subtitleLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 20),

            closeButton.topAnchor.constraint(equalTo: containerView.topAnchor, constant: 18),
            closeButton.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -18),
            closeButton.widthAnchor.constraint(equalToConstant: 32),
            closeButton.heightAnchor.constraint(equalToConstant: 32),

            divider.topAnchor.constraint(equalTo: subtitleLabel.bottomAnchor, constant: 16),
            divider.leadingAnchor.constraint(equalTo: containerView.leadingAnchor),
            divider.trailingAnchor.constraint(equalTo: containerView.trailingAnchor),
            divider.heightAnchor.constraint(equalToConstant: 1),

            tableView.topAnchor.constraint(equalTo: divider.bottomAnchor, constant: 8),
            tableView.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 12),
            tableView.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -12),
            tableView.bottomAnchor.constraint(equalTo: containerView.bottomAnchor, constant: -16)
        ])
    }

    @objc private func didTapClose() {
        dismiss(animated: true)
    }

    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return teamMembers.count
    }

    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return 60
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "TeamRosterCell", for: indexPath) as! TeamRosterCell
        let member = teamMembers[indexPath.row]
        cell.configure(with: member, index: indexPath.row)
        return cell
    }
}

class TeamRosterCell: UITableViewCell {
    private let avatarCircle = UIView()
    private let avatarLabel = UILabel()
    private let nameLabel = UILabel()
    private let roleLabel = UILabel()
    private let statusBadge = UIView()
    private let statusLabel = UILabel()

    private let colors: [UIColor] = [
        UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0),
        UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0),
        UIColor(red: 245/255, green: 158/255, blue: 11/255, alpha: 1.0),
        UIColor(red: 139/255, green: 92/255, blue: 246/255, alpha: 1.0),
        UIColor(red: 236/255, green: 72/255, blue: 153/255, alpha: 1.0)
    ]

    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        selectionStyle = .none
        backgroundColor = .clear

        avatarCircle.layer.cornerRadius = 18
        avatarCircle.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(avatarCircle)

        avatarLabel.font = .systemFont(ofSize: 13, weight: .bold)
        avatarLabel.textColor = .white
        avatarLabel.textAlignment = .center
        avatarLabel.translatesAutoresizingMaskIntoConstraints = false
        avatarCircle.addSubview(avatarLabel)

        let textStack = UIStackView()
        textStack.axis = .vertical
        textStack.spacing = 2
        textStack.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(textStack)

        nameLabel.font = .systemFont(ofSize: 14, weight: .bold)
        nameLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        textStack.addArrangedSubview(nameLabel)

        roleLabel.font = .systemFont(ofSize: 12, weight: .regular)
        roleLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        textStack.addArrangedSubview(roleLabel)

        statusBadge.backgroundColor = UIColor(red: 236/255, green: 253/255, blue: 245/255, alpha: 1.0)
        statusBadge.layer.cornerRadius = 10
        statusBadge.layer.borderWidth = 1
        statusBadge.layer.borderColor = UIColor(red: 167/255, green: 243/255, blue: 208/255, alpha: 1.0).cgColor
        statusBadge.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(statusBadge)

        statusLabel.text = "Active"
        statusLabel.font = .systemFont(ofSize: 11, weight: .bold)
        statusLabel.textColor = UIColor(red: 5/255, green: 150/255, blue: 105/255, alpha: 1.0)
        statusLabel.translatesAutoresizingMaskIntoConstraints = false
        statusBadge.addSubview(statusLabel)

        NSLayoutConstraint.activate([
            avatarCircle.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 8),
            avatarCircle.centerYAnchor.constraint(equalTo: contentView.centerYAnchor),
            avatarCircle.widthAnchor.constraint(equalToConstant: 36),
            avatarCircle.heightAnchor.constraint(equalToConstant: 36),

            avatarLabel.centerXAnchor.constraint(equalTo: avatarCircle.centerXAnchor),
            avatarLabel.centerYAnchor.constraint(equalTo: avatarCircle.centerYAnchor),

            textStack.leadingAnchor.constraint(equalTo: avatarCircle.trailingAnchor, constant: 12),
            textStack.centerYAnchor.constraint(equalTo: contentView.centerYAnchor),
            textStack.trailingAnchor.constraint(lessThanOrEqualTo: statusBadge.leadingAnchor, constant: -8),

            statusBadge.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -8),
            statusBadge.centerYAnchor.constraint(equalTo: contentView.centerYAnchor),
            statusBadge.heightAnchor.constraint(equalToConstant: 22),

            statusLabel.leadingAnchor.constraint(equalTo: statusBadge.leadingAnchor, constant: 8),
            statusLabel.trailingAnchor.constraint(equalTo: statusBadge.trailingAnchor, constant: -8),
            statusLabel.centerYAnchor.constraint(equalTo: statusBadge.centerYAnchor)
        ])
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

    func configure(with member: [String: Any], index: Int) {
        let fn = member["firstName"] as? String ?? ""
        let ln = member["lastName"] as? String ?? ""
        let fullName = "\(fn) \(ln)".trimmingCharacters(in: .whitespaces)
        nameLabel.text = fullName.isEmpty ? "Team Member" : fullName

        let initial = !fn.isEmpty ? String(fn.prefix(1)).uppercased() : (!fullName.isEmpty ? String(fullName.prefix(1)).uppercased() : "E")
        avatarLabel.text = initial
        avatarCircle.backgroundColor = colors[index % colors.count]

        var desig = (member["designation"] as? [String: Any])?["name"] as? String ?? member["designation"] as? String ?? ""
        if desig.isEmpty {
            desig = member["role"] as? String ?? "Employee"
        }
        let dept = (member["department"] as? [String: Any])?["name"] as? String ?? member["department"] as? String ?? ""
        roleLabel.text = dept.isEmpty ? desig : "\(desig) • \(dept)"
    }
}
