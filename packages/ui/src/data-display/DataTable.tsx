"use client";

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  type TableProps as ChakraTableProps,
} from "@chakra-ui/react";
import { EmptyState } from "../layout/EmptyState";
import { FileText } from "lucide-react";

export interface Column<T> {
  /** Unique identifier for the column */
  id: string;
  /** Header text */
  header: string;
  /** Accessor function to get cell value */
  accessor: (row: T) => React.ReactNode;
  /** Width of the column */
  width?: string | number;
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Text alignment */
  align?: "left" | "center" | "right";
}

export interface DataTableProps<T> extends Omit<ChakraTableProps, "children"> {
  /** Array of column definitions */
  columns: Column<T>[];
  /** Data to display */
  data: T[];
  /** Unique key accessor for each row */
  keyAccessor: (row: T) => string | number;
  /** Whether to show striped rows */
  striped?: boolean;
  /** Empty state title */
  emptyTitle?: string;
  /** Empty state description */
  emptyDescription?: string;
  /** Empty state action */
  emptyAction?: React.ReactNode;
  /** Whether the table is loading */
  isLoading?: boolean;
  /** Callback when a row is clicked */
  onRowClick?: (row: T) => void;
  /** Currently selected row key */
  selectedRowKey?: string | number;
}

/**
 * DataTable displays data in a tabular format with customizable columns.
 */
export function DataTable<T>({
  columns,
  data,
  keyAccessor,
  striped = false,
  emptyTitle = "No data",
  emptyDescription,
  emptyAction,
  isLoading = false,
  onRowClick,
  selectedRowKey,
  ...props
}: DataTableProps<T>) {
  if (!isLoading && data.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <TableContainer>
      <Table variant={striped ? "striped" : "simple"} {...props}>
        <Thead>
          <Tr>
            {columns.map((column) => (
              <Th
                key={column.id}
                width={column.width}
                textAlign={column.align || "left"}
              >
                {column.header}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {data.map((row) => {
            const rowKey = keyAccessor(row);
            const isSelected = selectedRowKey === rowKey;

            return (
              <Tr
                key={rowKey}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                cursor={onRowClick ? "pointer" : "default"}
                bg={isSelected ? "accent.subtle" : undefined}
                _hover={
                  onRowClick
                    ? { bg: isSelected ? "accent.muted" : "bg.subtle" }
                    : undefined
                }
              >
                {columns.map((column) => (
                  <Td key={column.id} textAlign={column.align || "left"}>
                    {column.accessor(row)}
                  </Td>
                ))}
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

DataTable.displayName = "DataTable";
