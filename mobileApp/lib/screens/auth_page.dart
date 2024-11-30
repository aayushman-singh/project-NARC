import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:provider/provider.dart';
import 'package:tattletale/provider/user.dart';
import 'package:tattletale/structure/appbar.dart';

const localhost = '10.0.2.2'; // Emulator-specific localhost
final storage = const FlutterSecureStorage(); // Secure storage for token

class AuthPage extends StatefulWidget {
  const AuthPage({super.key});

  @override
  State<AuthPage> createState() => _AuthPageState();
}

class _AuthPageState extends State<AuthPage> {
  final _emailController = TextEditingController();
  final _nameController = TextEditingController();
  final _passwordController = TextEditingController();

  bool isLogin = true;
  bool isLoading = false;

  void toggleAuthMode() {
    setState(() {
      isLogin = !isLogin;
      print("Switched to ${isLogin ? 'Login' : 'Sign Up'} mode.");
    });
  }

  Future<void> authenticate() async {
    if (!validateInput()) {
      showSnackBar('Please fill in all required fields');
      print("Input validation failed. Fields are empty.");
      return;
    }

    final url = isLogin
        ? 'http://$localhost:5001/api/users/login'
        : 'http://$localhost:5001/api/users/signup';

    setState(() {
      isLoading = true;
    });

    try {
      print("Sending ${isLogin ? 'Login' : 'Sign Up'} request to $url...");
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

      print("Response received. Status code: ${response.statusCode}");
      print("Response body: ${response.body}");

      if (response.statusCode == 200 || response.statusCode == 201) {
        final token = jsonDecode(response.body)['token'];
        print("Token received: $token");

        if (isLogin && token != null) {
          await storage.write(key: 'token', value: token);
          print("Token saved to secure storage.");
          await fetchUserDataAndNavigate(token);
        } else {
          showSnackBar('Registration successful. Please log in.');
        }
      } else {
        final errorMessage =
            jsonDecode(response.body)['message'] ?? 'Unknown error';
        print("Error during ${isLogin ? 'Login' : 'Sign Up'}: $errorMessage");
        showSnackBar('Error: $errorMessage');
      }
    } catch (e) {
      print("Network Error: $e");
      showSnackBar('Network Error: $e');
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> fetchUserDataAndNavigate(String token) async {
    print("Fetching user data with token: $token");

    try {
      final userResponse = await http.get(
        Uri.parse('http://$localhost:5001/api/users/'),
        headers: {'Authorization': 'Bearer $token'},
      );
      
      print(
          "User data response received. Status code: ${userResponse.statusCode}");
      print("Response body: ${userResponse.body}");

      if (userResponse.statusCode == 200) {
        final userData = jsonDecode(userResponse.body);
        final List<Map<String, dynamic>> searchHistory =
              (userData['searchHistory'] as List)
                  .map((entry) => {
                        'resultId': entry['resultId'] ?? '',
                        'platform': entry['platform'] ?? '',
                        'identifier': entry['identifier'] ?? '',
                        'timestamp': entry['timestamp'] ?? '',
                      })
                  .toList();

        // Update UserProvider
        Provider.of<UserProvider>(context, listen: false).setUser(
          id: userData['_id'] ?? '', // Fallback to empty string
          name: userData['name'] ?? '', // Fallback to empty string
          email: userData['email'] ?? '', // Fallback to empty string
          pic: userData['pic'] ?? '', // Handle null for optional fields
          searchHistory: userData['searchHistory']
        );

        // Navigate to PersistentStructure
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => const PersistentStructure(),
          ),
        );
      } else {
        throw Exception('Failed to fetch user data');
      }
    } catch (e) {
      print("Error while fetching user data: $e");
      showSnackBar('Failed to load user data: $e');
    }
  }


  bool validateInput() {
    final isValid = _emailController.text.isNotEmpty &&
        _passwordController.text.isNotEmpty &&
        (isLogin || _nameController.text.isNotEmpty);

    print("Validation result: $isValid");
    return isValid;
  }

  void showSnackBar(String message) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(message)));
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
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
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
