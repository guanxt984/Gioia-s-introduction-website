from __future__ import annotations

import json
import sys
from pathlib import Path

import bpy


PROJECT_ROOT = Path(__file__).resolve().parents[2]
SCENE_DIR = PROJECT_ROOT / "blender" / "experience_island_six_view"
MANIFEST_PATH = SCENE_DIR / "reference_manifest.json"

REQUIRED_COLLECTIONS = {
    "REF_ONLY",
    "ISLAND_INTERNSHIP",
    "ISLAND_SCHOOL",
    "ISLAND_AI",
    "PROPS_SHARED",
    "LIGHTING",
    "CAMERAS",
}
REQUIRED_CAMERAS = {
    "CAM_FRONT",
    "CAM_FRONT_RIGHT",
    "CAM_RIGHT",
    "CAM_REAR_RIGHT",
    "CAM_REAR",
    "CAM_REAR_LEFT",
    "CAM_LEFT",
    "CAM_FRONT_LEFT",
    "CAM_TOP_REFERENCE",
}


def fail(message: str) -> None:
    print(f"FAIL: {message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> None:
    if not MANIFEST_PATH.is_file():
        fail("reference_manifest.json is missing")
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    if len(manifest.get("images", [])) != 6:
        fail("manifest must contain exactly six images")
    if set(manifest.get("collections", [])) != REQUIRED_COLLECTIONS:
        fail("collection manifest does not match the required clean scene")
    if set(manifest.get("validation_cameras", [])) != REQUIRED_CAMERAS:
        fail("validation camera manifest is incomplete")
    missing_collections = REQUIRED_COLLECTIONS - set(bpy.data.collections.keys())
    if missing_collections:
        fail(f"missing Blender collections: {sorted(missing_collections)}")
    missing_cameras = REQUIRED_CAMERAS - set(bpy.data.objects.keys())
    if missing_cameras:
        fail(f"missing Blender cameras: {sorted(missing_cameras)}")
    reference_objects = [obj for obj in bpy.data.objects if obj.name.startswith("REF_")]
    if len(reference_objects) != 6:
        fail(f"expected six reference boards, found {len(reference_objects)}")
    print(
        json.dumps(
            {
                "status": "PASS",
                "images": 6,
                "reference_boards": len(reference_objects),
                "collections": len(REQUIRED_COLLECTIONS),
                "cameras": len(REQUIRED_CAMERAS),
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
