import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:tattletale/structure/appbar.dart';
import 'package:tattletale/screens/onboarding_page.dart';
import 'package:tattletale/screens/auth_page.dart';

class SplashPage extends StatelessWidget {
  const SplashPage({super.key});

  Future<void> checkUserStatus(BuildContext context) async {
    final storage = const FlutterSecureStorage();
    final token = await storage.read(key: 'token');

    // Check if onboarding has been completed
    final prefs = await SharedPreferences.getInstance();
    final showOnboarding = prefs.getBool('showOnboarding') ?? true;

    // Navigate based on user status
    if (token != null) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => PersistentStructure(),
        ),
      );
    } else if (showOnboarding) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => const OnboardingPage(),
        ),
      );
    } else {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => const AuthPage(),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    // Navigate after a delay
    Timer(const Duration(seconds: 2), () {
      checkUserStatus(context);
    });

    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(
              height: 200,
              child: Image.asset('assets/logo.png'),
            ),
          ],
        ),
      ),
    );
  }
}
