import 'package:flutter/material.dart';
import 'package:civicbid_mobile/utils/theme.dart';

class AuctionDetailScreen extends StatefulWidget {
  final String? auctionId;

  const AuctionDetailScreen({Key? key, this.auctionId}) : super(key: key);

  @override
  State<AuctionDetailScreen> createState() => _AuctionDetailScreenState();
}

class _AuctionDetailScreenState extends State<AuctionDetailScreen> {
  final TextEditingController _chatController = TextEditingController();
  bool _isWatchlisted = false;
  int _selectedImageIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Auction Details'),
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        actions: [
          IconButton(
            icon: Icon(
              _isWatchlisted ? Icons.favorite : Icons.favorite_border,
              color: _isWatchlisted ? AppTheme.error : Colors.black,
            ),
            onPressed: () {
              setState(() => _isWatchlisted = !_isWatchlisted);
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Gallery
            SizedBox(
              height: 300,
              child: PageView.builder(
                onPageChanged: (index) {
                  setState(() => _selectedImageIndex = index);
                },
                itemCount: 5,
                itemBuilder: (context, index) {
                  return Container(
                    color: AppTheme.neutral100,
                    child: const Center(
                      child: Icon(Icons.image, size: 64, color: AppTheme.neutral300),
                    ),
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(AppTheme.spacing16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  5,
                  (index) => Container(
                    width: 8,
                    height: 8,
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: index == _selectedImageIndex
                          ? AppTheme.primary
                          : AppTheme.neutral300,
                    ),
                  ),
                ),
              ),
            ),

            // Auction Info
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppTheme.spacing16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Government Surplus Property Auction',
                    style: AppTheme.headingSmall,
                  ),
                  const SizedBox(height: AppTheme.spacing8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '\$5,000',
                        style: AppTheme.headingMedium.copyWith(
                          color: AppTheme.primary,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppTheme.spacing12,
                          vertical: AppTheme.spacing6,
                        ),
                        decoration: BoxDecoration(
                          color: AppTheme.success.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                        ),
                        child: Text(
                          'Ending in 2 days',
                          style: AppTheme.labelSmall.copyWith(
                            color: AppTheme.success,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppTheme.spacing16),

                  // Description
                  Text(
                    'Description',
                    style: AppTheme.labelLarge,
                  ),
                  const SizedBox(height: AppTheme.spacing8),
                  Text(
                    'This is a government surplus property auction. The item is in good condition and ready for inspection.',
                    style: AppTheme.bodyMedium,
                  ),
                  const SizedBox(height: AppTheme.spacing20),

                  // AI Analysis Section
                  Container(
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
                      border: Border.all(color: AppTheme.primary.withOpacity(0.2)),
                    ),
                    padding: const EdgeInsets.all(AppTheme.spacing16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.smart_toy, color: AppTheme.primary),
                            const SizedBox(width: AppTheme.spacing8),
                            Text(
                              'AI Analysis',
                              style: AppTheme.labelLarge.copyWith(
                                color: AppTheme.primary,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: AppTheme.spacing12),
                        _AnalysisItem(
                          label: 'Fair Market Value',
                          value: '\$7,500',
                          icon: Icons.trending_up,
                        ),
                        const SizedBox(height: AppTheme.spacing12),
                        _AnalysisItem(
                          label: 'Estimated Savings',
                          value: '\$2,500 (33%)',
                          icon: Icons.savings,
                        ),
                        const SizedBox(height: AppTheme.spacing12),
                        _AnalysisItem(
                          label: 'Risk Level',
                          value: 'Low',
                          icon: Icons.warning_amber,
                        ),
                        const SizedBox(height: AppTheme.spacing12),
                        Text(
                          'Bidding Strategy: Start at \$4,500 and bid incrementally. This property shows good potential for value.',
                          style: AppTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppTheme.spacing20),

                  // AI Chat Section
                  Text(
                    'Ask AI Assistant',
                    style: AppTheme.labelLarge,
                  ),
                  const SizedBox(height: AppTheme.spacing12),
                ],
              ),
            ),

            // Chat Messages
            Container(
              height: 300,
              margin: const EdgeInsets.symmetric(horizontal: AppTheme.spacing16),
              decoration: BoxDecoration(
                color: AppTheme.neutral50,
                borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                border: Border.all(color: AppTheme.neutral200),
              ),
              child: ListView(
                padding: const EdgeInsets.all(AppTheme.spacing12),
                children: [
                  _ChatBubble(
                    message: 'Hi! I can help you with questions about this auction.',
                    isAi: true,
                  ),
                  const SizedBox(height: AppTheme.spacing8),
                  _ChatBubble(
                    message: 'What is the condition of this property?',
                    isAi: false,
                  ),
                  const SizedBox(height: AppTheme.spacing8),
                  _ChatBubble(
                    message:
                        'The property is in good condition with minor cosmetic wear. It has been well-maintained.',
                    isAi: true,
                  ),
                ],
              ),
            ),

            // Chat Input
            Padding(
              padding: const EdgeInsets.all(AppTheme.spacing16),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _chatController,
                      decoration: InputDecoration(
                        hintText: 'Ask a question...',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                          borderSide: const BorderSide(color: AppTheme.neutral200),
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: AppTheme.spacing12,
                          vertical: AppTheme.spacing12,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: AppTheme.spacing8),
                  FloatingActionButton(
                    mini: true,
                    onPressed: () {
                      // Send message
                      _chatController.clear();
                    },
                    child: const Icon(Icons.send),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _chatController.dispose();
    super.dispose();
  }
}

class _AnalysisItem extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _AnalysisItem({
    required this.label,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Icon(icon, color: AppTheme.primary, size: 20),
            const SizedBox(width: AppTheme.spacing8),
            Text(label, style: AppTheme.bodyMedium),
          ],
        ),
        Text(
          value,
          style: AppTheme.labelLarge.copyWith(color: AppTheme.primary),
        ),
      ],
    );
  }
}

class _ChatBubble extends StatelessWidget {
  final String message;
  final bool isAi;

  const _ChatBubble({
    required this.message,
    required this.isAi,
  });

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: isAi ? Alignment.centerLeft : Alignment.centerRight,
      child: Container(
        decoration: BoxDecoration(
          color: isAi ? AppTheme.neutral200 : AppTheme.primary,
          borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
        ),
        padding: const EdgeInsets.symmetric(
          horizontal: AppTheme.spacing12,
          vertical: AppTheme.spacing8,
        ),
        child: Text(
          message,
          style: AppTheme.bodySmall.copyWith(
            color: isAi ? AppTheme.neutral900 : Colors.white,
          ),
        ),
      ),
    );
  }
}
