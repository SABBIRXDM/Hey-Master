const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
const mouse = { x: null, y: null, radius: 60 };

window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; });

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.size = 1.3;
        this.color = '#ff2d75';
        this.vx = 0;
        this.vy = 0;
        this.friction = 0.82;
        this.ease = 0.45; 
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
            let force = (mouse.radius - distance) / mouse.radius;
            this.vx -= (dx / distance) * force * 50;
            this.vy -= (dy / distance) * force * 50;
        }
        this.vx += (this.baseX - this.x) * this.ease;
        this.vy += (this.baseY - this.y) * this.ease;
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.x += this.vx;
        this.y += this.vy;
    }
}

function getHeartPoints() {
    const points = [];
    const density = 20000;
    for (let i = 0; i < density; i++) {
        let t = Math.random() * Math.PI * 2;
        let r = Math.sqrt(Math.random());
        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        points.push({ x: (x * r) * 16 + canvas.width / 2, y: (y * r) * 16 + canvas.height / 2 - 30 });
    }
    return points;
}

function getTextPoints(text) {
    // ব্ল্যাঙ্ক হওয়া রোধ করতে ক্যানভাস রিসেট এবং ফন্ট ফিক্স
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    // মোটা ফন্ট ৯৬% ভরাট করার জন্য
    ctx.font = '800 180px sans-serif'; 
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const points = [];
    // ঘনত্ব বাড়ানোর জন্য খুব ছোট গ্যাপে স্ক্যানিং
    for (let y = 0; y < canvas.height; y += 3) {
        for (let x = 0; x < canvas.width; x += 3) {
            if (data[(y * canvas.width + x) * 4 + 3] > 128) {
                points.push({ 
                    x: x + (Math.random() - 0.5) * 4, 
                    y: y + (Math.random() - 0.5) * 4 
                });
            }
        }
    }
    return points;
}

function init(type, value = "") {
    let targetPoints = type === 'heart' ? getHeartPoints() : getTextPoints(value);

    // ব্ল্যাঙ্ক সমস্যা ফিক্স: যদি কোনো কারণে পয়েন্ট না পাওয়া যায়, তবে হার্টে ফিরে যাবে
    if (targetPoints.length === 0 && value !== "") return;

    // পার্টিকেল সংখ্যা অ্যাডজাস্ট করা (Merge/Split লজিক)
    if (targetPoints.length > particles.length) {
        const extra = targetPoints.length - particles.length;
        for (let i = 0; i < extra; i++) {
            const source = particles.length > 0 ? particles[Math.floor(Math.random() * particles.length)] : {x: canvas.width/2, y: canvas.height/2};
            particles.push(new Particle(source.x, source.y));
        }
    } else {
        particles.length = targetPoints.length;
    }

    for (let i = 0; i < particles.length; i++) {
        particles[i].baseX = targetPoints[i].x;
        particles[i].baseY = targetPoints[i].y;
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }
    requestAnimationFrame(animate);
}

const input = document.getElementById('userInput');
input.addEventListener('input', (e) => {
    const val = e.target.value;
    init(val.trim() === "" ? 'heart' : 'text', val);
});

// শুরুর হার্ট লোড
init('heart');
animate();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init(input.value ? 'text' : 'heart', input.value);
});