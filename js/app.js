// 高数可视化探索器 - 主应用程序

// 全局变量
let scene, camera, renderer, controls;
let currentMesh = null;
let isRendering = false;
let axesHelper, gridHelper;
let renderStartTime;

// 初始化函数
function init() {
    // 设置事件监听器
    document.getElementById('render-btn').addEventListener('click', function() {
        // 添加加载动画
        this.classList.add('loading');
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 渲染中...';

        // 延迟一点执行渲染，让UI有时间更新
        setTimeout(() => {
            renderFunction();

            // 渲染完成后恢复按钮状态
            this.classList.remove('loading');
            this.innerHTML = '<i class="fas fa-play"></i> 渲染函数';
        }, 100);
    });

    // 为示例按钮添加事件监听器
    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // 高亮选中的示例按钮
            document.querySelectorAll('.example-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const func = this.getAttribute('data-func');
            const dim = this.getAttribute('data-dim');

            document.getElementById('function-input').value = func;
            document.getElementById('dimension-select').value = dim;

            // 添加加载动画到渲染按钮
            const renderBtn = document.getElementById('render-btn');
            renderBtn.classList.add('loading');
            renderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 渲染中...';

            // 延迟一点执行渲染，让UI有时间更新
            setTimeout(() => {
                renderFunction();

                // 渲染完成后恢复按钮状态
                renderBtn.classList.remove('loading');
                renderBtn.innerHTML = '<i class="fas fa-play"></i> 渲染函数';
            }, 100);
        });
    });

    // 为函数输入框添加键盘事件
    document.getElementById('function-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('render-btn').click();
        }
    });

    // 初始化Three.js场景
    initThreeJS();

    // 默认渲染一个示例函数
    document.getElementById('function-input').value = 'sin(x) * cos(y)';
    renderFunction();

    // 高亮默认选中的示例按钮
    document.querySelector('.example-btn[data-func="sin(x) * cos(y)"]').classList.add('active');
}

// 初始化Three.js场景
function initThreeJS() {
    const container = document.getElementById('canvas-container');

    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);

    // 添加雾效果，增强深度感
    scene.fog = new THREE.Fog(0xf8f9fa, 15, 50);

    // 创建相机
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    camera.position.set(0, 0, 20);

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio); // 提高渲染质量
    renderer.shadowMap.enabled = true; // 启用阴影
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 软阴影
    container.appendChild(renderer.domElement);

    // 添加轨道控制器
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.2;
    controls.autoRotate = false; // 可以设置为true让场景自动旋转
    controls.autoRotateSpeed = 0.5;

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true; // 启用阴影投射
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    // 添加第二个方向光源，增强光照效果
    const secondaryLight = new THREE.DirectionalLight(0x4cc9f0, 0.3);
    secondaryLight.position.set(-5, 5, -5);
    scene.add(secondaryLight);

    // 添加坐标轴辅助
    axesHelper = new THREE.AxesHelper(10);
    axesHelper.material.transparent = true;
    axesHelper.material.opacity = 0.7;
    scene.add(axesHelper);

    // 添加网格辅助
    gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0xcccccc);
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.2;
    scene.add(gridHelper);

    // 添加环境光球，增强视觉效果
    const sphereGeometry = new THREE.SphereGeometry(30, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.05
    });
    const environmentSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(environmentSphere);

    // 处理窗口大小变化
    window.addEventListener('resize', onWindowResize);

    // 开始动画循环
    animate();

    // 添加初始化动画效果
    camera.position.set(30, 30, 30);
    const initialAnimation = new TWEEN.Tween(camera.position)
        .to({ x: 10, y: 10, z: 10 }, 1500)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();
}

// 窗口大小变化处理函数
function onWindowResize() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);

    // 更新控制器
    controls.update();

    // 更新补间动画
    if (typeof TWEEN !== 'undefined') {
        TWEEN.update();
    }

    // 渲染场景
    renderer.render(scene, camera);
}

// 渲染函数表达式
function renderFunction() {
    const functionInput = document.getElementById('function-input').value.trim();
    const dimensionSelect = document.getElementById('dimension-select').value;

    if (!functionInput) {
        showNotification('请输入函数表达式', 'warning');
        return;
    }

    // 记录渲染开始时间
    renderStartTime = performance.now();
    isRendering = true;

    // 显示加载指示器
    showLoadingIndicator(true);

    try {
        // 移除之前的网格
        if (currentMesh) {
            // 添加消失动画
            const fadeOut = new TWEEN.Tween(currentMesh.material)
                .to({ opacity: 0 }, 300)
                .onComplete(() => {
                    scene.remove(currentMesh);
                    currentMesh = null;

                    // 根据维度选择渲染2D或3D函数
                    if (dimensionSelect === '3d') {
                        render3DFunction(functionInput);
                    } else {
                        render2DFunction(functionInput);
                    }
                })
                .start();

            // 如果材质不支持透明，直接移除并渲染
            if (!currentMesh.material.transparent) {
                scene.remove(currentMesh);
                currentMesh = null;

                // 根据维度选择渲染2D或3D函数
                if (dimensionSelect === '3d') {
                    render3DFunction(functionInput);
                } else {
                    render2DFunction(functionInput);
                }
            }
        } else {
            // 根据维度选择渲染2D或3D函数
            if (dimensionSelect === '3d') {
                render3DFunction(functionInput);
            } else {
                render2DFunction(functionInput);
            }
        }

    } catch (error) {
        console.error('渲染函数时出错:', error);
        showNotification('函数表达式解析错误，请检查语法', 'error');
        showLoadingIndicator(false);
        isRendering = false;
    }
}

// 显示通知消息
function showNotification(message, type = 'info') {
    // 检查是否已存在通知元素
    let notification = document.querySelector('.notification');

    if (!notification) {
        // 创建通知元素
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }

    // 设置通知类型和内容
    notification.className = `notification ${type}`;

    // 设置图标
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    if (type === 'error') icon = 'times-circle';

    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;

    // 显示通知
    notification.style.display = 'flex';

    // 添加动画类
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // 自动隐藏通知
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.style.display = 'none';
        }, 300);
    }, 3000);
}

// 显示/隐藏加载指示器
function showLoadingIndicator(show) {
    // 检查是否已存在加载指示器
    let loadingIndicator = document.querySelector('.loading-indicator');

    if (!loadingIndicator && show) {
        // 创建加载指示器
        loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerHTML = `
            <div class="spinner"></div>
            <div class="loading-text">渲染中...</div>
        `;

        // 添加到可视化区域
        document.querySelector('.visualization').appendChild(loadingIndicator);

        // 显示加载指示器
        setTimeout(() => {
            loadingIndicator.classList.add('show');
        }, 10);
    } else if (loadingIndicator && !show) {
        // 隐藏加载指示器
        loadingIndicator.classList.remove('show');
        setTimeout(() => {
            if (loadingIndicator.parentNode) {
                loadingIndicator.parentNode.removeChild(loadingIndicator);
            }
        }, 300);
    }
}

// 渲染3D函数
function render3DFunction(functionExpr) {
    // 解析函数表达式
    const expr = math.compile(functionExpr);

    // 创建函数求值函数
    const f = (x, y) => {
        try {
            return expr.evaluate({ x, y });
        } catch (e) {
            return 0;
        }
    };

    // 设置网格参数
    const xRange = { min: -5, max: 5, segments: 80 }; // 增加分段数提高精度
    const yRange = { min: -5, max: 5, segments: 80 };

    // 创建几何体
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    const colors = [];

    // 计算顶点位置
    const xStep = (xRange.max - xRange.min) / xRange.segments;
    const yStep = (yRange.max - yRange.min) / yRange.segments;

    // 找出函数的最大和最小值，用于颜色映射
    let minZ = Infinity;
    let maxZ = -Infinity;

    // 先计算所有z值以找出范围
    const zValues = [];
    for (let i = 0; i <= xRange.segments; i++) {
        zValues[i] = [];
        const x = xRange.min + i * xStep;

        for (let j = 0; j <= yRange.segments; j++) {
            const y = yRange.min + j * yStep;
            const z = f(x, y);

            zValues[i][j] = z;

            if (isFinite(z)) {
                minZ = Math.min(minZ, z);
                maxZ = Math.max(maxZ, z);
            }
        }
    }

    // 创建顶点
    for (let i = 0; i <= xRange.segments; i++) {
        const x = xRange.min + i * xStep;

        for (let j = 0; j <= yRange.segments; j++) {
            const y = yRange.min + j * yStep;
            const z = zValues[i][j];

            vertices.push(x, z, y); // 注意：Three.js中y轴向上，所以交换y和z

            // 根据高度添加颜色，使用动态范围
            let normalizedZ;
            if (maxZ === minZ) {
                normalizedZ = 0.5; // 如果所有值相同，使用中间色
            } else {
                normalizedZ = (z - minZ) / (maxZ - minZ);
            }

            const clampedZ = Math.max(0, Math.min(1, normalizedZ));

            // 使用更丰富的颜色渐变
            let h, s, l;

            // 使用更现代的颜色方案
            h = 0.6 - clampedZ * 0.6; // 从蓝色到红色的渐变
            s = 0.7 + clampedZ * 0.3; // 饱和度随高度增加
            l = 0.4 + clampedZ * 0.2; // 亮度随高度增加

            const color = new THREE.Color().setHSL(h, s, l);
            colors.push(color.r, color.g, color.b);
        }
    }

    // 创建面索引
    for (let i = 0; i < xRange.segments; i++) {
        for (let j = 0; j < yRange.segments; j++) {
            const a = i * (yRange.segments + 1) + j;
            const b = a + 1;
            const c = a + (yRange.segments + 1);
            const d = c + 1;

            // 添加两个三角形组成一个四边形
            indices.push(a, c, b);
            indices.push(c, d, b);
        }
    }

    // 设置几何体属性
    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    // 创建材质
    const material = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
        vertexColors: true,
        shininess: 80,
        flatShading: false,
        transparent: true,
        opacity: 0
    });

    // 创建网格并添加到场景
    currentMesh = new THREE.Mesh(geometry, material);
    currentMesh.castShadow = true;
    currentMesh.receiveShadow = true;
    scene.add(currentMesh);

    // 添加出现动画
    new TWEEN.Tween(material)
        .to({ opacity: 1 }, 800)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

    // 添加相机动画
    new TWEEN.Tween(camera.position)
        .to({ x: 10, y: 10, z: 10 }, 1000)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();

    // 隐藏加载指示器
    showLoadingIndicator(false);

    // 显示渲染完成通知
    const renderTime = ((performance.now() - renderStartTime) / 1000).toFixed(2);
    showNotification(`函数 ${functionExpr} 渲染完成，耗时 ${renderTime} 秒`, 'success');

    isRendering = false;
}

// 渲染2D函数
function render2DFunction(functionExpr) {
    // 解析函数表达式
    const expr = math.compile(functionExpr);

    // 创建函数求值函数
    const f = (x) => {
        try {
            return expr.evaluate({ x });
        } catch (e) {
            return 0;
        }
    };

    // 设置曲线参数
    const xRange = { min: -10, max: 10, segments: 300 }; // 增加分段数提高精度

    // 创建曲线几何体
    const points = [];
    const colors = [];

    // 计算点位置
    const xStep = (xRange.max - xRange.min) / xRange.segments;

    // 找出函数的最大和最小值，用于颜色映射
    let minY = Infinity;
    let maxY = -Infinity;
    const yValues = [];

    // 先计算所有y值以找出范围
    for (let i = 0; i <= xRange.segments; i++) {
        const x = xRange.min + i * xStep;
        const y = f(x);
        yValues.push(y);

        if (isFinite(y)) {
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        }
    }

    // 创建点和颜色
    for (let i = 0; i <= xRange.segments; i++) {
        const x = xRange.min + i * xStep;
        const y = yValues[i];

        // 注意：在Three.js中，我们使用x和z作为2D平面
        points.push(new THREE.Vector3(x, y, 0));

        // 根据y值添加颜色，使用动态范围
        let normalizedY;
        if (maxY === minY) {
            normalizedY = 0.5; // 如果所有值相同，使用中间色
        } else {
            normalizedY = (y - minY) / (maxY - minY);
        }

        const clampedY = Math.max(0, Math.min(1, normalizedY));

        // 使用更现代的颜色方案
        const h = 0.6 - clampedY * 0.6; // 从蓝色到红色的渐变
        const s = 0.7 + clampedY * 0.3; // 饱和度随高度增加
        const l = 0.5; // 保持亮度一致

        const color = new THREE.Color().setHSL(h, s, l);
        colors.push(color.r, color.g, color.b);
    }

    // 创建几何体
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    // 创建线条材质
    const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        linewidth: 2,
        transparent: true,
        opacity: 0
    });

    // 创建线条并添加到场景
    const line = new THREE.Line(geometry, lineMaterial);

    // 创建组合对象
    currentMesh = new THREE.Group();
    currentMesh.add(line);

    // 创建坐标轴平面
    const planeGeometry = new THREE.PlaneGeometry(25, 25);
    const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0xf8f9fa,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2;
    currentMesh.add(plane);

    // 添加坐标轴
    const axisLength = 12;
    const axisWidth = 0.05;

    // X轴
    const xAxisGeometry = new THREE.BoxGeometry(axisLength * 2, axisWidth, axisWidth);
    const xAxisMaterial = new THREE.MeshBasicMaterial({ color: 0x4361ee });
    const xAxis = new THREE.Mesh(xAxisGeometry, xAxisMaterial);
    currentMesh.add(xAxis);

    // Y轴
    const yAxisGeometry = new THREE.BoxGeometry(axisWidth, axisLength * 2, axisWidth);
    const yAxisMaterial = new THREE.MeshBasicMaterial({ color: 0x4cc9f0 });
    const yAxis = new THREE.Mesh(yAxisGeometry, yAxisMaterial);
    currentMesh.add(yAxis);

    // 添加原点标记
    const originGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const originMaterial = new THREE.MeshBasicMaterial({ color: 0xef476f });
    const origin = new THREE.Mesh(originGeometry, originMaterial);
    currentMesh.add(origin);

    // 添加到场景
    scene.add(currentMesh);

    // 添加出现动画
    new TWEEN.Tween(lineMaterial)
        .to({ opacity: 1 }, 800)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

    // 重置相机位置为2D视图，添加动画
    new TWEEN.Tween(camera.position)
        .to({ x: 0, y: 0, z: 15 }, 1000)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();

    new TWEEN.Tween(controls.target)
        .to({ x: 0, y: 0, z: 0 }, 1000)
        .easing(TWEEN.Easing.Cubic.Out)
        .onUpdate(() => controls.update())
        .start();

    // 隐藏加载指示器
    showLoadingIndicator(false);

    // 显示渲染完成通知
    const renderTime = ((performance.now() - renderStartTime) / 1000).toFixed(2);
    showNotification(`函数 ${functionExpr} 渲染完成，耗时 ${renderTime} 秒`, 'success');

    isRendering = false;
}


/* =============================
   微积分模拟：极限、导数、定积分
   ============================= */
// UI 联动与事件初始化
function initCalculusPanel() {
    // 选项卡切换
    const tabs = document.querySelectorAll('.view-tab');
    const panels = document.querySelectorAll('.view-panel');
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.style.display = 'none');
            this.classList.add('active');
            const view = this.getAttribute('data-view');
            document.getElementById(view + '-panel').style.display = '';
        });
    });

    // 概念参数面的切换
    const conceptSelect = document.getElementById('calculus-concept-select');
    const conceptParams = {
        limit: document.getElementById('limit-params'),
        derivative: document.getElementById('derivative-params'),
        integral: document.getElementById('integral-params'),
    };
    function updateConceptParamsDisplay() {
        const type = conceptSelect.value;
        for (const [key, el] of Object.entries(conceptParams)) {
            el.style.display = (key === type) ? '' : 'none';
        }
    }
    conceptSelect.addEventListener('change', updateConceptParamsDisplay);
    updateConceptParamsDisplay();

    // 微积分示例按钮事件
    document.querySelectorAll('.calculus-example-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.getElementById('calculus-function-input').value = btn.getAttribute('data-func');
            conceptSelect.value = btn.getAttribute('data-concept');
            updateConceptParamsDisplay();
            // 填充参数
            if (btn.getAttribute('data-concept') === 'limit') {
                document.getElementById('limit-point').value = btn.getAttribute('data-point') ?? 0;
            }
            if (btn.getAttribute('data-concept') === 'derivative') {
                document.getElementById('derivative-point').value = btn.getAttribute('data-point') ?? 0;
            }
            if (btn.getAttribute('data-concept') === 'integral') {
                document.getElementById('integral-start').value = btn.getAttribute('data-start') ?? -1;
                document.getElementById('integral-end').value = btn.getAttribute('data-end') ?? 1;
                document.getElementById('integral-steps').value = btn.getAttribute('data-steps') ?? 10;
            }
        });
    });

    // 主模拟按钮事件
    document.getElementById('simulate-btn').addEventListener('click', function () {
        // 添加加载动画等
        this.classList.add('loading');
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 模拟中...';
        setTimeout(() => {
            runCalculusSimulation().then(() => {
                this.classList.remove('loading');
                this.innerHTML = '<i class="fas fa-play"></i> 开始模拟';
            });
        }, 100);
    });
}

// 入口函数：根据概念选择执行对应模拟
async function runCalculusSimulation() {
    // 清理旧内容
    if (currentMesh) {
        scene.remove(currentMesh);
        currentMesh = null;
    }

    const exprStr = document.getElementById('calculus-function-input').value.trim();
    const concept = document.getElementById('calculus-concept-select').value;
    if (!exprStr) {
        showNotification('请输入函数表达式', 'warning');
        return;
    }
    try {
        let expr = math.compile(exprStr);

        if (concept === 'limit') {
            const a = parseFloat(document.getElementById('limit-point').value);
            await simulateLimit(expr, a);
        }
        else if (concept === 'derivative') {
            const x0 = parseFloat(document.getElementById('derivative-point').value);
            await simulateDerivative(expr, x0);
        }
        else if (concept === 'integral') {
            const a = parseFloat(document.getElementById('integral-start').value);
            const b = parseFloat(document.getElementById('integral-end').value);
            const n = parseInt(document.getElementById('integral-steps').value);
            await simulateIntegral(expr, a, b, n);
        }
    } catch (e) {
        showNotification('表达式无效或参数有误', 'error');
    }
}

// 极限可视化：逼近过程
async function simulateLimit(expr, a) {
    // 准备：2D 展示
    resetCamera2D();
    // 设置区间 [-3+a, 3+a]
    let xmin = a - 3, xmax = a + 3, seg = 200;
    // 生成曲线
    const points = [];
    for (let i = 0; i <= seg; i++) {
        let x = xmin + (xmax - xmin) * i / seg;
        let y = safeEval(expr, x);
        points.push(new THREE.Vector3(x, y, 0));
    }
    const color = 0x4361ee;
    const curveLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({ color, linewidth: 2 })
    );

    // 初始化逼近点
    const markerGeom = new THREE.SphereGeometry(0.09, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xeb5e28 });
    const marker = new THREE.Mesh(markerGeom, markerMat);

    // 极限点 a 的虚线
    const aLineGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(a, -50, 0), new THREE.Vector3(a, 50, 0)
    ]);
    const aLine = new THREE.Line(aLineGeom, new THREE.LineDashedMaterial({color: 0x000, dashSize: 0.15, gapSize: 0.15}));
    aLine.computeLineDistances();

    // 群组
    currentMesh = new THREE.Group();
    currentMesh.add(curveLine);
    currentMesh.add(marker);
    currentMesh.add(aLine);

    scene.add(currentMesh);

    // 动画逼近
    let steps = 42, delay = 25;
    for (let i = 0; i <= steps; i++) {
        let t = i / steps;
        // marker 从左->a->右
        let from = xmin + 0.15, to = xmax - 0.15;
        let x = from * (1 - t) + to * t;
        if (t < 0.5) x = from + (a - from) * (t / 0.5);
        else x = a + (to - a) * ((t - 0.5) / 0.5);
        let y = safeEval(expr, x);
        marker.position.set(x, y, 0);
        await sleep(delay + Math.floor(24 * Math.sin(t * Math.PI)));
    }
    showNotification(`极限过程模拟完成 (x→${a})`, 'success');
}

// 导数可视化——割线->切线的极限
async function simulateDerivative(expr, x0) {
    resetCamera2D();
    // 区间
    let xmin = x0-3, xmax = x0+3, seg = 200;
    const points = [];
    for (let i = 0; i <= seg; i++) {
        let x = xmin + (xmax - xmin) * i / seg;
        let y = safeEval(expr, x);
        points.push(new THREE.Vector3(x, y, 0));
    }
    const curveLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({ color: 0x4361ee, linewidth: 2 })
    );

    // 两点 (x0, f(x0)) 和 (x0+h, f(x0+h))
    const hInit = 2.2, hFinal = 0.12, steps = 42, delay = 25;
    let marker1 = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), new THREE.MeshBasicMaterial({color: 0xeb5e28}));
    let marker2 = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), new THREE.MeshBasicMaterial({color: 0xfdc500}));
    let secant, tangent;
    let group = new THREE.Group();
    group.add(curveLine);
    group.add(marker1);
    group.add(marker2);

    scene.add(group);
    currentMesh = group;

    for (let i = 0; i <= steps; i++) {
        let th = i / steps;
        let h = hInit * (1 - th) + hFinal * th;
        // 刷新 secant line
        if (secant) group.remove(secant);
        const p1 = new THREE.Vector3(x0, safeEval(expr, x0), 0);
        const p2 = new THREE.Vector3(x0 + h, safeEval(expr, x0 + h), 0);
        marker1.position.set(p1.x, p1.y, 0);
        marker2.position.set(p2.x, p2.y, 0);
        const secantGeom = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        secant = new THREE.Line(secantGeom, new THREE.LineDashedMaterial({color: 0x385f71, dashSize: 0.22, gapSize:0.1}));
        secant.computeLineDistances();
        group.add(secant);
        await sleep(delay + Math.floor(24 * Math.abs(Math.sin(th * Math.PI))));
        group.remove(secant);
    }
    // 最后显示切线
    const f0 = safeEval(expr, x0);
    const dfdx = numericalDerivative(expr, x0);
    const tangentGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x0 - 2, f0 - 2 * dfdx, 0),
        new THREE.Vector3(x0 + 2, f0 + 2 * dfdx, 0)
    ]);
    tangent = new THREE.Line(tangentGeom, new THREE.LineBasicMaterial({ color: 0xff2e63, linewidth: 3 }));
    group.add(tangent);
    showNotification(`导数过程模拟完成 (x=${x0})`, 'success');
}

// 定积分可视化：Riemann 和近似
async function simulateIntegral(expr, a, b, n) {
    resetCamera2D();
    // 区间
    let xmin = Math.min(a, b) - 1.2, xmax = Math.max(a, b) + 1.2, seg = 200;
    const points = [];
    for (let i = 0; i <= seg; i++) {
        let x = xmin + (xmax - xmin) * i / seg;
        let y = safeEval(expr, x);
        points.push(new THREE.Vector3(x, y, 0));
    }
    const curveLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({ color: 0x4361ee, linewidth: 2 })
    );
    // 面积条 group
    const barGroup = new THREE.Group();

    // 积分区间高亮
    const regionGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(a, -50, 0), new THREE.Vector3(a, 50, 0),
        new THREE.Vector3(b, -50, 0), new THREE.Vector3(b, 50, 0)
    ]);
    const regionLines = new THREE.LineSegments(regionGeom, new THREE.LineDashedMaterial({ color: 0x888, dashSize: 0.18, gapSize: 0.22}));
    regionLines.computeLineDistances();

    // 集合
    let group = new THREE.Group();
    group.add(curveLine);
    group.add(regionLines);
    group.add(barGroup);
    scene.add(group);
    currentMesh = group;

    // 逐步生成面积条
    let delta = (b - a) / n;
    let delay = 30;
    for (let i = 0; i < n; i++) {
        let xleft = a + i * delta;
        let xright = xleft + delta;
        let xmid = (xleft + xright) / 2;
        let y = safeEval(expr, xmid);
        // 条绘制
        let barGeom = new THREE.BoxGeometry(delta * 0.94, Math.abs(y), 0.07);
        let barMat = new THREE.MeshBasicMaterial({ color: 0x6a4cff, opacity: 0.7, transparent: true });
        let bar = new THREE.Mesh(barGeom, barMat);
        bar.position.set(xmid, y / 2, 0.01 * i);
        barGroup.add(bar);
        await sleep(delay + Math.floor(16 * Math.cos(i / n * Math.PI)));
    }
    // 最后面积文字
    let S = 0;
    for (let i = 0; i < n; i++) {
        let xmid = a + (i + 0.5) * delta;
        let y = safeEval(expr, xmid);
        S += y * delta;
    }
    showNotification(`积分模拟完成，数值近似 ≈ ${S.toFixed(4)}`, 'success');
}

// 公共：2D相机位复用
function resetCamera2D() {
    new TWEEN.Tween(camera.position)
        .to({ x: 0, y: 0, z: 15 }, 620)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
    new TWEEN.Tween(controls.target)
        .to({ x: 0, y: 0, z: 0 }, 620)
        .easing(TWEEN.Easing.Cubic.Out)
        .onUpdate(() => controls.update())
        .start();
}
// 求数值导数
function numericalDerivative(expr, x, h=1e-4) {
    return (safeEval(expr, x+h) - safeEval(expr, x-h)) / (2 * h);
}
// 保险计算
function safeEval(expr, x) {
    try { return expr.evaluate({ x }); } catch { return NaN; }
}
// sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 页面加载完成后初始化应用
window.addEventListener('DOMContentLoaded', () => {
    init();
    initCalculusPanel();
});
