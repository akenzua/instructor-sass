"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Button,
  Stack,
  Heading,
  Text,
  Divider,
  useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { authApi } from "@/lib/api";
import { FormInput, AuthLayout } from "@/components/forms";

interface SchoolSignupFormData {
  // School info
  schoolName: string;
  schoolEmail: string;
  schoolPhone: string;
  businessRegistrationNumber: string;
  addressLine1: string;
  addressCity: string;
  addressPostcode: string;
  // Admin personal info
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

export default function SchoolSignupPage() {
  const toast = useToast();
  const [step, setStep] = useState<1 | 2>(1);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<SchoolSignupFormData>({
    defaultValues: {
      schoolName: "",
      schoolEmail: "",
      schoolPhone: "",
      businessRegistrationNumber: "",
      addressLine1: "",
      addressCity: "",
      addressPostcode: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
    },
  });

  const password = watch("password");

  const handleNext = async () => {
    const valid = await trigger([
      "schoolName",
      "schoolEmail",
    ]);
    if (valid) setStep(2);
  };

  const onSubmit = async (data: SchoolSignupFormData) => {
    try {
      const response = await authApi.schoolSignup({
        schoolName: data.schoolName,
        schoolEmail: data.schoolEmail,
        schoolPhone: data.schoolPhone || undefined,
        businessRegistrationNumber:
          data.businessRegistrationNumber || undefined,
        address: {
          line1: data.addressLine1 || undefined,
          city: data.addressCity || undefined,
          postcode: data.addressPostcode || undefined,
        },
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
      });

      localStorage.setItem("token", response.accessToken);

      toast({
        title: "School registered!",
        description: "Welcome to the Instructor Portal",
        status: "success",
        duration: 3000,
      });

      window.location.href = "/";
    } catch (error) {
      toast({
        title: "Registration failed",
        description:
          error instanceof Error ? error.message : "Could not register school",
        status: "error",
        duration: 5000,
      });
    }
  };

  return (
    <AuthLayout
      title="Register Your School"
      subtitle="Create a driving school account"
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
          {" | "}
          <Link
            href="/signup"
            style={{
              color: "var(--chakra-colors-primary-500)",
              fontWeight: 500,
            }}
          >
            Register as Solo Instructor
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
        {step === 1 && (
          <Stack spacing={4}>
            <Heading size="sm" color="text.muted">
              Step 1: School Details
            </Heading>

            <FormInput
              name="schoolName"
              label="School Name"
              register={register}
              error={errors.schoolName}
              placeholder="ABC Driving School"
              required
              validation={{ required: "School name is required" }}
            />

            <FormInput
              name="schoolEmail"
              label="School Email"
              type="email"
              register={register}
              error={errors.schoolEmail}
              placeholder="info@school.com"
              required
              validation={{
                required: "School email is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Email is invalid",
                },
              }}
            />

            <FormInput
              name="schoolPhone"
              label="School Phone"
              register={register}
              error={errors.schoolPhone}
              placeholder="020 1234 5678"
            />

            <FormInput
              name="businessRegistrationNumber"
              label="Business Registration Number"
              register={register}
              error={errors.businessRegistrationNumber}
              placeholder="Optional"
            />

            <Divider />
            <Text fontSize="sm" color="text.muted" fontWeight="medium">
              Address
            </Text>

            <FormInput
              name="addressLine1"
              label="Address"
              register={register}
              error={errors.addressLine1}
              placeholder="123 High Street"
            />

            <Stack direction="row" spacing={4}>
              <FormInput
                name="addressCity"
                label="City"
                register={register}
                error={errors.addressCity}
                placeholder="London"
              />
              <FormInput
                name="addressPostcode"
                label="Postcode"
                register={register}
                error={errors.addressPostcode}
                placeholder="SW1A 1AA"
              />
            </Stack>

            <Button
              colorScheme="primary"
              size="lg"
              width="full"
              onClick={handleNext}
            >
              Next: Admin Details
            </Button>
          </Stack>
        )}

        {step === 2 && (
          <Stack spacing={4}>
            <Heading size="sm" color="text.muted">
              Step 2: Admin Account
            </Heading>

            <Stack direction="row" spacing={4}>
              <FormInput
                name="firstName"
                label="First Name"
                register={register}
                error={errors.firstName}
                placeholder="John"
                required
                validation={{ required: "First name is required" }}
              />
              <FormInput
                name="lastName"
                label="Last Name"
                register={register}
                error={errors.lastName}
                placeholder="Doe"
                required
                validation={{ required: "Last name is required" }}
              />
            </Stack>

            <FormInput
              name="email"
              label="Your Email"
              type="email"
              register={register}
              error={errors.email}
              placeholder="you@email.com"
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
              name="phone"
              label="Your Phone"
              register={register}
              error={errors.phone}
              placeholder="07700 900000"
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
                  value: 8,
                  message: "Password must be at least 8 characters",
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
              <Button
                variant="outline"
                size="lg"
                width="full"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                type="submit"
                colorScheme="primary"
                size="lg"
                width="full"
                isLoading={isSubmitting}
                loadingText="Creating school..."
              >
                Register School
              </Button>
            </Stack>
          </Stack>
        )}
      </form>
    </AuthLayout>
  );
}
