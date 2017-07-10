/**
 * Handles different modales on the application.
*/
document.addEventListener('click', function (e) {
    e = e || window.event;
    const target = e.target || e.srcElement;


    // Adds blur + opens the specified modal.
    if (target.hasAttribute('data-toggle') && target.getAttribute('data-toggle') === 'modal') {
        if (target.hasAttribute('data-target')) {
            const m_ID = target.getAttribute('data-target');
            document.body.classList.add('pia-blurBackground');
            document.getElementById(m_ID).classList.add('open');
        }
    }

    // Closes modal with 'data-dismiss' attribute or when the backdrop is clicked.
    if ((target.hasAttribute('data-dismiss') && target.getAttribute('data-dismiss') === 'modal') || e.target.classList.contains('modal')) {
        const modal = document.querySelector('[class="pia-modalBlock open"]');
        document.body.classList.remove('pia-blurBackground');
        modal.classList.remove('open');
    }
}, false);
