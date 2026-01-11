"use client";

import { useState } from "react";
import {
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  InputGroup,
  Input,
  InputRightElement,
  IconButton,
  useDisclosure,
} from "@chakra-ui/react";
import { DayPicker } from "react-day-picker";
import { format, parse, isValid } from "date-fns";
import { Calendar, X } from "lucide-react";

export interface DatePickerFieldProps {
  /** Currently selected date */
  value?: Date;
  /** Callback when date changes */
  onChange?: (date: Date | undefined) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Date format string (date-fns format) */
  dateFormat?: string;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Disabled dates */
  disabledDates?: Date[];
  /** Whether the input is disabled */
  isDisabled?: boolean;
  /** Whether the input is read-only */
  isReadOnly?: boolean;
  /** Whether the input is invalid */
  isInvalid?: boolean;
  /** Whether to show the clear button */
  isClearable?: boolean;
  /** Size of the input */
  size?: "sm" | "md";
}

const dayPickerStyles = `
  .rdp {
    --rdp-cell-size: 36px;
    --rdp-accent-color: var(--chakra-colors-accent-500);
    --rdp-background-color: var(--chakra-colors-accent-100);
    margin: 0;
  }
  .rdp-day_selected:not([disabled]) {
    background-color: var(--rdp-accent-color);
    color: white;
  }
  .rdp-day_selected:hover:not([disabled]) {
    background-color: var(--chakra-colors-accent-600);
  }
  .rdp-day:hover:not([disabled]):not(.rdp-day_selected) {
    background-color: var(--chakra-colors-bg-subtle);
  }
  .rdp-button:focus-visible {
    outline: 2px solid var(--rdp-accent-color);
    outline-offset: 2px;
  }
`;

/**
 * DatePickerField provides a date picker using react-day-picker styled for Chakra UI.
 */
export function DatePickerField({
  value,
  onChange,
  placeholder = "Select date",
  dateFormat = "MMM d, yyyy",
  minDate,
  maxDate,
  disabledDates,
  isDisabled,
  isReadOnly,
  isInvalid,
  isClearable = true,
  size = "md",
}: DatePickerFieldProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [inputValue, setInputValue] = useState(
    value ? format(value, dateFormat) : ""
  );

  const handleDaySelect = (date: Date | undefined) => {
    if (date) {
      setInputValue(format(date, dateFormat));
      onChange?.(date);
    }
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (!newValue) {
      onChange?.(undefined);
      return;
    }

    const parsed = parse(newValue, dateFormat, new Date());
    if (isValid(parsed)) {
      onChange?.(parsed);
    }
  };

  const handleClear = () => {
    setInputValue("");
    onChange?.(undefined);
  };

  const disabled = [
    ...(disabledDates || []),
    ...(minDate ? [{ before: minDate }] : []),
    ...(maxDate ? [{ after: maxDate }] : []),
  ];

  return (
    <>
      <style>{dayPickerStyles}</style>
      <Popover
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        placement="bottom-start"
        isLazy
      >
        <PopoverTrigger>
          <InputGroup size={size}>
            <Input
              value={inputValue}
              onChange={handleInputChange}
              placeholder={placeholder}
              isDisabled={isDisabled}
              isReadOnly={isReadOnly}
              isInvalid={isInvalid}
              pr={isClearable && value ? "4.5rem" : "2.5rem"}
            />
            <InputRightElement
              width={isClearable && value ? "4.5rem" : "auto"}
              justifyContent="flex-end"
              pr={2}
            >
              {isClearable && value && (
                <IconButton
                  aria-label="Clear date"
                  icon={<X size={14} />}
                  size="xs"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  mr={1}
                />
              )}
              <Box color="fg.muted">
                <Calendar size={size === "sm" ? 14 : 16} />
              </Box>
            </InputRightElement>
          </InputGroup>
        </PopoverTrigger>
        <PopoverContent width="auto" p={0}>
          <PopoverBody p={3}>
            <DayPicker
              mode="single"
              selected={value}
              onSelect={handleDaySelect}
              disabled={disabled}
              defaultMonth={value || new Date()}
            />
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </>
  );
}

DatePickerField.displayName = "DatePickerField";
