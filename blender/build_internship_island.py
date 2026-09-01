import bpy
import math
import os
import random
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "public", "models")
PREVIEW = os.path.join(ROOT, "public", "previews")
SOURCE = os.path.join(ROOT, "assets", "3d")
os.makedirs(OUT, exist_ok=True)
os.makedirs(PREVIEW, exist_ok=True)
os.makedirs(SOURCE, exist_ok=True)

random.seed(27)
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)


def material(name, color, roughness=0.82, metallic=0.0, emission=None, emission_strength=0.0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if emission:
        bsdf.inputs["Emission Color"].default_value = (*emission, 1)
        bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat


MAT = {
    "grass": material("Scallion Green", (0.43, 0.63, 0.20)),
    "grass_light": material("Fresh Green", (0.60, 0.76, 0.31)),
    "grass_dark": material("Moss Green", (0.30, 0.48, 0.16)),
    "rock": material("Warm Rock", (0.24, 0.22, 0.21)),
    "rock_mid": material("Rock Mid", (0.35, 0.31, 0.27)),
    "rock_light": material("Rock Light", (0.47, 0.41, 0.33)),
    "water": material("West Lake", (0.18, 0.60, 0.61), roughness=0.35),
    "stone": material("Warm Stone", (0.76, 0.72, 0.62)),
    "stone_light": material("Light Stone", (0.88, 0.84, 0.74)),
    "red": material("Palace Red", (0.68, 0.16, 0.08)),
    "red_light": material("Coral Wall", (0.80, 0.28, 0.13)),
    "gold": material("Roof Gold", (0.94, 0.48, 0.06)),
    "gold_light": material("Roof Highlight", (1.00, 0.66, 0.12)),
    "teal_glass": material("Tower Glass", (0.30, 0.48, 0.52), roughness=0.45, metallic=0.16),
    "pearl": material("Pearl Coral", (0.84, 0.28, 0.26)),
    "pearl_light": material("Pearl Highlight", (0.98, 0.49, 0.43)),
    "wood": material("Wood", (0.35, 0.20, 0.10)),
    "leaf": material("Leaf", (0.47, 0.65, 0.19)),
    "leaf_light": material("Leaf Light", (0.65, 0.78, 0.30)),
}


def assign(obj, mat):
    obj.data.materials.append(mat)
    return obj


def shade_flat(obj):
    if obj.type == "MESH":
        for p in obj.data.polygons:
            p.use_smooth = False
    return obj


def cube(name, loc, scale, mat, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign(obj, mat)
    if bevel:
        mod = obj.modifiers.new("Soft bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 1
    return obj


def cyl(name, loc, radius, depth, mat, vertices=10):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc)
    obj = bpy.context.object
    obj.name = name
    assign(obj, mat)
    return shade_flat(obj)


def ico(name, loc, radius, mat, scale=(1, 1, 1), subdivisions=1):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=subdivisions, radius=radius, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign(obj, mat)
    return shade_flat(obj)


def cone(name, loc, r1, r2, depth, mat, vertices=8):
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=r1, radius2=r2, depth=depth, location=loc)
    obj = bpy.context.object
    obj.name = name
    assign(obj, mat)
    return shade_flat(obj)


def irregular_prism(name, cx, cy, rx, ry, top, bottom, segments, mat, seed=0):
    rng = random.Random(seed)
    top_ring, bottom_ring = [], []
    for i in range(segments):
        a = math.tau * i / segments
        jitter = 0.88 + rng.random() * 0.20
        top_ring.append((cx + math.cos(a) * rx * jitter, cy + math.sin(a) * ry * jitter, top))
        bottom_ring.append((cx + math.cos(a) * rx * jitter * 0.90, cy + math.sin(a) * ry * jitter * 0.90, bottom))
    verts = top_ring + bottom_ring + [(cx, cy, top), (cx, cy, bottom)]
    faces = []
    tc, bc = segments * 2, segments * 2 + 1
    for i in range(segments):
        j = (i + 1) % segments
        faces += [(tc, i, j), (bc, segments + j, segments + i)]
        faces += [(i, segments + i, segments + j), (i, segments + j, j)]
    mesh = bpy.data.meshes.new(name + "_mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    assign(obj, mat)
    return shade_flat(obj)


def layered_island():
    irregular_prism("Rock Lower", 0, 0, 3.2, 2.9, -1.35, -3.1, 14, MAT["rock"], 8)
    irregular_prism("Rock Middle", 0, 0, 4.1, 3.65, -0.25, -1.55, 14, MAT["rock_mid"], 6)
    irregular_prism("Rock Upper", 0, 0, 4.75, 4.05, 0.0, -0.48, 14, MAT["rock_light"], 4)
    irregular_prism("Grass Main", 0, 0, 4.62, 3.92, 0.18, -0.02, 14, MAT["grass"], 4)
    irregular_prism("Beijing Plateau", -1.15, 1.05, 2.55, 1.78, 0.78, 0.16, 12, MAT["grass_light"], 13)
    irregular_prism("Shenzhen Lower Terrace", -2.75, -1.12, 1.48, 1.48, 0.40, 0.14, 10, MAT["grass_dark"], 14)
    irregular_prism("Shenzhen Plateau", -2.95, -1.15, 1.10, 1.22, 0.64, 0.38, 10, MAT["grass_light"], 24)
    irregular_prism("Shanghai Lower Terrace", 1.42, 0.05, 1.42, 1.45, 0.34, 0.14, 10, MAT["grass_dark"], 15)
    irregular_prism("Shanghai Mound", 1.35, 0.00, 1.02, 1.12, 0.56, 0.32, 10, MAT["grass_light"], 25)
    irregular_prism("Lake Basin Rim", 1.20, -2.30, 2.20, 1.15, 0.27, 0.08, 12, MAT["grass_light"], 18)
    irregular_prism("West Lake Water", 1.15, -2.30, 1.88, 0.86, 0.30, 0.22, 14, MAT["water"], 19)


def hip_roof(name, loc, sx, sy, h, mat):
    x, y, z = loc
    verts = [
        (-sx, -sy, 0), (sx, -sy, 0), (sx, sy, 0), (-sx, sy, 0),
        (-sx * 0.42, 0, h), (sx * 0.42, 0, h)
    ]
    faces = [
        (0, 1, 5, 4), (3, 4, 5, 2), (0, 4, 3), (1, 2, 5),
        (0, 3, 2, 1)
    ]
    me = bpy.data.meshes.new(name + "_mesh")
    me.from_pydata(verts, [], faces)
    me.update()
    obj = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(obj)
    obj.location = (x, y, z)
    assign(obj, mat)
    return shade_flat(obj)


def palace_hall(name, loc, scale=(1, 1, 1)):
    x, y, z = loc
    sx, sy, sz = scale
    cube(name + " Base", (x, y, z + 0.12 * sz), (0.92 * sx, 0.68 * sy, 0.12 * sz), MAT["stone_light"])
    cube(name + " Body", (x, y, z + 0.48 * sz), (0.78 * sx, 0.54 * sy, 0.35 * sz), MAT["red"])
    for px in (-0.58, -0.2, 0.2, 0.58):
        cube(name + f" Pillar {px}", (x + px * sx, y - 0.56 * sy, z + 0.48 * sz), (0.055 * sx, 0.055 * sy, 0.40 * sz), MAT["gold"])
    hip_roof(name + " Roof", (x, y, z + 0.86 * sz), 1.0 * sx, 0.76 * sy, 0.46 * sz, MAT["gold"])
    hip_roof(name + " Roof Cap", (x, y, z + 1.12 * sz), 0.76 * sx, 0.54 * sy, 0.28 * sz, MAT["gold_light"])


def forbidden_city():
    x, y, z = -1.15, 1.05, 0.80
    cube("Forbidden City Courtyard", (x, y, z + 0.04), (2.05, 1.33, 0.08), MAT["stone"])
    # perimeter walls
    cube("Palace Wall Front", (x, y - 1.28, z + 0.28), (2.06, 0.08, 0.25), MAT["red_light"])
    cube("Palace Wall Back", (x, y + 1.28, z + 0.28), (2.06, 0.08, 0.25), MAT["red_light"])
    cube("Palace Wall Left", (x - 2.0, y, z + 0.28), (0.08, 1.30, 0.25), MAT["red_light"])
    cube("Palace Wall Right", (x + 2.0, y, z + 0.28), (0.08, 1.30, 0.25), MAT["red_light"])
    palace_hall("Hall of Supreme Harmony", (x, y + 0.43, z + 0.12), (1.35, 1.0, 1.0))
    palace_hall("Front Gate", (x, y - 0.78, z + 0.10), (0.86, 0.68, 0.78))
    palace_hall("East Hall", (x + 1.46, y + 0.16, z + 0.08), (0.48, 0.66, 0.62))
    palace_hall("West Hall", (x - 1.46, y + 0.16, z + 0.08), (0.48, 0.66, 0.62))
    # broad ceremonial stairs
    for i in range(4):
        cube(f"Palace Stair {i}", (x, y - 1.45 - i * 0.13, z + 0.05 - i * 0.06), (0.56 + i * 0.10, 0.10, 0.07), MAT["stone_light"])


def ping_an():
    x, y, z = -2.95, -1.10, 0.58
    cyl("Ping An Plinth", (x, y, z + 0.13), 0.68, 0.26, MAT["stone"], 10)
    # tapered shaft with articulated setbacks
    cone("Ping An Lower", (x, y, z + 1.18), 0.48, 0.34, 2.05, MAT["teal_glass"], 6)
    cone("Ping An Mid", (x, y, z + 2.52), 0.34, 0.22, 0.72, MAT["teal_glass"], 6)
    cone("Ping An Crown", (x, y, z + 3.12), 0.22, 0.07, 0.55, MAT["stone_light"], 6)
    cone("Ping An Spire", (x, y, z + 3.73), 0.055, 0.015, 0.72, MAT["stone_light"], 6)
    for h in (0.8, 1.25, 1.7):
        cyl(f"Ping An Belt {h}", (x, y, z + h), 0.38 - h * 0.025, 0.045, MAT["stone_light"], 6)


def oriental_pearl():
    x, y, z = 1.35, 0.0, 0.48
    cyl("Pearl Base", (x, y, z + 0.12), 0.62, 0.24, MAT["stone"], 10)
    # tripod
    for a in (0, math.tau / 3, math.tau * 2 / 3):
        px, py = x + math.cos(a) * 0.38, y + math.sin(a) * 0.38
        leg = cyl("Pearl Leg", (px, py, z + 0.62), 0.07, 1.05, MAT["stone_light"], 7)
        leg.rotation_euler[1] = math.radians(18)
        leg.rotation_euler[2] = a + math.pi / 2
    cyl("Pearl Shaft", (x, y, z + 1.55), 0.09, 2.65, MAT["stone_light"], 9)
    ico("Pearl Lower Sphere", (x, y, z + 1.10), 0.48, MAT["pearl"], subdivisions=2)
    ico("Pearl Upper Sphere", (x, y, z + 2.22), 0.31, MAT["pearl_light"], subdivisions=2)
    cone("Pearl Antenna", (x, y, z + 3.10), 0.06, 0.01, 1.25, MAT["pearl"], 7)


def tree(name, loc, scale=1.0, willow=False):
    x, y, z = loc
    cyl(name + " Trunk", (x, y, z + 0.38 * scale), 0.11 * scale, 0.76 * scale, MAT["wood"], 7)
    if willow:
        for i, angle in enumerate((0, 1.7, 3.4)):
            ico(name + f" Crown {i}", (x + math.cos(angle) * 0.24 * scale, y + math.sin(angle) * 0.16 * scale, z + 0.98 * scale), 0.43 * scale, MAT["leaf"], (0.7, 1.25, 0.72), 1)
    else:
        ico(name + " Crown", (x, y, z + 0.95 * scale), 0.50 * scale, MAT["leaf_light"], (1, 0.85, 1), 1)


def bridge_curve():
    curve = bpy.data.curves.new("West Lake Bridge Curve", "CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 1
    curve.bevel_depth = 0.13
    curve.bevel_resolution = 0
    spline = curve.splines.new("POLY")
    spline.points.add(6)
    for p, co in zip(spline.points, [
        (-0.95, -2.35, 0.38, 1), (-0.65, -2.35, 0.52, 1), (-0.35, -2.35, 0.68, 1),
        (0.0, -2.35, 0.76, 1), (0.35, -2.35, 0.68, 1), (0.65, -2.35, 0.52, 1), (0.95, -2.35, 0.38, 1)
    ]):
        p.co = co
    obj = bpy.data.objects.new("West Lake Arched Bridge", curve)
    bpy.context.collection.objects.link(obj)
    assign(obj, MAT["stone_light"])
    return obj


def west_lake():
    bridge_curve()
    # pavilion
    cube("West Lake Pavilion Body", (2.25, -2.28, 0.55), (0.38, 0.32, 0.22), MAT["red"])
    hip_roof("West Lake Pavilion Roof", (2.25, -2.28, 0.78), 0.56, 0.48, 0.32, MAT["gold"])
    tree("West Lake Willow", (1.15, -2.95, 0.28), 0.85, True)
    tree("Lake Tree", (2.60, -1.80, 0.28), 0.62, False)
    irregular_prism("West Lake Rear Hill", 3.10, -2.55, 0.74, 0.70, 0.72, 0.22, 9, MAT["grass_dark"], 31)
    tree("West Lake Rear Tree", (3.10, -2.55, 0.72), 0.54, False)


def ramps_and_paths():
    # broad path from lake toward palace
    points = [(0.8, -1.6, 0.32), (0.2, -1.0, 0.34), (-0.2, -0.3, 0.40), (-0.65, 0.15, 0.58)]
    for i, (x, y, z) in enumerate(points):
        cube(f"Main Path {i}", (x, y, z), (0.48, 0.45, 0.035), MAT["stone"])
    for i in range(4):
        cube(f"Beijing Approach {i}", (-0.72, 0.35 + i * 0.16, 0.43 + i * 0.10), (0.50, 0.12, 0.07), MAT["stone_light"])


def floating_rocks():
    for i, (x, y, z, s) in enumerate([
        (-4.9, -2.2, -1.4, 0.34), (4.8, -1.4, -1.9, 0.28), (3.9, 2.9, -1.2, 0.23),
        (-3.9, 3.2, -1.8, 0.20), (0.4, -4.7, -2.2, 0.25)
    ]):
        ico(f"Floating Rock {i}", (x, y, z), s, MAT["rock_mid"], (1, 1.3, 0.8), 1)


layered_island()
forbidden_city()
ping_an()
oriental_pearl()
west_lake()
ramps_and_paths()
tree("Palace Tree A", (-3.0, 1.8, 0.20), 0.66)
tree("Palace Tree B", (0.7, 2.2, 0.22), 0.62)
tree("City Tree", (-1.7, -1.6, 0.22), 0.58)
floating_rocks()

# Root parent for web selection.
bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, 0, 0))
root = bpy.context.object
root.name = "island_internship"
for obj in list(bpy.context.scene.objects):
    if obj != root and obj.type not in {"CAMERA", "LIGHT"}:
        obj.parent = root

# Groundless studio lighting.
bpy.ops.object.light_add(type="AREA", location=(-6, -7, 11))
key = bpy.context.object
key.name = "Key Light"
key.data.energy = 1350
key.data.shape = "DISK"
key.data.size = 7.0

bpy.ops.object.light_add(type="AREA", location=(6, 2, 7))
fill = bpy.context.object
fill.name = "Fill Light"
fill.data.energy = 700
fill.data.size = 5

bpy.ops.object.light_add(type="AREA", location=(0, 7, 5))
rim = bpy.context.object
rim.name = "Rim Light"
rim.data.energy = 500
rim.data.size = 4


def track(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


bpy.ops.object.camera_add(location=(10.8, -13.5, 10.5))
camera = bpy.context.object
camera.name = "Preview Camera"
camera.data.type = "ORTHO"
camera.data.ortho_scale = 11.3
track(camera, (0, 0, -0.1))
bpy.context.scene.camera = camera
track(key, (0, 0, 0))
track(fill, (0, 0, 0))
track(rim, (0, 0, -0.5))

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE_NEXT"
scene.render.resolution_x = 1400
scene.render.resolution_y = 1400
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.filepath = os.path.join(PREVIEW, "island-internship-blender.png")
scene.render.film_transparent = False
scene.world.use_nodes = True
world_background = scene.world.node_tree.nodes.get("Background")
world_background.inputs["Color"].default_value = (0.91, 0.88, 0.82, 1)
world_background.inputs["Strength"].default_value = 0.8
scene.view_settings.look = "AgX - Medium High Contrast"

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(SOURCE, "island-internship.blend"))
bpy.ops.render.render(write_still=True)

# Export only model hierarchy, not cameras/lights.
bpy.ops.object.select_all(action="DESELECT")
root.select_set(True)
for child in root.children_recursive:
    child.select_set(True)
bpy.context.view_layer.objects.active = root
bpy.ops.export_scene.gltf(
    filepath=os.path.join(OUT, "island-internship-blender.glb"),
    export_format="GLB",
    use_selection=True,
    export_apply=True,
    export_cameras=False,
    export_lights=False,
    export_yup=True,
)
print("Built high-fidelity internship island")
