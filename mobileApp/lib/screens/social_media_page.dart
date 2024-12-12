import 'package:flutter/material.dart';
import 'package:tattletale/utils/submitter.dart';
import 'package:tattletale/utils/fetch_data.dart';

class SocialMediaPage extends StatefulWidget {
  const SocialMediaPage({super.key});

  @override
  _SocialMediaPageState createState() => _SocialMediaPageState();
}

class _SocialMediaPageState extends State<SocialMediaPage> {
  String activeSection = '';
  bool isLoading = false;
  final submitter = SocialMediaSubmitter();
  Map<String, dynamic>? fetchedData;

  final Map<String, TextEditingController> tagControllers = {
    'instagram': TextEditingController(),
    'x': TextEditingController(),
    'facebook': TextEditingController(),
    'whatsapp': TextEditingController(),
    'telegram': TextEditingController(),
    'google': TextEditingController(),
  };
  final Map<String, TextEditingController> passwordControllers = {
    'instagram': TextEditingController(),
    'x': TextEditingController(),
    'facebook': TextEditingController(),
    'whatsapp': TextEditingController(),
    'telegram': TextEditingController(),
    'google': TextEditingController(),
  };
  final Map<String, int> maxPosts = {
    'instagram': 10,
    'x': 10,
    'facebook': 10,
  };

  final Map<String, int> maxMessages = {
    'telegram': 10,
    'whatsapp': 10,
  };

  void handleSectionClick(String section) {
    setState(() {
      activeSection = activeSection == section ? '' : section;
    });
  }

  Future<void> handleSubmit(String platformKey) async {
    final tagController = tagControllers[platformKey];
    final passwordController = passwordControllers[platformKey];

    if (tagController == null) return;

    final tagsArray = tagController.text
        .split(',')
        .map((tag) => tag.trim())
        .where((tag) => tag.isNotEmpty)
        .toList();

    if (tagsArray.isEmpty) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Please enter tags.')));
      return;
    }

    final limit = (platformKey == 'telegram' || platformKey == 'whatsapp')
        ? maxMessages[platformKey]!
        : maxPosts[platformKey]!;

    // Check if password is required for this platform
    String? password;
    if (platformKey != 'whatsapp' && platformKey != 'telegram') {
      if (passwordController == null || passwordController.text.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please enter the password.')),
        );
        return;
      }
      password = passwordController.text.trim();
    }

    setState(() {
      isLoading = true;
    });

    try {
      await submitter.handleSubmit(
        context: context,
        platform: platformKey,
        tagsInput: tagsArray.join(','),
        password: password,
        limit: limit,
      );

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Request submitted successfully')),
      );
      tagController.clear();
      if (passwordController != null) passwordController.clear();
    } catch (error) {
      print('Error submitting request for $platformKey: $error');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to submit request.')),
      );
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  void handleShowDetails(String platform,
      {bool requiresPassword = false}) async {
    final tagController = tagControllers[platform];
    final passwordController = passwordControllers[platform];

    if (tagController == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Username input is missing for this platform.')),
      );
      return;
    }

    final username = tagController.text.trim();
    final password = requiresPassword ? passwordController?.text.trim() : null;

    if (username.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a username.')),
      );
      return;
    }

    setState(() {
      isLoading = true;
    });

    try {
      final data = await SocialMediaDetailsFetcher.handleShowDetails(
        context: context,
        platform: platform,
        username: username,
        password: password,
      );

      if (data == null) {
        throw Exception('No data returned for the query.');
      }

      setState(() {
        fetchedData = data;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Data fetched successfully.')),
      );
    } catch (error) {
      print('Error fetching details for $platform: $error');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to fetch data: $error')),
      );
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
                    _buildServiceButton('instagram', 'Instagram',
                        activeSection == 'instagram', Colors.pink, () {
                      handleSectionClick('instagram');
                    }),
                    _buildServiceButton('facebook', 'Facebook',
                        activeSection == 'facebook', Colors.blue, () {
                      handleSectionClick('facebook');
                    }),
                    _buildServiceButton(
                        'x', 'X', activeSection == 'x', Colors.blue, () {
                      handleSectionClick('x');
                    }),
                    _buildServiceButton('whatsapp', 'WhatsApp',
                        activeSection == 'whatsapp', Colors.green, () {
                      handleSectionClick('whatsapp');
                    }),
                    _buildServiceButton('telegram', 'Telegram',
                        activeSection == 'telegram', Colors.blueAccent, () {
                      handleSectionClick('telegram');
                    }),
                    _buildServiceButton(
                        'google',
                        'Google',
                        activeSection == 'google',
                        const Color.fromARGB(255, 233, 30, 30), () {
                      handleSectionClick('google');
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
                if (activeSection == 'google')
                  _buildServiceForm('Google',
                      const Color.fromARGB(255, 233, 30, 30), 'google'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildServiceButton(String platformKey, String label, bool isActive,
      Color activeColor, VoidCallback onPressed) {
    return Column(
      children: [
        GestureDetector(
          onTap: onPressed,
          child: Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color:
                  isActive ? activeColor.withOpacity(0.2) : Colors.transparent,
            ),
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Image.asset(
                'assets/$platformKey.png',
                color: isActive ? activeColor : Colors.grey,
                fit: BoxFit.contain,
              ),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: TextStyle(
            color: isActive ? activeColor : Colors.grey,
          ),
        ),
        if (fetchedData != null)
          Expanded(
            child: SingleChildScrollView(
              child: Text(
                fetchedData.toString(),
                style: const TextStyle(color: Colors.white),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildServiceForm(String platform, Color color, String platformKey) {
    final tagController = tagControllers[platformKey];
    final passwordController = passwordControllers[platformKey];

    if (platformKey == 'google') {
      String selectedService = 'Google Drive'; // Default selected service
      String? selectedMaxItems;
      DateTime? beforeDate;
      DateTime? afterDate;

      final List<Map<String, String>> services = [
        {'name': 'Google Drive', 'logo': 'assets/gdrive.png'},
        {'name': 'Gmail', 'logo': 'assets/gmail.png'},
        {'name': 'Google', 'logo': 'assets/google.png'},
        {'name': 'YouTube', 'logo': 'assets/youtube.png'},
      ];

      final List<String> maxValues = [
        '1',
        '3',
        '5',
        '10',
        '20',
        '50',
        '100',
        '200'
      ];

      return StatefulBuilder(builder: (context, setState) {
        Future<void> selectDate(
            BuildContext context, bool isBeforeDate) async {
          final DateTime? picked = await showDatePicker(
            context: context,
            initialDate: DateTime.now(),
            firstDate: DateTime(2000),
            lastDate: DateTime(2100),
          );
          if (picked != null) {
            setState(() {
              if (isBeforeDate) {
                beforeDate = picked;
              } else {
                afterDate = picked;
              }
            });
          }
        }

        Future<void> submit() async {
          final email = tagController!.text;
          if (selectedService == 'Google Drive' || selectedService == 'Gmail') {
            await BackendService.sendRequest(
              serviceName: selectedService,
              email: email,
              limit: selectedMaxItems,
            );
          } else if (selectedService == 'Google' ||
              selectedService == 'YouTube') {
            final range =
                '${beforeDate?.toIso8601String() ?? ''} to ${afterDate?.toIso8601String() ?? ''}';
            await BackendService.sendRequest(
              serviceName: selectedService,
              email: email,
              range: range,
            );
          }
        }

        Future<void> showGoogleDetails() async {
          final email = tagController!.text;
          await BackendService.sendRequest(
            serviceName: selectedService,
            email: email,
          );
        }

        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.grey[800],
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Email field
              TextField(
                controller: tagController,
                decoration: const InputDecoration(
                  labelText: 'Email Address',
                  labelStyle: TextStyle(color: Colors.white),
                  border: OutlineInputBorder(),
                ),
                style: const TextStyle(color: Colors.white),
              ),
              const SizedBox(height: 16),

              // Dropdown for selecting the service
              DropdownButton<String>(
                value: selectedService,
                onChanged: (String? newValue) {
                  setState(() {
                    selectedService = newValue!;
                  });
                },
                items: services.map<DropdownMenuItem<String>>((service) {
                  return DropdownMenuItem<String>(
                    value: service['name'],
                    child: Row(
                      children: [
                        Image.asset(
                          service['logo']!,
                          width: 24,
                          height: 24,
                        ),
                        const SizedBox(width: 8),
                        Text(service['name']!,
                            style: const TextStyle(color: Colors.white)),
                      ],
                    ),
                  );
                }).toList(),
                dropdownColor: Colors.grey[800],
              ),
              const SizedBox(height: 16),

              // Conditional Widgets
              if (selectedService == 'Google Drive' ||
                  selectedService == 'Gmail') ...[
                DropdownButton<String>(
                  value: selectedMaxItems,
                  onChanged: (String? newValue) {
                    setState(() {
                      selectedMaxItems = newValue!;
                    });
                  },
                  items:
                      maxValues.map<DropdownMenuItem<String>>((String value) {
                    return DropdownMenuItem<String>(
                      value: value,
                      child: Text(value, style: const TextStyle(color: Colors.white)),
                    );
                  }).toList(),
                  hint: const Text('Select Max Items',
                      style: TextStyle(color: Colors.white)),
                  dropdownColor: Colors.grey[800],
                ),
              ] else if (selectedService == 'Google' ||
                  selectedService == 'YouTube') ...[
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        readOnly: true,
                        onTap: () => selectDate(context, true),
                        decoration: const InputDecoration(
                          labelText: 'Before',
                          labelStyle: TextStyle(color: Colors.white),
                          border: OutlineInputBorder(),
                          suffixIcon:
                              Icon(Icons.calendar_today, color: Colors.white),
                        ),
                        style: const TextStyle(color: Colors.white),
                        controller: TextEditingController(
                          text: beforeDate != null
                              ? "${beforeDate!.year}-${beforeDate!.month.toString().padLeft(2, '0')}-${beforeDate!.day.toString().padLeft(2, '0')}"
                              : '',
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextField(
                        readOnly: true,
                        onTap: () => selectDate(context, false),
                        decoration: const InputDecoration(
                          labelText: 'After',
                          labelStyle: TextStyle(color: Colors.white),
                          border: OutlineInputBorder(),
                          suffixIcon:
                              Icon(Icons.calendar_today, color: Colors.white),
                        ),
                        style: const TextStyle(color: Colors.white),
                        controller: TextEditingController(
                          text: afterDate != null
                              ? "${afterDate!.year}-${afterDate!.month.toString().padLeft(2, '0')}-${afterDate!.day.toString().padLeft(2, '0')}"
                              : '',
                        ),
                      ),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 16),

              // Submit Button
              ElevatedButton(
                onPressed: submit,
                child: const Text('Submit'),
              ),
              ElevatedButton(
                onPressed: showGoogleDetails,
                child: const Text('Show details'),
              ),
            ],
          ),
        );
      });
    } else {
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
            const SizedBox(height: 10),
            DropdownButton<int>(
              value: (platformKey == 'telegram' || platformKey == 'whatsapp')
                  ? maxMessages[platformKey]
                  : maxPosts[platformKey],
              dropdownColor: Colors.grey[800],
              items: (platformKey == 'telegram' || platformKey == 'whatsapp')
                  ? List.generate(
                      5,
                      (index) => DropdownMenuItem(
                        value: (index + 1) * 10,
                        child: Text(
                          'Max messages: ${(index + 1) * 10}',
                          style: const TextStyle(color: Colors.white),
                        ),
                      ),
                    )
                  : [1, 3, 5, 10, 15, 20, 30, 50, 100].map((value) {
                      return DropdownMenuItem(
                        value: value,
                        child: Text(
                          'Max posts: $value',
                          style: const TextStyle(color: Colors.white),
                        ),
                      );
                    }).toList(),
              onChanged: (value) {
                setState(() {
                  if (platformKey == 'telegram' || platformKey == 'whatsapp') {
                    maxMessages[platformKey] = value!;
                  } else {
                    maxPosts[platformKey] = value!;
                  }
                });
              },
            ),
            const SizedBox(height: 10),
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
            TextField(
              controller: passwordController,
              decoration: InputDecoration(
                hintText: 'Enter password',
                filled: true,
                fillColor: Colors.grey[700],
                border:
                    OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                ElevatedButton(
                  onPressed: () => handleSubmit(platformKey),
                  style: ElevatedButton.styleFrom(backgroundColor: color),
                  child: const Text('Submit'),
                ),
                ElevatedButton(
                  onPressed: () => handleShowDetails(platformKey),
                  style: ElevatedButton.styleFrom(backgroundColor: color),
                  child: const Text('Show details'),
                ),
              ],
            ),
          ],
        ),
      );
    }
  }
}
