// ==================================================
// [DATA] 공지사항 JSON 로드 및 초기 렌더링
// ==================================================
let notices = [];

fetch('data/notices.json')
  .then(res => res.json())
  .then(data => {
    notices = data;

    renderNoticeList();
    renderNoticeDetails();
    updateNoticeCount();
    renderIntroNotices();
  });


// ==================================================
// [NAVIGATION] 섹션 전환 & 메뉴 활성화 (공통)
// ==================================================
const sections = document.querySelectorAll('.section');
const menuButtons = document.querySelectorAll('[data-target]');

function activateSection(target) {
  sections.forEach(sec => sec.classList.remove('active'));
  menuButtons.forEach(btn => btn.classList.remove('active'));

  const targetSection = document.getElementById(target);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  document
    .querySelectorAll(`[data-target="${target}"]`)
    .forEach(btn => btn.classList.add('active'));
}


// ==================================================
// [NAVIGATION] 메뉴 클릭 처리 (PC / 모바일 공통)
// ==================================================
menuButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    activateSection(target);
    closeDrawer();
  });
});


// ==================================================
// [MOBILE] 햄버거 버튼 & 우측 드로어 제어
// ==================================================
const hamburger = document.getElementById('hamburger');
const drawer = document.getElementById('mobileDrawer');
const overlay = document.getElementById('menuOverlay');
const drawerClose = document.getElementById('drawerClose');

hamburger?.addEventListener('click', () => {
  drawer.classList.add('active');
  overlay.classList.add('active');
});

drawerClose?.addEventListener('click', closeDrawer);
overlay?.addEventListener('click', closeDrawer);

function closeDrawer() {
  drawer.classList.remove('active');
  overlay.classList.remove('active');
}


// ==================================================
// [NOTICE] 공지 목록 생성 (JSON 기반)
// ==================================================
function renderNoticeList() {
  const list = document.querySelector('.notice-list');
  list.innerHTML = '';

  notices.forEach(n => {
    const li = document.createElement('li');
    li.dataset.id = n.id;
    li.dataset.date = n.date;

    const viewCount = localStorage.getItem(`notice_view_${n.id}`) || 0;

    li.innerHTML = `
      <div class="notice-title">${n.title}</div>
      <div class="notice-meta-row">
        ${n.author} · ${n.date} · 조회 <span class="view">${viewCount}</span>
      </div>
    `;

    li.addEventListener('click', () => openNoticeDetail(n.id));
    list.appendChild(li);
  });
}


// ==================================================
// [NOTICE] 공지 상세 DOM 생성 (JSON 기반)
// ==================================================
function renderNoticeDetails() {
  const section = document.getElementById('noticeDetail');

  notices.forEach(n => {
    const div = document.createElement('div');
    div.className = 'notice-detail';
    div.dataset.id = n.id;

    const viewCount = localStorage.getItem(`notice_view_${n.id}`) || 0;

    div.innerHTML = `
      <h2>${n.title}</h2>
      <div class="notice-meta">
        ${n.author} · <span data-date="${n.date}"></span> · 조회 <span class="view">${viewCount}</span>
      </div>
      <div class="notice-content">
        ${n.content.join('')}
      </div>
    `;

    section.insertBefore(div, section.firstChild);
  });
}


// ==================================================
// [NOTICE] 공지 상세 열기 (목록 → 상세)
// ==================================================
function openNoticeDetail(id) {
  activateSection('noticeDetail');

  const noticeDetails = document.querySelectorAll('.notice-detail');
  noticeDetails.forEach(d => d.classList.remove('active'));

  const detail = document.querySelector(`.notice-detail[data-id="${id}"]`);
  if (!detail) return;

  detail.classList.add('active');

  // 조회수 증가
  const key = `notice_view_${id}`;
  const count = Number(localStorage.getItem(key) || 0) + 1;
  localStorage.setItem(key, count);

  detail.querySelector('.view').textContent = count;

  // 날짜 표시
  const dateEl = detail.querySelector('[data-date]');
  if (dateEl) dateEl.textContent = dateEl.dataset.date;

  // 목록 조회수 동기화
  const listItem = document.querySelector(`.notice-list li[data-id="${id}"]`);
  if (listItem) {
    listItem.querySelector('.view').textContent = count;
  }

  updateNoticeNav(id);
}


// ==================================================
// [NOTICE] 메인 화면 → 공지사항 목록 이동 (더보기 버튼)
// ==================================================
const noticeMoreBtn = document.getElementById('noticeMore');

noticeMoreBtn?.addEventListener('click', () => {
  activateSection('notice');
});


// ==================================================
// [NOTICE] 공지 상세 → 목록으로 돌아가기
// ==================================================
document.addEventListener('click', e => {
  if (e.target.closest('.notice-list-back')) {
    activateSection('notice');
  }
});


// ==================================================
// [NOTICE] 이전글 / 다음글 네비게이션
// ==================================================
function updateNoticeNav(currentId) {
  const ids = notices.map(n => n.id);
  const idx = ids.indexOf(currentId);

  const prevBtn = document.querySelector('.notice-prev');
  const nextBtn = document.querySelector('.notice-next');

  if (ids[idx - 1]) {
    const prev = notices[idx - 1];
    prevBtn.style.display = 'flex';
    prevBtn.querySelector('.title').textContent = prev.title;
    prevBtn.onclick = () => openNoticeDetail(prev.id);
  } else {
    prevBtn.style.display = 'none';
  }

  if (ids[idx + 1]) {
    const next = notices[idx + 1];
    nextBtn.style.display = 'flex';
    nextBtn.querySelector('.title').textContent = next.title;
    nextBtn.onclick = () => openNoticeDetail(next.id);
  } else {
    nextBtn.style.display = 'none';
  }
}


// ==================================================
// [INTRO] 메인 화면 공지사항 상단 5개 표시
// ==================================================
function renderIntroNotices() {
  const list = document.querySelector('.intro-notice-list');
  if (!list) return;

  list.innerHTML = '';

  notices.slice(0, 5).forEach(n => {
    const li = document.createElement('li');
    li.textContent = n.title;
    li.addEventListener('click', () => openNoticeDetail(n.id));
    list.appendChild(li);
  });
}


// ==================================================
// [NOTICE] 공지사항 전체 개수 표시
// ==================================================
function updateNoticeCount() {
  const el = document.getElementById('noticeCount');
  if (el) el.textContent = notices.length;
}


// ==================================================
// [NOTICE] 공지사항 검색 기능
// ==================================================
const noticeSearchInput = document.getElementById('noticeSearch');
const noticeSearchBtn = document.getElementById('noticeSearchBtn');

function filterNotices() {
  const keyword = noticeSearchInput.value.trim().toLowerCase();
  document.querySelectorAll('.notice-list li').forEach(li => {
    const title = li.querySelector('.notice-title').textContent.toLowerCase();
    li.style.display = !keyword || title.includes(keyword) ? '' : 'none';
  });
}

noticeSearchBtn?.addEventListener('click', filterNotices);
noticeSearchInput?.addEventListener('keydown', e => {
  if (e.key === 'Enter') filterNotices();
});


// ==================================================
// [CALL] 전화 문의 플로팅 버튼
// ==================================================
const callToggle = document.getElementById('callToggle');
const callActions = document.getElementById('callActions');

callToggle?.addEventListener('click', () => {
  callActions.classList.toggle('active');
});

document.querySelectorAll('.call-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (window.innerWidth > 768) {
      btn.classList.toggle('show-tooltip');
    }
  });
});