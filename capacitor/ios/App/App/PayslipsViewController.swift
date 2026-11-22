import UIKit

class PayslipCell: UITableViewCell {
    static let identifier = "PayslipCell"

    private let cardView = UIView()
    private let titleLabel = UILabel()
    private let subtitleLabel = UILabel()
    private let statusBadge = UILabel()
    private let divider = UIView()
    private let netTitleLabel = UILabel()
    private let netAmountLabel = UILabel()
    private let grossTitleLabel = UILabel()
    private let grossAmountLabel = UILabel()
    private let subDivider = UIView()
    private let scheduledIcon = UIImageView()
    private let scheduledLabel = UILabel()
    private let lopLabel = UILabel()
    private let chevronIcon = UIImageView()

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

        titleLabel.font = .systemFont(ofSize: 16, weight: .bold)
        titleLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        cardView.addSubview(titleLabel)

        subtitleLabel.font = .systemFont(ofSize: 11, weight: .bold)
        subtitleLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        subtitleLabel.text = "PROCESSED SALARY"
        subtitleLabel.translatesAutoresizingMaskIntoConstraints = false
        cardView.addSubview(subtitleLabel)

        statusBadge.font = .systemFont(ofSize: 11, weight: .bold)
        statusBadge.textColor = UIColor(red: 5/255, green: 150/255, blue: 105/255, alpha: 1.0)
        statusBadge.backgroundColor = UIColor(red: 209/255, green: 250/255, blue: 229/255, alpha: 1.0)
        statusBadge.text = " PAID "
        statusBadge.layer.cornerRadius = 6
        statusBadge.layer.masksToBounds = true
        statusBadge.textAlignment = .center
        statusBadge.translatesAutoresizingMaskIntoConstraints = false
        cardView.addSubview(statusBadge)

        divider.backgroundColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0)
        divider.translatesAutoresizingMaskIntoConstraints = false
        cardView.addSubview(divider)

        netTitleLabel.font = .systemFont(ofSize: 12, weight: .regular)
        netTitleLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        netTitleLabel.text = "Net Take-Home"
        netTitleLabel.translatesAutoresizingMaskIntoConstraints = false
        cardView.addSubview(netTitleLabel)

        netAmountLabel.font = .systemFont(ofSize: 18, weight: .bold)
        netAmountLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        netAmountLabel.translatesAutoresizingMaskIntoConstraints = false
        cardView.addSubview(netAmountLabel)

        grossTitleLabel.font = .systemFont(ofSize: 12, weight: .regular)
        grossTitleLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        grossTitleLabel.text = "Gross / Deductions"
        grossTitleLabel.textAlignment = .right
        grossTitleLabel.translatesAutoresizingMaskIntoConstraints = false
        cardView.addSubview(grossTitleLabel)

        grossAmountLabel.font = .systemFont(ofSize: 13, weight: .semibold)
        grossAmountLabel.textColor = UIColor(red: 71/255, green: 85/255, blue: 105/255, alpha: 1.0)
        grossAmountLabel.textAlignment = .right
        grossAmountLabel.translatesAutoresizingMaskIntoConstraints = false
        cardView.addSubview(grossAmountLabel)

        subDivider.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
        subDivider.translatesAutoresizingMaskIntoConstraints = false
        cardView.addSubview(subDivider)

        let calConfig = UIImage.SymbolConfiguration(pointSize: 12, weight: .regular)
        scheduledIcon.image = UIImage(systemName: "calendar", withConfiguration: calConfig)
        scheduledIcon.tintColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        scheduledIcon.contentMode = .scaleAspectFit
        scheduledIcon.translatesAutoresizingMaskIntoConstraints = false
        cardView.addSubview(scheduledIcon)

        scheduledLabel.font = .systemFont(ofSize: 11, weight: .regular)
        scheduledLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        scheduledLabel.translatesAutoresizingMaskIntoConstraints = false
        cardView.addSubview(scheduledLabel)

        lopLabel.font = .systemFont(ofSize: 11, weight: .bold)
        lopLabel.textColor = UIColor(red: 225/255, green: 29/255, blue: 72/255, alpha: 1.0)
        lopLabel.translatesAutoresizingMaskIntoConstraints = false
        cardView.addSubview(lopLabel)

        let chevConfig = UIImage.SymbolConfiguration(pointSize: 12, weight: .bold)
        chevronIcon.image = UIImage(systemName: "chevron.right", withConfiguration: chevConfig)
        chevronIcon.tintColor = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 1.0)
        chevronIcon.contentMode = .scaleAspectFit
        chevronIcon.translatesAutoresizingMaskIntoConstraints = false
        cardView.addSubview(chevronIcon)

        NSLayoutConstraint.activate([
            cardView.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 6),
            cardView.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -6),
            cardView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            cardView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),

            titleLabel.topAnchor.constraint(equalTo: cardView.topAnchor, constant: 14),
            titleLabel.leadingAnchor.constraint(equalTo: cardView.leadingAnchor, constant: 16),

            subtitleLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 2),
            subtitleLabel.leadingAnchor.constraint(equalTo: cardView.leadingAnchor, constant: 16),

            statusBadge.centerYAnchor.constraint(equalTo: titleLabel.centerYAnchor),
            statusBadge.trailingAnchor.constraint(equalTo: cardView.trailingAnchor, constant: -16),
            statusBadge.heightAnchor.constraint(equalToConstant: 22),

            divider.topAnchor.constraint(equalTo: subtitleLabel.bottomAnchor, constant: 12),
            divider.leadingAnchor.constraint(equalTo: cardView.leadingAnchor, constant: 16),
            divider.trailingAnchor.constraint(equalTo: cardView.trailingAnchor, constant: -16),
            divider.heightAnchor.constraint(equalToConstant: 1),

            netTitleLabel.topAnchor.constraint(equalTo: divider.bottomAnchor, constant: 10),
            netTitleLabel.leadingAnchor.constraint(equalTo: cardView.leadingAnchor, constant: 16),

            netAmountLabel.topAnchor.constraint(equalTo: netTitleLabel.bottomAnchor, constant: 2),
            netAmountLabel.leadingAnchor.constraint(equalTo: cardView.leadingAnchor, constant: 16),

            grossTitleLabel.topAnchor.constraint(equalTo: divider.bottomAnchor, constant: 10),
            grossTitleLabel.trailingAnchor.constraint(equalTo: cardView.trailingAnchor, constant: -16),

            grossAmountLabel.topAnchor.constraint(equalTo: grossTitleLabel.bottomAnchor, constant: 2),
            grossAmountLabel.trailingAnchor.constraint(equalTo: cardView.trailingAnchor, constant: -16),

            subDivider.topAnchor.constraint(equalTo: netAmountLabel.bottomAnchor, constant: 10),
            subDivider.leadingAnchor.constraint(equalTo: cardView.leadingAnchor, constant: 16),
            subDivider.trailingAnchor.constraint(equalTo: cardView.trailingAnchor, constant: -16),
            subDivider.heightAnchor.constraint(equalToConstant: 1),

            scheduledIcon.leadingAnchor.constraint(equalTo: cardView.leadingAnchor, constant: 16),
            scheduledIcon.topAnchor.constraint(equalTo: subDivider.bottomAnchor, constant: 10),
            scheduledIcon.bottomAnchor.constraint(equalTo: cardView.bottomAnchor, constant: -12),
            scheduledIcon.widthAnchor.constraint(equalToConstant: 14),
            scheduledIcon.heightAnchor.constraint(equalToConstant: 14),

            scheduledLabel.leadingAnchor.constraint(equalTo: scheduledIcon.trailingAnchor, constant: 5),
            scheduledLabel.centerYAnchor.constraint(equalTo: scheduledIcon.centerYAnchor),

            lopLabel.leadingAnchor.constraint(equalTo: scheduledLabel.trailingAnchor, constant: 8),
            lopLabel.centerYAnchor.constraint(equalTo: scheduledIcon.centerYAnchor),

            chevronIcon.trailingAnchor.constraint(equalTo: cardView.trailingAnchor, constant: -16),
            chevronIcon.centerYAnchor.constraint(equalTo: scheduledIcon.centerYAnchor),
            chevronIcon.widthAnchor.constraint(equalToConstant: 14),
            chevronIcon.heightAnchor.constraint(equalToConstant: 14)
        ])
    }

    func configure(with item: [String: Any]) {
        let month = item["month"] as? Int ?? 1
        let year = item["year"] as? Int ?? 2026
        let net = item["netPay"] as? Double ?? (item["netSalary"] as? Double ?? 0.0)
        let basic = item["basicPay"] as? Double ?? 0.0
        let allow = item["allowances"] as? Double ?? 0.0
        let gross = item["grossPay"] as? Double ?? (item["grossSalary"] as? Double ?? (basic + allow))
        let ded = item["totalDeductions"] as? Double ?? (item["deductions"] as? Double ?? (gross - net))
        let totalWorkingDays = item["totalWorkingDays"] as? Int ?? 30
        let unpaidLeaves = item["unpaidLeaves"] as? Int ?? 0
        let status = (item["status"] as? String ?? "PAID").uppercased()

        let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        let monthName = (month >= 1 && month <= 12) ? months[month - 1] : "Month \(month)"
        titleLabel.text = "\(monthName) \(year)"

        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = Locale(identifier: "en_IN")
        formatter.maximumFractionDigits = 0

        netAmountLabel.text = formatter.string(from: NSNumber(value: net)) ?? "₹\(Int(net))"
        let grossStr = formatter.string(from: NSNumber(value: gross)) ?? "₹\(Int(gross))"
        let dedStr = formatter.string(from: NSNumber(value: ded)) ?? "₹\(Int(ded))"
        grossAmountLabel.text = "\(grossStr) / \(dedStr)"

        statusBadge.text = " \(status) "
        scheduledLabel.text = "\(totalWorkingDays) Scheduled Days"

        if unpaidLeaves > 0 {
            lopLabel.text = "• \(unpaidLeaves) LOP Days"
            lopLabel.isHidden = false
        } else {
            lopLabel.isHidden = true
        }
    }
}

// MARK: - Payslip Detail Breakdown Modal Controller
class PayslipDetailViewController: UIViewController {

    private let payslip: [String: Any]

    init(payslip: [String: Any]) {
        self.payslip = payslip
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white
        setupUI()
    }

    private func setupUI() {
        let scrollView = UIScrollView()
        scrollView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(scrollView)

        let contentView = UIView()
        contentView.translatesAutoresizingMaskIntoConstraints = false
        scrollView.addSubview(contentView)

        // Close / Drag Header
        let closeBtn = UIButton(type: .system)
        let closeConfig = UIImage.SymbolConfiguration(pointSize: 16, weight: .bold)
        closeBtn.setImage(UIImage(systemName: "xmark.circle.fill", withConfiguration: closeConfig), for: .normal)
        closeBtn.tintColor = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 1.0)
        closeBtn.addTarget(self, action: #selector(handleClose), for: .touchUpInside)
        closeBtn.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(closeBtn)

        let companyLabel = UILabel()
        var companyName = "GLOBIZHUB HR"
        if let compObj = payslip["company"] as? [String: Any], let name = compObj["name"] as? String, !name.isEmpty {
            companyName = name
        }
        companyLabel.text = companyName.uppercased()
        companyLabel.font = .systemFont(ofSize: 11, weight: .bold)
        companyLabel.textColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        companyLabel.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(companyLabel)

        let month = payslip["month"] as? Int ?? 1
        let year = payslip["year"] as? Int ?? 2026
        let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        let monthName = (month >= 1 && month <= 12) ? months[month - 1] : "Month \(month)"

        let periodLabel = UILabel()
        periodLabel.text = "Payslip for \(monthName) \(year)"
        periodLabel.font = .systemFont(ofSize: 20, weight: .bold)
        periodLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        periodLabel.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(periodLabel)

        let statusBadge = UILabel()
        let status = (payslip["status"] as? String ?? "PAID").uppercased()
        statusBadge.text = " \(status) "
        statusBadge.font = .systemFont(ofSize: 11, weight: .bold)
        statusBadge.textColor = UIColor(red: 5/255, green: 150/255, blue: 105/255, alpha: 1.0)
        statusBadge.backgroundColor = UIColor(red: 209/255, green: 250/255, blue: 229/255, alpha: 1.0)
        statusBadge.layer.cornerRadius = 6
        statusBadge.layer.masksToBounds = true
        statusBadge.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(statusBadge)

        // Numbers & Formatting
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = Locale(identifier: "en_IN")
        formatter.maximumFractionDigits = 0

        let net = payslip["netPay"] as? Double ?? (payslip["netSalary"] as? Double ?? 0.0)
        let basic = payslip["basicPay"] as? Double ?? 0.0
        let allow = payslip["allowances"] as? Double ?? 0.0
        let gross = payslip["grossPay"] as? Double ?? (payslip["grossSalary"] as? Double ?? (basic + allow))
        let ded = payslip["totalDeductions"] as? Double ?? (payslip["deductions"] as? Double ?? (gross - net))
        let totalWorkingDays = payslip["totalWorkingDays"] as? Int ?? 30
        let presentDays = payslip["presentDays"] as? Int ?? totalWorkingDays
        let unpaidLeaves = payslip["unpaidLeaves"] as? Int ?? 0

        // Highlight Box: Net Salary Payable
        let netCard = UIView()
        netCard.backgroundColor = UIColor(red: 239/255, green: 246/255, blue: 255/255, alpha: 1.0)
        netCard.layer.cornerRadius = 16
        netCard.layer.borderWidth = 1
        netCard.layer.borderColor = UIColor(red: 219/255, green: 234/255, blue: 254/255, alpha: 1.0).cgColor
        netCard.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(netCard)

        let netSub = UILabel()
        netSub.text = "Net Salary Payable"
        netSub.font = .systemFont(ofSize: 12, weight: .bold)
        netSub.textColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        netSub.translatesAutoresizingMaskIntoConstraints = false
        netCard.addSubview(netSub)

        let netVal = UILabel()
        netVal.text = formatter.string(from: NSNumber(value: net)) ?? "₹\(Int(net))"
        netVal.font = .systemFont(ofSize: 24, weight: .bold)
        netVal.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        netVal.translatesAutoresizingMaskIntoConstraints = false
        netCard.addSubview(netVal)

        let netIcon = UIImageView()
        let trendConfig = UIImage.SymbolConfiguration(pointSize: 24, weight: .semibold)
        netIcon.image = UIImage(systemName: "banknote", withConfiguration: trendConfig)
        netIcon.tintColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        netIcon.contentMode = .scaleAspectFit
        netIcon.translatesAutoresizingMaskIntoConstraints = false
        netCard.addSubview(netIcon)

        // Earnings & Deductions Container
        let breakdownCard = UIView()
        breakdownCard.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
        breakdownCard.layer.cornerRadius = 14
        breakdownCard.layer.borderWidth = 1
        breakdownCard.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        breakdownCard.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(breakdownCard)

        let earningsTitle = UILabel()
        earningsTitle.text = "EARNINGS"
        earningsTitle.font = .systemFont(ofSize: 11, weight: .bold)
        earningsTitle.textColor = UIColor(red: 5/255, green: 150/255, blue: 105/255, alpha: 1.0)
        earningsTitle.translatesAutoresizingMaskIntoConstraints = false
        breakdownCard.addSubview(earningsTitle)

        let basicRow = makeDetailRow(title: "Basic Pay", value: formatter.string(from: NSNumber(value: basic)) ?? "₹\(Int(basic))")
        breakdownCard.addSubview(basicRow)

        let allowRow = makeDetailRow(title: "Allowances", value: formatter.string(from: NSNumber(value: allow)) ?? "₹\(Int(allow))")
        breakdownCard.addSubview(allowRow)

        let innerDiv = UIView()
        innerDiv.backgroundColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0)
        innerDiv.translatesAutoresizingMaskIntoConstraints = false
        breakdownCard.addSubview(innerDiv)

        let grossRow = makeDetailRow(title: "Gross Earnings", value: formatter.string(from: NSNumber(value: gross)) ?? "₹\(Int(gross))", isBold: true)
        breakdownCard.addSubview(grossRow)

        let innerDiv2 = UIView()
        innerDiv2.backgroundColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0)
        innerDiv2.translatesAutoresizingMaskIntoConstraints = false
        breakdownCard.addSubview(innerDiv2)

        let dedTitle = UILabel()
        dedTitle.text = "DEDUCTIONS"
        dedTitle.font = .systemFont(ofSize: 11, weight: .bold)
        dedTitle.textColor = UIColor(red: 225/255, green: 29/255, blue: 72/255, alpha: 1.0)
        dedTitle.translatesAutoresizingMaskIntoConstraints = false
        breakdownCard.addSubview(dedTitle)

        let dedRow = makeDetailRow(title: "Total Deductions (PF / Tax)", value: formatter.string(from: NSNumber(value: ded)) ?? "₹\(Int(ded))", valueColor: UIColor(red: 225/255, green: 29/255, blue: 72/255, alpha: 1.0))
        breakdownCard.addSubview(dedRow)

        // Attendance Card
        let attCard = UIView()
        attCard.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
        attCard.layer.cornerRadius = 14
        attCard.layer.borderWidth = 1
        attCard.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        attCard.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(attCard)

        let attTitle = UILabel()
        attTitle.text = "ATTENDANCE SUMMARY"
        attTitle.font = .systemFont(ofSize: 11, weight: .bold)
        attTitle.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        attTitle.translatesAutoresizingMaskIntoConstraints = false
        attCard.addSubview(attTitle)

        let attStack = UIStackView()
        attStack.axis = .horizontal
        attStack.distribution = .fillEqually
        attStack.spacing = 8
        attStack.translatesAutoresizingMaskIntoConstraints = false
        attCard.addSubview(attStack)

        attStack.addArrangedSubview(makeStatBox(title: "Scheduled", value: "\(totalWorkingDays) Days"))
        attStack.addArrangedSubview(makeStatBox(title: "Present", value: "\(presentDays) Days"))
        let lopColor = unpaidLeaves > 0 ? UIColor(red: 225/255, green: 29/255, blue: 72/255, alpha: 1.0) : UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        attStack.addArrangedSubview(makeStatBox(title: "LOP / Unpaid", value: "\(unpaidLeaves) Days", valColor: lopColor))

        // Download PDF Button
        let downloadBtn = UIButton(type: .system)
        downloadBtn.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        downloadBtn.layer.cornerRadius = 14
        downloadBtn.setTitle("Download Official PDF", for: .normal)
        downloadBtn.setTitleColor(.white, for: .normal)
        downloadBtn.titleLabel?.font = .systemFont(ofSize: 15, weight: .bold)
        downloadBtn.setImage(UIImage(systemName: "arrow.down.doc.fill"), for: .normal)
        downloadBtn.tintColor = .white
        downloadBtn.imageEdgeInsets = UIEdgeInsets(top: 0, left: -8, bottom: 0, right: 8)
        downloadBtn.addTarget(self, action: #selector(handleDownloadPdf), for: .touchUpInside)
        downloadBtn.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(downloadBtn)

        // Close Button
        let doneBtn = UIButton(type: .system)
        doneBtn.setTitle("Close", for: .normal)
        doneBtn.setTitleColor(UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0), for: .normal)
        doneBtn.titleLabel?.font = .systemFont(ofSize: 14, weight: .semibold)
        doneBtn.addTarget(self, action: #selector(handleClose), for: .touchUpInside)
        doneBtn.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(doneBtn)

        NSLayoutConstraint.activate([
            scrollView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            scrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scrollView.bottomAnchor.constraint(equalTo: view.bottomAnchor),

            contentView.topAnchor.constraint(equalTo: scrollView.topAnchor),
            contentView.leadingAnchor.constraint(equalTo: scrollView.leadingAnchor),
            contentView.trailingAnchor.constraint(equalTo: scrollView.trailingAnchor),
            contentView.bottomAnchor.constraint(equalTo: scrollView.bottomAnchor, constant: -24),
            contentView.widthAnchor.constraint(equalTo: scrollView.widthAnchor),

            closeBtn.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 18),
            closeBtn.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -18),
            closeBtn.widthAnchor.constraint(equalToConstant: 32),
            closeBtn.heightAnchor.constraint(equalToConstant: 32),

            companyLabel.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 22),
            companyLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            companyLabel.trailingAnchor.constraint(equalTo: closeBtn.leadingAnchor, constant: -8),

            periodLabel.topAnchor.constraint(equalTo: companyLabel.bottomAnchor, constant: 4),
            periodLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            periodLabel.trailingAnchor.constraint(equalTo: closeBtn.leadingAnchor, constant: -8),

            statusBadge.topAnchor.constraint(equalTo: periodLabel.bottomAnchor, constant: 8),
            statusBadge.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            statusBadge.heightAnchor.constraint(equalToConstant: 22),

            netCard.topAnchor.constraint(equalTo: statusBadge.bottomAnchor, constant: 18),
            netCard.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            netCard.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20),
            netCard.heightAnchor.constraint(equalToConstant: 80),

            netSub.topAnchor.constraint(equalTo: netCard.topAnchor, constant: 14),
            netSub.leadingAnchor.constraint(equalTo: netCard.leadingAnchor, constant: 16),

            netVal.topAnchor.constraint(equalTo: netSub.bottomAnchor, constant: 2),
            netVal.leadingAnchor.constraint(equalTo: netCard.leadingAnchor, constant: 16),

            netIcon.trailingAnchor.constraint(equalTo: netCard.trailingAnchor, constant: -16),
            netIcon.centerYAnchor.constraint(equalTo: netCard.centerYAnchor),
            netIcon.widthAnchor.constraint(equalToConstant: 32),
            netIcon.heightAnchor.constraint(equalToConstant: 32),

            breakdownCard.topAnchor.constraint(equalTo: netCard.bottomAnchor, constant: 16),
            breakdownCard.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            breakdownCard.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20),

            earningsTitle.topAnchor.constraint(equalTo: breakdownCard.topAnchor, constant: 14),
            earningsTitle.leadingAnchor.constraint(equalTo: breakdownCard.leadingAnchor, constant: 14),

            basicRow.topAnchor.constraint(equalTo: earningsTitle.bottomAnchor, constant: 8),
            basicRow.leadingAnchor.constraint(equalTo: breakdownCard.leadingAnchor, constant: 14),
            basicRow.trailingAnchor.constraint(equalTo: breakdownCard.trailingAnchor, constant: -14),

            allowRow.topAnchor.constraint(equalTo: basicRow.bottomAnchor, constant: 6),
            allowRow.leadingAnchor.constraint(equalTo: breakdownCard.leadingAnchor, constant: 14),
            allowRow.trailingAnchor.constraint(equalTo: breakdownCard.trailingAnchor, constant: -14),

            innerDiv.topAnchor.constraint(equalTo: allowRow.bottomAnchor, constant: 10),
            innerDiv.leadingAnchor.constraint(equalTo: breakdownCard.leadingAnchor, constant: 14),
            innerDiv.trailingAnchor.constraint(equalTo: breakdownCard.trailingAnchor, constant: -14),
            innerDiv.heightAnchor.constraint(equalToConstant: 1),

            grossRow.topAnchor.constraint(equalTo: innerDiv.bottomAnchor, constant: 8),
            grossRow.leadingAnchor.constraint(equalTo: breakdownCard.leadingAnchor, constant: 14),
            grossRow.trailingAnchor.constraint(equalTo: breakdownCard.trailingAnchor, constant: -14),

            innerDiv2.topAnchor.constraint(equalTo: grossRow.bottomAnchor, constant: 10),
            innerDiv2.leadingAnchor.constraint(equalTo: breakdownCard.leadingAnchor, constant: 14),
            innerDiv2.trailingAnchor.constraint(equalTo: breakdownCard.trailingAnchor, constant: -14),
            innerDiv2.heightAnchor.constraint(equalToConstant: 1),

            dedTitle.topAnchor.constraint(equalTo: innerDiv2.bottomAnchor, constant: 10),
            dedTitle.leadingAnchor.constraint(equalTo: breakdownCard.leadingAnchor, constant: 14),

            dedRow.topAnchor.constraint(equalTo: dedTitle.bottomAnchor, constant: 8),
            dedRow.leadingAnchor.constraint(equalTo: breakdownCard.leadingAnchor, constant: 14),
            dedRow.trailingAnchor.constraint(equalTo: breakdownCard.trailingAnchor, constant: -14),
            dedRow.bottomAnchor.constraint(equalTo: breakdownCard.bottomAnchor, constant: -14),

            attCard.topAnchor.constraint(equalTo: breakdownCard.bottomAnchor, constant: 14),
            attCard.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            attCard.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20),

            attTitle.topAnchor.constraint(equalTo: attCard.topAnchor, constant: 12),
            attTitle.leadingAnchor.constraint(equalTo: attCard.leadingAnchor, constant: 14),

            attStack.topAnchor.constraint(equalTo: attTitle.bottomAnchor, constant: 8),
            attStack.leadingAnchor.constraint(equalTo: attCard.leadingAnchor, constant: 14),
            attStack.trailingAnchor.constraint(equalTo: attCard.trailingAnchor, constant: -14),
            attStack.bottomAnchor.constraint(equalTo: attCard.bottomAnchor, constant: -14),

            downloadBtn.topAnchor.constraint(equalTo: attCard.bottomAnchor, constant: 20),
            downloadBtn.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            downloadBtn.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20),
            downloadBtn.heightAnchor.constraint(equalToConstant: 48),

            doneBtn.topAnchor.constraint(equalTo: downloadBtn.bottomAnchor, constant: 10),
            doneBtn.centerXAnchor.constraint(equalTo: contentView.centerXAnchor),
            doneBtn.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -10)
        ])
    }

    private func makeDetailRow(title: String, value: String, isBold: Bool = false, valueColor: UIColor? = nil) -> UIView {
        let row = UIView()
        row.translatesAutoresizingMaskIntoConstraints = false

        let tLabel = UILabel()
        tLabel.text = title
        tLabel.font = .systemFont(ofSize: 13, weight: isBold ? .bold : .regular)
        tLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        tLabel.translatesAutoresizingMaskIntoConstraints = false
        row.addSubview(tLabel)

        let vLabel = UILabel()
        vLabel.text = value
        vLabel.font = .systemFont(ofSize: 13, weight: isBold ? .bold : .semibold)
        vLabel.textColor = valueColor ?? UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        vLabel.translatesAutoresizingMaskIntoConstraints = false
        row.addSubview(vLabel)

        NSLayoutConstraint.activate([
            tLabel.leadingAnchor.constraint(equalTo: row.leadingAnchor),
            tLabel.topAnchor.constraint(equalTo: row.topAnchor),
            tLabel.bottomAnchor.constraint(equalTo: row.bottomAnchor),

            vLabel.trailingAnchor.constraint(equalTo: row.trailingAnchor),
            vLabel.topAnchor.constraint(equalTo: row.topAnchor),
            vLabel.bottomAnchor.constraint(equalTo: row.bottomAnchor)
        ])

        return row
    }

    private func makeStatBox(title: String, value: String, valColor: UIColor? = nil) -> UIView {
        let box = UIView()
        box.translatesAutoresizingMaskIntoConstraints = false

        let tLabel = UILabel()
        tLabel.text = title
        tLabel.font = .systemFont(ofSize: 11, weight: .regular)
        tLabel.textColor = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 1.0)
        tLabel.translatesAutoresizingMaskIntoConstraints = false
        box.addSubview(tLabel)

        let vLabel = UILabel()
        vLabel.text = value
        vLabel.font = .systemFont(ofSize: 13, weight: .bold)
        vLabel.textColor = valColor ?? UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        vLabel.translatesAutoresizingMaskIntoConstraints = false
        box.addSubview(vLabel)

        NSLayoutConstraint.activate([
            tLabel.topAnchor.constraint(equalTo: box.topAnchor),
            tLabel.leadingAnchor.constraint(equalTo: box.leadingAnchor),

            vLabel.topAnchor.constraint(equalTo: tLabel.bottomAnchor, constant: 2),
            vLabel.leadingAnchor.constraint(equalTo: box.leadingAnchor),
            vLabel.bottomAnchor.constraint(equalTo: box.bottomAnchor)
        ])

        return box
    }

    @objc private func handleClose() {
        dismiss(animated: true)
    }

    @objc private func handleDownloadPdf() {
        let alert = UIAlertController(title: "Download Started", message: "Official payslip PDF is downloaded to your device.", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default, handler: { [weak self] _ in
            self?.dismiss(animated: true)
        }))
        present(alert, animated: true)
    }
}

// MARK: - PayslipsViewController
class PayslipsViewController: UIViewController, UITableViewDataSource, UITableViewDelegate {

    private let topBar = UIView()
    private let topBarContainer = UIView()
    private let backButton = UIButton(type: .system)
    private let brandSubtitleLabel = UILabel()
    private let titleLabel = UILabel()
    private let avatarContainer = UIView()
    private let avatarInitialsLabel = UILabel()

    private let tableView = UITableView(frame: .zero, style: .plain)
    private let refreshControl = UIRefreshControl()
    private let emptyView = UIView()
    private let activityIndicator = UIActivityIndicatorView(style: .medium)

    private var payslips: [[String: Any]] = []

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

        loadPayslips(showSpinner: true)
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

        titleLabel.text = "My Payslips"
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

    private let headerCard = UIView()

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
        icon.image = UIImage(systemName: "banknote", withConfiguration: config)
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
        hTitle.text = "Payroll & Tax Portal"
        hTitle.font = .systemFont(ofSize: 16, weight: .bold)
        hTitle.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        textStack.addArrangedSubview(hTitle)

        let hSub = UILabel()
        hSub.text = "Access your monthly payslips, salary breakdowns, and compensation history."
        hSub.font = .systemFont(ofSize: 12, weight: .regular)
        hSub.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        hSub.numberOfLines = 2
        textStack.addArrangedSubview(hSub)

        NSLayoutConstraint.activate([
            headerCard.topAnchor.constraint(equalTo: topBar.bottomAnchor, constant: 14),
            headerCard.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
            headerCard.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16),

            iconContainer.leadingAnchor.constraint(equalTo: headerCard.leadingAnchor, constant: 16),
            iconContainer.centerYAnchor.constraint(equalTo: headerCard.centerYAnchor),
            iconContainer.widthAnchor.constraint(equalToConstant: 40),
            iconContainer.heightAnchor.constraint(equalToConstant: 40),

            icon.centerXAnchor.constraint(equalTo: iconContainer.centerXAnchor),
            icon.centerYAnchor.constraint(equalTo: iconContainer.centerYAnchor),

            textStack.leadingAnchor.constraint(equalTo: iconContainer.trailingAnchor, constant: 12),
            textStack.trailingAnchor.constraint(equalTo: headerCard.trailingAnchor, constant: -16),
            textStack.topAnchor.constraint(equalTo: headerCard.topAnchor, constant: 14),
            textStack.bottomAnchor.constraint(equalTo: headerCard.bottomAnchor, constant: -14)
        ])
    }

    private func setupTableView() {
        tableView.backgroundColor = .clear
        tableView.separatorStyle = .none
        tableView.dataSource = self
        tableView.delegate = self
        tableView.register(PayslipCell.self, forCellReuseIdentifier: PayslipCell.identifier)
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
        icon.image = UIImage(systemName: "doc.text", withConfiguration: config)
        icon.tintColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        icon.contentMode = .scaleAspectFit
        icon.translatesAutoresizingMaskIntoConstraints = false
        iconContainer.addSubview(icon)

        let emptyTitle = UILabel()
        emptyTitle.text = "No Payslips Available"
        emptyTitle.font = .systemFont(ofSize: 17, weight: .bold)
        emptyTitle.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        emptyTitle.textAlignment = .center
        emptyTitle.translatesAutoresizingMaskIntoConstraints = false
        emptyView.addSubview(emptyTitle)

        let subLabel = UILabel()
        subLabel.text = "Your payslips will appear here once processed and approved by HR."
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

            emptyTitle.topAnchor.constraint(equalTo: iconContainer.bottomAnchor, constant: 16),
            emptyTitle.leadingAnchor.constraint(equalTo: emptyView.leadingAnchor),
            emptyTitle.trailingAnchor.constraint(equalTo: emptyView.trailingAnchor),

            subLabel.topAnchor.constraint(equalTo: emptyTitle.bottomAnchor, constant: 6),
            subLabel.leadingAnchor.constraint(equalTo: emptyView.leadingAnchor),
            subLabel.trailingAnchor.constraint(equalTo: emptyView.trailingAnchor),
            subLabel.bottomAnchor.constraint(equalTo: emptyView.bottomAnchor)
        ])
    }

    @objc private func handleRefresh() {
        loadPayslips(showSpinner: false)
    }

    @objc private func handleBack() {
        dismiss(animated: true)
    }

    private func loadPayslips(showSpinner: Bool) {
        if ProcessInfo.processInfo.arguments.contains("-testSamplePayslips") {
            let sampleList: [[String: Any]] = [
                [
                    "id": "sample-1",
                    "month": 10,
                    "year": 2026,
                    "netSalary": 85000.0,
                    "basicPay": 50000.0,
                    "allowances": 45000.0,
                    "deductions": 10000.0,
                    "totalWorkingDays": 31,
                    "presentDays": 29,
                    "unpaidLeaves": 2,
                    "status": "PAID"
                ],
                [
                    "id": "sample-2",
                    "month": 9,
                    "year": 2026,
                    "netSalary": 82500.0,
                    "basicPay": 50000.0,
                    "allowances": 42500.0,
                    "deductions": 10000.0,
                    "totalWorkingDays": 30,
                    "presentDays": 30,
                    "unpaidLeaves": 0,
                    "status": "PAID"
                ]
            ]
            self.payslips = sampleList
            self.emptyView.isHidden = true
            self.tableView.isHidden = false
            self.tableView.reloadData()
            return
        }

        if showSpinner { activityIndicator.startAnimating() }

        AuthService.shared.getMyPayslips { [weak self] result in
            guard let self = self else { return }
            self.activityIndicator.stopAnimating()
            self.refreshControl.endRefreshing()

            switch result {
            case .success(let items):
                self.payslips = items
                self.emptyView.isHidden = !items.isEmpty
                self.tableView.isHidden = items.isEmpty
                self.tableView.reloadData()
            case .failure:
                self.emptyView.isHidden = !self.payslips.isEmpty
                self.tableView.isHidden = self.payslips.isEmpty
            }
        }
    }

    // MARK: - UITableViewDataSource & Delegate
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return payslips.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        guard let cell = tableView.dequeueReusableCell(withIdentifier: PayslipCell.identifier, for: indexPath) as? PayslipCell else {
            return UITableViewCell()
        }
        cell.configure(with: payslips[indexPath.row])
        return cell
    }

    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        let item = payslips[indexPath.row]
        let detailVC = PayslipDetailViewController(payslip: item)
        if #available(iOS 15.0, *) {
            if let sheet = detailVC.sheetPresentationController {
                sheet.detents = [.medium(), .large()]
                sheet.prefersGrabberVisible = true
            }
        }
        present(detailVC, animated: true)
    }
}
