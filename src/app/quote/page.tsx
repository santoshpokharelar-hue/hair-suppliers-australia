import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { QuoteRequestForm } from "@/components/quote/quote-request-form";
import { getDefaultAddress } from "@/lib/queries/addresses";

export default async function QuotePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const defaultAddress = await getDefaultAddress(session.user.id);

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-9">
      <h1 className="font-display text-2xl font-bold text-plum-dark">Request a quote</h1>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">
        Confirm where this ships to. We&apos;ll price freight by hand and email you a quote to
        pay once it&apos;s ready.
      </p>
      <QuoteRequestForm defaultAddress={defaultAddress} />
    </div>
  );
}
