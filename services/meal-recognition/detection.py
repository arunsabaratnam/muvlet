"""Visible food proposals; no ingredient, weight, or nutrition measurement."""
import math

MODEL = 'IDEA-Research/grounding-dino-tiny'
# Short caption (<256 tokens). These are the supported automatic suggestions.
FOODS = {name: name for name in ['chicken', 'rice', 'broccoli', 'pasta', 'salmon', 'beef', 'fish', 'egg', 'potato', 'french fries', 'carrot', 'tomato', 'lettuce', 'cucumber', 'avocado', 'bread', 'cheese', 'mushroom', 'green beans', 'corn', 'shrimp', 'pizza', 'sausage', 'tofu', 'apple', 'banana', 'strawberry', 'orange', 'grapes', 'beans']}


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
    caption = '. '.join(FOODS) + '.'
    def predict(image):
        inputs = processor(images=image, text=caption, return_tensors='pt')
        with torch.inference_mode():
            outputs = model(**inputs)
        result = processor.post_process_grounded_object_detection(
            outputs, inputs.input_ids, threshold=.30, text_threshold=.25,
            target_sizes=[(image.height, image.width)])[0]
        raw = zip(result['text_labels'], result['scores'].tolist(), result['boxes'].tolist())
        return clean_detections(raw, image.width, image.height)
    return predict
