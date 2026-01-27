"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ExternalLink, 
  Copy, 
  Check,
  Shield 
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OnChainVerificationLinkProps {
  transactionHash?: string;
  blockchainExplorerUrl?: string;
  contractAddress?: string;
}

export function OnChainVerificationLink({ 
  transactionHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  blockchainExplorerUrl = "https://stellar.expert",
  contractAddress
}: OnChainVerificationLinkProps) {
  const [copied, setCopied] = useState(false);

  // Format hash to show first 6 and last 4 characters
  const formatHash = (hash: string) => {
    if (hash.length <= 10) return hash;
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transactionHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const explorerLink = contractAddress 
    ? `${blockchainExplorerUrl}/contract/${contractAddress}`
    : `${blockchainExplorerUrl}/tx/${transactionHash}`;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-indigo-100 p-2 flex-shrink-0">
          <Shield className="w-4 h-4 text-indigo-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-gray-900">
              On-Chain Verification
            </h4>
            <Badge 
              variant="secondary" 
              className="bg-green-50 text-green-700 border-green-200 text-xs"
            >
              Verified
            </Badge>
          </div>
          
          <p className="text-xs text-gray-600 mb-3">
            This project is recorded on the Stellar blockchain for transparency and security.
          </p>

          <div className="flex items-center gap-2">
            <code className="flex-1 min-w-0 text-xs bg-white px-3 py-2 rounded-lg border border-gray-200 text-gray-700 font-mono truncate">
              {formatHash(transactionHash)}
            </code>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="h-8 w-8 p-0 flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{copied ? "Copied!" : "Copy hash"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-8 w-8 p-0 flex-shrink-0"
                  >
                    <a 
                      href={explorerLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View on explorer</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnChainVerificationLink;
