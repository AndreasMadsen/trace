(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', main);

  function main () {
    var nav = new Menu(document.querySelector('#navigration'));
    var pages = new Content(
      document.querySelectorAll('section'),
      function (section) { return section.getAttribute('id'); }
    );

    nav.onclick = function (li) {
      nav.highlight(li);
      pages.show(li.dataset.show);
    };

    var fileSelector = new Menu(document.querySelector('#file-selection'));
    var toolSelector = new Menu(document.querySelector('#tool-selection'));
    var fileContent = new Content(
      document.querySelectorAll('#examples code.content'),
      function (code) { return code.dataset.file; }
    );
    var outputContent = new Content(
      document.querySelectorAll('#examples code.output'),
      function (code) { return outputId(code.dataset.file, code.dataset.trace === '', code.dataset.clarify === ''); }
    );
    var command = document.getElementById('command').firstChild;

    fileSelector.onclick = function (li) {
      fileSelector.highlight(li);
      fileContent.show(li.dataset.show);
      updateOutput();
    };
    toolSelector.onclick = function (li, event) {
      var input = li.getElementsByTagName('input')[0];
      if (event.target.tagName !== 'INPUT') {
        input.checked = !input.checked;
      }
      updateOutput();
    };

    function updateOutput () {
      var filename = fileSelector.selected.dataset.show;
      var trace = document.getElementById('trace-enabled').checked;
      var clarify = document.getElementById('clarify-enabled').checked;
      outputContent.show(outputId(filename, trace, clarify));

      command.textContent = `$ node --stack_trace_limit=100 ${trace ? '-r trace ' : ''}${clarify ? '-r clarify ' : ''}${filename}`;
    }

    function outputId (file, trace, clarify) {
      return `/${file}/${trace ? 'trace' : ''}/${clarify ? 'clarify' : ''}`;
    }
  }

  function Content (pages, identifyer) {
    var self = this;
    this.pages = {};
    this.selected = null;
    Array.from(pages).forEach(function (page) {
      self.pages[identifyer(page)] = page;
      if (!page.hasAttribute('hidden')) {
        self.selected = page;
      }
    });
  }
  Content.prototype.show = function (id) {
    this.selected.setAttribute('hidden', '');
    this.pages[id].removeAttribute('hidden');
    this.selected = this.pages[id];
  };

  function Menu (node) {
    var self = this;
    this.element = node;
    this.selected = null;

    Array.from(node.getElementsByTagName('li')).forEach(function (li) {
      if (li.classList.contains('selected')) {
        self.selected = li;
      }

      li.addEventListener('click', function (e) {
        if (self.onclick) self.onclick(li, e);
      }, false);
    });
  }

  Menu.prototype.highlight = function (select) {
    // swtich selected class
    this.selected.classList.remove('selected');
    select.classList.add('selected');

    // update state
    this.selected = select;
  };
})();
