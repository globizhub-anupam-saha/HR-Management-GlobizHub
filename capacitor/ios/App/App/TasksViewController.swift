import UIKit

class TasksViewController: UIViewController, UIScrollViewDelegate {

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

    private let weekScrollView = UIScrollView()
    private let weekStackView = UIStackView()

    private let upcomingShiftsStackView = UIStackView()
    private let emptyShiftsLabel = UILabel()

    // MARK: - Auto-Hide Bottom Navigation on Scroll Down, Reveal on Scroll Up
    private var lastScrollOffsetY: CGFloat = 0
    private var isNavBarHidden: Bool = false

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
        navigationController?.setNavigationBarHidden(true, animated: false)

        setupTopBar()
        setupScrollView()
        setupOverviewHeader()
        setupWeeklyOverviewCard()
        setupUpcomingShiftsCard()
        setupBottomNavBar()

        renderFallbackWeek()
        loadScheduleData()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        setupBottomNavBar()
        view.bringSubviewToFront(bottomNavBar)
        updateHeaderState()
        loadScheduleData()
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

        topBarTitleLabel.text = "Schedule"
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

    // MARK: - Overview Header
    private func setupOverviewHeader() {
        let container = UIStackView()
        container.axis = .horizontal
        container.distribution = .equalSpacing
        container.alignment = .center

        let textStack = UIStackView()
        textStack.axis = .vertical
        textStack.spacing = 2

        let titleLabel = UILabel()
        titleLabel.text = "My Roster"
        titleLabel.font = .systemFont(ofSize: 22, weight: .bold)
        titleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        textStack.addArrangedSubview(titleLabel)

        let subLabel = UILabel()
        subLabel.text = "View your assigned shifts, schedules, and active overrides."
        subLabel.font = .systemFont(ofSize: 13, weight: .regular)
        subLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        textStack.addArrangedSubview(subLabel)
        container.addArrangedSubview(textStack)

        // Week badge pill
        let weekPill = UIStackView()
        weekPill.axis = .horizontal
        weekPill.spacing = 6
        weekPill.alignment = .center
        weekPill.backgroundColor = .white
        weekPill.layer.cornerRadius = 10
        weekPill.layer.borderWidth = 1
        weekPill.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        weekPill.isLayoutMarginsRelativeArrangement = true
        weekPill.layoutMargins = UIEdgeInsets(top: 6, left: 10, bottom: 6, right: 10)

        let calIcon = UIImageView(image: UIImage(systemName: "calendar"))
        calIcon.tintColor = UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0)
        calIcon.translatesAutoresizingMaskIntoConstraints = false
        calIcon.widthAnchor.constraint(equalToConstant: 14).isActive = true
        calIcon.heightAnchor.constraint(equalToConstant: 14).isActive = true
        weekPill.addArrangedSubview(calIcon)

        let weekLabel = UILabel()
        weekLabel.text = "Upcoming 7 Days"
        weekLabel.font = .systemFont(ofSize: 12, weight: .semibold)
        weekLabel.textColor = UIColor(red: 51/255, green: 65/255, blue: 85/255, alpha: 1.0)
        weekPill.addArrangedSubview(weekLabel)

        container.addArrangedSubview(weekPill)
        contentStackView.addArrangedSubview(container)
    }

    // MARK: - Weekly Overview Card
    private func setupWeeklyOverviewCard() {
        let card = UIView()
        card.backgroundColor = .white
        card.layer.cornerRadius = 18
        card.layer.borderWidth = 1
        card.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor

        let innerStack = UIStackView()
        innerStack.axis = .vertical
        innerStack.spacing = 14
        innerStack.translatesAutoresizingMaskIntoConstraints = false
        card.addSubview(innerStack)

        let headerStack = UIStackView()
        headerStack.axis = .vertical
        headerStack.spacing = 2

        let cardTitle = UILabel()
        cardTitle.text = "Weekly Overview"
        cardTitle.font = .systemFont(ofSize: 16, weight: .bold)
        cardTitle.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        headerStack.addArrangedSubview(cardTitle)

        let cardSub = UILabel()
        cardSub.text = "A quick glance at your week ahead showing active schedules."
        cardSub.font = .systemFont(ofSize: 12, weight: .regular)
        cardSub.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        headerStack.addArrangedSubview(cardSub)
        innerStack.addArrangedSubview(headerStack)

        // Horizontal scroll view for days
        weekScrollView.showsHorizontalScrollIndicator = false
        weekScrollView.translatesAutoresizingMaskIntoConstraints = false
        innerStack.addArrangedSubview(weekScrollView)

        weekStackView.axis = .horizontal
        weekStackView.spacing = 10
        weekStackView.alignment = .fill
        weekStackView.distribution = .fill
        weekStackView.translatesAutoresizingMaskIntoConstraints = false
        weekScrollView.addSubview(weekStackView)

        NSLayoutConstraint.activate([
            innerStack.topAnchor.constraint(equalTo: card.topAnchor, constant: 16),
            innerStack.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 16),
            innerStack.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -16),
            innerStack.bottomAnchor.constraint(equalTo: card.bottomAnchor, constant: -16),

            weekScrollView.widthAnchor.constraint(equalTo: innerStack.widthAnchor),
            weekScrollView.heightAnchor.constraint(equalToConstant: 116),

            weekStackView.topAnchor.constraint(equalTo: weekScrollView.topAnchor),
            weekStackView.leadingAnchor.constraint(equalTo: weekScrollView.leadingAnchor),
            weekStackView.trailingAnchor.constraint(equalTo: weekScrollView.trailingAnchor),
            weekStackView.bottomAnchor.constraint(equalTo: weekScrollView.bottomAnchor),
            weekStackView.heightAnchor.constraint(equalTo: weekScrollView.heightAnchor)
        ])

        contentStackView.addArrangedSubview(card)
    }

    // MARK: - Upcoming Shifts Card
    private func setupUpcomingShiftsCard() {
        let card = UIView()
        card.backgroundColor = .white
        card.layer.cornerRadius = 18
        card.layer.borderWidth = 1
        card.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor

        let innerStack = UIStackView()
        innerStack.axis = .vertical
        innerStack.spacing = 14
        innerStack.translatesAutoresizingMaskIntoConstraints = false
        card.addSubview(innerStack)

        let headerStack = UIStackView()
        headerStack.axis = .horizontal
        headerStack.spacing = 8
        headerStack.alignment = .center

        let clockIcon = UIImageView(image: UIImage(systemName: "clock.fill"))
        clockIcon.tintColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
        clockIcon.translatesAutoresizingMaskIntoConstraints = false
        clockIcon.widthAnchor.constraint(equalToConstant: 18).isActive = true
        clockIcon.heightAnchor.constraint(equalToConstant: 18).isActive = true
        headerStack.addArrangedSubview(clockIcon)

        let titleLabel = UILabel()
        titleLabel.text = "Upcoming Shifts Details"
        titleLabel.font = .systemFont(ofSize: 16, weight: .bold)
        titleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        headerStack.addArrangedSubview(titleLabel)
        innerStack.addArrangedSubview(headerStack)

        emptyShiftsLabel.text = "No upcoming active shifts to display."
        emptyShiftsLabel.font = .systemFont(ofSize: 13, weight: .regular)
        emptyShiftsLabel.textColor = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 1.0)
        emptyShiftsLabel.textAlignment = .center
        emptyShiftsLabel.isHidden = false
        innerStack.addArrangedSubview(emptyShiftsLabel)

        upcomingShiftsStackView.axis = .vertical
        upcomingShiftsStackView.spacing = 10
        innerStack.addArrangedSubview(upcomingShiftsStackView)

        NSLayoutConstraint.activate([
            innerStack.topAnchor.constraint(equalTo: card.topAnchor, constant: 16),
            innerStack.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 16),
            innerStack.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -16),
            innerStack.bottomAnchor.constraint(equalTo: card.bottomAnchor, constant: -16)
        ])

        contentStackView.addArrangedSubview(card)
    }

    // MARK: - Schedule Data Loading
    private func loadScheduleData() {
        AuthService.shared.getMySchedule { [weak self] result in
            guard let self = self else { return }
            switch result {
            case .success(let schedules):
                if !schedules.isEmpty {
                    self.renderSchedule(schedules)
                }
            case .failure:
                break
            }
        }
    }

    private func renderSchedule(_ schedules: [[String: Any]]) {
        weekStackView.arrangedSubviews.forEach { $0.removeFromSuperview() }
        upcomingShiftsStackView.arrangedSubviews.forEach { $0.removeFromSuperview() }

        var activeCount = 0
        for s in schedules {
            let dateStr = s["date"] as? String ?? ""
            let isDayOff = s["isDayOff"] as? Bool ?? false
            let isOverride = s["isOverride"] as? Bool ?? false

            let shift = s["shift"] as? [String: Any]
            let shiftName = shift?["name"] as? String ?? "General Shift"
            let startTime = shift?["startTime"] as? String ?? "09:00"
            let endTime = shift?["endTime"] as? String ?? "18:00"
            let isNightShift = shift?["isNightShift"] as? Bool ?? false

            let swap = s["relatedSwapRequest"] as? [String: Any]
            var requesterName = ""
            var targetName = ""
            if let swap = swap {
                if let req = swap["requester"] as? [String: Any] {
                    requesterName = "\(req["firstName"] as? String ?? "") \(req["lastName"] as? String ?? "")".trimmingCharacters(in: .whitespaces)
                }
                if let tgt = swap["target"] as? [String: Any] {
                    targetName = "\(tgt["firstName"] as? String ?? "") \(tgt["lastName"] as? String ?? "")".trimmingCharacters(in: .whitespaces)
                }
            }

            // 1. Day Card in Horizontal Overview
            let dayCard = makeDayCard(
                dateStr: dateStr,
                isDayOff: isDayOff,
                isOverride: isOverride,
                isNightShift: isNightShift,
                shiftName: shiftName,
                startTime: startTime,
                endTime: endTime,
                requesterName: requesterName,
                targetName: targetName
            )
            weekStackView.addArrangedSubview(dayCard)

            // 2. Upcoming Shift Detail if not a plain day off
            if !isDayOff || isOverride {
                activeCount += 1
                let detailCard = makeShiftDetailCard(
                    dateStr: dateStr,
                    isDayOff: isDayOff,
                    isOverride: isOverride,
                    isNightShift: isNightShift,
                    shiftName: shiftName,
                    startTime: startTime,
                    endTime: endTime,
                    requesterName: requesterName,
                    targetName: targetName
                )
                upcomingShiftsStackView.addArrangedSubview(detailCard)
            }
        }

        emptyShiftsLabel.isHidden = (activeCount > 0)
    }

    private func makeDayCard(
        dateStr: String,
        isDayOff: Bool,
        isOverride: Bool,
        isNightShift: Bool,
        shiftName: String,
        startTime: String,
        endTime: String,
        requesterName: String,
        targetName: String
    ) -> UIView {
        let isGiver = isOverride && isDayOff
        let isProxy = isOverride && !isDayOff

        let card = UIView()
        card.layer.cornerRadius = 14
        card.layer.borderWidth = 1
        card.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            card.widthAnchor.constraint(equalToConstant: 120),
            card.heightAnchor.constraint(equalToConstant: 110)
        ])

        // Background & border
        if isGiver {
            card.backgroundColor = UIColor(red: 255/255, green: 241/255, blue: 242/255, alpha: 1.0)
            card.layer.borderColor = UIColor(red: 254/255, green: 205/255, blue: 211/255, alpha: 1.0).cgColor
        } else if isProxy {
            card.backgroundColor = UIColor(red: 236/255, green: 253/255, blue: 245/255, alpha: 1.0)
            card.layer.borderColor = UIColor(red: 167/255, green: 243/255, blue: 208/255, alpha: 1.0).cgColor
        } else if isDayOff {
            card.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
            card.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        } else if isNightShift {
            card.backgroundColor = UIColor(red: 238/255, green: 242/255, blue: 255/255, alpha: 1.0)
            card.layer.borderColor = UIColor(red: 199/255, green: 210/255, blue: 254/255, alpha: 1.0).cgColor
        } else {
            card.backgroundColor = UIColor(red: 254/255, green: 243/255, blue: 199/255, alpha: 0.6)
            card.layer.borderColor = UIColor(red: 253/255, green: 230/255, blue: 138/255, alpha: 1.0).cgColor
        }

        let stack = UIStackView()
        stack.axis = .vertical
        stack.distribution = .equalSpacing
        stack.translatesAutoresizingMaskIntoConstraints = false
        card.addSubview(stack)

        // Top Row: Day Name + Date & Icon
        let topRow = UIStackView()
        topRow.axis = .horizontal
        topRow.distribution = .equalSpacing
        topRow.alignment = .top

        let textCol = UIStackView()
        textCol.axis = .vertical
        textCol.spacing = 1

        let dayLbl = UILabel()
        dayLbl.text = getDayName(from: dateStr).uppercased()
        dayLbl.font = .systemFont(ofSize: 12, weight: .bold)
        dayLbl.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        textCol.addArrangedSubview(dayLbl)

        let dateLbl = UILabel()
        dateLbl.text = formatScheduleDate(dateStr)
        dateLbl.font = .systemFont(ofSize: 10, weight: .medium)
        dateLbl.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        textCol.addArrangedSubview(dateLbl)
        topRow.addArrangedSubview(textCol)

        let iconView = UIImageView()
        iconView.contentMode = .scaleAspectFit
        iconView.translatesAutoresizingMaskIntoConstraints = false
        iconView.widthAnchor.constraint(equalToConstant: 18).isActive = true
        iconView.heightAnchor.constraint(equalToConstant: 18).isActive = true

        if isDayOff {
            iconView.image = UIImage(systemName: "cup.and.saucer.fill")
            iconView.tintColor = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 1.0)
        } else if isNightShift {
            iconView.image = UIImage(systemName: "moon.stars.fill")
            iconView.tintColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
        } else {
            iconView.image = UIImage(systemName: "sun.max.fill")
            iconView.tintColor = UIColor(red: 245/255, green: 158/255, blue: 11/255, alpha: 1.0)
        }
        topRow.addArrangedSubview(iconView)
        stack.addArrangedSubview(topRow)

        // Middle Badge
        let badgeLbl = UILabel()
        badgeLbl.font = .systemFont(ofSize: 10, weight: .bold)
        badgeLbl.textAlignment = .center
        badgeLbl.layer.cornerRadius = 6
        badgeLbl.layer.masksToBounds = true

        if isGiver {
            badgeLbl.text = "Shift Given"
            badgeLbl.textColor = UIColor(red: 225/255, green: 29/255, blue: 72/255, alpha: 1.0)
            badgeLbl.backgroundColor = UIColor.white.withAlphaComponent(0.8)
        } else if isProxy {
            badgeLbl.text = "Proxy Swap"
            badgeLbl.textColor = UIColor(red: 5/255, green: 150/255, blue: 105/255, alpha: 1.0)
            badgeLbl.backgroundColor = UIColor.white.withAlphaComponent(0.8)
        } else if isDayOff {
            badgeLbl.text = "Day Off"
            badgeLbl.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
            badgeLbl.backgroundColor = UIColor.white.withAlphaComponent(0.8)
        } else {
            badgeLbl.text = shiftName
            badgeLbl.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
            badgeLbl.backgroundColor = UIColor.white.withAlphaComponent(0.8)
        }
        stack.addArrangedSubview(badgeLbl)

        // Time Label
        let timeLbl = UILabel()
        timeLbl.text = isDayOff ? "--:--" : "\(startTime) - \(endTime)"
        timeLbl.font = .systemFont(ofSize: 10, weight: .bold)
        timeLbl.textColor = UIColor(red: 51/255, green: 65/255, blue: 85/255, alpha: 1.0)
        timeLbl.textAlignment = .center
        stack.addArrangedSubview(timeLbl)

        NSLayoutConstraint.activate([
            stack.topAnchor.constraint(equalTo: card.topAnchor, constant: 10),
            stack.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 10),
            stack.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -10),
            stack.bottomAnchor.constraint(equalTo: card.bottomAnchor, constant: -10)
        ])
        return card
    }

    private func makeShiftDetailCard(
        dateStr: String,
        isDayOff: Bool,
        isOverride: Bool,
        isNightShift: Bool,
        shiftName: String,
        startTime: String,
        endTime: String,
        requesterName: String,
        targetName: String
    ) -> UIView {
        let isGiver = isOverride && isDayOff
        let isProxy = isOverride && !isDayOff

        let card = UIView()
        card.layer.cornerRadius = 14
        card.layer.borderWidth = 1
        card.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        card.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 0.7)

        let row = UIStackView()
        row.axis = .horizontal
        row.spacing = 12
        row.alignment = .center
        row.translatesAutoresizingMaskIntoConstraints = false
        card.addSubview(row)

        // Icon Box
        let iconBox = UIView()
        iconBox.layer.cornerRadius = 10
        iconBox.translatesAutoresizingMaskIntoConstraints = false
        iconBox.widthAnchor.constraint(equalToConstant: 38).isActive = true
        iconBox.heightAnchor.constraint(equalToConstant: 38).isActive = true

        let iconView = UIImageView()
        iconView.contentMode = .scaleAspectFit
        iconView.translatesAutoresizingMaskIntoConstraints = false
        iconBox.addSubview(iconView)
        NSLayoutConstraint.activate([
            iconView.centerXAnchor.constraint(equalTo: iconBox.centerXAnchor),
            iconView.centerYAnchor.constraint(equalTo: iconBox.centerYAnchor),
            iconView.widthAnchor.constraint(equalToConstant: 18),
            iconView.heightAnchor.constraint(equalToConstant: 18)
        ])

        if isGiver {
            iconBox.backgroundColor = UIColor(red: 255/255, green: 228/255, blue: 230/255, alpha: 1.0)
            iconView.image = UIImage(systemName: "cup.and.saucer.fill")
            iconView.tintColor = UIColor(red: 225/255, green: 29/255, blue: 72/255, alpha: 1.0)
        } else if isProxy {
            iconBox.backgroundColor = UIColor(red: 209/255, green: 250/255, blue: 229/255, alpha: 1.0)
            iconView.image = UIImage(systemName: "clock.fill")
            iconView.tintColor = UIColor(red: 5/255, green: 150/255, blue: 105/255, alpha: 1.0)
        } else if isNightShift {
            iconBox.backgroundColor = UIColor(red: 224/255, green: 231/255, blue: 255/255, alpha: 1.0)
            iconView.image = UIImage(systemName: "moon.stars.fill")
            iconView.tintColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
        } else {
            iconBox.backgroundColor = UIColor(red: 254/255, green: 243/255, blue: 199/255, alpha: 1.0)
            iconView.image = UIImage(systemName: "sun.max.fill")
            iconView.tintColor = UIColor(red: 245/255, green: 158/255, blue: 11/255, alpha: 1.0)
        }
        row.addArrangedSubview(iconBox)

        // Middle Text Details
        let textStack = UIStackView()
        textStack.axis = .vertical
        textStack.spacing = 3

        let titleRow = UIStackView()
        titleRow.axis = .horizontal
        titleRow.spacing = 6
        titleRow.alignment = .center

        let titleLbl = UILabel()
        titleLbl.text = "\(formatScheduleDate(dateStr)) (\(getDayName(from: dateStr)))"
        titleLbl.font = .systemFont(ofSize: 14, weight: .bold)
        titleLbl.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        titleRow.addArrangedSubview(titleLbl)

        if isOverride {
            let overLbl = UILabel()
            overLbl.text = " OVERRIDE "
            overLbl.font = .systemFont(ofSize: 9, weight: .bold)
            overLbl.textColor = UIColor(red: 79/255, green: 70/255, blue: 229/255, alpha: 1.0)
            overLbl.backgroundColor = UIColor(red: 238/255, green: 242/255, blue: 255/255, alpha: 1.0)
            overLbl.layer.cornerRadius = 4
            overLbl.layer.masksToBounds = true
            titleRow.addArrangedSubview(overLbl)
        }
        textStack.addArrangedSubview(titleRow)

        let subLbl = UILabel()
        var subText = isGiver ? "No attendance required" : "\(startTime) - \(endTime)"
        if isGiver && !requesterName.isEmpty {
            subText += " • Given to \(requesterName)"
        } else if isProxy && !targetName.isEmpty {
            subText += " • Proxy for \(targetName)"
        }
        subLbl.text = subText
        subLbl.font = .systemFont(ofSize: 12, weight: .regular)
        subLbl.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        textStack.addArrangedSubview(subLbl)
        row.addArrangedSubview(textStack)

        // Right Badge
        let rightBadge = UILabel()
        rightBadge.font = .systemFont(ofSize: 11, weight: .bold)
        rightBadge.layer.cornerRadius = 6
        rightBadge.layer.masksToBounds = true
        rightBadge.textAlignment = .center
        rightBadge.setContentCompressionResistancePriority(.required, for: .horizontal)

        if isGiver {
            rightBadge.text = "  Shift Given  "
            rightBadge.textColor = UIColor(red: 225/255, green: 29/255, blue: 72/255, alpha: 1.0)
            rightBadge.backgroundColor = UIColor(red: 255/255, green: 228/255, blue: 230/255, alpha: 1.0)
        } else if isProxy {
            rightBadge.text = "  Proxy  "
            rightBadge.textColor = UIColor(red: 5/255, green: 150/255, blue: 105/255, alpha: 1.0)
            rightBadge.backgroundColor = UIColor(red: 209/255, green: 250/255, blue: 229/255, alpha: 1.0)
        } else {
            rightBadge.text = "  \(shiftName)  "
            rightBadge.textColor = UIColor(red: 51/255, green: 65/255, blue: 85/255, alpha: 1.0)
            rightBadge.backgroundColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0)
        }
        row.addArrangedSubview(rightBadge)

        NSLayoutConstraint.activate([
            row.topAnchor.constraint(equalTo: card.topAnchor, constant: 12),
            row.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 12),
            row.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -12),
            row.bottomAnchor.constraint(equalTo: card.bottomAnchor, constant: -12)
        ])
        return card
    }

    private func renderFallbackWeek() {
        weekStackView.arrangedSubviews.forEach { $0.removeFromSuperview() }
        let calendar = Calendar.current
        let today = Date()

        for i in 0..<7 {
            if let date = calendar.date(byAdding: .day, value: i, to: today) {
                let formatter = DateFormatter()
                formatter.dateFormat = "yyyy-MM-dd"
                let dateStr = formatter.string(from: date)
                let weekday = calendar.component(.weekday, from: date)
                let isDayOff = (weekday == 1) // Sunday

                let card = makeDayCard(
                    dateStr: dateStr,
                    isDayOff: isDayOff,
                    isOverride: false,
                    isNightShift: false,
                    shiftName: "General Shift",
                    startTime: "09:00",
                    endTime: "18:00",
                    requesterName: "",
                    targetName: ""
                )
                weekStackView.addArrangedSubview(card)
            }
        }
    }

    private func formatScheduleDate(_ dateStr: String) -> String {
        let prefix = String(dateStr.prefix(10))
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        guard let date = formatter.date(from: prefix) else { return prefix }

        let cal = Calendar.current
        if cal.isDateInToday(date) { return "Today" }
        if cal.isDateInTomorrow(date) { return "Tomorrow" }

        let out = DateFormatter()
        out.dateFormat = "MMM d"
        return out.string(from: date)
    }

    private func getDayName(from dateStr: String) -> String {
        let prefix = String(dateStr.prefix(10))
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        guard let date = formatter.date(from: prefix) else { return "" }
        let out = DateFormatter()
        out.dateFormat = "EEE"
        return out.string(from: date)
    }

    // MARK: - Actions
    @objc private func didTapNotificationBell() {
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

    // MARK: - Bottom Nav Setup
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
            activeTabId: "schedules",
            scrollHandler: { [weak self] in
                self?.scrollView.setContentOffset(.zero, animated: true)
            }
        )
    }

    // MARK: - UIScrollViewDelegate
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
}
