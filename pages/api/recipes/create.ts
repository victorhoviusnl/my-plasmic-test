// pages/api/recipes/create.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    title,
    steps,
    image_path,
    ingredients_list,
    // Tijden (als optional fields)
    prep_time,
    cook_time,
    oven_time,
    cooling_time,
    resting_time,
    marinade_time,
    stew_time,
    chill_time
  } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Missing recipe title' });
  }

  // 🧪 Log alle waarden die naar Supabase gaan
  console.log("📦 Inserting recipe with values:", {
    title,
    steps,
    image_path,
    prep_time,
    cook_time,
    oven_time,
    cooling_time,
    resting_time,
    marinade_time,
    stew_time,
    chill_time
  });

  // Recept invoegen inclusief tijdvelden
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .insert([
      {
        title,
        steps,
        image_path,
        prep_time,
        cook_time,
        oven_time,
        cooling_time,
        resting_time,
        marinade_time,
        stew_time,
        chill_time
      }
    ])
    .select()
    .single();

  if (recipeError) {
    console.error("❌ Supabase insert error:", recipeError);
    return res.status(500).json({ error: 'Failed to insert recipe', details: recipeError });
  }

  // Ingrediënten verwerken
  if (Array.isArray(ingredients_list) && ingredients_list.length > 0) {
    for (const ing of ingredients_list) {
      const name = (ing.name || '').trim().toLowerCase();
      const unit = ing.unit?.trim() || null;
      const amount = ing.amount?.trim() || null;
      if (!name) continue;

      // Ingrediënt ophalen of toevoegen
      const { data: existing, error: lookupError } = await supabase
        .from('ingredients')
        .select('id')
        .ilike('name', name)
        .maybeSingle();

      let ingredient_id = existing?.id;

      if (!ingredient_id) {
        const { data: newIng, error: insertError } = await supabase
          .from('ingredients')
          .insert([{ name }])
          .select()
          .single();
        if (insertError) {
          console.error("❌ Fout bij ingrediënt toevoegen:", insertError);
          return res.status(500).json({ error: 'Failed to insert ingredient', details: insertError });
        }
        ingredient_id = newIng.id;
      }

      // Ingrediënt koppelen aan recept
      const { error: linkError } = await supabase.from('recipe_ingredients').insert([
        {
          recipe_id: recipe.id,
          ingredient_id,
          amount,
          unit
        }
      ]);

      if (linkError) {
        console.error("❌ Fout bij koppelen van ingrediënt:", linkError, {
          recipe_id: recipe.id,
          ingredient_id,
          amount,
          unit
        });
        return res.status(500).json({ error: 'Failed to link ingredient', details: linkError });
      }
    }
  }

  return res.status(200).json(recipe); // volledige object terugsturen incl. id
}
