(() => {
  'use strict';
  const wall = document.getElementById('appreciationWall');
  if(!wall)return;
  const samples = [
    'A real answer from a friend will go here.',
    'A little thing someone loves about her will go here.',
    'Every note in the private birthday version will be in their own words.'
  ];
  samples.forEach((quote,i)=>{
    const article=document.createElement('article');article.className='ap-note';
    article.style.animationDelay=(i*85)+'ms';
    const doodle=document.createElement('span');doodle.className='ap-note-doodle';doodle.setAttribute('aria-hidden','true');doodle.textContent=['✿','♡','✦'][i];
    const q=document.createElement('blockquote');q.className='ap-note-quote';q.textContent='“'+quote+'”';
    const name=document.createElement('div');name.className='ap-note-signature';name.textContent='♡ — PREVIEW EXAMPLE';
    const pin=document.createElement('span');pin.className='ap-note-pin';pin.setAttribute('aria-hidden','true');pin.textContent=['♡','✿','✧'][i];
    article.append(doodle,q,name,pin);wall.append(article);
  });
})();
