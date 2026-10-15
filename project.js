'use strict';

const groups = JSON.parse(
  document.getElementById('projectData').textContent
);

const $ = id => document.getElementById(id);

const featured = [
  groups[1],
  groups[4],
  groups[5],
  groups[15]
];

let heroIndex = 0;

// Create hero carousel slides and indicators
featured.forEach((group, index) => {
  const slide = document.createElement('div');
  slide.className = 'carousel-item' + (index === 0 ? ' active' : '');

  const img = document.createElement('img');
  img.src = group.photos[0].src;
  img.alt = group.name;
  img.className = 'd-block w-100';

  if (index) {
    img.loading = 'lazy';
  }

  const caption = document.createElement('div');
  caption.className = 'carousel-caption';

  const title = document.createElement(index === 0 ? 'h1' : 'h2');
  title.textContent = index === 0 ? 'Our Projects' : group.name;

  const text = document.createElement('p');
  text.textContent = index === 0
    ? 'From furnace overhaul to fabrication and installation — explore the work of LEAPS Labor Services.'
    : group.name + ' — explore the photo gallery below.';

  caption.append(title, text);
  slide.append(img, caption);
  $('heroSlides').append(slide);

  const indicator = document.createElement('button');
  indicator.type = 'button';
  indicator.setAttribute('aria-label', 'Show ' + group.name);
  indicator.addEventListener('click', () => showHero(index));

  $('heroIndicators').append(indicator);
});

function showHero(index) {
  heroIndex = (index + featured.length) % featured.length;

  [...$('heroSlides').children].forEach((slide, i) => {
    slide.classList.toggle('active', i === heroIndex);
    slide.setAttribute('aria-hidden', i !== heroIndex);
  });

  [...$('heroIndicators').children].forEach((button, i) => {
    button.classList.toggle('active', i === heroIndex);
    button.setAttribute('aria-pressed', i === heroIndex);
  });
}

showHero(0);

$('heroPrev').onclick = () => showHero(heroIndex - 1);
$('heroNext').onclick = () => showHero(heroIndex + 1);

// Toggle the navigation menu
// $('menuToggle').onclick = () => {
//   const open = $('navbarMenu').classList.toggle('open');
//   $('menuToggle').setAttribute('aria-expanded', open);
// };

// Populate the project filter
groups.forEach(group => {
  const option = document.createElement('option');
  option.value = group.id;
  option.textContent = group.name;

  $('projectFilter').append(option);
});

const sections = [];

let activePhotos = [];
let currentPhoto = 0;

// Create project sections and photo cards
groups.forEach(group => {
  const section = document.createElement('section');
  section.className = 'project-section';
  section.id = group.id;
  section.setAttribute('aria-label', group.name);

  const heading = document.createElement('div');
  heading.className = 'project-heading';

  const title = document.createElement('h3');
  title.textContent = group.name;

  const count = document.createElement('span');
  count.textContent = group.photos.length + ' photos';

  heading.append(title, count);

  const grid = document.createElement('div');
  grid.className = 'photo-grid';

  group.photos.forEach((photo, index) => {
    const card = document.createElement('figure');
    card.className = 'photo-card';

    const button = document.createElement('button');
    button.className = 'photo-open';
    button.type = 'button';
    button.setAttribute('aria-label', 'View ' + photo.caption);

    const img = document.createElement('img');
    img.src = photo.thumb;
    img.alt = photo.caption;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 600;
    img.height = 420;

    button.append(img);
    button.onclick = () => openPhoto(group, index);

    const caption = document.createElement('figcaption');
    caption.textContent = photo.caption;

    const source = document.createElement('small');
    source.textContent = ' ';

    caption.append(source);
    card.append(button, caption);
    grid.append(card);
  });

  section.append(heading, grid);
  $('projectGallery').append(section);

  sections.push({ group, section });
});

// Filter the gallery by search text and selected project
function filterGallery() {
  const query = $('projectSearch').value.trim().toLowerCase();
  const category = $('projectFilter').value;

  let count = 0;
  let photos = 0;

  sections.forEach(({ group, section }) => {
    const visible = (
      (category === 'all' || category === group.id) &&
      group.name.toLowerCase().includes(query)
    );

    section.hidden = !visible;

    if (visible) {
      count++;
      photos += group.photos.length;
    }
  });

  $('resultCount').textContent =
    photos + ' photos in ' + count + ' ' +
    (count === 1 ? 'group' : 'groups');

  $('emptyState').hidden = count !== 0;
}

$('projectSearch').addEventListener('input', filterGallery);
$('projectFilter').addEventListener('change', filterGallery);

$('clearFilters').onclick = () => {
  $('projectSearch').value = '';
  $('projectFilter').value = 'all';

  filterGallery();
};

filterGallery();

// Render the selected photo in the viewer
function renderPhoto() {
  const photo = activePhotos[currentPhoto];

  $('viewerImage').src = photo.src;
  $('viewerImage').alt = photo.caption;

  $('viewerTitle').textContent = photo.caption.split(' | ')[0];

  // $('viewerCaption').textContent =
  //   photo.caption;

  // $('downloadPhoto').href = photo.src;
  // $('downloadPhoto').download = photo.src.split('/').pop();
}

function openPhoto(group, index) {
  activePhotos = group.photos;
  currentPhoto = index;

  renderPhoto();
  $('photoViewer').showModal();
}

function stepPhoto(step) {
  currentPhoto = (
    currentPhoto + step + activePhotos.length
  ) % activePhotos.length;

  renderPhoto();
}

// Photo viewer controls
$('photoPrev').onclick = () => stepPhoto(-1);
$('photoNext').onclick = () => stepPhoto(1);
$('closeViewer').onclick = () => $('photoViewer').close();

// Navigate photos using arrow keys
$('photoViewer').addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    stepPhoto(-1);
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault();
    stepPhoto(1);
  }
});

// Close the viewer when clicking outside the dialog
$('photoViewer').addEventListener('click', event => {
  if (event.target === $('photoViewer')) {
    const r = $('photoViewer').getBoundingClientRect();

    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    ) {
      $('photoViewer').close();
    }
  }
});

// Reset filters for project links and close the navigation menu
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', () => {
    const id = link.getAttribute('href').slice(1);

    if (groups.some(g => g.id === id)) {
      $('projectSearch').value = '';
      $('projectFilter').value = 'all';

      filterGallery();
    }

    $('navbarMenu').classList.remove('open');
    $('menuToggle').setAttribute('aria-expanded', 'false');
  });
});
