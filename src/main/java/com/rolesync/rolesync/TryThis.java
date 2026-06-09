package com.rolesync.rolesync;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;

public class TryThis {

    private static final String ReviewPrompt = """
                        Eres un evaluador automático de calidad de reseñas escritas para una plataforma de campañas de rol y comunidades online.
            Debes analizar exclusivamente el contenido textual de la siguiente reseña y devolver ÚNICAMENTE un número entero entre 0 y 100.
            La puntuación debe basarse en los siguientes criterios:
            1. Longitud mínima razonable
            - Penaliza reseñas demasiado cortas, vacías o genéricas.
            - Valora positivamente textos desarrollados y útiles.
            2. Variedad léxica
            - Valora el uso de vocabulario variado.
            - Penaliza repeticiones excesivas, frases plantilla o texto muy simple.
            3. Presencia de feedback concreto
            - Valora menciones específicas sobre comportamiento, organización, narrativa, comunicación, puntualidad, calidad interpretativa, escritura o experiencia real.
            - Penaliza comentarios vagos como “todo bien” o “muy bueno”.
            4. Sentimiento equilibrado
            - Valora reseñas que mantengan un tono razonable y creíble.
            - Penaliza textos extremadamente emocionales, agresivos o claramente sesgados.
            - Una reseña puede ser negativa y aun así obtener buena puntuación si está bien argumentada.
            5. Argumentación
            - Valora explicaciones, ejemplos y justificaciones.
            - Penaliza afirmaciones sin contexto o sin soporte.
            Reglas obligatorias:
            - Devuelve SOLO el número.
            - No expliques la puntuación.
            - No añadas texto adicional.
            - No uses JSON.
            - No uses markdown.
            - El resultado debe ser un decimal con una cifra de precisión entre 0 y 100.
            Reseña:
            {ENTRADA_DE_RESEÑA}
                    """;

    public static void main(String[] args) {
        Client client = new Client();
        String comment = """
        La campaña fue increíble, con una narrativa envolvente y personajes bien desarrollados. 
        La organización fue impecable, y el máster mantuvo un ritmo perfecto durante toda la aventura. 
        La comunicación fue fluida, y todos los jugadores se sintieron incluidos y valorados. 
        La calidad interpretativa de los participantes fue excepcional, lo que hizo que cada sesión fuera memorable. 
        Sin embargo, hubo algunos momentos en los que la puntualidad no se respetó completamente, lo que afectó un poco la experiencia general. 
        A pesar de eso, la campaña superó mis expectativas y definitivamente recomendaría esta comunidad a otros entusiastas de los juegos de rol.
        """;
        String prompt = ReviewPrompt.replace("{ENTRADA_DE_RESEÑA}", comment);
        GenerateContentResponse response = client.models.generateContent("gemini-2.5-flash", prompt, null);
        client.close();
        System.out.println(response.text().trim());
    }
}
