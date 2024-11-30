import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:provider/provider.dart';
import 'package:tattletale/provider/user.dart';
import 'package:tattletale/screens/auth_page.dart';

class ProfilePage extends StatefulWidget {
  @override
  _ProfilePageState createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  final storage = const FlutterSecureStorage();
  Map<String, dynamic>? user;
  bool loading = true;
  String? error;
  final String localhost = '10.0.2.2';

  @override
  void initState() {
    super.initState();
    fetchUserData();
  }

  Future<void> fetchUserData() async {
    setState(() {
      loading = true;
      error = null;
    });

    try {
      // Retrieve the token from secure storage
      final token = await storage.read(key: 'token');
      if (token == null || token.isEmpty) {
        throw Exception("Authentication token not found. Please log in.");
      }

      // Fetch user data using the token
      final userResponse = await http.get(
        Uri.parse('http://$localhost:5001/api/users/'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (userResponse.statusCode == 200) {
        final userData = jsonDecode(userResponse.body);

        // Update UserProvider
        Provider.of<UserProvider>(context, listen: false).setUser(
            id: userData['_id'] ?? '',
            name: userData['name'] ?? '',
            email: userData['email'] ?? '',
            pic: userData['pic'] ?? '',
            searchHistory: userData['searchHistory']);

        // Set user data for display
        setState(() {
          user = userData;
        });
      } else {
        final errorMessage = jsonDecode(userResponse.body)['message'] ??
            'Failed to fetch user data';
        throw Exception(errorMessage);
      }
    } catch (err) {
      setState(() {
        error = err.toString();
      });
    } finally {
      setState(() {
        loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);
    if (loading) {
      return Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (error != null) {
      return Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: Card(
            color: Colors.red[900],
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.error, color: Colors.red, size: 50),
                  const SizedBox(height: 10),
                  Text(
                    "Profile Error",
                    style: TextStyle(color: Colors.red[200], fontSize: 20),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    error!,
                    style: const TextStyle(color: Colors.white),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Profile Header
            Card(
              color: Colors.grey[850],
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 40,
                      backgroundColor: Colors.blue,
                      child: Text(
                        user!['name'][0].toUpperCase(),
                        style:
                            const TextStyle(color: Colors.white, fontSize: 24),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user!['name'],
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 24,
                              fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          "Joined on ${DateTime.parse(user!['createdAt']).toLocal().toString().split(' ')[0]}",
                          style:
                              const TextStyle(color: Colors.grey, fontSize: 14),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // User Info
            Card(
              color: Colors.grey[850],
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    ListTile(
                      leading: const Icon(Icons.email, color: Colors.blue),
                      title: const Text(
                        "Email Address",
                        style: TextStyle(color: Colors.grey, fontSize: 14),
                      ),
                      subtitle: Text(
                        user!['email'],
                        style: const TextStyle(color: Colors.white),
                      ),
                    ),
                    ListTile(
                      leading: const Icon(Icons.person, color: Colors.purple),
                      title: const Text(
                        "Account Type",
                        style: TextStyle(color: Colors.grey, fontSize: 14),
                      ),
                      subtitle: Text(
                        user!['isAdmin'] ? "Administrator" : "Standard User",
                        style: const TextStyle(color: Colors.white),
                      ),
                    ),
                    Card(
                      color: Colors.grey[850],
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              "Search History",
                              style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 10),
                            userProvider.searchHistory.isNotEmpty
                                ? Column(
                                    children: userProvider.searchHistory
                                        .map<Widget>((history) => ListTile(
                                              title: Text(
                                                history['platform'],
                                                style: const TextStyle(
                                                    color: Colors.blue),
                                              ),
                                              subtitle: Text(
                                                "${history['identifier']} - ${DateTime.parse(history['timestamp']).toLocal()}",
                                                style: const TextStyle(
                                                    color: Colors.grey),
                                              ),
                                            ))
                                        .toList(),
                                  )
                                : const Center(
                                    child: Text(
                                      "No search history available.",
                                      style: TextStyle(color: Colors.grey),
                                    ),
                                  ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
