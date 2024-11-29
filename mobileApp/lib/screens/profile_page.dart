import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:tattletale/provider/user.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:tattletale/screens/auth_page.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  Future<void> _logout(BuildContext context) async {
    const storage = FlutterSecureStorage();
    await storage.delete(key: 'token'); // Remove token from storage

    // Navigate to AuthPage after logging out
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => const AuthPage()),
      (route) => false,
    );
  }

  Future<void> _editUsername(
      BuildContext context, UserProvider userProvider) async {
    final TextEditingController usernameController =
        TextEditingController(text: userProvider.name);

    // Show a dialog to edit username
    await showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Edit Username'),
          content: TextField(
            controller: usernameController,
            decoration: const InputDecoration(labelText: 'New Username'),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context), // Close the dialog
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                userProvider.setUser(
                  id: userProvider.id!,
                  name: usernameController.text,
                  email: userProvider.email!,
                  pic: userProvider.pic!,
                );
                Navigator.pop(context); // Close the dialog
              },
              child: const Text('Save'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Display Username
            const Text(
              'Username',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(userProvider.name ?? 'N/A',
                style: const TextStyle(fontSize: 16)),
            const SizedBox(height: 16),

            // Display Registered Email
            const Text(
              'Registered Email',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(userProvider.email ?? 'N/A',
                style: const TextStyle(fontSize: 16)),
            const SizedBox(height: 32),

            // Edit Username Button
            Center(
              child: ElevatedButton.icon(
                onPressed: () => _editUsername(context, userProvider),
                icon: const Icon(Icons.edit),
                label: const Text('Edit Username'),
              ),
            ),

            const SizedBox(height: 16),

            // Logout Button
            Center(
              child: ElevatedButton.icon(
                onPressed: () => _logout(context),
                icon: const Icon(Icons.logout),
                label: const Text('Logout'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red, // Red logout button
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
