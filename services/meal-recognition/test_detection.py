import unittest
from detection import FOOD_GROUPS, FOODS, build_captions, clean_detections
class DetectionTests(unittest.TestCase):
    def test_separate_foods_survive_and_duplicate_region_is_removed(self):
        result=clean_detections([('chicken',.8,[0,0,50,100]),('rice',.7,[55,0,100,100]),('chicken',.6,[1,0,49,100])],100,100)
        self.assertEqual([d['label'] for d in result],['chicken','rice'])
        self.assertEqual(result[1]['box'],[.55,0,1,1])
    def test_rejects_ambiguous_low_score_and_invalid_boxes(self):
        result=clean_detections([('chicken rice',.8,[0,0,10,10]),('rice',.2,[0,0,10,10]),('rice',.8,[10,0,0,10]),('rice',float('nan'),[0,0,10,10])],100,100)
        self.assertEqual(result,[])
    def test_conflicting_label_for_same_region_not_double_counted(self):
        result=clean_detections([('salmon',.8,[0,0,10,10]),('fish',.7,[0,0,10,10])],10,10)
        self.assertEqual(len(result),1)
    def test_expanded_catalog_preserves_unique_labels(self):
        names = [name for group in FOOD_GROUPS.values() for name in group]
        self.assertEqual(len(names), len(set(names)))
        self.assertGreater(len(names), 100)
        for name in ['falafel', 'dumplings', 'mango', 'lentils', 'chicken', 'rice']:
            self.assertIn(name, FOODS)

    def test_caption_budget_keeps_every_label_without_truncation(self):
        # Deliberately tiny token budget forces many boundaries, including
        # multi-word labels. Special tokens count toward the budget too.
        def tokenizer(text):
            return {'input_ids': [0] + text.replace('.', ' .').split() + [1]}
        captions = build_captions(tokenizer, 12)
        self.assertGreater(len(captions), 1)
        self.assertTrue(all(len(tokenizer(c)['input_ids']) <= 12 for c in captions))
        labels = [label.strip() for c in captions for label in c.split('.') if label.strip()]
        self.assertEqual(labels, list(FOODS))

    def test_too_small_text_budget_fails_instead_of_dropping_foods(self):
        with self.assertRaises(ValueError):
            build_captions(lambda text: {'input_ids': list(text)}, 2)

    def test_new_foods_survive_and_conflicting_regions_are_merged(self):
        result = clean_detections([
            ('falafel', .8, [0, 0, 40, 40]),
            ('meatballs', .6, [0, 0, 40, 40]),
            ('hummus', .7, [50, 50, 100, 100]),
        ], 100, 100)
        self.assertEqual([d['label'] for d in result], ['falafel', 'hummus'])

if __name__=='__main__':unittest.main()
