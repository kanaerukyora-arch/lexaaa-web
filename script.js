const screens = [...document.querySelectorAll(".screen")];
const toast = document.getElementById("toast");

const state = {
  walletPhone: "",
  registerPhone: "",
  pin: "",
  createPin: "",
  confirmPin: ""
};

function show(name){
  screens.forEach(s => s.classList.toggle("active", s.dataset.screen === name));
  window.scrollTo(0,0);
  document.querySelectorAll("video").forEach(v => {
    if (safelyVisible(v)) v.play().catch(()=>{});
  });
}
function safelyVisible(v){ return v.closest(".screen")?.classList.contains("active"); }

function notify(msg){
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(notify.t);
  notify.t = setTimeout(()=>toast.classList.remove("show"), 1800);
}

async function enterLexaa(){
  try{
    if(document.documentElement.requestFullscreen && !document.fullscreenElement){
      await document.documentElement.requestFullscreen();
    }
  }catch(e){}
  try{
    if(screen.orientation?.lock) await screen.orientation.lock("landscape");
  }catch(e){}
  show("auth");
}

function bindAction(action){
  if(action === "enter") return enterLexaa();
  if(action === "show-register" || action === "auth") return show("auth");
  if(action === "dashboard") return show("dashboard");
  if(action === "explore") return show("explore");
  if(action === "wallet"){ state.walletPhone=""; updateWalletPhone(); return show("wallet"); }
  if(action === "register"){ state.registerPhone=""; updateRegisterPhone(); return show("register"); }
  if(action === "login"){
    const p = document.getElementById("loginPhone").value.trim();
    const pin = document.getElementById("loginPin").value.trim();
    if(!p || pin.length !== 4){ notify("Isi nomor dan PIN 4 digit terlebih dahulu."); return; }
    notify("Login demo berhasil.");
    setTimeout(()=>show("dashboard"),300);
  }
}

document.addEventListener("click", e=>{
  const actionEl = e.target.closest("[data-action]");
  if(actionEl) bindAction(actionEl.dataset.action);

  const keyEl = e.target.closest("[data-key]");
  if(keyEl) handleKey(keyEl);
});

function updateWalletPhone(){
  document.getElementById("walletPhone").textContent = state.walletPhone ? "+62 " + state.walletPhone : "";
}
function updateRegisterPhone(){
  document.getElementById("registerPhone").textContent = state.registerPhone ? "+62 " + state.registerPhone : "";
}
function dots(value, n=4){
  return Array.from({length:n},(_,i)=>i<value.length ? "●" : "○").join(" ");
}
function updatePinViews(){
  document.getElementById("pinDots").textContent = dots(state.pin);
  document.getElementById("createPinDots").textContent = dots(state.createPin);
  document.getElementById("confirmPinDots").textContent = dots(state.confirmPin);
}

function handleKey(el){
  const keypad = el.closest(".keypad")?.dataset.keypad;
  const key = el.dataset.key;
  if(!keypad) return;

  let prop = keypad === "phone" ? "walletPhone" :
             keypad === "register-phone" ? "registerPhone" :
             keypad === "pin" ? "pin" :
             keypad === "create-pin" ? "createPin" : "confirmPin";

  if(key === "back"){
    state[prop] = state[prop].slice(0,-1);
  } else if(key !== "enter" && state[prop].length < (prop.includes("Pin") || prop === "pin" ? 4 : 15)){
    state[prop] += key;
  }

  if(prop === "walletPhone") updateWalletPhone();
  if(prop === "registerPhone") updateRegisterPhone();
  updatePinViews();

  if(key === "enter") nextFromKeypad(keypad);
}

function nextFromKeypad(keypad){
  if(keypad === "phone"){
    if(state.walletPhone.length < 7) return notify("Nomor handphone belum lengkap.");
    show("wallet-pin");
  } else if(keypad === "pin"){
    if(state.pin.length !== 4) return notify("PIN harus 4 digit.");
    notify("PIN demo diterima.");
    setTimeout(()=>show("dashboard"),300);
  } else if(keypad === "register-phone"){
    if(state.registerPhone.length < 7) return notify("Nomor handphone belum lengkap.");
    state.createPin="";
    updatePinViews();
    show("create-pin");
  } else if(keypad === "create-pin"){
    if(state.createPin.length !== 4) return notify("PIN harus 4 digit.");
    state.confirmPin="";
    updatePinViews();
    show("confirm-pin");
  } else if(keypad === "confirm-pin"){
    if(state.confirmPin.length !== 4) return notify("PIN harus 4 digit.");
    if(state.confirmPin !== state.createPin) return notify("PIN tidak sama.");
    notify("Pendaftaran demo berhasil.");
    setTimeout(()=>show("auth"),500);
  }
}

// Small live clock for the dashboard.
setInterval(()=>{
  const el = document.getElementById("clock");
  if(el){
    const d = new Date();
    el.textContent = d.toLocaleTimeString("id-ID",{hour12:false});
  }
},1000);

// Keep video looping reliably after returning to a screen.
document.addEventListener("visibilitychange", ()=>{
  if(!document.hidden){
    document.querySelectorAll("video").forEach(v=>v.play().catch(()=>{}));
  }
});
