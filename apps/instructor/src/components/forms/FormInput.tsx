"use client";

import { FormControl, FormLabel, Input, FormErrorMessage, InputProps } from "@chakra-ui/react";
import { UseFormRegister, FieldError, RegisterOptions } from "react-hook-form";

interface FormInputProps extends Omit<InputProps, "name"> {
  name: string;
  label: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
  validation?: RegisterOptions;
}

export function FormInput({
  name,
  label,
  register,
  error,
  required = false,
  validation,
  ...inputProps
}: FormInputProps) {
  return (
    <FormControl isInvalid={!!error} isRequired={required}>
      <FormLabel>{label}</FormLabel>
      <Input {...register(name, validation)} {...inputProps} />
      <FormErrorMessage>{error?.message}</FormErrorMessage>
    </FormControl>
  );
}
