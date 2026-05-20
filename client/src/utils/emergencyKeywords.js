// src/utils/emergencyKeywords.js
export const EMERGENCY_KEYWORDS = [
  'chest pain', 'chest pressure', 'chest tightness',
  "can't breathe", 'cannot breathe', 'difficulty breathing', 'not breathing',
  'heart attack', 'cardiac arrest',
  'unconscious', 'passed out', 'fainted',
  'overdose', 'took too many pills',
  'suicidal', 'want to die', 'kill myself',
  'stroke', 'paralyzed', 'can\'t move',
  'severe bleeding', 'blood everywhere',
  'anaphylaxis', 'allergic reaction', 'throat closing',
  'seizure', 'convulsing',
  'emergency', 'call 911', 'help me', 'dying',
];

export const hasEmergencyKeyword = (text = '') => {
  const lower = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
};
