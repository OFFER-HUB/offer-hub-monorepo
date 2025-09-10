# Rating and Feedback System Integration Guide

## Overview

This document describes the integration between the new rating-contract and the existing reputation-nft-contract, providing a comprehensive rating and feedback system for the Offer Hub platform.

## Architecture

```
┌─────────────────────┐    ┌──────────────────────┐
│   Rating Contract   │────│ Reputation Contract  │
└─────────────────────┘    └──────────────────────┘
           │                           │
           │                           │
           ▼                           ▼
┌─────────────────────┐    ┌──────────────────────┐
│  Rating Storage     │    │    NFT Storage       │
│  • Ratings          │    │  • Achievement NFTs  │
│  • Feedback         │    │  • Reputation Data   │
│  • Statistics       │    │  • User Badges       │
│  • Restrictions     │    │  • Milestone Tokens  │
└─────────────────────┘    └──────────────────────┘
```

## Contract Integration

### 1. Rating Contract → Reputation Contract

The rating contract automatically triggers reputation updates:

```rust
// When user achieves rating milestones
pub fn update_reputation(env: Env, caller: Address, user: Address) -> Result<(), Error> {
    let stats = get_user_rating_stats(&env, &user)?;

    // Award achievement NFTs based on rating performance
    if stats.average_rating >= 480 && stats.total_ratings >= 20 {
        // Triggers reputation contract to mint top-rated NFT
        reputation_contract.mint_rating_achievement(
            &env, &caller, &user,
            "top_rated_professional",
            "4.8+ average with 20+ ratings"
        )?;
    }
}
```

### 2. New Reputation Contract Functions

Enhanced the reputation contract with rating-specific functions:

```rust
// New functions added to reputation-nft-contract
pub fn mint_rating_achievement(env, caller, to, achievement_type, rating_data) -> Result<(), Error>
pub fn get_user_achievements(env, user) -> Result<Vec<TokenId>, Error>
pub fn update_reputation_score(env, caller, user, rating_average, total_ratings) -> Result<(), Error>
```

## Achievement System

### Automatic NFT Minting

The system automatically mints achievement NFTs when users reach specific milestones:

| Achievement       | Requirement                | NFT Type                 |
| ----------------- | -------------------------- | ------------------------ |
| First Five Star   | First 5-star rating        | `first_five_star`        |
| Ten Reviews       | 10+ ratings received       | `ten_ratings`            |
| Top Rated Pro     | 4.8+ avg, 20+ ratings      | `top_rated_professional` |
| Consistency Award | Sustained high performance | `rating_consistency`     |
| Most Improved     | Significant improvement    | `improvement_award`      |

### Achievement Metadata

Each achievement NFT includes:

- **Name**: Human-readable achievement name
- **Description**: Achievement criteria and date earned
- **URI**: IPFS link to achievement artwork
- **Rarity**: Based on percentage of users who achieved it

## Rating-Based Privileges and Restrictions

### Privilege Levels

1. **Basic Users** (Any ratings)
   - Standard platform access
   - Basic support

2. **Good Performers** (3.5+ average, 5+ ratings)
   - Priority customer support
   - Enhanced profile visibility
   - Featured in search results

3. **Excellent Performers** (4.0+ average, 10+ ratings)
   - Reduced platform fees (10% discount)
   - Premium badge display
   - Featured listings

4. **Top Rated** (4.8+ average, 20+ ratings)
   - Maximum fee discount (20%)
   - Top-rated professional badge
   - Premium search placement
   - Access to exclusive projects

### Restriction System

1. **Warning Level** (Below 3.0 average)
   - Warning badges displayed
   - Reduced search visibility
   - Limited bidding on premium projects

2. **Restricted Level** (Below 2.5 average)
   - Cannot post new work contracts
   - Cannot bid on high-value projects
   - Increased platform fees (10% penalty)
   - Must complete improvement plan

## Implementation Timeline

### Phase 1: Core Rating System ✅

- [x] Basic rating submission and storage
- [x] Rating statistics calculation
- [x] User feedback collection
- [x] Input validation and spam prevention

### Phase 2: Integration with Reputation ✅

- [x] Achievement NFT minting integration
- [x] Cross-contract communication
- [x] Reputation score updates
- [x] Milestone-based rewards

### Phase 3: Advanced Features ✅

- [x] Feedback moderation system
- [x] Rating-based restrictions and privileges
- [x] Incentive and rewards system
- [x] Platform analytics and insights

### Phase 4: Frontend Integration (Next Steps)

- [ ] Rating submission UI components
- [ ] User dashboard with statistics
- [ ] Achievement display system
- [ ] Moderation interface for admins

## API Usage Examples

### Submit a Rating

```typescript
// Frontend integration example
const submitRating = async (
  raterAddress: string,
  ratedUserAddress: string,
  contractId: string,
  rating: number,
  feedback: string,
  category: string,
) => {
  const result = await ratingContract.submit_rating({
    caller: raterAddress,
    rated_user: ratedUserAddress,
    contract_id: contractId,
    rating: rating,
    feedback: feedback,
    work_category: category,
  });

  return result;
};
```

### Get User Rating Data

```typescript
const getUserRatingProfile = async (userAddress: string) => {
  const stats = await ratingContract.get_user_rating_stats({
    user: userAddress,
  });

  const achievements = await reputationContract.get_user_achievements({
    user: userAddress,
  });

  const privileges = await ratingContract.get_user_privileges({
    user: userAddress,
  });

  return {
    stats,
    achievements,
    privileges,
  };
};
```

### Check and Claim Incentives

```typescript
const claimAvailableIncentives = async (userAddress: string) => {
  const incentives = await ratingContract.check_rating_incentives({
    user: userAddress,
  });

  for (const incentive of incentives) {
    await ratingContract.claim_incentive_reward({
      caller: userAddress,
      incentive_type: incentive,
    });
  }
};
```

## Smart Contract Addresses

After deployment, update these addresses in your frontend configuration:

```typescript
const CONTRACT_ADDRESSES = {
  rating: "CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  reputation: "CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  userRegistry: "CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
};
```

## Event Listening

Listen for contract events to update UI in real-time:

```typescript
// Listen for rating submissions
ratingContract.events.RatingSubmitted.subscribe((event) => {
  updateUserProfile(event.rated_user);
  refreshStatistics();
});

// Listen for achievement unlocks
reputationContract.events.AchievementMinted.subscribe((event) => {
  showAchievementNotification(event.to, event.nft_type);
});
```

## Security Considerations

1. **Authorization**: All rating submissions require caller authentication
2. **Anti-Spam**: Rate limiting prevents abuse and manipulation
3. **Data Integrity**: Immutable rating records with event logging
4. **Moderation**: Community reporting with admin oversight
5. **Fair Play**: Prevents self-rating and duplicate submissions

## Testing Strategy

### Unit Tests

- Rating submission validation
- Statistical calculations
- Privilege assignment logic
- Restriction enforcement
- Achievement criteria

### Integration Tests

- Cross-contract communication
- NFT minting triggers
- Event emission verification
- End-to-end rating workflows

### Load Testing

- High-volume rating submissions
- Concurrent user interactions
- Platform analytics performance
- Storage optimization

## Monitoring and Analytics

Key metrics to track:

- Total ratings submitted
- Average platform rating
- User engagement rates
- Achievement unlock frequency
- Moderation activity levels
- Restriction application rates

## Future Enhancements

1. **Machine Learning Integration**
   - Fraud detection algorithms
   - Rating prediction models
   - Quality assessment automation

2. **Cross-Platform Integration**
   - Import ratings from external platforms
   - Export reputation data
   - Universal reputation scores

3. **Advanced Analytics**
   - Predictive rating trends
   - User behavior analysis
   - Market insights dashboard

4. **Mobile SDK**
   - Native mobile rating submission
   - Push notifications for achievements
   - Offline rating collection

## Support and Maintenance

- **Documentation**: Keep this guide updated with contract changes
- **Version Control**: Tag releases and maintain backwards compatibility
- **Bug Reports**: Use GitHub issues for tracking problems
- **Feature Requests**: Community input via discussion forums

---

For technical support or questions about implementation, please refer to the contract documentation or create an issue in the project repository.
