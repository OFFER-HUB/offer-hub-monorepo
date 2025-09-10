// Base NFT awarded interface
export interface NFTAwarded {
  id: string;
  user_id: string;
  nft_type: string;
  token_id_on_chain: string;
  minted_at: string;
}

// NFT creation DTO
export interface CreateNFTAwardedDTO {
  user_id: string;
  nft_type: string;
  token_id_on_chain: string;
}

// NFT with user information
export interface NFTAwardedWithUser extends NFTAwarded {
  user: {
    id: string;
    name?: string;
    username?: string;
    email?: string;
  };
}

// API Response interfaces
export interface NFTAwardedResponse {
  success: boolean;
  message: string;
  data?: NFTAwarded | NFTAwardedWithUser;
}

export interface NFTAwardedListResponse {
  success: boolean;
  message: string;
  data?: NFTAwardedWithUser[];
}

// Database table structure (for reference)
export interface NFTAwardedTable {
  id: string; // UUID primary key
  user_id: string; // UUID foreign key to users table
  nft_type: string; // TEXT NOT NULL
  token_id_on_chain: string; // TEXT NOT NULL
  minted_at: string; // TIMESTAMP DEFAULT NOW()
}
