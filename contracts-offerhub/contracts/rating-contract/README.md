# Rating Contract

A comprehensive rating and feedback system for the Offer Hub platform that integrates with the reputation NFT system to provide transparent, tamper-proof user ratings and feedback.

## Features

### Core Rating System

- ⭐ Submit ratings (1-5 stars) for completed work contracts
- 📝 Provide detailed feedback with each rating
- 🔒 Prevent duplicate ratings per contract
- ✅ Input validation and spam prevention
- 📊 Real-time rating statistics and analytics

### User Reputation Management

- 📈 Automatic calculation of average ratings
- 📋 Detailed rating breakdowns (5-star, 4-star, etc.)
- 🎯 Rating trends and performance analysis
- 🏆 Achievement eligibility tracking
- 🔗 Integration with reputation NFT contract

### Feedback Moderation System

- 🚨 Community-driven feedback reporting
- 👮 Moderator approval/removal system
- 🤖 Automated content moderation
- 📝 Moderation history and audit trails
- ⚖️ Fair dispute resolution processes

### Rating-Based Restrictions and Privileges

- 🚫 Automatic restrictions for poor performers
- ⚠️ Warning system for declining ratings
- 🌟 Premium privileges for top-rated users
- 💰 Fee adjustments based on performance
- 📱 Enhanced visibility for excellent performers

### Incentive and Rewards System

- 🎁 Achievement-based NFT rewards
- 🏅 Milestone recognition (10, 50, 100+ ratings)
- 💎 Special badges for top performers
- 🎯 Seasonal and limited-time incentives
- 🔄 Cross-contract reputation building

### Analytics and Insights

- 📊 Platform-wide rating analytics
- 📈 User performance trends
- 🎲 Category-specific rating analysis
- 🔍 Fraud detection and prevention
- 📋 Comprehensive reporting system

## Smart Contract Interface

### Core Functions

#### `init(admin: Address)`

Initialize the rating contract with an administrator.

#### `submit_rating(caller, rated_user, contract_id, rating, feedback, work_category)`

Submit a rating and feedback for completed work.

- `rating`: 1-5 star rating
- `feedback`: Text feedback (max 1000 characters)
- `work_category`: Category of work performed

#### `get_user_rating_stats(user: Address) -> RatingStats`

Get comprehensive rating statistics for a user.

#### `get_user_rating_data(user: Address) -> UserRatingData`

Get detailed rating data including trends and achievements.

### Moderation Functions

#### `report_feedback(caller, feedback_id, reason)`

Report inappropriate feedback for moderation.

#### `moderate_feedback(caller, feedback_id, action, reason)`

Moderate reported feedback (admin/moderator only).

### Incentive Functions

#### `check_rating_incentives(user: Address) -> Vec<String>`

Check available incentives for a user.

#### `claim_incentive_reward(caller, incentive_type)`

Claim available incentive rewards.

### Admin Functions

#### `add_moderator(admin, moderator)`

Add a new moderator (admin only).

#### `set_rating_threshold(admin, threshold_type, value)`

Set rating thresholds for restrictions/privileges.

## Rating Statistics

The contract tracks comprehensive statistics for each user:

```rust
struct RatingStats {
    user: Address,
    total_ratings: u32,
    average_rating: u32,  // Multiplied by 100 for precision
    five_star_count: u32,
    four_star_count: u32,
    three_star_count: u32,
    two_star_count: u32,
    one_star_count: u32,
    last_updated: u64,
}
```

## Privilege System

Users earn privileges based on their rating performance:

### Basic (All users with ratings)

- Basic platform access
- Standard support

### Good Performers (3.5+ average, 5+ ratings)

- Priority support
- Enhanced profile visibility

### Excellent Performers (4.0+ average, 10+ ratings)

- Featured listings
- Badge display
- Reduced platform fees

### Top Rated (4.8+ average, 20+ ratings)

- Top-rated badge
- Premium visibility boost
- Lowest platform fees
- Priority in search results

## Restriction System

Users with poor ratings face restrictions:

### Warning Level (Below 3.0 average)

- Warning badges displayed
- Limited bidding capabilities
- Reduced search visibility

### Restricted Level (Below 2.5 average)

- Cannot post new work
- Cannot bid on premium projects
- Increased platform fees
- Requires improvement plan

## Achievement System

Automatic NFT rewards for milestones:

- **First Five Star**: First 5-star rating received
- **Ten Reviews**: 10+ ratings with good average
- **Fifty Reviews**: 50+ ratings milestone
- **Top Rated Professional**: 4.8+ average with 20+ ratings
- **Consistency Award**: Maintained high ratings over time
- **Most Improved**: Significant rating improvements

## Integration with Reputation Contract

The rating contract integrates seamlessly with the reputation NFT contract:

1. **Automatic Achievement Minting**: High-performing users automatically receive NFT achievements
2. **Cross-Contract Reputation**: Rating data influences NFT metadata and rarity
3. **Unified Reputation Score**: Combined rating and NFT data for comprehensive reputation
4. **Achievement Unlocks**: Rating milestones unlock special NFT minting opportunities

## Security Features

- **Anti-Manipulation**: Prevents self-rating and duplicate ratings
- **Spam Prevention**: Rate limiting and pattern detection
- **Content Moderation**: Automated and manual content filtering
- **Admin Controls**: Secure admin functions with proper authorization
- **Data Integrity**: Immutable rating records with event logging

## Events

The contract emits events for all major operations:

- `RatingSubmitted`
- `FeedbackSubmitted`
- `StatsUpdated`
- `FeedbackReported`
- `FeedbackModerated`
- `RestrictionApplied`
- `PrivilegeGranted`
- `IncentiveClaimed`
- `AchievementEarned`

## Usage Examples

### Submit a Rating

```rust
let rating = 5u8;
let feedback = String::from_str(&env, "Excellent work, delivered on time!");
let work_category = String::from_str(&env, "web_development");

contract.submit_rating(
    &rater_address,
    &freelancer_address,
    &contract_id,
    &rating,
    &feedback,
    &work_category
);
```

### Check User Statistics

```rust
let stats = contract.get_user_rating_stats(&user_address);
let average = stats.average_rating as f64 / 100.0; // Convert back to decimal
```

### Claim Incentives

```rust
let incentives = contract.check_rating_incentives(&user_address);
if !incentives.is_empty() {
    contract.claim_incentive_reward(&user_address, &incentives[0]);
}
```

## Testing

The contract includes comprehensive tests covering:

- Rating submission and validation
- Statistical calculations and updates
- Privilege and restriction system
- Moderation workflows
- Incentive claiming
- Integration with reputation contract
- Edge cases and error conditions

Run tests with:

```bash
cargo test
```

## Deployment

1. Build the contract:

```bash
cargo build --target wasm32-unknown-unknown --release
```

2. Deploy to Stellar network:

```bash
soroban contract deploy --wasm target/wasm32-unknown-unknown/release/rating_contract.wasm
```

3. Initialize with admin:

```bash
soroban contract invoke --id CONTRACT_ID -- init --admin ADMIN_ADDRESS
```

## Future Enhancements

- Machine learning-based fraud detection
- Reputation scoring algorithms
- Cross-platform rating integration
- Advanced analytics dashboard
- Mobile SDK for rating submission
- API integrations for external platforms

## License

This contract is part of the Offer Hub platform and follows the project's licensing terms.
