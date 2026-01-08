/**
 * KIDTRAK Assessment Domain Constants
 *
 * These are the official 7 developmental domains used in KIDTRAK assessments.
 * All assessment creation, display, and reporting should use these exact names.
 */

export const ASSESSMENT_DOMAINS = [
  'Gross Motor',
  'Fine Motor',
  'Self-Help',
  'Receptive Language',
  'Expressive Language',
  'Cognitive',
  'Social-Emotional'
] as const;

export type AssessmentDomainName = typeof ASSESSMENT_DOMAINS[number];

/**
 * Domain descriptions for reference
 */
export const DOMAIN_DESCRIPTIONS: Record<AssessmentDomainName, string> = {
  'Gross Motor': 'Large muscle movement and coordination (running, jumping, climbing)',
  'Fine Motor': 'Small muscle movement and hand-eye coordination (drawing, cutting, writing)',
  'Self-Help': 'Independence in daily activities (feeding, dressing, toileting)',
  'Receptive Language': 'Understanding and comprehension of spoken language',
  'Expressive Language': 'Ability to express thoughts, ideas, and needs verbally',
  'Cognitive': 'Thinking, learning, problem-solving, and memory skills',
  'Social-Emotional': 'Interaction with others, emotional regulation, and self-awareness'
};

/**
 * Get default empty domain scores for a new assessment
 */
export function getDefaultDomainScores() {
  return ASSESSMENT_DOMAINS.map(domain => ({
    domain,
    rawScore: 0,
    scaledScore: 0,
    interpretation: 'Not assessed'
  }));
}

/**
 * Validate domain name
 */
export function isValidDomain(domain: string): domain is AssessmentDomainName {
  return ASSESSMENT_DOMAINS.includes(domain as AssessmentDomainName);
}
