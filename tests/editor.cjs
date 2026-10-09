const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
(async () => {
 const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try {
 const page = await browser.newPage({viewport:{width:1400,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.ILLUS_URL || 'http://127.0.0.1:8000');
 await page.locator('#new').click();await page.locator('#name').fill('Capas y máscaras');await page.locator('#width').fill('400');await page.locator('#height').fill('300');await page.locator('#submit').click();
 const data=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=40;c.height=40;const ctx=c.getContext('2d');ctx.fillStyle='#ff0000';ctx.fillRect(0,0,40,40);return c.toDataURL('image/png').split(',')[1]});
 const file={name:'referencia.png',mimeType:'image/png',buffer:Buffer.from(data,'base64')};
 await page.locator('#importImage').click();await page.locator('#imageFile').setInputFiles(file);await page.waitForFunction(()=>document.querySelectorAll('#canvas > image').length===1);
 await page.getByRole('button',{name:'Bloquear capa',exact:true}).click();
 const before=await page.locator('#canvas > image').getAttribute('transform');
 const b=await page.locator('#canvas').boundingBox();
 await page.mouse.move(b.x+200,b.y+150);await page.mouse.down();await page.mouse.move(b.x+220,b.y+170);await page.mouse.up();
 assert.equal(await page.locator('#canvas > image').getAttribute('transform'),before);
 await page.locator('#delete').click();assert.equal(await page.locator('#canvas > image').count(),1);
 await page.locator('[data-tool="polygon"]').click();
 for(const [x,y] of [[50,50],[150,50],[50,150]])await page.mouse.click(b.x+x,b.y+y);
 await page.locator('#closePath').click();assert.equal(await page.locator('#canvas > polygon').count(),1);
 await page.locator('#maskImage').click();await page.locator('#imageFile').setInputFiles(file);await page.waitForFunction(()=>document.querySelectorAll('#canvas > g').length===1);
 assert.equal(await page.locator('#canvas clipPath polygon').count(),1);
 await page.locator('#back').click();await page.reload();await page.locator('.preview').click();
 assert.equal(await page.locator('#canvas > image').getAttribute('data-locked'),'true');assert.equal(await page.locator('#canvas clipPath polygon').count(),1);
 for(const [button,extension]of [['export','svg'],['exportPNG','png']]){const pending=page.waitForEvent('download');await page.locator('#'+button).click();const d=await pending;await d.saveAs('/tmp/illus-layers.'+extension)}
 const png=await fs.readFile('/tmp/illus-layers.png');assert.equal(png.readUInt32BE(16),400);assert.equal(png.readUInt32BE(20),300);
 const result=await page.evaluate(async()=>{const svg=document.querySelector('#canvas').cloneNode(true);svg.setAttribute('xmlns','http://www.w3.org/2000/svg');const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'}));const img=new Image();img.src=url;await img.decode();const c=document.createElement('canvas');c.width=400;c.height=300;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);const inside=[...ctx.getImageData(60,60,1,1).data],outside=[...ctx.getImageData(140,140,1,1).data];URL.revokeObjectURL(url);return{inside,outside}});
 assert.deepEqual(result.inside,[255,0,0,255]);assert.equal(result.outside[3],0);
 assert.deepEqual(errors,[]);console.log('PASS: importar imagen, bloquear movimiento y eliminación, cerrar vector, recortar imagen, persistir capas y máscara, SVG y PNG 400×300, recorte con píxeles transparentes fuera de la forma.');
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
