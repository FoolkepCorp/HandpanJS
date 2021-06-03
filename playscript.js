import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import { scene } from './basescript.js';
import { resizer } from './basescript.js';
import { oc } from './basescript.js';
import { multObject } from './basescript.js';

window.addEventListener('load', (e) => {
	const camera = oc.object;
	let playing = false;
	let booming = true;
	let boomingStart = true;
	let boomingToStart = true;
	let sps = [
	];
	const spa = (p, aurl) => {
		sps.push({ position: p, audio: new Audio(aurl) });
	};
	const urlPre = "https://uploads-ssl.webflow.com/602fc612249a10289b6c308f/60b8f7";
	spa(new THREE.Vector3(0.46839160142346165, 0.3210501015753653, -0.943542862191673), urlPre + "78546966470a1583ef_3Bb3.wav.txt");
	spa(new THREE.Vector3(1.0648352067065256, 0.3093496567682091, -0.28039374409832074), urlPre + "7e181da222d8e6e103_5D4.wav.txt");
	spa(new THREE.Vector3(0.9799806916090156, 0.3234396005593411, 0.5264019570495777), urlPre + "848e70e019c0e4a595_7F4.wav.txt");
	spa(new THREE.Vector3(0.42834636988143715, 0.31876788868257094, 1.0411174566221817), urlPre + "8b7363836f148a56f9_9A4.wav.txt");
	spa(new THREE.Vector3(-0.3735919695991856, 0.3153361366415895, 1.0567691899422063), urlPre + "878e70e01c8ee4a596_8G4.wav.txt");
	spa(new THREE.Vector3(-0.9428113074249818, 0.3301404680616434, 0.5330125346436138), urlPre + "8192d47ef785d03626_6E4.wav.txt");
	spa(new THREE.Vector3(-1.0076734858618681, 0.33981495357430896, -0.2760390068513782), urlPre + "7cdf1741cbdb894e96_4C4.wav.txt");
	spa(new THREE.Vector3(-0.431854656310732, 0.3356692403969072, -0.9148133909645234), urlPre + "75b460682f5b572947_2A3.wav.txt");
	spa(new THREE.Vector3(0, 0.8234941085464847, 0), urlPre + "70b418ce1a6418d602_1D3.wav.txt");

	const canvas = document.querySelector('#webglBox');
	var scrollY = window.scrollY;
	multObject.mult = 1;
	multObject.multTarget = 1;
	multObject.timeElapsed = 0;

	const onScrollEvent = (e) => {
		scrollY = window.scrollY;
		if (scrollY > canvas.offsetHeight) {
			multObject.render = false;
		} else {
			multObject.render = true;
		}
	};
	window.addEventListener("scroll", onScrollEvent, { passive: true });
	onScrollEvent();

	const raycaster = new THREE.Raycaster();
	const mouse = new THREE.Vector2();
	function onMouseMove(event) {
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
	}
	window.addEventListener('mousemove', onMouseMove, false);

	const maxDist = 0.45;
	const gcsp = (point) => {
		const x = point.x;
		const y = point.y;
		const z = point.z;
		let closestIndex = -1;
		let closestDist = 100;
		sps.forEach((soundPoint, index) => {
			const x2 = soundPoint.position.x;
			const y2 = soundPoint.position.y;
			const z2 = soundPoint.position.z;
			const dX = x2 - x;
			const dY = y2 - y;
			const dZ = z2 - z;
			const dist = Math.sqrt(dX * dX + dY * dY + dZ * dZ);
			if (dist < maxDist && dist < closestDist) {
				closestIndex = index;
				closestDist = dist;
			}
		});
		if (closestIndex == -1) {
			return false;
		} else {
			return sps[closestIndex];
		}
	};

	let sprites = [];
	const map = new THREE.TextureLoader().load("./circle.png");
	const body = document.querySelector('body');
	const cl = {
		enabled: false,
		toStart: true,
		fromPos: null,
		toPos: null,
		fromZ: null,
		toZ: null,
		radius: 0,
		lerpValue: 0,
		lerpSpeed: 0.01,
		justStarted: true
	};
	window.addEventListener("mousedown", (e) => {
		const buttonDOM = e.target;
		if (buttonDOM.id == "boomBtn") {
			booming = buttonDOM.classList.contains("booming");
			if (!booming) {
				buttonDOM.classList.add("booming");
				booming = true;
				boomingStart = true;
				boomingToStart = false;
			}
		}
		if (buttonDOM.id == "playBtn") {
			buttonDOM.classList.toggle("playing");
			playing = buttonDOM.classList.contains("playing");
			if (playing) {
				buttonDOM.innerHTML = "Játék vége";
				body.style.overflow = "hidden";
				window.scrollTo(0, 0);
				onScrollEvent();
			} else {
				buttonDOM.innerHTML = "Játék";
				body.style.overflow = "initial";
			}
			resizer();
			if (typeof oc !== 'undefined') {
				cl.toStart = playing;
				cl.justStarted = true;
				cl.enabled = true;
			}
		} else {
			if (!cl.enabled && cl.toStart) {
				if (typeof oc !== 'undefined') {
					raycaster.setFromCamera(mouse, camera);
					const intersects = raycaster.intersectObjects(scene.children);
					let intersect = false;
					for (let i = 0; i < intersects.length; i++) {
						const object = intersects[i].object;
						if (object instanceof THREE.Mesh) {
							intersect = intersects[i];
							break;
						}
					}
					if (intersect) {
						const point = intersect.point;
						const soundPoint = gcsp(point);
						if (soundPoint) {
							const pos = soundPoint.position;
							createCircle(pos.clone(), true);
							soundPoint.audio.cloneNode(true).play();
						}
					}
				}
			}
		}
	});
	const maxScale = 1;
	const starter = 0.01;
	const maxStep = 12;
	const scaleMultiplierSpeed = Math.pow(maxScale / starter, 1 / maxStep);
	const maxCloneTimes = 2;
	const maxAplha = 0.3;
	const renderLoop = () => {
		if (cl.enabled) {
			oc.autoRotate = false;
			oc.enabled = false;
			oc.enableUpdate = false;
			const camera = oc.object;
			const camPos = camera.position;
			if (cl.justStarted) {
				cl.justStarted = false;
				cl.fromPos = new THREE.Vector3(camPos.x, camPos.y, camPos.z);
				cl.radius = camera.position.distanceTo(oc.target);
				cl.lerpValue = 0;
				if (cl.toStart) {
					cl.toPos = new THREE.Vector3(0.01, cl.radius, 0.01);
					cl.toZ = new THREE.Vector3(0, 0, Math.PI);
				} else {
					cl.toPos = camera.defaultPos;
					cl.toZ = new THREE.Vector3(0, 0, 0);
				}
				if (camera.rotation.z < (cl.toZ.z - Math.PI)) {
					camera.rotation.z += Math.PI * 2;
				} else if ((cl.toZ.z + Math.PI) < camera.rotation.z) {
					camera.rotation.z -= Math.PI * 2;
				}
				cl.fromZ = new THREE.Vector3(0, 0, camera.rotation.z);
			}
			cl.lerpValue += cl.lerpSpeed;
			if (cl.lerpValue > 1) {
				cl.enabled = false;
				cl.lerpValue = 1;
			}
			let ncp = new THREE.Vector3(0, 0, 0);
			ncp.add(cl.fromPos);
			ncp.lerp(cl.toPos, cl.lerpValue);
			const x = ncp.x;
			const y = ncp.y;
			const z = ncp.z;
			const normalizationFactor = 1 / Math.sqrt(x * x + y * y + z * z);
			ncp.multiplyScalar(normalizationFactor);
			ncp.multiplyScalar(cl.radius);
			camera.position.set(ncp.x, ncp.y, ncp.z);
			camera.lookAt(0, 0, 0);
			let nextZ = new THREE.Vector3(0, 0, 0);
			nextZ.add(cl.fromZ);
			nextZ.lerp(cl.toZ, cl.lerpValue);
			nextZ = nextZ.z;
			camera.rotation.z = nextZ;
			if (!cl.enabled && !cl.toStart) {
				oc.autoRotate = true;
				oc.enabled = true;
				oc.enableUpdate = true;
			}
		}
		sprites.forEach((sprite, index, object) => {
			if (!sprite.parent) {
				object.splice(index, 1);
				return;
			}
			const newScale = sprite.scale.x * scaleMultiplierSpeed;
			if (newScale < maxScale) {
				sprite.scale.set(newScale, newScale, 1);
				const currentStep = getBaseLog(newScale / starter, scaleMultiplierSpeed);
				sprite.material.opacity = (maxAplha - (currentStep / maxStep) * maxAplha);
				if (sprite.cloneable) {
					if (sprite.clonedTimes >= maxCloneTimes) {
						sprite.cloneable = false;
					} else {
						const newCloneNum = sprite.clonedTimes + 1;
						const limitStep = Math.floor(maxStep * newCloneNum / (maxCloneTimes + 1));
						const steppedLimit = starter * Math.pow(scaleMultiplierSpeed, limitStep);
						if (steppedLimit <= newScale) {
							sprite.clonedTimes += 1;
							createCircle(sprite.position, false);
						}
					}
				}
			} else {
				sprite.parent.remove(sprite);
			}
		});
		if (boomingStart) {
			boomingStart = false;
			if (boomingToStart) {
				multObject.multTarget = 0;
			} else {
				multObject.multTarget = 1;
			}
			multObject.lastMult = multObject.mult;
			multObject.timeElapsed = 0;
		}
		const reachTime = 5;
		const delay = 1; 
		if (booming) {
			const te = multObject.timeElapsed;
			let funcTe = te;
			if (reachTime <= funcTe) {
				funcTe = reachTime;
			}
			if (te >= reachTime + delay) {
				if (boomingToStart) {
					document.querySelector("#boomBtn").classList.remove("booming");
					booming = false;
				} else {
					boomingToStart = true;
					boomingStart = true;
				}
			} else {
				let momult;
				if (boomingToStart) {
					momult = 1 - Math.sin(funcTe / reachTime * Math.PI / 2);
				} else {
					momult = Math.sin(funcTe / reachTime * Math.PI / 2);
				}
				multObject.mult = momult;
				console.log(momult);
				multObject.multTarget = multObject.mult;
				multObject.lastMult = multObject.mult;
			}
		}
		requestAnimationFrame(renderLoop);
	};
	renderLoop();

	const towardCamera = 0.2;
	const createCircle = (pos, cloneable) => {
		const material = new THREE.SpriteMaterial({ map: map, color: 0xffffff });
		const sprite = new THREE.Sprite(material);
		if (cloneable) {
			pos.lerp(camera.position, towardCamera);
		}
		sprite.position.set(pos.x, pos.y, pos.z);
		sprite.scale.set(starter, starter, 1);
		sprite.cloneable = cloneable;
		if (sprite.cloneable) {
			sprite.clonedTimes = 0;
		}
		sprite.material.opacity = 0;
		scene.add(sprite);
		sprites.push(sprite);
	};

	const getBaseLog = (y, x) => {
		return Math.log(y) / Math.log(x);
	}
});