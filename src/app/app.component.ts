import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app';
}


document.addEventListener('click', function (e:any) {
    e = e || window.event;
    let target = e.target || e.srcElement;

    e.preventDefault();

    if (target.hasAttribute('data-toggle') && target.getAttribute('data-toggle') == 'modal') {
        if (target.hasAttribute('data-target')) {
            let m_ID = target.getAttribute('data-target');
            document.body.classList.add('pia-blurBackground');
            document.getElementById(m_ID).classList.add('open');
        }
    }

    // Close modal window with 'data-dismiss' attribute or when the backdrop is clicked
    if ((target.hasAttribute('data-dismiss') && target.getAttribute('data-dismiss') == 'modal') || e.target.classList.contains('modal')) {
        let modal = document.querySelector('[class="pia-modalBlock open"]');
        document.body.classList.remove('pia-blurBackground');
        modal.classList.remove('open');
    }
}, false);