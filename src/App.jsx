import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Gamepad2, Cog, Globe, Camera, X } from 'lucide-react';

import fragmentShader from './shaders/fragmentShader';
import vertexShader from './shaders/vertexShader';

const App = () => {
    const mountRef = useRef(null);
    const materialRef = useRef(null);
    const [aspectRatio, setAspectRatio] = useState(window.innerWidth / window.innerHeight);
    const [selectedItem, setSelectedItem] = useState(null);
    const [cameraPosition, setCameraPosition] = useState({ x: 0, y: -100 });
    const [currentFocus, setCurrentFocus] = useState('center');


    const menuItems = [
      { id: 'settings', icon: Cog, label: 'Settings', color: '#10B981', position: { x: -400, y: -100 } },
      { id: 'game', icon: Gamepad2, label: 'Game', color: '#EF4444', position: { x: -200, y: -100 } },
      { id: 'network', icon: Globe, label: 'Network', color: '#3B82F6', position: { x: 0, y: -100 } },
    ];

    useEffect(() => {
      const handleKeyPress = (event) => {

          const currentIndex = menuItems.findIndex(item => item.id === currentFocus);
          let newFocus = currentFocus;

          switch (event.key) {
              case 'ArrowLeft':
                  event.preventDefault();
                  newFocus = menuItems[Math.max(0, currentIndex - 1)]?.id || currentFocus;
                  break;
              case 'ArrowRight':
                  event.preventDefault();
                  newFocus = menuItems[Math.min(menuItems.length - 1, currentIndex + 1)]?.id || currentFocus;
                  break;
              case 'Enter':
                  event.preventDefault();
                  if (currentFocus) {
                      setSelectedItem(currentFocus);
                  }
                  break;
              case 'Escape':
                  event.preventDefault();
                  setSelectedItem(null);
                  setCurrentFocus('game');
                  setCameraPosition({ x: 0, y: -150 });
                  break;
              default:
                  return;
          }

          if (newFocus !== currentFocus) {
              setCurrentFocus(newFocus);
              const targetItem = menuItems.find(item => item.id === newFocus);
              if (targetItem) {
                  setCameraPosition(targetItem.position);
              }
          }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentFocus, menuItems]);

    const moveCameraTo = (position, focusId) => {
        setCameraPosition(position);
        setCurrentFocus(focusId);
    };

    const handleResize = useCallback(() => {
        if (mountRef.current) {
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;
            setAspectRatio(width / height);

            if (mountRef.current.renderer) {
                mountRef.current.renderer.setSize(width, height);
            }
            if (mountRef.current.camera) {
                mountRef.current.camera.updateProjectionMatrix();
            }
            if (materialRef.current) {
                materialRef.current.uniforms.uResolution.value.set(width, height);
            }
        }
    }, []);

    const handleItemClick = (itemId) => {
        setSelectedItem(itemId);
    };
    
    useEffect(() => {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
        camera.position.z = 1;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);
        mountRef.current.appendChild(renderer.domElement);

        mountRef.current.renderer = renderer;
        mountRef.current.camera = camera;
        mountRef.current.scene = scene;

        const uniforms = {
            uTime: { value: 0.0 },
            uResolution: { value: new THREE.Vector2(width, height) },
        };

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            wireframe: false,
        });
        materialRef.current = material;

        const geometry = new THREE.PlaneGeometry(width, height);
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        let startTime = Date.now();
        const animate = () => {
            const elapsedTime = (Date.now() - startTime) / 1000;
            uniforms.uTime.value = elapsedTime;

            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };

        animate();

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, [handleResize]);

    const SelectedIcon = selectedItem ? menuItems.find(item => item.id === selectedItem)?.icon : null;

    return (
        <div className="w-screen h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden font-mono">
            <div ref={mountRef} className="absolute inset-0 z-0" />

            <div className="relative z-10 w-full h-full flex flex-col">
                <div className="flex-1 relative overflow-hidden">
                    <div 
                        className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-out"
                        style={{
                            transform: `translateX(${-cameraPosition.x - 100}px) translateY(${cameraPosition.y}px)`
                        }}
                    >
                        {menuItems.map((item) => {
                            const IconComponent = item.icon;
                            const isSelected = selectedItem === item.id;
                            const isFocused = currentFocus === item.id;
                            
                            return (
                                <div
                                    key={item.id}
                                    className={`absolute flex flex-col items-center gap-4 p-6 cursor-pointer transition-all duration-300`}
                                    style={{
                                        left: '50%',
                                        top: '50%',
                                        transform: `translate(${item.position.x}px, ${item.position.y}px)`,
                                    }}
                                    onClick={() => handleItemClick(item.id)}
                                    onMouseEnter={() => moveCameraTo(item.position, item.id)}
                                >
                                    <IconComponent 
                                        className='drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]'
                                        color='#e6e6e6'
                                        size={100}
                                    />
                                    <span className={`text-white font-semibold transition-all duration-300 ${
                                        isSelected ? 'text-xl' : isFocused ? 'text-lg' : 'text-base'
                                    }`}>
                                        {item.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;