/* =================================================================
   KRONOS ENGINE V.100.4
   Core Logic, Audio Synthesis, Canvas Physics & Interaction
   ================================================================= */

const sys = {
    audioCtx: null,
    isMuted: false
};

// --- 1. AUDIO ENGINE (SINTETIZADOR PURO) ---
function initAudio() {
    if (!sys.audioCtx) {
        sys.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    if (!sys.audioCtx) return;
    if (sys.audioCtx.state === 'suspended') sys.audioCtx.resume();

    const osc = sys.audioCtx.createOscillator();
    const gain = sys.audioCtx.createGain();
    const now = sys.audioCtx.currentTime;

    osc.connect(gain);
    gain.connect(sys.audioCtx.destination);

    if (type === 'click') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start();
        osc.stop(now + 0.1);
    } else if (type === 'heavy') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(60, now);
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.5);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start();
        osc.stop(now + 0.5);
    } else if (type === 'glitch') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.1);
        gain.gain.setValueAtTime(0.03, now);
        osc.start();
        osc.stop(now + 0.15);
    } else if (type === 'hover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, now);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.start();
        osc.stop(now + 0.1);
    }
}

// --- 2. BOOTLOADER LOGIC ---
const logs = [
    "INICIALIZANDO KERNEL KRONOS...",
    "CARREGANDO MÓDULOS DE GUERRA...",
    "VERIFICANDO INTEGRIDADE ESTRUTURAL... OK",
    "ANALISANDO PERFIL DO USUÁRIO... FRACO",
    "ESTABELECENDO CONEXÃO SEGURA...",
    "ACESSO CONCEDIDO."
];

window.onload = () => {
    const logContainer = document.getElementById('boot-logs-container');
    const progressBar = document.getElementById('boot-progress-bar');
    const initBtn = document.getElementById('btn-initialize-system');
    let index = 0;

    const interval = setInterval(() => {
        if (index >= logs.length) {
            clearInterval(interval);
            progressBar.style.width = '100%';
            // Mostra o botão para garantir interação do usuário (fix áudio)
            initBtn.style.display = 'flex';
            return;
        }

        const div = document.createElement('div');
        div.innerText = `> ${logs[index]}`;
        div.style.marginBottom = '5px';
        div.style.fontFamily = "'Share Tech Mono', monospace";
        if (logs[index].includes('FRACO')) div.style.color = '#ff0000';
        logContainer.appendChild(div);
        
        progressBar.style.width = `${(index / logs.length) * 100}%`;
        index++;
    }, 200);

    // Evento de Clique para Iniciar
    initBtn.addEventListener('click', () => {
        initAudio(); // Inicia contexto de áudio
        document.getElementById('boot-screen').style.display = 'none';
        document.getElementById('main-content').style.opacity = '1';
        
        // Inicia sistemas
        initMatrix();
        initRadar();
        startClock();
        playSound('heavy');
    });
};

// --- 3. MATRIX RAIN (CANVAS) ---
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');
let width, height;

function initMatrix() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
    const fontSize = 14;
    const columns = width / fontSize;
    const drops = [];

    for (let i = 0; i < columns; i++) drops[i] = 1;

    function draw() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = "#0F0"; // Terminal Green
        ctx.font = fontSize + "px monospace";

        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;
            
            // Randomly turn some chars red for effect
            if(Math.random() > 0.98) ctx.fillStyle = "#F00";
            else ctx.fillStyle = "#0F0";

            ctx.fillText(text, x, y);

            if (y > height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
        requestAnimationFrame(draw);
    }
    draw();
}

function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

// --- 4. RADAR CANVAS ---
function initRadar() {
    const rCanvas = document.getElementById('radar-canvas');
    if (!rCanvas) return;
    const rCtx = rCanvas.getContext('2d');
    let angle = 0;

    function drawRadar() {
        const w = 180, h = 180;
        rCtx.clearRect(0, 0, w, h);
        
        // Grid Circles
        rCtx.strokeStyle = 'rgba(0, 255, 65, 0.2)';
        rCtx.lineWidth = 1;
        rCtx.beginPath(); rCtx.arc(90, 90, 40, 0, Math.PI * 2); rCtx.stroke();
        rCtx.beginPath(); rCtx.arc(90, 90, 80, 0, Math.PI * 2); rCtx.stroke();
        
        // Sweep Line
        rCtx.save();
        rCtx.translate(90, 90);
        rCtx.rotate(angle);
        rCtx.beginPath();
        rCtx.moveTo(0, 0);
        rCtx.arc(0, 0, 85, 0, 0.2);
        rCtx.lineTo(0, 0);
        rCtx.fillStyle = 'rgba(0, 255, 65, 0.1)';
        rCtx.fill();
        
        // Random Blips
        if(Math.random() > 0.95) {
            rCtx.fillStyle = '#F00';
            rCtx.fillRect(Math.random()*90 + 45, Math.random()*90 + 45, 3, 3);
        }

        rCtx.restore();
        
        angle += 0.05;
        requestAnimationFrame(drawRadar);
    }
    drawRadar();
}

// --- 5. INTERACTION LOGIC ---
function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

// Protocolo Daguestão (Typewriter)
let typeInterval;
function loadProtocol(type, el) {
    document.querySelectorAll('.console-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    
    const output = document.getElementById('console-output');
    let text = "";
    
    if (type === 'urso') text = ">> INICIANDO PROTOCOLO URSO...\n\n1. LEVANTAMENTO TERRA (5x5 PESADO)\n2. BARRA FIXA (50 REPS TOTAIS)\n3. FARMER WALK (10 MINUTOS)\n\nOBJETIVO: CONSTRUIR BLINDAGEM CORPORAL.";
    else if (type === 'lobo') text = ">> INICIANDO PROTOCOLO LOBO...\n\n1. CORRIDA 10KM (RITMO ALTO)\n2. 100 BURPEES\n3. SPRINTS EM MORRO\n\nOBJETIVO: AUMENTAR LIMIAR DE DOR.";
    else if (type === 'aguia') text = ">> INICIANDO PROTOCOLO ÁGUIA...\n\n1. 30 MIN SILÊNCIO ABSOLUTO\n2. LEITURA ESTRATÉGICA (MAQUIAVEL)\n3. VISUALIZAÇÃO DE MORTE (MEMENTO MORI)\n\nOBJETIVO: FRIEZA ESTRATÉGICA.";
    
    output.innerText = "";
    clearInterval(typeInterval);
    let i = 0;
    
    typeInterval = setInterval(() => {
        output.innerText += text.charAt(i);
        i++;
        if (i >= text.length) clearInterval(typeInterval);
    }, 20);
    
    playSound('click');
}

// Terminal CLI
const cliInput = document.getElementById('cli-input');
const cliHistory = document.getElementById('cli-history');

if(cliInput) {
    cliInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = cliInput.value.toLowerCase().trim();
            let resp = "COMANDO NÃO RECONHECIDO.";
            
            if (cmd === 'help') resp = "COMANDOS DISPONÍVEIS: STATUS, TREINO, FINANCEIRO, CLEAR";
            else if (cmd === 'status') resp = "ANÁLISE: MENTE INSTÁVEL // CORPO FRACO // DISCIPLINA ZERO";
            else if (cmd === 'clear') { cliHistory.innerHTML = ""; cliInput.value = ""; return; }
            
            cliHistory.innerHTML += `<div style="color:#0f0; margin-top:5px;">root@kronos:~# ${cmd}</div><div style="color:#888; margin-bottom:10px;">${resp}</div>`;
            cliInput.value = "";
            playSound('click');
            
            // Auto scroll
            const container = document.querySelector('.cli-container');
            if(container) container.scrollTop = container.scrollHeight;
        }
    });
}

// --- 6. DEATH CLOCK ---
function startClock() {
    const el = document.getElementById('death-clock');
    if(!el) return;
    const target = new Date();
    target.setFullYear(target.getFullYear() + 40);
    
    setInterval(() => {
        const now = new Date();
        const diff = target - now;
        
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        const ms = Math.floor((diff % 1000) / 10);
        
        el.innerText = `${h}:${m}:${s}:${ms}`;
    }, 50);
}

// --- 7. CONTRACT SIGNATURE (BUG FIX: OVERLAY) ---
function signContract() {
    const spot = document.getElementById('signature-display');
    const flash = document.getElementById('fx-flash');
    
    spot.innerText = "KRONOS INITIATE";
    spot.style.fontFamily = "'Black Ops One', cursive";
    spot.style.color = "#8a0000";
    
    flash.style.opacity = 1;
    playSound('heavy');
    
    setTimeout(() => { flash.style.opacity = 0; }, 300);
    
    // Mostra o Overlay Final em vez de apagar o body
    setTimeout(() => {
        const overlay = document.getElementById('final-overlay');
        overlay.style.display = 'flex';
        // Força reflow
        void overlay.offsetWidth;
        overlay.style.opacity = 1;
        
        // Oculta o conteúdo principal atrás
        document.getElementById('main-content').style.display = 'none';
        document.querySelector('.hud-layer').style.display = 'none';
    }, 1500);
}

// --- 8. CURSOR LOGIC ---
const cursorDot = document.getElementById('cursor-dot');
const cursorReticle = document.getElementById('cursor-reticle');
const axisX = document.getElementById('cursor-axis-x');
const axisY = document.getElementById('cursor-axis-y');

document.addEventListener('mousemove', (e) => {
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top = e.clientY + 'px';
    
    // Pequeno delay para o retículo
    setTimeout(() => {
        cursorReticle.style.left = e.clientX + 'px';
        cursorReticle.style.top = e.clientY + 'px';
        axisX.style.top = e.clientY + 'px';
        axisY.style.left = e.clientX + 'px';
    }, 50);
});

// Efeitos de Hover
document.querySelectorAll('.interact-sound').forEach(el => {
    el.addEventListener('mouseenter', () => {
        document.body.classList.add('hover-active');
        playSound('hover');
    });
    el.addEventListener('mouseleave', () => {
        document.body.classList.remove('hover-active');
    });
    el.addEventListener('click', function() {
        playSound(this.getAttribute('data-sound') || 'click');
    });
});

// Scroll Reveal
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
