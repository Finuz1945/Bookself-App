const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

let isEditing = false;
let editingBookId = null;

const generateId = () => +new Date();

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

const findBook = (bookId) => books.find(book => book.id === bookId) || null;

function isStorageExist(){
    if (typeof Storage === undefined) {
      alert('Browser kamu tidak mendukung local storage');
      return false;
    }
    return true;
  }

const findBookIndex = (bookId) => books.findIndex(book => book.id === bookId);

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);

  if (serializedData !== null) {
    const data = JSON.parse(serializedData);

    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBook(bookObject) {
  const { id, title, author, year, isCompleted } = bookObject;

  const container = document.createElement('div');
  container.setAttribute('data-bookid', id);
  container.setAttribute('data-testid', 'bookItem');
  
  container.innerHTML = `
    <div class="book-card" data-bookid="${id}">
      <h3 data-testid="bookItemTitle">${title}</h3>
      <p data-testid="bookItemAuthor">Penulis: ${author}</p>
      <p data-testid="bookItemYear">Tahun: ${year}</p>
      <div>
          ${isCompleted 
            ? '<button data-testid="bookItemIsCompleteButton" class="btn-selesai">Belum selesai dibaca</button>'
            : '<button data-testid="bookItemIsCompleteButton" class="btn-selesai">Selesai dibaca</button>'}
          <button data-testid="bookItemDeleteButton" class="btn-hapus">Hapus Buku</button>
          <button data-testid="bookItemEditButton" class="btn-edit">Edit Buku</button>
      </div>
    </div>
  `;

  const isCompleteButton = container.querySelector('[data-testid="bookItemIsCompleteButton"]');
  const deleteButton = container.querySelector('[data-testid="bookItemDeleteButton"]');
  const editButton = container.querySelector('[data-testid="bookItemEditButton"]');

  if (isCompleted) {
    isCompleteButton.addEventListener('click', function () {
      undoBookFromCompleted(id);
    });
  } else {
    isCompleteButton.addEventListener('click', function () {
      addBookToCompleted(id);
    });
  }

  deleteButton.addEventListener('click', function () {
    removeBook(id);
  });

  editButton.addEventListener('click', function () {
    editBook(id);
  });

  return container;
}


function addBook() {
  const titleInput = document.getElementById('bookFormTitle');
  const authorInput = document.getElementById('bookFormAuthor');
  const yearInput = document.getElementById('bookFormYear');
  const isCompleteInput = document.getElementById('bookFormIsComplete');

  const title = titleInput.value;
  const author = authorInput.value;
  const year = parseInt(yearInput.value);
  const isCompleted = isCompleteInput.checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, title, author, year, isCompleted);

  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function updateBook(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  const titleInput = document.getElementById('bookFormTitle');
  const authorInput = document.getElementById('bookFormAuthor');
  const yearInput = document.getElementById('bookFormYear');
  const isCompleteInput = document.getElementById('bookFormIsComplete');

  bookTarget.title = titleInput.value;
  bookTarget.author = authorInput.value;
  bookTarget.year = parseInt(yearInput.value);
  bookTarget.isCompleted = isCompleteInput.checked;

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBook(bookId) {
  const bookTargetIndex = findBookIndex(bookId);
  if (bookTargetIndex === -1) return;

  books.splice(bookTargetIndex, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
 
function editBook(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  const titleInput = document.getElementById('bookFormTitle');
  const authorInput = document.getElementById('bookFormAuthor');
  const yearInput = document.getElementById('bookFormYear');
  const isCompleteInput = document.getElementById('bookFormIsComplete');
  const span = document.getElementById("status");


  titleInput.value = bookTarget.title;
  authorInput.value = bookTarget.author;
  yearInput.value = bookTarget.year;
  isCompleteInput.checked = bookTarget.isCompleted;

  if (bookTarget.isCompleted) {
    span.textContent = "Sudah selesai dibaca";
  } else {
    span.textContent = "Belum selesai dibaca";
  }


  editingBookId = bookId;
  isEditing = true;
}

function renderBooks() {
  const incompleteBookList = document.getElementById('incompleteBookList');
  const completeBookList = document.getElementById('completeBookList');

  incompleteBookList.innerHTML = '';
  completeBookList.innerHTML = '';

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);

    if (bookItem.isCompleted) {
      completeBookList.append(bookElement);
    } else {
      incompleteBookList.append(bookElement);
    }
  }
}

function searchBook() {
  const searchTitle = document.getElementById('searchBookTitle').value.toLowerCase();

  const incompleteBookList = document.getElementById('incompleteBookList');
  const completeBookList = document.getElementById('completeBookList');

  incompleteBookList.innerHTML = '';
  completeBookList.innerHTML = '';

  for (const bookItem of books) {
    if (bookItem.title.toLowerCase().includes(searchTitle)) {
      const bookElement = makeBook(bookItem);

      if (bookItem.isCompleted) {
        completeBookList.append(bookElement);
      } else {
        incompleteBookList.append(bookElement);
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('bookForm');
  const isCompleteInput = document.getElementById('bookFormIsComplete');
  const spanStatus = document.getElementById('status');

  isCompleteInput.addEventListener('change', function () {
    if (isCompleteInput.checked) {
      spanStatus.textContent = 'Sudah selesai dibaca';
    } else {
      spanStatus.textContent = 'Belum selesai dibaca';
    }
  });

  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    if (isEditing) {
      updateBook(editingBookId);
    } else {
      addBook();
    }

    submitForm.reset();
    isEditing = false;
    editingBookId = null;
  });

  const searchForm = document.getElementById('searchBook');

  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    searchBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, function () {
  renderBooks();
});

document.addEventListener(SAVED_EVENT, function () {
  console.log('Data berhasil disimpan.');
});
