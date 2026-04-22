"use client";

import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import LoadingBar from "@/components/ui/LoadingBar";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Ban,
  Briefcase,
  Code,
  Coins,
  CreditCard,
  FileCheck,
  FileText,
  Gavel,
  HelpCircle,
  Lock,
  Plug,
  RefreshCw,
  Scale,
  Server,
  Shield,
  Split,
  UserCircle,
  Users,
} from "lucide-react";
import Link from "next/link";

type ContentBlock =
  | { type: "p"; children: ReactNode }
  | { type: "h3"; children: ReactNode }
  | { type: "ul"; items: ReactNode[] };

type TermsSection = {
  icon: LucideIcon;
  id: string;
  title: string;
  blocks: ContentBlock[];
};

const sections: TermsSection[] = [
  {
    icon: FileCheck,
    id: "acceptance",
    title: "1. Acceptance of Terms",
    blocks: [
      {
        type: "p",
        children: (
          <>
            By accessing or using the OFFER-HUB platform, website, or any related services (collectively, the
            &quot;Platform&quot;), you (&quot;User&quot;, &quot;you&quot;, &quot;your&quot;) agree to be bound by
            these Terms and Conditions (&quot;Terms&quot;). If you do not agree to these Terms in their entirety, you
            must immediately cease using the Platform.
          </>
        ),
      },
      {
        type: "p",
        children: (
          <>
            These Terms constitute a legally binding agreement between you and OFFER-HUB (&quot;Company&quot;,
            &quot;we&quot;, &quot;us&quot;, &quot;our&quot;). By registering an account, browsing the Platform, or
            engaging in any transaction, you confirm that:
          </>
        ),
      },
      {
        type: "ul",
        items: [
          "You are at least 18 years of age or the age of legal majority in your jurisdiction.",
          "You have the legal capacity to enter into binding contracts.",
          "You are not prohibited by applicable law from using our Platform.",
        ],
      },
    ],
  },
  {
    icon: Briefcase,
    id: "description",
    title: "2. Description of Service",
    blocks: [
      {
        type: "p",
        children: (
          <>
            OFFER-HUB is a decentralized-friendly marketplace platform that connects <strong>Clients</strong>{" "}
            (individuals or organizations seeking services) with <strong>Freelancers</strong> (independent
            professionals offering services). The Platform provides:
          </>
        ),
      },
      {
        type: "ul",
        items: [
          "A discovery layer for posting and finding service opportunities.",
          "Escrow-based payment protection powered by the Stellar blockchain network through Trustless Work.",
          "Balance management and fund handling via Airtm integration.",
          "Messaging, contract management, and project tracking tools.",
          "Analytics and reporting for marketplace activity.",
        ],
      },
      {
        type: "p",
        children: (
          <>
            OFFER-HUB acts solely as an intermediary technology platform. We do <strong>not</strong> employ, supervise,
            direct, or control freelancers or the work they perform. We do not act as an employer, staffing agency, or
            labor broker.
          </>
        ),
      },
    ],
  },
  {
    icon: UserCircle,
    id: "accounts",
    title: "3. User Accounts",
    blocks: [
      { type: "h3", children: "3.1 Registration" },
      {
        type: "p",
        children: (
          <>
            To access most features of the Platform, you must create an account. You agree to:
          </>
        ),
      },
      {
        type: "ul",
        items: [
          <>
            Provide accurate, complete, and current information during registration.
          </>,
          <>Keep your account information up to date at all times.</>,
          <>
            Maintain the security and confidentiality of your credentials (password, wallet keys, or third-party
            authentication tokens).
          </>,
          <>
            Immediately notify us at <strong>support@offerhub.io</strong> of any unauthorized access or suspected
            breach of your account.
          </>,
        ],
      },
      { type: "h3", children: "3.2 Account Responsibility" },
      {
        type: "p",
        children: (
          <>
            You are solely responsible for all activity that occurs under your account. OFFER-HUB shall not be liable for
            any loss or damage arising from your failure to protect your account credentials.
          </>
        ),
      },
      { type: "h3", children: "3.3 One Account Per User" },
      {
        type: "p",
        children: (
          <>
            Each user may maintain only one active account. Creating multiple accounts to circumvent restrictions, bans,
            or platform policies is strictly prohibited and will result in permanent suspension of all related accounts.
          </>
        ),
      },
      { type: "h3", children: "3.4 Account Suspension and Termination" },
      {
        type: "p",
        children: (
          <>
            We reserve the right to suspend or permanently terminate your account, with or without notice, if we
            determine that you have violated these Terms, engaged in fraudulent or illegal activity, or if required to do
            so by applicable law.
          </>
        ),
      },
    ],
  },
  {
    icon: Users,
    id: "roles",
    title: "4. User Roles and Responsibilities",
    blocks: [
      { type: "h3", children: "4.1 Clients" },
      {
        type: "p",
        children: <>As a Client, you agree to:</>,
      },
      {
        type: "ul",
        items: [
          "Post accurate and complete project descriptions, budgets, and timelines.",
          "Fund escrow accounts before work begins when required by the Platform.",
          "Evaluate and approve deliverables in good faith and within the agreed timeline.",
          "Not request work that is illegal, unethical, or violates these Terms.",
          "Pay agreed fees and not attempt to circumvent the Platform's payment system.",
        ],
      },
      { type: "h3", children: "4.2 Freelancers" },
      {
        type: "p",
        children: <>As a Freelancer, you agree to:</>,
      },
      {
        type: "ul",
        items: [
          "Represent your skills, experience, and qualifications accurately.",
          "Deliver work that meets the agreed scope, quality, and timeline.",
          "Communicate proactively and honestly about project status or blockers.",
          "Not subcontract work to third parties without explicit written consent from the Client.",
          "Comply with all applicable tax laws regarding income earned through the Platform.",
          "Maintain professional conduct throughout all interactions.",
        ],
      },
    ],
  },
  {
    icon: Ban,
    id: "prohibited",
    title: "5. Prohibited Uses",
    blocks: [
      {
        type: "p",
        children: <>You agree not to use the Platform for any of the following:</>,
      },
      {
        type: "ul",
        items: [
          <>
            <strong>Fraud and Misrepresentation:</strong> Providing false information, impersonating others, or
            misrepresenting qualifications or deliverables.
          </>,
          <>
            <strong>Money Laundering:</strong> Using the Platform to process funds derived from illegal activity or to
            obscure the origin of funds.
          </>,
          <>
            <strong>Harassment and Abuse:</strong> Engaging in threatening, harassing, discriminatory, or abusive
            behavior toward any user or OFFER-HUB staff.
          </>,
          <>
            <strong>Unauthorized Access:</strong> Attempting to access systems, data, or accounts you are not authorized
            to access.
          </>,
          <>
            <strong>Malware and Exploits:</strong> Uploading or transmitting malicious code, viruses, or scripts designed
            to compromise the Platform or other users&apos; systems.
          </>,
          <>
            <strong>Spam and Unsolicited Communications:</strong> Sending unsolicited messages, promotional content, or
            communications to other users outside the intended platform flows.
          </>,
          <>
            <strong>Intellectual Property Violations:</strong> Uploading, sharing, or selling content that infringes the
            copyrights, trademarks, patents, or trade secrets of any third party.
          </>,
          <>
            <strong>Tax Evasion:</strong> Using the Platform to evade reporting obligations or applicable taxes.
          </>,
          <>
            <strong>Platform Circumvention:</strong> Communicating with counterparties for the purpose of conducting
            transactions outside the Platform to avoid fees or escrow protections.
          </>,
          <>
            <strong>Illegal Services:</strong> Offering or procuring services that are illegal in any applicable
            jurisdiction.
          </>,
        ],
      },
      {
        type: "p",
        children: (
          <>
            Violation of these prohibitions may result in immediate account termination, withholding of funds, and
            reporting to relevant law enforcement authorities.
          </>
        ),
      },
    ],
  },
  {
    icon: CreditCard,
    id: "payments",
    title: "6. Payments, Fees, and Escrow",
    blocks: [
      { type: "h3", children: "6.1 Escrow Protection" },
      {
        type: "p",
        children: (
          <>
            OFFER-HUB integrates with <strong>Trustless Work</strong> smart contracts on the{" "}
            <strong>Stellar blockchain</strong> to provide non-custodial escrow for transactions. When a Client engages
            a Freelancer:
          </>
        ),
      },
      {
        type: "ul",
        items: [
          "The Client deposits funds into a smart contract escrow prior to work commencement.",
          "Funds are released to the Freelancer upon Client approval of deliverables, or automatically under conditions defined in the smart contract.",
          "OFFER-HUB does not directly hold, control, or take custody of escrowed funds. The smart contract governs fund release.",
        ],
      },
      { type: "h3", children: "6.2 Platform Fees" },
      {
        type: "p",
        children: (
          <>
            OFFER-HUB charges service fees for facilitating transactions. Current fee structures are published on the
            Platform and may be updated with notice. Fees are non-refundable except where required by applicable law or
            as specified in a dispute resolution outcome.
          </>
        ),
      },
      { type: "h3", children: "6.3 Currency and Conversion" },
      {
        type: "p",
        children: (
          <>
            Transactions on OFFER-HUB may involve digital assets and fiat currencies. Conversion rates and associated
            costs are determined by integrated service providers (e.g., Airtm). OFFER-HUB is not responsible for exchange
            rate fluctuations or third-party conversion fees.
          </>
        ),
      },
      { type: "h3", children: "6.4 Taxes" },
      {
        type: "p",
        children: (
          <>
            You are solely responsible for determining and fulfilling your tax obligations arising from transactions
            conducted through the Platform. OFFER-HUB does not withhold taxes on your behalf unless required by
            applicable law. We may report transaction data to tax authorities as required by law.
          </>
        ),
      },
      { type: "h3", children: "6.5 Refunds and Disputes" },
      {
        type: "p",
        children: (
          <>
            Refund eligibility is determined by the escrow contract terms and the Platform&apos;s dispute resolution
            process. OFFER-HUB does not guarantee refunds for completed transactions outside of a formally adjudicated
            dispute.
          </>
        ),
      },
    ],
  },
  {
    icon: Coins,
    id: "blockchain",
    title: "7. Blockchain and Smart Contract Disclaimer",
    blocks: [
      {
        type: "p",
        children: (
          <>
            The OFFER-HUB Platform utilizes blockchain technology and smart contracts for certain payment functions. You
            acknowledge and agree that:
          </>
        ),
      },
      {
        type: "ul",
        items: [
          <>
            <strong>Irreversibility:</strong> Blockchain transactions are generally irreversible once confirmed.
            OFFER-HUB cannot reverse or cancel confirmed on-chain transactions.
          </>,
          <>
            <strong>Smart Contract Risk:</strong> Smart contracts may contain bugs or vulnerabilities despite security
            audits. OFFER-HUB is not liable for losses arising from smart contract exploits beyond our reasonable control.
          </>,
          <>
            <strong>Network Risk:</strong> Blockchain network congestion, forks, or outages may delay or affect
            transactions. OFFER-HUB is not responsible for delays caused by network-level events.
          </>,
          <>
            <strong>Wallet Responsibility:</strong> You are solely responsible for securing your blockchain wallet and
            private keys. Loss of keys may result in permanent loss of funds. OFFER-HUB cannot recover lost private
            keys.
          </>,
          <>
            <strong>Regulatory Risk:</strong> The regulatory status of digital assets varies by jurisdiction and may
            change. You are responsible for complying with applicable laws in your jurisdiction regarding digital asset
            use.
          </>,
        ],
      },
    ],
  },
  {
    icon: Scale,
    id: "ip",
    title: "8. Intellectual Property",
    blocks: [
      { type: "h3", children: "8.1 Platform Ownership" },
      {
        type: "p",
        children: (
          <>
            The OFFER-HUB Platform, including but not limited to its software, design, branding, algorithms, databases,
            and documentation, is owned by OFFER-HUB or its licensors and is protected by copyright, trademark, patent,
            and other applicable intellectual property laws.
          </>
        ),
      },
      { type: "h3", children: "8.2 User Content License" },
      {
        type: "p",
        children: (
          <>
            By submitting, uploading, or publishing any content on the Platform (including profiles, project
            descriptions, messages, and deliverables), you grant OFFER-HUB a non-exclusive, worldwide, royalty-free,
            sublicensable license to host, store, display, reproduce, and transmit such content solely for the purpose of
            operating and improving the Platform.
          </>
        ),
      },
      { type: "h3", children: "8.3 Deliverable Ownership" },
      {
        type: "p",
        children: <>Unless otherwise agreed in writing between Client and Freelancer:</>,
      },
      {
        type: "ul",
        items: [
          "Deliverables become the property of the Client upon full payment release from escrow.",
          "The Freelancer retains no rights to repurpose or redistribute Client-owned deliverables without explicit permission.",
        ],
      },
      { type: "h3", children: "8.4 DMCA / Copyright Infringement" },
      {
        type: "p",
        children: (
          <>
            If you believe that content on the Platform infringes your copyright, please notify us at{" "}
            <strong>legal@offerhub.io</strong> with the following information:
          </>
        ),
      },
      {
        type: "ul",
        items: [
          "A description of the copyrighted work.",
          "The URL or location of the allegedly infringing content.",
          "Your contact information.",
          "A statement of good faith belief that the use is unauthorized.",
          "A declaration that the information in your notice is accurate.",
        ],
      },
    ],
  },
  {
    icon: Shield,
    id: "privacy",
    title: "9. Privacy and Data Protection",
    blocks: [
      {
        type: "p",
        children: (
          <>
            Your use of the Platform is also governed by our{" "}
            <Link
              href="https://offer-hub.tech/privacy"
              className="font-bold text-theme-primary hover:text-content-primary underline underline-offset-2"
            >
              Privacy Policy
            </Link>
            , which is incorporated into these Terms by reference. By using the Platform, you consent to our data
            practices as described in the Privacy Policy.
          </>
        ),
      },
      {
        type: "p",
        children: (
          <>
            We collect and process personal data to operate the Platform, improve services, prevent fraud, and comply
            with legal obligations. We do not sell personal data to third parties.
          </>
        ),
      },
    ],
  },
  {
    icon: Lock,
    id: "confidentiality",
    title: "10. Confidentiality",
    blocks: [
      {
        type: "p",
        children: (
          <>
            During the course of a project, Clients and Freelancers may exchange confidential information. You agree to:
          </>
        ),
      },
      {
        type: "ul",
        items: [
          "Not disclose confidential information shared by the counterparty to third parties without consent.",
          "Use confidential information only for the purpose of completing the relevant project.",
          "This obligation survives termination of any individual engagement or these Terms.",
        ],
      },
      {
        type: "p",
        children: (
          <>
            OFFER-HUB is not a party to confidentiality obligations between Clients and Freelancers. We recommend
            formalizing confidentiality terms in your project contracts.
          </>
        ),
      },
    ],
  },
  {
    icon: AlertTriangle,
    id: "disclaimers",
    title: "11. Disclaimers and Limitation of Liability",
    blocks: [
      { type: "h3", children: "11.1 No Warranty" },
      {
        type: "p",
        children: (
          <>
            THE PLATFORM IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
            EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
            PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR
            FREE OF HARMFUL COMPONENTS.
          </>
        ),
      },
      { type: "h3", children: "11.2 No Liability for User Conduct" },
      {
        type: "p",
        children: (
          <>
            OFFER-HUB is not responsible for the conduct, actions, or omissions of any user on or off the Platform. We
            do not vet, verify, or endorse any Freelancer or Client beyond the information provided during registration.
          </>
        ),
      },
      { type: "h3", children: "11.3 Limitation of Liability" },
      {
        type: "p",
        children: (
          <>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, OFFER-HUB&apos;S TOTAL LIABILITY TO YOU FOR ANY CLAIM
            ARISING OUT OF OR RELATED TO THESE TERMS OR YOUR USE OF THE PLATFORM SHALL NOT EXCEED THE GREATER OF:
          </>
        ),
      },
      {
        type: "p",
        children: (
          <>
            (a) THE TOTAL FEES PAID BY YOU TO OFFER-HUB IN THE THREE (3) MONTHS PRECEDING THE CLAIM; OR
          </>
        ),
      },
      {
        type: "p",
        children: <>(b) ONE HUNDRED US DOLLARS (USD $100).</>,
      },
      {
        type: "p",
        children: (
          <>
            IN NO EVENT SHALL OFFER-HUB BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
            DAMAGES, INCLUDING LOSS OF PROFITS, DATA, GOODWILL, OR BUSINESS OPPORTUNITIES, EVEN IF ADVISED OF THE
            POSSIBILITY OF SUCH DAMAGES.
          </>
        ),
      },
      { type: "h3", children: "11.4 Indemnification" },
      {
        type: "p",
        children: (
          <>
            You agree to indemnify, defend, and hold harmless OFFER-HUB and its officers, directors, employees, and
            agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable
            attorneys&apos; fees) arising out of or in any way connected with:
          </>
        ),
      },
      {
        type: "ul",
        items: [
          "Your use of or inability to use the Platform.",
          "Your violation of these Terms.",
          "Your violation of any applicable law or regulation.",
          "Any dispute between you and another user.",
        ],
      },
    ],
  },
  {
    icon: Gavel,
    id: "dispute",
    title: "12. Dispute Resolution",
    blocks: [
      { type: "h3", children: "12.1 Platform Disputes" },
      {
        type: "p",
        children: (
          <>
            For disputes between Clients and Freelancers regarding deliverables, payments, or project conduct, OFFER-HUB
            may offer a mediation process. Both parties agree to participate in good faith before escalating to external
            legal remedies.
          </>
        ),
      },
      { type: "h3", children: "12.2 Arbitration" },
      {
        type: "p",
        children: (
          <>
            Any dispute, claim, or controversy arising out of or relating to these Terms or the Platform that cannot be
            resolved through mediation shall be finally settled by binding arbitration under the rules of the American
            Arbitration Association (AAA) or equivalent international body, conducted in English. The arbitration shall
            be conducted on an individual basis; class arbitrations are not permitted.
          </>
        ),
      },
      { type: "h3", children: "12.3 Governing Law" },
      {
        type: "p",
        children: (
          <>
            These Terms are governed by and construed in accordance with the laws of the State of Delaware, United
            States, without regard to its conflict of law provisions. For users outside the United States, mandatory
            local consumer protection laws may apply.
          </>
        ),
      },
      { type: "h3", children: "12.4 Jurisdiction" },
      {
        type: "p",
        children: (
          <>
            For any disputes not subject to arbitration, you consent to the exclusive jurisdiction of the state and
            federal courts located in Delaware, United States.
          </>
        ),
      },
    ],
  },
  {
    icon: Server,
    id: "availability",
    title: "13. Service Availability and Modifications",
    blocks: [
      {
        type: "p",
        children: <>OFFER-HUB reserves the right to:</>,
      },
      {
        type: "ul",
        items: [
          "Modify, suspend, or discontinue any feature or the entire Platform at any time, with or without notice.",
          "Perform scheduled or emergency maintenance that may result in temporary unavailability.",
          "Update fees, features, or platform rules at any time with reasonable notice posted on the Platform.",
        ],
      },
      {
        type: "p",
        children: (
          <>
            We are not liable for any modification, suspension, or discontinuation of the Platform or any service
            provided through it.
          </>
        ),
      },
    ],
  },
  {
    icon: Plug,
    id: "third-party",
    title: "14. Third-Party Services",
    blocks: [
      {
        type: "p",
        children: (
          <>
            The Platform integrates with third-party services including but not limited to Airtm, Trustless Work,
            Stellar network, and Supabase. Your use of third-party services is subject to their respective terms and
            privacy policies. OFFER-HUB is not responsible for the practices or content of any third-party service.
          </>
        ),
      },
    ],
  },
  {
    icon: Code,
    id: "open-source",
    title: "15. Open Source and Developer Contributions",
    blocks: [
      {
        type: "p",
        children: (
          <>
            The OFFER-HUB platform is an open-source project. Contributions to the codebase are governed by the
            project&apos;s Contributing Guidelines available in the repository. By contributing code, you agree that your
            contributions may be incorporated into the Platform and licensed under the project&apos;s open-source
            license.
          </>
        ),
      },
    ],
  },
  {
    icon: RefreshCw,
    id: "changes",
    title: "16. Changes to These Terms",
    blocks: [
      {
        type: "p",
        children: <>We may update these Terms from time to time. When we do, we will:</>,
      },
      {
        type: "ul",
        items: [
          <>Post the revised Terms on the Platform with a new &quot;Last Updated&quot; date.</>,
          <>Notify registered users via email or in-Platform notification for material changes.</>,
        ],
      },
      {
        type: "p",
        children: (
          <>
            Your continued use of the Platform after the effective date of revised Terms constitutes your acceptance of
            those changes. If you do not agree to the revised Terms, you must stop using the Platform and may close your
            account.
          </>
        ),
      },
    ],
  },
  {
    icon: Split,
    id: "severability",
    title: "17. Severability",
    blocks: [
      {
        type: "p",
        children: (
          <>
            If any provision of these Terms is held to be invalid, illegal, or unenforceable, the remaining provisions
            shall continue in full force and effect. The invalid provision shall be modified to the minimum extent
            necessary to make it enforceable.
          </>
        ),
      },
    ],
  },
  {
    icon: FileText,
    id: "entire",
    title: "18. Entire Agreement",
    blocks: [
      {
        type: "p",
        children: (
          <>
            These Terms, together with the Privacy Policy and any additional agreements you enter into on the Platform,
            constitute the entire agreement between you and OFFER-HUB regarding your use of the Platform, and supersede
            all prior communications, proposals, or representations.
          </>
        ),
      },
    ],
  },
  {
    icon: HelpCircle,
    id: "contact",
    title: "19. Contact Information",
    blocks: [
      {
        type: "p",
        children: (
          <>
            For questions, concerns, or legal notices regarding these Terms, please contact us:
          </>
        ),
      },
      {
        type: "ul",
        items: [
          <>
            <strong>General Support:</strong>{" "}
            <a href="mailto:support@offerhub.io" className="font-bold text-theme-primary hover:text-content-primary">
              support@offerhub.io
            </a>
          </>,
          <>
            <strong>Legal & Compliance:</strong>{" "}
            <a href="mailto:legal@offerhub.io" className="font-bold text-theme-primary hover:text-content-primary">
              legal@offerhub.io
            </a>
          </>,
          <>
            <strong>Website:</strong>{" "}
            <a
              href="https://offer-hub.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-theme-primary hover:text-content-primary"
            >
              https://offer-hub.tech
            </a>
          </>,
        ],
      },
    ],
  },
];

function renderBlock(block: ContentBlock, blockIndex: number) {
  if (block.type === "p") {
    return (
      <p
        key={blockIndex}
        className="text-base font-medium leading-relaxed text-content-secondary [&:not(:first-child)]:mt-6"
      >
        {block.children}
      </p>
    );
  }
  if (block.type === "h3") {
    return (
      <h3
        key={blockIndex}
        className="text-lg font-black text-content-primary tracking-tight mt-8 first:mt-0 mb-4"
      >
        {block.children}
      </h3>
    );
  }
  if (block.type === "ul") {
    return (
      <ul key={blockIndex} className="space-y-4 mt-4">
        {block.items.map((item, i) => (
          <li key={i} className="flex items-start gap-4 text-sm font-medium text-content-primary">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-theme-primary shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }
  return null;
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-base text-content-primary">
      <Navbar />
      <LoadingBar />

      <main className="flex-grow pt-32 pb-24 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-20 animate-fadeInUp">
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-theme-primary mb-4">Legal Framework</p>
            <h1 className="text-4xl md:text-6xl font-black text-content-primary tracking-tighter leading-none mb-6">
              Platform <span className="text-theme-primary">Terms</span>
            </h1>
            <p className="text-lg text-content-secondary font-medium max-w-2xl mx-auto leading-relaxed">
              These terms outline the agreement between you and OFFER-HUB.
              By using our tools, you agree to these principles of operation.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-elevated shadow-raised-sm text-xs font-bold text-content-secondary">
              Last updated: <span className="text-theme-primary">March 28, 2026</span>
            </div>
          </header>

          <div className="space-y-12">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <section key={section.id} className="p-8 md:p-12 rounded-[2.5rem] bg-bg-base shadow-raised">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-bg-base shadow-sunken-subtle text-theme-primary">
                      <Icon size={20} />
                    </div>
                    <h2 className="text-2xl font-black text-content-primary tracking-tight">{section.title}</h2>
                  </div>

                  <div className="[&_h3:first-child]:mt-0">
                    {section.blocks.map((block, i) => renderBlock(block, i))}
                  </div>
                </section>
              );
            })}

            <div className="p-8 md:p-10 rounded-[2.5rem] bg-bg-base shadow-sunken-subtle">
              <p className="text-sm font-medium italic leading-relaxed text-content-secondary">
                This document was drafted for the OFFER-HUB open-source project and should be reviewed by a licensed
                attorney before publication in a production environment. It is intended as a comprehensive starting point
                covering the platform&apos;s key legal exposure areas.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
