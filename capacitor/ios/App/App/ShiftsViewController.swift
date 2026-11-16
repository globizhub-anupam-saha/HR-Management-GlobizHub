import UIKit

class ShiftCell: UITableViewCell {
    static let identifier = "ShiftCell"

    private let cardView = UIView()
    private let iconContainer = UIView()
    private let iconView = UIImageView()
    private let titleLabel = UILabel()
    private let timingLabel = UILabel()
    private let statusBadge = UILabel()

    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        selectionStyle = .none
        backgroundColor = .clear
        setupView()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupView()
    }

    private func setupView() {
        cardView.backgroundColor = .white
        cardView.layer.cornerRadius = 16
        cardView.layer.borderWidth = 1
        cardView.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        cardView.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(cardView)

        iconContainer.backgroundColor = UIColor(red: 238/255, green: 242/255, blue: 255/255, alpha: 1.0)
        iconContainer.layer.cornerRadius = 20
        iconContainer.translatesAutoresizingMaskIntoConstraints = false
        cardView.addSubview(iconContainer)

        let config = UIImage.SymbolConfiguration(pointSize: 16, weight: .bold)
        iconView.image = UIImage(systemName: "clock.fill", withConfiguration: config)
        iconView.tintColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        iconView.contentMode = .scaleAspectFit
        iconView.translatesAutoresizingMaskIntoConstraints = false
        iconContainer.addSubview(iconView)

        titleLabel.font = .systemFont(ofSize: 16, weight: .bold)
        titleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        cardView.addSubview(titleLabel)

        timingLabel.font = .systemFont(ofSize: 12, weight: .regular)
        timingLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        timingLabel.translatesAutoresizingMaskIntoConstraints = false
        cardView.addSubview(timingLabel)

        statusBadge.font = .systemFont(ofSize: 11, weight: .bold)
        statusBadge.textColor = UIColor(red: 5/255, green: 150/255, blue: 105/255, alpha: 1.0)
        statusBadge.backgroundColor = UIColor(red: 209/255, green: 250/255, blue: 229/255, alpha: 1.0)
        statusBadge.text = " ACTIVE "
        statusBadge.layer.cornerRadius = 6
        statusBadge.layer.masksToBounds = true
        statusBadge.textAlignment = .center
        statusBadge.translatesAutoresizingMaskIntoConstraints = false
        cardView.addSubview(statusBadge)

        NSLayoutConstraint.activate([
            cardView.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 6),
            cardView.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -6),
            cardView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            cardView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),

            iconContainer.leadingAnchor.constraint(equalTo: cardView.leadingAnchor, constant: 14),
            iconContainer.centerYAnchor.constraint(equalTo: cardView.centerYAnchor),
            iconContainer.widthAnchor.constraint(equalToConstant: 40),
            iconContainer.heightAnchor.constraint(equalToConstant: 40),

            iconView.centerXAnchor.constraint(equalTo: iconContainer.centerXAnchor),
            iconView.centerYAnchor.constraint(equalTo: iconContainer.centerYAnchor),

            titleLabel.topAnchor.constraint(equalTo: cardView.topAnchor, constant: 14),
            titleLabel.leadingAnchor.constraint(equalTo: iconContainer.trailingAnchor, constant: 12),
            titleLabel.trailingAnchor.constraint(lessThanOrEqualTo: statusBadge.leadingAnchor, constant: -8),

            timingLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 2),
            timingLabel.leadingAnchor.constraint(equalTo: iconContainer.trailingAnchor, constant: 12),
            timingLabel.bottomAnchor.constraint(equalTo: cardView.bottomAnchor, constant: -14),

            statusBadge.centerYAnchor.constraint(equalTo: cardView.centerYAnchor),
            statusBadge.trailingAnchor.constraint(equalTo: cardView.trailingAnchor, constant: -14),
            statusBadge.heightAnchor.constraint(equalToConstant: 22)
        ])
    }

    func configure(with shift: [String: Any]) {
        let name = shift["name"] as? String ?? "General"
        let start = shift["startTime"] as? String ?? "09:00"
        let end = shift["endTime"] as? String ?? "18:00"
        let isNight = shift["isNightShift"] as? Bool ?? false

        titleLabel.text = name
        timingLabel.text = "\(start) - \(end) (\(isNight ? "Night Shift" : "Day Shift"))"
        statusBadge.text = isNight ? " NIGHT " : " ACTIVE "
        if isNight {
            statusBadge.textColor = UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
            statusBadge.backgroundColor = UIColor(red: 238/255, green: 242/255, blue: 255/255, alpha: 1.0)
        } else {
            statusBadge.textColor = UIColor(red: 5/255, green: 150/255, blue: 105/255, alpha: 1.0)
            statusBadge.backgroundColor = UIColor(red: 209/255, green: 250/255, blue: 229/255, alpha: 1.0)
        }
    }
}

class ShiftsViewController: UIViewController, UITableViewDataSource, UITableViewDelegate {

    private let topBar = UIView()
    private let topBarContainer = UIView()
    private let backButton = UIButton(type: .system)
    private let brandSubtitleLabel = UILabel()
    private let titleLabel = UILabel()
    private let avatarContainer = UIView()
    private let avatarInitialsLabel = UILabel()

    private let headerCard = UIView()

    private let tableView = UITableView(frame: .zero, style: .plain)
    private let refreshControl = UIRefreshControl()
    private let emptyView = UIView()
    private let activityIndicator = UIActivityIndicatorView(style: .medium)

    private var shifts: [[String: Any]] = []

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)

        setupTopBar()
        setupHeaderCard()
        setupTableView()
        setupEmptyView()

        let swipe = UISwipeGestureRecognizer(target: self, action: #selector(handleBack))
        swipe.direction = .right
        view.addGestureRecognizer(swipe)

        loadShifts(showSpinner: true)
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
        backButton.addTarget(self, action: #selector(handleBack), for: .touchUpInside)
        leftStack.addArrangedSubview(backButton)

        let headerStack = UIStackView()
        headerStack.axis = .vertical
        headerStack.spacing = 1
        leftStack.addArrangedSubview(headerStack)

        brandSubtitleLabel.text = "GLOBIZHR"
        brandSubtitleLabel.textColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        brandSubtitleLabel.font = .systemFont(ofSize: 10, weight: .bold)
        headerStack.addArrangedSubview(brandSubtitleLabel)

        titleLabel.text = "Shifts & Schedules"
        titleLabel.font = .systemFont(ofSize: 18, weight: .bold)
        titleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        headerStack.addArrangedSubview(titleLabel)

        avatarContainer.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        avatarContainer.layer.cornerRadius = 18
        avatarContainer.layer.masksToBounds = true
        avatarContainer.translatesAutoresizingMaskIntoConstraints = false
        topBarContainer.addSubview(avatarContainer)

        let firstName = AuthService.shared.getFirstName()
        avatarInitialsLabel.text = firstName.isEmpty ? "C" : String(firstName.prefix(1)).uppercased()
        avatarInitialsLabel.textColor = .white
        avatarInitialsLabel.font = .systemFont(ofSize: 14, weight: .bold)
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
            topBarContainer.bottomAnchor.constraint(equalTo: topBar.bottomAnchor, constant: -10),
            topBarContainer.heightAnchor.constraint(equalToConstant: 44),

            leftStack.leadingAnchor.constraint(equalTo: topBarContainer.leadingAnchor),
            leftStack.centerYAnchor.constraint(equalTo: topBarContainer.centerYAnchor),

            avatarContainer.trailingAnchor.constraint(equalTo: topBarContainer.trailingAnchor),
            avatarContainer.centerYAnchor.constraint(equalTo: topBarContainer.centerYAnchor),
            avatarContainer.widthAnchor.constraint(equalToConstant: 36),
            avatarContainer.heightAnchor.constraint(equalToConstant: 36),

            avatarInitialsLabel.centerXAnchor.constraint(equalTo: avatarContainer.centerXAnchor),
            avatarInitialsLabel.centerYAnchor.constraint(equalTo: avatarContainer.centerYAnchor)
        ])
    }

    private func setupHeaderCard() {
        headerCard.backgroundColor = .white
        headerCard.layer.cornerRadius = 16
        headerCard.layer.borderWidth = 1
        headerCard.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        headerCard.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(headerCard)

        let iconContainer = UIView()
        iconContainer.backgroundColor = UIColor(red: 238/255, green: 242/255, blue: 255/255, alpha: 1.0)
        iconContainer.layer.cornerRadius = 20
        iconContainer.translatesAutoresizingMaskIntoConstraints = false
        headerCard.addSubview(iconContainer)

        let icon = UIImageView()
        let config = UIImage.SymbolConfiguration(pointSize: 18, weight: .bold)
        icon.image = UIImage(systemName: "calendar.badge.clock", withConfiguration: config)
        icon.tintColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        icon.contentMode = .scaleAspectFit
        icon.translatesAutoresizingMaskIntoConstraints = false
        iconContainer.addSubview(icon)

        let textStack = UIStackView()
        textStack.axis = .vertical
        textStack.spacing = 2
        textStack.translatesAutoresizingMaskIntoConstraints = false
        headerCard.addSubview(textStack)

        let hTitle = UILabel()
        hTitle.text = "Work Hours Policy"
        hTitle.font = .systemFont(ofSize: 16, weight: .bold)
        hTitle.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        textStack.addArrangedSubview(hTitle)

        let hSub = UILabel()
        hSub.text = "Standard 09:00 - 18:00 (Asia/Calcutta)"
        hSub.font = .systemFont(ofSize: 12, weight: .regular)
        hSub.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        textStack.addArrangedSubview(hSub)

        let badgesStack = UIStackView()
        badgesStack.axis = .horizontal
        badgesStack.spacing = 8
        badgesStack.translatesAutoresizingMaskIntoConstraints = false
        headerCard.addSubview(badgesStack)

        let b1 = UILabel()
        b1.text = " Min 8h Full Day "
        b1.font = .systemFont(ofSize: 11, weight: .bold)
        b1.textColor = UIColor(red: 5/255, green: 150/255, blue: 105/255, alpha: 1.0)
        b1.backgroundColor = UIColor(red: 209/255, green: 250/255, blue: 229/255, alpha: 1.0)
        b1.layer.cornerRadius = 6
        b1.layer.masksToBounds = true
        badgesStack.addArrangedSubview(b1)

        let b2 = UILabel()
        b2.text = " 15m Grace Period "
        b2.font = .systemFont(ofSize: 11, weight: .bold)
        b2.textColor = UIColor(red: 5/255, green: 150/255, blue: 105/255, alpha: 1.0)
        b2.backgroundColor = UIColor(red: 209/255, green: 250/255, blue: 229/255, alpha: 1.0)
        b2.layer.cornerRadius = 6
        b2.layer.masksToBounds = true
        badgesStack.addArrangedSubview(b2)

        NSLayoutConstraint.activate([
            headerCard.topAnchor.constraint(equalTo: topBar.bottomAnchor, constant: 14),
            headerCard.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
            headerCard.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16),

            iconContainer.leadingAnchor.constraint(equalTo: headerCard.leadingAnchor, constant: 16),
            iconContainer.topAnchor.constraint(equalTo: headerCard.topAnchor, constant: 16),
            iconContainer.widthAnchor.constraint(equalToConstant: 40),
            iconContainer.heightAnchor.constraint(equalToConstant: 40),

            icon.centerXAnchor.constraint(equalTo: iconContainer.centerXAnchor),
            icon.centerYAnchor.constraint(equalTo: iconContainer.centerYAnchor),

            textStack.leadingAnchor.constraint(equalTo: iconContainer.trailingAnchor, constant: 12),
            textStack.trailingAnchor.constraint(equalTo: headerCard.trailingAnchor, constant: -16),
            textStack.centerYAnchor.constraint(equalTo: iconContainer.centerYAnchor),

            badgesStack.topAnchor.constraint(equalTo: iconContainer.bottomAnchor, constant: 14),
            badgesStack.leadingAnchor.constraint(equalTo: headerCard.leadingAnchor, constant: 16),
            badgesStack.heightAnchor.constraint(equalToConstant: 24),
            badgesStack.bottomAnchor.constraint(equalTo: headerCard.bottomAnchor, constant: -16)
        ])
    }

    private func setupTableView() {
        tableView.backgroundColor = .clear
        tableView.separatorStyle = .none
        tableView.dataSource = self
        tableView.delegate = self
        tableView.register(ShiftCell.self, forCellReuseIdentifier: ShiftCell.identifier)
        tableView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(tableView)

        refreshControl.addTarget(self, action: #selector(handleRefresh), for: .valueChanged)
        tableView.refreshControl = refreshControl

        activityIndicator.translatesAutoresizingMaskIntoConstraints = false
        activityIndicator.hidesWhenStopped = true
        view.addSubview(activityIndicator)

        NSLayoutConstraint.activate([
            tableView.topAnchor.constraint(equalTo: headerCard.bottomAnchor, constant: 12),
            tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            tableView.bottomAnchor.constraint(equalTo: view.bottomAnchor),

            activityIndicator.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            activityIndicator.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])
    }

    private func setupEmptyView() {
        emptyView.translatesAutoresizingMaskIntoConstraints = false
        emptyView.isHidden = true
        view.addSubview(emptyView)

        let iconContainer = UIView()
        iconContainer.backgroundColor = UIColor(red: 238/255, green: 242/255, blue: 255/255, alpha: 1.0)
        iconContainer.layer.cornerRadius = 32
        iconContainer.translatesAutoresizingMaskIntoConstraints = false
        emptyView.addSubview(iconContainer)

        let icon = UIImageView()
        let config = UIImage.SymbolConfiguration(pointSize: 28, weight: .bold)
        icon.image = UIImage(systemName: "clock.badge.exclamationmark", withConfiguration: config)
        icon.tintColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        icon.contentMode = .scaleAspectFit
        icon.translatesAutoresizingMaskIntoConstraints = false
        iconContainer.addSubview(icon)

        let titleLabel = UILabel()
        titleLabel.text = "No Shifts Configured"
        titleLabel.font = .systemFont(ofSize: 17, weight: .bold)
        titleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        titleLabel.textAlignment = .center
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        emptyView.addSubview(titleLabel)

        let subLabel = UILabel()
        subLabel.text = "Your scheduled shifts will appear here once assigned by manager."
        subLabel.font = .systemFont(ofSize: 13, weight: .regular)
        subLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        subLabel.textAlignment = .center
        subLabel.numberOfLines = 2
        subLabel.translatesAutoresizingMaskIntoConstraints = false
        emptyView.addSubview(subLabel)

        NSLayoutConstraint.activate([
            emptyView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            emptyView.centerYAnchor.constraint(equalTo: view.centerYAnchor, constant: 40),
            emptyView.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 32),
            emptyView.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -32),

            iconContainer.centerXAnchor.constraint(equalTo: emptyView.centerXAnchor),
            iconContainer.topAnchor.constraint(equalTo: emptyView.topAnchor),
            iconContainer.widthAnchor.constraint(equalToConstant: 64),
            iconContainer.heightAnchor.constraint(equalToConstant: 64),

            icon.centerXAnchor.constraint(equalTo: iconContainer.centerXAnchor),
            icon.centerYAnchor.constraint(equalTo: iconContainer.centerYAnchor),

            titleLabel.topAnchor.constraint(equalTo: iconContainer.bottomAnchor, constant: 16),
            titleLabel.leadingAnchor.constraint(equalTo: emptyView.leadingAnchor),
            titleLabel.trailingAnchor.constraint(equalTo: emptyView.trailingAnchor),

            subLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 6),
            subLabel.leadingAnchor.constraint(equalTo: emptyView.leadingAnchor),
            subLabel.trailingAnchor.constraint(equalTo: emptyView.trailingAnchor),
            subLabel.bottomAnchor.constraint(equalTo: emptyView.bottomAnchor)
        ])
    }

    @objc private func handleRefresh() {
        loadShifts(showSpinner: false)
    }

    @objc private func handleBack() {
        dismiss(animated: true)
    }

    private func loadShifts(showSpinner: Bool) {
        if showSpinner { activityIndicator.startAnimating() }

        AuthService.shared.getCompanyShifts { [weak self] result in
            guard let self = self else { return }
            self.activityIndicator.stopAnimating()
            self.refreshControl.endRefreshing()

            switch result {
            case .success(let items):
                self.shifts = items
                self.emptyView.isHidden = !items.isEmpty
                self.tableView.isHidden = items.isEmpty
                self.tableView.reloadData()
            case .failure:
                self.emptyView.isHidden = !self.shifts.isEmpty
                self.tableView.isHidden = self.shifts.isEmpty
            }
        }
    }

    // MARK: - UITableViewDataSource & Delegate
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return shifts.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        guard let cell = tableView.dequeueReusableCell(withIdentifier: ShiftCell.identifier, for: indexPath) as? ShiftCell else {
            return UITableViewCell()
        }
        cell.configure(with: shifts[indexPath.row])
        return cell
    }

    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        let shift = shifts[indexPath.row]
        let name = shift["name"] as? String ?? "General"
        let start = shift["startTime"] as? String ?? "09:00"
        let end = shift["endTime"] as? String ?? "18:00"
        let isNight = shift["isNightShift"] as? Bool ?? false

        let alert = UIAlertController(
            title: "\(name) Shift",
            message: "Work Hours: \(start) - \(end)\nShift Type: \(isNight ? "Night Shift" : "Day Shift")\nAssigned: Developer\n\n- Minimum 8 hours for full-day attendance.\n- 15 minutes grace period on clock in.",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "Request Shift Swap", style: .default, handler: { _ in
            let toast = UIAlertController(title: "Swap Requested", message: "Shift swap request has been submitted to your manager.", preferredStyle: .alert)
            toast.addAction(UIAlertAction(title: "OK", style: .default))
            self.present(toast, animated: true)
        }))
        alert.addAction(UIAlertAction(title: "Close", style: .cancel))
        present(alert, animated: true)
    }
}

