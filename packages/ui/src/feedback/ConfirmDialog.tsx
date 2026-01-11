"use client";

import { useRef } from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
  Button,
} from "@chakra-ui/react";

export interface ConfirmDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when the dialog is closed */
  onClose: () => void;
  /** Callback when the action is confirmed */
  onConfirm: () => void | Promise<void>;
  /** Dialog title */
  title: string;
  /** Dialog message/body */
  message: React.ReactNode;
  /** Text for the confirm button */
  confirmText?: string;
  /** Text for the cancel button */
  cancelText?: string;
  /** Tone/variant of the confirm button */
  confirmTone?: "primary" | "danger";
  /** Whether the confirm action is loading */
  isLoading?: boolean;
}

/**
 * ConfirmDialog is a modal dialog for confirming actions.
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmTone = "primary",
  isLoading = false,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  const handleConfirm = async () => {
    await onConfirm();
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent mx={4}>
          <AlertDialogHeader fontSize="lg" fontWeight="semibold">
            {title}
          </AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>{message}</AlertDialogBody>
          <AlertDialogFooter gap={3}>
            <Button
              ref={cancelRef}
              variant="ghost"
              onClick={onClose}
              isDisabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              colorScheme={confirmTone === "danger" ? "red" : "teal"}
              onClick={handleConfirm}
              isLoading={isLoading}
            >
              {confirmText}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}

ConfirmDialog.displayName = "ConfirmDialog";
