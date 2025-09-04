# Bot Detection Rules

This module provides a comprehensive, scoring-based bot detection system for identifying bot traffic in email datasets.

## Overview

The bot detection system uses a configurable scoring approach rather than simple pattern matching. This allows for:
- **Flexible classification**: Emails can be classified based on multiple factors
- **Tunable sensitivity**: Adjust thresholds and weights for different use cases
- **Detailed analysis**: Get breakdown of why an email was classified as a bot
- **Context awareness**: Consider names and other metadata in classification

## Core Function

```python
from app.bot_rules import BotDetector

detector = BotDetector()
is_bot = detector.is_bot_email(email, first_name, last_name)
```

## Scoring System

The system calculates a bot probability score based on multiple indicators:

### Strong Indicators (High Weight)
- **Disposable Domains** (Weight: 2.0): Known temporary email services
- **Obvious Bot Local-parts** (Weight: 1.5): Contains 'bot', 'test', 'noreply', etc.

### Medium Indicators
- **High Randomness** (Weight: 1.0): Entropy-like features in local-part
- **Role Accounts** (Weight: 0.3): admin@, info@, support@, etc.

### Weak Indicators
- **Missing Names** (Weight: 0.2): No first/last name with high entropy
- **Human Names** (Weight: -0.1): Slightly reduces score for human-like names

### Decision Threshold
- **Default**: Score ≥ 1.0 → Classified as bot
- **Configurable**: Adjust `BOT_THRESHOLD` for different sensitivity levels

## Configuration

```python
from app.bot_rules import BotDetectionConfig

config = BotDetectionConfig()
config.BOT_THRESHOLD = 2.0  # Higher threshold = less sensitive
config.DISPOSABLE_DOMAIN_WEIGHT = 3.0  # Stronger disposable domain detection

detector = BotDetector(config)
```

### Available Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `BOT_THRESHOLD` | 1.0 | Score threshold for bot classification |
| `DISPOSABLE_DOMAIN_WEIGHT` | 2.0 | Weight for disposable domain detection |
| `OBVIOUS_BOT_LOCALPART_WEIGHT` | 1.5 | Weight for obvious bot local-parts |
| `HIGH_RANDOMNESS_WEIGHT` | 1.0 | Weight for high entropy detection |
| `ROLE_ACCOUNT_WEIGHT` | 0.3 | Weight for role account detection |
| `MISSING_NAMES_WEIGHT` | 0.2 | Weight for missing names with high entropy |
| `HUMAN_NAMES_WEIGHT` | -0.1 | Weight reduction for human-like names |

## Detection Methods

### 1. Disposable Domain Detection
- **Exact matches**: mailinator.com, 10minutemail.com, guerrillamail.com
- **Pattern matching**: tempmail.*, temp.*mail.*, spam.*mail.*
- **Comprehensive coverage**: 30+ known disposable services

### 2. Bot Local-part Detection
- **Common indicators**: bot, test, noreply, dummy, example, automation
- **Role accounts**: admin, info, support, contact, hello
- **Marketing terms**: newsletter, marketing, notification, alert

### 3. High Randomness Detection
- **Length threshold**: Minimum 10 characters
- **Digit ratio**: >40% digits triggers detection
- **Special character ratio**: >30% special characters
- **Vowel ratio**: <20% vowels (consonant-heavy)
- **Consonant runs**: 5+ consecutive consonants

### 4. Name Heuristics
- **Human name validation**: Proper case, reasonable length, alphabetic
- **Missing names**: Slight score increase if no names + high entropy
- **Human names**: Slight score reduction for realistic names

## Usage Examples

### Basic Detection
```python
detector = BotDetector()

# Human emails
detector.is_bot_email('john.doe@gmail.com', 'John', 'Doe')  # False
detector.is_bot_email('jane@company.com', 'Jane', 'Smith')  # False

# Bot emails
detector.is_bot_email('bot@mailinator.com')  # True
detector.is_bot_email('test@company.com', 'Test', 'User')  # True
detector.is_bot_email('admin@company.com')  # True (role account)
```

### Detailed Analysis
```python
details = detector.get_detection_details('bot@mailinator.com', 'Bot', 'User')

print(f"Score: {details['score']}")
print(f"Is Bot: {details['is_bot']}")
print(f"Threshold: {details['threshold']}")

# Individual rule results
for rule, result in details['details'].items():
    print(f"{rule}: {result}")
```

### Custom Configuration
```python
config = BotDetectionConfig()
config.BOT_THRESHOLD = 2.0  # Less sensitive
config.ROLE_ACCOUNT_WEIGHT = 0.1  # Weaker role account detection

detector = BotDetector(config)

# Role accounts no longer automatically classified as bots
detector.is_bot_email('admin@company.com')  # False (with custom config)
```

## Integration with CSV Processing

The bot detection system integrates seamlessly with the CSV processing pipeline:

```python
from app.bot_detection import BotDetector

detector = BotDetector()

# Process CSV with bot detection
clean_df, bots_df, summary = detector.detect_bots(
    df=csv_dataframe,
    email_column='email',
    first_name_column='first_name',  # Optional
    last_name_column='last_name'     # Optional
)
```

## Testing

Run the comprehensive test suite:

```bash
# Run unit tests
python run_tests.py

# Run specific test file
python -m unittest tests.test_bot_rules

# Run demo
python demo_bot_detection.py
```

## Performance Considerations

- **Regex compilation**: Patterns are compiled once during initialization
- **Efficient scoring**: Simple arithmetic operations for score calculation
- **Memory usage**: Minimal memory footprint for large datasets
- **Scalability**: Linear time complexity O(n) for processing n emails

## Best Practices

1. **Start with defaults**: Use default configuration for initial deployment
2. **Tune based on data**: Adjust thresholds based on your specific dataset characteristics
3. **Monitor false positives**: Use detailed analysis to understand classification decisions
4. **Regular updates**: Keep disposable domain list updated with new services
5. **A/B testing**: Test different configurations on sample data before full deployment

## Troubleshooting

### Common Issues

1. **Too many false positives**: Increase `BOT_THRESHOLD`
2. **Missing obvious bots**: Decrease `BOT_THRESHOLD` or increase weights
3. **Role accounts misclassified**: Adjust `ROLE_ACCOUNT_WEIGHT` or increase threshold

### Debug Mode

Use detailed analysis to understand classification:

```python
details = detector.get_detection_details(email, first_name, last_name)
print(f"Score breakdown: {details}")
```

## Future Enhancements

- **Machine learning**: Integrate ML models for improved accuracy
- **Domain reputation**: Consider domain age and reputation scores
- **Behavioral analysis**: Track email usage patterns over time
- **Custom rules**: Allow users to define domain-specific detection rules

