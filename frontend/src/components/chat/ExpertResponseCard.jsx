import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ChevronDown } from 'lucide-react';
import {
  QUICK_ACTIONS,
  SECTION_CONFIG,
  SOURCE_ICON_MAP,
  SOURCE_LABELS,
  getRiskTone,
} from './chatTheme';

function renderList(items) {
  if (!items?.length) return null;

  return (
    <ul className="response-list">
      {items.map((item, index) => {
        if (typeof item === 'string') {
          return <li key={`${item}-${index}`}>{item}</li>;
        }

        return (
          <li key={`${item.controlCode || item.title || 'item'}-${index}`} className="response-finding">
            <div className="response-finding-head">
              <span className="response-finding-title">
                {item.controlCode ? `${item.controlCode} - ${item.title}` : item.title || 'Constat'}
              </span>
              {(item.status || item.riskLevel) && (
                <span className="response-inline-meta">
                  {[item.status, item.riskLevel].filter(Boolean).join(' - ')}
                </span>
              )}
            </div>
            {item.detail && <p>{item.detail}</p>}
            {item.recommendation && (
              <p className="response-inline-note">Recommandation actuelle: {item.recommendation}</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

const ResponseSectionCard = ({ sectionKey, content, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const config = SECTION_CONFIG[sectionKey];

  if (!content || (Array.isArray(content) && content.length === 0) || !config) {
    return null;
  }

  const Icon = config.icon;

  return (
    <motion.section
      className="response-section-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      <button className="response-section-toggle" onClick={() => setIsOpen((value) => !value)}>
        <div className="response-section-head">
          <div className="response-section-icon">
            <Icon size={15} />
          </div>
          <h4>{config.title}</h4>
        </div>
        <motion.span animate={{ rotate: isOpen ? 0 : -90 }} transition={{ duration: 0.18 }}>
          <ChevronDown size={16} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className="response-section-body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
          >
            {Array.isArray(content) ? renderList(content) : <p>{content}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

const SourceBadge = ({ source }) => {
  const Icon = SOURCE_ICON_MAP[source];

  return (
    <span className={`badge badge-source badge-source-${source}`}>
      {Icon ? <Icon size={12} /> : null}
      {SOURCE_LABELS[source] || source}
    </span>
  );
};

const RiskBadge = ({ level }) => {
  if (!level) return null;
  const riskTone = getRiskTone(level);

  return (
    <div className={`risk-pill risk-pill-${riskTone}`}>
      <span className="risk-pill-dot"></span>
      {level}
    </div>
  );
};

const ExpertResponseCard = ({ message, onSendMessage }) => {
  const response = message.response || {};
  const sections = response.sections || {};
  const metadata = message.metadata || {};
  const sourceUsed = metadata.sources || metadata.sourceUsed || [];
  const riskLevel = response.riskLevel || sections.riskLevel || '';
  const riskTone = getRiskTone(riskLevel);
  const isLocalFallback =
    sourceUsed.includes('local_fallback') ||
    metadata.openaiStatus === 'quota_exceeded' ||
    metadata.llmStatus === 'quota_exceeded';

  const dynamicActions = useMemo(() => {
    return QUICK_ACTIONS.map((action) => ({
      ...action,
      prompt: `${response.summary || message.text}\n\n${action.prompt}`,
    }));
  }, [message.text, response.summary]);

  return (
    <div className="structured-response">
      <motion.div
        className="response-hero-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
      >
        <div className="response-hero-top">
          <div className="response-hero-label">Assistant expert</div>
          <RiskBadge level={riskLevel} />
        </div>
        <p className="response-summary">{response.summary || sections.summary || message.text}</p>
      </motion.div>

      {isLocalFallback && (
        <motion.div
          className="response-notice"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
        >
          Mode expert local utilise temporairement
        </motion.div>
      )}

      <div className="message-metadata">
        {sourceUsed.map((source) => (
          <SourceBadge key={source} source={source} />
        ))}
        {metadata.questionType && <span className="badge badge-type">{metadata.questionType}</span>}
        {typeof metadata.confidence === 'number' && (
          <span className="badge badge-info">Confiance {(metadata.confidence * 100).toFixed(0)}%</span>
        )}
      </div>

      {riskLevel && (
        <motion.section
          className={`risk-card risk-card-${riskTone}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="risk-card-head">
            <AlertCircle size={16} />
            <h4>Niveau de risque</h4>
          </div>
          <p>{riskLevel}</p>
        </motion.section>
      )}

      <div className="response-grid">
        <ResponseSectionCard sectionKey="isoContext" content={response.isoContext || sections.isoContext} />
        <ResponseSectionCard sectionKey="impact" content={response.impact || sections.impact} />
        <ResponseSectionCard sectionKey="findings" content={sections.findings} />
        <ResponseSectionCard sectionKey="recommendations" content={response.recommendations || sections.recommendations} />
        <ResponseSectionCard sectionKey="evidence" content={response.evidence || sections.evidence} />
        <ResponseSectionCard sectionKey="nextSteps" content={response.nextSteps || sections.nextQuestions} />
      </div>

      <div className="message-actions">
        <p className="actions-title">Actions rapides</p>
        <div className="actions-list">
          {dynamicActions.map((action) => (
            <motion.button
              key={action.label}
              className="action-btn"
              onClick={() => onSendMessage(action.prompt)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {action.label}
            </motion.button>
          ))}
          {(message.actions || []).map((action, index) => (
            <motion.button
              key={`${action.label}-${index}`}
              className="action-btn action-btn-subtle"
              onClick={() => onSendMessage(action.label)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {action.label}
            </motion.button>
          ))}
        </div>
      </div>

      {message.suggestions?.length > 0 && (
        <div className="message-suggestions">
          <p className="suggestions-title">Suggestions</p>
          <div className="suggestions-grid">
            {message.suggestions.map((suggestion, index) => (
              <motion.button
                key={`${suggestion}-${index}`}
                className="suggestion-btn"
                onClick={() => onSendMessage(suggestion)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertResponseCard;
