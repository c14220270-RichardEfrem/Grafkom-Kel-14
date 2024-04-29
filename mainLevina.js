function main() {
    var CANVAS = document.getElementById("mycanvas");

    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    // CAPTURE MOUSE EVENT
    var AMORTIZATION = 0.95;
    var dX = 0, dY = 0;
    var drag = false;
    var THETA = 0;
    var PHI = 0;

    var cameraPosition = { x: 0, y: 0, z: -20 };
    var cameraSpeed = 1;
    var targetCameraPosition = { x: cameraPosition.x, y: cameraPosition.y, z: cameraPosition.z };

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
                break;
            case "s":
                targetCameraPosition.z -= cameraSpeed;
                break;
            case "a":
                targetCameraPosition.x += cameraSpeed;
                break;
            case "d":
                targetCameraPosition.x -= cameraSpeed;
                break;
            case "q":
                targetCameraPosition.y -= cameraSpeed;
                break;
            case "e":
                targetCameraPosition.y += cameraSpeed;
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

    // SHADERS
    var shader_vertex_source = `
        attribute vec3 position;
        attribute vec3 color;

        uniform mat4 Pmatrix;
        uniform mat4 Vmatrix;
        uniform mat4 Mmatrix;

        varying vec3 vColor;
        void main(void){
            gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.0);
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
            vec3 greyscaleColor = vec3(greyscaleValue, greyscaleValue, greyscaleValue);
            vec3 color = mix(greyscaleColor, vColor, greyscality);
            gl_FragColor = vec4(color, 1.0);
        }
    `;

    var compile_shader = function (source, type, typeString) {
        var shader = GL.createShader(type);
        GL.shaderSource(shader, source);
        GL.compileShader(shader);
        if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
            alert("ERROR IN " + typeString + " SHADER: " + GL.getShaderInfoLog(shader));
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

    var _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
    var _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
    var _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");
    var _greyscality = GL.getUniformLocation(SHADER_PROGRAM, "greyscality");

    var _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
    var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");

    GL.enableVertexAttribArray(_color);
    GL.enableVertexAttribArray(_position);

    GL.useProgram(SHADER_PROGRAM);

    //TANAH
    var square_vertex = [
        -200, -200, -1, 0, 1, 0,
        200, -200, -1, 0, 1, 0,
        200, 200, -1, 0, 1, 0,
        -200, 200, -1, 0, 1, 0,
    ];

    var SQUARE_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, SQUARE_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(square_vertex), GL.STATIC_DRAW);

    //FACES
    var square_faces = [
        0, 1, 2,
        0, 2, 3
    ];

    var SQUARE_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SQUARE_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(square_faces), GL.STATIC_DRAW);

    
    //BALOK BAWAH
    var balokbawah_vertex = [
        -5, -0.5, -3, 0, 1, 0,    
        5, -0.5, -3, 0, 1, 0,     
        5, 0.5, -3, 0, 1, 0,      
        -5, 0.5, -3, 0, 1, 0,     
    
        -5, -0.5, 3, 0, 1, 0,     
        5, -0.5, 3, 0, 1, 0,      
        5, 0.5, 3, 0, 1, 0,       
        -5, 0.5, 3, 0, 1, 0,      
    
        -5, -0.5, -3, 0, 1, 0,    
        -5, 0.5, -3, 0, 1, 0,     
        -5, 0.5, 3, 0, 1, 0,     
        -5, -0.5, 3, 0, 1, 0,     
    
        5, -0.5, -3, 0, 1, 0,     
        5, 0.5, -3, 0, 1, 0,      
        5, 0.5, 3, 0, 1, 0,       
        5, -0.5, 3, 0, 1, 0,      
    
        -5, -0.5, -3, 0, 1, 0,    
        -5, -0.5, 3, 0, 1, 0,     
        5, -0.5, 3, 0, 1, 0,      
        5, -0.5, -3, 0, 1, 0,     
    
        -5, 0.5, -3, 0, 1, 0,     
        -5, 0.5, 3, 0, 1, 0,      
        5, 0.5, 3, 0, 1, 0,       
        5, 0.5, -3, 0, 1, 0       
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

    //PRISMA
    var prisma_vertex = [
        -2.75, -1.5, -3, 0, 1, 0,
        2.75, -1.5, -3, 0, 1, 0,
        2.75, 1.5, -2, 0, 1, 0,
        -2.75, 1.5, -2, 0, 1, 0,
        
        -2.75, -1.5, 3, 0, 1, 0,
        2.75, -1.5, 3, 0, 1, 0,
        2.75, 1.5, 2, 0, 1, 0,
        -2.75, 1.5, 2, 0, 1, 0,
        
        -2.75, -1.5, -3, 0, 1, 0,
        -2.75, 1.5, -2, 0, 1, 0,
        -2.75, 1.5, 2, 0, 1, 0,
        -2.75, -1.5, 3, 0, 1, 0,
        
        2.75, -1.5, -3, 0, 1, 0,
        2.75, 1.5, -2, 0, 1, 0,
        2.75, 1.5, 2, 0, 1, 0,
        2.75, -1.5, 3, 0, 1, 0,
        
        -2.75, -1.5, -3, 0, 1, 0,
        -2.75, -1.5, 3, 0, 1, 0,
        2.75, -1.5, 3, 0, 1, 0,
        2.75, -1.5, -3, 0, 1, 0,
        
        -2.75, 1.5, 2, 0, 1, 0,
        -2.75, 1.5, -2, 0, 1, 0,
        2.75, 1.5, 2, 0, 1, 0,
        2.75, 1.5, -2, 0, 1, 0
    ];
    

    var PRISMA_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, PRISMA_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(prisma_vertex), GL.STATIC_DRAW);

    // FACES
    var prisma_faces = [
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

    var PRISMA_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, PRISMA_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(prisma_faces), GL.STATIC_DRAW);


    //BALOK DEPAN
    var balokdepan_vertex = [
        -2, -1.5, -3, 0, 1, 0,
        2, -1.5, -3, 0, 1, 0,
        2, 1.5, -3, 0, 1, 0,
        -2, 1.5, -3, 0, 1, 0,
    
        -2, -1.5, 3, 0, 1, 0,
        2, -1.5, 3, 0, 1, 0,
        2, 1.5, 3, 0, 1, 0,
        -2, 1.5, 3, 0, 1, 0,
    
        -2, -1.5, -3, 0, 1, 0,
        -2, 1.5, -3, 0, 1, 0,
        -2, 1.5, 3, 0, 1, 0,
        -2, -1.5, 3, 0, 1, 0,
    
        2, -1.5, -3, 0, 1, 0,
        2, 1.5, -3, 0, 1, 0,
        2, 1.5, 3, 0, 1, 0,
        2, -1.5, 3, 0, 1, 0,
    
        -2, -1.5, -3, 0, 1, 0,
        -2, -1.5, 3, 0, 1, 0,
        2, -1.5, 3, 0, 1, 0,
        2, -1.5, -3, 0, 1, 0,
    
        -2, 1.5, -3, 0, 1, 0,
        -2, 1.5, 3, 0, 1, 0,
        2, 1.5, 3, 0, 1, 0,
        2, 1.5, -3, 0, 1, 0
    ];
    

    var BALOKDEPAN_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, BALOKDEPAN_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(balokdepan_vertex), GL.STATIC_DRAW);

    // FACES
    var balokdepan_faces = [
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

    var BALOKDEPAN_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, BALOKDEPAN_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(balokdepan_faces), GL.STATIC_DRAW);

    //BALOK BELAKANG
    var balokbelakang_vertex = [
        -2.75, -0.75, -3, 0, 1, 0,
        2.75, -0.75, -3, 0, 1, 0,
        2.75, 0.75, -3, 0, 1, 0,
        -2.75, 0.75, -3, 0, 1, 0,
    
        -2.75, -0.75, 3, 0, 1, 0,
        2.75, -0.75, 3, 0, 1, 0,
        2.75, 0.75, 3, 0, 1, 0,
        -2.75, 0.75, 3, 0, 1, 0,
    
        -2.75, -0.75, -3, 0, 1, 0,
        -2.75, 0.75, -3, 0, 1, 0,
        -2.75, 0.75, 3, 0, 1, 0,
        -2.75, -0.75, 3, 0, 1, 0,
    
        2.75, -0.75, -3, 0, 1, 0,
        2.75, 0.75, -3, 0, 1, 0,
        2.75, 0.75, 3, 0, 1, 0,
        2.75, -0.75, 3, 0, 1, 0,
    
        -2.75, -0.75, -3, 0, 1, 0,
        -2.75, -0.75, 3, 0, 1, 0,
        2.75, -0.75, 3, 0, 1, 0,
        2.75, -0.75, -3, 0, 1, 0,
    
        -2.75, 0.75, -3, 0, 1, 0,
        -2.75, 0.75, 3, 0, 1, 0,
        2.75, 0.75, 3, 0, 1, 0,
        2.75, 0.75, -3, 0, 1, 0
    ];
    

    var BALOKBELAKANG_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, BALOKBELAKANG_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(balokbelakang_vertex), GL.STATIC_DRAW);

    // FACES
    var balokbelakang_faces = [
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

    var BALOKBELAKANG_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, BALOKBELAKANG_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(balokbelakang_faces), GL.STATIC_DRAW);

    // PRISMADEPAN
    var prismadepan_vertex = [
        -2, -1, -3, 0, 1, 0,
        -2, -1, 3, 0, 1, 0,
        0, 1, 3, 0, 1, 0,
        0, 1, -3, 0, 1, 0,
    
        2, -1, -3, 0, 1, 0,
        2, -1, 3, 0, 1, 0,
        2, 1, 3, 0, 1, 0,
        2, 1, -3, 0, 1, 0,
    
        -2, -1, -3, 0, 1, 0,
        0, 1, -3, 0, 1, 0,
        2, 1, -3, 0, 1, 0,
        2, -1, -3, 0, 1, 0,
    
        -2, -1, 3, 0, 1, 0,
        0, 1, 3, 0, 1, 0,
        2, 1, 3, 0, 1, 0,
        2, -1, 3, 0, 1, 0,
    
        -2, -1, -3, 0, 1, 0,
        2, -1, -3, 0, 1, 0,
        2, -1, 3, 0, 1, 0,
        -2, -1, 3, 0, 1, 0,
    
        0, 1, -3, 0, 1, 0,
        0, 1, 3, 0, 1, 0,
        2, 1, -3, 0, 1, 0,
        2, 1, 3, 0, 1, 0
    ];
    

    var PRISMADEPAN_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, PRISMADEPAN_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(prismadepan_vertex), GL.STATIC_DRAW);

    // FACES
    var prismadepan_faces = [
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
    var PRISMADEPAN_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, PRISMADEPAN_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(prismadepan_faces), GL.STATIC_DRAW);


    //TUBE
    //POINTS :
    var circlePoints = [];
    var jumlahPoints = 100;
    var radius = 0.25; // Mengubah radius menjadi 0.25
    var height = 7; // Mengubah tinggi tabung menjadi 5
    var circleFaces = [];

    // Titik-titik pada bagian atas tabung
    for (var i = 0; i < jumlahPoints; i++) {
        var theta = (i / jumlahPoints) * 2 * Math.PI;

        var x = radius * Math.cos(theta); // Menggunakan radius yang baru
        var y = radius * Math.sin(theta);

        circlePoints.push(x, y, 0);

        circlePoints.push(0, 1, 0);
    }

    // Titik-titik pada bagian bawah tabung
    for (var i = 0; i < jumlahPoints; i++) {
        var theta = (i / jumlahPoints) * 2 * Math.PI;

        var x = radius * Math.cos(theta);
        var y = radius * Math.sin(theta);

        circlePoints.push(x, y, height); // Menggunakan tinggi yang baru

        circlePoints.push(0, 1, 0);
    }

    circleFaces.push(100);

    // Menambahkan indeks titik-titik untuk wajah
    for (var i = 0; i < jumlahPoints; i++) {
        circleFaces.push(i);
    }

    for (var i = 0; i < jumlahPoints; i++) {
        circleFaces.push(i);
    }

    // Membuat wajah untuk tabung
    for (var i = 0; i < jumlahPoints; i++) {
        circleFaces.push(i, (i + jumlahPoints) % (jumlahPoints * 2), (i + 1) % jumlahPoints);
        circleFaces.push((i + 1) % jumlahPoints, (i + jumlahPoints) % (jumlahPoints * 2), (i + 1 + jumlahPoints) % (jumlahPoints * 2));
    }

    // Membuat buffer untuk titik-titik
    var CIRCLE_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(circlePoints), GL.STATIC_DRAW);

    // Membuat buffer untuk wajah
    var circle_faces = circleFaces;
    var CIRCLE_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRCLE_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(circle_faces), GL.STATIC_DRAW);


    //TUBE2
    //POINTS :
    var circlePoints2 = [];
    var jumlahPoints2 = 100;
    var radius2 = 0.25; // Mengubah radius menjadi 0.25
    var height2 = 1; // Mengubah tinggi tabung menjadi 7
    var circleFaces2 = [];

    // Titik-titik pada bagian atas tabung
    for (var i = 0; i < jumlahPoints2; i++) {
        var theta = (i / jumlahPoints2) * 2 * Math.PI;

        var x = radius2 * Math.cos(theta); // Menggunakan radius yang baru
        var y = radius2 * Math.sin(theta);

        circlePoints2.push(x, y, 0);

        circlePoints2.push(0, 1, 0);
    }

    // Titik-titik pada bagian bawah tabung
    for (var i = 0; i < jumlahPoints2; i++) {
        var theta = (i / jumlahPoints2) * 2 * Math.PI;

        var x = radius2 * Math.cos(theta);
        var y = radius2 * Math.sin(theta);

        circlePoints2.push(x, y, height2); // Menggunakan tinggi yang baru

        circlePoints2.push(0, 1, 0);
    }

    circleFaces2.push(100);

    // Menambahkan indeks titik-titik untuk wajah
    for (var i = 0; i < jumlahPoints2; i++) {
        circleFaces2.push(i);
    }

    for (var i = 0; i < jumlahPoints2; i++) {
        circleFaces2.push(i);
    }

    // Membuat wajah untuk tabung
    for (var i = 0; i < jumlahPoints2; i++) {
        circleFaces2.push(i, (i + jumlahPoints2) % (jumlahPoints2 * 2), (i + 1) % jumlahPoints2);
        circleFaces2.push((i + 1) % jumlahPoints2, (i + jumlahPoints2) % (jumlahPoints2 * 2), (i + 1 + jumlahPoints2) % (jumlahPoints2 * 2));
    }

    // Membuat buffer untuk titik-titik
    var CIRCLE_VERTEX2 = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX2);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(circlePoints2), GL.STATIC_DRAW);

    // Membuat buffer untuk wajah
    var circle_faces2 = circleFaces2;
    var CIRCLE_FACES2 = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRCLE_FACES2);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(circle_faces2), GL.STATIC_DRAW);


    //RODA KANAN DEPAN
    //POINTS :
    var rodaKananDepanPoints = [];
    var jumlahPoints3 = 100; // Mengubah jumlahPoints menjadi jumlahPoints3
    var radius = 1.25; // Mengubah radius menjadi 0.25
    var height = 1; // Mengubah tinggi tabung menjadi 5
    var rodaKananDepanFaces = [];

    // Titik-titik pada bagian atas tabung
    for (var i = 0; i < jumlahPoints3; i++) {
        var theta = (i / jumlahPoints3) * 2 * Math.PI;

        var x = radius * Math.cos(theta); // Menggunakan radius yang baru
        var y = radius * Math.sin(theta);

        rodaKananDepanPoints.push(x, y, 0);

        rodaKananDepanPoints.push(0, 0, 0);
    }

    // Titik-titik pada bagian bawah tabung
    for (var i = 0; i < jumlahPoints3; i++) {
        var theta = (i / jumlahPoints3) * 2 * Math.PI;

        var x = radius * Math.cos(theta);
        var y = radius * Math.sin(theta);

        rodaKananDepanPoints.push(x, y, height); // Menggunakan tinggi yang baru

        rodaKananDepanPoints.push(0, 0, 0);
    }

    rodaKananDepanFaces.push(100);

    // Menambahkan indeks titik-titik untuk wajah
    for (var i = 0; i < jumlahPoints3; i++) {
        rodaKananDepanFaces.push(i);
    }

    for (var i = 0; i < jumlahPoints3; i++) {
        rodaKananDepanFaces.push(i);
    }

    // Membuat wajah untuk tabung
    for (var i = 0; i < jumlahPoints3; i++) {
        rodaKananDepanFaces.push(i, (i + jumlahPoints3) % (jumlahPoints3 * 2), (i + 1) % jumlahPoints3);
        rodaKananDepanFaces.push((i + 1) % jumlahPoints3, (i + jumlahPoints3) % (jumlahPoints3 * 2), (i + 1 + jumlahPoints3) % (jumlahPoints3 * 2));
    }

// Membuat buffer untuk titik-titik
var RODA_KANAN_DEPAN_VERTEX = GL.createBuffer();
GL.bindBuffer(GL.ARRAY_BUFFER, RODA_KANAN_DEPAN_VERTEX);
GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(rodaKananDepanPoints), GL.STATIC_DRAW);

// Membuat buffer untuk wajah
var rodaKananDepan_faces = rodaKananDepanFaces;
var RODA_KANAN_DEPAN_FACES = GL.createBuffer();
GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RODA_KANAN_DEPAN_FACES);
GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(rodaKananDepan_faces), GL.STATIC_DRAW);


//RODAKANANBELAKANG
//POINTS :
var rodaKananBelakangPoints = [];
var jumlahPoints4 = 100; // Mengubah jumlahPoints3 menjadi jumlahPoints4
var radius = 1.25; // Mengubah radius menjadi 0.25
var height = 1; // Mengubah tinggi tabung menjadi 5
var rodaKananBelakangFaces = [];

// Titik-titik pada bagian atas tabung
for (var i = 0; i < jumlahPoints4; i++) {
    var theta = (i / jumlahPoints4) * 2 * Math.PI;

    var x = radius * Math.cos(theta); // Menggunakan radius yang baru
    var y = radius * Math.sin(theta);

    rodaKananBelakangPoints.push(x, y, 0);

    rodaKananBelakangPoints.push(0, 0, 0);
}

// Titik-titik pada bagian bawah tabung
for (var i = 0; i < jumlahPoints4; i++) {
    var theta = (i / jumlahPoints4) * 2 * Math.PI;

    var x = radius * Math.cos(theta);
    var y = radius * Math.sin(theta);

    rodaKananBelakangPoints.push(x, y, height); // Menggunakan tinggi yang baru

    rodaKananBelakangPoints.push(0, 0, 0);
}

rodaKananBelakangFaces.push(100);

// Menambahkan indeks titik-titik untuk wajah
for (var i = 0; i < jumlahPoints4; i++) {
    rodaKananBelakangFaces.push(i);
}

for (var i = 0; i < jumlahPoints4; i++) {
    rodaKananBelakangFaces.push(i);
}

// Membuat wajah untuk tabung
for (var i = 0; i < jumlahPoints4; i++) {
    rodaKananBelakangFaces.push(i, (i + jumlahPoints4) % (jumlahPoints4 * 2), (i + 1) % jumlahPoints4);
    rodaKananBelakangFaces.push((i + 1) % jumlahPoints4, (i + jumlahPoints4) % (jumlahPoints4 * 2), (i + 1 + jumlahPoints4) % (jumlahPoints4 * 2));
}

// Membuat buffer untuk titik-titik
var RODA_KANAN_BELAKANG_VERTEX = GL.createBuffer();
GL.bindBuffer(GL.ARRAY_BUFFER, RODA_KANAN_BELAKANG_VERTEX);
GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(rodaKananBelakangPoints), GL.STATIC_DRAW);

// Membuat buffer untuk wajah
var rodaKananBelakang_faces = rodaKananBelakangFaces;
var RODA_KANAN_BELAKANG_FACES = GL.createBuffer();
GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RODA_KANAN_BELAKANG_FACES);
GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(rodaKananBelakang_faces), GL.STATIC_DRAW);


// RODA KIRI DEPAN
// POINTS :
var rodaKiriDepanPoints = [];
var jumlahPoints5 = 100; // Mengubah jumlahPoints3 menjadi jumlahPoints5
var radius = 1.25; // Mengubah radius menjadi 0.25
var height = 1; // Mengubah tinggi tabung menjadi 5
var rodaKiriDepanFaces = [];

// Titik-titik pada bagian atas tabung
for (var i = 0; i < jumlahPoints5; i++) {
    var theta = (i / jumlahPoints5) * 2 * Math.PI;

    var x = radius * Math.cos(theta); // Menggunakan radius yang baru
    var y = radius * Math.sin(theta);

    rodaKiriDepanPoints.push(x, y, 0);

    rodaKiriDepanPoints.push(0, 0, 0);
}

// Titik-titik pada bagian bawah tabung
for (var i = 0; i < jumlahPoints5; i++) {
    var theta = (i / jumlahPoints5) * 2 * Math.PI;

    var x = radius * Math.cos(theta);
    var y = radius * Math.sin(theta);

    rodaKiriDepanPoints.push(x, y, height); // Menggunakan tinggi yang baru

    rodaKiriDepanPoints.push(0, 0, 0);
}

rodaKiriDepanFaces.push(100);

// Menambahkan indeks titik-titik untuk wajah
for (var i = 0; i < jumlahPoints5; i++) {
    rodaKiriDepanFaces.push(i);
}

for (var i = 0; i < jumlahPoints5; i++) {
    rodaKiriDepanFaces.push(i);
}

// Membuat wajah untuk tabung
for (var i = 0; i < jumlahPoints5; i++) {
    rodaKiriDepanFaces.push(i, (i + jumlahPoints5) % (jumlahPoints5 * 2), (i + 1) % jumlahPoints5);
    rodaKiriDepanFaces.push((i + 1) % jumlahPoints5, (i + jumlahPoints5) % (jumlahPoints5 * 2), (i + 1 + jumlahPoints5) % (jumlahPoints5 * 2));
}

// Membuat buffer untuk titik-titik
var RODA_KIRI_DEPAN_VERTEX = GL.createBuffer();
GL.bindBuffer(GL.ARRAY_BUFFER, RODA_KIRI_DEPAN_VERTEX);
GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(rodaKiriDepanPoints), GL.STATIC_DRAW);

// Membuat buffer untuk wajah
var rodaKiriDepan_faces = rodaKiriDepanFaces;
var RODA_KIRI_DEPAN_FACES = GL.createBuffer();
GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RODA_KIRI_DEPAN_FACES);
GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(rodaKiriDepan_faces), GL.STATIC_DRAW);


    // RODA KIRI BELAKANG
    // POINTS :
    var rodaKiriBelakangPoints = [];
    var jumlahPoints6 = 100; // Mengubah jumlahPoints5 menjadi jumlahPoints6
    var radius = 1.25; // Mengubah radius menjadi 0.25
    var height = 1; // Mengubah tinggi tabung menjadi 5
    var rodaKiriBelakangFaces = [];

    // Titik-titik pada bagian atas tabung
    for (var i = 0; i < jumlahPoints6; i++) {
        var theta = (i / jumlahPoints6) * 2 * Math.PI;

        var x = radius * Math.cos(theta); // Menggunakan radius yang baru
        var y = radius * Math.sin(theta);

        rodaKiriBelakangPoints.push(x, y, 0);

        rodaKiriBelakangPoints.push(0, 0, 0);
    }

    // Titik-titik pada bagian bawah tabung
    for (var i = 0; i < jumlahPoints6; i++) {
        var theta = (i / jumlahPoints6) * 2 * Math.PI;

        var x = radius * Math.cos(theta);
        var y = radius * Math.sin(theta);

        rodaKiriBelakangPoints.push(x, y, height); // Menggunakan tinggi yang baru

        rodaKiriBelakangPoints.push(0, 0, 0);
    }

    rodaKiriBelakangFaces.push(100);

    // Menambahkan indeks titik-titik untuk wajah
    for (var i = 0; i < jumlahPoints6; i++) {
        rodaKiriBelakangFaces.push(i);
    }

    for (var i = 0; i < jumlahPoints6; i++) {
        rodaKiriBelakangFaces.push(i);
    }

    // Membuat wajah untuk tabung
    for (var i = 0; i < jumlahPoints6; i++) {
        rodaKiriBelakangFaces.push(i, (i + jumlahPoints6) % (jumlahPoints6 * 2), (i + 1) % jumlahPoints6);
        rodaKiriBelakangFaces.push((i + 1) % jumlahPoints6, (i + jumlahPoints6) % (jumlahPoints6 * 2), (i + 1 + jumlahPoints6) % (jumlahPoints6 * 2));
    }

    // Membuat buffer untuk titik-titik
    var RODA_KIRI_BELAKANG_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, RODA_KIRI_BELAKANG_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(rodaKiriBelakangPoints), GL.STATIC_DRAW);

    // Membuat buffer untuk wajah
    var rodaKiriBelakang_faces = rodaKiriBelakangFaces;
    var RODA_KIRI_BELAKANG_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RODA_KIRI_BELAKANG_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(rodaKiriBelakang_faces), GL.STATIC_DRAW);


    //MATRIX
    var PROJMATRIX = LIBS.get_projection(40, CANVAS.width / CANVAS.height, 1, 100);
    var MOVEMATRIX = LIBS.get_I4();
    var VIEWMATRIX = LIBS.get_I4();

   

    var MOVEMATRIX_BALOKBAWAH = LIBS.get_I4();
    var MOVEMATRIX_PRISMA = LIBS.get_I4();
    var MOVEMATRIX_BALOKDEPAN = LIBS.get_I4();
    var MOVEMATRIX_BALOKBELAKANG = LIBS.get_I4();
    var MOVEMATRIX_PRISMADEPAN = LIBS.get_I4();
    var MOVEMATRIX_TABUNG = LIBS.get_I4();
    var MOVEMATRIX_TABUNG2 = LIBS.get_I4();
    var MOVEMATRIX_RODAKANANDEPAN = LIBS.get_I4();
    var MOVEMATRIX_RODAKANANBELAKANG = LIBS.get_I4();
    var MOVEMATRIX_RODAKIRIDEPAN = LIBS.get_I4();
    var MOVEMATRIX_RODAKIRIBELAKANG = LIBS.get_I4();

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

            //TANAH
            LIBS.set_I4(MOVEMATRIX);
            LIBS.rotateX(MOVEMATRIX, Math.PI / 2);
            LIBS.translateY(MOVEMATRIX, -4.25);

    
            //BALOK BAWAH
            LIBS.set_I4(MOVEMATRIX_BALOKBAWAH);
            LIBS.translateY(MOVEMATRIX_BALOKBAWAH, -1.5);
            LIBS.translateZ(MOVEMATRIX_BALOKBAWAH, 5);
            LIBS.rotateY(MOVEMATRIX_BALOKBAWAH, -11);

            //PRISMA
            LIBS.set_I4(MOVEMATRIX_PRISMA);
            LIBS.translateY(MOVEMATRIX_PRISMA, 2);  // Posisikan di atas dengan translasi Y
            LIBS.translateZ(MOVEMATRIX_PRISMA, 2.75);    // Pindahkan ke depan dengan translasi Z
            LIBS.rotateY(MOVEMATRIX_PRISMA, -11);      // Putar sebesar 11 derajat di sekitar sumbu Y

            //BALOK DEPAN
            LIBS.set_I4(MOVEMATRIX_BALOKDEPAN);
            LIBS.translateY(MOVEMATRIX_BALOKDEPAN, 0.5);
            LIBS.translateZ(MOVEMATRIX_BALOKDEPAN, 7.5);
            LIBS.rotateY(MOVEMATRIX_BALOKDEPAN, -11);

            //BALOK BELAKANG
            LIBS.set_I4(MOVEMATRIX_BALOKBELAKANG);
            LIBS.translateY(MOVEMATRIX_BALOKBELAKANG, -0.25);
            LIBS.translateZ(MOVEMATRIX_BALOKBELAKANG, 2.75);
            LIBS.rotateY(MOVEMATRIX_BALOKBELAKANG, -11);

            //PRISMA DEPAN
            LIBS.set_I4(MOVEMATRIX_PRISMADEPAN);
            LIBS.translateY(MOVEMATRIX_PRISMADEPAN, 3);  // Posisikan di atas dengan translasi Y
            LIBS.translateZ(MOVEMATRIX_PRISMADEPAN, 7.5);    // Pindahkan ke depan dengan translasi Z
            LIBS.rotateY(MOVEMATRIX_PRISMADEPAN, -11);      // Putar sebesar 11 derajat di sekitar sumbu Y
 
            //TABUNG
            LIBS.set_I4(MOVEMATRIX_TABUNG);
            LIBS.translateX(MOVEMATRIX_TABUNG, -3);
            LIBS.translateY(MOVEMATRIX_TABUNG, -1);
            LIBS.translateZ(MOVEMATRIX_TABUNG, 5.5);
            LIBS.rotateY(MOVEMATRIX_TABUNG, 11);
            LIBS.rotateZ(MOVEMATRIX_TABUNG, 11);

            //TABUNG2
            LIBS.set_I4(MOVEMATRIX_TABUNG2);
            LIBS.translateX(MOVEMATRIX_TABUNG2, -3);
            LIBS.translateY(MOVEMATRIX_TABUNG2, 5.8);
            LIBS.translateZ(MOVEMATRIX_TABUNG2, 4.55);
            
            //RODAKANANDEPAN
            LIBS.set_I4(MOVEMATRIX_RODAKANANDEPAN);
            LIBS.translateX(MOVEMATRIX_RODAKANANDEPAN, -3);
            LIBS.translateY(MOVEMATRIX_RODAKANANDEPAN, -2);
            LIBS.translateZ(MOVEMATRIX_RODAKANANDEPAN, 7);
            LIBS.rotateY(MOVEMATRIX_RODAKANANDEPAN, 11);

            //RODAKANANBELAKANG
            LIBS.set_I4(MOVEMATRIX_RODAKANANBELAKANG);
            LIBS.translateX(MOVEMATRIX_RODAKANANBELAKANG, -3);
            LIBS.translateY(MOVEMATRIX_RODAKANANBELAKANG, -2);
            LIBS.translateZ(MOVEMATRIX_RODAKANANBELAKANG, 2.5);
            LIBS.rotateY(MOVEMATRIX_RODAKANANBELAKANG, 11);

            //RODAKIRIDEPAN
            LIBS.set_I4(MOVEMATRIX_RODAKIRIDEPAN);
            LIBS.translateX(MOVEMATRIX_RODAKIRIDEPAN, 4);
            LIBS.translateY(MOVEMATRIX_RODAKIRIDEPAN, -2);
            LIBS.translateZ(MOVEMATRIX_RODAKIRIDEPAN, 7);
            LIBS.rotateY(MOVEMATRIX_RODAKIRIDEPAN, 11);

            //RODAKIRIBELAKANG
            LIBS.set_I4(MOVEMATRIX_RODAKIRIBELAKANG);
            LIBS.translateX(MOVEMATRIX_RODAKIRIBELAKANG, 4);
            LIBS.translateY(MOVEMATRIX_RODAKIRIBELAKANG, -2);
            LIBS.translateZ(MOVEMATRIX_RODAKIRIBELAKANG, 2.5);
            LIBS.rotateY(MOVEMATRIX_RODAKIRIBELAKANG, 11);



            //CAMERA INTERPOLATION
            cameraPosition.x += (targetCameraPosition.x - cameraPosition.x) * 0.1;
            cameraPosition.y += (targetCameraPosition.y - cameraPosition.y) * 0.1;
            cameraPosition.z += (targetCameraPosition.z - cameraPosition.z) * 0.1;

            //CAMERA
            LIBS.set_I4(VIEWMATRIX);
            LIBS.translateX(VIEWMATRIX, cameraPosition.x);
            LIBS.translateY(VIEWMATRIX, cameraPosition.y);
            LIBS.translateZ(VIEWMATRIX, cameraPosition.z);
            LIBS.rotateX(VIEWMATRIX, PHI);
            LIBS.rotateY(VIEWMATRIX, THETA);

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

        GL.uniform1f(_greyscality, 0.5);
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SQUARE_FACES);
        GL.drawElements(GL.TRIANGLES, square_faces.length, GL.UNSIGNED_SHORT, 0);

        GL.drawElements(GL.LINE_STRIP, square_faces.length, GL.UNSIGNED_SHORT, 0);


        //BALOKBAWAH
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_BALOKBAWAH);

        GL.bindBuffer(GL.ARRAY_BUFFER, BALOKBAWAH_VERTEX);

        GL.uniform1f(_greyscality, 0.1);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, BALOKBAWAH_FACES);
        GL.drawElements(GL.TRIANGLES, balokbawah_faces.length, GL.UNSIGNED_SHORT, 0);

        // PRISMA
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_PRISMA);

        GL.bindBuffer(GL.ARRAY_BUFFER, PRISMA_VERTEX);

        GL.uniform1f(_greyscality, 0.3);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, PRISMA_FACES);
        GL.drawElements(GL.TRIANGLES, prisma_faces.length, GL.UNSIGNED_SHORT, 0);

       //BALOKDEPAN
       GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_BALOKDEPAN);

       GL.bindBuffer(GL.ARRAY_BUFFER, BALOKDEPAN_VERTEX);

       GL.uniform1f(_greyscality, 0.2);
       GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
       GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

       GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, BALOKDEPAN_FACES);
       GL.drawElements(GL.TRIANGLES, balokdepan_faces.length, GL.UNSIGNED_SHORT, 0);

       //BALOK BELAKANG
       GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_BALOKBELAKANG);

       GL.bindBuffer(GL.ARRAY_BUFFER, BALOKBELAKANG_VERTEX);

       GL.uniform1f(_greyscality, 0.2);
       GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
       GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

       GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, BALOKBELAKANG_FACES);
       GL.drawElements(GL.TRIANGLES, balokbelakang_faces.length, GL.UNSIGNED_SHORT, 0);

       // PRISMADEPAN
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_PRISMADEPAN);

        GL.bindBuffer(GL.ARRAY_BUFFER, PRISMADEPAN_VERTEX);

        GL.uniform1f(_greyscality, 0.2);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, PRISMADEPAN_FACES);
        GL.drawElements(GL.TRIANGLES, prismadepan_faces.length, GL.UNSIGNED_SHORT, 0);

        //TABUNG
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_TABUNG);

        GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX);

        GL.uniform1f(_greyscality, 0.05);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRCLE_FACES);
        GL.drawElements(GL.TRIANGLE_FAN, circle_faces.length, GL.UNSIGNED_SHORT, 0);

        //TABUNG2
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_TABUNG2);

        GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX2);

        GL.uniform1f(_greyscality, 0.05);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRCLE_FACES2);
        GL.drawElements(GL.TRIANGLE_FAN, circle_faces2.length, GL.UNSIGNED_SHORT, 0);

        //RODAKANANDEPAN
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_RODAKANANDEPAN);

        GL.bindBuffer(GL.ARRAY_BUFFER, RODA_KANAN_DEPAN_VERTEX);

        GL.uniform1f(_greyscality, 0.5);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RODA_KANAN_DEPAN_FACES);
        GL.drawElements(GL.TRIANGLE_FAN, rodaKananDepan_faces.length, GL.UNSIGNED_SHORT, 0);

        //RODAKANANBELAKANG
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_RODAKANANBELAKANG);

        GL.bindBuffer(GL.ARRAY_BUFFER, RODA_KANAN_BELAKANG_VERTEX);

        GL.uniform1f(_greyscality, 0.5);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RODA_KANAN_BELAKANG_FACES);
        GL.drawElements(GL.TRIANGLE_FAN, rodaKananBelakang_faces.length, GL.UNSIGNED_SHORT, 0);

        // RODAKIRIDEPAN
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_RODAKIRIDEPAN);

        GL.bindBuffer(GL.ARRAY_BUFFER, RODA_KIRI_DEPAN_VERTEX);

        GL.uniform1f(_greyscality, 0.5);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RODA_KIRI_DEPAN_FACES);
        GL.drawElements(GL.TRIANGLE_FAN, rodaKiriDepan_faces.length, GL.UNSIGNED_SHORT, 0);

        // RODAKIRIBELAKANG
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_RODAKIRIBELAKANG);

        GL.bindBuffer(GL.ARRAY_BUFFER, RODA_KIRI_BELAKANG_VERTEX);

        GL.uniform1f(_greyscality, 0.5);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RODA_KIRI_BELAKANG_FACES);
        GL.drawElements(GL.TRIANGLE_FAN, rodaKiriBelakang_faces.length, GL.UNSIGNED_SHORT, 0);

        

        GL.flush();
        window.requestAnimationFrame(animate);

        
        
    }

    animate(0);

}
window.addEventListener('load', main);

