import { invokeLLM } from "./_core/llm";

export interface ImageAnalysisResult {
  conditionAssessment: string;
  estimatedCondition: "excellent" | "good" | "fair" | "poor";
  visibleIssues: string[];
  recommendations: string[];
  confidence: number;
}

/**
 * Analyze property images using LLM vision capabilities
 * Returns condition assessment, identified issues, and recommendations
 */
export async function analyzePropertyImage(
  imageUrl: string
): Promise<ImageAnalysisResult> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an expert property inspector and real estate appraiser. Analyze the provided property image and provide a detailed condition assessment. 
          
          Return your analysis in the following JSON format:
          {
            "conditionAssessment": "detailed description of the property condition",
            "estimatedCondition": "excellent|good|fair|poor",
            "visibleIssues": ["issue1", "issue2", ...],
            "recommendations": ["recommendation1", "recommendation2", ...],
            "confidence": 0.0-1.0
          }`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this property image and provide a condition assessment.",
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high",
              },
            },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "property_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              conditionAssessment: {
                type: "string",
                description: "Detailed description of property condition",
              },
              estimatedCondition: {
                type: "string",
                enum: ["excellent", "good", "fair", "poor"],
                description: "Overall condition rating",
              },
              visibleIssues: {
                type: "array",
                items: { type: "string" },
                description: "List of visible issues or concerns",
              },
              recommendations: {
                type: "array",
                items: { type: "string" },
                description: "Recommendations for repairs or improvements",
              },
              confidence: {
                type: "number",
                description: "Confidence level of the assessment (0-1)",
              },
            },
            required: [
              "conditionAssessment",
              "estimatedCondition",
              "visibleIssues",
              "recommendations",
              "confidence",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    // Extract the JSON response
    const content = response.choices[0]?.message.content;
    if (!content || typeof content !== "string") {
      throw new Error("Invalid response from LLM");
    }

    const analysis = JSON.parse(content) as ImageAnalysisResult;
    return analysis;
  } catch (error) {
    console.error("Image analysis error:", error);
    throw error;
  }
}

/**
 * Analyze multiple property images and aggregate results
 */
export async function analyzePropertyImages(
  imageUrls: string[]
): Promise<{
  images: ImageAnalysisResult[];
  aggregatedAssessment: string;
  overallCondition: "excellent" | "good" | "fair" | "poor";
  allIssues: string[];
  allRecommendations: string[];
}> {
  try {
    const analyses = await Promise.all(
      imageUrls.map((url) => analyzePropertyImage(url))
    );

    // Aggregate results
    const allIssues = Array.from(
      new Set(analyses.flatMap((a) => a.visibleIssues))
    );
    const allRecommendations = Array.from(
      new Set(analyses.flatMap((a) => a.recommendations))
    );

    // Determine overall condition (worst of all images)
    const conditionRanking = {
      poor: 0,
      fair: 1,
      good: 2,
      excellent: 3,
    };
    const overallCondition = analyses.reduce(
      (worst, current) => {
        const worstRank =
          conditionRanking[worst as keyof typeof conditionRanking];
        const currentRank =
          conditionRanking[
            current.estimatedCondition as keyof typeof conditionRanking
          ];
        return currentRank < worstRank ? current.estimatedCondition : worst;
      },
      "excellent" as "excellent" | "good" | "fair" | "poor"
    );

    // Create aggregated assessment
    const aggregatedAssessment = `
      Based on analysis of ${analyses.length} property image(s):
      
      Overall Condition: ${overallCondition.toUpperCase()}
      Average Confidence: ${(analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length * 100).toFixed(1)}%
      
      Key Findings:
      ${allIssues.length > 0 ? `Issues Identified: ${allIssues.join(", ")}` : "No major issues identified"}
      
      Recommendations:
      ${allRecommendations.length > 0 ? allRecommendations.map((r, i) => `${i + 1}. ${r}`).join("\n") : "Property appears to be in good condition"}
    `.trim();

    return {
      images: analyses,
      aggregatedAssessment,
      overallCondition,
      allIssues,
      allRecommendations,
    };
  } catch (error) {
    console.error("Multiple image analysis error:", error);
    throw error;
  }
}
