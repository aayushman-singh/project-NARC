import 'package:flutter/material.dart';
import 'package:tattletale/screens/analysis_page.dart';
import 'package:tattletale/screens/home_page.dart';
import 'package:tattletale/screens/osint_page.dart';
import 'package:tattletale/screens/profile_page.dart';
import 'package:tattletale/screens/social_media_page.dart';
import 'package:tattletale/utils/routes.dart';

class PersistentStructure extends StatelessWidget {
  final PageController _pageController = PageController();

  PersistentStructure({super.key});

  @override
  Widget build(BuildContext context) {
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
      body: PageView(
        controller: _pageController,
        children: [
          HomePage(),
          SocialMediaPage(),
          OsintPage(),
          AnalysisPage(),
          ProfilePage(),
        ],
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Container(
          decoration: BoxDecoration(
            color: const Color.fromARGB(255, 7, 19, 28), // Background color
            borderRadius: BorderRadius.circular(20 // Rounded top-right corner
                ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1), // Subtle shadow
                spreadRadius: 5,
                blurRadius: 10,
              ),
            ],
          ),
          child: BottomAppBar(
            color: Colors
                .transparent, // Make it transparent as `Container` handles the color
            shape: const CircularNotchedRectangle(), // Adds a notch for a FAB
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                 IconButton(
                  icon: const Icon(Icons.home),
                  color: Colors.white,
                  onPressed: () {
                    navigateTo(context, Routes.home);
                  },
                ),
                IconButton(
                  icon: Image.asset('assets/detective-logo.png'),
                  color: Colors.white,
                  onPressed: () {
                    navigateTo(context, Routes.socialMedia);
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.search),
                  color: Colors.white,
                  onPressed: () {
                    navigateTo(context, Routes.osint);
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.analytics),
                  color: Colors.white,
                  onPressed: () {
                    navigateTo(context, Routes.analysis);
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.person),
                  color: Colors.white,
                  onPressed: () {
                    navigateTo(context, Routes.profile);
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
