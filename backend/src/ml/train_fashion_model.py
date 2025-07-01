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

login("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")  # Get token from huggingface.co/settings/tokens

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

def process_and_extract_features(batch_size=8):
    """Combined processing and feature extraction with checkpointing"""
    try:
        print("Loading dataset and initializing models...")
        
        # Initialize models once
        feature_extractor = ViTFeatureExtractor.from_pretrained('google/vit-base-patch16-224')
        model = ViTModel.from_pretrained('google/vit-base-patch16-224')
        model.eval()
        
        # Create checkpoint directory
        os.makedirs('src/ml/checkpoints', exist_ok=True)
        
        # Check for existing checkpoint
        checkpoint_file = 'src/ml/checkpoints/feature_extraction_checkpoint.npz'
        start_batch = 0
        features = []
        metadata = []
        
        if os.path.exists(checkpoint_file):
            print("Loading checkpoint...")
            checkpoint = np.load(checkpoint_file, allow_pickle=True)
            features = checkpoint['features'].tolist()
            metadata = checkpoint['metadata'].tolist()
            start_batch = len(features) // batch_size
            print(f"Resuming from batch {start_batch} ({len(features)} items processed so far)")
        
        # Load dataset
        dataset = load_dataset(
            "AntZet/men_women_children_wearing_clothes",
            split="train",
            num_proc=1,
            verification_mode="no_checks"
        )
        
        total_batches = len(dataset) // batch_size + 1
        print(f"Total items to process: {len(dataset)}")
        print(f"Total batches: {total_batches}")
        print("Press Ctrl+C to safely stop processing (progress will be saved)")
        
        try:
            for i in range(start_batch * batch_size, len(dataset), batch_size):
                current_batch = i//batch_size + 1
                print(f"\nProcessing batch {current_batch}/{total_batches}")
                
                # Process each item in the batch
                for item_idx in range(batch_size):
                    current_idx = i + item_idx
                    if current_idx >= len(dataset):
                        break
                        
                    try:
                        print(f"  Item {item_idx + 1}/{batch_size}", end='\r')
                        
                        # Get the item directly from dataset
                        try:
                            item = dataset[current_idx]
                            if not isinstance(item, dict):
                                print(f"\nSkipping item {current_idx}: Not a dictionary (type: {type(item)})")
                                continue
                                
                            # Get the image and descriptions
                            image = item.get('image')
                            description = item.get('text', '')
                            long_desc = item.get('long_description', '')
                            short_desc = item.get('short_description', '')
                            
                            if not all([image, description]):
                                print(f"\nSkipping item {current_idx}: Missing required fields")
                                continue
                                
                        except Exception as access_error:
                            print(f"\nError accessing item {current_idx}: {access_error}")
                            continue
                            
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
                        
                        # Process image
                        try:
                            inputs = feature_extractor(image, return_tensors="pt")
                            with torch.no_grad():
                                outputs = model(**inputs)
                            image_features = outputs.last_hidden_state[:, 0, :].numpy()
                            
                            # Store features and metadata
                            features.append(image_features[0])
                            metadata.append({
                                'description': description,
                                'long_description': long_desc,
                                'short_description': short_desc,
                                'gender': gender,
                                'clothing_items': clothing_items
                            })
                            
                        except Exception as img_error:
                            print(f"\nError processing image {current_idx}: {img_error}")
                            continue
                        
                    except Exception as item_error:
                        print(f"\nError processing item {current_idx}: {item_error}")
                        continue
                
                # Save checkpoint every 10 batches
                if current_batch % 10 == 0:
                    print("\nSaving checkpoint...")
                    np.savez(
                        checkpoint_file,
                        features=np.array(features),
                        metadata=metadata
                    )
                    print(f"Processed {len(features)} items so far")
                
                # Reduced delay between batches
                time.sleep(0.5)
                
        except KeyboardInterrupt:
            print("\n\nProcessing interrupted by user. Saving progress...")
            np.savez(
                checkpoint_file,
                features=np.array(features),
                metadata=metadata
            )
            print(f"Progress saved. Processed {len(features)} items.")
            return np.array(features), metadata
        
        # Save final results
        print("\nProcessing complete. Saving final results...")
        return np.array(features), metadata
        
    except Exception as e:
        print(f"Error in processing: {e}")
        return None, None

def train_recommendation_model():
    """Train the recommendation model"""
    try:
        # Create necessary directories
        setup_directories()
        
        # Process dataset and extract features in one pass
        features, metadata = process_and_extract_features()
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
    # Debug dataset structure
    dataset = load_dataset(
        "AntZet/men_women_children_wearing_clothes",
        split="train",
        num_proc=1,
        verification_mode="no_checks"
    )
    print("Dataset info:", dataset)
    print("Dataset features:", dataset.features)
    print("First item:", dataset[0])
    
    # Then proceed with training
    train_recommendation_model()
