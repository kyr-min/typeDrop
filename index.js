var metaArr = []
var imagesLink = [];

var engine;

let isOpen = false;

let imageNumber = -1;
let ropeNumber = 0;

let timeOutA, timeOutB;

let isColliding = 0;

let hangingImage = null;

let idStart = 58;

let rope;

function init() {
    for(let i =0; i< 21; i++) {
        if(i < 20){
            let imgURL = document.querySelectorAll(".hiddenInput")[i].value;
            let originURL = document.querySelectorAll(".hiddenP")[i].innerText;
            getMeta(imgURL, originURL)
        } else {
            setTimeout(() => {
                start(imagesLink);
            }, 1000);   
            
        }
        
    }
}

function getMeta(url, origin){
    const img = new Image();
    img.addEventListener("load", function() {
        let obj = {width: this.naturalWidth, height: this.naturalHeight}
        metaArr.push(obj)
        let res = {
            url: url,
            meta: obj,
            origin: `https://google.com${origin}`
        }
        imagesLink.push(res);
    });
    img.src = url;
}

function start(temp) {
    let arr = temp;
    console.log(imagesLink);

    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Body = Matter.Body,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
        Constraint = Matter.Constraint,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        Collision = Matter.Collision,
        Detector = Matter.Detector,
        Events = Matter.Events,
        Bodies = Matter.Bodies;

    // create engine
    engine = Engine.create();
    let world = engine.world;

    // create renderer
    var render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: window.innerWidth,
            height: window.innerHeight,
            wireframes: false
        }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    // add bodies
    Composite.add(world, [
        Bodies.rectangle(400, 615, 1200, 50.5, { isStatic: true, label: "bottomWall",render: { fillStyle: '#060a19' } }),
        Bodies.rectangle(400, -15, 1200, 50.5, { isStatic: true, label: "topWall",render: { fillStyle: '#060a19' } }),
        Bodies.rectangle(-190, 000, 20, 1200,{ isStatic: true, label: "leftWall",render: { fillStyle: '#060a19' }}),
        Bodies.rectangle(990, 000, 20, 1200,{ isStatic: true, label: "rightWall",render: { fillStyle: '#060a19' }}),
    ]);
    //30 - 800
    var stack = Composites.stack(30, 0, 5, 4, 10, 10, function(x, y) {
        imageNumber++;
        return Bodies.rectangle(x, y, arr[imageNumber].meta.width, arr[imageNumber].meta.height, { 
            restitution: 0.3, 
            friction: 0.2,
            label: `image ${imageNumber}`,
            render: {
                strokeStyle: '#ffffff',
                sprite: {
                    texture: imagesLink[imageNumber].url,
                    xScale: 1,
                    yScale: 1
                },
                wireframes: false
            } 
        });
    });

    var group = Body.nextGroup(true);
    var ropeC = Composites.stack(-50,0, 15, 1, 10, 10, function(x, y) {
        return Bodies.rectangle(x - 20, y, 20, 15, { collisionFilter: { group: group }, chamfer: { radius: 4 }, label: "rope", render: {
            fillStyle:"#8e5939"
        }});
        
    });

    
    
    Composites.chain(ropeC, 0.3, 0, -0.3, 0, { stiffness: 1, damping: 0.1, length: 0, render:{visible: false}});
    Composite.add(ropeC, Constraint.create({ 
        bodyB: ropeC.bodies[0],
        pointB: { x: -5, y: 0 },
        pointA: { x: ropeC.bodies[0].position.x, y: ropeC.bodies[0].position.y },
        stiffness: 0.5,
        damping: 1,
        render:{
            visible: false,
            
        }
    }));

    

    
    Composite.add(world, [
        ropeC,
        stack,
    ]);

    rope = ropeC

    //40 41
    detectorA = Composite.get(ropeC, 41, "body");
    Events.on(engine, 'collisionStart', function(event) {
        var pairs = event.pairs;
        for(let i =0; i< pairs.length; i++){
            var pair = pairs[i];
            if((pair.bodyA == detectorA && pair.bodyB.label.includes("image"))&& isColliding==0 ) {
                isColliding = 1;

                let imageIndex = pair.bodyB.label.slice(6, undefined);
                console.log(imageIndex);
                console.log(hangingImage);
                hangingImage =  {
                    id: pair.bodyB.id,
                    url: imagesLink[imageIndex].origin
                }
                
                pair.bodyB.collisionFilter.group = -1;
                let Xoffset = metaArr[imageIndex].width /2;
                let Yoffset = metaArr[imageIndex].height /2;
                
                Composite.add(ropeC, Constraint.create({
                    bodyB: pair.bodyB,
                    pointB: { x: Xoffset, y: Yoffset },
                    bodyA: pair.bodyA,
                    pointA : { x: 0, y: 0},
                    stiffness : 0.5,
                    damping: 0.5,
                    render: {
                        visible: false
                    }
                }));
                setSidebarUrl()
                console.log(pair.bodyB);
                // setTimeout(() => {
                //     console.log("detaching");
                //     handleDetach(ropeC);
                // }, 3000)
            } else if((pair.bodyB == detectorA && pair.bodyA.label.includes("image"))&& isColliding==0) {
                isColliding = 1;
                let imageIndex = pair.bodyA.label.slice(6, undefined);
                hangingImage =  {
                    id: pair.bodyA.id,
                    url: imagesLink[imageIndex].origin
                }
                pair.bodyA.collisionFilter.group = -1;
                let Xoffset = metaArr[imageIndex].width /2;
                let Yoffset = metaArr[imageIndex].height /2;
                Composite.add(ropeC, Constraint.create({
                    bodyB: pair.bodyA,
                    pointB: { x: 0, y: 0 },
                    bodyA: pair.bodyB,
                    pointA : { x: 0, y: 0},
                    stiffness : 0.5,
                    damping: 0.5,
                    render: {
                        visible: false
                    }
                }));
                setSidebarUrl()
                console.log(pair.bodyA);

                // setTimeout(() => {
                //     console.log("detaching");
                //     handleDetach(ropeC);
                // }, 3000)
            }
        }

        
    });

    // add mouse control
    var mouse = Mouse.create(render.canvas),
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.1,
                render: {
                    visible: false
                }
            }
        });

    Composite.add(world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    

    // fit the render viewport to the scene
    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: 800, y: 600 }
    });

    // wrapping using matter-wrap plugin
    var allBodies = Composite.allBodies(world);

    for (var i = 0; i < allBodies.length; i += 1) {
        allBodies[i].plugin.wrap = {
            min: { x: render.bounds.min.x - 100, y: render.bounds.min.y },
            max: { x: render.bounds.max.x + 100, y: render.bounds.max.y }
        };
    }
}

function handleDetach(rope) {
    let block = Matter.Composite.get(engine.world, hangingImage.id, "body");
    let connection = Matter.Composite.get(rope, idStart, "constraint");
    setTimeout(() => {Matter.Composite.get(engine.world, hangingImage.id, "body").collisionFilter.group = 0; hangingImage = null;}, 1000)
    Matter.Composite.remove(rope, Matter.Composite.get(rope, idStart, "constraint"));
    isColliding = 0;
    setSidebarUrl(1)
    idStart++;
}

function test() {
    document.getElementById("sideWindow").classList.add("open");
    document.getElementById("openButton").classList.add("open");
    document.getElementById("openButtonContainer").classList.add("open");
}

function testtwo() {
    document.getElementById("sideWindow").classList.remove("open");
    document.getElementById("openButton").classList.remove("open");
    document.getElementById("openButtonContainer").classList.remove("open");
}


init();

function setSidebarUrl(toExample = 0) {
    if(toExample == 0) {
        console.log(hangingImage.url);
        document.getElementById("sideIframe").src = hangingImage.url;
    } else {
        document.getElementById("sideIframe").src = "https://example.com/";
    }
    
}

function disableClick(element) {
    element.style.pointerEvents = "none";
    setTimeout(() => {
        element.style.pointerEvents = "auto"
    }, 450);
}

function openHandle() {
    if(isOpen) {
        testtwo();
        isOpen = false;
    } else {
        test();
        isOpen = true;
    }
}