import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:tattletale/provider/user.dart';
import '../utils/routes.dart';

class HomePage extends StatelessWidget {
  final PageController pageController;
  const HomePage({super.key, required this.pageController});

  @override
  Widget build(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);
    var screenSize = MediaQuery.of(context).size;
    return Scaffold(
      body: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 0.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  flex: 2,
                  child: Column(
                    children: [
                      const Text(
                        'Hello,',
                        style: TextStyle(
                            fontSize: 40, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        userProvider.name ?? "User",
                        style: const TextStyle(
                            fontSize: 50, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
                const Expanded(
                  flex: 2,
                  child: SizedBox(),
                )
              ],
            ),
          ),
          const SizedBox(height: 20),
          Expanded(
            flex: 4,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  InfoCard(
                    title: 'Social Media Investigation Tools',
                    description:
                        'Access our cutting-edge tools designed specifically for investigating social media platforms.',
                    link: () => navigateTo(
                        context, pageController,AppPage.socialMedia), // Pass a closure
                  ),
                  InfoCard(
                    title: 'OSINT Tools',
                    description:
                        'Utilize Open Source Intelligence (OSINT) tools to gather and analyze publicly available information.',
                    link: () =>
                        navigateTo(context,pageController, AppPage.osint), // Pass a closure
                  ),
                  InfoCard(
                    title: 'Profile Analysis',
                    description:
                        'Analyze social media profiles with advanced tools. Gain insights into user activity, engagement, and follower growth.',
                    link: () =>
                        navigateTo(context,pageController, AppPage.analysis), // Pass a closure
                  ),
                  InfoCard(
                    title: 'Past reports',
                    description: 'Browse previously made reports and runs.',
                    link: () =>
                        navigateTo(context,pageController, AppPage.pastData), // Pass a closure
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          Expanded(
            flex: 3,
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                color: Colors.blue[200],
              ),
              height: 300,
              width: screenSize.width * 0.9,
              child: const Padding(
                padding:
                    EdgeInsets.symmetric(vertical: 40, horizontal: 20.0),
                child: Text(
                    'datadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadata'),
              ),
            ),
          ),
          const SizedBox(height: 100)
        ],
      ),
    );
  }
}

class InfoCard extends StatelessWidget {
  final String title;
  final String description;
  final void Function() link;

  InfoCard(
      {super.key,
      required this.title,
      required this.description,
      required this.link});

  @override
  Widget build(BuildContext context) {
    var screenSize = MediaQuery.of(context).size;

    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Card(
        elevation: 5,
        child: SizedBox(
          width: screenSize.width * 0.35,
          height: screenSize.height * 0.5, // Fixed height for uniformity
          child: Column(
            children: [
              // Title at the top
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),

              // Description (Flexible content area)
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8.0),
                  child: Text(
                    description,
                    textAlign: TextAlign.center,
                  ),
                ),
              ),

              // Spacer ensures the button stays at the bottom
              const Spacer(),

              // Button aligned at a fixed position from the bottom
              Padding(
                padding: const EdgeInsets.only(bottom: 8.0),
                child: ElevatedButton(
                  onPressed: () {
                    if (kDebugMode) {
                      print('clicked');
                    }
                    link();
                  },
                  child: const Text('Navigate'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
