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
    private let splashDuration: TimeInterval = 2.5

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

        let nextVC: UIViewController
        #if targetEnvironment(simulator)
        if !AuthService.shared.isLoggedIn {
            AuthService.shared.saveAuth(token: AuthService.defaultValidToken, email: "sealmanash7@gmail.com", role: "EMPLOYEE")
            AuthService.shared.saveUserProfile(firstName: "Sealmanash", designation: "Operations & Tech Lead", organization: "GlobizHub Technologies")
        }
        nextVC = HomeViewController()
        #else
        if AuthService.shared.isLoggedIn {
            nextVC = HomeViewController()
        } else if UserDefaults.standard.bool(forKey: "hasCompletedOnboarding") {
            nextVC = SignInViewController()
        } else {
            nextVC = OnboardingViewController()
        }
        #endif

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
