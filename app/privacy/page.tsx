export default function PrivacyPolicy() {
  return (
    <main className="px-6 py-12 max-w-lg mx-auto">
      <h1 className="text-3xl mb-6" style={{ fontFamily: "Garamond, 'EB Garamond', Georgia, serif" }}>
        Privacy Policy
      </h1>
      <div className="text-sm leading-relaxed space-y-4 text-gray-700">
        <p>Last updated: May 2026</p>
        <p>
          Fete collects your phone number to send you a login link and event-related messages (invites, RSVPs, reminders) on behalf of event hosts. We do not sell or share your information with third parties.
        </p>
        <p>
          We store your phone number and RSVP responses to power the app. You can request deletion of your data at any time by emailing us.
        </p>
        <p>
          SMS messages are sent via Twilio. Standard message and data rates may apply. You can opt out of event messages by replying STOP.
        </p>
        <p>
          Questions? Email <a href="mailto:ameliagmiller@gmail.com" className="underline">ameliagmiller@gmail.com</a>
        </p>
      </div>
    </main>
  );
}
