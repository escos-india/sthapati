import { StatusNotice } from "@/components/auth/status-notice";

const statusCopy = {
  pending: {
    title: "Your profile is awaiting approval",
    description: "Our admin team is reviewing your details. We will notify you via email once the status changes.",
    subtext: "Architect approvals typically complete within 1-2 business days.",
  },
  rejected: {
    title: "Your registration request was not approved",
    description: "Unfortunately we were unable to approve your submission. You can reach out to the team for further clarification.",
    ctaLabel: "Contact support",
    ctaHref: "mailto:studio@sthapatinetwork.com",
  },
  review: {
    title: "Your profile is under review",
    description: "Thanks for choosing the premium Architect track. The founding team is reviewing your submission.",
  },
} as const;

export default function StatusPage({
  searchParams,
}: {
  searchParams: { state?: keyof typeof statusCopy };
}) {
  const state = searchParams.state ?? "pending";
  const copy = statusCopy[state] ?? statusCopy.pending;

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-slate-100 py-24 px-6">
      <StatusNotice
        title={copy.title}
        description={copy.description}
        subtext={'subtext' in copy ? copy.subtext : undefined}
        ctaLabel={'ctaLabel' in copy ? copy.ctaLabel : undefined}
        ctaHref={'ctaHref' in copy ? copy.ctaHref : undefined}
      />
    </main>
  );
}

