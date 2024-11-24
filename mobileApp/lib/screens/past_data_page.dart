import 'package:flutter/material.dart';

class PastDataPage extends StatelessWidget {
  const PastDataPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Past Data')),
      body: const Center(child: Text('Past Data Page')),
    );
  }
}