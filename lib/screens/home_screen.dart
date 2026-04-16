import 'package:flutter/material.dart';
import 'package:civicbid_mobile/utils/theme.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('CivicBid'),
        centerTitle: false,
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
              // Hero Section
              Container(
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppTheme.primary, AppTheme.secondary],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
                ),
                padding: const EdgeInsets.all(AppTheme.spacing24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Find Seized & Surplus Properties',
                      style: AppTheme.headingMedium.copyWith(
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: AppTheme.spacing12),
                    Text(
                      'Discover incredible deals on government auctions with AI-powered analysis',
                      style: AppTheme.bodyMedium.copyWith(
                        color: Colors.white70,
                      ),
                    ),
                    const SizedBox(height: AppTheme.spacing20),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.pushNamed(context, '/auctions');
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: AppTheme.primary,
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppTheme.spacing24,
                          vertical: AppTheme.spacing12,
                        ),
                      ),
                      child: const Text('Start Exploring'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppTheme.spacing32),

              // Quick Stats
              Text(
                'Platform Stats',
                style: AppTheme.headingSmall,
              ),
              const SizedBox(height: AppTheme.spacing16),
              Row(
                children: [
                  Expanded(
                    child: _StatCard(
                      title: '50+',
                      subtitle: 'Government Sources',
                    ),
                  ),
                  const SizedBox(width: AppTheme.spacing12),
                  Expanded(
                    child: _StatCard(
                      title: '10K+',
                      subtitle: 'Active Auctions',
                    ),
                  ),
                  const SizedBox(width: AppTheme.spacing12),
                  Expanded(
                    child: _StatCard(
                      title: '\$2M+',
                      subtitle: 'Potential Savings',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppTheme.spacing32),

              // Features
              Text(
                'Key Features',
                style: AppTheme.headingSmall,
              ),
              const SizedBox(height: AppTheme.spacing16),
              _FeatureItem(
                icon: Icons.search,
                title: 'Advanced Search',
                description: 'Filter by category, location, price, and more',
              ),
              const SizedBox(height: AppTheme.spacing12),
              _FeatureItem(
                icon: Icons.smart_toy,
                title: 'AI Analysis',
                description: 'Get fair market value estimates and bidding strategies',
              ),
              const SizedBox(height: AppTheme.spacing12),
              _FeatureItem(
                icon: Icons.favorite,
                title: 'Watchlist',
                description: 'Save and track your favorite auctions',
              ),
              const SizedBox(height: AppTheme.spacing12),
              _FeatureItem(
                icon: Icons.map,
                title: 'Location Maps',
                description: 'Visualize properties on interactive maps',
              ),
              const SizedBox(height: AppTheme.spacing32),
            ],
          ),
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() => _selectedIndex = index);
          switch (index) {
            case 0:
              break;
            case 1:
              Navigator.pushNamed(context, '/auctions');
              break;
            case 2:
              Navigator.pushNamed(context, '/dashboard');
              break;
            case 3:
              Navigator.pushNamed(context, '/settings');
              break;
          }
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.gavel),
            label: 'Auctions',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard),
            label: 'Dashboard',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings),
            label: 'Settings',
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String subtitle;

  const _StatCard({
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.neutral50,
        borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
        border: Border.all(color: AppTheme.neutral200),
      ),
      padding: const EdgeInsets.all(AppTheme.spacing16),
      child: Column(
        children: [
          Text(
            title,
            style: AppTheme.headingSmall.copyWith(
              color: AppTheme.primary,
            ),
          ),
          const SizedBox(height: AppTheme.spacing8),
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

class _FeatureItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;

  const _FeatureItem({
    required this.icon,
    required this.title,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          decoration: BoxDecoration(
            color: AppTheme.primary.withOpacity(0.1),
            borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
          ),
          padding: const EdgeInsets.all(AppTheme.spacing12),
          child: Icon(
            icon,
            color: AppTheme.primary,
            size: 24,
          ),
        ),
        const SizedBox(width: AppTheme.spacing16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: AppTheme.labelLarge,
              ),
              const SizedBox(height: AppTheme.spacing4),
              Text(
                description,
                style: AppTheme.bodySmall,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
