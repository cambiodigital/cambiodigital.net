document.addEventListener('DOMContentLoaded', function() {
    const cursorDot = document.getElementById('cursor-dot');
    const cursorOutline = document.getElementById('cursor-outline');
    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;

    if (cursorDot && cursorOutline) {
        window.addEventListener('mousemove', function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.transform = 'translate(' + mouseX + 'px,' + mouseY + 'px)';
        });

        function animateCursor() {
            outlineX += (mouseX - outlineX) * 0.15;
            outlineY += (mouseY - outlineY) * 0.15;
            cursorOutline.style.transform = 'translate(' + outlineX + 'px,' + outlineY + 'px)';
            requestAnimationFrame(animateCursor);
        }

        animateCursor();
        // Misma activación que layout-loader: el cursor nativo solo se oculta
        // mientras el cursor personalizado realmente funciona.
        document.body.classList.add('cd-cursor-active');
    }

    normalizeBlogPostShell();

    const revealObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach(function(el) {
        revealObserver.observe(el);
    });
});

function normalizeBlogPostShell() {
    document.body.classList.add('bg-cd-base', 'text-cd-cream');

    const article = document.querySelector('main article');
    if (!article) {
        return;
    }

    article.classList.add('text-black', 'active');

    const articleHeader = article.firstElementChild;
    if (!articleHeader) {
        if (typeof window.refreshLucideIcons === 'function') {
            window.refreshLucideIcons();
        }
        return;
    }

    const backLink = articleHeader.querySelector('a[href="/blog.html"]');
    if (backLink) {
        backLink.classList.add('min-h-[48px]', 'flex', 'items-center');

        if (!backLink.querySelector('[data-lucide="arrow-left"]')) {
            const label = backLink.textContent.trim() || 'Volver al Blog';
            const icon = document.createElement('i');
            icon.setAttribute('data-lucide', 'arrow-left');
            icon.className = 'w-4 h-4';

            backLink.textContent = '';
            backLink.appendChild(icon);
            backLink.appendChild(document.createTextNode(' ' + label));
        }
    }

    const title = articleHeader.querySelector('h1');
    if (title) {
        title.classList.remove('text-3xl');
        title.classList.add('text-4xl', 'md:text-5xl');
    }

    const metaRow = title ? title.nextElementSibling : articleHeader.querySelector('div');
    if (metaRow) {
        metaRow.classList.add('flex', 'flex-wrap', 'gap-4', 'items-center', 'font-mono', 'text-xs', 'text-gray-500');

        metaRow.querySelectorAll('span').forEach(function(item) {
            item.textContent = item.textContent.replace(/^[^\p{L}\p{N}]+/u, '').trim();
        });
    }

    const leadingMedia = Array.from(article.children).find(function(element, index) {
        return index > 0 && element.querySelector('img');
    });

    if (leadingMedia) {
        leadingMedia.classList.add('mb-8', 'border-2', 'border-black', 'shadow-[4px_4px_0_black]');

        const featuredImage = leadingMedia.querySelector('img');
        if (featuredImage) {
            featuredImage.classList.remove('h-auto');
            featuredImage.classList.add('w-full', 'h-64', 'md:h-96', 'object-cover', 'grayscale', 'hover:grayscale-0', 'transition-all', 'duration-500');
        }
    }

    const content = article.querySelector('.prose');
    if (content) {
        content.classList.add('prose', 'prose-lg', 'max-w-none', 'font-mono');
    }

    if (typeof window.refreshLucideIcons === 'function') {
        window.refreshLucideIcons();
    }
}
