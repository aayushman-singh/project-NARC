import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:provider/provider.dart';
import 'package:tattletale/provider/user.dart';

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
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();

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
      final token = await storage.read(key: 'token');
      if (token == null || token.isEmpty) {
        throw Exception("Authentication token not found. Please log in.");
      }

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
          searchHistory: userData['searchHistory'],
        );

        // Set user data for display
        setState(() {
          user = userData;
          _nameController.text = userData['name'] ?? '';
          _emailController.text = userData['email'] ?? '';
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

  Future<void> updateUserData() async {
    setState(() {
      loading = true;
    });

    try {
      final token = await storage.read(key: 'token');
      if (token == null || token.isEmpty) {
        throw Exception("Authentication token not found. Please log in.");
      }

      final response = await http.put(
        Uri.parse('http://$localhost:5001/api/users/userInfo'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'name': _nameController.text,
          'email': _emailController.text,
        }),
      );

      if (response.statusCode == 200) {
        fetchUserData();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Profile updated successfully!")),
        );
      } else {
        final errorMessage =
            jsonDecode(response.body)['message'] ?? 'Failed to update profile';
        throw Exception(errorMessage);
      }
    } catch (err) {
      setState(() {
        error = err.toString();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error: $error")),
      );
    } finally {
      setState(() {
        loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return Scaffold(
        backgroundColor: Colors.black,
        body: const Center(
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
                        Container(
                          height: 100,
                          width: 150,
                          child: TextField(
                          controller: _nameController,
                          style: const TextStyle(color: Colors.white),
                          decoration: const InputDecoration(
                            labelText: 'Name',
                            labelStyle: TextStyle(color: Colors.grey),
                          ),
                        ),
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

            // Email Input
            Card(
              color: Colors.grey[850],
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: TextField(
                  controller: _emailController,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    labelText: 'Email',
                    labelStyle: TextStyle(color: Colors.grey),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Save Button
            ElevatedButton(
              onPressed: updateUserData,
              child: const Text("Save Changes"),
            ),
          ],
        ),
      ),
    );
  }
}
