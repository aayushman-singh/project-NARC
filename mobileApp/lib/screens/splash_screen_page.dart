import 'dart:async';
import 'package:flutter/material.dart';
import 'package:tattletale/utils/routes.dart';

class SplashScreenPage extends StatelessWidget {
  final bool showOnboarding;

  const SplashScreenPage({Key? key, required this.showOnboarding})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Navigate after a delay
    Timer(const Duration(seconds: 2), () {
      if (showOnboarding) {
        navigateTo(context, Routes.onboarding);
      } else {
        navigateTo(context, Routes.home);
      }
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
