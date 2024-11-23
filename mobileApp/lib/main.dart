import 'package:flutter/material.dart';
import 'package:tattletale/screens/home_page.dart';
import 'package:tattletale/screens/osint_page.dart';
import 'package:tattletale/screens/past_data_page.dart';
import 'package:tattletale/screens/profile_page.dart';
import 'package:tattletale/screens/social_media_page.dart';
import 'package:tattletale/utils/routes.dart';
// Assuming services.dart is the file where the Services widget is implemented

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: HomePage(),
      debugShowCheckedModeBanner: false, // Hides the debug banner
      title: 'Tattletale',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
  routes: {
   
    Routes.profile: (context) => const ProfilePage(),
    Routes.socialMedia: (context) => SocialMediaPage(),
    Routes.osint: (context) => const OsintPage(),
    Routes.pastData: (context) => const PastDataPage(),
  },
    );
  }
}
