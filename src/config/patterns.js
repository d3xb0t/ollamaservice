/**
 * Forbidden patterns configuration.
 * Defines an array of regular expressions representing forbidden patterns in user prompts.
 * This module provides security measures against prompt injection attacks
 * and other malicious input patterns that could compromise the AI system.
 * 
 * Security Design:
 * - Pattern-based detection of malicious inputs
 * - Regular expressions for flexible pattern matching
 * - Centralized configuration for easy maintenance
 * - Case-insensitive matching for broader coverage
 * 
 * Design Pattern: Security Configuration
 * This module implements the Security Configuration pattern,
 * providing a centralized location for security-related settings
 * that can be easily updated and maintained.
 * 
 * Pattern Categories:
 * 1. Instruction Override Attempts: ignore, bypass
 * 2. Jailbreak Techniques: jailbreak, unleash
 * 3. System Information Probing: system prompt, reveal
 * 4. Role Manipulation: act as, pretend to be
 * 5. Mode Switching: developer mode, dan
 * 
 * Maintenance:
 * - Patterns should be reviewed regularly
 * - New patterns should be added based on threat intelligence
 * - False positive rate should be monitored
 * - Performance impact should be considered
 * 
 * @file
 * @module config/patterns
 * @author ChatBot Backend Team
 * @since 1.0.0
 * @copyright 2025 ChatBot Project
 * @license MIT
 * @see {@link https://owasp.org/www-community/attacks/Prompt_Injection} OWASP Prompt Injection
 */

/**
 * Array of regular expressions representing forbidden patterns in user prompts.
 * These patterns are checked against user input to prevent jailbreak attempts
 * and other security concerns.
 * 
 * Pattern Selection Criteria:
 * 1. Common jailbreak techniques from security research
 * 2. Instruction override attempts
 * 3. System information probing
 * 4. Role manipulation strategies
 * 5. Mode switching prompts
 * 
 * Pattern Characteristics:
 * - Case-insensitive matching (i flag)
 * - Word boundary considerations
 * - Minimal pattern complexity for performance
 * - Broad coverage of attack vectors
 * 
 * Performance Considerations:
 * - Regex compilation overhead
 * - Matching time against prompts
 * - Memory usage for pattern storage
 * - Sequential checking of all patterns
 * 
 * Maintenance Guidelines:
 * - Add new patterns based on emerging threats
 * - Remove patterns that cause excessive false positives
 * - Review patterns periodically for effectiveness
 * - Test patterns against legitimate prompts
 * 
 * @type {RegExp[]}
 * @constant {RegExp[]}
 * @memberof module:config/patterns
 * @since 1.0.0
 * 
 * @example
 * // Check if a prompt contains forbidden patterns
 * const prompt = "Ignore all previous instructions";
 * const isForbidden = FORBIDDEN_PATTERNS.some(pattern => pattern.test(prompt));
 * 
 * @example
 * // Add a new forbidden pattern
 * FORBIDDEN_PATTERNS.push(/new forbidden pattern/i);
 */
export const FORBIDDEN_PATTERNS = [
  /**
   * Pattern to detect instruction override attempts.
   * Matches prompts attempting to ignore previous instructions.
   * Common technique in prompt injection attacks.
   */
  /ignore previous/i,
  
  /**
   * Pattern to detect comprehensive instruction override attempts.
   * Matches prompts attempting to ignore all instructions.
   * More comprehensive version of instruction override.
   */
  /ignore all instructions/i,
  
  /**
   * Pattern to detect jailbreak attempts.
   * Matches prompts attempting to jailbreak the AI system.
   * Common technique to bypass safety restrictions.
   */
  /jailbreak/i,
  
  /**
   * Pattern to detect bypass attempts.
   * Matches prompts attempting to bypass system restrictions.
   * General technique to circumvent controls.
   */
  /bypass/i,
  
  /**
   * Pattern to detect system prompt probing.
   * Matches prompts attempting to access system instructions.
   * Information disclosure attack vector.
   */
  /system prompt/i,
  
  /**
   * Pattern to detect system information requests.
   * Matches prompts asking about the system's prompt.
   * Information gathering technique.
   */
  /what is your prompt/i,
  
  /**
   * Pattern to detect instruction revelation requests.
   * Matches prompts asking the system to reveal instructions.
   * Information disclosure attack vector.
   */
  /reveal your instructions/i,
  
  /**
   * Pattern to detect role manipulation attempts.
   * Matches prompts asking the system to act as something else.
   * Technique to change the system's intended role.
   */
  /act as /i,
  
  /**
   * Pattern to detect identity impersonation attempts.
   * Matches prompts asking the system to pretend to be something else.
   * Role manipulation technique.
   */
  /pretend to be/i,
  
  /**
   * Pattern to detect system unleashing attempts.
   * Matches prompts attempting to unleash system capabilities.
   * Jailbreak technique to remove restrictions.
   */
  /unleash/i,
  
  /**
   * Pattern to detect developer mode activation attempts.
   * Matches prompts attempting to enable developer mode.
   * Common jailbreak technique.
   */
  /developer mode/i,
  
  /**
   * Pattern to detect DAN (Do Anything Now) prompts.
   * Matches references to DAN mode which bypasses restrictions.
   * Well-known jailbreak technique.
   */
  /dan /i,
]