const lista = document.getElementById("lista-countdowns");
const searchInput = document.getElementById('search');
const pageSizeSelect = document.getElementById('page-size');
const paginationEl = document.getElementById('pagination');
const resultsCount = document.getElementById('results-count');

let allCountdowns = [];
let currentPage = 1;
let pageSize = parseInt(pageSizeSelect?.value || '10', 10);

function crearCountdown(db) {
    const titulo = document.getElementById("titulo").value.trim();
    const fecha = document.getElementById("fecha").value;

    if (!titulo || !fecha) {
        alert("Rellena el título y la fecha.");
        return;
    }

    db.collection("countdowns").add({
        title: titulo,
        date: fecha,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then((docRef) => {
        const url = `countdown.html?id=${docRef.id}`;
        document.getElementById("link").innerHTML =
            `<a href="${url}" target="_blank">Abrir countdown</a>`;
    })
    .catch((error) => {
        console.error("Error guardando countdown:", error);
    });
}

// Listar todos los countdowns
// Helper to format date/time nicely
function formatDateTime(value) {
    try {
        if (!value) return '-';
        // Firestore timestamp objects have toDate()
        const date = (value.toDate) ? value.toDate() : new Date(value);
        return date.toLocaleString();
    } catch (e) { return '-'; }
}

// Renders the paged, filtered list
function renderList() {
    const query = (searchInput?.value || '').trim().toLowerCase();
    const filtered = allCountdowns.filter(c => c.title.toLowerCase().includes(query));

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * pageSize;
    const pageItems = filtered.slice(start, start + pageSize);

    // update counts
    if (resultsCount) resultsCount.textContent = ` ${total} resultados`;

    // render cards/list
    lista.innerHTML = '';
    if (pageItems.length === 0) {
        lista.innerHTML = '<div class="empty">No hay countdowns que coincidan.</div>';
    } else {
        for (const item of pageItems) {
            const div = document.createElement('div');
            div.className = 'card';
            div.innerHTML = `
                <div class="title"><a href="countdown.html?id=${item.id}">${escapeHtml(item.title)}</a></div>
                <div class="meta">Fecha objetivo: ${escapeHtml(item.date)} • Creado: ${formatDateTime(item.createdAt)}</div>
            `;
            lista.appendChild(div);
        }
    }

    renderPagination(totalPages);
}

// render pagination controls
function renderPagination(totalPages) {
    if (!paginationEl) return;
    paginationEl.innerHTML = '';

    const prev = document.createElement('button');
    prev.textContent = '‹';
    prev.disabled = currentPage <= 1;
    prev.addEventListener('click', () => { currentPage--; renderList(); });
    paginationEl.appendChild(prev);

    // show a short range of pages: current ± 2
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        addPageButton(1);
        if (startPage > 2) {
            const dots = document.createElement('span'); dots.textContent = '...'; dots.className = 'page-number'; paginationEl.appendChild(dots);
        }
    }

    for (let p = startPage; p <= endPage; p++) addPageButton(p);

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots2 = document.createElement('span'); dots2.textContent = '...'; dots2.className = 'page-number'; paginationEl.appendChild(dots2);
        }
        addPageButton(totalPages);
    }

    const next = document.createElement('button');
    next.textContent = '›';
    next.disabled = currentPage >= totalPages;
    next.addEventListener('click', () => { currentPage++; renderList(); });
    paginationEl.appendChild(next);

    function addPageButton(p) {
        const btn = document.createElement('button');
        btn.textContent = p;
        btn.className = 'page-number';
        if (p === currentPage) btn.classList.add('active');
        btn.addEventListener('click', () => { currentPage = p; renderList(); });
        paginationEl.appendChild(btn);
    }
}

// small utility to prevent XSS when writing innerHTML with user content
function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
}

// Basic debounce helper
function debounce(fn, ms=250){ let t; return (...args)=>{ clearTimeout(t); t = setTimeout(()=>fn.apply(this,args), ms); }; }

// Wire controls
if (searchInput) searchInput.addEventListener('input', debounce(()=>{ currentPage = 1; renderList(); }, 200));
if (pageSizeSelect) pageSizeSelect.addEventListener('change', (e)=>{ pageSize = parseInt(e.target.value,10); currentPage = 1; renderList(); });

// Subscribe to firestore and maintain a local list
db.collection("countdowns")
  .orderBy("createdAt", "desc")
  .onSnapshot((snapshot) => {
    allCountdowns = [];
    snapshot.forEach((doc) => {
        const d = doc.data();
        allCountdowns.push({ id: doc.id, title: d.title || 'Sin título', date: d.date || '-', createdAt: d.createdAt });
    });
    // reset to first page if current page exceeds new total
    currentPage = 1;
    renderList();
});

// ensure the UI updates on page load
renderList();

