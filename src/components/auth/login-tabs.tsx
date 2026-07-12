"use client";

import { useActionState } from "react";
import { Lock, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  loginAction,
  signUpBusinessAction,
  signUpGuestAction,
  type FormState,
} from "@/lib/actions/auth";

const INITIAL_STATE: FormState = { ok: false };

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-destructive text-xs mt-1">{messages[0]}</p>;
}

function Field({
  id,
  label,
  type = "text",
  required,
  errors,
  ...rest
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  errors?: string[];
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="mb-3">
      <Label htmlFor={id} className="mb-1.5 text-plum-dark">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <Input id={id} name={id} type={type} required={required} {...rest} />
      <FieldError messages={errors} />
    </div>
  );
}

export function LoginTabs() {
  return (
    <div className="mx-auto max-w-lg px-5 py-9">
      <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
        <div className="bg-plum-dark px-6 py-6">
          <h1 className="font-display text-2xl font-bold text-white">Login portal</h1>
          <p className="mt-1.5 text-sm text-honey-soft">
            Prices stay hidden until you sign in. Choose an option below.
          </p>
        </div>
        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-3 rounded-none border-b border-line bg-transparent p-0">
            <TabsTrigger value="signin" className="gap-1.5">
              <Lock className="size-3.5" /> Sign in
            </TabsTrigger>
            <TabsTrigger value="guest" className="gap-1.5">
              <User className="size-3.5" /> Guest
            </TabsTrigger>
            <TabsTrigger value="business" className="gap-1.5">
              <Building2 className="size-3.5" /> Business
            </TabsTrigger>
          </TabsList>
          <div className="p-6">
            <TabsContent value="signin">
              <SignInForm />
            </TabsContent>
            <TabsContent value="guest">
              <GuestSignupForm />
            </TabsContent>
            <TabsContent value="business">
              <BusinessSignupForm />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function SignInForm() {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL_STATE);
  return (
    <form action={formAction}>
      <Field id="email" label="Email" type="email" required errors={state.fieldErrors?.email} />
      <Field id="password" label="Password" type="password" required errors={state.fieldErrors?.password} />
      {state.message && <p className="text-destructive mb-3 text-sm font-medium">{state.message}</p>}
      <Button type="submit" disabled={pending} className="w-full justify-center">
        <Lock className="size-4" /> {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

function GuestSignupForm() {
  const [state, formAction, pending] = useActionState(signUpGuestAction, INITIAL_STATE);

  return (
    <form action={formAction}>
      <Field id="name" label="Full name" required errors={state.fieldErrors?.name} />
      <Field id="email" label="Email" type="email" required errors={state.fieldErrors?.email} />
      <Field id="phone" label="Phone" required errors={state.fieldErrors?.phone} />
      <Field id="password" label="Password" type="password" required errors={state.fieldErrors?.password} />
      <Field
        id="confirmPassword"
        label="Confirm password"
        type="password"
        required
        errors={state.fieldErrors?.confirmPassword}
      />
      <div className="text-honey mb-2 mt-4 text-xs font-bold tracking-wide">SHIPPING ADDRESS</div>
      <Field id="street" label="Street address" required errors={state.fieldErrors?.street} />
      <div className="grid grid-cols-[100px_1fr] gap-2.5">
        <Field id="postcode" label="Postcode" required errors={state.fieldErrors?.postcode} />
        <Field id="suburb" label="Suburb" required errors={state.fieldErrors?.suburb} />
      </div>
      <Field id="state" label="State" required errors={state.fieldErrors?.state} />
      {state.message && <p className="text-destructive mb-3 text-sm font-medium">{state.message}</p>}
      <Button type="submit" disabled={pending} className="w-full justify-center">
        <Lock className="size-4" /> {pending ? "Creating account…" : "Sign up & unlock pricing"}
      </Button>
    </form>
  );
}

function BusinessSignupForm() {
  const [state, formAction, pending] = useActionState(signUpBusinessAction, INITIAL_STATE);
  return (
    <form action={formAction}>
      <Field id="name" label="Full name" required errors={state.fieldErrors?.name} />
      <Field id="email" label="Email" type="email" required errors={state.fieldErrors?.email} />
      <Field id="phone" label="Phone" required errors={state.fieldErrors?.phone} />
      <Field id="password" label="Password" type="password" required errors={state.fieldErrors?.password} />
      <Field
        id="confirmPassword"
        label="Confirm password"
        type="password"
        required
        errors={state.fieldErrors?.confirmPassword}
      />
      <div className="text-honey mb-2 mt-4 text-xs font-bold tracking-wide">BUSINESS DETAILS</div>
      <Field id="businessName" label="Business name" required errors={state.fieldErrors?.businessName} />
      <Field
        id="abn"
        label="ABN (optional)"
        errors={state.fieldErrors?.abn}
      />
      {state.message && <p className="text-destructive mb-3 text-sm font-medium">{state.message}</p>}
      <Button type="submit" disabled={pending} className="w-full justify-center">
        <Lock className="size-4" /> {pending ? "Creating account…" : "Sign up & unlock pricing"}
      </Button>
    </form>
  );
}
