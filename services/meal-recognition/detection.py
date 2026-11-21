"""Visible food proposals; no ingredient, weight, or nutrition measurement."""
import math

MODEL = 'IDEA-Research/grounding-dino-tiny'
# Candidate labels, not a claim of validated recognition accuracy for every food.
# Keep preparation-specific nutrition selection separate from visual suggestions.
FOOD_GROUPS = {
    'proteins': ['chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'salmon',
        'fish', 'tuna', 'shrimp', 'crab', 'lobster', 'mussels', 'oysters',
        'scallops', 'squid', 'egg', 'sausage', 'bacon', 'ham', 'meatballs',
        'tofu', 'tempeh'],
    'grains and starches': ['rice', 'pasta', 'noodles', 'bread', 'pita bread',
        'tortilla', 'bagel', 'croissant', 'couscous', 'quinoa', 'oatmeal',
        'cereal', 'potato', 'sweet potato', 'french fries', 'mashed potatoes'],
    'vegetables and legumes': ['broccoli', 'cauliflower', 'carrot', 'tomato',
        'lettuce', 'cucumber', 'avocado', 'mushroom', 'green beans', 'corn',
        'peas', 'spinach', 'kale', 'cabbage', 'bell pepper', 'onion',
        'eggplant', 'zucchini', 'asparagus', 'beetroot', 'radish', 'celery',
        'pumpkin', 'brussels sprouts', 'beans', 'chickpeas', 'lentils', 'edamame'],
    'fruit': ['apple', 'banana', 'strawberry', 'orange', 'grapes', 'blueberry',
        'raspberry', 'blackberry', 'watermelon', 'melon', 'pineapple', 'mango',
        'kiwi', 'peach', 'pear', 'plum', 'cherry', 'pomegranate', 'papaya',
        'grapefruit', 'dates', 'fig'],
    'dairy and nuts': ['cheese', 'yogurt', 'cottage cheese', 'almonds',
        'walnuts', 'peanuts', 'cashews', 'pistachios'],
    'prepared foods': ['pizza', 'burger', 'sandwich', 'hot dog', 'taco',
        'burrito', 'quesadilla', 'sushi', 'dumplings', 'spring rolls',
        'falafel', 'hummus', 'kebab', 'shawarma', 'samosa', 'omelette',
        'pancakes', 'waffles', 'lasagna', 'salad', 'soup', 'stew'],
    'desserts': ['cake', 'cookie', 'brownie', 'donut', 'muffin', 'ice cream'],
}
FOODS = {name: name for group in FOOD_GROUPS.values() for name in group}


def build_captions(tokenizer, max_tokens):
    """Pack complete labels without silently truncating the model's text input."""
    captions, names = [], []
    for name in FOODS:
        candidate = '. '.join(names + [name]) + '.'
        if len(tokenizer(candidate)['input_ids']) > max_tokens:
            if not names:
                raise ValueError('Food label exceeds model text limit')
            captions.append('. '.join(names) + '.')
            names = []
            if len(tokenizer(name + '.')['input_ids']) > max_tokens:
                raise ValueError('Food label exceeds model text limit')
        names.append(name)
    if names:
        captions.append('. '.join(names) + '.')
    return captions


def iou(a, b):
    intersection = max(0, min(a[2], b[2])-max(a[0], b[0])) * max(0, min(a[3], b[3])-max(a[1], b[1]))
    union = (a[2]-a[0])*(a[3]-a[1]) + (b[2]-b[0])*(b[3]-b[1]) - intersection
    return intersection / union if union > 0 else 0


def clean_detections(raw, width, height):
    """Keep exact supported labels, valid normalized boxes, suppress overlapping duplicates."""
    candidates = []
    for label, score, box in raw:
        label = label.strip(' .').lower()
        if label not in FOODS or not math.isfinite(score) or not 0.30 <= score <= 1:
            continue
        if len(box) != 4 or not all(math.isfinite(v) for v in box):
            continue
        box = [max(0, min(1, v / (width if i % 2 == 0 else height))) for i, v in enumerate(box)]
        if box[2] <= box[0] or box[3] <= box[1]:
            continue
        candidates.append({'label': FOODS[label], 'score': round(score, 4), 'box': box})
    kept = []
    for item in sorted(candidates, key=lambda c: c['score'], reverse=True):
        # One region must not become two contradictory foods (e.g. salmon + fish).
        if not any(iou(item['box'], old['box']) > .55 for old in kept):
            kept.append(item)
    return kept[:20]


def load_predictor():
    import torch
    from transformers import AutoProcessor, AutoModelForZeroShotObjectDetection
    processor = AutoProcessor.from_pretrained(MODEL)
    model = AutoModelForZeroShotObjectDetection.from_pretrained(MODEL, use_safetensors=True)
    model.eval()
    captions = build_captions(processor.tokenizer, model.config.max_text_len)
    def predict(image):
        raw = []
        # Sequential passes bound memory on CPU laptops. Merge before suppression
        # so the same region cannot be counted twice across different captions.
        for caption in captions:
            inputs = processor(images=image, text=caption, return_tensors='pt')
            with torch.inference_mode():
                outputs = model(**inputs)
            result = processor.post_process_grounded_object_detection(
                outputs, inputs.input_ids, threshold=.30, text_threshold=.25,
                target_sizes=[(image.height, image.width)])[0]
            raw.extend(zip(result['text_labels'], result['scores'].tolist(), result['boxes'].tolist()))
        return clean_detections(raw, image.width, image.height)
    return predict
