import bpy


PALETTE = {
    "grass": (0.43, 0.62, 0.20),
    "grass_light": (0.58, 0.73, 0.28),
    "grass_dark": (0.29, 0.46, 0.14),
    "rock": (0.28, 0.24, 0.21),
    "rock_light": (0.43, 0.36, 0.29),
    "stone": (0.72, 0.67, 0.56),
    "cream": (0.88, 0.82, 0.68),
    "palace_red": (0.68, 0.18, 0.08),
    "roof_gold": (0.94, 0.43, 0.05),
    "city_teal": (0.28, 0.47, 0.52),
    "pearl": (0.86, 0.31, 0.31),
    "water": (0.18, 0.62, 0.64),
    "wood": (0.34, 0.18, 0.08),
}


def _make(name, color, roughness=0.78, metallic=0.0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1.0)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    return mat


def build_materials():
    return {
        "grass": _make("Grass", PALETTE["grass"]),
        "grass_light": _make("Grass Light", PALETTE["grass_light"]),
        "grass_dark": _make("Grass Dark", PALETTE["grass_dark"]),
        "rock": _make("Rock", PALETTE["rock"]),
        "rock_light": _make("Rock Light", PALETTE["rock_light"]),
        "stone": _make("Stone", PALETTE["stone"]),
        "cream": _make("Cream", PALETTE["cream"]),
        "red": _make("Palace Red", PALETTE["palace_red"]),
        "gold": _make("Roof Gold", PALETTE["roof_gold"]),
        "teal": _make("City Teal", PALETTE["city_teal"], metallic=0.08),
        "pearl": _make("Pearl", PALETTE["pearl"]),
        "water": _make("Water", PALETTE["water"], roughness=0.28),
        "wood": None,
    }
