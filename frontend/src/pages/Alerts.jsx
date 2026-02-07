export default function Alerts({ alerts = [] }) {
  if (!alerts.length) {
    return <p>No alerts detected.</p>;
  }

  return alerts.map(a => (
    <div key={a._id}>{a.title} | {a.severity}</div>
  ));
}
