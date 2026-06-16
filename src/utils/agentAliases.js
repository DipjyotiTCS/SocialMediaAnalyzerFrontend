export const AGENT_ALIAS_MAP = {
  intent_agent: 'Intent Analysis',
  knowledge_base_agent: 'Knowledge Base',
  lead_capture_agent: 'Lead Capture',
  presentation_agent: 'Response Management',
  product_feedback_agent: 'Feeback Management',
  routing_agent: 'Orchestration',
  sales_notification_agent: 'Sales Opportunity Alerting',
  service_request_agent: 'Service Request',
  sentiment_analysis_agent: 'Sentiment Analysis',
  'Sentiment Analysis Agent': 'Sentiment Analysis',
  sentiment_agent: 'Sentiment Analysis',
};

export function getAgentAlias(agentName) {
  if (!agentName) return 'Agent';
  return AGENT_ALIAS_MAP[agentName] || agentName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
