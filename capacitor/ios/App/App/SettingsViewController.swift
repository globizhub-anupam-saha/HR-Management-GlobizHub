import UIKit
import UserNotifications

class SettingsViewController: UIViewController {

    private let topBar = UIView()
    private let topBarContainer = UIView()
    private let backButton = UIButton(type: .system)
    private let brandSubtitleLabel = UILabel()
    private let titleLabel = UILabel()
    private let notifBadgeDot = UIView()
    private let signOutTopButton = UIButton(type: .system)

    private let scrollView = UIScrollView()
    private let contentView = UIStackView()

    // Profile Card
    private let profileCard = UIView()
    private let avatarContainer = UIView()
    private let avatarImageView = UIImageView()
    private let avatarInitialsLabel = UILabel()
    private let profileNameLabel = UILabel()
    private let profileEmailLabel = UILabel()
    private let viewProfileButton = UIButton(type: .custom)
    private let roleBadge = UILabel()

    private let companyNameLabel = UILabel()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
        navigationController?.setNavigationBarHidden(true, animated: false)

        setupTopBar()
        setupScrollView()
        setupProfileCard()
        setupSettingsGroups()
        loadProfileData()

        NotificationCenter.default.addObserver(self, selector: #selector(handleNotificationBadgeChanged), name: AppNotificationManager.notificationBadgeChangedNotification, object: nil)
    }

    @objc private func handleNotificationBadgeChanged() {
        notifBadgeDot.isHidden = !AuthService.shared.hasUnreadLocalNotifications()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        notifBadgeDot.isHidden = !AuthService.shared.hasUnreadLocalNotifications()
        loadProfileData()
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

        let leftStack = UIStackView()
        leftStack.axis = .horizontal
        leftStack.spacing = 8
        leftStack.alignment = .center
        leftStack.translatesAutoresizingMaskIntoConstraints = false
        topBarContainer.addSubview(leftStack)

        let backConfig = UIImage.SymbolConfiguration(pointSize: 18, weight: .semibold)
        backButton.setImage(UIImage(systemName: "arrow.backward", withConfiguration: backConfig), for: .normal)
        backButton.tintColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        backButton.translatesAutoresizingMaskIntoConstraints = false
        backButton.addTarget(self, action: #selector(handleBack), for: .touchUpInside)
        leftStack.addArrangedSubview(backButton)

        let headerStack = UIStackView()
        headerStack.axis = .vertical
        headerStack.spacing = 1
        headerStack.translatesAutoresizingMaskIntoConstraints = false
        leftStack.addArrangedSubview(headerStack)

        brandSubtitleLabel.text = "GLOBIZHR"
        brandSubtitleLabel.font = .systemFont(ofSize: 11, weight: .heavy)
        brandSubtitleLabel.textColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        headerStack.addArrangedSubview(brandSubtitleLabel)

        titleLabel.text = "Settings"
        titleLabel.font = .systemFont(ofSize: 20, weight: .bold)
        titleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        headerStack.addArrangedSubview(titleLabel)

        // Right: Sign Out Power Button
        let rightStack = UIStackView()
        rightStack.axis = .horizontal
        rightStack.spacing = 6
        rightStack.alignment = .center
        rightStack.translatesAutoresizingMaskIntoConstraints = false
        topBarContainer.addSubview(rightStack)

        let powerConfig = UIImage.SymbolConfiguration(pointSize: 18, weight: .medium)
        signOutTopButton.setImage(UIImage(systemName: "power", withConfiguration: powerConfig), for: .normal)
        signOutTopButton.tintColor = UIColor(red: 239/255, green: 68/255, blue: 68/255, alpha: 1.0)
        signOutTopButton.translatesAutoresizingMaskIntoConstraints = false
        signOutTopButton.addTarget(self, action: #selector(confirmSignOut), for: .touchUpInside)
        rightStack.addArrangedSubview(signOutTopButton)

        let divider = UIView()
        divider.backgroundColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0)
        divider.translatesAutoresizingMaskIntoConstraints = false
        topBar.addSubview(divider)

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

            leftStack.leadingAnchor.constraint(equalTo: topBarContainer.leadingAnchor),
            leftStack.centerYAnchor.constraint(equalTo: topBarContainer.centerYAnchor),

            backButton.widthAnchor.constraint(equalToConstant: 36),
            backButton.heightAnchor.constraint(equalToConstant: 36),

            rightStack.trailingAnchor.constraint(equalTo: topBarContainer.trailingAnchor),
            rightStack.centerYAnchor.constraint(equalTo: topBarContainer.centerYAnchor),

            signOutTopButton.widthAnchor.constraint(equalToConstant: 36),
            signOutTopButton.heightAnchor.constraint(equalToConstant: 36),

            divider.bottomAnchor.constraint(equalTo: topBar.bottomAnchor),
            divider.leadingAnchor.constraint(equalTo: topBar.leadingAnchor),
            divider.trailingAnchor.constraint(equalTo: topBar.trailingAnchor),
            divider.heightAnchor.constraint(equalToConstant: 1)
        ])
    }

    private func setupScrollView() {
        scrollView.showsVerticalScrollIndicator = false
        scrollView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(scrollView)

        contentView.axis = .vertical
        contentView.spacing = 14
        contentView.translatesAutoresizingMaskIntoConstraints = false
        scrollView.addSubview(contentView)

        let contentWidth = contentView.widthAnchor.constraint(equalTo: scrollView.widthAnchor, constant: -32)
        contentWidth.priority = UILayoutPriority(999)
        contentWidth.isActive = true

        NSLayoutConstraint.activate([
            scrollView.topAnchor.constraint(equalTo: topBar.bottomAnchor),
            scrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scrollView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor),

            contentView.topAnchor.constraint(equalTo: scrollView.topAnchor, constant: 16),
            contentView.leadingAnchor.constraint(greaterThanOrEqualTo: scrollView.leadingAnchor, constant: 16),
            contentView.trailingAnchor.constraint(lessThanOrEqualTo: scrollView.trailingAnchor, constant: -16),
            contentView.centerXAnchor.constraint(equalTo: scrollView.centerXAnchor),
            contentView.widthAnchor.constraint(lessThanOrEqualToConstant: 680),
            contentView.bottomAnchor.constraint(equalTo: scrollView.bottomAnchor, constant: -32)
        ])
    }

    // MARK: - Profile Card
    private func setupProfileCard() {
        profileCard.backgroundColor = .white
        profileCard.layer.cornerRadius = 24
        profileCard.layer.borderWidth = 1
        profileCard.layer.borderColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0).cgColor
        profileCard.layer.shadowColor = UIColor.black.cgColor
        profileCard.layer.shadowOpacity = 0.03
        profileCard.layer.shadowOffset = CGSize(width: 0, height: 2)
        profileCard.layer.shadowRadius = 6
        profileCard.translatesAutoresizingMaskIntoConstraints = false
        contentView.addArrangedSubview(profileCard)

        avatarContainer.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        avatarContainer.layer.cornerRadius = 28
        avatarContainer.layer.masksToBounds = true
        avatarContainer.translatesAutoresizingMaskIntoConstraints = false
        profileCard.addSubview(avatarContainer)

        avatarImageView.contentMode = .scaleAspectFill
        avatarImageView.isHidden = true
        avatarImageView.translatesAutoresizingMaskIntoConstraints = false
        avatarContainer.addSubview(avatarImageView)

        avatarInitialsLabel.textColor = .white
        avatarInitialsLabel.font = .systemFont(ofSize: 22, weight: .bold)
        avatarInitialsLabel.textAlignment = .center
        avatarInitialsLabel.translatesAutoresizingMaskIntoConstraints = false
        avatarContainer.addSubview(avatarInitialsLabel)

        let rightColumn = UIStackView()
        rightColumn.axis = .vertical
        rightColumn.alignment = .leading
        rightColumn.spacing = 4
        rightColumn.translatesAutoresizingMaskIntoConstraints = false
        profileCard.addSubview(rightColumn)

        profileNameLabel.font = .systemFont(ofSize: 18, weight: .bold)
        profileNameLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        profileNameLabel.text = "Team Member"
        rightColumn.addArrangedSubview(profileNameLabel)

        profileEmailLabel.font = .systemFont(ofSize: 14, weight: .regular)
        profileEmailLabel.textColor = UIColor(red: 71/255, green: 85/255, blue: 105/255, alpha: 1.0)
        profileEmailLabel.text = "employee@globizhub.com"
        rightColumn.addArrangedSubview(profileEmailLabel)

        // View Profile Button
        viewProfileButton.setTitle("View Profile", for: .normal)
        viewProfileButton.setTitleColor(.white, for: .normal)
        viewProfileButton.titleLabel?.font = .systemFont(ofSize: 13, weight: .semibold)
        viewProfileButton.backgroundColor = .black
        viewProfileButton.layer.cornerRadius = 16
        viewProfileButton.contentEdgeInsets = UIEdgeInsets(top: 8, left: 16, bottom: 8, right: 16)
        viewProfileButton.addTarget(self, action: #selector(handleViewProfile), for: .touchUpInside)
        viewProfileButton.translatesAutoresizingMaskIntoConstraints = false
        viewProfileButton.heightAnchor.constraint(equalToConstant: 34).isActive = true

        // Role Container & Label (Plain badge, no dropdown)
        let roleContainer = UIView()
        roleContainer.backgroundColor = UIColor(red: 239/255, green: 246/255, blue: 255/255, alpha: 1.0)
        roleContainer.layer.cornerRadius = 16
        roleContainer.translatesAutoresizingMaskIntoConstraints = false
        roleContainer.heightAnchor.constraint(equalToConstant: 34).isActive = true

        roleBadge.font = .systemFont(ofSize: 12, weight: .bold)
        roleBadge.textColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        roleBadge.textAlignment = .center
        roleBadge.translatesAutoresizingMaskIntoConstraints = false
        roleContainer.addSubview(roleBadge)

        NSLayoutConstraint.activate([
            roleBadge.centerYAnchor.constraint(equalTo: roleContainer.centerYAnchor),
            roleBadge.leadingAnchor.constraint(equalTo: roleContainer.leadingAnchor, constant: 14),
            roleBadge.trailingAnchor.constraint(equalTo: roleContainer.trailingAnchor, constant: -14)
        ])
        updateRoleBadgeTitle()

        // Horizontal Row: View Profile + Role Badge
        let buttonRow = UIStackView(arrangedSubviews: [viewProfileButton, roleContainer])
        buttonRow.axis = .horizontal
        buttonRow.spacing = 10
        buttonRow.alignment = .center
        buttonRow.translatesAutoresizingMaskIntoConstraints = false

        let spacer = UIView()
        spacer.translatesAutoresizingMaskIntoConstraints = false
        spacer.heightAnchor.constraint(equalToConstant: 6).isActive = true
        rightColumn.addArrangedSubview(spacer)
        rightColumn.addArrangedSubview(buttonRow)

        NSLayoutConstraint.activate([
            avatarContainer.leadingAnchor.constraint(equalTo: profileCard.leadingAnchor, constant: 20),
            avatarContainer.topAnchor.constraint(equalTo: profileCard.topAnchor, constant: 20),
            avatarContainer.widthAnchor.constraint(equalToConstant: 56),
            avatarContainer.heightAnchor.constraint(equalToConstant: 56),

            avatarImageView.topAnchor.constraint(equalTo: avatarContainer.topAnchor),
            avatarImageView.bottomAnchor.constraint(equalTo: avatarContainer.bottomAnchor),
            avatarImageView.leadingAnchor.constraint(equalTo: avatarContainer.leadingAnchor),
            avatarImageView.trailingAnchor.constraint(equalTo: avatarContainer.trailingAnchor),

            avatarInitialsLabel.centerXAnchor.constraint(equalTo: avatarContainer.centerXAnchor),
            avatarInitialsLabel.centerYAnchor.constraint(equalTo: avatarContainer.centerYAnchor),

            rightColumn.leadingAnchor.constraint(equalTo: avatarContainer.trailingAnchor, constant: 16),
            rightColumn.topAnchor.constraint(equalTo: profileCard.topAnchor, constant: 20),
            rightColumn.trailingAnchor.constraint(equalTo: profileCard.trailingAnchor, constant: -20),
            rightColumn.bottomAnchor.constraint(equalTo: profileCard.bottomAnchor, constant: -20)
        ])
    }

    private func updateRoleBadgeTitle() {
        let role = AuthService.shared.getRole()
        let userRole = UserRole.from(string: role)
        roleBadge.text = userRole.displayName
    }

    // MARK: - Settings Groups
    private func setupSettingsGroups() {
        // 1. Organization Card (Plain text organization, no dropdown)
        let orgCard = makeCardView()
        let orgHeader = makeRow(icon: "building.2.fill", title: "Organization")
        companyNameLabel.text = "GlobizHub Inc."
        companyNameLabel.font = .systemFont(ofSize: 13, weight: .bold)
        companyNameLabel.textColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        companyNameLabel.translatesAutoresizingMaskIntoConstraints = false
        orgHeader.addSubview(companyNameLabel)
        NSLayoutConstraint.activate([
            companyNameLabel.trailingAnchor.constraint(equalTo: orgHeader.trailingAnchor),
            companyNameLabel.centerYAnchor.constraint(equalTo: orgHeader.centerYAnchor)
        ])
        orgCard.addArrangedSubview(orgHeader)
        contentView.addArrangedSubview(orgCard)

        // 2. Help & Support Card (Replaces Attendance box)
        let helpCard = makeCardView()
        let helpRow = makeNavRow(icon: "questionmark.circle.fill", title: "Help & Support", action: #selector(handleHelpSupport))
        helpCard.addArrangedSubview(helpRow)
        contentView.addArrangedSubview(helpCard)

        // 3. Theme
        let themeCard = makeCardView()
        let themeRow = makeRow(icon: "paintbrush.fill", title: "Theme")
        let themeLabel = UILabel()
        themeLabel.text = "System Default"
        themeLabel.font = .systemFont(ofSize: 13, weight: .regular)
        themeLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        let themeChevron = makeChevron()
        let themeRight = UIStackView(arrangedSubviews: [themeLabel, themeChevron])
        themeRight.spacing = 4
        themeRight.alignment = .center
        themeRight.translatesAutoresizingMaskIntoConstraints = false
        themeRow.addSubview(themeRight)
        NSLayoutConstraint.activate([
            themeRight.trailingAnchor.constraint(equalTo: themeRow.trailingAnchor),
            themeRight.centerYAnchor.constraint(equalTo: themeRow.centerYAnchor)
        ])
        themeCard.addArrangedSubview(themeRow)
        contentView.addArrangedSubview(themeCard)

        // 4. Language
        let langCard = makeCardView()
        let langRow = makeRow(icon: "globe", title: "Language")
        let langLabel = UILabel()
        langLabel.text = "English"
        langLabel.font = .systemFont(ofSize: 13, weight: .regular)
        langLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        let langChevron = makeChevron()
        let langRight = UIStackView(arrangedSubviews: [langLabel, langChevron])
        langRight.spacing = 4
        langRight.alignment = .center
        langRight.translatesAutoresizingMaskIntoConstraints = false
        langRow.addSubview(langRight)
        NSLayoutConstraint.activate([
            langRight.trailingAnchor.constraint(equalTo: langRow.trailingAnchor),
            langRight.centerYAnchor.constraint(equalTo: langRow.centerYAnchor)
        ])
        langCard.addArrangedSubview(langRow)
        contentView.addArrangedSubview(langCard)

        // 5. Privacy & Security (App Lock & Privacy Preferences removed, only Privacy Policy & Terms kept)
        let privCard = makeCardView()
        privCard.addArrangedSubview(makeRow(icon: "shield.fill", title: "Privacy & Security"))
        privCard.addArrangedSubview(makeDivider())
        privCard.addArrangedSubview(makeNavRow(title: "Privacy Policy", action: #selector(handlePrivacyPolicy)))
        privCard.addArrangedSubview(makeDivider())
        privCard.addArrangedSubview(makeNavRow(title: "Terms of Service", action: #selector(handleTermsOfService)))
        contentView.addArrangedSubview(privCard)

        // 6. About (Dynamic version, Write Us, App Issues & Feedback)
        let aboutCard = makeCardView()
        aboutCard.addArrangedSubview(makeRow(icon: "info.circle.fill", title: "About"))
        aboutCard.addArrangedSubview(makeDivider())

        let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0"
        let buildNumber = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
        let versionRow = makeSimpleTextRow(title: "App Version", rightText: "\(appVersion) (\(buildNumber))")
        aboutCard.addArrangedSubview(versionRow)
        aboutCard.addArrangedSubview(makeDivider())
        aboutCard.addArrangedSubview(makeNavRow(title: "Write Us", action: #selector(handleWriteUs)))
        aboutCard.addArrangedSubview(makeDivider())
        aboutCard.addArrangedSubview(makeNavRow(title: "App Issues & Feedback", action: #selector(handleHelpSupport)))
        contentView.addArrangedSubview(aboutCard)

        // 7. Others
        let othersCard = makeCardView()
        othersCard.addArrangedSubview(makeRow(icon: "gearshape.fill", title: "Others"))
        othersCard.addArrangedSubview(makeDivider())
        othersCard.addArrangedSubview(makeNavRow(title: "Refresh App", action: #selector(handleRefresh)))
        othersCard.addArrangedSubview(makeDivider())
        othersCard.addArrangedSubview(makeSwitchRow(title: "Push Notification", key: "pref_push_notification", defaultValue: true))
        othersCard.addArrangedSubview(makeDivider())
        othersCard.addArrangedSubview(makeNavRow(title: "Manage Account", action: #selector(handleManageAccount)))
        othersCard.addArrangedSubview(makeDivider())

        // Sign Out Row
        let signOutRow = UIView()
        signOutRow.translatesAutoresizingMaskIntoConstraints = false
        signOutRow.isUserInteractionEnabled = true
        signOutRow.addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(confirmSignOut)))

        let signOutLabel = UILabel()
        signOutLabel.text = "Sign Out"
        signOutLabel.font = .systemFont(ofSize: 14, weight: .bold)
        signOutLabel.textColor = UIColor(red: 239/255, green: 68/255, blue: 68/255, alpha: 1.0)
        signOutLabel.translatesAutoresizingMaskIntoConstraints = false
        signOutRow.addSubview(signOutLabel)

        NSLayoutConstraint.activate([
            signOutRow.heightAnchor.constraint(equalToConstant: 36),
            signOutLabel.leadingAnchor.constraint(equalTo: signOutRow.leadingAnchor),
            signOutLabel.centerYAnchor.constraint(equalTo: signOutRow.centerYAnchor)
        ])
        othersCard.addArrangedSubview(signOutRow)
        contentView.addArrangedSubview(othersCard)
    }

    private func makeCardView() -> UIStackView {
        let stack = UIStackView()
        stack.axis = .vertical
        stack.spacing = 10
        stack.backgroundColor = .white
        stack.layer.cornerRadius = 14
        stack.layer.borderWidth = 1
        stack.layer.borderColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0).cgColor
        stack.isLayoutMarginsRelativeArrangement = true
        stack.layoutMargins = UIEdgeInsets(top: 14, left: 16, bottom: 14, right: 16)
        return stack
    }

    private func makeRow(icon: String, title: String) -> UIView {
        let row = UIView()
        row.translatesAutoresizingMaskIntoConstraints = false

        let config = UIImage.SymbolConfiguration(pointSize: 18, weight: .medium)
        let iconView = UIImageView(image: UIImage(systemName: icon, withConfiguration: config))
        iconView.tintColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        iconView.contentMode = .scaleAspectFit
        iconView.translatesAutoresizingMaskIntoConstraints = false
        row.addSubview(iconView)

        let label = UILabel()
        label.text = title
        label.font = .systemFont(ofSize: 15, weight: .bold)
        label.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        label.translatesAutoresizingMaskIntoConstraints = false
        row.addSubview(label)

        NSLayoutConstraint.activate([
            row.heightAnchor.constraint(equalToConstant: 28),
            iconView.leadingAnchor.constraint(equalTo: row.leadingAnchor),
            iconView.centerYAnchor.constraint(equalTo: row.centerYAnchor),
            iconView.widthAnchor.constraint(equalToConstant: 22),
            iconView.heightAnchor.constraint(equalToConstant: 22),

            label.leadingAnchor.constraint(equalTo: iconView.trailingAnchor, constant: 12),
            label.centerYAnchor.constraint(equalTo: row.centerYAnchor)
        ])
        return row
    }

    private func makeSwitchRow(title: String, key: String, defaultValue: Bool) -> UIView {
        let row = UIView()
        row.translatesAutoresizingMaskIntoConstraints = false

        let label = UILabel()
        label.text = title
        label.font = .systemFont(ofSize: 13, weight: .regular)
        label.textColor = UIColor(red: 51/255, green: 65/255, blue: 85/255, alpha: 1.0)
        label.translatesAutoresizingMaskIntoConstraints = false
        row.addSubview(label)

        let sw = UISwitch()
        let savedVal = UserDefaults.standard.object(forKey: key) as? Bool ?? defaultValue
        sw.isOn = savedVal
        sw.onTintColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        sw.accessibilityIdentifier = key
        sw.addTarget(self, action: #selector(handleSwitchToggled(_:)), for: .valueChanged)
        sw.translatesAutoresizingMaskIntoConstraints = false
        row.addSubview(sw)

        NSLayoutConstraint.activate([
            row.heightAnchor.constraint(equalToConstant: 34),
            label.leadingAnchor.constraint(equalTo: row.leadingAnchor),
            label.centerYAnchor.constraint(equalTo: row.centerYAnchor),

            sw.trailingAnchor.constraint(equalTo: row.trailingAnchor),
            sw.centerYAnchor.constraint(equalTo: row.centerYAnchor)
        ])
        return row
    }

    @objc private func handleSwitchToggled(_ sender: UISwitch) {
        if let key = sender.accessibilityIdentifier {
            UserDefaults.standard.set(sender.isOn, forKey: key)
            UserDefaults.standard.synchronize()
            if key == "pref_push_notification" {
                AppNotificationManager.shared.setPushNotificationEnabled(sender.isOn)
                if sender.isOn {
                    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, _ in
                        DispatchQueue.main.async {
                            if !granted {
                                sender.setOn(false, animated: true)
                                UserDefaults.standard.set(false, forKey: key)
                                AppNotificationManager.shared.setPushNotificationEnabled(false)
                            }
                        }
                    }
                }
            }
        }
        let feedback = UISelectionFeedbackGenerator()
        feedback.selectionChanged()
    }

    private func makeNavRow(icon: String? = nil, title: String, action: Selector? = nil) -> UIView {
        let row = UIView()
        row.translatesAutoresizingMaskIntoConstraints = false
        if let action = action {
            row.isUserInteractionEnabled = true
            row.addGestureRecognizer(UITapGestureRecognizer(target: self, action: action))
        }

        let label = UILabel()
        label.text = title
        label.font = .systemFont(ofSize: 13, weight: .regular)
        label.textColor = UIColor(red: 51/255, green: 65/255, blue: 85/255, alpha: 1.0)
        label.translatesAutoresizingMaskIntoConstraints = false

        let chevron = makeChevron()
        row.addSubview(chevron)

        if let icon = icon {
            let config = UIImage.SymbolConfiguration(pointSize: 18, weight: .medium)
            let iconView = UIImageView(image: UIImage(systemName: icon, withConfiguration: config))
            iconView.tintColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
            iconView.contentMode = .scaleAspectFit
            iconView.translatesAutoresizingMaskIntoConstraints = false
            row.addSubview(iconView)
            row.addSubview(label)

            label.font = .systemFont(ofSize: 15, weight: .bold)
            label.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)

            NSLayoutConstraint.activate([
                row.heightAnchor.constraint(equalToConstant: 32),
                iconView.leadingAnchor.constraint(equalTo: row.leadingAnchor),
                iconView.centerYAnchor.constraint(equalTo: row.centerYAnchor),
                iconView.widthAnchor.constraint(equalToConstant: 22),
                iconView.heightAnchor.constraint(equalToConstant: 22),

                label.leadingAnchor.constraint(equalTo: iconView.trailingAnchor, constant: 12),
                label.centerYAnchor.constraint(equalTo: row.centerYAnchor),

                chevron.trailingAnchor.constraint(equalTo: row.trailingAnchor),
                chevron.centerYAnchor.constraint(equalTo: row.centerYAnchor)
            ])
        } else {
            row.addSubview(label)
            NSLayoutConstraint.activate([
                row.heightAnchor.constraint(equalToConstant: 32),
                label.leadingAnchor.constraint(equalTo: row.leadingAnchor),
                label.centerYAnchor.constraint(equalTo: row.centerYAnchor),

                chevron.trailingAnchor.constraint(equalTo: row.trailingAnchor),
                chevron.centerYAnchor.constraint(equalTo: row.centerYAnchor)
            ])
        }
        return row
    }

    private func makeSimpleTextRow(title: String, rightText: String) -> UIView {
        let row = UIView()
        row.translatesAutoresizingMaskIntoConstraints = false

        let label = UILabel()
        label.text = title
        label.font = .systemFont(ofSize: 13, weight: .regular)
        label.textColor = UIColor(red: 51/255, green: 65/255, blue: 85/255, alpha: 1.0)
        label.translatesAutoresizingMaskIntoConstraints = false
        row.addSubview(label)

        let right = UILabel()
        right.text = rightText
        right.font = .systemFont(ofSize: 13, weight: .regular)
        right.textColor = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 1.0)
        right.translatesAutoresizingMaskIntoConstraints = false
        row.addSubview(right)

        NSLayoutConstraint.activate([
            row.heightAnchor.constraint(equalToConstant: 32),
            label.leadingAnchor.constraint(equalTo: row.leadingAnchor),
            label.centerYAnchor.constraint(equalTo: row.centerYAnchor),

            right.trailingAnchor.constraint(equalTo: row.trailingAnchor),
            right.centerYAnchor.constraint(equalTo: row.centerYAnchor)
        ])
        return row
    }

    private func makeDivider() -> UIView {
        let divider = UIView()
        divider.backgroundColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0)
        divider.translatesAutoresizingMaskIntoConstraints = false
        divider.heightAnchor.constraint(equalToConstant: 1).isActive = true
        return divider
    }

    private func makeChevron() -> UIImageView {
        let chevron = UIImageView(image: UIImage(systemName: "chevron.right"))
        chevron.tintColor = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 1.0)
        chevron.contentMode = .scaleAspectFit
        chevron.translatesAutoresizingMaskIntoConstraints = false
        chevron.widthAnchor.constraint(equalToConstant: 14).isActive = true
        chevron.heightAnchor.constraint(equalToConstant: 14).isActive = true
        return chevron
    }

    // MARK: - Navigation Actions
    @objc private func handleBack() {
        if let nav = navigationController {
            nav.popViewController(animated: true)
        } else {
            dismiss(animated: true)
        }
    }

    @objc private func handleViewProfile() {
        let accountVC = AccountSettingsViewController()
        if let nav = navigationController {
            nav.pushViewController(accountVC, animated: true)
        } else {
            accountVC.modalPresentationStyle = .fullScreen
            present(accountVC, animated: true)
        }
    }

    @objc private func handleHelpSupport() {
        let helpVC = HelpSupportViewController()
        if let nav = navigationController {
            nav.pushViewController(helpVC, animated: true)
        } else {
            helpVC.modalPresentationStyle = .fullScreen
            present(helpVC, animated: true)
        }
    }

    @objc private func handlePrivacyPolicy() {
        let alert = UIAlertController(title: "Privacy Policy", message: "GlobizHR prioritizes your personal data privacy and statutory security. Data is encrypted in transit and at rest in compliance with Indian IT and GDPR frameworks.", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }

    @objc private func handleTermsOfService() {
        let alert = UIAlertController(title: "Terms of Service", message: "By using GlobizHR mobile client, you agree to adhere to company organization workplace conduct, attendance accuracy policies, and authorized system usage.", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }

    @objc private func handleWriteUs() {
        if let url = URL(string: "mailto:support@globizhub.com?subject=GlobizHR%20Feedback") {
            UIApplication.shared.open(url)
        }
    }

    @objc private func handleManageAccount() {
        let deleteVC = DeleteAccountViewController()
        if let nav = navigationController {
            nav.pushViewController(deleteVC, animated: true)
        } else {
            deleteVC.modalPresentationStyle = .fullScreen
            present(deleteVC, animated: true)
        }
    }

    // Refresh App: 2-second loading HUD, reloads all data and redirects to Dashboard / Home
    @objc private func handleRefresh() {
        let hud = UIView(frame: view.bounds)
        hud.backgroundColor = UIColor(white: 0, alpha: 0.45)
        hud.autoresizingMask = [.flexibleWidth, .flexibleHeight]

        let box = UIView()
        box.backgroundColor = .white
        box.layer.cornerRadius = 16
        box.layer.shadowColor = UIColor.black.cgColor
        box.layer.shadowOpacity = 0.15
        box.layer.shadowOffset = CGSize(width: 0, height: 4)
        box.layer.shadowRadius = 12
        box.translatesAutoresizingMaskIntoConstraints = false
        hud.addSubview(box)

        let spinner = UIActivityIndicatorView(style: .large)
        spinner.color = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        spinner.startAnimating()
        spinner.translatesAutoresizingMaskIntoConstraints = false
        box.addSubview(spinner)

        let label = UILabel()
        label.text = "Refreshing GlobizHR..."
        label.font = .systemFont(ofSize: 14, weight: .bold)
        label.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        box.addSubview(label)

        view.addSubview(hud)

        NSLayoutConstraint.activate([
            box.centerXAnchor.constraint(equalTo: hud.centerXAnchor),
            box.centerYAnchor.constraint(equalTo: hud.centerYAnchor),
            box.widthAnchor.constraint(equalToConstant: 210),
            box.heightAnchor.constraint(equalToConstant: 116),

            spinner.topAnchor.constraint(equalTo: box.topAnchor, constant: 22),
            spinner.centerXAnchor.constraint(equalTo: box.centerXAnchor),

            label.topAnchor.constraint(equalTo: spinner.bottomAnchor, constant: 14),
            label.leadingAnchor.constraint(equalTo: box.leadingAnchor, constant: 12),
            label.trailingAnchor.constraint(equalTo: box.trailingAnchor, constant: -12)
        ])

        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { [weak self] in
            hud.removeFromSuperview()
            self?.loadProfileData()

            // Navigate / Pop to HomeViewController
            if let nav = self?.navigationController {
                for vc in nav.viewControllers {
                    if let homeVC = vc as? HomeViewController {
                        nav.popToViewController(homeVC, animated: true)
                        return
                    }
                }
                let homeVC = HomeViewController()
                nav.setViewControllers([homeVC], animated: true)
            } else {
                let homeVC = HomeViewController()
                homeVC.modalPresentationStyle = .fullScreen
                self?.present(homeVC, animated: true)
            }
        }
    }

    @objc private func confirmSignOut() {
        let alert = UIAlertController(title: "Sign Out", message: "Are you sure you want to sign out?", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Sign Out", style: .destructive, handler: { [weak self] _ in
            self?.executeSignOut()
        }))
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        present(alert, animated: true)
    }

    private func executeSignOut() {
        AuthService.shared.clearAuth()
        let signInVC = SignInViewController()
        let nav = UINavigationController(rootViewController: signInVC)
        nav.modalPresentationStyle = .fullScreen

        if let window = view.window {
            window.rootViewController = nav
            UIView.transition(with: window, duration: 0.3, options: .transitionCrossDissolve, animations: nil)
        } else {
            present(nav, animated: true)
        }
    }

    // MARK: - Data Loading
    private func loadProfileData() {
        let savedEmail = AuthService.shared.getEmail()
        let resolvedEmail = savedEmail.isEmpty ? "employee@globizhub.com" : savedEmail
        profileEmailLabel.text = resolvedEmail

        let savedFirst = AuthService.shared.getFirstName()
        let resolvedName = savedFirst.isEmpty ? (savedEmail.contains("@") ? String(savedEmail.prefix(upTo: savedEmail.firstIndex(of: "@")!)) : "Alex Morgan") : savedFirst
        profileNameLabel.text = resolvedName

        let fallbackInitial = String(resolvedName.prefix(1)).uppercased()
        avatarInitialsLabel.text = fallbackInitial.isEmpty ? "U" : fallbackInitial
        updateRoleBadgeTitle()

        AuthService.shared.getProfile { [weak self] result in
            guard let self = self else { return }
            switch result {
            case .success(let user):
                let firstName = user["firstName"] as? String ?? ""
                let lastName = user["lastName"] as? String ?? ""
                let email = user["email"] as? String ?? savedEmail
                let photoUrl = user["profilePhoto"] as? String ?? user["profileImage"] as? String ?? ""

                var fullName = "\(firstName) \(lastName)".trimmingCharacters(in: .whitespaces)
                if fullName.isEmpty {
                    fullName = email.contains("@") ? String(email.prefix(upTo: email.firstIndex(of: "@")!)) : "Team Member"
                }
                self.profileNameLabel.text = fullName
                self.profileEmailLabel.text = email

                if !firstName.isEmpty {
                    self.avatarInitialsLabel.text = String(firstName.prefix(1)).uppercased()
                }

                if !photoUrl.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                    self.loadAvatarImage(urlStr: photoUrl)
                } else {
                    self.avatarImageView.isHidden = true
                    self.avatarInitialsLabel.isHidden = false
                }

                var resolvedOrg = AuthService.shared.getOrganization()
                if let company = user["company"] as? [String: Any], let cName = company["name"] as? String, !cName.isEmpty {
                    resolvedOrg = cName
                } else if let cName = user["companyName"] as? String, !cName.isEmpty {
                    resolvedOrg = cName
                } else if let org = user["organization"] as? [String: Any], let oName = org["name"] as? String, !oName.isEmpty {
                    resolvedOrg = oName
                } else if let oName = user["organization"] as? String, !oName.isEmpty {
                    resolvedOrg = oName
                } else if let oName = user["organizationName"] as? String, !oName.isEmpty {
                    resolvedOrg = oName
                }
                if resolvedOrg.isEmpty || resolvedOrg.lowercased() == "acmecorp" || resolvedOrg.lowercased() == "null" {
                    resolvedOrg = "GlobizHub Inc."
                }
                self.companyNameLabel.text = resolvedOrg
            case .failure:
                break
            }
        }
    }

    private func loadAvatarImage(urlStr: String) {
        guard let url = URL(string: urlStr) else { return }
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
}
