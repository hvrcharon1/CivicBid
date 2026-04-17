import 'package:flutter/material.dart';
import 'package:civicbid_mobile/utils/theme.dart';
import 'package:civicbid_mobile/services/portal_service.dart';
import 'package:url_launcher/url_launcher.dart';

class PortalFilterScreen extends StatefulWidget {
  const PortalFilterScreen({Key? key}) : super(key: key);

  @override
  State<PortalFilterScreen> createState() => _PortalFilterScreenState();
}

class _PortalFilterScreenState extends State<PortalFilterScreen> {
  late PortalService _portalService;
  late Future<List<Portal>> _federalPortals;
  late Future<List<Portal>> _statePortals;
  String _selectedFilter = 'all'; // 'all', 'federal', 'state'

  @override
  void initState() {
    super.initState();
    _portalService = PortalService();
    _federalPortals = _portalService.getFederalPortals();
    _statePortals = _portalService.getStatePortals();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Auction Sources'),
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Filter Tabs
            Padding(
              padding: const EdgeInsets.all(AppTheme.spacing16),
              child: Row(
                children: [
                  _FilterTab(
                    label: 'All',
                    isSelected: _selectedFilter == 'all',
                    onTap: () => setState(() => _selectedFilter = 'all'),
                  ),
                  const SizedBox(width: AppTheme.spacing12),
                  _FilterTab(
                    label: 'Federal (10)',
                    isSelected: _selectedFilter == 'federal',
                    onTap: () => setState(() => _selectedFilter = 'federal'),
                  ),
                  const SizedBox(width: AppTheme.spacing12),
                  _FilterTab(
                    label: 'State (17)',
                    isSelected: _selectedFilter == 'state',
                    onTap: () => setState(() => _selectedFilter = 'state'),
                  ),
                ],
              ),
            ),

            // Federal Portals Section
            if (_selectedFilter == 'all' || _selectedFilter == 'federal')
              _buildPortalSection(
                title: 'Federal Government Sources',
                future: _federalPortals,
              ),

            // State Portals Section
            if (_selectedFilter == 'all' || _selectedFilter == 'state')
              _buildPortalSection(
                title: 'State Government Sources',
                future: _statePortals,
              ),

            const SizedBox(height: AppTheme.spacing32),
          ],
        ),
      ),
    );
  }

  Widget _buildPortalSection({
    required String title,
    required Future<List<Portal>> future,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(
            AppTheme.spacing16,
            AppTheme.spacing20,
            AppTheme.spacing16,
            AppTheme.spacing12,
          ),
          child: Text(
            title,
            style: AppTheme.labelLarge.copyWith(
              color: AppTheme.neutral500,
            ),
          ),
        ),
        FutureBuilder<List<Portal>>(
          future: future,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return Padding(
                padding: const EdgeInsets.all(AppTheme.spacing16),
                child: Center(
                  child: CircularProgressIndicator(
                    color: AppTheme.primary,
                  ),
                ),
              );
            }

            if (snapshot.hasError) {
              return Padding(
                padding: const EdgeInsets.all(AppTheme.spacing16),
                child: Text(
                  'Error loading portals: ${snapshot.error}',
                  style: AppTheme.bodySmall.copyWith(color: AppTheme.error),
                ),
              );
            }

            final portals = snapshot.data ?? [];
            if (portals.isEmpty) {
              return Padding(
                padding: const EdgeInsets.all(AppTheme.spacing16),
                child: Text(
                  'No portals available',
                  style: AppTheme.bodySmall,
                ),
              );
            }

            return ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: portals.length,
              itemBuilder: (context, index) {
                final portal = portals[index];
                return _PortalTile(
                  portal: portal,
                  onTap: () => _launchPortal(portal),
                );
              },
            );
          },
        ),
      ],
    );
  }

  Future<void> _launchPortal(Portal portal) async {
    try {
      if (await canLaunchUrl(Uri.parse(portal.url))) {
        await launchUrl(
          Uri.parse(portal.url),
          mode: LaunchMode.externalApplication,
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not open ${portal.name}')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }
}

class _FilterTab extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _FilterTab({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(
            horizontal: AppTheme.spacing12,
            vertical: AppTheme.spacing8,
          ),
          decoration: BoxDecoration(
            color: isSelected ? AppTheme.primary : Colors.white,
            border: Border.all(
              color: isSelected ? AppTheme.primary : AppTheme.neutral200,
            ),
            borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
          ),
          child: Center(
            child: Text(
              label,
              style: AppTheme.labelSmall.copyWith(
                color: isSelected ? Colors.white : AppTheme.neutral700,
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ),
      ),
    );
  }
}

class _PortalTile extends StatelessWidget {
  final Portal portal;
  final VoidCallback onTap;

  const _PortalTile({
    required this.portal,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppTheme.spacing16,
        vertical: AppTheme.spacing8,
      ),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: AppTheme.neutral200),
          borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
        ),
        child: ListTile(
          onTap: onTap,
          leading: Container(
            padding: const EdgeInsets.all(AppTheme.spacing8),
            decoration: BoxDecoration(
              color: AppTheme.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
            ),
            child: Icon(
              portal.category == 'federal' ? Icons.domain : Icons.location_city,
              color: AppTheme.primary,
            ),
          ),
          title: Text(
            portal.name,
            style: AppTheme.labelLarge,
          ),
          subtitle: Text(
            portal.category == 'federal'
                ? 'Federal Government'
                : 'State of ${portal.state}',
            style: AppTheme.bodySmall,
          ),
          trailing: Icon(
            Icons.open_in_new,
            color: AppTheme.neutral400,
            size: 18,
          ),
        ),
      ),
    );
  }
}
