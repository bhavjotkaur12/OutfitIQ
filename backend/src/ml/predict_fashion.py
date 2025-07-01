import joblib
import numpy as np
from transformers import ViTFeatureExtractor, ViTModel
import torch

def get_fashion_recommendations(user_profile, preferences):
    # Load models
    knn_model = joblib.load('src/ml/model/fashion_recommender.joblib')
    metadata = joblib.load('src/ml/model/fashion_metadata.joblib')
    feature_extractor = ViTFeatureExtractor.from_pretrained('google/vit-base-patch16-224')
    vit_model = ViTModel.from_pretrained('google/vit-base-patch16-224')
    
    # Create a query vector based on user preferences
    query_text = f"A person wearing clothes suitable for {preferences['weather']} weather and {preferences['activity']} activity"
    
    # Get similar outfits
    distances, indices = knn_model.kneighbors([query_text])
    
    # Filter recommendations based on user preferences
    recommendations = []
    for idx in indices[0]:
        outfit_metadata = metadata[idx]
        
        # Check if outfit matches user preferences
        if (outfit_metadata['gender'] == user_profile['gender'] and
            matches_activity(outfit_metadata, preferences['activity']) and
            matches_weather(outfit_metadata, preferences['weather'])):
            
            recommendations.append({
                'description': outfit_metadata['description'],
                'clothing_items': outfit_metadata['clothing_items'],
                'similarity_score': float(distances[0][list(indices[0]).index(idx)])
            })
    
    return recommendations[:5]  # Return top 5 matching outfits

def matches_activity(outfit_metadata, desired_activity):
    # Add activity matching logic
    activity_keywords = {
        'work': ['formal', 'business', 'professional'],
        'gym': ['athletic', 'sports', 'workout'],
        'party': ['dress', 'formal', 'elegant'],
        'casual': ['casual', 't-shirt', 'jeans']
    }
    
    if desired_activity in activity_keywords:
        return any(keyword in outfit_metadata['description'].lower() 
                  for keyword in activity_keywords[desired_activity])
    return True

def matches_weather(outfit_metadata, desired_weather):
    # Add weather matching logic
    weather_keywords = {
        'hot': ['short', 't-shirt', 'light'],
        'cold': ['sweater', 'jacket', 'coat'],
        'rainy': ['jacket', 'boots', 'coat']
    }
    
    if desired_weather in weather_keywords:
        return any(keyword in outfit_metadata['description'].lower() 
                  for keyword in weather_keywords[desired_weather])
    return True
