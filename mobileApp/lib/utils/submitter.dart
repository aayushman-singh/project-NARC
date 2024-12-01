import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class SocialMediaSubmitter {
  final Map<String, int> platformPorts = {
    "instagram": 3001,
    "facebook": 3002,
    "x": 3003,
    "whatsapp": 3004,
    "telegram": 3005,
  };

  final String baseUrl = "http://10.0.2.2";

  Future<void> handleSubmit({
    required BuildContext context,
    required String platform,
    required String tagsInput,
    required String? password,
    required int limit,
    String? pin,
  }) async {
    if (!platformPorts.containsKey(platform)) {
      _showAlert(
          context, "Unsupported platform. Please select a valid platform.");
      return;
    }

    final port = platformPorts[platform];
    final apiEndpoint = "$baseUrl:$port/$platform";

    // Process tags input
    final tagsArray = tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .where((tag) => tag.isNotEmpty)
        .toList();

    if (tagsArray.isEmpty) {
      _showAlert(context, "Please enter valid tags.");
      return;
    }

    // Prepare payload
    final payload = {
      "userId": "your-user-id", // Replace with user ID as required
      "startUrls": platform == "telegram"
          ? tagsArray.map((tag) => "+91$tag").toList()
          : tagsArray,
      "limit": limit,
    };

    if (platform == "facebook" && pin != null && pin.isNotEmpty) {
      payload["pin"] = pin;
    }

    if (platform != "whatsapp" &&
        platform != "telegram" &&
        password != null &&
        password.isNotEmpty) {
      payload["password"] = password;
    }

    try {
      // Make POST API call
      final response = await http.post(
        Uri.parse(apiEndpoint),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(payload),
      );

      if (response.statusCode == 200) {
        _showAlert(context, "Account scraped successfully.");
        print("Payload sent to $platform: $payload");
      } else {
        print("Error details: ${response.body}");
        throw Exception(
            "Request failed for $platform: ${response.reasonPhrase}");
      }
    } catch (error) {
      print("Error submitting tags for $platform: $error");
      _showAlert(context, "Failed to submit tags. Please try again.");
    }
  }

  void _showAlert(BuildContext context, String message) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(message)));
  }
}
