function main() {
    var CANVAS = document.getElementById("mycanvas");

    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    function normalizeScreen(x, y, width, height) {
        var nx = 2 * x / width - 1
        var ny = -2 * y / height + 1

        return [nx, ny]
    }

    function generateBSpline(controlPoint, m, degree) {
        var curves = [];
        var knotVector = []

        var n = controlPoint.length / 2;


        // Calculate the knot values based on the degree and number of control points
        for (var i = 0; i < n + degree + 1; i++) {
            if (i < degree + 1) {
                knotVector.push(0);
            } else if (i >= n) {
                knotVector.push(n - degree);
            } else {
                knotVector.push(i - degree);
            }
        }



        var basisFunc = function (i, j, t) {
            if (j == 0) {
                if (knotVector[i] <= t && t < (knotVector[(i + 1)])) {
                    return 1;
                } else {
                    return 0;
                }
            }

            var den1 = knotVector[i + j] - knotVector[i];
            var den2 = knotVector[i + j + 1] - knotVector[i + 1];

            var term1 = 0;
            var term2 = 0;

            if (den1 != 0 && !isNaN(den1)) {
                term1 = ((t - knotVector[i]) / den1) * basisFunc(i, j - 1, t);
            }

            if (den2 != 0 && !isNaN(den2)) {
                term2 = ((knotVector[i + j + 1] - t) / den2) * basisFunc(i + 1, j - 1, t);
            }

            return term1 + term2;
        }


        for (var t = 0; t < m; t++) {
            var x = 0;
            var y = 0;

            var u = (t / m * (knotVector[controlPoint.length / 2] - knotVector[degree])) + knotVector[degree];

            for (var key = 0; key < n; key++) {

                var C = basisFunc(key, degree, u);
                // console.log(C);
                x += (controlPoint[key * 2] * C);
                y += (controlPoint[key * 2 + 1] * C);
                // console.log(t+" "+degree+" "+x+" "+y+" "+C);
            }
            curves.push(x);
            curves.push(y);

        }
        // console.log(curves)
        return curves;
    }


    // CAPTURE MOUSE EVENT
    var AMORTIZATION = 0.95;
    var dX = 0, dY = 0;
    var drag = false;
    var THETA = 0;
    var PHI = 0;

    var bezierindex = 0;
    var missileSpeed = 2;

    // var cameraPosition = { x: 27.499999999999986, y: -4.0000000000000036, z: -80.99999999999994 };
    var cameraPosition = { x: 0, y: -20, z: -20};
    var cameraSpeed = 1;
    // var cameraSpeed = 0.5;
    var targetCameraPosition = { x: cameraPosition.x, y: cameraPosition.y, z: cameraPosition.z };

    //Init Pos Object
    var POSISIKERUCUT = { x: 0, y: 15, z: 10 };
    var POSISITABUNG = { x: 0, y: 15, z: 10 };
    var POSISIBALOKKIRI = { x: 1.5, y: 15, z: 5 };
    var POSISIBALOKKANAN = { x: -1.5, y: 15, z: 5 };
    var POSISIBALOKATAS = { x: 0, y: 16.2, z: 3.5 };
    var POSISIBALOKBAWAH = { x: 0, y: 13.75, z: 4.3 };
    var POSISICOCKPIT = { x: 0, y: 15.7, z: 8 };
    var POSISIVENTKANAN = { x: 1.5, y: 15.01, z: 9.21 };
    var POSISIVENTKIRI = { x: -1.5, y: 15.01, z: 9.21 };
    var POSISIVENTBELAKANG = { x: -1.5, y: 15.03, z: 4.3 };
    var POSISIVENTBELAKANGKANAN = { x: 1.5, y: 15.03, z: 4.3 };
    var POSISIVENTKIRIBELAKANG = { x: -1.5, y: 16.7, z: 1.6 };
    var POSISIVENTKANANBELAKANG = { x: 1.5, y: 16.7, z: 1.6 };
    var POSISISAYAPKANANINNER = { x: 3, y: 15, z: 4 };
    var POSISISAYAPKIRIINNER = { x: -3, y: 15, z: 4 };
    var POSISISAYAPKANANOUTER = { x: 6, y: 15, z: 4.52 };
    var POSISISAYAPKIRIOUTER = { x: -6, y: 15, z: 4.52 };
    var POSISIMISSILEKANAN = { x: 3, y: 14.5, z: 3 };
    var POSISIMISSILEKIRI = { x: -3, y: 14.5, z: 3 };
    var POSISITUTUPMISSILEKANAN = { x: 3, y: 14.5, z: 5 };
    var POSISITUTUPMISSILEKIRI = { x: -3, y: 14.5, z: 5 };

    //Target Pos Object
    var targetPosisiKerucut = { x: POSISIKERUCUT.x, y: POSISIKERUCUT.y, z: POSISIKERUCUT.z };
    var targetPosisiTabung = { x: POSISITABUNG.x, y: POSISITABUNG.y, z: POSISITABUNG.z };
    var targetPosisiBalokKiri = { x: POSISIBALOKKIRI.x, y: POSISIBALOKKIRI.y, z: POSISIBALOKKIRI.z };
    var targetPosisiBalokKanan = { x: POSISIBALOKKANAN.x, y: POSISIBALOKKANAN.y, z: POSISIBALOKKANAN.z };
    var targetPosisiBalokAtas = { x: POSISIBALOKATAS.x, y: POSISIBALOKATAS.y, z: POSISIBALOKATAS.z };
    var targetPosisiBalokBawah = { x: POSISIBALOKBAWAH.x, y: POSISIBALOKBAWAH.y, z: POSISIBALOKBAWAH.z };
    var targetPosisiCockpit = { x: POSISICOCKPIT.x, y: POSISICOCKPIT.y, z: POSISICOCKPIT.z };
    var targetPosisiVentKanan = { x: POSISIVENTKANAN.x, y: POSISIVENTKANAN.y, z: POSISIVENTKANAN.z };
    var targetPosisiVentKiri = { x: POSISIVENTKIRI.x, y: POSISIVENTKIRI.y, z: POSISIVENTKIRI.z };
    var targetPosisiVentBelakang = { x: POSISIVENTBELAKANG.x, y: POSISIVENTBELAKANG.y, z: POSISIVENTBELAKANG.z };
    var targetPosisiVentBelakangKanan = { x: POSISIVENTBELAKANGKANAN.x, y: POSISIVENTBELAKANGKANAN.y, z: POSISIVENTBELAKANGKANAN.z };
    var targetPosisiVentKiriBelakang = { x: POSISIVENTKIRIBELAKANG.x, y: POSISIVENTKIRIBELAKANG.y, z: POSISIVENTKIRIBELAKANG.z };
    var targetPosisiVentKananBelakang = { x: POSISIVENTKANANBELAKANG.x, y: POSISIVENTKANANBELAKANG.y, z: POSISIVENTKANANBELAKANG.z };
    var targetPosisiSayapKananInner = { x: POSISISAYAPKANANINNER.x, y: POSISISAYAPKANANINNER.y, z: POSISISAYAPKANANINNER.z };
    var targetPosisiSayapKiriInner = { x: POSISISAYAPKIRIINNER.x, y: POSISISAYAPKIRIINNER.y, z: POSISISAYAPKIRIINNER.z };
    var targetPosisiSayapKananOuter = { x: POSISISAYAPKANANOUTER.x, y: POSISISAYAPKANANOUTER.y, z: POSISISAYAPKANANOUTER.z };
    var targetPosisiSayapKiriOuter = { x: POSISISAYAPKIRIOUTER.x, y: POSISISAYAPKIRIOUTER.y, z: POSISISAYAPKIRIOUTER.z };
    var targetPosisiMissileKanan = { x: POSISIMISSILEKANAN.x, y: POSISIMISSILEKANAN.y, z: POSISIMISSILEKANAN.z };
    var targetPosisiMissileKiri = { x: POSISIMISSILEKIRI.x, y: POSISIMISSILEKIRI.y, z: POSISIMISSILEKIRI.z };
    var targetPosisiTutupMissileKanan = { x: POSISITUTUPMISSILEKANAN.x, y: POSISITUTUPMISSILEKANAN.y, z: POSISITUTUPMISSILEKANAN.z };
    var targetPosisiTutupMissileKiri = { x: POSISITUTUPMISSILEKIRI.x, y: POSISITUTUPMISSILEKIRI.y, z: POSISITUTUPMISSILEKIRI.z };

    var rotateAmount = 0;
    var rotateIncrease = 0.1;

    var controlPoints = [
        3, 14.5,
        13.4, 13.1,
        17.1, 6.07,
        15.76, 1.3,
    ];

    //CREATING MISSILE PATH WITH BEZIER
    var numberOfPoints = 100;
    var degree = 3;
    var curvePoints = generateBSpline(controlPoints, numberOfPoints, degree);
    console.log(curvePoints);

    var x_prev, y_prev;

    var mouseDown = function (e) {
        drag = true;
        x_prev = e.pageX, y_prev = e.pageY;
        e.preventDefault();
        return false;
    };

    var mouseUp = function (e) {
        drag = false;
    };

    var mouseMove = function (e) {
        if (!drag) return false;
        dX = (e.pageX - x_prev) * 2 * Math.PI / CANVAS.width,
            dY = (e.pageY - y_prev) * 2 * Math.PI / CANVAS.height;
        THETA += dX;
        PHI += dY;
        x_prev = e.pageX, y_prev = e.pageY;
        e.preventDefault();
    }

    CANVAS.addEventListener("mousedown", mouseDown, false);
    CANVAS.addEventListener("mouseup", mouseUp, false);
    CANVAS.addEventListener("mouseout", mouseUp, false);
    CANVAS.addEventListener("mousemove", mouseMove, false);

    var keyDown = function (e) {
        var key = e.key.toLowerCase();
        switch (key) {
            case "w":
                targetCameraPosition.z += cameraSpeed;
                targetPosisiKerucut.z += cameraSpeed;
                targetPosisiTabung.z += cameraSpeed;
                targetPosisiBalokKiri.z += cameraSpeed;
                targetPosisiBalokKanan.z += cameraSpeed;
                targetPosisiBalokAtas.z += cameraSpeed;
                targetPosisiBalokBawah.z += cameraSpeed;
                targetPosisiCockpit.z += cameraSpeed;
                targetPosisiVentKanan.z += cameraSpeed;
                targetPosisiVentKiri.z += cameraSpeed;
                targetPosisiVentBelakang.z += cameraSpeed;
                targetPosisiVentBelakangKanan.z += cameraSpeed;
                targetPosisiVentKiriBelakang.z += cameraSpeed;
                targetPosisiVentKananBelakang.z += cameraSpeed;
                targetPosisiSayapKananInner.z += cameraSpeed;
                targetPosisiSayapKiriInner.z += cameraSpeed;
                targetPosisiSayapKananOuter.z += cameraSpeed;
                targetPosisiSayapKiriOuter.z += cameraSpeed;
                targetPosisiMissileKanan.z += cameraSpeed;
                targetPosisiMissileKiri.z += cameraSpeed;
                // targetPosisiMissileKiri.z += missileSpeed;
                targetPosisiTutupMissileKanan.z += cameraSpeed;
                targetPosisiTutupMissileKiri.z += cameraSpeed;
                // targetPosisiTutupMissileKiri.z += missileSpeed;
                // bezierindex += 2; --> For Firing Missile (Missile Path Follows a Bezier Curve)
                break;
            case "s":
                targetCameraPosition.z -= cameraSpeed;
                targetPosisiKerucut.z -= cameraSpeed;
                targetPosisiTabung.z -= cameraSpeed;
                targetPosisiBalokKiri.z -= cameraSpeed;
                targetPosisiBalokKanan.z -= cameraSpeed;
                targetPosisiBalokAtas.z -= cameraSpeed;
                targetPosisiBalokBawah.z -= cameraSpeed;
                targetPosisiCockpit.z -= cameraSpeed;
                targetPosisiVentKanan.z -= cameraSpeed;
                targetPosisiVentKiri.z -= cameraSpeed;
                targetPosisiVentBelakang.z -= cameraSpeed;
                targetPosisiVentBelakangKanan.z -= cameraSpeed;
                targetPosisiVentKiriBelakang.z -= cameraSpeed;
                targetPosisiVentKananBelakang.z -= cameraSpeed;
                targetPosisiSayapKananInner.z -= cameraSpeed;
                targetPosisiSayapKiriInner.z -= cameraSpeed;
                targetPosisiSayapKananOuter.z -= cameraSpeed;
                targetPosisiSayapKiriOuter.z -= cameraSpeed;
                targetPosisiMissileKanan.z -= cameraSpeed;
                targetPosisiMissileKiri.z -= cameraSpeed;
                targetPosisiTutupMissileKanan.z -= cameraSpeed;
                targetPosisiTutupMissileKiri.z -= cameraSpeed;
                break;
            case "a":
                targetCameraPosition.x += cameraSpeed;
                targetPosisiKerucut.x += cameraSpeed;
                targetPosisiTabung.x += cameraSpeed;
                targetPosisiBalokKiri.x += cameraSpeed;
                targetPosisiBalokKanan.x += cameraSpeed;
                targetPosisiBalokAtas.x += cameraSpeed;
                targetPosisiBalokBawah.x += cameraSpeed;
                targetPosisiCockpit.x += cameraSpeed;
                targetPosisiVentKanan.x += cameraSpeed;
                targetPosisiVentKiri.x += cameraSpeed;
                targetPosisiVentBelakang.x += cameraSpeed;
                targetPosisiVentBelakangKanan.x += cameraSpeed;
                targetPosisiVentKiriBelakang.x += cameraSpeed;
                targetPosisiVentKananBelakang.x += cameraSpeed;
                targetPosisiSayapKananInner.x += cameraSpeed;
                targetPosisiSayapKiriInner.x += cameraSpeed;
                targetPosisiSayapKananOuter.x += cameraSpeed;
                targetPosisiSayapKiriOuter.x += cameraSpeed;
                targetPosisiMissileKanan.x += cameraSpeed;
                targetPosisiMissileKiri.x += cameraSpeed;
                targetPosisiTutupMissileKanan.x += cameraSpeed;
                targetPosisiTutupMissileKiri.x += cameraSpeed;
                break;
            case "d":
                targetCameraPosition.x -= cameraSpeed;
                targetPosisiKerucut.x -= cameraSpeed;
                targetPosisiTabung.x -= cameraSpeed;
                targetPosisiBalokKiri.x -= cameraSpeed;
                targetPosisiBalokKanan.x -= cameraSpeed;
                targetPosisiBalokAtas.x -= cameraSpeed;
                targetPosisiBalokBawah.x -= cameraSpeed;
                targetPosisiCockpit.x -= cameraSpeed;
                targetPosisiVentKanan.x -= cameraSpeed;
                targetPosisiVentKiri.x -= cameraSpeed;
                targetPosisiVentBelakang.x -= cameraSpeed;
                targetPosisiVentBelakangKanan.x -= cameraSpeed;
                targetPosisiVentKiriBelakang.x -= cameraSpeed;
                targetPosisiVentKananBelakang.x -= cameraSpeed;
                targetPosisiSayapKananInner.x -= cameraSpeed;
                targetPosisiSayapKiriInner.x -= cameraSpeed;
                targetPosisiSayapKananOuter.x -= cameraSpeed;
                targetPosisiSayapKiriOuter.x -= cameraSpeed;
                targetPosisiMissileKanan.x -= cameraSpeed;
                targetPosisiMissileKiri.x -= cameraSpeed;
                targetPosisiTutupMissileKanan.x -= cameraSpeed;
                targetPosisiTutupMissileKiri.x -= cameraSpeed;
                break;
            case "q":
                targetCameraPosition.y -= cameraSpeed;
                targetPosisiKerucut.y -= cameraSpeed;
                targetPosisiTabung.y -= cameraSpeed;
                targetPosisiBalokKiri.y -= cameraSpeed;
                targetPosisiBalokKanan.y -= cameraSpeed;
                targetPosisiBalokAtas.y -= cameraSpeed;
                targetPosisiBalokBawah.y -= cameraSpeed;
                targetPosisiCockpit.y -= cameraSpeed;
                targetPosisiVentKanan.y -= cameraSpeed;
                targetPosisiVentKiri.y -= cameraSpeed;
                targetPosisiVentBelakang.y -= cameraSpeed;
                targetPosisiVentBelakangKanan.y -= cameraSpeed;
                targetPosisiVentKiriBelakang.y -= cameraSpeed;
                targetPosisiVentKananBelakang.y -= cameraSpeed;
                targetPosisiSayapKananInner.y -= cameraSpeed;
                targetPosisiSayapKiriInner.y -= cameraSpeed;
                targetPosisiSayapKananOuter.y -= cameraSpeed;
                targetPosisiSayapKiriOuter.y -= cameraSpeed;
                targetPosisiMissileKanan.y -= cameraSpeed;
                targetPosisiMissileKiri.y -= cameraSpeed;
                targetPosisiTutupMissileKanan.y -= cameraSpeed;
                targetPosisiTutupMissileKiri.y -= cameraSpeed; 
                break;
            case "e":
                targetCameraPosition.y += cameraSpeed;
                targetPosisiKerucut.y += cameraSpeed;
                targetPosisiTabung.y += cameraSpeed;
                targetPosisiBalokKiri.y += cameraSpeed;
                targetPosisiBalokKanan.y += cameraSpeed;
                targetPosisiBalokAtas.y += cameraSpeed;
                targetPosisiBalokBawah.y += cameraSpeed;
                targetPosisiCockpit.y += cameraSpeed;
                targetPosisiVentKanan.y += cameraSpeed;
                targetPosisiVentKiri.y += cameraSpeed;
                targetPosisiVentBelakang.y += cameraSpeed;
                targetPosisiVentBelakangKanan.y += cameraSpeed;
                targetPosisiVentKiriBelakang.y += cameraSpeed;
                targetPosisiVentKananBelakang.y += cameraSpeed;
                targetPosisiSayapKananInner.y += cameraSpeed;
                targetPosisiSayapKiriInner.y += cameraSpeed;
                targetPosisiSayapKananOuter.y += cameraSpeed;
                targetPosisiSayapKiriOuter.y += cameraSpeed;
                targetPosisiMissileKanan.y += cameraSpeed;
                targetPosisiMissileKiri.y += cameraSpeed;
                targetPosisiTutupMissileKanan.y += cameraSpeed;
                targetPosisiTutupMissileKiri.y += cameraSpeed;
                break;
            case "t":
                targetPosisiSayapKananOuter.x += 0.1;
                targetPosisiSayapKiriOuter.x -= 0.1;
                break;
            case "r":
                targetPosisiSayapKananOuter.x -= 0.1;
                targetPosisiSayapKiriOuter.x += 0.1;
                break;
            case "o":
                rotateAmount += rotateIncrease;
                break;
            case "i":
                rotateAmount -= rotateIncrease;
                break;
            case "l":
                targetPosisiMissileKiri.y -= cameraSpeed;
                targetPosisiTutupMissileKiri.y -= cameraSpeed; 
                break;
        }
        e.preventDefault();
    };


    window.addEventListener("keydown", keyDown, false);

    var GL;
    try {
        GL = CANVAS.getContext("webgl", { antialias: false })
    } catch (error) {
        alert("WebGL context cannot be initialized");
        return false;
    }

    //SHADERS
    var shader_vertex_source = `
        attribute vec3 position;
        attribute vec3 color;

        uniform mat4 Pmatrix;
        uniform mat4 Vmatrix;
        uniform mat4 Mmatrix;

        varying vec3 vColor;
        void main(void){
            gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position,1.0);
            gl_PointSize = 20.0;
            vColor = color;
        }
    `;

    var shader_fragment_source = `
        precision mediump float;
        uniform float greyscality;

        varying vec3 vColor;
        void main(void){
            float greyscaleValue = (vColor.r + vColor.g + vColor.b) / 3.0;
            vec3 greyscaleColor =  vec3(greyscaleValue,greyscaleValue,greyscaleValue);
            vec3 color = mix(greyscaleColor, vColor, greyscality);
            gl_FragColor = vec4(color,1.0);
        }
    `;

    var compile_shader = function (source, type, typeString) {
        var shader = GL.createShader(type);
        GL.shaderSource(shader, source);
        GL.compileShader(shader);
        if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
            alert("ERROR IN " + typeString + " SHADER: "
                + GL.getShaderInfoLog(shader));
            return false;
        }
        return shader;
    };

    var shader_vertex = compile_shader(shader_vertex_source, GL.VERTEX_SHADER, "VERTEX");
    var shader_fragment = compile_shader(shader_fragment_source, GL.FRAGMENT_SHADER, "FRAGMENT");
    var SHADER_PROGRAM = GL.createProgram();
    GL.attachShader(SHADER_PROGRAM, shader_vertex);
    GL.attachShader(SHADER_PROGRAM, shader_fragment);

    GL.linkProgram(SHADER_PROGRAM);

    var _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM,
        "Pmatrix");
    var _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM,
        "Vmatrix");
    var _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM,
        "Mmatrix");
    var _greyscality = GL.getUniformLocation(SHADER_PROGRAM,
        "greyscality");

    var _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
    var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");

    GL.enableVertexAttribArray(_color);
    GL.enableVertexAttribArray(_position);

    GL.useProgram(SHADER_PROGRAM);

    //TANAH
    var square_vertex = [
        -400, -400, -1, 0, 1, 0,
        400, -400, -1, 0, 1, 0,
        400, 400, -1, 1, 1, 1,
        -400, 400, -1, 1, 1, 1,
    ];

    var SQUARE_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, SQUARE_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(square_vertex), GL.STATIC_DRAW);

    // SUN
    var sunPoints = [];
    var sunColors = [];
    var jumlahPointSun = 100;
    var sunFaces = [];

    for (var i = 0; i < jumlahPointSun; i++) {
        var theta = (i / jumlahPointSun) * 2 * Math.PI;

        var x = Math.cos(theta) * 2;
        var y = Math.sin(theta) * 2;

        sunPoints.push(x, y, 0);

        sunColors.push(1.0, 1.0, 0.0);

        sunFaces.push(i);
    }

    sunFaces.push(0);

    var SUN_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, SUN_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(sunPoints), GL.STATIC_DRAW);

    var SUN_COLORS = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, SUN_COLORS);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(sunColors), GL.STATIC_DRAW);

    var SUN_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SUN_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(sunFaces), GL.STATIC_DRAW);


    //FACES TANAH
    var square_faces = [
        0, 1, 2,
        0, 2, 3
    ];

    var SQUARE_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SQUARE_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(square_faces), GL.STATIC_DRAW);

    //TUBE
    //POINTS :
    var circlePoints = [];
    var jumlahPoints = 100;
    var circleFaces = [];
    // circlePoints.push();
    for (var i = 0; i < jumlahPoints; i++) {
        var theta = (i / jumlahPoints) * 2 * Math.PI;

        var x = Math.cos(theta);
        var y = Math.sin(theta);

        circlePoints.push(x, y, 0);

        circlePoints.push(0, 1, 0);
    }

    for (var i = 0; i < jumlahPoints; i++) {
        var theta = (i / jumlahPoints) * 2 * Math.PI;

        var x = Math.cos(theta);
        var y = Math.sin(theta);

        circlePoints.push(x, y, 10);

        circlePoints.push(0, 1, 0);
    }

    circleFaces.push(100);

    for (var i = 0; i < jumlahPoints; i++) {
        circleFaces.push(i);
    }

    for (var i = 0; i < jumlahPoints; i++) {
        circleFaces.push(i);
    }

    // Creating faces for the tube
    for (var i = 0; i < jumlahPoints; i++) {
        circleFaces.push(i, (i + jumlahPoints) % (jumlahPoints * 2), (i + 1) % jumlahPoints);
        circleFaces.push((i + 1) % jumlahPoints, (i + jumlahPoints) % (jumlahPoints * 2), (i + 1 + jumlahPoints) % (jumlahPoints * 2));
    }

    var CIRCLE_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(circlePoints), GL.STATIC_DRAW);

    var CIRCLE_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRCLE_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(circleFaces), GL.STATIC_DRAW);

    //KERUCUT
    //POINTS :
    var circlePoints2 = [];
    var circleFaces2 = [];
    // circlePoints.push();
    for (var i = 0; i < jumlahPoints; i++) {
        var theta = (i / jumlahPoints) * 2 * Math.PI;

        var x = Math.cos(theta);
        var y = Math.sin(theta);

        circlePoints2.push(x, y, 0);

        circlePoints2.push(0, 1, 0);
    }

    circlePoints2.push(0, 0, 3);
    circlePoints2.push(0, 1, 0);
    circleFaces2.push(100);

    for (var i = 0; i < jumlahPoints; i++) {
        circleFaces2.push(i);
    }

    for (var i = 0; i < 100; i++) {
        circleFaces2.push(i);
        circleFaces2.push(i + 1);
        circleFaces2.push(circlePoints2.length - 1);
    }

    var CIRCLE_VERTEX2 = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX2);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(circlePoints2), GL.STATIC_DRAW);

    //FACES
    var circle_faces2 = circleFaces2;
    var CIRCLE_FACES2 = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRCLE_FACES2);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(circle_faces2), GL.STATIC_DRAW);

    //BALOK KIRI
    //POINTS : 
    var balokkiri_vertex = [
        -3, -0.5, -1, 0, 0, 1,
        3, -0.5, -1, 0, 0, 1,
        3, 0.5, -1, 0, 0, 1,
        -3, 0.5, -1, 0, 0, 1,

        -3, -0.5, 1, 0, 0, 1,
        3, -0.5, 1, 0, 0, 1,
        3, 0.5, 1, 0, 0, 1,
        -3, 0.5, 1, 0, 0, 1,

        -3, -0.5, -1, 0, 0, 1,
        -3, 0.5, -1, 0, 0, 1,
        -3, 0.5, 1, 0, 0, 1,
        -3, -0.5, 1, 0, 0, 1,

        3, -0.5, -1, 0, 0, 1,
        3, 0.5, -1, 0, 0, 1,
        3, 0.5, 1, 0, 0, 1,
        3, -0.5, 1, 0, 0, 1,

        -3, -0.5, -1, 0, 0, 1,
        -3, -0.5, 1, 0, 0, 1,
        3, -0.5, 1, 0, 0, 1,
        3, -0.5, -1, 0, 0, 1,

        -3, 0.5, -1, 0, 0, 1,
        -3, 0.5, 1, 0, 0, 1,
        3, 0.5, 1, 0, 0, 1,
        3, 0.5, -1, 0, 0, 1
    ];


    var BALOKKIRI_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, BALOKKIRI_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(balokkiri_vertex), GL.STATIC_DRAW);

    //FACES
    var balokkiri_faces = [
        0, 1, 2,
        0, 2, 3,

        4, 5, 6,
        4, 6, 7,

        8, 9, 10,
        8, 10, 11,

        12, 13, 14,
        12, 14, 15,

        16, 17, 18,
        16, 18, 19,

        20, 21, 22,
        20, 22, 23
    ];
    var BALOKKIRI_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, BALOKKIRI_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(balokkiri_faces), GL.STATIC_DRAW);

    //BALOK KANAN
    //POINTS : 
    var balokkanan_vertex = [
        -3, -0.5, -1, 0, 0, 1,
        3, -0.5, -1, 0, 0, 1,
        3, 0.5, -1, 0, 0, 1,
        -3, 0.5, -1, 0, 0, 1,

        -3, -0.5, 1, 0, 0, 1,
        3, -0.5, 1, 0, 0, 1,
        3, 0.5, 1, 0, 0, 1,
        -3, 0.5, 1, 0, 0, 1,

        -3, -0.5, -1, 0, 0, 1,
        -3, 0.5, -1, 0, 0, 1,
        -3, 0.5, 1, 0, 0, 1,
        -3, -0.5, 1, 0, 0, 1,

        3, -0.5, -1, 0, 0, 1,
        3, 0.5, -1, 0, 0, 1,
        3, 0.5, 1, 0, 0, 1,
        3, -0.5, 1, 0, 0, 1,

        -3, -0.5, -1, 0, 0, 1,
        -3, -0.5, 1, 0, 0, 1,
        3, -0.5, 1, 0, 0, 1,
        3, -0.5, -1, 0, 0, 1,

        -3, 0.5, -1, 0, 0, 1,
        -3, 0.5, 1, 0, 0, 1,
        3, 0.5, 1, 0, 0, 1,
        3, 0.5, -1, 0, 0, 1
    ];


    var BALOKKANAN_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, BALOKKANAN_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(balokkanan_vertex), GL.STATIC_DRAW);

    // FACES
    var balokkanan_faces = [
        0, 1, 2,
        0, 2, 3,

        4, 5, 6,
        4, 6, 7,

        8, 9, 10,
        8, 10, 11,

        12, 13, 14,
        12, 14, 15,

        16, 17, 18,
        16, 18, 19,

        20, 21, 22,
        20, 22, 23
    ];
    var BALOKKANAN_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, BALOKKANAN_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(balokkanan_faces), GL.STATIC_DRAW);

    var balokatas_vertex = [
        -3, -0.25, -1, 0, 0.749, 1,
        3, -0.25, -1, 0, 0.749, 1,
        3, 0.25, -1, 0, 0.749, 1,
        -3, 0.25, -1, 0, 0.749, 1,

        -3, -0.25, 1, 0, 0.749, 1,
        3, -0.25, 1, 0, 0.749, 1,
        3, 0.25, 1, 0, 0.749, 1,
        -3, 0.25, 1, 0, 0.749, 1,

        -3, -0.25, -1, 0, 0.749, 1,
        -3, 0.25, -1, 0, 0.749, 1,
        -3, 0.25, 1, 0, 0.749, 1,
        -3, -0.25, 1, 0, 0.749, 1,

        3, -0.25, -1, 0, 0.749, 1,
        3, 0.25, -1, 0, 0.749, 1,
        3, 0.25, 1, 0, 0.749, 1,
        3, -0.25, 1, 0, 0.749, 1,

        -3, -0.25, -1, 0, 0.749, 1,
        -3, -0.25, 1, 0, 0.749, 1,
        3, -0.25, 1, 0, 0.749, 1,
        3, -0.25, -1, 0, 0.749, 1,

        -3, 0.25, -1, 0, 0.749, 1,
        -3, 0.25, 1, 0, 0.749, 1,
        3, 0.25, 1, 0, 0.749, 1,
        3, 0.25, -1, 0, 0.749, 1,
    ];


    var BALOKATAS_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, BALOKATAS_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(balokatas_vertex), GL.STATIC_DRAW);

    //FACES
    var balokatas_faces = [
        0, 1, 2,
        0, 2, 3,

        4, 5, 6,
        4, 6, 7,

        8, 9, 10,
        8, 10, 11,

        12, 13, 14,
        12, 14, 15,

        16, 17, 18,
        16, 18, 19,

        20, 21, 22,
        20, 22, 23
    ];
    var BALOKATAS_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, BALOKATAS_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(balokatas_faces), GL.STATIC_DRAW);

    // BALOKBAWAH
    var balokbawah_vertex = [
        // First face (front)
        -4, -0.25, -1, 0.5, 0.5, 1,
        4, -0.25, -1, 0.5, 0.5, 1,
        4, 0.25, -1, 0.5, 0.5, 1,
        -4, 0.25, -1, 0.5, 0.5, 1,

        // Second face (back)
        -4, -0.25, 1, 0.5, 0.5, 1,
        4, -0.25, 1, 0.5, 0.5, 1,
        4, 0.25, 1, 0.5, 0.5, 1,
        -4, 0.25, 1, 0.5, 0.5, 1,

        // Third face (left)
        -4, -0.25, -1, 0.5, 0.5, 1,
        -4, 0.25, -1, 0.5, 0.5, 1,
        -4, 0.25, 1, 0.5, 0.5, 1,
        -4, -0.25, 1, 0.5, 0.5, 1,

        // Fourth face (right)
        4, -0.25, -1, 0.5, 0.5, 1,
        4, 0.25, -1, 0.5, 0.5, 1,
        4, 0.25, 1, 0.5, 0.5, 1,
        4, -0.25, 1, 0.5, 0.5, 1,

        // Fifth face (bottom)
        -4, -0.25, -1, 0.5, 0.5, 1,
        -4, -0.25, 1, 0.5, 0.5, 1,
        4, -0.25, 1, 0.5, 0.5, 1,
        4, -0.25, -1, 0.5, 0.5, 1,

        // Sixth face (top)
        -4, 0.25, -1, 0.5, 0.5, 1,
        -4, 0.25, 1, 0.5, 0.5, 1,
        4, 0.25, 1, 0.5, 0.5, 1,
        4, 0.25, -1, 0.5, 0.5, 1
    ];


    var BALOKBAWAH_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, BALOKBAWAH_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(balokbawah_vertex), GL.STATIC_DRAW);

    // FACES
    var balokbawah_faces = [
        0, 1, 2,
        0, 2, 3,

        4, 5, 6,
        4, 6, 7,

        8, 9, 10,
        8, 10, 11,

        12, 13, 14,
        12, 14, 15,

        16, 17, 18,
        16, 18, 19,

        20, 21, 22,
        20, 22, 23
    ];

    var BALOKBAWAH_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, BALOKBAWAH_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(balokbawah_faces), GL.STATIC_DRAW);

    //COCKPIT
    //POINTS :
    var radius = 2.0;
    var sectorCount = 72;
    var stackCount = 50;

    var vertices = [];
    var normals = [];
    var texCoords = [];

    var x, y, z, xy;
    var nx, ny, nz, lengthInv = 1.0 / radius;
    var s, t;

    var sectorStep = 2 * Math.PI / sectorCount;
    var stackStep = Math.PI / stackCount;
    var sectorAngle, stackAngle;

    for (let i = 0; i <= stackCount / 2; i++) {
        stackAngle = Math.PI / 2 - i * stackStep;
        xy = radius * Math.cos(stackAngle);
        z = radius * Math.sin(stackAngle);

        let scaleX = 0.75;
        let scaleY = 0.5;
        let scaleZ = 0.5;

        for (let j = 0; j <= sectorCount; j++) {
            sectorAngle = j * sectorStep;

            x = xy * Math.cos(sectorAngle) * scaleX;
            y = xy * Math.sin(sectorAngle) * scaleY;
            vertices.push(x);
            vertices.push(y);
            vertices.push(z * scaleZ);

            vertices.push(0.6);
            vertices.push(0.6);
            vertices.push(0.6);

            nx = x * lengthInv;
            ny = y * lengthInv;
            nz = z * lengthInv;
            normals.push(nx);
            normals.push(ny);
            normals.push(nz);

            s = j / sectorCount;
            t = i / (stackCount / 2);
            texCoords.push(s);
            texCoords.push(t);
        }
    }

    var indices = [];
    var lineIndices = [];
    var k1, k2;
    for (let i = 0; i < stackCount / 2; i++) {
        k1 = i * (sectorCount + 1);
        k2 = k1 + sectorCount + 1;

        for (let j = 0; j < sectorCount; j++) {
            if (i != 0) {
                indices.push(k1);
                indices.push(k2);
                indices.push(k1 + 1);
            }

            if (i != (stackCount / 2 - 1)) {
                indices.push(k1 + 1);
                indices.push(k2);
                indices.push(k2 + 1);
            }

            lineIndices.push(k1);
            lineIndices.push(k2);
            if (i != 0) {
                lineIndices.push(k1);
                lineIndices.push(k1 + 1);
            }

            k1++;
            k2++;
        }
    }

    var COCKPIT_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, COCKPIT_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(vertices), GL.STATIC_DRAW);

    //FACES
    var COCKPIT_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, COCKPIT_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), GL.STATIC_DRAW);

    // VENTKANAN
    var ventkanan_vertex = [
        -1.2, -1, -0.5, 0, 0, 0.545,
        1.2, -1, -0.5, 0, 0, 0.545,
        1.2, 1, -0.5, 0, 0, 0.545,

        -1.2, -1, 0.5, 0, 0, 0.545,
        1.2, -1, 0.5, 0, 0, 0.545,
        1.2, 1, 0.5, 0, 0, 0.545,

        1.2, -1, -0.5, 0, 0, 0.545,
        1.2, 1, -0.5, 0, 0, 0.545,
        1.2, -1, 0.5, 0, 0, 0.545,
        1.2, 1, 0.5, 0, 0, 0.545,

        -1.2, -1, -0.5, 0, 0, 0.545,
        1.2, 1, -0.5, 0, 0, 0.545,
        1.2, 1, 0.5, 0, 0, 0.545,
        -1.2, -1, 0.5, 0, 0, 0.545,

        -1.2, -1, -0.5, 0, 0, 0.545,
        1.2, -1, -0.5, 0, 0, 0.545,
        1.2, -1, 0.5, 0, 0, 0.545,
        -1.2, -1, 0.5, 0, 0, 0.545,
    ];


    var VENTKANAN_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, VENTKANAN_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(ventkanan_vertex), GL.STATIC_DRAW);

    // FACES
    var ventkanan_faces = [
        0, 1, 2,

        3, 4, 5,

        6, 7, 8,
        7, 8, 9,

        10, 11, 12,
        10, 12, 13,

        14, 15, 16,
        14, 16, 17
    ];

    var VENTKANAN_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, VENTKANAN_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(ventkanan_faces), GL.STATIC_DRAW);

    // VENTKIRI
    var ventkiri_vertex = [
        -1.2, -1, -0.5, 0, 0, 0.545,
        1.2, -1, -0.5, 0, 0, 0.545,
        1.2, 1, -0.5, 0, 0, 0.545,

        -1.2, -1, 0.5, 0, 0, 0.545,
        1.2, -1, 0.5, 0, 0, 0.545,
        1.2, 1, 0.5, 0, 0, 0.545,

        1.2, -1, -0.5, 0, 0, 0.545,
        1.2, 1, -0.5, 0, 0, 0.545,
        1.2, -1, 0.5, 0, 0, 0.545,
        1.2, 1, 0.5, 0, 0, 0.545,

        -1.2, -1, -0.5, 0, 0, 0.545,
        1.2, 1, -0.5, 0, 0, 0.545,
        1.2, 1, 0.5, 0, 0, 0.545,
        -1.2, -1, 0.5, 0, 0, 0.545,

        -1.2, -1, -0.5, 0, 0, 0.545,
        1.2, -1, -0.5, 0, 0, 0.545,
        1.2, -1, 0.5, 0, 0, 0.545,
        -1.2, -1, 0.5, 0, 0, 0.545,
    ];



    var VENTKIRI_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, VENTKIRI_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(ventkiri_vertex), GL.STATIC_DRAW);

    // FACES
    var ventkiri_faces = [
        0, 1, 2,

        3, 4, 5,

        6, 7, 8,
        7, 8, 9,

        10, 11, 12,
        10, 12, 13,

        14, 15, 16,
        14, 16, 17
    ];

    var VENTKIRI_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, VENTKIRI_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(ventkiri_faces), GL.STATIC_DRAW);

    //VENT BELAKANG
    //POINTS : 
    var ventbelakang_vertex = [
        -2, -0.5, -1, 0, 0, 1,
        2, -0.3, -0.7, 0, 0, 1, //1
        2, 0.3, -0.7, 0, 0, 1, //2
        -2, 0.5, -1, 0, 0, 1,

        -2, -0.5, 1, 0, 0, 1,
        2, -0.3, 0.7, 0, 0, 1, //4
        2, 0.3, 0.7, 0, 0, 1, //3
        -2, 0.5, 1, 0, 0, 1,

        -2, -0.5, -1, 0, 0, 1,
        -2, 0.5, -1, 0, 0, 1,
        -2, 0.5, 1, 0, 0, 1,
        -2, -0.5, 1, 0, 0, 1,

        2, -0.3, -0.7, 0, 0, 1, //1
        2, 0.3, -0.7, 0, 0, 1, //2
        2, 0.3, 0.7, 0, 0, 1, //3
        2, -0.3, 0.7, 0, 0, 1, //4


        -2, -0.5, -1, 0, 0, 1,
        -2, -0.5, 1, 0, 0, 1,
        2, -0.3, 0.7, 0, 0, 1, //4
        2, -0.3, -0.7, 0, 0, 1,

        -2, 0.5, -1, 0, 0, 1,
        -2, 0.5, 1, 0, 0, 1,
        2, 0.3, 0.7, 0, 0, 1, //3
        2, 0.3, -0.7, 0, 0, 1 //2
    ];


    var VENTBELAKANG_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, VENTBELAKANG_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(ventbelakang_vertex), GL.STATIC_DRAW);

    //FACES
    var ventbelakang_faces = [
        0, 1, 2,
        0, 2, 3,

        4, 5, 6,
        4, 6, 7,

        8, 9, 10,
        8, 10, 11,

        12, 13, 14,
        12, 14, 15,

        16, 17, 18,
        16, 18, 19,

        20, 21, 22,
        20, 22, 23
    ];
    var VENTBELAKANG_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, VENTBELAKANG_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(ventbelakang_faces), GL.STATIC_DRAW);

    // VENT BELAKANG KANAN
    // POINTS:
    var ventbelakangkanan_vertex = [
        -2, -0.5, -1, 0, 0, 1,
        2, -0.3, -0.7, 0, 0, 1, //1
        2, 0.3, -0.7, 0, 0, 1, //2
        -2, 0.5, -1, 0, 0, 1,

        -2, -0.5, 1, 0, 0, 1,
        2, -0.3, 0.7, 0, 0, 1, //4
        2, 0.3, 0.7, 0, 0, 1, //3
        -2, 0.5, 1, 0, 0, 1,

        -2, -0.5, -1, 0, 0, 1,
        -2, 0.5, -1, 0, 0, 1,
        -2, 0.5, 1, 0, 0, 1,
        -2, -0.5, 1, 0, 0, 1,

        2, -0.3, -0.7, 0, 0, 1, //1
        2, 0.3, -0.7, 0, 0, 1, //2
        2, 0.3, 0.7, 0, 0, 1, //3
        2, -0.3, 0.7, 0, 0, 1, //4


        -2, -0.5, -1, 0, 0, 1,
        -2, -0.5, 1, 0, 0, 1,
        2, -0.3, 0.7, 0, 0, 1, //4
        2, -0.3, -0.7, 0, 0, 1,

        -2, 0.5, -1, 0, 0, 1,
        -2, 0.5, 1, 0, 0, 1,
        2, 0.3, 0.7, 0, 0, 1, //3
        2, 0.3, -0.7, 0, 0, 1 //2
    ];

    var VENTBELAKANGKANAN_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, VENTBELAKANGKANAN_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(ventbelakangkanan_vertex), GL.STATIC_DRAW);

    // FACES
    var ventbelakangkanan_faces = [
        0, 1, 2,
        0, 2, 3,

        4, 5, 6,
        4, 6, 7,

        8, 9, 10,
        8, 10, 11,

        12, 13, 14,
        12, 14, 15,

        16, 17, 18,
        16, 18, 19,

        20, 21, 22,
        20, 22, 23
    ];

    var VENTBELAKANGKANAN_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, VENTBELAKANGKANAN_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(ventbelakangkanan_faces), GL.STATIC_DRAW);

    // VENTKIRIBELAKANG
    var ventkiribelakang_vertex = [
        -1.2, -0.8, -0.2, 0, 0, 0.545,
        1.2, -0.8, -0.2, 0, 0, 0.545,
        1.2, 0.8, -0.2, 0, 0, 0.545,

        -1.2, -0.8, 0.2, 0, 0, 0.545,
        1.2, -0.8, 0.2, 0, 0, 0.545,
        1.2, 0.8, 0.2, 0, 0, 0.545,

        1.2, -0.8, -0.2, 0, 0, 0.545,
        1.2, 0.8, -0.2, 0, 0, 0.545,
        1.2, -0.8, 0.2, 0, 0, 0.545,
        1.2, 0.8, 0.2, 0, 0, 0.545,

        -1.2, -0.8, -0.2, 0, 0, 0.545,
        1.2, 0.8, -0.2, 0, 0, 0.545,
        1.2, 0.8, 0.2, 0, 0, 0.545,
        -1.2, -0.8, 0.2, 0, 0, 0.545,

        -1.2, -0.8, -0.2, 0, 0, 0.545,
        1.2, -0.8, -0.2, 0, 0, 0.545,
        1.2, -0.8, 0.2, 0, 0, 0.545,
        -1.2, -0.8, 0.2, 0, 0, 0.545,
    ];


    var VENTKIRIBELAKANG_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, VENTKIRIBELAKANG_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(ventkiribelakang_vertex), GL.STATIC_DRAW);

    // FACES
    var ventkiribelakang_faces = [
        0, 1, 2,

        3, 4, 5,

        6, 7, 8,
        7, 8, 9,

        10, 11, 12,
        10, 12, 13,

        14, 15, 16,
        14, 16, 17
    ];

    var VENTKIRIBELAKANG_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, VENTKIRIBELAKANG_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(ventkiribelakang_faces), GL.STATIC_DRAW);

    // VENTKANANBELAKANG
    var ventkananbelakang_vertex = [
        -1.2, -0.8, -0.2, 0, 0, 0.545,
        1.2, -0.8, -0.2, 0, 0, 0.545,
        1.2, 0.8, -0.2, 0, 0, 0.545,

        -1.2, -0.8, 0.2, 0, 0, 0.545,
        1.2, -0.8, 0.2, 0, 0, 0.545,
        1.2, 0.8, 0.2, 0, 0, 0.545,

        1.2, -0.8, -0.2, 0, 0, 0.545,
        1.2, 0.8, -0.2, 0, 0, 0.545,
        1.2, -0.8, 0.2, 0, 0, 0.545,
        1.2, 0.8, 0.2, 0, 0, 0.545,

        -1.2, -0.8, -0.2, 0, 0, 0.545,
        1.2, 0.8, -0.2, 0, 0, 0.545,
        1.2, 0.8, 0.2, 0, 0, 0.545,
        -1.2, -0.8, 0.2, 0, 0, 0.545,

        -1.2, -0.8, -0.2, 0, 0, 0.545,
        1.2, -0.8, -0.2, 0, 0, 0.545,
        1.2, -0.8, 0.2, 0, 0, 0.545,
        -1.2, -0.8, 0.2, 0, 0, 0.545,
    ];



    var VENTKANANBELAKANG_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, VENTKANANBELAKANG_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(ventkananbelakang_vertex), GL.STATIC_DRAW);

    // FACES
    var ventkananbelakang_faces = [
        0, 1, 2,

        3, 4, 5,

        6, 7, 8,
        7, 8, 9,

        10, 11, 12,
        10, 12, 13,

        14, 15, 16,
        14, 16, 17
    ];

    var VENTKANANBELAKANG_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, VENTKANANBELAKANG_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(ventkananbelakang_faces), GL.STATIC_DRAW);

    var sayapkananinner_vertex = [
        -3.6, -0.25, -1, 0, 0, 0.545,
        3, -0.25, -1, 0, 0, 0.545,
        3, 0.25, -1, 0, 0, 0.545,
        -3.6, 0.25, -1, 0, 0, 0.545,

        -1.2, -0.25, 2, 0, 0, 0.545,
        3, -0.25, 0.7, 0, 0, 0.545,
        3, 0.25, 0.7, 0, 0, 0.545,
        -1.2, 0.25, 2, 0, 0, 0.545,

        -3.6, -0.25, -1, 0, 0, 0.545,
        -3.6, 0.25, -1, 0, 0, 0.545,
        -1.2, 0.25, 2, 0, 0, 0.545,
        -1.2, -0.25, 2, 0, 0, 0.545,

        3, -0.25, -1, 0, 0, 0.545,
        3, 0.25, -1, 0, 0, 0.545,
        3, 0.25, 0.7, 0, 0, 0.545,
        3, -0.25, 0.7, 0, 0, 0.545,

        -3.6, -0.25, -1, 0, 0, 0.545,
        -1.2, -0.25, 2, 0, 0, 0.545,
        3, -0.25, 0.7, 0, 0, 0.545,
        3, -0.25, -1, 0, 0, 0.545,

        -3.6, 0.25, -1, 0, 0, 0.545,
        -1.2, 0.25, 2, 0, 0, 0.545,
        3, 0.25, 0.7, 0, 0, 0.545,
        3, 0.25, -1, 0, 0, 0.545
    ];

    var SAYAPKANANINNER_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, SAYAPKANANINNER_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(sayapkananinner_vertex), GL.STATIC_DRAW);

    // FACES
    var sayapkananinner_faces = [
        0, 1, 2,
        0, 2, 3,

        4, 5, 6,
        4, 6, 7,

        8, 9, 10,
        8, 10, 11,

        12, 13, 14,
        12, 14, 15,

        16, 17, 18,
        16, 18, 19,

        20, 21, 22,
        20, 22, 23
    ];

    var SAYAPKANANINNER_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SAYAPKANANINNER_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(sayapkananinner_faces), GL.STATIC_DRAW);

    var sayapkiriinner_vertex = [
        -3.6, -0.25, -1, 0, 0, 0.545,
        3, -0.25, -1, 0, 0, 0.545,
        3, 0.25, -1, 0, 0, 0.545,
        -3.6, 0.25, -1, 0, 0, 0.545,

        -1.2, -0.25, 2, 0, 0, 0.545,
        3, -0.25, 0.7, 0, 0, 0.545,
        3, 0.25, 0.7, 0, 0, 0.545,
        -1.2, 0.25, 2, 0, 0, 0.545,

        -3.6, -0.25, -1, 0, 0, 0.545,
        -3.6, 0.25, -1, 0, 0, 0.545,
        -1.2, 0.25, 2, 0, 0, 0.545,
        -1.2, -0.25, 2, 0, 0, 0.545,

        3, -0.25, -1, 0, 0, 0.545,
        3, 0.25, -1, 0, 0, 0.545,
        3, 0.25, 0.7, 0, 0, 0.545,
        3, -0.25, 0.7, 0, 0, 0.545,

        -3.6, -0.25, -1, 0, 0, 0.545,
        -1.2, -0.25, 2, 0, 0, 0.545,
        3, -0.25, 0.7, 0, 0, 0.545,
        3, -0.25, -1, 0, 0, 0.545,

        -3.6, 0.25, -1, 0, 0, 0.545,
        -1.2, 0.25, 2, 0, 0, 0.545,
        3, 0.25, 0.7, 0, 0, 0.545,
        3, 0.25, -1, 0, 0, 0.545
    ];


    var SAYAPKIRIINNER_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, SAYAPKIRIINNER_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(sayapkiriinner_vertex), GL.STATIC_DRAW);

    // FACES
    var sayapkiriinner_faces = [
        0, 1, 2,
        0, 2, 3,

        4, 5, 6,
        4, 6, 7,

        8, 9, 10,
        8, 10, 11,

        12, 13, 14,
        12, 14, 15,

        16, 17, 18,
        16, 18, 19,

        20, 21, 22,
        20, 22, 23
    ];

    var SAYAPKIRIINNER_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SAYAPKIRIINNER_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(sayapkiriinner_faces), GL.STATIC_DRAW);

    // SAYAPKANANOUTER
    var sayapkananouter_vertex = [
        -0.7, -0.12, -1, 1, 1, 1,
        3.5, -0.12, -2.3, 1, 1, 1,
        3.5, 0.12, -2.3, 1, 1, 1,
        -0.7, 0.12, -1, 1, 1, 1,

        2, -0.12, 3, 1, 1, 1,
        3.5, -0.12, 3, 1, 1, 1,
        3.5, 0.12, 3, 1, 1, 1,
        2, 0.12, 3, 1, 1, 1,

        -0.7, -0.12, -1, 1, 1, 1,
        -0.7, 0.12, -1, 1, 1, 1,
        2, 0.12, 3, 1, 1, 1,
        2, -0.12, 3, 1, 1, 1,

        3.5, -0.12, -2.3, 1, 1, 1,
        3.5, 0.12, -2.3, 1, 1, 1,
        3.5, 0.12, 3, 1, 1, 1,
        3.5, -0.12, 3, 1, 1, 1,

        -0.7, -0.12, -1, 1, 1, 1,
        2, -0.12, 3, 1, 1, 1,
        3.5, -0.12, 3, 1, 1, 1,
        3.5, -0.12, -2.3, 1, 1, 1,

        -0.7, 0.12, -1, 1, 1, 1,
        2, 0.12, 3, 1, 1, 1,
        3.5, 0.12, 3, 1, 1, 1,
        3.5, 0.12, -2.3, 1, 1, 1
    ];


    var SAYAPKANANOUTER_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, SAYAPKANANOUTER_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(sayapkananouter_vertex), GL.STATIC_DRAW);

    // FACES
    var sayapkananouter_faces = [
        0, 1, 2,
        0, 2, 3,

        4, 5, 6,
        4, 6, 7,

        8, 9, 10,
        8, 10, 11,

        12, 13, 14,
        12, 14, 15,

        16, 17, 18,
        16, 18, 19,

        20, 21, 22,
        20, 22, 23
    ];

    var SAYAPKANANOUTER_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SAYAPKANANOUTER_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(sayapkananouter_faces), GL.STATIC_DRAW);

    // SAYAPKIRIOUTER
    var sayapkiriouter_vertex = [
        -0.7, -0.12, -1, 1, 1, 1,
        3.5, -0.12, -2.3, 1, 1, 1,
        3.5, 0.12, -2.3, 1, 1, 1,
        -0.7, 0.12, -1, 1, 1, 1,

        2, -0.12, 3, 1, 1, 1,
        3.5, -0.12, 3, 1, 1, 1,
        3.5, 0.12, 3, 1, 1, 1,
        2, 0.12, 3, 1, 1, 1,

        -0.7, -0.12, -1, 1, 1, 1,
        -0.7, 0.12, -1, 1, 1, 1,
        2, 0.12, 3, 1, 1, 1,
        2, -0.12, 3, 1, 1, 1,

        3.5, -0.12, -2.3, 1, 1, 1,
        3.5, 0.12, -2.3, 1, 1, 1,
        3.5, 0.12, 3, 1, 1, 1,
        3.5, -0.12, 3, 1, 1, 1,

        -0.7, -0.12, -1, 1, 1, 1,
        2, -0.12, 3, 1, 1, 1,
        3.5, -0.12, 3, 1, 1, 1,
        3.5, -0.12, -2.3, 1, 1, 1,

        -0.7, 0.12, -1, 1, 1, 1,
        2, 0.12, 3, 1, 1, 1,
        3.5, 0.12, 3, 1, 1, 1,
        3.5, 0.12, -2.3, 1, 1, 1
    ];


    var SAYAPKIRIOUTER_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, SAYAPKIRIOUTER_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(sayapkiriouter_vertex), GL.STATIC_DRAW);

    // FACES
    var sayapkiriouter_faces = [
        0, 1, 2,
        0, 2, 3,

        4, 5, 6,
        4, 6, 7,

        8, 9, 10,
        8, 10, 11,

        12, 13, 14,
        12, 14, 15,

        16, 17, 18,
        16, 18, 19,

        20, 21, 22,
        20, 22, 23
    ];

    var SAYAPKIRIOUTER_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SAYAPKIRIOUTER_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(sayapkiriouter_faces), GL.STATIC_DRAW);

    // MISSILEKANAN
    // POINTS :
    var missileKananPoints = [];
    var jumlahPoints = 100;
    var missileKananFaces = [];

    // Pushing vertices for the missile
    for (var i = 0; i < jumlahPoints; i++) {
        var theta = (i / jumlahPoints) * 2 * Math.PI;

        var x = Math.cos(theta) * 0.3;
        var y = Math.sin(theta) * 0.3;

        missileKananPoints.push(x, y, 0);

        missileKananPoints.push(1, 0, 0);
    }

    for (var i = 0; i < jumlahPoints; i++) {
        var theta = (i / jumlahPoints) * 2 * Math.PI;

        var x = Math.cos(theta) * 0.3;
        var y = Math.sin(theta) * 0.3;

        missileKananPoints.push(x, y, 2);
        missileKananPoints.push(1, 0, 0);
    }

    missileKananFaces.push(100);


    for (var i = 0; i < jumlahPoints; i++) {
        missileKananFaces.push(i);
    }

    for (var i = 0; i < jumlahPoints; i++) {
        missileKananFaces.push(i);
    }

    for (var i = 0; i < jumlahPoints; i++) {
        missileKananFaces.push(i, (i + jumlahPoints) % (jumlahPoints * 2), (i + 1) % jumlahPoints);
        missileKananFaces.push((i + 1) % jumlahPoints, (i + jumlahPoints) % (jumlahPoints * 2), (i + 1 + jumlahPoints) % (jumlahPoints * 2));
    }

    var MISSILEKANAN_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, MISSILEKANAN_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(missileKananPoints), GL.STATIC_DRAW);

    var MISSILEKANAN_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, MISSILEKANAN_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(missileKananFaces), GL.STATIC_DRAW);

    // MISSILEKIRI
    // POINTS :
    var missileKiriPoints = [];
    var jumlahPoints = 100;
    var missileKiriFaces = [];

    // Pushing vertices for the missile
    for (var i = 0; i < jumlahPoints; i++) {
        var theta = (i / jumlahPoints) * 2 * Math.PI;

        var x = Math.cos(theta) * 0.3;
        var y = Math.sin(theta) * 0.3;

        missileKiriPoints.push(x, y, 0); // Pushing vertices on the base of the missile

        missileKiriPoints.push(1, 0, 0); // Modified to adjust the shape of the missile
    }

    for (var i = 0; i < jumlahPoints; i++) {
        var theta = (i / jumlahPoints) * 2 * Math.PI;

        var x = Math.cos(theta) * 0.3;
        var y = Math.sin(theta) * 0.3;

        missileKiriPoints.push(x, y, 2); // Pushing vertices on the top of the missile

        missileKiriPoints.push(1, 0, 0); // Modified to adjust the shape of the missile
    }

    missileKiriFaces.push(100); // Not sure what this line is intended for

    // Creating faces for the missile
    for (var i = 0; i < jumlahPoints; i++) {
        missileKiriFaces.push(i);
    }

    for (var i = 0; i < jumlahPoints; i++) {
        missileKiriFaces.push(i);
    }

    // Creating faces for the tube
    for (var i = 0; i < jumlahPoints; i++) {
        missileKiriFaces.push(i, (i + jumlahPoints) % (jumlahPoints * 2), (i + 1) % jumlahPoints);
        missileKiriFaces.push((i + 1) % jumlahPoints, (i + jumlahPoints) % (jumlahPoints * 2), (i + 1 + jumlahPoints) % (jumlahPoints * 2));
    }

    var MISSILEKIRI_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, MISSILEKIRI_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(missileKiriPoints), GL.STATIC_DRAW);

    var MISSILEKIRI_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, MISSILEKIRI_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(missileKiriFaces), GL.STATIC_DRAW);

    //TUTUP MISSILE KANAN
    var tutupmissilekananPoints2 = [];
    var tutupmissilekananFaces2 = [];

    for (var i = 0; i < jumlahPoints; i++) {
        var theta = (i / jumlahPoints) * 2 * Math.PI;

        var x = Math.cos(theta) * 0.3;
        var y = Math.sin(theta) * 0.3;

        tutupmissilekananPoints2.push(x, y, 0);

        tutupmissilekananPoints2.push(1, 0, 0);
    }

    tutupmissilekananPoints2.push(0, 0, 1);
    tutupmissilekananPoints2.push(1, 0, 0);
    tutupmissilekananFaces2.push(100);

    for (var i = 0; i < jumlahPoints; i++) {
        tutupmissilekananFaces2.push(i);
    }

    for (var i = 0; i < 100; i++) {
        tutupmissilekananFaces2.push(i);
        tutupmissilekananFaces2.push(i + 1);
        tutupmissilekananFaces2.push(tutupmissilekananPoints2.length - 1);
    }

    var TUTUP_MISSILE_KANAN_VERTEX2 = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, TUTUP_MISSILE_KANAN_VERTEX2);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(tutupmissilekananPoints2), GL.STATIC_DRAW);

    var tutupmissilekanan_faces2 = tutupmissilekananFaces2;
    var TUTUP_MISSILE_KANAN_FACES2 = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, TUTUP_MISSILE_KANAN_FACES2);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(tutupmissilekanan_faces2), GL.STATIC_DRAW);

    // TUTUP MISSILE KIRI
    var tutupmissilekiriPoints2 = [];
    var tutupmissilekiriFaces2 = [];

    for (var i = 0; i < jumlahPoints; i++) {
        var theta = (i / jumlahPoints) * 2 * Math.PI;

        var x = Math.cos(theta) * 0.3;
        var y = Math.sin(theta) * 0.3;

        tutupmissilekiriPoints2.push(x, y, 0);

        tutupmissilekiriPoints2.push(1, 0, 0);
    }

    tutupmissilekiriPoints2.push(0, 0, 1);
    tutupmissilekiriPoints2.push(1, 0, 0);
    tutupmissilekiriFaces2.push(100);

    for (var i = 0; i < jumlahPoints; i++) {
        tutupmissilekiriFaces2.push(i);
    }

    for (var i = 0; i < 100; i++) {
        tutupmissilekiriFaces2.push(i);
        tutupmissilekiriFaces2.push(i + 1);
        tutupmissilekiriFaces2.push(tutupmissilekiriPoints2.length - 1);
    }

    var TUTUP_MISSILE_KIRI_VERTEX2 = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, TUTUP_MISSILE_KIRI_VERTEX2);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(tutupmissilekiriPoints2), GL.STATIC_DRAW);

    var tutupmissilekiri_faces2 = tutupmissilekiriFaces2;
    var TUTUP_MISSILE_KIRI_FACES2 = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, TUTUP_MISSILE_KIRI_FACES2);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(tutupmissilekiri_faces2), GL.STATIC_DRAW);

    // BATANGPOHON
    // POINTS :
    var batangpohonPoints = [];
    var jumlahPoints = 100;
    var batangpohonFaces = [];

    // Pushing vertices for the batangpohon
    for (var i = 0; i < jumlahPoints; i++) {
        var theta = (i / jumlahPoints) * 2 * Math.PI;

        var x = Math.cos(theta) * 2;
        var y = Math.sin(theta) * 2;

        batangpohonPoints.push(x, y, 0); // Pushing vertices on the base of the batangpohon

        batangpohonPoints.push(0.6, 0.4, 0.2); // Modified to adjust the shape of the batangpohon
    }

    for (var i = 0; i < jumlahPoints; i++) {
        var theta = (i / jumlahPoints) * 2 * Math.PI;

        var x = Math.cos(theta) * 2;
        var y = Math.sin(theta) * 2;

        batangpohonPoints.push(x, y, 5); // Pushing vertices on the top of the batangpohon

        batangpohonPoints.push(0.6, 0.4, 0.2); // Modified to adjust the shape of the batangpohon
    }

    batangpohonFaces.push(100); // Not sure what this line is intended for

    // Creating faces for the batangpohon
    for (var i = 0; i < jumlahPoints; i++) {
        batangpohonFaces.push(i);
    }

    for (var i = 0; i < jumlahPoints; i++) {
        batangpohonFaces.push(i);
    }

    // Creating faces for the tube
    for (var i = 0; i < jumlahPoints; i++) {
        batangpohonFaces.push(i, (i + jumlahPoints) % (jumlahPoints * 2), (i + 1) % jumlahPoints);
        batangpohonFaces.push((i + 1) % jumlahPoints, (i + jumlahPoints) % (jumlahPoints * 2), (i + 1 + jumlahPoints) % (jumlahPoints * 2));
    }

    var BATANGPOHON_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, BATANGPOHON_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(batangpohonPoints), GL.STATIC_DRAW);

    var BATANGPOHON_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, BATANGPOHON_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(batangpohonFaces), GL.STATIC_DRAW);

    // daunPohon
    var daunpohonPoints2 = [];
    var daunpohonFaces2 = [];

    for (var i = 0; i < jumlahPoints; i++) {
        var theta = (i / jumlahPoints) * 2 * Math.PI;

        var x = Math.cos(theta) * 5;
        var y = Math.sin(theta) * 5;

        daunpohonPoints2.push(x, y, 0);

        daunpohonPoints2.push(0, 1, 0);
    }

    daunpohonPoints2.push(0, 0, 15);
    daunpohonPoints2.push(0, 1, 0);
    daunpohonFaces2.push(100);

    for (var i = 0; i < jumlahPoints; i++) {
        daunpohonFaces2.push(i);
    }

    for (var i = 0; i < 100; i++) {
        daunpohonFaces2.push(i);
        daunpohonFaces2.push(i + 1);
        daunpohonFaces2.push(daunpohonPoints2.length - 1);
    }

    var DAUNPOHON_VERTEX2 = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, DAUNPOHON_VERTEX2);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(daunpohonPoints2), GL.STATIC_DRAW);

    var daunpohon_faces2 = daunpohonFaces2;
    var DAUNPOHON_FACES2 = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, DAUNPOHON_FACES2);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(daunpohon_faces2), GL.STATIC_DRAW);


    //MATRIX
    var PROJMATRIX = LIBS.get_projection(40, CANVAS.width / CANVAS.height, 1, 100);
    var MOVEMATRIX = LIBS.get_I4();
    var VIEWMATRIX = LIBS.get_I4();

    var MOVEMATRIX_TABUNG = LIBS.get_I4();

    var MOVEMATRIX_KERUCUT = LIBS.get_I4();

    var MOVEMATRIX_BALOKKIRI = LIBS.get_I4();

    var MOVEMATRIX_BALOKKANAN = LIBS.get_I4();

    var MOVEMATRIX_BALOKATAS = LIBS.get_I4();

    var MOVEMATRIX_BALOKBAWAH = LIBS.get_I4();

    var MOVEMATRIX_COCKPIT = LIBS.get_I4();

    var MOVEMATRIX_VENTKANAN = LIBS.get_I4();

    var MOVEMATRIX_VENTKIRI = LIBS.get_I4();

    var MOVEMATRIX_VENTBELAKANG = LIBS.get_I4();

    var MOVEMATRIX_VENTBELAKANGKANAN = LIBS.get_I4();

    var MOVEMATRIX_VENTKIRIBELAKANG = LIBS.get_I4();

    var MOVEMATRIX_VENTKANANBELAKANG = LIBS.get_I4();

    var MOVEMATRIX_SAYAPKANANINNER = LIBS.get_I4();

    var MOVEMATRIX_SAYAPKIRIINNER = LIBS.get_I4();

    var MOVEMATRIX_SAYAPKANANOUTER = LIBS.get_I4();

    var MOVEMATRIX_SAYAPKIRIOUTER = LIBS.get_I4();

    var MOVEMATRIX_SUN = LIBS.get_I4();

    var MOVEMATRIX_MISSILEKANAN = LIBS.get_I4();

    var MOVEMATRIX_MISSILEKIRI = LIBS.get_I4();

    var MOVEMATRIX_TUTUPMISSILEKANAN = LIBS.get_I4();

    var MOVEMATRIX_TUTUPMISSILEKIRI = LIBS.get_I4();

    var MOVEMATRIX_BATANGPOHON = LIBS.get_I4();

    var MOVEMATRIX_DAUNPOHON = LIBS.get_I4();

    //POSISI AWAL PESAWAT
    //TANAH
    LIBS.set_I4(MOVEMATRIX);
    LIBS.rotateX(MOVEMATRIX, Math.PI / 2);
    LIBS.translateY(MOVEMATRIX, -3);

    GL.clearColor(0.0, 0.0, 0.0, 0.0);

    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);

    GL.clearDepth(1.0);

    var time_prev = 0;
    var animate = function (time) {

        if (time > 0) {
            var dt = (time - time_prev);
            if (!drag) {
                dX *= AMORTIZATION, dY *= AMORTIZATION;
                THETA += dX, PHI += dY;
            }

            var factor = 0.1;

            // cameraPosition.x += (targetCameraPosition.x - cameraPosition.x) * 0.1;
            // cameraPosition.y += (targetCameraPosition.y - cameraPosition.y) * 0.1;
            // cameraPosition.z += (targetCameraPosition.z - cameraPosition.z) * 0.1;

            POSISIKERUCUT.x += (targetPosisiKerucut.x - POSISIKERUCUT.x) * factor;
            POSISIKERUCUT.y += (targetPosisiKerucut.y - POSISIKERUCUT.y) * factor;
            POSISIKERUCUT.z += (targetPosisiKerucut.z - POSISIKERUCUT.z) * factor;

            POSISITABUNG.x += (targetPosisiTabung.x - POSISITABUNG.x) * factor;
            POSISITABUNG.y += (targetPosisiTabung.y - POSISITABUNG.y) * factor;
            POSISITABUNG.z += (targetPosisiTabung.z - POSISITABUNG.z) * factor;

            POSISIBALOKKIRI.x += (targetPosisiBalokKiri.x - POSISIBALOKKIRI.x) * factor;
            POSISIBALOKKIRI.y += (targetPosisiBalokKiri.y - POSISIBALOKKIRI.y) * factor;
            POSISIBALOKKIRI.z += (targetPosisiBalokKiri.z - POSISIBALOKKIRI.z) * factor;

            POSISIBALOKKANAN.x += (targetPosisiBalokKanan.x - POSISIBALOKKANAN.x) * factor;
            POSISIBALOKKANAN.y += (targetPosisiBalokKanan.y - POSISIBALOKKANAN.y) * factor;
            POSISIBALOKKANAN.z += (targetPosisiBalokKanan.z - POSISIBALOKKANAN.z) * factor;

            POSISIBALOKATAS.x += (targetPosisiBalokAtas.x - POSISIBALOKATAS.x) * factor;
            POSISIBALOKATAS.y += (targetPosisiBalokAtas.y - POSISIBALOKATAS.y) * factor;
            POSISIBALOKATAS.z += (targetPosisiBalokAtas.z - POSISIBALOKATAS.z) * factor;

            POSISIBALOKBAWAH.x += (targetPosisiBalokBawah.x - POSISIBALOKBAWAH.x) * factor;
            POSISIBALOKBAWAH.y += (targetPosisiBalokBawah.y - POSISIBALOKBAWAH.y) * factor;
            POSISIBALOKBAWAH.z += (targetPosisiBalokBawah.z - POSISIBALOKBAWAH.z) * factor;

            POSISICOCKPIT.x += (targetPosisiCockpit.x - POSISICOCKPIT.x) * factor;
            POSISICOCKPIT.y += (targetPosisiCockpit.y - POSISICOCKPIT.y) * factor;
            POSISICOCKPIT.z += (targetPosisiCockpit.z - POSISICOCKPIT.z) * factor;

            POSISIVENTKANAN.x += (targetPosisiVentKanan.x - POSISIVENTKANAN.x) * factor;
            POSISIVENTKANAN.y += (targetPosisiVentKanan.y - POSISIVENTKANAN.y) * factor;
            POSISIVENTKANAN.z += (targetPosisiVentKanan.z - POSISIVENTKANAN.z) * factor;

            POSISIVENTKIRI.x += (targetPosisiVentKiri.x - POSISIVENTKIRI.x) * factor;
            POSISIVENTKIRI.y += (targetPosisiVentKiri.y - POSISIVENTKIRI.y) * factor;
            POSISIVENTKIRI.z += (targetPosisiVentKiri.z - POSISIVENTKIRI.z) * factor;

            POSISIVENTBELAKANG.x += (targetPosisiVentBelakang.x - POSISIVENTBELAKANG.x) * factor;
            POSISIVENTBELAKANG.y += (targetPosisiVentBelakang.y - POSISIVENTBELAKANG.y) * factor;
            POSISIVENTBELAKANG.z += (targetPosisiVentBelakang.z - POSISIVENTBELAKANG.z) * factor;

            POSISIVENTBELAKANGKANAN.x += (targetPosisiVentBelakangKanan.x - POSISIVENTBELAKANGKANAN.x) * factor;
            POSISIVENTBELAKANGKANAN.y += (targetPosisiVentBelakangKanan.y - POSISIVENTBELAKANGKANAN.y) * factor;
            POSISIVENTBELAKANGKANAN.z += (targetPosisiVentBelakangKanan.z - POSISIVENTBELAKANGKANAN.z) * factor;

            POSISIVENTKIRIBELAKANG.x += (targetPosisiVentKiriBelakang.x - POSISIVENTKIRIBELAKANG.x) * factor;
            POSISIVENTKIRIBELAKANG.y += (targetPosisiVentKiriBelakang.y - POSISIVENTKIRIBELAKANG.y) * factor;
            POSISIVENTKIRIBELAKANG.z += (targetPosisiVentKiriBelakang.z - POSISIVENTKIRIBELAKANG.z) * factor;

            POSISIVENTKANANBELAKANG.x += (targetPosisiVentKananBelakang.x - POSISIVENTKANANBELAKANG.x) * factor;
            POSISIVENTKANANBELAKANG.y += (targetPosisiVentKananBelakang.y - POSISIVENTKANANBELAKANG.y) * factor;
            POSISIVENTKANANBELAKANG.z += (targetPosisiVentKananBelakang.z - POSISIVENTKANANBELAKANG.z) * factor;

            POSISISAYAPKANANINNER.x += (targetPosisiSayapKananInner.x - POSISISAYAPKANANINNER.x) * factor;
            POSISISAYAPKANANINNER.y += (targetPosisiSayapKananInner.y - POSISISAYAPKANANINNER.y) * factor;
            POSISISAYAPKANANINNER.z += (targetPosisiSayapKananInner.z - POSISISAYAPKANANINNER.z) * factor;

            POSISISAYAPKIRIINNER.x += (targetPosisiSayapKiriInner.x - POSISISAYAPKIRIINNER.x) * factor;
            POSISISAYAPKIRIINNER.y += (targetPosisiSayapKiriInner.y - POSISISAYAPKIRIINNER.y) * factor;
            POSISISAYAPKIRIINNER.z += (targetPosisiSayapKiriInner.z - POSISISAYAPKIRIINNER.z) * factor;

            POSISISAYAPKANANOUTER.x += (targetPosisiSayapKananOuter.x - POSISISAYAPKANANOUTER.x) * factor;
            POSISISAYAPKANANOUTER.y += (targetPosisiSayapKananOuter.y - POSISISAYAPKANANOUTER.y) * factor;
            POSISISAYAPKANANOUTER.z += (targetPosisiSayapKananOuter.z - POSISISAYAPKANANOUTER.z) * factor;

            POSISISAYAPKIRIOUTER.x += (targetPosisiSayapKiriOuter.x - POSISISAYAPKIRIOUTER.x) * factor;
            POSISISAYAPKIRIOUTER.y += (targetPosisiSayapKiriOuter.y - POSISISAYAPKIRIOUTER.y) * factor;
            POSISISAYAPKIRIOUTER.z += (targetPosisiSayapKiriOuter.z - POSISISAYAPKIRIOUTER.z) * factor;

            POSISIMISSILEKANAN.x += (targetPosisiMissileKanan.x - POSISIMISSILEKANAN.x) * factor;
            POSISIMISSILEKANAN.y += (targetPosisiMissileKanan.y - POSISIMISSILEKANAN.y) * factor;
            POSISIMISSILEKANAN.z += (targetPosisiMissileKanan.z - POSISIMISSILEKANAN.z) * factor;

            POSISIMISSILEKIRI.x += (targetPosisiMissileKiri.x - POSISIMISSILEKIRI.x) * factor;
            POSISIMISSILEKIRI.y += (targetPosisiMissileKiri.y - POSISIMISSILEKIRI.y) * factor;
            POSISIMISSILEKIRI.z += (targetPosisiMissileKiri.z - POSISIMISSILEKIRI.z) * factor;

            POSISITUTUPMISSILEKANAN.x += (targetPosisiTutupMissileKanan.x - POSISITUTUPMISSILEKANAN.x) * factor;
            POSISITUTUPMISSILEKANAN.y += (targetPosisiTutupMissileKanan.y - POSISITUTUPMISSILEKANAN.y) * factor;
            POSISITUTUPMISSILEKANAN.z += (targetPosisiTutupMissileKanan.z - POSISITUTUPMISSILEKANAN.z) * factor;

            POSISITUTUPMISSILEKIRI.x += (targetPosisiTutupMissileKiri.x - POSISITUTUPMISSILEKIRI.x) * factor;
            POSISITUTUPMISSILEKIRI.y += (targetPosisiTutupMissileKiri.y - POSISITUTUPMISSILEKIRI.y) * factor;
            POSISITUTUPMISSILEKIRI.z += (targetPosisiTutupMissileKiri.z - POSISITUTUPMISSILEKIRI.z) * factor;

            //CAMERA
            LIBS.set_I4(VIEWMATRIX);
            LIBS.translateX(VIEWMATRIX, cameraPosition.x);
            LIBS.translateY(VIEWMATRIX, cameraPosition.y);
            LIBS.translateZ(VIEWMATRIX, cameraPosition.z);
            LIBS.rotateY(VIEWMATRIX, 3.15)
            // LIBS.rotateX(VIEWMATRIX, PHI);
            LIBS.rotateY(VIEWMATRIX, THETA);

            console.log(cameraPosition.x);
            console.log(cameraPosition.y);
            console.log(cameraPosition.z);

            //SUN
            LIBS.set_I4(MOVEMATRIX_SUN);
            LIBS.translateX(MOVEMATRIX_SUN, -8);
            LIBS.translateZ(MOVEMATRIX_SUN, 75);
            LIBS.translateY(MOVEMATRIX_SUN, 20);
            //Tabung
            LIBS.set_I4(MOVEMATRIX_TABUNG);
            LIBS.rotateY(MOVEMATRIX_TABUNG, -9.424);
            LIBS.translateX(MOVEMATRIX_TABUNG, POSISITABUNG.x);
            LIBS.translateY(MOVEMATRIX_TABUNG, POSISITABUNG.y);
            LIBS.translateZ(MOVEMATRIX_TABUNG, POSISITABUNG.z);

            //Kerucut
            LIBS.set_I4(MOVEMATRIX_KERUCUT);
            //Movement
            LIBS.translateX(MOVEMATRIX_KERUCUT, POSISIKERUCUT.x);
            LIBS.translateY(MOVEMATRIX_KERUCUT, POSISIKERUCUT.y);
            LIBS.translateZ(MOVEMATRIX_KERUCUT, POSISIKERUCUT.z);

            // Balok Kiri
            LIBS.set_I4(MOVEMATRIX_BALOKKIRI);
            LIBS.rotateY(MOVEMATRIX_BALOKKIRI, 11);
            LIBS.rotateZ(MOVEMATRIX_BALOKKIRI, -11);
            //Movement
            LIBS.translateX(MOVEMATRIX_BALOKKIRI, POSISIBALOKKIRI.x);
            LIBS.translateY(MOVEMATRIX_BALOKKIRI, POSISIBALOKKIRI.y);
            LIBS.translateZ(MOVEMATRIX_BALOKKIRI, POSISIBALOKKIRI.z);

            // Balok Kanan
            LIBS.set_I4(MOVEMATRIX_BALOKKANAN);
            LIBS.rotateY(MOVEMATRIX_BALOKKANAN, -11);
            LIBS.rotateZ(MOVEMATRIX_BALOKKANAN, -11);
            //Movement
            LIBS.translateX(MOVEMATRIX_BALOKKANAN, POSISIBALOKKANAN.x);
            LIBS.translateY(MOVEMATRIX_BALOKKANAN, POSISIBALOKKANAN.y);
            LIBS.translateZ(MOVEMATRIX_BALOKKANAN, POSISIBALOKKANAN.z);

            // Balok Atas
            LIBS.set_I4(MOVEMATRIX_BALOKATAS);
            LIBS.rotateY(MOVEMATRIX_BALOKATAS, -11);
            //Movement
            LIBS.translateX(MOVEMATRIX_BALOKATAS, POSISIBALOKATAS.x);
            LIBS.translateY(MOVEMATRIX_BALOKATAS, POSISIBALOKATAS.y);
            LIBS.translateZ(MOVEMATRIX_BALOKATAS, POSISIBALOKATAS.z);

            // Balok Bawah
            LIBS.set_I4(MOVEMATRIX_BALOKBAWAH);
            LIBS.rotateY(MOVEMATRIX_BALOKBAWAH, -11);
            //Movement
            LIBS.translateX(MOVEMATRIX_BALOKBAWAH, POSISIBALOKBAWAH.x);
            LIBS.translateY(MOVEMATRIX_BALOKBAWAH, POSISIBALOKBAWAH.y);
            LIBS.translateZ(MOVEMATRIX_BALOKBAWAH, POSISIBALOKBAWAH.z);

            // Cockpit
            LIBS.set_I4(MOVEMATRIX_COCKPIT);
            LIBS.rotateX(MOVEMATRIX_COCKPIT, 4.7);
            LIBS.rotateY(MOVEMATRIX_COCKPIT, 4.7);
            //Movement
            LIBS.translateX(MOVEMATRIX_COCKPIT, POSISICOCKPIT.x);
            LIBS.translateY(MOVEMATRIX_COCKPIT, POSISICOCKPIT.y);
            LIBS.translateZ(MOVEMATRIX_COCKPIT, POSISICOCKPIT.z);

            // Vent Kanan
            LIBS.set_I4(MOVEMATRIX_VENTKANAN);
            LIBS.rotateY(MOVEMATRIX_VENTKANAN, 1.58);
            //Movement
            LIBS.translateX(MOVEMATRIX_VENTKANAN, POSISIVENTKANAN.x);
            LIBS.translateY(MOVEMATRIX_VENTKANAN, POSISIVENTKANAN.y);
            LIBS.translateZ(MOVEMATRIX_VENTKANAN, POSISIVENTKANAN.z);

            //  Vent Kiri
            LIBS.set_I4(MOVEMATRIX_VENTKIRI);
            LIBS.rotateY(MOVEMATRIX_VENTKIRI, 1.58);
            //Movement
            LIBS.translateX(MOVEMATRIX_VENTKIRI, POSISIVENTKIRI.x);
            LIBS.translateY(MOVEMATRIX_VENTKIRI, POSISIVENTKIRI.y);
            LIBS.translateZ(MOVEMATRIX_VENTKIRI, POSISIVENTKIRI.z);

            //Vent Belakang Kiri
            LIBS.set_I4(MOVEMATRIX_VENTBELAKANG);
            LIBS.rotateY(MOVEMATRIX_VENTBELAKANG, -11);
            LIBS.rotateZ(MOVEMATRIX_VENTBELAKANG, -11);
            LIBS.translateZ(MOVEMATRIX_VENTBELAKANG, -4.25);
            //Movement
            LIBS.translateX(MOVEMATRIX_VENTBELAKANG, POSISIVENTBELAKANG.x);
            LIBS.translateY(MOVEMATRIX_VENTBELAKANG, POSISIVENTBELAKANG.y);
            LIBS.translateZ(MOVEMATRIX_VENTBELAKANG, POSISIVENTBELAKANG.z);

            //Vent Belakang Kanan
            LIBS.set_I4(MOVEMATRIX_VENTBELAKANGKANAN);
            LIBS.rotateY(MOVEMATRIX_VENTBELAKANGKANAN, -11);
            LIBS.rotateZ(MOVEMATRIX_VENTBELAKANGKANAN, -11);
            LIBS.translateZ(MOVEMATRIX_VENTBELAKANGKANAN, -4.25);
            //Movement
            LIBS.translateX(MOVEMATRIX_VENTBELAKANGKANAN, POSISIVENTBELAKANGKANAN.x);
            LIBS.translateY(MOVEMATRIX_VENTBELAKANGKANAN, POSISIVENTBELAKANGKANAN.y);
            LIBS.translateZ(MOVEMATRIX_VENTBELAKANGKANAN, POSISIVENTBELAKANGKANAN.z);

            // Vent Kiri Belakang
            LIBS.set_I4(MOVEMATRIX_VENTKIRIBELAKANG);
            LIBS.rotateY(MOVEMATRIX_VENTKIRIBELAKANG, 1.58);
            LIBS.rotateX(MOVEMATRIX_VENTKIRIBELAKANG, -0.06);
            //Movement
            LIBS.translateX(MOVEMATRIX_VENTKIRIBELAKANG, POSISIVENTKIRIBELAKANG.x);
            LIBS.translateY(MOVEMATRIX_VENTKIRIBELAKANG, POSISIVENTKIRIBELAKANG.y);
            LIBS.translateZ(MOVEMATRIX_VENTKIRIBELAKANG, POSISIVENTKIRIBELAKANG.z);

            // Translate Vent Kanan Belakang
            LIBS.set_I4(MOVEMATRIX_VENTKANANBELAKANG);
            LIBS.rotateY(MOVEMATRIX_VENTKANANBELAKANG, 1.58);
            LIBS.rotateX(MOVEMATRIX_VENTKANANBELAKANG, -0.06);
            //Movement
            LIBS.translateX(MOVEMATRIX_VENTKANANBELAKANG, POSISIVENTKANANBELAKANG.x);
            LIBS.translateY(MOVEMATRIX_VENTKANANBELAKANG, POSISIVENTKANANBELAKANG.y);
            LIBS.translateZ(MOVEMATRIX_VENTKANANBELAKANG, POSISIVENTKANANBELAKANG.z);

            // Translate Sayap Kanan Inner
            LIBS.set_I4(MOVEMATRIX_SAYAPKANANINNER);
            LIBS.rotateY(MOVEMATRIX_SAYAPKANANINNER, -11);
            //Movement
            LIBS.translateX(MOVEMATRIX_SAYAPKANANINNER, POSISISAYAPKANANINNER.x);
            LIBS.translateY(MOVEMATRIX_SAYAPKANANINNER, POSISISAYAPKANANINNER.y);
            LIBS.translateZ(MOVEMATRIX_SAYAPKANANINNER, POSISISAYAPKANANINNER.z);

            // Translate Sayap Kiri Inner
            LIBS.set_I4(MOVEMATRIX_SAYAPKIRIINNER);
            LIBS.rotateY(MOVEMATRIX_SAYAPKIRIINNER, 11);
            LIBS.rotateX(MOVEMATRIX_SAYAPKIRIINNER, 3.14);
            //Movement
            LIBS.translateX(MOVEMATRIX_SAYAPKIRIINNER, POSISISAYAPKIRIINNER.x);
            LIBS.translateY(MOVEMATRIX_SAYAPKIRIINNER, POSISISAYAPKIRIINNER.y);
            LIBS.translateZ(MOVEMATRIX_SAYAPKIRIINNER, POSISISAYAPKIRIINNER.z);

            // Translate Sayap Kanan Outer
            LIBS.set_I4(MOVEMATRIX_SAYAPKANANOUTER);
            LIBS.rotateY(MOVEMATRIX_SAYAPKANANOUTER, -11);
            //Movement
            LIBS.translateX(MOVEMATRIX_SAYAPKANANOUTER, POSISISAYAPKANANOUTER.x);
            LIBS.translateY(MOVEMATRIX_SAYAPKANANOUTER, POSISISAYAPKANANOUTER.y);
            LIBS.translateZ(MOVEMATRIX_SAYAPKANANOUTER, POSISISAYAPKANANOUTER.z);
            // LIBS.rotateY(MOVEMATRIX_SAYAPKANANOUTER, -rotateAmount);
            LIBS.rotateY(MOVEMATRIX_SAYAPKANANOUTER, rotateAmount);

            // Translate Sayap Kiri Outer
            LIBS.set_I4(MOVEMATRIX_SAYAPKIRIOUTER);
            LIBS.rotateY(MOVEMATRIX_SAYAPKIRIOUTER, -11);
            LIBS.rotateZ(MOVEMATRIX_SAYAPKIRIOUTER, -9.43);
            //Movement
            LIBS.translateX(MOVEMATRIX_SAYAPKIRIOUTER, POSISISAYAPKIRIOUTER.x);
            LIBS.translateY(MOVEMATRIX_SAYAPKIRIOUTER, POSISISAYAPKIRIOUTER.y);
            LIBS.translateZ(MOVEMATRIX_SAYAPKIRIOUTER, POSISISAYAPKIRIOUTER.z);
            // LIBS.rotateY(MOVEMATRIX_SAYAPKIRIOUTER, rotateAmount);
            LIBS.rotateY(MOVEMATRIX_SAYAPKIRIOUTER, -rotateAmount);

            //MISSILEKANAN
            LIBS.set_I4(MOVEMATRIX_MISSILEKANAN);
            LIBS.translateX(MOVEMATRIX_MISSILEKANAN, POSISIMISSILEKANAN.x);
            LIBS.translateY(MOVEMATRIX_MISSILEKANAN, POSISIMISSILEKANAN.y);
            // LIBS.translateX(MOVEMATRIX_MISSILEKANAN, curvePoints[bezierindex]);
            // LIBS.translateY(MOVEMATRIX_MISSILEKANAN, curvePoints[bezierindex + 1]);
            LIBS.translateZ(MOVEMATRIX_MISSILEKANAN, POSISIMISSILEKANAN.z);

            //MISSILEKIRI
            LIBS.set_I4(MOVEMATRIX_MISSILEKIRI);
            LIBS.translateX(MOVEMATRIX_MISSILEKIRI, POSISIMISSILEKIRI.x);
            LIBS.translateY(MOVEMATRIX_MISSILEKIRI, POSISIMISSILEKIRI.y);
            // LIBS.translateX(MOVEMATRIX_MISSILEKIRI, curvePoints[bezierindex]);
            // LIBS.translateY(MOVEMATRIX_MISSILEKIRI, curvePoints[bezierindex + 1]);
            LIBS.translateZ(MOVEMATRIX_MISSILEKIRI, POSISIMISSILEKIRI.z);

            //MISSILEKANAN
            LIBS.set_I4(MOVEMATRIX_TUTUPMISSILEKANAN);
            LIBS.translateX(MOVEMATRIX_TUTUPMISSILEKANAN, POSISITUTUPMISSILEKANAN.x);
            LIBS.translateY(MOVEMATRIX_TUTUPMISSILEKANAN, POSISITUTUPMISSILEKANAN.y);
            // LIBS.translateX(MOVEMATRIX_TUTUPMISSILEKANAN, curvePoints[bezierindex]);
            // LIBS.translateY(MOVEMATRIX_TUTUPMISSILEKANAN, curvePoints[bezierindex + 1]);
            LIBS.translateZ(MOVEMATRIX_TUTUPMISSILEKANAN, POSISITUTUPMISSILEKANAN.z);

            //MISSILEKIRI
            LIBS.set_I4(MOVEMATRIX_TUTUPMISSILEKIRI);
            LIBS.translateX(MOVEMATRIX_TUTUPMISSILEKIRI, POSISITUTUPMISSILEKIRI.x);
            LIBS.translateY(MOVEMATRIX_TUTUPMISSILEKIRI, POSISITUTUPMISSILEKIRI.y);
            // LIBS.translateX(MOVEMATRIX_TUTUPMISSILEKIRI, curvePoints[bezierindex]);
            // LIBS.translateY(MOVEMATRIX_TUTUPMISSILEKIRI, curvePoints[bezierindex + 1]);
            LIBS.translateZ(MOVEMATRIX_TUTUPMISSILEKIRI, POSISITUTUPMISSILEKIRI.z);

            //BATANG POHON
            LIBS.set_I4(MOVEMATRIX_BATANGPOHON)
            LIBS.translateZ(MOVEMATRIX_BATANGPOHON, 30);
            LIBS.rotateX(MOVEMATRIX_BATANGPOHON, -11);
            LIBS.translateY(MOVEMATRIX_BATANGPOHON, 2);
            LIBS.translateX(MOVEMATRIX_BATANGPOHON, -40);

            //DAUNPOHON
            LIBS.set_I4(MOVEMATRIX_DAUNPOHON)
            LIBS.translateZ(MOVEMATRIX_DAUNPOHON, 30);
            LIBS.rotateX(MOVEMATRIX_DAUNPOHON, 11);
            LIBS.translateY(MOVEMATRIX_DAUNPOHON, 2);
            LIBS.translateX(MOVEMATRIX_DAUNPOHON, -40);
            time_prev = time;
        }

        GL.viewport(0, 0, CANVAS.width, CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.D_BUFFER_BIT);

        GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);


        // DRAWING
        // MAP TANAH
        GL.bindBuffer(GL.ARRAY_BUFFER, SQUARE_VERTEX);

        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.uniform1f(_greyscality, 0.7);
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SQUARE_FACES);
        GL.drawElements(GL.TRIANGLES, square_faces.length, GL.UNSIGNED_SHORT, 0);

        GL.drawElements(GL.LINE_STRIP, square_faces.length, GL.UNSIGNED_SHORT, 0);

        //TABUNG
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_TABUNG);

        GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX);

        GL.uniform1f(_greyscality, 0);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRCLE_FACES);
        GL.drawElements(GL.TRIANGLE_FAN, circleFaces.length, GL.UNSIGNED_SHORT, 0);

        //CONE
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_KERUCUT);

        GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX2);

        GL.uniform1f(_greyscality, 0);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRCLE_FACES2);
        GL.drawElements(GL.TRIANGLE_FAN, circle_faces2.length, GL.UNSIGNED_SHORT, 0);

        //BALOKKIRI
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_BALOKKIRI);

        GL.bindBuffer(GL.ARRAY_BUFFER, BALOKKIRI_VERTEX);

        GL.uniform1f(_greyscality, 1);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, BALOKKIRI_FACES);
        GL.drawElements(GL.TRIANGLES, balokkiri_faces.length, GL.UNSIGNED_SHORT, 0);

        //BALOKKANAN
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_BALOKKANAN);

        GL.bindBuffer(GL.ARRAY_BUFFER, BALOKKANAN_VERTEX);

        GL.uniform1f(_greyscality, 1);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, BALOKKANAN_FACES);
        GL.drawElements(GL.TRIANGLES, balokkanan_faces.length, GL.UNSIGNED_SHORT, 0);

        //BALOKATAS
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_BALOKATAS);

        GL.bindBuffer(GL.ARRAY_BUFFER, BALOKATAS_VERTEX);

        GL.uniform1f(_greyscality, 1);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, BALOKATAS_FACES);
        GL.drawElements(GL.TRIANGLES, balokatas_faces.length, GL.UNSIGNED_SHORT, 0);

        //BALOKBAWAH
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_BALOKBAWAH);

        GL.bindBuffer(GL.ARRAY_BUFFER, BALOKBAWAH_VERTEX);

        GL.uniform1f(_greyscality, 1);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, BALOKBAWAH_FACES);
        GL.drawElements(GL.TRIANGLES, balokbawah_faces.length, GL.UNSIGNED_SHORT, 0);

        //COCKPIT
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_COCKPIT);

        GL.bindBuffer(GL.ARRAY_BUFFER, COCKPIT_VERTEX);

        GL.uniform1f(_greyscality, 1);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, COCKPIT_FACES);
        GL.drawElements(GL.TRIANGLE_FAN, indices.length, GL.UNSIGNED_SHORT, 0);

        // VENTKANAN
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_VENTKANAN);

        GL.bindBuffer(GL.ARRAY_BUFFER, VENTKANAN_VERTEX);

        GL.uniform1f(_greyscality, 0.5);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, VENTKANAN_FACES);
        GL.drawElements(GL.TRIANGLES, ventkanan_faces.length, GL.UNSIGNED_SHORT, 0);

        // VENTKIRI
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_VENTKIRI);

        GL.bindBuffer(GL.ARRAY_BUFFER, VENTKIRI_VERTEX);

        GL.uniform1f(_greyscality, 0.5);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, VENTKIRI_FACES);
        GL.drawElements(GL.TRIANGLES, ventkiri_faces.length, GL.UNSIGNED_SHORT, 0);

        //VENTBELAKANG
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_VENTBELAKANG);

        GL.bindBuffer(GL.ARRAY_BUFFER, VENTBELAKANG_VERTEX);

        GL.uniform1f(_greyscality, 0);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, VENTBELAKANG_FACES);
        GL.drawElements(GL.TRIANGLES, ventbelakang_faces.length, GL.UNSIGNED_SHORT, 0);

        // VENTBELAKANGKANAN
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_VENTBELAKANGKANAN);

        GL.bindBuffer(GL.ARRAY_BUFFER, VENTBELAKANGKANAN_VERTEX);

        GL.uniform1f(_greyscality, 0);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, VENTBELAKANGKANAN_FACES);
        GL.drawElements(GL.TRIANGLES, ventbelakangkanan_faces.length, GL.UNSIGNED_SHORT, 0);

        //VENTKIRIBELAKANG
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_VENTKIRIBELAKANG);

        GL.bindBuffer(GL.ARRAY_BUFFER, VENTKIRIBELAKANG_VERTEX);

        GL.uniform1f(_greyscality, 1);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, VENTKIRIBELAKANG_FACES);
        GL.drawElements(GL.TRIANGLES, ventkiribelakang_faces.length, GL.UNSIGNED_SHORT, 0);

        //VENTKANANBELAKANG
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_VENTKANANBELAKANG);

        GL.bindBuffer(GL.ARRAY_BUFFER, VENTKANANBELAKANG_VERTEX);

        GL.uniform1f(_greyscality, 1);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, VENTKANANBELAKANG_FACES);
        GL.drawElements(GL.TRIANGLES, ventkananbelakang_faces.length, GL.UNSIGNED_SHORT, 0);

        // // SAYAP KANAN INNER
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_SAYAPKANANINNER);

        GL.bindBuffer(GL.ARRAY_BUFFER, SAYAPKANANINNER_VERTEX);

        GL.uniform1f(_greyscality, 1);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SAYAPKANANINNER_FACES);
        GL.drawElements(GL.TRIANGLES, sayapkananinner_faces.length, GL.UNSIGNED_SHORT, 0);

        // SAYAP KIRI INNER
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_SAYAPKIRIINNER);

        GL.bindBuffer(GL.ARRAY_BUFFER, SAYAPKIRIINNER_VERTEX);

        GL.uniform1f(_greyscality, 1);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SAYAPKIRIINNER_FACES);
        GL.drawElements(GL.TRIANGLES, sayapkiriinner_faces.length, GL.UNSIGNED_SHORT, 0);

        // SAYAPKANANOUTER
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_SAYAPKANANOUTER);

        GL.bindBuffer(GL.ARRAY_BUFFER, SAYAPKANANOUTER_VERTEX);

        GL.uniform1f(_greyscality, 0.5);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SAYAPKANANOUTER_FACES);
        GL.drawElements(GL.TRIANGLES, sayapkananouter_faces.length, GL.UNSIGNED_SHORT, 0);

        // SAYAP KIRI OUTER
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_SAYAPKIRIOUTER);

        GL.bindBuffer(GL.ARRAY_BUFFER, SAYAPKIRIOUTER_VERTEX);

        GL.uniform1f(_greyscality, 0.5);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SAYAPKIRIOUTER_FACES);
        GL.drawElements(GL.TRIANGLES, sayapkiriouter_faces.length, GL.UNSIGNED_SHORT, 0);

        //SUN
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_SUN);


        GL.bindBuffer(GL.ARRAY_BUFFER, SUN_VERTEX);

        GL.uniform1f(_greyscality, 1);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);

        GL.bindBuffer(GL.ARRAY_BUFFER, SUN_COLORS);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 0, 0);


        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SUN_FACES);

        GL.drawElements(GL.TRIANGLE_FAN, sunFaces.length, GL.UNSIGNED_SHORT, 0);

        //MISSILE KANAN
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_MISSILEKANAN);

        GL.bindBuffer(GL.ARRAY_BUFFER, MISSILEKANAN_VERTEX);

        GL.uniform1f(_greyscality, 0);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, MISSILEKANAN_FACES);
        GL.drawElements(GL.TRIANGLE_FAN, missileKananFaces.length, GL.UNSIGNED_SHORT, 0);

        // MISSILE KIRI
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_MISSILEKIRI);

        GL.bindBuffer(GL.ARRAY_BUFFER, MISSILEKIRI_VERTEX);

        GL.uniform1f(_greyscality, 0);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, MISSILEKIRI_FACES);
        GL.drawElements(GL.TRIANGLE_FAN, missileKiriFaces.length, GL.UNSIGNED_SHORT, 0);

        // TUTUP MISSILE KANAN
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_TUTUPMISSILEKANAN);

        GL.bindBuffer(GL.ARRAY_BUFFER, TUTUP_MISSILE_KANAN_VERTEX2);

        GL.uniform1f(_greyscality, 1);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, TUTUP_MISSILE_KANAN_FACES2);
        GL.drawElements(GL.TRIANGLE_FAN, tutupmissilekanan_faces2.length, GL.UNSIGNED_SHORT, 0);

        // TUTUP MISSILE KIRI
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_TUTUPMISSILEKIRI);

        GL.bindBuffer(GL.ARRAY_BUFFER, TUTUP_MISSILE_KIRI_VERTEX2);

        GL.uniform1f(_greyscality, 1);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, TUTUP_MISSILE_KIRI_FACES2);
        GL.drawElements(GL.TRIANGLE_FAN, tutupmissilekiri_faces2.length, GL.UNSIGNED_SHORT, 0);

        //BATANGPOHON
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_BATANGPOHON);

        GL.bindBuffer(GL.ARRAY_BUFFER, BATANGPOHON_VERTEX);

        GL.uniform1f(_greyscality, 1);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, BATANGPOHON_FACES);
        GL.drawElements(GL.TRIANGLE_FAN, batangpohonFaces.length, GL.UNSIGNED_SHORT, 0);

        GL.flush();
        window.requestAnimationFrame(animate);

        // DAUN POHON
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_DAUNPOHON);

        GL.bindBuffer(GL.ARRAY_BUFFER, DAUNPOHON_VERTEX2);

        GL.uniform1f(_greyscality, 1);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, DAUNPOHON_FACES2);
        GL.drawElements(GL.TRIANGLE_FAN, daunpohon_faces2.length, GL.UNSIGNED_SHORT, 0);

    }

    animate(0);

}
window.addEventListener('load', main);