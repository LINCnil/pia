import { Component, OnInit, Input } from '@angular/core'
import { LanguagesService } from '../../../../services/languages.service'
import { TranslateService } from '@ngx-translate/core'

@Component({
  selector: 'app-comment-item',
  templateUrl: './comment-item.component.html',
  styleUrls: ['./comment-item.component.scss'],
})
export class CommentItemComponent implements OnInit {
  @Input() comment: any

  constructor(
    public _translateService: TranslateService,
    public _languagesService: LanguagesService
  ) {}

  ngOnInit() {}
}
