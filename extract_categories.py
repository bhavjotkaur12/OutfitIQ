# Filename: extract_categories.py

def parse_category_file(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()
    # Skip the first two lines (header)
    lines = lines[2:]
    category_map = {}
    for line in lines:
        if line.strip():
            parts = line.strip().split()
            if len(parts) == 2:
                name, cat_type = parts
                category_map[name] = int(cat_type)
    return category_map

def group_categories(category_map):
    tops = [name for name, t in category_map.items() if t == 1]
    bottoms = [name for name, t in category_map.items() if t == 2]
    dresses = [name for name, t in category_map.items() if t == 3]
    return tops, bottoms, dresses

if __name__ == "__main__":
    # Adjust the path if your txt file is elsewhere
    category_map = parse_category_file("list_category_cloth.txt")
    tops, bottoms, dresses = group_categories(category_map)

    print("Tops:", tops)
    print("Bottoms:", bottoms)
    print("Dresses/Full-body:", dresses)
