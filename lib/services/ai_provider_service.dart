import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum AiProvider {
  ollama('Ollama', 'Free, Local'),
  opencode('OpenCode', 'Free, Local'),
  claude('Claude', 'Premium'),
  chatgpt('ChatGPT', 'Premium'),
  copilot('Copilot', 'Premium'),
  manus('Manus', 'Premium'),
  deepseek('DeepSeek', 'Premium'),
  grok('Grok', 'Premium'),
}

extension AiProviderExtension on AiProvider {
  String get displayName => values[0];
  String get description => values[1];
  String get baseUrl {
    switch (this) {
      case AiProvider.ollama:
        return 'http://localhost:11434';
      case AiProvider.opencode:
        return 'http://localhost:8000';
      case AiProvider.claude:
        return 'https://api.anthropic.com';
      case AiProvider.chatgpt:
        return 'https://api.openai.com';
      case AiProvider.copilot:
        return 'https://api.github.com/copilot';
      case AiProvider.manus:
        return 'https://api.manus.im';
      case AiProvider.deepseek:
        return 'https://api.deepseek.com';
      case AiProvider.grok:
        return 'https://api.x.ai';
    }
  }

  bool get isLocal => this == AiProvider.ollama || this == AiProvider.opencode;
  bool get isPremium => !isLocal;
}

class AiProviderService {
  late Dio _dio;
  late SharedPreferences _prefs;
  late AiProvider _currentProvider;
  late String _apiKey;

  AiProviderService() {
    _dio = Dio();
    _initializeProvider();
  }

  Future<void> _initializeProvider() async {
    _prefs = await SharedPreferences.getInstance();
    final savedProvider = _prefs.getString('ai_provider') ?? 'ollama';
    _currentProvider = AiProvider.values.firstWhere(
      (p) => p.name == savedProvider,
      orElse: () => AiProvider.ollama,
    );
    _apiKey = _prefs.getString('ai_api_key') ?? '';
  }

  Future<void> setProvider(AiProvider provider, {String? apiKey}) async {
    _currentProvider = provider;
    await _prefs.setString('ai_provider', provider.name);
    if (apiKey != null) {
      _apiKey = apiKey;
      await _prefs.setString('ai_api_key', apiKey);
    }
  }

  AiProvider get currentProvider => _currentProvider;
  List<AiProvider> get availableProviders => AiProvider.values;
  List<AiProvider> get localProviders =>
      AiProvider.values.where((p) => p.isLocal).toList();
  List<AiProvider> get premiumProviders =>
      AiProvider.values.where((p) => p.isPremium).toList();

  Future<String> analyzeAuction({
    required String auctionTitle,
    required String auctionDescription,
    required double estimatedPrice,
  }) async {
    final prompt = '''
Analyze this government auction and provide:
1. Summary of the item
2. Fair market value estimate
3. Risk assessment
4. Bidding strategy recommendation

Auction Title: $auctionTitle
Description: $auctionDescription
Estimated Price: \$$estimatedPrice

Provide a concise, actionable analysis.
''';

    return _sendMessage(prompt);
  }

  Future<String> answerAuctionQuestion({
    required String auctionTitle,
    required String question,
  }) async {
    final prompt = '''
Answer this question about the auction: "$auctionTitle"

Question: $question

Provide a helpful, concise answer based on typical auction practices and the item being sold.
''';

    return _sendMessage(prompt);
  }

  Future<String> estimateCondition({
    required String itemDescription,
    required String observedCondition,
  }) async {
    final prompt = '''
Based on the following information, estimate the condition and potential issues:

Item: $itemDescription
Observed Condition: $observedCondition

Provide a professional assessment including:
1. Estimated condition grade (Excellent/Good/Fair/Poor)
2. Potential issues
3. Repair recommendations
4. Impact on value
''';

    return _sendMessage(prompt);
  }

  Future<String> _sendMessage(String prompt) async {
    try {
      switch (_currentProvider) {
        case AiProvider.ollama:
          return _queryOllama(prompt);
        case AiProvider.opencode:
          return _queryOpenCode(prompt);
        case AiProvider.claude:
          return _queryClaude(prompt);
        case AiProvider.chatgpt:
          return _queryChatGPT(prompt);
        case AiProvider.copilot:
          return _queryCopilot(prompt);
        case AiProvider.manus:
          return _queryManus(prompt);
        case AiProvider.deepseek:
          return _queryDeepSeek(prompt);
        case AiProvider.grok:
          return _queryGrok(prompt);
      }
    } catch (e) {
      throw Exception('Error querying AI provider: $e');
    }
  }

  Future<String> _queryOllama(String prompt) async {
    try {
      final response = await _dio.post(
        '${AiProvider.ollama.baseUrl}/api/generate',
        data: {
          'model': 'mistral',
          'prompt': prompt,
          'stream': false,
        },
      );
      return response.data['response'] ?? 'No response';
    } catch (e) {
      throw Exception('Ollama error: $e');
    }
  }

  Future<String> _queryOpenCode(String prompt) async {
    try {
      final response = await _dio.post(
        '${AiProvider.opencode.baseUrl}/v1/completions',
        data: {
          'prompt': prompt,
          'max_tokens': 500,
        },
      );
      return response.data['choices'][0]['text'] ?? 'No response';
    } catch (e) {
      throw Exception('OpenCode error: $e');
    }
  }

  Future<String> _queryClaude(String prompt) async {
    try {
      final response = await _dio.post(
        '${AiProvider.claude.baseUrl}/v1/messages',
        options: Options(
          headers: {
            'x-api-key': _apiKey,
            'anthropic-version': '2023-06-01',
          },
        ),
        data: {
          'model': 'claude-3-sonnet-20240229',
          'max_tokens': 1024,
          'messages': [
            {'role': 'user', 'content': prompt}
          ],
        },
      );
      return response.data['content'][0]['text'] ?? 'No response';
    } catch (e) {
      throw Exception('Claude error: $e');
    }
  }

  Future<String> _queryChatGPT(String prompt) async {
    try {
      final response = await _dio.post(
        '${AiProvider.chatgpt.baseUrl}/v1/chat/completions',
        options: Options(
          headers: {'Authorization': 'Bearer $_apiKey'},
        ),
        data: {
          'model': 'gpt-4-turbo',
          'messages': [
            {'role': 'user', 'content': prompt}
          ],
          'max_tokens': 1024,
        },
      );
      return response.data['choices'][0]['message']['content'] ?? 'No response';
    } catch (e) {
      throw Exception('ChatGPT error: $e');
    }
  }

  Future<String> _queryCopilot(String prompt) async {
    try {
      final response = await _dio.post(
        '${AiProvider.copilot.baseUrl}/copilot_completions',
        options: Options(
          headers: {'Authorization': 'Bearer $_apiKey'},
        ),
        data: {
          'prompt': prompt,
          'max_tokens': 1024,
        },
      );
      return response.data['completion'] ?? 'No response';
    } catch (e) {
      throw Exception('Copilot error: $e');
    }
  }

  Future<String> _queryManus(String prompt) async {
    try {
      final response = await _dio.post(
        '${AiProvider.manus.baseUrl}/v1/chat/completions',
        options: Options(
          headers: {'Authorization': 'Bearer $_apiKey'},
        ),
        data: {
          'messages': [
            {'role': 'user', 'content': prompt}
          ],
          'max_tokens': 1024,
        },
      );
      return response.data['choices'][0]['message']['content'] ?? 'No response';
    } catch (e) {
      throw Exception('Manus error: $e');
    }
  }

  Future<String> _queryDeepSeek(String prompt) async {
    try {
      final response = await _dio.post(
        '${AiProvider.deepseek.baseUrl}/chat/completions',
        options: Options(
          headers: {'Authorization': 'Bearer $_apiKey'},
        ),
        data: {
          'model': 'deepseek-chat',
          'messages': [
            {'role': 'user', 'content': prompt}
          ],
          'max_tokens': 1024,
        },
      );
      return response.data['choices'][0]['message']['content'] ?? 'No response';
    } catch (e) {
      throw Exception('DeepSeek error: $e');
    }
  }

  Future<String> _queryGrok(String prompt) async {
    try {
      final response = await _dio.post(
        '${AiProvider.grok.baseUrl}/chat/completions',
        options: Options(
          headers: {'Authorization': 'Bearer $_apiKey'},
        ),
        data: {
          'model': 'grok-1',
          'messages': [
            {'role': 'user', 'content': prompt}
          ],
          'max_tokens': 1024,
        },
      );
      return response.data['choices'][0]['message']['content'] ?? 'No response';
    } catch (e) {
      throw Exception('Grok error: $e');
    }
  }
}
