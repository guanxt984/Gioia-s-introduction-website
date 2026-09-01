import bpy
import math
from .helpers import cube, cylinder, parent, assign


def _roof_mesh(name, origin, width, depth, height, mat, owner, eaves=0.22):
    x, y, z = origin
    half_w = width / 2 + eaves
    half_d = depth / 2 + eaves
    ridge = width * 0.28
    vertices = [
        (-half_w, -half_d, 0), (half_w, -half_d, 0),
        (half_w, half_d, 0), (-half_w, half_d, 0),
        (-ridge, 0, height), (ridge, 0, height),
        (-half_w * 0.92, -half_d * 0.92, 0.10),
        (half_w * 0.92, -half_d * 0.92, 0.10),
        (half_w * 0.92, half_d * 0.92, 0.10),
        (-half_w * 0.92, half_d * 0.92, 0.10),
    ]
    faces = [
        (0, 1, 5, 4), (3, 4, 5, 2), (0, 4, 3), (1, 2, 5),
        (6, 7, 1, 0), (7, 8, 2, 1), (8, 9, 3, 2), (9, 6, 0, 3),
        (6, 9, 8, 7),
    ]
    mesh = bpy.data.meshes.new(name + " Mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    roof = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(roof)
    roof.location = (x, y, z)
    assign(roof, mat)
    parent(roof, owner)
    return roof


def _roof_tiles(prefix, origin, width, depth, z, mat, owner, rows=8):
    x, y = origin
    for row in range(rows):
        ty = y - depth / 2 + (row + 0.5) * depth / rows
        curve = abs((row + 0.5) / rows - 0.5) * 0.34
        for side in (-1, 1):
            rz = z + (1 - abs((row + 0.5) / rows - 0.5) * 2) * 0.38
            tube = cylinder(
                f"{prefix} Roof Tile {side} {row}",
                (x + side * width * 0.25, ty, rz + curve),
                0.025,
                width * 0.48,
                mat,
                owner,
                vertices=8,
            )
            tube.rotation_euler[1] = math.radians(90)


def _hall(name, origin, width, depth, height, mats, owner, double_roof=False):
    x, y, z = origin
    cube(name + " Stone Terrace", (x, y, z + 0.12), (width + 0.46, depth + 0.38, 0.24), mats["stone"], owner, 0.05)
    cube(name + " Hall Body", (x, y, z + 0.48), (width, depth, 0.62), mats["red"], owner, 0.04)
    columns = max(4, int(width / 0.38))
    for index in range(columns):
        px = x - width * 0.42 + index * width * 0.84 / (columns - 1)
        cylinder(name + f" Front Column {index}", (px, y - depth * 0.51, z + 0.49), 0.035, 0.70, mats["gold"], owner, 10)
        cylinder(name + f" Back Column {index}", (px, y + depth * 0.51, z + 0.49), 0.035, 0.70, mats["gold"], owner, 10)
    for index in range(max(3, int(width / 0.5))):
        px = x - width * 0.36 + index * width * 0.72 / max(1, max(3, int(width / 0.5)) - 1)
        cube(name + f" Door {index}", (px, y - depth * 0.505 - 0.008, z + 0.47), (0.18, 0.035, 0.40), mats["wood"], owner)
    _roof_mesh(name + " Main Roof", (x, y, z + 0.78), width, depth, 0.58, mats["gold"], owner, 0.28)
    _roof_tiles(name, (x, y), width, depth, z + 0.83, mats["gold"], owner, rows=9)
    cube(name + " Ridge", (x, y, z + 1.37), (width * 0.58, 0.07, 0.09), mats["gold"], owner, 0.02)
    if double_roof:
        cube(name + " Upper Body", (x, y, z + 1.22), (width * 0.76, depth * 0.72, 0.34), mats["red"], owner)
        _roof_mesh(name + " Upper Roof", (x, y, z + 1.43), width * 0.78, depth * 0.74, 0.42, mats["gold"], owner, 0.22)
        cube(name + " Upper Ridge", (x, y, z + 1.85), (width * 0.44, 0.06, 0.08), mats["gold"], owner, 0.02)


def build_forbidden_city(root, mats, origin=(-0.25, 1.20, 1.70)):
    x, y, z = origin
    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, 0, 0))
    owner = bpy.context.object
    owner.name = "Beijing Forbidden City"
    owner.parent = root

    cube("Forbidden City Courtyard", (x, y, z + 0.06), (4.35, 2.65, 0.20), mats["cream"], owner, 0.08)
    for side_y in (-1, 1):
        cube(
            "Forbidden City Perimeter Wall",
            (x, y + side_y * 1.25, z + 0.34),
            (4.28, 0.13, 0.55),
            mats["red"],
            owner,
            0.03,
        )
    for side_x in (-1, 1):
        cube(
            "Forbidden City Perimeter Wall",
            (x + side_x * 2.08, y, z + 0.34),
            (0.13, 2.55, 0.55),
            mats["red"],
            owner,
            0.03,
        )

    _hall("Hall of Supreme Harmony", (x, y + 0.42, z + 0.18), 2.20, 1.05, 1.0, mats, owner, True)
    _hall("Meridian Gate", (x, y - 0.78, z + 0.15), 1.38, 0.72, 0.8, mats, owner, False)
    _hall("East Wing", (x + 1.53, y + 0.30, z + 0.12), 0.72, 1.18, 0.66, mats, owner, False)
    _hall("West Wing", (x - 1.53, y + 0.30, z + 0.12), 0.72, 1.18, 0.66, mats, owner, False)

    for step in range(6):
        cube(
            f"Forbidden City Main Stair {step}",
            (x, y - 1.47 - step * 0.13, z + 0.10 - step * 0.07),
            (1.10 + step * 0.13, 0.18, 0.14),
            mats["stone"],
            owner,
            0.02,
        )
    return owner
