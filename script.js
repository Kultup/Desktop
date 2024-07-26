document.addEventListener('DOMContentLoaded', function() {
    const startMenu = document.getElementById('startMenu');
    startMenu.style.display = 'none';

    // Функція оновлення годинника
    function updateClock() {
        const clock = document.getElementById('clock');
        const now = new Date();
        clock.textContent = now.toLocaleTimeString();
    }

    setInterval(updateClock, 1000);
    updateClock();

    // Відкриття та закриття папок
    window.openFolder = function(folderId) {
        document.getElementById(folderId).style.display = 'block';
    };

    window.closeFolder = function(folderId) {
        document.getElementById(folderId).style.display = 'none';
    };

    // Відкриття та закриття файлів
    window.openFile = function(fileId) {
        document.getElementById(fileId).style.display = 'block';
    };

    window.closeFile = function(fileId) {
        document.getElementById(fileId).style.display = 'none';
    };

    // Перемикання видимості стартового меню
    window.toggleStartMenu = function() {
        startMenu.style.display = startMenu.style.display === 'block' ? 'none' : 'block';
    };

    // Закриття стартового меню при натисканні поза його межами
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.start-button') && !event.target.closest('.start-menu')) {
            startMenu.style.display = 'none';
        }
    });

    // Завантаження вмісту з localStorage
    function loadContent() {
        const file1Content = localStorage.getItem('file1Content');
        if (file1Content !== null) {
            document.getElementById('content-file1').value = file1Content;
        }

        const file2Content = localStorage.getItem('file2Content');
        if (file2Content !== null) {
            document.getElementById('content-file2').value = file2Content;
        }

        // Завантаження динамічно створених файлів
        const fileList = JSON.parse(localStorage.getItem('fileList')) || [];
        const fileListElement = document.getElementById('file-list');
        fileList.forEach(file => {
            const li = document.createElement('li');
            li.textContent = file.name;
            li.setAttribute('ondblclick', `openFile('${file.id}')`);
            li.setAttribute('data-file-id', file.id);
            fileListElement.appendChild(li);

            const filePopup = document.createElement('div');
            filePopup.className = 'popup';
            filePopup.id = file.id;
            filePopup.innerHTML = `
                <div class="popup-header">
                    <span>${file.name}</span>
                    <button class="close-btn" onclick="closeFile('${file.id}')">×</button>
                </div>
                <div class="popup-content">
                    <textarea id="content-${file.id}" rows="20" cols="50">${file.content}</textarea>
                </div>
            `;
            document.body.appendChild(filePopup);
        });
    }

    // Збереження вмісту в localStorage
    function saveContent() {
        const file1Content = document.getElementById('content-file1').value;
        localStorage.setItem('file1Content', file1Content);

        const file2Content = document.getElementById('content-file2').value;
        localStorage.setItem('file2Content', file2Content);

        // Збереження динамічно створених файлів
        const fileList = JSON.parse(localStorage.getItem('fileList')) || [];
        fileList.forEach(file => {
            const content = document.getElementById(`content-${file.id}`)?.value || '';
            file.content = content;
        });
        localStorage.setItem('fileList', JSON.stringify(fileList));
    }

    // Показати спливаюче вікно для створення файлу
    window.showCreateFilePopup = function() {
        document.getElementById('createFilePopup').style.display = 'block';
    };

    // Закрити спливаюче вікно для створення файлу
    window.closeCreateFilePopup = function() {
        document.getElementById('createFilePopup').style.display = 'none';
    };

    // Створення нового файлу
    window.createNewFile = function() {
        const newFileName = document.getElementById('newFileName').value;
        if (!newFileName) {
            alert('Будь ласка, введіть ім’я файлу.');
            return;
        }

        const fileList = JSON.parse(localStorage.getItem('fileList')) || [];
        const newFileId = `file${fileList.length + 1}`;
        const newFileContent = '';

        fileList.push({ id: newFileId, name: newFileName, content: newFileContent });
        localStorage.setItem('fileList', JSON.stringify(fileList));

        const fileListElement = document.getElementById('file-list');
        const li = document.createElement('li');
        li.textContent = newFileName;
        li.setAttribute('ondblclick', `openFile('${newFileId}')`);
        li.setAttribute('data-file-id', newFileId);
        fileListElement.appendChild(li);

        const filePopup = document.createElement('div');
        filePopup.className = 'popup';
        filePopup.id = newFileId;
        filePopup.innerHTML = `
            <div class="popup-header">
                <span>${newFileName}</span>
                <button class="close-btn" onclick="closeFile('${newFileId}')">×</button>
            </div>
            <div class="popup-content">
                <textarea id="content-${newFileId}" rows="20" cols="50"></textarea>
            </div>
        `;
        document.body.appendChild(filePopup);

        closeCreateFilePopup();
    };

    // Видалення вибраного файлу
    window.deleteSelectedFile = function() {
        const fileListElement = document.getElementById('file-list');
        const selectedFileElement = fileListElement.querySelector('li.selected');
        if (selectedFileElement) {
            const fileId = selectedFileElement.getAttribute('data-file-id');
            const filePopup = document.getElementById(fileId);

            selectedFileElement.remove();
            filePopup.remove();

            let fileList = JSON.parse(localStorage.getItem('fileList')) || [];
            fileList = fileList.filter(file => file.id !== fileId);
            localStorage.setItem('fileList', JSON.stringify(fileList));
        } else {
            alert('Виберіть файл для видалення.');
        }
    };

    // Виділення вибраного файлу
    document.getElementById('file-list').addEventListener('click', function(event) {
        if (event.target.tagName === 'LI') {
            const items = document.querySelectorAll('#file-list li');
            items.forEach(item => item.classList.remove('selected'));
            event.target.classList.add('selected');
        }
    });

    // Показати спливаюче вікно для створення нової папки
    window.showCreateFolderPopup = function() {
        const folderName = prompt('Введіть назву нової папки:');
        if (folderName) {
            const folderList = document.querySelector('#file-list'); // Список для папок
            const newFolder = document.createElement('div');
            newFolder.className = 'folder';
            newFolder.ondblclick = () => openFolder(`folder${Date.now()}`);
            newFolder.innerHTML = `
                <img src="img/folder_icon.png" alt="Нова папка">
                <span>${folderName}</span>
            `;
            folderList.appendChild(newFolder);
        }
    };

    // Завантаження вмісту при завантаженні сторінки
    loadContent();

    // Збереження вмісту перед закриттям сторінки
    window.addEventListener('beforeunload', saveContent);
});
