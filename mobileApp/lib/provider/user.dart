import 'package:flutter/material.dart';

class UserProvider with ChangeNotifier {
  String? id;
  String? name;
  String? email;
  String? pic;
  List<Map<String, dynamic>> searchHistory = [];

  // Update user data
  void setUser(
      {required String id,
      required String name,
      required String email,
      required String pic,
      required List<Map<String,dynamic>> searchHistory}) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.pic = pic;
    this.searchHistory = searchHistory;
    notifyListeners(); // Notify listeners about the state change
  }

  // Clear user data
  void clearUser() {
    id = null;
    name = null;
    email = null;
    pic = null;
    searchHistory = [];
    notifyListeners();
  }
}
