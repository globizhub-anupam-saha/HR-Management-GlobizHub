import UIKit
import Capacitor

class SplashViewController: UIViewController {

    // MARK: - Center Branding (Clean, Pure White Background, No Video)
    private let logoImageView: UIImageView = {
        let iv = UIImageView()
        iv.translatesAutoresizingMaskIntoConstraints = false
        iv.contentMode = .scaleAspectFit
        if let img = UIImage(named: "splash_logo") {
            iv.image = img
        } else if let path = Bundle.main.path(forResource: "splash_logo", ofType: "png"), let img = UIImage(contentsOfFile: path) {
            iv.image = img
        } else {
            iv.image = UIImage(named: "Splash")
        }
        return iv
    }()

    private var hasNavigated = false
    private var splashDuration: TimeInterval {
        for arg in ProcessInfo.processInfo.arguments {
            if arg.hasPrefix("-test") { return 0.05 }
        }
        return 2.5
    }

    override var preferredStatusBarStyle: UIStatusBarStyle {
        return .darkContent
    }

    // MARK: - Lifecycle
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white

        setupUI()
        setupTapToSkip()
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        startAnimations()
        scheduleNavigation()
    }

    // MARK: - UI Setup
    private func setupUI() {
        view.addSubview(logoImageView)

        let logoWidth: CGFloat = min(280, UIScreen.main.bounds.width - 64)
        let logoHeight: CGFloat = logoWidth * 0.70

        NSLayoutConstraint.activate([
            logoImageView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            logoImageView.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            logoImageView.widthAnchor.constraint(equalToConstant: logoWidth),
            logoImageView.heightAnchor.constraint(equalToConstant: logoHeight)
        ])
    }

    private func setupTapToSkip() {
        let tap = UITapGestureRecognizer(target: self, action: #selector(handleTapToSkip))
        view.addGestureRecognizer(tap)
    }

    @objc private func handleTapToSkip() {
        navigateToNextScreen()
    }

    // MARK: - Animations
    private func startAnimations() {
        logoImageView.alpha = 0.0
        logoImageView.transform = CGAffineTransform(scaleX: 0.90, y: 0.90)

        UIView.animate(withDuration: 0.75, delay: 0.1, usingSpringWithDamping: 0.8, initialSpringVelocity: 0.4, options: .curveEaseOut, animations: {
            self.logoImageView.alpha = 1.0
            self.logoImageView.transform = .identity
        }, completion: nil)
    }

    // MARK: - Navigation
    private func scheduleNavigation() {
        DispatchQueue.main.asyncAfter(deadline: .now() + splashDuration) { [weak self] in
            self?.navigateToNextScreen()
        }
    }

    private func navigateToNextScreen() {
        guard !hasNavigated else { return }
        hasNavigated = true

        if let idx = ProcessInfo.processInfo.arguments.firstIndex(of: "-testRole"), idx + 1 < ProcessInfo.processInfo.arguments.count {
            let roleArg = ProcessInfo.processInfo.arguments[idx + 1]
            AuthService.shared.saveRole(roleArg)
            UserDefaults.standard.set(true, forKey: "isUserManualRoleOverride")
        }

        var nextVC: UIViewController
        if ProcessInfo.processInfo.arguments.contains("-testRouteAttendance") {
            nextVC = AttendanceViewController()
        } else if ProcessInfo.processInfo.arguments.contains("-testRouteMore") {
            nextVC = MoreViewController()
        } else if ProcessInfo.processInfo.arguments.contains("-testRouteCustomizeTabs") {
            nextVC = CustomizeTabsViewController()
        } else if ProcessInfo.processInfo.arguments.contains("-testRouteSettings") {
            nextVC = SettingsViewController()
        } else if ProcessInfo.processInfo.arguments.contains("-testRouteAccountSettings") {
            nextVC = AccountSettingsViewController()
        } else if ProcessInfo.processInfo.arguments.contains("-testRouteHelpSupport") {
            nextVC = HelpSupportViewController()
        } else if ProcessInfo.processInfo.arguments.contains("-testRouteDeleteAccount") {
            nextVC = DeleteAccountViewController()
        } else if ProcessInfo.processInfo.arguments.contains("-testRouteHome") || AuthService.shared.isLoggedIn {
            nextVC = HomeViewController()
        } else {
            // First-time install / unauthenticated user starts directly with the Sign In (Auth) screen
            nextVC = SignInViewController()
        }

        if let window = self.view.window ?? UIApplication.shared.windows.first(where: { $0.isKeyWindow }) {
            UIView.transition(with: window, duration: 0.40, options: .transitionCrossDissolve, animations: {
                window.rootViewController = nextVC
            }, completion: nil)
        } else {
            nextVC.modalPresentationStyle = .fullScreen
            nextVC.modalTransitionStyle = .crossDissolve
            self.present(nextVC, animated: true, completion: nil)
        }
    }
}
