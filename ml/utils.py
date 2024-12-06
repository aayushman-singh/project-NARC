# File: utils.py

import re
from pymongo import MongoClient
from typing import List, Dict

# MongoDB connection
def connect_to_mongo():
    client = MongoClient("mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    return client["content_moderation"]

# Rule-based filtering
def rule_based_filtering(post: str, rules: Dict[str, List[str]]) -> List[str]:
    flagged_categories = []
    for category, keywords in rules.items():
        for keyword in keywords:
            if re.search(rf'\b{keyword}\b', post, re.IGNORECASE):
                flagged_categories.append(category)
                break
    return flagged_categories

# Categorization by severity
def categorize_severity(categories: List[str]) -> str:
    severity_mapping = {"hate_speech": "high", "explicit_content": "medium", "misinformation": "low"}
    severities = [severity_mapping.get(cat, "low") for cat in categories]
    if "high" in severities:
        return "high"
    elif "medium" in severities:
        return "medium"
    else:
        return "low"
