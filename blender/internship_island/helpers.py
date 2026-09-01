import bpy
import math
from mathutils import Vector


def assign(obj, mat):
    if hasattr(obj.data, "materials"):
        obj.data.materials.append(mat)
    return obj


def parent(obj, owner):
    obj.parent = owner
    return obj


def cube(name, location, dimensions, mat, owner, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign(obj, mat)
    parent(obj, owner)
    if bevel:
        modifier = obj.modifiers.new("Edge bevel", "BEVEL")
        modifier.width = bevel
        modifier.segments = 2
    return obj


def cylinder(name, location, radius, depth, mat, owner, vertices=16):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location)
    obj = bpy.context.object
    obj.name = name
    assign(obj, mat)
    parent(obj, owner)
    return obj


def cone(name, location, radius1, radius2, depth, mat, owner, vertices=16):
    bpy.ops.mesh.primitive_cone_add(
        vertices=vertices, radius1=radius1, radius2=radius2, depth=depth, location=location
    )
    obj = bpy.context.object
    obj.name = name
    assign(obj, mat)
    parent(obj, owner)
    return obj


def ico(name, location, radius, mat, owner, scale=(1, 1, 1), subdivisions=2):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=subdivisions, radius=radius, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign(obj, mat)
    parent(obj, owner)
    return obj


def curve_tube(name, points, bevel_depth, mat, owner):
    curve = bpy.data.curves.new(name + " Curve", "CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 2
    curve.bevel_depth = bevel_depth
    curve.bevel_resolution = 2
    spline = curve.splines.new("BEZIER")
    spline.bezier_points.add(len(points) - 1)
    for point, coordinate in zip(spline.bezier_points, points):
        point.co = coordinate
        point.handle_left_type = "AUTO"
        point.handle_right_type = "AUTO"
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    assign(obj, mat)
    parent(obj, owner)
    return obj


def road_ribbon(name, points, width, mat, owner):
    vertices = []
    faces = []
    for index, point in enumerate(points):
        current = Vector(point)
        previous = Vector(points[max(0, index - 1)])
        following = Vector(points[min(len(points) - 1, index + 1)])
        tangent = following - previous
        tangent.z = 0
        tangent.normalize()
        normal = Vector((-tangent.y, tangent.x, 0))
        left = current + normal * width * 0.5
        right = current - normal * width * 0.5
        vertices.extend([tuple(left), tuple(right)])
    for index in range(len(points) - 1):
        a = index * 2
        faces.append((a, a + 1, a + 3, a + 2))
    mesh = bpy.data.meshes.new(name + " Mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    assign(obj, mat)
    parent(obj, owner)
    bevel = obj.modifiers.new("Road edge bevel", "SOLIDIFY")
    bevel.thickness = 0.055
    return obj


def look_at(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def prism_mesh(name, rings, mat, owner):
    vertices = []
    faces = []
    segment_count = len(rings[0])
    for ring in rings:
        vertices.extend(ring)
    for ring_index in range(len(rings) - 1):
        offset = ring_index * segment_count
        next_offset = (ring_index + 1) * segment_count
        for i in range(segment_count):
            j = (i + 1) % segment_count
            faces.append((offset + i, next_offset + i, next_offset + j))
            faces.append((offset + i, next_offset + j, offset + j))
    mesh = bpy.data.meshes.new(name + " Mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    assign(obj, mat)
    parent(obj, owner)
    return obj
