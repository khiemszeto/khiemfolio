import "./style.scss";
import * as THREE from "three";
import { OrbitControls } from "./utils/OrbitControls.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from "gsap";
import { Howl } from "howler";

/** ----------------- Audio setup----------------- */
const BACKGROUND_MUSIC_VOLUME = 1;
const FADE_VOLUME = 0;
const backgroundMusic = new Howl({
  src: "/audio/music/01-01 Littleroot Town (From _Pokemon Ruby_).mp3",
  loop: true,
  volume: BACKGROUND_MUSIC_VOLUME,
});

const canvas = document.querySelector("#experience-canvas");
const sizes = { height: window.innerHeight, width: window.innerWidth };

const modals = {
  work: document.querySelector(".modal.work"),
  about: document.querySelector(".modal.about"),
  contact: document.querySelector(".modal.contact"),
  poli: document.querySelector(".modal.poli"),
};

let touchHappened = false;

document.querySelectorAll(".modal-exit-button").forEach((button) => {
  button.addEventListener(
    "touchend",
    (e) => {
      touchHappened = true;
      const modal = e.target.closest(".modal");
      hideModal(modal);
    },
    { passive: false }
  );
  button.addEventListener(
    "click",
    (e) => {
      if (touchHappened) return;
      const modal = e.target.closest(".modal");
      hideModal(modal);
    },
    { passive: false }
  );
});

let isModalOpen = false;

const showModal = (modal) => {
  modal.style.display = "block";
  isModalOpen = true;
  controls.enabled = false;

  if (currentHoveredObject) {
    playHoverAnimation(currentHoveredObject, false);
    currentHoveredObject = null;
  }

  document.body.style.cursor = "default";
  currentIntersects = [];

  gsap.set(modal, { opacity: 0 });

  gsap.to(modal, {
    opacity: 1,
    duration: 0.5,
  });
};

const hideModal = (modal) => {
  isModalOpen = false;
  controls.enabled = true;

  gsap.to(modal, {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      modal.style.display = "none";
    },
  });
};

/**  -------------------------- Loading Screen  -------------------------- */

const manager = new THREE.LoadingManager();

const loadingScreen = document.querySelector(".loading-screen");
const loadingScreenButton = document.querySelector(".loading-screen-button");
const noSoundButton = document.querySelector(".no-sound-button");

manager.onLoad = function () {
  loadingScreenButton.style.border = "8px solid #63a8e1";
  loadingScreenButton.style.background = "#bccce7";
  loadingScreenButton.style.color = "#63a8e1";
  loadingScreenButton.style.boxShadow = "rgba(0, 0, 0, 0.24) 0px 3px 8px";
  loadingScreenButton.style.cursor = "pointer";
  loadingScreenButton.textContent = "Enter!";
  loadingScreenButton.style.transtition =
    "transform 0.3s cubic-bezier(0.34, 1.56, 0.64,1)";
  let isDisabled = false;

  noSoundButton.textContent = "Enter without Sound :((";

  function handleEnter(withSound = true) {
    if (isDisabled) return;

    noSoundButton.textContent = "";
    loadingScreenButton.style.cursor = "default";
    loadingScreenButton.style.border = "8px solid #63a8e1";
    loadingScreenButton.style.background = "#bccce7";
    loadingScreenButton.style.color = "#63a8e1";
    loadingScreenButton.style.boxShadow = "none";
    loadingScreenButton.textContent = "~ Hello, welcome to my room ~";
    loadingScreen.style.background = "#bccce7";
    isDisabled = true;

    if (!withSound) {
      isMuted = true;
      updateSoundState(true);
      soundOffButton.style.display = "block";
      soundOnButton.style.display = "none";
    } else {
      backgroundMusic.play();
    }

    playReveal();
  }

  loadingScreenButton.addEventListener("mouseenter", () => {
    loadingScreenButton.style.transform = "scale(1.3)";
  });

  loadingScreenButton.addEventListener("mouseleave", () => {
    loadingScreenButton.style.transform = "none";
  });

  loadingScreenButton.addEventListener("touchend", (e) => {
    touchHappened = true;
    e.preventDefault();
    handleEnter();
  });

  loadingScreenButton.addEventListener("click", (e) => {
    if (touchHappened) return;
    handleEnter(true);
  });

  noSoundButton.addEventListener("touchend", (e) => {
    touchHappened = true;
    e.preventDefault();
    handleEnter(false);
  });

  noSoundButton.addEventListener("click", (e) => {
    if (touchHappened) return;
    handleEnter(false);
  });
};

const zAxixFans = [];
const items = {};

const raycasterObjects = [];
let currentIntersects = [];
let currentHoveredObject = null;

const socialLinks = {
  Github: "https://github.com/khiemszeto?tab=repositories",
  LinkedIn: "https://www.linkedin.com/in/kszt/",
  Screen: "https://health.khiemszeto.com/vitals",
};

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// Loaders
const textureLoader = new THREE.TextureLoader();

// Model Loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const loader = new GLTFLoader(manager);
loader.setDRACOLoader(dracoLoader);

// Cube Texture Loader
const environmentMap = new THREE.CubeTextureLoader()
  .setPath("textures/skybox/")
  .load(["px.webp", "nx.webp", "py.webp", "ny.webp", "pz.webp", "nz.webp"]);

const textureMap = {
  One: { day: "/textures/room/day/TS1.webp" },
  Two: { day: "/textures/room/day/TS2-4.webp" },
  Three: { day: "/textures/room/day/TS3.webp" },
  Four: { day: "/textures/room/day/TS4.webp" },
  Five: { day: "/textures/room/day/TS5-1.webp" },
  Six: { day: "/textures/room/day/TS6.webp" },
  Seven: { day: "/textures/room/day/TS7.webp" },
};

const loadedTexture = {
  day: {},
};

Object.entries(textureMap).forEach(([key, paths]) => {
  const dayTexture = textureLoader.load(paths.day);
  dayTexture.flipY = false;
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  loadedTexture.day[key] = dayTexture;
});

const glassMaterial = new THREE.MeshPhysicalMaterial({
  transmission: 1,
  opacity: 1,
  metalness: 0,
  roughness: 0,
  ior: 1.5,
  thickness: 0.01,
  specularIntensity: 1,
  envMapIntensity: 1,
  envMap: environmentMap,
});

const videoElement = document.createElement("video");
videoElement.src = "textures/video/Screen.mp4";
videoElement.loop = true;
videoElement.muted = true;
videoElement.playsInline = true;
videoElement.autoplay = true;
videoElement.play();

const videoTexture = new THREE.VideoTexture(videoElement);
videoTexture.colorSpace = THREE.SRGBColorSpace;
videoTexture.flipY = false;

window.addEventListener("mousemove", (e) => {
  touchHappened = false;
  pointer.x = (e.clientX / sizes.width) * 2 - 1;
  pointer.y = -(e.clientY / sizes.height) * 2 + 1;
});

window.addEventListener(
  "touchstart",
  (e) => {
    if (isModalOpen) return;
    e.preventDefault();
    pointer.x = (e.touches[0].clientX / sizes.width) * 2 - 1;
    pointer.y = -(e.touches[0].clientY / sizes.height) * 2 + 1;
  },
  { passive: false }
);

function handleRaycasterInteraction() {
  if (currentIntersects.length > 0) {
    const object = currentIntersects[0].object;

    Object.entries(socialLinks).forEach(([key, url]) => {
      if (object.name.includes(key)) {
        const newWindow = window.open();
        newWindow.opener = null;
        newWindow.location = url;
        newWindow.target = "_blank";
        newWindow.rel = "noopener noreferrer";
      }
    });

    if (object.name.includes("Work_Button")) {
      showModal(modals.work);
    } else if (object.name.includes("Contact_Button")) {
      showModal(modals.contact);
    } else if (object.name.includes("About_Button")) {
      showModal(modals.about);
    } else if (object.name.includes("Poliwhirl")) {
      showModal(modals.poli);
    }
  }
}

window.addEventListener(
  "touchend",
  (e) => {
    if (isModalOpen) return;
    e.preventDefault();
    handleRaycasterInteraction();
  },
  { passive: false }
);

window.addEventListener("click", handleRaycasterInteraction);

loader.load("/models/Room_Portfolio_V15.glb", (glb) => {
  glb.scene.traverse((child) => {
    if (child.isMesh) {
      if (child.name.includes("Chair_Top")) {
        items.Chair_Top = {
          mesh: child,
          initialRotation: child.rotation.clone(),
        };
      }

      if (child.name.includes("Coffee")) {
        items.Coffee_Cup = {
          mesh: child,
          hover: child.name.includes("Hover"),
          raycaster: child.name.includes("Raycaster"),
          hoverMode: "scaleOnly",
        };

        child.userData.initialScale = child.scale.clone();
      }

      if (child.name.includes("Headphone")) {
        items.Headphone = {
          mesh: child,
          hover: child.name.includes("Hover"),
          raycaster: child.name.includes("Raycaster"),
          hoverMode: "scaleOnly",
        };

        child.userData.initialScale = child.scale.clone();
      }

      if (child.name.includes("Poliwhirl")) {
        items.Poliwhirl = {
          mesh: child,
          hover: child.name.includes("Hover"),
          raycaster: child.name.includes("Raycaster"),
          hoverMode: "scaleOnly",
        };

        child.userData.initialScale = child.scale.clone();
      }

      if (child.name.includes("Micro")) {
        items.Micro = {
          mesh: child,
          hover: child.name.includes("Hover"),
          raycaster: child.name.includes("Raycaster"),
          hoverMode: "scaleOnly",
        };

        child.userData.initialScale = child.scale.clone();
      }

      if (child.name.includes("Photo")) {
        const key = child.name;
        items[key] = {
          mesh: child,
          hover: child.name.includes("Hover"),
          raycaster: child.name.includes("Raycaster"),
          hoverMode: "scaleOnly",
        };

        child.userData.initialScale = child.scale.clone();
      }

      if (child.name.includes("Pepper")) {
        const key = child.name;
        items[key] = {
          mesh: child,
          hover: child.name.includes("Hover"),
          raycaster: child.name.includes("Raycaster"),
          hoverMode: "scaleOnly",
        };

        child.userData.initialScale = child.scale.clone();
      }

      if (child.name.includes("Box")) {
        const key = child.name;
        items[key] = {
          mesh: child,
          hover: child.name.includes("Hover"),
          raycaster: child.name.includes("Raycaster"),
          hoverMode: "scaleOnly",
        };

        child.userData.initialScale = child.scale.clone();
      }

      if (child.name.includes("Raycaster")) {
        raycasterObjects.push(child);
      }

      if (child.name.includes("Hover")) {
        child.userData.initialScale = new THREE.Vector3().copy(child.scale);
        child.userData.initialPosition = new THREE.Vector3().copy(
          child.position
        );
        child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
      }

      if (child.name.includes("Plank_1")) {
        items.Plank_1 = {
          mesh: child,
        };
        child.scale.set(0, 0, 1);
      }

      if (child.name.includes("Plank_2")) {
        items.Plank_2 = {
          mesh: child,
        };
        child.scale.set(0, 0, 0);
      }

      if (child.name.includes("Work")) {
        items.Work = {
          mesh: child,
        };
        child.scale.set(0, 0, 0);
      }

      if (child.name.includes("About")) {
        items.About = {
          mesh: child,
        };
        child.scale.set(0, 0, 0);
      }

      if (child.name.includes("Contact")) {
        items.Contact = {
          mesh: child,
        };
        child.scale.set(0, 0, 0);
      }

      if (child.name.includes("Github")) {
        items.Github = {
          mesh: child,
        };
        child.scale.set(0, 0, 0);
      }

      if (child.name.includes("LinkedIn")) {
        items.LinkedIn = {
          mesh: child,
        };
        child.scale.set(0, 0, 0);
      }

      if (child.name.includes("Glass")) {
        child.material = glassMaterial;
      } else if (child.name.includes("Screen")) {
        child.material = new THREE.MeshBasicMaterial({
          map: videoTexture,
        });
      } else {
        Object.keys(textureMap).forEach((key) => {
          if (child.name.includes(key)) {
            const material = new THREE.MeshBasicMaterial({
              map: loadedTexture.day[key],
            });

            child.material = material;

            if (child.name.includes("Fan")) {
              zAxixFans.push(child);
            }

            if (child.material.map) {
              child.material.map.minFilter = THREE.LinearFilter;
            }
          }
        });
      }
    }
  });

  scene.add(glb.scene);
});

function playReveal() {
  const tl = gsap.timeline();

  tl.to(loadingScreen, {
    scale: 0.5,
    duration: 1.2,
    delay: 0.5,
    ease: "back.in(2)",
  }).to(
    loadingScreen,
    {
      y: "200vh",
      transform: "perspective(1000px) rotateX(45deg) rotateY(-35deg)",
      duration: 1.2,
      ease: "back.in(2)",
      onComplete: () => {
        isModalOpen = false;
        playIntroAnimation();
        loadingScreen.remove();
      },
    },
    "-0.1"
  );
}

function playIntroAnimation() {
  const timeline1 = gsap.timeline({
    defaults: {
      duration: 0.8,
      ease: "back.out(1.8)",
    },
  });
  timeline1.timeScale(0.8);

  const plank1 = items.Plank_1?.mesh;
  const plank2 = items.Plank_2?.mesh;
  const work = items.Work?.mesh;
  const about = items.About?.mesh;
  const contact = items.Contact?.mesh;

  timeline1
    .to(plank1.scale, { x: 1, y: 1 })
    .to(plank2.scale, { x: 1, y: 1, z: 1 }, "-=0.5")
    .to(work.scale, { x: 1, y: 1, z: 1 }, "-=0.55")
    .to(about.scale, { x: 1, y: 1, z: 1 }, "-=0.55")
    .to(contact.scale, { x: 1, y: 1, z: 1 }, "-=0.55");

  const timeline2 = gsap.timeline({
    defaults: {
      duration: 0.8,
      ease: "back.out(1.8)",
    },
  });
  timeline2.timeScale(0.8);

  const github = items.Github?.mesh;
  const linkedin = items.LinkedIn?.mesh;

  timeline2
    .to(github.scale, { x: 1, y: 1, z: 1, delay: 0.4 })
    .to(linkedin.scale, { x: 1, y: 1, z: 1 }, "-=0.5");
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 5;
controls.maxDistance = 30;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.minAzimuthAngle = 0;
controls.maxAzimuthAngle = Math.PI / 2;

controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();

if (window.innerWidth < 768) {
  camera.position.set(
    29.764266631399764,
    3.110040666860126,
    3.4198740268062964
  );
  controls.target.set(
    0.12955454558590865,
    1.1045767981948078,
    -0.7946193309291271
  );
} else {
  camera.position.set(
    15.013087608044822,
    8.219567956753812,
    12.040122376671192
  );
  controls.target.set(
    0.12955454558590865,
    1.1045767981948078,
    -0.7946193309291271
  );
}

// Event Listeners
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Upadate camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update Renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

function playHoverAnimation(object, isHovering, options = {}) {
  const { mode = "scaleAndRotate" } = options;
  const scaleFactor = 1.4;

  gsap.killTweensOf(object.scale);
  gsap.killTweensOf(object.rotation);
  gsap.killTweensOf(object.position);

  if (isHovering) {
    gsap.to(object.scale, {
      x: object.userData.initialScale.x * scaleFactor,
      y: object.userData.initialScale.y * scaleFactor,
      z: object.userData.initialScale.z * scaleFactor,
      duration: 0.5,
      ease: "back.out(2)",
    });

    if (mode !== "scaleOnly") {
      if (object.name.includes("About")) {
        gsap.to(object.rotation, {
          x: object.userData.initialRotation.x - Math.PI / 10,
          duration: 0.5,
          ease: "back.out(2)",
        });
      } else {
        gsap.to(object.rotation, {
          x: object.userData.initialRotation.x + Math.PI / 10,
          duration: 0.5,
          ease: "back.out(2)",
        });
      }
    }
  } else {
    gsap.to(object.scale, {
      x: object.userData.initialScale.x,
      y: object.userData.initialScale.y,
      z: object.userData.initialScale.z,
      duration: 0.3,
      ease: "back.out(2)",
    });

    if (mode !== "scaleOnly") {
      gsap.to(object.rotation, {
        x: object.userData.initialRotation.x,
        duration: 0.3,
        ease: "back.out(2)",
      });
    }
  }
}

function getHoverModeForObject(object) {
  const item = Object.values(items).find((entry) => entry?.mesh === object);
  return item?.hoverMode || "scaleAndRotate";
}
/**  -------------------------- Event Listeners -------------------------- */
const soundButton = document.querySelector(".sound-button");
const soundOffButton = document.querySelector(".sound-off-svg");
const soundOnButton = document.querySelector(".sound-on-svg");

const updateSoundState = (muted) => {
  if (muted) {
    backgroundMusic.volume(FADE_VOLUME);
  } else {
    backgroundMusic.volume(BACKGROUND_MUSIC_VOLUME);
  }
};

const handleMuteToggle = (e) => {
  e.preventDefault();

  isMuted = !isMuted;
  updateSoundState(isMuted);

  if (!backgroundMusic.playing()) {
    backgroundMusic.play();
  }

  gsap.to(soundButton, {
    rotate: -50,
    scale: 10,
    duration: 0.5,
    ease: "back.out(2)",
    onStart: () => {
      if (!isMuted) {
        soundOffButton.style.display = "none";
        soundOnButton.style.display = "block";
      } else {
        soundOffButton.style.display = "block";
        soundOnButton.style.display = "none";
      }

      gsap.to(soundButton, {
        rotate: 0,
        scale: 1,
        duration: 0.5,
        ease: "back.out(2)",
        onComplete: () => {
          gsap.set(soundButton, {
            clearProps: "all",
          });
        },
      });
    },
  });
};

let isMuted = false;
soundButton.addEventListener(
  "click",
  (e) => {
    if (touchHappened) return;
    handleMuteToggle(e);
  },
  { passive: false }
);

soundButton.addEventListener(
  "touchend",
  (e) => {
    touchHappened = true;
    handleMuteToggle(e);
  },
  { passive: false }
);

/**  -------------------------- Render and Animations Stuff -------------------------- */
const render = (timestamp) => {
  controls.update();

  //   console.log(camera.position);
  //   console.log("------");
  //   console.log(controls.target);

  // Animate Fans
  zAxixFans.forEach((fan) => {
    fan.rotation.z -= 0.06;
  });

  //Chair rotation animation
  const chair = items.Chair_Top;

  if (chair?.mesh) {
    const time = timestamp * 0.001;
    const baseAmplitude = Math.PI / 8;

    const rotationOffset =
      baseAmplitude *
      Math.sin(time * 0.5) *
      (1 - Math.abs(Math.sin(time * 0.5) * 0.3));

    chair.mesh.rotation.y = chair.initialRotation.y + rotationOffset;
  }

  // Raycaster
  if (!isModalOpen) {
    raycaster.setFromCamera(pointer, camera);

    currentIntersects = raycaster.intersectObjects(raycasterObjects);

    for (let i = 0; i < currentIntersects.length; i++) {
      // currentIntersects[i].object.material.color.set(0xff0000);
    }

    if (currentIntersects.length > 0) {
      const currentIntersectsObject = currentIntersects[0].object;

      if (currentIntersectsObject.name.includes("Hover")) {
        if (currentIntersectsObject !== currentHoveredObject) {
          if (currentHoveredObject) {
            const mode = getHoverModeForObject(currentHoveredObject);
            playHoverAnimation(currentHoveredObject, false, { mode });
          }

          const mode = getHoverModeForObject(currentIntersectsObject);
          playHoverAnimation(currentIntersectsObject, true, { mode });
          currentHoveredObject = currentIntersectsObject;
        }
      }

      if (currentIntersectsObject.name.includes("Pointer")) {
        document.body.style.cursor = "pointer";
      } else {
        document.body.style.cursor = "default";
      }
    } else {
      if (currentHoveredObject) {
        const mode = getHoverModeForObject(currentHoveredObject);
        playHoverAnimation(currentHoveredObject, false, { mode });
        currentHoveredObject = null;
      }
      document.body.style.cursor = "default";
    }
  }

  renderer.render(scene, camera);

  window.requestAnimationFrame(render);
};
render();
