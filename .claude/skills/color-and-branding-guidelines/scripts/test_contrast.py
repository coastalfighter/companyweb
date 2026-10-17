"""Tests for contrast.py. Run: python3 -m unittest discover -s scripts -p 'test_*.py'"""

import unittest

from contrast import contrast_ratio, evaluate, main, parse_hex


class ContrastRatioTests(unittest.TestCase):
    def test_black_on_white_is_21(self):
        self.assertAlmostEqual(contrast_ratio("#000000", "#FFFFFF"), 21.0, places=6)

    def test_identical_colors_are_1(self):
        self.assertAlmostEqual(contrast_ratio("#777777", "#777777"), 1.0, places=6)

    def test_order_does_not_matter(self):
        self.assertAlmostEqual(contrast_ratio("#2457C5", "#FFFFFF"), contrast_ratio("#FFFFFF", "#2457C5"), places=9)

    def test_known_reference_value(self):
        # #767676 on white is the commonly cited lightest grey that passes AA (~4.54:1).
        self.assertAlmostEqual(contrast_ratio("#767676", "#FFFFFF"), 4.54, places=2)

    def test_shorthand_hex(self):
        self.assertAlmostEqual(contrast_ratio("#000", "#fff"), 21.0, places=6)

    def test_transparent_foreground_matches_background(self):
        self.assertAlmostEqual(contrast_ratio("#00000000", "#FFFFFF"), 1.0, places=6)


class EvaluateTests(unittest.TestCase):
    def test_truncation_never_overstates(self):
        r = evaluate("#777777", "#FFFFFF")  # ~4.48:1
        self.assertFalse(r.aa_normal_text)
        self.assertLess(r.ratio, 4.5)

    def test_thresholds(self):
        r = evaluate("#767676", "#FFFFFF")
        self.assertTrue(r.aa_normal_text)
        self.assertTrue(r.aa_large_text)
        self.assertFalse(r.aaa_normal_text)


class ParsingTests(unittest.TestCase):
    def test_rejects_invalid(self):
        for bad in ("red", "#12", "#GGGGGG", "", "#12345"):
            with self.assertRaises(ValueError):
                parse_hex(bad)

    def test_rejects_translucent_background(self):
        with self.assertRaises(ValueError):
            contrast_ratio("#000000", "#FFFFFF80")

    def test_cli_usage_errors(self):
        self.assertEqual(main([]), 2)
        self.assertEqual(main(["#000000"]), 2)
        self.assertEqual(main(["nothex", "#FFFFFF"]), 2)


if __name__ == "__main__":
    unittest.main()
