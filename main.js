import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(4, 4, 5);

// Set the background color of the scene to a specific color
scene.background = new THREE.Color(0x000000); // Black color

// Adds a picture as background
const textureLoader = new THREE.TextureLoader();
const backgroundTexture = textureLoader.load('night2.jpg');
scene.background = backgroundTexture;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = true;
controls.minDistance = 5;
controls.maxDistance = 70;
controls.minPolarAngle = 0.5;
controls.maxPolarAngle = 1.5;
controls.autoRotate = true;
controls.target = new THREE.Vector3(0, 1, 0);
controls.update();

// Lights
const spotLight1 = new THREE.SpotLight(0xff0090, 1000, 100, Math.PI / 10, 1);
spotLight1.position.set(5, 15, -10);
spotLight1.castShadow = true;
spotLight1.shadow.bias = -0.0011;

const spotLight2 = new THREE.SpotLight(0xffe76f, 1500, 100, Math.PI / 6, 1);
spotLight2.position.set(5, 15, -10);
spotLight2.castShadow = true;
spotLight2.shadow.bias = -0.0011;
//scene.add(spotLight2);

const spotLight3 = new THREE.SpotLight(0x002fff, 5500, 100, Math.PI / 6, 1);
spotLight3.position.set(-30, 5, 30);
spotLight3.position.set(10, 35, -10);

spotLight3.castShadow = true;
spotLight3.shadow.bias = -0.0001;
scene.add(spotLight3);

// Post-processing setup
const composer = new EffectComposer(renderer);
const renderScene = new RenderPass(scene, camera);
composer.addPass(renderScene);

// Bloom pass
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  4.5,  // strength
  0.4,  // radius
  0.85  // threshold
);
composer.addPass(bloomPass);

// Bokeh pass
const bokehPass = new BokehPass(scene, camera, {
  focus: 1.0,
  aperture: 0.00025,
  maxblur: 0.01,
  width: window.innerWidth,
  height: window.innerHeight,
});
//composer.addPass(bokehPass);

// Load Millennium Falcon model
const loader = new GLTFLoader().setPath('public/millennium_falcon/');
loader.load(
  'scene.gltf',
  (gltf) => {
    console.log('loading model');
    const mesh = gltf.scene;

    mesh.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.layers.enable(1);  // Enable bloom layer for this mesh
      }
    });

    mesh.scale.set(0.01, 0.01, 0.01);
    mesh.position.set(0, 1.05, -1);
    scene.add(mesh);

    document.getElementById('progress-container').style.display = 'none';
  },
  (xhr) => {
    console.log(`loading ${xhr.loaded / xhr.total * 100}%`);
  },
  (error) => {
    console.error(error);
  }
);

// Townhall model loading function
function spawnTownhall() {
  const loader2 = new GLTFLoader().setPath('public/townhall/');
  loader2.load(
    'scene.gltf',
    (gltf) => {
      console.log('loading townhall model');
      const townhallMesh = gltf.scene;

      townhallMesh.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      townhallMesh.scale.set(10.8, 10.8, 10.8);
      townhallMesh.position.set(-15, -12, 10);
      scene.add(townhallMesh);
    },
    (xhr) => {
      console.log(`loading ${xhr.loaded / xhr.total * 100}%`);
    },
    (error) => {
      console.error(error);
    }
  );
}

// Event listeners
document.getElementById('toggleSpotlight1').addEventListener('click', function() {
  if (scene.children.includes(spotLight1)) {
    scene.remove(spotLight1);
  } else {
    scene.add(spotLight1);
  }
});

document.getElementById('toggleSpotlight2').addEventListener('click', function() {
  if (scene.children.includes(spotLight2)) {
    scene.remove(spotLight2);
  } else {
    scene.add(spotLight2);
  }
});

document.getElementById('toggleSpotlight3').addEventListener('click', function() {
  if (scene.children.includes(spotLight3)) {
    scene.remove(spotLight3);
  } else {
    scene.add(spotLight3);
  }
});

document.getElementById('toggleSpotlight4').addEventListener('click', function() {
  const isBokehPassPresent = composer.passes.includes(bokehPass);
  
  if (isBokehPassPresent) {
    composer.removePass(bokehPass);  // Remove the bokeh effect
  } else {
    composer.addPass(bokehPass);  // Add the bokeh effect back
  }
});

// Add a button to toggle autoRotate (assuming you have an HTML button with id 'toggleAutoRotate')
document.getElementById('toggleAutoRotate').addEventListener('click', function() {
  controls.autoRotate = !controls.autoRotate; // Toggle the autoRotate value
});

// Add a button to toggle bloom (assuming you have an HTML button with id 'toggleBloom')
document.getElementById('toggleBloom').addEventListener('click', function() {
  if (composer.passes.includes(bloomPass)) {
    composer.removePass(bloomPass); // Remove the bloomPass if it's already added
  } else {
    composer.addPass(bloomPass); // Add the bloomPass if it's not in the composer
  }
});



document.getElementById('settingsButton').addEventListener('click', function() {
  const dropdownMenu = document.getElementById('dropdownMenu');
  dropdownMenu.classList.toggle('show');
});

let townhallMesh; // Declare townhallMesh in the global scope

document.getElementById('spawnTownhallButton').addEventListener('click', function() {
  if (townhallMesh && scene.children.includes(townhallMesh)) {
    // If the townhall model is already in the scene, remove it
    scene.remove(townhallMesh);
    townhallMesh = null; // Reset townhallMesh to allow it to be added again
  } else {
    // If the townhall model is not in the scene, load and add it
    const loader2 = new GLTFLoader().setPath('public/townhall/');
    loader2.load(
      'scene.gltf',
      (gltf) => {
        console.log('loading townhall model');
        townhallMesh = gltf.scene;

        townhallMesh.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Adjust position, scale, and rotation of the townhall model as needed
        townhallMesh.scale.set(10.8, 10.8, 10.8);
        townhallMesh.position.set(-15, -12, 10);   // Set the position in the scene
        scene.add(townhallMesh); // Add the townhall model to the scene
      },
      (xhr) => {
        console.log(`loading ${xhr.loaded / xhr.total * 100}%`);
      },
      (error) => {
        console.error(error);
      }
    );
  }
});

window.onclick = function(event) {
  if (!event.target.matches('#settingsButton')) {
    const dropdowns = document.getElementsByClassName('dropdown-content');
    for (let i = 0; i < dropdowns.length; i++) {
      const openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
};

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  bloomPass.setSize(window.innerWidth, window.innerHeight);
  bokehPass.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  composer.render();
}

animate();