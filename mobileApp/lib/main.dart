import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:provider/provider.dart';
import 'package:tattletale/provider/user.dart';
import 'package:tattletale/screens/splash_page.dart';
import 'package:tattletale/screens/onboarding_page.dart';
import 'package:tattletale/screens/auth_page.dart';
import 'package:tattletale/structure/appbar.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();
  final showOnboarding = prefs.getBool('showOnboarding') ?? true;

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => UserProvider(),
        ),
      ],
      child: TattletaleApp(showOnboarding: showOnboarding),
    ),
  );
}

class TattletaleApp extends StatelessWidget {
  final bool showOnboarding;

  const TattletaleApp({Key? key, required this.showOnboarding})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Tattletale',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      // Start with the splash screen
      home: SplashPage(),
    );
  }
}
