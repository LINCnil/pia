import { Injectable } from '@angular/core';

import { Router } from '@angular/router';
import { utf8Encode } from '@angular/compiler/src/util';

@Injectable()
export class RevisionService {
  constructor(private router: Router) {}
}
