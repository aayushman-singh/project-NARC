import 'package:flutter/material.dart';
import 'package:tattletale/screens/home_page.dart';
import 'package:tattletale/screens/onboarding_page.dart';
import 'package:tattletale/screens/osint_page.dart';
import 'package:tattletale/screens/past_data_page.dart';
import 'package:tattletale/screens/profile_page.dart';
import 'package:tattletale/screens/social_media_page.dart';
import 'package:tattletale/screens/splash_screen_page.dart';
import 'package:tattletale/utils/routes.dart';
import 'package:shared_preferences/shared_preferences.dart';
// Assuming services.dart is the file where the Services widget is implemented

void main() async{
    WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();
  final showOnboarding = prefs.getBool('showOnboarding') ?? true;
  runApp(TattletaleApp(showOnboarding: showOnboarding,));
  
}

class TattletaleApp extends StatelessWidget {
   final bool showOnboarding;
  const TattletaleApp({super.key, required this.showOnboarding});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false, // Hides the debug banner
      title: 'Tattletale',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      initialRoute: Routes.splash,
  routes: {
    Routes.splash: (context) => SplashScreenPage(showOnboarding: showOnboarding),
    Routes.home: (context) => const HomePage(),
    Routes.profile: (context) => const ProfilePage(),
    Routes.socialMedia: (context) => const SocialMediaPage(),
    Routes.osint: (context) => const OsintPage(),
    Routes.pastData: (context) => const PastDataPage(),
    Routes.onboarding: (context) => const OnboardingScreen(),
  },
    );
  }
}
