// src/components/LanguageBadge.jsx
import { LANG_NAMES } from '../utils/languageDetect';

export const LanguageBadge = ({ lang }) => {
  if (!lang || lang === 'en') return null;
  return (
    <div className="language-badge" title={`Detected language: ${LANG_NAMES[lang] || lang}`}>
      🌍 {LANG_NAMES[lang] || lang.toUpperCase()}
    </div>
  );
};
