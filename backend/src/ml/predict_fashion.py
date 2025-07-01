import json
import sys
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import joblib
import numpy as np
from transformers import ViTImageProcessor, ViTModel
from PIL import Image
import requests
from io import BytesIO

# Create these as global variables so we don't reload for each image
feature_extractor = None
vit_model = None

def initialize_vit():
    """Initialize ViT models once"""
    global feature_extractor, vit_model
    if feature_extractor is None:
        feature_extractor = ViTImageProcessor.from_pretrained('google/vit-base-patch16-224')
    if vit_model is None:
        vit_model = ViTModel.from_pretrained('google/vit-base-patch16-224')
    return feature_extractor, vit_model

def extract_image_features(image_url):
    """Extract ViT features from an image"""
    try:
        # Get initialized models
        feature_extractor, model = initialize_vit()
        
        # Download image
        response = requests.get(image_url)
        image = Image.open(BytesIO(response.content))
        
        # Extract features
        inputs = feature_extractor(images=image, return_tensors="pt")
        outputs = model(**inputs)
        features = outputs.last_hidden_state[:, 0, :].detach().numpy()
        
        return features
    except Exception as e:
        print(f"Error extracting features: {e}", file=sys.stderr)
        return None

def get_fashion_recommendations(user_profile, preferences):
    try:
        print("Loading models and connecting to DB...", file=sys.stderr)
        
        # Load ML models
        script_dir = os.path.dirname(os.path.abspath(__file__))
        model = joblib.load(os.path.join(script_dir, 'model/fashion_recommender.joblib'))
        
        # Connect to MongoDB
        load_dotenv()
        mongo_uri = os.getenv('MONGO_URI')
        client = MongoClient(mongo_uri)
        db = client['test']
        outfits_collection = db.outfits
        
        # Create activity mapping for flexibility
        activity_mapping = {
            'Outdoor': ['outdoor', 'sports', 'casual outing', 'casual outings'],
            'Work': ['work', 'business', 'office'],
            'Social Events': ['social events', 'party', 'events'],
            'Casual': ['casual', 'casual outing', 'daily']
        }
        
        # Get mapped activities for the requested activity
        target_activities = activity_mapping.get(preferences.get('activity', ''), [preferences.get('activity', '').lower()])
        
        # Build query with case-insensitive matching
        base_query = {
            "gender": {"$in": [user_profile.get("gender", "gender neutral"), "gender neutral"]},
            "$or": [
                {"activity": {"$regex": f"^({'|'.join(target_activities)})$", "$options": "i"}},
                {"formality": {"$regex": f"^{preferences.get('formality', '').lower()}$", "$options": "i"}}
            ]
        }
        
        print(f"Using query: {base_query}", file=sys.stderr)
        
        # Get matches
        all_matches = list(outfits_collection.find(base_query))
        print(f"Found {len(all_matches)} matches with query", file=sys.stderr)
        
        if len(all_matches) == 0:
            # Fallback to just gender if no matches
            all_matches = list(outfits_collection.find({
                "gender": {"$in": [user_profile.get("gender", "gender neutral"), "gender neutral"]}
            }))
            print(f"Fallback query found {len(all_matches)} matches", file=sys.stderr)
        
        # Calculate outfit scores based on multiple factors
        recommendations = []
        reference_features = None
        
        # Get reference features from first matching outfit
        for outfit in all_matches:
            if outfit.get('image_url'):
                reference_features = extract_image_features(outfit.get('image_url'))
                if reference_features is not None:
                    break
        
        for outfit in all_matches:
            try:
                image_url = outfit.get('image_url')
                if not image_url:
                    continue
                    
                # Extract features for visual similarity
                features = extract_image_features(image_url)
                if features is None or reference_features is None:
                    continue
                
                # Calculate base visual similarity score
                visual_similarity = float(np.dot(features.flatten(), reference_features.flatten()) / (
                    np.linalg.norm(features) * np.linalg.norm(reference_features)
                ))
                
                # Calculate overall score based on multiple factors
                score = visual_similarity
                
                # Boost factors
                activity_boost = 1.0
                comfort_boost = 1.0
                formality_boost = 1.0
                
                # Activity matching (case insensitive)
                outfit_activity = outfit.get('activity', '').lower()
                if any(activity in outfit_activity for activity in target_activities):
                    activity_boost = 1.3
                
                # Comfort level matching (check outfit items)
                outfit_items = outfit.get('outfit_items', {})
                comfort_level = preferences.get('comfortLevel', '').lower()
                if comfort_level == 'layered':
                    # Check if outfit has multiple layers
                    has_layers = len(outfit_items.keys()) > 2
                    if has_layers:
                        comfort_boost = 1.2
                
                # Formality matching (case insensitive)
                if outfit.get('formality', '').lower() == preferences.get('formality', '').lower():
                    formality_boost = 1.1
                
                # Calculate final score with all boosts
                final_score = float(score * activity_boost * comfort_boost * formality_boost)
                
                recommendations.append({
                    "_id": str(outfit.get('_id')),
                    "prompt": outfit.get('title', ''),
                    "image_url": image_url,
                    "outfit_items": outfit_items,
                    "weather": preferences.get('weather', {}).get('description', ''),
                    "activity": outfit.get('activity', preferences.get('activity')),
                    "formality": outfit.get('formality', preferences.get('formality')),
                    "gender": outfit.get('gender', ''),
                    "confidence_score": float(max(min(final_score, 1.0), 0.0))  # Convert to Python float
                })
            except Exception as outfit_error:
                print(f"Error processing outfit: {outfit_error}", file=sys.stderr)
                continue
        
        # Sort by confidence score and return top 5
        recommendations.sort(key=lambda x: x['confidence_score'], reverse=True)
        return recommendations[:5]
            
    except Exception as e:
        print(f"Error in get_fashion_recommendations: {e}", file=sys.stderr)
        import traceback
        print(traceback.format_exc(), file=sys.stderr)
        return []

if __name__ == "__main__":
    try:
        input_str = sys.argv[1]
        input_data = json.loads(input_str)
        recommendations = get_fashion_recommendations(
            input_data['user_profile'],
            input_data['preferences']
        )
        # Ensure all numbers are Python floats for JSON serialization
        print(json.dumps(recommendations))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
