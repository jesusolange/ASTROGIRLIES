export default function WeeklyActivity({ days, peak }) {
  return (
    <div class="exo-chart" role="img" aria-label="Training duration over the last seven days">
      {days.map((day) => (
        <div key={day.date} class="exo-day">
          <span class="exo-day-amount">{Math.round(day.amount)}</span>
          <div class="exo-bar-track" title={`${new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}: ${Math.round(day.amount)} min`}>
            <div class="exo-bar" style={{ height: `${(day.amount / peak) * 100}%` }} />
          </div>
          <span class="exo-day-label">{day.weekday}</span>
        </div>
      ))}
    </div>
  );
}
