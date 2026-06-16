export default function ConfidenceBadge({ score, label = 'Confidence' }) {
  const numericScore = typeof score === 'number' ? score : Number(score || 0);
  const percentage = Math.round(numericScore * 100);

  let tone = 'low';
  if (numericScore >= 0.85) tone = 'high';
  else if (numericScore >= 0.65) tone = 'medium';

  return (
    <div className={`confidence-badge confidence-${tone}`}>
      <span className="confidence-label">{label}</span>
      <span className="confidence-value">{percentage}%</span>
    </div>
  );
}
