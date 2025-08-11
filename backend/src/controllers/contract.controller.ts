import { Request, Response, NextFunction } from "express";
import { contractService } from "@/services/contract.service";
import { CreateContractDTO, UpdateContractDTO } from "@/types/contract.types";
import {
  UUID_REGEX,
  CONTRACT_TYPES,
  ESCROW_STATUSES,
  ACTIVE_ESCROW_STATUSES,
} from "@/utils/validation";
import { HTTP_STATUS } from "../types/api.type";
import {
  buildSuccessResponse,
  buildListResponse,
} from "../utils/responseBuilder";

export const createContractHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const contractData: CreateContractDTO = req.body;

    // Validate required fields
    const {
      contract_type,
      freelancer_id,
      client_id,
      contract_on_chain_id,
      amount_locked,
    } = contractData;

    if (
      !contract_type ||
      !freelancer_id ||
      !client_id ||
      !contract_on_chain_id ||
      amount_locked === undefined
    ) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message:
          "Missing required fields: contract_type, freelancer_id, client_id, contract_on_chain_id, amount_locked",
      });
      return;
    }

    // Validate contract type
    if (!CONTRACT_TYPES.includes(contract_type)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "contract_type must be 'project' or 'service'",
      });
      return;
    }

    // Validate amount
    if (amount_locked <= 0) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "amount_locked must be greater than 0",
      });
      return;
    }

    // Validate string fields are not empty
    if (contract_on_chain_id.trim().length === 0) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "contract_on_chain_id cannot be empty",
      });
      return;
    }

    const newContract = await contractService.createContract(contractData);

    res
      .status(HTTP_STATUS.CREATED)
      .json(buildSuccessResponse(newContract, "Contract created successfully"));
  } catch (error: any) {
    if (error.message === "Freelancer or client not found") {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Freelancer or client not found",
      });
      return;
    }

    if (error.message === "Freelancer and client cannot be the same user") {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Freelancer and client cannot be the same user",
      });
      return;
    }

    if (error.message.includes("is required for")) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
      return;
    }

    if (error.message.includes("Invalid")) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    next(error);
  }
};

export const getContractByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate UUID format
    if (!UUID_REGEX.test(id)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid contract ID format",
      });
      return;
    }

    const contract = await contractService.getContractById(id);

    if (!contract) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Contract not found",
      });
      return;
    }

    res
      .status(HTTP_STATUS.OK)
      .json(buildSuccessResponse(contract, "Contract retrieved successfully"));
  } catch (error: any) {
    if (error.message === "Invalid contract ID format") {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid contract ID format",
      });
      return;
    }

    next(error);
  }
};

export const updateContractStatusHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdateContractDTO = req.body;
    const userId = req.body.user_id; // In a real app, this would come from auth middleware

    // Validate UUID format
    if (!UUID_REGEX.test(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid contract ID format",
      });
      return;
    }

    // Validate required fields
    const { escrow_status } = updateData;

    if (!escrow_status) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "escrow_status is required",
      });
      return;
    }

    // Validate escrow status
    if (!ACTIVE_ESCROW_STATUSES.includes(escrow_status)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "escrow_status must be 'funded', 'released', or 'disputed'",
      });
      return;
    }

    const updatedContract = await contractService.updateContractStatus(
      id,
      updateData,
      userId
    );

    if (!updatedContract) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Contract not found",
      });
      return;
    }

    res
      .status(HTTP_STATUS.OK)
      .json(
        buildSuccessResponse(
          updatedContract,
          "Contract status updated successfully"
        )
      );
  } catch (error: any) {
    if (error.message === "Invalid contract ID format") {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid contract ID format",
      });
      return;
    }

    if (error.message.includes("Invalid status transition")) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
      return;
    }

    if (error.message.includes("Only the")) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: error.message,
      });
      return;
    }

    next(error);
  }
};

export const getContractsByUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;

    // Validate UUID format
    if (!UUID_REGEX.test(userId)) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
      return;
    }

    const contracts = await contractService.getContractsByUser(userId);

    res
      .status(HTTP_STATUS.OK)
      .json(
        buildListResponse(contracts, "User contracts retrieved successfully")
      );
  } catch (error: any) {
    if (error.message === "Invalid user ID format") {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid user ID format",
      });
      return;
    }

    next(error);
  }
};

export const getContractsByStatusHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.params;

    if (!status || !ESCROW_STATUSES.includes(status as any)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message:
          "Valid status is required: pending, funded, released, or disputed",
      });
      return;
    }

    const contracts = await contractService.getContractsByStatus(status);

    res
      .status(HTTP_STATUS.OK)
      .json(
        buildListResponse(
          contracts,
          "Contracts by status retrieved successfully"
        )
      );
  } catch (error) {
    next(error);
  }
};
