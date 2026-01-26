import {
  Contract,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Keypair,
  Account,
  scValToNative,
  nativeToScVal,
  Address,
  xdr,
  rpc,
} from "@stellar/stellar-sdk";

import dotenv from "dotenv";

dotenv.config();

export interface TaskRecord {
  task_id: number;
  project_id: string;
  freelancer_id: string;
  client_id: string;
  completed: boolean;
  timestamp: number;
}

export interface RecordTaskResult {
  transactionHash: string;
  taskId: number;
  timestamp: number;
  ledger: number;
}

export class TaskRecordService {
  private readonly contractAddress: string;
  private readonly adminKeypair: Keypair;
  private readonly rpcUrl: string;
  private readonly networkPassphrase: string;
  private readonly server: rpc.Server;
  private contract: Contract;

  constructor() {
    this.contractAddress =
      process.env.CONTRACT_ADDRESS ||
      "CDZXIUP53QYH23AZSQZIDMQKD7QPDLTJMISC3X6NNT4BUUMQ4UC4UYZ7";
    const adminSecret = (
      process.env.SECRET ||
      process.env.STELLAR_ADMIN_SECRET_KEY ||
      "SAO2XTN656P3TGVGQFUMYVH4DYT44EEQW6L2ITWXVNMAHXIUP6H4DQRZ"
    ).trim();
    this.rpcUrl = this.rpcUrl =
      process.env.SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";

    const network = process.env.SOROBAN_NETWORK || "testnet";

    this.networkPassphrase =
      network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;

    if (!adminSecret) {
      throw new Error("SOROBAN_ADMIN_SECRET missing");
    }

    if (!this.contractAddress) {
      throw new Error("TASK_RECORD_CONTRACT_ADDRESS missing");
    }

    try {
      // Validate key format
      if (adminSecret.length !== 56 || !adminSecret.startsWith("S")) {
        console.error("❌ Invalid admin secret key format");
        console.error("   Length:", adminSecret.length, "(expected: 56)");
        console.error("   Starts with:", adminSecret[0], "(expected: S)");
        throw new Error("Invalid Stellar admin secret key format");
      }

      this.adminKeypair = Keypair.fromSecret(adminSecret);
    } catch (error: any) {
      console.error("❌ Failed to create Keypair from admin secret");
      console.error("   Error:", error.message);
      console.error(
        "   Key preview:",
        adminSecret.substring(0, 5) +
          "..." +
          adminSecret.substring(adminSecret.length - 5),
      );
      throw error;
    }
    this.server = new rpc.Server(this.rpcUrl);

    this.contract = new Contract(this.contractAddress);

    console.log("✅ TaskRecordService Initialized");
    console.log("Contract:", this.contractAddress);
    console.log("RPC:", this.rpcUrl);
  }

  /**
   * Initialize the contract with admin address
   * This should only be called once during contract deployment
   */
  async initialize(): Promise<{ transactionHash: string; ledger: number }> {
    const account = await this.getAccount(this.adminKeypair.publicKey());

    const adminAddress = Address.fromString(this.adminKeypair.publicKey());
    const adminScVal = adminAddress.toScVal();

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(this.contract.call("initialize", adminScVal))
      .setTimeout(30)
      .build();

    const sim = await this.server.simulateTransaction(tx);

    if (rpc.Api.isSimulationError(sim)) {
      throw new Error(`Initialization simulation failed: ${sim.error}`);
    }

    const preparedTx = rpc.assembleTransaction(tx, sim).build();

    preparedTx.sign(this.adminKeypair);

    const send = await this.server.sendTransaction(preparedTx);

    if (send.status !== "PENDING") {
      throw new Error("Transaction submission failed");
    }

    const result = await this.pollTransactionStatus(send.hash);

    if (result.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
      throw new Error("Transaction execution failed");
    }

    console.log("✅ Contract initialized successfully");
    return {
      transactionHash: send.hash,
      ledger: result.ledger,
    };
  }

  /**
   * Record a task outcome on the blockchain
   */
  async recordTaskOutcome(
    projectId: string,
    freelancerId: string,
    clientId: string,
    completed: boolean,
  ): Promise<RecordTaskResult> {
    const account = await this.getAccount(this.adminKeypair.publicKey());

    const projectIdScVal = nativeToScVal(projectId, { type: "string" });
    const freelancerIdScVal = nativeToScVal(freelancerId, { type: "string" });
    const clientIdScVal = nativeToScVal(clientId, { type: "string" });
    const completedScVal = nativeToScVal(completed, { type: "bool" });

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        this.contract.call(
          "record_task_outcome",
          projectIdScVal,
          freelancerIdScVal,
          clientIdScVal,
          completedScVal,
        ),
      )
      .setTimeout(30)
      .build();

    const sim = await this.server.simulateTransaction(tx);

    if (rpc.Api.isSimulationError(sim)) {
      throw new Error(`Simulation failed: ${sim.error}`);
    }

    const preparedTx = rpc.assembleTransaction(tx, sim).build();

    preparedTx.sign(this.adminKeypair);

    const send = await this.server.sendTransaction(preparedTx);

    if (send.status !== "PENDING") {
      throw new Error("Transaction submission failed");
    }

    const result = await this.pollTransactionStatus(send.hash);

    if (result.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
      throw new Error("Transaction execution failed");
    }

    // Extract task_id from the result
    const taskId = scValToNative(sim.result!.retval);

    console.log("✅ Task recorded successfully:", {
      taskId,
      projectId,
      freelancerId,
      clientId,
      completed,
    });

    return {
      transactionHash: send.hash,
      taskId: Number(taskId),
      timestamp: Date.now(),
      ledger: result.ledger,
    };
  }

  /**
   * Get all task records for a specific freelancer
   */
  async getTasksForFreelancer(freelancerId: string): Promise<TaskRecord[]> {
    const account = await this.getAccount(this.adminKeypair.publicKey());

    const freelancerIdScVal = nativeToScVal(freelancerId, { type: "string" });

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        this.contract.call("get_tasks_for_freelancer", freelancerIdScVal),
      )
      .setTimeout(30)
      .build();

    const sim = await this.server.simulateTransaction(tx);

    if (rpc.Api.isSimulationError(sim)) {
      throw new Error(`Simulation failed: ${sim.error}`);
    }

    const result = scValToNative(sim.result!.retval);

    // Convert the result to TaskRecord array
    const tasks: TaskRecord[] = result.map((task: any) => ({
      task_id: Number(task.task_id),
      project_id: task.project_id,
      freelancer_id: task.freelancer_id,
      client_id: task.client_id,
      completed: task.completed,
      timestamp: Number(task.timestamp),
    }));

    return tasks;
  }

  /**
   * Get all task records for a specific client
   */
  async getTasksForClient(clientId: string): Promise<TaskRecord[]> {
    const account = await this.getAccount(this.adminKeypair.publicKey());

    const clientIdScVal = nativeToScVal(clientId, { type: "string" });

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(this.contract.call("get_tasks_for_client", clientIdScVal))
      .setTimeout(30)
      .build();

    const sim = await this.server.simulateTransaction(tx);

    if (rpc.Api.isSimulationError(sim)) {
      throw new Error(`Simulation failed: ${sim.error}`);
    }

    const result = scValToNative(sim.result!.retval);

    // Convert the result to TaskRecord array
    const tasks: TaskRecord[] = result.map((task: any) => ({
      task_id: Number(task.task_id),
      project_id: task.project_id,
      freelancer_id: task.freelancer_id,
      client_id: task.client_id,
      completed: task.completed,
      timestamp: Number(task.timestamp),
    }));

    return tasks;
  }

  /**
   * Get statistics for a freelancer
   */
  async getFreelancerStats(freelancerId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    successRate: number;
  }> {
    const tasks = await this.getTasksForFreelancer(freelancerId);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed).length;
    const failedTasks = tasks.filter((t) => !t.completed).length;
    const successRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      totalTasks,
      completedTasks,
      failedTasks,
      successRate,
    };
  }

  /**
   * Get statistics for a client
   */
  async getClientStats(clientId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    completionRate: number;
  }> {
    const tasks = await this.getTasksForClient(clientId);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed).length;
    const failedTasks = tasks.filter((t) => !t.completed).length;
    const completionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      totalTasks,
      completedTasks,
      failedTasks,
      completionRate,
    };
  }

  /**
   * Record a task outcome on the blockchain (wrapper method for service compatibility)
   */
  async recordTask(taskData: {
    project_id: string;
    freelancer_id: string;
    client_id: string;
    completed: boolean;
    outcome_description: string;
  }): Promise<RecordTaskResult> {
    return this.recordTaskOutcome(
      taskData.project_id,
      taskData.freelancer_id,
      taskData.client_id,
      taskData.completed,
    );
  }

  /**
   * Get account from Stellar network
   */
  private async getAccount(publicKey: string): Promise<Account> {
    const acc: any = await this.server.getAccount(publicKey);
    return new Account(publicKey, acc.sequence);
  }

  /**
   * Poll transaction status until it's confirmed or timeout
   */
  private async pollTransactionStatus(
    hash: string,
    maxAttempts = 15,
    interval = 3000,
  ): Promise<any> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const res = await this.server.getTransaction(hash);

      if (res.status !== rpc.Api.GetTransactionStatus.NOT_FOUND) {
        return res;
      }

      await this.sleep(interval);
      attempts++;
    }

    throw new Error("Transaction confirmation timeout");
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
