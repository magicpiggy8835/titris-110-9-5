'use strict'
/** @type {HTMLCanvasElement} */
    const canvas = document.getElementById("drawplace");
    const ctx = canvas.getContext("2d");

class Screen {
    constructor(args) {
        let def = {
            height: 22,
            width: 12,
            span: 40,
            gui: 10,
        }
        //Object.assign(def, args);
        Object.assign(this, def);
    }
    draw() {
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width + this.gui; j++) {
                decoration(j, i, colortypes[map[i][j]]);
            }
        }
    }
}

class Player {
    constructor(args) {
        let def = {
            x: 0,
            y: 0,
            keep: { kind: -1, block: [[0, 0, 0], [0, 0, 0]] },
            hold: { kind: -1, block: [] },
            next: { kind: 0, block: [] },
            score: 0,
            difficulty: 0,
        }
        //Object.assign(def, args);
        Object.assign(this, def);
        // this.catch();
    }
    catch() {
        if (this.hold.kind === -1) this.next.kind = rand(6, 0);
        this.hold.kind = this.next.kind;
        this.hold.block = blocktypes[this.next.kind];
        this.next.kind = rand(6, 0);
        this.next.block = blocktypes[this.next.kind];
        this.x = Math.floor((12 - this.hold.block[0].length) / 2) - 0;
        this.y = 1;
        if (this.touch(this.x, this.y)) {
            $('#drawplace').hide();
            $('#table').hide();
            $("#over").show();
            $("#back").hide();
            document.getElementById("final").innerHTML = "Final score : " + this.score;
            $("#final").show();
            pause = 1;
            
            return ;
        }
        if(this.score === 1000 && speed === 0){
            speed++;
            time/=2;
        }
        if(this.score === 2000 && speed === 1){
            speed++;
            time/=2;
        }
        if(this.score === 3000 && speed === 2){
            speed++;
            time/=2;
        }
        this.draw();
    }
    move(x, y) {
        if(pause===1)return;
        if (x === 1) {
            if (this.touch(this.x + 1, this.y)) {
                return;
            }
            this.x++;
        }
        if (x === -1) {
            if (this.touch(this.x - 1, this.y)) {
                return;
            }
            this.x--;
        }
        if (y === 1) {
            this.down();
        }
        if (y === -1) {
            let tmp = [];
            let tmp2 = this.hold.block;
            let k = this.hold.block.length - 1;
            for (let i = 0; i < this.hold.block.length; i++) {
                for (let j = 0; j < this.hold.block[i].length; j++) {
                    if (i === 0) tmp[j] = [];
                    tmp[j][k] = this.hold.block[i][j];
                }
                k--;
            }
            this.hold.block = tmp;
            if (this.touch(this.x, this.y)) {
                this.hold.block = tmp2;
            }
        }
        this.draw();
    }
    touch(x, y) {
        for (let i = 0; i < this.hold.block.length; i++) {
            for (let j = 0; j < this.hold.block[i].length; j++) {
                if (this.hold.block[i][j] !== 0 && map[y + i][x + j] !== 0) {
                    return true;
                }
            }
        }
        return false;
    }
    down() {
        if(pause===1)return;
        if (this.touch(this.x, this.y + 1)) {
            if(this.hold.kind===7){
                for(let i=this.y-2;i<=this.y+4;i++){
                    for(let j=this.x-2;j<=this.x+4;j++){
                        if(i>=screen.height || j>=screen.width || map[i][j]===8 || map[i][j]===10)continue;
                        map[i][j]=0;
                    }
                }
                this.catch();
                return true;
            }
            for (let i = 0; i < this.hold.block.length; i++) {
                for (let j = 0; j < this.hold.block[i].length; j++) {
                    if (this.hold.block[i][j] === 0) continue;
                    map[this.y + i][this.x + j] = this.hold.block[i][j];
                }
            }
            for (let i = screen.height - 2; i >= 2; i--) {
                if (!map[i].includes(0) && !map[i].includes(10)) {
                    for (let j = i; j >= 2; j--) {
                        map[j] = sa(map[j - 1]);
                    }
                    for (let j = 1; j < screen.width - 1; j++) {
                        map[1][j] = 0;
                    }
                    i++;
                    this.score += 100;
                    /*if(this.score === 5000 && win === false){
                        win = true;
                        pause = 1;
                        alert("You win !\nPress p if you want to continue playing");
                    }*/
                }
            }
            used = 0;
            this.catch();
            return true;
        }
        this.y++;
        this.draw();
    }
    draw() {
        screen.draw();
        let tmpy = 1;
        while (!this.touch(this.x, this.y + tmpy)) {
            tmpy++;
        }
        tmpy--;
        for (let i = 0; i < this.hold.block.length; i++) {
            for (let j = 0; j < this.hold.block[i].length; j++) {
                if (this.hold.block[i][j] === 0) continue;
                decoration(this.x + j, this.y + i, colortypes[this.hold.block[i][j]]);
                ctx.strokeRect((this.x + j) * screen.span, (this.y + tmpy + i) * screen.span, screen.span, screen.span);
            }
        }
        for (let i = 0; i < this.keep.block.length; i++) {
            for (let j = 0; j < this.keep.block[i].length; j++) {
                decoration(15 + j, 18 + i, colortypes[this.keep.block[i][j]]);
            }
        }
        for (let i = 0; i < this.next.block.length; i++) {
            for (let j = 0; j < this.next.block[i].length; j++) {
                decoration(15 + j, 5 + i, colortypes[this.next.block[i][j]]);
            }
        }
        ctx.save();

        ctx.fillStyle = `rgb(255,255,255)`;
        ctx.shadowColor = `rgb(50,80,200)`;
        ctx.shadowBlur = 10;
        ctx.font = "40px arial";
        if(player.difficulty==0){
            ctx.fillText("Level-0", 15 * screen.span, 1 * screen.span);
        }
        if(player.difficulty==1){
            ctx.fillText("Level-1", 15 * screen.span, 1 * screen.span);
        }
        if(player.difficulty==2){
            ctx.fillText("Level-2", 15 * screen.span, 1 * screen.span);
        }
        if(player.difficulty==3){
            ctx.fillText("Level-3", 15 * screen.span, 1 * screen.span);
        }
        ctx.fillText("next", 15 * screen.span, 4 * screen.span);
        ctx.fillText("keep", 15 * screen.span, 17 * screen.span);
        ctx.fillText("score", 15 * screen.span, 13 * screen.span);
        ctx.fillText(this.score, 15 * screen.span, 14 * screen.span);
        ctx.fillText("bombs",15 * screen.span, 9 * screen.span);
        ctx.fillText(bombs,15 * screen.span, 10 * screen.span);

        ctx.restore();
    }
}

let screen = new Screen();

let player = new Player();

canvas.height = screen.height * screen.span;
canvas.width = (screen.width + screen.gui) * screen.span;

let blocktypes = [
    [[1, 1, 1, 1]],
    [[2, 2], [2, 2]],
    [[3, 3, 3], [0, 3, 0]],
    [[4, 4, 4], [4, 0, 0]],
    [[5, 5, 5], [0, 0, 5]],
    [[6, 6, 0], [0, 6, 6]],
    [[0, 7, 7], [7, 7, 0]],
    [[0,8,0],[8,8,8],[8,8,8],[8,8,8]],
]

let colortypes = [
    [255, 255, 255],
    [255, 0, 0],
    [0, 255, 0],
    [247, 0, 255],
    [0, 100, 200],
    [200, 100, 0],
    [0, 255, 255],
    [255, 255, 0],
    [0, 0, 0],
    [220,220,220],
    [180, 180, 180],
]

let map = [];

let used = 0;

let pause=0 ;

let bombs=1;

let time;
let speed = 0;
let difficulty = 0;
let win = false;
addEventListener("keydown", e => {
    let movement = e.key;
    // console.log(movement);
    
    if (movement === 'ArrowRight') {
        player.move(1, 0);
    }
    if (movement === 'ArrowLeft') {
        player.move(-1, 0);
    }
    if (movement === 'ArrowDown') {
        player.move(0, 1);
    }
    if (movement === 'ArrowUp') {
        player.move(0, -1);
    }
    if (movement === ' ') {
        while (!player.down()) {
            if(pause==1)break;
        }
        player.draw();
    }
    if (movement === 'c' || movement === 'C') {
        if (used === 1 || pause === 1) return;
        used = 1;
        if (player.keep.kind === -1) {
            player.keep.kind = player.hold.kind;
            player.keep.block = blocktypes[player.keep.kind];
            player.catch();
            player.draw();
            return;
        }
        else {
            let another = player.hold.kind;
            player.hold.kind = player.keep.kind;
            player.keep.kind = another;
        }
        player.x = Math.floor((12 - player.hold.block[0].length) / 2) - 0;
        player.y = 1;
        player.keep.block = blocktypes[player.keep.kind];
        player.hold.block = blocktypes[player.hold.kind];
        player.draw();
    }
    if(movement==='p' || movement ==='P'){
        if(pause===0){
            pause=1;
            alert("paused");
        }
        else {
            pause=0;
            alert("continue");
        }
    }
    if(movement==='b' || movement==='B'){
        if(bombs===0||pause===1)return;
        bombs--;
        player.hold.kind=7;
        player.hold.block=blocktypes[player.hold.kind];
        player.x = Math.floor((12 - player.hold.block[0].length) / 2) - 0;
        player.y = 1;
        player.draw();
    }
})

function init() {
    pause = 0;
    player.score = 0;
    player.keep.kind = -1;
    player.keep.block = [[0, 0, 0], [0, 0, 0]];
    used = 0;
    for (let i = 0; i < screen.height; i++) {
        map[i] = [];
        for (let j = 0; j < screen.width; j++) {
            if (i === 0 || j === 0 || i === screen.height - 1 || j === screen.width - 1) {
                map[i][j] = 8;
            }
            else map[i][j] = 0;
        }
        for (let j = screen.width; j < screen.gui + screen.width; j++) map[i][j] = 9;
    }
    for (let i = screen.height - 2; i > screen.height - 2 - (player.difficulty) * 2; i--) {
        for (let j = 1; j < screen.width - 1; j++) {
            map[i][j] = 10;
        }
    }
    player.catch();
    player.draw();    
    if(player.difficulty===0)time=2000;
    else if(player.difficulty===1)time=1500;
    else time=500;
    speed = 0;
    setTimeout(harder, 60*1000);
}
//init();

function rand(max, min) {
    return Math.floor(Math.random() * (max - min + 1));
}

function decoration(x, y, colors) {
    ctx.save();

    ctx.translate(x * screen.span, y * screen.span);
    ctx.fillStyle = `rgb(${colors[0]},${colors[1]},${colors[2]})`;
    /*ctx.shadowColor = `rgb(${colors[0]}, ${colors[1]+10}, ${colors[2]})`;
    ctx.shadowBlur = 10 ;*/
    ctx.fillRect(0, 0, screen.span, screen.span);

    if (map[y][x] === 9 || map[y][x] === 10) {
        ctx.restore();
        return;
    }
    if (map[y][x] === 8) {
        ctx.fillStyle = `rgb(${30 + (255 - 30) / 255 * 120},${30 + (255 - 30) / 255 * 120},${30 + (255 - 30) / 255 * 120})`
    }
    else ctx.fillStyle = `rgb(${180 + (255 - 180) / 255 * 120},${180 + (255 - 180) / 255 * 120},${180 + (255 - 180) / 255 * 120})`
    for (let degree = 0; degree <= 270; degree += 90) {
        ctx.translate((degree % 270 === 0) ? 0 : screen.span, (degree < 180) ? 0 : screen.span);
        ctx.rotate(degree * Math.PI / 180);
        ctx.beginPath();
        let w = 2;
        if(map[y][x] === 0 || map[y][x] === 8) w = 0;
        ctx.moveTo(0, 0);
        ctx.lineTo(w, w);
        ctx.lineTo(screen.span - w, w);
        ctx.lineTo(screen.span, 0);
        ctx.fill();
        ctx.closePath();
    }

    ctx.restore();
}

function sa(i) {
    return JSON.parse(JSON.stringify(i));
}
function ddown() {
    if (map.length !== 0) player.down();
    setTimeout(ddown, time);
}
setTimeout(ddown, time);
function harder() {
    if(difficulty > 5)return;
    difficulty ++;
    for (let i = screen.height - 2; i > screen.height - 2 -(player.difficulty + difficulty - 1) ; i--){
        for (let j = 1; j < screen.width - 1; j++){
            map[i][j] = 10;
        }
    }
    setTimeout(harder, 60*1000);
}
function test(){
    ctx.font = "300px Arial"
    ctx.fillText("TEST", 110, 220);
}
//setTimeout(test, 5*1000);
// setInterval(()=>{
//     player.down();
// },2000)
