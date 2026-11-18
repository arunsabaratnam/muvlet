import unittest
from detection import clean_detections
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
if __name__=='__main__':unittest.main()
