"""Build the PAS-PAS moringa juice commercial scene and save PAS_PAS_MORINGA.blend.

Run either way:
    python3 scripts/02_build_scene.py                 (pip package `bpy`)
    blender -b -P scripts/02_build_scene.py           (regular Blender 4.2+ / 5.x)

Everything is procedural: the bottle is a DEMO model inspired by the 500 ml PET
mockup supplied in the PSD. Replace the objects in the PRODUCT collection with
the real packaging when a 3D model / technical drawing is available.

Timeline (25 fps, 750 frames):
    S1   1-100  mystery: particles, leaves, light beam reveals the silhouette
    S2 101-225  reveal on the podium, green/blue contour light
    S3 226-400  360° orbit, label + cap close-up
    S4 401-575  return to front, typography PAS-PAS / JUS DE MORINGA / signature
    S5 576-750  hero shot, leaves settle, PRÉSENTATION OFFICIELLE, fade to logo
"""
import math
import os
import random

import bpy
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")
FONTS = os.path.join(ASSETS, "fonts")   # Inter, SIL Open Font License
FPS = 25
FRAMES = 750
rng = random.Random(2026)

GREEN = (0.0093, 0.305, 0.0513)   # #189641 in linear
BLUE = (0.0168, 0.181, 0.497)     # #2376BB in linear


# ----------------------------------------------------------------------------
# helpers
# ----------------------------------------------------------------------------
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def collection(name):
    c = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(c)
    return c


def link(obj, col):
    for c in obj.users_collection:
        c.objects.unlink(obj)
    col.objects.link(obj)
    return obj


def new_obj(name, data, col):
    o = bpy.data.objects.new(name, data)
    col.objects.link(o)
    return o


def fcurves(id_data):
    ad = id_data.animation_data
    if ad is None or ad.action is None:
        return []
    act = ad.action
    if hasattr(act, "fcurves"):
        return act.fcurves
    from bpy_extras import anim_utils
    cb = anim_utils.action_get_channelbag_for_slot(act, ad.action_slot)
    return cb.fcurves if cb else []


def key(target, path, frame, value, index=-1):
    """Set a property and insert a keyframe (index=-1 keys every component)."""
    if index >= 0:
        getattr(target, path)[index] = value
    else:
        setattr(target, path, value)
    target.keyframe_insert(path, frame=frame, index=index)


def key_input(node_tree, sock, frame, value):
    sock.default_value = value
    sock.keyframe_insert("default_value", frame=frame)


def set_interp(id_data, mode="BEZIER", easing=None):
    for fc in fcurves(id_data):
        for kp in fc.keyframe_points:
            kp.interpolation = mode
            if easing:
                kp.easing = easing


def make_mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    return m


def principled(m):
    return m.node_tree.nodes["Principled BSDF"]


def camera_only(o):
    """Overlay-like objects: seen by the camera, ignored by every other ray."""
    for attr in ("visible_diffuse", "visible_glossy", "visible_transmission",
                 "visible_volume_scatter", "visible_shadow"):
        setattr(o, attr, False)


def shade_smooth(mesh):
    for p in mesh.polygons:
        p.use_smooth = True


def revolve(name, profile, segments=96, cap_bottom=False, cap_top=False, radial=None):
    """Revolve a (r, z) profile around Z. radial(angle, z) -> extra radius."""
    verts, faces = [], []
    rows = len(profile)
    for i, (r, z) in enumerate(profile):
        for s in range(segments):
            a = 2 * math.pi * s / segments
            rr = r + (radial(a, z) if radial else 0.0)
            verts.append((rr * math.cos(a), rr * math.sin(a), z))
    for i in range(rows - 1):
        for s in range(segments):
            a = i * segments + s
            b = i * segments + (s + 1) % segments
            faces.append((a, b, b + segments, a + segments))
    if cap_bottom:
        c = len(verts)
        verts.append((0, 0, profile[0][1]))
        for s in range(segments):
            faces.append((c, (s + 1) % segments, s))
    if cap_top:
        c = len(verts)
        verts.append((0, 0, profile[-1][1]))
        base = (rows - 1) * segments
        for s in range(segments):
            faces.append((c, base + s, base + (s + 1) % segments))
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    shade_smooth(me)
    return me


def image(path):
    return bpy.data.images.load(path, check_existing=True)


# ----------------------------------------------------------------------------
reset()
scene = bpy.context.scene
scene.name = "PAS_PAS_MORINGA"
scene.frame_start, scene.frame_end = 1, FRAMES
scene.render.fps = FPS

C = {n: collection(n) for n in (
    "PRODUCT", "PRODUCT_LABEL", "MORINGA_LEAVES", "PEDESTAL", "CAMERAS",
    "STUDIO_LIGHTS", "ATMOSPHERE", "PARTICLES", "TYPOGRAPHY", "FINAL_BRANDING")}

PODIUM_H = 0.30

# ----------------------------------------------------------------------------
# PRODUCT — demo 500 ml PET bottle (1 unit = 10 cm), base sits on the podium
# ----------------------------------------------------------------------------
def bottle_radius(z):
    if z < 0.06:
        return 0.30 + 0.035 * (z / 0.06) ** 0.5
    if z < 0.12:
        return 0.335 + 0.005 * (z - 0.06) / 0.06
    if z < 0.42:   # lower grip grooves
        return 0.34 - 0.016 * (0.5 - 0.5 * math.cos(2 * math.pi * (z - 0.12) / 0.075))
    if z < 1.21:   # straight label panel
        return 0.34
    if z < 1.55:   # upper grooves
        return 0.34 - 0.014 * (0.5 - 0.5 * math.cos(2 * math.pi * (z - 1.21) / 0.085))
    if z < 1.92:   # shoulder
        t = (z - 1.55) / 0.37
        return 0.135 + (0.34 - 0.135) * (0.5 + 0.5 * math.cos(math.pi * t))
    if z < 1.975:
        return 0.135
    if z < 2.0:    # neck support ring
        return 0.178
    return 0.132


zs = [i * 0.005 for i in range(0, int(2.08 / 0.005) + 1)]
shell_profile = [(0.0, 0.035), (0.12, 0.03), (0.24, 0.012)] + [(bottle_radius(z), z) for z in zs]
shell = new_obj("BOTTLE_PET", revolve("BOTTLE_PET", shell_profile, 128), C["PRODUCT"])
sol = shell.modifiers.new("thickness", "SOLIDIFY")
sol.thickness, sol.offset = 0.007, -1.0

# juice volume, filled to the upper shoulder
FILL = 1.74
liq_zs = [z for z in zs if 0.045 <= z <= FILL]
liq_profile = [(max(bottle_radius(z) - 0.011, 0.05), z) for z in liq_zs]
liq = new_obj("JUICE_MORINGA", revolve("JUICE_MORINGA", liq_profile, 128, True, True), C["PRODUCT"])

# cap: knurled side, rounded top
cap_prof = []
for i in range(0, 25):
    z = 1.995 + 0.215 * i / 24
    cap_prof.append((0.168, z))
for i in range(1, 9):
    t = i / 8 * math.pi / 2
    cap_prof.append((0.148 + 0.02 * math.cos(t), 2.21 + 0.02 * math.sin(t)))
cap_prof.append((0.0, 2.23))
cap_prof.insert(0, (0.13, 1.995))
cap = new_obj("CAP", revolve("CAP", cap_prof, 240,
                             radial=lambda a, z: (0.0045 if math.sin(a * 80) > 0 else 0.0) if 2.01 < z < 2.20 else 0.0),
              C["PRODUCT"])
# tamper ring under the cap
ring = new_obj("CAP_RING", revolve("CAP_RING", [(0.15, 1.955), (0.158, 1.96), (0.158, 1.99), (0.15, 1.995)], 120), C["PRODUCT"])

# product root (everything parented) — sits on the podium
root = bpy.data.objects.new("PRODUCT_ROOT", None)
C["PRODUCT"].objects.link(root)
root.location = (0, 0, PODIUM_H)
for o in (shell, liq, cap, ring):
    o.parent = root

# --- materials ---------------------------------------------------------------
def droplets_bump(m, strength=0.35):
    nt = m.node_tree
    tc = nt.nodes.new("ShaderNodeTexCoord")
    vor = nt.nodes.new("ShaderNodeTexVoronoi")
    vor.inputs["Scale"].default_value = 70.0
    vor.inputs["Randomness"].default_value = 1.0
    nt.links.new(tc.outputs["Object"], vor.inputs["Vector"])
    # round droplet profile: 1 at the cell centre, 0 beyond the radius
    ramp = nt.nodes.new("ShaderNodeMapRange")
    ramp.inputs["From Min"].default_value = 0.32
    ramp.inputs["From Max"].default_value = 0.0
    ramp.interpolation_type = "SMOOTHSTEP"
    nt.links.new(vor.outputs["Distance"], ramp.inputs["Value"])
    # clusters: noise mask so the condensation is uneven
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 4.0
    nt.links.new(tc.outputs["Object"], noise.inputs["Vector"])
    mask = nt.nodes.new("ShaderNodeMapRange")
    mask.inputs["From Min"].default_value = 0.45
    mask.inputs["From Max"].default_value = 0.62
    nt.links.new(noise.outputs["Fac"], mask.inputs["Value"])
    mul = nt.nodes.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    nt.links.new(ramp.outputs["Result"], mul.inputs[0])
    nt.links.new(mask.outputs["Result"], mul.inputs[1])
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = strength
    bump.inputs["Distance"].default_value = 0.004
    nt.links.new(mul.outputs["Value"], bump.inputs["Height"])
    return bump


def shadow_transparent(m, shader_out):
    """Let shadow rays pass through clear plastic so the juice stays luminous."""
    nt = m.node_tree
    lp = nt.nodes.new("ShaderNodeLightPath")
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(lp.outputs["Is Shadow Ray"], mix.inputs["Fac"])
    nt.links.new(shader_out, mix.inputs[1])
    nt.links.new(tr.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], nt.nodes["Material Output"].inputs["Surface"])


m_pet = make_mat("M_PET_clear")
p = principled(m_pet)
p.inputs["Base Color"].default_value = (1, 1, 1, 1)
p.inputs["Roughness"].default_value = 0.02
p.inputs["IOR"].default_value = 1.57
p.inputs["Transmission Weight"].default_value = 1.0
m_pet.node_tree.links.new(droplets_bump(m_pet).outputs["Normal"], p.inputs["Normal"])
shadow_transparent(m_pet, p.outputs[0])
shell.data.materials.append(m_pet)

m_juice = make_mat("M_JUICE_moringa")
p = principled(m_juice)
p.inputs["Base Color"].default_value = (0.12, 0.19, 0.03, 1)    # natural olive-green
p.inputs["Roughness"].default_value = 0.22                       # cloudy, not a soda
p.inputs["IOR"].default_value = 1.34
p.inputs["Transmission Weight"].default_value = 0.6
shadow_transparent(m_juice, p.outputs[0])
liq.data.materials.append(m_juice)

m_cap = make_mat("M_CAP_blue")
p = principled(m_cap)
p.inputs["Base Color"].default_value = (0.03, 0.26, 0.72, 1)
p.inputs["Roughness"].default_value = 0.28
p.inputs["Coat Weight"].default_value = 0.4
p.inputs["Coat Roughness"].default_value = 0.08
cap.data.materials.append(m_cap)
ring.data.materials.append(m_cap)

# ----------------------------------------------------------------------------
# PRODUCT_LABEL — wrap-around label, u = 0.5 faces the camera (-Y)
# ----------------------------------------------------------------------------
LABEL_Z0, LABEL_Z1, LABEL_R = 0.50, 1.17, 0.3445
seg, rows = 192, 8
verts, faces, uvs = [], [], []
for j in range(rows + 1):
    z = LABEL_Z0 + (LABEL_Z1 - LABEL_Z0) * j / rows
    for s in range(seg + 1):
        u = s / seg
        a = math.pi / 2 + 2 * math.pi * u
        verts.append((LABEL_R * math.cos(a), LABEL_R * math.sin(a), z))
for j in range(rows):
    for s in range(seg):
        a = j * (seg + 1) + s
        faces.append((a, a + 1, a + seg + 2, a + seg + 1))
me = bpy.data.meshes.new("LABEL")
me.from_pydata(verts, [], faces)
uvl = me.uv_layers.new(name="UVMap")
for poly in me.polygons:
    for li in poly.loop_indices:
        vi = me.loops[li].vertex_index
        j, s = divmod(vi, seg + 1)
        uvl.data[li].uv = (s / seg, j / rows)
shade_smooth(me)
label = new_obj("LABEL_PAS_PAS", me, C["PRODUCT_LABEL"])
label.parent = root

m_label = make_mat("M_LABEL")
nt = m_label.node_tree
p = principled(m_label)
tex = nt.nodes.new("ShaderNodeTexImage")
tex.image = image(os.path.join(ASSETS, "label_moringa.png"))
tex.interpolation = "Cubic"
nt.links.new(tex.outputs["Color"], p.inputs["Base Color"])
p.inputs["Roughness"].default_value = 0.32
p.inputs["Coat Weight"].default_value = 0.6
p.inputs["Coat Roughness"].default_value = 0.06
nt.links.new(droplets_bump(m_label, 0.12).outputs["Normal"], p.inputs["Coat Normal"])
label.data.materials.append(m_label)

# ----------------------------------------------------------------------------
# PEDESTAL — glossy black podium with light rings, reflective studio floor
# ----------------------------------------------------------------------------
pod_prof = [(0.0, 0.0), (1.40, 0.0), (1.40, 0.27), (1.39, 0.29), (1.37, PODIUM_H), (0.0, PODIUM_H)]
podium = new_obj("PODIUM", revolve("PODIUM", pod_prof, 160), C["PEDESTAL"])
m_pod = make_mat("M_PODIUM_black")
p = principled(m_pod)
p.inputs["Base Color"].default_value = (0.004, 0.005, 0.005, 1)
p.inputs["Roughness"].default_value = 0.22
p.inputs["Coat Weight"].default_value = 1.0
p.inputs["Coat Roughness"].default_value = 0.16
podium.data.materials.append(m_pod)


def torus(name, R, r, z, col):
    pr = [(R + r * math.cos(2 * math.pi * i / 16), z + r * math.sin(2 * math.pi * i / 16)) for i in range(17)]
    return new_obj(name, revolve(name, pr, 160), col)


ring_top = torus("RING_GREEN_TOP", 1.385, 0.010, 0.285, C["PEDESTAL"])
ring_low = torus("RING_BLUE_BASE", 1.43, 0.008, 0.012, C["PEDESTAL"])


def emission_mat(name, color, strength):
    m = make_mat(name)
    nt = m.node_tree
    nt.nodes.remove(nt.nodes["Principled BSDF"])
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (*color, 1)
    em.inputs["Strength"].default_value = strength
    nt.links.new(em.outputs[0], nt.nodes["Material Output"].inputs["Surface"])
    return m, em


m_rg, em_rg = emission_mat("M_RING_green", (0.05, 1.0, 0.25), 0.0)
m_rb, em_rb = emission_mat("M_RING_blue", (0.05, 0.35, 1.0), 0.0)
ring_top.data.materials.append(m_rg)
ring_low.data.materials.append(m_rb)
for f, v in ((1, 0.0), (95, 0.0), (130, 10.0), (575, 10.0), (690, 16.0), (712, 16.0), (735, 0.0)):
    key_input(m_rg.node_tree, em_rg.inputs["Strength"], f, v)
for f, v in ((1, 0.0), (105, 0.0), (140, 7.0), (690, 10.0), (712, 10.0), (735, 0.0)):
    key_input(m_rb.node_tree, em_rb.inputs["Strength"], f, v)

bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 0, 0))
floor = link(bpy.context.active_object, C["PEDESTAL"])
floor.name = "STUDIO_FLOOR"
m_floor = make_mat("M_FLOOR")
p = principled(m_floor)
p.inputs["Base Color"].default_value = (0.006, 0.008, 0.008, 1)
p.inputs["Roughness"].default_value = 0.18
p.inputs["Coat Weight"].default_value = 0.5
p.inputs["Coat Roughness"].default_value = 0.1
floor.data.materials.append(m_floor)

# backdrop: dark cyclorama wall with a soft green glow behind the product
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 9.0, 4.0), rotation=(math.pi / 2, 0, 0))
wall = link(bpy.context.active_object, C["ATMOSPHERE"])
wall.name = "BACKDROP_GLOW"
wall.scale = (34, 14, 1)
m_wall = make_mat("M_BACKDROP")
nt = m_wall.node_tree
nt.nodes.remove(nt.nodes["Principled BSDF"])
tc = nt.nodes.new("ShaderNodeTexCoord")
grad = nt.nodes.new("ShaderNodeTexGradient")
grad.gradient_type = "SPHERICAL"
# glow centre at (0.5, 0.38) of the wall, stretched horizontally
sub = nt.nodes.new("ShaderNodeVectorMath")
sub.operation = "SUBTRACT"
sub.inputs[1].default_value = (0.5, 0.38, 0)
nt.links.new(tc.outputs["Generated"], sub.inputs[0])
scl = nt.nodes.new("ShaderNodeVectorMath")
scl.operation = "MULTIPLY"
scl.inputs[1].default_value = (2.2, 4.2, 1)
nt.links.new(sub.outputs[0], scl.inputs[0])
nt.links.new(scl.outputs[0], grad.inputs["Vector"])
pw = nt.nodes.new("ShaderNodeMath")
pw.operation = "POWER"
pw.inputs[1].default_value = 2.2
nt.links.new(grad.outputs["Fac"], pw.inputs[0])
em = nt.nodes.new("ShaderNodeEmission")
em.inputs["Color"].default_value = (0.012, 0.16, 0.075, 1)
nt.links.new(pw.outputs[0], em.inputs["Strength"])
mulw = nt.nodes.new("ShaderNodeMath")
mulw.operation = "MULTIPLY"
nt.links.new(pw.outputs[0], mulw.inputs[0])
nt.links.new(mulw.outputs[0], em.inputs["Strength"])
nt.links.new(em.outputs[0], nt.nodes["Material Output"].inputs["Surface"])
for f, v in ((1, 0.0), (60, 0.05), (130, 0.25), (575, 0.25), (690, 0.38), (712, 0.38), (735, 0.0)):
    key_input(nt, mulw.inputs[1], f, v)
wall.data.materials.append(m_wall)
wall.visible_shadow = False

# ----------------------------------------------------------------------------
# STUDIO_LIGHTS
# ----------------------------------------------------------------------------
def area(name, loc, size, color, energy, target=(0, 0, 1.4), shape="RECTANGLE", size_y=None):
    ld = bpy.data.lights.new(name, "AREA")
    ld.shape = shape
    ld.size = size
    if size_y:
        ld.size_y = size_y
    ld.color = color
    ld.energy = energy
    o = new_obj(name, ld, C["STUDIO_LIGHTS"])
    o.location = loc
    d = Vector(target) - Vector(loc)
    o.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    o.visible_camera = False
    return o


key_l = area("KEY_softbox", (-3.6, -4.2, 3.6), 2.6, (1.0, 0.97, 0.92), 0)
fill_l = area("FILL_softbox", (4.5, -3.8, 2.0), 3.0, (0.85, 0.93, 1.0), 0)
rim_g = area("RIM_green_strip", (-2.4, 2.6, 1.9), 0.8, (0.25, 1.0, 0.35), 0, shape="RECTANGLE", size_y=3.2)
rim_b = area("RIM_blue_strip", (2.4, 2.6, 1.9), 0.8, (0.2, 0.5, 1.0), 0, shape="RECTANGLE", size_y=3.2)
top_l = area("TOP_beam_softbox", (0, 0.0, 6.4), 0.8, (0.85, 1.0, 0.85), 0, target=(0, 0, 0))
under = area("BACK_glass_glow", (0, 1.6, 1.3), 1.4, (0.6, 1.0, 0.5), 0, target=(0, -1, 1.3), size_y=2.2)

for o, keys in (
    (key_l, ((1, 0), (100, 0), (135, 240), (575, 240), (690, 360), (712, 360), (735, 0))),
    (fill_l, ((1, 0), (100, 0), (140, 55), (575, 55), (690, 90), (712, 90), (735, 0))),
    (rim_g, ((1, 0), (30, 0), (95, 260), (575, 260), (690, 330), (712, 330), (735, 0))),
    (rim_b, ((1, 0), (40, 0), (100, 260), (575, 260), (690, 330), (712, 330), (735, 0))),
    (top_l, ((1, 0), (12, 0), (70, 380), (130, 190), (575, 190), (690, 320), (712, 320), (735, 0))),
    (under, ((1, 0), (60, 0), (120, 35), (575, 35), (690, 50), (712, 50), (735, 0))),
):
    for f, v in keys:
        key(o.data, "energy", f, v)

# ----------------------------------------------------------------------------
# ATMOSPHERE — faked volumetric light shafts (additive, camera-only)
# ----------------------------------------------------------------------------
def beam(name, apex, base, r0, r1, color, keys):
    a, b = Vector(apex), Vector(base)
    L = (a - b).length
    me = revolve(name, [(r1, 0.0), (r0, L)], 64)
    o = new_obj(name, me, C["ATMOSPHERE"])
    o.location = b
    o.rotation_euler = (a - b).to_track_quat("Z", "Y").to_euler()
    m = make_mat("M_" + name)
    nt = m.node_tree
    nt.nodes.remove(nt.nodes["Principled BSDF"])
    lw = nt.nodes.new("ShaderNodeLayerWeight")
    lw.inputs["Blend"].default_value = 0.5
    inv = nt.nodes.new("ShaderNodeMath")
    inv.operation = "SUBTRACT"
    inv.inputs[0].default_value = 1.0
    nt.links.new(lw.outputs["Facing"], inv.inputs[1])
    edge = nt.nodes.new("ShaderNodeMath")
    edge.operation = "POWER"
    edge.inputs[1].default_value = 3.0
    nt.links.new(inv.outputs[0], edge.inputs[0])
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Generated"], sep.inputs[0])
    hz = nt.nodes.new("ShaderNodeMath")
    hz.operation = "POWER"
    hz.inputs[1].default_value = 1.6
    nt.links.new(sep.outputs["Z"], hz.inputs[0])
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 3.0
    noise.inputs["Detail"].default_value = 3.0
    nt.links.new(tc.outputs["Object"], noise.inputs["Vector"])
    m1 = nt.nodes.new("ShaderNodeMath")
    m1.operation = "MULTIPLY"
    nt.links.new(edge.outputs[0], m1.inputs[0])
    nt.links.new(hz.outputs[0], m1.inputs[1])
    m2 = nt.nodes.new("ShaderNodeMath")
    m2.operation = "MULTIPLY"
    nt.links.new(m1.outputs[0], m2.inputs[0])
    nt.links.new(noise.outputs["Fac"], m2.inputs[1])
    gain = nt.nodes.new("ShaderNodeMath")
    gain.operation = "MULTIPLY"
    nt.links.new(m2.outputs[0], gain.inputs[0])
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (*color, 1)
    nt.links.new(gain.outputs[0], em.inputs["Strength"])
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    add = nt.nodes.new("ShaderNodeAddShader")
    nt.links.new(tr.outputs[0], add.inputs[0])
    nt.links.new(em.outputs[0], add.inputs[1])
    nt.links.new(add.outputs[0], nt.nodes["Material Output"].inputs["Surface"])
    for f, v in keys:
        key_input(nt, gain.inputs[1], f, v)
    o.data.materials.append(m)
    camera_only(o)
    return o


beam("BEAM_TOP", (0, 0, 6.6), (0, 0, PODIUM_H), 0.18, 1.25, (0.75, 1.0, 0.75),
     ((1, 0), (10, 0), (70, 1.5), (130, 0.65), (575, 0.55), (690, 0.85), (712, 0.85), (735, 0)))
beam("BEAM_LEFT", (-6.5, 6.0, 7.5), (-0.8, 0.8, 0.0), 0.25, 1.6, (0.25, 1.0, 0.4),
     ((1, 0), (25, 0), (90, 0.45), (575, 0.35), (690, 0.5), (712, 0.5), (735, 0)))
beam("BEAM_RIGHT", (6.5, 6.0, 7.5), (0.8, 0.8, 0.0), 0.25, 1.6, (0.25, 0.55, 1.0),
     ((1, 0), (35, 0), (100, 0.4), (575, 0.3), (690, 0.45), (712, 0.45), (735, 0)))

world = bpy.data.worlds.new("STUDIO_DARK")
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.0009, 0.0016, 0.0016, 1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 1.0

# ----------------------------------------------------------------------------
# MORINGA_LEAVES — compound moringa leaves (rachis + paired oval leaflets)
# ----------------------------------------------------------------------------
def leaflet_geom(L, W, ox, oy, oz, rot, verts, faces, fold=0.35, curl=0.25):
    nu, nv = 9, 5
    start = len(verts)
    ca, sa = math.cos(rot), math.sin(rot)
    for i in range(nu + 1):
        u = i / nu
        w = W * (math.sin(math.pi * min(max(u, 0.0), 1.0)) ** 0.75)
        for j in range(nv + 1):
            v = -1 + 2 * j / nv
            x = v * w * 0.5
            y = u * L
            z = fold * abs(v) * w * 0.5 + curl * L * (u - 0.5) ** 2
            verts.append((ox + x * ca - y * sa, oy + x * sa + y * ca, oz + z))
    for i in range(nu):
        for j in range(nv):
            a = start + i * (nv + 1) + j
            faces.append((a, a + 1, a + nv + 2, a + nv + 1))


def compound_leaf_mesh(name, pairs=6, length=0.62):
    verts, faces = [], []
    # rachis as a thin flat ribbon with a slight arc
    n = 14
    s0 = len(verts)
    for i in range(n + 1):
        t = i / n
        y = t * length
        z = 0.06 * math.sin(math.pi * t)
        verts += [(-0.004, y, z), (0.004, y, z)]
    for i in range(n):
        a = s0 + 2 * i
        faces.append((a, a + 1, a + 3, a + 2))
    for k in range(pairs):
        t = 0.18 + 0.75 * k / pairs
        y = t * length
        z = 0.06 * math.sin(math.pi * t)
        s = 0.75 + 0.35 * math.sin(math.pi * t)
        Lf, Wf = 0.085 * s, 0.05 * s
        leaflet_geom(Lf, Wf, 0.0, y, z, math.radians(-68), verts, faces)
        leaflet_geom(Lf, Wf, 0.0, y, z, math.radians(68), verts, faces)
    leaflet_geom(0.09, 0.055, 0.0, length, 0.0, 0.0, verts, faces)
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    shade_smooth(me)
    return me


def single_leaflet_mesh(name):
    verts, faces = [], []
    leaflet_geom(0.12, 0.07, 0, -0.06, 0, 0, verts, faces, fold=0.4, curl=0.35)
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    shade_smooth(me)
    return me


m_leaf = make_mat("M_MORINGA_leaf")
nt = m_leaf.node_tree
p = principled(m_leaf)
oi = nt.nodes.new("ShaderNodeObjectInfo")
cr = nt.nodes.new("ShaderNodeValToRGB")
cr.color_ramp.elements[0].color = (0.018, 0.085, 0.008, 1)
cr.color_ramp.elements[1].color = (0.05, 0.17, 0.014, 1)
nt.links.new(oi.outputs["Random"], cr.inputs["Fac"])
nt.links.new(cr.outputs["Color"], p.inputs["Base Color"])
p.inputs["Roughness"].default_value = 0.42
p.inputs["Specular IOR Level"].default_value = 0.4
trl = nt.nodes.new("ShaderNodeBsdfTranslucent")
trl.inputs["Color"].default_value = (0.09, 0.24, 0.015, 1)
mixl = nt.nodes.new("ShaderNodeMixShader")
mixl.inputs["Fac"].default_value = 0.25
nt.links.new(p.outputs[0], mixl.inputs[1])
nt.links.new(trl.outputs[0], mixl.inputs[2])
nt.links.new(mixl.outputs[0], nt.nodes["Material Output"].inputs["Surface"])
m_leaf.use_backface_culling = False

leaf_me = compound_leaf_mesh("MORINGA_compound")
leaf_me.materials.append(m_leaf)
leaflet_me = single_leaflet_mesh("MORINGA_leaflet")
leaflet_me.materials.append(m_leaf)

orbit = bpy.data.objects.new("LEAF_ORBIT", None)
C["MORINGA_LEAVES"].objects.link(orbit)
key(orbit, "rotation_euler", 1, 0.0, index=2)
key(orbit, "rotation_euler", 700, math.radians(150), index=2)
set_interp(orbit, "BEZIER")


def add_noise(obj, path_prefix, strength, scale, start, end):
    for fc in fcurves(obj):
        if fc.data_path.startswith(path_prefix):
            mod = fc.modifiers.new("NOISE")
            mod.strength = strength
            mod.scale = scale
            mod.phase = rng.uniform(0, 100)
            mod.use_restricted_range = True
            mod.frame_start, mod.frame_end = start, end
            mod.blend_in, mod.blend_out = 10, 40


# orbiting leaves avoid the label height band so the product stays readable
heights = [0.40, 0.50, 0.45, 0.38, 0.52, 2.05, 2.2, 2.4, 2.65, 2.85, 2.1, 2.55, 0.48, 2.3]
for i, h in enumerate(heights):
    compound = i % 3 != 2
    me = leaf_me if compound else leaflet_me
    o = new_obj(f"LEAF_{i:02d}", me, C["MORINGA_LEAVES"])
    o.parent = orbit
    ang = 2 * math.pi * i / len(heights) + rng.uniform(-0.2, 0.2)
    rad = rng.uniform(1.25, 1.7) if h < 1 else rng.uniform(0.9, 1.6)
    sc = rng.uniform(1.15, 1.5) if compound else rng.uniform(1.1, 1.4)
    o.scale = (sc, sc, sc)
    loc0 = (rad * math.cos(ang), rad * math.sin(ang), h)
    rot0 = (rng.uniform(-0.6, 0.6), rng.uniform(-0.6, 0.6), rng.uniform(0, 6.28))
    # landing spot: on the floor around the podium, or on the podium top
    land_r = rng.uniform(1.55, 2.3) if i % 4 else rng.uniform(0.75, 1.15)
    land_z = 0.012 if land_r > 1.45 else PODIUM_H + 0.012
    loc1 = (land_r * math.cos(ang + 0.5), land_r * math.sin(ang + 0.5), land_z)
    rot1 = (0.0, 0.0, rot0[2] + rng.uniform(1.0, 2.5))
    fall = 600 + rng.randint(0, 50)
    land = fall + rng.randint(75, 100)
    for f, l, r in ((1, loc0, rot0), (fall, loc0, (rot0[0] + 0.4, rot0[1] - 0.3, rot0[2] + 1.6)), (land, loc1, rot1)):
        o.location, o.rotation_euler = l, r
        o.keyframe_insert("location", frame=f)
        o.keyframe_insert("rotation_euler", frame=f)
    add_noise(o, "location", 0.05, 45, 1, fall + 30)
    add_noise(o, "rotation_euler", 0.25, 35, 1, land - 5)

# foreground leaves for the opening shot (soft bokeh), retired after S2
for i, (x, y, z, s) in enumerate(((-1.25, -6.9, 1.9, 1.3), (1.15, -7.2, 1.05, 1.2), (-0.7, -6.4, 0.75, 1.1),
                                  (0.9, -5.9, 2.25, 1.0), (-1.6, -5.2, 1.4, 1.2))):
    o = new_obj(f"LEAF_FG_{i}", leaf_me if i % 2 == 0 else leaflet_me, C["MORINGA_LEAVES"])
    o.scale = (s, s, s)
    o.rotation_euler = (rng.uniform(0.6, 1.4), rng.uniform(-0.5, 0.5), rng.uniform(0, 6.28))
    o.location = (x, y, z)
    o.keyframe_insert("location", frame=1)
    o.keyframe_insert("rotation_euler", frame=1)
    o.location = (x * 2.2, y + 0.6, z + 0.4)
    o.rotation_euler = (o.rotation_euler[0] + 0.5, o.rotation_euler[1], o.rotation_euler[2] + 1.0)
    o.keyframe_insert("location", frame=200)
    o.keyframe_insert("rotation_euler", frame=200)
    add_noise(o, "location", 0.04, 40, 1, 200)
    o.hide_render = False
    o.keyframe_insert("hide_render", frame=200)
    o.hide_render = True
    o.keyframe_insert("hide_render", frame=201)
    set_interp(o, "BEZIER")
    for fc in fcurves(o):
        if fc.data_path == "hide_render":
            for kp in fc.keyframe_points:
                kp.interpolation = "CONSTANT"

# ----------------------------------------------------------------------------
# PARTICLES — floating green specks (emissive, camera-only)
# ----------------------------------------------------------------------------
m_sp, em_sp = emission_mat("M_SPECK_green", (0.35, 1.0, 0.45), 0.0)
m_sp2, em_sp2 = emission_mat("M_SPECK_pale", (0.8, 1.0, 0.85), 0.0)
for m, em, keys in ((m_sp, em_sp, ((1, 0), (8, 3.5), (100, 5), (130, 2.2), (575, 2.2), (690, 3.2), (712, 3.2), (735, 0))),
                    (m_sp2, em_sp2, ((1, 0), (8, 1.8), (100, 2.8), (130, 1.3), (575, 1.3), (690, 2.0), (712, 2.0), (735, 0)))):
    for f, v in keys:
        key_input(m.node_tree, em.inputs["Strength"], f, v)
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1)
speck_me = bpy.context.active_object.data
bpy.data.objects.remove(bpy.context.active_object)
speck_me.name = "SPECK"
shade_smooth(speck_me)
for i in range(130):
    o = new_obj(f"SPECK_{i:03d}", speck_me.copy(), C["PARTICLES"])
    o.data.materials.append(m_sp if i % 4 else m_sp2)
    r = rng.uniform(0.006, 0.02)
    o.scale = (r, r, r)
    a = rng.uniform(0, 2 * math.pi)
    d = rng.uniform(0.7, 5.0)
    p0 = Vector((d * math.cos(a), d * math.sin(a), rng.uniform(0.1, 4.2)))
    o.location = p0
    o.keyframe_insert("location", frame=1)
    o.location = p0 + Vector((rng.uniform(-0.3, 0.3), rng.uniform(-0.3, 0.3), rng.uniform(0.4, 1.0)))
    o.keyframe_insert("location", frame=FRAMES)
    set_interp(o, "LINEAR")
    for fc in fcurves(o):
        mod = fc.modifiers.new("NOISE")
        mod.strength, mod.scale, mod.phase = 0.12, 60, rng.uniform(0, 100)
    camera_only(o)

# ----------------------------------------------------------------------------
# CAMERAS — one hero camera on an orbit rig, tracking an animated target
# ----------------------------------------------------------------------------
rig = bpy.data.objects.new("CAM_RIG", None)
C["CAMERAS"].objects.link(rig)
target = bpy.data.objects.new("CAM_TARGET", None)
C["CAMERAS"].objects.link(target)

cam_d = bpy.data.cameras.new("CAM_MAIN")
cam_d.lens = 50
cam_d.sensor_width = 36
cam_d.clip_start, cam_d.clip_end = 0.05, 200
cam_d.dof.use_dof = True
cam_d.dof.aperture_fstop = 2.8
cam_d.dof.aperture_blades = 7
cam = new_obj("CAM_MAIN", cam_d, C["CAMERAS"])
cam.parent = rig
scene.camera = cam
tt = cam.constraints.new("TRACK_TO")
tt.target = target
tt.track_axis, tt.up_axis = "TRACK_NEGATIVE_Z", "UP_Y"

# (frame, camera local position, target position, lens, rig rotation deg)
SHOTS = [
    (1,   (-0.9, -10.2, 1.75), (0.0, 0, 1.55), 50, 0),
    (100, (-0.35, -8.4, 1.15), (0.0, 0, 1.45), 50, 0),
    (225, (0.0, -6.9, 1.45),   (0.0, 0, 1.40), 50, 0),
    (260, (0.0, -6.4, 1.6),    (0.0, 0, 1.40), 55, -50),
    (300, (0.0, -4.6, 2.45),   (0.0, 0, 2.05), 75, -150),   # cap reflections
    (350, (0.0, -4.9, 1.15),   (0.0, 0, 1.05), 70, -352),   # label detail
    (400, (0.0, -6.6, 1.5),    (0.0, 0, 1.40), 55, -360),
    (430, (-1.45, -7.4, 1.5),  (-1.45, 0, 1.42), 50, -360),  # bottle on the right third
    (575, (-1.30, -6.9, 1.5),  (-1.30, 0, 1.42), 50, -360),
    (610, (0.0, -8.3, 1.35),   (0.0, 0, 1.42), 50, -360),   # centred hero
    (700, (0.0, -7.8, 1.38),   (0.0, 0, 1.45), 50, -360),
    (750, (0.0, -7.6, 1.40),   (0.0, 0, 1.45), 50, -360),
]
for f, cl, tl, lens, rot in SHOTS:
    key(cam, "location", f, cl)
    key(target, "location", f, tl)
    key(cam_d, "lens", f, lens)
    key(rig, "rotation_euler", f, math.radians(rot), index=2)
for o in (cam, target, cam_d, rig):
    set_interp(o, "BEZIER")


# ----------------------------------------------------------------------------
# TYPOGRAPHY — camera-attached text (in focus plane, camera-only)
# ----------------------------------------------------------------------------
def fade_material(name, color, strength, img=None):
    m = make_mat(name)
    nt = m.node_tree
    nt.nodes.remove(nt.nodes["Principled BSDF"])
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (*color, 1)
    em.inputs["Strength"].default_value = strength
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    mix = nt.nodes.new("ShaderNodeMixShader")
    fade = nt.nodes.new("ShaderNodeValue")
    fade.name = "FADE"
    fade.outputs[0].default_value = 0.0
    if img:
        tex = nt.nodes.new("ShaderNodeTexImage")
        tex.image = image(img)
        tex.interpolation = "Cubic"
        nt.links.new(tex.outputs["Color"], em.inputs["Color"])
        mul = nt.nodes.new("ShaderNodeMath")
        mul.operation = "MULTIPLY"
        nt.links.new(tex.outputs["Alpha"], mul.inputs[0])
        nt.links.new(fade.outputs[0], mul.inputs[1])
        nt.links.new(mul.outputs[0], mix.inputs["Fac"])
    else:
        nt.links.new(fade.outputs[0], mix.inputs["Fac"])
    nt.links.new(tr.outputs[0], mix.inputs[1])
    nt.links.new(em.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], nt.nodes["Material Output"].inputs["Surface"])
    return m, fade


def fade_keys(m, fade, frames):
    for f, v in frames:
        fade.outputs[0].default_value = v
        fade.outputs[0].keyframe_insert("default_value", frame=f)


def text_obj(name, body, font_file, size, col, loc, color, strength=1.0, spacing=1.0, align="CENTER"):
    cu = bpy.data.curves.new(name, "FONT")
    cu.body = body
    cu.font = bpy.data.fonts.load(os.path.join(FONTS, font_file), check_existing=True)
    cu.size = size
    cu.align_x, cu.align_y = align, "CENTER"
    cu.space_character = spacing
    o = new_obj(name, cu, col)
    o.parent = cam
    o.location = loc
    m, fade = fade_material("M_" + name, color, strength)
    cu.materials.append(m)
    camera_only(o)
    return o, m, fade


def image_plane(name, img_path, height, col, loc):
    im = image(img_path)
    w = height * im.size[0] / im.size[1]
    me = bpy.data.meshes.new(name)
    me.from_pydata([(-w / 2, -height / 2, 0), (w / 2, -height / 2, 0), (w / 2, height / 2, 0), (-w / 2, height / 2, 0)],
                   [], [(0, 1, 2, 3)])
    uv = me.uv_layers.new(name="UVMap")
    for li, c in zip(range(4), ((0, 0), (1, 0), (1, 1), (0, 1))):
        uv.data[li].uv = c
    o = new_obj(name, me, col)
    o.parent = cam
    o.location = loc
    m, fade = fade_material("M_" + name, (1, 1, 1), 1.0, img_path)
    me.materials.append(m)
    camera_only(o)
    return o, m, fade


def slide_in(o, f0, dy=0.05):
    x, y, z = o.location
    key(o, "location", f0, (x, y - dy, z))
    key(o, "location", f0 + 18, (x, y, z))
    set_interp(o, "BEZIER")


D4 = -7.0   # depth of S4 typography (≈ focus distance, so it stays sharp)
# S4 — left block, bottle on the right third
o, m, fd = image_plane("TXT_S4_PASPAS", os.path.join(ASSETS, "wordmark_white.png"), 0.27, C["TYPOGRAPHY"], (-1.45, 0.40, D4))
fade_keys(m, fd, ((440, 0), (458, 1), (562, 1), (578, 0)))
slide_in(o, 440)
o, m, fd = text_obj("TXT_S4_JUS", "JUS DE MORINGA", "Inter-Black.otf", 0.25, C["TYPOGRAPHY"], (-1.45, 0.05, D4),
                    (0.04, 0.62, 0.13), 1.6, spacing=1.08)
fade_keys(m, fd, ((470, 0), (488, 1), (562, 1), (578, 0)))
slide_in(o, 470)
o, m, fd = text_obj("TXT_S4_SIGNATURE", "La fraîcheur au naturel.", "Inter-LightItalic.otf", 0.19, C["TYPOGRAPHY"],
                    (-1.45, -0.30, D4), (0.92, 0.95, 0.92), 1.0)
fade_keys(m, fd, ((505, 0), (525, 1), (562, 1), (578, 0)))
slide_in(o, 505, 0.03)

# S5 — hero layout: brand + product on the left, the event on the right
D5 = -7.8
o, m, fd = image_plane("TXT_S5_PASPAS", os.path.join(ASSETS, "wordmark_white.png"), 0.25, C["TYPOGRAPHY"], (-1.75, 0.30, D5))
fade_keys(m, fd, ((620, 0), (640, 1), (695, 1), (708, 0)))
slide_in(o, 620)
o, m, fd = text_obj("TXT_S5_JUS", "JUS DE MORINGA", "Inter-Black.otf", 0.21, C["TYPOGRAPHY"], (-1.75, -0.02, D5),
                    (0.04, 0.62, 0.13), 1.6, spacing=1.06)
fade_keys(m, fd, ((632, 0), (652, 1), (695, 1), (708, 0)))
slide_in(o, 632)
for i, word in enumerate(("PRÉSENTATION", "OFFICIELLE")):
    o, m, fd = text_obj(f"TXT_S5_OFFICIELLE_{i}", word, "Inter-SemiBold.otf", 0.165, C["TYPOGRAPHY"],
                        (1.75, 0.27 - 0.26 * i, D5), (0.93, 0.95, 0.93), 1.0, spacing=1.22)
    fade_keys(m, fd, ((648 + 6 * i, 0), (668 + 6 * i, 1), (695, 1), (708, 0)))
    slide_in(o, 648 + 6 * i, 0.03)
# thin green rule between the event lines
rule_me = bpy.data.meshes.new("TXT_S5_RULE")
rule_me.from_pydata([(-0.55, -0.006, 0), (0.55, -0.006, 0), (0.55, 0.006, 0), (-0.55, 0.006, 0)], [], [(0, 1, 2, 3)])
o = new_obj("TXT_S5_RULE", rule_me, C["TYPOGRAPHY"])
o.parent = cam
o.location = (1.75, 0.14, D5)
m, fd = fade_material("M_TXT_S5_RULE", (0.04, 0.62, 0.13), 1.6)
rule_me.materials.append(m)
camera_only(o)
fade_keys(m, fd, ((660, 0), (676, 1), (695, 1), (708, 0)))

# ----------------------------------------------------------------------------
# FINAL_BRANDING — fade to black, official logo badge + wordmark
# ----------------------------------------------------------------------------
D6 = -4.0
cu_me = bpy.data.meshes.new("CURTAIN")
cu_me.from_pydata([(-6, -4, 0), (6, -4, 0), (6, 4, 0), (-6, 4, 0)], [], [(0, 1, 2, 3)])
curtain = new_obj("CURTAIN_BLACK", cu_me, C["FINAL_BRANDING"])
curtain.parent = cam
curtain.location = (0, 0, D6 - 0.6)
m_cur, fd_cur = fade_material("M_CURTAIN", (0, 0, 0), 0.0)
cu_me.materials.append(m_cur)
camera_only(curtain)
fade_keys(m_cur, fd_cur, ((700, 0), (726, 1), (750, 1)))

badge, m_b, fd_b = image_plane("LOGO_BADGE", os.path.join(ASSETS, "logo_badge.png"), 0.95, C["FINAL_BRANDING"], (0, 0.18, D6))
fade_keys(m_b, fd_b, ((712, 0), (732, 1), (750, 1)))
key(badge, "scale", 712, (0.94, 0.94, 0.94))
key(badge, "scale", 750, (1.0, 1.0, 1.0))
wmk, m_w, fd_w = image_plane("LOGO_WORDMARK", os.path.join(ASSETS, "wordmark_white.png"), 0.16, C["FINAL_BRANDING"], (0, -0.52, D6))
fade_keys(m_w, fd_w, ((720, 0), (738, 1), (750, 1)))
# focus distance follows the label face, then pulls to the end card
for f, v in ((1, 10.2), (100, 8.4), (225, 7.0), (260, 6.5), (300, 4.5), (350, 4.75), (400, 6.6),
             (430, 7.4), (575, 6.95), (610, 8.3), (700, 7.8), (720, 4.0), (750, 4.0)):
    key(cam_d.dof, "focus_distance", f, v)
set_interp(cam_d, "BEZIER")

# light linking: rim strips light the product / leaves / podium, never the
# floor (their floor reflections read as hard white boxes)
rim_receivers = bpy.data.collections.new("LL_RIM_RECEIVERS")
for col in ("PRODUCT", "PRODUCT_LABEL", "MORINGA_LEAVES"):
    for o in C[col].objects:
        rim_receivers.objects.link(o)
for o in (podium, ring_top, ring_low):
    rim_receivers.objects.link(o)
for o in (rim_g, rim_b):
    o.light_linking.receiver_collection = rim_receivers

# ----------------------------------------------------------------------------
# RENDER SETTINGS
# ----------------------------------------------------------------------------
r = scene.render
r.engine = "CYCLES"
r.resolution_x, r.resolution_y, r.resolution_percentage = 1920, 1080, 100
r.film_transparent = False
r.use_persistent_data = True
r.image_settings.file_format = "PNG"
r.image_settings.color_mode = "RGB"
r.filepath = os.path.join(ROOT, "renders", "frames", "f_")
cy = scene.cycles
cy.device = "CPU"
cy.samples = 64
cy.adaptive_threshold = 0.03
cy.use_denoising = True
cy.denoiser = "OPENIMAGEDENOISE"
cy.max_bounces = 6
cy.diffuse_bounces = 1
cy.glossy_bounces = 2
cy.transmission_bounces = 6
cy.transparent_max_bounces = 8
cy.volume_bounces = 0
cy.caustics_reflective = False
cy.caustics_refractive = False
cy.sample_clamp_indirect = 6.0
cy.blur_glossy = 1.0
vs = scene.view_settings
try:
    vs.view_transform = "Khronos PBR Neutral"
except TypeError:
    vs.view_transform = "AgX"
vs.look = "None"
vs.exposure = 0.0

out = os.path.join(ROOT, "PAS_PAS_MORINGA.blend")
bpy.ops.wm.save_as_mainfile(filepath=out, relative_remap=True)

print("saved", out)
