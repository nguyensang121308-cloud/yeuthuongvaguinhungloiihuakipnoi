/* =====================================================================
   FILE NÀY LÀ "BỘ MÁY" — BẠN KHÔNG CẦN SỬA.
   Toàn bộ chữ, chủ đề, thư, hashtag, chữ ký, hiệu ứng được sửa trong
   index.html (mục KHO NỘI DUNG). File này chỉ đọc chúng ra và hiển thị.
   Có lỗi nhập liệu (thiếu dòng, sai id...) thì trang tự dùng giá trị mặc định
   chứ không bị đứng.
   ===================================================================== */
const docKho = sel => [...document.querySelectorAll(sel)].map(e=>e.textContent.replace(/\r\n?/g,'\n'));
const chuanHoa = s => String(s||'').trim().toLowerCase().replace(/\s+/g,'-');
const dongMoi = s => String(s).replace(/\s*\|\s*/g,'\n');                    // gõ | để xuống dòng
const danhSach = s => String(s).split(/[\s,]+/).filter(Boolean);
const so = (v,mac)=>{ const n = parseFloat(String(v).replace(',','.')); return isNaN(n) ? mac : n; };

/* Tách phần thông tin (dòng "khoá: giá trị") khỏi phần nội dung. Dòng --- ngăn cách hai phần. */
function tachDau(text, khoaHopLe){
  const dong = text.split('\n'); const h = {}; let i = 0;
  for(; i<dong.length; i++){
    const ln = dong[i], t = ln.trim();
    if(t==='') continue;
    if(/^-{3,}$/.test(t)){ i++; break; }
    const m = ln.match(/^\s*([A-Za-z0-9_]+)\s*:\s*(.*)$/);
    if(m && khoaHopLe.has(m[1].toLowerCase())){ h[m[1].toLowerCase()] = m[2].trim(); continue; }
    break;                                                    // gặp dòng không phải khoá: từ đây là nội dung
  }
  return { h, than: dong.slice(i).join('\n').trim() };
}

/* ---- Cài đặt chung ---- */
const KV = {};
docKho('#cauhinh').forEach(t=>t.split('\n').forEach(ln=>{
  const m = ln.match(/^\s*([A-Za-z0-9_]+)\s*:\s*(.*)$/);
  if(m) KV[m[1].toLowerCase()] = m[2].trim();
}));
const lay = (k,mac)=> (k in KV) ? KV[k] : mac;      // có dòng mà để trống = cố ý ẩn; xóa hẳn dòng = dùng mặc định

const CHU = {
  bia_tieude : lay('bia_tieude',''),
  bia_phu    : lay('bia_phu',''),
  bia_tem    : dongMoi(lay('bia_tem','')),
  bia_ky     : lay('bia_ky','Đến Từ Ban Truyền Thông'),
  bia_ky_noibat : lay('bia_ky_noibat','Truyền Thông'),
  bia_dau    : dongMoi(lay('bia_dau','')),
  bia_h1     : lay('bia_h1','Những điều tôi đã viết'),
  bia_nut    : lay('bia_nut','Chạm vào bưu thiếp để mở thư'),
  thap_tde   : lay('thap_tde','Chọn một bức thư'),
  thap_dem   : lay('thap_dem','{n} bức thư'),
  banner_tde : lay('banner_tde','Gửi đến bạn'),
  banner_phu : lay('banner_phu','Chọn một chủ đề để mở những bức thư'),
  banner_ve  : lay('banner_ve','← Về bìa'),
  loai_dem   : lay('loai_dem','{n} bức thư'),
  thap_ve    : lay('thap_ve','← Chọn chủ đề khác'),
  hashtag      : danhSach(lay('hashtag','')),
  hashtag_troi : danhSach(lay('hashtag_troi','#gửiđếnbạn #thưtay #mãiyêu'))
};
const TRANG_TRI_KHONG_ANH = !/^(tat|tắt|khong|không|no|off|0)$/i.test(lay('trangtri_khong_anh','bat'));
const CHU_KY = {
  macDinh : dongMoi(lay('chuky_macdinh','Hẹn thư sau ♥')),
  kieuChu : lay('chuky_kieuchu','Playwrite VN').replace(/['"]/g,''),
  coChu   : so(lay('chuky_cochu','1.45'),1.45)
};
const HIEU_UNG = {
  tiLe : Math.min(1, Math.max(0, so(lay('hieuung_tile','0.7'),0.7))),
  loai : danhSach(lay('hieuung_loai','phao-hoa lap-lanh bong-bay tim-hong phao-hoa-dem'))
};

/* ---- Chủ đề ---- */
const KHOA_LOAI = new Set(['id','ten','mota','anh','trangtri']);
const LOAI = docKho('script.chude').map((t,k)=>{
  const h = tachDau(t,KHOA_LOAI).h;
  return { id: chuanHoa(h.id) || ('chu-de-'+(k+1)), ten: h.ten || ('Chủ đề '+(k+1)), mota: h.mota||'', anh: h.anh||'', trangtri: chuanHoa(h.trangtri) };
});
if(!LOAI.length) LOAI.push({ id:'thu', ten:'Thư', mota:'', anh:'' });

/* ---- Thư ---- */
const KHOA_THU = new Set(['loai','tieude','ngay','anh','chuthich','ky','hieuung','hoa']);
const KHONG_ANH = /^(|khong|không|none|no|-)$/i;           // anh: khong  (hoặc bỏ hẳn dòng anh:) = thư không có ảnh
const thu = docKho('script.la-thu').map((t,k)=>{
  const { h, than } = tachDau(t,KHOA_THU);
  return {
    loai: chuanHoa(h.loai), tieude: h.tieude || ('Thư '+(k+1)), ngay: h.ngay||'', anh: KHONG_ANH.test(h.anh||'') ? '' : h.anh,
    chuthich: h.chuthich||'', ky: h.ky ? dongMoi(h.ky) : '', hieuung: chuanHoa(h.hieuung), hoa: chuanHoa(h.hoa),
    noidung: (than || '...').replace(/\n[ \t]*\n+/g,'\n\n')
  };
});

/* ---------- Màu giấy và màu tem của từng lá thư (đều xanh dương) ---------- */
const giay = ['#f2f8ff','#e8f2fd','#eef3fb','#e6f4f7','#edf0fb','#f5f9fe'];
const tem  = ['#2a78d4','#1b5fb0','#3aa0e8','#5a6fd6','#1f8fa8','#4a90c8'];

/* ---------- Tiện ích ---------- */
const tc = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const doanVan = t => t.split('\n\n').map(p=>`<p>${tc(p)}</p>`).join('');
const ngauNhien = (a,b)=> a + Math.random()*(b-a);
const giamChuyenDong = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Đưa chữ trong CHU lên trang */
const datChu = (id,v)=>{ const e=document.getElementById(id); if(e) e.innerHTML = tc(v).replace(/\n/g,'<br>'); };
datChu('bcTieude',CHU.bia_tieude); datChu('bcPhu',CHU.bia_phu); datChu('bcTem',CHU.bia_tem);
datChu('bcH1',CHU.bia_h1); datChu('bcNut',CHU.bia_nut); datChu('bcDau',CHU.bia_dau); /* Dòng ký ngoài bưu thiếp: phần nổi bật được tô nhiều màu, mỗi chữ cái một màu */
(function(){
  const el = document.getElementById('bcKy'); if(!el) return;
  const text = String(CHU.bia_ky).normalize('NFC'), nb = String(CHU.bia_ky_noibat||'').normalize('NFC');
  const nhieuMau = s => { let n = 0; return [...s].map(ch => /\s/.test(ch) ? ch : `<span class="m${(n++)%6}">${tc(ch)}</span>`).join(''); };
  const i = nb ? text.indexOf(nb) : -1;
  el.innerHTML = i>=0 ? tc(text.slice(0,i)) + nhieuMau(nb) + tc(text.slice(i+nb.length)) : tc(text);
})();
datChu('bnTde',CHU.banner_tde); datChu('bnPhu',CHU.banner_phu); datChu('veBia',CHU.banner_ve); datChu('veBanner',CHU.thap_ve);
document.title = CHU.bia_h1;

const nhoGon = matchMedia('(max-width:700px)').matches;
/* Máy yếu (ít nhân CPU / ít RAM): tự giảm số lượng hiệu ứng cho khỏi giật */
const nheMay = (navigator.hardwareConcurrency||8)<=4 || (navigator.deviceMemory||8)<=4;
const nhe = nhoGon || nheMay;
document.documentElement.classList.toggle('nhe-may', nheMay);

/* Hashtag trang trí: nhãn dán trên ảnh + nhãn lơ lửng quanh bưu thiếp */
const hashEl = document.getElementById('hashtag');
(CHU.hashtag||[]).slice(0,5).forEach((h,k)=>{
  const sp = document.createElement('span'); sp.textContent = h;
  sp.style.setProperty('--g', ((k%3)-1)*3+'deg'); sp.style.setProperty('--dl', (-k*.6)+'s');
  hashEl.appendChild(sp);
});
const tagTroi = document.getElementById('tagTroi');
const oTag = nhoGon ? [[5,91],[52,93]] : [[3,16],[80,13],[84,64],[2,60],[5,86],[76,88]];   // vị trí (% ngang, % dọc)
(CHU.hashtag_troi||[]).slice(0,oTag.length).forEach((h,k)=>{
  const sp = document.createElement('span'); sp.textContent = h;
  sp.style.left = oTag[k][0]+'%'; sp.style.top = oTag[k][1]+'%';
  sp.style.setProperty('--g', (k%2?4:-5)+'deg'); sp.style.setProperty('--dl', (-k*1.1)+'s');
  tagTroi.appendChild(sp);
});

/* =====================================================================
   HOA VÀ TIM (vẽ bằng SVG, không cần tải ảnh)
   Muốn dùng ảnh riêng: thêm đường dẫn vào mảng ANH_RIENG, ví dụ ["images/hoa.png"]
   (nên dùng ảnh nền trong suốt, nếu không sẽ thấy khung vuông)
   ===================================================================== */
const ANH_RIENG = [];
const svgUri = s => 'url("data:image/svg+xml,'+encodeURIComponent(s)+'")';
const tim = c => svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 30"><path d="M16 29C-6 14 5-3 16 8 27-3 38 14 16 29Z" fill="${c}"/></svg>`);
const hoa = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><g fill="#fff" stroke="#b3d3f2" stroke-width="1">`+
  [0,72,144,216,288].map(a=>`<circle cx="20" cy="9" r="8" transform="rotate(${a} 20 20)"/>`).join('')+
  `</g><circle cx="20" cy="20" r="5.5" fill="#ffc83d"/></svg>`);
const kieuHat = [tim('#2a78d4'),tim('#5aa9ee'),tim('#1b5fb0'),hoa,hoa,...ANH_RIENG.map(p=>`url("${p}")`)];

/* Rơi ở nền */
const hatLop = document.getElementById('hatLop');
if(!giamChuyenDong){
  const soHat = nheMay ? 6 : nhoGon ? 8 : 14;                       // điện thoại ít hơn cho nhẹ máy
  for(let i=0;i<soHat;i++){
    const h = document.createElement('i'); h.className='hat';
    const size = ngauNhien(16,nhoGon?30:38);
    h.style.cssText = `left:${ngauNhien(0,97)}%;width:${size}px;height:${size}px;opacity:${ngauNhien(.5,.9)};`+
      `background-image:${kieuHat[i%kieuHat.length]};animation-duration:${ngauNhien(11,22)}s;animation-delay:${-ngauNhien(0,22)}s;`+
      `--dx:${ngauNhien(-90,90)}px;--rot:${ngauNhien(-300,300)}deg`;
    hatLop.appendChild(h);
  }
  /* Tab ẩn thì dừng hoạt ảnh cho đỡ tốn pin */
  document.addEventListener('visibilitychange', ()=>san.classList.toggle('an-hat', document.hidden));
}

/* Nổ hoa tim khi bấm vào bưu thiếp */
function bungHoaTim(x,y){
  if(giamChuyenDong) return;
  const n = nheMay ? 8 : nhe ? 10 : 18;
  for(let i=0;i<n;i++){
    const e = document.createElement('i');
    const size = ngauNhien(14,34);
    e.style.cssText = `position:fixed;z-index:30;pointer-events:none;left:${x}px;top:${y}px;width:${size}px;height:${size}px;`+
      `background:${kieuHat[i%kieuHat.length]} center/contain no-repeat`;
    document.body.appendChild(e);
    const goc = ngauNhien(0,Math.PI*2), xa = ngauNhien(90,Math.min(340,innerWidth*.45));
    const dx = Math.cos(goc)*xa, dy = Math.sin(goc)*xa - ngauNhien(0,60);
    e.animate([
      {transform:'translate(-50%,-50%) scale(.3) rotate(0deg)',opacity:1},
      {transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(1) rotate(${ngauNhien(-360,360)}deg)`,opacity:1,offset:.7},
      {transform:`translate(calc(-50% + ${dx*1.1}px),calc(-50% + ${dy*1.1+50}px)) scale(.9) rotate(${ngauNhien(-420,420)}deg)`,opacity:0}
    ],{duration:ngauNhien(900,1500),easing:'cubic-bezier(.1,.8,.3,1)'}).onfinish = ()=>e.remove();
  }
}

/* ---------- Đổi ảnh bưu thiếp bằng cách chọn file từ máy ---------- */
/* Ảnh của từng lá thư (có màu xanh dự phòng khi chưa có ảnh) */
const dai = [['#2a78d4','#7cc0f5'],['#1b5fb0','#5aa9ee'],['#3aa0e8','#a6d8ff'],
             ['#5a6fd6','#9db4f5'],['#1f8fa8','#7fd3e4'],['#4a90c8','#bfe0f7']];
const nenThu = (t,i)=> `linear-gradient(135deg,${dai[i%6][0]},${dai[i%6][1]})`;
const duongAnh = p => {                                 // chấp nhận đường dẫn có khoảng trắng, dấu \\, chữ có dấu
  p = String(p||'').trim().replace(/\\/g,'/'); if(!p) return '';
  if(/^(data:|https?:|blob:)/.test(p)) return p;
  try{ p = encodeURI(decodeURI(p)); }catch(e){}
  try{ return new URL(p, document.baseURI).href; }catch(e){ return p; }   // đổi thành đường dẫn đầy đủ để ảnh luôn tìm đúng chỗ
};
const anhThuCss = (t,i)=> (t.anh ? `url('${duongAnh(t.anh).replace(/'/g,'%27')}') center/cover no-repeat,` : '') + nenThu(t,i);

/* =====================================================================
   HOA TRANG TRÍ — vẽ bằng SVG (hoa hồng, tulip, hoa sứ), không cần ảnh.
   Mỗi cánh hoa có hai trạng thái: khép (nụ) và nở. Khi cha của hoa có class "nohoa"
   thì cánh hoa chuyển từ khép sang nở (xem CSS ".hoa .p").
   ===================================================================== */
const MAU_HONG  = [['#ff9bbd','#f7578c','#d81b60','#ad1457'],['#ffc2d1','#ff8fab','#ff5d8f','#c9184a'],['#ffd0e0','#ff9ec4','#e8508a','#a8326a']];
const MAU_TULIP = [['#ff6f91','#ff9aae','#e0306a'],['#ff9e5c','#ffc08a','#e8641a'],['#b784ff','#d3b5ff','#7a3fe0'],['#ff5c5c','#ff8f8f','#d62828']];
const VIEN_SU   = ['#f1b5cb','#f5c6a5','#c9defa'];

function hoaSvg(loai, bien, d0){
  bien = bien||0; d0 = d0||0;
  const P = (inner,t0,t1,d,o)=>`<g class="p" style="--t0:${t0};--t1:${t1};--d:${d.toFixed(2)}s;transform-origin:${o||'50px 50px'}">${inner}</g>`;
  let s = '', cao = 100;
  if(loai==='tulip'){
    cao = 140;
    const c = MAU_TULIP[bien%MAU_TULIP.length];
    s += '<path d="M50 138C50 112 50 92 50 74" stroke="#43a047" stroke-width="5" fill="none" stroke-linecap="round"/>'+
         '<path d="M50 136C20 128 14 100 22 84C36 96 48 112 50 136Z" fill="#66bb6a"/>'+
         '<path d="M50 136C80 130 88 104 80 90C66 100 52 114 50 136Z" fill="#4caf50"/>';
    const o = '50px 76px';
    s += P(`<path d="M50 76C27 74 24 44 33 16C41 30 50 42 50 58Z" fill="${c[2]}"/>`,'rotate(20deg)','rotate(-13deg)',d0+.10,o);
    s += P(`<path d="M50 76C73 74 76 44 67 16C59 30 50 42 50 58Z" fill="${c[0]}"/>`,'rotate(-20deg)','rotate(13deg)',d0+.10,o);
    s += P(`<path d="M50 78C35 72 36 40 50 12C64 40 65 72 50 78Z" fill="${c[1]}" stroke="${c[0]}" stroke-width="1"/>`,'scale(.88)','scale(1.04)',d0,o);
  } else if(loai==='su'){
    const v = VIEN_SU[bien%VIEN_SU.length];
    s += P('<ellipse cx="18" cy="82" rx="17" ry="7" transform="rotate(-30 18 82)" fill="#4caf50"/><ellipse cx="84" cy="80" rx="17" ry="7" transform="rotate(30 84 80)" fill="#43a047"/>','scale(.4)','scale(1)',d0);
    for(let i=0;i<5;i++){
      s += P(`<path d="M50 52C30 44 26 14 48 4C70 10 68 40 50 52Z" fill="#fffdf7" stroke="${v}" stroke-width="1"/><path d="M50 50C44 38 45 22 50 12" stroke="${v}" stroke-width="1.3" fill="none" opacity=".7"/>`,
             `rotate(${i*72}deg) scale(.3)`,`rotate(${i*72+10}deg) scale(1)`,d0+i*.07);
    }
    s += P('<circle cx="50" cy="50" r="9" fill="#ffe27a"/><circle cx="50" cy="50" r="4.5" fill="#ffc107"/>','scale(.3)','scale(1)',d0+.2);
  } else {                                           // hoa hồng
    const c = MAU_HONG[bien%MAU_HONG.length], vien = `stroke="${c[2]}" stroke-opacity=".4" stroke-width=".9"`;
    s += P('<ellipse cx="20" cy="80" rx="17" ry="7" transform="rotate(-35 20 80)" fill="#4caf50"/><ellipse cx="82" cy="78" rx="17" ry="7" transform="rotate(35 82 78)" fill="#43a047"/>','scale(.4)','scale(1)',d0);
    for(let i=0;i<5;i++) s += P(`<circle cx="50" cy="26" r="21" fill="${c[0]}" ${vien}/>`,`rotate(${i*72}deg) scale(.3)`,`rotate(${i*72}deg) scale(1)`,d0+.25+i*.05);
    for(let i=0;i<4;i++) s += P(`<circle cx="50" cy="35" r="15" fill="${c[1]}" ${vien}/>`,`rotate(${i*90+20}deg) scale(.3)`,`rotate(${i*90+20}deg) scale(1)`,d0+.12+i*.05);
    for(let i=0;i<3;i++) s += P(`<circle cx="50" cy="43" r="10" fill="${c[2]}" ${vien}/>`,`rotate(${i*120+40}deg) scale(.3)`,`rotate(${i*120+40}deg) scale(1)`,d0+i*.05);
    s += P(`<path d="M45 50a5 5 0 1 1 5 5a8 8 0 0 1-8-8" fill="none" stroke="${c[3]}" stroke-width="2" stroke-linecap="round"/>`,'scale(.3)','scale(1)',d0);
  }
  return `<svg class="hoa" viewBox="0 0 100 ${cao}" aria-hidden="true">${s}</svg>`;
}
const LOAI_HOA = {hong:'hong',hoahong:'hong',rose:'hong',su:'su',hoasu:'su',tulip:'tulip',hoatulip:'tulip',khong:'khong',none:'khong'};
const kieuHoaThu = (t,i)=> LOAI_HOA[t.hoa] || ['hong','su','tulip'][i%3];


/* =====================================================================
   THƯ KHÔNG CÓ ẢNH: thay khung ảnh bằng khối trang trí kiểu bưu điện (sọc hàng không, tem, dấu bưu điện).
   Hình trên tem đổi theo chủ đề: cam-on, xin-loi, dong-vien, ban-be, yeu-thuong, chuc, chinh-minh.
   Chủ đề tự thêm thì ghi  trangtri: yeu-thuong  (một trong 7 kiểu trên) vào khối chủ đề; không ghi = máy bay giấy.
   Cùng bộ hình này cũng làm biểu tượng nhỏ trước chữ ký cuối thư.
   ===================================================================== */
const sao = (cx,cy,R,r,n)=>{ n=n||5; const p=[]; for(let k=0;k<n*2;k++){ const a=-Math.PI/2+k*Math.PI/n, q=k%2?r:R; p.push((cx+Math.cos(a)*q).toFixed(1)+','+(cy+Math.sin(a)*q).toFixed(1)); } return p.join(' '); };
const TIM_D = 'M32 56C4 38 8 10 32 24C56 10 60 38 32 56Z';
const BAY_D = 'M4 28L58 6L42 58L30 38Z';
const tiaNang = Array.from({length:8},(_,k)=>{ const a=k*Math.PI/4, c=Math.cos(a), d=Math.sin(a);
  return `<path d="M${(32+c*17).toFixed(1)} ${(34+d*17).toFixed(1)}L${(32+c*24).toFixed(1)} ${(34+d*24).toFixed(1)}"/>`; }).join('');
const CAN = 'fill="none" stroke="var(--cd)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"';
const TO = 'fill="var(--cd2)" stroke="var(--cd)" stroke-width="2.6" stroke-linejoin="round"';
const bay = (tf)=>`<g transform="${tf}"><path d="${BAY_D}" ${TO}/><path d="M30 38L58 6" ${CAN}/></g>`;
const CD_HUY = {
  camon:    [0,1,2,3,4].map(k=>`<path d="M32 30C22 22 22 8 32 4C42 8 42 22 32 30Z" transform="rotate(${k*72} 32 32)" ${TO}/>`).join('')+`<circle cx="32" cy="32" r="4.5" fill="var(--cd)"/>`,   // hoa sứ
  xinloi:   `<path d="M8 54C24 48 42 36 56 10" ${CAN}/>`+[[18,45,-70],[22,52,10],[29,40,-72],[34,47,8],[41,31,-76],[46,37,2],[51,20,-82]].map(l=>`<ellipse cx="${l[0]}" cy="${l[1]}" rx="9" ry="3.8" transform="rotate(${l[2]} ${l[0]} ${l[1]})" ${TO.replace('2.6','1.8')}/>`).join(''),   // cành ô liu
  dongvien: `<circle cx="32" cy="34" r="11" ${TO}/><g ${CAN}>${tiaNang}<path d="M6 56h52"/></g>`,                // mặt trời
  banbe:    bay('translate(2 -2) scale(.72)')+bay('translate(26 26) scale(.58)'),                              // hai máy bay giấy
  yeuthuong:`<rect x="6" y="15" width="52" height="36" rx="5" ${TO}/><path d="M7 18L32 37 57 18" ${CAN}/><path d="${TIM_D}" transform="translate(22 29) scale(.3)" fill="var(--cd)"/>`,   // thư tình
  chuc:     `<polygon points="${sao(32,33,24,10)}" ${TO}/><g fill="var(--cd)"><circle cx="7" cy="12" r="2.6"/><circle cx="57" cy="9" r="2.6"/><circle cx="8" cy="56" r="2.6"/><circle cx="57" cy="54" r="2.6"/></g>`,   // ngôi sao
  chinhminh:`<path d="M42 6A26 26 0 1 0 58 44A21 21 0 0 1 42 6Z" ${TO}/><polygon points="${sao(50,22,6,2.6,4)}" fill="var(--cd)"/><polygon points="${sao(56,36,4,1.8,4)}" fill="var(--cd)" opacity=".7"/>`,   // trăng và sao
  macdinh:  `<path d="${BAY_D}" ${TO}/><path d="M30 38L58 6" ${CAN}/>`                                          // máy bay giấy
};
const kieuTrangTri = id => {
  const k = x => String(x||'').replace(/-/g,'');
  const loai = LOAI.find(l=>l.id===id) || {};
  for(const c of [k(loai.trangtri), k(id)]) if(CD_HUY[c] && c!=='macdinh') return c;
  return 'macdinh';
};
const bieuTuong = t => CD_HUY[kieuTrangTri(loaiCua(t))];
function trangTri(t,i){
  const loai = LOAI.find(l=>l.id===loaiCua(t)) || {};
  const box = document.createElement('div');
  box.className = 'cd'; box.setAttribute('aria-hidden','true');
  box.innerHTML = `<div class="cd-bar"></div><div class="cd-hang"><div class="cd-tem"><svg viewBox="0 0 64 64">${bieuTuong(t)}</svg></div>`+
    `<div class="cd-dau"><b>${tc(String(loai.ten||'Thư').toUpperCase())}</b>${t.ngay ? `<small>${tc(t.ngay)}</small>` : ''}</div></div>`+
    (t.chuthich ? `<div class="cd-ct">${tc(t.chuthich)}</div>` : '');
  return box;
}

/* Xem ảnh có tải được không (nhớ kết quả): ảnh sai tên / chưa có file thì dùng trang trí thay cho khung ảnh xanh trống */
const anhTinh = new Map();
function thuAnh(p, cb){
  p = duongAnh(p); if(!p){ cb(false); return; }
  if(anhTinh.has(p)){ cb(anhTinh.get(p)); return; }
  const im = new Image(); im.decoding = 'async';
  im.onload = ()=>{ anhTinh.set(p,true); cb(true); };
  im.onerror = ()=>{ anhTinh.set(p,false); cb(false); };
  im.src = p;
}

/* Hoa quanh bưu thiếp bìa: nụ khép, bấm vào thì nở */
const hoaBiaEl = document.getElementById('hoaBia');
const KIEU_BIA = danhSach(lay('hoa_bia','')).map(x=>LOAI_HOA[chuanHoa(x)]).filter(Boolean);
const coHoaBia = !KIEU_BIA.includes('khong');
if(hoaBiaEl && coHoaBia){
  const wv = n => `calc(var(--W)*${n})`;
  const O = [   // loại, bề rộng, vị trí (đơn vị: lần bề rộng bưu thiếp), góc nghiêng, độ trễ nở, kiểu màu
    ['hong', .31, `left:${wv(-.06)};bottom:${wv(-.08)}`,  -8, 0,   0, 2],
    ['tulip',.18, `left:${wv(.15)};bottom:${wv(-.13)}`,     5, .15, 0, 1],
    ['su',   .29, `right:${wv(-.06)};top:${wv(-.10)}`,     10, .05, 0, 2],
    ['su',   .15, `right:${wv(.17)};top:${wv(-.06)}`,     -12, .30, 1, 1],
    ['tulip',.18, `right:${wv(.0)};bottom:${wv(-.12)}`,   -5, .20, 2, 1],
    ['hong', .15, `left:${wv(-.03)};top:${wv(-.06)}`,     12, .35, 1, 2]
  ];
  hoaBiaEl.innerHTML = (nhe ? O.slice(0,4) : O).map((o,k)=>{
    const loai = KIEU_BIA.length ? KIEU_BIA[k%KIEU_BIA.length] : o[0];
    return `<span class="o" style="${o[2]};width:${wv(o[1]*(loai==='tulip'&&o[0]!=='tulip'?.7:1))};--r:${o[3]}deg;--dl:${(-k*.9).toFixed(1)}s;z-index:${o[6]}">${hoaSvg(loai,o[5],o[4])}</span>`;
  }).join('');
}

/* ---------- Các phần tử chính ---------- */
const san = document.getElementById('san'), the = document.getElementById('the'), nghieng = document.getElementById('nghieng');
const luoiTrong = document.getElementById('luoiTrong'), thap = document.getElementById('thap');
const theLoai = document.getElementById('theLoai');
let cacLa = [], loaiDangMo = null;

/* Thư nào ghi sai/không ghi chủ đề thì tự xếp vào chủ đề đầu tiên */
const loaiCua = t => LOAI.some(l=>l.id===t.loai) ? t.loai : LOAI[0].id;
const demThu = id => thu.filter(t=>loaiCua(t)===id).length;

/* ---------- Banner: mỗi chủ đề là một bưu thiếp ---------- */
LOAI.forEach((l,k)=>{
  const n = demThu(l.id);
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'the loai-the';
  b.style.setProperty('--ng', ((k%3)-1)*2.2+'deg');
  b.innerHTML = `<div class="anh" style="background:${anhThuCss({anh:l.anh},k)}">
      <div class="loi">${tc(l.ten)}<small><span class="mt">${tc(l.mota||'')} · </span>${tc(CHU.loai_dem.replace('{n}',n))}</small></div></div>
    <div class="tem"><span>${n}<br>THƯ</span></div>`;
  b.addEventListener('click', ()=>moThapLoai(l.id,b));
  luoiTrong.appendChild(b);
});
const cacTheLoai = [...luoiTrong.children];

/* Các thẻ bay ra từ một vị trí (bưu thiếp bìa hoặc bưu thiếp chủ đề) rồi vào chỗ của mình */
function bayRa(els, rect){
  const px = rect.left+rect.width/2, py = rect.top+rect.height/2;
  els.forEach((el,i)=>{
    const r = el.getBoundingClientRect();
    el.style.setProperty('--fx', Math.max(-700,Math.min(700, px-(r.left+r.width/2)))+'px');
    el.style.setProperty('--fy', Math.max(-700,Math.min(700, py-(r.top+r.height/2)))+'px');
    el.style.setProperty('--fr', ((i%2?1:-1)*(20+(i*13)%40))+'deg');
    el.style.animation = 'none'; void el.offsetWidth;
    el.style.animation = `no .8s cubic-bezier(.2,1.15,.3,1) ${Math.min(i*70,1300)}ms backwards`;
  });
}

/* ---------- Tháp thư của một chủ đề ---------- */
let laIO = null;
function dungThap(id){
  thap.innerHTML = ''; cacLa = [];
  if(laIO) laIO.disconnect();
  laIO = 'IntersectionObserver' in window ? new IntersectionObserver(es=>es.forEach(en=>{
    if(!en.isIntersecting) return;
    const la = en.target; laIO.unobserve(la);
    thuAnh(la._p, ok=>{ if(ok) la.style.setProperty('--tm', la._anh); else la.classList.add('khong-anh'); });   // ảnh hỏng/thiếu file: bỏ ô ảnh
  }),{rootMargin:'250px'}) : null;
  const ds = thu.map((t,i)=>({t,i})).filter(x=>loaiCua(x.t)===id);
  ds.forEach(({t,i},k)=>{
    const la = document.createElement('button');
    la.type = 'button'; la.className = 'la';
    la.style.setProperty('--p', giay[k%giay.length]);
    la.style.setProperty('--c', tem[k%tem.length]);
    la.style.setProperty('--tm', nenThu(t,i));          // lúc đầu chỉ là nền màu; ảnh thật chỉ tải khi lá thư cuộn vào màn hình
    if(!t.anh || anhTinh.get(duongAnh(t.anh))===false) la.classList.add('khong-anh');       // thư không ảnh: không có ô ảnh nhỏ
    else { la._anh = anhThuCss(t,i); la._p = t.anh; if(laIO) laIO.observe(la); else la.style.setProperty('--tm', la._anh); }
    la.style.setProperty('--r', (((k*7)%5)-2)*1.1+'deg');
    la.style.setProperty('--x', (((k*5)%7)-3)*3+'px');
    la.style.zIndex = k+1;
    la.innerHTML = `<b>${tc(t.tieude)}</b><small>${tc(t.ngay)}</small>`;
    la.addEventListener('click', e=>docThu(i,e));
    thap.appendChild(la); cacLa.push(la);
  });
  const idx = Math.max(0, LOAI.findIndex(x=>x.id===id)), l = LOAI[idx];
  document.getElementById('tdThap').textContent = l.ten;
  document.getElementById('soThu').textContent = CHU.thap_tde+' · '+CHU.thap_dem.replace('{n}', ds.length);
  // bưu thiếp chủ đề nằm bên trái
  document.getElementById('anhLoai').style.background = anhThuCss({anh:l.anh}, idx);
  document.getElementById('loaiTen').textContent = l.ten;
  document.getElementById('loaiPhu').textContent = (l.mota||'')+' · '+CHU.loai_dem.replace('{n}', ds.length);
  document.getElementById('loaiTem').innerHTML = `${ds.length}<br>THƯ`;
}

/* ---------- Chuyển cảnh: bìa -> banner -> tháp thư ---------- */
function moBanner(){
  const pc = the.getBoundingClientRect();
  nghieng.style.transform = '';
  san.classList.remove('o-thap'); san.classList.add('o-banner');
  bayRa(cacTheLoai, pc);
}
function moThapLoai(id, nguon){
  const rect = nguon.getBoundingClientRect();
  bungHoaTim(rect.left+rect.width/2, rect.top+rect.height/2);
  loaiDangMo = id; dungThap(id);
  san.classList.remove('o-banner'); san.classList.add('o-thap');
  thap.scrollTop = 0;
  bayRa(cacLa, rect);
}
function veBanner(){
  if(!san.classList.contains('o-thap')) return;
  san.classList.remove('o-thap'); san.classList.add('o-banner');
  bayRa(cacTheLoai, theLoai.getBoundingClientRect());
}
function veBia(){ san.classList.remove('o-banner','o-thap'); }

const batPhim = (el,fn)=> el.addEventListener('keydown', e=>{
  if(e.target===el && (e.key==='Enter'||e.key===' ')){ e.preventDefault(); fn(); } });
/* Bấm bưu thiếp bìa: hoa nở ra (khoảng 1,2 giây) rồi mới chuyển sang banner chủ đề */
let dangNo = false;
function moBia(){
  if(dangNo) return;
  const pc = the.getBoundingClientRect();
  bungHoaTim(pc.left+pc.width/2, pc.top+pc.height/2);
  if(giamChuyenDong || !hoaBiaEl || !coHoaBia){ moBanner(); return; }
  dangNo = true;
  hoaBiaEl.classList.add('nohoa');
  setTimeout(()=>{
    moBanner();
    setTimeout(()=>{ hoaBiaEl.classList.remove('nohoa'); dangNo = false; }, 1400);   // quay về bìa thì hoa khép lại thành nụ
  }, 1250);
}
the.addEventListener('click', moBia);           batPhim(the, moBia);
theLoai.addEventListener('click', veBanner);    batPhim(theLoai, veBanner);
document.getElementById('veBia').addEventListener('click', veBia);
document.getElementById('veBanner').addEventListener('click', veBanner);

/* ---------- Bưu thiếp nghiêng 3D theo con trỏ (chỉ trên laptop có chuột) ---------- */
if(!giamChuyenDong && !nheMay && matchMedia('(hover:hover) and (pointer:fine)').matches){
  let cho = false, lx = 0, ly = 0;
  san.addEventListener('pointermove', e=>{
    if(san.classList.contains('o-banner') || san.classList.contains('o-thap')) return;
    lx = e.clientX/innerWidth-.5; ly = e.clientY/innerHeight-.5;
    if(cho) return; cho = true;
    requestAnimationFrame(()=>{
      nghieng.style.transform = `perspective(1000px) rotateY(${lx*12}deg) rotateX(${-ly*10}deg)`;
      cho = false;
    });
  });
  san.addEventListener('pointerleave', ()=>{ nghieng.style.transform=''; });
}

/* ---------- Hiệu ứng bất ngờ (ngẫu nhiên) ---------- */
let hieuHen = [], hieuLop = null;
const hen = (fn,ms)=>{ hieuHen.push(setTimeout(fn,ms)); };
function huyHieuUng(){
  hieuHen.forEach(clearTimeout); hieuHen = [];
  if(hieuLop){ hieuLop.remove(); hieuLop = null; }
}
const bongSvg = c => svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 70"><ellipse cx="20" cy="22" rx="16" ry="20" fill="${c}"/><path d="M20 42 16 49h8z" fill="${c}"/><path d="M20 49C14 56 26 60 20 68" stroke="#6b8bb0" fill="none" stroke-width="1.2"/><ellipse cx="13" cy="14" rx="4" ry="7" fill="#fff" opacity=".4" transform="rotate(20 13 14)"/></svg>`);
const timHongSvg = c => svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 30"><path d="M16 29C-6 14 5-3 16 8 27-3 38 14 16 29Z" fill="${c}"/><ellipse cx="9.5" cy="9" rx="3" ry="2" fill="#fff" opacity=".5" transform="rotate(-35 9.5 9)"/></svg>`);
const HU = {
  'phao-hoa'(){
    for(let k=0;k<5;k++)
      hen(()=>bungHoaTim(ngauNhien(innerWidth*.15,innerWidth*.85), ngauNhien(innerHeight*.15,innerHeight*.55)), k*420);
  },
  'lap-lanh'(l){
    const n = nhe ? 14 : 24;
    for(let i=0;i<n;i++){
      const e = document.createElement('span'); e.className = 'lap';
      e.textContent = i%3 ? '✦' : '✧';
      e.style.cssText = `left:${ngauNhien(3,95)}%;top:${ngauNhien(5,92)}%;font-size:${ngauNhien(14,34)}px;--d:${ngauNhien(1.2,2.4)}s;--dl:${ngauNhien(0,2)}s`;
      l.appendChild(e);
    }
  },
  'bong-bay'(l){
    const mau = ['#2a78d4','#5aa9ee','#1b5fb0','#a6d8ff','#ffffff','#7cc0f5'];
    const n = nhe ? 6 : 9;
    for(let i=0;i<n;i++){
      const e = document.createElement('i'), w = ngauNhien(38,64), sway = ngauNhien(20,60)*(i%2?1:-1);
      e.style.cssText = `position:absolute;bottom:0;left:${ngauNhien(2,92)}%;width:${w}px;height:${w*1.75}px;background:${bongSvg(mau[i%mau.length])} center/contain no-repeat`;
      l.appendChild(e);
      e.animate([
        {transform:'translate(0,100%)'},
        {transform:`translate(${sway}px,-45vh)`},
        {transform:`translate(${-sway}px,-85vh)`},
        {transform:`translate(0,-${innerHeight*1.05+w*1.75}px)`}
      ],{duration:ngauNhien(5200,8200),delay:ngauNhien(0,1800),easing:'ease-in-out',fill:'both'});
    }
  },
  'tim-hong'(l){
    const hong = ['#ff6fa5','#ff8fb8','#ff4f8b','#ffb3d1','#f94d94','#ff9ec4'];
    const n = nhe ? 12 : 22;
    for(let i=0;i<n;i++){
      const e = document.createElement('i');
      const to = i%6===0 ? ngauNhien(70,110) : ngauNhien(24,60);      // thỉnh thoảng có một trái tim thật to
      const lech = ngauNhien(30,90)*(i%2?1:-1);
      e.style.cssText = `position:absolute;bottom:-${to+20}px;left:${ngauNhien(2,94)}%;width:${to}px;height:${to}px;`+
        `background:${timHongSvg(hong[i%hong.length])} center/contain no-repeat`;
      l.appendChild(e);
      e.animate([
        {transform:'translate(0,0) scale(.3) rotate(-8deg)',opacity:0},
        {transform:`translate(${lech*.3}px,-18vh) scale(1) rotate(8deg)`,opacity:1,offset:.15},
        {transform:`translate(${-lech}px,-55vh) scale(1.08) rotate(-10deg)`,opacity:1,offset:.55},
        {transform:`translate(${lech*.6}px,-${innerHeight+to+40}px) scale(.9) rotate(10deg)`,opacity:.85}
      ],{duration:ngauNhien(4200,8000),delay:ngauNhien(0,2600),easing:'ease-in-out',fill:'both'});
    }
  },
  /* Pháo hoa thật vẽ bằng canvas: pháo bay lên, nổ thành chùm tia, cứ ba quả có một quả hình trái tim */
  'phao-hoa-dem'(l){
    const cv = document.createElement('canvas');
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
    l.appendChild(cv);
    const dpr = nhe ? 1 : Math.min((typeof devicePixelRatio!=='undefined' ? devicePixelRatio : 1) || 1, 1.5), W = innerWidth, H = innerHeight;
    cv.width = W*dpr; cv.height = H*dpr;
    const g = cv.getContext('2d'); if(!g) return;
    g.scale(dpr,dpr);
    const mau = [[255,214,102],[255,255,255],[124,192,245],[90,169,238],[255,111,165],[190,220,255]];
    const pao = [], hat = [];
    const soQua = nhe ? 4 : 6, ti = Math.max(.7,Math.min(1.3,Math.min(W,H)/700));
    let daBan = 0, banTiep = 0.15;
    const t0 = performance.now(); let truoc = t0;

    function ban(){
      pao.push({x:ngauNhien(W*.15,W*.85), y:H+10, vx:ngauNhien(-25,25), v:ngauNhien(.78,1)*H*.95,
        ty:ngauNhien(H*.14,H*.45), c:mau[Math.floor(Math.random()*mau.length)], tim:daBan%3===2, vet:[]});
      daBan++;
    }
    function no(r){
      const n = nhe ? 36 : 56;
      for(let i=0;i<n;i++){
        let vx, vy, c = r.c, gr = 130;
        if(r.tim){                                           // chùm tia xếp thành hình trái tim
          const a = i/n*Math.PI*2;
          vx = 16*Math.pow(Math.sin(a),3)*11*ti;
          vy = -(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))*11*ti;
          c = [255,111,165]; gr = 35;
        } else {
          const a = Math.random()*Math.PI*2, sp = Math.sqrt(Math.random())*ngauNhien(120,280)*ti;
          vx = Math.cos(a)*sp; vy = Math.sin(a)*sp;
          if(Math.random()<.35) c = mau[Math.floor(Math.random()*mau.length)];
        }
        hat.push({x:r.x,y:r.y,vx,vy,gr,c,s:ngauNhien(1.6,3.2),song:1,tan:ngauNhien(.5,.85)});
      }
    }
    function khung(now){
      if(!l.isConnected) return;                              // thư đã đóng thì dừng
      const dt = Math.max(0,Math.min(.05,(now-truoc)/1000)); truoc = now;
      const t = (now-t0)/1000;
      if(daBan<soQua && t>=banTiep){ ban(); banTiep = t+ngauNhien(.55,1.05); }

      g.globalCompositeOperation = 'destination-out';         // làm mờ dần để tạo vệt sáng đuôi
      g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(0,0,W,H);
      g.globalCompositeOperation = 'lighter';

      for(let i=pao.length-1;i>=0;i--){
        const r = pao[i];
        r.y -= r.v*dt; r.x += r.vx*dt; r.vet.push([r.x,r.y]); if(r.vet.length>7) r.vet.shift();
        r.vet.forEach((p,j)=>{ g.fillStyle = `rgba(255,235,190,${(j+1)/r.vet.length*.8})`;
          g.beginPath(); g.arc(p[0],p[1],1.7,0,6.283); g.fill(); });
        if(r.y<=r.ty){ no(r); pao.splice(i,1); }
      }
      const can = Math.pow(.3,dt);
      for(let i=hat.length-1;i>=0;i--){
        const p = hat[i]; p.song -= p.tan*dt;
        if(p.song<=0){ hat.splice(i,1); continue; }
        p.vx *= can; p.vy = p.vy*can + p.gr*dt;
        p.x += p.vx*dt; p.y += p.vy*dt;
        const a = p.song*(.65+.35*Math.sin(t*30+i));          // nhấp nháy
        g.fillStyle = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},${a})`;
        g.beginPath(); g.arc(p.x,p.y,p.s*(.6+.4*p.song),0,6.283); g.fill();
      }
      if(daBan<soQua || pao.length || hat.length) requestAnimationFrame(khung);
    }
    requestAnimationFrame(khung);
  }
};
function chonHieuUng(t){
  if(giamChuyenDong) return;
  let ten = t.hieuung;
  if(ten==='khong') return;
  if(!HU[ten]){                                          // không ép: bốc thăm ngẫu nhiên
    if(Math.random() >= HIEU_UNG.tiLe) return;
    const ds = HIEU_UNG.loai.filter(x=>HU[x]);
    if(!ds.length) return;
    ten = ds[Math.floor(Math.random()*ds.length)];
  }
  hen(()=>{
    const l = document.createElement('div'); l.className = 'hu-lop';
    document.body.appendChild(l); hieuLop = l;
    HU[ten](l);
    hen(()=>{ l.remove(); if(hieuLop===l) hieuLop=null; }, 10000);
  }, 450);                                               // đợi tờ thư mở ra rồi mới có bất ngờ
}

/* ---------- Chọn một lá thư để đọc ---------- */
const docHop = document.getElementById('docHop'), docGiay = document.getElementById('docGiay');
const docNd = document.getElementById('docNoidung');
let dangDoc = -1, tokenGo = 0, io = null, hienHetFn = null;

const boChu = p => p.split(/(\s+)/).map(w => (w==='' || /^\s+$/.test(w)) ? w : `<span class="tu">${tc(w)}</span>`).join('');

function huyGoChu(){ tokenGo++; if(io){ io.disconnect(); io=null; } hienHetFn = null; }

/* Mỗi đoạn tự "gõ" từng chữ khi cuộn tới. Để thư dài mấy nghìn chữ vẫn mượt:
   - đoạn chỉ được tách thành từng chữ ở đúng lúc nó sắp gõ, không tách trước cả bức thư
   - đoạn quá dài (trên 350 chữ) thì hiện dần cả đoạn thay vì gõ từng chữ */
function khoiDongGoChu(){
  huyGoChu();
  const my = tokenGo;
  const ps = [...docNd.querySelectorAll('p')], ky = docNd.querySelector('.ky'), cuoi = docNd.querySelector('.hoa-cuoi');
  const hienKy = ()=>{ ky.classList.add('hien'); if(cuoi) cuoi.classList.add('nohoa'); };
  const xong = new Set(), thay = new Set();
  const hienPara = p => {
    if(p.classList.contains('cho')) p.classList.remove('cho');
    else p.querySelectorAll('.tu').forEach(x=>x.classList.add('hien'));
    p.classList.remove('dang-go'); xong.add(p);
  };
  hienHetFn = ()=>{ tokenGo++; if(io){ io.disconnect(); io=null; } ps.forEach(hienPara); hienKy(); };
  if(giamChuyenDong){ hienHetFn(); return; }
  let dang = false;
  function chay(){
    if(dang || my!==tokenGo) return;
    const k = ps.findIndex(p=>!xong.has(p) && thay.has(p));
    if(k<0){ if(xong.size===ps.length) hienKy(); return; }
    for(let j=0;j<k;j++) if(!xong.has(ps[j])) hienPara(ps[j]);          // đoạn đã cuộn qua: hiện luôn
    const p = ps[k];
    const soChu = (p.textContent.match(/\S+/g)||[]).length;
    dang = true;
    if(soChu>(nheMay?200:350)){                                          // đoạn rất dài: hiện dần cả đoạn
      p.classList.remove('cho');
      setTimeout(()=>{ if(my!==tokenGo) return; xong.add(p); dang=false; chay(); }, 450);
      return;
    }
    p.innerHTML = boChu(p.textContent); p.classList.remove('cho');
    const w = [...p.querySelectorAll('.tu')];
    const moiChu = Math.min(34, 2600/Math.max(1,w.length));            // mỗi đoạn tối đa khoảng 2,6 giây
    p.classList.add('dang-go');
    const t0 = performance.now(); let n = 0;
    (function buoc(now){
      if(my!==tokenGo) return;
      const den = Math.min(w.length, Math.floor((now-t0)/moiChu)+1);
      while(n<den) w[n++].classList.add('hien');
      if(n<w.length) requestAnimationFrame(buoc);
      else { p.classList.remove('dang-go'); xong.add(p); dang=false; chay(); }
    })(t0);
  }
  // chờ ảnh rơi xuống và tờ thư mở xong rồi mới bắt đầu gõ
  setTimeout(()=>{
    if(my!==tokenGo) return;
    io = new IntersectionObserver(es=>{
      es.forEach(en=>{ if(en.isIntersecting) thay.add(en.target); });
      chay();
    },{root:docGiay, rootMargin:'0px 0px -8% 0px'});
    ps.forEach(p=>io.observe(p));
  }, 900);
}

function docThu(i,e){
  const t = thu[i]; dangDoc = i;
  huyHieuUng();
  document.getElementById('docTieude').textContent = t.tieude;
  document.getElementById('docSub').textContent = t.ngay;

  // Ảnh kèm thư (có ảnh) hoặc khối trang trí theo chủ đề (không ảnh)
  const kHoa = kieuHoaThu(t,i);
  const docAnh = document.getElementById('docAnh');
  const duongT = t.anh ? duongAnh(t.anh) : '';
  const coAnh = !!t.anh && anhTinh.get(duongT)!==false;
  const dungTrangTri = ()=>{ docAnh.innerHTML = ''; if(TRANG_TRI_KHONG_ANH) docAnh.appendChild(trangTri(t,i)); };
  docAnh.innerHTML = '';
  if(coAnh){
    docAnh.innerHTML = `<figure class="anh-thu" style="--g:${i%2?1.6:-1.6}deg">
      <div class="khung-anh"><div class="zoom" style="background:${anhThuCss(t,i)}"></div></div>
      <figcaption>${tc(t.chuthich||t.tieude)}</figcaption>${kHoa==='khong' ? '' : `<span class="hoa-goc">${hoaSvg(kHoa,i,0)}</span>`}</figure>`;
    thuAnh(t.anh, ok=>{ if(!ok && dangDoc===i && docHop.classList.contains('mo')) dungTrangTri(); });
  } else dungTrangTri();
  // Chữ trong thư: tách từng chữ để gõ dần
  docNd.innerHTML = t.noidung.split('\n\n').map(p=>`<p class="cho">${tc(p)}</p>`).join('') +
                    `<div class="ky" style="--font-ky:'${CHU_KY.kieuChu}';--co-ky:${CHU_KY.coChu}rem"><span class="ky-bang"><svg class="ky-ic" viewBox="0 0 64 64">${bieuTuong(t)}</svg><span>${tc(t.ky||CHU_KY.macDinh)}</span></span></div>`+
                    (kHoa==='khong' ? '' : `<div class="hoa-cuoi">${[kHoa,...['hong','su','tulip'].filter(x=>x!==kHoa)].slice(0,nhe?2:3).map((x,n)=>`<span class="o ${x==='tulip'?'t':''}">${hoaSvg(x,i+n,n*.12)}</span>`).join('')}</div>`);
  hen(()=>{ const f = docAnh.querySelector('.anh-thu'); if(f) f.classList.add('nohoa'); }, 1100);   // hoa cạnh ảnh nở sau khi ảnh rơi xuống

  const cx = e && e.clientX ? e.clientX : innerWidth/2, cy = e && e.clientY ? e.clientY : innerHeight/2;
  docGiay.style.setProperty('--dx', (cx-innerWidth/2)+'px');
  docGiay.style.setProperty('--dy', (cy-innerHeight/2)+'px');
  docGiay.style.animation='none'; void docGiay.offsetWidth; docGiay.style.animation='';
  docHop.classList.add('mo'); docHop.setAttribute('aria-hidden','false');
  docGiay.scrollTop = 0;
  san.classList.add('dang-doc');
  bungHoaTim(cx,cy);
  khoiDongGoChu();
  chonHieuUng(t);
}
function dongDoc(){ huyGoChu(); huyHieuUng(); san.classList.remove('dang-doc'); docHop.classList.remove('mo'); docHop.setAttribute('aria-hidden','true'); }
document.getElementById('docDong').onclick = dongDoc;
docHop.addEventListener('click', e=>{ if(e.target===docHop) dongDoc(); });
addEventListener('keydown', e=>{
  if(e.key!=='Escape') return;
  if(docHop.classList.contains('mo')) dongDoc();
  else if(san.classList.contains('o-thap')) veBanner();
  else veBia();
});

/* ---------- Kiểm tra ảnh (báo trong Console, bấm F12 để xem) ----------
   Báo nếu thiếu file ảnh hoặc ảnh quá lớn làm nặng máy. Trang vẫn chạy bình thường. */
setTimeout(()=>{
  const ds = new Set(LOAI.map(l=>l.anh));            // chỉ kiểm tra ảnh bìa + ảnh chủ đề (ảnh thư kiểm tra khi mở thư, không tải cả kho lúc khởi động)
  const bia = (document.getElementById('anhBia').style.backgroundImage.match(/url\(["']?([^"')]+)/)||[])[1];
  if(bia) ds.add(bia);
  ds.forEach(p=>{
    p = duongAnh(p); if(!p || /^(data:|blob:)/.test(p)) return;
    const im = new Image(); im.decoding = 'async';
    im.onerror = ()=>console.warn('[Bưu thiếp] Không tìm thấy ảnh: '+p+' (trang dùng nền xanh thay thế)');
    im.onload = ()=>{ if(im.naturalWidth>2600) console.warn('[Bưu thiếp] Ảnh quá lớn ('+im.naturalWidth+'px), nên nén còn khoảng 1800px cho nhẹ máy: '+p); };
    im.src = p;
  });
}, 2000);

/* ---------- Chữ ký trên bưu thiếp bìa: tự ký lại sau mỗi 12 giây khi đang ở trang bìa ---------- */
(function(){
  const ky = document.getElementById('bcKy');
  if(!ky) return;
  /* Tự co cỡ chữ ký cho vừa bề ngang ảnh, dù chữ dài hay phông chữ nào (kể cả khi phông chưa tải xong) */
  const vua = ()=>{
    ky.style.fontSize = '';
    const cha = document.getElementById('the'), toiDa = Math.min(innerWidth*0.9, cha.clientWidth*1.05), w = ky.offsetWidth;
    if(w > toiDa && w > 0) ky.style.fontSize = (parseFloat(getComputedStyle(ky).fontSize)*toiDa/w)+'px';
  };
  let rz = 0; vua(); addEventListener('resize', ()=>{ cancelAnimationFrame(rz); rz = requestAnimationFrame(vua); });
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(vua);
  if(giamChuyenDong) return;
  setInterval(()=>{
    if(document.hidden || san.classList.contains('o-banner') || san.classList.contains('o-thap')) return;
    ky.style.animation = 'none'; void ky.offsetWidth; ky.style.animation = '';
  }, 12000);
})();