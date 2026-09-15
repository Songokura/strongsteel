/* ============================================================
   Strong Steel KZ - скрипт страницы.
   Плиты и вытяжка кадра с горячей кромкой · интро героя (прокат) ·
   видео по видимости · калькулятор метры/тонны/штуки по прайсу ·
   перевод RU/KZ · меню · бегущая лента · лента с кнопками ·
   WhatsApp с названием категории · форма в WhatsApp. Библиотек нет.
   ============================================================ */
(function(){
"use strict";
var WA = "77770847720";                  /* телефон и WhatsApp Strong Steel - один номер */
var RED = matchMedia("(prefers-reduced-motion: reduce)").matches;
var HAS_IO = typeof IntersectionObserver === "function";
var root = document.documentElement;

/* ---------------- КОНВЕРСИИ GOOGLE ADS ----------------
   Ярлыки задаёт index.html (window.SS_CONV). Клики по телефону и WhatsApp
   ловим делегированием, переход не блокируем. Пустой ярлык - событие не шлём. */
function conv(key){
  var id = (window.SS_CONV || {})[key];
  if (!id || typeof window.gtag !== "function") return;
  window.gtag("event", "conversion", {send_to: id, value: 1.0, currency: "USD"});
}
document.addEventListener("click", function(e){
  var a = e.target.closest ? e.target.closest("a[href]") : null;
  if (!a) return;
  var h = a.getAttribute("href") || "";
  if (h.indexOf("tel:") === 0) conv("phone");
  else if (h.indexOf("wa.me") > -1) conv("contact");
}, true);

/* ---------------- КАЗАХСКИЙ СЛОВАРЬ ----------------
   Лежит отдельным файлом assets/lang/kk.js и грузится только когда человек сам выбрал KZ
   (кнопка, ?lang=kk или сохранённый выбор). В разметке и в этом файле казахского текста нет:
   проверка Google Ads («Неподдерживаемый язык») видит только русский сайт.
   Версия файла - из ?v= этого скрипта, бампается вместе с остальными ассетами. */
var KK = null, KZ = {};
var ASSET_V = ((document.currentScript && document.currentScript.src.match(/[?&]v=([^&]+)/)) || [])[1] || "";
function loadKK(done){
  if (KK) return done();
  var sc = document.createElement("script");
  sc.src = "assets/lang/kk.js" + (ASSET_V ? "?v=" + ASSET_V : "");
  sc.onload = function(){ if (window.SITE_KK) { KK = window.SITE_KK; KZ = KK.dict; } done(); };
  sc.onerror = function(){ done(); };
  document.head.appendChild(sc);
}

/* готовые тексты WhatsApp: название категории - отдельной строкой */
var WA_TXT = {
ru:{
  hero:"Здравствуйте! Пишу с сайта Strong Steel. Нужен расчёт металлопроката:\n",
  cat:"Здравствуйте! Интересует цена:\n{t}\nРазмеры и объём: ",
  otgruzka:"Здравствуйте! Нужна отгрузка металлопроката.\nЧто и куда: ",
  dostavka:"Здравствуйте! Уточните, пожалуйста, доставку металлопроката.\nГород и объём: ",
  kontakty:"Здравствуйте! Пишу с сайта Strong Steel. Вопрос: "
},
};

var TICK = ["Арматура","Труба профильная","Труба ВГП и э/с","Уголок","Швеллер","Балка","Лист","Полоса","Катанка","Проволока"];

/* ---------------- ДАННЫЕ КАЛЬКУЛЯТОРА ----------------
   Из прайса апреля 2026. Строка: s - размер, w - вес 1 шт (кг), l - длина (м, 0 = штучный
   товар: лист или бухта), p - цена ₸/тонна, u - единица (шт / бухта / лист).
   Сумма считается от тонн, штуки и метры - через вес и длину. */
var CALC = [
{id:"armatura", n:"Арматура", d:5, rows:[
  {s:"Ø6 А240 (АI), 6 м", w:1.4, l:6, p:330000},
  {s:"Ø8 А240 (АI), 6 м", w:2.5, l:6, p:325000},
  {s:"Ø10 А240 (АI), 6 м", w:4, l:6, p:315000},
  {s:"Ø8 А500, 6 м", w:2.6, l:6, p:335000},
  {s:"Ø10 А500, 12 м", w:8.4, l:12, p:305000},
  {s:"Ø12 А500, 12 м", w:11.55, l:12, p:300000},
  {s:"Ø12 А500 Шымкент, 12 м", w:11.6, l:12, p:280000},
  {s:"Ø14 А500, 12 м", w:15.75, l:12, p:295000},
  {s:"Ø16 А500, 12 м", w:20.6, l:12, p:295000},
  {s:"Ø18 А500, 12 м", w:26.3, l:12, p:295000},
  {s:"Ø20 А500, 12 м", w:31.5, l:12, p:295000},
  {s:"Ø22 А500, 12 м", w:38.9, l:12, p:295000},
  {s:"Ø25 А500, 12 м", w:49.4, l:12, p:295000},
  {s:"Ø28 А500, 12 м", w:64.1, l:12, p:295000},
  {s:"Ø32 А500, 12 м", w:82, l:12, p:295000},
  {s:"Ø6 А500, бухта ~0,85 т", w:850, l:0, p:300000, u:"coil"},
  {s:"Ø8 А500, бухта ~2 т", w:2000, l:0, p:300000, u:"coil"}
]},
{id:"truba-profilnaya", n:"Труба профильная", rows:[
  {s:"20х20х1,5, 6 м", w:5.6, l:6, p:500000},
  {s:"25х25х1,5, 6 м", w:6.94, l:6, p:480000},
  {s:"40х20х1,5, 6 м", w:8.6, l:6, p:480000},
  {s:"40х40х1,5, 6 м", w:11.5, l:6, p:480000},
  {s:"40х20х2, 6 м", w:10.5, l:6, p:435000},
  {s:"40х40х2, 6 м", w:14, l:6, p:435000},
  {s:"50х50х2, 6 м", w:17.8, l:6, p:435000},
  {s:"60х40х2, 6 м", w:17.8, l:6, p:435000},
  {s:"60х60х2, 6 м", w:21.55, l:6, p:435000},
  {s:"80х40х2, 6 м", w:21.55, l:6, p:435000},
  {s:"40х40х3, 6 м", w:20.3, l:6, p:455000},
  {s:"50х50х3, 6 м", w:25.9, l:6, p:455000},
  {s:"60х60х3, 6 м", w:31.5, l:6, p:455000},
  {s:"80х80х3, 12 м", w:86, l:12, p:425000},
  {s:"100х100х4, 12 м", w:142.5, l:12, p:425000},
  {s:"120х120х4, 12 м", w:171, l:12, p:430000},
  {s:"160х160х5, 12 м", w:286, l:12, p:430000},
  {s:"200х200х6, 12 м", w:430, l:12, p:460000}
]},
{id:"truba-kruglaya", n:"Труба круглая", rows:[
  {s:"ВГП 15х2,5, 5,8 м", w:7, l:5.8, p:395000},
  {s:"ВГП 20х2,5, 6 м", w:9.73, l:6, p:395000},
  {s:"ВГП 25х2,8, 5,8 м", w:12.9, l:5.8, p:387000},
  {s:"ВГП 32х2,8, 6 м", w:17.2, l:6, p:387000},
  {s:"ВГП 40х3,0, 10 м", w:37, l:10, p:387000},
  {s:"ВГП 50х3,0, 10 м", w:48, l:10, p:387000},
  {s:"ВГП 65х3,2, 10 м", w:71.4, l:10, p:387000},
  {s:"ВГП 80х3,5, 10 м", w:80, l:10, p:387000},
  {s:"Э/с 108х3,5, 11,75 м", w:106.5, l:11.75, p:405000},
  {s:"Э/с 108х4, 11,75 м", w:120.7, l:11.75, p:405000},
  {s:"Э/с 133х4, 11,75 м", w:149.6, l:11.75, p:405000},
  {s:"Э/с 159х4, 11,75 м", w:180, l:11.75, p:405000},
  {s:"Э/с 159х5, 11,75 м", w:223.5, l:11.75, p:405000},
  {s:"Э/с 219х5, 11,75 м", w:311, l:11.75, p:420000},
  {s:"Э/с 219х6, 11,75 м", w:370.5, l:11.75, p:420000}
]},
{id:"ugolok", n:"Уголок", rows:[
  {s:"25х3, 6 м", w:7.77, l:6, p:380000},
  {s:"32х3, 6 м", w:9.6, l:6, p:380000},
  {s:"40х3, 6 м", w:11.1, l:6, p:355000},
  {s:"40х4, 6 м", w:15, l:6, p:406000},
  {s:"50х3, 6 м", w:14.5, l:6, p:355000},
  {s:"63х4, 6 м", w:24, l:6, p:355000},
  {s:"50х4, 12 м", w:37.5, l:12, p:364000},
  {s:"50х5, 12 м", w:47, l:12, p:364000},
  {s:"63х5, 12 м", w:59, l:12, p:364000},
  {s:"63х6, 12 м", w:69, l:12, p:364000},
  {s:"75х5, 12 м", w:71.5, l:12, p:364000},
  {s:"75х6, 12 м", w:83, l:12, p:364000},
  {s:"80х6, 12 м", w:89, l:12, p:383000},
  {s:"100х7, 12 м", w:147, l:12, p:364000},
  {s:"100х8, 12 м", w:182, l:12, p:364000},
  {s:"125х8, 12 м", w:209, l:12, p:383000}
]},
{id:"shveller", n:"Швеллер", rows:[
  {s:"№8, 12 м", w:88, l:12, p:397000},
  {s:"№10, 12 м", w:110, l:12, p:397000},
  {s:"№12, 12 м", w:130, l:12, p:428000},
  {s:"№14, 12 м", w:153, l:12, p:428000},
  {s:"№16, 12 м", w:175, l:12, p:428000},
  {s:"№18, 12 м", w:205, l:12, p:428000},
  {s:"№20, 12 м", w:240, l:12, p:656000},
  {s:"№22, 12 м", w:264, l:12, p:656000},
  {s:"№24, 12 м", w:308, l:12, p:656000},
  {s:"№27, 12 м", w:347, l:12, p:726000},
  {s:"№30, 12 м", w:392, l:12, p:726000},
  {s:"№40, 12 м", w:590, l:12, p:1260000}
]},
{id:"balka", n:"Балка двутавровая", rows:[
  {s:"12Б1, 12 м", w:113, l:12, p:689000},
  {s:"16Б1, 12 м", w:160, l:12, p:689000},
  {s:"20Б1, 12 м", w:263, l:12, p:555000},
  {s:"25Б1, 12 м", w:309, l:12, p:528000},
  {s:"30Б1, 12 м", w:405, l:12, p:500000},
  {s:"35Б1, 12 м", w:499, l:12, p:520000},
  {s:"40Б1, 12 м", w:686, l:12, p:505000},
  {s:"50Б1, 12 м", w:892, l:12, p:514000},
  {s:"20К1, 12 м", w:499, l:12, p:528000},
  {s:"30К1, 12 м", w:1050, l:12, p:517000},
  {s:"20Ш1, 12 м", w:369, l:12, p:528000},
  {s:"30Ш1, 12 м", w:682, l:12, p:526000},
  {s:"40Ш1, 12 м", w:1080, l:12, p:516000}
]},
{id:"list", n:"Лист стальной", rows:[
  {s:"Г/к 2 мм, 1х2 м", w:33, l:0, p:355000, u:"sheet"},
  {s:"Г/к 2 мм, 1,25х2,5 м", w:54.2, l:0, p:355000, u:"sheet"},
  {s:"Г/к 3 мм, 1,25х2,5 м", w:82, l:0, p:348000, u:"sheet"},
  {s:"Г/к 4 мм, 1,5х6 м", w:300, l:0, p:345000, u:"sheet"},
  {s:"Г/к 5 мм, 1,5х6 м", w:365, l:0, p:345000, u:"sheet"},
  {s:"Г/к 6 мм, 1,5х6 м", w:438, l:0, p:345000, u:"sheet"},
  {s:"Г/к 8 мм, 1,5х6 м", w:590, l:0, p:345000, u:"sheet"},
  {s:"Г/к 10 мм, 1,5х6 м", w:753, l:0, p:345000, u:"sheet"},
  {s:"Г/к 12 мм, 1,5х6 м", w:865, l:0, p:345000, u:"sheet"},
  {s:"Г/к 14 мм, 1,5х6 м", w:1015, l:0, p:355000, u:"sheet"},
  {s:"Г/к 16 мм, 1,5х6 м", w:1144, l:0, p:355000, u:"sheet"},
  {s:"Г/к 20 мм, 1,5х6 м", w:1437, l:0, p:365000, u:"sheet"},
  {s:"Рифлёный 4 мм, 1,5х6 м", w:305, l:0, p:370000, u:"sheet"},
  {s:"Х/к 1,0 мм, 1,25х2,5 м", w:25.5, l:0, p:425000, u:"sheet"},
  {s:"Х/к 2,0 мм, 1,25х2,5 м", w:52, l:0, p:425000, u:"sheet"}
]},
{id:"polosa-katanka", n:"Полоса, катанка, проволока", rows:[
  {s:"Полоса 25х4, 6 м", w:5, l:6, p:475000},
  {s:"Полоса 30х4, 6 м", w:6, l:6, p:460000},
  {s:"Полоса 40х4, 6 м", w:8.3, l:6, p:460000},
  {s:"Полоса 50х5, 6 м", w:12, l:6, p:460000},
  {s:"Катанка Ø6,5, пруток 6 м", w:1.8, l:6, p:320000},
  {s:"Катанка Ø8, пруток 6 м", w:2.5, l:6, p:320000},
  {s:"Катанка Ø6, бухта ~0,85 т", w:850, l:0, p:300000, u:"coil"},
  {s:"Катанка Ø8, бухта ~0,85 т", w:850, l:0, p:300000, u:"coil"},
  {s:"Катанка Ø10, бухта ~0,85 т", w:850, l:0, p:300000, u:"coil"},
  {s:"Проволока Ø1,2 оцинк., бухта 25 кг", w:25, l:0, p:470000, u:"coil"},
  {s:"Проволока Ø6 оцинк., бухта ~0,8 т", w:800, l:0, p:825000, u:"coil"}
]}
];
var UNIT = {ru:{pc:"шт",coil:"бухт",sheet:"лист",m:"м",t:"т"}};

/* ---------------- ПЕРЕВОД ---------------- */
var RU = {};
function snapshot(){
  document.querySelectorAll("[data-i]").forEach(function(el){ if (RU[el.dataset.i] === undefined) RU[el.dataset.i] = el.innerHTML; });
  document.querySelectorAll("[data-i-alt]").forEach(function(el){ RU[el.dataset.iAlt] = el.alt; });
  document.querySelectorAll("[data-i-aria]").forEach(function(el){ RU[el.dataset.iAria] = el.getAttribute("aria-label"); });
  document.querySelectorAll("[data-i-c]").forEach(function(el){ RU[el.dataset.iC] = el.getAttribute("content"); });
  document.querySelectorAll("[data-i-ph]").forEach(function(el){ RU[el.dataset.iPh] = el.getAttribute("placeholder"); });
  var t = document.querySelector("title[data-i-t]"); if (t) RU[t.dataset.iT] = t.textContent;
}
function pick(k, kk){ return (kk && KZ[k] !== undefined) ? KZ[k] : RU[k]; }
function curLang(){ return root.lang === "kk" ? "kk" : "ru"; }

/* текст заявки собирается из заголовка карточки на текущем языке */
function setWaLinks(){
  var L = curLang();
  document.querySelectorAll("[data-wa]").forEach(function(a){
    var key = a.dataset.wa, W = (L === "kk") ? KK.wa : WA_TXT.ru, t = W[key] || W.hero;
    if (t.indexOf("{t}") > -1) {
      var card = a.closest(".cat"), h = card ? card.querySelector("h3") : null;
      t = t.replace("{t}", h ? h.textContent.trim() : "");
    }
    a.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(t);
    a.target = "_blank"; a.rel = "noopener";
  });
}

function setLang(lang){
  if (lang === "kk") loadKK(function(){ applyLang(KK ? "kk" : "ru"); });
  else applyLang("ru");
}
function applyLang(lang){
  var kk = lang === "kk" && !!KK;
  root.setAttribute("lang", kk ? "kk" : "ru");
  document.querySelectorAll("[data-i]").forEach(function(el){
    var v = pick(el.dataset.i, kk); if (v !== undefined) el.innerHTML = v;
  });
  document.querySelectorAll("[data-i-alt]").forEach(function(el){
    var v = pick(el.dataset.iAlt, kk); if (v !== undefined) el.alt = v;
  });
  document.querySelectorAll("[data-i-aria]").forEach(function(el){
    var v = pick(el.dataset.iAria, kk); if (v !== undefined) el.setAttribute("aria-label", v);
  });
  document.querySelectorAll("[data-i-c]").forEach(function(el){
    var v = pick(el.dataset.iC, kk); if (v !== undefined) el.setAttribute("content", v);
  });
  document.querySelectorAll("[data-i-ph]").forEach(function(el){
    var v = pick(el.dataset.iPh, kk); if (v !== undefined) el.setAttribute("placeholder", v);
  });
  var t = document.querySelector("title[data-i-t]");
  if (t) { var tv = pick(t.dataset.iT, kk); if (tv !== undefined) t.textContent = tv; }
  var og = document.querySelector('meta[property="og:locale"]');
  if (og) og.setAttribute("content", kk ? "kk_KZ" : "ru_RU");
  document.querySelectorAll(".lang button").forEach(function(b){
    var on = b.getAttribute("data-lang") === (kk ? "kk" : "ru");
    b.classList.toggle("is-active", on);
    b.setAttribute("aria-pressed", on ? "true" : "false");
  });
  try { localStorage.setItem("ss-lang", kk ? "kk" : "ru"); } catch(e){}
  setWaLinks();
  fillTicker();
  calcLang();
  requestAnimationFrame(fitText);
}
/* ?lang=kk в URL сильнее localStorage: русское объявление не должно открыть казахскую версию */
function initLang(){
  var url = new URLSearchParams(location.search).get("lang");
  var saved = null;
  try { saved = localStorage.getItem("ss-lang"); } catch(e){}
  var lang = (url === "kk" || url === "ru") ? url : (saved === "kk" ? "kk" : "ru");
  setLang(lang);
}
document.querySelectorAll(".lang button").forEach(function(b){
  b.addEventListener("click", function(){ setLang(b.getAttribute("data-lang")); });
});

/* дисплейные строки: казахский длиннее - ужимаем, пока не влезет */
function fitText(){
  document.querySelectorAll(".h1 span, .kphone").forEach(function(el){
    el.style.fontSize = "";
    var box = el.parentElement.clientWidth;
    if (!box) return;
    var size = parseFloat(getComputedStyle(el).fontSize), base = size;
    while (el.scrollWidth > box + 1 && size > base * 0.55) {
      size *= 0.95;
      el.style.fontSize = size + "px";
    }
  });
}

/* ---------------- БЕГУЩАЯ ЛЕНТА ----------------
   Копий столько, чтобы дорожка была шире двух экранов; шаг цикла - одна копия. */
function fillTicker(){
  var el = document.getElementById("ticker"); if (!el) return;
  var list = curLang() === "kk" ? KK.tick : TICK;
  var one = list.map(function(t){ return "<b>" + t + "</b>"; }).join("");
  el.innerHTML = one;
  var w = el.scrollWidth || 1000;
  var need = Math.max(2, Math.ceil((innerWidth * 2) / w) + 1);
  var html = "";
  for (var i = 0; i < need; i++) html += one;
  el.innerHTML = html;
  el.style.setProperty("--tkw", w + "px");
  el.style.setProperty("--tkd", Math.max(14, w / 60) + "s");
}
var tkTimer;
addEventListener("resize", function(){ clearTimeout(tkTimer); tkTimer = setTimeout(function(){ fillTicker(); fitText(); lanes.forEach(function(l){ l.state(); }); }, 200); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ fillTicker(); fitText(); });

/* ---------------- МЕНЮ ---------------- */
var burger = document.getElementById("burger");
var mnav = document.getElementById("mnav");
function closeMenu(){
  document.body.classList.remove("menu-open");
  if (burger) burger.setAttribute("aria-expanded", "false");
}
if (burger) burger.addEventListener("click", function(){
  var open = document.body.classList.toggle("menu-open");
  burger.setAttribute("aria-expanded", open ? "true" : "false");
});
if (mnav) mnav.addEventListener("click", function(e){ if (e.target.closest("a")) closeMenu(); });
addEventListener("keydown", function(e){ if (e.key === "Escape") closeMenu(); });

/* ---------------- ЯКОРЯ ---------------- */
var HH = function(){ return parseFloat(getComputedStyle(root).getPropertyValue("--hh")) || 66; };
document.addEventListener("click", function(e){
  var a = e.target.closest('a[href^="#"]'); if (!a) return;
  var id = a.getAttribute("href").slice(1); if (!id) return;
  var t = document.getElementById(id); if (!t) return;
  e.preventDefault();
  closeMenu();
  if (a.dataset.calc) calcSelect(a.dataset.calc);
  var top = t.getBoundingClientRect().top + scrollY - (t.classList.contains("pw") ? 0 : HH());
  scrollTo({ top: Math.max(0, top), behavior: RED ? "auto" : "smooth" });
  try { history.pushState(null, "", "#" + id); } catch(err){}
});

/* ---------------- ШАПКА ---------------- */
var hdr = document.getElementById("hdr");
function hdrState(){ if (hdr) hdr.classList.toggle("solid", scrollY > 40); }

/* ---------------- ПЛИТЫ ----------------
   Один слушатель scroll через rAF. На каждую обёртку .pw пишем
   --enter / --exit / --stay и --open (вытяжка кадра), герою ещё --f
   (интро: кадр прокатывается слева направо). */
var pws = [].slice.call(document.querySelectorAll(".pw"));
var heroPw = document.getElementById("top");
var hero = document.getElementById("hero");
var bar = document.getElementById("bar");
var kont = document.getElementById("kontakty");
var introK = 1, introDone = true;
function clamp(v){ return v < 0 ? 0 : (v > 1 ? 1 : v); }
function easeOut(t){ return 1 - Math.pow(1 - t, 2.6); }
function easeInOut(t){ return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function update(){
  var H = innerHeight || root.clientHeight;
  pws.forEach(function(pw){
    var r = pw.getBoundingClientRect();
    var enter = clamp(1 - r.top / H);
    var exit  = clamp(1 - r.bottom / H);
    var stay  = r.height > H + 1 ? clamp(-r.top / (r.height - H)) : enter;
    pw.style.setProperty("--enter", enter.toFixed(3));
    pw.style.setProperty("--exit",  exit.toFixed(3));
    pw.style.setProperty("--stay",  stay.toFixed(3));
    pw.style.setProperty("--open",  easeInOut(clamp((enter - 0.28) / 0.66)).toFixed(3));
    pw.classList.toggle("gone", exit >= 1);
    pw.classList.toggle("on", enter > 0.6);
    if (pw === heroPw) pw.style.setProperty("--f", introK.toFixed(3));
  });
  hdrState();
  /* липкая панель: после 55 % первого экрана, прячется на контактах */
  if (bar) {
    var onKont = kont && kont.getBoundingClientRect().top < H * 0.6;
    bar.classList.toggle("show", scrollY > H * 0.55 && !onKont);
  }
}
if (RED) {
  root.classList.add("no-plate");
  root.classList.add("no-intro");
  if (hero) hero.classList.add("on");
  addEventListener("scroll", function(){ hdrState(); if (bar) bar.classList.toggle("show", scrollY > innerHeight * 0.55); }, {passive:true});
  hdrState();
} else {
  var tick = false;
  addEventListener("scroll", function(){
    if (tick) return; tick = true;
    requestAnimationFrame(function(){ tick = false; update(); });
  }, {passive:true});
  addEventListener("resize", update);
  addEventListener("load", update);
  /* интро 1400 мс: кадр героя прокатывается слева направо за раскалённой кромкой,
     следом строки заголовка. Пропускаем при хэше / прокрутке - человек из рекламы сразу видит собранный экран. */
  var skip = location.hash || scrollY > 80;
  if (skip) {
    root.classList.add("no-intro");
    if (hero) hero.classList.add("on");
    update();
  } else {
    introK = 0; introDone = false; update();
    var t0 = null;
    var step = function(ts){
      if (introDone) return;
      if (t0 === null) t0 = ts;
      var p = clamp((ts - t0) / 1400);
      introK = easeInOut(p);
      update();
      if (p < 1) requestAnimationFrame(step);
      else introDone = true;
    };
    requestAnimationFrame(function(){ if (hero) hero.classList.add("on"); requestAnimationFrame(step); });
    /* страховка: если rAF не тикает (фоновая вкладка), собрать экран по таймеру */
    setTimeout(function(){ if (hero) hero.classList.add("on"); }, 400);
    setTimeout(function(){ if (!introDone) { introDone = true; introK = 1; update(); } }, 2200);
  }
}
window.plateSync = function(){ introDone = true; introK = 1; if (hero) hero.classList.add("on"); update(); };
addEventListener("hashchange", function(){ root.classList.add("no-intro"); });

/* ---------------- ПОЯВЛЕНИЕ В КАТАЛОЖНЫХ СЕКЦИЯХ ---------------- */
if (HAS_IO) {
  if (!RED) root.classList.add("js");
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
  }, {threshold:.12, rootMargin:"0px 0px -6% 0px"});
  document.querySelectorAll(".rv").forEach(function(el){ io.observe(el); });
  setTimeout(function(){ document.querySelectorAll(".rv:not(.in)").forEach(function(el){
    if (el.getBoundingClientRect().top < innerHeight) el.classList.add("in");
  }); }, 1500);
} else {
  document.querySelectorAll(".rv").forEach(function(el){ el.classList.add("in"); });
}

/* ---------------- ВИДЕО ПО ВИДИМОСТИ ----------------
   src подставляется, когда карточка входит в кадр; вне кадра - пауза.
   Класс is-live вешаем по событию playing, чтобы не мигал чёрный кадр. */
(function(){
  var vids = [].slice.call(document.querySelectorAll("video[data-src]"));
  if (!vids.length) return;
  vids.forEach(function(v){ v.addEventListener("playing", function(){ v.classList.add("is-live"); }); });
  function on(v){
    if (!v.getAttribute("src")) { v.src = v.dataset.src; v.load(); }
    var p = v.play(); if (p && p.catch) p.catch(function(){});
  }
  function off(v){ if (!v.paused) v.pause(); }
  if (HAS_IO && !RED) {
    var vio = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting) on(e.target); else off(e.target); });
    }, {threshold:.35});
    vids.forEach(function(v){ vio.observe(v); });
  } else if (!RED) {
    vids.forEach(on);
  }
})();

/* ---------------- КРОМКА ПО КОНТУРУ СХЕМ ----------------
   Дублируем основной контур горячей линией - при наведении она пробегает по чертежу. */
document.querySelectorAll(".sch svg").forEach(function(svg){
  svg.querySelectorAll(".o").forEach(function(p){
    if (p.classList.contains("rib")) return;
    var c = p.cloneNode(false);
    c.setAttribute("class", "hot"); c.removeAttribute("stroke-dasharray"); c.removeAttribute("stroke-width");
    c.setAttribute("pathLength", "100");
    svg.appendChild(c);
  });
});

/* ---------------- ЛЕНТЫ С КНОПКАМИ ----------------
   Шаг - ровно одна карточка (ширина + gap из стилей), крайняя кнопка гаснет,
   обе прячутся, если всё влезло. Ленте tabindex=0 - листается стрелками. */
var lanes = [];
document.querySelectorAll(".lane-w").forEach(function(w){
  var lane = w.querySelector(".lane"), prev = w.querySelector(".lbtn.prev"), next = w.querySelector(".lbtn.next");
  if (!lane || !prev || !next) return;
  function stepW(){
    var c = lane.firstElementChild; if (!c) return 300;
    var cs = getComputedStyle(lane);
    var gap = parseFloat(cs.columnGap || cs.gap) || 14;
    return c.getBoundingClientRect().width + gap;
  }
  function state(){
    var max = lane.scrollWidth - lane.clientWidth;
    var none = max <= 1;
    prev.hidden = none; next.hidden = none;
    prev.disabled = lane.scrollLeft <= 1;
    next.disabled = lane.scrollLeft >= max - 1;
  }
  prev.addEventListener("click", function(){ lane.scrollBy({left: -stepW(), behavior: RED ? "auto" : "smooth"}); });
  next.addEventListener("click", function(){ lane.scrollBy({left: stepW(), behavior: RED ? "auto" : "smooth"}); });
  lane.addEventListener("scroll", state, {passive:true});
  lane.addEventListener("keydown", function(e){
    if (e.key === "ArrowRight") { e.preventDefault(); next.click(); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); prev.click(); }
  });
  state();
  addEventListener("load", state);
  lanes.push({state: state});
});

/* ---------------- КАЛЬКУЛЯТОР ----------------
   Вес 1 шт и длина - из прайса; сумма = тонны x цена за тонну.
   Штучный товар (лист, бухта) метров не имеет - кнопка «м» гаснет. */
var kCat = document.getElementById("k-cat"), kSize = document.getElementById("k-size"), kQty = document.getElementById("k-qty");
var kUnits = document.querySelectorAll(".units button");
var zCat = document.getElementById("z-cat");
var kUnit = "m";
function fmt(n, d){
  d = d === undefined ? 0 : d;
  var s = n.toFixed(d).split(".");
  s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return s.length > 1 ? s[0] + "," + s[1] : s[0];
}
function smart(n){ return n >= 100 ? fmt(n, 0) : (n >= 10 ? fmt(n, 1) : fmt(n, 2)); }
function catName(c){ return curLang() === "kk" ? (KK.cat[c.id] || c.n) : c.n; }
function catByIdx(i){ return CALC[i] || CALC[0]; }
function sizeLabel(row){
  var s = row.s;
  if (curLang() === "kk") KK.size.forEach(function(r){ s = s.replace(r[0], r[1]); });
  return s;
}
function calcLang(){
  if (!kCat) return;
  var ci = kCat.selectedIndex < 0 ? 0 : kCat.selectedIndex, si = kSize.options.length ? kSize.selectedIndex : undefined;
  var kk = curLang() === "kk";
  kCat.innerHTML = CALC.map(function(c){ return "<option value=\"" + c.id + "\">" + catName(c) + "</option>"; }).join("");
  kCat.selectedIndex = ci;
  fillSizes(si);
  if (zCat) {
    var zi = zCat.selectedIndex < 0 ? 0 : zCat.selectedIndex;
    zCat.innerHTML = CALC.map(function(c){ return "<option value=\"" + c.id + "\">" + catName(c) + "</option>"; }).join("") +
      "<option value=\"other\">" + (kk ? KK.calc.other : "Другое / несколько позиций") + "</option>";
    zCat.selectedIndex = zi;
  }
}
function fillSizes(keep){
  var c = catByIdx(kCat.selectedIndex);
  kSize.innerHTML = c.rows.map(function(r, i){ return "<option value=\"" + i + "\">" + sizeLabel(r) + "</option>"; }).join("");
  kSize.selectedIndex = (keep !== undefined && keep < c.rows.length) ? keep : (c.d || 0);
  calc();
}
function setUnit(u){
  kUnit = u;
  kUnits.forEach(function(b){
    var on = b.dataset.u === u;
    b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on ? "true" : "false");
  });
}
function calc(){
  if (!kCat || !kSize) return;
  var c = catByIdx(kCat.selectedIndex), r = c.rows[kSize.selectedIndex] || c.rows[0];
  var L = curLang(), U = L === "kk" ? KK.unit : UNIT.ru;
  var piece = r.l === 0;
  kUnits.forEach(function(b){ if (b.dataset.u === "m") b.disabled = piece; });
  if (piece && kUnit === "m") setUnit("p");
  var q = parseFloat(String(kQty.value).replace(",", ".")) || 0;
  var pcs, t, m;
  if (kUnit === "p") { pcs = q; }
  else if (kUnit === "t") { pcs = q * 1000 / r.w; }
  else { pcs = r.l ? q / r.l : 0; }
  t = pcs * r.w / 1000; m = r.l ? pcs * r.l : 0;
  var sum = t * r.p;
  var pu = r.u || "pc";
  document.getElementById("k-title").textContent = catName(c) + " " + sizeLabel(r);
  document.getElementById("r-m").textContent = r.l ? smart(m) : "-";
  document.getElementById("r-t").textContent = smart(t);
  document.getElementById("r-p").textContent = smart(pcs);
  document.getElementById("r-pl").textContent = U[pu];
  document.getElementById("r-sum").textContent = fmt(sum, 0) + " ₸";
  document.getElementById("p-t").textContent = fmt(r.p, 0);
  document.getElementById("p-mw").hidden = !r.l;
  document.getElementById("p-m").textContent = r.l ? fmt(r.p * r.w / 1000 / r.l, 0) : "-";
  document.getElementById("p-p").textContent = fmt(r.p * r.w / 1000, 0);
  document.getElementById("p-pl").textContent = "₸ / " + U[pu];
  /* готовое сообщение в WhatsApp с параметрами расчёта */
  var unitTxt = kUnit === "m" ? U.m : (kUnit === "t" ? U.t : U[pu]);
  var line = (L === "kk" ? KK.calc.head : "Расчёт:\n") + catName(c) + " " + sizeLabel(r) + "\n" +
    fmt(q, q % 1 ? 2 : 0) + " " + unitTxt + " ≈ " + (r.l ? smart(m) + " " + U.m + " / " : "") + smart(t) + " " + U.t + " / " + smart(pcs) + " " + U[pu] + "\n" +
    (L === "kk" ? KK.calc.approx : "Ориентировочно по прайсу: ") + fmt(sum, 0) + " ₸\n" +
    (L === "kk" ? KK.calc.confirm : "Прошу подтвердить цену, наличие и доставку.");
  var wa = document.getElementById("k-wa");
  if (wa) wa.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent((L === "kk" ? KK.calc.hello : "Здравствуйте! С сайта Strong Steel. ") + line);
}
function calcSelect(id){
  if (!kCat) return;
  for (var i = 0; i < CALC.length; i++) if (CALC[i].id === id) { kCat.selectedIndex = i; break; }
  fillSizes();
}
if (kCat) {
  kCat.addEventListener("change", function(){ fillSizes(); });
  kSize.addEventListener("change", calc);
  kQty.addEventListener("input", calc);
  kUnits.forEach(function(b){ b.addEventListener("click", function(){ if (b.disabled) return; setUnit(b.dataset.u); calc(); }); });
}
window.ssCalc = function(id, size, qty, unit){ calcSelect(id); kSize.selectedIndex = size; kQty.value = qty; setUnit(unit); calc(); return document.getElementById("r-sum").textContent + " | " + document.getElementById("r-m").textContent + " м / " + document.getElementById("r-t").textContent + " т / " + document.getElementById("r-p").textContent; };

/* ---------------- ФОРМА → WhatsApp ---------------- */
var form = document.getElementById("form");
if (form) form.addEventListener("submit", function(e){
  e.preventDefault();
  var ok = document.getElementById("fmok"), err = document.getElementById("fmerr");
  if (form.company && form.company.value) return;          /* honeypot */
  var name = form.name.value.trim(), phone = form.phone.value.trim(), vol = form.vol.value.trim(), msg = form.msg.value.trim();
  var catEl = form.cat, catTxt = catEl && catEl.selectedIndex >= 0 ? catEl.options[catEl.selectedIndex].textContent : "";
  if (!name || phone.replace(/\D/g, "").length < 10 || !form.agree.checked) { err.hidden = false; ok.hidden = true; return; }
  err.hidden = true;
  var L = curLang();
  var F = (L === "kk") ? KK.form : {head:"Здравствуйте! Заявка с сайта Strong Steel.", name:"Имя", phone:"Телефон", need:"Что нужно", vol:"Объём", msg:"Комментарий"};
  var t = F.head + "\n" + F.name + ": " + name + "\n" + F.phone + ": " + phone + "\n" + F.need + ": " + catTxt + (vol ? "\n" + F.vol + ": " + vol : "") + (msg ? "\n" + F.msg + ": " + msg : "");
  ok.hidden = false;
  conv("lead");
  window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(t), "_blank", "noopener");
});

/* ---------------- СТАРТ ---------------- */
snapshot();
calcLang();
initLang();
fillTicker();
fitText();
hdrState();
})();
