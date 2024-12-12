import 'package:flutter/material.dart';
import 'package:flutter_phosphor_icons/flutter_phosphor_icons.dart';

class PastDataPage extends StatefulWidget {
  const PastDataPage({Key? key}) : super(key: key);

  @override
  _PastDataPageState createState() => _PastDataPageState();
}

class _PastDataPageState extends State<PastDataPage> {
  String _activeSection = '';
  bool _isLoading = false;
  bool _showDetails = false;

  // Mock data structures (you'll replace these with actual data fetching)
  dynamic _instagramData;
  dynamic _whatsappData;
  dynamic _xData;
  dynamic _telegramData;
  dynamic _facebookData;

  // Alert management
  void _showAlert(String message, {AlertType type = AlertType.info}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: _getAlertColor(type),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  Color _getAlertColor(AlertType type) {
    switch (type) {
      case AlertType.success:
        return Colors.green;
      case AlertType.error:
        return Colors.red;
      case AlertType.info:
      default:
        return Colors.blue;
    }
  }

  // Platform-specific color and icon
  Color _getPlatformColor(String platform) {
    switch (platform) {
      case 'instagram':
        return const Color(0xFFE1306C);
      case 'facebook':
        return const Color(0xFF3b5998);
      case 'x':
        return const Color(0xFF1DA1F2);
      case 'telegram':
        return const Color(0xFF0088cc);
      case 'whatsapp':
        return const Color(0xFF25D366);
      default:
        return Colors.grey;
    }
  }

  // Handle section click
  void _handleSectionClick(String section) {
    setState(() {
      _activeSection = _activeSection == section ? '' : section;
    });
  }

  // Fetch details for a platform
  Future<void> _handleShowDetails(String platform) async {
    setState(() {
      _isLoading = true;
    });

    try {
      // Simulated data fetching - replace with actual API calls
      switch (platform) {
        case 'instagram':
          // Simulate fetch
          _instagramData = {
            'users': ['user1', 'user2']
          };
          break;
        case 'whatsapp':
          _whatsappData = {
            'chats': ['chat1', 'chat2']
          };
          break;
        case 'x':
          _xData = {
            'tweets': ['tweet1', 'tweet2']
          };
          break;
        case 'telegram':
          _telegramData = {
            'messages': ['msg1', 'msg2']
          };
          break;
        case 'facebook':
          _facebookData = {
            'posts': ['post1', 'post2']
          };
          break;
      }

      setState(() {
        _showDetails = true;
        _isLoading = false;
      });

      _showAlert('Data fetched successfully', type: AlertType.success);
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      _showAlert('Failed to fetch data', type: AlertType.error);
    }
  }

  // Platform button widget
  Widget _platformButton(String platform, IconData icon) {
    bool isActive = _activeSection == platform;
    return GestureDetector(
      onTap: () => _handleSectionClick(platform),
      child: Column(
        children: [
          Icon(
            icon,
            color: isActive ? _getPlatformColor(platform) : Colors.grey,
            size: 32,
          ),
          Text(
            platform.toUpperCase(),
            style: TextStyle(
              color: isActive ? _getPlatformColor(platform) : Colors.grey,
            ),
          ),
        ],
      ),
    );
  }

  // Platform section builder
  Widget _buildPlatformSection() {
    switch (_activeSection) {
      case 'instagram':
        return _buildInstagramSection();
      case 'whatsapp':
        return _buildWhatsAppSection();
      case 'x':
        return _buildXSection();
      case 'telegram':
        return _buildTelegramSection();
      case 'facebook':
        return _buildFacebookSection();
      default:
        return const SizedBox.shrink();
    }
  }

  // Platform-specific section builders (simplified)
  Widget _buildInstagramSection() {
    return Card(
      color: Colors.grey[800],
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Instagram',
              style: TextStyle(
                color: _getPlatformColor('instagram'),
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => _handleShowDetails('instagram'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
              ),
              child: const Text('Show Details'),
            ),
            if (_showDetails && _instagramData != null)
              Text(
                'Instagram Data: ${_instagramData}',
                style: const TextStyle(color: Colors.white),
              ),
          ],
        ),
      ),
    );
  }

  // Similar builders for other platforms (WhatsApp, X, Telegram, Facebook)
  Widget _buildWhatsAppSection() {
    return Card(
      color: Colors.grey[800],
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'WhatsApp',
              style: TextStyle(
                color: _getPlatformColor('whatsapp'),
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => _handleShowDetails('whatsapp'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
              ),
              child: const Text('Show Details'),
            ),
            if (_showDetails && _whatsappData != null)
              Text(
                'WhatsApp Data: ${_whatsappData}',
                style: const TextStyle(color: Colors.white),
              ),
          ],
        ),
      ),
    );
  }

  // Simplified implementations for other sections
  Widget _buildXSection() => Card();
  Widget _buildTelegramSection() => Card();
  Widget _buildFacebookSection() => Card();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[900],
      appBar: AppBar(
        title: const Text('Past Data'),
        backgroundColor: Colors.grey[850],
        centerTitle: true,
      ),
      body: Column(
        children: [
          // Platform selection row
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _platformButton('instagram', PhosphorIcons.instagram_logo),
                _platformButton('facebook', PhosphorIcons.facebook_logo),
                _platformButton('x', PhosphorIcons.twitter_logo),
                _platformButton('telegram', PhosphorIcons.telegram_logo),
                _platformButton('whatsapp', PhosphorIcons.whatsapp_logo),
              ],
            ),
          ),

          // Active platform section
          if (_activeSection.isNotEmpty)
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: _buildPlatformSection(),
              ),
            ),

          // Loading indicator
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(),
            ),
        ],
      ),
    );
  }
}

// Alert type enum
enum AlertType { success, error, info }
