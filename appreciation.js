(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const names = ['Freyja + Paolo','Paolo','Chesca','Glesnan','Chloe + Precious','Yeisha','Liam','Shawn + Victor','Maggie','Michiko'];
  const STORAGE_KEY = 'projectBDAY_appreciation_2026_11';
  const seedEl = $('#appreciationSeed');
  // Snapshot the original locked page, before any editor or birthday interaction.
  const pristineHTML = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
  const fallbackNotes = (typeof BDAY !== 'undefined' && Array.isArray(BDAY.appreciationNotes)) ? BDAY.appreciationNotes : [];
  function normalize(source){
    const raw = Array.isArray(source) ? source : [];
    return names.map((name) => {
      const found=raw.find(x => x && x.name===name);
      // Carry forward notes stored under the older, separate names.
      if(!found && name==='Chloe + Precious'){
        const older=raw.filter(x=>x && (x.name==='Chloe'||x.name==='Precious') && typeof x.quote==='string' && x.quote.trim());
        if(older.length) return {name,quote:(older.length===1?older[0].quote:older.map(x=>x.name+': '+x.quote).join('\n\n')).slice(0,1800)};
      }
      return {name,quote:typeof found?.quote==='string'?found.quote.slice(0,1800):''};
    });
  }
  function readEmbedded(){try { return JSON.parse(seedEl?.textContent||'[]'); } catch {return [];} }
  function readStorage(){ try {return JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');}catch{return null;} }
  function hasQuotes(x){return Array.isArray(x)&&x.some(a=>typeof a?.quote==='string'&&a.quote.trim());}
  // Embedded notes take priority in downloaded birthday-ready copies so the file is portable.
  const seed=readEmbedded();
  const saved=readStorage();
  const queryEdit = new URLSearchParams(location.search).get('edit')==='1';
  // Keep newly embedded submissions, while retaining any non-empty notes saved in this browser.
  const sourceNotes=normalize(hasQuotes(seed) ? seed : fallbackNotes);
  const savedNotes=normalize(saved);
  let data=sourceNotes.map(item=>{
    const local=savedNotes.find(x=>x.name===item.name);
    return {name:item.name,quote:local && local.quote.trim() ? local.quote : item.quote};
  });
  let editorOpen=false;
  const wall=$('#appreciationWall');
  const fields=$('#apEditorFields');
  const editor=$('#appreciationEditor');
  function el(tag,className,text){const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n;}
  function draw(){
    if(!wall)return;
    wall.replaceChildren();
    const filled=data.filter(x=>x.quote.trim());
    if(!filled.length){
      const empty=el('div','ap-note-empty');empty.append(el('span','', '♡'),el('p','', 'Her people are collecting their favorite little things about her. These notes are still on their way.'));
      wall.append(empty);return;
    }
    const doodles=['✿','♡','✦','☁','❀','⟡'];
    const pins=['✿','♡','✦','⋆','☁','❀'];
    filled.forEach((x,i)=>{
      const article=el('article','ap-note');
      article.style.animationDelay=(i*85)+'ms';
      const doodle=el('span','ap-note-doodle',doodles[i%doodles.length]);
      doodle.setAttribute('aria-hidden','true');
      const q=el('blockquote','ap-note-quote', '“'+x.quote.trim()+'”');
      const signature=el('div','ap-note-signature');signature.append(el('span','ap-note-heart','♡'),el('span','', '— '+x.name));
      const pin=el('span','ap-note-pin',pins[(i+2)%pins.length]);
      pin.setAttribute('aria-hidden','true');
      article.append(doodle,q,signature,pin);wall.append(article);
    });
  }
  function renderFields(){
    if(!fields)return;fields.replaceChildren();
    for(const x of data){
      const group=el('div','ap-editor-field');
      const label=el('label','',x.name);
      const id='ap-input-'+names.indexOf(x.name);label.htmlFor=id;
      const area=el('textarea');area.id=id;area.rows=4;area.maxLength=1800;
      area.placeholder='Paste '+x.name+"’s actual answer here…";area.value=x.quote;
      area.addEventListener('input',()=>{x.quote=area.value;draw();saveLocal(false);});
      group.append(label,area);fields.append(group);
    }
  }
  function status(message){const st=$('#apEditorStatus');if(st)st.textContent=message;}
  function saveLocal(show=true){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));if(show)status('Saved on this browser. Download the birthday-ready HTML to keep these notes inside a portable file.');}catch{if(show)status('Browser storage is unavailable. Download your updated HTML now to avoid losing your changes.');}}
  function openEditor(){editor.hidden=false;editorOpen=true;document.body.classList.add('ap-editor-open');renderFields();editor.querySelector('textarea')?.focus();}
  function closeEditor(){editor.hidden=true;editorOpen=false;document.body.classList.remove('ap-editor-open');}
  function downloadFile(filename,body,mime){const blob=new Blob([body],{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),6000);}
  function embeddedJSON(){return JSON.stringify(data,null,2).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');}
  function exportHtml(){
    saveLocal(false);
    // This writes the real submitted notes into the downloaded HTML source.
    // The single-file preview is fully offline; the editable project index still needs its assets folder.
    const markup=pristineHTML.replace(/(<script id="appreciationSeed" type="application\/json">)[\s\S]*?(<\/script>)/, (_match,head,tail)=>head+embeddedJSON()+tail);
    downloadFile('BDAY_Marjie_With_Appreciation.html',markup,'text/html;charset=utf-8');
    status('HTML downloaded! Open the downloaded copy to check your notes. The offline preview version includes all video assets.');
    openEditor();
  }
  $('#apSave')?.addEventListener('click',()=>saveLocal());
  $('#apEditorClose')?.addEventListener('click',closeEditor);
  $('#apDownloadSite')?.addEventListener('click',exportHtml);
  $('#apExportJson')?.addEventListener('click',()=>downloadFile('BDAY_Appreciation_Backup.json',JSON.stringify(data,null,2),'application/json;charset=utf-8'));
  $('#apImportJson')?.addEventListener('change',async e=>{
    const file=e.target.files?.[0];if(!file)return;
    try{
      const incoming=JSON.parse(await file.text());
      if(!Array.isArray(incoming))throw new Error('Expected list of notes');
      data=normalize(incoming);draw();renderFields();saveLocal();status('Notes restored from '+file.name+'. Download your updated HTML to preserve them.');
    }catch {status('Could not import notes. Please select a JSON backup created by this editor.');}
    e.target.value='';
  });
  document.addEventListener('keydown',e=>{
    if(e.altKey&&e.shiftKey&&e.key.toLowerCase()==='e'){e.preventDefault();editorOpen?closeEditor():openEditor();}
    if(e.key==='Escape'&&editorOpen){e.stopPropagation();closeEditor();}
  });
  draw();
  if(queryEdit)openEditor();
})();
