import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:tattletale/provider/user.dart';
import '../utils/routes.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);
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
             ListTile(
              leading: const Icon(Icons.analytics),
              title: const Text('Profile Analysis'),
              onTap: () => navigateTo(context, Routes.analysis),
            ),
          ],
        ),
      ),
      
      body: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 10,horizontal: 0.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    flex: 2,
                    child: Column(
                      children: [
                        const Text(
                          'Hello,',
                          style: TextStyle(fontSize: 40, fontWeight: FontWeight.bold),
                        ),
                         Text(
                          userProvider.name ?? "User",
                          style: const TextStyle(fontSize: 50, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    flex: 2,
                    child: SizedBox(),
                  )
                ],
              ),
            ),
            SizedBox(height: 20),
            Expanded(
            flex: 4,
              child: ListView(
               scrollDirection: Axis.horizontal,
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
                  InfoCard(
                    title: 'Past reports',
                    description:
                        'Browse previously made reports and runs.',
                    link: () =>
                        navigateTo(context, Routes.pastData), // Pass a closure
                  ),
                ],
              ),
            ),
            SizedBox(height: 20),
            Expanded(
              flex: 3,
              child: Container(
                decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                color: Colors.blue[200],
                ),
              height: 300,
              width: screenSize.width*0.9,
              
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 40,horizontal: 20.0),
                child: const Text('datadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadata'),
              ),
              ),
            ),
            SizedBox(height: 100)
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
                  if (kDebugMode) {
                    print('clicked');
                  }
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
