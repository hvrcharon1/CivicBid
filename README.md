# CivicBid Mobile App

A feature-rich Flutter application for discovering and bidding on government surplus and seized property auctions with AI-powered analysis.

## Features

### Core Functionality
- **Auction Search & Filtering**: Advanced search with category, location, and price filters
- **Auction Details**: Complete property information, images, bid history, and countdown timers
- **Watchlist Management**: Save and track favorite auctions
- **Real-time Updates**: Live auction status and bid tracking
- **Location Maps**: Google Maps integration for property visualization

### AI-Powered Features
- **AI Analysis**: Fair market value estimates, risk assessment, and bidding strategies
- **AI Chat Assistant**: Q&A about auctions and bidding guidance
- **Multiple AI Providers**: Support for 8 different AI providers
  - Free/Local: Ollama, OpenCode
  - Premium: Claude, ChatGPT, Copilot, Manus, DeepSeek, Grok

### User Features
- **Dashboard**: View watchlist, bid history, and recommendations
- **Notifications**: Email and push alerts for auction updates
- **Settings**: Customize AI provider, notifications, and preferences
- **User Authentication**: Secure login with Manus OAuth

## Getting Started

### Prerequisites

- Flutter 3.0.0 or higher
- Dart 3.0.0 or higher
- Android SDK 21+ or iOS 11.0+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hvrcharon1/CivicBid.git
   cd CivicBid-PhoneApp/civicbid_mobile
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Configure API endpoints**
   - Update `lib/services/api_service.dart` with your backend URL
   - Set up Firebase for notifications (optional)

4. **Run the app**
   ```bash
   flutter run
   ```

## Project Structure

```
lib/
├── main.dart                 # App entry point
├── screens/                  # UI screens
│   ├── home_screen.dart
│   ├── auction_listing_screen.dart
│   ├── auction_detail_screen.dart
│   ├── dashboard_screen.dart
│   └── settings_screen.dart
├── models/                   # Data models
│   ├── auction.dart
│   └── ai_analysis.dart
├── services/                 # Business logic
│   ├── api_service.dart
│   └── ai_provider_service.dart
├── widgets/                  # Reusable widgets
├── utils/                    # Utilities
│   └── theme.dart
└── providers/                # State management
```

## AI Provider Configuration

### Free/Local Providers

**Ollama**
- No API key required
- Runs locally on your device
- Requires Ollama installation: https://ollama.ai

**OpenCode**
- No API key required
- Runs locally on your device
- Requires OpenCode setup

### Premium Providers

**Claude (Anthropic)**
- Get API key: https://console.anthropic.com
- Supports advanced analysis and reasoning

**ChatGPT (OpenAI)**
- Get API key: https://platform.openai.com
- Industry-leading language model

**GitHub Copilot**
- Requires GitHub account with Copilot subscription
- Seamless integration with development

**Manus**
- Get API key: https://manus.im
- Built-in integration with CivicBid backend

**DeepSeek**
- Get API key: https://deepseek.com
- Advanced reasoning capabilities

**Grok (X.AI)**
- Get API key: https://x.ai
- Real-time information access

## Building for Production

### Android

```bash
# Build APK
flutter build apk --release

# Build App Bundle
flutter build appbundle --release
```

### iOS

```bash
# Build iOS app
flutter build ios --release

# Create IPA for App Store
flutter build ipa --release
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```
API_BASE_URL=https://civicbid-eelblmvg.manus.space/api
GOOGLE_MAPS_API_KEY=your_google_maps_key
FIREBASE_PROJECT_ID=your_firebase_project_id
```

### Firebase Setup (Optional)

1. Create Firebase project at https://console.firebase.google.com
2. Add Android and iOS apps
3. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
4. Place files in respective directories

## Testing

```bash
# Run all tests
flutter test

# Run tests with coverage
flutter test --coverage

# Run specific test file
flutter test test/services/api_service_test.dart
```

## Performance Optimization

- Image caching with `cached_network_image`
- Lazy loading for auction lists
- Efficient state management with Riverpod
- Local storage with Hive for offline support

## Security

- Secure storage for API keys with `flutter_secure_storage`
- SSL/TLS for all API communications
- OAuth 2.0 authentication
- Input validation and sanitization

## Troubleshooting

### Build Issues

```bash
# Clean build
flutter clean
flutter pub get
flutter pub upgrade

# Rebuild
flutter run
```

### API Connection Issues

- Verify backend is running and accessible
- Check API endpoint configuration
- Ensure proper CORS headers on backend

### AI Provider Issues

- For Ollama: Ensure Ollama service is running on localhost:11434
- For premium providers: Verify API key is valid and has proper permissions
- Check internet connection for cloud-based providers

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review deployment guide

## Deployment

### Google Play Store

1. Create Google Play Developer account
2. Build signed APK/App Bundle
3. Upload to Play Console
4. Fill in store listing details
5. Submit for review

### Apple App Store

1. Create Apple Developer account
2. Build signed IPA
3. Upload to App Store Connect
4. Fill in app details
5. Submit for review

## Future Enhancements

- Offline auction browsing
- Advanced bidding automation
- Price prediction models
- Auction calendar integration
- Multi-language support
- Advanced analytics dashboard
- Blockchain-based bid verification

## Acknowledgments

- Flutter team for the excellent framework
- Google Maps for location services
- AI providers for language models
- CivicBid backend team
