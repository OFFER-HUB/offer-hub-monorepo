import { AxiosError } from "axios";
import {
  DisputeResponse,
  EscrowUpdateResponse,
  TransactionResponse,
} from "../types/escrow.types";

export const isDisputeResponse = (data: unknown): data is DisputeResponse => {
  return (
    typeof data === "object" &&
    data !== null &&
    "status" in data &&
    "message" in data &&
    (data as DisputeResponse).status in ["SUCCESS", "ERROR"]
  );
};

export const isEscrowUpdateResponse = (
  data: unknown,
): data is EscrowUpdateResponse => {
  return (
    typeof data === "object" &&
    data !== null &&
    "status" in data &&
    "message" in data &&
    (data as EscrowUpdateResponse).status in ["SUCCESS", "ERROR"]
  );
};

export const isTransactionResponse = (
  data: unknown,
): data is TransactionResponse => {
  return (
    typeof data === "object" &&
    data !== null &&
    "status" in data &&
    "message" in data &&
    (data as TransactionResponse).status in ["SUCCESS", "ERROR"]
  );
};

export const isApiError = (error: unknown): error is AxiosError => {
  return error instanceof Error && "response" in error;
};

export const isErrorWithMessage = (
  error: unknown,
): error is { message: string } => {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  );
};

export const isProjectAttachment = (
  attachment: unknown,
): attachment is {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
} => {
  return (
    typeof attachment === "object" &&
    attachment !== null &&
    "id" in attachment &&
    "name" in attachment &&
    "url" in attachment &&
    "size" in attachment &&
    "type" in attachment
  );
};

export const isProjectMilestone = (
  milestone: unknown,
): milestone is {
  id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: string;
} => {
  return (
    typeof milestone === "object" &&
    milestone !== null &&
    "id" in milestone &&
    "title" in milestone &&
    "description" in milestone &&
    "amount" in milestone &&
    "dueDate" in milestone &&
    "status" in milestone
  );
};
