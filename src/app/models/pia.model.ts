import { User } from './user.model';

export class Pia {
  public id: number;
  public status = 0; // 0: doing, 1: refused, 2: simple_validation, 3: signed_validation, 4: archived
  public name: string;
  public category: string;
  public author_name: string;
  public evaluator_name: string;
  public validator_name: string;
  public dpo_status: number; // 0: NOK, 1: OK
  public dpo_opinion: string;
  public concerned_people_opinion: string;
  public concerned_people_status: number; // 0: NOK, 1: OK
  public concerned_people_searched_opinion: boolean; // 0 : false, 1: true
  public concerned_people_searched_content: string;
  public rejection_reason: string;
  public applied_adjustments: string;
  public dpos_names: string;
  public people_names: string;
  public progress: number;
  public is_example = 0;
  public is_archive = 0;
  public structure_id: number;
  public structure_name: string;
  public structure_sector_name: string;
  public structure_data: { sections: any };
  public created_at: Date;
  public updated_at: Date;
  public user_pias: Array<{ user: User; role: string }>;
  lock_version: any;
  public authors: Array<User | number> | string;
  public validators: Array<User | number> | string;
  public evaluators: Array<User | number> | string;
  public guests: Array<User | number> | string;

  constructor() {
    this.created_at = new Date();
  }

  static formatUsersDatas(pia) {
    const authors = pia.user_pias.filter(
      user_pia => user_pia.role === 'author'
    );
    const evaluators = pia.user_pias.filter(
      user_pia => user_pia.role === 'evaluator'
    );
    const validators = pia.user_pias.filter(
      user_pia => user_pia.role === 'validator'
    );
    const guests = pia.user_pias.filter(user_pia => user_pia.role === 'guest');

    if (authors) {
      pia.authors = authors.map(userRole => userRole.user.id).join(',');
    }
    if (evaluators) {
      pia.evaluators = evaluators.map(userRole => userRole.user.id).join(',');
    }
    if (validators) {
      pia.validators = validators.map(userRole => userRole.user.id).join(',');
    }
    if (guests) {
      pia.guests = guests.map(userRole => userRole.user.id).join(',');
    }

    return pia;
  }
}
