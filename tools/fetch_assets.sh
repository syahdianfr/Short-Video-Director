#!/usr/bin/env bash
# Re-download the CC0 assets into public/assets from public GitHub mirrors.
set -euo pipefail
cd "$(dirname "$0")/../public/assets"
R=https://raw.githubusercontent.com
M=https://media.githubusercontent.com/media
mkdir -p hdri textures models/{nature,furniture,survival}
get(){ curl -sfL --max-time 300 -o "$2" "$1" && echo "ok $2"; }
NAT="$R/BastiaanOlij/godot-vr-weapons/HEAD/assets/kenney.nl/naturekit/Models/GLTF%20format"
for f in tree_palm tree_palmBend tree_palmTall tree_palmShort tree_palmDetailedTall tree_default tree_oak tree_fat plant_bush plant_bushLarge plant_bushDetailed grass_large grass_leafs rock_largeA rock_largeB rock_smallA stone_largeA cliff_large_rock flower_redA log; do get "$NAT/$f.glb" models/nature/$f.glb; done
FUR="$R/rzuf79/experiment-world/HEAD/godot/3d/kenney_furniture"
for f in desk chairDesk chair tableRound table bookcaseOpen bookcaseClosed lampRoundTable lampRoundFloor rugRectangle rugRounded pottedPlant books radio coatRack sideTable loungeChair; do get "$FUR/$f.glb" models/furniture/$f.glb; done
SUR="$R/digitalinnovationone/trilha-godot/HEAD/Pirate%20Island%20-%20Parte%205%2C%20%C3%81udio/addons/Kenney's%20Survival%20Kit"
for f in chest box barrel; do get "$SUR/$f.glb" models/survival/$f.glb; done
get "$M/dragon-fish/parkour-game/HEAD/assets/sky/kloofendal_43d_clear_puresky_2k.hdr" hdri/kloofendal_43d_clear_puresky_2k.hdr
get "$M/noah-blanchard/HotPatata/HEAD/Assets/Art/Sky/HDRI/qwantani_sunset_puresky_2k.hdr" hdri/qwantani_sunset_puresky_2k.hdr
get "$M/noah-blanchard/HotPatata/HEAD/Assets/Art/Sky/HDRI/qwantani_late_afternoon_puresky_2k.hdr" hdri/qwantani_late_afternoon_puresky_2k.hdr
get "$M/bhattaraiashish/pixl/HEAD/data/envmap/qwantani_night_puresky_2k.hdr" hdri/qwantani_night_puresky_2k.hdr
get "$R/pmndrs/drei-assets/master/hdri/kiara_1_dawn_1k.hdr" hdri/kiara_1_dawn_1k.hdr
get "$R/yanxue06/portfolio/HEAD/island/public/assets/textures/sandy_gravel_diff_1k.jpg" textures/sandy_gravel_diff_1k.jpg
get "$R/rajgurung/warden-zero/HEAD/unity/Assets/Art/Jungle/Ground/leafy_grass_diff_1k.jpg" textures/leafy_grass_diff_1k.jpg
get "$R/olaals/datasets-rgb-pose-estimation/HEAD/assets/textures/brick/sandstone_brick_wall_01_diff_1k.jpg" textures/sandstone_brick_wall_01_diff_1k.jpg
get "$R/olaals/datasets-rgb-pose-estimation/HEAD/assets/textures/wood/wooden_rough_planks_diff_1k.jpg" textures/wooden_rough_planks_diff_1k.jpg
get "$R/mitarthpathak/Blender-Fable-5.2/HEAD/game/assets/town/textures/forest_leaves_02_diff_1k.jpg" textures/forest_leaves_02_diff_1k.jpg
get "$M/FT1E/Game-Scripts/HEAD/Assets/GreenMossGames/UltimateMaterialLibrary/Textures/metal_grate_rusty_diff_1k.png" textures/metal_grate_rusty_diff_1k.png
get "$M/FT1E/Game-Scripts/HEAD/Assets/GreenMossGames/UltimateMaterialLibrary/Textures/rocky_gravel_diff_1k.png" textures/rocky_gravel_diff_1k.png
echo "Done. The sky/*.jpg panoramas and graded textures are committed; regenerate them from hdri/ if needed."
