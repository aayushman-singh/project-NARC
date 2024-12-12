import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:provider/provider.dart';
import 'package:tattletale/provider/user.dart';
import '../utils/routes.dart';

class HomePage extends StatefulWidget {
  final PageController pageController;
  const HomePage({super.key, required this.pageController});

  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  bool isLoading = true;
  String? error;
  final storage = const FlutterSecureStorage();
  final String localhost = '10.0.2.2';

  @override
  void initState() {
    super.initState();
    fetchUserData();
  }

  Future<void> fetchUserData() async {
    try {
      setState(() {
        isLoading = true;
        error = null;
      });

      final token = await storage.read(key: 'token');
      if (token == null || token.isEmpty) {
        throw Exception('Authentication token not found. Please log in.');
      }

      final response = await http.get(
        Uri.parse('http://$localhost:5001/api/users/'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final userData = jsonDecode(response.body);

        // Update UserProvider with user data
        Provider.of<UserProvider>(context, listen: false).setUser(
          id: userData['_id'] ?? '',
          name: userData['name'] ?? '',
          email: userData['email'] ?? '',
          pic: userData['pic'] ?? '',
          searchHistory: userData['searchHistory'] ?? [],
        );

        setState(() {
          isLoading = false;
        });
      } else {
        throw Exception(
          jsonDecode(response.body)['message'] ?? 'Failed to fetch user data.',
        );
      }
    } catch (e) {
      setState(() {
        error = e.toString();
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);
    var screenSize = MediaQuery.of(context).size;

    if (isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (error != null) {
      return Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error, color: Colors.red, size: 50),
                const SizedBox(height: 10),
                Text(
                  'Error',
                  style: TextStyle(color: Colors.red[300], fontSize: 20),
                ),
                const SizedBox(height: 10),
                Text(
                  error!,
                  style: const TextStyle(color: Colors.grey),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      body: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 0.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  flex: 2,
                  child: Column(
                    children: [
                      const Text(
                        'Hello,',
                        style: TextStyle(
                            fontSize: 70, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        userProvider.name ?? 'User',
                        style: const TextStyle(
                            fontSize: 40, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
                const Expanded(
                  flex: 2,
                  child: SizedBox(),
                )
              ],
            ),
          ),
          const SizedBox(height: 20),
          Expanded(
            flex: 6,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  InfoCard(
                    title: 'Social Media Investigation Tools',
                    description:
                        'Access our cutting-edge tools designed specifically for investigating social media platforms.',
                    link: () => navigateTo(
                        context, widget.pageController, AppPage.socialMedia),
                  ),
                  InfoCard(
                    title: 'OSINT Tools',
                    description:
                        'Utilize Open Source Intelligence (OSINT) tools to gather and analyze publicly available information.',
                    link: () => navigateTo(
                        context, widget.pageController, AppPage.osint),
                  ),
                  InfoCard(
                    title: 'Profile Analysis',
                    description:
                        'Analyze social media profiles with advanced tools. Gain insights into user activity, engagement, and follower growth.',
                    link: () => navigateTo(
                        context, widget.pageController, AppPage.analysis),
                  ),
                  InfoCard(
                    title: 'Past reports',
                    description: 'Browse previously made reports and runs.',
                    link: () => navigateTo(
                        context, widget.pageController, AppPage.pastData),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          Expanded(
            flex: 2,
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                color: Colors.blue[200],
              ),
              height: 200,
              width: screenSize.width * 0.9,
              child: const Padding(
                padding: EdgeInsets.symmetric(vertical: 40, horizontal: 20.0),
                child: Text(
                    'datadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadata'),
              ),
            ),
          ),
          const SizedBox(height: 50),
        ],
      ),
    );
  }
}

class InfoCard extends StatelessWidget {
  final String title;
  final String description;
  final void Function() link;

  const InfoCard(
      {super.key,
      required this.title,
      required this.description,
      required this.link});

  @override
  Widget build(BuildContext context) {
    var screenSize = MediaQuery.of(context).size;

    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Card(
        elevation: 5,
        child: SizedBox(
          width: screenSize.width * 0.45,
          height: screenSize.height * 0.7, // Fixed height for uniformity
          child: Column(
            children: [
              // Title at the top
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),

              // Description (Flexible content area)
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8.0),
                  child: Text(
                    description,
                    textAlign: TextAlign.center,
                  ),
                ),
              ),

              // Spacer ensures the button stays at the bottom
              const Spacer(),

              // Button aligned at a fixed position from the bottom
              Padding(
                padding: const EdgeInsets.only(bottom: 8.0),
                child: ElevatedButton(
                  onPressed: () {
                    if (kDebugMode) {
                      print('clicked');
                    }
                    link();
                  },
                  child: const Text('Navigate'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
