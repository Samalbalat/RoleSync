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

export const mockCampaignCharacters = [
  {
    id: 101,
    name: "Alex el Fuerte",
    avatar_url: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80",
    attributes: {}
  },
  {
    id: 102,
    name: "Lyra Brisaoscura",
    avatar_url: "", // Probará el generador de iniciales
    attributes: {}
  },
  {
    id: 103,
    name: "Gimli Escudo de Roble",
    avatar_url: "https://unsplash.com/es/fotos/silueta-de-la-ilustracion-del-hombre-2LowviVHZ-E",
    attributes: {}
  }
];

// src/data/mockCharacters.js

export const mockFullCharacters = [
  {
    id: 101,
    user_id: 42,
    name: "Alex el Fuerte",
    avatar_url: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    campaign_id: 22,
    campaign_name: "La Mina Perdida de Phandelver",
    template_id: 1,
    attributes: {
      "Raza": "Humano",
      "Fuerza": 18,
      "Vida": 45,
      "Pelo": "Castaño",
      "Ojos": "Verdes",
      "Altura": "1.80m",
      "Historia": "Nacido en las frías montañas del norte, Alex siempre destacó por su fuerza descomunal...",
      "Inspiración del DM": true
    }
  },
  {
    id: 102,
    user_id: 15,
    name: "Lyra Brisaoscura",
    avatar_url: "", 
    campaign_id: 22,
    campaign_name: "La Mina Perdida de Phandelver",
    template_id: 1,
    attributes: {
      "Raza": "Elfa",
      "Fuerza": 10,
      "Vida": 22,
      "Historia": "Huyó de su bosque natal buscando respuestas...",
      "Inspiración del DM": false
    }
  },
  {
    id: 103,
    user_id: 15,
    name: "Gimli Escudo de Roble",
    avatar_url: "", 
    campaign_id: 22,
    campaign_name: "La Mina Perdida de Phandelver",
    template_id: 1,
    attributes: {
      "Raza": "Enano",
      "Fuerza": 14,
      "Vida": 30,
      "Historia": "Hijo de un gran herrero, Gimli ha heredado su fuerza y su espíritu combativo...",
      "Inspiración del DM": true
    }
  },
  
];

// Simulamos la llamada a la API
export const fetchCharacterById = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const character = mockFullCharacters.find(c => c.id === id);
      resolve(character);
    }, 600); // Simulamos 600ms de latencia de red
  });
};