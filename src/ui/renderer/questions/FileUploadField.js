export class FileUploadField {
  static create(question, value = '', isError = false) {
    const container = document.createElement('div');
    container.className = 'dfb-file-upload-container';
    container.style.cssText = 'margin-top:8px;';

    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.className = 'gf-input-file-data';

    let initialObj = null;
    if (value) {
      if (typeof value === 'string') {
        hiddenInput.value = value;
        try {
          initialObj = JSON.parse(value);
        } catch (e) {
          // Ignore invalid JSON
        }
      } else if (typeof value === 'object') {
        initialObj = value;
        hiddenInput.value = JSON.stringify(value);
      }
    }
    container.appendChild(hiddenInput);

    const dropzone = document.createElement('div');
    dropzone.style.cssText =
      'border:1px dashed var(--dfb-border-color,#DADCE0); border-radius:4px; padding:16px; display:flex; flex-direction:column; align-items:center; gap:8px; background:#FAFAFA; cursor:pointer; font-size:13px; color:var(--dfb-text-secondary,#5F6368); transition: background-color 200ms ease;';
    if (isError) {
      dropzone.style.borderColor = '#c5221f';
    }
    if (question.disabled) {
      dropzone.style.cursor = 'default';
      dropzone.style.background = '#F1F3F4';
    } else {
      dropzone.addEventListener('mouseover', () => {
        dropzone.style.backgroundColor = '#F1F3F4';
      });
      dropzone.addEventListener('mouseout', () => {
        dropzone.style.backgroundColor = '#FAFAFA';
      });
    }

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';

    // Set accepted types
    const fileType = question.options?.fileType || 'any';
    if (fileType === 'image') {
      fileInput.accept = 'image/*';
    } else if (fileType === 'pdf') {
      fileInput.accept = 'application/pdf';
    } else if (fileType === 'document') {
      fileInput.accept = '.doc,.docx,.odt,.rtf,.txt';
    }

    container.appendChild(fileInput);

    const fileInfo = document.createElement('div');
    fileInfo.className = 'dfb-file-info';
    fileInfo.style.cssText =
      'display:none; align-items:center; justify-content:space-between; padding:8px 12px; border:1px solid var(--dfb-border-color,#DADCE0); border-radius:4px; background:#fff; margin-top:8px; font-size:13px;';

    const fileDetails = document.createElement('div');
    fileDetails.style.cssText =
      'display:flex; align-items:center; gap:8px; font-weight:500; color:var(--dfb-text-primary,#202124);';
    fileInfo.appendChild(fileDetails);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.style.cssText =
      'background:none; border:none; font-size:18px; color:#c5221f; cursor:pointer; font-weight:bold; line-height:1; padding: 0 4px;';
    removeBtn.innerHTML = '&times;';
    fileInfo.appendChild(removeBtn);

    const showFile = (name, size) => {
      fileDetails.textContent = `${name} (${(size / 1024).toFixed(1)} KB)`;
      dropzone.style.display = 'none';
      fileInfo.style.display = 'flex';
    };

    const showUpload = () => {
      dropzone.style.display = 'flex';
      fileInfo.style.display = 'none';
      hiddenInput.value = '';
    };

    if (initialObj && initialObj.name) {
      showFile(initialObj.name, initialObj.size || 0);
    } else {
      showUpload();
    }

    if (!question.disabled) {
      dropzone.addEventListener('click', () => {
        fileInput.click();
      });

      fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
          const fileData = {
            name: file.name,
            size: file.size,
            type: file.type,
            base64: reader.result,
          };
          hiddenInput.value = JSON.stringify(fileData);
          showFile(file.name, file.size);
          const changeEvent = new Event('change', { bubbles: true });
          hiddenInput.dispatchEvent(changeEvent);
        };
        reader.readAsDataURL(file);
      });

      removeBtn.addEventListener('click', () => {
        fileInput.value = '';
        showUpload();
        const changeEvent = new Event('change', { bubbles: true });
        hiddenInput.dispatchEvent(changeEvent);
      });
    }

    // Append standard elements to dropzone
    dropzone.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--dfb-primary-color,#4285F4);">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
      <span style="font-weight:500;">Tambahkan file</span>
    `;

    container.appendChild(dropzone);
    container.appendChild(fileInfo);
    return container;
  }
}
