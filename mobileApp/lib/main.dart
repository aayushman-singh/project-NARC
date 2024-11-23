import 'package:flutter/material.dart';
import 'screens/services.dart'; // Assuming services.dart is the file where the Services widget is implemented

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false, // Hides the debug banner
      title: 'Social Media Investigation Tool',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: Services(), // The Services widget we created
    );
  }
}
