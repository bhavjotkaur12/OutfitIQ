import itertools
import time
from pymongo import MongoClient
import random
from google.cloud import storage
import requests
from io import BytesIO
import base64
import os

# Clothing lists (for pools)
tops = [ 'Blazer', 'Blouse', 'Bomber', 'Button-Down', 'Cardigan', 'Flannel', 'Halter', 'Henley', 'Hoodie', 'Jacket', 'Jersey', 'Parka', 'Peacoat', 'Poncho', 'Sweater', 'Tank', 'Tee', 'Top', 'Turtleneck']
bottoms = ['Capris', 'Chinos', 'Culottes', 'Cutoffs', 'Gauchos', 'Jeans', 'Jeggings', 'Jodhpurs', 'Joggers', 'Leggings', 'Sarong', 'Shorts', 'Skirt', 'Sweatpants', 'Sweatshorts', 'Trunks']
dresses = ['Caftan', 'Cape', 'Coat', 'Coverup', 'Dress', 'Jumpsuit', 'Kaftan', 'Kimono', 'Nightdress', 'Onesie', 'Robe', 'Romper', 'Shirtdress', 'Sundress']
shoes = ['Sneakers', 'Boots', 'Sandals', 'Heels', 'Loafers']
accessories = ['Scarf', 'Sunglasses', 'Hat', 'Belt', 'Bag']

weather_tags = ['sunny', 'rainy', 'cold', 'hot', 'cloudy']
genders = ['male', 'female', 'gender neutral']
activities = ['work', 'gym', 'party', 'lounging', 'casual outing']

formality_map = {
    'work': 'formal',
    'gym': 'casual',
    'party': 'semi-formal',
    'lounging': 'casual',
    'casual outing': 'casual'
}

# MongoDB setup
client = MongoClient("mongodb+srv://bhavjotkaur12:Qwerty123@cluster0.thczf1o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["test"]
outfit_collection = db["outfits"]

# Prompt builder
def make_prompt(top=None, bottom=None, shoes=None, accessory=None, dress=None, gender="gender neutral"):
    if gender == "male":
        person = "man"
    elif gender == "female":
        person = "woman"
    else:
        person = "person"
    if dress:
        return (
            f"A photorealistic, high-resolution full-body photograph of a real {person} wearing a {dress}, styled with {shoes} and {accessory}. "
            "The person is standing, with realistic skin texture and natural daylight. Detailed fabric and accessory textures. "
            "Framed from the neck down, face out of frame. Plain neutral background."
        )
    else:
        return (
            f"A photorealistic, high-resolution full-body photograph of a real {person} wearing a {top}, {bottom}, styled with {shoes} and {accessory}. "
            "The person is standing, with realistic skin texture and natural daylight. Detailed fabric and accessory textures. "
            "Framed from the neck down, face out of frame. Plain neutral background."
        )

# Tag-driven item pools
item_pools = {
    'work': {
        'male': {
            'tops': ['Blazer', 'Button-Down', 'Cardigan', 'Jacket', 'Peacoat'],
            'bottoms': ['Chinos', 'Jeans', 'Skirt'],
            'shoes': ['Heels', 'Loafers', 'Boots'],
            'accessories': ['Belt', 'Bag']
        },
        'female': {
            'tops': ['Blazer', 'Button-Down', 'Cardigan', 'Jacket', 'Peacoat'],
            'bottoms': ['Chinos', 'Jeans', 'Skirt'],
            'dresses': ['Dress', 'Jumpsuit', 'Shirtdress', 'Sundress'],
            'shoes': ['Heels', 'Loafers', 'Boots'],
            'accessories': ['Belt', 'Bag']
        }
    },
    'gym': {
        'male': {
            'tops': ['Tank', 'Tee', 'Hoodie', 'Sweater', 'Jersey'],
            'bottoms': ['Joggers', 'Sweatpants', 'Shorts', 'Leggings'],
            'shoes': ['Sneakers'],
            'accessories': ['Hat', 'Bag']
        },
        'female': {
            'tops': ['Tank', 'Tee', 'Hoodie', 'Sweater', 'Jersey'],
            'bottoms': ['Joggers', 'Sweatpants', 'Shorts', 'Leggings'],
            'shoes': ['Sneakers'],
            'accessories': ['Hat', 'Bag']
        }
    },
    'party': {
        'male': {
            'tops': ['Blazer', 'Button-Down', 'Bomber'],
            'bottoms': ['Jeans', 'Chinos'],
            'shoes': ['Loafers', 'Boots'],
            'accessories': ['Sunglasses', 'Belt']
        },
        'female': {
            'dresses': ['Dress', 'Romper', 'Sundress'],
            'shoes': ['Heels', 'Sandals'],
            'accessories': ['Bag', 'Sunglasses']
        }
    },
    'lounging': {
        'male': {
            'tops': ['Hoodie', 'Sweater', 'Jersey'],
            'bottoms': ['Sweatpants', 'Shorts', 'Leggings'],
            'shoes': ['Sneakers', 'Sandals'],
            'accessories': ['Hat']
        },
        'female': {
            'dresses': ['Nightdress', 'Onesie', 'Robe'],
            'tops': ['Hoodie', 'Sweater', 'Jersey'],
            'bottoms': ['Sweatpants', 'Shorts', 'Leggings'],
            'shoes': ['Sneakers', 'Sandals'],
            'accessories': ['Hat']
        }
    },
    'casual outing': {
        'male': {
            'tops': ['Tee', 'Top', 'Flannel', 'Henley'],
            'bottoms': ['Jeans', 'Shorts', 'Chinos'],
            'shoes': ['Sneakers', 'Loafers', 'Sandals'],
            'accessories': ['Sunglasses', 'Hat']
        },
        'female': {
            'tops': ['Tee', 'Top', 'Flannel', 'Henley'],
            'bottoms': ['Jeans', 'Shorts', 'Skirt'],
            'dresses': ['Sundress', 'Shirtdress'],
            'shoes': ['Sneakers', 'Loafers', 'Sandals'],
            'accessories': ['Sunglasses', 'Hat']
        }
    }
}

def pick_outfit(weather, gender, activity):
    pool = item_pools[activity][gender if gender in item_pools[activity] else 'female']
    
    # If pool has dresses and either doesn't have tops/bottoms or randomly choose dress
    use_dress = ('dresses' in pool) and (
        'tops' not in pool or 
        'bottoms' not in pool or 
        random.choice([True, False])
    )
    
    if use_dress and 'dresses' in pool:
        dress = random.choice(pool['dresses'])
        shoes = random.choice(pool['shoes'])
        accessory = random.choice(pool['accessories'])
        return {
            'dress': dress,
            'shoes': shoes,
            'accessory': accessory,
            'gender': gender,
            'activity': activity,
            'weather': weather
        }
    elif 'tops' in pool and 'bottoms' in pool:
        top = random.choice(pool['tops'])
        bottom = random.choice(pool['bottoms'])
        shoes = random.choice(pool['shoes'])
        accessory = random.choice(pool['accessories'])
        return {
            'top': top,
            'bottom': bottom,
            'shoes': shoes,
            'accessory': accessory,
            'gender': gender,
            'activity': activity,
            'weather': weather
        }
    else:
        # Fallback to dress if no tops/bottoms available
        if 'dresses' in pool:
            dress = random.choice(pool['dresses'])
            shoes = random.choice(pool['shoes'])
            accessory = random.choice(pool['accessories'])
            return {
                'dress': dress,
                'shoes': shoes,
                'accessory': accessory,
                'gender': gender,
                'activity': activity,
                'weather': weather
            }
        else:
            # If we get here, something is wrong with the pool configuration
            print(f"Warning: Invalid pool configuration for {activity}/{gender}")
            print(f"Available items: {pool.keys()}")
            raise ValueError(f"No valid outfit combination found for {activity}/{gender}")

def get_next_image_number(bucket_name):
    """Get the next available image number by checking existing files in the bucket"""
    try:
        # Print current credentials status
        creds_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
        print(f"\nChecking credentials at: {creds_path}")
        if not creds_path:
            print("WARNING: No credentials path set!")
        elif not os.path.exists(creds_path):
            print(f"WARNING: Credentials file not found at {creds_path}")
        
        storage_client = storage.Client()
        bucket = storage_client.bucket(bucket_name)
        print(f"Successfully connected to bucket: {bucket_name}")
        
        # List all blobs with the prefix
        blobs = list(bucket.list_blobs(prefix='outfits/outfit_'))
        print(f"Found {len(blobs)} existing images")
        
        if not blobs:
            return 1
            
        # Extract numbers from filenames
        numbers = []
        for blob in blobs:
            try:
                filename = blob.name.split('/')[-1]
                num = int(filename.replace('outfit_', '').replace('.png', ''))
                numbers.append(num)
            except (IndexError, ValueError) as e:
                print(f"Warning: Could not parse number from filename {blob.name}: {e}")
                continue
        
        next_number = max(numbers) + 1 if numbers else 1
        print(f"Next image number will be: {next_number}")
        return next_number
    except Exception as e:
        print(f"\nError getting next image number: {e}")
        print("\nTo fix this:")
        print('1. Run in PowerShell: $env:GOOGLE_APPLICATION_CREDENTIALS="C:\\capstone\\tensile-pier-462514-j9-416aca8fc731.json"')
        print("2. Make sure the file exists at that location")
        print("3. Make sure the service account has access to the bucket")
        return 1

# Main loop
SAMPLE_SIZE = 15
start_number = get_next_image_number('outfitiq')
print(f"Starting from image number: {start_number}")

for i in range(SAMPLE_SIZE):
    current_number = start_number + i
    weather = random.choice(weather_tags)
    gender = random.choice(genders)
    activity = random.choice(activities)
    formality = formality_map[activity]
    outfit = pick_outfit(weather, gender, activity)
    if 'dress' in outfit:
        prompt = make_prompt(dress=outfit['dress'], shoes=outfit['shoes'], accessory=outfit['accessory'], gender=outfit['gender'])
        outfit_items = {
            "dress": outfit['dress'],
            "shoes": outfit['shoes'],
            "accessory": outfit['accessory']
        }
    else:
        prompt = make_prompt(top=outfit['top'], bottom=outfit['bottom'], shoes=outfit['shoes'], accessory=outfit['accessory'], gender=outfit['gender'])
        outfit_items = {
            "top": outfit['top'],
            "bottom": outfit['bottom'],
            "shoes": outfit['shoes'],
            "accessory": outfit['accessory']
        }
    activity = outfit['activity']
    weather = outfit['weather']
    gender = outfit['gender']
    try:
        print(f"Generating image {current_number}: {prompt}")
        api_key = "sk-jzJtzEbGJNEIjAFM4QuWiTde6yUlmAykEDfwPYdTjxHWBQ5M"
        url = "https://api.stability.ai/v2beta/stable-image/generate/sd3"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Accept": "application/json"
        }
        files = {
            "prompt": (None, prompt),
            "output_format": (None, "png")
        }
        response = requests.post(url, headers=headers, files=files)
        content_type = response.headers.get("Content-Type", "")
        if response.ok and content_type.startswith("image/"):
            image_bytes = BytesIO(response.content)
        elif response.ok and content_type.startswith("application/json"):
            data = response.json()
            base64_str = None
            if "artifacts" in data and data["artifacts"]:
                base64_str = data["artifacts"][0].get("base64")
            elif "image" in data:
                base64_str = data["image"]
            if base64_str:
                image_bytes = BytesIO(base64.b64decode(base64_str))
            else:
                print("No image found in JSON response:", data)
                continue
        else:
            print("Error: Content-Type =", content_type)
            print("Response text:", response.text)
            continue
        bucket_name = 'outfitiq'
        gcs_key = f"outfits/outfit_{current_number}.png"
        storage_client = storage.Client()
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(gcs_key)
        blob.upload_from_file(image_bytes, content_type='image/png')
        gcs_url = f"https://storage.googleapis.com/{bucket_name}/{gcs_key}"
        print("Image saved to:", gcs_url)
        doc = {
            "prompt": prompt,
            "image_url": gcs_url,
            "outfit_items": outfit_items,
            "weather": weather,
            "activity": activity,
            "formality": formality,
            "gender": gender
        }
        outfit_collection.insert_one(doc)
        time.sleep(5)  # To avoid hitting rate limits
    except Exception as e:
        print(f"Error for prompt {prompt}: {e}")
        continue

print("Done! Limited number of outfits saved to MongoDB.")