import { initPlasmicLoader } from "@plasmicapp/loader-nextjs";
import ImageUploadInput from "./components/ImageUploadInput";
import MultiSelectInput from "./components/MultiSelectInput";

const PROJECT_ID = process.env.NEXT_PUBLIC_PLASMIC_PROJECT_ID!;
const PUBLIC_TOKEN = process.env.NEXT_PUBLIC_PLASMIC_PUBLIC_TOKEN!;

export const PLASMIC = initPlasmicLoader({
  projects: [{ id: PROJECT_ID, token: PUBLIC_TOKEN }],
  preview: false,
});

PLASMIC.registerComponent(ImageUploadInput, {
  name: "ImageUploadInput",
  importPath: "./components/ImageUploadInput",
  props: {
    name:         { type: "string", defaultValue: "image_path" },
    bucket:       { type: "string", defaultValue: "recipe-images" },
    outputMode:   { type: "choice", options: ["url","path"], defaultValue: "path" },
    buttonLabel:  { type: "string", defaultValue: "Choose image" },
    defaultValue: { type: "string", defaultValue: "" },
    maxMb:        { type: "number", defaultValue: 5 },

    // Controlled input API — let Plasmic treat it like a Form Field
    value:    { type: "string", displayName: "Value" },
    onChange: {
      type: "eventHandler",                 // <- important
      displayName: "onChange",
      argTypes: [{ name: "value", type: "string" }],
    },
  },
});

import IngredientsInput from "./components/IngredientsInput";

PLASMIC.registerComponent(IngredientsInput, {
  name: "IngredientsInput",
  props: {
    name: {
      type: "string",
      defaultValue: "ingredients_list"
    }
  },
});

PLASMIC.registerComponent(MultiSelectInput, {
  name: "MultiSelectInput",
  props: {
    name: {
      type: "string",
      description: "De naam van de input (wordt gebruikt in hidden field)",
    },
    label: {
      type: "string",
      description: "Label boven de groep checkboxes",
    },
    options: {
      type: "array",
      description: "Lijst van beschikbare opties",
      defaultValue: [],
    },
    defaultValue: {
      type: "array",
      description: "Optioneel: vooraf geselecteerde waarden",
      defaultValue: [],
    },
  },
});
