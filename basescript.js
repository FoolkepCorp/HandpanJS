import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js';

import { GLTFLoader } from 'https://unpkg.com/three@0.127.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://unpkg.com/three@0.127.0/examples/jsm/loaders/DRACOLoader.js';

const sizes = {
	width: document.body.clientWidth,
	height: window.innerHeight
};
const canvas = document.querySelector('canvas.webgl');
canvas.onselectstart = function () { return false; }
const scene = new THREE.Scene();
export { scene };
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100 * Math.PI);
const camDistance = 5;
const calcCamDist = Math.pow(camDistance * 2, 1 / 2);
const camDefPos = new THREE.Vector3(0, calcCamDist, calcCamDist);
camera.defaultPos = camDefPos;
camera.position.set(camDefPos.x, camDefPos.y, camDefPos.z);
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	antialias: true
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
window.addEventListener('resize', () => {
	resizer();
});

const resizer = () => {
	sizes.width = document.body.clientWidth;
	sizes.height = window.innerHeight;

	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.render(scene, camera);
};
export { resizer };

let mArr = [];
const urlPre = 'https://uploads-ssl.webflow.com/607af14d182808ee2010908d/607af3ec';
const sb = () => {
	addTomArr(urlPre + '19c3537b350a160a_corona_ft.png');
	addTomArr(urlPre + '966520080079dcee_corona_bk.png');
	addTomArr(urlPre + '3e0393613c89b568_corona_up.png');
	addTomArr(urlPre + '11006f647a13806f_corona_dn.png');
	addTomArr(urlPre + '88d1c85b5e872e07_corona_rt.png');
	addTomArr(urlPre + '47737edc317881a8_corona_lf.png');
	for (let i = 0; i < 6; i++) {
		mArr[i].side = THREE.BackSide;
		let sbg = new THREE.BoxGeometry(100, 100, 100);
		let sb = new THREE.Mesh(sbg, mArr);
		scene.add(sb);
	}
};
const addTomArr = (url) => {
	const t = new THREE.TextureLoader().load(url, sbrs);
	mArr.push(new THREE.MeshBasicMaterial({ map: t }));
};
let rc = 0;
const sbrs = () => {
	rc += 1;
	if (rc == 6) {
		addLights();
		addModel();
	}
};

let modelScene;
let defaultModelMesh;
let modelMesh;
const addModel = () => {
	const gltfLoader = new GLTFLoader();
	const dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath('/draco/');
	gltfLoader.setDRACOLoader(dracoLoader);
	gltfLoader.load('./handpan2.gltf', modelReady);
};

const modS = 0.01;
const modelReady = (gltf) => {
	modelScene = gltf.scene;
	modelScene.traverse(function (child) {
		if (child instanceof THREE.Mesh) {
			child.geometry.scale(modS, modS, modS);
			const newGeometry = child.geometry.clone().toNonIndexed();
			const attr = newGeometry.attributes;
			attr.normal.needsUpdate = true;
			attr.position.needsUpdate = true;
			child.geometry = newGeometry;
			const cloneChild = child.clone(true);
			modelMesh = child;
			cloneChild.geometry = child.geometry.clone();
			defaultModelMesh = cloneChild;
			const ms = child;
			const msm = ms.material;
			msm.wireframe = false;
			msm.side = THREE.DoubleSide;
			msm.roughness = 0.6;
			msm.metalness = 1;
			msm.reflectivity = 1;
			msm.color = new THREE.Color(0xaaaaaa);
			msm.flatShading = false;
			scene.add(ms);
		}
	});
};

const lights = [];

const addLights = () => {
	const createDirLight = (color, y, radius, degree, strength = 0.5) => {
		const wideAngle = 180;
		const x = Math.sin(degree * Math.PI / 180) * radius;
		const z = Math.cos(degree * Math.PI / 180) * radius;
		const light = new THREE.SpotLight(color, strength, 100, wideAngle * Math.PI / 180, 1);
		light.castShadow = true;
		light.shadow.mapSize.set(1024, 1024);
		light.shadow.camera.far = 15;
		light.shadow.camera.left = - 7;
		light.shadow.camera.top = 7;
		light.shadow.camera.right = 7;
		light.shadow.camera.bottom = - 7;
		light.position.set(x, y, z);
		light.lookAt(0, 0, 0);
		lights[lights.length] = { light, radius, degree };
		return light;
	};
	scene.add(new THREE.AmbientLight(0xffffff, 10));
	scene.add(createDirLight(0xffffff, 5, 1, 0, 1));
	scene.add(createDirLight(0x660033, 6, 10, 0));
	scene.add(createDirLight(0x333366, 6, 10, 90));
	scene.add(createDirLight(0x660066, 6, 10, 180));
	scene.add(createDirLight(0x000066, 6, 10, 270));

	scene.add(createDirLight(0xffffff, -5, 1, 0, 1));
	scene.add(createDirLight(0x660033, -6, 10, 135));
	scene.add(createDirLight(0x333366, -6, 10, 225));
	scene.add(createDirLight(0x660066, -6, 10, 315));
	scene.add(createDirLight(0x000066, -6, 10, 45));
};

let rotateCam = true;
let oc;
export { oc };
const controls = () => {
	oc = new OrbitControls(camera, canvas);
	oc.target.set(0, 0, 0);
	oc.minDistance = 1;
	oc.maxDistance = 100;
	oc.enableDamping = true;
	oc.enablePan = false;
	oc.enableZoom = false;
	oc.enableUpdate = true; //Custom key
	if (rotateCam) {
		oc.autoRotate = true;
		oc.autoRotateSpeed = 1.0;
	}
};
const clock = new THREE.Clock();

const meshExplode = true;
const meshExplMult = 2*100;
const meshExplVectorRNG = 0.2;
const lightMove = false;
let triangleMults = [];
let triangleVectors = [];

const multObject = {
	mult: 0,
	lastMult: 0,
	multTarget: 1,
	timeElapsed: 0,
	render: false
};
export { multObject };
const multTargetReachRate = 3;
let lastElapsedTime = 0;
let meshTargetReachedTime = -1;
let isRendering = false;
const renderLoop = () => {
	let elapsedTime = clock.getElapsedTime();
	let deltaTime = elapsedTime - lastElapsedTime;
	lastElapsedTime = elapsedTime;
	deltaTime = deltaTime * multTargetReachRate;
	multObject.timeElapsed += deltaTime;
	let funcTe = multObject.timeElapsed;
	if (funcTe > 1) {
		funcTe = 1;
	}
	if (Math.abs(multObject.mult - multObject.multTarget) < 0.01) {
		multObject.mult = multObject.multTarget;
		multObject.lastMult = multObject.multTarget;
		meshTargetReachedTime = elapsedTime;
	} else {
		multObject.mult = (1 - funcTe) * multObject.lastMult + funcTe * multObject.multTarget;
	}
	const addDegree = elapsedTime * 30;
	if (lightMove) {
		lights.forEach(light => {
			const degree = light.degree;
			const radius = light.radius;
			const x = Math.sin((degree + addDegree) * Math.PI / 180) * radius;
			const z = Math.cos((degree + addDegree) * Math.PI / 180) * radius;
			light.light.position.x = x;
			light.light.position.z = z;
			light.light.lookAt(0, 0, 0);

		});
	}
	if (meshExplode && (typeof modelMesh !== 'undefined')) {
		let letCalculate;
		if (multObject.mult != multObject.multTarget) {
			letCalculate = true;
		} else {
			if (meshTargetReachedTime == elapsedTime) {
				letCalculate = true;
			} else {
				letCalculate = false;
			}
		}
		if (letCalculate) {
			modelMesh.geometry.attributes.position.needsUpdate = true;
			modelMesh.updateWorldMatrix(true, true);
			const posArr = modelMesh.geometry.attributes.position.array;
			const defMesh = defaultModelMesh;
			const defPosArr = defMesh.geometry.attributes.position.array;
			for (let i = 0; i < posArr.length; i = i + 9) {
				const triangleCounter = i / 9;
				if (typeof triangleMults[triangleCounter] === 'undefined') {
					triangleMults[triangleCounter] = Math.random() * 2 + 0.1;
				}
				const triangleMult = triangleMults[triangleCounter];
				const points = [];
				for (let pc = 1; pc < 9; pc++) {
					pc -= 1;
					points.push(new THREE.Vector3(defPosArr[i + pc++], defPosArr[i + pc++], defPosArr[i + pc++]));
				}
				if (typeof triangleVectors[triangleCounter] === 'undefined') {
					let center = new THREE.Vector3(0, 0, 0);
					points.forEach(point => {
						center.add(point);
					});
					center.divideScalar(3);
					let vector = center.clone();
					vector.normalize();
					const randomX = (Math.random() * 2 - 1) * meshExplVectorRNG;
					const randomY = (Math.random() * 2 - 1) * meshExplVectorRNG;
					const randomZ = (Math.random() * 2 - 1) * meshExplVectorRNG;
					vector.add(new THREE.Vector3(randomX, randomY, randomZ));
					triangleVectors[triangleCounter] = vector;
				}
				const vectorMult = triangleVectors[triangleCounter].clone().multiplyScalar(multObject.mult * meshExplMult * triangleMult);
				points.forEach(point => {
					point.add(vectorMult);
				});
				let pc = 0;
				points.forEach(point => {
					posArr[i + pc++] = point.x;
					posArr[i + pc++] = point.y;
					posArr[i + pc++] = point.z;
				});
			}

			modelMesh.geometry.computeBoundingBox();
			modelMesh.geometry.computeBoundingSphere();
		}
	}

	renderer.render(scene, camera);
	if (oc.enableUpdate) {
		oc.update();
	}
	if (isRendering) {
		requestAnimationFrame(renderLoop);
	}
};

const mainLoop = () => {
	if (!isRendering && multObject.render) {
		isRendering = true;
		renderLoop();
	}
	if (!multObject.render) {
		isRendering = false;
	}
	requestAnimationFrame(mainLoop);
};

resizer();
controls();
sb();
mainLoop();