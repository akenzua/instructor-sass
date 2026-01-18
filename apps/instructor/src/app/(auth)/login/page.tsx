"use client";

import Link from "next/link";
import { Button, Stack, useToast } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/lib/auth";
import { FormInput, AuthLayout } from "@/components/forms";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast({
        title: "Welcome back!",
        status: "success",
        duration: 3000,
      });
      window.location.href = "/";
    } catch (error) {
      toast({
        title: "Login failed",
        description:
          error instanceof Error ? error.message : "Invalid credentials",
        status: "error",
        duration: 5000,
      });
    }
  };

  return (
    <AuthLayout
      title="Instructor Portal"
      subtitle="Sign in to manage your lessons"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            style={{
              color: "var(--chakra-colors-primary-500)",
              fontWeight: 500,
            }}
          >
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
        <Stack spacing={4}>
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
            autoComplete="current-password"
            required
            validation={{
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            }}
          />

          <Button
            type="submit"
            colorScheme="primary"
            size="lg"
            width="full"
            isLoading={isSubmitting}
            loadingText="Signing in..."
          >
            Sign In
          </Button>
        </Stack>
      </form>
    </AuthLayout>
  );
}
