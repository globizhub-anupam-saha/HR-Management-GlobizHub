import UIKit

class AccountSettingsViewController: UIViewController, UIImagePickerControllerDelegate, UINavigationControllerDelegate, UITextFieldDelegate {

    private let topBar = UIView()
    private let topBarContainer = UIView()
    private let backButton = UIButton(type: .system)
    private let brandSubtitleLabel = UILabel()
    private let titleLabel = UILabel()

    private let scrollView = UIScrollView()
    private let contentView = UIStackView()

    // Avatar section
    private let avatarContainer = UIView()
    private let avatarImageView = UIImageView()
    private let avatarInitialsLabel = UILabel()
    private let changePhotoButton = UIButton(type: .system)

    // Form inputs
    private let firstNameField = UITextField()
    private let lastNameField = UITextField()
    private let phoneField = UITextField()
    private let bloodGroupButton = UIButton(type: .system)
    private let genderSegmented = UISegmentedControl(items: ["Male", "Female", "Other"])
    private let uanField = UITextField()
    private let esicField = UITextField()

    // Read only fields
    private let empCodeLabel = UILabel()
    private let emailLabel = UILabel()
    private let deptLabel = UILabel()
    private let roleLabel = UILabel()
    private let orgLabel = UILabel()

    // Password inputs
    private let currentPasswordField = UITextField()
    private let newPasswordField = UITextField()
    private let confirmPasswordField = UITextField()
    private let updatePasswordButton = UIButton(type: .system)

    // Save Button
    private let saveButton = UIButton(type: .system)
    private let activityIndicator = UIActivityIndicatorView(style: .medium)

    private var selectedBloodGroup: String = ""
    private var selectedGender: String = "MALE"
    private var selectedImage: UIImage?

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
        navigationController?.setNavigationBarHidden(true, animated: false)

        setupTopBar()
        setupScrollView()
        setupAvatarSection()
        setupPersonalInfoSection()
        setupCompanyDetailsSection()
        setupSecuritySection()
        setupSaveButton()

        loadUserData()
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

        titleLabel.text = "View Profile"
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

    // MARK: - Avatar Section
    private func setupAvatarSection() {
        let card = makeCardView()

        let row = UIStackView()
        row.axis = .horizontal
        row.alignment = .center
        row.spacing = 16
        row.translatesAutoresizingMaskIntoConstraints = false

        avatarContainer.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        avatarContainer.layer.cornerRadius = 36
        avatarContainer.layer.masksToBounds = true
        avatarContainer.translatesAutoresizingMaskIntoConstraints = false
        avatarContainer.widthAnchor.constraint(equalToConstant: 72).isActive = true
        avatarContainer.heightAnchor.constraint(equalToConstant: 72).isActive = true

        avatarImageView.contentMode = .scaleAspectFill
        avatarImageView.isHidden = true
        avatarImageView.translatesAutoresizingMaskIntoConstraints = false
        avatarContainer.addSubview(avatarImageView)

        avatarInitialsLabel.textColor = .white
        avatarInitialsLabel.font = .systemFont(ofSize: 26, weight: .bold)
        avatarInitialsLabel.textAlignment = .center
        avatarInitialsLabel.translatesAutoresizingMaskIntoConstraints = false
        avatarContainer.addSubview(avatarInitialsLabel)

        NSLayoutConstraint.activate([
            avatarImageView.topAnchor.constraint(equalTo: avatarContainer.topAnchor),
            avatarImageView.bottomAnchor.constraint(equalTo: avatarContainer.bottomAnchor),
            avatarImageView.leadingAnchor.constraint(equalTo: avatarContainer.leadingAnchor),
            avatarImageView.trailingAnchor.constraint(equalTo: avatarContainer.trailingAnchor),

            avatarInitialsLabel.centerXAnchor.constraint(equalTo: avatarContainer.centerXAnchor),
            avatarInitialsLabel.centerYAnchor.constraint(equalTo: avatarContainer.centerYAnchor)
        ])

        let labelStack = UIStackView()
        labelStack.axis = .vertical
        labelStack.spacing = 4
        labelStack.alignment = .leading

        let namePromptLabel = UILabel()
        namePromptLabel.text = "Profile Picture"
        namePromptLabel.font = .systemFont(ofSize: 16, weight: .bold)
        namePromptLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        labelStack.addArrangedSubview(namePromptLabel)

        let hintLabel = UILabel()
        hintLabel.text = "JPG or PNG. Max size 2MB."
        hintLabel.font = .systemFont(ofSize: 12, weight: .regular)
        hintLabel.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        labelStack.addArrangedSubview(hintLabel)

        changePhotoButton.setTitle("Change Photo", for: .normal)
        changePhotoButton.titleLabel?.font = .systemFont(ofSize: 13, weight: .semibold)
        changePhotoButton.setTitleColor(UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0), for: .normal)
        changePhotoButton.backgroundColor = UIColor(red: 239/255, green: 246/255, blue: 255/255, alpha: 1.0)
        changePhotoButton.layer.cornerRadius = 8
        changePhotoButton.contentEdgeInsets = UIEdgeInsets(top: 6, left: 12, bottom: 6, right: 12)
        changePhotoButton.addTarget(self, action: #selector(handleChangePhoto), for: .touchUpInside)
        labelStack.addArrangedSubview(changePhotoButton)

        row.addArrangedSubview(avatarContainer)
        row.addArrangedSubview(labelStack)
        card.addArrangedSubview(row)
        contentView.addArrangedSubview(card)
    }

    // MARK: - Personal Information
    private func setupPersonalInfoSection() {
        let card = makeCardView()
        card.addArrangedSubview(makeSectionHeader(title: "Personal Information", icon: "person.crop.circle"))
        card.addArrangedSubview(makeDivider())

        // First Name
        card.addArrangedSubview(makeFieldContainer(label: "First Name", field: firstNameField, placeholder: "First name"))
        // Last Name
        card.addArrangedSubview(makeFieldContainer(label: "Last Name", field: lastNameField, placeholder: "Last name"))
        // Phone Number
        card.addArrangedSubview(makeFieldContainer(label: "Phone Number", field: phoneField, placeholder: "Phone number", keyboardType: .phonePad))

        // Blood Group
        let bgStack = UIStackView()
        bgStack.axis = .vertical
        bgStack.spacing = 6
        let bgLabel = UILabel()
        bgLabel.text = "Blood Group"
        bgLabel.font = .systemFont(ofSize: 13, weight: .semibold)
        bgLabel.textColor = UIColor(red: 51/255, green: 65/255, blue: 85/255, alpha: 1.0)
        bgStack.addArrangedSubview(bgLabel)

        bloodGroupButton.setTitle("Select Blood Group", for: .normal)
        bloodGroupButton.setTitleColor(UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0), for: .normal)
        bloodGroupButton.titleLabel?.font = .systemFont(ofSize: 14)
        bloodGroupButton.contentHorizontalAlignment = .left
        bloodGroupButton.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
        bloodGroupButton.layer.cornerRadius = 10
        bloodGroupButton.layer.borderWidth = 1
        bloodGroupButton.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        bloodGroupButton.contentEdgeInsets = UIEdgeInsets(top: 10, left: 12, bottom: 10, right: 12)
        bloodGroupButton.addTarget(self, action: #selector(handleSelectBloodGroup), for: .touchUpInside)
        bgStack.addArrangedSubview(bloodGroupButton)
        card.addArrangedSubview(bgStack)

        // Gender
        let gStack = UIStackView()
        gStack.axis = .vertical
        gStack.spacing = 6
        let gLabel = UILabel()
        gLabel.text = "Gender"
        gLabel.font = .systemFont(ofSize: 13, weight: .semibold)
        gLabel.textColor = UIColor(red: 51/255, green: 65/255, blue: 85/255, alpha: 1.0)
        gStack.addArrangedSubview(gLabel)

        genderSegmented.selectedSegmentIndex = 0
        genderSegmented.selectedSegmentTintColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        genderSegmented.setTitleTextAttributes([.foregroundColor: UIColor.white, .font: UIFont.systemFont(ofSize: 13, weight: .bold)], for: .selected)
        genderSegmented.setTitleTextAttributes([.foregroundColor: UIColor(red: 71/255, green: 85/255, blue: 105/255, alpha: 1.0), .font: UIFont.systemFont(ofSize: 13)], for: .normal)
        genderSegmented.addTarget(self, action: #selector(handleGenderChanged), for: .valueChanged)
        gStack.addArrangedSubview(genderSegmented)
        card.addArrangedSubview(gStack)

        // Statutory Identifiers
        card.addArrangedSubview(makeFieldContainer(label: "EPFO UAN (Universal Account Number)", field: uanField, placeholder: "12-digit UAN (Optional)", keyboardType: .numberPad))
        card.addArrangedSubview(makeFieldContainer(label: "ESIC IP (Insurance Number)", field: esicField, placeholder: "10 or 17-digit IP Number (Optional)", keyboardType: .numberPad))

        contentView.addArrangedSubview(card)
    }

    // MARK: - Company Details Section (Read-Only)
    private func setupCompanyDetailsSection() {
        let card = makeCardView()
        card.addArrangedSubview(makeSectionHeader(title: "Company Details (Read-Only)", icon: "building.2"))
        card.addArrangedSubview(makeDivider())

        card.addArrangedSubview(makeReadOnlyRow(title: "Employee Code", valueLabel: empCodeLabel))
        card.addArrangedSubview(makeDivider())
        card.addArrangedSubview(makeReadOnlyRow(title: "Official Email", valueLabel: emailLabel))
        card.addArrangedSubview(makeDivider())
        card.addArrangedSubview(makeReadOnlyRow(title: "Department", valueLabel: deptLabel))
        card.addArrangedSubview(makeDivider())
        card.addArrangedSubview(makeReadOnlyRow(title: "Designation", valueLabel: roleLabel))
        card.addArrangedSubview(makeDivider())
        card.addArrangedSubview(makeReadOnlyRow(title: "Organization", valueLabel: orgLabel))

        contentView.addArrangedSubview(card)
    }

    // MARK: - Security Section
    private func setupSecuritySection() {
        let card = makeCardView()
        card.addArrangedSubview(makeSectionHeader(title: "Change Password", icon: "lock.shield"))
        card.addArrangedSubview(makeDivider())

        card.addArrangedSubview(makeFieldContainer(label: "Current Password", field: currentPasswordField, placeholder: "Enter current password", isSecure: true))
        card.addArrangedSubview(makeFieldContainer(label: "New Password", field: newPasswordField, placeholder: "Minimum 8 characters", isSecure: true))
        card.addArrangedSubview(makeFieldContainer(label: "Confirm New Password", field: confirmPasswordField, placeholder: "Re-enter new password", isSecure: true))

        updatePasswordButton.setTitle("Update Password", for: .normal)
        updatePasswordButton.titleLabel?.font = .systemFont(ofSize: 14, weight: .bold)
        updatePasswordButton.setTitleColor(.white, for: .normal)
        updatePasswordButton.backgroundColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        updatePasswordButton.layer.cornerRadius = 10
        updatePasswordButton.contentEdgeInsets = UIEdgeInsets(top: 10, left: 16, bottom: 10, right: 16)
        updatePasswordButton.addTarget(self, action: #selector(handleUpdatePassword), for: .touchUpInside)

        let pwBtnContainer = UIStackView(arrangedSubviews: [UIView(), updatePasswordButton])
        pwBtnContainer.axis = .horizontal
        card.addArrangedSubview(pwBtnContainer)

        contentView.addArrangedSubview(card)
    }

    // MARK: - Save Button
    private func setupSaveButton() {
        saveButton.setTitle("Save Changes", for: .normal)
        saveButton.titleLabel?.font = .systemFont(ofSize: 16, weight: .bold)
        saveButton.setTitleColor(.white, for: .normal)
        saveButton.backgroundColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        saveButton.layer.cornerRadius = 14
        saveButton.layer.shadowColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 0.3).cgColor
        saveButton.layer.shadowOffset = CGSize(width: 0, height: 4)
        saveButton.layer.shadowRadius = 8
        saveButton.layer.shadowOpacity = 1.0
        saveButton.translatesAutoresizingMaskIntoConstraints = false
        saveButton.heightAnchor.constraint(equalToConstant: 50).isActive = true
        saveButton.addTarget(self, action: #selector(handleSaveProfile), for: .touchUpInside)

        activityIndicator.color = .white
        activityIndicator.hidesWhenStopped = true
        activityIndicator.translatesAutoresizingMaskIntoConstraints = false
        saveButton.addSubview(activityIndicator)

        NSLayoutConstraint.activate([
            activityIndicator.centerYAnchor.constraint(equalTo: saveButton.centerYAnchor),
            activityIndicator.trailingAnchor.constraint(equalTo: saveButton.trailingAnchor, constant: -20)
        ])

        contentView.addArrangedSubview(saveButton)
    }

    // MARK: - Helpers
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

    private func makeSectionHeader(title: String, icon: String) -> UIView {
        let row = UIStackView()
        row.axis = .horizontal
        row.spacing = 8
        row.alignment = .center

        let config = UIImage.SymbolConfiguration(pointSize: 16, weight: .medium)
        let iv = UIImageView(image: UIImage(systemName: icon, withConfiguration: config))
        iv.tintColor = UIColor(red: 0/255, green: 86/255, blue: 253/255, alpha: 1.0)
        iv.contentMode = .scaleAspectFit
        iv.translatesAutoresizingMaskIntoConstraints = false
        iv.widthAnchor.constraint(equalToConstant: 20).isActive = true
        iv.heightAnchor.constraint(equalToConstant: 20).isActive = true

        let label = UILabel()
        label.text = title
        label.font = .systemFont(ofSize: 15, weight: .bold)
        label.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)

        row.addArrangedSubview(iv)
        row.addArrangedSubview(label)
        return row
    }

    private func makeFieldContainer(label: String, field: UITextField, placeholder: String, keyboardType: UIKeyboardType = .default, isSecure: Bool = false) -> UIView {
        let stack = UIStackView()
        stack.axis = .vertical
        stack.spacing = 6

        let lbl = UILabel()
        lbl.text = label
        lbl.font = .systemFont(ofSize: 13, weight: .semibold)
        lbl.textColor = UIColor(red: 51/255, green: 65/255, blue: 85/255, alpha: 1.0)
        stack.addArrangedSubview(lbl)

        field.placeholder = placeholder
        field.font = .systemFont(ofSize: 14)
        field.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        field.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0)
        field.layer.cornerRadius = 10
        field.layer.borderWidth = 1
        field.layer.borderColor = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1.0).cgColor
        field.keyboardType = keyboardType
        field.isSecureTextEntry = isSecure
        field.autocapitalizationType = .none
        field.autocorrectionType = .no
        field.leftView = UIView(frame: CGRect(x: 0, y: 0, width: 12, height: 40))
        field.leftViewMode = .always
        field.rightView = UIView(frame: CGRect(x: 0, y: 0, width: 12, height: 40))
        field.rightViewMode = .always
        field.heightAnchor.constraint(equalToConstant: 44).isActive = true
        stack.addArrangedSubview(field)

        return stack
    }

    private func makeReadOnlyRow(title: String, valueLabel: UILabel) -> UIView {
        let row = UIStackView()
        row.axis = .horizontal
        row.distribution = .equalSpacing
        row.alignment = .center

        let lbl = UILabel()
        lbl.text = title
        lbl.font = .systemFont(ofSize: 13, weight: .regular)
        lbl.textColor = UIColor(red: 100/255, green: 116/255, blue: 139/255, alpha: 1.0)
        row.addArrangedSubview(lbl)

        valueLabel.font = .systemFont(ofSize: 13, weight: .semibold)
        valueLabel.textColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1.0)
        valueLabel.textAlignment = .right
        row.addArrangedSubview(valueLabel)

        return row
    }

    private func makeDivider() -> UIView {
        let divider = UIView()
        divider.backgroundColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1.0)
        divider.translatesAutoresizingMaskIntoConstraints = false
        divider.heightAnchor.constraint(equalToConstant: 1).isActive = true
        return divider
    }

    // MARK: - Actions
    @objc private func handleBack() {
        if let nav = navigationController {
            nav.popViewController(animated: true)
        } else {
            dismiss(animated: true)
        }
    }

    @objc private func handleChangePhoto() {
        let sheet = UIAlertController(title: "Update Photo", message: "Choose a source", preferredStyle: .actionSheet)
        if UIImagePickerController.isSourceTypeAvailable(.camera) {
            sheet.addAction(UIAlertAction(title: "Take Photo", style: .default, handler: { [weak self] _ in
                self?.presentImagePicker(sourceType: .camera)
            }))
        }
        if UIImagePickerController.isSourceTypeAvailable(.photoLibrary) {
            sheet.addAction(UIAlertAction(title: "Choose from Library", style: .default, handler: { [weak self] _ in
                self?.presentImagePicker(sourceType: .photoLibrary)
            }))
        }
        sheet.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        present(sheet, animated: true)
    }

    private func presentImagePicker(sourceType: UIImagePickerController.SourceType) {
        let picker = UIImagePickerController()
        picker.delegate = self
        picker.sourceType = sourceType
        picker.allowsEditing = true
        present(picker, animated: true)
    }

    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
        picker.dismiss(animated: true)
        if let img = info[.editedImage] as? UIImage ?? info[.originalImage] as? UIImage {
            selectedImage = img
            avatarImageView.image = img
            avatarImageView.isHidden = false
            avatarInitialsLabel.isHidden = true
        }
    }

    func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
        picker.dismiss(animated: true)
    }

    @objc private func handleSelectBloodGroup() {
        let options = ["O_POS": "O+", "O_NEG": "O-", "A_POS": "A+", "A_NEG": "A-", "B_POS": "B+", "B_NEG": "B-", "AB_POS": "AB+", "AB_NEG": "AB-"]
        let sheet = UIAlertController(title: "Select Blood Group", message: nil, preferredStyle: .actionSheet)
        for (key, display) in options.sorted(by: { $0.value < $1.value }) {
            sheet.addAction(UIAlertAction(title: display, style: .default, handler: { [weak self] _ in
                self?.selectedBloodGroup = key
                self?.bloodGroupButton.setTitle(display, for: .normal)
            }))
        }
        sheet.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        present(sheet, animated: true)
    }

    @objc private func handleGenderChanged() {
        switch genderSegmented.selectedSegmentIndex {
        case 0: selectedGender = "MALE"
        case 1: selectedGender = "FEMALE"
        default: selectedGender = "OTHER"
        }
    }

    @objc private func handleSaveProfile() {
        let first = firstNameField.text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        let last = lastNameField.text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        let phone = phoneField.text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        let uan = uanField.text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        let esic = esicField.text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""

        var payload: [String: Any] = [
            "firstName": first,
            "lastName": last,
            "phone": phone,
            "gender": selectedGender
        ]
        if !selectedBloodGroup.isEmpty {
            payload["bloodGroup"] = selectedBloodGroup
        }
        if !uan.isEmpty {
            payload["uanNumber"] = uan
        }
        if !esic.isEmpty {
            payload["esicIpNumber"] = esic
        }

        saveButton.isEnabled = false
        activityIndicator.startAnimating()

        AuthService.shared.updateProfile(data: payload) { [weak self] result in
            guard let self = self else { return }
            self.saveButton.isEnabled = true
            self.activityIndicator.stopAnimating()

            let alert = UIAlertController(title: "Success", message: "Profile updated successfully.", preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "OK", style: .default, handler: { [weak self] _ in
                self?.navigationController?.popViewController(animated: true)
            }))
            self.present(alert, animated: true)
        }
    }

    @objc private func handleUpdatePassword() {
        let cur = currentPasswordField.text ?? ""
        let newP = newPasswordField.text ?? ""
        let conf = confirmPasswordField.text ?? ""

        if cur.isEmpty || newP.isEmpty || conf.isEmpty {
            showAlert(title: "Error", message: "Please enter your current and new passwords.")
            return
        }
        if newP.count < 8 {
            showAlert(title: "Error", message: "New password must be at least 8 characters.")
            return
        }
        if newP != conf {
            showAlert(title: "Error", message: "New passwords do not match.")
            return
        }

        updatePasswordButton.isEnabled = false
        AuthService.shared.changePassword(current: cur, newPass: newP) { [weak self] result in
            guard let self = self else { return }
            self.updatePasswordButton.isEnabled = true
            switch result {
            case .success:
                self.currentPasswordField.text = ""
                self.newPasswordField.text = ""
                self.confirmPasswordField.text = ""
                self.showAlert(title: "Success", message: "Password updated successfully.")
            case .failure(let err):
                self.showAlert(title: "Error", message: err.localizedDescription)
            }
        }
    }

    private func showAlert(title: String, message: String) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }

    // MARK: - Data Loading
    private func loadUserData() {
        let savedEmail = AuthService.shared.getEmail()
        emailLabel.text = savedEmail
        avatarInitialsLabel.text = AuthService.shared.getUserInitials()
        firstNameField.text = AuthService.shared.getFirstName()
        lastNameField.text = AuthService.shared.getLastName()
        phoneField.text = AuthService.shared.getPhone()
        uanField.text = AuthService.shared.getUanNumber()
        esicField.text = AuthService.shared.getEsicIpNumber()
        orgLabel.text = AuthService.shared.getOrganization()
        roleLabel.text = AuthService.shared.getDesignation()

        AuthService.shared.getProfile { [weak self] result in
            guard let self = self else { return }
            switch result {
            case .success(let user):
                let first = user["firstName"] as? String ?? ""
                let last = user["lastName"] as? String ?? ""
                let phone = user["phone"] as? String ?? ""
                let blood = user["bloodGroup"] as? String ?? ""
                let gender = user["gender"] as? String ?? "MALE"
                let uan = user["uanNumber"] as? String ?? ""
                let esic = user["esicIpNumber"] as? String ?? ""
                let photoUrl = user["profilePhoto"] as? String ?? user["profileImage"] as? String ?? ""

                if !first.isEmpty { self.firstNameField.text = first }
                if !last.isEmpty { self.lastNameField.text = last }
                if !phone.isEmpty { self.phoneField.text = phone }
                if !uan.isEmpty { self.uanField.text = uan }
                if !esic.isEmpty { self.esicField.text = esic }
                self.avatarInitialsLabel.text = AuthService.shared.getUserInitials()

                if !blood.isEmpty {
                    self.selectedBloodGroup = blood
                    let display = blood.replacingOccurrences(of: "_POS", with: "+").replacingOccurrences(of: "_NEG", with: "-")
                    self.bloodGroupButton.setTitle(display, for: .normal)
                }

                self.selectedGender = gender
                if gender.uppercased() == "FEMALE" {
                    self.genderSegmented.selectedSegmentIndex = 1
                } else if gender.uppercased() == "OTHER" {
                    self.genderSegmented.selectedSegmentIndex = 2
                } else {
                    self.genderSegmented.selectedSegmentIndex = 0
                }

                // Read-only
                self.empCodeLabel.text = user["employeeCode"] as? String ?? "EMP-1024"
                self.emailLabel.text = user["email"] as? String ?? savedEmail

                var deptName = "General Operations"
                if let dept = user["department"] as? [String: Any], let dName = dept["name"] as? String {
                    deptName = dName
                } else if let dName = user["departmentName"] as? String {
                    deptName = dName
                }
                self.deptLabel.text = deptName

                let role = AuthService.shared.getRole()
                self.roleLabel.text = UserRole.from(string: role).displayName

                var orgName = AuthService.shared.getOrganization()
                if let comp = user["company"] as? [String: Any], let cName = comp["name"] as? String {
                    orgName = cName
                } else if let cName = user["companyName"] as? String {
                    orgName = cName
                }
                if orgName.isEmpty || orgName.lowercased() == "acmecorp" || orgName.lowercased() == "null" {
                    orgName = "GlobizHub Inc."
                }
                self.orgLabel.text = orgName

                if !photoUrl.isEmpty, let url = URL(string: photoUrl) {
                    URLSession.shared.dataTask(with: url) { [weak self] d, _, _ in
                        if let d = d, let img = UIImage(data: d) {
                            DispatchQueue.main.async {
                                self?.avatarImageView.image = img
                                self?.avatarImageView.isHidden = false
                                self?.avatarInitialsLabel.isHidden = true
                            }
                        }
                    }.resume()
                }

            case .failure:
                break
            }
        }
    }
}
