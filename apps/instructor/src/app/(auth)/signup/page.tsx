"use client";

import Link from "next/link";
import { Button, Stack, useToast } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { authApi } from "@/lib/api";
import { FormInput, AuthLayout } from "@/components/forms";

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  hourlyRate: number;
  currency: string;
}

export default function SignupPage() {
  const toast = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      hourlyRate: 0,
      currency: "USD",
    },
  });

  const password = watch("password");

  const onSubmit = async (data: SignupFormData) => {
    try {
      const response = await authApi.signup({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        hourlyRate: data.hourlyRate,
        currency: data.currency,
      });

      localStorage.setItem("token", response.accessToken);

      toast({
        title: "Account created!",
        description: "Welcome to the Instructor Portal",
        status: "success",
        duration: 3000,
      });

      window.location.href = "/";
    } catch (error) {
      toast({
        title: "Signup failed",
        description:
          error instanceof Error ? error.message : "Could not create account",
        status: "error",
        duration: 5000,
      });
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join as an instructor"
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            style={{
              color: "var(--chakra-colors-primary-500)",
              fontWeight: 500,
            }}
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
        <Stack spacing={4}>
          <Stack direction="row" spacing={4}>
            <FormInput
              name="firstName"
              label="First Name"
              register={register}
              error={errors.firstName}
              placeholder="John"
              required
              validation={{
                required: "First name is required",
              }}
            />

            <FormInput
              name="lastName"
              label="Last Name"
              register={register}
              error={errors.lastName}
              placeholder="Doe"
              required
              validation={{
                required: "Last name is required",
              }}
            />
          </Stack>

          <FormInput
            name="email"
            label="Email"
            type="email"
            register={register}
            error={errors.email}
            placeholder="your@email.com"
            autoComplete="email"
            required
            validation={{
              required: "Email is required",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Email is invalid",
              },
            }}
          />

          <FormInput
            name="password"
            label="Password"
            type="password"
            register={register}
            error={errors.password}
            placeholder="••••••••"
            autoComplete="new-password"
            required
            validation={{
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            }}
          />

          <FormInput
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            register={register}
            error={errors.confirmPassword}
            placeholder="••••••••"
            autoComplete="new-password"
            required
            validation={{
              required: "Please confirm your password",
              validate: (value: string) =>
                value === password || "Passwords do not match",
            }}
          />

          <Stack direction="row" spacing={4}>
            <FormInput
              name="hourlyRate"
              label="Hourly Rate"
              type="number"
              register={register}
              error={errors.hourlyRate}
              placeholder="50"
              required
              validation={{
                required: "Hourly rate is required",
                min: {
                  value: 0,
                  message: "Hourly rate must be positive",
                },
              }}
            />

            <FormInput
              name="currency"
              label="Currency"
              register={register}
              error={errors.currency}
              placeholder="USD"
              required
              validation={{
                required: "Currency is required",
              }}
            />
          </Stack>

          <Button
            type="submit"
            colorScheme="primary"
            size="lg"
            width="full"
            isLoading={isSubmitting}
            loadingText="Creating account..."
          >
            Create Account
          </Button>
        </Stack>
      </form>
    </AuthLayout>
  );
}
