import UIKit
import UniformTypeIdentifiers

/// "Share → NextUP" from Instagram (or any app sharing a link/text).
///
/// Hands the shared text to the main app by opening
/// `nextup://import?url=<text>`, which JS reads through React Native's Linking.
/// No App Group is used, so this also works with a free (Personal Team) account.
@objc(ShareViewController)
final class ShareViewController: UIViewController {
  private let statusLabel = UILabel()
  private var handled = false

  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = .systemBackground
    statusLabel.text = "Opening NextUP…"
    statusLabel.font = .preferredFont(forTextStyle: .headline)
    statusLabel.textAlignment = .center
    statusLabel.numberOfLines = 0
    statusLabel.translatesAutoresizingMaskIntoConstraints = false
    view.addSubview(statusLabel)
    NSLayoutConstraint.activate([
      statusLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
      statusLabel.centerYAnchor.constraint(equalTo: view.centerYAnchor),
      statusLabel.leadingAnchor.constraint(greaterThanOrEqualTo: view.leadingAnchor, constant: 24),
      statusLabel.trailingAnchor.constraint(lessThanOrEqualTo: view.trailingAnchor, constant: -24),
    ])
  }

  override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    guard !handled else { return }
    handled = true
    Task { await handleShare() }
  }

  @MainActor
  private func handleShare() async {
    guard let text = await loadSharedText(), let url = importURL(for: text) else {
      showMessageAndClose("Nothing to import. Share a reel link to NextUP.")
      return
    }

    if openContainingApp(url) {
      // Give the system a moment to start opening the app before we dismiss.
      try? await Task.sleep(nanoseconds: 400_000_000)
      extensionContext?.completeRequest(returningItems: nil)
    } else {
      showMessageAndClose("Couldn't open NextUP. Open the app and try again.")
    }
  }

  /// Prefer a URL attachment; fall back to plain text (Instagram sends either,
  /// depending on the version and the share target).
  private func loadSharedText() async -> String? {
    let items = extensionContext?.inputItems as? [NSExtensionItem] ?? []
    var texts: [String] = []

    for item in items {
      for provider in item.attachments ?? [] {
        if provider.hasItemConformingToTypeIdentifier(UTType.url.identifier),
           let value = try? await provider.loadItem(forTypeIdentifier: UTType.url.identifier) {
          if let url = value as? URL { texts.append(url.absoluteString) }
          else if let string = value as? String { texts.append(string) }
        } else if provider.hasItemConformingToTypeIdentifier(UTType.plainText.identifier),
                  let value = try? await provider.loadItem(forTypeIdentifier: UTType.plainText.identifier),
                  let string = value as? String {
          texts.append(string)
        }
      }
      if let content = item.attributedContentText?.string, !content.isEmpty {
        texts.append(content)
      }
    }

    return texts.first(where: { $0.localizedCaseInsensitiveContains("instagram.com") }) ?? texts.first
  }

  /// nextup://import?url=<text>, with everything but RFC 3986 unreserved characters
  /// percent-encoded so the shared link (which has its own ?, & and =) stays one value.
  private func importURL(for text: String) -> URL? {
    // ASCII only: CharacterSet.alphanumerics would leave letters like "é" unencoded.
    let unreserved = CharacterSet(
      charactersIn: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~")
    guard let encoded = text.addingPercentEncoding(withAllowedCharacters: unreserved) else { return nil }
    return URL(string: "nextup://import?url=\(encoded)")
  }

  /// Extensions can't call UIApplication.shared.open, so walk the responder chain
  /// to the UIApplication and invoke open(_:options:completionHandler:) at runtime.
  private func openContainingApp(_ url: URL) -> Bool {
    let selector = NSSelectorFromString("openURL:options:completionHandler:")
    var responder: UIResponder? = self
    while let current = responder {
      if let application = current as? UIApplication, application.responds(to: selector) {
        typealias OpenURL = @convention(c) (AnyObject, Selector, NSURL, NSDictionary, AnyObject?) -> Void
        let open = unsafeBitCast(application.method(for: selector), to: OpenURL.self)
        open(application, selector, url as NSURL, NSDictionary(), nil)
        return true
      }
      responder = current.next
    }
    return false
  }

  private func showMessageAndClose(_ message: String) {
    statusLabel.text = message
    DispatchQueue.main.asyncAfter(deadline: .now() + 1.8) { [weak self] in
      self?.extensionContext?.completeRequest(returningItems: nil)
    }
  }
}
