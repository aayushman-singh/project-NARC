import 'package:flutter/material.dart';

class SocialMediaPage extends StatefulWidget {
  const SocialMediaPage({super.key});

  @override
  _SocialMediaPageState createState() => _SocialMediaPageState();
}

class _SocialMediaPageState extends State<SocialMediaPage> {
  String activeSection = '';
  bool isLoading = false;

  void handleSectionClick(String section) {
    setState(() {
      activeSection = activeSection == section ? '' : section;
    });
  }

  Future<void> handleSubmit(String platform) async {
    final TextEditingController tagController = TextEditingController();
    String tagInputValue = tagController.text;
    List<String> tagsArray = tagInputValue
        .split(',')
        .map((tag) => tag.trim())
        .where((tag) => tag.isNotEmpty)
        .toList();

    final payload = {'startUrls': tagsArray};

    setState(() {
      isLoading = true;
    });

    try {
      // Simulate API calls (replace with actual implementation)
      await Future.delayed(const Duration(seconds: 2));
      print('Payload being sent: $payload');

      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('User Submitted Successfully')));
      tagController.clear();
    } catch (error) {
      print('Error submitting tags: $error');
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to submit tags. Please try again.')));
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[900],
      body: Stack(
        children: [
          if (isLoading)
            Container(
              color: Colors.black.withOpacity(0.5),
              child: const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(),
                    SizedBox(height: 20),
                    Text('Processing your request...',
                        style: TextStyle(color: Colors.white)),
                  ],
                ),
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                const Text(
                  'Social Media Investigation Tool',
                  style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildServiceButton(Icons.photo_camera, 'Instagram',
                        activeSection == 'instagram', Colors.pink, () {
                      handleSectionClick('instagram');
                    }),
                    _buildServiceButton(Icons.wechat_sharp, 'WhatsApp',
                        activeSection == 'whatsapp', Colors.green, () {
                      handleSectionClick('whatsapp');
                    }),
                    _buildServiceButton(
                        Icons.web, 'X', activeSection == 'x', Colors.blue, () {
                      handleSectionClick('x');
                    }),
                    _buildServiceButton(Icons.send, 'Telegram',
                        activeSection == 'telegram', Colors.blueAccent, () {
                      handleSectionClick('telegram');
                    }),
                    _buildServiceButton(Icons.facebook, 'Facebook',
                        activeSection == 'facebook', Colors.blue, () {
                      handleSectionClick('facebook');
                    }),
                  ],
                ),
                const SizedBox(height: 20),
                if (activeSection == 'instagram')
                  _buildServiceForm('Instagram', Colors.pink, 'instagram'),
                if (activeSection == 'whatsapp')
                  _buildServiceForm('WhatsApp', Colors.green, 'whatsapp'),
                if (activeSection == 'x')
                  _buildServiceForm('X (formerly Twitter)', Colors.blue, 'x'),
                if (activeSection == 'telegram')
                  _buildServiceForm('Telegram', Colors.blueAccent, 'telegram'),
                if (activeSection == 'facebook')
                  _buildServiceForm('Facebook', Colors.blue, 'facebook'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildServiceButton(IconData icon, String label, bool isActive,
      Color activeColor, VoidCallback onPressed) {
    return Column(
      children: [
        IconButton(
          icon:
              Icon(icon, color: isActive ? activeColor : Colors.grey, size: 32),
          onPressed: onPressed,
        ),
        Text(label,
            style: TextStyle(color: isActive ? activeColor : Colors.grey)),
      ],
    );
  }

  Widget _buildServiceForm(String platform, Color color, String platformKey) {
    final TextEditingController tagController = TextEditingController();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
          color: Colors.grey[800], borderRadius: BorderRadius.circular(12)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(platform,
              style: TextStyle(
                  fontSize: 18, fontWeight: FontWeight.bold, color: color)),
          TextField(
            controller: tagController,
            decoration: InputDecoration(
              hintText: 'Enter $platform username',
              filled: true,
              fillColor: Colors.grey[700],
              border:
                  OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
          const SizedBox(height: 10),
          ElevatedButton(
            onPressed: () => handleSubmit(platformKey),
            style: ElevatedButton.styleFrom(backgroundColor: color),
            child: const Text('Submit'),
          ),
        ],
      ),
    );
  }
}
