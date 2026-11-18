import UIKit

class DocumentCell: UITableViewCell {
    static let identifier = "DocumentCell"

    private let cardView = UIView()
    private let iconContainer = UIView()
    private let iconView = UIImageView()
    private let titleLabel = UILabel()
    private let categoryLabel = UILabel()
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
        iconView.image = UIImage(systemName: "doc.text.fill", withConfiguration: config)
        iconView.tintColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        iconView.contentMode = .scaleAspectFit
        iconView.translatesAutoresizingMaskIntoConstraints = false
        iconContainer.addSubview(iconView)

        titleLabel.font = .systemFont(ofSize: 15, weight: .bold)
        titleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        cardView.addSubview(titleLabel)

        categoryLabel.font = .systemFont(ofSize: 11, weight: .bold)
        categoryLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        categoryLabel.translatesAutoresizingMaskIntoConstraints = false
        cardView.addSubview(categoryLabel)

        statusBadge.font = .systemFont(ofSize: 11, weight: .bold)
        statusBadge.textColor = UIColor(red: 5/255, green: 150/255, blue: 105/255, alpha: 1.0)
        statusBadge.backgroundColor = UIColor(red: 209/255, green: 250/255, blue: 229/255, alpha: 1.0)
        statusBadge.text = " VERIFIED "
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

            categoryLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 2),
            categoryLabel.leadingAnchor.constraint(equalTo: iconContainer.trailingAnchor, constant: 12),
            categoryLabel.bottomAnchor.constraint(equalTo: cardView.bottomAnchor, constant: -14),

            statusBadge.centerYAnchor.constraint(equalTo: cardView.centerYAnchor),
            statusBadge.trailingAnchor.constraint(equalTo: cardView.trailingAnchor, constant: -14),
            statusBadge.heightAnchor.constraint(equalToConstant: 22)
        ])
    }

    func configure(with doc: [String: Any]) {
        let name = doc["name"] as? String ?? (doc["title"] as? String ?? "Document")
        let category = doc["category"] as? String ?? "EMPLOYMENT"
        let status = doc["status"] as? String ?? "VERIFIED"

        titleLabel.text = name
        categoryLabel.text = category.uppercased()
        statusBadge.text = " \(status.uppercased()) "
    }
}

class DocumentsViewController: UIViewController, UITableViewDataSource, UITableViewDelegate {

    private let topBar = UIView()
    private let topBarContainer = UIView()
    private let backButton = UIButton(type: .system)
    private let brandSubtitleLabel = UILabel()
    private let titleLabel = UILabel()
    private let avatarContainer = UIView()
    private let avatarInitialsLabel = UILabel()

    private let headerCard = UIView()
    private let uploadButton = UIButton(type: .system)

    private let tableView = UITableView(frame: .zero, style: .plain)
    private let refreshControl = UIRefreshControl()
    private let emptyView = UIView()
    private let activityIndicator = UIActivityIndicatorView(style: .medium)

    private var documents: [[String: Any]] = []

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

        loadDocuments(showSpinner: true)
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

        titleLabel.text = "My Documents"
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
        icon.image = UIImage(systemName: "folder.fill", withConfiguration: config)
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
        hTitle.text = "Employee Document Vault"
        hTitle.font = .systemFont(ofSize: 16, weight: .bold)
        hTitle.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        textStack.addArrangedSubview(hTitle)

        let hSub = UILabel()
        hSub.text = "Securely view and upload contracts, IDs, and certificates"
        hSub.font = .systemFont(ofSize: 12, weight: .regular)
        hSub.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        textStack.addArrangedSubview(hSub)

        uploadButton.setTitle("+ Upload New Document", for: .normal)
        uploadButton.setTitleColor(.white, for: .normal)
        uploadButton.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        uploadButton.titleLabel?.font = .systemFont(ofSize: 14, weight: .bold)
        uploadButton.layer.cornerRadius = 10
        uploadButton.translatesAutoresizingMaskIntoConstraints = false
        uploadButton.addTarget(self, action: #selector(didTapUpload), for: .touchUpInside)
        headerCard.addSubview(uploadButton)

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

            uploadButton.topAnchor.constraint(equalTo: iconContainer.bottomAnchor, constant: 14),
            uploadButton.leadingAnchor.constraint(equalTo: headerCard.leadingAnchor, constant: 16),
            uploadButton.trailingAnchor.constraint(equalTo: headerCard.trailingAnchor, constant: -16),
            uploadButton.heightAnchor.constraint(equalToConstant: 44),
            uploadButton.bottomAnchor.constraint(equalTo: headerCard.bottomAnchor, constant: -16)
        ])
    }

    private func setupTableView() {
        tableView.backgroundColor = .clear
        tableView.separatorStyle = .none
        tableView.dataSource = self
        tableView.delegate = self
        tableView.register(DocumentCell.self, forCellReuseIdentifier: DocumentCell.identifier)
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
        icon.image = UIImage(systemName: "folder.badge.plus", withConfiguration: config)
        icon.tintColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        icon.contentMode = .scaleAspectFit
        icon.translatesAutoresizingMaskIntoConstraints = false
        iconContainer.addSubview(icon)

        let titleLabel = UILabel()
        titleLabel.text = "No Documents Uploaded"
        titleLabel.font = .systemFont(ofSize: 17, weight: .bold)
        titleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        titleLabel.textAlignment = .center
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        emptyView.addSubview(titleLabel)

        let subLabel = UILabel()
        subLabel.text = "Your verified records and uploaded credentials will appear here."
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
        loadDocuments(showSpinner: false)
    }

    @objc private func handleBack() {
        dismiss(animated: true)
    }

    @objc private func didTapUpload() {
        let sheet = UIAlertController(title: "Upload Document", message: "Select category of document to upload for verification", preferredStyle: .actionSheet)
        sheet.addAction(UIAlertAction(title: "Identity Document (Aadhaar / Passport)", style: .default, handler: { _ in
            self.showUploadSuccess(category: "Identity")
        }))
        sheet.addAction(UIAlertAction(title: "Employment Contract / Offer Letter", style: .default, handler: { _ in
            self.showUploadSuccess(category: "Employment")
        }))
        sheet.addAction(UIAlertAction(title: "Educational Certificate / Degree", style: .default, handler: { _ in
            self.showUploadSuccess(category: "Education")
        }))
        sheet.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        present(sheet, animated: true)
    }

    private func showUploadSuccess(category: String) {
        let alert = UIAlertController(title: "Document Uploaded", message: "\(category) document has been submitted for HR verification.", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }

    private func loadDocuments(showSpinner: Bool) {
        if showSpinner { activityIndicator.startAnimating() }

        AuthService.shared.getMyDocuments { [weak self] result in
            guard let self = self else { return }
            self.activityIndicator.stopAnimating()
            self.refreshControl.endRefreshing()

            switch result {
            case .success(let items):
                self.documents = items
                self.emptyView.isHidden = !items.isEmpty
                self.tableView.isHidden = items.isEmpty
                self.tableView.reloadData()
            case .failure:
                self.emptyView.isHidden = !self.documents.isEmpty
                self.tableView.isHidden = self.documents.isEmpty
            }
        }
    }

    // MARK: - UITableViewDataSource & Delegate
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return documents.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        guard let cell = tableView.dequeueReusableCell(withIdentifier: DocumentCell.identifier, for: indexPath) as? DocumentCell else {
            return UITableViewCell()
        }
        cell.configure(with: documents[indexPath.row])
        return cell
    }

    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        let doc = documents[indexPath.row]
        let name = doc["name"] as? String ?? (doc["title"] as? String ?? "Document")
        let category = doc["category"] as? String ?? "EMPLOYMENT"
        let status = doc["status"] as? String ?? "VERIFIED"

        let alert = UIAlertController(
            title: name,
            message: "Category: \(category)\nStatus: \(status)\n\nThis document is securely stored in your organization vault.",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "View Document", style: .default))
        alert.addAction(UIAlertAction(title: "Close", style: .cancel))
        present(alert, animated: true)
    }
}

