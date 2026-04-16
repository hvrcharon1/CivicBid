import 'package:dio/dio.dart';
import 'package:civicbid_mobile/models/auction.dart';
import 'package:civicbid_mobile/models/ai_analysis.dart';

class ApiService {
  late Dio _dio;
  static const String baseUrl = 'https://civicbid-eelblmvg.manus.space/api';

  ApiService() {
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        contentType: 'application/json',
      ),
    );

    // Add interceptors
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          // Add auth token if available
          return handler.next(options);
        },
        onError: (error, handler) {
          return handler.next(error);
        },
      ),
    );
  }

  // Auction endpoints
  Future<List<Auction>> searchAuctions({
    String? query,
    String? category,
    String? location,
    double? minPrice,
    double? maxPrice,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final response = await _dio.get(
        '/trpc/auction.search',
        queryParameters: {
          'query': query,
          'category': category,
          'location': location,
          'minPrice': minPrice,
          'maxPrice': maxPrice,
          'page': page,
          'limit': limit,
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['result']['data'];
        return data.map((json) => Auction.fromJson(json)).toList();
      }
      throw Exception('Failed to load auctions');
    } catch (e) {
      throw Exception('Error searching auctions: $e');
    }
  }

  Future<Auction> getAuctionDetail(String auctionId) async {
    try {
      final response = await _dio.get('/trpc/auction.getById', queryParameters: {
        'id': auctionId,
      });

      if (response.statusCode == 200) {
        return Auction.fromJson(response.data['result']['data']);
      }
      throw Exception('Failed to load auction details');
    } catch (e) {
      throw Exception('Error fetching auction: $e');
    }
  }

  // AI Analysis endpoints
  Future<AiAnalysis> analyzeAuction(String auctionId) async {
    try {
      final response = await _dio.post(
        '/trpc/ai.analyzeAuction',
        data: {'auctionId': auctionId},
      );

      if (response.statusCode == 200) {
        return AiAnalysis.fromJson(response.data['result']['data']);
      }
      throw Exception('Failed to analyze auction');
    } catch (e) {
      throw Exception('Error analyzing auction: $e');
    }
  }

  // Watchlist endpoints
  Future<void> addToWatchlist(String auctionId) async {
    try {
      await _dio.post(
        '/trpc/watchlist.add',
        data: {'auctionId': auctionId},
      );
    } catch (e) {
      throw Exception('Error adding to watchlist: $e');
    }
  }

  Future<void> removeFromWatchlist(String auctionId) async {
    try {
      await _dio.post(
        '/trpc/watchlist.remove',
        data: {'auctionId': auctionId},
      );
    } catch (e) {
      throw Exception('Error removing from watchlist: $e');
    }
  }

  Future<List<Auction>> getWatchlist() async {
    try {
      final response = await _dio.get('/trpc/watchlist.list');

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['result']['data'];
        return data.map((json) => Auction.fromJson(json)).toList();
      }
      throw Exception('Failed to load watchlist');
    } catch (e) {
      throw Exception('Error fetching watchlist: $e');
    }
  }

  // Chat endpoints
  Future<String> sendChatMessage(String auctionId, String message) async {
    try {
      final response = await _dio.post(
        '/trpc/chat.send',
        data: {
          'auctionId': auctionId,
          'message': message,
        },
      );

      if (response.statusCode == 200) {
        return response.data['result']['data']['response'];
      }
      throw Exception('Failed to send message');
    } catch (e) {
      throw Exception('Error sending chat message: $e');
    }
  }

  // Recommendations endpoints
  Future<List<Auction>> getRecommendations() async {
    try {
      final response = await _dio.get('/trpc/recommendations.list');

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['result']['data'];
        return data.map((json) => Auction.fromJson(json)).toList();
      }
      throw Exception('Failed to load recommendations');
    } catch (e) {
      throw Exception('Error fetching recommendations: $e');
    }
  }
}
