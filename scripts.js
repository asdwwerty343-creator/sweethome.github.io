// Control oferta acceptance (strict)
const ofertaModal = document.getElementById('oferta-modal');
const agreeBtn = document.getElementById('agree-btn');
const declineBtn = document.getElementById('decline-btn');
const siteContent = document.getElementById('site-content');
const accessDenied = document.getElementById('access-denied');

function lockScroll() {
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
}

function unlockScroll() {
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
}

// On load, show modal and block content
document.addEventListener('DOMContentLoaded', () => {
  // ensure modal is visible and content hidden
  ofertaModal.setAttribute('aria-hidden', 'false');
  siteContent.classList.add('site-hidden');
  lockScroll();
});

agreeBtn.addEventListener('click', () => {
  // Accept: hide modal, show site content, allow interaction
  ofertaModal.setAttribute('aria-hidden', 'true');
  siteContent.classList.remove('site-hidden');
  accessDenied.classList.add('hidden');
  unlockScroll();
  // Save acceptance locally so repeat visitors on same device won't see modal
  try { localStorage.setItem('sweethome_oferta_accepted', '1'); } catch(e){}
});

declineBtn.addEventListener('click', () => {
  // Decline: hide modal and show access denied message — block site view
  ofertaModal.setAttribute('aria-hidden', 'true');
  siteContent.style.display = 'none';
  accessDenied.classList.remove('hidden');
  unlockScroll();
});

// If user previously accepted, skip modal
try {
  const accepted = localStorage.getItem('sweethome_oferta_accepted');
  if (accepted === '1') {
    ofertaModal.setAttribute('aria-hidden', 'true');
    siteContent.classList.remove('site-hidden');
    unlockScroll();
  }
} catch(e){}

// --- Simple client-side "CMS" for listings (localStorage) ---
const listingsEl = document.getElementById('listings');
const uploadModal = document.getElementById('upload-modal');
const openUploadBtn = document.getElementById('open-upload');
const modalClose = document.getElementById('modal-close');
const uploadForm = document.getElementById('upload-form');
const template = document.getElementById('listing-template');
const uploadCancel = document.getElementById('upload-cancel');

function loadListings(){
  const data = JSON.parse(localStorage.getItem('sh_listings') || '[]');
  renderListings(data);
}

function renderListings(list){
  listingsEl.innerHTML = '';
  if(list.length === 0){
    listingsEl.innerHTML = '<p class="muted">Фотографии и объявления будут добавлены позднее. Используйте кнопку «Добавить фото / объявление» чтобы загрузить варианты.</p>';
    return;
  }
  list.forEach((item, idx) => {
    const node = template.content.cloneNode(true);
    const media = node.querySelector('.card-media');
    const title = node.querySelector('.card-title');
    const desc = node.querySelector('.card-desc');
    const meta = node.querySelector('.card-meta');
    const viewBtn = node.querySelector('.view-btn');
    const downloadBtn = node.querySelector('.download-btn');

    title.textContent = item.title || 'Без названия';
    desc.textContent = item.description || '';
    meta.textContent = item.address ? item.address + (item.price ? (' — ' + item.price + ' ₽') : '') : (item.price ? item.price + ' ₽' : '');
    if(item.images && item.images.length){
      media.style.backgroundImage = `url(${item.images[0]})`;
    } else {
      media.style.backgroundImage = '';
    }

    viewBtn.addEventListener('click', () => {
      const galleryWin = window.open('', '_blank');
      const imgs = item.images || [];
      galleryWin.document.write('<title>' + (item.title||'') + '</title>');
      imgs.forEach(src => {
        galleryWin.document.write('<img src="'+src+'" style="max-width:100%;display:block;margin:10px auto" />');
      });
    });

    downloadBtn.addEventListener('click', () => {
      if(!item.images || !item.images[0]) return;
      const a = document.createElement('a');
      a.href = item.images[0];
      a.download = 'photo.jpg';
      a.click();
    });

    listingsEl.appendChild(node);
  });
}

openUploadBtn.addEventListener('click', () => {
  uploadModal.setAttribute('aria-hidden','false');
  lockScroll();
});

modalClose.addEventListener('click', () => {
  uploadModal.setAttribute('aria-hidden','true');
  unlockScroll();
});

uploadCancel.addEventListener('click', () => {
  uploadModal.setAttribute('aria-hidden','true');
  unlockScroll();
});

uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const address = document.getElementById('address').value;
  const price = document.getElementById('price').value;
  const imagesInput = document.getElementById('images');
  const files = [...imagesInput.files];
  const images = await Promise.all(files.map(fileToDataUrl));
  const current = JSON.parse(localStorage.getItem('sh_listings') || '[]');
  current.unshift({title,description,address,price,images,created:Date.now()});
  localStorage.setItem('sh_listings', JSON.stringify(current));
  uploadForm.reset();
  uploadModal.setAttribute('aria-hidden','true');
  unlockScroll();
  renderListings(current);
});

function fileToDataUrl(file){
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = ()=> res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
}

loadListings();
