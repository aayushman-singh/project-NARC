import 'package:flutter/material.dart';
import 'package:tattletale/screens/auth_page.dart';
import 'package:tattletale/screens/onboarding_page.dart';
import 'package:tattletale/screens/home_page.dart';
import 'package:tattletale/screens/splash_screen_page.dart';
import '../screens/profile_page.dart';
import '../screens/social_media_page.dart';
import '../screens/osint_page.dart';
import '../screens/past_data_page.dart';
import '../screens/analysis_page.dart';

class Routes {
  static const String home = '/';
  static const String splash = '/splash';
  static const String profile = '/profile';
  static const String socialMedia = '/socialMedia';
  static const String osint = '/osint';
  static const String pastData = '/pastData';
  static const String analysis = '/analysis';
  static const String onboarding = '/onboarding';
  static const String auth = '/auth';

  static Map<String, WidgetBuilder> getRoutes() {
    return {
      home: (context) => const HomePage(),
      splash: (content) => SplashScreenPage(showOnboarding: true),
      profile: (context) => const ProfilePage(),
      socialMedia: (context) => const SocialMediaPage(),
      osint: (context) => const OsintPage(),
      pastData: (context) => const PastDataPage(),
      analysis: (context) => const AnalysisPage(),
      onboarding: (context) => const OnboardingPage(),
      auth: (context) => const AuthScreen(),
    };
  }
}

void navigateTo(
    BuildContext context, PageController pageController, int pageIndex) {
  pageController.animateToPage(pageIndex,
      duration: const Duration(milliseconds: 200), curve: Curves.easeInOut);
}
