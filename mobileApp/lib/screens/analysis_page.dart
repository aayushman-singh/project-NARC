import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '';
import 'package:syncfusion_flutter_charts/charts.dart';

class AnalysisPage extends StatefulWidget {
  const AnalysisPage({Key? key}) : super(key: key);

  @override
  _AnalysisPageState createState() => _AnalysisPageState();
}

class _AnalysisPageState extends State<AnalysisPage> {
  final TextEditingController _usernameController = TextEditingController();
  Map<String, dynamic>? _userData;
  List<_ChartData>? _chartData;

  Future<void> _analyzeUsername() async {
    final username = _usernameController.text.trim();
    if (username.isEmpty) return;

    try {
      final response = await http.get(
        Uri.parse('http://localhost:3001/instagram/users'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> apiData = json.decode(response.body);

        final userData = apiData.firstWhere(
          (user) => user['username'] == username,
          orElse: () => null,
        );

        if (userData != null &&
            userData['profile'] != null &&
            userData['profile'].isNotEmpty) {
          final profile = userData['profile'][0];
          final posts = userData['posts'] ?? [];

          // Calculate totals
          final totalLikes =
              posts.fold(0, (sum, post) => sum + (post['likesCount'] ?? 0));
          final totalComments =
              posts.fold(0, (sum, post) => sum + (post['commentsCount'] ?? 0));
          final totalViews =
              posts.fold(0, (sum, post) => sum + (post['videoViewCount'] ?? 0));

          setState(() {
            _userData = {
              'fullName': userData['fullName'] ?? username,
              'username': userData['username'],
              'profilePic': profile['profilePicUrl'],
              'postsCount': posts.length,
              'avgLikesPerPost': (totalLikes / posts.length).toStringAsFixed(2),
              'avgCommentsPerPost':
                  (totalComments / posts.length).toStringAsFixed(2),
              'followersCount': profile['followersCount'] ?? 0,
              'followsCount': profile['followsCount'] ?? 0,
            };

            _chartData = [
              _ChartData('Followers', _userData!['followersCount'].toDouble()),
              _ChartData('Following', _userData!['followsCount'].toDouble()),
              _ChartData('Total Likes', totalLikes.toDouble()),
              _ChartData('Total Comments', totalComments.toDouble()),
              _ChartData('Total Views', totalViews.toDouble()),
            ];
          });
        } else {
          _showErrorDialog('User not found or data is incomplete.');
        }
      } else {
        _showErrorDialog('Failed to fetch data');
      }
    } catch (e) {
      _showErrorDialog('Error: ${e.toString()}');
    }
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Error'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF121212),
              Color(0xFF1E1E1E),
              Color(0xFF000000),
            ],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Header
                  _buildHeader(),

                  // Username Input
                  _buildUsernameInput(),

                  // Results Section
                  if (_userData != null && _chartData != null)
                    _buildResultsSection(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SvgPicture.asset(
              'assets/icons/instagram.svg',
              width: 48,
              height: 48,
              color: Colors.pink,
            ),
            const SizedBox(width: 16),
            const Text(
              'Instagram Analytics',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
      ],
    );
  }

  Widget _buildUsernameInput() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.grey.shade800,
            Colors.grey.shade900,
          ],
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _usernameController,
              decoration: InputDecoration(
                hintText: 'Enter Instagram username',
                hintStyle: TextStyle(color: Colors.grey.shade500),
                border: InputBorder.none,
              ),
              style: const TextStyle(color: Colors.white),
            ),
          ),
          ElevatedButton(
            onPressed: _analyzeUsername,
            style: ElevatedButton.styleFrom(
              backgroundColor: _usernameController.text.isNotEmpty
                  ? Colors.pink
                  : Colors.grey,
            ),
            child: const Text('Analyze'),
          ),
        ],
      ),
    );
  }

  Widget _buildResultsSection() {
    return Column(
      children: [
        const SizedBox(height: 16),
        // Chart
        Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                Colors.grey.shade800,
                Colors.grey.shade900,
              ],
            ),
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.all(16),
          child: SfCartesianChart(
            primaryXAxis: CategoryAxis(
              labelStyle: const TextStyle(color: Colors.white),
            ),
            primaryYAxis: NumericAxis(
              labelStyle: const TextStyle(color: Colors.white),
            ),
            series: <CartesianSeries>[
              BarSeries<_ChartData, String>(
                dataSource: _chartData!,
                xValueMapper: (_ChartData data, _) => data.label,
                yValueMapper: (_ChartData data, _) => data.value,
                color: Colors.pink,
                borderRadius: BorderRadius.circular(10),
              ),
            ],
            title: ChartTitle(
              text: 'User Performance',
              textStyle: const TextStyle(color: Colors.white),
            ),
          ),
        ),

        const SizedBox(height: 16),

        // User Details
        Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                Colors.grey.shade800,
                Colors.grey.shade900,
              ],
            ),
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              // Profile Header
              Row(
                children: [
                  CircleAvatar(
                    backgroundImage: NetworkImage(_userData!['profilePic']),
                    radius: 40,
                  ),
                  const SizedBox(width: 16),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _userData!['fullName'],
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        '@${_userData!['username']}',
                        style: TextStyle(
                          color: Colors.grey.shade400,
                        ),
                      ),
                    ],
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Stats Grid
              GridView(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 2,
                  mainAxisSpacing: 8,
                  crossAxisSpacing: 8,
                ),
                children: [
                  _buildStatCard(
                    icon: Icons.post_add,
                    label: 'Total Posts',
                    value: _userData!['postsCount'].toString(),
                  ),
                  _buildStatCard(
                    icon: Icons.favorite,
                    label: 'Avg Likes/Post',
                    value: _userData!['avgLikesPerPost'],
                  ),
                  _buildStatCard(
                    icon: Icons.comment,
                    label: 'Avg Comments/Post',
                    value: _userData!['avgCommentsPerPost'],
                  ),
                  _buildStatCard(
                    icon: Icons.trending_up,
                    label: 'Engagement Rate',
                    value:
                        '${(double.parse(_userData!['avgLikesPerPost']) / 100 * 100).toStringAsFixed(2)}%',
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey.shade700.withOpacity(0.5),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: Colors.pink),
          const SizedBox(width: 8),
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  color: Colors.grey.shade400,
                  fontSize: 12,
                ),
              ),
              Text(
                value,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// Helper class for chart data
class _ChartData {
  final String label;
  final double value;

  _ChartData(this.label, this.value);
}
