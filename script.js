(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', main);

  function main () {
    const nav = new Menu(document.querySelector('#navigration'));
    const pages = new Content(
      document.querySelectorAll('section'),
      (section) => section.getAttribute('id')
    );

    nav.onclick = function (li) {
      nav.highlight(li);
      pages.show(li.dataset.show);
    };

    const fileSelector = new Menu(document.querySelector('#file-selection'));
    const toolSelector = new Menu(document.querySelector('#tool-selection'));
    const fileContent = new Content(
      document.querySelectorAll('code.content'),
      (code) => code.dataset.file
    );
    const outputContent = new Content(
      document.querySelectorAll('code.output'),
      (code) => outputId(code.dataset.file, code.dataset.trace === '', code.dataset.clarify === '')
    );
    const command = document.getElementById('command').firstChild;

    fileSelector.onclick = function (li) {
      fileSelector.highlight(li);
      fileContent.show(li.dataset.show);
      updateOutput();
    };
    toolSelector.onclick = function (li, event) {
      const input = li.getElementsByTagName('input')[0];
      if (event.target.tagName !== 'INPUT') {
        input.checked = !input.checked;
      }
      updateOutput();
    };

    function updateOutput () {
      const filename = fileSelector.selected.dataset.show;
      const trace = document.getElementById('trace-enabled').checked;
      const clarify = document.getElementById('clarify-enabled').checked;
      outputContent.show(outputId(filename, trace, clarify));

      command.textContent = `$ node --stack_trace_limit=100 ${trace ? '-r trace ' : ''}${clarify ? '-r clarify ' : ''}${filename}`;
    }

    function outputId (file, trace, clarify) {
      return `/${file}/${trace ? 'trace' : ''}/${clarify ? 'clarify' : ''}`;
    }
  }

  function Content (pages, identifyer) {
    this.pages = {};
    this.selected = null;
    for (const page of pages) {
      this.pages[identifyer(page)] = page;
      if (!page.hasAttribute('hidden')) {
        this.selected = page;
      }
    }
  }
  Content.prototype.show = function (id) {
    this.selected.setAttribute('hidden', '');
    this.pages[id].removeAttribute('hidden');
    this.selected = this.pages[id];
  };

  function Menu (node) {
    this.element = node;
    this.selected = null;

    for (const li of this.element.getElementsByTagName('li')) {
      if (li.classList.contains('selected')) {
        this.selected = li;
      }

      li.addEventListener('click', (e) => {
        if (this.onclick) this.onclick(li, e);
      }, false);
    }
  }

  Menu.prototype.highlight = function (select) {
    // swtich selected class
    this.selected.classList.remove('selected');
    select.classList.add('selected');

    // update state
    this.selected = select;
  };
})();
