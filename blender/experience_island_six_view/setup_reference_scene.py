from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path

import bpy
from mathutils import Vector


PROJECT_ROOT = Path(__file__).resolve().parents[2]
REFERENCE_DIR = (
    PROJECT_ROOT
    / "docs"
    / "handoff"
    / "assets"
    / "experience-island-modeling-reference-pack"
)
OUTPUT_DIR = PROJECT_ROOT / "blender" / "experience_island_six_view"
BLEND_PATH = OUTPUT_DIR / "reference_scene.blend"
MANIFEST_PATH = OUTPUT_DIR / "reference_manifest.json"

REFERENCE_ROLES = {
    "01-primary-front-view.jpg": "primary appearance, palette, default composition",
    "02-quarter-view.jpg": "quarter view and side-depth evidence",
    "03-rear-view.jpg": "rear silhouette and occlusion evidence",
    "04-left-side-low-angle.png": "rock thickness and low-angle height evidence",
    "05-wide-three-quarter-view.png": "wide three-quarter proportions",
    "06-top-view.png": "plan footprint, seams, roads, lake, and object placement",
}

COLLECTION_NAMES = (
    "REF_ONLY",
    "ISLAND_INTERNSHIP",
    "ISLAND_SCHOOL",
    "ISLAND_AI",
    "PROPS_SHARED",
    "LIGHTING",
    "CAMERAS",
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def reset_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for collection in list(bpy.data.collections):
        if collection.name != "Collection":
            bpy.data.collections.remove(collection)
    base = bpy.data.collections.get("Collection")
    if base:
        base.name = "SCENE_ROOT"


def ensure_collection(name: str) -> bpy.types.Collection:
    collection = bpy.data.collections.get(name)
    if collection is None:
        collection = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(collection)
    return collection


def move_to_collection(obj: bpy.types.Object, collection: bpy.types.Collection) -> None:
    for current in list(obj.users_collection):
        current.objects.unlink(obj)
    collection.objects.link(obj)


def aim_at(obj: bpy.types.Object, target: Vector) -> None:
    direction = target - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def add_camera(
    name: str,
    location: tuple[float, float, float],
    target: Vector,
    cameras: bpy.types.Collection,
    lens: float = 58.0,
) -> bpy.types.Object:
    data = bpy.data.cameras.new(name)
    data.lens = lens
    data.sensor_width = 36.0
    camera = bpy.data.objects.new(name, data)
    cameras.objects.link(camera)
    camera.location = location
    aim_at(camera, target)
    return camera


def add_reference_board(
    file_path: Path,
    index: int,
    references: bpy.types.Collection,
) -> dict[str, object]:
    image = bpy.data.images.load(str(file_path), check_existing=True)
    bpy.ops.object.empty_add(type="IMAGE", location=((index - 2.5) * 7.2, 22.0, 5.5))
    board = bpy.context.object
    board.name = f"REF_{index + 1:02d}_{file_path.stem}"
    board.data = image
    board.empty_display_size = 6.2
    board.color[3] = 0.85
    board.show_in_front = True
    board.rotation_euler = (math.radians(90.0), 0.0, 0.0)
    board.hide_render = True
    move_to_collection(board, references)
    return {
        "file": file_path.name,
        "role": REFERENCE_ROLES[file_path.name],
        "sha256": sha256(file_path),
        "width": int(image.size[0]),
        "height": int(image.size[1]),
        "object": board.name,
    }


def configure_scene() -> None:
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE_NEXT"
    scene.render.resolution_x = 1440
    scene.render.resolution_y = 1440
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.world.color = (0.78, 0.74, 0.68)
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    missing = [name for name in REFERENCE_ROLES if not (REFERENCE_DIR / name).is_file()]
    if missing:
        raise FileNotFoundError(f"Missing approved references: {missing}")

    reset_scene()
    configure_scene()
    collections = {name: ensure_collection(name) for name in COLLECTION_NAMES}
    references = collections["REF_ONLY"]
    cameras = collections["CAMERAS"]

    manifest_images = []
    for index, name in enumerate(REFERENCE_ROLES):
        manifest_images.append(add_reference_board(REFERENCE_DIR / name, index, references))

    target = Vector((0.0, 0.0, 2.6))
    radius = 19.0
    height = 12.0
    camera_names = (
        "CAM_FRONT",
        "CAM_FRONT_RIGHT",
        "CAM_RIGHT",
        "CAM_REAR_RIGHT",
        "CAM_REAR",
        "CAM_REAR_LEFT",
        "CAM_LEFT",
        "CAM_FRONT_LEFT",
    )
    for index, name in enumerate(camera_names):
        angle = math.radians(90.0 - index * 45.0)
        add_camera(
            name,
            (radius * math.cos(angle), radius * math.sin(angle), height),
            target,
            cameras,
        )
    add_camera("CAM_TOP_REFERENCE", (0.0, 0.0, 26.0), Vector((0.0, 0.0, 0.0)), cameras, 62.0)
    bpy.context.scene.camera = bpy.data.objects["CAM_FRONT"]

    manifest = {
        "version": 1,
        "reference_policy": {
            "only_valid_directory": str(REFERENCE_DIR.relative_to(PROJECT_ROOT)).replace("\\", "/"),
            "priority": [
                "01-primary-front-view.jpg",
                "06-top-view.png",
                "04-left-side-low-angle.png",
                "02-quarter-view.jpg",
                "03-rear-view.jpg",
                "05-wide-three-quarter-view.png",
            ],
            "old_models_allowed": False,
        },
        "images": manifest_images,
        "collections": list(COLLECTION_NAMES),
        "validation_cameras": [*camera_names, "CAM_TOP_REFERENCE"],
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))
    print(json.dumps({"blend": str(BLEND_PATH), "manifest": str(MANIFEST_PATH)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
