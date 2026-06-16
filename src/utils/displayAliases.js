export const FIELD_ALIAS_MAP = {
  service_request_id: 'Service Request Ticket',
  sales_notification_id: 'Sales Request Ticket',
  lead_id: 'Lead Ticket',
};

export function getFieldAlias(fieldName) {
  if (!fieldName) return '';
  return FIELD_ALIAS_MAP[fieldName] || String(fieldName)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
