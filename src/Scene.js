import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { BODIES } from './data.js'
import sun from './assets/2k_sun.webp'; import mercury from './assets/2k_mercury.webp'
import venus from './assets/2k_venus_surface.webp'; import earth from './assets/2k_earth_daymap.webp'
import mars from './assets/2k_mars.webp'; import moon from './assets/2k_moon.webp'
import jupiter from './assets/2k_jupiter.webp'; import milky from './assets/2k_stars_milky_way.webp'
const TEX = { Sun:sun, Mercury:mercury, Venus:venus, Earth:earth, Mars:mars, Jupiter:jupiter }

// procedural banded texture for planets without a bundled image
function bands(color, n = 9) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128
  const x = c.getContext('2d'), base = new THREE.Color(color)
  for (let i = 0; i < n; i++) {
    const k = 0.78 + Math.sin(i * 2.1) * 0.12 + (i % 2) * 0.08
    x.fillStyle = '#' + base.clone().multiplyScalar(k).getHexString()
    x.fillRect(0, (128 / n) * i, 256, 128 / n + 1)
  }
  return new THREE.CanvasTexture(c)
}
function glow(color, size) {
  const c = document.createElement('canvas'); c.width = c.height = 128
  const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, color); g.addColorStop(.25, color + '88'); g.addColorStop(1, color + '00')
  x.fillStyle = g; x.fillRect(0, 0, 128, 128)
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), blending: THREE.AdditiveBlending, depthWrite: false }))
  s.scale.setScalar(size); return s
}

export default class Scene {
  constructor(canvas, labelRoot, onSelect) {
    this.onSelect = onSelect; this.speed = 1; this.paused = false; this.bodies = {}; this.labels = {}
    this.labelRoot = labelRoot; this.focus = null; this.showLabels = true
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    r.setPixelRatio(Math.min(devicePixelRatio, 2)); r.setSize(innerWidth, innerHeight)
    const s = this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, .1, 1500)
    this.camera.position.set(0, 55, 140)
    const ctl = this.controls = new OrbitControls(this.camera, canvas)
    ctl.enableDamping = true; ctl.minDistance = 4; ctl.maxDistance = 330; ctl.autoRotate = true; ctl.autoRotateSpeed = .35

    const loader = new THREE.TextureLoader()
    const bg = new THREE.Mesh(new THREE.SphereGeometry(900, 48, 24), new THREE.MeshBasicMaterial({ map: loader.load(milky), side: THREE.BackSide, color: 0x8a8aa8 }))
    s.add(bg)
    const pts = new Float32Array(2400 * 3)
    for (let i = 0; i < pts.length; i += 3) { const v = new THREE.Vector3().randomDirection().multiplyScalar(300 + Math.random() * 400); pts.set([v.x, v.y, v.z], i) }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(pts, 3))
    s.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 1.4, color: 0xdfe8ff, sizeAttenuation: false, transparent: true, opacity: .8 })))

    s.add(new THREE.AmbientLight(0x9aa6ff, .35))
    s.add(new THREE.PointLight(0xfff0d0, 3.2, 0, 0))
    const geo = new THREE.SphereGeometry(1, 64, 32)
    this.orbits = new THREE.Group(); s.add(this.orbits)
    this.pick = []

    BODIES.forEach(b => {
      const tex = TEX[b.name] ? loader.load(TEX[b.name]) : bands(b.c)
      if (TEX[b.name]) tex.colorSpace = THREE.SRGBColorSpace
      else tex.colorSpace = THREE.SRGBColorSpace
      const mat = b.name === 'Sun' ? new THREE.MeshBasicMaterial({ map: tex }) : new THREE.MeshStandardMaterial({ map: tex, roughness: .9 })
      const pivot = new THREE.Object3D(), mesh = new THREE.Mesh(geo, mat)
      mesh.scale.setScalar(b.r); mesh.userData.name = b.name; pivot.add(mesh); pivot.position.x = b.d
      if (b.name === 'Sun') mesh.add(glow('#ffb347', 5.2)), pivot.add(glow('#ff7a2f', b.r * 9))
      if (b.rings) {
        const rg = new THREE.RingGeometry(1.35, 2.3, 96), p = rg.attributes.position, uv = rg.attributes.uv, v = new THREE.Vector3()
        for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); uv.setXY(i, v.length() < 1.8 ? 0 : 1, 1) }
        const ring = new THREE.Mesh(rg, new THREE.MeshBasicMaterial({ color: 0xd9c79a, side: THREE.DoubleSide, transparent: true, opacity: .65 }))
        ring.rotation.x = Math.PI / 2.2; mesh.add(ring)
      }
      if (b.name === 'Earth') {
        const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: loader.load(moon) })); m.scale.setScalar(.27)
        this.moon = new THREE.Object3D(); m.position.x = 3.1; this.moon.add(m); pivot.add(this.moon)
      }
      s.add(pivot); this.pick.push(mesh)
      this.bodies[b.name] = { b, pivot, mesh, a: Math.random() * 6.28 }
      if (b.d) {
        const o = new THREE.Mesh(new THREE.RingGeometry(b.d - .04, b.d + .04, 160), new THREE.MeshBasicMaterial({ color: 0x8fa0ff, transparent: true, opacity: .18, side: THREE.DoubleSide }))
        o.rotation.x = Math.PI / 2; this.orbits.add(o)
      }
      const el = document.createElement('button'); el.className = 'tag'; el.textContent = b.name
      el.onclick = () => this.select(b.name); labelRoot.appendChild(el); this.labels[b.name] = el
    })

    const ray = new THREE.Raycaster(), m = new THREE.Vector2(); let down
    canvas.addEventListener('pointerdown', e => down = [e.clientX, e.clientY])
    canvas.addEventListener('pointerup', e => {
      if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return
      m.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1)
      ray.setFromCamera(m, this.camera)
      const h = ray.intersectObjects(this.pick)[0]; if (h) this.select(h.object.userData.name)
    })
    this.onResize = () => { this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix(); r.setSize(innerWidth, innerHeight) }
    addEventListener('resize', this.onResize)
    this.clock = new THREE.Clock(); this.tmp = new THREE.Vector3(); this.loop = this.loop.bind(this); this.loop()
  }
  select(name) { this.focus = name; this.controls.autoRotate = false; this.onSelect(name) }
  overview() { this.focus = null; this.onSelect(null) }
  setIdle(v) { this.controls.autoRotate = v }
  setOrbits(v) { this.orbits.visible = v }
  loop() {
    this.raf = requestAnimationFrame(this.loop)
    const dt = Math.min(this.clock.getDelta(), .05), c = this.controls, cam = this.camera
    for (const k in this.bodies) {
      const o = this.bodies[k]; o.mesh.rotation.y += dt * .6
      if (!o.b.d) continue
      if (!this.paused) o.a += dt * o.b.s * .22 * this.speed
      o.pivot.position.set(Math.cos(o.a) * o.b.d, 0, Math.sin(o.a) * o.b.d)
    }
    if (this.moon && !this.paused) this.moon.rotation.y += dt * 2 * this.speed
    // follow camera: glide the target to the focused body, ease the distance
    const f = this.focus && this.bodies[this.focus], goal = f ? f.pivot.position : this.tmp.set(0, 0, 0)
    const d = goal.clone().sub(c.target).multiplyScalar(Math.min(1, dt * 4))
    c.target.add(d); cam.position.add(d)
    if (f || this.focus === null) {
      const want = f ? Math.max(f.b.r * 4.2, 9) : 120, off = cam.position.clone().sub(c.target), len = off.length()
      if (f || len < 100) cam.position.copy(c.target).add(off.setLength(len + (want - len) * Math.min(1, dt * 2.5)))
    }
    c.update()
    const w = innerWidth, h = innerHeight, p = new THREE.Vector3()
    for (const k in this.bodies) {
      const o = this.bodies[k], el = this.labels[k]
      p.copy(o.pivot.position); p.y += o.b.r * 1.4; p.project(cam)
      const on = this.showLabels && p.z < 1
      el.style.display = on ? '' : 'none'
      if (on) el.style.transform = `translate(${(p.x + 1) * w / 2}px,${(1 - p.y) * h / 2}px) translate(-50%,-100%)`
      el.classList.toggle('on', this.focus === k)
    }
    this.renderer.render(this.scene, cam)
  }
  dispose() { cancelAnimationFrame(this.raf); removeEventListener('resize', this.onResize); this.renderer.dispose(); this.labelRoot.innerHTML = '' }
}
