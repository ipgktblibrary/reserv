"use client";
import Input from "@/components/InputField";
import Label from "@/components/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";

import { useRouter } from "next/navigation";
import { signIn } from "@/features/auth/auth.service";
import { Button } from "@heroui/react";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
      router.push("/dashboard");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <Link
          href="/"
          className="mb-8 inline-flex items-center text-sm text-muted transition-colors hover:text-foreground"
        >
          <ChevronLeftIcon />
          Back to dashboard
        </Link>

        <h1 className="mb-2 text-title-sm font-semibold text-foreground sm:text-title-md">
          Sign In
        </h1>

        <p className="text-sm text-muted">
          Enter your email and password to sign in!
        </p>
      </div>

      <div>
        {error && (
          <p className="mb-3 text-sm text-danger">
            {error.includes("Invalid login credentials")
              ? "Incorrect email or password. Please try again."
              : error}
          </p>
        )}

        <form>
          <div className="space-y-5">
            <div>
              <Label>
                Email <span className="text-danger">*</span>
              </Label>

              <Input
                type="email"
                placeholder="info@gmail.com"
                defaultValue={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Label>
                Password <span className="text-danger">*</span>
              </Label>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  defaultValue={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer text-muted"
                >
                  {showPassword ? (
                    <EyeIcon className="fill-current" />
                  ) : (
                    <EyeCloseIcon className="fill-current" />
                  )}
                </span>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              isDisabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
