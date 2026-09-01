import bpy
import math
from .helpers import cube, cylinder, cone, ico, curve_tube
from .props import build_tree


def build_ping_an(root, mats, origin=(-2.90, -0.55, 1.08)):
    x, y, z = origin
    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, 0, 0))
    owner = bpy.context.object
    owner.name = "Shenzhen Ping An Finance Centre"
    owner.parent = root
    cylinder("Shenzhen Grass Terrace", (x, y, z - 0.08), 1.18, 0.30, mats["grass_dark"], owner, 14)
    cylinder("Ping An Plaza", (x, y, z + 0.10), 0.86, 0.20, mats["stone"], owner, 20)
    cone("Ping An Main Shaft", (x, y, z + 1.58), 0.50, 0.33, 2.75, mats["teal"], owner, 12)
    cone("Ping An Upper Shaft", (x, y, z + 3.15), 0.33, 0.18, 0.72, mats["teal"], owner, 12)
    cone("Ping An Crown", (x, y, z + 3.72), 0.18, 0.055, 0.56, mats["cream"], owner, 12)
    cone("Ping An Spire", (x, y, z + 4.28), 0.045, 0.008, 0.70, mats["cream"], owner, 10)
    for angle in range(0, 360, 30):
        radians = math.radians(angle)
        for level in range(9):
            radius = 0.43 - level * 0.012
            cube(
                f"Ping An Facade Rib {angle} {level}",
                (x + math.cos(radians) * radius, y + math.sin(radians) * radius, z + 0.48 + level * 0.30),
                (0.035, 0.035, 0.24),
                mats["cream"],
                owner,
                0.008,
            )
    return owner


def build_oriental_pearl(root, mats, origin=(0.72, -0.35, 0.90)):
    x, y, z = origin
    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, 0, 0))
    owner = bpy.context.object
    owner.name = "Shanghai Oriental Pearl"
    owner.parent = root
    cylinder("Shanghai Grass Terrace", (x, y, z - 0.08), 1.22, 0.30, mats["grass_light"], owner, 14)
    cylinder("Pearl Plaza", (x, y, z + 0.08), 0.92, 0.16, mats["stone"], owner, 24)
    for angle in (0, 120, 240):
        a = math.radians(angle)
        leg = cylinder(
            f"Pearl Tripod {angle}",
            (x + math.cos(a) * 0.38, y + math.sin(a) * 0.38, z + 0.65),
            0.075,
            1.20,
            mats["cream"],
            owner,
            12,
        )
        leg.rotation_euler[1] = math.radians(19)
        leg.rotation_euler[2] = a + math.pi / 2
    cylinder("Pearl Main Axis", (x, y, z + 1.72), 0.10, 2.80, mats["cream"], owner, 16)
    ico("Pearl Lower Sphere", (x, y, z + 1.10), 0.56, mats["pearl"], owner, subdivisions=3)
    cylinder("Pearl Lower Deck", (x, y, z + 1.10), 0.61, 0.10, mats["cream"], owner, 20)
    ico("Pearl Upper Sphere", (x, y, z + 2.28), 0.34, mats["pearl"], owner, subdivisions=3)
    cylinder("Pearl Upper Deck", (x, y, z + 2.28), 0.38, 0.08, mats["cream"], owner, 20)
    cone("Pearl Antenna", (x, y, z + 3.20), 0.07, 0.012, 1.22, mats["pearl"], owner, 12)
    return owner


def build_west_lake(root, mats, origin=(1.20, -2.15, 0.18)):
    x, y, z = origin
    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, 0, 0))
    owner = bpy.context.object
    owner.name = "Hangzhou West Lake"
    owner.parent = root
    bpy.ops.mesh.primitive_uv_sphere_add(segments=40, ring_count=20, location=(x, y, z))
    water = bpy.context.object
    water.name = "West Lake Water"
    water.scale = (1.62, 0.78, 0.11)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    water.data.materials.append(mats["water"])
    water.parent = owner
    bridge_points = [
        (x - 0.65, y - 0.02, z + 0.14), (x - 0.34, y - 0.02, z + 0.48),
        (x, y - 0.02, z + 0.62), (x + 0.34, y - 0.02, z + 0.48),
        (x + 0.65, y - 0.02, z + 0.14),
    ]
    curve_tube("West Lake Arched Bridge", bridge_points, 0.14, mats["cream"], owner)
    cube("West Lake Pavilion", (x + 1.18, y + 0.14, z + 0.38), (0.58, 0.48, 0.55), mats["red"], owner, 0.04)
    cone("West Lake Pavilion Roof", (x + 1.18, y + 0.14, z + 0.78), 0.48, 0.08, 0.34, mats["gold"], owner, 8)
    build_tree("West Lake Willow", (x - 1.16, y - 0.20, z + 0.06), 0.78, mats, owner, True)
    for index, offset in enumerate(((-1.35, 0.52), (-0.82, 0.62), (0.82, 0.62), (1.40, -0.42))):
        ico(f"West Lake Shore Rock {index}", (x + offset[0], y + offset[1], z + 0.10), 0.16, mats["rock_light"], owner, subdivisions=1)
    return owner
