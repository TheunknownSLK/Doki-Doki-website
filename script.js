'use strict';

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const menuButton = $('.menu-toggle');
const nav = $('#nav');
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  menuButton.setAttribute('aria-label', expanded ? 'Abrir menu' : 'Fechar menu');
  nav.classList.toggle('open', !expanded);
});
$$('a[href^="#"]').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('open')) {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menu');
    menuButton.focus();
  }
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      $$('#nav a').forEach(link => {
        const active = link.getAttribute('href') === '#' + entry.target.id;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
  $$('main > section[id]').forEach(section => observer.observe(section));
}

const characters = {
  sayori: { name: 'Sayori', label: 'O SOL DO CLUBE', description: 'Sua amiga de infância é quem abre a porta para o Clube de Literatura. Otimista e cheia de energia, Sayori faz de tudo para que todos se sintam acolhidos. Para ela, a felicidade das pessoas ao redor torna cada dia um pouco mais especial.', facts: ['Amiga de infância', 'Gentileza', 'Amizade'] },
  natsuki: { name: 'Natsuki', label: 'DOCE, DO JEITO DELA', description: 'Natsuki sabe o que gosta e não tem medo de dizer o que pensa. Por trás de seu jeito decidido, há um carinho especial pelas coisas fofas. No clube, ela mostra que um jeito direto também pode esconder muita delicadeza.', facts: ['Atitude', 'Coisas fofas', 'Autenticidade'] },
  yuri: { name: 'Yuri', label: 'ENTRE LIVROS E CHÁ', description: 'Reservada e misteriosa, Yuri encontra conforto no mundo dos livros. Sua paixão pela literatura revela um olhar profundo e uma imaginação intensa. Com tempo e atenção, uma conversa com ela pode abrir a porta para um universo inteiro.', facts: ['Literatura', 'Imaginação', 'Introspecção'] },
  monika: { name: 'Monika', label: 'NOSSA PRESIDENTE', description: 'Monika é a presidente do Clube de Literatura. Ela recebe os novos membros, acompanha as atividades e incentiva cada pessoa a encontrar sua própria voz. Seu entusiasmo ajuda a transformar uma simples sala de aula em um lugar para compartilhar histórias.', facts: ['Presidente', 'Liderança', 'Poesia'] }
};
const characterDialog = $('#character-dialog');
$$('[data-character]').forEach(button => button.addEventListener('click', () => {
  const key = button.dataset.character;
  const character = characters[key];
  $('#character-name').textContent = character.name;
  $('#character-label').textContent = character.label;
  $('#character-description').textContent = character.description;
  $('#character-image').src = 'assets/' + key + '.png';
  $('#character-image').alt = character.name + ', personagem de Doki Doki Literature Club';
  $('.character-dialog-layout').dataset.theme = key;
  $('#character-facts').replaceChildren(...character.facts.map(fact => {
    const tag = document.createElement('span');
    tag.textContent = fact;
    return tag;
  }));
  characterDialog.showModal();
  document.body.classList.add('scroll-locked');
}));

$$('dialog').forEach(dialog => {
  $$('.dialog-close, .dialog-done', dialog).forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => document.body.classList.remove('scroll-locked'));
});

const gallery = $$('.gallery-item');
const galleryDialog = $('#gallery-dialog');
let currentGallery = 0;
function visibleGallery() { return gallery.filter(item => !item.hidden); }
function displayGallery(index) {
  const visible = visibleGallery();
  currentGallery = (index + visible.length) % visible.length;
  const item = visible[currentGallery];
  $('#gallery-full').src = item.dataset.gallery;
  $('#gallery-full').alt = $('img', item).alt;
  $('#gallery-caption').textContent = item.dataset.caption + ' · ' + (currentGallery + 1) + '/' + visible.length;
  $('#gallery-prev').hidden = $('#gallery-next').hidden = visible.length < 2;
}
gallery.forEach(item => item.addEventListener('click', () => {
  displayGallery(visibleGallery().indexOf(item));
  galleryDialog.showModal();
  document.body.classList.add('scroll-locked');
}));
$('#gallery-prev').addEventListener('click', () => displayGallery(currentGallery - 1));
$('#gallery-next').addEventListener('click', () => displayGallery(currentGallery + 1));
galleryDialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); displayGallery(currentGallery - 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); displayGallery(currentGallery + 1); }
});
$$('[data-filter]').forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  $$('[data-filter]').forEach(tab => {
    tab.classList.toggle('selected', tab === button);
    tab.setAttribute('aria-pressed', String(tab === button));
  });
  gallery.forEach(item => item.hidden = filter !== 'all' && item.dataset.category !== filter);
  $('.gallery-grid').classList.toggle('filtered', filter !== 'all');
}));

const title = $('#poem-title');
const poem = $('#poem-text');
const status = $('#poem-status');
const storageKey = 'doki-doki-poem-v1';
let storageAvailable = true;
try {
  const draft = JSON.parse(localStorage.getItem(storageKey) || 'null');
  if (draft && typeof draft.title === 'string' && typeof draft.text === 'string') {
    title.value = draft.title.slice(0, 70);
    poem.value = draft.text.slice(0, 4000);
    status.textContent = 'Seu rascunho está aqui. Continue de onde parou ♡';
  }
} catch { storageAvailable = false; }
function updatePoem() {
  $('#poem-count').textContent = poem.value.length.toLocaleString('pt-BR') + ' / 4.000';
  if (!storageAvailable) {
    status.textContent = 'O navegador não permite salvar rascunhos. Baixe o poema para guardá-lo.';
    return;
  }
  try {
    localStorage.setItem(storageKey, JSON.stringify({title: title.value, text: poem.value}));
    status.textContent = poem.value || title.value ? 'Rascunho salvo neste navegador ♡' : '';
  } catch {
    storageAvailable = false;
    status.textContent = 'Não foi possível salvar o rascunho. Baixe o poema para guardá-lo.';
  }
}
$('#poem-count').textContent = poem.value.length.toLocaleString('pt-BR') + ' / 4.000';
title.addEventListener('input', updatePoem);
poem.addEventListener('input', updatePoem);
$$('.word-bank button').forEach(button => button.addEventListener('click', () => {
  const word = button.textContent;
  const start = poem.selectionStart;
  const end = poem.selectionEnd;
  const prefix = start && !/\s/.test(poem.value[start - 1]) ? ' ' : '';
  const addition = prefix + word + ' ';
  if (poem.value.length - (end - start) + addition.length > 4000) {
    status.textContent = 'Sua página está cheia! Você pode guardar o poema em um arquivo.';
    return;
  }
  poem.setRangeText(addition, start, end, 'end');
  poem.focus();
  updatePoem();
}));
$('#poem-form').addEventListener('submit', event => {
  event.preventDefault();
  if (!poem.value.trim()) {
    status.textContent = 'Escreva pelo menos uma palavra para guardar seu poema ♡';
    poem.focus();
    return;
  }
  updatePoem();
  const content = (title.value.trim() || 'Meu poema') + '\n\n' + poem.value + '\n';
  const blob = new Blob(['\ufeff', content], {type: 'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = (title.value.trim() || 'meu-poema').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9-]/g, '-').replace(/-+/g, '-').slice(0, 60) + '.txt';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status.textContent = 'Poema pronto! O download do arquivo .txt foi iniciado ♡';
});
