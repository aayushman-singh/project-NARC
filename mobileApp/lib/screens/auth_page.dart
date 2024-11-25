import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:provider/provider.dart';
import 'package:tattletale/provider/user.dart';
import 'package:tattletale/utils/routes.dart';

const localhost = '10.0.2.2'; // Emulator-specific localhost

final storage = const FlutterSecureStorage(); // Secure storage for token

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _emailController = TextEditingController();
  final _nameController = TextEditingController();
  final _passwordController = TextEditingController();

  bool isLogin = true;

  void toggleAuthMode() {
    setState(() {
      isLogin = !isLogin;
    });
  }

  Future<void> authenticate() async {
    if (!validateInput()) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all required fields')),
      );
      return;
    }

    final url = isLogin
        ? 'http://$localhost:5001/api/users/login'
        : 'http://$localhost:5001/api/users/signup';

    try {
      final response = await http.post(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(
          isLogin
              ? {
                  "email": _emailController.text,
                  "password": _passwordController.text,
                }
              : {
                  "name": _nameController.text,
                  "email": _emailController.text,
                  "password": _passwordController.text,
                },
        ),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final token = jsonDecode(response.body)['token'];
        if (isLogin && token != null) {
          await storage.write(key: 'token', value: token);
          await fetchUserDataAndNavigate(token);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Registration successful.')),
          );
        }
      } else {
        print(response.body); // Debugging purpose
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${response.body}')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Network Error: $e')),
      );
    }
  }

  Future<void> fetchUserDataAndNavigate(String token) async {
    try {
      final userResponse = await http.get(
        Uri.parse('http://$localhost:5001/api/users/'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (userResponse.statusCode == 200) {
        final userData = jsonDecode(userResponse.body);

        // Update UserProvider
        Provider.of<UserProvider>(context, listen: false).setUser(
          id: userData['_id'],
          name: userData['name'],
          email: userData['email'],
          pic: userData['pic'],
        );

        // Navigate to Home Screen
        navigateTo(context, Routes.home);
      } else {
        throw Exception('Failed to fetch user data');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load user data: $e')),
      );
    }
  }

  bool validateInput() {
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      return false;
    }

    if (!isLogin && _nameController.text.isEmpty) {
      return false;
    }

    return true;
  }

  @override
  void dispose() {
    _emailController.dispose();
    _nameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(isLogin ? 'Login' : 'Sign Up')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (!isLogin)
              TextField(
                controller: _nameController,
                decoration: const InputDecoration(labelText: 'Name'),
              ),
            const SizedBox(height: 10),
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(labelText: 'Email'),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _passwordController,
              decoration: const InputDecoration(labelText: 'Password'),
              obscureText: true,
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: authenticate,
              child: Text(isLogin ? 'Login' : 'Sign Up'),
            ),
            TextButton(
              onPressed: toggleAuthMode,
              child: Text(isLogin
                  ? 'Don\'t have an account? Sign Up'
                  : 'Already have an account? Login'),
            ),
          ],
        ),
      ),
    );
  }
}
