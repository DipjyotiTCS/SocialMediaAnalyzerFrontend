import { useEffect, useState } from 'react';
import SummaryCard from './SummaryCard.jsx';
import AgentResultCard from './AgentResultCard.jsx';
import ConfidenceBadge from './ConfidenceBadge.jsx';
import JsonBlock from './JsonBlock.jsx';
import { getAgentAlias } from '../utils/agentAliases.js';
import { getFieldAlias } from '../utils/displayAliases.js';

function formatObjectEntries(value) {
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value);
}

export default function ResultsDashboard({ result, resultKey }) {
  const [showAgentConfidence, setShowAgentConfidence] = useState(false);
  const [isEditingResponse, setIsEditingResponse] = useState(false);
  const [responseDraftsByKey, setResponseDraftsByKey] = useState({});
  const [postedResponseKeys, setPostedResponseKeys] = useState(() => new Set());

  const finalResponse = result?.final_response || {};
  const publicResponse = finalResponse.public_response || 'No response returned.';
  const draftKey = resultKey || result?.post_id || 'current-response';
  const editablePublicResponse = responseDraftsByKey[draftKey] ?? publicResponse;
  const responsePosted = postedResponseKeys.has(draftKey);

  useEffect(() => {
    if (!result) return;

    setResponseDraftsByKey((previousDrafts) => {
      if (Object.prototype.hasOwnProperty.call(previousDrafts, draftKey)) {
        return previousDrafts;
      }

      return {
        ...previousDrafts,
        [draftKey]: publicResponse,
      };
    });
    setIsEditingResponse(false);
  }, [draftKey, publicResponse, result]);

  if (!result) {
    return (
      <section className="empty-state">
        <h2>No analysis yet</h2>
        <p>Open the recent posts sidebar and select a saved post to run the agent workflow.</p>
      </section>
    );
  }

  const finalConfidence = result.final_confidence || finalResponse.final_confidence_used || {};
  const agentResults = Array.isArray(result.agent_results) ? result.agent_results : [];

  const handlePostResponse = () => {
    setIsEditingResponse(false);
    setPostedResponseKeys((previousKeys) => {
      const nextKeys = new Set(previousKeys);
      nextKeys.add(draftKey);
      return nextKeys;
    });
  };

  const handleResponseChange = (event) => {
    const nextValue = event.target.value;
    setResponseDraftsByKey((previousDrafts) => ({
      ...previousDrafts,
      [draftKey]: nextValue,
    }));
  };

  return (
    <section className="results-panel">
      <div className="result-hero compact-result-hero">
        <div>
          <p className="eyebrow">Analysis Completed</p>
          <p className="status-line">
            Status: <strong>{result.status || 'unknown'}</strong>
            {result.source_type ? <> · Source: <strong>{result.source_type}</strong></> : null}
          </p>
        </div>
        <ConfidenceBadge score={finalConfidence.score} label="Final Confidence" />
      </div>

      <section className="response-card public-response response-card-full public-response-editor-card">
        <h3>Response</h3>
        {isEditingResponse ? (
          <textarea
            className="public-response-textarea"
            value={editablePublicResponse}
            onChange={handleResponseChange}
            aria-label="Edit public response"
          />
        ) : (
          <p>{editablePublicResponse || 'No response returned.'}</p>
        )}

        {responsePosted && (
          <div className="response-post-success" role="status">
            The response is posted successfully.
          </div>
        )}

        {!responsePosted && (
          <div className={`response-action-row ${isEditingResponse ? 'single-response-action' : ''}`.trim()}>
            <button
              type="button"
              className="response-action-button response-edit-button"
              onClick={() => {
                if (isEditingResponse) {
                  handlePostResponse();
                } else {
                  setIsEditingResponse(true);
                }
              }}
            >
              {isEditingResponse ? 'Save and Post' : 'Edit'}
            </button>
            {!isEditingResponse && (
              <button
                type="button"
                className="response-action-button response-post-button"
                onClick={handlePostResponse}
              >
                Post
              </button>
            )}
          </div>
        )}
      </section>

      <div className="response-grid secondary-response-grid">
        <section className="response-card">
          <h3>Internal Summary</h3>
          <p>{finalResponse.internal_summary || 'No internal summary returned.'}</p>
        </section>

        <section className="response-card">
          <h3>Recommended Action</h3>
          <p>{finalResponse.recommended_action || 'No recommended action returned.'}</p>
        </section>

        <section className="response-card response-card-full">
          <h3>Created Tickets</h3>
          {formatObjectEntries(finalResponse.created_objects).length > 0 ? (
            <dl className="object-list">
              {formatObjectEntries(finalResponse.created_objects).map(([key, value]) => (
                <div key={key}>
                  <dt>{getFieldAlias(key)}</dt>
                  <dd>{String(value)}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p>No created tickets returned.</p>
          )}
        </section>
      </div>

      <div className="summary-grid">
        <SummaryCard
          title="Intent"
          value={result.intent?.label || result.intent?.value}
          confidence={result.intent?.confidence_score}
          rationale={result.intent?.rationale}
          accent="intent"
        />
        <SummaryCard
          title="Sentiment"
          value={result.sentiment?.value}
          subtitle={result.sentiment?.urgency ? `Urgency: ${result.sentiment.urgency}` : undefined}
          confidence={result.sentiment?.confidence_score}
          rationale={result.sentiment?.rationale}
          accent="sentiment"
        />
      </div>

      {Array.isArray(result.selected_agents) && result.selected_agents.length > 0 && (
        <div className="selected-agents-panel">
          <h3>Selected Agents</h3>
          <div className="chip-row">
            {result.selected_agents.map((agentName) => (
              <span className="chip" key={agentName}>{getAgentAlias(agentName)}</span>
            ))}
          </div>
        </div>
      )}

      <section className="agents-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Explainability</p>
            <h3>Agent-Level Decisions</h3>
          </div>
          <div className="agent-section-actions">
            <button
              type="button"
              className="secondary-toggle-button"
              onClick={() => setShowAgentConfidence((visible) => !visible)}
              aria-pressed={showAgentConfidence}
            >
              {showAgentConfidence ? 'Hide confidence scores' : 'Show confidence scores'}
            </button>
            <span className="agent-count">{agentResults.length} agents</span>
          </div>
        </div>

        <div className="agent-list">
          {agentResults.map((agent, index) => (
            <AgentResultCard
              key={`${agent.agent_name}-${index}`}
              agent={agent}
              index={index}
              showConfidence={showAgentConfidence}
            />
          ))}
        </div>
      </section>

      {Array.isArray(result.errors) && result.errors.length > 0 && (
        <section className="error-panel">
          <h3>Errors</h3>
          <ul>
            {result.errors.map((error, index) => <li key={index}>{error}</li>)}
          </ul>
        </section>
      )}

      <details className="raw-response-panel">
        <summary>Raw API response</summary>
        <JsonBlock value={result} />
      </details>
    </section>
  );
}
