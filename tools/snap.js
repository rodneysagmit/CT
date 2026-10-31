const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const jobs = JSON.parse(process.argv[2]);
  for (const [q,out,w,h] of jobs) {
    const p = await b.newPage({ viewport: { width: w||1200, height: h||900 } });
    p.on('pageerror',e=>console.log('ERR',e.message)); p.on('console',m=>{if(m.type()==='error'||m.text().startsWith('PTS'))console.log(out, m.text())});
    await p.goto('http://localhost:8811/tools/render.html?'+q);
    await p.waitForFunction(()=>document.title==='done',null,{timeout:60000});
    await p.screenshot({ path: out, omitBackground: q.includes('alpha=1') });
    await p.close();
  }
  await b.close();
})();
