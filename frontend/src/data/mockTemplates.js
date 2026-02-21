// src/data/mockTemplates.js

export const mockTemplates = {
  
  id: 1, 
  campaign_id: 22,
  campaign_name: "La Mina Perdida de Phandelver",
  schema_definition: [
    {
      key: "raza_x89a",
      label: "Raza del Personaje",
      type: "short_text",
      required: true,
    },
    {
      key: "fuerza_b34c",
      label: "Fuerza Física",
      type: "number",
      required: true,
      min: 1,
      max: 20,
    },
    {
      key: "vida_h99p",
      label: "Puntos de Golpe (Vida)",
      type: "number",
      required: true,
      min: 1,
    },
    {
      key: "historia_m55q",
      label: "Historia y Trasfondo",
      type: "long_text",
      required: false,
    },
    {
      key: "inspiracion_d77e",
      label: "¿Tiene inspiración del DM?",
      type: "boolean",
      required: false,
    }
  ]
};