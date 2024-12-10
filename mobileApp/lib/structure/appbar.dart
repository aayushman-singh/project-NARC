import 'package:flutter/material.dart';
import 'package:tattletale/screens/analysis_page.dart';
import 'package:tattletale/screens/auth_page.dart';
import 'package:tattletale/screens/home_page.dart';
import 'package:tattletale/screens/onboarding_page.dart';
import 'package:tattletale/screens/osint_page.dart';
import 'package:tattletale/screens/past_data_page.dart';
import 'package:tattletale/screens/profile_page.dart';
import 'package:tattletale/screens/social_media_page.dart';
import 'package:tattletale/screens/splash_page.dart';
import 'package:tattletale/utils/routes.dart';

class PersistentStructure extends StatefulWidget {
  const PersistentStructure({super.key});

  @override
  State<PersistentStructure> createState() => _PersistentStructureState();
}

class _PersistentStructureState extends State<PersistentStructure> {
  final PageController pageController = PageController();
  AppPage _currentPage = AppPage.home;

  void navigateTo(AppPage page) {
    setState(() {
      _currentPage = page;
    });
    pageController.animateToPage(
      page.index,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }

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
            onPressed: () => navigateTo(AppPage.profile),
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
              leading: const Icon(Icons.home),
              title: const Text('Home'),
              onTap: () => navigateTo(AppPage.home),
            ),
            ListTile(
              leading: const Icon(Icons.people),
              title: const Text('Social Media'),
              onTap: () => navigateTo(AppPage.socialMedia),
            ),
            ListTile(
              leading: const Icon(Icons.search),
              title: const Text('OSINT'),
              onTap: () => navigateTo(AppPage.osint),
            ),
            ListTile(
              leading: const Icon(Icons.analytics),
              title: const Text('Analysis'),
              onTap: () => navigateTo(AppPage.analysis),
            ),
            ListTile(
              leading: const Icon(Icons.data_exploration),
              title: const Text('Past Reports'),
              onTap: () => navigateTo(AppPage.pastData),
            ),
            ListTile(
              leading: const Icon(Icons.person),
              title: const Text('Profile'),
              onTap: () => navigateTo(AppPage.profile),
            ),
          ],
        ),
      ),
      body: PageView(
        controller: pageController,
        onPageChanged: (index) {
          setState(() {
            _currentPage = AppPage.values[index];
          });
        },
        children: [
          HomePage(
            pageController: pageController,
          ),
          const SocialMediaPage(),
          OsintPage(),
          const AnalysisPage(),
          const PastDataPage(),
          ProfilePage(),
          const SplashPage(),
          const OnboardingPage(),
          const AuthPage(),
        ],
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Container(
          decoration: BoxDecoration(
            color: const Color.fromARGB(255, 7, 19, 28),
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                spreadRadius: 5,
                blurRadius: 10,
              ),
            ],
          ),
          child: BottomAppBar(
            color: Colors.transparent,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildAppBarItem(
                  icon: Icons.home,
                  isSelected: _currentPage == AppPage.home,
                  onPressed: () => navigateTo(AppPage.home),
                ),
                AppBarImageItem(
                  imagePath: 
                    'assets/detective-logo.PNG',
                   
                  
                  isSelected: _currentPage == AppPage.socialMedia,
                  onPressed: () => navigateTo(AppPage.socialMedia),
                ),

                _buildAppBarItem(
                  icon: Icons.search,
                  isSelected: _currentPage == AppPage.osint,
                  onPressed: () => navigateTo(AppPage.osint),
                ),
                _buildAppBarItem(
                  icon: Icons.analytics,
                  isSelected: _currentPage == AppPage.analysis,
                  onPressed: () => navigateTo(AppPage.analysis),
                ),
                _buildAppBarItem(
                  icon: Icons.data_exploration,
                  isSelected: _currentPage == AppPage.pastData,
                  onPressed: () => navigateTo(AppPage.pastData),
                ),
                _buildAppBarItem(
                  icon: Icons.person,
                  isSelected: _currentPage == AppPage.profile,
                  onPressed: () => navigateTo(AppPage.profile),
                ),
              ],
            ),
          ),
        ),

      ),
    );
  }

  Widget _buildAppBarItem({
    required IconData icon,
    required bool isSelected,
    required VoidCallback onPressed,
  }) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        width: 50,
        height: 50,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: isSelected ? Colors.white : Colors.transparent,
        ),
        child: Center(
          child: Icon(
            icon,
            color: isSelected ? Colors.black : Colors.white,
          ),
        ),
      ),
    );
  }
}
class AppBarImageItem extends StatelessWidget {
  final String imagePath;
  final bool isSelected;
  final VoidCallback onPressed;

  const AppBarImageItem({
    super.key,
    required this.imagePath,
    required this.isSelected,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        width: 50,
        height: 50,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: isSelected ? Colors.white : Colors.transparent,
        ),
        child: Center(
          child: Image.asset(
            imagePath,
            height: 20,
            width: 20,
            color: isSelected ? Colors.black : Colors.white,
            fit: BoxFit.contain,
          ),
        ),
      ),
    );
  }
}
