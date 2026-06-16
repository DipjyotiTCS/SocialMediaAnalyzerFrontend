import ConfidenceBadge from './ConfidenceBadge.jsx';

export default function SummaryCard({ title, value, subtitle, confidence, rationale, accent }) {
  return (
    <section className={`summary-card ${accent ? `summary-${accent}` : ''}`}>
      <div className="summary-card-header">
        <div>
          <p className="summary-title">{title}</p>
          <h3>{value || 'Not available'}</h3>
        </div>
        {confidence !== undefined && confidence !== null && (
          <ConfidenceBadge score={confidence} />
        )}
      </div>
      {subtitle && <p className="summary-subtitle">{subtitle}</p>}
      {rationale && <p className="summary-rationale">{rationale}</p>}
    </section>
  );
}
