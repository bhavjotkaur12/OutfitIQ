from datasets import load_dataset
from transformers import ViTFeatureExtractor, ViTModel
import torch
import pandas as pd
from sklearn.neighbors import NearestNeighbors
import joblib
import os
import numpy as np
from PIL import Image
import requests
from io import BytesIO
import time
from huggingface_hub import login

def setup_directories():
    """Create necessary directories if they don't exist"""
    os.makedirs('src/ml/model', exist_ok=True)

def extract_clothing_items(description):
    """Extract clothing items from description"""
    clothing_types = {
        'top': ['shirt', 't-shirt', 'sweater', 'jacket', 'blazer', 'hoodie', 'polo'],
        'bottom': ['pants', 'shorts', 'skirt', 'jeans', 'leggings'],
        'dress': ['dress', 'gown', 'outfit'],
        'shoes': ['shoes', 'sneakers', 'boots', 'sandals'],
        'accessories': ['hat', 'scarf', 'sunglasses', 'belt', 'bag']
    }
    
    items = {}
    desc_lower = description.lower()
    
    for category, keywords in clothing_types.items():
        found_items = [k for k in keywords if k in desc_lower]
        if found_items:
            items[category] = found_items
    
    return items

def process_dataset(batch_size=16):
    """Load and process the dataset with rate limiting"""
    try:
        print("Loading dataset...")
        # Add exponential backoff retry
        max_retries = 5
        base_delay = 2  # seconds
        
        dataset = load_dataset(
            "AntZet/men_women_children_wearing_clothes",
            split="train",
            num_proc=1,  # Keep processing single-threaded
            verification_mode="no_checks"
        )
        
        processed_items = []
        for i in range(0, len(dataset), batch_size):
            retry_count = 0
            while retry_count < max_retries:
                try:
                    batch = dataset[i:i+batch_size]
                    processed_items.extend(batch)
                    print(f"Processed batch {i//batch_size + 1}/{len(dataset)//batch_size + 1}")
                    time.sleep(base_delay)  # Wait between batches
                    break  # Success, move to next batch
                except Exception as e:
                    if '429' in str(e):  # Rate limit error
                        retry_count += 1
                        wait_time = base_delay * (2 ** retry_count)  # Exponential backoff
                        print(f"Rate limit hit, waiting {wait_time} seconds before retry {retry_count}/{max_retries}")
                        time.sleep(wait_time)
                    else:
                        raise e  # Re-raise if it's not a rate limit error
            
            if retry_count == max_retries:
                print(f"Failed to process batch after {max_retries} retries. Continuing with next batch...")
                continue
            
        return processed_items
    except Exception as e:
        print(f"Error loading dataset: {e}")
        return None

def extract_features(dataset_items, batch_size=16):
    """Extract features with rate limiting"""
    try:
        print("Initializing ViT model and feature extractor...")
        feature_extractor = ViTFeatureExtractor.from_pretrained('google/vit-base-patch16-224')
        model = ViTModel.from_pretrained('google/vit-base-patch16-224')
        model.eval()
        
        features = []
        metadata = []
        
        for i, item in enumerate(dataset_items):
            try:
                if i % batch_size == 0:
                    time.sleep(2)  # Add delay between batches
                    print(f"Processing item {i+1}/{len(dataset_items)}")
                
                # Process text first (no rate limit issues)
                description = item['text']
                short_desc = item['short_description']
                
                # Determine gender
                gender = 'unknown'
                if 'man' in description.lower():
                    gender = 'male'
                elif 'woman' in description.lower():
                    gender = 'female'
                elif any(word in description.lower() for word in ['child', 'boy', 'girl']):
                    gender = 'child'
                
                # Extract clothing items
                clothing_items = extract_clothing_items(description)
                
                # Process image with error handling
                try:
                    inputs = feature_extractor(item['image'], return_tensors="pt")
                    with torch.no_grad():
                        outputs = model(**inputs)
                    image_features = outputs.last_hidden_state[:, 0, :].numpy()
                    
                    # Store features and metadata
                    features.append(image_features[0])
                    metadata.append({
                        'description': description,
                        'short_description': short_desc,
                        'gender': gender,
                        'clothing_items': clothing_items
                    })
                except Exception as img_error:
                    print(f"Error processing image {i}: {img_error}")
                    continue
                
            except Exception as e:
                print(f"Error processing item {i}: {e}")
                continue
            
        return np.array(features), metadata
    
    except Exception as e:
        print(f"Error in feature extraction: {e}")
        return None, None

def train_recommendation_model():
    """Train the recommendation model"""
    try:
        # Create necessary directories
        setup_directories()
        
        # Load and process dataset
        dataset_items = process_dataset()
        if dataset_items is None:
            return
        
        # Extract features
        print("Extracting features...")
        features, metadata = extract_features(dataset_items)
        if features is None or metadata is None:
            return
        
        print("Training KNN model...")
        knn_model = NearestNeighbors(n_neighbors=5, algorithm='ball_tree')
        knn_model.fit(features)
        
        # Save model and metadata
        print("Saving model and metadata...")
        joblib.dump(knn_model, 'src/ml/model/fashion_recommender.joblib')
        joblib.dump(metadata, 'src/ml/model/fashion_metadata.joblib')
        
        print("Training completed successfully!")
        return knn_model, metadata
        
    except Exception as e:
        print(f"Error in training: {e}")
        return None, None

if __name__ == "__main__":
    train_recommendation_model()
