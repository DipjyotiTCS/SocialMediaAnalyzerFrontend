import { useState } from 'react';
import ConfidenceBadge from './ConfidenceBadge.jsx';
import JsonBlock from './JsonBlock.jsx';
import { getAgentAlias } from '../utils/agentAliases.js';

export default function AgentResultCard({ agent, index, showConfidence = false }) {
  const [expanded, setExpanded] = useState(index < 3);

  return (
    <article className="agent-card">
      <button className="agent-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="agent-title-group">
          <span className="agent-step">{index + 1}</span>
          <div>
            <h4>{getAgentAlias(agent.agent_name)}</h4>
            <p>
              Status: <strong>{agent.status || 'unknown'}</strong>
              {agent.model_name ? <> · Model: <strong>{agent.model_name}</strong></> : null}
              {agent.llm_used !== undefined ? <> · LLM Used: <strong>{String(agent.llm_used)}</strong></> : null}
            </p>
          </div>
        </div>
        <div className="agent-header-actions">
          {showConfidence && <ConfidenceBadge score={agent.confidence_score} />}
          <span className={`chevron-button ${expanded ? 'expanded' : ''}`} aria-hidden="true">
            <svg className="chevron-icon" viewBox="0 0 20 20" focusable="false">
              <path d="M5.5 7.75 10 12.25l4.5-4.5" />
            </svg>
          </span>
        </div>
      </button>

      {expanded && (
        <div className="agent-card-body">
          {agent.rationale && (
            <div className="detail-block">
              <h5>Rationale</h5>
              <p>{agent.rationale}</p>
            </div>
          )}

          {Array.isArray(agent.evidence) && agent.evidence.length > 0 && (
            <div className="detail-block">
              <h5>Evidence</h5>
              <ul className="evidence-list">
                {agent.evidence.map((item, evidenceIndex) => (
                  <li key={`${agent.agent_name}-evidence-${evidenceIndex}`}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {agent.output && Object.keys(agent.output).length > 0 && (
            <details className="details-panel">
              <summary>Agent output JSON</summary>
              <JsonBlock value={agent.output} />
            </details>
          )}
        </div>
      )}
    </article>
  );
}
