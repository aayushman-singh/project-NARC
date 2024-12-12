import 'package:flutter/material.dart';

enum AppPage {
  home, // Automatically starts at 0
  socialMedia, // 1
  osint, // 2
  analysis, // 3
  pastData, // 4
  profile, // 5
}

void navigateTo(
    BuildContext context, PageController pageController, AppPage pageIndex) {
  pageController.animateToPage(
    pageIndex.index, // Use `.index` to get the integer value of the enum
    duration: const Duration(milliseconds: 200),
    curve: Curves.easeInOut,
  );
}
