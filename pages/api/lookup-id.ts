import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ Gebruik service role key!
);

export default async function handler(req, res) {
  const { table, name } = req.query;

  if (!table || !name) {
    return res.status(400).json({ error: 'Missing table or name' });
  }

  const { data, error } = await supabase
    .from(table)
    .select('id')
    .eq('name', name)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Not found' });
  }

  return res.status(200).json({ id: data.id });
}
