import 'package:flutter/material.dart';
import 'package:tattletale/screens/home_page.dart';
import 'package:tattletale/utils/routes.dart';


class OnboardingPage extends StatelessWidget {
  const OnboardingPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return OnboardingScreen();
  }
}

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({Key? key}) : super(key: key);

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}


class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _controller = PageController();
  int _currentPage = 0;

  final List<Map<String, dynamic>> _onboardingData = [
    {
      "title": "Welcome to Tattletale",
      "text": "A Powerful Social Media Investigation Tool",
      "icon": null, // No icon for the first page
      "isFirst": true,
    },
    {
      "title": "Secure Investigation",
      "text":
          "Our Social Media Investigator Tool is designed to enhance digital forensics in law enforcement investigations.",
      "icon": Icons.shield,
    },
    {
      "title": "Comprehensive Analysis",
      "text":
          "We offer seamless integration with major social media platforms, allowing investigators to automatically parse and analyze data.",
      "icon": Icons.search,
    },
    {
      "title": "Automated Documentation",
      "text":
          "Our mission is to streamline the documentation process in social media investigations.",
      "icon": Icons.description,
    },
    {
      "title": "Social Media Investigation",
      "text":
          "Track hashtags, users, posts, and messages to uncover illegal activities.",
      "icon": Icons.people,
    },
    {
      "title": "Application Monitoring",
      "text":
          "Monitor messages, user profiles and media for any signs of illegal activity.",
      "icon": Icons.chat,
    },
    {
      "title": "Cross-Platform Reports",
      "text":
          "Generate detailed reports that combine evidence from multiple platforms.",
      "icon": Icons.bar_chart,
    },
    {
      "title": "Get Started",
      "text": "Take the first step towards smarter investigations today!",
      "icon": null,
      "isLast": true
    },
  ];

  void _skipOnboarding() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const HomePage()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          PageView.builder(
            controller: _controller,
            onPageChanged: (index) {
              setState(() {
                _currentPage = index;
              });
            },
            itemCount: _onboardingData.length,
            itemBuilder: (context, index) {
              final data = _onboardingData[index];
              return _buildOnboardingPage(
                context,
                data["title"]!,
                data["text"]!,
                data["icon"],
                isFirst: data["isFirst"] ?? false,
                isLast: index == _onboardingData.length - 1
              );
            },
          ),
          Positioned(
            top: 40,
            left: 16,
            child: _currentPage == 0
                ? const SizedBox.shrink()
                : TextButton(
                    onPressed: _skipOnboarding,
                    child: const Text(
                      "Skip",
                      style: TextStyle(color: Colors.blue, fontSize: 16),
                    ),
                  ),
          ),
          Positioned(
            top: 40,
            right: 16,
            child: _currentPage == 0
                ? const SizedBox.shrink()
                : SizedBox(
                    height: 50,
                    child: Image.asset('assets/logo.png'),
                  ),
          ),
          Positioned(
            bottom: 30,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                _onboardingData.length,
                (index) => _buildDot(index),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOnboardingPage(BuildContext context, String title, String text, IconData? icon,
    {bool isFirst = false, bool isLast = false}) {
  return Center(
    child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (isFirst)
          Column(
            children: [
              Container(
                height: 150,
                width: 150,
                child: Image.asset('assets/logo.png'),
              ),
              const SizedBox(height: 20),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.blue,
                ),
              ),
            ],
          )
        else
          Column(
            children: [
              if (icon != null)
                Icon(
                  icon,
                  size: 100,
                  color: Colors.blue,
                ),
              const SizedBox(height: 16),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Text(
                  text,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 18),
                ),
              ),
              if (isLast) // Add the "Get Started" arrow
                const SizedBox(height: 20),
              if (isLast)
                GestureDetector(
                  onTap: () {
                    navigateTo(context, Routes.home);
                  },
                  child: Column(
                    children: [
                      const Icon(
                        Icons.arrow_right,
                        size: 200,
                        color: Colors.blue,
                      ),
                      const SizedBox(height: 10),
                     
                    ],
                  ),
                ),
            ],
          ),
      ],
    ),
  );
}


  Widget _buildDot(int index) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: const EdgeInsets.symmetric(horizontal: 4),
      height: 10,
      width: _currentPage == index ? 20 : 10,
      decoration: BoxDecoration(
        color: _currentPage == index ? Colors.blue : Colors.grey,
        borderRadius: BorderRadius.circular(5),
      ),
    );
  }
}
