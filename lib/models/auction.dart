class Auction {
  final String id;
  final String title;
  final String description;
  final String category;
  final String location;
  final double startingPrice;
  final double? currentPrice;
  final double? estimatedValue;
  final DateTime startDate;
  final DateTime endDate;
  final String source;
  final String sourceUrl;
  final List<String> imageUrls;
  final String? condition;
  final int? bidsCount;
  final double? latitude;
  final double? longitude;
  final bool isWatchlisted;
  final String status;

  Auction({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.location,
    required this.startingPrice,
    this.currentPrice,
    this.estimatedValue,
    required this.startDate,
    required this.endDate,
    required this.source,
    required this.sourceUrl,
    required this.imageUrls,
    this.condition,
    this.bidsCount,
    this.latitude,
    this.longitude,
    this.isWatchlisted = false,
    this.status = 'active',
  });

  Duration get timeRemaining {
    return endDate.difference(DateTime.now());
  }

  bool get isEnding {
    return timeRemaining.inHours < 24 && timeRemaining.isNegative == false;
  }

  bool get hasEnded {
    return DateTime.now().isAfter(endDate);
  }

  double get estimatedSavings {
    if (estimatedValue != null && currentPrice != null) {
      return estimatedValue! - currentPrice!;
    }
    return 0;
  }

  double get savingsPercentage {
    if (estimatedValue != null && currentPrice != null && estimatedValue! > 0) {
      return (estimatedSavings / estimatedValue!) * 100;
    }
    return 0;
  }

  factory Auction.fromJson(Map<String, dynamic> json) {
    return Auction(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? '',
      location: json['location'] ?? '',
      startingPrice: (json['startingPrice'] ?? 0).toDouble(),
      currentPrice: json['currentPrice']?.toDouble(),
      estimatedValue: json['estimatedValue']?.toDouble(),
      startDate: DateTime.parse(json['startDate'] ?? DateTime.now().toString()),
      endDate: DateTime.parse(json['endDate'] ?? DateTime.now().toString()),
      source: json['source'] ?? '',
      sourceUrl: json['sourceUrl'] ?? '',
      imageUrls: List<String>.from(json['imageUrls'] ?? []),
      condition: json['condition'],
      bidsCount: json['bidsCount'],
      latitude: json['latitude']?.toDouble(),
      longitude: json['longitude']?.toDouble(),
      isWatchlisted: json['isWatchlisted'] ?? false,
      status: json['status'] ?? 'active',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'category': category,
      'location': location,
      'startingPrice': startingPrice,
      'currentPrice': currentPrice,
      'estimatedValue': estimatedValue,
      'startDate': startDate.toIso8601String(),
      'endDate': endDate.toIso8601String(),
      'source': source,
      'sourceUrl': sourceUrl,
      'imageUrls': imageUrls,
      'condition': condition,
      'bidsCount': bidsCount,
      'latitude': latitude,
      'longitude': longitude,
      'isWatchlisted': isWatchlisted,
      'status': status,
    };
  }
}
