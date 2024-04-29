function main() {
    var CANVAS = document.getElementById("mycanvas");

    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    // CAPTURE MOUSE EVENT
    var AMORTIZATION = 0.1;
    var dX = 0, dY = 0;
    var drag = false;
    var THETA = 0;
    var PHI = 0;

    var cameraPosition = { x: 0, y: 0, z: -20 }; // Initial camera position
    var cameraSpeed = 2; // Adjust as needed
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
                targetCameraPosition.z += cameraSpeed; // Move camera forward
                break;
            case "s":
                targetCameraPosition.z -= cameraSpeed; // Move camera backward
                break;
            case "a":
                targetCameraPosition.x += cameraSpeed; // Move camera left
                break;
            case "d":
                targetCameraPosition.x -= cameraSpeed; // Move camera right
                break;
            case "q":
                targetCameraPosition.y -= cameraSpeed; // Move camera up
                break;
            case "e":
                targetCameraPosition.y += cameraSpeed; // Move camera down
                break;
            case "x":
                // Rotate the first wheel
                LIBS.set_I4(MOVEMATRIX_RODA1);
                LIBS.rotateZ(MOVEMATRIX_RODA1, Math.PI / 32);
        
                // Rotate the second wheel
                LIBS.set_I4(MOVEMATRIX_RODA2);
                LIBS.rotateZ(MOVEMATRIX_RODA2, -Math.PI / 32);
        
                // Rotate the third wheel
                LIBS.set_I4(MOVEMATRIX_RODA3);
                LIBS.rotateZ(MOVEMATRIX_RODA3, Math.PI / 32);
        
                // Rotate the fourth wheel
                LIBS.set_I4(MOVEMATRIX_RODA4);
                LIBS.rotateZ(MOVEMATRIX_RODA4, -Math.PI / 32);
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
        -100, -100, -1, 0, 1, 0, // Vertex 1: Position (-3, -3, -1), Color (0, 1, 0)
        100, -100, -1, 0, 1, 0,  // Vertex 2: Position (3, -3, -1), Color (0, 1, 0)
        100, 100, -1, 0, 1, 0,    // Vertex 3: Position (3, 3, -1), Color (0, 1, 0)
        -100, 100, -1, 0, 1, 0,   // Vertex 4: Position (-3, 3, -1), Color (0, 1, 0)
    ];

    var SQUARE_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, SQUARE_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(square_vertex), GL.STATIC_DRAW);

    //FACES TANAH
    var square_faces = [
        0, 1, 2,
        0, 2, 3
    ];

    var SQUARE_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SQUARE_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(square_faces), GL.STATIC_DRAW);

    // KUBUS
    //POINTS
    var cube_vertex = [
        // Vertices
        -1.5, -1, -1.3, 1.0, 0.0, 0.0,   // Vertex 0
        1.5, -1, -1.3, 1.0, 0.0, 0.0,  // Vertex 1
        1.5, 1, -1.3, 1.0, 0.0, 0.0,  // Vertex 2
        -1.5, 1, -1.3, 1.0, 0.0, 0.0,   // Vertex 3
        -1.5, -1, 1.3, 1.0, 0.0, 0.0,   // Vertex 4
        1.5, -1, 1.3, 1.0, 0.0, 0.0,   // Vertex 5
        1.5, 1, 1.3, 1.0, 0.0, 0.0,     // Vertex 6
        -1.5, 1, 1.3, 1.0, 0.0, 0.0     // Vertex 7
    ];

// Buat buffer untuk vertex kubus
var CUBE_VERTEX = GL.createBuffer();
GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(cube_vertex), GL.STATIC_DRAW);

// Definisikan faces kubus
var cube_faces = [
    // Front face
    0, 1, 2,
    0, 2, 3,
    // Back face
    4, 5, 6,
    4, 6, 7,
    // Top face
    3, 2, 6,
    3, 6, 7,
    // Bottom face
    0, 1, 5,
    0, 5, 4,
    // Right face
    1, 2, 6,
    1, 6, 5,
    // Left face
    0, 3, 7,
    0, 7, 4
];


// Buat buffer untuk faces kubus
var CUBE_FACES = GL.createBuffer();
GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
GL.bufferData(GL    .ELEMENT_ARRAY_BUFFER, new Uint16Array(cube_faces), GL.STATIC_DRAW);

    //BALOK 
    //POINTS : 
    var block_vertex = [
   // Vertices for the front face
   -3, 0, 3, 1.0, 0.0, 1.0,   // Vertex 0 (back bottom left)
   3, 0, 3, 1.0, 0.0, 1.0,    // Vertex 1 (back bottom right)
   3, 2, 3, 1.0, 0.0, 1.0,     // Vertex 2 (back top right)
   -3, 2, 3, 1.0, 0.0, 1.0,    // Vertex 3 (back top left)

   // Vertices for the back face (positioned 3 units behind the front face)
   3, 0, -3, 1.0, 0.0, 1.0,     // Vertex 4 (front bottom right)
   -3, 0, -3, 1.0, 0.0, 1.0,    // Vertex 5 (front bottom left)
   -3, 2, -3, 1.0, 0.0, 1.0,     // Vertex 6 (front top left)
   3, 2, -3, 1.0, 0.0, 1.0,      // Vertex 7 (front top right)

   // Vertices for the top face
   -3, 2, 3, 1.0, 0.0, 1.0,    // Vertex 8 (back top left)
   3, 2, 3, 1.0, 0.0, 1.0,     // Vertex 9 (back top right)
   3, 2, -3, 1.0, 0.0, 1.0,      // Vertex 10 (front top right)
   -3, 2, -3, 1.0, 0.0, 1.0,     // Vertex 11 (front top left)

   // Vertices for the bottom face
   -3, 0, 3, 1.0, 0.0, 1.0,   // Vertex 12 (back bottom left)
   3, 1, 3, 1.0, 0.0, 1.0,    // Vertex 13 (back bottom right)
   3, 1, -3, 1.0, 0.0, 1.0,     // Vertex 14 (front bottom right)
   -3, 0, -3, 1.0, 0.0, 1.0,    // Vertex 15 (front bottom left)

   // Vertices for the left face
   -3, 0, 3, 1.0, 0.0, 1.0,   // Vertex 16 (back bottom left)
   -3, 2, 3, 1.0, 0.0, 1.0,    // Vertex 17 (back top left)
   -3, 2, -3, 1.0, 0.0, 1.0,     // Vertex 18 (front top left)
   -3, 0, -3, 1.0, 0.0, 1.0,   // Vertex 19 (front bottom left)

   // Vertices for the right face
   3, 0, 3, 1.0, 0.0, 1.0,    // Vertex 20 (back bottom right)
   3, 2, 3, 1.0, 0.0, 1.0,     // Vertex 21 (back top right)
   3, 2, -3, 1.0, 0.0, 1.0,      // Vertex 22 (front top right)
   3, 0, -3, 1.0, 0.0, 1.0      // Vertex 23 (front bottom right)
];

    var BALOK_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, BALOK_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(block_vertex), GL.STATIC_DRAW);

    //FACES
    var block_faces = [
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
    var BLOCK_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, BLOCK_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(block_faces), GL.STATIC_DRAW);

    //TABUNG TEMBAKAN TANK
    //POINTS :
    var circleRadius = 0.3; // Doubling the radius
    var circlePoints = [];
    var jumlahPoints = 100;
    var circleFaces = [];
    // circlePoints.push();
    for (var i = 0; i < jumlahPoints; i++) {
        var theta = (i / jumlahPoints) * 2 * Math.PI;

        var x = Math.cos(theta) * circleRadius;
        var y = Math.sin(theta) * circleRadius;

        circlePoints.push(x, y, 0);

        circlePoints.push(1.0, 1.0, 0.0);
    }

    for (var i = 0; i < jumlahPoints; i++) {
        var theta = (i / jumlahPoints) * 2 * Math.PI;

        var x = Math.cos(theta) * circleRadius;
        var y = Math.sin(theta) * circleRadius;

        circlePoints.push(x, y, 8.3);

        circlePoints.push(1.0, 1.0, 0.0);
    }

    circleFaces.push(100);

    for (var i = 0; i < jumlahPoints; i++) {
        circleFaces.push(i);
    }
    
    for (var i = 0; i < jumlahPoints; i++) {
        circleFaces.push(i + jumlahPoints);
    }
    
    //Creating faces for tube
    for (var i = 0; i < jumlahPoints; i++) {
        circleFaces.push(i, (i + jumlahPoints) % (jumlahPoints * 2), (i + 1) % jumlahPoints);
        circleFaces.push((i + 1) % jumlahPoints, (i + jumlahPoints) % (jumlahPoints * 2), (i + 1 + jumlahPoints) % (jumlahPoints * 2));
    }

    var CIRCLE_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(circlePoints), GL.STATIC_DRAW);

    //FACES
    var circle_faces = circleFaces;
    var CIRCLE_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRCLE_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(circle_faces), GL.STATIC_DRAW);

    //TABUNG RODA1 TANK
    //POINTS :
    var circleRadius_roda1 = 1; // Doubling the radius
    var circlePoints_roda1 = [];
    var jumlahPoints_roda1 = 100;
    var circleFaces_roda1 = [];
    // circlePoints.push();
    for (var i = 0; i < jumlahPoints_roda1; i++) {
        var theta_roda1 = (i / jumlahPoints_roda1) * 2 * Math.PI;

        var x_roda1 = Math.cos(theta_roda1) * circleRadius_roda1;
        var y_roda1 = Math.sin(theta_roda1) * circleRadius_roda1;

        circlePoints_roda1.push(x_roda1, y_roda1, 0);

        circlePoints_roda1.push(0.0, 0.8, 0.8);
    }

    for (var i = 0; i < jumlahPoints_roda1; i++) {
        var theta_roda1 = (i / jumlahPoints_roda1) * 2 * Math.PI;

        var x_roda1 = Math.cos(theta_roda1) * circleRadius_roda1;
        var y_roda1 = Math.sin(theta_roda1) * circleRadius_roda1;

        circlePoints_roda1.push(x_roda1, y_roda1, 0.5);

        circlePoints_roda1.push(0.0, 0.8, 0.8);
    }

    circleFaces_roda1.push(100);

    for (var i = 0; i < jumlahPoints_roda1; i++) {
        circleFaces_roda1.push(i);
    }
    
    for (var i = 0; i < jumlahPoints_roda1; i++) {
        circleFaces_roda1.push(i + jumlahPoints_roda1);
    }
    
    //Creating faces for tube
    for (var i = 0; i < jumlahPoints_roda1; i++) {
        circleFaces_roda1.push(i, (i + jumlahPoints_roda1) % (jumlahPoints_roda1 * 2), (i + 1) % jumlahPoints_roda1);
        circleFaces_roda1.push((i + 1) % jumlahPoints_roda1, (i + jumlahPoints_roda1) % (jumlahPoints_roda1 * 2), (i + 1 + jumlahPoints_roda1) % (jumlahPoints_roda1 * 2));
    }

    var RODA1_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, RODA1_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(circlePoints_roda1), GL.STATIC_DRAW);

    //FACES
    var roda1_faces = circleFaces_roda1;
    var RODA1_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RODA1_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(roda1_faces), GL.STATIC_DRAW);

    //TABUNG RODA2 TANK
    //POINTS :
    var circleRadius_roda2 = 1; // Doubling the radius
    var circlePoints_roda2 = [];
    var jumlahPoints_roda2 = 100;
    var circleFaces_roda2 = [];
    // circlePoints.push();
    for (var i = 0; i < jumlahPoints_roda2; i++) {
        var theta_roda1 = (i / jumlahPoints_roda2) * 2 * Math.PI;

        var x_roda1 = Math.cos(theta_roda1) * circleRadius_roda2;
        var y_roda1 = Math.sin(theta_roda1) * circleRadius_roda2;

        circlePoints_roda2.push(x_roda1, y_roda1, 0);

        circlePoints_roda2.push(0.0, 0.8, 0.8);
    }

    for (var i = 0; i < jumlahPoints_roda2; i++) {
        var theta_roda1 = (i / jumlahPoints_roda2) * 2 * Math.PI;

        var x_roda1 = Math.cos(theta_roda1) * circleRadius_roda2;
        var y_roda1 = Math.sin(theta_roda1) * circleRadius_roda2;

        circlePoints_roda2.push(x_roda1, y_roda1, 0.5);

        circlePoints_roda2.push(0.0, 0.8, 0.8);
    }

    circleFaces_roda2.push(100);

    for (var i = 0; i < jumlahPoints_roda2; i++) {
        circleFaces_roda2.push(i);
    }
    
    for (var i = 0; i < jumlahPoints_roda2; i++) {
        circleFaces_roda2.push(i + jumlahPoints_roda2);
    }
    
    //Creating faces for tube
    for (var i = 0; i < jumlahPoints_roda2; i++) {
        circleFaces_roda2.push(i, (i + jumlahPoints_roda2) % (jumlahPoints_roda2 * 2), (i + 1) % jumlahPoints_roda2);
        circleFaces_roda2.push((i + 1) % jumlahPoints_roda2, (i + jumlahPoints_roda2) % (jumlahPoints_roda2 * 2), (i + 1 + jumlahPoints_roda2) % (jumlahPoints_roda2 * 2));
    }

    var RODA2_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, RODA2_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(circlePoints_roda2), GL.STATIC_DRAW);

    //FACES
    var roda2_faces = circleFaces_roda2;
    var RODA2_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RODA2_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(roda2_faces), GL.STATIC_DRAW);

    //TABUNG RODA3 TANK
    //POINTS :
    var circleRadius_roda3 = 1; // Doubling the radius
    var circlePoints_roda3 = [];
    var jumlahPoints_roda3 = 100;
    var circleFaces_roda3 = [];
    // circlePoints.push();
    for (var i = 0; i < jumlahPoints_roda3; i++) {
        var theta_roda1 = (i / jumlahPoints_roda3) * 2 * Math.PI;

        var x_roda1 = Math.cos(theta_roda1) * circleRadius_roda3;
        var y_roda1 = Math.sin(theta_roda1) * circleRadius_roda3;

        circlePoints_roda3.push(x_roda1, y_roda1, 0);

        circlePoints_roda3.push(0.0, 0.8, 0.8);
    }

    for (var i = 0; i < jumlahPoints_roda3; i++) {
        var theta_roda1 = (i / jumlahPoints_roda3) * 2 * Math.PI;

        var x_roda1 = Math.cos(theta_roda1) * circleRadius_roda3;
        var y_roda1 = Math.sin(theta_roda1) * circleRadius_roda3;

        circlePoints_roda3.push(x_roda1, y_roda1, 0.5);

        circlePoints_roda3.push(0.0, 0.8, 0.8);
    }

    circleFaces_roda3.push(100);

    for (var i = 0; i < jumlahPoints_roda3; i++) {
        circleFaces_roda3.push(i);
    }
    
    for (var i = 0; i < jumlahPoints_roda3; i++) {
        circleFaces_roda3.push(i + jumlahPoints_roda3);
    }
    
    //Creating faces for tube
    for (var i = 0; i < jumlahPoints_roda3; i++) {
        circleFaces_roda3.push(i, (i + jumlahPoints_roda3) % (jumlahPoints_roda3 * 2), (i + 1) % jumlahPoints_roda3);
        circleFaces_roda3.push((i + 1) % jumlahPoints_roda3, (i + jumlahPoints_roda3) % (jumlahPoints_roda3 * 2), (i + 1 + jumlahPoints_roda3) % (jumlahPoints_roda3 * 2));
    }

    var RODA3_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, RODA3_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(circlePoints_roda3), GL.STATIC_DRAW);

    //FACES
    var roda3_faces = circleFaces_roda3;
    var RODA3_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RODA3_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(roda3_faces), GL.STATIC_DRAW);

    //TABUNG RODA4 TANK
    //POINTS :
    var circleRadius_roda4 = 1; // Doubling the radius
    var circlePoints_roda4 = [];
    var jumlahPoints_roda4 = 100;
    var circleFaces_roda4 = [];
    // circlePoints.push();
    for (var i = 0; i < jumlahPoints_roda4; i++) {
        var theta_roda1 = (i / jumlahPoints_roda4) * 2 * Math.PI;

        var x_roda1 = Math.cos(theta_roda1) * circleRadius_roda4;
        var y_roda1 = Math.sin(theta_roda1) * circleRadius_roda4;

        circlePoints_roda4.push(x_roda1, y_roda1, 0);

        circlePoints_roda4.push(0.0, 0.8, 0.8);
    }

    for (var i = 0; i < jumlahPoints_roda4; i++) {
        var theta_roda1 = (i / jumlahPoints_roda4) * 2 * Math.PI;

        var x_roda1 = Math.cos(theta_roda1) * circleRadius_roda4;
        var y_roda1 = Math.sin(theta_roda1) * circleRadius_roda4;

        circlePoints_roda4.push(x_roda1, y_roda1, 0.5);

        circlePoints_roda4.push(0.0, 0.8, 0.8);
    }

    circleFaces_roda4.push(100);

    for (var i = 0; i < jumlahPoints_roda4; i++) {
        circleFaces_roda4.push(i);
    }
    
    for (var i = 0; i < jumlahPoints_roda4; i++) {
        circleFaces_roda4.push(i + jumlahPoints_roda4);
    }
    
    //Creating faces for tube
    for (var i = 0; i < jumlahPoints_roda4; i++) {
        circleFaces_roda4.push(i, (i + jumlahPoints_roda4) % (jumlahPoints_roda4 * 2), (i + 1) % jumlahPoints_roda4);
        circleFaces_roda4.push((i + 1) % jumlahPoints_roda4, (i + jumlahPoints_roda4) % (jumlahPoints_roda4 * 2), (i + 1 + jumlahPoints_roda4) % (jumlahPoints_roda4 * 2));
    }

    var RODA4_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, RODA4_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(circlePoints_roda4), GL.STATIC_DRAW);

    //FACES
    var roda4_faces = circleFaces_roda4;
    var RODA4_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RODA4_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(roda4_faces), GL.STATIC_DRAW);

    //MATRIX
    var PROJMATRIX = LIBS.get_projection(40, CANVAS.width / CANVAS.height, 1, 100);
    var MOVEMATRIX = LIBS.get_I4();
    var VIEWMATRIX = LIBS.get_I4();

    var MOVEMATRIX_KUBUS = LIBS.get_I4();
    var MOVEMATRIX_BALOK = LIBS.get_I4();
    var MOVEMATRIX_TABUNG_TANK = LIBS.get_I4(); 
    var MOVEMATRIX_RODA1 = LIBS.get_I4(); 
    var MOVEMATRIX_RODA2 = LIBS.get_I4();   
    var MOVEMATRIX_RODA3 = LIBS.get_I4();   
    var MOVEMATRIX_RODA4 = LIBS.get_I4();   



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
            
            LIBS.set_I4(MOVEMATRIX);
            LIBS.rotateX(MOVEMATRIX, PHI); 
            LIBS.rotateY(MOVEMATRIX, THETA);

            //TANAH
            LIBS.set_I4(MOVEMATRIX);
            LIBS.rotateX(MOVEMATRIX, Math.PI / 2);
            LIBS.translateY(MOVEMATRIX, -3);

            //KUBUS
            LIBS.set_I4(MOVEMATRIX_KUBUS);
            LIBS.translateY(MOVEMATRIX_KUBUS, 1.3);
            LIBS.rotateY(MOVEMATRIX_KUBUS, -11);
            LIBS.translateZ(MOVEMATRIX_KUBUS, 5);

            //BALOK
            LIBS.set_I4(MOVEMATRIX_BALOK);
            LIBS.translateY(MOVEMATRIX_BALOK, -1.47);
            LIBS.rotateY(MOVEMATRIX_BALOK, -11);
            LIBS.translateZ(MOVEMATRIX_BALOK, 5);

            //TABUNG TEMBAKAN TANK
            LIBS.set_I4(MOVEMATRIX_TABUNG_TANK);
            LIBS.translateZ(MOVEMATRIX_TABUNG_TANK, 2.5);
            LIBS.rotateY(MOVEMATRIX_TABUNG_TANK, -11);
            LIBS.translateY(MOVEMATRIX_TABUNG_TANK, 0.5);

            //TABUNG RODA1
            LIBS.set_I4(MOVEMATRIX_RODA1);
            LIBS.translateX(MOVEMATRIX_RODA1, -1); 
            LIBS.translateY(MOVEMATRIX_RODA1, -0.6); 
            LIBS.translateZ(MOVEMATRIX_RODA1, 8); 

            //TABUNG RODA2
            LIBS.set_I4(MOVEMATRIX_RODA2);
            LIBS.translateX(MOVEMATRIX_RODA2, 1); 
            LIBS.translateY(MOVEMATRIX_RODA2, -0.6); 
            LIBS.translateZ(MOVEMATRIX_RODA2, 8); 

            //TABUNG RODA3
            LIBS.set_I4(MOVEMATRIX_RODA3);
            LIBS.translateX(MOVEMATRIX_RODA3, -1); 
            LIBS.translateY(MOVEMATRIX_RODA3, -0.6); 
            LIBS.translateZ(MOVEMATRIX_RODA3, 1.5); 

            //TABUNG RODA4
            LIBS.set_I4(MOVEMATRIX_RODA4);
            LIBS.translateX(MOVEMATRIX_RODA4, 1); 
            LIBS.translateY(MOVEMATRIX_RODA4, -0.6); 
            LIBS.translateZ(MOVEMATRIX_RODA4, 1.5); 

            //CAMERA INTERPOLATION
            cameraPosition.x += (targetCameraPosition.x - cameraPosition.x) * 0.1;
            cameraPosition.y += (targetCameraPosition.y - cameraPosition.y) * 0.1;
            cameraPosition.z += (targetCameraPosition.z - cameraPosition.z) * 0.1;

            //CAMERA
            LIBS.set_I4(VIEWMATRIX);
            LIBS.translateX(VIEWMATRIX, cameraPosition.x);
            LIBS.translateY(VIEWMATRIX, cameraPosition.y);
            LIBS.translateZ(VIEWMATRIX, cameraPosition.z);
            // LIBS.rotateX(VIEWMATRIX, PHI);
            LIBS.rotateY(VIEWMATRIX, THETA);

            time_prev = time;
        }

        GL.viewport(0, 0, CANVAS.width, CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.D_BUFFER_BIT);

        GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);

        //DRAWING
        //MAP TANAH
        GL.bindBuffer(GL.ARRAY_BUFFER, SQUARE_VERTEX);

        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.uniform1f(_greyscality, 1);
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, SQUARE_FACES);
        GL.drawElements(GL.TRIANGLES, square_faces.length, GL.UNSIGNED_SHORT, 0);

        GL.drawElements(GL.LINE_STRIP, square_faces.length, GL.UNSIGNED_SHORT, 0);


        //KUBUS
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_KUBUS);

        GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);

        GL.uniform1f(_greyscality, 1);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
        GL.drawElements(GL.TRIANGLES, cube_faces.length, GL.UNSIGNED_SHORT, 0);

        //TABUNG TEMBAKAN TANK
        GL.bindBuffer(GL.ARRAY_BUFFER, CIRCLE_VERTEX);

        GL.uniform1f(_greyscality, 1);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CIRCLE_FACES);
        GL.drawElements(GL.TRIANGLES, circle_faces.length, GL.UNSIGNED_SHORT, 0);

        //TABUNG RODA1
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_RODA1);

        GL.bindBuffer(GL.ARRAY_BUFFER, RODA1_VERTEX);

        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RODA1_FACES);
        GL.drawElements(GL.TRIANGLE_FAN, roda1_faces.length, GL.UNSIGNED_SHORT, 0);

        //BALOK
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_BALOK);

        GL.bindBuffer(GL.ARRAY_BUFFER, BALOK_VERTEX); 

        GL.uniform1f(_greyscality, 1);
        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, BLOCK_FACES); 
        GL.drawElements(GL.TRIANGLES, block_faces.length, GL.UNSIGNED_SHORT, 0); 

        //TABUNG RODA2
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_RODA2);

        GL.bindBuffer(GL.ARRAY_BUFFER, RODA2_VERTEX);

        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RODA2_FACES);
        GL.drawElements(GL.TRIANGLE_FAN, roda2_faces.length, GL.UNSIGNED_SHORT, 0);

        //TABUNG RODA3
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_RODA3);

        GL.bindBuffer(GL.ARRAY_BUFFER, RODA3_VERTEX);

        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RODA3_FACES);
        GL.drawElements(GL.TRIANGLE_FAN, roda3_faces.length, GL.UNSIGNED_SHORT, 0);

        //TABUNG RODA4
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX_RODA4);

        GL.bindBuffer(GL.ARRAY_BUFFER, RODA4_VERTEX);

        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, RODA4_FACES);
        GL.drawElements(GL.TRIANGLE_FAN, roda4_faces.length, GL.UNSIGNED_SHORT, 0);
          
        GL.flush();
        window.requestAnimationFrame(animate);
    }

    
    animate(0);

}
window.addEventListener('load', main);