import { supabase } from "../lib/supabaseClient";

export default function Recipes({ items }: { items: any[] }) {
  return (
    <main style={{maxWidth:1000, margin:"40px auto", fontFamily:"system-ui"}}>
      <h1>Recipes</h1>
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:12}}>
        {items.map((r) => {
          const { data } = supabase.storage.from("recipe-images").getPublicUrl(r.image_path);
          const url = data?.publicUrl;
          return (
            <article key={r.id} style={{border:"1px solid #eee", borderRadius:12, overflow:"hidden"}}>
              {url && <img src={url} alt={r.title} style={{width:"100%", height:160, objectFit:"cover"}} />}
              <div style={{padding:12}}>
                <h3 style={{margin:"0 0 6px"}}>{r.title}</h3>
                <small>{r.total_minutes ? `${r.total_minutes} min` : ""} {r.tags && `• ${r.tags}`}</small>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}

export async function getServerSideProps() {
  const { data: items, error } = await (await import("../lib/supabaseClient")).supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });
  return { props: { items: items ?? [] } };
}
