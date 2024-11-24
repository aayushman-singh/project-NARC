import 'package:flutter/material.dart';
import 'package:tattletale/screens/onboarding_page.dart';
import '../screens/home_page.dart';
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

  static Map<String, WidgetBuilder> routes = {
    home: (context) => const HomePage(),
    profile: (context) => const ProfilePage(),
    socialMedia: (context) => SocialMediaPage(),
    osint: (context) => const OsintPage(),
    pastData: (context) => const PastDataPage(),
    analysis: (context) => const AnalysisPage(),
    onboarding: (context) => const OnboardingPage(),
  };
}

void navigateTo(BuildContext context, String route) {
  Navigator.pushNamed(context, route);
}
