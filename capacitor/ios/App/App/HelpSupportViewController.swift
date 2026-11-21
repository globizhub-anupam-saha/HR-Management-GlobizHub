import UIKit

class HelpSupportViewController: UIViewController, UITextFieldDelegate, UITextViewDelegate {

    private let topBar = UIView()
    private let topBarContainer = UIView()
    private let backButton = UIButton(type: .system)
    private let brandSubtitleLabel = UILabel()
    private let titleLabel = UILabel()

    private let scrollView = UIScrollView()
    private let contentView = UIStackView()

    // Form fields
    private let categoryButton = UIButton(type: .system)
    private let prioritySegmented = UISegmentedControl(items: ["Low", "Medium", "High", "Urgent"])
    private let subjectField = UITextField()
    private let descriptionTextView = UITextView()
    private let submitButton = UIButton(type: .system)
    private let submitSpinner = UIActivityIndicatorView(style: .medium)

    // My tickets stack
    private let ticketsStack = UIStackView()

    private var selectedCategory = "GENERAL"
    private var selectedPriority = "MEDIUM"

    private let categories = [
        "HR": "HR & Personnel",
        "IT": "IT & Technical Support",
        "PAYROLL": "Payroll & Salary",
        "FACILITIES": "Facilities & Office",
        "GENERAL": "General Inquiries"
    ]

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
        navigationController?.setNavigationBarHidden(true, animated: false)

        setupTopBar()
        setupScrollView()
        setupContactCard()
        setupFaqSection()
        setupTicketForm()
        setupMyTicketsSection()

        loadMyTickets()
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

        titleLabel.text = "Help & Support"
        titleLabel.font = .systemFont(ofSize: 20, weight: .bold)
        titleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        headerStack.addArrangedSubview(titleLabel)

        let divider = UIView()
        divider.backgroundColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0)
        divider.translatesAutoresizingMaskIntoConstraints = false
        topBar.addSubview(divider)

        NSLayoutConstraint.activate([
            topBar.topAnchor.constraint(equalTo: view.topAnchor),
            topBar.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            topBar.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            topBar.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 58),

            topBarContainer.leadingAnchor.constraint(equalTo: topBar.leadingAnchor, constant: 16),
            topBarContainer.trailingAnchor.constraint(equalTo: topBar.trailingAnchor, constant: -16),
            topBarContainer.bottomAnchor.constraint(equalTo: topBar.bottomAnchor, constant: -10),
            topBarContainer.heightAnchor.constraint(equalToConstant: 44),

            leftStack.leadingAnchor.constraint(equalTo: topBarContainer.leadingAnchor),
            leftStack.centerYAnchor.constraint(equalTo: topBarContainer.centerYAnchor),

            backButton.widthAnchor.constraint(equalToConstant: 36),
            backButton.heightAnchor.constraint(equalToConstant: 36),

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
        contentView.spacing = 16
        contentView.translatesAutoresizingMaskIntoConstraints = false
        scrollView.addSubview(contentView)

        NSLayoutConstraint.activate([
            scrollView.topAnchor.constraint(equalTo: topBar.bottomAnchor),
            scrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scrollView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor),

            contentView.topAnchor.constraint(equalTo: scrollView.topAnchor, constant: 16),
            contentView.leadingAnchor.constraint(equalTo: scrollView.leadingAnchor, constant: 16),
            contentView.trailingAnchor.constraint(equalTo: scrollView.trailingAnchor, constant: -16),
            contentView.bottomAnchor.constraint(equalTo: scrollView.bottomAnchor, constant: -32),
            contentView.widthAnchor.constraint(equalTo: scrollView.widthAnchor, constant: -32)
        ])
    }

    // MARK: - Contact Card
    private func setupContactCard() {
        let card = makeCardView()

        let header = UIStackView()
        header.axis = .horizontal
        header.spacing = 8
        header.alignment = .center

        let icon = UIImageView(image: UIImage(systemName: "envelope.fill"))
        icon.tintColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        icon.translatesAutoresizingMaskIntoConstraints = false
        icon.widthAnchor.constraint(equalToConstant: 20).isActive = true
        icon.heightAnchor.constraint(equalToConstant: 20).isActive = true

        let title = UILabel()
        title.text = "Need Instant HR Assistance?"
        title.font = .systemFont(ofSize: 15, weight: .bold)
        title.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)

        header.addArrangedSubview(icon)
        header.addArrangedSubview(title)
        card.addArrangedSubview(header)

        let subtitle = UILabel()
        subtitle.text = "Our operations desk is available Mon - Fri (9:00 AM - 6:00 PM). Write directly or submit a ticket below."
        subtitle.font = .systemFont(ofSize: 13, weight: .regular)
        subtitle.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        subtitle.numberOfLines = 0
        card.addArrangedSubview(subtitle)

        let contactRow = UIStackView()
        contactRow.axis = .horizontal
        contactRow.spacing = 10
        contactRow.distribution = .fillEqually

        let emailBtn = makeActionButton(title: "Email HR Desk", icon: "paperplane.fill", bg: UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0), fg: .white, action: #selector(handleContactHR))
        let callBtn = makeActionButton(title: "Call Support", icon: "phone.fill", bg: UIColor(red: 239/255, green: 246/255, blue: 255/255, alpha: 1.0), fg: UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0), action: #selector(handleCallSupport))

        contactRow.addArrangedSubview(emailBtn)
        contactRow.addArrangedSubview(callBtn)
        card.addArrangedSubview(contactRow)

        contentView.addArrangedSubview(card)
    }

    // MARK: - FAQ Section
    private func setupFaqSection() {
        let card = makeCardView()

        let header = UIStackView()
        header.axis = .horizontal
        header.spacing = 8
        header.alignment = .center

        let icon = UIImageView(image: UIImage(systemName: "questionmark.circle.fill"))
        icon.tintColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        icon.translatesAutoresizingMaskIntoConstraints = false
        icon.widthAnchor.constraint(equalToConstant: 20).isActive = true
        icon.heightAnchor.constraint(equalToConstant: 20).isActive = true

        let title = UILabel()
        title.text = "Frequently Asked Questions"
        title.font = .systemFont(ofSize: 15, weight: .bold)
        title.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)

        header.addArrangedSubview(icon)
        header.addArrangedSubview(title)
        card.addArrangedSubview(header)
        card.addArrangedSubview(makeDivider())

        let faqs = [
            ("How do I clock in / out?", "Go to the Dashboard tab. When your scheduled shift is active (with a 5-minute pre-shift window), the Clock In button activates. Tap to record your attendance."),
            ("How can I apply for paid leave?", "Navigate to More > Leaves > Request Leave. Select your leave category (Casual, Sick, Privilege), choose date ranges, provide a reason, and submit for Manager approval."),
            ("Where can I download payslips?", "Go to More > Payslips. You can review your monthly gross pay, tax deductions, PF/ESIC deductions, and tap Download PDF for your records."),
            ("How to request a shift swap?", "Open More > Shifts > Shift Swap. Pick the desired date and select an eligible team member to submit a swap request.")
        ]

        for (q, a) in faqs {
            card.addArrangedSubview(makeFaqItem(question: q, answer: a))
        }

        contentView.addArrangedSubview(card)
    }

    private func makeFaqItem(question: String, answer: String) -> UIView {
        let container = UIStackView()
        container.axis = .vertical
        container.spacing = 4

        let qLabel = UILabel()
        qLabel.text = "Q: " + question
        qLabel.font = .systemFont(ofSize: 13, weight: .bold)
        qLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        container.addArrangedSubview(qLabel)

        let aLabel = UILabel()
        aLabel.text = answer
        aLabel.font = .systemFont(ofSize: 12, weight: .regular)
        aLabel.textColor = UIColor(red: 71/255, green: 85/255, blue: 105/255, alpha: 1.0)
        aLabel.numberOfLines = 0
        container.addArrangedSubview(aLabel)

        return container
    }

    // MARK: - Ticket Form
    private func setupTicketForm() {
        let card = makeCardView()

        let header = UIStackView()
        header.axis = .horizontal
        header.spacing = 8
        header.alignment = .center

        let icon = UIImageView(image: UIImage(systemName: "square.and.pencil"))
        icon.tintColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        icon.translatesAutoresizingMaskIntoConstraints = false
        icon.widthAnchor.constraint(equalToConstant: 20).isActive = true
        icon.heightAnchor.constraint(equalToConstant: 20).isActive = true

        let title = UILabel()
        title.text = "Submit a Support Ticket"
        title.font = .systemFont(ofSize: 15, weight: .bold)
        title.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)

        header.addArrangedSubview(icon)
        header.addArrangedSubview(title)
        card.addArrangedSubview(header)
        card.addArrangedSubview(makeDivider())

        // Category
        let catStack = UIStackView()
        catStack.axis = .vertical
        catStack.spacing = 6
        let catLbl = UILabel()
        catLbl.text = "Category"
        catLbl.font = .systemFont(ofSize: 13, weight: .semibold)
        catLbl.textColor = UIColor(red: 51/255, green: 65/255, blue: 85/255, alpha: 1.0)
        catStack.addArrangedSubview(catLbl)

        categoryButton.setTitle("General Inquiries", for: .normal)
        categoryButton.setTitleColor(UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0), for: .normal)
        categoryButton.titleLabel?.font = .systemFont(ofSize: 14)
        categoryButton.contentHorizontalAlignment = .left
        categoryButton.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
        categoryButton.layer.cornerRadius = 10
        categoryButton.layer.borderWidth = 1
        categoryButton.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        categoryButton.contentEdgeInsets = UIEdgeInsets(top: 10, left: 12, bottom: 10, right: 12)
        categoryButton.addTarget(self, action: #selector(handleSelectCategory), for: .touchUpInside)
        catStack.addArrangedSubview(categoryButton)
        card.addArrangedSubview(catStack)

        // Priority
        let pStack = UIStackView()
        pStack.axis = .vertical
        pStack.spacing = 6
        let pLbl = UILabel()
        pLbl.text = "Priority Level"
        pLbl.font = .systemFont(ofSize: 13, weight: .semibold)
        pLbl.textColor = UIColor(red: 51/255, green: 65/255, blue: 85/255, alpha: 1.0)
        pStack.addArrangedSubview(pLbl)

        prioritySegmented.selectedSegmentIndex = 1
        prioritySegmented.selectedSegmentTintColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        prioritySegmented.setTitleTextAttributes([.foregroundColor: UIColor.white, .font: UIFont.systemFont(ofSize: 13, weight: .bold)], for: .selected)
        prioritySegmented.setTitleTextAttributes([.foregroundColor: UIColor(red: 71/255, green: 85/255, blue: 105/255, alpha: 1.0), .font: UIFont.systemFont(ofSize: 13)], for: .normal)
        prioritySegmented.addTarget(self, action: #selector(handlePriorityChanged), for: .valueChanged)
        pStack.addArrangedSubview(prioritySegmented)
        card.addArrangedSubview(pStack)

        // Subject
        let subStack = UIStackView()
        subStack.axis = .vertical
        subStack.spacing = 6
        let subLbl = UILabel()
        subLbl.text = "Subject / Issue Summary"
        subLbl.font = .systemFont(ofSize: 13, weight: .semibold)
        subLbl.textColor = UIColor(red: 51/255, green: 65/255, blue: 85/255, alpha: 1.0)
        subStack.addArrangedSubview(subLbl)

        subjectField.placeholder = "Brief title of the issue"
        subjectField.font = .systemFont(ofSize: 14)
        subjectField.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        subjectField.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
        subjectField.layer.cornerRadius = 10
        subjectField.layer.borderWidth = 1
        subjectField.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        subjectField.leftView = UIView(frame: CGRect(x: 0, y: 0, width: 12, height: 40))
        subjectField.leftViewMode = .always
        subjectField.heightAnchor.constraint(equalToConstant: 44).isActive = true
        subStack.addArrangedSubview(subjectField)
        card.addArrangedSubview(subStack)

        // Description
        let descStack = UIStackView()
        descStack.axis = .vertical
        descStack.spacing = 6
        let descLbl = UILabel()
        descLbl.text = "Detailed Description"
        descLbl.font = .systemFont(ofSize: 13, weight: .semibold)
        descLbl.textColor = UIColor(red: 51/255, green: 65/255, blue: 85/255, alpha: 1.0)
        descStack.addArrangedSubview(descLbl)

        descriptionTextView.font = .systemFont(ofSize: 14)
        descriptionTextView.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        descriptionTextView.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
        descriptionTextView.layer.cornerRadius = 10
        descriptionTextView.layer.borderWidth = 1
        descriptionTextView.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        descriptionTextView.textContainerInset = UIEdgeInsets(top: 10, left: 8, bottom: 10, right: 8)
        descriptionTextView.heightAnchor.constraint(equalToConstant: 90).isActive = true
        descStack.addArrangedSubview(descriptionTextView)
        card.addArrangedSubview(descStack)

        // Submit Button
        submitButton.setTitle("Submit Ticket", for: .normal)
        submitButton.titleLabel?.font = .systemFont(ofSize: 15, weight: .bold)
        submitButton.setTitleColor(.white, for: .normal)
        submitButton.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        submitButton.layer.cornerRadius = 12
        submitButton.heightAnchor.constraint(equalToConstant: 48).isActive = true
        submitButton.addTarget(self, action: #selector(handleSubmitTicket), for: .touchUpInside)

        submitSpinner.color = .white
        submitSpinner.hidesWhenStopped = true
        submitSpinner.translatesAutoresizingMaskIntoConstraints = false
        submitButton.addSubview(submitSpinner)
        NSLayoutConstraint.activate([
            submitSpinner.centerYAnchor.constraint(equalTo: submitButton.centerYAnchor),
            submitSpinner.trailingAnchor.constraint(equalTo: submitButton.trailingAnchor, constant: -20)
        ])
        card.addArrangedSubview(submitButton)

        contentView.addArrangedSubview(card)
    }

    // MARK: - My Tickets Section
    private func setupMyTicketsSection() {
        let card = makeCardView()

        let header = UIStackView()
        header.axis = .horizontal
        header.spacing = 8
        header.alignment = .center

        let icon = UIImageView(image: UIImage(systemName: "list.bullet.rectangle"))
        icon.tintColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        icon.translatesAutoresizingMaskIntoConstraints = false
        icon.widthAnchor.constraint(equalToConstant: 20).isActive = true
        icon.heightAnchor.constraint(equalToConstant: 20).isActive = true

        let title = UILabel()
        title.text = "My Submitted Tickets"
        title.font = .systemFont(ofSize: 15, weight: .bold)
        title.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)

        header.addArrangedSubview(icon)
        header.addArrangedSubview(title)
        card.addArrangedSubview(header)
        card.addArrangedSubview(makeDivider())

        ticketsStack.axis = .vertical
        ticketsStack.spacing = 10
        card.addArrangedSubview(ticketsStack)

        contentView.addArrangedSubview(card)
    }

    // MARK: - Action Helpers
    private func makeActionButton(title: String, icon: String, bg: UIColor, fg: UIColor, action: Selector) -> UIButton {
        let btn = UIButton(type: .system)
        let config = UIImage.SymbolConfiguration(pointSize: 13, weight: .semibold)
        btn.setImage(UIImage(systemName: icon, withConfiguration: config), for: .normal)
        btn.setTitle(" " + title, for: .normal)
        btn.setTitleColor(fg, for: .normal)
        btn.tintColor = fg
        btn.titleLabel?.font = .systemFont(ofSize: 13, weight: .bold)
        btn.backgroundColor = bg
        btn.layer.cornerRadius = 10
        btn.heightAnchor.constraint(equalToConstant: 40).isActive = true
        btn.addTarget(self, action: action, for: .touchUpInside)
        return btn
    }

    private func makeCardView() -> UIStackView {
        let stack = UIStackView()
        stack.axis = .vertical
        stack.spacing = 12
        stack.backgroundColor = .white
        stack.layer.cornerRadius = 16
        stack.layer.borderWidth = 1
        stack.layer.borderColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0).cgColor
        stack.isLayoutMarginsRelativeArrangement = true
        stack.layoutMargins = UIEdgeInsets(top: 16, left: 16, bottom: 16, right: 16)
        return stack
    }

    private func makeDivider() -> UIView {
        let divider = UIView()
        divider.backgroundColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0)
        divider.translatesAutoresizingMaskIntoConstraints = false
        divider.heightAnchor.constraint(equalToConstant: 1).isActive = true
        return divider
    }

    // MARK: - Handlers
    @objc private func handleBack() {
        if let nav = navigationController {
            nav.popViewController(animated: true)
        } else {
            dismiss(animated: true)
        }
    }

    @objc private func handleContactHR() {
        if let url = URL(string: "mailto:support@globizhub.com?subject=GlobizHR%20Help%20Request") {
            UIApplication.shared.open(url)
        }
    }

    @objc private func handleCallSupport() {
        let alert = UIAlertController(title: "HR Helpline", message: "Call GlobizHub Support Desk:\n+91 98765 43210", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Call", style: .default, handler: { _ in
            if let url = URL(string: "tel://+919876543210") {
                UIApplication.shared.open(url)
            }
        }))
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        present(alert, animated: true)
    }

    @objc private func handleSelectCategory() {
        let sheet = UIAlertController(title: "Select Ticket Category", message: nil, preferredStyle: .actionSheet)
        for (key, display) in categories {
            sheet.addAction(UIAlertAction(title: display, style: .default, handler: { [weak self] _ in
                self?.selectedCategory = key
                self?.categoryButton.setTitle(display, for: .normal)
            }))
        }
        sheet.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        present(sheet, animated: true)
    }

    @objc private func handlePriorityChanged() {
        switch prioritySegmented.selectedSegmentIndex {
        case 0: selectedPriority = "LOW"
        case 1: selectedPriority = "MEDIUM"
        case 2: selectedPriority = "HIGH"
        default: selectedPriority = "URGENT"
        }
    }

    @objc private func handleSubmitTicket() {
        let title = subjectField.text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        let desc = descriptionTextView.text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""

        if title.isEmpty || desc.isEmpty {
            let alert = UIAlertController(title: "Missing Information", message: "Please enter both a summary title and a detailed description.", preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "OK", style: .default))
            present(alert, animated: true)
            return
        }

        submitButton.isEnabled = false
        submitSpinner.startAnimating()

        AuthService.shared.createSupportTicket(title: title, category: selectedCategory, priority: selectedPriority, description: desc) { [weak self] result in
            guard let self = self else { return }
            self.submitButton.isEnabled = true
            self.submitSpinner.stopAnimating()

            switch result {
            case .success:
                self.subjectField.text = ""
                self.descriptionTextView.text = ""
                let alert = UIAlertController(title: "Ticket Submitted", message: "Your support request has been logged. Our HR/IT desk will respond shortly.", preferredStyle: .alert)
                alert.addAction(UIAlertAction(title: "OK", style: .default))
                self.present(alert, animated: true)
                self.loadMyTickets()
            case .failure(let err):
                let alert = UIAlertController(title: "Submission Error", message: err.localizedDescription, preferredStyle: .alert)
                alert.addAction(UIAlertAction(title: "OK", style: .default))
                self.present(alert, animated: true)
            }
        }
    }

    private func loadMyTickets() {
        AuthService.shared.getMySupportTickets { [weak self] result in
            guard let self = self else { return }
            for v in self.ticketsStack.arrangedSubviews {
                v.removeFromSuperview()
            }

            switch result {
            case .success(let list):
                if list.isEmpty {
                    let emptyLbl = UILabel()
                    emptyLbl.text = "No open support tickets. Everything is running smoothly."
                    emptyLbl.font = .systemFont(ofSize: 13)
                    emptyLbl.textColor = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 1.0)
                    emptyLbl.textAlignment = .center
                    self.ticketsStack.addArrangedSubview(emptyLbl)
                    return
                }

                for item in list {
                    let titleStr = item["title"] as? String ?? "Support Ticket"
                    let cat = item["category"] as? String ?? "GENERAL"
                    let status = item["status"] as? String ?? "OPEN"

                    let row = UIStackView()
                    row.axis = .horizontal
                    row.distribution = .equalSpacing
                    row.alignment = .center

                    let left = UIStackView()
                    left.axis = .vertical
                    left.spacing = 2

                    let tLabel = UILabel()
                    tLabel.text = titleStr
                    tLabel.font = .systemFont(ofSize: 13, weight: .semibold)
                    tLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)

                    let subLabel = UILabel()
                    subLabel.text = "Category: \(cat)"
                    subLabel.font = .systemFont(ofSize: 11)
                    subLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)

                    left.addArrangedSubview(tLabel)
                    left.addArrangedSubview(subLabel)
                    row.addArrangedSubview(left)

                    let statusBadge = UILabel()
                    statusBadge.text = " \(status) "
                    statusBadge.font = .systemFont(ofSize: 11, weight: .bold)
                    statusBadge.layer.cornerRadius = 6
                    statusBadge.layer.masksToBounds = true
                    if status == "RESOLVED" {
                        statusBadge.textColor = UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1.0)
                        statusBadge.backgroundColor = UIColor(red: 236/255, green: 253/255, blue: 245/255, alpha: 1.0)
                    } else {
                        statusBadge.textColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
                        statusBadge.backgroundColor = UIColor(red: 239/255, green: 246/255, blue: 255/255, alpha: 1.0)
                    }
                    row.addArrangedSubview(statusBadge)

                    self.ticketsStack.addArrangedSubview(row)
                }

            case .failure:
                let emptyLbl = UILabel()
                emptyLbl.text = "No open support tickets."
                emptyLbl.font = .systemFont(ofSize: 13)
                emptyLbl.textColor = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 1.0)
                emptyLbl.textAlignment = .center
                self.ticketsStack.addArrangedSubview(emptyLbl)
            }
        }
    }
}
