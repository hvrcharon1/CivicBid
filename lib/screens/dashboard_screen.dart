import 'package:flutter/material.dart';
import 'package:civicbid_mobile/utils/theme.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Dashboard'),
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(AppTheme.spacing16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Stats Overview
              Text(
                'Your Activity',
                style: AppTheme.headingSmall,
              ),
              const SizedBox(height: AppTheme.spacing16),
              Row(
                children: [
                  Expanded(
                    child: _StatCard(
                      title: '5',
                      subtitle: 'Watchlist',
                      icon: Icons.favorite,
                      color: AppTheme.error,
                    ),
                  ),
                  const SizedBox(width: AppTheme.spacing12),
                  Expanded(
                    child: _StatCard(
                      title: '12',
                      subtitle: 'Total Bids',
                      icon: Icons.gavel,
                      color: AppTheme.primary,
                    ),
                  ),
                  const SizedBox(width: AppTheme.spacing12),
                  Expanded(
                    child: _StatCard(
                      title: '2',
                      subtitle: 'Won',
                      icon: Icons.emoji_events,
                      color: AppTheme.warning,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppTheme.spacing32),

              // Watchlist Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Watchlist',
                    style: AppTheme.headingSmall,
                  ),
                  TextButton(
                    onPressed: () {},
                    child: const Text('See All'),
                  ),
                ],
              ),
              const SizedBox(height: AppTheme.spacing12),
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: 3,
                itemBuilder: (context, index) {
                  return _WatchlistItem(index: index);
                },
              ),
              const SizedBox(height: AppTheme.spacing32),

              // Bid History Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Recent Bids',
                    style: AppTheme.headingSmall,
                  ),
                  TextButton(
                    onPressed: () {},
                    child: const Text('See All'),
                  ),
                ],
              ),
              const SizedBox(height: AppTheme.spacing12),
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: 3,
                itemBuilder: (context, index) {
                  return _BidHistoryItem(index: index);
                },
              ),
              const SizedBox(height: AppTheme.spacing32),

              // Recommendations Section
              Text(
                'Recommended for You',
                style: AppTheme.headingSmall,
              ),
              const SizedBox(height: AppTheme.spacing12),
              SizedBox(
                height: 200,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: 5,
                  itemBuilder: (context, index) {
                    return Container(
                      width: 150,
                      margin: const EdgeInsets.only(right: AppTheme.spacing12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
                        border: Border.all(color: AppTheme.neutral200),
                        boxShadow: const [AppTheme.shadowSmall],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            height: 100,
                            decoration: BoxDecoration(
                              color: AppTheme.neutral100,
                              borderRadius: const BorderRadius.only(
                                topLeft: Radius.circular(AppTheme.radiusLarge),
                                topRight: Radius.circular(AppTheme.radiusLarge),
                              ),
                            ),
                            child: const Center(
                              child: Icon(Icons.image, color: AppTheme.neutral300),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(AppTheme.spacing8),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Item ${index + 1}',
                                  style: AppTheme.labelSmall,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: AppTheme.spacing4),
                                Text(
                                  '\$${(1000 + index * 500)}',
                                  style: AppTheme.bodyMedium.copyWith(
                                    color: AppTheme.primary,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      padding: const EdgeInsets.all(AppTheme.spacing12),
      child: Column(
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: AppTheme.spacing8),
          Text(
            title,
            style: AppTheme.headingSmall.copyWith(color: color),
          ),
          const SizedBox(height: AppTheme.spacing4),
          Text(
            subtitle,
            style: AppTheme.bodySmall,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _WatchlistItem extends StatelessWidget {
  final int index;

  const _WatchlistItem({required this.index});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppTheme.spacing12),
      padding: const EdgeInsets.all(AppTheme.spacing12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
        border: Border.all(color: AppTheme.neutral200),
      ),
      child: Row(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: AppTheme.neutral100,
              borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
            ),
            child: const Icon(Icons.image, color: AppTheme.neutral300),
          ),
          const SizedBox(width: AppTheme.spacing12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Watchlist Item ${index + 1}',
                  style: AppTheme.labelLarge,
                ),
                const SizedBox(height: AppTheme.spacing4),
                Text(
                  'Ending in ${2 - index} days',
                  style: AppTheme.bodySmall,
                ),
              ],
            ),
          ),
          Text(
            '\$${(2000 + index * 1000)}',
            style: AppTheme.labelLarge.copyWith(color: AppTheme.primary),
          ),
        ],
      ),
    );
  }
}

class _BidHistoryItem extends StatelessWidget {
  final int index;

  const _BidHistoryItem({required this.index});

  @override
  Widget build(BuildContext context) {
    final status = index == 0 ? 'Won' : (index == 1 ? 'Outbid' : 'Active');
    final statusColor = index == 0
        ? AppTheme.success
        : (index == 1 ? AppTheme.error : AppTheme.warning);

    return Container(
      margin: const EdgeInsets.only(bottom: AppTheme.spacing12),
      padding: const EdgeInsets.all(AppTheme.spacing12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
        border: Border.all(color: AppTheme.neutral200),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Auction ${index + 1}',
                style: AppTheme.labelLarge,
              ),
              const SizedBox(height: AppTheme.spacing4),
              Text(
                'Your bid: \$${(1500 + index * 500)}',
                style: AppTheme.bodySmall,
              ),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppTheme.spacing12,
              vertical: AppTheme.spacing6,
            ),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
            ),
            child: Text(
              status,
              style: AppTheme.labelSmall.copyWith(color: statusColor),
            ),
          ),
        ],
      ),
    );
  }
}
