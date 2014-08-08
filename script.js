function get(file, cb) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            cb(xhr.responseText);
        }
    }

    xhr.open("GET", file, true);
    xhr.send();
}

function include(file, node, cb) {
    get(file, function (contents) {
        if (!node) {
            var scripts = document.querySelectorAll('script'), script;
            for (var i = 0; i < scripts.length; i++) {
                script = scripts[i];
                if (script.textContent.indexOf(file) >= 0 && script.textContent.indexOf('include') >= 0) {
                    break;
                }
            }
            node = script;
        }

        var content = document.createElement('div');
        content.innerHTML = marked(contents);
        var editLink = 'https://github.com/wingify/dom-comparator/edit/gh-pages/' + file;
        $('h2', content).append('<a href="' + editLink + '"><em>Edit this page on GitHub</em></a>')
        node.parentNode.replaceChild(content, node);
        parseAnchors(content);
        $('html, body').animate({scrollTop: 0});

        var blocks = content.querySelectorAll('pre code');
        for (i = 0; i < blocks.length; i ++) {
            blocks[i].className = blocks[i].className.replace('lang-', '')
            hljs.highlightBlock(blocks[i]);
        }

        cb(content);
    });
}

function parseAnchors(node) {
    node = node || document;
    var anchors = node.querySelectorAll('a'), anchor;
    for (var i = 0; i < anchors.length; i++) {
        anchor = anchors[i];
        if (window.location.href.indexOf(anchor.getAttribute('href')) >= 0 && node === document) {
            var active = document.querySelector('nav .docs a.active')
            if (active) active.className = '';
            anchor.className = 'active';
        }
        anchor.onclick = function () {
            var active = document.querySelector('nav .docs a.active');
            var href = this.getAttribute('href');
            if (active) { active.className = ''; }
            var a = document.querySelector('nav .docs a[href="' + href + '"]');
            if (a) {
                a.className = this.className = 'active';
            }
            includeContent();
            return false;
        };
    }
}

function includeContent(cb) {
    var activeAnchor = document.querySelector('nav .docs a.active');
    var href = activeAnchor.getAttribute('href');
    window.history.pushState(href, href, href);
    ga && ga('send', 'pageview');
    include(activeAnchor.getAttribute('href'), document.querySelector('.content > *'), function (content) {
        $(activeAnchor).next().remove();
        $(activeAnchor).after('<ul class="nav nav-stacked"></ul>');
        $('h3', content).each(function () {
            $(activeAnchor).next().append('<li><a href="#' + this.id + '">' + this.textContent + '</a></li>')
        });
        get('disqus.html', function (disqus) {
            $('.content .disqus_container').remove();
            $('.content div').append('<div class="disqus_container">' + disqus + '</div>')
        });
    });
    document.title = activeAnchor.textContent + ' - DOM Comparator';
}

function navigateHome() {
    get('index.html', function (file) {
        document.write(file);
    });
    document.write('<style>*{display:none}</style>');
}
