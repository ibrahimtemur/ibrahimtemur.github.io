/* ==========================================================================
   3D CAMERA SPLINE & 7-STATION SPATIAL ROUTE (js/camera-path.js)
   Maps the 7 editorial scenes to a continuous CatmullRomCurve3 camera path
   and coordinated lookAt curve with viewport-responsive Hero & Stage offsets.
   ========================================================================== */

import * as THREE from "three";

export const CAMERA_STATIONS = [
  {
    id: "scene-hero",
    index: 0,
    anchor: [0.0, 0.08, 0.0],
    cameraPos: [0.0, 0.16, 6.2],
    lookAt: [0.0, 0.08, 0.0]
  },
  {
    id: "scene-journey",
    index: 1,
    anchor: [4.6, -1.1, -20.0],
    cameraPos: [1.5, -0.55, -13.2],
    lookAt: [4.2, -1.1, -20.0]
  },
  {
    id: "scene-skills",
    index: 2,
    anchor: [0.0, 0.35, -40.0],
    cameraPos: [-0.35, 0.85, -32.6],
    lookAt: [0.0, 0.3, -40.0]
  },
  {
    id: "scene-featured",
    index: 3,
    // Anchor sits in the right 68% open 3D stage while left 32% holds narrative
    anchor: [-0.45, -0.1, -60.0],
    cameraPos: [-2.95, -0.05, -51.8],
    lookAt: [-2.95, -0.1, -60.0]
  },
  {
    id: "scene-iot",
    index: 4,
    // Anchor sits in the left 55% open 3D PCB stage while right 45% holds state machine
    anchor: [-5.6, -0.95, -80.0],
    cameraPos: [-3.9, -0.35, -72.2],
    lookAt: [-4.15, -0.95, -80.0]
  },
  {
    id: "scene-projects",
    index: 5,
    anchor: [0.0, 0.25, -100.0],
    cameraPos: [0.0, 0.8, -92.0],
    lookAt: [0.0, 0.2, -100.0]
  },
  {
    id: "scene-contact",
    index: 6,
    anchor: [0.0, 0.0, -120.0],
    cameraPos: [0.0, 0.35, -112.2],
    lookAt: [0.0, 0.0, -120.0]
  }
];

export const HERO_INTRO_START_Z = 9.5;
export const HERO_INTRO_END_Z = 6.2;

/**
 * Builds the 7-station CatmullRomCurve3 camera rig and helper samplers.
 */
export function createCameraRig() {
  const cameraPoints = CAMERA_STATIONS.map(
    (s) => new THREE.Vector3(s.cameraPos[0], s.cameraPos[1], s.cameraPos[2])
  );
  const lookAtPoints = CAMERA_STATIONS.map(
    (s) => new THREE.Vector3(s.lookAt[0], s.lookAt[1], s.lookAt[2])
  );

  // Uniform-parameterized Catmull-Rom ensures t = i / (N - 1) hits exact station waypoints
  const cameraCurve = new THREE.CatmullRomCurve3(cameraPoints, false, "catmullrom", 0.38);
  const lookAtCurve = new THREE.CatmullRomCurve3(lookAtPoints, false, "catmullrom", 0.38);

  const stationCount = CAMERA_STATIONS.length;

  function getSplineTForStation(index) {
    const clamped = Math.max(0, Math.min(stationCount - 1, index));
    return clamped / (stationCount - 1);
  }

  function getStation(indexOrId) {
    if (typeof indexOrId === "number") {
      const idx = Math.max(0, Math.min(stationCount - 1, indexOrId));
      return CAMERA_STATIONS[idx];
    }
    return CAMERA_STATIONS.find((s) => s.id === indexOrId) || CAMERA_STATIONS[0];
  }

  function sampleAt(t, outPos = new THREE.Vector3(), outLookAt = new THREE.Vector3()) {
    const u = Math.max(0, Math.min(1, Number(t) || 0));
    cameraCurve.getPoint(u, outPos);
    lookAtCurve.getPoint(u, outLookAt);
    return { position: outPos, lookAt: outLookAt };
  }

  return {
    stations: CAMERA_STATIONS,
    cameraCurve,
    lookAtCurve,
    getSplineTForStation,
    getStation,
    sampleAt
  };
}
