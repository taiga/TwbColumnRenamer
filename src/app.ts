require('bootstrap/dist/css/bootstrap.min.css');
import { TwbColumnRenamer } from './TwbColumnRenamer';

window.onload = () => {

  const fileLoader     = document.querySelector('[data-js=twbLoader]') as HTMLInputElement;
  const textareaBefore = document.querySelector('[data-js=textareaBefore]') as HTMLTextAreaElement;
  const textareaAfter  = document.querySelector('[data-js=textareaAfter]') as HTMLTextAreaElement;
  const selectButton   = document.querySelector('[data-js=selectButton]') as HTMLButtonElement;
  const saveButton     = document.querySelector('[data-js=saveButton]') as HTMLButtonElement;

  let renamer: TwbColumnRenamer;

  let currentFileName: string;

  const initializeUIComponents = () => {
    const localNames = renamer.getLocalNamesString();
    textareaBefore.textContent = localNames;
    textareaAfter.placeholder = localNames;
    saveButton.disabled = false;
    fileLoader.value = null;
  };

  fileLoader.onchange = () => {
    const file = fileLoader.files[0];
    currentFileName = file.name;
    const twbPattern = /\.twb$/g;
    if ( !(twbPattern).test(currentFileName) ) {
      return;
    }
    currentFileName = currentFileName.replace(twbPattern, '');
    const fileReader = new FileReader();
    fileReader.addEventListener('load', () => {
      renamer = new TwbColumnRenamer(fileReader.result);
      initializeUIComponents();
    });
    fileReader.readAsText(file, 'utf-8')
  };

  textareaBefore.onscroll = (): void => {
    textareaAfter.scrollTop = textareaBefore.scrollTop;
  };

  textareaAfter.onscroll = (): void => {
    textareaBefore.scrollTop = textareaAfter.scrollTop;
  };

  selectButton.onclick = () => {
    fileLoader.click();
  };

  saveButton.onclick = () => {
    renamer.replaceColumnNames(textareaAfter.value);
    renamer.exportTwb(currentFileName);
  };

};
