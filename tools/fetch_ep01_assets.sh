#!/usr/bin/env bash
# Rebuild public/ep01 asset folders that are not committed (Poly Haven, all CC0).
# Kenney (CC0) and KayKit (CC0) models are committed under public/ep01/kenney and public/ep01/kaykit-city.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 tools/fetch_polyhaven.py public/ep01 1k \
  hdri:goegap hdri:klippad_sunrise_2 hdri:qwantani_dusk_2_puresky hdri:rogland_moonlit_night \
  tex:sand_01 tex:gravelly_sand tex:brown_mud_dry tex:white_rough_plaster tex:sandstone_blocks_05 \
  tex:palm_bark tex:reed_roof_04 tex:thatch_roof_angled tex:rough_wood \
  model:jug_01 model:wooden_bowl_01 model:wicker_basket_01 model:wooden_bucket_02 \
  model:antique_ceramic_vase_01 model:wooden_lantern_01 model:wooden_stool_02 \
  model:dry_branches_medium_01 model:boulder_01
