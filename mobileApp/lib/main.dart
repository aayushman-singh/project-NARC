import 'package:flutter/material.dart';
import 'package:tattletale/utils/routes.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:provider/provider.dart';
import 'package:tattletale/provider/user.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();
  final showOnboarding = prefs.getBool('showOnboarding') ?? true;
  runApp(MultiProvider(
      providers: [
        ChangeNotifierProvider(
            create: (_) => UserProvider()), // Register UserProvider
      ],
      child: TattletaleApp(
        showOnboarding: showOnboarding,
      )));
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
      routes: Routes.getRoutes(),
    );
  }
}
