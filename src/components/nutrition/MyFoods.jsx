export default function MyFoods({ lib, onPick }) {
  if (!lib.length) return null;
  return (
    <div class="nutrition-library">
      <h4>My foods <small>tap, then enter the amount</small></h4>
      <div class="nutrition-chips">
        {lib.map((food, index) => (
          <button key={`${food.code || food.name}-${index}`} type="button" class="nutrition-chip" onClick={() => onPick(food)}>
            {food.name} <small>{Math.round(food.kcal || 0)} kcal</small>
          </button>
        ))}
      </div>
    </div>
  );
}
