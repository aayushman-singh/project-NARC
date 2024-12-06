# File: api_server.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from utils import connect_to_mongo, rule_based_filtering, categorize_severity

# Load trained model
tokenizer = AutoTokenizer.from_pretrained("hinglish_model")
model = AutoModelForSequenceClassification.from_pretrained("hinglish_model")

# MongoDB setup
db = connect_to_mongo()

# FastAPI App
app = FastAPI()

# Request models
class AnalyzeRequest(BaseModel):
    post: str

class FeedbackRequest(BaseModel):
    flagged_post_id: str
    valid: bool
    new_keywords: Optional[Dict[str, List[str]]]

@app.post("/analyze")
def analyze_post(request: AnalyzeRequest):
    post = request.post
    
    # Rule-based filtering
    rules_collection = db["rules"]
    rules = {doc["category"]: doc["keywords"] for doc in rules_collection.find()}
    flagged_categories_rule = rule_based_filtering(post, rules)
    
    # ML-based filtering
    inputs = tokenizer(post, return_tensors="pt", truncation=True, padding=True, max_length=128)
    outputs = model(**inputs)
    predictions = torch.argmax(outputs.logits, dim=1).item()
    label_map = {0: "hate_speech", 1: "explicit_content", 2: "misinformation"}
    flagged_categories_ml = [label_map[predictions]]

    # Merge results
    flagged_categories = list(set(flagged_categories_rule + flagged_categories_ml))
    if flagged_categories:
        severity = categorize_severity(flagged_categories)
        flagged_post = {
            "post": post,
            "flagged_categories": flagged_categories,
            "severity": severity,
        }
        db["flagged_posts"].insert_one(flagged_post)
        return flagged_post
    return {"message": "Post is clean."}

@app.post("/feedback")
def provide_feedback(request: FeedbackRequest):
    feedback = request.dict()
    flagged_posts = db["flagged_posts"]
    post = flagged_posts.find_one({"_id": feedback["flagged_post_id"]})
    if not post:
        raise HTTPException(status_code=404, detail="Flagged post not found.")
    flagged_posts.update_one({"_id": feedback["flagged_post_id"]}, {"$set": {"feedback": feedback}})
    return {"message": "Feedback processed successfully."}
