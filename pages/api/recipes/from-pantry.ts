import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 1. Haal jouw pantry items op
  const { data: pantry, error: pantryError } = await supabase
    .from("pantry_items")
    .select("ingredient_id");

  if (pantryError) {
    return res.status(500).json({ error: "Failed to fetch pantry", details: pantryError });
  }

  const pantryIds = pantry.map((p) => p.ingredient_id);

  // 2. Haal alle recepten en hun ingrediënten op
  const { data: recipeData, error: recipeError } = await supabase
    .from("recipes")
    .select("id, title, total_minutes, image_path, recipe_ingredients(ingredient_id)");

  if (recipeError) {
    return res.status(500).json({ error: "Failed to fetch recipes", details: recipeError });
  }

  // 3. Bereken match scores
  const scoredRecipes = recipeData.map((recipe) => {
    const ingredientIds = recipe.recipe_ingredients.map((ri) => ri.ingredient_id);
    const total = ingredientIds.length;
    const matched = ingredientIds.filter((id) => pantryIds.includes(id)).length;
    const missing = total - matched;

    return {
      id: recipe.id,
      title: recipe.title,
      total_minutes: recipe.total_minutes,
      image_path: recipe.image_path,
      total_ingredients: total,
      matched_ingredients: matched,
      missing_ingredients: missing,
      match_score: matched / total
    };
  });

  // 4. Sorteer van hoogste match → laagste
  scoredRecipes.sort((a, b) => b.match_score - a.match_score);

  res.status(200).json({ recipes: scoredRecipes });
}
