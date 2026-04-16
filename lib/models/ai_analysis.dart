class AiAnalysis {
  final String id;
  final String auctionId;
  final String summary;
  final double estimatedValue;
  final String riskAssessment;
  final String biddingStrategy;
  final List<String> risks;
  final List<String> opportunities;
  final DateTime createdAt;
  final String aiProvider;

  AiAnalysis({
    required this.id,
    required this.auctionId,
    required this.summary,
    required this.estimatedValue,
    required this.riskAssessment,
    required this.biddingStrategy,
    required this.risks,
    required this.opportunities,
    required this.createdAt,
    required this.aiProvider,
  });

  factory AiAnalysis.fromJson(Map<String, dynamic> json) {
    return AiAnalysis(
      id: json['id'] ?? '',
      auctionId: json['auctionId'] ?? '',
      summary: json['summary'] ?? '',
      estimatedValue: (json['estimatedValue'] ?? 0).toDouble(),
      riskAssessment: json['riskAssessment'] ?? '',
      biddingStrategy: json['biddingStrategy'] ?? '',
      risks: List<String>.from(json['risks'] ?? []),
      opportunities: List<String>.from(json['opportunities'] ?? []),
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toString()),
      aiProvider: json['aiProvider'] ?? 'unknown',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'auctionId': auctionId,
      'summary': summary,
      'estimatedValue': estimatedValue,
      'riskAssessment': riskAssessment,
      'biddingStrategy': biddingStrategy,
      'risks': risks,
      'opportunities': opportunities,
      'createdAt': createdAt.toIso8601String(),
      'aiProvider': aiProvider,
    };
  }
}
