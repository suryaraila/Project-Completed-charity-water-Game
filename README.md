# Project-Completed-charity-water-Game
(() => {
  const area = document.getElementById('game-area');
  const startBtn = document.getElementById('start');
  const restartBtn = document.getElementById('restart');
  const scoreEl = document.getElementById('score');
  const timeEl = document.getElementById('time');
  const difficultySelect = document.getElementById('difficulty');
  const message = document.getElementById('message');
  const milestoneList = document.getElementById('milestone-list');

  let score = 0; let timeLeft = 60; let spawnTimer = null; let gameTimer = null; let running = false;

  const difficulties = {
    easy: {spawn:900, fallDuration:5500, time:75},
    normal: {spawn:700, fallDuration:4200, time:60},
    hard: {spawn:450, fallDuration:3000, time:45}
  };

  const milestones = [{score:10,msg:'Good start!'}, {score:25,msg:'Making waves!'}, {score:50,msg:'Community impact!'}];
  const reachedMilestones = new Set();

  function playBeep(type='collect'){
    try{
      const ctx = new (window.AudioContext||window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      if(type==='collect'){o.frequency.value=880;g.gain.value=0.05}
      else if(type==='miss'){o.frequency.value=220;g.gain.value=0.04}
      else{o.frequency.value=1320;g.gain.value=0.08}
      o.type='sine'; o.start(); setTimeout(()=>{o.stop();ctx.close()},100);
    }catch(e){}
  }

  function spawnDrop(){
    const d = document.createElement('div'); d.className='drop';
    if(Math.random()<0.25) d.classList.add('small');
    const left = Math.random()*(area.clientWidth-48);
    d.style.left = left+'px';
    area.appendChild(d);

    const dur = currentConfig.fallDuration + (Math.random()-0.5)*600;
    requestAnimationFrame(()=>{ d.style.transition = `top ${dur}ms linear`; d.style.top = (area.clientHeight+48)+'px'; });

    const onClick = (e)=>{
      e.stopPropagation();
      collectDrop(d);
    };
    d.addEventListener('click', onClick);

    // remove when reached bottom
    const removeTimeout = setTimeout(()=>{
      if(!d.parentElement) return;
      playBeep('miss');
      d.remove();
    }, dur+50);
  }

  function collectDrop(el){
    score += (el.classList.contains('small')?1:3);
    scoreEl.textContent = score;
    playBeep('collect');
    checkMilestones();
    el.remove();
  }

  function checkMilestones(){
    milestones.forEach(m=>{
      if(score>=m.score && !reachedMilestones.has(m.score)){
        reachedMilestones.add(m.score);
        const li = document.createElement('li'); li.textContent = `${m.score} points — ${m.msg}`;
        milestoneList.appendChild(li);
        flashMessage(m.msg);
      }
    });
  }

  function flashMessage(text){
    message.textContent = text; message.classList.remove('hidden');
    setTimeout(()=>message.classList.add('hidden'),1600);
  }

  let currentConfig = difficulties.normal;

  function startGame(){
    if(running) return;
    running = true; score = 0; scoreEl.textContent=score; reachedMilestones.clear(); milestoneList.innerHTML='';
    currentConfig = difficulties[difficultySelect.value] || difficulties.normal;
    timeLeft = currentConfig.time; timeEl.textContent = timeLeft;

    spawnTimer = setInterval(spawnDrop, currentConfig.spawn);
    gameTimer = setInterval(()=>{
      timeLeft--; timeEl.textContent = timeLeft;
      if(timeLeft<=0) endGame();
    },1000);
    startBtn.classList.add('hidden'); restartBtn.classList.add('hidden');
  }

  function endGame(){
    running = false; clearInterval(spawnTimer); clearInterval(gameTimer);
    // remove remaining drops
    document.querySelectorAll('.drop').forEach(d=>d.remove());
    const msg = `Time's up — Score: ${score}`;
    flashMessage(msg);
    playBeep('win');
    restartBtn.classList.remove('hidden');
  }

  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', ()=>{ startBtn.classList.remove('hidden'); restartBtn.classList.add('hidden'); });

  // Accessibility: space to start
  document.addEventListener('keydown', e=>{ if(e.code==='Space'){ e.preventDefault(); startGame(); }});

  // Make sure game area resizes correctly when window changes
  window.addEventListener('resize', ()=>{});

})();
