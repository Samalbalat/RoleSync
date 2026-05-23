package com.rolesync.rolesync.controller;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import com.rolesync.rolesync.dto.reviewercontroller.CreateReviewDTO;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.model.ReviewTargetType;
import com.rolesync.rolesync.model.UserMetrics;
import com.rolesync.rolesync.repository.ProfileRepository;
import com.rolesync.rolesync.repository.UserMetricsRepository;
import com.rolesync.rolesync.services.ReviewService;
import com.rolesync.rolesync.services.UserMetricsService;
import com.rolesync.rolesync.utils.UtilsCalls;

import lombok.RequiredArgsConstructor;

import org.checkerframework.checker.units.qual.s;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/rolesync/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final ProfileRepository profileRepository;
    private final UserMetricsRepository userMetricsRepository;
    private final UtilsCalls utilsCalls;
    private final UserMetricsService userMetricsService;

    private static final String ERR_NOT_AUTHORIZED = "Not correctly authenticated or profile does not exist";

    @PostMapping
    public ResponseEntity<?> createReview(
            @RequestBody @Valid CreateReviewDTO dto,
            @RequestHeader("X-Profile-Name") String profileName,
            Authentication authentication) {
        Profile reviewer = profileRepository.findByProfilename(profileName)
                .orElse(null);
        if (!utilsCalls.checkAuthAndProfile(authentication, profileName)) {
            return ResponseEntity.status(403).body(ERR_NOT_AUTHORIZED);
        }
        try {
            // Introducimos un factor de calidad de la reseña basado en IA para ajustar el
            // peso de su influencia en la credibilidad del usuario
            Client client = new Client();
            String prompt = ReviewPrompt.replace("{ENTRADA_DE_RESEÑA}", dto.comment());
            GenerateContentResponse response = client.models.generateContent("gemini-2.5-flash", prompt, null);
            Double rawAiScore = Double.parseDouble(response.text().trim());
            double normalizedAi = (rawAiScore / 100.0) * 0.3;
            Double userCredibility = userMetricsRepository
                    .findByUser(utilsCalls.getUserFromUsername(authentication).get()).get().getCredibilityScore();
            System.out.println("AI Score: " + response.text());
            System.out.println("Normalized AI Score: " + normalizedAi);
            System.out.println("User Credibility: " + userCredibility);
            System.out.println("Final Score: " + (0.2 + 1.8 * (userCredibility + normalizedAi)));
            // El peso final de la reseña se calcula como una combinación de la credibilidad
            // del usuario y la calidad de la reseña según IA,
            // con un mínimo de 0.2 para evitar que reseñas de usuarios nuevos o con baja
            // credibilidad no tengan ningún impacto.
            Double finalScore = 0.2 + 1.8 * (userCredibility + normalizedAi);
            return ResponseEntity.ok(reviewService.createReview(reviewer, dto, finalScore));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getReviews(
            @RequestParam ReviewTargetType type,
            @RequestParam Long targetId,
            @RequestHeader("X-Profile-Name") String profileName,
            Authentication authentication) {
        if (!utilsCalls.checkAuthAndProfile(authentication, profileName)) {
            return ResponseEntity.status(403).body(ERR_NOT_AUTHORIZED);
        }
        return ResponseEntity.ok(
                reviewService.getReviews(type, targetId));
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(
            @RequestParam ReviewTargetType type,
            @RequestParam Long targetId,
            @RequestHeader("X-Profile-Name") String profileName,
            Authentication authentication) {
        if (!utilsCalls.checkAuthAndProfile(authentication, profileName)) {
            return ResponseEntity.status(403).body(ERR_NOT_AUTHORIZED);
        }
        return ResponseEntity.ok(
                reviewService.getSummary(type, targetId));
    }

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
}
