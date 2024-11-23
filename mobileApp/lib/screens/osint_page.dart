import 'package:flutter/material.dart';

class OsintPage extends StatelessWidget {
  const OsintPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('OSINT')),
      body: const Center(child: Text('OSINT Page')),
    );
  }
}