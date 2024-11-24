import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:tattletale/utils/routes.dart';

class SplashScreenPage extends StatelessWidget {
  final bool showOnboarding;

  Future<void> checkUserStatus(BuildContext context) async {
    final storage = const FlutterSecureStorage();
    final token = await storage.read(key: 'token');

    // Check if onboarding has been completed
    final prefs = await SharedPreferences.getInstance();
    final showOnboarding = prefs.getBool('showOnboarding') ?? true;

    // Navigate based on user status
    if (token != null) {
      navigateTo(context, Routes.home);
    } else if (showOnboarding) {
      navigateTo(context, Routes.onboarding);
    } else {
      navigateTo(context, Routes.auth);
    }
  }
  const SplashScreenPage({super.key, required this.showOnboarding});


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
            
            SizedBox(height: 200, child: Image.asset('assets/logo.png'),),
           
           
          ],
        ),
      ),
    );
  }
}
