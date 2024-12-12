import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class OsintPage extends StatefulWidget {
  const OsintPage({super.key});

  @override
  _OsintPageState createState() => _OsintPageState();
}

class _OsintPageState extends State<OsintPage> {
  final TextEditingController _usernameController = TextEditingController();
  List<String> _urls = [];
  bool _loading = false;
  String? _error;
  final String localhost = "10.0.2.2";

  Future<void> handleSearch() async {
    final username = _usernameController.text.trim();
    if (username.isEmpty) {
      setState(() {
        _error = "Please enter a username.";
      });
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
      _urls = [];
    });

    try {
      final response = await http.post(
        Uri.parse("http://$localhost:5000/api/search"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"username": username}),
      );

      if (response.statusCode != 200) {
        throw Exception("Failed to fetch results: ${response.reasonPhrase}");
      }

      final data = jsonDecode(response.body);
      List<String> extractedUrls = [];

      if (data["urls"] != null && data["urls"] is List) {
        extractedUrls = List<String>.from(data["urls"]);
      } else if (data["rawOutput"] != null && data["rawOutput"] is String) {
        final urlRegex = RegExp(r"(https?:\/\/[^\s]+)");
        extractedUrls = urlRegex
            .allMatches(data["rawOutput"])
            .map((match) => match.group(0)!)
            .toList();
      } else {
        throw Exception("No URLs found for the given username.");
      }

      setState(() {
        _urls = extractedUrls;
      });
    } catch (err) {
      setState(() {
        _error = err.toString();
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const SizedBox(height: 50),
            Text(
              "Maigret Search",
              style: TextStyle(
                fontSize: 36,
                fontWeight: FontWeight.bold,
                foreground: Paint()
                  ..shader = const LinearGradient(
                    colors: [Colors.blue, Colors.purple],
                  ).createShader(Rect.fromLTWH(0, 0, 200, 70)),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              "Uncover digital footprints across the web with Maigret Search, your go-to OSINT tool for comprehensive profile discovery.",
              style: TextStyle(color: Colors.grey[400], fontSize: 16),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 30),
            if (_loading)
              const CircularProgressIndicator()
            else
              Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  TextField(
                    controller: _usernameController,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: "Enter a username",
                      hintStyle: TextStyle(color: Colors.grey[600]),
                      prefixIcon: Icon(Icons.search, color: Colors.grey[600]),
                      filled: true,
                      fillColor: Colors.grey[800],
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8.0),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _loading ? null : handleSearch,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      backgroundColor: Colors.blue,
                      foregroundColor: Colors.white,
                    ),
                    child: Text(
                      _loading ? "Searching..." : "Unveil Digital Presence",
                      style: const TextStyle(fontSize: 16),
                    ),
                  ),
                ],
              ),
            if (_error != null)
              Padding(
                padding: const EdgeInsets.only(top: 20.0),
                child: Text(
                  _error!,
                  style: TextStyle(color: Colors.red[400], fontSize: 14),
                  textAlign: TextAlign.center,
                ),
              ),
            if (_urls.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Results for ${_usernameController.text}:",
                      style: const TextStyle(
                        color: Colors.blue,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 10),
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _urls.length,
                      itemBuilder: (context, index) {
                        final url = _urls[index];
                        return Card(
                          color: Colors.grey[800],
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: Colors.blue,
                              child: Text(
                                "${index + 1}",
                                style: const TextStyle(color: Colors.white),
                              ),
                            ),
                            title: Text(
                              url,
                              style: const TextStyle(color: Colors.blue),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            trailing: IconButton(
                              icon: const Icon(Icons.open_in_new),
                              color: Colors.grey,
                              onPressed: () {
                                // Open the URL in a browser
                              },
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
