import bpy
import math
import random
from .helpers import cylinder, ico, cube


def build_tree(name, location, scale, mats, owner, willow=False):
    x, y, z = location
    cylinder(name + " Trunk", (x, y, z + 0.43 * scale), 0.11 * scale, 0.86 * scale, mats["wood"], owner, 10)
    if willow:
        for index in range(7):
            angle = math.tau * index / 7
            ico(
                name + f" Willow Crown {index}",
                (x + math.cos(angle) * 0.30 * scale, y + math.sin(angle) * 0.22 * scale, z + 1.04 * scale),
                0.42 * scale,
                mats["grass_dark" if index % 2 else "grass_light"],
                owner,
                scale=(0.65, 0.75, 1.28),
                subdivisions=2,
            )
    else:
        ico(name + " Crown A", (x, y, z + 1.02 * scale), 0.54 * scale, mats["grass_light"], owner, subdivisions=2)
        ico(
            name + " Crown B",
            (x + 0.24 * scale, y + 0.04 * scale, z + 0.94 * scale),
            0.38 * scale,
            mats["grass_dark"],
            owner,
            subdivisions=2,
        )


def build_landscape(root, mats):
    tree_data = [
        (-3.85, 1.55, 0.72, 0.66, False), (-3.35, 2.40, 0.62, 0.54, False),
        (2.05, 2.45, 0.46, 0.60, False), (3.05, 1.60, 0.40, 0.52, False),
        (-3.85, -1.85, 0.35, 0.55, False), (-3.35, -2.35, 0.28, 0.48, False),
        (-1.55, -1.82, 0.42, 0.50, False), (2.72, -0.20, 0.40, 0.52, False),
        (3.15, -1.40, 0.30, 0.46, False), (-0.25, -2.92, 0.18, 0.64, True),
        (2.30, -2.62, 0.20, 0.52, False), (3.05, -2.28, 0.18, 0.44, False),
    ]
    for index, data in enumerate(tree_data):
        build_tree(f"Landscape Tree {index}", data[:3], data[3], mats, root, data[4])

    for index, (x, y, z, scale) in enumerate([
        (-5.00, -1.6, -1.1, 0.42), (3.30, -2.35, -1.45, 0.34),
        (1.65, 3.70, -1.7, 0.28), (-4.05, 3.45, -1.45, 0.30),
        (-0.20, -4.60, -2.1, 0.32),
    ]):
        ico(f"Floating Rock {index}", (x, y, z), scale, mats["rock_light"], root, scale=(1.0, 1.2, 0.85), subdivisions=1)

    from .terrain import terrain_height
    path_xy = [
        (-2.65, -0.90), (-2.10, -0.55), (-1.45, -0.25),
        (-0.75, 0.12), (-0.52, 0.65), (-0.45, 1.02),
    ]
    path_points = [(x, y, terrain_height(x, y) + 0.13) for x, y in path_xy]
    from .helpers import road_ribbon
    road_ribbon("Main Curved Path", path_points, 0.52, mats["cream"], root)
    lake_path_xy = [
        (0.45, -2.48), (0.28, -2.00), (0.48, -1.55),
        (0.82, -1.15), (1.10, -0.82),
    ]
    lake_path = [(x, y, terrain_height(x, y) + 0.14) for x, y in lake_path_xy]
    road_ribbon("West Lake Curved Path", lake_path, 0.46, mats["cream"], root)
    east_path_xy = [
        (1.28, -0.82), (1.62, -0.30), (1.98, 0.12), (2.35, 0.58), (2.55, 1.05)
    ]
    east_path = [(x, y, terrain_height(x, y) + 0.13) for x, y in east_path_xy]
    road_ribbon("East Garden Path", east_path, 0.38, mats["cream"], root)
    for index in range(5):
        sx = 0.18 + index * 0.17
        sy = -1.62 - index * 0.11
        sz = terrain_height(sx, sy) + 0.08
        cube(
            f"Lake Approach Step {index}",
            (sx, sy, sz),
            (0.52, 0.28, 0.12),
            mats["stone"],
            root,
            0.03,
        )
    for index, (x, y) in enumerate(((-1.72, -0.10), (1.55, -0.05), (2.32, 0.55), (-2.20, -1.05))):
        z = terrain_height(x, y)
        cylinder(f"Garden Lamp Post {index}", (x, y, z + 0.28), 0.035, 0.52, mats["stone"], root, 10)
        ico(f"Garden Lamp Head {index}", (x, y, z + 0.58), 0.10, mats["cream"], root, subdivisions=1)
