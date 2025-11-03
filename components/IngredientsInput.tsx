import { useState } from "react";

interface IngredientEntry {
  amount: string;
  unit: string;
  name: string;
}

interface IngredientsInputProps {
  name?: string; // Hidden input name (default is "ingredients_list")
}

export default function IngredientsInput({ name = "ingredients_list" }: IngredientsInputProps) {
  const [items, setItems] = useState<IngredientEntry[]>([
    { amount: "", unit: "", name: "" },
  ]);

  const handleChange = (index: number, field: keyof IngredientEntry, value: string) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addRow = () => {
    setItems(prev => [...prev, { amount: "", unit: "", name: "" }]);
  };

  const removeRow = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(items)}
        readOnly
      />

      {items.map((item, idx) => (
        <div key={idx} style={{ marginBottom: "0.5em" }}>
          <input
            type="text"
            placeholder="Amount"
            value={item.amount}
            onChange={(e) => handleChange(idx, "amount", e.target.value)}
            style={{ width: "80px", marginRight: "0.5em" }}
          />
          <input
            type="text"
            placeholder="Unit"
            value={item.unit}
            onChange={(e) => handleChange(idx, "unit", e.target.value)}
            style={{ width: "80px", marginRight: "0.5em" }}
          />
          <input
            type="text"
            placeholder="Ingredient"
            value={item.name}
            onChange={(e) => handleChange(idx, "name", e.target.value)}
            style={{ width: "150px", marginRight: "0.5em" }}
          />
          {items.length > 1 && (
            <button type="button" onClick={() => removeRow(idx)}>❌</button>
          )}
        </div>
      ))}

      <button type="button" onClick={addRow}>
        + Add Ingredient
      </button>
    </div>
  );
}
