import bpy
import os
import sys
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from blender.internship_island.materials import build_materials
from blender.internship_island.terrain import build_terrain, terrain_height
from blender.internship_island.forbidden_city import build_forbidden_city
from blender.internship_island.landmarks import build_ping_an, build_oriental_pearl, build_west_lake
from blender.internship_island.props import build_landscape
from blender.internship_island.helpers import look_at

MODEL_DIR = os.path.join(ROOT, "public", "models")
PREVIEW_DIR = os.path.join(ROOT, "public", "previews")
SOURCE_DIR = os.path.join(ROOT, "assets", "3d")
for directory in (MODEL_DIR, PREVIEW_DIR, SOURCE_DIR):
    os.makedirs(directory, exist_ok=True)

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, 0, 0))
root = bpy.context.object
root.name = "island_internship"
materials = build_materials()
materials["wood"] = materials["rock_light"]

build_terrain(root, materials)
build_forbidden_city(root, materials, (-0.45, 1.42, terrain_height(-0.45, 1.42) + 0.02))
build_ping_an(root, materials, (-2.90, -0.55, terrain_height(-2.90, -0.55) + 0.02))
build_oriental_pearl(root, materials, (1.28, -0.62, terrain_height(1.28, -0.62) + 0.02))
build_west_lake(root, materials, (0.45, -2.18, terrain_height(0.45, -2.18) - 0.02))
build_landscape(root, materials)

# Studio lighting that matches the warm, soft reference.
bpy.ops.object.light_add(type="AREA", location=(-7.5, -8.0, 12.5))
key = bpy.context.object
key.name = "Key Light"
key.data.energy = 1050
key.data.shape = "DISK"
key.data.size = 8.0
look_at(key, (0, 0, 0))

bpy.ops.object.light_add(type="AREA", location=(7.0, -1.0, 8.0))
fill = bpy.context.object
fill.name = "Fill Light"
fill.data.energy = 480
fill.data.size = 6.0
look_at(fill, (0, 0, 0))

bpy.ops.object.light_add(type="AREA", location=(0, 8.0, 7.0))
rim = bpy.context.object
rim.name = "Rim Light"
rim.data.energy = 620
rim.data.size = 5.0
look_at(rim, (0, 0, 0))

bpy.ops.object.camera_add(location=(11.8, -14.5, 11.8))
camera = bpy.context.object
camera.name = "Preview Camera"
camera.data.type = "ORTHO"
camera.data.ortho_scale = 12.0
look_at(camera, (0, 0, -0.15))

scene = bpy.context.scene
scene.camera = camera
scene.render.engine = "BLENDER_EEVEE_NEXT"
scene.render.resolution_x = 1500
scene.render.resolution_y = 1500
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.film_transparent = False
scene.world.use_nodes = True
background = scene.world.node_tree.nodes.get("Background")
background.inputs["Color"].default_value = (0.91, 0.86, 0.78, 1)
background.inputs["Strength"].default_value = 0.32
scene.view_settings.look = "AgX - Medium High Contrast"

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(SOURCE_DIR, "island-internship.blend"))

preview_views = {
    "island-internship-final.png": (11.8, -14.5, 11.8),
    "island-internship-rear.png": (-11.8, 13.5, 10.5),
    "island-internship-left.png": (-15.0, -4.0, 9.0),
    "island-internship-right.png": (14.0, 4.5, 9.5),
}
for filename, location in preview_views.items():
    camera.location = location
    look_at(camera, (0, 0, -0.15))
    scene.render.filepath = os.path.join(PREVIEW_DIR, filename)
    bpy.ops.render.render(write_still=True)

bpy.ops.object.select_all(action="DESELECT")
root.select_set(True)
for child in root.children_recursive:
    child.select_set(True)
bpy.context.view_layer.objects.active = root
bpy.ops.export_scene.gltf(
    filepath=os.path.join(MODEL_DIR, "island-internship-final.glb"),
    export_format="GLB",
    use_selection=True,
    export_apply=True,
    export_cameras=False,
    export_lights=False,
    export_yup=True,
)

print("Built final internship island")
