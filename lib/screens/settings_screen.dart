import 'package:flutter/material.dart';
import 'package:civicbid_mobile/utils/theme.dart';
import 'package:civicbid_mobile/services/ai_provider_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late AiProviderService _aiService;
  AiProvider? _selectedProvider;
  bool _emailNotifications = true;
  bool _pushNotifications = true;
  bool _darkMode = false;

  @override
  void initState() {
    super.initState();
    _aiService = AiProviderService();
    _initializeSettings();
  }

  Future<void> _initializeSettings() async {
    await _aiService._initializeProvider();
    setState(() {
      _selectedProvider = _aiService.currentProvider;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Account Section
            _SettingsSection(
              title: 'Account',
              children: [
                _SettingsTile(
                  title: 'Profile',
                  subtitle: 'View and edit your profile',
                  icon: Icons.person,
                  onTap: () {},
                ),
                _SettingsTile(
                  title: 'Email',
                  subtitle: 'user@example.com',
                  icon: Icons.email,
                  onTap: () {},
                ),
              ],
            ),

            // AI Provider Section
            _SettingsSection(
              title: 'AI Provider',
              children: [
                Padding(
                  padding: const EdgeInsets.all(AppTheme.spacing16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Select your preferred AI provider for auction analysis:',
                        style: AppTheme.bodyMedium,
                      ),
                      const SizedBox(height: AppTheme.spacing16),
                      // Free/Local Providers
                      Text(
                        'Free & Local',
                        style: AppTheme.labelLarge,
                      ),
                      const SizedBox(height: AppTheme.spacing12),
                      ..._aiService.localProviders.map((provider) {
                        return _ProviderOption(
                          provider: provider,
                          isSelected: _selectedProvider == provider,
                          onTap: () {
                            setState(() => _selectedProvider = provider);
                            _aiService.setProvider(provider);
                          },
                        );
                      }).toList(),
                      const SizedBox(height: AppTheme.spacing20),
                      // Premium Providers
                      Text(
                        'Premium',
                        style: AppTheme.labelLarge,
                      ),
                      const SizedBox(height: AppTheme.spacing12),
                      ..._aiService.premiumProviders.map((provider) {
                        return _ProviderOption(
                          provider: provider,
                          isSelected: _selectedProvider == provider,
                          onTap: () {
                            _showApiKeyDialog(provider);
                          },
                        );
                      }).toList(),
                    ],
                  ),
                ),
              ],
            ),

            // Notifications Section
            _SettingsSection(
              title: 'Notifications',
              children: [
                _SettingsSwitch(
                  title: 'Email Notifications',
                  subtitle: 'Get alerts for auction updates',
                  value: _emailNotifications,
                  onChanged: (value) {
                    setState(() => _emailNotifications = value);
                  },
                ),
                _SettingsSwitch(
                  title: 'Push Notifications',
                  subtitle: 'Get real-time alerts on your phone',
                  value: _pushNotifications,
                  onChanged: (value) {
                    setState(() => _pushNotifications = value);
                  },
                ),
              ],
            ),

            // Display Section
            _SettingsSection(
              title: 'Display',
              children: [
                _SettingsSwitch(
                  title: 'Dark Mode',
                  subtitle: 'Use dark theme',
                  value: _darkMode,
                  onChanged: (value) {
                    setState(() => _darkMode = value);
                  },
                ),
              ],
            ),

            // About Section
            _SettingsSection(
              title: 'About',
              children: [
                _SettingsTile(
                  title: 'App Version',
                  subtitle: '1.0.0',
                  icon: Icons.info,
                  onTap: () {},
                ),
                _SettingsTile(
                  title: 'Privacy Policy',
                  subtitle: 'Read our privacy policy',
                  icon: Icons.privacy_tip,
                  onTap: () {},
                ),
                _SettingsTile(
                  title: 'Terms of Service',
                  subtitle: 'Read our terms',
                  icon: Icons.description,
                  onTap: () {},
                ),
              ],
            ),

            // Logout Button
            Padding(
              padding: const EdgeInsets.all(AppTheme.spacing16),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    // Logout logic
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.error,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      vertical: AppTheme.spacing12,
                    ),
                  ),
                  child: const Text('Logout'),
                ),
              ),
            ),
            const SizedBox(height: AppTheme.spacing32),
          ],
        ),
      ),
    );
  }

  void _showApiKeyDialog(AiProvider provider) {
    final controller = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('${provider.name} API Key'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Enter your ${provider.name} API key to use this provider:',
              style: AppTheme.bodyMedium,
            ),
            const SizedBox(height: AppTheme.spacing16),
            TextField(
              controller: controller,
              obscureText: true,
              decoration: InputDecoration(
                hintText: 'Paste your API key',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              if (controller.text.isNotEmpty) {
                setState(() => _selectedProvider = provider);
                _aiService.setProvider(provider, apiKey: controller.text);
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('${provider.name} configured')),
                );
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }
}

class _SettingsSection extends StatelessWidget {
  final String title;
  final List<Widget> children;

  const _SettingsSection({
    required this.title,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
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
        ...children,
      ],
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final VoidCallback onTap;

  const _SettingsTile({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: AppTheme.primary),
      title: Text(title, style: AppTheme.labelLarge),
      subtitle: Text(subtitle, style: AppTheme.bodySmall),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}

class _SettingsSwitch extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _SettingsSwitch({
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(title, style: AppTheme.labelLarge),
      subtitle: Text(subtitle, style: AppTheme.bodySmall),
      trailing: Switch(
        value: value,
        onChanged: onChanged,
        activeColor: AppTheme.primary,
      ),
    );
  }
}

class _ProviderOption extends StatelessWidget {
  final AiProvider provider;
  final bool isSelected;
  final VoidCallback onTap;

  const _ProviderOption({
    required this.provider,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppTheme.spacing8),
      decoration: BoxDecoration(
        color: isSelected ? AppTheme.primary.withOpacity(0.1) : Colors.white,
        border: Border.all(
          color: isSelected ? AppTheme.primary : AppTheme.neutral200,
        ),
        borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
      ),
      child: ListTile(
        onTap: onTap,
        leading: Radio<AiProvider>(
          value: provider,
          groupValue: isSelected ? provider : null,
          onChanged: (_) => onTap(),
          activeColor: AppTheme.primary,
        ),
        title: Text(
          provider.name,
          style: AppTheme.labelLarge.copyWith(
            color: isSelected ? AppTheme.primary : Colors.black,
          ),
        ),
        subtitle: Text(
          provider.description,
          style: AppTheme.bodySmall,
        ),
      ),
    );
  }
}
