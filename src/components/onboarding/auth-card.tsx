"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";

/**
 * The white auth card from the ONBOARDING frame.
 * Fixed 400×500 composition (absolute positions taken verbatim from Figma);
 * horizontally fluid via left/right insets so it adapts to narrow screens.
 */
export function AuthCard() {
  const [tab, setTab] = useState("Sign up");

  return (
    <div className="relative h-[500px] w-full max-w-[400px] rounded-[14px] bg-white shadow-auth-card">
      {/* Sign up / Log in switcher */}
      <div className="absolute left-[30px] right-[30px] top-[30px]">
        <SegmentedTabs
          options={["Sign up", "Log in"]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {/* Heading */}
      <div className="absolute left-[30px] right-[30px] top-[80px] pt-[17px]">
        <h2 className="font-chakra text-[23px] font-bold leading-[normal] text-ink-card">
          Create your account
        </h2>
      </div>

      {/* Email */}
      <div className="absolute left-[30px] right-[30px] top-[134px]">
        <Field
          label="UTD Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="netid@utdallas.edu"
        />
      </div>

      {/* Password */}
      <div className="absolute left-[30px] right-[30px] top-[224px]">
        <Field
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
        />
      </div>

      {/* Submit */}
      <div className="absolute left-[30px] right-[30px] top-[325px]">
        <Button variant="auth" block>
          View Dashboard ↗
        </Button>
      </div>

      {/* Helper */}
      <div className="absolute left-[30px] right-[30px] top-[388px] text-center">
        <p className="font-mono-alt text-[11px] leading-[normal] text-helper-ink">
          we&apos;ll send a link to validate your email
        </p>
      </div>
    </div>
  );
}
