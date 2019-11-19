import { Injectable } from '@angular/core';
import { ApplicationDb } from '../application.db';

@Injectable()
export class RevisionService {
  private db: ApplicationDb;
  constructor() {
    this.db = new ApplicationDb(201911191636, 'revision');
  }

  async getAll() {
    return new Promise((resolve, reject) => {
      this.db.create()
    });
  }

  add() {
    
  }
}