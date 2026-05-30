import type { Metadata } from "next";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";
import { DeleteAccountForm } from "@/components/settings/DeleteAccountForm";

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Manage your account security settings",
};

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-gray-200 pb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account security and privacy settings
          </p>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          {/* Security Section */}
          <section>
            <div className="space-y-8">
              {/* Change Password */}
              <div className="rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Change Password
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Update your password to keep your account secure. We recommend
                  using a strong, unique password.
                </p>
                <div className="mt-6">
                  <ChangePasswordForm />
                </div>
              </div>

              {/* Security Best Practices */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
                <h3 className="font-semibold text-blue-900">
                  Security Best Practices
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-blue-800">
                  <li className="flex items-start">
                    <span className="mr-3">✓</span>
                    <span>Use a password with at least 8 characters</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">✓</span>
                    <span>
                      Include uppercase, lowercase, numbers, and symbols
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">✓</span>
                    <span>
                      Avoid using personal information or common words
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">✓</span>
                    <span>
                      Change your password regularly (every 90 days recommended)
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section>
            <div className="space-y-8">
              {/* Delete Account */}
              <div className="rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Delete Account
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Permanently delete your account and remove all associated data
                  from our servers.
                </p>
                <div className="mt-6">
                  <DeleteAccountForm />
                </div>
              </div>

              {/* Important Information */}
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
                <h3 className="font-semibold text-yellow-900">
                  Important Information
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-yellow-800">
                  <li className="flex items-start">
                    <span className="mr-3">⚠</span>
                    <span>
                      Account deletion is <strong>permanent</strong> and cannot
                      be undone
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">⚠</span>
                    <span>
                      You will lose access to all your data and services
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">⚠</span>
                    <span>
                      Active transactions must be completed before deletion
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Additional Resources */}
        <section className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-xl font-semibold text-gray-900">Need Help?</h2>
          <p className="mt-2 text-gray-600">
            For more information about your account and privacy, please refer to
            our{" "}
            <a
              href="/privacy"
              className="font-medium text-teal-600 hover:underline"
            >
              Privacy Policy
            </a>{" "}
            and{" "}
            <a
              href="/terms"
              className="font-medium text-teal-600 hover:underline"
            >
              Terms of Service
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
