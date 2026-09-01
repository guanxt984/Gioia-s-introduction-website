import math
import random
from .helpers import assign, parent, prism_mesh


def _gaussian(x, y, cx, cy, sx, sy, amplitude):
    return amplitude * math.exp(-(((x - cx) / sx) ** 2 + ((y - cy) / sy) ** 2))


def terrain_height(x, y):
    value = 0.30
    value += _gaussian(x, y, -0.35, 1.15, 2.45, 1.80, 1.65)
    value += _gaussian(x, y, -2.80, -0.45, 1.35, 1.45, 1.10)
    value += _gaussian(x, y, 0.70, -0.25, 1.35, 1.45, 0.82)
    value -= _gaussian(x, y, 1.10, -2.15, 1.50, 0.85, 0.48)
    value += 0.13 * math.sin(x * 1.45) * math.cos(y * 1.30)
    value += 0.045 * math.sin(x * 4.4 + y * 2.6)
    plateaus = [
        (-0.45, 1.42, 2.35, 1.48, 1.72),
        (-2.90, -0.55, 1.22, 1.18, 1.10),
        (1.28, -0.62, 1.18, 1.10, 0.92),
    ]
    for cx, cy, sx, sy, target in plateaus:
        dx = abs((x - cx) / sx)
        dy = abs((y - cy) / sy)
        weight = math.exp(-(dx ** 8 + dy ** 8) * 2.8)
        value = value * (1 - weight) + target * weight
    return value


def build_terrain(root, mats):
    rng = random.Random(20260726)
    segments = 112
    rings = 60
    hub_x, hub_y = 3.0, 1.75
    angle_start = math.radians(140)
    angle_end = math.radians(260)
    radius = 6.15
    vertices = [(hub_x, hub_y, terrain_height(hub_x, hub_y))]
    faces = []
    jitter = [0.96 + rng.random() * 0.08 for _ in range(segments)]
    for ring in range(1, rings + 1):
        t = ring / rings
        for index in range(segments):
            angle = angle_start + (angle_end - angle_start) * index / (segments - 1)
            edge = 1.0 if ring < rings else jitter[index]
            x = hub_x + math.cos(angle) * radius * t * edge
            y = hub_y + math.sin(angle) * radius * t * edge
            taper = max(0.0, 1.0 - t ** 8)
            z = terrain_height(x, y) * taper + 0.20 * (1 - taper)
            vertices.append((x, y, z))

    for index in range(segments - 1):
        faces.append((0, 1 + index, 1 + index + 1))
    for ring in range(1, rings):
        current = 1 + (ring - 1) * segments
        following = current + segments
        for index in range(segments - 1):
            nxt = index + 1
            faces.append((current + index, following + index, following + nxt))
            faces.append((current + index, following + nxt, current + nxt))

    import bpy
    mesh = bpy.data.meshes.new("Continuous Grass Terrain Mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    grass = bpy.data.objects.new("Continuous Grass Terrain", mesh)
    bpy.context.collection.objects.link(grass)
    assign(grass, mats["grass"])
    grass.data.materials.append(mats["grass_light"])
    grass.data.materials.append(mats["grass_dark"])
    for polygon in grass.data.polygons:
        if polygon.index % 47 == 0:
            polygon.material_index = 1
        elif polygon.index % 83 == 0:
            polygon.material_index = 2
    parent(grass, root)

    boundary_xy = [(hub_x, hub_y)]
    for ring_index in range(1, rings + 1):
        t = ring_index / rings
        boundary_xy.append((
            hub_x + math.cos(angle_start) * radius * t * (jitter[0] if ring_index == rings else 1.0),
            hub_y + math.sin(angle_start) * radius * t * (jitter[0] if ring_index == rings else 1.0),
        ))
    for index in range(1, segments):
        angle = angle_start + (angle_end - angle_start) * index / (segments - 1)
        boundary_xy.append((
            hub_x + math.cos(angle) * radius * jitter[index],
            hub_y + math.sin(angle) * radius * jitter[index],
        ))
    for ring_index in range(rings - 1, 0, -1):
        t = ring_index / rings
        boundary_xy.append((
            hub_x + math.cos(angle_end) * radius * t,
            hub_y + math.sin(angle_end) * radius * t,
        ))

    rock_rings = []
    depth_levels = (0.0, -0.72, -1.55, -2.38, -3.08, -3.62)
    for depth_index, z in enumerate(depth_levels):
        depth_t = depth_index / (len(depth_levels) - 1)
        radial_scale = 1.0 - depth_t * 0.76
        ring = []
        for index, (boundary_x, boundary_y) in enumerate(boundary_xy):
            uneven = 1.0 if depth_index == 0 else 1.0 + 0.025 * math.sin(index * 1.7 + depth_index)
            x = hub_x + (boundary_x - hub_x) * radial_scale * uneven - 0.16 * depth_t
            y = hub_y + (boundary_y - hub_y) * radial_scale * uneven - 0.10 * depth_t
            distance_ratio = min(1.0, math.hypot(boundary_x - hub_x, boundary_y - hub_y) / radius)
            taper = max(0.0, 1.0 - distance_ratio ** 8)
            top_z = terrain_height(boundary_x, boundary_y) * taper + 0.20 * (1 - taper)
            ring_z = top_z if depth_index == 0 else z + 0.08 * math.sin(index * 1.9 + depth_index)
            ring.append((x, y, ring_z))
        rock_rings.append(ring)
    rock = prism_mesh("Faceted Rock Body", rock_rings, mats["rock"], root)
    rock.data.materials.append(mats["rock_light"])
    for polygon in rock.data.polygons:
        if polygon.index % 9 in (0, 1):
            polygon.material_index = 1
    return {"grass": grass, "rock": rock}
