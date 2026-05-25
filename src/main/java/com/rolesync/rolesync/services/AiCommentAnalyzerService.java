package com.rolesync.rolesync.services;

import org.springframework.stereotype.Service;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;

@Service
public class AiCommentAnalyzerService {

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

        public double analyzeComment(String comment) {
            Client client = new Client();
            String prompt = ReviewPrompt.replace("{ENTRADA_DE_RESEÑA}", comment);
            GenerateContentResponse response = client.models.generateContent("gemini-2.5-flash", prompt, null);
            client.close();
            Double rawAiScore = Double.parseDouble(response.text().trim());
            double normalizedAi = (rawAiScore / 100.0) * 0.3;
            return normalizedAi;
        }

}
