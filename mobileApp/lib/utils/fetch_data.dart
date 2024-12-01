import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class SocialMediaDetailsFetcher {
  static const Map<String, int> platformPorts = {
    'whatsapp': 3004,
    'facebook': 3002,
    'x': 3003,
    'telegram': 3005,
    'instagram': 3001,
  };

  static Future<Map<String, dynamic>?> handleShowDetails({
    required BuildContext context,
    required String platform,
    required String username,
    String? password,
  }) async {
    final int? port = platformPorts[platform];
    if (port == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Unknown platform or port not configured')),
      );
      return null;
    }

    final queryParams =
        password != null ? '?password=${Uri.encodeComponent(password)}' : '';
    final url = 'http://localhost:$port/$platform/users/$username$queryParams';

    try {
      final response = await http.get(Uri.parse(url));

      if (response.statusCode != 200) {
        throw Exception('User not found');
      }

      final data = jsonDecode(response.body);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Data fetched successfully')),
      );

      return data;
    } catch (error) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to fetch data: $error')),
      );
      return null;
    }
  }
}
