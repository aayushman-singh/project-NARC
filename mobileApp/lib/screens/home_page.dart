import 'package:flutter/material.dart';
import '../utils/routes.dart';

class HomePage extends StatelessWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var screenSize = MediaQuery.of(context).size;
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Tattletale',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        leading: Builder(
          builder: (context) {
            return IconButton(
              icon: const Icon(Icons.menu),
              onPressed: () {
                Scaffold.of(context).openDrawer();
              },
            );
          },
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () => navigateTo(context, Routes.profile),
          ),
        ],
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            const DrawerHeader(
              decoration: BoxDecoration(color: Colors.blue),
              child: Text(
                'Tattletale Menu',
                style: TextStyle(color: Colors.white, fontSize: 24),
              ),
            ),
            ListTile(
              leading: const Icon(Icons.people),
              title: const Text('Social Media'),
              onTap: () => navigateTo(context, Routes.socialMedia),
            ),
            ListTile(
              leading: const Icon(Icons.search),
              title: const Text('OSINT'),
              onTap: () => navigateTo(context, Routes.osint),
            ),
            ListTile(
              leading: const Icon(Icons.history),
              title: const Text('Past Data'),
              onTap: () => navigateTo(context, Routes.pastData),
            ),
          ],
        ),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'Welcome to Tattletale',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            Container(
              width: screenSize.width * 0.9,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  InfoCard(
                    title: 'Social Media Investigation Tools',
                    description:
                        'Access our cutting-edge tools designed specifically for investigating social media platforms.',
                    link: () => navigateTo(
                        context, Routes.socialMedia), // Pass a closure
                  ),
                  InfoCard(
                    title: 'OSINT Tools',
                    description:
                        'Utilize Open Source Intelligence (OSINT) tools to gather and analyze publicly available information.',
                    link: () =>
                        navigateTo(context, Routes.osint), // Pass a closure
                  ),
                  InfoCard(
                    title: 'Profile Analysis',
                    description:
                        'Analyze social media profiles with advanced tools. Gain insights into user activity, engagement, and follower growth.',
                    link: () =>
                        navigateTo(context, Routes.analysis), // Pass a closure
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

class InfoCard extends StatelessWidget {
  final String title;
  final String description;
  final void Function() link;

  InfoCard(
      {Key? key,
      required this.title,
      required this.description,
      required this.link})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    var screenSize = MediaQuery.of(context).size;

    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Card(
        elevation: 5,
        child: SizedBox(
          width: screenSize.width * 0.2,
          height: screenSize.height * 0.7,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              Text(
                title,
                style:
                    const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              Text(
                description,
                textAlign: TextAlign.center,
              ),
              ElevatedButton(
                onPressed: () {
                  print('clicked');
                  link();
                },
                child: const Text('Navigate'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
