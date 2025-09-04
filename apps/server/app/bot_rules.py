import re
import string
from typing import Optional, List, Tuple, Dict
from email_validator import validate_email, EmailNotValidError
import dns.resolver
import dns.exception

class BotDetectionConfig:
    """Configuration for bot detection with email verification options."""
    
    # Bot detection weights and threshold
    BOT_THRESHOLD = 1.0
    DISPOSABLE_DOMAIN_WEIGHT = 2.0
    OBVIOUS_BOT_LOCALPART_WEIGHT = 1.5
    HIGH_RANDOMNESS_WEIGHT = 1.0
    ROLE_ACCOUNT_WEIGHT = 0.3
    MISSING_NAMES_WEIGHT = 0.2
    HUMAN_NAMES_WEIGHT = -0.1
    
    # Randomness detection parameters
    MIN_LENGTH_FOR_RANDOMNESS = 10
    HIGH_DIGIT_RATIO = 0.4
    HIGH_SPECIAL_RATIO = 0.3
    LOW_VOWEL_RATIO = 0.2
    MIN_CONSONANT_RUN = 5
    
    # Email verification options
    ENABLE_SYNTAX_CHECK = True
    ENABLE_MX_CHECK = True
    TREAT_INVALID_AS_BOTS = True
    MX_CHECK_TIMEOUT = 5.0  # seconds

class BotDetector:
    """Enhanced bot detection with email verification capabilities."""
    
    def __init__(self, config: Optional[BotDetectionConfig] = None):
        self.config = config or BotDetectionConfig()
        self._init_patterns()
    
    def _init_patterns(self):
        """Initialize detection patterns."""
        # Disposable email domains
        self.disposable_domains = {
            'mailinator.com', '10minutemail.com', 'guerrillamail.com', 'yopmail.com',
            'tempmail.org', 'temp-mail.org', 'throwaway.email', 'fakeinbox.com',
            'sharklasers.com', 'grr.la', 'guerrillamailblock.com', 'pokemail.net',
            'spam4.me', 'bccto.me', 'chacuo.net', 'dispostable.com', 'mailnesia.com',
            'mailmetrash.com', 'trashmail.net', 'maildrop.cc', 'getairmail.com',
            'mailinator.net', 'mailinator.org', 'mailinator.biz', 'mailinator.info',
            'mailinator.co', 'mailinator.io', 'mailinator.me', 'mailinator.tv',
            'mailinator.us', 'mailinator.ws', 'mailinator.mobi', 'mailinator.name'
        }
        
        # Obvious bot local-parts
        self.bot_localparts = {
            'bot', 'test', 'no-reply', 'noreply', 'dummy', 'example', 'automation',
            'system', 'admin', 'info', 'support', 'contact', 'webmaster', 'postmaster',
            'hostmaster', 'abuse', 'security', 'nobody', 'root', 'daemon', 'mail',
            'news', 'uucp', 'operator', 'games', 'gopher', 'ftp', 'anonymous',
            'guest', 'demo', 'sample', 'trial', 'temp', 'temporary', 'fake',
            'spam', 'junk', 'trash', 'invalid', 'error', 'null', 'void'
        }
        
        # Role account patterns
        self.role_patterns = [
            r'^admin@',
            r'^support@',
            r'^info@',
            r'^contact@',
            r'^help@',
            r'^service@',
            r'^sales@',
            r'^marketing@',
            r'^hr@',
            r'^finance@',
            r'^legal@',
            r'^pr@',
            r'^media@',
            r'^press@',
            r'^news@',
            r'^blog@',
            r'^webmaster@',
            r'^postmaster@',
            r'^hostmaster@',
            r'^abuse@',
            r'^security@',
            r'^noreply@',
            r'^no-reply@',
            r'^donotreply@',
            r'^noreply@'
        ]
    
    def is_bot_email(self, email: str, first_name: Optional[str] = None, last_name: Optional[str] = None) -> bool:
        """Check if an email address matches bot patterns using scoring rules."""
        if not email or not isinstance(email, str):
            return False
        
        # Check email syntax and MX records if enabled
        email_status = self._verify_email(email)
        
        # If invalid emails should be treated as bots and email is invalid
        if self.config.TREAT_INVALID_AS_BOTS and email_status != 'valid':
            return True
        
        # Only proceed with bot detection for valid emails
        if email_status != 'valid':
            return False
        
        try:
            validated_email = validate_email(email)
            email = validated_email.normalized
        except EmailNotValidError:
            return True
        
        score = self._calculate_bot_score(email, first_name, last_name)
        return score >= self.config.BOT_THRESHOLD
    
    def get_email_status(self, email: str) -> str:
        """Get the email verification status."""
        if not email or not isinstance(email, str):
            return 'unknown'
        
        return self._verify_email(email)
    
    def _verify_email(self, email: str) -> str:
        """Verify email syntax and MX records."""
        # Syntax check
        try:
            validated_email = validate_email(email)
            email = validated_email.normalized
        except EmailNotValidError:
            return 'invalid_syntax'
        
        # MX record check
        if self.config.ENABLE_MX_CHECK:
            try:
                domain = email.split('@')[1]
                if not self._has_mx_record(domain):
                    return 'no_mx'
            except (IndexError, Exception):
                return 'invalid_syntax'
        
        return 'valid'
    
    def _has_mx_record(self, domain: str) -> bool:
        """Check if domain has MX records."""
        try:
            resolver = dns.resolver.Resolver()
            resolver.timeout = self.config.MX_CHECK_TIMEOUT
            resolver.lifetime = self.config.MX_CHECK_TIMEOUT
            
            mx_records = resolver.resolve(domain, 'MX')
            return len(mx_records) > 0
        except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, dns.resolver.Timeout, 
                dns.exception.DNSException, Exception):
            return False
    
    def _calculate_bot_score(self, email: str, first_name: Optional[str], last_name: Optional[str]) -> float:
        """Calculate bot probability score."""
        score = 0.0
        local_part, domain = email.split('@', 1)
        
        # Check disposable domains
        if self._is_disposable_domain(domain):
            score += self.config.DISPOSABLE_DOMAIN_WEIGHT
        
        # Check obvious bot local-parts
        if self._is_obvious_bot_localpart(local_part):
            score += self.config.OBVIOUS_BOT_LOCALPART_WEIGHT
        
        # Check high randomness
        if self._is_high_randomness(local_part):
            score += self.config.HIGH_RANDOMNESS_WEIGHT
        
        # Check role accounts
        if self._is_role_account(email):
            score += self.config.ROLE_ACCOUNT_WEIGHT
        
        # Calculate name score
        name_score = self._calculate_name_score(first_name, last_name, local_part)
        score += name_score
        
        return score
    
    def _is_disposable_domain(self, domain: str) -> bool:
        """Check if domain is in disposable domains list."""
        return domain.lower() in self.disposable_domains
    
    def _is_obvious_bot_localpart(self, local_part: str) -> bool:
        """Check if local-part contains obvious bot indicators."""
        local_part_lower = local_part.lower()
        return any(bot_indicator in local_part_lower for bot_indicator in self.bot_localparts)
    
    def _is_high_randomness(self, local_part: str) -> bool:
        """Check if local-part shows high randomness characteristics."""
        if len(local_part) < self.config.MIN_LENGTH_FOR_RANDOMNESS:
            return False
        
        # Count digits and special characters
        digit_count = sum(1 for c in local_part if c.isdigit())
        special_count = sum(1 for c in local_part if c in string.punctuation)
        vowel_count = sum(1 for c in local_part.lower() if c in 'aeiou')
        
        # Calculate ratios
        digit_ratio = digit_count / len(local_part)
        special_ratio = special_count / len(local_part)
        vowel_ratio = vowel_count / len(local_part)
        
        # Check for long consonant runs
        consonant_run = 0
        max_consonant_run = 0
        for c in local_part.lower():
            if c not in 'aeiou' and c.isalpha():
                consonant_run += 1
                max_consonant_run = max(max_consonant_run, consonant_run)
            else:
                consonant_run = 0
        
        # Determine if high randomness
        high_randomness = (
            digit_ratio > self.config.HIGH_DIGIT_RATIO or
            special_ratio > self.config.HIGH_SPECIAL_RATIO or
            vowel_ratio < self.config.LOW_VOWEL_RATIO or
            max_consonant_run >= self.config.MIN_CONSONANT_RUN
        )
        
        return high_randomness
    
    def _is_role_account(self, email: str) -> bool:
        """Check if email is a role account."""
        email_lower = email.lower()
        return any(re.search(pattern, email_lower) for pattern in self.role_patterns)
    
    def _calculate_name_score(self, first_name: Optional[str], last_name: Optional[str], local_part: str) -> float:
        """Calculate score based on name presence and characteristics."""
        score = 0.0
        
        # Check if names are missing
        names_missing = not first_name and not last_name
        
        if names_missing:
            # If local-part is high-entropy, slightly increase score
            if self._is_high_randomness(local_part):
                score += self.config.MISSING_NAMES_WEIGHT
        else:
            # If names exist and look human, slightly reduce score
            if self._looks_like_human_names(first_name, last_name):
                score += self.config.HUMAN_NAMES_WEIGHT
        
        return score
    
    def _looks_like_human_names(self, first_name: Optional[str], last_name: Optional[str]) -> bool:
        """Check if names look like human names."""
        def is_human_name(name: str) -> bool:
            if not name or len(name) < 2:
                return False
            
            # Check if name is alphabetic and reasonable length
            if not name.replace('-', '').replace("'", '').replace(' ', '').isalpha():
                return False
            
            if len(name) > 20:  # Unreasonably long names
                return False
            
            return True
        
        first_human = not first_name or is_human_name(first_name)
        last_human = not last_name or is_human_name(last_name)
        
        return first_human and last_human
    
    def get_detection_details(self, email: str, first_name: Optional[str] = None, last_name: Optional[str] = None) -> Dict:
        """Get detailed bot detection analysis for debugging and tuning."""
        if not email or not isinstance(email, str):
            return {
                'email': email,
                'is_bot': True,
                'email_status': 'unknown',
                'reason': 'Invalid or empty email',
                'score': 0.0,
                'details': {}
            }
        
        # Get email status
        email_status = self._verify_email(email)
        
        # If email is invalid and should be treated as bots
        if self.config.TREAT_INVALID_AS_BOTS and email_status != 'valid':
            return {
                'email': email,
                'is_bot': True,
                'email_status': email_status,
                'reason': f'Email marked as bot due to {email_status} status',
                'score': 0.0,
                'details': {
                    'email_status': email_status,
                    'treat_invalid_as_bots': self.config.TREAT_INVALID_AS_BOTS
                }
            }
        
        # Only proceed with bot detection for valid emails
        if email_status != 'valid':
            return {
                'email': email,
                'is_bot': False,
                'email_status': email_status,
                'reason': f'Email not processed due to {email_status} status',
                'score': 0.0,
                'details': {
                    'email_status': email_status,
                    'treat_invalid_as_bots': self.config.TREAT_INVALID_AS_BOTS
                }
            }
        
        try:
            validated_email = validate_email(email)
            email = validated_email.normalized
        except EmailNotValidError:
            return {
                'email': email,
                'is_bot': True,
                'email_status': 'invalid_syntax',
                'reason': 'Email syntax validation failed',
                'score': 0.0,
                'details': {
                    'email_status': 'invalid_syntax',
                    'treat_invalid_as_bots': self.config.TREAT_INVALID_AS_BOTS
                }
            }
        
        # Calculate detailed score
        local_part, domain = email.split('@', 1)
        score = 0.0
        details = {
            'email_status': email_status,
            'local_part': local_part,
            'domain': domain,
            'checks': {}
        }
        
        # Check disposable domains
        if self._is_disposable_domain(domain):
            score += self.config.DISPOSABLE_DOMAIN_WEIGHT
            details['checks']['disposable_domain'] = {
                'result': True,
                'weight': self.config.DISPOSABLE_DOMAIN_WEIGHT,
                'score': score
            }
        
        # Check obvious bot local-parts
        if self._is_obvious_bot_localpart(local_part):
            score += self.config.OBVIOUS_BOT_LOCALPART_WEIGHT
            details['checks']['obvious_bot_localpart'] = {
                'result': True,
                'weight': self.config.OBVIOUS_BOT_LOCALPART_WEIGHT,
                'score': score
            }
        
        # Check high randomness
        if self._is_high_randomness(local_part):
            score += self.config.HIGH_RANDOMNESS_WEIGHT
            details['checks']['high_randomness'] = {
                'result': True,
                'weight': self.config.HIGH_RANDOMNESS_WEIGHT,
                'score': score
            }
        
        # Check role accounts
        if self._is_role_account(email):
            score += self.config.ROLE_ACCOUNT_WEIGHT
            details['checks']['role_account'] = {
                'result': True,
                'weight': self.config.ROLE_ACCOUNT_WEIGHT,
                'score': score
            }
        
        # Calculate name score
        name_score = self._calculate_name_score(first_name, last_name, local_part)
        score += name_score
        details['checks']['name_analysis'] = {
            'first_name': first_name,
            'last_name': last_name,
            'name_score': name_score,
            'final_score': score
        }
        
        is_bot = score >= self.config.BOT_THRESHOLD
        
        return {
            'email': email,
            'is_bot': is_bot,
            'email_status': email_status,
            'reason': f'Bot score {score:.2f} {"exceeds" if is_bot else "below"} threshold {self.config.BOT_THRESHOLD}',
            'score': score,
            'threshold': self.config.BOT_THRESHOLD,
            'details': details
        }
